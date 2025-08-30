export interface DashboardMetrics {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  lightIntensity: number;
}

export interface CropYield {
  crop: string;
  yieldValue: number;
  unit: string;
}

export interface DashboardStats {
  id: string;
  name: string;
  value: string;
  icon: React.ReactNode;
  trend: 'high' | 'normal' | 'low';
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

export interface ChartOptions {
  responsive: boolean;
  plugins: {
    legend: {
      position: 'top' | 'center' | 'left' | 'right' | 'bottom' | 'chartArea' | { [scaleId: string]: number } | undefined;
    };
  };
  scales: {
    y: {
      beginAtZero: boolean;
    };
  };
}
