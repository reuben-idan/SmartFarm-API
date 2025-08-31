import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Search, Plus, Edit, Trash2, Filter, Calendar, CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Crop, cropsService } from '@/services/api/crops.service';
import { Badge } from '@/components/ui/badge';
import { CropForm } from './components/CropForm';

export default function CropsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch crops with filtering
  const { data: cropsResponse, isLoading, error } = useQuery({
    queryKey: ['crops', { search: searchTerm, status: statusFilter }],
    queryFn: () => cropsService.getCrops({ 
      search: searchTerm,
      status: statusFilter,
      limit: 100, // Adjust based on your needs
    }),
  });

  const crops = cropsResponse?.data || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => cropsService.deleteCrop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      toast({
        title: 'Success',
        description: 'Crop deleted successfully',
        variant: 'default',
      });
    },
  });

  // Status update mutation
  const statusUpdateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Crop['status'] }) => 
      cropsService.updateCropStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      toast({
        title: 'Success',
        description: 'Crop status updated',
        variant: 'default',
      });
    },
  });

  const handleEdit = (crop: Crop) => {
    setEditingCrop(crop);
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleStatusChange = (id: string, status: Crop['status']) => {
    statusUpdateMutation.mutate({ id, status });
  };

  const getStatusBadge = (status: Crop['status']) => {
    const statusMap = {
      planned: { label: 'Planned', variant: 'outline', icon: <Clock className="h-3 w-3 mr-1" /> },
      planted: { label: 'Planted', variant: 'secondary', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      growing: { label: 'Growing', variant: 'default', icon: <AlertCircle className="h-3 w-3 mr-1" /> },
      ready_for_harvest: { label: 'Ready for Harvest', variant: 'success', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      harvested: { label: 'Harvested', variant: 'success', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      failed: { label: 'Failed', variant: 'destructive', icon: <XCircle className="h-3 w-3 mr-1" /> },
    };

    const statusInfo = statusMap[status];
    return (
      <Badge variant={statusInfo.variant as any} className="flex items-center">
        {statusInfo.icon}
        {statusInfo.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading crops...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error loading crops: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Crop Management</h1>
          <p className="text-muted-foreground">
            Manage and track all your crops in one place
          </p>
        </div>
        <Button onClick={() => {
          setEditingCrop(null);
          setIsCreateDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add Crop
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="w-full md:w-1/3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search crops..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                className="border rounded-md p-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="planned">Planned</option>
                <option value="planted">Planted</option>
                <option value="growing">Growing</option>
                <option value="ready_for_harvest">Ready for Harvest</option>
                <option value="harvested">Harvested</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Crop</TableHead>
                  <TableHead>Variety</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>Planted On</TableHead>
                  <TableHead>Area (ha)</TableHead>
                  <TableHead>Expected Yield</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {crops.length > 0 ? (
                  crops.map((crop) => (
                    <TableRow key={crop.id}>
                      <TableCell className="font-medium">{crop.name}</TableCell>
                      <TableCell>{crop.variety}</TableCell>
                      <TableCell>{getStatusBadge(crop.status)}</TableCell>
                      <TableCell>{crop.fieldName || 'N/A'}</TableCell>
                      <TableCell>
                        {crop.plantingDate ? format(parseISO(crop.plantingDate), 'MMM d, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>{crop.area} ha</TableCell>
                      <TableCell>{crop.expectedYield} t</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(crop)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(crop.id, crop.name)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No crops found. Add your first crop to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <strong>{crops.length}</strong> of <strong>{cropsResponse?.total || 0}</strong> crops
          </div>
          <div className="space-x-2">
            <Button variant="outline" size="sm" disabled={true}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={true}>
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Create/Edit Dialog */}
      <CropForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        crop={editingCrop}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          setEditingCrop(null);
        }}
      />
    </div>
  );
}
