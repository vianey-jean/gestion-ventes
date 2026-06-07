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

  if (!client) return null;

  const phones = client.phones && client.phones.length > 0 ? client.phones : [client.phone || ''];
  const addresses = client.addresses && client.addresses.length > 0 ? client.addresses : [client.adresse || ''];
  const mainPhone = phones[0] || '';
  const mainAddress = addresses[0] || '';

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

      // Répartition : nom 35%, gap, téléphone 25%, gap, adresse 30%
      const gap = contentH * 0.04;
      const nameH = contentH * 0.35;
      const phoneH = contentH * 0.25;
      const addrH = contentH - nameH - phoneH - gap * 2;

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

      const drawBlock = (
        text: string,
        y: number,
        zoneH: number,
        font: 'helvetica' | 'courier',
        style: 'normal' | 'bold',
        color: [number, number, number],
        maxPt: number,
      ) => {
        if (!text) return;
        const { fontSize, lines } = fitFontSize(text, contentW, zoneH, font, style, maxPt, 4);
        pdf.setFont(font, style);
        pdf.setFontSize(fontSize);
        pdf.setTextColor(color[0], color[1], color[2]);
        const lineH = fontSize * PT_TO_MM * 1.15;
        const totalH = lines.length * lineH;
        const startY = y + (zoneH - totalH) / 2 + fontSize * PT_TO_MM * 0.85;
        lines.forEach((ln, i) => {
          pdf.text(ln, pageW / 2, startY + i * lineH, { align: 'center' });
        });
      };

      let cursorY = margin;
      drawBlock(`Fb: ${client.nom}`, cursorY, nameH, 'helvetica', 'bold', [15, 23, 42], 80);
      cursorY += nameH + gap;
      drawBlock(mainPhone, cursorY, phoneH, 'helvetica', 'bold', [5, 122, 85], 60);
      cursorY += phoneH + gap;
      drawBlock(mainAddress, cursorY, addrH, 'helvetica', 'normal', [30, 64, 175], 40);

      const fileBase = `client_${client.nom.replace(/\s+/g, '_')}_${w}x${h}mm`;

      if (format === 'jpeg') {
        // Rendu via canvas à partir du PDF impossible directement → on dessine sur canvas
        const dpi = 300;
        const pxW = Math.round((w / 25.4) * dpi);
        const pxH = Math.round((h / 25.4) * dpi);
        const canvas = document.createElement('canvas');
        canvas.width = pxW;
        canvas.height = pxH;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pxW, pxH);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const mmToPx = (mm: number) => (mm / 25.4) * dpi;
        const fitPxFont = (text: string, maxW: number, maxH: number, weight: string) => {
          let lo = 6, hi = 400, best = 6;
          while (lo <= hi) {
            const mid = Math.floor((lo + hi) / 2);
            ctx.font = `${weight} ${mid}px Arial, sans-serif`;
            const wText = ctx.measureText(text).width;
            if (wText <= maxW && mid * 1.15 <= maxH) { best = mid; lo = mid + 1; } else { hi = mid - 1; }
          }
          return best;
        };

        const drawCanvas = (text: string, yMm: number, hMm: number, weight: string, color: string) => {
          if (!text) return;
          const yPx = mmToPx(yMm) + mmToPx(hMm) / 2;
          const fontPx = fitPxFont(text, mmToPx(contentW), mmToPx(hMm), weight);
          ctx.font = `${weight} ${fontPx}px Arial, sans-serif`;
          ctx.fillStyle = color;
          ctx.fillText(text, pxW / 2, yPx);
        };

        let yMm = margin;
        drawCanvas(`Fb: ${client.nom}`, yMm, nameH, '900', '#0f172a');
        yMm += nameH + gap;
        drawCanvas(mainPhone, yMm, phoneH, '700', '#057a55');
        yMm += phoneH + gap;
        drawCanvas(mainAddress, yMm, addrH, '500', '#1e40af');

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
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Téléphones</h4>
            {phones.map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <Phone className="w-4 h-4 text-green-600 shrink-0" />
                <span className="text-sm font-semibold break-all">{p}</span>
                {i === 0 && <span className="ml-auto text-[10px] uppercase font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Principal</span>}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Adresses</h4>
            {addresses.map((a, i) => {
              const villes = Array.isArray(client.villes) ? client.villes : [];
              const ville = villes[i] || (i === 0 ? client.ville : '');
              return (
                <div key={i} className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold break-words">{a}</p>
                    {ville && <p className="text-xs text-gray-500">{ville}</p>}
                  </div>
                  {i === 0 && <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full shrink-0">Principal</span>}
                </div>
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
