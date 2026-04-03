import { SyncEvent, ConnectionConfig } from './types';
import { getBaseURL } from '@/services/api/api';

/**
 * EventSourceManager - SSE Push Mode
 * Receives data changes from the backend via Server-Sent Events.
 * No polling — the backend pushes data instantly when a file changes.
 */
export class EventSourceManager {
  private eventSource: EventSource | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalDisconnect: boolean = false;

  constructor(
    private config: ConnectionConfig,
    private onEvent: (event: SyncEvent) => void,
    private onConnectionChange: (connected: boolean) => void
  ) {}

  connect(_token?: string) {
    // Clean up any existing connection
    this.disconnect();
    this.intentionalDisconnect = false;

    const baseURL = getBaseURL();
    const sseUrl = `${baseURL}/api/sync/events`;

    try {
      this.eventSource = new EventSource(sseUrl, { withCredentials: false });

      this.eventSource.addEventListener('connected', () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.onConnectionChange(true);
        this.onEvent({ type: 'connected', timestamp: Date.now() });
      });

      this.eventSource.addEventListener('data-changed', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          this.onEvent({
            type: 'data-changed',
            data: { type: payload.type, data: payload.data },
            timestamp: Date.now()
          });
        } catch {
          // Ignore malformed events
        }
      });

      this.eventSource.addEventListener('force-sync', () => {
        this.onEvent({ type: 'force-sync', timestamp: Date.now() });
      });

      this.eventSource.addEventListener('heartbeat', () => {
        // Keep-alive, nothing to do
      });

      this.eventSource.addEventListener('auto-backup-state', () => {
        // Handled elsewhere if needed
      });

      this.eventSource.onerror = () => {
        this.isConnected = false;
        this.onConnectionChange(false);

        // Close broken connection before reconnecting
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }

        // Don't reconnect if disconnect was intentional (logout)
        if (!this.intentionalDisconnect) {
          this.scheduleReconnect();
        }
      };
    } catch {
      if (!this.intentionalDisconnect) {
        this.scheduleReconnect();
      }
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    if (this.intentionalDisconnect) return;
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.warn('SSE: max reconnect attempts reached, giving up');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.config.reconnectInterval * this.reconnectAttempts, 30000);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.intentionalDisconnect) {
        this.connect();
      }
    }, delay);
  }

  disconnect() {
    this.intentionalDisconnect = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.onConnectionChange(false);
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}
