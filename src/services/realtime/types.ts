
export interface SyncData {
  products: any[];
  sales: any[];
  pretFamilles: any[];
  pretProduits: any[];
  depenses: any[];
  achats: any[];
  clients: any[];
  messages: any[];
  pointages?: any[];
  notes?: any[];
  taches?: any[];
  travailleurs?: any[];
  entreprises?: any[];
}

export interface SyncEvent {
  type: 'data-changed' | 'force-sync' | 'connected' | 'disconnected' | 'heartbeat';
  data?: {
    type: string;
    data: any;
  };
  timestamp: number;
}

export interface ConnectionConfig {
  reconnectInterval: number;
  maxReconnectAttempts: number;
  connectionTimeout: number;
  fallbackSyncInterval: number;
}
