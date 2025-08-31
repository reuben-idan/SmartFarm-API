import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Search, Edit, Trash2, UserPlus } from 'lucide-react';
import { Farmer, FarmerResponse, farmersService } from '@/services/api/farmers.service';
import { format } from 'date-fns';
import { FarmerForm } from './components/FarmerForm';

export default function FarmersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch farmers
  const { data: farmersResponse, isLoading, error } = useQuery<FarmerResponse, Error>({
    queryKey: ['farmers', { search: searchTerm }],
    queryFn: () => farmersService.getFarmers({ search: searchTerm }),
  });

  const farmers = farmersResponse?.data || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => farmersService.deleteFarmer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      toast({
        title: 'Success',
        description: 'Farmer deleted successfully',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete farmer: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (farmer: Farmer) => {
    setEditingFarmer(farmer);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this farmer?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading farmers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error loading farmers: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Farmers Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Farmer
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Farmers List</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search farmers..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Farm Size</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {farmers.length > 0 ? (
                farmers.map((farmer: Farmer) => (
                  <TableRow key={farmer.id}>
                    <TableCell className="font-medium">{`${farmer.firstName} ${farmer.lastName}`}</TableCell>
                    <TableCell>{farmer.phone}</TableCell>
                    <TableCell>{farmer.city}, {farmer.state}</TableCell>
                    <TableCell>{farmer.farmSize} ha</TableCell>
                    <TableCell>{farmer.joinDate ? format(new Date(farmer.joinDate), 'MMM d, yyyy') : 'N/A'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(farmer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(farmer.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No farmers found. Add your first farmer to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <strong>{farmersResponse?.total || 0}</strong> farmers
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
      <FarmerForm
        open={isCreateDialogOpen || !!editingFarmer}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingFarmer(null);
          }
        }}
        farmer={editingFarmer}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          setEditingFarmer(null);
          queryClient.invalidateQueries({ queryKey: ['farmers'] });
        }}
      />
    </div>
  );
}
