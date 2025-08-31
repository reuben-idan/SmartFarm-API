import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { farmersService, Farmer, FarmerCreateDto, FarmerUpdateDto } from '@/services/api/farmers.service';
import { toast } from 'sonner';

const FARMERS_QUERY_KEY = 'farmers';
const FARMER_STATS_QUERY_KEY = 'farmer-stats';

export const useFarmers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: [FARMERS_QUERY_KEY, params],
    queryFn: () => farmersService.getFarmers(params),
    keepPreviousData: true,
  });
};

export const useFarmer = (id: string) => {
  return useQuery({
    queryKey: [FARMERS_QUERY_KEY, id],
    queryFn: () => farmersService.getFarmerById(id),
    enabled: !!id,
  });
};

export const useCreateFarmer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: FarmerCreateDto) => farmersService.createFarmer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FARMERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FARMER_STATS_QUERY_KEY] });
      toast.success('Farmer created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create farmer: ${error.message}`);
    },
  });
};

export const useUpdateFarmer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FarmerUpdateDto }) => 
      farmersService.updateFarmer(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: [FARMERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FARMERS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [FARMER_STATS_QUERY_KEY] });
      toast.success('Farmer updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update farmer: ${error.message}`);
    },
  });
};

export const useDeleteFarmer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => farmersService.deleteFarmer(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [FARMERS_QUERY_KEY] });
      queryClient.removeQueries({ queryKey: [FARMERS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [FARMER_STATS_QUERY_KEY] });
      toast.success('Farmer deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete farmer: ${error.message}`);
    },
  });
};

export const useFarmerStats = () => {
  return useQuery({
    queryKey: [FARMER_STATS_QUERY_KEY],
    queryFn: () => farmersService.getFarmerStats(),
  });
};

export const useSearchFarmers = (query: string) => {
  return useQuery({
    queryKey: ['search-farmers', query],
    queryFn: () => farmersService.searchFarmers(query),
    enabled: !!query && query.length > 2,
    select: (data) => data || [],
  });
};
