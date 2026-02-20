
import { useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';

interface RealtimeSyncOptions {
  enabled?: boolean;
  interval?: number;
  debounceMs?: number;
}

// Variable globale pour bloquer la synchronisation pendant la saisie de formulaire
let globalFormProtection = false;
let formProtectionTimeout: NodeJS.Timeout | null = null;

export const setFormProtection = (active: boolean) => {
  globalFormProtection = active;
  
  // Clear any existing timeout
  if (formProtectionTimeout) {
    clearTimeout(formProtectionTimeout);
    formProtectionTimeout = null;
  }
  
  // Si on active la protection, on la désactive automatiquement après 2 heures max
  // pour éviter des blocages infinis
  if (active) {
    formProtectionTimeout = setTimeout(() => {
      globalFormProtection = false;
    }, 2 * 60 * 60 * 1000); // 2 heures
  }
};

export const isFormProtected = () => globalFormProtection;

export const useRealtimeSync = (options: RealtimeSyncOptions = {}) => {
  const { enabled = true, interval = 5000, debounceMs = 1000 } = options;
  const { refreshData } = useApp();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<number>(0);
  const isActiveRef = useRef<boolean>(true);

  // Fonction de synchronisation avec debounce - VÉRIFIE la protection formulaire
  const debouncedSync = useCallback(async () => {
    // NE PAS synchroniser si un formulaire est actif
    if (globalFormProtection) {
      return;
    }
    
    if (!enabled || !refreshData || !isActiveRef.current) return;

    // Annuler le précédent timeout si il existe
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      // Double vérification avant la sync
      if (globalFormProtection) {
        return;
      }
      
      try {
        const now = Date.now();
        // Éviter les appels trop fréquents
        if (now - lastSyncRef.current < debounceMs) return;
        
        lastSyncRef.current = now;
        await refreshData();
      } catch {
        // Sync error handled silently
      }
    }, debounceMs);
  }, [enabled, refreshData, debounceMs]);

  // Fonction de synchronisation forcée - VÉRIFIE aussi la protection
  const forceSync = useCallback(async () => {
    // NE PAS synchroniser si un formulaire est actif
    if (globalFormProtection) {
      return;
    }
    
    if (!refreshData) return;
    
    try {
      await refreshData();
      lastSyncRef.current = Date.now();
    } catch {
      // Force sync error handled silently
    }
  }, [refreshData]);

  // Détecter si l'onglet est actif
  useEffect(() => {
    const handleVisibilityChange = () => {
      isActiveRef.current = !document.hidden;
      
      // Synchroniser immédiatement quand l'onglet redevient actif
      // SAUF si un formulaire est actif
      if (!document.hidden && enabled && !globalFormProtection) {
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

    // Synchronisation initiale seulement si pas de formulaire actif
    if (!globalFormProtection) {
      forceSync();
    }

    // Synchronisation périodique seulement si l'onglet est actif ET pas de formulaire actif
    intervalRef.current = setInterval(() => {
      if (isActiveRef.current && !globalFormProtection) {
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

  return { forceSync, setFormProtection, isFormProtected };
};
