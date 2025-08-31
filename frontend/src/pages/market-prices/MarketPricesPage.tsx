import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { webSocketService } from '@/services/api/websocket.service';
import { PriceAlert } from './components/PriceAlerts';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Plus,
  FileText,
  BarChart2,
  AlertTriangle,
  BellRing
} from 'lucide-react';
import { marketPricesService, type MarketPrice } from '@/services/api/marketPrices.service';
import { PriceAlerts } from './components/PriceAlerts';

export { PriceAlerts };
import { format, subDays, parseISO } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const PriceChangeIndicator = ({ value }: { value: number }) => {
  if (value > 0) {
    return (
      <span className="text-green-500 flex items-center">
        <TrendingUp className="h-4 w-4 mr-1" />
        {value.toFixed(2)}%
      </span>
    );
  } else if (value < 0) {
    return (
      <span className="text-red-500 flex items-center">
        <TrendingDown className="h-4 w-4 mr-1" />
        {Math.abs(value).toFixed(2)}%
      </span>
    );
  }
  return (
    <span className="text-gray-500 flex items-center">
      <Minus className="h-4 w-4 mr-1" />
      {value.toFixed(2)}%
    </span>
  );
};

export default function MarketPricesPage() {
  const queryClient = useQueryClient();
  const isInitialMount = useRef(true);
  
  // Set up WebSocket subscriptions
  useEffect(() => {
    if (!isInitialMount.current) return;
    
    // Handle price updates
    const unsubscribePriceUpdate = webSocketService.subscribe('priceUpdate', (data) => {
      queryClient.setQueryData(['market-prices', 'current'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          prices: oldData.prices.map((price: any) => 
            price.id === data.id ? { ...price, ...data } : price
          )
        };
      });
    });
    
    // Handle alert triggers
    const unsubscribeAlertTriggered = webSocketService.subscribe('alertTriggered', (alert: PriceAlert) => {
      // Update the alerts list
      queryClient.setQueryData(['price-alerts'], (oldAlerts: PriceAlert[] = []) => {
        return oldAlerts.map(a => 
          a.id === alert.id ? { ...a, ...alert } : a
        );
      });
      
      // Show notification to user
      // Note: You'll need to implement a toast notification system
      console.log('Alert triggered:', alert);
    });
    
    isInitialMount.current = false;
    
    // Cleanup on unmount
    return () => {
      unsubscribePriceUpdate();
      unsubscribeAlertTriggered();
    };
  }, [queryClient]);
  const [selectedCommodity, setSelectedCommodity] = useState<string>('all');
  const [selectedMarket, setSelectedMarket] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('7d');
  const [markets, setMarkets] = useState<string[]>(['Nairobi', 'Mombasa', 'Kisumu', 'Eldoret', 'Nakuru']); // Default markets

  // Fetch commodities and markets for filter with WebSocket updates
  const { data: commodities = [], isLoading: isLoadingCommodities } = useQuery({
    queryKey: ['commodities'],
    queryFn: async () => {
      const data = await marketPricesService.getCommodities();
      // If the API returns markets, update the state
      if (data?.markets) {
        setMarkets(data.markets);
      }
      return data?.commodities || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });

  // Fetch market stats with WebSocket updates
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['market-stats'],
    queryFn: () => marketPricesService.getMarketStats(),
    refetchOnWindowFocus: false, // Prevent refetching on window focus
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch current market prices
  const { data: currentPrices, isLoading: isLoadingPrices } = useQuery({
    queryKey: ['market-prices', 'current'],
    queryFn: () => marketPricesService.getCurrentPrices({}),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    // Enable WebSocket updates for this query
    onSuccess: (data) => {
      // Initial data loaded, WebSocket will handle updates
    },
  });

  // Fetch market prices with filters
  const { 
    data: prices, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['market-prices', { 
      commodity: selectedCommodity, 
      market: selectedMarket,
      search: searchTerm,
      days: timeRange
    }],
    queryFn: () => 
      marketPricesService.getCurrentPrices({
        ...(selectedCommodity !== 'all' && { commodity: selectedCommodity }),
        ...(selectedMarket !== 'all' && { market: selectedMarket }),
        ...(searchTerm && { search: searchTerm }),
        ...(timeRange && { 
          startDate: format(subDays(new Date(), parseInt(timeRange)), 'yyyy-MM-dd'),
          endDate: format(new Date(), 'yyyy-MM-dd')
        })
      }),
  });

  // Fetch price trends with WebSocket updates
  const { data: trends = [], isLoading: isLoadingTrends } = useQuery({
    queryKey: ['price-trends', timeRange],
    queryFn: () => marketPricesService.getPriceTrends({
      days: parseInt(timeRange),
    }),
    refetchOnWindowFocus: false, // Prevent refetching on window focus
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Format data for charts
  const formatChartData = () => {
    if (!trends) return [];
    
    return trends.map(trend => ({
      name: trend.commodity,
      data: trend.data.map(item => ({
        date: format(parseISO(item.date), 'MMM d'),
        [trend.commodity]: item.price
      }))
    }));
  };

  // Export data to CSV
  const exportToCSV = () => {
    if (!prices || prices.length === 0) return;
    
    const headers = [
      'Commodity',
      'Market',
      'Price',
      'Currency',
      'Unit',
      '24h Change',
      '7d Change',
      'Last Updated'
    ];
    
    const csvContent = [
      headers.join(','),
      ...prices.map(price => [
        `"${price.commodity}${price.variety ? ` (${price.variety})` : ''}"`,
        `"${price.market}"`,
        price.price,
        `"${price.currency || 'USD'}"`,
        `"${price.unit}"`,
        price.change24h ?? '',
        price.change7d ?? '',
        `"${format(new Date(price.date), 'yyyy-MM-dd')}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `market-prices-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData = formatChartData();
  const showChart = chartData.length > 0 && !isLoading;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Market Prices</h1>
          <p className="text-muted-foreground">
            Track commodity prices and market trends
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search commodities..."
                  className="w-full pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select 
                value={selectedCommodity} 
                onValueChange={setSelectedCommodity}
                disabled={isLoading}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2 opacity-50" />
                  <SelectValue placeholder="Commodity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Commodities</SelectItem>
                  {commodities?.map((commodity) => (
                    <SelectItem key={commodity} value={commodity}>
                      {commodity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={selectedMarket} 
                onValueChange={setSelectedMarket}
                disabled={isLoading}
              >
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2 opacity-50" />
                  <SelectValue placeholder="Market" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Markets</SelectItem>
                  {markets?.map((market) => (
                    <SelectItem key={market} value={market}>
                      {market}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={timeRange} 
                onValueChange={setTimeRange}
                disabled={isLoading}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                  <SelectItem value="180">6 Months</SelectItem>
                  <SelectItem value="365">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Price Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Price Trends</CardTitle>
          <CardDescription>
            {selectedCommodity === 'all' 
              ? 'Average prices across all commodities' 
              : `Price trend for ${selectedCommodity}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-2 text-destructive" />
              <p>Failed to load price data</p>
              <Button 
                variant="ghost" 
                className="mt-2"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : showChart ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData[0]?.data || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value}`}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Price']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                {chartData.map((item, index) => (
                  <Line
                    key={item.name}
                    type="monotone"
                    dataKey={item.name}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No price data available for the selected filters
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Prices Table */}
      <Tabs defaultValue="prices" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid grid-cols-2 max-w-xs">
            <TabsTrigger value="prices">
              <BarChart2 className="h-4 w-4 mr-2" />
              Market Prices
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <BellRing className="h-4 w-4 mr-2" />
              Price Alerts
            </TabsTrigger>
          </TabsList>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportToCSV}
              disabled={!prices || prices.length === 0 || isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => document.getElementById('price-insights')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              View Insights
            </Button>
          </div>
        </div>

        <TabsContent value="prices" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Current Market Prices</CardTitle>
                  <CardDescription>
                    Latest prices for {selectedCommodity === 'all' ? 'all commodities' : selectedCommodity}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={exportToCSV}
                    disabled={!prices || prices.length === 0 || isLoading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mb-4 text-destructive" />
                  <p className="mb-4">Failed to load market prices</p>
                  <Button variant="outline" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              ) : prices && prices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Commodity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Market
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          24h Change
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          7d Change
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Updated
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {prices.map((price: MarketPrice) => (
                        <tr key={`${price.commodity}-${price.market}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium">
                                  {price.commodity.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {price.commodity}
                                  {price.variety && (
                                    <span className="text-xs text-gray-500 ml-1">({price.variety})</span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">{price.quality || 'Standard'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{price.market}</div>
                            <div className="text-xs text-gray-500">{price.source}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: price.currency || 'USD',
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              }).format(price.price)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {price.unit}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {price.change24h !== undefined ? (
                              <PriceChangeIndicator value={price.change24h} />
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {price.change7d !== undefined ? (
                              <PriceChangeIndicator value={price.change7d} />
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {format(new Date(price.date), 'MMM d, yyyy')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No price data available for the selected filters
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                <span className="font-medium">{prices?.length || 0}</span> results
              </div>
              <div className="space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={!prices || prices.length <= 10}>
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <PriceAlerts />
        </TabsContent>
      </Tabs>

      {/* Price Insights Section */}
      <div id="price-insights" className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center">
          <BarChart2 className="h-6 w-6 mr-2" />
          Price Insights & Analysis
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Top Performing Commodities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Gainers</CardTitle>
              <CardDescription>Biggest price increases (7d)</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : prices && prices.length > 0 ? (
                <div className="space-y-4">
                  {[...prices]
                    .filter(p => p.change7d && p.change7d > 0)
                    .sort((a, b) => (b.change7d || 0) - (a.change7d || 0))
                    .slice(0, 3)
                    .map((price) => (
                      <div key={`${price.commodity}-${price.market}`} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{price.commodity}</p>
                          <p className="text-sm text-muted-foreground">{price.market}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-500 font-medium">
                            +{price.change7d?.toFixed(2)}%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: price.currency || 'USD',
                            }).format(price.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  {prices.filter(p => p.change7d && p.change7d > 0).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No significant price increases in the last 7 days
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No price data available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Biggest Drops */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Biggest Drops</CardTitle>
              <CardDescription>Largest price decreases (7d)</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : prices && prices.length > 0 ? (
                <div className="space-y-4">
                  {[...prices]
                    .filter(p => p.change7d && p.change7d < 0)
                    .sort((a, b) => (a.change7d || 0) - (b.change7d || 0))
                    .slice(0, 3)
                    .map((price) => (
                      <div key={`${price.commodity}-${price.market}`} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{price.commodity}</p>
                          <p className="text-sm text-muted-foreground">{price.market}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-red-500 font-medium">
                            {price.change7d?.toFixed(2)}%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: price.currency || 'USD',
                            }).format(price.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  {prices.filter(p => p.change7d && p.change7d < 0).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No significant price drops in the last 7 days
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No price data available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Market Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Market Overview</CardTitle>
              <CardDescription>Key market statistics</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : prices && prices.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Total Commodities</p>
                    <p className="font-medium">
                      {new Set(prices.map(p => p.commodity)).size}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Markets Tracked</p>
                    <p className="font-medium">
                      {new Set(prices.map(p => p.market)).size}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No market data available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
