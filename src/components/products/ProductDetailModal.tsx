/**
 * ProductDetailModal.tsx
 * Affiche le détail d'un produit (nom, description, prix, stock, fournisseur, dates)
 * avec une icône pour ouvrir la modale Caractéristique et un bouton d'impression PDF.
 */
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Package, Tag, Coins, Boxes, User as UserIcon, Calendar,
  Sparkles, Printer, X, Download, BarcodeIcon,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types/product';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  /** Callback déclenché lorsque l'utilisateur clique sur l'icône Caractéristique */
  onOpenCaracteristique?: (product: Product) => void;
}

const ProductDetailModal: React.FC<Props> = ({ open, onOpenChange, product, onOpenCaracteristique }) => {
  const { toast } = useToast();
  const [askFormat, setAskFormat] = useState(false);
  const [widthMm, setWidthMm] = useState('100');
  const [heightMm, setHeightMm] = useState('80');
  const [busy, setBusy] = useState(false);

  if (!product) return null;

  const handlePrint = async () => {
    const w = parseFloat(widthMm);
    const h = parseFloat(heightMm);
    if (!w || !h || w < 20 || h < 20 || w > 1000 || h > 1000) {
      toast({ title: 'Format invalide', description: 'Entre 20 et 1000 mm.', variant: 'destructive' });
      return;
    }
    setBusy(true);
    try {
      const pdf = new jsPDF({ orientation: w >= h ? 'landscape' : 'portrait', unit: 'mm', format: [w, h] });
      const pageW = pdf.internal.pageSize.getWidth();
      const margin = Math.max(2, Math.min(w, h) * 0.05);
      let y = margin + 4;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(30, 27, 75);
      const titleLines = pdf.splitTextToSize(product.description || product.code || 'Produit', pageW - margin * 2);
      titleLines.forEach((ln: string) => { pdf.text(ln, pageW / 2, y, { align: 'center' }); y += 5; });
      y += 1;

      pdf.setDrawColor(180, 180, 200);
      pdf.line(margin, y, pageW - margin, y);
      y += 4;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 80);
      const lines: string[] = [];
      if (product.code) lines.push(`Code : ${product.code}`);
      lines.push(`Prix achat : ${product.purchasePrice} €`);
      if (product.sellingPrice != null) lines.push(`Prix vente : ${product.sellingPrice} €`);
      lines.push(`Stock : ${product.quantity}`);
      if (product.fournisseur) lines.push(`Fournisseur : ${product.fournisseur}`);
      if (product.dateAchat) lines.push(`Date achat : ${new Date(product.dateAchat).toLocaleDateString('fr-FR')}`);

      lines.forEach((ln) => {
        const wrapped = pdf.splitTextToSize(ln, pageW - margin * 2);
        wrapped.forEach((w2: string) => { pdf.text(w2, margin, y); y += 4.2; });
      });

      pdf.save(`produit_${(product.code || product.id).toString().replace(/\s+/g, '_')}_${w}x${h}mm.pdf`);
      toast({ title: '✨ Téléchargement démarré', description: `Fiche ${w}×${h} mm générée.` });
      setAskFormat(false);
    } catch (e) {
      console.error(e);
      toast({ title: 'Erreur', description: 'Impossible de générer le PDF.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const mainPhoto = product.mainPhoto || (product.photos && product.photos[0]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-violet-50/40 to-fuchsia-50/30 dark:from-slate-900 dark:via-violet-950/40 dark:to-fuchsia-950/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-violet-600" />
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Détails du produit
            </span>
            {onOpenCaracteristique && (
              <button
                type="button"
                onClick={() => onOpenCaracteristique(product)}
                title="Voir / Imprimer la caractéristique"
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-semibold shadow-lg hover:from-violet-700 hover:to-fuchsia-700 transition-all"
              >
                  <Printer className="w-3.5 h-3.5" />
                {/* <Sparkles className="w-3.5 h-3.5" /> */}
                <BarcodeIcon className="w-3.5 h-3.5" />
                Caractéristique
              </button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start p-4 rounded-xl bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 border border-violet-100 dark:border-violet-900/40">
            {mainPhoto ? (
              <img src={mainPhoto} alt={product.description} className="w-24 h-24 rounded-xl object-cover border-4 border-white shadow-lg shrink-0" />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center text-white shrink-0 shadow-lg">
                <Package className="w-10 h-10" />
              </div>
            )}
            <div className="text-center sm:text-left flex-1 min-w-0">
              <h3 className="text-xl font-black text-gray-900 dark:text-white break-words">{product.description}</h3>
              {product.code && (
                <p className="text-xs text-violet-600 dark:text-violet-300 mt-1 inline-flex items-center gap-1 font-mono">
                  <Tag className="w-3 h-3" /> {product.code}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <InfoRow icon={<Coins className="w-4 h-4 text-amber-600" />} label="Prix achat" value={`${product.purchasePrice} €`} />
            {product.sellingPrice != null && (
              <InfoRow icon={<Coins className="w-4 h-4 text-emerald-600" />} label="Prix vente" value={`${product.sellingPrice} €`} />
            )}
            <InfoRow icon={<Boxes className="w-4 h-4 text-blue-600" />} label="Stock" value={String(product.quantity)} />
            {product.fournisseur && (
              <InfoRow icon={<UserIcon className="w-4 h-4 text-purple-600" />} label="Fournisseur" value={product.fournisseur} />
            )}
            {product.dateAchat && (
              <InfoRow icon={<Calendar className="w-4 h-4 text-rose-600" />} label="Date achat" value={new Date(product.dateAchat).toLocaleDateString('fr-FR')} />
            )}
          </div>

          {product.caracteristique?.numero && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm">
              <span className="font-bold text-amber-700 dark:text-amber-300">Taille : </span>
              <span className="font-mono">{product.caracteristique.numero}</span>
            </div>
          )}
        </div>

        {askFormat && (
          <div className="space-y-3 p-4 rounded-2xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-200/50 dark:border-violet-800/40">
            <p className="text-sm font-bold text-violet-700 dark:text-violet-300 text-center">
              Format d'impression (mm)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Largeur</Label>
                <Input type="number" min={20} max={1000} value={widthMm} onChange={(e) => setWidthMm(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Hauteur</Label>
                <Input type="number" min={20} max={1000} value={heightMm} onChange={(e) => setHeightMm(e.target.value)} className="rounded-xl" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '50×30', w: 50, h: 30 },
                { label: '100×80', w: 100, h: 80 },
                { label: 'A6', w: 105, h: 148 },
                { label: 'A5', w: 148, h: 210 },
              ].map((p) => (
                <button key={p.label} type="button" onClick={() => { setWidthMm(String(p.w)); setHeightMm(String(p.h)); }}
                  className="text-xs px-2.5 py-1 rounded-full bg-violet-100 hover:bg-violet-200 dark:bg-violet-900/40 text-violet-700 dark:text-violet-200 font-semibold">
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* <DialogFooter className="flex-col sm:flex-row gap-2">
          {!askFormat ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto rounded-xl">
                <X className="h-4 w-4 mr-2" /> Fermer
              </Button>
              <Button onClick={() => setAskFormat(true)}
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white border-0">
                <Printer className="h-4 w-4 mr-2" /> Imprimer
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setAskFormat(false)} className="w-full sm:w-auto rounded-xl">
                Retour
              </Button>
              <Button disabled={busy} onClick={handlePrint}
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white border-0">
                <Download className="h-4 w-4 mr-2" /> {busy ? 'Génération…' : 'Télécharger PDF'}
              </Button>
            </>
          )}
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/60 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700">
    {icon}
    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{label} :</span>
    <span className="text-sm font-bold text-gray-900 dark:text-white ml-auto truncate">{value}</span>
  </div>
);

export default ProductDetailModal;
