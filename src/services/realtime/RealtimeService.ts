
import { api } from '@/services/api/api';
import { SyncData, SyncEvent, ConnectionConfig } from './types';
import { EventSourceManager } from './EventSourceManager';
import { DataCacheManager } from './DataCacheManager';

/**
 * RealtimeService — SSE Push Only
 * 
 * NO periodic polling. Data is pushed from the backend via SSE
 * the instant a file changes on disk. The frontend only syncs
 * when it receives an SSE event.
 */
class RealtimeService {
  private eventSourceManager: EventSourceManager;
  private dataCacheManager: DataCacheManager;
  private listeners: Set<(data: Partial<SyncData>) => void> = new Set();
  private syncListeners: Set<(event: SyncEvent) => void> = new Set();
  private lastSyncTime: Date = new Date();
  private isConnected: boolean = false;
  private activeConsumers: number = 0;

  private config: ConnectionConfig = {
    reconnectInterval: 2000,
    maxReconnectAttempts: 10,
    connectionTimeout: 5000,
    fallbackSyncInterval: 0 // Not used — no polling
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
      case 'nouvelle_achat':
        syncData = { achats: receivedData };
        break;
      case 'clients':
        syncData = { clients: receivedData };
        break;
      case 'messages':
        syncData = { messages: receivedData };
        break;
      case 'pointage':
        syncData = { pointages: receivedData };
        break;
      case 'notes':
        syncData = { notes: receivedData };
        break;
      case 'tache':
        syncData = { taches: receivedData };
        break;
      case 'travailleur':
        syncData = { travailleurs: receivedData };
        break;
      case 'entreprise':
        syncData = { entreprises: receivedData };
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

  // Public API
  connect(token?: string) {
    this.activeConsumers += 1;
    if (this.activeConsumers > 1) return;
    this.eventSourceManager.connect(token);
  }

  disconnect() {
    this.activeConsumers = Math.max(0, this.activeConsumers - 1);
    if (this.activeConsumers > 0) return;
    this.eventSourceManager.disconnect();
  }

  /**
   * Full data fetch — only called on force-sync or initial load,
   * NOT on a timer.
   */
  async syncCurrentMonthData(): Promise<SyncData | null> {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const results = await Promise.allSettled([
        api.get('/api/products'),
        api.get('/api/sales'),
        api.get('/api/pretfamilles'),
        api.get('/api/pretproduits'),
        api.get('/api/depenses/mouvements'),
        api.get(`/api/nouvelle-achat/monthly/${currentYear}/${currentMonth}`),
        api.get('/api/clients'),
        api.get('/api/messages')
      ]);

      const getData = (result: PromiseSettledResult<any>) =>
        result.status === 'fulfilled' ? result.value.data || [] : [];

      const syncData: SyncData = {
        products: getData(results[0]),
        sales: this.filterCurrentMonthSales(getData(results[1])),
        pretFamilles: getData(results[2]),
        pretProduits: getData(results[3]),
        depenses: getData(results[4]),
        achats: getData(results[5]),
        clients: getData(results[6]),
        messages: getData(results[7])
      };

      // Update cache
      Object.entries({
        products: syncData.products,
        sales: syncData.sales,
        pretfamilles: syncData.pretFamilles,
        pretproduits: syncData.pretProduits,
        depensedumois: syncData.depenses,
        nouvelle_achat: syncData.achats,
        clients: syncData.clients,
        messages: syncData.messages
      }).forEach(([key, val]) => this.dataCacheManager.updateCache(key, val));

      this.lastSyncTime = new Date();
      this.notifyListeners(syncData);
      return syncData;
    } catch (error) {
      console.error('Sync error:', error);
      return null;
    }
  }

  addDataListener(callback: (data: Partial<SyncData>) => void) {
    this.listeners.add(callback);
    return () => { this.listeners.delete(callback); };
  }

  addSyncListener(callback: (event: SyncEvent) => void) {
    this.syncListeners.add(callback);
    return () => { this.syncListeners.delete(callback); };
  }

  private notifyListeners(data: Partial<SyncData>) {
    this.listeners.forEach(cb => { try { cb(data); } catch {} });
  }

  private notifySyncListeners(event: SyncEvent) {
    this.syncListeners.forEach(cb => { try { cb(event); } catch {} });
  }

  getLastSyncTime(): Date { return this.lastSyncTime; }
  getConnectionStatus(): boolean { return this.eventSourceManager.getConnectionStatus(); }

  async forceSync(): Promise<void> {
    try {
      await api.post('/api/sync/force-sync');
    } catch {
      await this.syncCurrentMonthData();
    }
  }
}

export const realtimeService = new RealtimeService();
