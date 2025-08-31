import { apiClient } from './baseClient';

export interface Farmer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  farmSize: number;
  crops: string[];
  joinDate: string;
  status: 'active' | 'inactive' | 'pending';
  lastActivity?: string;
  notes?: string;
}

export interface FarmerCreateDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  farmSize: number;
  crops: string[];
  status?: 'active' | 'inactive' | 'pending';
  notes?: string;
}

export interface FarmerUpdateDto extends Partial<FarmerCreateDto> {}

export interface FarmerResponse {
  data: Farmer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const farmersService = {
  // Get all farmers with pagination and filtering
  async getFarmers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }): Promise<FarmerResponse> {
    return apiClient.get<FarmerResponse>('/farmers', { params });
  },

  // Get a single farmer by ID
  async getFarmerById(id: string) {
    return apiClient.get<Farmer>(`/farmers/${id}`);
  },

  // Create a new farmer
  async createFarmer(data: FarmerCreateDto) {
    return apiClient.post<Farmer>('/farmers', data);
  },

  // Update an existing farmer
  async updateFarmer(id: string, data: FarmerUpdateDto) {
    return apiClient.put<Farmer>(`/farmers/${id}`, data);
  },

  // Delete a farmer
  async deleteFarmer(id: string) {
    return apiClient.delete(`/farmers/${id}`);
  },

  // Get farmer statistics
  async getFarmerStats() {
    return apiClient.get<{
      totalFarmers: number;
      activeFarmers: number;
      totalFarmSize: number;
      farmersByStatus: { status: string; count: number }[];
      recentFarmers: Farmer[];
    }>('/farmers/stats');
  },

  // Search farmers by name, email, or phone
  async searchFarmers(query: string) {
    return apiClient.get<Farmer[]>(`/farmers/search?q=${encodeURIComponent(query)}`);
  },

  // Bulk import farmers
  async importFarmers(data: FarmerCreateDto[]) {
    return apiClient.post<{ success: boolean; imported: number; errors: any[] }>(
      '/farmers/import',
      { farmers: data }
    );
  },
};
