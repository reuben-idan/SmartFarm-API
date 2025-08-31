import { apiClient } from './baseClient';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'production' | 'inventory' | 'sales' | 'analytics' | 'custom';
  parameters: Array<{
    name: string;
    type: 'string' | 'number' | 'date' | 'select' | 'boolean';
    label: string;
    required: boolean;
    options?: Array<{ label: string; value: string }>;
    defaultValue?: any;
  }>;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  templateName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: 'pdf' | 'excel' | 'csv' | 'json';
  parameters: Record<string, any>;
  downloadUrl?: string;
  fileSize?: number;
  generatedAt?: string;
  generatedBy: string;
  error?: string;
  metadata?: Record<string, any>;
}

export const reportsService = {
  // Get all report templates
  async getTemplates(params?: {
    category?: string;
    search?: string;
    isSystem?: boolean;
  }) {
    return apiClient.get<ReportTemplate[]>('/reports/templates', { params });
  },

  // Get a single template by ID
  async getTemplateById(id: string) {
    return apiClient.get<ReportTemplate>(`/reports/templates/${id}`);
  },

  // Generate a new report
  async generateReport(templateId: string, data: {
    parameters: Record<string, any>;
    format?: 'pdf' | 'excel' | 'csv' | 'json';
    emailNotification?: boolean;
  }) {
    return apiClient.post<{
      reportId: string;
      status: 'queued' | 'processing';
      message: string;
    }>(`/reports/generate/${templateId}`, data);
  },

  // Get report status
  async getReportStatus(reportId: string) {
    return apiClient.get<GeneratedReport>(`/reports/${reportId}/status`);
  },

  // Get user's report history
  async getReportHistory(params?: {
    templateId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    return apiClient.get<{
      data: GeneratedReport[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/reports/history', { params });
  },

  // Download a generated report
  async downloadReport(reportId: string) {
    return apiClient.get(`/reports/${reportId}/download`, {
      responseType: 'blob',
    });
  },

  // Get report statistics
  async getReportStats() {
    return apiClient.get<{
      totalReports: number;
      reportsByType: Array<{ type: string; count: number }>;
      reportsByStatus: Array<{ status: string; count: number }>;
      recentReports: GeneratedReport[];
      mostPopularTemplates: Array<{ templateId: string; name: string; count: number }>;
    }>('/reports/stats');
  },

  // Schedule a recurring report
  async scheduleReport(templateId: string, data: {
    parameters: Record<string, any>;
    format: 'pdf' | 'excel' | 'csv' | 'json';
    schedule: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
      dayOfWeek?: number; // 0-6 (Sunday-Saturday)
      dayOfMonth?: number; // 1-31
      time: string; // HH:MM in 24h format
      timezone: string; // IANA timezone
    };
    recipients: string[];
    active: boolean;
  }) {
    return apiClient.post(`/reports/schedule/${templateId}`, data);
  },

  // Get scheduled reports
  async getScheduledReports() {
    return apiClient.get<Array<{
      id: string;
      templateId: string;
      templateName: string;
      schedule: any;
      lastRun?: string;
      nextRun: string;
      active: boolean;
      createdBy: string;
      createdAt: string;
    }>>('/reports/scheduled');
  },

  // Update a scheduled report
  async updateScheduledReport(
    scheduleId: string,
    data: Partial<{
      parameters: Record<string, any>;
      format: 'pdf' | 'excel' | 'csv' | 'json';
      schedule: {
        frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
        dayOfWeek?: number;
        dayOfMonth?: number;
        time: string;
        timezone: string;
      };
      recipients: string[];
      active: boolean;
    }>
  ) {
    return apiClient.put(`/reports/scheduled/${scheduleId}`, data);
  },

  // Delete a scheduled report
  async deleteScheduledReport(scheduleId: string) {
    return apiClient.delete(`/reports/scheduled/${scheduleId}`);
  },
};
