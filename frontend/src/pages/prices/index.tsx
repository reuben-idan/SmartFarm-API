import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Download, ArrowUpDown, Calendar as CalendarIcon } from "lucide-react"
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { DateRange } from "react-day-picker"
import { format, subMonths } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type PriceData = {
  date: string
  commodity: string
  market: string
  minPrice: number
  maxPrice: number
  avgPrice: number
  unit: string
}

export default function MarketPricesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [timeRange, setTimeRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 3),
    to: new Date(),
  })
  const [selectedCommodity, setSelectedCommodity] = useState<string>("all")
  
  // Mock data - replace with API call in production
  const priceData: PriceData[] = [
    { date: "2023-10-01", commodity: "Maize", market: "Nairobi", minPrice: 2500, maxPrice: 2800, avgPrice: 2650, unit: "KSh/90kg" },
    { date: "2023-10-08", commodity: "Maize", market: "Nairobi", minPrice: 2550, maxPrice: 2850, avgPrice: 2700, unit: "KSh/90kg" },
    { date: "2023-10-15", commodity: "Maize", market: "Nairobi", minPrice: 2600, maxPrice: 2900, avgPrice: 2750, unit: "KSh/90kg" },
    { date: "2023-10-22", commodity: "Maize", market: "Nairobi", minPrice: 2700, maxPrice: 3000, avgPrice: 2850, unit: "KSh/90kg" },
    { date: "2023-10-29", commodity: "Maize", market: "Nairobi", minPrice: 2800, maxPrice: 3100, avgPrice: 2950, unit: "KSh/90kg" },
    { date: "2023-10-01", commodity: "Beans", market: "Nairobi", minPrice: 8000, maxPrice: 8500, avgPrice: 8250, unit: "KSh/90kg" },
    { date: "2023-10-08", commodity: "Beans", market: "Nairobi", minPrice: 8100, maxPrice: 8600, avgPrice: 8350, unit: "KSh/90kg" },
    { date: "2023-10-15", commodity: "Beans", market: "Nairobi", minPrice: 8200, maxPrice: 8700, avgPrice: 8450, unit: "KSh/90kg" },
    { date: "2023-10-22", commodity: "Beans", market: "Nairobi", minPrice: 8300, maxPrice: 8800, avgPrice: 8550, unit: "KSh/90kg" },
    { date: "2023-10-29", commodity: "Beans", market: "Nairobi", minPrice: 8400, maxPrice: 8900, avgPrice: 8650, unit: "KSh/90kg" },
  ]

  const commodities = [...new Set(priceData.map(item => item.commodity))]
  const markets = [...new Set(priceData.map(item => item.market))]

  const filteredData = priceData.filter(item => {
    const matchesSearch = 
      item.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.market.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCommodity = selectedCommodity === "all" || item.commodity === selectedCommodity
    
    if (!timeRange?.from || !timeRange?.to) return matchesSearch && matchesCommodity
    
    const itemDate = new Date(item.date)
    const isInDateRange = 
      itemDate >= timeRange.from! && 
      (timeRange.to ? itemDate <= timeRange.to : itemDate <= new Date())
    
    return matchesSearch && matchesCommodity && isInDateRange
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0
    }).format(value)
  }

  // Prepare data for charts
  const chartData = filteredData.reduce((acc, item) => {
    const existingItem = acc.find(i => i.date === item.date && i.commodity === item.commodity)
    if (existingItem) {
      return acc
    }
    return [...acc, item]
  }, [] as PriceData[]).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Market Prices</h1>
          <p className="text-muted-foreground">
            Track and analyze commodity prices across different markets
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Total Commodities</h3>
          <p className="text-2xl font-bold">{commodities.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Markets Tracked</h3>
          <p className="text-2xl font-bold">{markets.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Price Updates</h3>
          <p className="text-2xl font-bold">{priceData.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
          <p className="text-2xl font-bold">{format(new Date(), 'MMM d, yyyy')}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex flex-col justify-between p-4 space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search commodities or markets..."
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
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Commodity</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedCommodity("all")}>
                  All Commodities
                </DropdownMenuItem>
                {commodities.map((commodity) => (
                  <DropdownMenuItem 
                    key={commodity} 
                    onClick={() => setSelectedCommodity(commodity)}
                  >
                    {commodity}
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
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {timeRange?.from ? (
                    timeRange.to ? (
                      <>
                        {format(timeRange.from, 'LLL dd, y')} -{' '}
                        {format(timeRange.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(timeRange.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={timeRange?.from}
                  selected={timeRange}
                  onSelect={setTimeRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="p-4">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(new Date(value), 'MMM d')} 
                />
                <YAxis 
                  tickFormatter={(value) => `KSh ${value}`}
                  width={80}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value} KSh`, 'Price']}
                  labelFormatter={(label) => `Date: ${format(new Date(label), 'PPP')}`}
                />
                <Legend />
                {commodities.map((commodity) => (
                  <Line
                    key={commodity}
                    type="monotone"
                    dataKey="avgPrice"
                    name={commodity}
                    data={chartData.filter(item => item.commodity === commodity)}
                    stroke={
                      commodity === 'Maize' ? '#8884d8' : 
                      commodity === 'Beans' ? '#82ca9d' : '#ffc658'
                    }
                    activeDot={{ r: 8 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 border-t">
          <h3 className="text-lg font-semibold mb-4">Latest Price Data</h3>
          <div className="rounded-md border
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Commodity</TableHead>
                  <TableHead>Market</TableHead>
                  <TableHead className="text-right">Min Price</TableHead>
                  <TableHead className="text-right">Max Price</TableHead>
                  <TableHead className="text-right">Avg Price</TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  [...filteredData]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
                    .map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{format(new Date(item.date), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="font-medium">{item.commodity}</TableCell>
                        <TableCell>{item.market}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.minPrice)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.maxPrice)}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(item.avgPrice)}
                        </TableCell>
                        <TableCell>{item.unit}</TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No price data found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
