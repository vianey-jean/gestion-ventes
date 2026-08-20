/**
 * SellingPriceHistoryModal.tsx
 * Courbe d'évolution du prix de vente unitaire d'un produit
 * (source : products.json -> sellingPriceHistory).
 */
import React, { useMemo } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { Product } from '@/types/product';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  product: Product | null;
}

const fmtDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' }); }
  catch { return d; }
};

const SellingPriceHistoryModal: React.FC<Props> = ({ open, onOpenChange, product }) => {
  const data = useMemo(() => {
    const hist = product?.sellingPriceHistory || [];
    return hist
      .filter(h => h && typeof h.price === 'number')
      .map(h => ({ date: fmtDate(h.date), raw: h.date, prix: Number(h.price) || 0 }))
      .sort((a, b) => new Date(a.raw).getTime() - new Date(b.raw).getTime());
  }, [product]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-black">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Évolution du prix de vente — {product?.description}
          </DialogTitle>
        </DialogHeader>

        {data.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Aucun historique de prix de vente pour ce produit.
          </p>
        ) : (
          <>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${Number(v).toFixed(2)} €`, 'Prix de vente']} />
                  <Line type="monotone" dataKey="prix" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="max-h-40 overflow-y-auto rounded-2xl border p-2">
              {[...data].reverse().map((d, i) => (
                <div key={`${d.raw}-${i}`} className="flex items-center justify-between px-2 py-1.5 text-xs">
                  <span className="text-muted-foreground">{d.date}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{d.prix.toFixed(2)} €</span>
                </div>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SellingPriceHistoryModal;
