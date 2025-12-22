
import { SyncEvent, ConnectionConfig } from './types';

/**
 * EventSourceManager - Gestionnaire de synchronisation
 * SSE est désactivé pour éviter les problèmes CORS récurrents
 * Utilise uniquement le mode polling pour la synchronisation
 */
export class EventSourceManager {
  private isConnected: boolean = false;
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor(
    private config: ConnectionConfig,
    private onEvent: (event: SyncEvent) => void,
    private onConnectionChange: (connected: boolean) => void
  ) {
    // Mode polling uniquement - pas de SSE pour éviter les erreurs CORS
  }

  connect(token?: string) {
    // SSE désactivé - utiliser uniquement le mode polling
    // Cela évite toutes les erreurs CORS liées à EventSource
    console.log('📡 Mode polling activé (SSE désactivé pour éviter CORS)');
    
    // Simuler une connexion réussie pour déclencher le fallback polling
    this.isConnected = false;
    this.onConnectionChange(false);
    
    // Envoyer un événement de connexion pour indiquer que le système est prêt
    this.onEvent({
      type: 'connected',
      timestamp: Date.now()
    });
  }

  disconnect() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    this.isConnected = false;
    this.onConnectionChange(false);
  }

  getConnectionStatus(): boolean {
    // Retourner false pour utiliser le mode de synchronisation de secours (polling)
    return false;
  }
}
