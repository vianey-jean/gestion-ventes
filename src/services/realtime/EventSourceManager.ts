
import { SyncEvent, ConnectionConfig } from './types';

export class EventSourceManager {
  private eventSource: EventSource | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;

  constructor(
    private config: ConnectionConfig,
    private onEvent: (event: SyncEvent) => void,
    private onConnectionChange: (connected: boolean) => void
  ) {
    this.setupBrowserListeners();
  }

  private setupBrowserListeners() {
    window.addEventListener('online', () => {
      this.connect();
    });

    window.addEventListener('offline', () => {
      this.disconnect();
    });

    window.addEventListener('beforeunload', () => {
      this.disconnect();
    });
  }

  connect(token?: string) {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.clearConnectionTimeout();

    // Vérifier si le navigateur supporte EventSource et si on n'est pas en mode développement
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // En mode développement, désactiver SSE car CORS pose problème
    // Utiliser uniquement le mode fallback polling
    if (isDev) {
      console.log('🔧 Mode développement détecté - SSE désactivé, utilisation du polling');
      this.handleConnectionError();
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';
      const url = `${baseUrl}/api/sync/events`;
      
      this.eventSource = new EventSource(url);

      this.setupConnectionTimeout();
      this.setupEventListeners();

    } catch (error) {
      // Gérer silencieusement pour éviter le spam console
      this.handleConnectionError();
    }
  }

  private setupConnectionTimeout() {
    this.connectionTimeout = setTimeout(() => {
      if (!this.isConnected) {
        this.handleConnectionError();
      }
    }, this.config.connectionTimeout);
  }

  private setupEventListeners() {
    if (!this.eventSource) return;

    this.eventSource.onopen = () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.clearConnectionTimeout();
      this.onConnectionChange(true);
      
      this.onEvent({
        type: 'connected',
        timestamp: Date.now()
      });
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onEvent({
          type: 'data-changed',
          data,
          timestamp: Date.now()
        });
      } catch (error) {
        // Erreur silencieuse
      }
    };

    this.eventSource.onerror = (error) => {
      this.handleConnectionError();
    };

    // Écouter les événements personnalisés
    ['data-changed', 'force-sync', 'connected', 'heartbeat'].forEach(eventType => {
      this.eventSource?.addEventListener(eventType, (event: any) => {
        try {
          const data = JSON.parse(event.data);
          this.onEvent({
            type: eventType as any,
            data,
            timestamp: Date.now()
          });
        } catch (error) {
          // Erreur silencieuse
        }
      });
    });
  }

  private handleConnectionError() {
    this.isConnected = false;
    this.onConnectionChange(false);
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    this.clearConnectionTimeout();
    
    // Limiter les tentatives de reconnexion pour éviter le spam
    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      const delay = Math.min(
        this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts), 
        60000 // Maximum 1 minute
      );
      
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, delay);
    }
  }

  private clearConnectionTimeout() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }

  disconnect() {
    this.clearConnectionTimeout();
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    this.isConnected = false;
    this.onConnectionChange(false);
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}
