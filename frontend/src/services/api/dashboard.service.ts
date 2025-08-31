import { apiClient } from './baseClient';

export interface DashboardStats {
  // Overview metrics
  totalFarmers: number;
  activeFarmers: number;
  totalCrops: number;
  cropsInProgress: number;
  totalLandArea: number; // in hectares
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    user?: string;
  }>;

  // Weather data
  weather?: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    forecast: Array<{
      date: string;
      high: number;
      low: number;
      condition: string;
      precipitation: number;
    }>;
  };

  // Crop distribution
  cropDistribution: Array<{
    crop: string;
    area: number;
    percentage: number;
    status: string;
  }>;

  // Financial summary
  financials: {
    revenue: {
      currentMonth: number;
      previousMonth: number;
      trend: 'up' | 'down';
      percentage: number;
    };
    expenses: {
      currentMonth: number;
      previousMonth: number;
      trend: 'up' | 'down';
      percentage: number;
    };
    profit: {
      currentMonth: number;
      previousMonth: number;
      trend: 'up' | 'down';
      percentage: number;
    };
    outstandingPayments: number;
  };

  // Market prices
  marketPrices: Array<{
    commodity: string;
    currentPrice: number;
    change24h: number;
    change7d: number;
    unit: string;
  }>;

  // Upcoming tasks
  upcomingTasks: Array<{
    id: string;
    title: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    assignedTo?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  }>;

  // Alerts and notifications
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    timestamp: string;
    actionRequired: boolean;
    actionUrl?: string;
  }>;

  // Performance metrics
  performance: {
    yieldPerHectare: number;
    waterUsage: {
      current: number;
      target: number;
      unit: string;
    };
    fertilizerUsage: {
      current: number;
      target: number;
      unit: string;
    };
    pestIncidents: number;
    cropHealth: number; // 0-100 scale
  };
}

export const dashboardService = {
  // Get all dashboard data
  async getDashboardData(params?: {
    startDate?: string;
    endDate?: string;
    regionId?: string;
    cropType?: string;
  }): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>('/dashboard', { params });
  },

  // Get dashboard data for a specific farmer
  async getFarmerDashboard(farmerId: string) {
    return apiClient.get<DashboardStats>(`/dashboard/farmers/${farmerId}`);
  },

  // Get recent activities with filtering
  async getRecentActivities(params?: {
    limit?: number;
    types?: string[];
    startDate?: string;
    endDate?: string;
  }) {
    return apiClient.get<DashboardStats['recentActivities']>('/dashboard/activities', {
      params: {
        ...params,
        types: params?.types?.join(','),
      },
    });
  },

  // Get financial overview
  async getFinancialOverview(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  }) {
    return apiClient.get<DashboardStats['financials']>('/dashboard/financials', { params });
  },

  // Get crop distribution
  async getCropDistribution(params?: {
    regionId?: string;
    season?: string;
  }) {
    return apiClient.get<DashboardStats['cropDistribution']>('/dashboard/crop-distribution', { params });
  },

  // Get upcoming tasks
  async getUpcomingTasks(params?: {
    dueInDays?: number;
    priority?: 'low' | 'medium' | 'high';
    status?: string;
  }) {
    return apiClient.get<DashboardStats['upcomingTasks']>('/dashboard/upcoming-tasks', { params });
  },

  // Get performance metrics
  async getPerformanceMetrics(params?: {
    startDate?: string;
    endDate?: string;
    cropType?: string;
    regionId?: string;
  }) {
    return apiClient.get<DashboardStats['performance']>('/dashboard/performance', { params });
  },

  // Get alerts and notifications
  async getAlerts(params?: {
    read?: boolean;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) {
    return apiClient.get<DashboardStats['alerts']>('/dashboard/alerts', { params });
  },

  // Mark alert as read
  async markAlertAsRead(alertId: string) {
    return apiClient.patch(`/dashboard/alerts/${alertId}/read`);
  },

  // Get weather forecast
  async getWeatherForecast(params?: {
    location?: string;
    days?: number;
  }) {
    return apiClient.get<DashboardStats['weather']>('/dashboard/weather', { params });
  },

  // Get market prices overview
  async getMarketPricesOverview(params?: {
    commodities?: string[];
    days?: number;
  }) {
    return apiClient.get<DashboardStats['marketPrices']>('/dashboard/market-prices', {
      params: {
        ...params,
        commodities: params?.commodities?.join(','),
      },
    });
  },
};
