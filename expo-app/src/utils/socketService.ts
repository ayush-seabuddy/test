import Constants from 'expo-constants';
import { io, Socket } from 'socket.io-client';
import { Logger } from "@/src/utils/logger";

// Type-safe extra config
type ExtraConfig = {
  EXPO_PUBLIC_SOCKET_URL?: string;
  env?: string;
};

// Safely access extra with fallback
const extra = Constants.expoConfig?.extra as ExtraConfig | undefined;

// const SOCKET_URL =
//   extra?.EXPO_PUBLIC_SOCKET_URL || 'https://api-canary.seabuddy.co';

const SOCKET_URL = 'https://api.seabuddy.co';

type SocketEvent = string;
type SocketData = any;
type SocketCallback = (data: any) => void;

class WSService {
  private socket: Socket | null = null;
  initializeSocket = async (): Promise<void> => {
    try {
      // Prevent multiple initializations
      if (this.socket?.connected || this.socket?.id) {
        console.log('Socket already connected or initialized:', this.socket.id);
        Logger.info('Socket already connected or initialized', { SocketId: String(this.socket.id) });
        return;
      }

      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('=== Socket Connected === Socket ID:', this.socket?.id);
        Logger.info('Socket connected', { SocketId: String(this.socket?.id) });
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket Disconnected:', reason);
        Logger.info('Socket Disconnected', { reason });
      });

      this.socket.on('connect_error', (error) => {
        console.log('Socket Connection Error:', error);
        Logger.error('Socket Connection Error', { error: String(error) });
      });
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      Logger.error('Failed to initialize socket', { error: String(error) });
    }
  };

  isConnected = (): boolean => {
    const connected = !!(this.socket && this.socket.connected);
    console.log('Socket connection status:', connected, 'ID:', this.socket?.id);
    Logger.info('Socket connection status', { connected: String(connected), SocketId: String(this.socket?.id) });
    return connected;
  };

  emit = (event: SocketEvent, data: SocketData = {}): void => {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.error('Socket not connected. Cannot emit event:', event);
      Logger.error('Socket not connected. Cannot emit event', { event });
    }
  };

  on = (event: SocketEvent, callback: SocketCallback): void => {
    if (this.socket) {
      console.log('Registering listener for event:', event);
      Logger.info('Registering listener for event', { event });
      this.socket.on(event, callback);
    } else {
      console.error(
        'Socket not initialized. Cannot register listener for:',
        event,
      );
      Logger.error('Socket not initialized. Cannot register listener for', { event });
    }
  };

  off = (event: SocketEvent, callback?: SocketCallback): void => {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
      console.log('Removed listener for event:', event);
      Logger.info('Removed listener for event', { event });
    }
  };

  removeAllListeners = (event?: SocketEvent): void => {
    if (this.socket) {
      if (event) {
        this.socket.removeAllListeners(event);
      } else {
        this.socket.removeAllListeners();
      }
    }
  };

  disconnect = (): void => {
    if (this.socket) {
      console.log('Manually disconnecting socket...');
      Logger.info('Manually disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
    }
  };
  getSocket = (): Socket | null => {
    return this.socket;
  };
}
const socketService = new WSService();

export default socketService;
