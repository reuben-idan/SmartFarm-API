import { apiClient } from './baseClient';

export interface MarketPrice {
  id: string;
  commodity: string;
  variety?: string;
  unit: string;
  price: number;
  market: string;
  date: string;
  source: string;
  quality?: string;
  minPrice?: number;
  maxPrice?: number;
  change24h?: number;
  change7d?: number;
  volume?: number;
  currency: string;
  createdAt: string;
}

export interface MarketPriceHistory {
  date: string;
  price: number;
  volume?: number;
}

export interface MarketPriceFilter {
  commodity?: string;
  market?: string;
  startDate?: string;
  endDate?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'date' | 'price' | 'market' | 'commodity';
  order?: 'asc' | 'desc';
  limit?: number;
}

export const marketPricesService = {
  // Get current market prices with filtering
  async getCurrentPrices(params?: MarketPriceFilter) {
    return apiClient.get<MarketPrice[]>('/market-prices/current', { params });
  },

  // Get historical price data for a specific commodity
  async getPriceHistory(
    commodity: string,
    params?: {
      market?: string;
      startDate?: string;
      endDate?: string;
      interval?: 'day' | 'week' | 'month';
    }
  ) {
    return apiClient.get<MarketPriceHistory[]>(`/market-prices/history/${commodity}`, { params });
  },

  // Get price trends
  async getPriceTrends(params?: {
    commodities?: string[];
    days?: number;
    markets?: string[];
  }) {
    return apiClient.get<{
      commodity: string;
      data: Array<{ date: string; price: number }>;
      currentPrice: number;
      change24h: number;
      change7d: number;
    }[]>('/market-prices/trends', { 
      params: { 
        ...params, 
        commodities: params?.commodities?.join(',') 
      } 
    });
  },

  // Get price alerts
  async getPriceAlerts() {
    return apiClient.get<Array<{
      id: string;
      commodity: string;
      condition: 'above' | 'below' | 'change';
      value: number;
      isActive: boolean;
      lastTriggered?: string;
    }>>('/market-prices/alerts');
  },

  // Create a price alert
  async createPriceAlert(data: {
    commodity: string;
    condition: 'above' | 'below' | 'change';
    value: number;
    isActive?: boolean;
  }) {
    return apiClient.post('/market-prices/alerts', data);
  },

  // Update a price alert
  async updatePriceAlert(id: string, data: {
    condition?: 'above' | 'below' | 'change';
    value?: number;
    isActive?: boolean;
  }) {
    return apiClient.put(`/market-prices/alerts/${id}`, data);
  },

  // Delete a price alert
  async deletePriceAlert(id: string) {
    return apiClient.delete(`/market-prices/alerts/${id}`);
  },

  // Get market statistics
  async getMarketStats() {
    return apiClient.get<{
      totalCommodities: number;
      totalMarkets: number;
      priceChanges: Array<{
        commodity: string;
        currentPrice: number;
        change24h: number;
        change7d: number;
      }>;
      topGainers: Array<{
        commodity: string;
        change: number;
        currentPrice: number;
      }>;
      topLosers: Array<{
        commodity: string;
        change: number;
        currentPrice: number;
      }>;
    }>('/market-prices/stats');
  },

  // Get available commodities and markets
  async getCommodities() {
    const [commodities, markets] = await Promise.all([
      apiClient.get<string[]>('/market-prices/commodities'),
      apiClient.get<string[]>('/market-prices/markets')
    ]);
    return {
      commodities,
      markets
    };
  },

  // Get available markets
  async getMarkets() {
    return apiClient.get<string[]>('/market-prices/markets');
  },
};
