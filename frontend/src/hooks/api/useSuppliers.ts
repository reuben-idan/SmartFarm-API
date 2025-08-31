import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  suppliersService, 
  SupplierCreateDto, 
  SupplierUpdateDto 
} from '@/services/api/suppliers.service';
import { toast } from 'sonner';

const SUPPLIERS_QUERY_KEY = 'suppliers';
const SUPPLIER_STATS_QUERY_KEY = 'supplier-stats';

export const useSuppliers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: [SUPPLIERS_QUERY_KEY, params],
    queryFn: () => suppliersService.getSuppliers(params),
    // Remove keepPreviousData as it's not a valid option in the current version of React Query
  });
};

export const useSupplier = (id: string) => {
  return useQuery({
    queryKey: [SUPPLIERS_QUERY_KEY, id],
    queryFn: () => suppliersService.getSupplierById(id),
    enabled: !!id,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SupplierCreateDto) => suppliersService.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUPPLIERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SUPPLIER_STATS_QUERY_KEY] });
      toast.success('Supplier created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create supplier: ${error.message}`);
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SupplierUpdateDto }) => 
      suppliersService.updateSupplier(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [SUPPLIERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SUPPLIERS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [SUPPLIER_STATS_QUERY_KEY] });
      toast.success('Supplier updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update supplier: ${error.message}`);
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => suppliersService.deleteSupplier(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [SUPPLIERS_QUERY_KEY] });
      queryClient.removeQueries({ queryKey: [SUPPLIERS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [SUPPLIER_STATS_QUERY_KEY] });
      toast.success('Supplier deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete supplier: ${error.message}`);
    },
  });
};

export const useSupplierStats = () => {
  return useQuery({
    queryKey: [SUPPLIER_STATS_QUERY_KEY],
    queryFn: () => suppliersService.getSupplierStats(),
  });
};

export const useSupplierProducts = (supplierId: string) => {
  return useQuery({
    queryKey: [SUPPLIERS_QUERY_KEY, supplierId, 'products'],
    queryFn: () => suppliersService.getSupplierProducts(supplierId),
    enabled: !!supplierId,
  });
};

export const useAddSupplierProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      supplierId,
      data,
    }: {
      supplierId: string;
      data: {
        name: string;
        category: string;
        unit: string;
        price: number;
        currency: string;
        minOrderQuantity?: number;
        leadTimeDays?: number;
      };
    }) => suppliersService.addSupplierProduct(supplierId, data),
    onSuccess: (_, { supplierId }) => {
      queryClient.invalidateQueries({ 
        queryKey: [SUPPLIERS_QUERY_KEY, supplierId, 'products'] 
      });
      toast.success('Product added to supplier successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add product: ${error.message}`);
    },
  });
};

export const useUpdateSupplierProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      supplierId,
      productId,
      data,
    }: {
      supplierId: string;
      productId: string;
      data: {
        name?: string;
        category?: string;
        unit?: string;
        price?: number;
        currency?: string;
        minOrderQuantity?: number;
        leadTimeDays?: number;
      };
    }) => suppliersService.updateSupplierProduct(supplierId, productId, data),
    onSuccess: (_, { supplierId }) => {
      queryClient.invalidateQueries({ 
        queryKey: [SUPPLIERS_QUERY_KEY, supplierId, 'products'] 
      });
      toast.success('Product updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update product: ${error.message}`);
    },
  });
};

export const useRemoveSupplierProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      supplierId,
      productId,
    }: {
      supplierId: string;
      productId: string;
    }) => suppliersService.removeSupplierProduct(supplierId, productId),
    onSuccess: (_, { supplierId }) => {
      queryClient.invalidateQueries({ 
        queryKey: [SUPPLIERS_QUERY_KEY, supplierId, 'products'] 
      });
      toast.success('Product removed from supplier successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove product: ${error.message}`);
    },
  });
};

export const useSupplierOrders = (
  supplierId: string, 
  params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }
) => {
  return useQuery({
    queryKey: [SUPPLIERS_QUERY_KEY, supplierId, 'orders', params],
    queryFn: () => suppliersService.getSupplierOrders(supplierId, params),
    enabled: !!supplierId,
    // Remove keepPreviousData as it's not a valid option in the current version of React Query
  });
};
