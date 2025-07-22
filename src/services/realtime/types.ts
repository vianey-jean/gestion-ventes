
export interface SyncData {
  products: any[];
  sales: any[];
  pretFamilles: any[];
  pretProduits: any[];
  depenses: any[];
}

export interface SyncEvent {
  type: 'data-changed' | 'force-sync' | 'connected' | 'heartbeat';
  data?: any;
  timestamp: number;
}

export interface ConnectionConfig {
  reconnectInterval: number;
  maxReconnectAttempts: number;
  connectionTimeout: number;
  fallbackSyncInterval: number;
}
