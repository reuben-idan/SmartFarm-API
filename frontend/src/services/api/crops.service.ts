import { apiClient } from './baseClient';

export interface Crop {
  id: string;
  name: string;
  variety: string;
  plantingDate: string;
  harvestDate?: string;
  status: 'planned' | 'planted' | 'growing' | 'ready_for_harvest' | 'harvested' | 'failed';
  fieldId: string;
  fieldName?: string;
  area: number; // in hectares
  expectedYield: number; // in tons
  actualYield?: number; // in tons
  farmerId: string;
  farmerName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CropCreateDto {
  name: string;
  variety: string;
  plantingDate: string;
  harvestDate?: string;
  status?: Crop['status'];
  fieldId: string;
  area: number;
  expectedYield: number;
  farmerId: string;
  notes?: string;
}

export interface CropUpdateDto extends Partial<CropCreateDto> {}

export const cropsService = {
  // Get all crops with pagination and filtering
  async getCrops(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    farmerId?: string;
    fieldId?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) {
    return apiClient.get<{
      data: Crop[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/crops', { params });
  },

  // Get a single crop by ID
  async getCropById(id: string) {
    return apiClient.get<Crop>(`/crops/${id}`);
  },

  // Create a new crop
  async createCrop(data: CropCreateDto) {
    return apiClient.post<Crop>('/crops', data);
  },

  // Update an existing crop
  async updateCrop(id: string, data: CropUpdateDto) {
    return apiClient.put<Crop>(`/crops/${id}`, data);
  },

  // Delete a crop
  async deleteCrop(id: string) {
    return apiClient.delete(`/crops/${id}`);
  },

  // Get crop statistics
  async getCropStats() {
    return apiClient.get<{
      totalCrops: number;
      cropsByStatus: { status: string; count: number }[];
      totalArea: number;
      expectedYield: number;
      recentCrops: Crop[];
    }>('/crops/stats');
  },

  // Update crop status
  async updateCropStatus(id: string, status: Crop['status'], notes?: string) {
    return apiClient.patch<Crop>(`/crops/${id}/status`, { status, notes });
  },

  // Record harvest
  async recordHarvest(id: string, actualYield: number, notes?: string) {
    return apiClient.post<Crop>(`/crops/${id}/harvest`, { actualYield, notes });
  },

  // Get crops by farmer
  async getCropsByFarmer(farmerId: string) {
    return apiClient.get<Crop[]>(`/farmers/${farmerId}/crops`);
  },

  // Get crops by field
  async getCropsByField(fieldId: string) {
    return apiClient.get<Crop[]>(`/fields/${fieldId}/crops`);
  },

  // Get upcoming tasks for crops (planting, treatments, harvest, etc.)
  async getUpcomingTasks(daysAhead: number = 7) {
    return apiClient.get<Array<{
      id: string;
      type: 'planting' | 'treatment' | 'harvest' | 'inspection';
      date: string;
      cropId: string;
      cropName: string;
      fieldName: string;
      status: 'pending' | 'completed' | 'overdue';
      notes?: string;
    }>>(`/crops/upcoming-tasks?days=${daysAhead}`);
  },
};
