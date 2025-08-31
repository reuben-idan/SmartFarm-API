import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  cropsService, 
  Crop, 
  CropCreateDto, 
  CropUpdateDto 
} from '@/services/api/crops.service';
import { toast } from 'sonner';

const CROPS_QUERY_KEY = 'crops';
const CROP_STATS_QUERY_KEY = 'crop-stats';

export const useCrops = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  farmerId?: string;
  fieldId?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: [CROPS_QUERY_KEY, params],
    queryFn: () => cropsService.getCrops(params),
    keepPreviousData: true,
  });
};

export const useCrop = (id: string) => {
  return useQuery({
    queryKey: [CROPS_QUERY_KEY, id],
    queryFn: () => cropsService.getCropById(id),
    enabled: !!id,
  });
};

export const useCreateCrop = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CropCreateDto) => cropsService.createCrop(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CROPS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CROP_STATS_QUERY_KEY] });
      toast.success('Crop created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create crop: ${error.message}`);
    },
  });
};

export const useUpdateCrop = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CropUpdateDto }) => 
      cropsService.updateCrop(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: [CROPS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CROPS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [CROP_STATS_QUERY_KEY] });
      toast.success('Crop updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update crop: ${error.message}`);
    },
  });
};

export const useDeleteCrop = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => cropsService.deleteCrop(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [CROPS_QUERY_KEY] });
      queryClient.removeQueries({ queryKey: [CROPS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [CROP_STATS_QUERY_KEY] });
      toast.success('Crop deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete crop: ${error.message}`);
    },
  });
};

export const useCropStats = () => {
  return useQuery({
    queryKey: [CROP_STATS_QUERY_KEY],
    queryFn: () => cropsService.getCropStats(),
  });
};

export const useUpdateCropStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      id, 
      status, 
      notes 
    }: { 
      id: string; 
      status: Crop['status']; 
      notes?: string 
    }) => cropsService.updateCropStatus(id, status, notes),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: [CROPS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CROPS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [CROP_STATS_QUERY_KEY] });
      toast.success('Crop status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update crop status: ${error.message}`);
    },
  });
};

export const useRecordHarvest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      id, 
      actualYield, 
      notes 
    }: { 
      id: string; 
      actualYield: number; 
      notes?: string 
    }) => cropsService.recordHarvest(id, actualYield, notes),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: [CROPS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CROPS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [CROP_STATS_QUERY_KEY] });
      toast.success('Harvest recorded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to record harvest: ${error.message}`);
    },
  });
};

export const useUpcomingTasks = (daysAhead: number = 7) => {
  return useQuery({
    queryKey: ['crop-tasks', daysAhead],
    queryFn: () => cropsService.getUpcomingTasks(daysAhead),
  });
};
