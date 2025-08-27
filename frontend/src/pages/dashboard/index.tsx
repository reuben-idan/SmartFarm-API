import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Sprout, LineChart, Plus, AlertTriangle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

export function DashboardPage() {
  // Sample data for charts
  const farmerData = [
    { name: 'Jan', count: 20 },
    { name: 'Feb', count: 45 },
    { name: 'Mar', count: 28 },
    { name: 'Apr', count: 80 },
    { name: 'May', count: 99 },
    { name: 'Jun', count: 43 },
  ]

  const cropData = [
    { name: 'Maize', value: 35 },
    { name: 'Beans', value: 25 },
    { name: 'Tea', value: 20 },
    { name: 'Coffee', value: 15 },
    { name: 'Other', value: 5 },
  ]

  const priceData = [
    { name: 'Jan', maize: 30, beans: 90, tea: 50 },
    { name: 'Feb', maize: 32, beans: 95, tea: 52 },
    { name: 'Mar', maize: 28, beans: 85, tea: 48 },
    { name: 'Apr', maize: 31, beans: 100, tea: 55 },
    { name: 'May', maize: 35, beans: 110, tea: 60 },
    { name: 'Jun', maize: 33, beans: 105, tea: 58 },
  ]

  const COLORS = ['#0ea5e9', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back, Admin</h2>
          <p className="text-slate-400">Here's what's happening with your farm data today</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="glass">
            <Plus className="mr-2 h-4 w-4" />
            Add Record
          </Button>
        </div>
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
                    {cropData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
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
