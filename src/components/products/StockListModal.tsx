/**
 * StockListModal — Sélection multi-attributs (modèle/couleur/taille) et
 * catégorie/devant simples, puis affichage de la liste des produits
 * correspondants avec option d'export PDF.
 */
import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Package, Palette, Ruler, Sparkles, Hash, X } from 'lucide-react';
import { Product } from '@/types';
import useProductAttributes from '@/hooks/useProductAttributes';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';

type Category = '' | 'perruque' | 'tissage' | 'extension' | 'autres';

interface Props {
  open: boolean;
  onClose: () => void;
  products: Product[];
}

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'perruque', label: 'Perruque' },
  { key: 'tissage', label: 'Tissage' },
  { key: 'extension', label: 'Extension' },
  { key: 'autres', label: 'Autres' },
];

const StockListModal: React.FC<Props> = ({ open, onClose, products }) => {
  const { items: modeles } = useProductAttributes('modele');
  const { items: couleurs } = useProductAttributes('couleur');
  const { items: tailles } = useProductAttributes('taille');
  const { items: devants } = useProductAttributes('devant');
  const { toast } = useToast();

  const [categorie, setCategorie] = useState<Category>('');
  const [devant, setDevant] = useState<string>('');
  const [selModeles, setSelModeles] = useState<string[]>([]);
  const [selCouleurs, setSelCouleurs] = useState<string[]>([]);
  const [selTailles, setSelTailles] = useState<string[]>([]);

  const toggle = (arr: string[], v: string, setter: (x: string[]) => void) => {
    setter(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
  };

  const results = useMemo(() => {
    const cat = categorie;
    const has = (desc: string, needles: string[]) =>
      needles.length === 0 || needles.some(n => desc.includes(n.toLowerCase()));
    const catMatch = (p: Product) => {
      if (!cat) return true;
      const d = (p.description || '').toLowerCase();
      if (cat === 'autres') return !['perruque', 'tissage', 'extension'].some(k => d.includes(k));
      return d.includes(cat);
    };
    return products.filter(p => {
      const d = (p.description || '').toLowerCase();
      if (!catMatch(p)) return false;
      if (cat === 'perruque' && devant && !d.includes(devant.toLowerCase())) return false;
      if (!has(d, selModeles)) return false;
      if (!has(d, selCouleurs)) return false;
      if (!has(d, selTailles)) return false;
      return true;
    });
  }, [products, categorie, devant, selModeles, selCouleurs, selTailles]);

  const totalQty = results.reduce((s, p) => s + (p.quantity || 0), 0);
  const totalValue = results.reduce((s, p) => s + (p.quantity || 0) * (p.purchasePrice || 0), 0);

  const exportPdf = () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const w = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();
      doc.setFillColor(124, 58, 237);
      doc.rect(0, 0, w, 22, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Liste du stock', 14, 14);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date().toLocaleString('fr-FR'), w - 14, 14, { align: 'right' });

      let y = 30;
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(9);
      const filters: string[] = [];
      if (categorie) filters.push(`Catégorie: ${categorie}`);
      if (devant) filters.push(`Devant: ${devant}`);
      if (selModeles.length) filters.push(`Modèles: ${selModeles.join(', ')}`);
      if (selCouleurs.length) filters.push(`Couleurs: ${selCouleurs.join(', ')}`);
      if (selTailles.length) filters.push(`Tailles: ${selTailles.join(', ')}`);
      const filterText = filters.length ? filters.join('  |  ') : 'Aucun filtre';
      const filterLines = doc.splitTextToSize(filterText, w - 28);
      doc.text(filterLines, 14, y);
      y += filterLines.length * 4 + 4;

      // Header
      doc.setFillColor(243, 232, 255);
      doc.rect(10, y, w - 20, 8, 'F');
      doc.setTextColor(88, 28, 135);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Code', 12, y + 5.5);
      doc.text('Description', 38, y + 5.5);
      doc.text('Qté', w - 62, y + 5.5, { align: 'right' });
      doc.text('Prix', w - 40, y + 5.5, { align: 'right' });
      doc.text('Valeur', w - 12, y + 5.5, { align: 'right' });
      y += 10;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 30, 30);
      results.forEach((p, i) => {
        if (y > ph - 20) { doc.addPage(); y = 20; }
        if (i % 2 === 0) {
          doc.setFillColor(250, 245, 255);
          doc.rect(10, y - 4, w - 20, 7, 'F');
        }
        const desc = doc.splitTextToSize(p.description || '', w - 100)[0];
        doc.setFontSize(8);
        doc.text(p.code || '—', 12, y);
        doc.text(desc, 38, y);
        doc.text(String(p.quantity ?? 0), w - 62, y, { align: 'right' });
        doc.text(`${(p.purchasePrice ?? 0).toFixed(2)}€`, w - 40, y, { align: 'right' });
        doc.text(`${((p.quantity ?? 0) * (p.purchasePrice ?? 0)).toFixed(2)}€`, w - 12, y, { align: 'right' });
        y += 7;
      });

      if (y > ph - 20) { doc.addPage(); y = 20; }
      y += 4;
      doc.setDrawColor(168, 85, 247);
      doc.line(10, y, w - 10, y);
      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(88, 28, 135);
      doc.text(`Total produits: ${results.length}`, 12, y);
      doc.text(`Quantité totale: ${totalQty}`, 90, y);
      doc.text(`Valeur: ${totalValue.toFixed(2)}€`, w - 12, y, { align: 'right' });

      doc.save(`stock_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast({ title: 'PDF généré', description: `${results.length} produit(s) exportés` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erreur PDF', description: 'Impossible de générer le PDF' });
    }
  };

  const Chip: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all select-none ${active
        ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-transparent shadow-md shadow-violet-500/30'
        : 'bg-white dark:bg-gray-800 border-violet-200 dark:border-violet-800 text-gray-700 dark:text-gray-300 hover:border-violet-400'}`}
    >{children}</button>
  );

  const Section: React.FC<{ icon: React.ReactNode; title: string; hint?: string; children: React.ReactNode }> = ({ icon, title, hint, children }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white flex items-center justify-center">{icon}</span>
        <div>
          <p className="text-sm font-black text-foreground">{title}</p>
          {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden p-0 rounded-2xl border-violet-200/60 dark:border-violet-800/60 shadow-2xl bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm flex flex-col">
        <DialogHeader className="p-5 pb-3 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white shrink-0">
          <DialogTitle className="flex items-center gap-3 text-white text-lg font-black">
            <Package className="h-5 w-5" /> Liste du Stock
            <Button
              type="button"
              onClick={exportPdf}
              size="sm"
              disabled={results.length === 0}
              className="ml-auto bg-white/90 text-violet-700 hover:bg-white rounded-xl font-bold shadow-lg backdrop-blur-md transition-all"
            >
              <Printer className="h-4 w-4 mr-1.5" /> PDF
            </Button>
          </DialogTitle>
          <p className="text-xs text-white/80">Sélectionnez les attributs (choix multiple sauf catégorie et devant)</p>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0">
          <div className="shrink-0 p-5 space-y-5 overflow-y-auto max-h-[32vh] scrollbar-thin">
            <Section icon={<Sparkles className="h-3.5 w-3.5" />} title="Catégorie" hint="1 seule">
              {CATEGORIES.map(c => (
                <Chip key={c.key} active={categorie === c.key} onClick={() => { setCategorie(categorie === c.key ? '' : c.key); if (c.key !== 'perruque') setDevant(''); }}>{c.label}</Chip>
              ))}
            </Section>

            {categorie === 'perruque' && devants.length > 0 && (
              <Section icon={<Sparkles className="h-3.5 w-3.5" />} title="Devant" hint="1 seul">
                {devants.map(d => (
                  <Chip key={d.id} active={devant === d.nom} onClick={() => setDevant(devant === d.nom ? '' : d.nom)}>{d.nom}</Chip>
                ))}
              </Section>
            )}

            {modeles.length > 0 && (
              <Section icon={<Package className="h-3.5 w-3.5" />} title="Modèles" hint="Choix multiple">
                {modeles.map(m => (
                  <Chip key={m.id} active={selModeles.includes(m.nom)} onClick={() => toggle(selModeles, m.nom, setSelModeles)}>{m.nom}</Chip>
                ))}
              </Section>
            )}

            {couleurs.length > 0 && (
              <Section icon={<Palette className="h-3.5 w-3.5" />} title="Couleurs" hint="Choix multiple">
                {couleurs.map(c => (
                  <Chip key={c.id} active={selCouleurs.includes(c.nom)} onClick={() => toggle(selCouleurs, c.nom, setSelCouleurs)}>{c.nom}</Chip>
                ))}
              </Section>
            )}

            {tailles.length > 0 && (
              <Section icon={<Ruler className="h-3.5 w-3.5" />} title="Tailles" hint="Choix multiple">
                {tailles.map(t => (
                  <Chip key={t.id} active={selTailles.includes(t.nom)} onClick={() => toggle(selTailles, t.nom, setSelTailles)}>{t.nom}</Chip>
                ))}
              </Section>
            )}

            <div className="flex items-center justify-between gap-3 flex-wrap pt-3 border-t border-violet-200/50 dark:border-violet-800/50">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-200 font-bold">{results.length} produit(s)</Badge>
                <Badge className="bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/50 dark:text-fuchsia-200 font-bold">Qté totale: {totalQty}</Badge>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200 font-bold">Valeur: {totalValue.toFixed(2)}€</Badge>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => { setCategorie(''); setDevant(''); setSelModeles([]); setSelCouleurs([]); setSelTailles([]); }}>
                <X className="h-3.5 w-3.5 mr-1" /> Réinitialiser
              </Button>
            </div>
          </div>

          <div className="flex-1 min-h-0 mx-5 mb-5 rounded-2xl border border-violet-200/50 dark:border-violet-800/50 overflow-hidden flex flex-col bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm shadow-inner">
            <div className="shrink-0 grid grid-cols-12 gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-50/80 to-fuchsia-50/80 dark:from-violet-900/40 dark:to-fuchsia-900/40 text-[11px] font-black text-violet-800 dark:text-violet-200 uppercase tracking-wide backdrop-blur-sm border-b border-violet-100 dark:border-violet-900/40">
              <div className="col-span-3">Code</div>
              <div className="col-span-5">Description</div>
              <div className="col-span-1 text-right">Qté</div>
              <div className="col-span-3 text-right">Prix</div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-violet-100/60 dark:divide-violet-900/40">
              {results.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">Aucun produit ne correspond aux filtres</div>
              ) : (
                results.map(p => (
                  <div key={p.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-start text-sm hover:bg-violet-50/40 dark:hover:bg-violet-900/15 transition-all duration-200">
                    <div className="col-span-3">
                      <Badge variant="outline" className="font-mono text-[10px] border-indigo-200 text-indigo-700 dark:border-indigo-700 dark:text-indigo-300 whitespace-normal break-words">
                        <Hash className="h-2.5 w-2.5 mr-0.5 shrink-0" />{p.code || '—'}
                      </Badge>
                    </div>
                    <div className="col-span-5 whitespace-normal break-words font-medium text-foreground leading-relaxed">{p.description}</div>
                    <div className="col-span-1 text-right font-bold text-violet-700 dark:text-violet-300">{p.quantity ?? 0}</div>
                    <div className="col-span-3 text-right font-semibold text-emerald-700 dark:text-emerald-300">{(p.purchasePrice ?? 0).toFixed(2)}€</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StockListModal;
