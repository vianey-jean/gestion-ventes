import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Loader2, ArrowLeft, ExternalLink, Calendar, User, Phone, MapPin, Package, Sparkles, ArrowUpDown } from 'lucide-react';
import { saleApiService } from '@/services/api';
import type { Sale } from '@/types/sale';
import PremiumLoading from '@/components/ui/premium-loading';
import ProductClassificationFilterModal from '@/components/products/attributes/ProductClassificationFilterModal';
import type { ClassificationValue, ProductCategory } from '@/components/products/attributes/ProductClassificationSelector';
import { cn } from '@/lib/utils';

interface SearchSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CategoryKey = 'tous' | 'perruques' | 'tissages' | 'extension' | 'autres';

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: 'tous', label: 'Tous' },
  { key: 'perruques', label: 'Perruques' },
  { key: 'tissages', label: 'Tissages' },
  { key: 'extension', label: 'Extension' },
  { key: 'autres', label: 'Autres' },
];

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const norm = (v: unknown) =>
  String(v ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const categoryOf = (description: string): CategoryKey => {
  const d = norm(description);
  if (d.includes('perruque')) return 'perruques';
  if (d.includes('tissage')) return 'tissages';
  if (d.includes('extension')) return 'extension';
  return 'autres';
};

const saleDescriptions = (sale: Sale): string[] => {
  if (sale.products && sale.products.length > 0) {
    return sale.products.map((p) => p.description || '');
  }
  return [sale.description || ''];
};

const fmt = (n?: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(n || 0));

const fmtDate = (d: string) => {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
};

const SearchSalesModal: React.FC<SearchSalesModalProps> = ({ isOpen, onClose }) => {
  const [allSales, setAllSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [year, setYear] = useState<string>('all');
  const [category, setCategory] = useState<CategoryKey>('tous');
  const [selected, setSelected] = useState<Sale | null>(null);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filtre par attributs (modèle / couleur / taille / devant…)
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<ProductCategory>('Perruque');
  const [classification, setClassification] = useState<ClassificationValue | null>(null);
  const [refining, setRefining] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let alive = true;
    setLoading(true);
    saleApiService
      .getAll()
      .then((data) => {
        if (alive) setAllSales(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (alive) setAllSales([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setYear('all');
      setCategory('tous');
      setSelected(null);
      setSortOrder('desc');
      setClassification(null);
      setFilterOpen(false);
      setRefining(false);
    }
  }, [isOpen]);

  /** Termes d'attributs sélectionnés dans la modale de filtre. */
  const attrTerms = useMemo(() => {
    if (!classification) return [] as string[];
    const raw = [
      classification.modele,
      classification.couleur,
      classification.taille,
      classification.devant,
      classification.autres,
      ...Object.values(classification.extras || {}),
    ];
    return raw
      .flatMap((v) => String(v ?? '').split(/[,+/]/))
      .map((v) => norm(v).trim())
      .filter(Boolean);
  }, [classification]);

  /** Petite phase de chargement premium à chaque changement de filtre. */
  useEffect(() => {
    if (!isOpen) return;
    setRefining(true);
    const t = setTimeout(() => setRefining(false), 550);
    return () => clearTimeout(t);
  }, [isOpen, classification, category, query, year]);

  const years = useMemo(() => {
    const set = new Set<number>();
    allSales.forEach((s) => {
      const y = new Date(s.date).getFullYear();
      if (!isNaN(y)) set.add(y);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [allSales]);

  const hasQuery = norm(query.trim()).length >= 3;
  const hasAttrFilter = attrTerms.length > 0;

  const results = useMemo(() => {
    const q = norm(query.trim());
    // On affiche les résultats dès qu'on a soit une recherche texte, soit un filtre attributs.
    if (!hasQuery && !hasAttrFilter) return [];
    return allSales
      .filter((s) => {
        if (year !== 'all' && new Date(s.date).getFullYear() !== Number(year)) return false;
        const descs = saleDescriptions(s);
        if (category !== 'tous' && !descs.some((d) => categoryOf(d) === category)) return false;
        if (hasAttrFilter) {
          const ok = descs.some((d) => {
            const nd = norm(d);
            return attrTerms.every((t) => nd.includes(t));
          });
          if (!ok) return false;
        }
        if (hasQuery) {
          const haystack = [
            ...descs,
            s.clientName,
            s.clientPhone,
            s.clientAddress,
            s.clientVille,
          ]
            .map(norm)
            .join(' | ');
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
        return sortOrder === 'desc' ? diff : -diff;
      })
      .slice(0, 100);
  }, [allSales, query, year, category, sortOrder, attrTerms, hasQuery, hasAttrFilter]);

  const goToSale = (sale: Sale) => {
    const dt = new Date(sale.date);
    const payload = {
      saleId: sale.id,
      month: dt.getMonth() + 1,
      year: dt.getFullYear(),
      clientName: sale.clientName,
      ts: Date.now(),
    };
    try {
      sessionStorage.setItem('fideliteSaleNav', JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent('fidelite-sale-nav', { detail: payload }));
    } catch {}
    onClose();
  };

  const totals = (s: Sale) => {
    if (s.products && s.products.length > 0) {
      return {
        selling: s.totalSellingPrice ?? s.products.reduce((a, p) => a + p.sellingPrice * p.quantitySold, 0),
        purchase: s.totalPurchasePrice ?? s.products.reduce((a, p) => a + p.purchasePrice * p.quantitySold, 0),
        profit: s.totalProfit ?? s.products.reduce((a, p) => a + p.profit, 0),
        qty: s.products.reduce((a, p) => a + p.quantitySold, 0),
        delivery: s.totalDeliveryFee ?? 0,
      };
    }
    return {
      selling: s.sellingPrice || 0,
      purchase: s.purchasePrice || 0,
      profit: s.profit || 0,
      qty: s.quantitySold || 0,
      delivery: s.deliveryFee || 0,
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden p-0 border-0 bg-gradient-to-br from-background via-background to-primary/5">
        <style>{`
          @keyframes rzFadeUp { from { opacity:0; transform: translateY(10px);} to {opacity:1; transform:none;} }
          @keyframes rzGlowPulse { 0%,100%{ box-shadow:0 0 0 0 hsl(var(--primary)/0.35);} 50%{ box-shadow:0 0 24px 4px hsl(var(--primary)/0.25);} }
          @keyframes rzShimmer { 0%{ background-position:-200% 0;} 100%{ background-position:200% 0;} }
          .rz-item { animation: rzFadeUp .35s ease-out both; }
          .rz-glow { animation: rzGlowPulse 2.2s ease-in-out infinite; }
          .rz-shimmer { background-image:linear-gradient(90deg, transparent, hsl(var(--primary)/0.12), transparent); background-size:200% 100%; animation: rzShimmer 1.6s linear infinite; }
        `}</style>

        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-primary/10 via-transparent to-primary/10">
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <span className="rz-glow inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Search className="h-5 w-5" />
            </span>
            Recherche sur ventes
          </DialogTitle>
          <DialogDescription>
            Saisissez au moins 3 caractères — produit, nom client, téléphone ou adresse.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 space-y-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
              placeholder="Rechercher (3 caractères min.)…"
              className="pl-9 h-11 transition-all duration-300 focus-visible:ring-2"
              aria-label="Recherche de ventes"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              aria-label="Filtrer par année de vente"
              className="h-9 rounded-lg border bg-background px-3 text-sm font-semibold"
            >
              <option value="all">Toutes les années</option>
              {years.map((y) => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>

            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => {
                  setCategory(c.key);
                  setSelected(null);
                  const map: Partial<Record<CategoryKey, ProductCategory>> = {
                    perruques: 'Perruque',
                    tissages: 'Tissages',
                    extension: 'Extension',
                  };
                  const pc = map[c.key];
                  if (pc) {
                    setFilterCategory(pc);
                    setFilterOpen(true);
                  } else {
                    setClassification(null);
                  }
                }}
                className={cn(
                  'h-9 rounded-lg px-3 text-sm font-semibold border transition-all duration-300 hover:scale-105 active:scale-95',
                  category === c.key
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                    : 'bg-background hover:bg-muted'
                )}
              >
                {c.label}
              </button>
            ))}
          </div>

          {attrTerms.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setClassification(null)}
                className="inline-flex h-6 items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2 text-[11px] font-bold uppercase tracking-widest text-primary transition-all duration-300 hover:scale-105 active:scale-95"
              >
                ✕ Effacer filtre attributs
              </button>
            </div>
          )}

        </div>

        <ProductClassificationFilterModal
          open={filterOpen}
          onOpenChange={setFilterOpen}
          categorie={filterCategory}
          initial={classification || undefined}
          onApply={(v) => setClassification(v)}
        />


        <ScrollArea className="max-h-[52vh]">
          <div className="px-6 py-4">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" /> Chargement des ventes…
              </div>
            )}

            {!loading && !selected && !hasQuery && !hasAttrFilter && (
              <div className="rz-shimmer rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                <Sparkles className="mx-auto mb-2 h-5 w-5 text-primary" />
                Commencez à taper pour rechercher dans toutes les ventes.
              </div>
            )}

            {!loading && !selected && refining && (hasQuery || hasAttrFilter) && (
              <div className="py-10">
                <PremiumLoading text="Filtrage des ventes…" variant="ventes" size="lg" />
              </div>
            )}

            {!loading && !refining && !selected && (hasQuery || hasAttrFilter) && results.length === 0 && (
              <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                Aucune vente ne correspond à cette recherche.
              </div>
            )}

            {!loading && !refining && !selected && (hasQuery || hasAttrFilter) && results.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {results.length} vente(s) trouvée(s)
                  </p>
                  {results.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
                      title={sortOrder === 'desc' ? 'Plus récent → plus ancien. Cliquer pour inverser.' : 'Plus ancien → plus récent. Cliquer pour inverser.'}
                      aria-label="Inverser l'ordre de tri des ventes"
                      className="inline-flex h-6 items-center gap-1 rounded-md border bg-background px-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:text-primary active:scale-95"
                    >
                      <ArrowUpDown className="h-3.5 w-3.5" />
                      {sortOrder === 'desc' ? 'Récent' : 'Ancien'}
                    </button>
                  )}
                </div>
                {results.map((s, i) => {
                  const t = totals(s);
                  const descs = saleDescriptions(s).filter(Boolean);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelected(s)}
                      style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                      className="rz-item w-full text-left rounded-xl border p-4 bg-card hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" /> {fmtDate(s.date)}
                            {s.isRefund && <Badge variant="destructive" className="text-[10px]">Remboursement</Badge>}
                          </div>
                          <p className="mt-1 font-bold truncate">{s.clientName || 'Client non renseigné'}</p>
                          <p className="text-sm text-muted-foreground truncate">{descs.join(' • ')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-primary">{fmt(t.selling)}</p>
                          <p className="text-xs text-muted-foreground">Qté {t.qty}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {!loading && selected && (() => {
              const t = totals(selected);
              const dt = new Date(selected.date);
              return (
                <div className="rz-item space-y-4">
                  <Button variant="ghost" size="sm" onClick={() => setSelected(null)} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Retour aux résultats
                  </Button>

                  <div className="rounded-xl border p-4 space-y-3 bg-card">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-lg font-black flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" /> {fmtDate(selected.date)}
                      </h3>
                      <Badge variant="secondary">
                        {MONTHS_FR[dt.getMonth()]} {dt.getFullYear()}
                      </Badge>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 text-sm">
                      <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> {selected.clientName || '—'}</p>
                      <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {selected.clientPhone || '—'}</p>
                      <p className="flex items-center gap-2 sm:col-span-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {[selected.clientAddress, selected.clientVille].filter(Boolean).join(', ') || '—'}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Package className="h-3.5 w-3.5" /> Produits
                      </p>
                      {(selected.products && selected.products.length > 0
                        ? selected.products
                        : [{
                            productId: selected.productId || '',
                            description: selected.description || '',
                            quantitySold: selected.quantitySold || 0,
                            purchasePrice: selected.purchasePrice || 0,
                            sellingPrice: selected.sellingPrice || 0,
                            profit: selected.profit || 0,
                            deliveryFee: selected.deliveryFee,
                          }]
                      ).map((p, idx) => (
                        <div key={idx} className="rounded-lg border p-3 text-sm flex flex-wrap justify-between gap-2">
                          <div>
                            <p className="font-semibold">{p.description || '—'}</p>
                            <p className="text-xs text-muted-foreground">
                              Qté {p.quantitySold} • Achat {fmt(p.purchasePrice)} • Vente {fmt(p.sellingPrice)}
                              {p.deliveryFee ? ` • Livraison ${fmt(p.deliveryFee)}` : ''}
                            </p>
                          </div>
                          <p className="font-black text-emerald-600">{fmt(p.profit)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="rounded-lg bg-muted/50 p-2">
                        <p className="text-[11px] text-muted-foreground">Total achat</p>
                        <p className="font-bold">{fmt(t.purchase)}</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-2">
                        <p className="text-[11px] text-muted-foreground">Total vente</p>
                        <p className="font-bold">{fmt(t.selling)}</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-2">
                        <p className="text-[11px] text-muted-foreground">Livraison</p>
                        <p className="font-bold">{fmt(t.delivery)}</p>
                      </div>
                      <div className="rounded-lg bg-emerald-500/10 p-2">
                        <p className="text-[11px] text-muted-foreground">Bénéfice</p>
                        <p className="font-black text-emerald-600">{fmt(t.profit)}</p>
                      </div>
                    </div>

                    {(selected.reste || selected.nextPaymentDate) && (
                      <div className="text-sm text-muted-foreground">
                        {selected.reste ? <p>Reste à payer : <span className="font-bold text-foreground">{fmt(selected.reste)}</span></p> : null}
                        {selected.nextPaymentDate ? <p>Prochain paiement : {fmtDate(selected.nextPaymentDate)}</p> : null}
                      </div>
                    )}

                    <Button onClick={() => goToSale(selected)} className="w-full gap-2 rz-glow">
                      <ExternalLink className="h-4 w-4" />
                      Voir cette vente dans le tableau de {MONTHS_FR[dt.getMonth()]} {dt.getFullYear()}
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SearchSalesModal;
