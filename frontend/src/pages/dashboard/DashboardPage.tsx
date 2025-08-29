import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { BarChart, PieChart, LineChart, ArrowUpRight, ArrowDownRight, Activity, Droplets, Sun, Thermometer } from 'lucide-react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData } from '@/lib/api/dashboard';
import { Skeleton } from '@/components/ui/skeleton';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Chart data generators
const generateCropData = () => ({
  labels: ['Wheat', 'Corn', 'Soybeans', 'Rice', 'Potatoes'],
  datasets: [
    {
      label: 'Yield (tons/hectare)',
      data: [3.2, 4.1, 2.8, 3.9, 5.1],
      backgroundColor: [
        'rgba(75, 192, 192, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
      ],
      borderWidth: 1,
    },
  ],
});

const generatePriceTrendData = () => ({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Wheat Price ($/ton)',
      data: [250, 260, 245, 275, 290, 280],
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.3,
      fill: true,
    },
    {
      label: 'Corn Price ($/ton)',
      data: [200, 210, 195, 220, 230, 240],
      borderColor: 'rgba(54, 162, 235, 1)',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      tension: 0.3,
      fill: true,
    },
  ],
});

const generateSoilMoistureData = () => ({
  labels: ['Field 1', 'Field 2', 'Field 3', 'Field 4'],
  datasets: [
    {
      label: 'Soil Moisture (%)',
      data: [65, 59, 80, 81],
      backgroundColor: [
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
      ],
      borderWidth: 1,
    },
  ],
});

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fallback to mock data if API is not available
  const stats = dashboardData?.stats || [
    { 
      id: 'farmers', 
      name: 'Total Farmers', 
      value: '1,234', 
      change: '+12%', 
      changeType: 'increase',
      icon: <Activity className="h-5 w-5 text-emerald-500" />
    },
    { 
      id: 'crops', 
      name: 'Active Crops', 
      value: '256', 
      change: '+4%', 
      changeType: 'increase',
      icon: <Droplets className="h-5 w-5 text-blue-500" />
    },
    { 
      id: 'prices', 
      name: 'Market Prices', 
      value: '24', 
      change: '+2.5%', 
      changeType: 'increase',
      icon: <Sun className="h-5 w-5 text-amber-500" />
    },
    { 
      id: 'alerts', 
      name: 'Alerts', 
      value: '5', 
      change: '0%', 
      changeType: 'neutral',
      icon: <Thermometer className="h-5 w-5 text-red-500" />
    },
  ];

  const recentActivities = dashboardData?.recentActivities || [
    { id: 1, user: 'John Doe', action: 'added a new crop', time: '5 min ago' },
    { id: 2, user: 'Jane Smith', action: 'updated market prices', time: '1 hour ago' },
    { id: 3, user: 'Robert Johnson', action: 'submitted a support ticket', time: '3 hours ago' },
    { id: 4, user: 'Emily Davis', action: 'completed soil analysis', time: '5 hours ago' },
  ];

  // Chart data
  const cropData = generateCropData();
  const priceTrendData = generatePriceTrendData();
  const soilMoistureData = generateSoilMoistureData();

  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-96 rounded-lg" />
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            Farm Overview
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.first_name || 'User'}! Here's what's happening with your farm today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <span>Export Report</span>
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => window.location.reload()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.id} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              <div className="h-5 w-5 text-muted-foreground">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className={`text-xs mt-1 flex items-center ${
                stat.changeType === 'increase' ? 'text-emerald-600 dark:text-emerald-400' :
                stat.changeType === 'decrease' ? 'text-red-600 dark:text-red-400' :
                'text-gray-500'
              }`}>
                {stat.changeType === 'increase' ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : stat.changeType === 'decrease' ? (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                ) : null}
                {stat.change} from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Price Trends Chart */}
        <Card className="p-4">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-lg font-semibold">Market Price Trends</CardTitle>
            <CardDescription>Monthly average prices for key crops</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <Line data={priceTrendData} options={lineOptions} />
          </CardContent>
        </Card>

        {/* Crop Distribution */}
        <Card className="p-4">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-lg font-semibold">Crop Yield Distribution</CardTitle>
            <CardDescription>Current season yield by crop type</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <Bar data={cropData} options={barOptions} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Soil Moisture */}
        <Card className="p-4 md:col-span-1">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-lg font-semibold">Soil Moisture Levels</CardTitle>
            <CardDescription>Current soil conditions by field</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <Pie data={soilMoistureData} options={barOptions} />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="p-4 md:col-span-2">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            <CardDescription>Latest actions across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity: { id: number; user: string; action: string; time: string }) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {activity.user.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{activity.user}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button variant="ghost" size="sm" className="text-emerald-600 dark:text-emerald-400">
              View all activity
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Yield Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Crop Yield Overview</CardTitle>
            <CardDescription>Monthly crop yield for the past year</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-md">
              <div className="text-center p-6">
                <LineChart className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Crop yield chart will be displayed here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className="col-span-3 space-y-4">
          {/* Crop Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Crop Distribution</CardTitle>
              <CardDescription>Current crop distribution by area</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center bg-muted/50 rounded-md">
                <div className="text-center p-6">
                  <PieChart className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Crop distribution chart will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest activities in your farm</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {activity.user.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-none">{activity.user}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Add New Crop</CardTitle>
            <CardDescription>Record a new crop planting</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Add Crop
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Record Harvest</CardTitle>
            <CardDescription>Log your latest harvest</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Record Harvest
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Check Weather</CardTitle>
            <CardDescription>View weather forecast</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              View Forecast
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Get Support</CardTitle>
            <CardDescription>Contact our support team</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
