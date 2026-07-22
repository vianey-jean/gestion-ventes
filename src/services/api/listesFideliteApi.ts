/**
 * listesFideliteApi — CRUD des paliers de fidélité configurables.
 * Backend: server/db/listes-fidelite.json (via /api/listes-fidelite).
 *
 * ⚠️ Aucun palier n'est fourni par défaut côté front. Si la base de données
 * ne contient aucun palier, on renvoie une liste vide → aucun badge ni
 * classification de fidélité ne s'affiche.
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

export const listesFideliteApi = {
  async getAll(): Promise<FideliteTierConfig[]> {
    try {
      const res = await api.get('/api/listes-fidelite');
      return Array.isArray(res.data) ? res.data : [];
    } catch { return []; }
  },
  async add(tier: Partial<FideliteTierConfig>): Promise<FideliteTierConfig[]> {
    const res = await api.post('/api/listes-fidelite', tier);
    return Array.isArray(res.data) ? res.data : [];
  },
  async update(id: string, patch: Partial<FideliteTierConfig>): Promise<FideliteTierConfig[]> {
    const res = await api.put(`/api/listes-fidelite/${encodeURIComponent(id)}`, patch);
    return Array.isArray(res.data) ? res.data : [];
  },
  async remove(id: string): Promise<FideliteTierConfig[]> {
    const res = await api.delete(`/api/listes-fidelite/${encodeURIComponent(id)}`);
    return Array.isArray(res.data) ? res.data : [];
  },
};

/**
 * Détermine le tier d'un client à partir de son nombre d'achats.
 * Retourne null si aucun palier n'est configuré ou si aucun ne correspond.
 */
export const tierForCount = (count: number, list: FideliteTierConfig[]): FideliteTierConfig | null => {
  if (!Array.isArray(list) || list.length === 0) return null;
  const c = Number(count) || 0;
  const sorted = [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  for (const t of sorted) {
    const max = t.max === null || t.max === undefined ? Infinity : t.max;
    if (c >= t.min && c <= max) return t;
  }
  return null;
};

export default listesFideliteApi;
