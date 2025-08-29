export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

export interface DashboardStats {
  id: string;
  name: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
}

export interface RecentActivity {
  id: number;
  user: string;
  action: string;
  time: string;
}

export interface DashboardData {
  stats: DashboardStats[];
  recentActivities: RecentActivity[];
  // Add more data types as needed
}

// API Error Response
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// API Request Options
export interface ApiRequestOptions<T> {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: T;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  signal?: AbortSignal;
}
