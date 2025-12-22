
import { api } from '@/service/api';
import { SyncData, SyncEvent, ConnectionConfig } from './types';
import { EventSourceManager } from './EventSourceManager';
import { DataCacheManager } from './DataCacheManager';

class RealtimeService {
  private eventSourceManager: EventSourceManager;
  private dataCacheManager: DataCacheManager;
  private listeners: Set<(data: Partial<SyncData>) => void> = new Set();
  private syncListeners: Set<(event: SyncEvent) => void> = new Set();
  private lastSyncTime: Date = new Date();
  private isConnected: boolean = false;

  private config: ConnectionConfig = {
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
    connectionTimeout: 10000,
    fallbackSyncInterval: 30000
  };

  constructor() {
    this.dataCacheManager = new DataCacheManager();
    this.eventSourceManager = new EventSourceManager(
      this.config,
      this.handleSyncEvent.bind(this),
      this.handleConnectionChange.bind(this)
    );
  }

  private fallbackInterval: NodeJS.Timeout | null = null;

  private handleConnectionChange(connected: boolean) {
    this.isConnected = connected;
    
    // Démarrer le polling si non connecté
    if (!connected && !this.fallbackInterval) {
      this.startFallbackSync();
    }
  }

  private startFallbackSync() {
    // Éviter les intervalles multiples
    if (this.fallbackInterval) {
      return;
    }
    
    // Sync initial silencieux
    this.syncCurrentMonthData();
    
    // Polling périodique silencieux
    this.fallbackInterval = setInterval(async () => {
      await this.syncCurrentMonthData();
    }, this.config.fallbackSyncInterval);
  }

  private handleSyncEvent(event: SyncEvent) {
    console.log('📡 Événement de sync reçu:', event);
    
    switch (event.type) {
      case 'data-changed':
        if (event.data && event.data.type && event.data.data) {
          console.log(`📊 Changement de données détecté pour: ${event.data.type}`);
          
          if (this.dataCacheManager.hasDataChanged(event.data.type, event.data.data)) {
            this.lastSyncTime = new Date();
            this.processSyncData(event.data.type, event.data.data);
          } else {
            console.log('📊 Données identiques, pas de mise à jour nécessaire');
          }
        }
        break;
      
      case 'force-sync':
        console.log('🚀 Force sync demandé');
        this.lastSyncTime = new Date();
        this.syncCurrentMonthData();
        break;
    }

    this.notifySyncListeners(event);
  }

  private processSyncData(dataType: string, receivedData: any) {
    let syncData: Partial<SyncData> = {};

    console.log(`🔄 Traitement des données de type: ${dataType}`, receivedData);

    switch (dataType) {
      case 'products':
        syncData = { products: receivedData };
        break;
      
      case 'sales':
        const currentMonthSales = this.filterCurrentMonthSales(receivedData);
        syncData = { sales: currentMonthSales };
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

      case 'clients':
        console.log('👥 Mise à jour des clients:', receivedData);
        syncData = { clients: receivedData };
        break;

      case 'messages':
        console.log('💬 Mise à jour des messages:', receivedData);
        syncData = { messages: receivedData };
        break;
    }

    if (Object.keys(syncData).length > 0) {
      console.log('📤 Notification aux listeners:', syncData);
      this.notifyListeners(syncData);
    }
  }

  private filterCurrentMonthSales(sales: any[]) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });
  }

  // Public API methods
  connect(token?: string) {
    this.eventSourceManager.connect(token);
  }

  disconnect() {
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
    this.eventSourceManager.disconnect();
  }

  async syncCurrentMonthData(): Promise<SyncData | null> {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      const [products, sales, pretFamilles, pretProduits, depenses, clients, messages] = await Promise.all([
        api.get('/api/products').catch(() => ({ data: [] })),
        api.get(`/api/sales/by-month?month=${currentMonth}&year=${currentYear}`).catch(() => ({ data: [] })),
        api.get('/api/pretfamilles').catch(() => ({ data: [] })),
        api.get('/api/pretproduits').catch(() => ({ data: [] })),
        api.get('/api/depenses/mouvements').catch(() => ({ data: [] })),
        api.get('/api/clients').catch(() => ({ data: [] })),
        api.get('/api/messages').catch(() => ({ data: [] }))
      ]).catch(() => [{ data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }]);

      const syncData: SyncData = {
        products: products.data || [],
        sales: sales.data || [],
        pretFamilles: pretFamilles.data || [],
        pretProduits: pretProduits.data || [],
        depenses: depenses.data || [],
        clients: clients.data || [],
        messages: messages.data || []
      };

      // Mettre à jour le cache
      this.dataCacheManager.updateCache('products', products.data);
      this.dataCacheManager.updateCache('sales', sales.data);
      this.dataCacheManager.updateCache('pretfamilles', pretFamilles.data);
      this.dataCacheManager.updateCache('pretproduits', pretProduits.data);
      this.dataCacheManager.updateCache('depensedumois', depenses.data);
      this.dataCacheManager.updateCache('clients', clients.data);
      this.dataCacheManager.updateCache('messages', messages.data);

      this.lastSyncTime = new Date();
      this.notifyListeners(syncData);
      
      return syncData;
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error);
      return null;
    }
  }

  addDataListener(callback: (data: Partial<SyncData>) => void) {
    console.log('📡 Ajout d\'un listener de données');
    this.listeners.add(callback);
    return () => {
      console.log('📡 Suppression d\'un listener de données');
      this.listeners.delete(callback);
    };
  }

  addSyncListener(callback: (event: SyncEvent) => void) {
    console.log('📡 Ajout d\'un listener de sync');
    this.syncListeners.add(callback);
    return () => {
      console.log('📡 Suppression d\'un listener de sync');
      this.syncListeners.delete(callback);
    };
  }

  private notifyListeners(data: Partial<SyncData>) {
    console.log(`📤 Notification de ${this.listeners.size} listeners`, data);
    
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('❌ Erreur dans un listener:', error);
      }
    });
  }

  private notifySyncListeners(event: SyncEvent) {
    console.log(`📤 Notification de ${this.syncListeners.size} listeners de sync`, event);
    
    this.syncListeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('❌ Erreur dans un listener de sync:', error);
      }
    });
  }

  getLastSyncTime(): Date {
    return this.lastSyncTime;
  }

  getConnectionStatus(): boolean {
    return this.eventSourceManager.getConnectionStatus();
  }

  async forceSync(): Promise<void> {
    try {
      console.log('🚀 Force sync demandé via API');
      await api.post('/api/sync/force-sync');
    } catch (error) {
      console.error('❌ Erreur lors du force sync, fallback vers sync local');
      await this.syncCurrentMonthData();
    }
  }
}

export const realtimeService = new RealtimeService();
