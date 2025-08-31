import { io, Socket } from 'socket.io-client';
import { PriceAlert } from '@/pages/market-prices/components/PriceAlerts';

// Use Vite environment variable with fallback to current host for WebSocket
const WS_URL = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:8000/ws`;

class WebSocketService {
  private socket: Socket | null = null;
  private static instance: WebSocketService;
  private listeners: Map<string, (data: any) => void> = new Map();

  private constructor() {
    this.initializeSocket();
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  private initializeSocket() {
    this.socket = io(WS_URL, {
      path: '/ws',
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
      withCredentials: true,
      extraHeaders: {
        'Access-Control-Allow-Origin': window.location.origin,
        'Access-Control-Allow-Credentials': 'true'
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('priceUpdate', (data: any) => {
      this.notify('priceUpdate', data);
    });

    this.socket.on('alertTriggered', (alert: PriceAlert) => {
      this.notify('alertTriggered', alert);
    });
  }

  public subscribe(event: string, callback: (data: any) => void): () => void {
    this.listeners.set(event, callback);
    return () => this.unsubscribe(event);
  }

  private unsubscribe(event: string) {
    this.listeners.delete(event);
  }

  private notify(event: string, data: any) {
    const callback = this.listeners.get(event);
    if (callback) {
      callback(data);
    }
  }

  public connect() {
    if (!this.socket?.connected) {
      this.socket?.connect();
    }
  }

  public disconnect() {
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}

export const webSocketService = WebSocketService.getInstance();
