/**
 * fideliteApi — Récupération des données de fidélité client depuis fidelite.json.
 * Fallback: si l'endpoint /api/fidelite n'est pas disponible (ancien serveur),
 * les données sont calculées côté client à partir de /api/sales.
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
  tier: 'nouveau' | 'standard' | 'bon' | 'fidele' | 'vip';
  tierLabel: string;
}

const norm = (s: string) => (s || '').trim().toLowerCase();

const tierOf = (count: number): FideliteEntry['tier'] => {
  if (count >= 5) return 'vip';
  if (count >= 3) return 'fidele';
  if (count === 2) return 'bon';
  if (count === 1) return 'standard';
  return 'nouveau';
};
const tierLabelOf = (count: number) => ({
  nouveau: 'Nouveau Client',
  standard: 'Client Standard',
  bon: 'Bon Client',
  fidele: 'Client Fidèle',
  vip: 'Client VIP',
}[tierOf(count)]);

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
      map[key] = { name, count: 0, totalAmount: 0, sales: [], tier: 'nouveau', tierLabel: 'Nouveau Client' };
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
    e.tier = tierOf(e.count);
    e.tierLabel = tierLabelOf(e.count);
    e.sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });
  return map;
};

const emptyEntry = (name: string): FideliteEntry => ({
  name, count: 0, totalAmount: 0, sales: [],
  tier: 'nouveau', tierLabel: 'Nouveau Client',
});

export const fideliteApiService = {
  async getAll(): Promise<Record<string, FideliteEntry>> {
    try {
      const res = await api.get('/api/fidelite');
      const data = res.data;
      if (data && typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length > 0) {
        return data;
      }
    } catch { /* fallback below */ }
    const sales = await getSales();
    return buildFromSales(sales);
  },
  async getByName(name: string): Promise<FideliteEntry> {
    try {
      const res = await api.get(`/api/fidelite/${encodeURIComponent(name)}`);
      const d = res.data;
      if (d && typeof d === 'object' && d.name) return d;
    } catch { /* fallback below */ }
    const sales = await getSales();
    const all = buildFromSales(sales);
    return all[norm(name)] || emptyEntry(name);
  },
  async rebuild(): Promise<void> {
    try { await api.post('/api/fidelite/rebuild'); } catch { /* ignore if unavailable */ }
    _salesCache = null;
  },
};

export default fideliteApiService;
