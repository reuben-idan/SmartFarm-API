import { apiClient } from '../config/api';
import { DashboardStats, RecentActivity } from '../types/api';

// Define the response types for the dashboard API
export interface DashboardData {
  stats: DashboardStats[];
  recentActivities: RecentActivity[];
  // Add more dashboard-specific data types as needed
}

// Fetch all dashboard data
export const fetchDashboardData = async (): Promise<DashboardData> => {
  try {
    const response = await apiClient.get<DashboardData>('/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

// Fetch only stats data
export const fetchDashboardStats = async (): Promise<DashboardStats[]> => {
  try {
    const response = await apiClient.get<DashboardStats[]>('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Fetch recent activities
export const fetchRecentActivities = async (): Promise<RecentActivity[]> => {
  try {
    const response = await apiClient.get<RecentActivity[]>('/dashboard/activities');
    return response.data;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
};

// Example of a mutation (e.g., marking an activity as read)
export const markActivityAsRead = async (activityId: number): Promise<void> => {
  try {
    await apiClient.patch(`/activities/${activityId}/read`);
  } catch (error) {
    console.error('Error marking activity as read:', error);
    throw error;
  }
};

// Example of a query with parameters
export const fetchFilteredActivities = async (params: {
  limit?: number;
  offset?: number;
  type?: string;
}): Promise<{ activities: RecentActivity[]; total: number }> => {
  try {
    const response = await apiClient.get<{ activities: RecentActivity[]; total: number }>(
      '/dashboard/activities/filtered',
      { params }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching filtered activities:', error);
    throw error;
  }
};

// Example of a more complex query with request body
export const searchActivities = async (query: string, filters: Record<string, unknown> = {}) => {
  try {
    const response = await apiClient.post<{ results: RecentActivity[] }>('/dashboard/activities/search', {
      query,
      filters,
    });
    return response.data.results;
  } catch (error) {
    console.error('Error searching activities:', error);
    throw error;
  }
};
