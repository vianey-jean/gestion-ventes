/**
 * FacturationModal - Recherche & téléchargement des factures/reçus
 *
 * Étapes :
 *  1. Choisir le type : Achat ou Dépense
 *  2. Choisir l'année
 *  3a. Pour un achat : barre de recherche produit (suggère parmi les achats
 *      ayant une description correspondante), puis sélection du mois où il y a
 *      un achat avec facture, puis téléchargement.
 *  3b. Pour une dépense : sélection du mois, puis liste des dépenses avec reçu.
 *
 * Conversion : si la facture est une image (JPG/PNG/...), elle est convertie
 * en PDF avant téléchargement. Si c'est déjà un PDF, on télécharge tel quel.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  FileSearch,
  Package,
  Receipt,
  Search,
  Download,
  FileText,
  Image as ImageIcon,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import nouvelleAchatApiService from '@/services/api/nouvelleAchatApi';
import { NouvelleAchat } from '@/types/comptabilite';
import { getBaseURL } from '@/services/api/api';
import jsPDF from 'jspdf';

interface FacturationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const YEARS = [2023, 2024, 2025, 2026];

type Step = 'type' | 'year' | 'achatSearch' | 'achatMonths' | 'depenseMonth' | 'depenseList';

/** Convertit une image (URL accessible) en PDF Blob via jsPDF. */
async function imageUrlToPdfBlob(imageUrl: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        const orientation = w >= h ? 'l' : 'p';
        const pdf = new jsPDF({ orientation, unit: 'px', format: [w, h] });
        // Détermine le format à partir de l'URL
        const lower = imageUrl.toLowerCase();
        let fmt: 'JPEG' | 'PNG' | 'WEBP' = 'JPEG';
        if (lower.includes('.png')) fmt = 'PNG';
        else if (lower.includes('.webp')) fmt = 'WEBP';
        pdf.addImage(img, fmt, 0, 0, w, h);
        resolve(pdf.output('blob'));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Impossible de charger l\'image'));
    img.src = imageUrl;
  });
}

