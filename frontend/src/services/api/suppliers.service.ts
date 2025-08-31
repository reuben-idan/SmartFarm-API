import { apiClient } from './baseClient';

export interface Supplier {
  id: string;
  name: string;
  type: 'seed' | 'fertilizer' | 'pesticide' | 'equipment' | 'service' | 'other';
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  website?: string;
  taxId?: string;
  rating?: number;
  status: 'active' | 'inactive' | 'on_hold' | 'blacklisted';
  paymentTerms?: string;
  leadTimeDays?: number;
  notes?: string;
  products?: Array<{
    id: string;
    name: string;
    category: string;
    unit: string;
    price: number;
    currency: string;
    minOrderQuantity?: number;
    leadTimeDays?: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierCreateDto {
  name: string;
  type: Supplier['type'];
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  website?: string;
  taxId?: string;
  status?: Supplier['status'];
  paymentTerms?: string;
  leadTimeDays?: number;
  notes?: string;
}

export interface SupplierUpdateDto extends Partial<SupplierCreateDto> {}

export const suppliersService = {
  // Get all suppliers with pagination and filtering
  async getSuppliers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) {
    return apiClient.get<{
      data: Supplier[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/suppliers', { params });
  },

  // Get a single supplier by ID
  async getSupplierById(id: string) {
    return apiClient.get<Supplier>(`/suppliers/${id}`);
  },

  // Create a new supplier
  async createSupplier(data: SupplierCreateDto) {
    return apiClient.post<Supplier>('/suppliers', data);
  },

  // Update an existing supplier
  async updateSupplier(id: string, data: SupplierUpdateDto) {
    return apiClient.put<Supplier>(`/suppliers/${id}`, data);
  },

  // Delete a supplier
  async deleteSupplier(id: string) {
    return apiClient.delete(`/suppliers/${id}`);
  },

  // Get supplier statistics
  async getSupplierStats() {
    return apiClient.get<{
      totalSuppliers: number;
      suppliersByType: Array<{ type: string; count: number }>;
      suppliersByStatus: Array<{ status: string; count: number }>;
      topSuppliers: Array<{ id: string; name: string; orderCount: number; totalSpent: number }>;
      recentOrders: Array<{
        id: string;
        supplierId: string;
        supplierName: string;
        orderDate: string;
        totalAmount: number;
        status: string;
      }>;
    }>('/suppliers/stats');
  },

  // Search suppliers by name, contact person, or email
  async searchSuppliers(query: string) {
    return apiClient.get<Supplier[]>(`/suppliers/search?q=${encodeURIComponent(query)}`);
  },

  // Get supplier products
  async getSupplierProducts(supplierId: string) {
    return apiClient.get<Supplier['products']>(`/suppliers/${supplierId}/products`);
  },

  // Add product to supplier
  async addSupplierProduct(
    supplierId: string,
    data: {
      name: string;
      category: string;
      unit: string;
      price: number;
      currency: string;
      minOrderQuantity?: number;
      leadTimeDays?: number;
    }
  ) {
    return apiClient.post(`/suppliers/${supplierId}/products`, data);
  },

  // Update supplier product
  async updateSupplierProduct(
    supplierId: string,
    productId: string,
    data: {
      name?: string;
      category?: string;
      unit?: string;
      price?: number;
      currency?: string;
      minOrderQuantity?: number;
      leadTimeDays?: number;
    }
  ) {
    return apiClient.put(`/suppliers/${supplierId}/products/${productId}`, data);
  },

  // Remove product from supplier
  async removeSupplierProduct(supplierId: string, productId: string) {
    return apiClient.delete(`/suppliers/${supplierId}/products/${productId}`);
  },

  // Get supplier orders
  async getSupplierOrders(supplierId: string, params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Array<{
      id: string;
      orderNumber: string;
      orderDate: string;
      expectedDeliveryDate: string;
      status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
      totalAmount: number;
      currency: string;
      items: Array<{
        id: string;
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: number;
        total: number;
      }>;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return apiClient.get(`/suppliers/${supplierId}/orders`, { params });
  },
};
