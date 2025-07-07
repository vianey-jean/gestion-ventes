import { api } from '@/service/api';

export interface SyncData {
  products: any[];
  sales: any[];
  pretFamilles: any[];
  pretProduits: any[];
  depenses: any[];
}

interface SyncEvent {
  type: 'data-changed' | 'force-sync' | 'connected' | 'heartbeat';
  data?: any;
  timestamp: number;
}

class RealtimeService {
  private eventSource: EventSource | null = null;
  private listeners: Set<(data: Partial<SyncData>) => void> = new Set();
  private syncListeners: Set<(event: SyncEvent) => void> = new Set();
  private lastSyncTime: Date = new Date();
  private isConnected: boolean = false;
  private reconnectInterval: number = 2000;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    console.log('RealtimeService initialisé');
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Écouter les changements de connectivité
    window.addEventListener('online', () => {
      console.log('Connexion Internet rétablie, reconnexion SSE...');
      this.connect();
    });

    window.addEventListener('offline', () => {
      console.log('Connexion Internet perdue');
      this.disconnect();
    });
  }

  // Connexion au serveur SSE avec gestion CORS améliorée
  connect(token?: string) {
    if (this.eventSource) {
      this.eventSource.close();
    }

    console.log('Tentative de connexion SSE...');

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'https://server-gestion-ventes.onrender.com';
      const url = `${baseUrl}/api/sync/events`;
      
      console.log('URL SSE:', url);
      
      // Configuration EventSource avec headers CORS
      this.eventSource = new EventSource(url, {
        withCredentials: true
      });

      this.eventSource.onopen = () => {
        console.log('✅ Connexion SSE établie');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        
        this.notifySyncListeners({
          type: 'connected',
          timestamp: Date.now()
        });
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Message SSE reçu:', data);
          this.handleSyncEvent('data-changed', data);
        } catch (error) {
          console.error('Erreur parsing SSE message:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('❌ Erreur SSE:', error);
        this.isConnected = false;
        this.stopHeartbeat();
        
        // Fermer la connexion actuelle
        if (this.eventSource) {
          this.eventSource.close();
        }
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          const delay = Math.min(this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts), 30000);
          setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`🔄 Tentative de reconnexion SSE ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            this.connect();
          }, delay);
        } else {
          console.error('🚫 Nombre maximum de tentatives de reconnexion atteint');
          // Fallback: synchronisation périodique
          this.fallbackToPolling();
        }
      };

      // Écouter les événements personnalisés
      ['data-changed', 'force-sync', 'connected', 'heartbeat'].forEach(eventType => {
        this.eventSource?.addEventListener(eventType, (event: any) => {
          try {
            const data = JSON.parse(event.data);
            console.log(`📡 Événement SSE ${eventType} reçu:`, data);
            this.handleSyncEvent(eventType as any, data);
          } catch (error) {
            console.error(`Erreur parsing ${eventType}:`, error);
          }
        });
      });

    } catch (error) {
      console.error('Erreur création EventSource:', error);
      this.isConnected = false;
      this.fallbackToPolling();
    }
  }

  // Fallback en cas d'échec SSE
  private fallbackToPolling() {
    console.log('🔄 Fallback vers polling périodique');
    setInterval(async () => {
      try {
        await this.syncAllData();
      } catch (error) {
        console.error('Erreur polling:', error);
      }
    }, 10000); // Poll toutes les 10 secondes
  }

  // Déconnexion
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnected = false;
    this.stopHeartbeat();
    console.log('🔌 Connexion SSE fermée');
  }

  // Heartbeat pour maintenir la connexion
  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.notifySyncListeners({
          type: 'heartbeat',
          timestamp: Date.now()
        });
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Gérer les événements de synchronisation
  private handleSyncEvent(type: SyncEvent['type'], data: any) {
    const event: SyncEvent = {
      type,
      data,
      timestamp: Date.now()
    };

    console.log(`🎯 Événement SSE traité:`, event);

    switch (type) {
      case 'data-changed':
        this.lastSyncTime = new Date();
        
        // Traiter les données reçues
        if (data && data.type && data.data) {
          this.processSyncData(data.type, data.data);
        }
        break;
      
      case 'force-sync':
        this.lastSyncTime = new Date();
        this.syncAllData();
        break;
    }

    this.notifySyncListeners(event);
  }

  // Traiter les données de synchronisation
  private processSyncData(dataType: string, receivedData: any) {
    console.log(`📊 Traitement des données ${dataType}:`, receivedData);
    
    let syncData: Partial<SyncData> = {};

    switch (dataType) {
      case 'products':
        syncData = { products: receivedData };
        break;
      
      case 'sales':
        syncData = { sales: receivedData };
        break;
      
      case 'pretfamilles':
        syncData = { pretFamilles: receivedData };
        break;
      
      case 'pretproduits':
        syncData = { pretProduits: receivedData };
        break;
        
      case 'depensedumois':
        syncData = { depenses: receivedData };
        break;
    }

    if (Object.keys(syncData).length > 0) {
      console.log(`✅ Données ${dataType} synchronisées:`, syncData);
      this.notifyListeners(syncData);
    }
  }

  // Synchroniser toutes les données
  async syncAllData(): Promise<SyncData | null> {
    try {
      console.log('🔄 Synchronisation complète des données...');
      
      const [products, sales, pretFamilles, pretProduits, depenses] = await Promise.all([
        api.get('/products').catch(() => ({ data: [] })),
        api.get('/sales').catch(() => ({ data: [] })),
        api.get('/pretfamilles').catch(() => ({ data: [] })),
        api.get('/pretproduits').catch(() => ({ data: [] })),
        api.get('/depenses/mouvements').catch(() => ({ data: [] }))
      ]);

      const syncData: SyncData = {
        products: products.data,
        sales: sales.data,
        pretFamilles: pretFamilles.data,
        pretProduits: pretProduits.data,
        depenses: depenses.data
      };

      this.lastSyncTime = new Date();
      this.notifyListeners(syncData);
      
      console.log('✅ Synchronisation complète terminée:', syncData);
      return syncData;
    } catch (error) {
      console.error('❌ Erreur de synchronisation complète:', error);
      return null;
    }
  }

  // Ajouter un listener pour les changements de données
  addDataListener(callback: (data: Partial<SyncData>) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Ajouter un listener pour les événements de sync
  addSyncListener(callback: (event: SyncEvent) => void) {
    this.syncListeners.add(callback);
    return () => this.syncListeners.delete(callback);
  }

  // Notifier tous les listeners de données
  private notifyListeners(data: Partial<SyncData>) {
    console.log(`📣 Notification à ${this.listeners.size} listeners:`, data);
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Erreur dans listener de données:', error);
      }
    });
  }

  // Notifier tous les listeners d'événements
  private notifySyncListeners(event: SyncEvent) {
    this.syncListeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Erreur dans listener d\'événement:', error);
      }
    });
  }

  // Getters
  getLastSyncTime(): Date {
    return this.lastSyncTime;
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Forcer une synchronisation
  async forceSync(): Promise<void> {
    try {
      console.log('🚀 Force sync demandée');
      await api.post('/sync/force-sync');
    } catch (error) {
      console.error('Erreur force sync:', error);
      // Fallback: sync local
      await this.syncAllData();
    }
  }
}

export const realtimeService = new RealtimeService();
