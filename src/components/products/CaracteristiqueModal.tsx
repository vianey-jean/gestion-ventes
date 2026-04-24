/**
 * CaracteristiqueModal.tsx
 * Affiche la "carte caractéristique" du produit (description, taille, code-barre, code)
 * et propose une impression avec choix du format (mm) — téléchargement PDF via jsPDF.
 */
import React, { useRef, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Printer, Download, X, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';
import ProductCharacteristicCard, { extractSize, ProductCharLike } from './ProductCharacteristicCard';
import { useToast } from '@/hooks/use-toast';
import { getBarcodeValue } from '@/lib/barcodeCodec';
import { Euro } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductCharLike | null;
}

const CaracteristiqueModal: React.FC<Props> = ({ open, onOpenChange, product }) => {
  const [widthMm, setWidthMm] = useState<string>('100');
  const [heightMm, setHeightMm] = useState<string>('80');
  const [askFormat, setAskFormat] = useState(false);
  const [askPrice, setAskPrice] = useState(false);
  const [priceInput, setPriceInput] = useState<string>('');
  const [priceEuro, setPriceEuro] = useState<number | null>(null);
  const { toast } = useToast();

  if (!product) return null;

  const handlePrint = async () => {
    const w = parseFloat(widthMm);
    const h = parseFloat(heightMm);
    if (!w || !h || w < 20 || h < 20 || w > 1000 || h > 1000) {
      toast({
        title: 'Format invalide',
        description: 'Largeur et hauteur doivent être entre 20 et 1000 mm.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // PDF aux dimensions exactes choisies (largeur × hauteur)
      const pdf = new jsPDF({
        orientation: w >= h ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [w, h],
      });

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      // Marges proportionnelles (4% de la plus petite dimension, min 1mm)
      const margin = Math.max(1, Math.min(pageW, pageH) * 0.04);
      const contentW = pageW - margin * 2;
      const contentH = pageH - margin * 2;

      // Répartition verticale en pourcentage de contentH
      // description: 22%, gap, taille: 36%, gap, codebarre: 26%, gap, code: 10%
      const gap = contentH * 0.02;
      const descH = contentH * 0.22;
      const sizeH = contentH * 0.30;
      const barcodeH = contentH * 0.24;
      const codeH = contentH * 0.09;
      const thanksH = contentH * 0.07;

      const desc = product.description || '';
      const carac = product.caracteristique;
      const displayName = (carac && carac.nom) || desc;
      const size = (carac && carac.numero) || extractSize(desc);
      const displayCode = (carac && carac.code) || product.code || '—';
      const barcodeValue =
        getBarcodeValue(carac, product.code || product.id?.slice(0, 10) || 'NOCODE');

      // Helper: trouver la taille de police (en pt) qui fait tenir le texte
      // dans (maxWidthMm × maxHeightMm). 1pt ≈ 0.3528mm.
      const PT_TO_MM = 0.3528;
      const fitFontSize = (
        text: string,
        maxWmm: number,
        maxHmm: number,
        font: 'helvetica' | 'courier',
        style: 'normal' | 'bold',
        maxPt = 200,
        minPt = 4,
      ): { fontSize: number; lines: string[] } => {
        pdf.setFont(font, style);
        let lo = minPt;
        let hi = maxPt;
        let best = minPt;
        let bestLines: string[] = [text];
        while (lo <= hi) {
          const mid = (lo + hi) / 2;
          pdf.setFontSize(mid);
          const lines = pdf.splitTextToSize(text, maxWmm) as string[];
          const lineHeightMm = mid * PT_TO_MM * 1.15;
          const totalH = lines.length * lineHeightMm;
          if (totalH <= maxHmm) {
            best = mid;
            bestLines = lines;
            lo = mid + 0.5;
          } else {
            hi = mid - 0.5;
          }
        }
        return { fontSize: best, lines: bestLines };
      };

      let cursorY = margin;

      // === Description (auto-fit) ===
      const { fontSize: descPt, lines: descLines } = fitFontSize(
        displayName, contentW, descH, 'helvetica', 'bold', 40, 4,
      );
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(descPt);
      pdf.setTextColor(30, 27, 75);
      const descLineH = descPt * PT_TO_MM * 1.15;
      const descTotalH = descLines.length * descLineH;
      const descStartY = cursorY + (descH - descTotalH) / 2 + descPt * PT_TO_MM * 0.85;
      descLines.forEach((ln, i) => {
        pdf.text(ln, pageW / 2, descStartY + i * descLineH, { align: 'center' });
      });
      cursorY += descH + gap;

      // === Taille (gros chiffre, auto-fit) ===
      if (size) {
        const { fontSize: sizePt } = fitFontSize(
          size, contentW, sizeH, 'helvetica', 'bold', 400, 8,
        );
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(sizePt);
        pdf.setTextColor(124, 58, 237);
        // Centre vertical du bloc
        const sizeY = cursorY + sizeH / 2 + sizePt * PT_TO_MM * 0.35;
        pdf.text(size, pageW / 2, sizeY, { align: 'center' });
      }
      cursorY += sizeH + gap;

      // === Code-barre (proportionnel à la zone) ===
      try {
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, barcodeValue, {
          format: 'CODE128',
          displayValue: false,
          margin: 0,
          height: 100,
          width: 2,
          background: '#ffffff',
          lineColor: '#1e1b4b',
        });
        const imgData = canvas.toDataURL('image/png');
        // Si un prix est défini, le code-barre prend ~70% de la largeur,
        // le prix s'affiche à droite. Sinon, code-barre = 90%.
        const hasPrice = typeof priceEuro === 'number' && !isNaN(priceEuro);
        const bcW = hasPrice ? contentW * 0.65 : contentW * 0.9;
        const bcH = barcodeH;
        const bcX = hasPrice ? margin : (pageW - bcW) / 2;
        pdf.addImage(imgData, 'PNG', bcX, cursorY, bcW, bcH);

        if (hasPrice) {
          const priceText = `${priceEuro!.toLocaleString('fr-FR', {
            minimumFractionDigits: 2, maximumFractionDigits: 2,
          })} €`;
          const priceZoneX = bcX + bcW;
          const priceZoneW = pageW - margin - priceZoneX;
          const { fontSize: pricePt } = fitFontSize(
            priceText, priceZoneW, bcH, 'helvetica', 'bold', 200, 6,
          );
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(pricePt);
          pdf.setTextColor(5, 122, 85); // emerald-700
          const priceY = cursorY + bcH / 2 + pricePt * PT_TO_MM * 0.35;
          pdf.text(priceText, priceZoneX + priceZoneW / 2, priceY, { align: 'center' });
        }
        cursorY += bcH + gap;
      } catch (e) {
        console.warn('Barcode generation failed', e);
        cursorY += barcodeH + gap;
      }

      // === Code produit (auto-fit) ===
      const codeText = displayCode;
      const { fontSize: codePt } = fitFontSize(
        codeText, contentW, codeH, 'courier', 'bold', 20, 4,
      );
      pdf.setFont('courier', 'bold');
      pdf.setFontSize(codePt);
      pdf.setTextColor(91, 33, 182);
      const codeY = cursorY + codeH / 2 + codePt * PT_TO_MM * 0.35;
      pdf.text(codeText, pageW / 2, codeY, { align: 'center' });
      cursorY += codeH + gap;

      // === Message de remerciement (petit, en bas) ===
      const thanksText = 'Merci pour votre achat chez RIZIKY BEAUTÉ — votre satisfaction est notre plus belle récompense.';
      const { fontSize: thanksPt, lines: thanksLines } = fitFontSize(
        thanksText, contentW, thanksH, 'helvetica', 'normal', 10, 3,
      );
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(thanksPt);
      pdf.setTextColor(120, 113, 130);
      const thanksLineH = thanksPt * PT_TO_MM * 1.15;
      const thanksTotalH = thanksLines.length * thanksLineH;
      const thanksStartY = cursorY + (thanksH - thanksTotalH) / 2 + thanksPt * PT_TO_MM * 0.85;
      thanksLines.forEach((ln, i) => {
        pdf.text(ln, pageW / 2, thanksStartY + i * thanksLineH, { align: 'center' });
      });

      const fileName = `caracteristique_${product.code || product.id}_${w}x${h}mm.pdf`;
      pdf.save(fileName);

      toast({
        title: '✨ Téléchargement démarré',
        description: `Caractéristique ${w}×${h} mm générée.`,
      });
      setAskFormat(false);
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast({
        title: 'Erreur',
        description: "Impossible de générer le PDF.",
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg bg-gradient-to-br from-white via-violet-50/40 to-fuchsia-50/30 dark:from-slate-900 dark:via-violet-950/40 dark:to-fuchsia-950/20 border-0 shadow-2xl rounded-3xl">
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-xl shadow-violet-500/30">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            Caractéristique du produit
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <ProductCharacteristicCard product={product} variant="full" priceEuro={priceEuro} />
        </div>

        {askPrice ? (
          <div className="space-y-3 p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40">
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 text-center">
              Saisir le prix vendu (€) — utilisé uniquement pour l'impression
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="sell-price" className="text-xs font-bold">Prix (€)</Label>
                <Input
                  id="sell-price"
                  type="number"
                  step="0.01"
                  min={0}
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="0.00"
                  className="rounded-xl"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setAskPrice(false); }}
                className="rounded-xl"
              >
                Annuler
              </Button>
              {priceEuro !== null && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setPriceEuro(null); setPriceInput(''); setAskPrice(false); }}
                  className="rounded-xl"
                >
                  Retirer
                </Button>
              )}
              <Button
                type="button"
                onClick={() => {
                  const v = parseFloat(priceInput.replace(',', '.'));
                  if (isNaN(v) || v < 0) {
                    toast({ title: 'Prix invalide', description: 'Entrez un montant positif.', variant: 'destructive' });
                    return;
                  }
                  setPriceEuro(v);
                  setAskPrice(false);
                }}
                className="rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white border-0"
              >
                Valider
              </Button>
            </div>
          </div>
        ) : null}

        {askFormat ? (
          <div className="space-y-4 p-4 rounded-2xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-200/50 dark:border-violet-800/40">
            <p className="text-sm font-bold text-violet-700 dark:text-violet-300 text-center">
              Choisissez le format d'impression (en millimètres)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="print-width" className="text-xs font-bold">Largeur (mm)</Label>
                <Input
                  id="print-width"
                  type="number"
                  min={20}
                  max={1000}
                  value={widthMm}
                  onChange={(e) => setWidthMm(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="print-height" className="text-xs font-bold">Hauteur (mm)</Label>
                <Input
                  id="print-height"
                  type="number"
                  min={20}
                  max={1000}
                  value={heightMm}
                  onChange={(e) => setHeightMm(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Étiquette 50×30', w: 50, h: 30 },
                { label: 'Étiquette 100×80', w: 100, h: 80 },
                { label: 'A6 (105×148)', w: 105, h: 148 },
                { label: 'A5 (148×210)', w: 148, h: 210 },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => { setWidthMm(String(p.w)); setHeightMm(String(p.h)); }}
                  className="text-[10px] sm:text-xs px-2.5 py-1 rounded-full bg-violet-100 hover:bg-violet-200 dark:bg-violet-900/40 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-200 font-semibold transition-colors"
                  type="button"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!askFormat ? (
            <>
              <Button
                variant="outline"
                onClick={() => { setPriceInput(priceEuro !== null ? String(priceEuro) : ''); setAskPrice(true); }}
                className="w-full sm:w-auto rounded-xl border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
              >
                <Euro className="h-4 w-4 mr-2" /> Prix vendu{priceEuro !== null ? ` (${priceEuro.toFixed(2)} €)` : ''}
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto rounded-xl"
              >
                <X className="h-4 w-4 mr-2" /> Fermer
              </Button>
              <Button
                onClick={() => setAskFormat(true)}
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg shadow-violet-500/30 border-0"
              >
                <Printer className="h-4 w-4 mr-2" /> Imprimer
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setAskFormat(false)}
                className="w-full sm:w-auto rounded-xl"
              >
                Retour
              </Button>
              <Button
                onClick={handlePrint}
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg shadow-emerald-500/30 border-0"
              >
                <Download className="h-4 w-4 mr-2" /> Télécharger PDF
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CaracteristiqueModal;