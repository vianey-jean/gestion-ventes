/**
 * ProductsVenduModal.tsx — Modale "Voir plus vendu"
 *
 * Affiche la liste des produits triés du plus vendu vers le moins vendu
 * (et jamais vendus). Filtres par catégorie : Tous / Perruque / Tissages-Extensions.
 * Génération PDF de la liste filtrée.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, FileDown, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import api from '@/services/api/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';

export interface VenduItem {
  id: string;
  code?: string;
  description: string;
  category: 'perruque' | 'tissage-extension' | 'autres';
  purchasePrice: number;
  sellingPrice: number;
  avgSellingPrice: number;
  totalSold: number;
  totalRevenue: number;
  salesCount: number;
  stockRestant: number;
}

type CatFilter = 'tous' | 'perruque' | 'tissage-extension';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ProductsVenduModal: React.FC<Props> = ({ open, onClose }) => {
  const { toast } = useToast();
  const [items, setItems] = useState<VenduItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<CatFilter>('tous');

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/products-vendu');
        if (!cancelled) setItems(res.data?.items || []);
      } catch (e: any) {
        toast({ title: 'Erreur', description: e?.message || 'Chargement impossible', variant: 'destructive' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, toast]);

  const filtered = useMemo(() => {
    if (filter === 'tous') return items;
    return items.filter(it => it.category === filter);
  }, [items, filter]);

  const fmtEuro = (n: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);

  const generatePdf = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const title =
        filter === 'tous' ? 'Produits les plus vendus — Tous'
        : filter === 'perruque' ? 'Produits les plus vendus — Perruques'
        : 'Produits les plus vendus — Tissages & Extensions';
      doc.setFontSize(16);
      doc.text(title, 14, 16);
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(`Généré le ${new Date().toLocaleString('fr-FR')} — ${filtered.length} produits`, 14, 22);

      autoTable(doc, {
        startY: 28,
        head: [['#', 'Produit', 'Code', 'Prix unitaire', 'Prix vendu (moy.)', 'Nombre vendu', 'Stock restant']],
        body: filtered.map((it, i) => [
          String(i + 1),
          it.description,
          it.code || '-',
          fmtEuro(it.purchasePrice),
          fmtEuro(it.avgSellingPrice || it.sellingPrice),
          String(it.totalSold),
          String(it.stockRestant),
        ]),
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [202, 138, 4], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [253, 246, 227] },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          3: { halign: 'right' },
          4: { halign: 'right' },
          5: { halign: 'right' },
          6: { halign: 'right' },
        },
      });

      doc.save(`produits-plus-vendus-${filter}-${Date.now()}.pdf`);
      toast({ title: 'PDF généré', description: 'Téléchargement lancé.' });
    } catch (e: any) {
      toast({ title: 'Erreur PDF', description: e?.message || 'Impossible de générer', variant: 'destructive' });
    }
  };

  const filters: { key: CatFilter; label: string }[] = [
    { key: 'tous', label: 'Tous' },
    { key: 'perruque', label: 'Perruques' },
    { key: 'tissage-extension', label: 'Tissages & Extensions' },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-6xl w-[96vw] max-h-[92vh] overflow-hidden p-0 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-zinc-950 dark:via-amber-950/30 dark:to-orange-950/30 border-2 border-amber-300/60 dark:border-amber-500/30 shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-amber-200/60 dark:border-amber-700/30 bg-gradient-to-r from-amber-100/70 via-yellow-100/60 to-orange-100/70 dark:from-amber-900/30 dark:via-yellow-900/20 dark:to-orange-900/30 backdrop-blur-xl">
          <DialogTitle className="flex items-center gap-3 text-2xl font-black tracking-tight bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-700 dark:from-amber-300 dark:via-orange-300 dark:to-yellow-200 bg-clip-text text-transparent">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 shadow-lg shadow-amber-500/40">
              <Crown className="h-6 w-6 text-white" />
            </div>
            Produits les plus vendus
            <Sparkles className="h-5 w-5 text-amber-500" />
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between border-b border-amber-200/40 dark:border-amber-700/20">
          <div className="flex flex-wrap gap-2">
            {filters.map(f => (
              <Button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-xl h-10 px-4 font-semibold transition-all border-0 ${
                  filter === f.key
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white shadow-lg shadow-amber-500/40 scale-[1.02]'
                    : 'bg-white/70 dark:bg-zinc-900/60 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 backdrop-blur'
                }`}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <Button
            onClick={generatePdf}
            disabled={loading || filtered.length === 0}
            className="rounded-xl h-10 px-5 font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 hover:from-orange-700 hover:via-amber-700 hover:to-yellow-700 text-white shadow-xl shadow-orange-500/40 border-0"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Générer PDF
          </Button>
        </div>

        <div className="overflow-auto max-h-[calc(92vh-200px)] px-3 sm:px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-amber-700 dark:text-amber-300">
              <Loader2 className="h-8 w-8 animate-spin mr-3" /> Chargement…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-amber-700/80 dark:text-amber-300/70">Aucun produit.</div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block rounded-2xl overflow-hidden border border-amber-200/60 dark:border-amber-700/30 bg-white/60 dark:bg-zinc-950/40 backdrop-blur shadow-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 dark:from-amber-900/40 dark:via-yellow-900/30 dark:to-orange-900/40 text-amber-900 dark:text-amber-100">
                    <tr>
                      <th className="px-3 py-3 text-left font-bold">#</th>
                      <th className="px-3 py-3 text-left font-bold">Produit</th>
                      <th className="px-3 py-3 text-right font-bold">Prix unitaire</th>
                      <th className="px-3 py-3 text-right font-bold">Prix vendu</th>
                      <th className="px-3 py-3 text-right font-bold">Nb vendu</th>
                      <th className="px-3 py-3 text-right font-bold">Stock restant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((it, i) => (
                      <tr key={it.id} className={`border-t border-amber-100 dark:border-amber-800/30 ${it.totalSold === 0 ? 'bg-red-50/40 dark:bg-red-900/10' : i % 2 ? 'bg-amber-50/30 dark:bg-amber-900/5' : ''}`}>
                        <td className="px-3 py-2.5 font-bold text-amber-700 dark:text-amber-300">
                          {i < 3 && it.totalSold > 0 ? (
                            <span className="inline-flex items-center gap-1">
                              <Crown className="h-3.5 w-3.5 text-yellow-500" />
                              {i + 1}
                            </span>
                          ) : i + 1}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-semibold text-zinc-800 dark:text-zinc-100">{it.description}</div>
                          {it.code && <div className="text-[11px] text-zinc-500">{it.code}</div>}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{fmtEuro(it.purchasePrice)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{fmtEuro(it.avgSellingPrice || it.sellingPrice)}</td>
                        <td className="px-3 py-2.5 text-right">
                          {it.totalSold === 0 ? (
                            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-0">Jamais vendu</Badge>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300">
                              <TrendingUp className="h-3.5 w-3.5" />{it.totalSold}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span className={`font-semibold ${it.stockRestant === 0 ? 'text-red-600' : it.stockRestant < 5 ? 'text-orange-600' : 'text-zinc-700 dark:text-zinc-200'}`}>
                            {it.stockRestant}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {filtered.map((it, i) => (
                  <div key={it.id} className="rounded-2xl p-4 bg-white/70 dark:bg-zinc-950/50 border border-amber-200/60 dark:border-amber-700/30 shadow">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-700 dark:text-amber-300">#{i + 1}</span>
                        {i < 3 && it.totalSold > 0 && <Crown className="h-4 w-4 text-yellow-500" />}
                      </div>
                      {it.totalSold === 0
                        ? <Badge className="bg-red-100 text-red-700 border-0">Jamais vendu</Badge>
                        : <Badge className="bg-emerald-100 text-emerald-700 border-0">{it.totalSold} vendu(s)</Badge>}
                    </div>
                    <div className="font-semibold text-zinc-800 dark:text-zinc-100 mb-2">{it.description}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-2">
                        <div className="text-zinc-500">Prix unitaire</div>
                        <div className="font-bold">{fmtEuro(it.purchasePrice)}</div>
                      </div>
                      <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-2">
                        <div className="text-zinc-500">Prix vendu</div>
                        <div className="font-bold">{fmtEuro(it.avgSellingPrice || it.sellingPrice)}</div>
                      </div>
                      <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-2 col-span-2">
                        <div className="text-zinc-500">Stock restant</div>
                        <div className={`font-bold ${it.stockRestant === 0 ? 'text-red-600' : it.stockRestant < 5 ? 'text-orange-600' : ''}`}>
                          {it.stockRestant}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductsVenduModal;
