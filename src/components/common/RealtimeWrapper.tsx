
import React, { useEffect } from 'react';
import { useSSE } from '@/hooks/use-sse';
import { useApp } from '@/contexts/AppContext';
import { RealtimeStatus } from './RealtimeStatus';
import { useToast } from '@/hooks/use-toast';
import { realtimeService } from '@/services/realtimeService';

interface RealtimeWrapperProps {
  children: React.ReactNode;
  showStatus?: boolean;
}

export const RealtimeWrapper: React.FC<RealtimeWrapperProps> = ({ 
  children, 
  showStatus = true 
}) => {
  const { refreshData, setProducts, setSales } = useApp();
  const { toast } = useToast();
  const [lastSync, setLastSync] = React.useState<Date>(new Date());
  const [isConnected, setIsConnected] = React.useState<boolean>(false);
  const [lastEvent, setLastEvent] = React.useState<any>(null);

  useEffect(() => {
    console.log('🚀 RealtimeWrapper - Initialisation');
    
    // Connexion au service temps réel
    realtimeService.connect();
    
    // Écouter les changements de données
    const unsubscribeData = realtimeService.addDataListener((data) => {
      console.log('📊 Données reçues dans RealtimeWrapper:', data);
      
      // Mettre à jour les données selon le type
      if (data.products) {
        console.log('🛍️ Mise à jour des produits:', data.products);
        setProducts(data.products);
      }
      
      if (data.sales) {
        console.log('💰 Mise à jour des ventes:', data.sales);
        setSales(data.sales);
      }
      
      setLastSync(new Date());
      
      // Notification discrète
    
    });
    
    // Écouter les événements de sync
    const unsubscribeSync = realtimeService.addSyncListener((event) => {
      console.log('📡 Événement sync reçu:', event);
      setLastEvent(event.data);
      
      switch (event.type) {
        case 'connected':
          console.log('✅ Connexion SSE établie');
          setIsConnected(true);
          break;
          
        case 'data-changed':
          console.log('🔄 Données changées:', event.data);
          setLastSync(new Date());
          break;
          
        case 'force-sync':
          console.log('🚀 Synchronisation forcée');
          if (refreshData) {
            refreshData();
          }
          setLastSync(new Date());
          break;
      }
    });
    
    // Vérifier périodiquement le statut de connexion
    const statusInterval = setInterval(() => {
      const connected = realtimeService.getConnectionStatus();
      setIsConnected(connected);
    }, 5000);
    
    return () => {
      console.log('🔌 RealtimeWrapper - Nettoyage');
      unsubscribeData();
      unsubscribeSync();
      clearInterval(statusInterval);
      realtimeService.disconnect();
    };
  }, [refreshData, setProducts, setSales, toast]);

  return (
    <div className="relative">
      {showStatus && (
        <div className="fixed top-4 right-4 z-50">
          <RealtimeStatus 
            isConnected={isConnected} 
            lastSync={lastSync}
          />
        </div>
      )}
      {children}
    </div>
  );
};
