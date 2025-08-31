import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Loader2, MoreVertical, Trash2, Edit, Package, PlusCircle, ArrowUpDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

import { Supplier, suppliersService } from '@/services/api/suppliers.service';
import { SupplierForm } from './components/SupplierForm';
import { ProductForm } from './components/ProductForm';

const statusVariantMap = {
  active: 'default',
  inactive: 'outline',
  on_hold: 'secondary',
  blacklisted: 'destructive',
} as const;

const typeLabels = {
  seed: 'Seed Supplier',
  fertilizer: 'Fertilizer Supplier',
  pesticide: 'Pesticide Supplier',
  equipment: 'Equipment Supplier',
  service: 'Service Provider',
  other: 'Other',
} as const;

export default function SuppliersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isSupplierFormOpen, setIsSupplierFormOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<{id: string} | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteProductDialogOpen, setDeleteProductDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<{supplierId: string, productId: string} | null>(null);
  const [activeTab, setActiveTab] = useState('suppliers');
  const [sortConfig, setSortConfig] = useState<{key: keyof Supplier, direction: 'asc' | 'desc'} | null>(null);

  // Fetch suppliers
  const { data: suppliersData, isLoading } = useQuery({
    queryKey: ['suppliers', { search: searchTerm, status: statusFilter }],
    queryFn: () => suppliersService.getSuppliers({
      search: searchTerm,
      status: statusFilter === 'all' ? undefined : statusFilter,
    }),
  });

  // Fetch supplier products if a supplier is selected
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['supplier-products', selectedSupplier?.id],
    queryFn: () => suppliersService.getSupplierProducts(selectedSupplier?.id || ''),
    enabled: !!selectedSupplier,
  });

  // Mutations
  const deleteSupplierMutation = useMutation({
    mutationFn: (id: string) => suppliersService.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Success',
        description: 'Supplier deleted successfully',
        variant: 'default',
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete supplier',
        variant: 'destructive',
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: ({ supplierId, productId }: { supplierId: string, productId: string }) => 
      suppliersService.removeSupplierProduct(supplierId, productId),
    onSuccess: (_, { supplierId }) => {
      queryClient.invalidateQueries(['supplier-products', supplierId]);
      toast({
        title: 'Success',
        description: 'Product removed successfully',
        variant: 'default',
      });
      setDeleteProductDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove product',
        variant: 'destructive',
      });
    },
  });

  // Handle supplier actions
  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsSupplierFormOpen(true);
  };

  const handleAddProduct = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setSelectedProduct(null);
    setIsProductFormOpen(true);
  };

  const handleEditProduct = (supplier: Supplier, product: any) => {
    setSelectedSupplier(supplier);
    setSelectedProduct(product);
    setIsProductFormOpen(true);
  };

  const handleDeleteClick = (supplierId: string) => {
    setSupplierToDelete(supplierId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteProductClick = (supplierId: string, productId: string) => {
    setProductToDelete({ supplierId, productId });
    setDeleteProductDialogOpen(true);
  };

  const confirmDelete = () => {
    if (supplierToDelete) {
      deleteSupplierMutation.mutate(supplierToDelete);
    }
  };

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete);
    }
  };

  // Sorting function
  const requestSort = (key: keyof Supplier) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting to suppliers
  const sortedSuppliers = React.useMemo(() => {
    if (!suppliersData?.data) return [];
    
    const sortableItems = [...suppliersData.data];
    if (sortConfig) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [suppliersData, sortConfig]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage your farm's suppliers and their products
          </p>
        </div>
        <Button onClick={() => {
          setSelectedSupplier(null);
          setIsSupplierFormOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          {selectedSupplier && (
            <TabsTrigger value="products">
              {selectedSupplier.name}'s Products
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="suppliers">
          <Card>
            <div className="p-4 border-b">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search suppliers..."
                    className="w-full pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="blacklisted">Blacklisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="relative">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => requestSort('name')}
                      >
                        <div className="flex items-center">
                          Name
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => requestSort('createdAt')}
                      >
                        <div className="flex items-center">
                          Added On
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedSuppliers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No suppliers found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedSuppliers.map((supplier) => (
                        <TableRow 
                          key={supplier.id}
                          className="cursor-pointer hover:bg-accent/50"
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            setActiveTab('products');
                          }}
                        >
                          <TableCell className="font-medium">
                            <div className="font-medium">{supplier.name}</div>
                            <div className="text-sm text-muted-foreground">{supplier.email}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {typeLabels[supplier.type] || supplier.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>{supplier.contactPerson}</div>
                            <div className="text-sm text-muted-foreground">{supplier.phone}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {supplier.city}, {supplier.country}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={statusVariantMap[supplier.status]}
                              className="capitalize"
                            >
                              {supplier.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {supplier.createdAt 
                              ? format(new Date(supplier.createdAt), 'PP')
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditSupplier(supplier);
                                }}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddProduct(supplier);
                                }}>
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  <span>Add Product</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(supplier.id);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
            
            {suppliersData && suppliersData.total > 0 && (
              <CardFooter className="flex items-center justify-between border-t px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">
                    {Math.min(suppliersData.limit * (suppliersData.page - 1) + 1, suppliersData.total)}
                  </span> to <span className="font-medium">
                    {Math.min(suppliersData.limit * suppliersData.page, suppliersData.total)}
                  </span> of <span className="font-medium">{suppliersData.total}</span> suppliers
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {}}
                    disabled={suppliersData.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {}}
                    disabled={suppliersData.page * suppliersData.limit >= suppliersData.total}
                  >
                    Next
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {selectedSupplier && (
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{selectedSupplier.name}'s Products</CardTitle>
                  <CardDescription>
                    Manage products and services provided by this supplier
                  </CardDescription>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleAddProduct(selectedSupplier)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </CardHeader>
              <div className="relative">
                {isLoadingProducts ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Min. Order</TableHead>
                        <TableHead>Lead Time</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productsData && productsData.length > 0 ? (
                        productsData.map((product: any) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">
                              {product.name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {product.category}
                              </Badge>
                            </TableCell>
                            <TableCell>{product.unit}</TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: product.currency || 'USD',
                              }).format(product.price)}
                            </TableCell>
                            <TableCell>
                              {product.minOrderQuantity || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {product.leadTimeDays ? `${product.leadTimeDays} days` : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem 
                                    onClick={() => handleEditProduct(selectedSupplier, product)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => 
                                      handleDeleteProductClick(selectedSupplier.id, product.id)
                                    }
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Remove</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No products found for this supplier.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Supplier Form Dialog */}
      <SupplierForm
        open={isSupplierFormOpen}
        onOpenChange={setIsSupplierFormOpen}
        supplier={selectedSupplier}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['suppliers'] });
          setIsSupplierFormOpen(false);
          setSelectedSupplier(null);
        }}
      />

      {/* Product Form Dialog */}
      {selectedSupplier && (
        <ProductForm
          open={isProductFormOpen}
          onOpenChange={setIsProductFormOpen}
          supplierId={selectedSupplier.id}
          product={selectedProduct}
          onSuccess={() => {
            queryClient.invalidateQueries({ 
              queryKey: ['supplier-products', selectedSupplier.id] 
            });
            setIsProductFormOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the supplier and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={deleteSupplierMutation.isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSupplierMutation.isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Product Confirmation Dialog */}
      <AlertDialog open={deleteProductDialogOpen} onOpenChange={setDeleteProductDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the product from the supplier's catalog. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteProduct}
              disabled={deleteProductMutation.isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProductMutation.isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Remove Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
