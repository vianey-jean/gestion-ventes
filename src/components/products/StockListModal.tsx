/**
 * StockListModal — Sélection multi-attributs (modèle/couleur/taille) et
 * catégorie/devant simples, puis affichage de la liste des produits
 * correspondants avec option d'export PDF.
 */
import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Package, Hash, ArrowDown, ArrowUp, X, Table } from 'lucide-react';
import { Product } from '@/types';
import useProductAttributes from '@/hooks/useProductAttributes';
import ProductClassificationSelector, { ClassificationValue, splitValues } from './attributes/ProductClassificationSelector';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';

type Category = '' | 'perruque' | 'tissage' | 'extension' | 'autres';

interface Props {
  open: boolean;
  onClose: () => void;
  products: Product[];
}

/** Mappe la catégorie du sélecteur vers la clé de filtrage sur la description. */
const CATEGORY_MAP: Record<string, Category> = {
  Perruque: 'perruque',
  Tissages: 'tissage',
  Extension: 'extension',
  Autres: 'autres',
};

const StockListModal: React.FC<Props> = ({ open, onClose, products }) => {
  const { items: modeles } = useProductAttributes('modele');
  const { items: couleurs } = useProductAttributes('couleur');
  const { items: tailles } = useProductAttributes('taille');
  const { toast } = useToast();

  /** Sélection complète (catégorie + tous les attributs, choix multiple). */
  const [classification, setClassification] = useState<ClassificationValue>({});

  const categorie: Category = CATEGORY_MAP[classification.categorie || ''] || '';
  const devant = classification.devant || '';
  const selModeles = splitValues(classification.modele);
  const selCouleurs = splitValues(classification.couleur);
  const selTailles = splitValues(classification.taille);
  const selDevants = splitValues(devant);
  const selAutres = splitValues(classification.autres);
  const selExtras = Object.values(classification.extras || {}).map(v => splitValues(v)).filter(g => g.length > 0);

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
      if (cat === 'perruque' && !has(d, selDevants)) return false;
      if (!has(d, selModeles)) return false;
      if (!has(d, selCouleurs)) return false;
      if (!has(d, selTailles)) return false;
      if (!has(d, selAutres)) return false;
      for (const group of selExtras) if (!has(d, group)) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, classification]);

  const totalQty = results.reduce((s, p) => s + (p.quantity || 0), 0);
  const totalValue = results.reduce((s, p) => s + (p.quantity || 0) * (p.purchasePrice || 0), 0);

  const exportPdf = () => {
    try {
      // Tri A -> Z par description
      const sortedResults = [...results].sort((a, b) =>
        (a.description || "").localeCompare(b.description || "", "fr", {
          sensitivity: "base",
        })
      );

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const w = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();

      // En-tête
      doc.setFillColor(124, 58, 237);
      doc.rect(0, 0, w, 22, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Liste du stock", 14, 14);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(new Date().toLocaleString("fr-FR"), w - 14, 14, {
        align: "right",
      });

      let y = 30;

      // Filtres
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(9);

      const filters: string[] = [];

      if (categorie) filters.push(`Catégorie: ${categorie}`);
      if (devant) filters.push(`Devant: ${devant}`);
      if (selModeles.length) filters.push(`Modèles: ${selModeles.join(", ")}`);
      if (selCouleurs.length) filters.push(`Couleurs: ${selCouleurs.join(", ")}`);
      if (selTailles.length) filters.push(`Tailles: ${selTailles.join(", ")}`);

      const filterText =
        filters.length > 0 ? filters.join("  |  ") : "Aucun filtre";

      const filterLines = doc.splitTextToSize(filterText, w - 28);

      doc.text(filterLines, 14, y);

      y += filterLines.length * 4 + 4;

      // En-tête du tableau
      doc.setFillColor(243, 232, 255);
      doc.rect(10, y, w - 20, 8, "F");

      doc.setTextColor(88, 28, 135);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);

      doc.text("Code", 12, y + 5.5);
      doc.text("Description", 38, y + 5.5);
      doc.text("Qté", w - 62, y + 5.5, { align: "right" });
      doc.text("Prix", w - 40, y + 5.5, { align: "right" });
      doc.text("Valeur", w - 12, y + 5.5, { align: "right" });

      y += 10;

      // Lignes
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 30, 30);

      sortedResults.forEach((p, i) => {
        if (y > ph - 20) {
          doc.addPage();
          y = 20;
        }

        if (i % 2 === 0) {
          doc.setFillColor(250, 245, 255);
          doc.rect(10, y - 4, w - 20, 7, "F");
        }

        const desc = doc.splitTextToSize(
          p.description || "",
          w - 100
        )[0];

        doc.setFontSize(8);

        doc.text(p.code || "—", 12, y);
        doc.text(desc, 38, y);

        doc.text(String(p.quantity ?? 0), w - 62, y, {
          align: "right",
        });

        doc.text(`${(p.purchasePrice ?? 0).toFixed(2)}€`, w - 40, y, {
          align: "right",
        });

        doc.text(
          `${((p.quantity ?? 0) * (p.purchasePrice ?? 0)).toFixed(2)}€`,
          w - 12,
          y,
          {
            align: "right",
          }
        );

        y += 7;
      });

      // Totaux
      if (y > ph - 20) {
        doc.addPage();
        y = 20;
      }

      y += 4;

      doc.setDrawColor(168, 85, 247);
      doc.line(10, y, w - 10, y);

      y += 6;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(88, 28, 135);

      doc.text(`Total produits: ${sortedResults.length}`, 12, y);
      doc.text(`Quantité totale: ${totalQty}`, 90, y);
      doc.text(`Valeur: ${totalValue.toFixed(2)}€`, w - 12, y, {
        align: "right",
      });

      doc.save(`stock_${new Date().toISOString().slice(0, 10)}.pdf`);

      toast({
        title: "PDF généré",
        description: `${sortedResults.length} produit(s) exportés`,
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Erreur PDF",
        description: "Impossible de générer le PDF",
      });
    }
  };

  /**
   * Export PDF "Tableau" : une colonne par combinaison
   * (catégorie + modèle + couleur), lignes triées par pouces croissants.
   */
  const exportTableau = () => {
    try {
      const findAttr = (desc: string, list: { nom: string }[]) => {
        const d = desc.toLowerCase();
        const found = list
          .slice()
          .sort((a, b) => b.nom.length - a.nom.length)
          .find(item => d.includes(item.nom.toLowerCase()));
        return found?.nom ?? '';
      };
      const getCategory = (desc: string) => {
        const d = desc.toLowerCase();
        if (d.includes('perruque')) return 'Perruque';
        if (d.includes('tissage')) return 'Tissages';
        if (d.includes('extension')) return 'Extension';
        return 'Autres';
      };
      const getSize = (desc: string) => {
        const t = findAttr(desc, tailles);
        const n = Number((t.match(/\d+/) || [])[0]);
        if (!isNaN(n) && n > 0) return n;
        const m = (desc.match(/\b(\d{1,2})\s*(pouce|po|")?/i) || [])[1];
        const n2 = Number(m);
        return isNaN(n2) ? 9999 : n2;
      };

      // Regroupement par colonne
      const groups = new Map<string, { title: string; rows: { size: number; label: string; qty: number }[] }>();
      results.forEach(p => {
        const desc = p.description || '';
        const parts = [getCategory(desc), findAttr(desc, modeles), findAttr(desc, couleurs)].filter(Boolean);
        const title = parts.join(', ');
        const key = title.toLowerCase();
        if (!groups.has(key)) groups.set(key, { title, rows: [] });
        const size = getSize(desc);
        groups.get(key)!.rows.push({
          size,
          label: size === 9999 ? (p.code || desc) : `${size} pouces`,
          qty: p.quantity || 0,
        });
      });

      const cols = Array.from(groups.values())
        .map(g => ({ ...g, rows: g.rows.sort((a, b) => a.size - b.size) }))
        .sort((a, b) => a.title.localeCompare(b.title, 'fr'));

      if (cols.length === 0) {
        toast({ variant: 'destructive', title: 'Aucune donnée', description: 'Aucun produit à mettre en tableau' });
        return;
      }

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const w = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();

      const perPage = 4;
      const marginX = 10;
      const usable = w - marginX * 2;

      for (let page = 0; page * perPage < cols.length; page++) {
        if (page > 0) doc.addPage();
        const pageCols = cols.slice(page * perPage, page * perPage + perPage);
        const colW = usable / perPage;

        doc.setFillColor(124, 58, 237);
        doc.rect(0, 0, w, 18, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Tableau du stock', marginX, 12);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(new Date().toLocaleString('fr-FR'), w - marginX, 12, { align: 'right' });

        const top = 26;
        pageCols.forEach((col, i) => {
          const x = marginX + i * colW;

          // Titre de colonne
          doc.setFillColor(243, 232, 255);
          doc.rect(x + 1, top, colW - 2, 10, 'F');
          doc.setTextColor(88, 28, 135);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          const titleLines = doc.splitTextToSize(col.title, colW - 6).slice(0, 2);
          doc.text(titleLines, x + 3, top + (titleLines.length > 1 ? 4 : 6.5));

          // Lignes
          let y = top + 15;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(30, 30, 30);
          doc.setFontSize(8);
          col.rows.forEach((r, ri) => {
            if (y > ph - 12) return;
            if (ri % 2 === 0) {
              doc.setFillColor(250, 245, 255);
              doc.rect(x + 1, y - 4, colW - 2, 6, 'F');
            }
            doc.text(doc.splitTextToSize(r.label, colW - 22)[0], x + 3, y);
            doc.text(`x${r.qty}`, x + colW - 4, y, { align: 'right' });
            y += 6;
          });

          // Total colonne
          if (y < ph - 8) {
            doc.setDrawColor(168, 85, 247);
            doc.line(x + 1, y - 3, x + colW - 1, y - 3);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(88, 28, 135);
            doc.text(`Total: ${col.rows.reduce((s, r) => s + r.qty, 0)}`, x + 3, y + 2);
          }
        });
      }

      doc.save(`tableau_stock_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast({ title: 'Tableau généré', description: `${cols.length} colonne(s) exportée(s)` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erreur PDF', description: 'Impossible de générer le tableau' });
    }
  };

  const [descriptionOrder, setDescriptionOrder] = useState<"asc" | "desc">("asc");

  const sortedResults = useMemo(() => {
    const extractCategory = (desc: string = '') => {
      const d = desc.toLowerCase();

      if (d.includes('perruque')) return 1;
      if (d.includes('tissages')) return 2;
      if (d.includes('extension')) return 3;
      return 4;
    };

    const findAttribute = (desc: string = '', list: { nom: string }[]) => {
      const d = desc.toLowerCase();

      const found = list.find(item =>
        d.includes(item.nom.toLowerCase())
      );

      return found?.nom ?? '';
    };

    const extractSize = (desc: string = '') => {
      const d = desc.toLowerCase();

      const match = d.match(/\b(\d{1,2})\b/);

      if (match) return Number(match[1]);

      const taille = tailles.find(t =>
        d.includes(t.nom.toLowerCase())
      );

      if (!taille) return 999;

      const n = Number(taille.nom);

      return isNaN(n) ? 999 : n;
    };

    return [...results].sort((a, b) => {
      const da = a.description || '';
      const db = b.description || '';

      let result = 0;

      // 1. Catégorie
      result = extractCategory(da) - extractCategory(db);
      if (result !== 0) return descriptionOrder === "asc" ? result : -result;

      // 2. Modèle
      result = findAttribute(da, modeles).localeCompare(findAttribute(db, modeles), "fr");
      if (result !== 0) return descriptionOrder === "asc" ? result : -result;

      // 3. Couleur
      result = findAttribute(da, couleurs).localeCompare(findAttribute(db, couleurs), "fr");
      if (result !== 0) return descriptionOrder === "asc" ? result : -result;

      // 4. Taille
      result = extractSize(da) - extractSize(db);
      if (result !== 0) return descriptionOrder === "asc" ? result : -result;

      // 5. Code
      result = (a.code || "").localeCompare(b.code || "", "fr");

      return descriptionOrder === "asc" ? result : -result;
    });
  }, [results, modeles, couleurs, tailles, descriptionOrder]);





  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden p-0 rounded-2xl border-violet-200/60 dark:border-violet-800/60 shadow-2xl bg-white/95 dark:bg-gray-950/95 flex flex-col">
        <DialogHeader className="p-5 pb-3 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white shrink-0">
          <DialogTitle className="flex items-center gap-3 text-white text-lg font-black">
            <Package className="h-5 w-5" /> Liste du Stock
            <Button
              type="button"
              onClick={exportTableau}
              size="sm"
              disabled={results.length === 0}
              className="ml-auto bg-white/20 text-white border border-white/40 hover:bg-white/30 rounded-xl font-bold shadow-lg transition-all"
            >
              <Table className="h-4 w-4 mr-1.5" /> Tableau
            </Button>
            <Button
              type="button"
              onClick={exportPdf}
              size="sm"
              disabled={results.length === 0}
              className="bg-white/90 text-violet-700 hover:bg-white rounded-xl font-bold shadow-lg transition-all"
            >
              <Printer className="h-4 w-4 mr-1.5" /> PDF
            </Button>
          </DialogTitle>
          <p className="text-xs text-white/80">Sélectionnez les attributs (choix multiple sur chaque attribut)</p>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0">
          <div className="shrink-0 p-5 space-y-4 overflow-y-auto max-h-[38vh] scrollbar-thin">
            <ProductClassificationSelector
              value={classification}
              onChange={setClassification}
              mode="filter"
              multiple
              defaultOpen
            />

            <div className="flex items-center justify-between gap-3 flex-wrap pt-3 border-t border-violet-200/50 dark:border-violet-800/50">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-200 font-bold">{results.length} produit(s)</Badge>
                <Badge className="bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/50 dark:text-fuchsia-200 font-bold">Qté totale: {totalQty}</Badge>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200 font-bold">Valeur: {totalValue.toFixed(2)}€</Badge>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setClassification({})}>
                <X className="h-3.5 w-3.5 mr-1" /> Réinitialiser
              </Button>
            </div>
          </div>

          <div className="flex-1 min-h-0 mx-5 mb-5 rounded-2xl border border-violet-200/50 dark:border-violet-800/50 overflow-hidden flex flex-col bg-white/60 dark:bg-gray-900/60 shadow-inner">
            <div className="shrink-0 grid grid-cols-12 gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-50/80 to-fuchsia-50/80 dark:from-violet-900/40 dark:to-fuchsia-900/40 text-[11px] font-black text-violet-800 dark:text-violet-200 uppercase tracking-wide border-b border-violet-100 dark:border-violet-900/40">
              <div className="col-span-3">Code</div>
              <div className="col-span-5 flex items-center gap-2">
                <span>Description</span>

                <button
                  type="button"
                  onClick={() => setDescriptionOrder("asc")}
                  className={`p-0.5 rounded transition ${descriptionOrder === "asc"
                    ? "text-violet-700 dark:text-violet-300"
                    : "text-gray-400 hover:text-violet-600"
                    }`}
                  title="Trier de A vers Z"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setDescriptionOrder("desc")}
                  className={`p-0.5 rounded transition ${descriptionOrder === "desc"
                    ? "text-violet-700 dark:text-violet-300"
                    : "text-gray-400 hover:text-violet-600"
                    }`}
                  title="Trier de Z vers A"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="col-span-1 text-right">Qté</div>
              <div className="col-span-3 text-right">Prix</div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-violet-100/60 dark:divide-violet-900/40">
              {results.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">Aucun produit ne correspond aux filtres</div>
              ) : (
                sortedResults.map(p => (
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
