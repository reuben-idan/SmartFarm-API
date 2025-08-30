// Base API Response Type
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
  timestamp?: string;
}

// Dashboard Related Types
export interface DashboardStats {
  id: string;
  name: string;
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon?: string;
  description?: string;
}

export interface RecentActivity {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  timestamp: string;
  read: boolean;
  metadata?: Record<string, unknown>;
}

export interface DashboardData {
  stats: DashboardStats[];
  recentActivities: RecentActivity[];
  alerts: Alert[];
  metrics: Metric[];
  lastUpdated: string;
}

// Alert Types
export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Metric Types
export interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  previousValue?: number;
  percentageChange?: number;
  trend: 'up' | 'down' | 'neutral';
  chartData?: {
    labels: string[];
    values: number[];
  };
}

// API Error Handling
export interface ApiError extends Error {
  status: number;
  code?: string;
  errors?: Record<string, string[]>;
  timestamp?: string;
  path?: string;
}

// API Request Options
export interface ApiRequestOptions<T = unknown> {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: T;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | string[] | undefined>;
  signal?: AbortSignal;
  timeout?: number;
  responseType?: 'json' | 'blob' | 'arraybuffer' | 'document' | 'text' | 'stream';
  withCredentials?: boolean;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Filtering & Sorting
export interface FilterCriteria {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'in' | 'notIn';
  value: unknown;
}

export interface SortCriteria {
  field: string;
  direction: 'asc' | 'desc';
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: SortCriteria[];
  filter?: FilterCriteria[];
  search?: string;
  [key: string]: unknown;
}
