/**
 * fideliteApi — Récupération des données de fidélité client depuis fidelite.json.
 * Fallback: si l'endpoint /api/fidelite n'est pas disponible (ancien serveur),
 * les données sont calculées côté client à partir de /api/sales.
 *
 * ⚠️ Aucun palier par défaut n'est codé en dur. Les libellés/tiers proviennent
 * exclusivement de listes-fidelite.json (via listesFideliteApi). Si aucun palier
 * n'est configuré, les entrées renvoyées ont tier='' et tierLabel=''.
 */
import api from './api';

export interface FideliteSaleEntry {
  id: string;
  date: string;
  amount: number;
  profit: number;
  products?: any[];
  clientAddress?: string;
  clientPhone?: string;
  clientVille?: string;
  isRefund?: boolean;
}

export interface FideliteEntry {
  name: string;
  count: number;
  totalAmount: number;
  sales: FideliteSaleEntry[];
  tier: string;
  tierLabel: string;
}

const norm = (s: string) => (s || '').trim().toLowerCase();

let _salesCache: { at: number; data: any[] } | null = null;
const getSales = async (): Promise<any[]> => {
  const now = Date.now();
  if (_salesCache && now - _salesCache.at < 15000) return _salesCache.data;
  try {
    const res = await api.get('/api/sales');
    const data = Array.isArray(res.data) ? res.data : [];
    _salesCache = { at: now, data };
    return data;
  } catch {
    return _salesCache?.data || [];
  }
};

const buildFromSales = (sales: any[]): Record<string, FideliteEntry> => {
  const map: Record<string, FideliteEntry> = {};
  sales.forEach((s: any) => {
    const name = (s.clientName || '').trim();
    if (!name) return;
    const key = norm(name);
    if (!map[key]) {
      map[key] = { name, count: 0, totalAmount: 0, sales: [], tier: '', tierLabel: '' };
    }
    const amount = Number(s.totalSellingPrice ?? s.sellingPrice ?? 0) || 0;
    map[key].count += 1;
    map[key].totalAmount += amount;
    map[key].sales.push({
      id: s.id,
      date: s.date,
      amount,
      profit: Number(s.totalProfit ?? s.profit ?? 0) || 0,
      products: s.products || (s.description ? [{
        description: s.description,
        quantitySold: s.quantitySold,
        sellingPrice: s.sellingPrice,
        purchasePrice: s.purchasePrice,
      }] : []),
      clientAddress: s.clientAddress,
      clientPhone: s.clientPhone,
      clientVille: s.clientVille,
      isRefund: s.isRefund || false,
    });
  });
  Object.values(map).forEach((e) => {
    e.sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });
  return map;
};

const emptyEntry = (name: string): FideliteEntry => ({
  name, count: 0, totalAmount: 0, sales: [],
  tier: '', tierLabel: '',
});

/**
 * Cache partagé de la map complète : évite d'ouvrir une requête HTTP par
 * client (des centaines d'appels simultanés faisaient tomber le serveur).
 */
let _mapCache: { at: number; data: Record<string, FideliteEntry> } | null = null;
let _mapInFlight: Promise<Record<string, FideliteEntry>> | null = null;

const loadMap = async (force = false): Promise<Record<string, FideliteEntry>> => {
  const now = Date.now();
  if (!force && _mapCache && now - _mapCache.at < 15000) return _mapCache.data;
  if (!force && _mapInFlight) return _mapInFlight;

  _mapInFlight = (async () => {
    let data: Record<string, FideliteEntry> | null = null;
    try {
      const res = await api.get('/api/fidelite');
      const d = res.data;
      if (d && typeof d === 'object' && !Array.isArray(d) && Object.keys(d).length > 0) {
        data = d as Record<string, FideliteEntry>;
      }
    } catch { /* fallback ventes */ }
    if (!data) data = buildFromSales(await getSales());
    _mapCache = { at: Date.now(), data };
    return data;
  })().finally(() => { _mapInFlight = null; });

  return _mapInFlight;
};

export const fideliteApiService = {
  async getAll(): Promise<Record<string, FideliteEntry>> {
    return loadMap();
  },
  async getByName(name: string): Promise<FideliteEntry> {
    const all = await loadMap();
    return all[norm(name)] || emptyEntry(name);
  },
  async rebuild(): Promise<void> {
    try { await api.post('/api/fidelite/rebuild'); } catch { /* ignore if unavailable */ }
    _salesCache = null;
    _mapCache = null;
    await loadMap(true).catch(() => undefined);
  },
};

export default fideliteApiService;
