/**
 * listesFideliteApi — CRUD des paliers de fidélité configurables.
 * Backend: server/db/listes-fidelite.json (via /api/listes-fidelite).
 */
import api from './api';

export interface FideliteTierConfig {
  id: string;
  label: string;
  min: number;
  max: number | null;
  order: number;
  grad: string;
}

const DEFAULTS: FideliteTierConfig[] = [
  { id: 'nouveau', label: 'Nouveau Client', min: 0, max: 0, order: 0, grad: 'from-slate-500 to-slate-700' },
  { id: 'standard', label: 'Client Standard', min: 1, max: 1, order: 1, grad: 'from-sky-500 to-blue-600' },
  { id: 'bon', label: 'Bon Client', min: 2, max: 2, order: 2, grad: 'from-emerald-500 to-teal-600' },
  { id: 'fidele', label: 'Client Fidèle', min: 3, max: 4, order: 3, grad: 'from-purple-500 via-fuchsia-500 to-pink-500' },
  { id: 'vip', label: 'Client VIP', min: 5, max: null, order: 4, grad: 'from-yellow-400 via-amber-500 to-orange-500' },
];

export const listesFideliteApi = {
  DEFAULTS,
  async getAll(): Promise<FideliteTierConfig[]> {
    try {
      const res = await api.get('/api/listes-fidelite');
      return Array.isArray(res.data) && res.data.length > 0 ? res.data : DEFAULTS;
    } catch { return DEFAULTS; }
  },
  async add(tier: Partial<FideliteTierConfig>): Promise<FideliteTierConfig[]> {
    const res = await api.post('/api/listes-fidelite', tier);
    return res.data;
  },
  async update(id: string, patch: Partial<FideliteTierConfig>): Promise<FideliteTierConfig[]> {
    const res = await api.put(`/api/listes-fidelite/${encodeURIComponent(id)}`, patch);
    return res.data;
  },
  async remove(id: string): Promise<FideliteTierConfig[]> {
    const res = await api.delete(`/api/listes-fidelite/${encodeURIComponent(id)}`);
    return res.data;
  },
};

/** Détermine le tier d'un client à partir de son nombre d'achats. */
export const tierForCount = (count: number, list: FideliteTierConfig[]): FideliteTierConfig => {
  const c = Number(count) || 0;
  const sorted = [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  for (const t of sorted) {
    const max = t.max === null || t.max === undefined ? Infinity : t.max;
    if (c >= t.min && c <= max) return t;
  }
  return sorted[0] || DEFAULTS[0];
};

export default listesFideliteApi;
