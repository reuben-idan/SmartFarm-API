import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardData, DashboardStats, RecentActivity } from '../types/api';
import { fetchDashboardData, fetchDashboardStats, fetchRecentActivities, markActivityAsRead } from '../services/dashboardService';

export const useDashboard = () => {
  const queryClient = useQueryClient();

  // Fetch all dashboard data
  const dashboardQuery = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Fetch only stats
  const statsQuery = useQuery<DashboardStats[]>({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    enabled: !dashboardQuery.data, // Only fetch if we don't have the full dashboard data
  });

  // Fetch only recent activities
  const activitiesQuery = useQuery<RecentActivity[]>({
    queryKey: ['dashboard', 'activities'],
    queryFn: fetchRecentActivities,
    enabled: !dashboardQuery.data, // Only fetch if we don't have the full dashboard data
  });

  // Mark activity as read
  const markAsRead = useMutation({
    mutationFn: markActivityAsRead,
    onSuccess: () => {
      // Invalidate and refetch the activities query
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'activities'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Get combined data
  const data = {
    stats: dashboardQuery.data?.stats || statsQuery.data || [],
    activities: dashboardQuery.data?.recentActivities || activitiesQuery.data || [],
    isLoading: dashboardQuery.isLoading || statsQuery.isLoading || activitiesQuery.isLoading,
    isError: dashboardQuery.isError || statsQuery.isError || activitiesQuery.isError,
    error: dashboardQuery.error || statsQuery.error || activitiesQuery.error,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'activities'] });
    },
  };

  return {
    ...data,
    markAsRead,
  };
};

// Example of using this hook in a component:
/*
const DashboardPage = () => {
  const { stats, activities, isLoading, isError, error, markAsRead } = useDashboard();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  return (
    <div>
      <StatsGrid stats={stats} />
      <RecentActivities 
        activities={activities} 
        onMarkAsRead={(id) => markAsRead.mutate(id)} 
      />
    </div>
  );
};
*/
