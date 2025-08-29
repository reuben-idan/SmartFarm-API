import { useAuth } from '@/lib/auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, Droplets, Sun, Thermometer } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { DashboardMetrics, CropYield } from '@/types/dashboard';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Default metrics
const defaultMetrics: DashboardMetrics = {
  temperature: 0,
  humidity: 0,
  soilMoisture: 0,
  lightIntensity: 0
};

// Default crop yields
const defaultCropYields: CropYield[] = [];

// Chart options
const chartOptions: ChartOptions<'bar'> = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

export const DashboardPage = () => {
  const { user } = useAuth();
  
  // Real-time data hooks with proper defaults
  const { data: metrics = defaultMetrics, isLoading: isLoadingMetrics } = 
    useRealtimeData<DashboardMetrics>('metrics', defaultMetrics);
  
  const { data: cropYields = defaultCropYields, isLoading: isLoadingYields } = 
    useRealtimeData<CropYield[]>('cropYields', defaultCropYields);
  
  const isLoading = isLoadingMetrics || isLoadingYields;

  // Stats cards data
  const stats = [
    { 
      id: 'temperature', 
      name: 'Temperature', 
      value: `${metrics?.temperature || 0}°C`, 
      icon: <Thermometer className="h-5 w-5 text-blue-500" />,
      trend: (metrics?.temperature || 0) > 25 ? 'high' : 'normal' as const
    },
    { 
      id: 'humidity', 
      name: 'Humidity', 
      value: `${metrics?.humidity || 0}%`, 
      icon: <Droplets className="h-5 w-5 text-cyan-500" />,
      trend: (metrics?.humidity || 0) > 70 ? 'high' as const : 'normal' as const
    },
    { 
      id: 'soil', 
      name: 'Soil Moisture', 
      value: `${metrics?.soilMoisture || 0}%`, 
      icon: <Activity className="h-5 w-5 text-emerald-500" />,
      trend: (metrics?.soilMoisture || 0) < 30 ? 'low' as const : 'normal' as const
    },
    { 
      id: 'light', 
      name: 'Light Intensity', 
      value: `${metrics?.lightIntensity || 0} lux`, 
      icon: <Sun className="h-5 w-5 text-amber-500" />,
      trend: (metrics?.lightIntensity || 0) > 10000 ? 'high' as const : 'normal' as const
    },
  ];

  // Prepare chart data
  const chartData: ChartData<'bar'> = {
    labels: cropYields?.map(crop => crop.crop) || [],
    datasets: [
      {
        label: 'Yield (tons/hectare)',
        data: cropYields?.map(crop => crop.yieldValue) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Get user's full name
  const userName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user?.email || 'User';

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </Card>
          ))}
        </div>
        <div className="h-96 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {userName}</h1>
        <p className="text-muted-foreground">Here's what's happening with your farm today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.id} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                {stat.icon}
              </div>
            </div>
            {stat.trend !== 'normal' && (
              <p className={`text-xs mt-2 ${stat.trend === 'high' ? 'text-red-500' : 'text-yellow-500'}`}>
                {stat.trend === 'high' ? 'High' : 'Low'} {stat.trend === 'high' ? '⚠️' : '⚠️'}
              </p>
            )}
          </Card>
        ))}
      </div>

      {/* Main Chart */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-6">
          <CardTitle>Crop Yields</CardTitle>
          <CardDescription>Current yield metrics across different crops</CardDescription>
        </CardHeader>
        <CardContent>
          {cropYields?.length ? (
            <Bar options={chartOptions} data={chartData} />
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No yield data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
