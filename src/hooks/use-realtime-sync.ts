import { useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';

interface RealtimeSyncOptions {
  enabled?: boolean;
}

/**
 * useRealtimeSync — NO polling
 *
 * Synchronisation is fully driven by SSE push from the backend.
 * This hook only provides a manual `forceSync` escape-hatch and
 * a one-time sync when the tab becomes visible after being hidden.
 */

// Form protection helpers (unchanged API)
let globalFormProtection = false;
let formProtectionTimeout: ReturnType<typeof setTimeout> | null = null;

export const setFormProtection = (active: boolean) => {
  globalFormProtection = active;
  if (formProtectionTimeout) {
    clearTimeout(formProtectionTimeout);
    formProtectionTimeout = null;
  }
  if (active) {
    formProtectionTimeout = setTimeout(() => {
      globalFormProtection = false;
    }, 2 * 60 * 60 * 1000);
  }
};

export const isFormProtected = () => globalFormProtection;

export const useRealtimeSync = (options: RealtimeSyncOptions = {}) => {
  const { enabled = true } = options;
  const { refreshData } = useApp();
  const isActiveRef = useRef<boolean>(true);

  const forceSync = useCallback(async () => {
    if (globalFormProtection || !refreshData) return;
    try {
      await refreshData();
    } catch (error) {
      console.error('Force sync error:', error);
    }
  }, [refreshData]);

  // Sync once when tab regains focus
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      isActiveRef.current = !document.hidden;
      if (!document.hidden && !globalFormProtection) {
        forceSync();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, forceSync]);

  return { forceSync, setFormProtection, isFormProtected };
};
