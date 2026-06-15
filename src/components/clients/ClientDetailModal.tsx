// Modal de détail client avec impression au format millimètres (petites imprimantes)
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, Phone, MapPin, Crown, Download, User as UserIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface ClientLike {
  id: string;
  nom: string;
  phone?: string;
  phones?: string[];
  adresse?: string;
  addresses?: string[];
  ville?: string;
  villes?: string[];
  dateCreation?: string;
  photo?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientLike | null;
  photoUrl?: string | null;
}

const PRESETS = [
  { label: 'Étiquette 50×30', w: 50, h: 30 },
  { label: 'Étiquette 100×80', w: 100, h: 80 },
  { label: 'A6 (105×148)', w: 105, h: 148 },
  { label: 'A5 (148×210)', w: 148, h: 210 },
];

const ClientDetailModal: React.FC<Props> = ({ open, onOpenChange, client, photoUrl }) => {
  const { toast } = useToast();
  const [askFormat, setAskFormat] = useState(false);
  const [widthMm, setWidthMm] = useState<string>('100');
  const [heightMm, setHeightMm] = useState<string>('80');
  const [format, setFormat] = useState<'pdf' | 'jpeg'>('pdf');
  const [busy, setBusy] = useState(false);
  const [selectedPhoneIdx, setSelectedPhoneIdx] = useState(0);
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);

  if (!client) return null;

  const phones = client.phones && client.phones.length > 0 ? client.phones : [client.phone || ''];
  const addresses = client.addresses && client.addresses.length > 0 ? client.addresses : [client.adresse || ''];
  const villesArr = Array.isArray(client.villes) ? client.villes : [];
  const safePhoneIdx = Math.min(selectedPhoneIdx, phones.length - 1);
  const safeAddrIdx = Math.min(selectedAddressIdx, addresses.length - 1);
  const mainPhone = phones[safePhoneIdx] || '';
  const mainAddress = addresses[safeAddrIdx] || '';
  const mainVille = villesArr[safeAddrIdx] || (safeAddrIdx === 0 ? (client.ville || '') : '');

  // ---------- Icônes PDF (vecteur jsPDF) ----------
  const drawPdfIcon = (
    pdf: jsPDF,
    kind: 'name' | 'phone' | 'pin' | 'city',
    cx: number,
    cy: number,
    size: number,
    color: [number, number, number],
  ) => {
    const [r, g, b] = color;
    pdf.setDrawColor(r, g, b);
    pdf.setFillColor(r, g, b);
    const s = size;
    if (kind === 'name') {
      // tête + buste
      pdf.circle(cx, cy - s * 0.18, s * 0.22, 'F');
      pdf.ellipse(cx, cy + s * 0.28, s * 0.42, s * 0.22, 'F');
    } else if (kind === 'phone') {
      // combiné stylisé : rectangle arrondi incliné
      pdf.setLineWidth(s * 0.12);
      pdf.roundedRect(cx - s * 0.28, cy - s * 0.42, s * 0.56, s * 0.84, s * 0.18, s * 0.18, 'S');
      pdf.circle(cx, cy + s * 0.28, s * 0.07, 'F');
    } else if (kind === 'pin') {
      // pin (goutte) + cercle intérieur
      pdf.circle(cx, cy - s * 0.1, s * 0.36, 'F');
      pdf.triangle(
        cx - s * 0.22, cy + s * 0.12,
        cx + s * 0.22, cy + s * 0.12,
        cx, cy + s * 0.5,
        'F',
      );
      pdf.setFillColor(255, 255, 255);
      pdf.circle(cx, cy - s * 0.12, s * 0.13, 'F');
    } else if (kind === 'city') {
      // immeuble
      pdf.rect(cx - s * 0.4, cy - s * 0.05, s * 0.35, s * 0.55, 'F');
      pdf.rect(cx + s * 0.05, cy - s * 0.4, s * 0.35, s * 0.9, 'F');
      pdf.setFillColor(255, 255, 255);
      const w1 = s * 0.07;
      // fenêtres immeuble droit
      pdf.rect(cx + s * 0.12, cy - s * 0.28, w1, w1, 'F');
      pdf.rect(cx + s * 0.27, cy - s * 0.28, w1, w1, 'F');
      pdf.rect(cx + s * 0.12, cy - s * 0.10, w1, w1, 'F');
      pdf.rect(cx + s * 0.27, cy - s * 0.10, w1, w1, 'F');
      pdf.rect(cx + s * 0.12, cy + s * 0.08, w1, w1, 'F');
      pdf.rect(cx + s * 0.27, cy + s * 0.08, w1, w1, 'F');
      // fenêtres immeuble gauche
      pdf.rect(cx - s * 0.32, cy + s * 0.06, w1, w1, 'F');
      pdf.rect(cx - s * 0.17, cy + s * 0.06, w1, w1, 'F');
      pdf.rect(cx - s * 0.32, cy + s * 0.24, w1, w1, 'F');
      pdf.rect(cx - s * 0.17, cy + s * 0.24, w1, w1, 'F');
    }
  };

  // ---------- Icônes Canvas (JPEG) ----------
  const drawCanvasIcon = (
    ctx: CanvasRenderingContext2D,
    kind: 'name' | 'phone' | 'pin' | 'city',
    cx: number,
    cy: number,
    size: number,
    color: string,
  ) => {
    const s = size;
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = s * 0.1;
    if (kind === 'name') {
      ctx.beginPath();
      ctx.arc(cx, cy - s * 0.18, s * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx, cy + s * 0.28, s * 0.42, s * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 'phone') {
      const x = cx - s * 0.28, y = cy - s * 0.42, w = s * 0.56, h = s * 0.84, r = s * 0.18;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + s * 0.28, s * 0.07, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 'pin') {
      ctx.beginPath();
      ctx.arc(cx, cy - s * 0.1, s * 0.36, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.22, cy + s * 0.12);
      ctx.lineTo(cx + s * 0.22, cy + s * 0.12);
      ctx.lineTo(cx, cy + s * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy - s * 0.12, s * 0.13, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 'city') {
      ctx.fillRect(cx - s * 0.4, cy - s * 0.05, s * 0.35, s * 0.55);
      ctx.fillRect(cx + s * 0.05, cy - s * 0.4, s * 0.35, s * 0.9);
      ctx.fillStyle = '#ffffff';
      const w1 = s * 0.07;
      [
        [s * 0.12, -s * 0.28], [s * 0.27, -s * 0.28],
        [s * 0.12, -s * 0.10], [s * 0.27, -s * 0.10],
        [s * 0.12, s * 0.08], [s * 0.27, s * 0.08],
      ].forEach(([dx, dy]) => ctx.fillRect(cx + dx, cy + dy, w1, w1));
      [
        [-s * 0.32, s * 0.06], [-s * 0.17, s * 0.06],
        [-s * 0.32, s * 0.24], [-s * 0.17, s * 0.24],
      ].forEach(([dx, dy]) => ctx.fillRect(cx + dx, cy + dy, w1, w1));
    }
    ctx.restore();
  };

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

    setBusy(true);
    try {
      const pdf = new jsPDF({
        orientation: w >= h ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [w, h],
      });

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      const margin = Math.max(1, Math.min(pageW, pageH) * 0.05);
      const contentW = pageW - margin * 2;
      const contentH = pageH - margin * 2;

      type Item = {
        text: string;
        icon: 'name' | 'phone' | 'pin' | 'city';
        color: [number, number, number];
        hex: string;
        weight: 'normal' | 'bold';
      };
      const items: Item[] = [
        { text: client.nom, icon: 'name', color: [15, 23, 42], hex: '#0f172a', weight: 'bold' },
        { text: mainPhone, icon: 'phone', color: [5, 122, 85], hex: '#057a55', weight: 'bold' },
        { text: mainAddress, icon: 'pin', color: [30, 64, 175], hex: '#1e40af', weight: 'bold' },
        { text: mainVille, icon: 'city', color: [124, 58, 237], hex: '#7c3aed', weight: 'bold' },
      ].filter(it => it.text && it.text.trim()) as Item[];

      const n = items.length || 1;
      const gap = contentH * 0.015; // espacement réduit
      const lineH = (contentH - gap * (n - 1)) / n;

      // Espace réservé à l'icône (à gauche de chaque ligne)
      const iconBox = lineH * 0.85;
      const iconGap = lineH * 0.18;
      const textW = contentW - iconBox - iconGap;

      const PT_TO_MM = 0.3528;
      const fitFontSize = (
        text: string,
        maxWmm: number,
        maxHmm: number,
        style: 'normal' | 'bold',
      ) => {
        pdf.setFont('helvetica', style);
        let lo = 4, hi = 200, best = 4;
        let bestLines: string[] = [text];
        while (lo <= hi) {
          const mid = (lo + hi) / 2;
          pdf.setFontSize(mid);
          const lines = pdf.splitTextToSize(text, maxWmm) as string[];
          const lh = mid * PT_TO_MM * 1.15;
          if (lines.length * lh <= maxHmm) { best = mid; bestLines = lines; lo = mid + 0.5; }
          else hi = mid - 0.5;
        }
        return { fontSize: best, lines: bestLines };
      };

      // Taille de police uniforme pour TOUTES les lignes
      let uniformPt = Infinity;
      const perItemLines: string[][] = [];
      for (const it of items) {
        const { fontSize, lines } = fitFontSize(it.text, textW, lineH, it.weight);
        uniformPt = Math.min(uniformPt, fontSize);
        perItemLines.push(lines);
      }
      if (!isFinite(uniformPt)) uniformPt = 8;

      // Re-split avec taille uniforme
      pdf.setFontSize(uniformPt);
      for (let i = 0; i < items.length; i++) {
        pdf.setFont('helvetica', items[i].weight);
        perItemLines[i] = pdf.splitTextToSize(items[i].text, textW) as string[];
      }

      let cursorY = margin;
      const xIconCenter = margin + iconBox / 2;
      const xText = margin + iconBox + iconGap;
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const lines = perItemLines[i];
        const cyIcon = cursorY + lineH / 2;
        drawPdfIcon(pdf, it.icon, xIconCenter, cyIcon, iconBox, it.color);

        pdf.setFont('helvetica', it.weight);
        pdf.setFontSize(uniformPt);
        pdf.setTextColor(it.color[0], it.color[1], it.color[2]);
        const lh = uniformPt * PT_TO_MM * 1.15;
        const totalH = lines.length * lh;
        const startY = cursorY + (lineH - totalH) / 2 + uniformPt * PT_TO_MM * 0.85;
        lines.forEach((ln, idx) => {
          pdf.text(ln, xText, startY + idx * lh);
        });
        cursorY += lineH + gap;
      }

      const fileBase = `client_${client.nom.replace(/\s+/g, '_')}_${w}x${h}mm`;

      if (format === 'jpeg') {
        const dpi = 300;
        const pxW = Math.round((w / 25.4) * dpi);
        const pxH = Math.round((h / 25.4) * dpi);
        const canvas = document.createElement('canvas');
        canvas.width = pxW;
        canvas.height = pxH;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pxW, pxH);

        const mmToPx = (mm: number) => (mm / 25.4) * dpi;
        const textWpx = mmToPx(textW);
        const lineHpx = mmToPx(lineH);

        const fitPxFont = (text: string, maxW: number, maxH: number, weight: string) => {
          let lo = 6, hi = 800, best = 6;
          while (lo <= hi) {
            const mid = Math.floor((lo + hi) / 2);
            ctx.font = `${weight} ${mid}px Arial, sans-serif`;
            const wText = ctx.measureText(text).width;
            if (wText <= maxW && mid * 1.2 <= maxH) { best = mid; lo = mid + 1; } else { hi = mid - 1; }
          }
          return best;
        };

        // taille uniforme
        let uniformPx = Infinity;
        for (const it of items) {
          const fp = fitPxFont(it.text, textWpx, lineHpx, it.weight === 'bold' ? '700' : '400');
          uniformPx = Math.min(uniformPx, fp);
        }
        if (!isFinite(uniformPx)) uniformPx = 16;

        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        let yMm = margin;
        const iconCx = mmToPx(margin + iconBox / 2);
        const iconSizePx = mmToPx(iconBox);
        const xTextPx = mmToPx(xText);
        for (const it of items) {
          const cyPx = mmToPx(yMm) + lineHpx / 2;
          drawCanvasIcon(ctx, it.icon, iconCx, cyPx, iconSizePx, it.hex);
          ctx.font = `${it.weight === 'bold' ? '700' : '400'} ${uniformPx}px Arial, sans-serif`;
          ctx.fillStyle = it.hex;
          ctx.fillText(it.text, xTextPx, cyPx);
          yMm += lineH + gap;
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${fileBase}.jpg`;
        a.click();
      } else {
        pdf.save(`${fileBase}.pdf`);
      }

      toast({ title: '✨ Téléchargement démarré', description: `Fiche ${w}×${h} mm générée.` });
      setAskFormat(false);
    } catch (e) {
      console.error(e);
      toast({ title: 'Erreur', description: "Impossible de générer le fichier.", variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-purple-600" />
            Détails du client
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-100 dark:border-purple-900/40">
            {photoUrl ? (
              <img src={photoUrl} alt={client.nom} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg shrink-0" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold shrink-0 shadow-lg">
                {client.nom.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-center sm:text-left flex-1 min-w-0">
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white break-words">{client.nom}</h3>
              {client.dateCreation && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 inline-flex items-center gap-1">
                  <Crown className="w-3 h-3 text-yellow-500" />
                  Depuis le {new Date(client.dateCreation).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Téléphones {phones.length >= 2 && <span className="text-xs font-normal text-violet-600">(cliquez pour choisir celui à imprimer)</span>}
            </h4>
            {phones.map((p, i) => {
              const isSelected = i === safePhoneIdx;
              const clickable = phones.length >= 2;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => clickable && setSelectedPhoneIdx(i)}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-green-100 dark:bg-green-900/40 border-green-500 ring-2 ring-green-400 shadow'
                      : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:border-green-400'
                  } ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <Phone className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="text-sm font-semibold break-all">{p}</span>
                  {isSelected && clickable && (
                    <span className="ml-auto text-[10px] uppercase font-bold text-white bg-green-600 px-2 py-0.5 rounded-full">Sélectionné</span>
                  )}
                  {i === 0 && !clickable && <span className="ml-auto text-[10px] uppercase font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Principal</span>}
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Adresses {addresses.length >= 2 && <span className="text-xs font-normal text-violet-600">(cliquez pour choisir celle à imprimer)</span>}
            </h4>
            {addresses.map((a, i) => {
              const villes = Array.isArray(client.villes) ? client.villes : [];
              const ville = villes[i] || (i === 0 ? client.ville : '');
              const isSelected = i === safeAddrIdx;
              const clickable = addresses.length >= 2;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => clickable && setSelectedAddressIdx(i)}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-500 ring-2 ring-blue-400 shadow'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:border-blue-400'
                  } ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold break-words">{a}</p>
                    {ville && <p className="text-xs text-gray-500">{ville}</p>}
                  </div>
                  {isSelected && clickable && (
                    <span className="text-[10px] uppercase font-bold text-white bg-blue-600 px-2 py-0.5 rounded-full shrink-0">Sélectionné</span>
                  )}
                  {i === 0 && !clickable && <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full shrink-0">Principal</span>}
                </button>
              );
            })}
          </div>

          {askFormat && (
            <div className="space-y-4 p-4 rounded-2xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-200/50 dark:border-violet-800/40">
              <p className="text-sm font-bold text-violet-700 dark:text-violet-300 text-center">
                Choisissez le format d'impression (en millimètres)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cd-width" className="text-xs font-bold">Largeur (mm)</Label>
                  <Input id="cd-width" type="number" min={20} max={1000} value={widthMm} onChange={(e) => setWidthMm(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cd-height" className="text-xs font-bold">Hauteur (mm)</Label>
                  <Input id="cd-height" type="number" min={20} max={1000} value={heightMm} onChange={(e) => setHeightMm(e.target.value)} className="rounded-xl" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
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
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Format de fichier</Label>
                <Select value={format} onValueChange={(v) => setFormat(v as 'pdf' | 'jpeg')}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!askFormat ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto rounded-xl">
                <X className="h-4 w-4 mr-2" /> Fermer
              </Button>
              <Button onClick={() => setAskFormat(true)} className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <Printer className="h-4 w-4 mr-2" /> Imprimer
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setAskFormat(false)} className="w-full sm:w-auto rounded-xl">
                Retour
              </Button>
              <Button onClick={handlePrint} disabled={busy} className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white">
                <Download className="h-4 w-4 mr-2" /> {busy ? 'Génération...' : 'Télécharger'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailModal;