async function downloadInvoice(receiptUrl: string, baseName: string) {
  const fullUrl = `${getBaseURL()}${receiptUrl}`;
  const isPdf = /\.pdf($|\?)/i.test(receiptUrl);

  try {
    if (isPdf) {
      // Téléchargement direct du PDF original
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Image → conversion en PDF
      const pdfBlob = await imageUrlToPdfBlob(fullUrl);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    toast({
      title: 'Téléchargement réussi',
      description: `${baseName}.pdf`,
      className: 'bg-green-600 text-white border-green-700',
    });
  } catch (err) {
    console.error('Erreur téléchargement facture:', err);
    toast({
      title: 'Erreur',
      description: 'Impossible de télécharger la facture.',
      variant: 'destructive',
    });
  }
}

const FacturationModal: React.FC<FacturationModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<Step>('type');
  const [docType, setDocType] = useState<'achat' | 'depense' | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [selectedDescription, setSelectedDescription] = useState<string | null>(null);
  const [yearAchats, setYearAchats] = useState<NouvelleAchat[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  // Reset à chaque ouverture
  useEffect(() => {
    if (isOpen) {
      setStep('type');
      setDocType(null);
      setYear(null);
      setProductSearch('');
      setSelectedDescription(null);
      setYearAchats([]);
      setSelectedMonth(null);
    }
  }, [isOpen]);

  // Charger les achats/dépenses de l'année sélectionnée
  useEffect(() => {
    if (!year) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await nouvelleAchatApiService.getByYear(year);
        if (!cancelled) setYearAchats(data);
      } catch (e) {
        console.error(e);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les données.',
          variant: 'destructive',
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [year]);

  // Suggestions produits (uniquement les achats produit ayant une facture)
  const productSuggestions = useMemo(() => {
    if (!docType || docType !== 'achat') return [];
    const term = productSearch.trim().toLowerCase();
    if (term.length < 1) return [];
    const map = new Map<string, number>();
    yearAchats
      .filter(a => a.type === 'achat_produit' && a.receiptUrl)
      .forEach(a => {
        const desc = a.productDescription || '';
        if (desc.toLowerCase().includes(term)) {
          map.set(desc, (map.get(desc) || 0) + 1);
        }
      });
    return Array.from(map.entries()).slice(0, 12);
  }, [productSearch, yearAchats, docType]);

  // Mois disponibles pour le produit sélectionné
  const monthsForProduct = useMemo(() => {
    if (!selectedDescription) return [];
    const months = new Set<number>();
    yearAchats
      .filter(a => a.type === 'achat_produit'
        && a.receiptUrl
        && a.productDescription === selectedDescription)
      .forEach(a => months.add(new Date(a.date).getMonth() + 1));
    return Array.from(months).sort((a, b) => a - b);
  }, [yearAchats, selectedDescription]);

  // Achats du produit et du mois sélectionné
  const achatsForMonth = useMemo(() => {
    if (!selectedDescription || !selectedMonth) return [];
    return yearAchats.filter(a =>
      a.type === 'achat_produit'
      && a.receiptUrl
      && a.productDescription === selectedDescription
      && new Date(a.date).getMonth() + 1 === selectedMonth
    );
  }, [yearAchats, selectedDescription, selectedMonth]);

  // Dépenses du mois sélectionné (avec reçu)
  const depensesForMonth = useMemo(() => {
    if (docType !== 'depense' || !selectedMonth) return [];
    return yearAchats.filter(a =>
      a.type !== 'achat_produit'
      && a.receiptUrl
      && new Date(a.date).getMonth() + 1 === selectedMonth
    );
  }, [yearAchats, selectedMonth, docType]);

  // Mois où il y a des dépenses avec reçu
  const monthsForDepenses = useMemo(() => {
    if (docType !== 'depense') return [];
    const months = new Set<number>();
    yearAchats
      .filter(a => a.type !== 'achat_produit' && a.receiptUrl)
      .forEach(a => months.add(new Date(a.date).getMonth() + 1));
    return Array.from(months).sort((a, b) => a - b);
  }, [yearAchats, docType]);

  const goBack = () => {
    if (step === 'year') setStep('type');
    else if (step === 'achatSearch') setStep('year');
    else if (step === 'achatMonths') setStep('achatSearch');
    else if (step === 'depenseMonth') setStep('year');
    else if (step === 'depenseList') setStep('depenseMonth');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-amber-50/40 to-yellow-50/40 dark:from-gray-900 dark:via-amber-950/30 dark:to-yellow-950/30 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 shadow-lg">
              <FileSearch className="h-6 w-6 text-white" />
            </div>
            Recherche de Facturation
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Retrouvez et téléchargez les factures d'achats et reçus de dépenses.
          </DialogDescription>
        </DialogHeader>

        {step !== 'type' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="self-start text-amber-700 dark:text-amber-300"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
        )}

        {/* ÉTAPE 1 : choix du type */}
        {step === 'type' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <button
              type="button"
              onClick={() => { setDocType('achat'); setStep('year'); }}
              className="p-6 rounded-2xl border-2 border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100/70 hover:scale-[1.02] transition-all flex flex-col items-center gap-3"
            >
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <Package className="h-8 w-8 text-white" />
              </div>
              <span className="font-bold text-lg text-blue-700 dark:text-blue-300">Achat de produit</span>
              <span className="text-xs text-gray-500 text-center">Factures liées aux achats de produits</span>
            </button>
            <button
              type="button"
              onClick={() => { setDocType('depense'); setStep('year'); }}
              className="p-6 rounded-2xl border-2 border-orange-200 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-900/20 hover:bg-orange-100/70 hover:scale-[1.02] transition-all flex flex-col items-center gap-3"
            >
              <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600">
                <Receipt className="h-8 w-8 text-white" />
              </div>
              <span className="font-bold text-lg text-orange-700 dark:text-orange-300">Dépense</span>
              <span className="text-xs text-gray-500 text-center">Reçus de taxes, carburant, autres dépenses</span>
            </button>
          </div>
        )}

        {/* ÉTAPE 2 : choix de l'année */}
        {step === 'year' && (
          <div className="space-y-4 py-4">
            <p className="text-sm font-semibold">Sélectionnez l'année</p>
            <Select
              value={year ? String(year) : ''}
              onValueChange={(v) => {
                setYear(parseInt(v));
                setStep(docType === 'achat' ? 'achatSearch' : 'depenseMonth');
              }}
            >
              <SelectTrigger className="h-12 rounded-xl bg-white dark:bg-gray-800">
                <SelectValue placeholder="Choisir une année" />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map(y => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* ÉTAPE 3a (achat) : recherche produit */}
        {step === 'achatSearch' && (
          <div className="space-y-4 py-4">
            <p className="text-sm font-semibold">
              Recherchez un produit ({year})
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Saisissez le nom du produit..."
                className="pl-10 h-12 rounded-xl"
                autoFocus
              />
            </div>

            {loading && (
              <div className="flex items-center justify-center py-6 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
              </div>
            )}

            {!loading && productSearch.length >= 1 && productSuggestions.length === 0 && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">Aucun produit avec facture trouvé pour cette recherche.</span>
              </div>
            )}

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {productSuggestions.map(([desc, count]) => (
                <button
                  key={desc}
                  type="button"
                  onClick={() => {
                    setSelectedDescription(desc);
                    setStep('achatMonths');
                  }}
                  className="w-full text-left p-3 rounded-xl border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Package className="h-5 w-5 text-blue-500 shrink-0" />
                    <span className="font-semibold truncate">{desc}</span>
                  </div>
                  <Badge className="bg-blue-500">{count} facture{count > 1 ? 's' : ''}</Badge>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ÉTAPE 4a (achat) : choix du mois puis liste */}
        {step === 'achatMonths' && selectedDescription && (
          <div className="space-y-4 py-4">
            <p className="text-sm font-semibold">
              <span className="text-blue-600">{selectedDescription}</span> — Mois disponibles ({year})
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {monthsForProduct.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMonth(m)}
                  className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    selectedMonth === m
                      ? 'border-blue-500 bg-blue-500 text-white shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300'
                  }`}
                >
                  {MONTHS[m - 1]}
                </button>
              ))}
            </div>

            {selectedMonth && (
              <div className="space-y-2 mt-4">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Factures pour {MONTHS[selectedMonth - 1]} {year}
                </p>
                {achatsForMonth.map(a => {
                  const isPdf = /\.pdf($|\?)/i.test(a.receiptUrl || '');
                  return (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    >
                      <div className={`h-12 w-12 shrink-0 rounded-xl flex items-center justify-center ${isPdf ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                        {isPdf
                          ? <FileText className="h-6 w-6 text-red-500" />
                          : <ImageIcon className="h-6 w-6 text-blue-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{a.productDescription}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(a.date).toLocaleDateString('fr-FR')}
                          {a.fournisseur && ` • ${a.fournisseur}`}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
                          downloadInvoice(
                            a.receiptUrl!,
                            `facture-${(a.productDescription || 'achat').replace(/[^\w-]+/g, '_')}-${new Date(a.date).toISOString().slice(0, 10)}`
                          )
                        }
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ÉTAPE 3b (dépense) : choix mois */}
        {step === 'depenseMonth' && (
          <div className="space-y-4 py-4">
            <p className="text-sm font-semibold">Mois disponibles ({year})</p>
            {monthsForDepenses.length === 0 && !loading ? (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">Aucun reçu de dépense pour cette année.</span>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {monthsForDepenses.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setSelectedMonth(m); setStep('depenseList'); }}
                    className="p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-400 text-sm font-semibold"
                  >
                    {MONTHS[m - 1]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ÉTAPE 4b (dépense) : liste */}
        {step === 'depenseList' && selectedMonth && (
          <div className="space-y-2 py-4">
            <p className="text-sm font-semibold">
              Reçus de dépense — {MONTHS[selectedMonth - 1]} {year}
            </p>
            {depensesForMonth.map(d => {
              const isPdf = /\.pdf($|\?)/i.test(d.receiptUrl || '');
              return (
                <div
                  key={d.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <div className={`h-12 w-12 shrink-0 rounded-xl flex items-center justify-center ${isPdf ? 'bg-red-100 dark:bg-red-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                    {isPdf
                      ? <FileText className="h-6 w-6 text-red-500" />
                      : <ImageIcon className="h-6 w-6 text-orange-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{d.description || d.productDescription}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(d.date).toLocaleDateString('fr-FR')}
                      {d.categorie && ` • ${d.categorie}`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      downloadInvoice(
                        d.receiptUrl!,
                        `recu-${(d.description || 'depense').replace(/[^\w-]+/g, '_')}-${new Date(d.date).toISOString().slice(0, 10)}`
                      )
                    }
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FacturationModal;