import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  recommendationsService, 
  Recommendation, 
  RecommendationCreateDto,
  RecommendationUpdateDto
} from '@/services/api/recommendations.service';
import { toast } from 'sonner';

const RECOMMENDATIONS_QUERY_KEY = 'recommendations';
const RECOMMENDATION_STATS_QUERY_KEY = 'recommendation-stats';

export const useRecommendations = (params?: {
  type?: string;
  status?: string;
  priority?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: [RECOMMENDATIONS_QUERY_KEY, params],
    queryFn: () => recommendationsService.getRecommendations(params),
    keepPreviousData: true,
  });
};

export const useRecommendation = (id: string) => {
  return useQuery({
    queryKey: [RECOMMENDATIONS_QUERY_KEY, id],
    queryFn: () => recommendationsService.getRecommendationById(id),
    enabled: !!id,
  });
};

export const useCreateRecommendation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RecommendationCreateDto) => 
      recommendationsService.createRecommendation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECOMMENDATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [RECOMMENDATION_STATS_QUERY_KEY] });
      toast.success('Recommendation created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create recommendation: ${error.message}`);
    },
  });
};

export const useUpdateRecommendation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RecommendationUpdateDto }) => 
      recommendationsService.updateRecommendation(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: [RECOMMENDATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [RECOMMENDATIONS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [RECOMMENDATION_STATS_QUERY_KEY] });
      toast.success('Recommendation updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update recommendation: ${error.message}`);
    },
  });
};

export const useDeleteRecommendation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => recommendationsService.deleteRecommendation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [RECOMMENDATIONS_QUERY_KEY] });
      queryClient.removeQueries({ queryKey: [RECOMMENDATIONS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [RECOMMENDATION_STATS_QUERY_KEY] });
      toast.success('Recommendation deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete recommendation: ${error.message}`);
    },
  });
};

export const useRecommendationStats = () => {
  return useQuery({
    queryKey: [RECOMMENDATION_STATS_QUERY_KEY],
    queryFn: () => recommendationsService.getRecommendationStats(),
  });
};

export const useEntityRecommendations = (entityType: string, entityId: string) => {
  return useQuery({
    queryKey: [entityType, entityId, 'recommendations'],
    queryFn: () => recommendationsService.getEntityRecommendations(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
};

export const useUpdateRecommendationStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      id, 
      status, 
      notes 
    }: { 
      id: string; 
      status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
      notes?: string;
    }) => recommendationsService.updateRecommendationStatus(id, status, notes),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: [RECOMMENDATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [RECOMMENDATIONS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [RECOMMENDATION_STATS_QUERY_KEY] });
      toast.success('Recommendation status updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
};

export const useGenerateRecommendations = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: {
      type?: string;
      entityType?: string;
      entityId?: string;
      context?: Record<string, any>;
    }) => recommendationsService.generateRecommendations(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECOMMENDATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [RECOMMENDATION_STATS_QUERY_KEY] });
      toast.success('Recommendations generated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to generate recommendations: ${error.message}`);
    },
  });
};

export const useSimilarRecommendations = (id: string) => {
  return useQuery({
    queryKey: [RECOMMENDATIONS_QUERY_KEY, id, 'similar'],
    queryFn: () => recommendationsService.getSimilarRecommendations(id),
    enabled: !!id,
  });
};
