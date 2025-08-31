import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  marketPricesService, 
  MarketPrice, 
  MarketPriceFilter,
  MarketPriceHistory
} from '@/services/api/marketPrices.service';
import { toast } from 'sonner';

const MARKET_PRICES_QUERY_KEY = 'market-prices';
const PRICE_HISTORY_QUERY_KEY = 'price-history';
const PRICE_ALERTS_QUERY_KEY = 'price-alerts';

export const useMarketPrices = (params?: MarketPriceFilter) => {
  return useQuery({
    queryKey: [MARKET_PRICES_QUERY_KEY, params],
    queryFn: () => marketPricesService.getCurrentPrices(params),
    keepPreviousData: true,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const usePriceHistory = (
  commodity: string, 
  params?: {
    market?: string;
    startDate?: string;
    endDate?: string;
    interval?: 'day' | 'week' | 'month';
  }
) => {
  return useQuery<MarketPriceHistory[]>({
    queryKey: [PRICE_HISTORY_QUERY_KEY, commodity, params],
    queryFn: () => marketPricesService.getPriceHistory(commodity, params),
    enabled: !!commodity,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const usePriceTrends = (params?: {
  commodities?: string[];
  days?: number;
  markets?: string[];
}) => {
  return useQuery({
    queryKey: ['price-trends', params],
    queryFn: () => marketPricesService.getPriceTrends(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const usePriceAlerts = () => {
  return useQuery({
    queryKey: [PRICE_ALERTS_QUERY_KEY],
    queryFn: () => marketPricesService.getPriceAlerts(),
  });
};

export const useCreatePriceAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      commodity: string;
      condition: 'above' | 'below' | 'change';
      value: number;
      isActive?: boolean;
    }) => marketPricesService.createPriceAlert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRICE_ALERTS_QUERY_KEY] });
      toast.success('Price alert created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create price alert: ${error.message}`);
    },
  });
};

export const useUpdatePriceAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      condition?: 'above' | 'below' | 'change';
      value?: number;
      isActive?: boolean;
    }) => marketPricesService.updatePriceAlert(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRICE_ALERTS_QUERY_KEY] });
      toast.success('Price alert updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update price alert: ${error.message}`);
    },
  });
};

export const useDeletePriceAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => marketPricesService.deletePriceAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRICE_ALERTS_QUERY_KEY] });
      toast.success('Price alert deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete price alert: ${error.message}`);
    },
  });
};

export const useMarketStats = () => {
  return useQuery({
    queryKey: ['market-stats'],
    queryFn: () => marketPricesService.getMarketStats(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useCommodities = () => {
  return useQuery({
    queryKey: ['commodities'],
    queryFn: () => marketPricesService.getCommodities(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export const useMarkets = () => {
  return useQuery({
    queryKey: ['markets'],
    queryFn: () => marketPricesService.getMarkets(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};
