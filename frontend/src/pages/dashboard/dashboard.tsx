import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, Sun, AlertCircle, Loader2, Activity as ActivityIcon } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Users, Sprout, MapPin, ClipboardCheck, BarChart3 } from "@/components/icons";
import type { DashboardMetrics, ChartData, DashboardStats } from "@/types/dashboard";

interface Activity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: string;
}

interface WeatherForecast {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  forecast: Array<{
    date: string;
    temperature: number;
    condition: string;
  }>;
}

interface DashboardData {
  metrics: DashboardMetrics;
  stats: DashboardStats[];
  chartData: ChartData;
  recentActivities: Activity[];
  weather: WeatherForecast;
}

// Mock data that matches the DashboardData interface
const mockDashboardData: DashboardData = {
  metrics: {
    temperature: 24.5,
    humidity: 65,
    soilMoisture: 72,
    lightIntensity: 1200
  },
  stats: [
    {
      id: 'total-farmers',
      name: 'Total Farmers',
      value: '42',
      icon: <Users className="h-4 w-4 text-blue-500" />,
      trend: 'high' as const
    },
    {
      id: 'active-crops',
      name: 'Active Crops',
      value: '24',
      icon: <Sprout className="h-4 w-4 text-green-500" />,
      trend: 'normal' as const
    },
    {
      id: 'land-area',
      name: 'Total Land Area',
      value: '56.7 ha',
      icon: <MapPin className="h-4 w-4 text-amber-500" />,
      trend: 'high' as const
    },
    {
      id: 'crop-health',
      name: 'Crop Health',
      value: '92%',
      icon: <div className="h-4 w-4 rounded-full bg-green-500" />,
      trend: 'high' as const
    }
  ],
  chartData: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Crop Yield (kg)',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  },
  recentActivities: [
    {
      id: '1',
      title: 'Irrigation cycle completed',
      description: 'Field A1 watered for 15 minutes',
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      type: 'irrigation',
    },
    {
      id: '2',
      title: 'New temperature reading',
      description: 'Temperature in Greenhouse 1: 24.5°C',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      type: 'sensor',
    },
  ],
  weather: {
    temperature: 24,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    precipitation: 0,
    forecast: [
      { date: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(), temperature: 25, condition: 'Sunny' },
      { date: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(), temperature: 23, condition: 'Partly Cloudy' },
      { date: new Date(Date.now() + 1000 * 60 * 60 * 9).toISOString(), temperature: 21, condition: 'Cloudy' },
      { date: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(), temperature: 19, condition: 'Clear' },
    ],
  }
};

export default function DashboardPage() {
  // In a real app, use the actual hooks:
  // const { data: dashboardData, isLoading, error } = useDashboardData();
  
  // For now, use mock data
  const isLoading = false;
  const error = null;
  const dashboardData = mockDashboardData;

  const handleWaterPlants = () => {
    // TODO: Implement water plants action
    toast.success("Watering initiated. Your plants are being watered.");
  };

  const handleAdjustLights = () => {
    // TODO: Implement adjust lights action
    toast.success("Light settings have been updated.");
  };
  
  const handleAddTask = () => {
    // TODO: Implement add task action
    toast.info("Add task functionality coming soon!");
  };
  
  const handleViewReports = () => {
    // TODO: Implement view reports navigation
    toast.info("Reports page coming soon!");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <span className="ml-2 text-destructive">
          Failed to load dashboard data. Please try again later.
        </span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Farm Overview</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening on your farm.
            <span className="ml-2">
              Current weather: {dashboardData.weather.temperature}°C, {dashboardData.weather.condition}
            </span>
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {dashboardData.stats.map((stat) => (
            <Card key={stat.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.trend === 'high' ? '↑ Up from last month' : 
                   stat.trend === 'low' ? '↓ Down from last month' : '↔ No change'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentActivities.length > 0 ? (
                  dashboardData.recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-accent flex items-center justify-center mr-3 mt-0.5">
                        <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activities found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-28 p-4"
                  onClick={handleWaterPlants}
                >
                  <Droplet className="h-6 w-6 text-blue-500 mb-2" />
                  <span className="text-sm font-medium">Water Plants</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-28 p-4"
                  onClick={handleAdjustLights}
                >
                  <Sun className="h-6 w-6 text-yellow-500 mb-2" />
                  <span className="text-sm font-medium">Adjust Lights</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-28 p-4"
                  onClick={handleAddTask}
                >
                  <ClipboardCheck className="h-6 w-6 text-green-500 mb-2" />
                  <span className="text-sm font-medium">Add Task</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-28 p-4"
                  onClick={handleViewReports}
                >
                  <BarChart3 className="h-6 w-6 text-purple-500 mb-2" />
                  <span className="text-sm font-medium">View Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle>Weather Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-4xl font-bold">{dashboardData.weather.temperature}°C</div>
                  <div className="text-right">
                    <div className="font-medium">{dashboardData.weather.condition}</div>
                    <div className="text-sm text-muted-foreground">
                      Humidity: {dashboardData.weather.humidity}%
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Wind</p>
                    <p className="font-medium">{dashboardData.weather.windSpeed} km/h</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Precipitation</p>
                    <p className="font-medium">{dashboardData.weather.precipitation} mm</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Next 24 Hours</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {dashboardData.weather.forecast.slice(0, 4).map((item, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleTimeString([], { hour: '2-digit' })}
                        </div>
                        <div className="text-lg font-medium">{item.temperature}°</div>
                        <div className="text-xs text-muted-foreground">
                          {item.condition}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
