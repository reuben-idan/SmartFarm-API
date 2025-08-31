import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { webSocketService } from '@/services/api/websocket.service';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Trash2, 
  BellRing, 
  CheckCircle2, 
  XCircle,
  Loader2
} from 'lucide-react';
import { marketPricesService } from '@/services/api/marketPrices.service';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

type AlertCondition = 'above' | 'below' | 'change';

interface PriceAlert {
  id: string;
  commodity: string;
  condition: AlertCondition;
  value: number;
  isActive: boolean;
  lastTriggered?: string | null;
  createdAt?: string;
}

interface NewAlertForm {
  commodity: string;
  condition: AlertCondition;
  value: string;
  isActive: boolean;
}

export function PriceAlerts() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [alertToDelete, setAlertToDelete] = useState<string | null>(null);
  const [newAlert, setNewAlert] = useState<NewAlertForm>({
    commodity: '',
    condition: 'above',
    value: '',
    isActive: true,
  });

  // Fetch alerts with WebSocket updates
  const { data: alerts = [], isLoading } = useQuery<PriceAlert[]>({
    queryKey: ['price-alerts'],
    queryFn: () => marketPricesService.getPriceAlerts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Set up WebSocket subscription
  useEffect(() => {
    const unsubscribe = webSocketService.subscribe('alertUpdate', (updatedAlert: PriceAlert) => {
      queryClient.setQueryData<PriceAlert[]>(['price-alerts'], (oldAlerts = []) => 
        oldAlerts.map(alert => 
          alert.id === updatedAlert.id ? { ...alert, ...updatedAlert } : alert
        )
      );
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  // Create alert mutation
  const createAlertMutation = useMutation({
    mutationFn: (data: { commodity: string; condition: AlertCondition; value: number }) =>
      marketPricesService.createPriceAlert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
      setIsCreateDialogOpen(false);
      setNewAlert({
        commodity: '',
        condition: 'above',
        value: '',
        isActive: true,
      });
    },
  });

  // Delete alert mutation
  const deleteAlertMutation = useMutation({
    mutationFn: (id: string) => marketPricesService.deletePriceAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
      setAlertToDelete(null);
    },
  });

  // Toggle alert status mutation
  const toggleAlertStatusMutation = useMutation({
    mutationFn: async (alert: PriceAlert) => {
      return marketPricesService.updatePriceAlert(alert.id, {
        ...alert,
        isActive: !alert.isActive,
      });
    },
    onMutate: async (updatedAlert) => {
      await queryClient.cancelQueries({ queryKey: ['price-alerts'] });
      const previousAlerts = queryClient.getQueryData<PriceAlert[]>(['price-alerts']);
      
      queryClient.setQueryData<PriceAlert[]>(['price-alerts'], (old = []) =>
        old.map(alert => 
          alert.id === updatedAlert.id ? { ...alert, isActive: !alert.isActive } : alert
        )
      );

      return { previousAlerts };
    },
    onError: (err, updatedAlert, context) => {
      if (context?.previousAlerts) {
        queryClient.setQueryData(['price-alerts'], context.previousAlerts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
    },
  });

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.commodity || !newAlert.value) return;
    
    createAlertMutation.mutate({
      commodity: newAlert.commodity,
      condition: newAlert.condition,
      value: parseFloat(newAlert.value),
    });
  };

  const handleDeleteAlert = (id: string) => {
    deleteAlertMutation.mutate(id);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Price Alerts</CardTitle>
              <CardDescription>
                Get notified when prices reach your target levels
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Alert
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreateAlert}>
                  <DialogHeader>
                    <DialogTitle>Create Price Alert</DialogTitle>
                    <DialogDescription>
                      Set up a new price alert to get notified when conditions are met.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="commodity">Commodity</Label>
                      <Select
                        value={newAlert.commodity}
                        onValueChange={(value) => setNewAlert({ ...newAlert, commodity: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select commodity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wheat">Wheat</SelectItem>
                          <SelectItem value="corn">Corn</SelectItem>
                          <SelectItem value="soybeans">Soybeans</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="condition">Condition</Label>
                        <Select
                          value={newAlert.condition}
                          onValueChange={(value: AlertCondition) =>
                            setNewAlert({ ...newAlert, condition: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="above">Above</SelectItem>
                            <SelectItem value="below">Below</SelectItem>
                            <SelectItem value="change">% Change</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="value">
                          {newAlert.condition === 'change' ? 'Percentage' : 'Price'}
                        </Label>
                        <div className="relative">
                          <Input
                            id="value"
                            type="number"
                            step="0.01"
                            placeholder={
                              newAlert.condition === 'change' 
                                ? 'e.g., 5.5 for 5.5%' 
                                : 'e.g., 4.25'
                            }
                            value={newAlert.value}
                            onChange={(e) =>
                              setNewAlert({ ...newAlert, value: e.target.value })
                            }
                            required
                          />
                          {newAlert.condition === 'change' && (
                            <span className="absolute right-3 top-2.5 text-muted-foreground">
                              %
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createAlertMutation.isPending}>
                      {createAlertMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Alert'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commodity</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Triggered</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No alerts found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">{alert.commodity}</TableCell>
                    <TableCell className="capitalize">{alert.condition}</TableCell>
                    <TableCell>
                      {alert.condition === 'change' 
                        ? `${alert.value}%` 
                        : `$${alert.value.toFixed(2)}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div 
                          className={`h-2 w-2 rounded-full mr-2 ${
                            alert.isActive ? 'bg-green-500' : 'bg-gray-400'
                          }`} 
                        />
                        {alert.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(alert.lastTriggered)}</TableCell>
                    <TableCell>{formatDate(alert.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAlertStatusMutation.mutate(alert)}
                          disabled={toggleAlertStatusMutation.isPending}
                        >
                          {toggleAlertStatusMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : alert.isActive ? (
                            <XCircle className="h-4 w-4 text-destructive" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAlertToDelete(alert.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={!!alertToDelete} 
        onOpenChange={(open) => !open && setAlertToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this price alert. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => alertToDelete && handleDeleteAlert(alertToDelete)}
              disabled={deleteAlertMutation.isPending}
            >
              {deleteAlertMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Alert'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default PriceAlerts;
