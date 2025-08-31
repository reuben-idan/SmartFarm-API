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
  CardTitle,
  CardFooter 
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
  DialogTitle
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
  Loader2,
  AlertCircle
} from 'lucide-react';
import { marketPricesService } from '@/services/api/marketPrices.service';
import { Skeleton } from '@/components/ui/skeleton';

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

export function PriceAlertsV2() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alertToDelete, setAlertToDelete] = useState<string | null>(null);
  const [newAlert, setNewAlert] = useState<NewAlertForm>({
    commodity: '',
    condition: 'above',
    value: '',
    isActive: true,
  });

  // Fetch alerts
  const { data: alertsData, isLoading: isLoadingAlerts } = useQuery({
    queryKey: ['priceAlerts'],
    queryFn: async () => {
      const data = await marketPricesService.getPriceAlerts();
      setAlerts(data);
      return data;
    },
  });

  // Fetch commodities
  const { data: commodities = [] } = useQuery({
    queryKey: ['marketCommodities'],
    queryFn: () => marketPricesService.getCommodities(),
  });

  // Create alert mutation
  const createAlertMutation = useMutation({
    mutationFn: (data: { commodity: string; condition: AlertCondition; value: number }) =>
      marketPricesService.createPriceAlert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priceAlerts'] });
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
    mutationFn: (id: string) => 
      marketPricesService.deletePriceAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priceAlerts'] });
      setAlertToDelete(null);
    },
  });

  // Toggle alert status mutation
  const toggleAlertStatusMutation = useMutation({
    mutationFn: async (alert: PriceAlert) => {
      return marketPricesService.updatePriceAlert(alert.id, {
        ...alert,
        isActive: !alert.isActive
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priceAlerts'] });
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

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Never';
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  if (isLoadingAlerts) {
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
                      <label className="text-sm font-medium leading-none">
                        Commodity
                      </label>
                      <Select
                        value={newAlert.commodity}
                        onValueChange={(value) => 
                          setNewAlert({ ...newAlert, commodity: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select commodity" />
                        </SelectTrigger>
                        <SelectContent>
                          {commodities?.map((commodity: string) => (
                            <SelectItem key={commodity} value={commodity}>
                              {commodity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">
                          Condition
                        </label>
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
                            <SelectItem value="above">Price above</SelectItem>
                            <SelectItem value="below">Price below</SelectItem>
                            <SelectItem value="change">% Change</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium leading-none">
                          {newAlert.condition === 'change' ? 'Percentage' : 'Price'}
                        </label>
                        <Input
                          type="number"
                          placeholder={newAlert.condition === 'change' ? 'Percentage' : 'Price'}
                          value={newAlert.value}
                          onChange={(e) => 
                            setNewAlert({ ...newAlert, value: e.target.value })
                          }
                          min="0"
                          step={newAlert.condition === 'change' ? '0.1' : '0.01'}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={createAlertMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createAlertMutation.isPending}>
                      {createAlertMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <BellRing className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No price alerts yet</h3>
              <p className="text-sm text-muted-foreground">
                Create your first alert to get notified about price changes
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Commodity</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Triggered</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <BellRing className="h-4 w-4 mr-2 text-muted-foreground" />
                        {alert.commodity}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{alert.condition}</span>
                    </TableCell>
                    <TableCell>
                      {alert.condition === 'change' 
                        ? `${Math.abs(alert.value)}% ${alert.value >= 0 ? 'increase' : 'decrease'}`
                        : `$${alert.value.toFixed(2)}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {alert.isActive ? (
                          <>
                            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <div className="h-2 w-2 rounded-full bg-gray-300 mr-2"></div>
                            <span>Inactive</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(alert.lastTriggered)}</TableCell>
                    <TableCell>{formatDate(alert.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleAlertStatusMutation.mutate(alert)}
                          disabled={toggleAlertStatusMutation.isPending}
                        >
                          {alert.isActive ? (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setAlertToDelete(alert.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {alerts.length > 0 && (
          <CardFooter className="px-6 py-4">
            <p className="text-sm text-muted-foreground">
              Showing {alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'}
            </p>
          </CardFooter>
        )}
      </Card>

      {/* Delete confirmation dialog */}
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
              onClick={() => alertToDelete && deleteAlertMutation.mutate(alertToDelete)}
              disabled={deleteAlertMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteAlertMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Alert
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
