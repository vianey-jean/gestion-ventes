
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
  private lastDataCache: Map<string, string> = new Map();

  constructor() {
    console.log('RealtimeService initialisé avec synchronisation optimisée');
    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      console.log('Connexion Internet rétablie, reconnexion SSE...');
      this.connect();
    });

    window.addEventListener('offline', () => {
      console.log('Connexion Internet perdue');
      this.disconnect();
    });
  }

  // Vérifier si les données ont réellement changé
  private hasDataChanged(dataType: string, newData: any): boolean {
    const dataString = JSON.stringify(newData);
    const lastData = this.lastDataCache.get(dataType);
    
    if (!lastData || lastData !== dataString) {
      this.lastDataCache.set(dataType, dataString);
      return true;
    }
    
    return false;
  }

  // Filtrer les ventes pour le mois en cours
  private filterCurrentMonthSales(sales: any[]) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });
  }

  // Connexion au serveur SSE optimisée
  connect(token?: string) {
    if (this.eventSource) {
      this.eventSource.close();
    }

    console.log('Connexion SSE optimisée...');

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL ;
      const url = `${baseUrl}/api/sync/events`;
      
      this.eventSource = new EventSource(url, {
        withCredentials: false
      });

      this.eventSource.onopen = () => {
        console.log('✅ Connexion SSE optimisée établie');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        this.notifySyncListeners({
          type: 'connected',
          timestamp: Date.now()
        });
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleSyncEvent('data-changed', data);
        } catch (error) {
          console.error('Erreur parsing SSE message:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('❌ Erreur SSE:', error);
        this.isConnected = false;
        
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          const delay = Math.min(this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts), 10000);
          setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`🔄 Reconnexion SSE ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            this.connect();
          }, delay);
        }
      };

      ['data-changed', 'force-sync', 'connected', 'heartbeat'].forEach(eventType => {
        this.eventSource?.addEventListener(eventType, (event: any) => {
          try {
            const data = JSON.parse(event.data);
            this.handleSyncEvent(eventType as any, data);
          } catch (error) {
            console.error(`Erreur parsing ${eventType}:`, error);
          }
        });
      });

    } catch (error) {
      console.error('Erreur création EventSource:', error);
      this.isConnected = false;
    }
  }

  // Déconnexion
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnected = false;
    console.log('🔌 Connexion SSE fermée');
  }

  // Gérer les événements de synchronisation avec vérification de changement
  private handleSyncEvent(type: SyncEvent['type'], data: any) {
    const event: SyncEvent = {
      type,
      data,
      timestamp: Date.now()
    };

    switch (type) {
      case 'data-changed':
        if (data && data.type && data.data) {
          // Vérifier si les données ont réellement changé
          if (this.hasDataChanged(data.type, data.data)) {
            console.log(`🔄 Changement réel détecté pour ${data.type} - Synchronisation`);
            this.lastSyncTime = new Date();
            this.processSyncData(data.type, data.data);
          } else {
            console.log(`⏭️ Pas de changement réel pour ${data.type} - Synchronisation ignorée`);
          }
        }
        break;
      
      case 'force-sync':
        this.lastSyncTime = new Date();
        this.syncCurrentMonthData();
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
        const currentMonthSales = this.filterCurrentMonthSales(receivedData);
        syncData = { sales: currentMonthSales };
        console.log(`✅ ${currentMonthSales.length} ventes synchronisées`);
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
      this.notifyListeners(syncData);
    }
  }

  // Synchroniser les données du mois en cours
  async syncCurrentMonthData(): Promise<SyncData | null> {
    try {
      console.log('🔄 Synchronisation initiale des données...');
      
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      const [products, sales, pretFamilles, pretProduits, depenses] = await Promise.all([
        api.get('/products').catch(() => ({ data: [] })),
        api.get(`/sales/by-month?month=${currentMonth}&year=${currentYear}`).catch(() => ({ data: [] })),
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

      // Mettre à jour le cache
      this.lastDataCache.set('products', JSON.stringify(products.data));
      this.lastDataCache.set('sales', JSON.stringify(sales.data));
      this.lastDataCache.set('pretfamilles', JSON.stringify(pretFamilles.data));
      this.lastDataCache.set('pretproduits', JSON.stringify(pretProduits.data));
      this.lastDataCache.set('depensedumois', JSON.stringify(depenses.data));

      this.lastSyncTime = new Date();
      this.notifyListeners(syncData);
      
      console.log(`✅ Synchronisation initiale terminée`);
      return syncData;
    } catch (error) {
      console.error('❌ Erreur de synchronisation:', error);
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
      await this.syncCurrentMonthData();
    }
  }
}

export const realtimeService = new RealtimeService();
