
import { useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';

interface RealtimeSyncOptions {
  enabled?: boolean;
  interval?: number;
  debounceMs?: number;
}

export const useRealtimeSync = (options: RealtimeSyncOptions = {}) => {
  const { enabled = true, interval = 5000, debounceMs = 1000 } = options;
  const { refreshData } = useApp();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<number>(0);
  const isActiveRef = useRef<boolean>(true);

  // Fonction de synchronisation avec debounce
  const debouncedSync = useCallback(async () => {
    if (!enabled || !refreshData || !isActiveRef.current) return;

    // Annuler le précédent timeout si il existe
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const now = Date.now();
        // Éviter les appels trop fréquents
        if (now - lastSyncRef.current < debounceMs) return;
        
        lastSyncRef.current = now;
        await refreshData();
        console.log('Synchronisation automatique effectuée');
      } catch (error) {
        console.error('Erreur lors de la synchronisation:', error);
      }
    }, debounceMs);
  }, [enabled, refreshData, debounceMs]);

  // Fonction de synchronisation forcée
  const forceSync = useCallback(async () => {
    if (!refreshData) return;
    
    try {
      await refreshData();
      lastSyncRef.current = Date.now();
      console.log('Synchronisation forcée effectuée');
    } catch (error) {
      console.error('Erreur lors de la synchronisation forcée:', error);
    }
  }, [refreshData]);

  // Détecter si l'onglet est actif
  useEffect(() => {
    const handleVisibilityChange = () => {
      isActiveRef.current = !document.hidden;
      
      // Synchroniser immédiatement quand l'onglet redevient actif
      if (!document.hidden && enabled) {
        forceSync();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, forceSync]);

  useEffect(() => {
    if (!enabled || !refreshData) return;

    // Synchronisation initiale
    forceSync();

    // Synchronisation périodique seulement si l'onglet est actif
    intervalRef.current = setInterval(() => {
      if (isActiveRef.current) {
        debouncedSync();
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [enabled, interval, refreshData, debouncedSync, forceSync]);

  return { forceSync };
};
