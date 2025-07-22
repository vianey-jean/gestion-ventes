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

  private handleConnectionChange(connected: boolean) {
    this.isConnected = connected;
    if (!connected) {
      this.startFallbackSync();
    }
  }

  private startFallbackSync() {
    const fallbackInterval = setInterval(async () => {
      if (!this.isConnected) {
        await this.syncCurrentMonthData();
      } else {
        clearInterval(fallbackInterval);
      }
    }, this.config.fallbackSyncInterval);
  }

  private handleSyncEvent(event: SyncEvent) {
    switch (event.type) {
      case 'data-changed':
        if (event.data && event.data.type && event.data.data) {
          if (this.dataCacheManager.hasDataChanged(event.data.type, event.data.data)) {
            this.lastSyncTime = new Date();
            this.processSyncData(event.data.type, event.data.data);
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

  private processSyncData(dataType: string, receivedData: any) {
    let syncData: Partial<SyncData> = {};

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
    }

    if (Object.keys(syncData).length > 0) {
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
    this.eventSourceManager.disconnect();
  }

  async syncCurrentMonthData(): Promise<SyncData | null> {
    try {
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
      this.dataCacheManager.updateCache('products', products.data);
      this.dataCacheManager.updateCache('sales', sales.data);
      this.dataCacheManager.updateCache('pretfamilles', pretFamilles.data);
      this.dataCacheManager.updateCache('pretproduits', pretProduits.data);
      this.dataCacheManager.updateCache('depensedumois', depenses.data);

      this.lastSyncTime = new Date();
      this.notifyListeners(syncData);
      
      return syncData;
    } catch (error) {
      return null;
    }
  }

  addDataListener(callback: (data: Partial<SyncData>) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  addSyncListener(callback: (event: SyncEvent) => void) {
    this.syncListeners.add(callback);
    return () => this.syncListeners.delete(callback);
  }

  private notifyListeners(data: Partial<SyncData>) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        // Erreur silencieuse
      }
    });
  }

  private notifySyncListeners(event: SyncEvent) {
    this.syncListeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        // Erreur silencieuse
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
      await api.post('/sync/force-sync');
    } catch (error) {
      await this.syncCurrentMonthData();
    }
  }
}

export const realtimeService = new RealtimeService();
