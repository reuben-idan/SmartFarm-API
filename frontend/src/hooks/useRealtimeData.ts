import { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { toast } from 'sonner';

interface RealtimeData<T> {
  data: T;
  error: Error | null;
  isLoading: boolean;
}

export function useRealtimeData<T>(event: string, initialData: T): RealtimeData<T> {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isConnected, subscribe, unsubscribe, sendMessage } = useWebSocket();

  // Handle incoming data
  const handleData = useCallback((newData: T) => {
    setData(newData);
    setIsLoading(false);
    setError(null);
  }, []);

  // Handle errors
  const handleError = useCallback((err: Error) => {
    console.error(`Error receiving ${event}:`, err);
    setError(err);
    setIsLoading(false);
    toast.error(`Failed to load ${event} data`);
  }, [event]);

  useEffect(() => {
    if (!isConnected) return;

    // Subscribe to the event
    subscribe(event, handleData);
    
    // Request initial data if needed
    sendMessage({
      type: `get-${event}`,
      data: {}
    });

    // Cleanup
    return () => {
      unsubscribe(event);
    };
  }, [isConnected, event, handleData, subscribe, unsubscribe, sendMessage]);

  return { data, isLoading, error };
}
