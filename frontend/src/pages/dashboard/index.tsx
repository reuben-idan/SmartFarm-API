import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Sprout, Plus, AlertTriangle, Droplet, CloudRain, Activity, Sun } from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { cn } from "@/utils"

// Chart colors
const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
}

// Mock data for the dashboard
const farmerData = [
  { name: 'Jan', count: 45 },
  { name: 'Feb', count: 60 },
  { name: 'Mar', count: 52 },
  { name: 'Apr', count: 78 },
  { name: 'May', count: 65 },
  { name: 'Jun', count: 90 },
  { name: 'Jul', count: 85 },
  { name: 'Aug', count: 100 },
  { name: 'Sep', count: 95 },
  { name: 'Oct', count: 110 },
  { name: 'Nov', count: 125 },
  { name: 'Dec', count: 140 },
];

export function DashboardPage() {
  // Sample data for charts
  const stats = [
    { 
      title: 'Total Farmers', 
      value: '1,248', 
      change: '+12.5%', 
      icon: Users,
      trend: 'up',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    { 
      title: 'Active Crops', 
      value: '24', 
      change: '+5.2%', 
      icon: Sprout,
      trend: 'up',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    { 
      title: 'Avg. Yield (kg/ha)', 
      value: '2,450', 
      change: '+8.1%', 
      icon: Activity,
      trend: 'up',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    { 
      title: 'Weather', 
      value: 'Sunny', 
      change: '26°C', 
      icon: Sun,
      trend: 'stable',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
  ]

  const cropData = [
    { name: 'Maize', value: 35, color: '#0ea5e9' },
    { name: 'Beans', value: 25, color: '#8b5cf6' },
    { name: 'Tea', value: 20, color: '#22c55e' },
    { name: 'Coffee', value: 15, color: '#f59e0b' },
    { name: 'Other', value: 5, color: '#ef4444' },
  ]

  const priceData = [
    { name: 'Jan', maize: 30, beans: 90, tea: 50 },
    { name: 'Feb', maize: 32, beans: 95, tea: 52 },
    { name: 'Mar', maize: 28, beans: 85, tea: 48 },
    { name: 'Apr', maize: 31, beans: 100, tea: 55 },
    { name: 'May', maize: 35, beans: 110, tea: 60 },
    { name: 'Jun', maize: 33, beans: 105, tea: 58 },
  ]

  const recentActivities = [
    { id: 1, type: 'harvest', crop: 'Maize', farmer: 'John Doe', time: '2 hours ago', status: 'completed' },
    { id: 2, type: 'planting', crop: 'Beans', farmer: 'Jane Smith', time: '5 hours ago', status: 'in-progress' },
    { id: 3, type: 'irrigation', crop: 'Tea', farmer: 'Robert Johnson', time: '1 day ago', status: 'pending' },
    { id: 4, type: 'fertilizer', crop: 'Coffee', farmer: 'Emily Davis', time: '2 days ago', status: 'completed' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Welcome back, Admin
          </h1>
          <p className="text-muted-foreground">Here's what's happening with your farm data today</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button className="glass-button">
            <Plus className="mr-2 h-4 w-4" />
            Add Record
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="glass-card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <span className={cn(
                  stat.trend === 'up' ? 'text-emerald-500' : 
                  stat.trend === 'down' ? 'text-red-500' : 'text-amber-500',
                  'font-medium'
                )}>
                  {stat.change}
                </span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Market Prices (KES/kg)</CardTitle>
            <CardDescription>Average market prices for the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `KES ${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="maize" 
                    stroke="#0ea5e9" 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="beans" 
                    stroke="#8b5cf6" 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tea" 
                    stroke="#22c55e" 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Crop Distribution</CardTitle>
            <CardDescription>Percentage of crops grown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cropData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {cropData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <Legend 
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    formatter={(value, entry: any, index) => (
                      <span className="text-xs text-muted-foreground">
                        {value}: {cropData[index].value}%
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-7">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest farm activities and updates</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0 mr-4">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      {activity.type === 'harvest' ? (
                        <Sprout className="h-5 w-5" />
                      ) : activity.type === 'planting' ? (
                        <Droplet className="h-5 w-5" />
                      ) : activity.type === 'irrigation' ? (
                        <CloudRain className="h-5 w-5" />
                      ) : (
                        <Activity className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {activity.farmer} - {activity.crop}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {activity.type} • {activity.time}
                    </p>
                  </div>
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                    activity.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-amber-100 text-amber-800'
                  )}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
            <Users className="h-5 w-5 text-primary-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-slate-400">+12.3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Crops</CardTitle>
            <Sprout className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">256</div>
            <p className="text-xs text-slate-400">+5.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Prices</CardTitle>
            <LineChart className="h-5 w-5 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES 35.5</div>
            <p className="text-xs text-slate-400">+2.1% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-slate-400">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Farmers Overview</CardTitle>
            <CardDescription>Monthly farmer registration trend</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={farmerData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Crop Distribution</CardTitle>
            <CardDescription>By planted area (hectares)</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <div className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cropData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {cropData.map((entry: { name: string, value: number }, index: number) => {
                      const colors = Object.values(COLORS);
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Market Price Trends</CardTitle>
          <CardDescription>Average prices per kg (KES)</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="maize" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="beans" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="tea" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start glass-sm">
              <Plus className="mr-2 h-4 w-4" />
              Add New Farmer
            </Button>
            <Button variant="outline" className="w-full justify-start glass-sm">
              <Plus className="mr-2 h-4 w-4" />
              Record Crop Harvest
            </Button>
            <Button variant="outline" className="w-full justify-start glass-sm">
              <Plus className="mr-2 h-4 w-4" />
              Log Help Request
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest system events</CardDescription>
              </div>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-start space-x-4">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">New farmer registered: John Doe</p>
                    <p className="text-xs text-slate-400">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
