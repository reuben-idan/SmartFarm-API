import { apiClient } from './baseClient';

export interface Recommendation {
  id: string;
  type: 'crop_planning' | 'pest_control' | 'irrigation' | 'fertilization' | 'harvest' | 'market';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  relatedEntityType?: 'crop' | 'field' | 'farmer' | 'inventory' | 'market';
  relatedEntityId?: string;
  relatedEntityName?: string;
  data?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

export interface RecommendationCreateDto {
  type: Recommendation['type'];
  title: string;
  description: string;
  priority?: Recommendation['priority'];
  status?: Recommendation['status'];
  relatedEntityType?: Recommendation['relatedEntityType'];
  relatedEntityId?: string;
  data?: Record<string, any>;
  dueDate?: string;
  notes?: string;
}

export interface RecommendationUpdateDto extends Partial<RecommendationCreateDto> {
  status?: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  completedAt?: string | null;
  completedBy?: string | null;
  notes?: string;
}

export const recommendationsService = {
  // Get all recommendations with filtering
  async getRecommendations(params?: {
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
  }) {
    return apiClient.get<{
      data: Recommendation[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/recommendations', { params });
  },

  // Get a single recommendation by ID
  async getRecommendationById(id: string) {
    return apiClient.get<Recommendation>(`/recommendations/${id}`);
  },

  // Create a new recommendation
  async createRecommendation(data: RecommendationCreateDto) {
    return apiClient.post<Recommendation>('/recommendations', data);
  },

  // Update a recommendation
  async updateRecommendation(id: string, data: RecommendationUpdateDto) {
    return apiClient.put<Recommendation>(`/recommendations/${id}`, data);
  },

  // Delete a recommendation
  async deleteRecommendation(id: string) {
    return apiClient.delete(`/recommendations/${id}`);
  },

  // Get recommendation statistics
  async getRecommendationStats() {
    return apiClient.get<{
      total: number;
      byType: Array<{ type: string; count: number }>;
      byStatus: Array<{ status: string; count: number }>;
      byPriority: Array<{ priority: string; count: number }>;
      recent: Recommendation[];
    }>('/recommendations/stats');
  },

  // Get recommendations for a specific entity
  async getEntityRecommendations(entityType: string, entityId: string) {
    return apiClient.get<Recommendation[]>(`/${entityType}/${entityId}/recommendations`);
  },

  // Update recommendation status
  async updateRecommendationStatus(
    id: string, 
    status: 'pending' | 'in_progress' | 'completed' | 'dismissed',
    notes?: string
  ) {
    return apiClient.patch<Recommendation>(`/recommendations/${id}/status`, { status, notes });
  },

  // Generate AI-powered recommendations
  async generateRecommendations(params: {
    type?: string;
    entityType?: string;
    entityId?: string;
    context?: Record<string, any>;
  }) {
    return apiClient.post<{
      success: boolean;
      generated: number;
      recommendations: Recommendation[];
    }>('/recommendations/generate', params);
  },

  // Get similar recommendations
  async getSimilarRecommendations(id: string) {
    return apiClient.get<Recommendation[]>(`/recommendations/${id}/similar`);
  },
};
