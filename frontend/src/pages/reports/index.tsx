import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download, Calendar, Filter, BarChart2, LineChart, PieChart, FileText, ChevronDown } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts"
import { DateRange } from "react-day-picker"
import { format, subMonths } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type Report = {
  id: string
  title: string
  type: 'yield' | 'financial' | 'inventory' | 'crop_health' | 'other'
  date: string
  farm: string
  generatedBy: string
  status: 'generated' | 'pending' | 'failed'
  fileSize?: string
  url?: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const reportTypes = [
  { value: 'yield', label: 'Yield Reports' },
  { value: 'financial', label: 'Financial Reports' },
  { value: 'inventory', label: 'Inventory Reports' },
  { value: 'crop_health', label: 'Crop Health' },
  { value: 'other', label: 'Other Reports' },
]

// Mock data for reports list
const reports: Report[] = [
  {
    id: 'RPT-2023-11-001',
    title: 'Monthly Yield Report - October 2023',
    type: 'yield',
    date: '2023-11-01',
    farm: 'Main Farm',
    generatedBy: 'System',
    status: 'generated',
    fileSize: '2.4 MB',
    url: '#'
  },
  {
    id: 'RPT-2023-11-002',
    title: 'Q3 Financial Summary',
    type: 'financial',
    date: '2023-10-28',
    farm: 'All Farms',
    generatedBy: 'John Doe',
    status: 'generated',
    fileSize: '1.8 MB',
    url: '#'
  },
  {
    id: 'RPT-2023-10-015',
    title: 'Inventory Status - End of October',
    type: 'inventory',
    date: '2023-10-31',
    farm: 'Warehouse A',
    generatedBy: 'System',
    status: 'generated',
    fileSize: '0.9 MB',
    url: '#'
  },
  {
    id: 'RPT-2023-11-003',
    title: 'Crop Health Analysis - Week 44',
    type: 'crop_health',
    date: '2023-11-05',
    farm: 'North Field',
    generatedBy: 'Drone Scan',
    status: 'pending'
  },
  {
    id: 'RPT-2023-10-030',
    title: 'Soil Test Results - South Field',
    type: 'other',
    date: '2023-10-15',
    farm: 'South Field',
    generatedBy: 'Lab Analysis',
    status: 'generated',
    fileSize: '3.2 MB',
    url: '#'
  },
]

// Mock data for charts
const yieldData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
  { name: 'Jul', value: 3490 },
  { name: 'Aug', value: 4000 },
  { name: 'Sep', value: 4500 },
  { name: 'Oct', value: 5000 },
]

const cropDistributionData = [
  { name: 'Maize', value: 35 },
  { name: 'Beans', value: 25 },
  { name: 'Wheat', value: 20 },
  { name: 'Potatoes', value: 15 },
  { name: 'Other', value: 5 },
]

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 3),
    to: new Date(),
  })
  const [selectedType, setSelectedType] = useState<string>("all")
  
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.farm.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = selectedType === "all" || report.type === selectedType
    
    if (!dateRange?.from || !dateRange?.to) return matchesSearch && matchesType
    
    const reportDate = new Date(report.date)
    const isInDateRange = 
      reportDate >= dateRange.from! && 
      (dateRange.to ? reportDate <= dateRange.to : reportDate <= new Date())
    
    return matchesSearch && matchesType && isInDateRange
  })

  const getStatusBadge = (status: Report['status']) => {
    switch (status) {
      case 'generated':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Generated
        </span>
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending
        </span>
      case 'failed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Failed
        </span>
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {status}
        </span>
    }
  }

  const getReportIcon = (type: Report['type']) => {
    switch (type) {
      case 'yield':
        return <BarChart2 className="h-5 w-5 text-blue-500" />
      case 'financial':
        return <FileText className="h-5 w-5 text-green-500" />
      case 'inventory':
        return <FileText className="h-5 w-5 text-purple-500" />
      case 'crop_health':
        return <FileText className="h-5 w-5 text-red-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Access and generate farm reports and analytics
          </p>
        </div>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Generate New Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total Reports</h3>
              <p className="text-2xl font-bold">{reports.length}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">This Month</h3>
              <p className="text-2xl font-bold">
                {reports.filter(r => new Date(r.date).getMonth() === new Date().getMonth()).length}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
              <p className="text-2xl font-bold">
                {reports.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Storage Used</h3>
              <p className="text-2xl font-bold">8.3 MB</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <Download className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Yield Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yieldData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="Yield (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Crop Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={cropDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {cropDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-lg border bg-card">
        <div className="flex flex-col justify-between p-4 space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search reports..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedType("all")}>
                  All Report Types
                </DropdownMenuItem>
                {reportTypes.map((type) => (
                  <DropdownMenuItem 
                    key={type.value} 
                    onClick={() => setSelectedType(type.value)}
                  >
                    {type.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className="w-[240px] justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd, y')} -{' '}
                        {format(dateRange.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Report</TableHead>
                <TableHead>Farm</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Generated By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        {getReportIcon(report.type)}
                        <span>{report.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>{report.farm}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {report.type.replace('_', ' ').charAt(0).toUpperCase() + report.type.replace('_', ' ').slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                    <TableCell>{report.generatedBy}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-right">
                      {report.status === 'generated' ? (
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" className="h-8">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not available</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No reports found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
