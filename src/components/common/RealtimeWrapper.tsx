
import React, { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { RealtimeStatus } from './RealtimeStatus';
import { realtimeService } from '@/services/realtimeService';

interface RealtimeWrapperProps {
  children: React.ReactNode;
  showStatus?: boolean;
}

/**
 * RealtimeWrapper — SSE Push Only
 * 
 * Connects to SSE on mount. When the backend pushes data,
 * it updates the app state immediately. No periodic polling.
 */
export const RealtimeWrapper: React.FC<RealtimeWrapperProps> = ({ 
  children, 
  showStatus = true 
}) => {
  const { refreshData, setProducts, setSales } = useApp();
  const [lastSync, setLastSync] = React.useState<Date>(new Date());
  const [isConnected, setIsConnected] = React.useState<boolean>(false);

  useEffect(() => {
    realtimeService.connect();

    const unsubscribeData = realtimeService.addDataListener((data) => {
      if (data.products) setProducts(data.products);
      if (data.sales) setSales(data.sales);

      // For other data types, trigger a global refresh
      if (data.depenses || data.clients || data.messages || data.pretFamilles || data.pretProduits) {
        refreshData?.();
      }

      setLastSync(new Date());
    });

    const unsubscribeSyncEvents = realtimeService.addSyncListener((event) => {
      switch (event.type) {
        case 'connected':
          setIsConnected(true);
          break;
        case 'force-sync':
          refreshData?.();
          setLastSync(new Date());
          break;
      }
    });

    return () => {
      unsubscribeData();
      unsubscribeSyncEvents();
      realtimeService.disconnect();
    };
  }, [refreshData, setProducts, setSales]);

  return (
    <div className="relative">
      {showStatus && (
        <div className="fixed top-4 right-4 z-50">
          <RealtimeStatus isConnected={isConnected} lastSync={lastSync} />
        </div>
      )}
      {children}
    </div>
  );
};
