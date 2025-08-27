import { useAuth } from '../../lib/auth/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { BarChart, PieChart, LineChart } from 'lucide-react';

export const DashboardPage = () => {
  const { user, logout } = useAuth();

  // Mock data for the dashboard
  const stats = [
    { name: 'Total Farmers', value: '1,234', change: '+12%', changeType: 'increase' },
    { name: 'Active Crops', value: '256', change: '+4%', changeType: 'increase' },
    { name: 'Market Prices', value: '24', change: '+2.5%', changeType: 'increase' },
    { name: 'Alerts', value: '5', change: '0%', changeType: 'neutral' },
  ];

  const recentActivities = [
    { id: 1, user: 'John Doe', action: 'added a new crop', time: '5 min ago' },
    { id: 2, user: 'Jane Smith', action: 'updated market prices', time: '1 hour ago' },
    { id: 3, user: 'Robert Johnson', action: 'submitted a support ticket', time: '3 hours ago' },
    { id: 4, user: 'Emily Davis', action: 'completed soil analysis', time: '5 hours ago' },
  ];

  return (
    <div className="flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.first_name || 'User'}! Here's what's happening with your farm.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => logout()}>
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">
                <BarChart className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
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
