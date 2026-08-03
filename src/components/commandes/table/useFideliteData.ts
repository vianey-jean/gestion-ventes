/**
 * useFideliteData — charge une seule fois la map de fidélité (fidelite.json)
 * et les paliers configurables (listes-fidelite.json), et se resynchronise
 * sur les évènements globaux 'sales-updated' / 'listes-fidelite-updated'.
 */
import { useEffect, useState, useCallback } from 'react';
import fideliteApiService, { FideliteEntry } from '@/services/api/fideliteApi';
import listesFideliteApi, { FideliteTierConfig, tierForCount } from '@/services/api/listesFideliteApi';

const norm = (s: string) => (s || '').trim().toLowerCase();

export interface FideliteInfo {
  count: number;
  label: string;
  grad: string;
  isNew: boolean;
}

export const useFideliteData = () => {
  const [map, setMap] = useState<Record<string, FideliteEntry>>({});
  const [tiers, setTiers] = useState<FideliteTierConfig[]>([]);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fideliteApiService.getAll().then((r) => { if (alive) setMap(r || {}); }).catch(() => {});
      listesFideliteApi.getAll().then((r) => { if (alive) setTiers(r || []); }).catch(() => {});
    };
    load();
    window.addEventListener('sales-updated', load);
    window.addEventListener('listes-fidelite-updated', load);
    return () => {
      alive = false;
      window.removeEventListener('sales-updated', load);
      window.removeEventListener('listes-fidelite-updated', load);
    };
  }, []);

  const getFidelite = useCallback((clientName: string): FideliteInfo | null => {
    const entry = map[norm(clientName)];
    const count = entry?.count ?? 0;
    const tier = tiers.length > 0 ? tierForCount(count, tiers) : null;
    if (!tier) return null;
    return {
      count,
      label: tier.label,
      grad: tier.grad || 'from-slate-500 to-slate-700',
      isNew: count === 0,
    };
  }, [map, tiers]);

  return { fideliteMap: map, tiers, getFidelite };
};

export default useFideliteData;
