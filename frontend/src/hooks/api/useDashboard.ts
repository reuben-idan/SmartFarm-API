import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/api/dashboard.service';

const DASHBOARD_DATA_QUERY_KEY = 'dashboard-data';

export const useDashboardData = (params?: {
  startDate?: string;
  endDate?: string;
  regionId?: string;
  cropType?: string;
}) => {
  return useQuery({
    queryKey: [DASHBOARD_DATA_QUERY_KEY, params],
    queryFn: () => dashboardService.getDashboardData(params),
    // Data is considered fresh for 1 minute
    staleTime: 60 * 1000,
  });
};

export const useFarmerDashboard = (farmerId: string) => {
  return useQuery({
    queryKey: [`farmer-dashboard-${farmerId}`],
    queryFn: () => dashboardService.getFarmerDashboard(farmerId),
    enabled: !!farmerId,
    staleTime: 60 * 1000,
  });
};

export const useRecentActivities = (params?: {
  limit?: number;
  types?: string[];
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['recent-activities', params],
    queryFn: () => dashboardService.getRecentActivities(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFinancialOverview = (params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}) => {
  return useQuery({
    queryKey: ['financial-overview', params],
    queryFn: () => dashboardService.getFinancialOverview(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useCropDistribution = (params?: {
  regionId?: string;
  season?: string;
}) => {
  return useQuery({
    queryKey: ['crop-distribution', params],
    queryFn: () => dashboardService.getCropDistribution(params),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useUpcomingTasks = (params?: {
  dueInDays?: number;
  priority?: 'low' | 'medium' | 'high';
  status?: string;
}) => {
  return useQuery({
    queryKey: ['upcoming-tasks', params],
    queryFn: () => dashboardService.getUpcomingTasks(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePerformanceMetrics = (params?: {
  startDate?: string;
  endDate?: string;
  cropType?: string;
  regionId?: string;
}) => {
  return useQuery({
    queryKey: ['performance-metrics', params],
    queryFn: () => dashboardService.getPerformanceMetrics(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useAlerts = (params?: {
  read?: boolean;
  type?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['alerts', params],
    queryFn: () => dashboardService.getAlerts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useWeatherForecast = (params?: {
  location?: string;
  days?: number;
}) => {
  return useQuery({
    queryKey: ['weather-forecast', params],
    queryFn: () => dashboardService.getWeatherForecast(params),
    staleTime: 30 * 60 * 1000, // 30 minutes
    // Don't retry on error since weather data is not critical
    retry: 1,
  });
};

export const useMarketPricesOverview = (params?: {
  commodities?: string[];
  days?: number;
}) => {
  return useQuery({
    queryKey: ['market-prices-overview', params],
    queryFn: () => dashboardService.getMarketPricesOverview(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};
