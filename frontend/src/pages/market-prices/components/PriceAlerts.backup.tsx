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

export type AlertCondition = 'above' | 'below' | 'change';

export interface PriceAlert {
  id: string;
  commodity: string;
  condition: AlertCondition;
  value: number;
  isActive: boolean;
  lastTriggered?: string | null;
  createdAt?: string; // Made optional to match the actual data structure
}

interface NewAlertForm {
  commodity: string;
  condition: AlertCondition;
  value: string;
  isActive: boolean;
}

export function PriceAlerts() {
  // State management
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

  // Fetch alerts with WebSocket updates
  useEffect(() => {
    // Initial fetch
    const fetchAlerts = async () => {
      try {
        const data = await marketPricesService.getPriceAlerts();
        setAlerts(data);
      } catch (error) {
        console.error('Error fetching price alerts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();

    // Subscribe to WebSocket updates
    const unsubscribe = webSocketService.subscribe('alertUpdate', (updatedAlert: PriceAlert) => {
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === updatedAlert.id ? { ...alert, ...updatedAlert } : alert
        )
      );
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Fetch commodities for the select dropdown
  const { data: commodities } = useQuery({
    queryKey: ['market-commodities'],
    queryFn: () => marketPricesService.getCommodities(),
  });

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
      console.log('Price alert created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating alert:', error);
    },
  });

  // Delete alert mutation
  const deleteAlertMutation = useMutation({
    mutationFn: (id: string) => 
      marketPricesService.deletePriceAlert(id).then(() => id),
    onSuccess: (deletedId) => {
      queryClient.setQueryData<PriceAlert[]>(['price-alerts'], (old = []) => 
        old.filter(alert => alert.id !== deletedId)
      );
      setAlertToDelete(null);
      console.log('Price alert deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting alert:', error);
    },
  });

  // Toggle alert status mutation
  const toggleAlertStatusMutation = useMutation({
    mutationFn: async (alert: PriceAlert) => {
      // In a real app, you would call an API endpoint to toggle the status
      // For now, we'll just update the local state
      return { ...alert, isActive: !alert.isActive };
    },
    onMutate: async (updatedAlert: PriceAlert) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['price-alerts'] });

      // Snapshot the previous value
      const previousAlerts = queryClient.getQueryData<PriceAlert[]>(['price-alerts']);

      // Optimistically update to the new value
      queryClient.setQueryData<PriceAlert[]>(['price-alerts'], (old = []) =>
        old.map(alert =>
          alert.id === updatedAlert.id 
            ? { ...alert, isActive: updatedAlert.isActive } 
            : alert
        )
      );

      // Return a context object with the snapshotted value
      return { previousAlerts };
    },
    onError: (error: Error, _, context: { previousAlerts?: PriceAlert[] } | undefined) => {
      // Using console.log for now - will replace with toast implementations, use the context returned from onMutate to roll back
      if (context?.previousAlerts) {
        queryClient.setQueryData(['price-alerts'], context.previousAlerts);
      }
      console.error('Error updating alert:', error);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
    },
  });

  // Toggle alert status
  const toggleAlertStatus = (alert: PriceAlert) => {
    toggleAlertStatusMutation.mutate({
      ...alert,
      isActive: !alert.isActive,
      // Ensure createdAt is included if it exists
      ...(alert.createdAt && { createdAt: alert.createdAt })
    });
  };

  const handleDeleteAlert = (id: string) => {
    deleteAlertMutation.mutate(id);
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.commodity || !newAlert.value) return;
    
    createAlertMutation.mutate({
      commodity: newAlert.commodity,
      condition: newAlert.condition,
      value: parseFloat(newAlert.value),
      isActive: true,
    });
    
    // Reset form
    setNewAlert({
      commodity: '',
      condition: 'above',
      value: '',
      isActive: true,
    });
    
    setIsCreateDialogOpen(false);
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select commodity" />
                      </SelectTrigger>
                      <SelectContent>
                        {commodities?.map((commodity) => (
                          <SelectItem key={commodity} value={commodity}>
                            {commodity}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2 col-span-1">
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
                        </SelectTrigger>
                        <SelectContent>
                          {commodities?.map((commodity) => (
                            <SelectItem key={commodity} value={commodity}>
                              {commodity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2 col-span-1">
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
                          placeholder="Price"
                          value={newAlert.value}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            setNewAlert({ ...newAlert, value: e.target.value })
                          }
                          min="0"
                          step="0.01"
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : alerts && alerts.length > 0 ? (
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
                    <TableCell>
                      {alert.lastTriggered ? (
                        <div className="text-sm text-muted-foreground">
                          {formatDate(alert.lastTriggered)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {'createdAt' in alert && alert.createdAt ? formatDate(alert.createdAt) : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            const alertToToggle = alerts?.find(a => a.id === alert.id);
                            if (alertToToggle) {
                              toggleAlertStatusMutation.mutate({
                                ...alertToToggle,
                                isActive: !alertToToggle.isActive
                              });
                            }
                          }}
                          disabled={toggleAlertStatusMutation.isPending}
                        >
                          {alert.isActive ? (
                            <XCircle className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground hover:text-green-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setAlertToDelete(alert.id)}
                          disabled={deleteAlertMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <BellRing className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium">No price alerts</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get started by creating a new price alert.
              </p>
              <div className="mt-6">
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Alert
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog 
        open={!!alertToDelete} 
        onOpenChange={(open: boolean) => !open && setAlertToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the price alert.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAlert}
              disabled={deleteAlertMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAlertMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
