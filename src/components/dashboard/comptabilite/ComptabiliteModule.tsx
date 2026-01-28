import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  Fuel,
  Receipt,
  Plus,
  DollarSign,
  PiggyBank,
  BarChart3,
  Search,
  CheckCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  Sparkles,
  FileDown
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';
import nouvelleAchatApiService from '@/services/api/nouvelleAchatApi';
import productApiService from '@/services/api/productApi';
import { ProductFormData } from '@/types/product';
import comptaApiService from '@/services/api/comptaApi';
import { NouvelleAchat, NouvelleAchatFormData, DepenseFormData, ComptabiliteData } from '@/types/comptabilite';
import { Product } from '@/types/product';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Import des composants de graphiques stables
import { StableBarChart, StablePieChart } from './StableCharts';
import { motion } from 'framer-motion';

interface ComptabiliteModuleProps {
  className?: string;
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const ComptabiliteModule: React.FC<ComptabiliteModuleProps> = ({ className }) => {
  const { products, allSales, fetchProducts } = useApp();
  const { formatEuro } = useCurrencyFormatter();
  
  // États
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [achats, setAchats] = useState<NouvelleAchat[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAchatForm, setShowAchatForm] = useState(false);
  const [showDepenseForm, setShowDepenseForm] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1);
  const [exportYear, setExportYear] = useState(new Date().getFullYear());
  
  // États des modales de détails pour les cartes cliquables
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showDebitModal, setShowDebitModal] = useState(false);
  const [showBeneficeVentesModal, setShowBeneficeVentesModal] = useState(false);
  const [showBeneficeReelModal, setShowBeneficeReelModal] = useState(false);
  
  // États du formulaire d'achat
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductList, setShowProductList] = useState(false);
  const [achatForm, setAchatForm] = useState<NouvelleAchatFormData>({
    productDescription: '',
    purchasePrice: 0,
    quantity: 0,
    fournisseur: '',
    caracteristiques: ''
  });
  
  // États du formulaire de dépense
  const [depenseForm, setDepenseForm] = useState<DepenseFormData>({
    description: '',
    montant: 0,
    type: 'autre_depense',
    categorie: 'divers'
  });

  // Ref pour éviter les appels multiples
  const loadingRef = useRef(false);

  // Filtrer les produits pour la recherche - mémorisé
  const filteredProducts = useMemo(() => {
    if (searchTerm.length < 3 || !showProductList) return [];
    return products.filter(p => 
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, products, showProductList]);

  // Charger les achats - mémorisé avec useCallback
  const loadAchats = useCallback(async () => {
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
      const data = await nouvelleAchatApiService.getByMonthYear(selectedYear, selectedMonth);
      setAchats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des achats:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadAchats();
  }, [loadAchats]);

  // Ventes du mois - mémorisé pour réutilisation dans les modales
  const monthlySales = useMemo(() => {
    return allSales.filter(sale => {
      const date = new Date(sale.date);
      return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;
    });
  }, [allSales, selectedMonth, selectedYear]);

  // Calculer les statistiques de comptabilité - mémorisé avec référence stable
  const comptabiliteData = useMemo<ComptabiliteData>(() => {
    const salesTotal = monthlySales.reduce((sum, sale) => {
      if (sale.products && Array.isArray(sale.products)) {
        return sum + (sale.totalSellingPrice || 0);
      }
      return sum + (sale.sellingPrice * sale.quantitySold);
    }, 0);

    const salesCost = monthlySales.reduce((sum, sale) => {
      if (sale.products && Array.isArray(sale.products)) {
        return sum + (sale.totalPurchasePrice || 0);
      }
      return sum + (sale.purchasePrice * sale.quantitySold);
    }, 0);

    const salesProfit = monthlySales.reduce((sum, sale) => {
      if (sale.products && Array.isArray(sale.products)) {
        return sum + (sale.totalProfit || 0);
      }
      return sum + sale.profit;
    }, 0);

    const salesCount = monthlySales.length;

    // Achats/dépenses du mois
    const achatsProducts = achats.filter(a => a.type === 'achat_produit');
    const depenses = achats.filter(a => a.type !== 'achat_produit');

    const achatsTotal = achatsProducts.reduce((sum, a) => sum + a.totalCost, 0);
    const depensesTotal = depenses.reduce((sum, a) => sum + a.totalCost, 0);

    // Bénéfice réel = Bénéfice des ventes - (Achats + Dépenses)
    const beneficeReel = salesProfit - (achatsTotal + depensesTotal);

    // Solde Débit/Crédit
    const totalCredit = salesTotal;
    const totalDebit = achatsTotal + depensesTotal;
    const soldeNet = totalCredit - totalDebit;

    return {
      salesTotal,
      salesProfit,
      salesCost,
      salesCount,
      achatsTotal,
      depensesTotal,
      beneficeReel,
      totalDebit,
      totalCredit,
      soldeNet
    };
  }, [monthlySales, achats]);

  // Sauvegarder les données de comptabilité dans la base de données
  const saveComptaData = useCallback(async () => {
    try {
      console.log(`💾 Saving compta data for ${selectedMonth}/${selectedYear}...`);
      await comptaApiService.calculateMonth(selectedYear, selectedMonth);
      console.log('✅ Compta data saved successfully');
    } catch (error) {
      console.error('❌ Error saving compta data:', error);
    }
  }, [selectedMonth, selectedYear]);

  // Sauvegarder les données de comptabilité chaque fois que les données changent
  useEffect(() => {
    if (comptabiliteData && (comptabiliteData.salesCount > 0 || achats.length > 0)) {
      saveComptaData();
    }
  }, [comptabiliteData, achats.length, saveComptaData]);

  // Données pour les graphiques mensuels - STABLE et MÉMORISÉ
  const monthlyChartData = useMemo(() => {
    const data = [];
    for (let i = 1; i <= 12; i++) {
      const monthSales = allSales.filter(sale => {
        const date = new Date(sale.date);
        return date.getMonth() + 1 === i && date.getFullYear() === selectedYear;
      });

      const profit = monthSales.reduce((sum, sale) => {
        if (sale.products && Array.isArray(sale.products)) {
          return sum + (sale.totalProfit || 0);
        }
        return sum + sale.profit;
      }, 0);

      const monthAchats = achats.filter(a => {
        const date = new Date(a.date);
        return date.getMonth() + 1 === i;
      });

      const depenses = monthAchats.reduce((sum, a) => sum + a.totalCost, 0);
      const beneficeReel = profit - depenses;

      data.push({
        name: MONTHS[i - 1].slice(0, 3),
        beneficeVentes: profit,
        depenses: depenses,
        beneficeReel: beneficeReel
      });
    }
    return data;
  }, [allSales, achats, selectedYear]);

  // Répartition des dépenses - STABLE
  const depensesRepartition = useMemo(() => {
    const byType: Record<string, number> = {};
    achats.forEach(a => {
      const label = a.type === 'achat_produit' ? 'Achats Produits' : 
                   a.type === 'taxes' ? 'Taxes' :
                   a.type === 'carburant' ? 'Carburant' : 'Autres';
      byType[label] = (byType[label] || 0) + a.totalCost;
    });
    return Object.entries(byType).map(([name, value]) => ({ name, value }));
  }, [achats]);

  // Handlers mémorisés
  const handleSelectProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setSearchTerm(product.description);
    setShowProductList(false); // Cacher la liste après sélection
    // Pré-remplir la description pour permettre la modification du nom
    // L'utilisateur doit entrer une nouvelle quantité obligatoirement
    // Le prix d'achat est optionnel (peut garder l'ancien)
    setAchatForm(prev => ({
      ...prev,
      productId: product.id,
      productDescription: product.description, // Pré-remplir pour modification
      purchasePrice: 0, // Vide - le nouveau prix est optionnel
      quantity: 0, // Vide - l'utilisateur doit saisir une nouvelle quantité
      fournisseur: prev.fournisseur || '',
      caracteristiques: prev.caracteristiques || product.description
    }));
  }, []);

  /**
   * handleSubmitAchat - Gère la soumission du formulaire de nouvel achat
   * 
   * Logique de fonctionnement :
   * 1. Validation : description et quantité obligatoires, prix optionnel
   * 2. Si produit existant sélectionné (selectedProduct) : mise à jour du stock dans products.json
   * 3. Si NOUVEAU produit (selectedProduct est null) : création du produit dans products.json
   * 4. Dans tous les cas : enregistrement de l'achat dans nouvelle_achat.json
   * 
   * @returns {Promise<void>}
   */
  /**
   * handleSubmitAchat - Gère la soumission du formulaire de nouvel achat
   * 
   * CORRECTION DU BUG DE DOUBLE QUANTITÉ :
   * Le backend (NouvelleAchat.create) gère TOUTE la logique de création/mise à jour du produit.
   * Le frontend envoie seulement les données de l'achat.
   * Cela évite la double incrémentation de la quantité.
   */
  const handleSubmitAchat = useCallback(async () => {
    try {
      // ========================================
      // ÉTAPE 1: Validation des champs obligatoires
      // ========================================
      if (!achatForm.productDescription || achatForm.quantity <= 0) {
        toast({
          title: 'Erreur',
          description: 'Veuillez remplir la description et la quantité',
          variant: 'destructive'
        });
        return;
      }

      // ========================================
      // ÉTAPE 2: Déterminer le prix d'achat final
      // ========================================
      const finalPurchasePrice = achatForm.purchasePrice > 0 
        ? achatForm.purchasePrice 
        : (selectedProduct?.purchasePrice || 0);

      // ========================================
      // ÉTAPE 3: Envoyer l'achat au backend
      // Le backend gère la création/mise à jour du produit dans products.json
      // ET l'enregistrement de l'achat dans nouvelle_achat.json
      // ========================================
      await nouvelleAchatApiService.create({
        productId: selectedProduct?.id, // ID du produit existant ou undefined pour nouveau
        productDescription: achatForm.productDescription,
        purchasePrice: finalPurchasePrice,
        quantity: achatForm.quantity,
        fournisseur: achatForm.fournisseur,
        caracteristiques: achatForm.caracteristiques
      });
      console.log('✅ Achat enregistré - le backend gère le produit');
      
      // ========================================
      // ÉTAPE 4: Message de succès
      // ========================================
      if (selectedProduct) {
        const nameChanged = achatForm.productDescription !== selectedProduct.description;
        toast({
          title: 'Succès',
          description: `Stock mis à jour: +${achatForm.quantity} unités${
            achatForm.purchasePrice > 0
              ? `, nouveau prix: ${formatEuro(achatForm.purchasePrice)}`
              : ''
          }${nameChanged ? `, nom modifié` : ''}`,
          className: 'bg-green-600 text-white border-green-700'
        });
      } else {
        toast({
          title: '🆕 Nouveau produit créé',
          description: `"${achatForm.productDescription}" ajouté à l'inventaire avec ${achatForm.quantity} unités`,
          className: 'bg-blue-600 text-white border-blue-700'
        });
      }

      // ========================================
      // ÉTAPE 5: Réinitialiser le formulaire
      // ========================================
      setAchatForm({
        productDescription: '',
        purchasePrice: 0,
        quantity: 0,
        fournisseur: '',
        caracteristiques: ''
      });
      setSelectedProduct(null);
      setSearchTerm('');
      setShowProductList(false);
      setShowAchatForm(false);
      
      // ========================================
      // ÉTAPE 6: Rafraîchir les données
      // ========================================
      loadAchats();
      fetchProducts();
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement de l\'achat:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer l\'achat',
        variant: 'destructive'
      });
    }
  }, [achatForm, selectedProduct, loadAchats, fetchProducts, formatEuro]);

  const handleSubmitDepense = useCallback(async () => {
    try {
      if (!depenseForm.description || depenseForm.montant <= 0) {
        toast({
          title: 'Erreur',
          description: 'Veuillez remplir tous les champs obligatoires',
          variant: 'destructive'
        });
        return;
      }

      await nouvelleAchatApiService.addDepense(depenseForm);
      
     toast({
  title: 'Succès',
  description: 'Dépense enregistrée avec succès',
  className: 'bg-green-600 text-white border-green-700'
})

      
      setDepenseForm({
        description: '',
        montant: 0,
        type: 'autre_depense',
        categorie: 'divers'
      });

      // ✅ FERMETURE DE LA MODALE
    setShowDepenseForm(false);
      // Garder le formulaire ouvert pour permettre des saisies multiples
      // L'utilisateur peut fermer manuellement avec le bouton "Annuler" ou "X"
      
      loadAchats();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer la dépense',
        variant: 'destructive'
      });
    }
  }, [depenseForm, loadAchats]);

  // Handlers pour les Select - mémorisés
  const handleMonthChange = useCallback((v: string) => {
    setSelectedMonth(parseInt(v));
  }, []);

  const handleYearChange = useCallback((v: string) => {
    setSelectedYear(parseInt(v));
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowProductList(value.length >= 3); // Afficher la liste si 3+ caractères
    if (value.length < 3) {
      setSelectedProduct(null);
    }
  }, []);

  const handleAchatFormChange = useCallback((field: keyof NouvelleAchatFormData, value: string | number) => {
    setAchatForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleDepenseFormChange = useCallback((field: keyof DepenseFormData, value: string | number) => {
    setDepenseForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // ========================================
  // FONCTION D'EXPORT PDF
  // ========================================
  /**
 * =====================================================
 * EXPORT PDF - COMPTABILITÉ
 * =====================================================
 * USAGE STRICTEMENT PRIVÉ ET CONFIDENTIEL
 * Reproduction, diffusion ou partage interdit
 * Données financières personnelles
 */

const handleExportPDF = useCallback(async () => {
  try {
    // Récupération des données
    const exportAchats =
      await nouvelleAchatApiService.getByMonthYear(
        exportYear,
        exportMonth
      );

    const exportSales = allSales.filter(sale => {
      const date = new Date(sale.date);
      return (
        date.getMonth() + 1 === exportMonth &&
        date.getFullYear() === exportYear
      );
    });

    // =====================
    // CALCULS
    // =====================
    const salesTotal = exportSales.reduce((sum, sale) => {
      if (sale.products && Array.isArray(sale.products)) {
        return sum + (sale.totalSellingPrice || 0);
      }
      return sum + sale.sellingPrice * sale.quantitySold;
    }, 0);

    const salesProfit = exportSales.reduce((sum, sale) => {
      if (sale.products && Array.isArray(sale.products)) {
        return sum + (sale.totalProfit || 0);
      }
      return sum + sale.profit;
    }, 0);

    const achatsProducts = exportAchats.filter(
      a => a.type === 'achat_produit'
    );
    const depenses = exportAchats.filter(
      a => a.type !== 'achat_produit'
    );

    const achatsTotal = achatsProducts.reduce(
      (sum, a) => sum + a.totalCost,
      0
    );
    const depensesTotal = depenses.reduce(
      (sum, a) => sum + a.totalCost,
      0
    );

    const beneficeReel =
      salesProfit - (achatsTotal + depensesTotal);

    // =====================
    // CRÉATION DU PDF
    // =====================
    const doc = new jsPDF();
    const monthName = MONTHS[exportMonth - 1];

    // ---- TITRE ----
    doc.setFontSize(20);
    doc.setTextColor(0, 90, 0);
    doc.text(
      `Comptabilité - ${monthName} ${exportYear}`,
      105,
      20,
      { align: 'center' }
    );

    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Document privé - Généré le ${new Date().toLocaleDateString(
        'fr-FR'
      )}`,
      105,
      28,
      { align: 'center' }
    );

    // Ligne élégante
    doc.setDrawColor(180, 180, 180);
    doc.line(14, 32, 196, 32);

    let yPosition = 40;

    // =====================
    // SECTION VENTES
    // =====================
    doc.setFontSize(14);
    doc.setTextColor(0, 100, 0);
    doc.text('VENTES', 14, yPosition);
    yPosition += 5;

    if (exportSales.length > 0) {
      const salesData = exportSales.map(sale => {
        const productName =
          sale.products && Array.isArray(sale.products)
            ? sale.products.map(p => p.description).join(', ')
            : sale.description || 'Produit';

        const qty =
          sale.products && Array.isArray(sale.products)
            ? sale.products.reduce(
                (sum, p) => sum + (p.quantitySold || 0),
                0
              )
            : sale.quantitySold || 0;

        const total =
          sale.products && Array.isArray(sale.products)
            ? sale.totalSellingPrice || 0
            : (sale.sellingPrice || 0) *
              (sale.quantitySold || 0);

        const profit =
          sale.products && Array.isArray(sale.products)
            ? sale.totalProfit || 0
            : sale.profit || 0;

        return [
          new Date(sale.date).toLocaleDateString('fr-FR'),
          productName.substring(0, 30),
          qty.toString(),
          `${total.toFixed(2)} €`,
          `${profit.toFixed(2)} €`
        ];
      });

      autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Produit', 'Qté', 'Total', 'Bénéfice']],
        body: salesData,
        theme: 'striped',
        headStyles: { fillColor: [34, 139, 34] },
        styles: { fontSize: 8 }
      });

      yPosition =
        (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text('Aucune vente', 14, yPosition + 5);
      yPosition += 15;
    }

    // =====================
    // SECTION DÉPENSES
    // =====================
    doc.setFontSize(14);
    doc.setTextColor(180, 0, 0);
    doc.text('DÉPENSES', 14, yPosition);
    yPosition += 5;

    const allExpenses = [...achatsProducts, ...depenses];

    if (allExpenses.length > 0) {
      const expenseData = allExpenses.map(expense => {
        const typeLabel =
          expense.type === 'achat_produit'
            ? 'Achat'
            : expense.type === 'taxes'
            ? 'Taxes'
            : expense.type === 'carburant'
            ? 'Carburant'
            : 'Autre';

        return [
          new Date(expense.date).toLocaleDateString('fr-FR'),
          typeLabel,
          (expense.productDescription ||
            expense.description ||
            '').substring(0, 35),
          `${expense.totalCost.toFixed(2)} €`
        ];
      });

      autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Type', 'Description', 'Montant']],
        body: expenseData,
        theme: 'striped',
        headStyles: { fillColor: [220, 53, 69] },
        styles: { fontSize: 8 }
      });

      yPosition =
        (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text('Aucune dépense', 14, yPosition + 5);
      yPosition += 15;
    }

    // =====================
    // RÉSUMÉ FINANCIER
    // =====================
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 120);
    doc.text('RÉSUMÉ FINANCIER', 14, yPosition);
    yPosition += 5;

    autoTable(doc, {
      startY: yPosition,
      head: [['Description', 'Montant']],
      body: [
        ['Total ventes', `${salesTotal.toFixed(2)} €`],
        ['Bénéfice brut', `${salesProfit.toFixed(2)} €`],
        ['Achats produits', `- ${achatsTotal.toFixed(2)} €`],
        ['Autres dépenses', `- ${depensesTotal.toFixed(2)} €`],
        [
          'Total dépenses',
          `- ${(achatsTotal + depensesTotal).toFixed(
            2
          )} €`
        ],
        ['BÉNÉFICE RÉEL', `${beneficeReel.toFixed(2)} €`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 120] },
      styles: { fontSize: 10 },
      didParseCell: data => {
        if (data.row.index === 5) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor =
            beneficeReel >= 0
              ? [210, 245, 210]
              : [255, 220, 220];
          data.cell.styles.textColor =
            beneficeReel >= 0
              ? [0, 100, 0]
              : [150, 0, 0];
        }
      }
    });

    // =====================
// MENTIONS LÉGALES & SIGNATURE COMPTABLE
// =====================

// Toujours sur la dernière page
const pageHeight = doc.internal.pageSize.getHeight();
const pageWidth = doc.internal.pageSize.getWidth();

// ---- CONFIDENTIALITÉ ----
doc.setFontSize(8);
doc.setTextColor(120, 120, 120);
doc.text(
  'Document comptable strictement confidentiel.\n' +
    'Réservé exclusivement à un usage interne.\n' +
    'Toute diffusion, reproduction ou transmission à des tiers\n' +
    'sans autorisation écrite est formellement interdite.',
  14,
  pageHeight - 40
);

// ---- SIGNATURE ----
const signatureY = pageHeight - 30;
const signatureX = pageWidth - 20;

// Titre
doc.setFontSize(9);
doc.setTextColor(90, 90, 90);
doc.text(
  'Responsable Comptable',
  signatureX,
  signatureY - 8,
  { align: 'right' }
);

// Nom / Signature
doc.setFontSize(12);
doc.setTextColor(160, 0, 0);
doc.text(
  'La Direction',
  signatureX,
  signatureY,
  { align: 'right' }
);

// Ligne de signature
const signText = 'La Direction';
const signWidth =
  (doc.getStringUnitWidth(signText) *
    doc.getFontSize()) /
  doc.internal.scaleFactor;

doc.setDrawColor(160, 0, 0);
doc.line(
  signatureX - signWidth,
  signatureY + 1,
  signatureX,
  signatureY + 1
);

// Date
doc.setFontSize(8);
doc.setTextColor(120, 120, 120);
doc.text(
  `Date : ${new Date().toLocaleDateString('fr-FR')}`,
  signatureX,
  signatureY + 8,
  { align: 'right' }
);


    // =====================
    // SAUVEGARDE
    // =====================
    doc.save(
      `comptabilite_${monthName}_${exportYear}.pdf`
    );

    setShowExportDialog(false);

    toast({
      title: 'Export réussi',
      description: `PDF de ${monthName} ${exportYear} téléchargé`,
      className:
        'bg-green-600 text-white border-green-700'
    });
  } catch (error) {
    console.error('Erreur export PDF:', error);
    toast({
      title: 'Erreur',
      description: 'Impossible de générer le PDF',
      variant: 'destructive'
    });
  }
}, [exportMonth, exportYear, allSales]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec sélection de période */}
      <Card className="bg-gradient-to-br from-emerald-900/40 via-teal-900/30 to-green-900/40 border-emerald-500/30 shadow-2xl backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 shadow-xl">
              <Calculator className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
              Module Comptabilité
            </CardTitle>
          </div>
          <CardDescription className="text-black-300 text-lg">
            Gérez vos achats, dépenses et analysez votre rentabilité
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Select  value={selectedMonth.toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-40 bg-white/10  border-white/20 text-red-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='text-red-800'>
                {MONTHS.map((month, index) => (
                  <SelectItem key={index} value={(index + 1).toString()}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-32 bg-white/10 border-white/20 text-red-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2023, 2024, 2025, 2026].map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              onClick={() => setShowAchatForm(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Nouvel Achat
            </Button>
            
            <Button
              onClick={() => setShowDepenseForm(true)}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-xl"
            >
              <Receipt className="h-4 w-4 mr-2" />
              Nouvelle Dépense
            </Button>
            
            <Button
              onClick={() => setShowExportDialog(true)}
              className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white shadow-xl"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cartes de statistiques - Cliquables */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-500/30 shadow-xl cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300"
          onClick={() => setShowCreditModal(true)}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Crédit</p>
                <p className="text-2xl font-bold text-green-500">{formatEuro(comptabiliteData.totalCredit)}</p>
                <p className="text-xs text-green-400/70">Argent entrant</p>
              </div>
              <ArrowUpCircle className="h-10 w-10 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="bg-gradient-to-br from-red-500/20 to-rose-600/20 border-red-500/30 shadow-xl cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300"
          onClick={() => setShowDebitModal(true)}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Total Débit</p>
                <p className="text-2xl font-bold text-red-500">{formatEuro(comptabiliteData.totalDebit)}</p>
                <p className="text-xs text-red-400/70">Argent sortant</p>
              </div>
              <ArrowDownCircle className="h-10 w-10 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border-blue-500/30 shadow-xl cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300"
          onClick={() => setShowBeneficeVentesModal(true)}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Bénéfice Ventes</p>
                <p className="text-2xl font-bold text-blue-500">{formatEuro(comptabiliteData.salesProfit)}</p>
                <p className="text-xs text-blue-400/70">{comptabiliteData.salesCount} ventes</p>
              </div>
              <TrendingUp className="h-10 w-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`bg-gradient-to-br ${comptabiliteData.beneficeReel >= 0 ? 'from-emerald-500/20 to-teal-600/20 border-emerald-500/30' : 'from-red-500/20 to-rose-600/20 border-red-500/30'} shadow-xl cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300`}
          onClick={() => setShowBeneficeReelModal(true)}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${comptabiliteData.beneficeReel >= 0 ? 'text-emerald-600' : 'text-red-600'} font-medium`}>Bénéfice Réel</p>
                <p className={`text-2xl font-bold ${comptabiliteData.beneficeReel >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {formatEuro(comptabiliteData.beneficeReel)}
                </p>
                <p className={`text-xs ${comptabiliteData.beneficeReel >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'}`}>Après dépenses</p>
              </div>
              <Wallet className={`h-10 w-10 ${comptabiliteData.beneficeReel >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Total Crédit */}
      <Dialog open={showCreditModal} onOpenChange={setShowCreditModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <ArrowUpCircle className="h-6 w-6" />
              Détails Crédit - {MONTHS[selectedMonth - 1]} {selectedYear}
            </DialogTitle>
            <DialogDescription>
              Total: {formatEuro(comptabiliteData.totalCredit)} ({monthlySales.length} ventes)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {monthlySales.length > 0 ? (
              monthlySales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {sale.products && Array.isArray(sale.products) 
                        ? sale.products.map((p: any) => p.description).join(', ')
                        : sale.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(sale.date).toLocaleDateString('fr-FR')}
                      {sale.clientName && ` - ${sale.clientName}`}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {formatEuro(sale.products && Array.isArray(sale.products) 
                      ? (sale.totalSellingPrice || 0) 
                      : (sale.sellingPrice * sale.quantitySold))}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Aucune vente ce mois</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Total Débit */}
      <Dialog open={showDebitModal} onOpenChange={setShowDebitModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <ArrowDownCircle className="h-6 w-6" />
              Détails Débit - {MONTHS[selectedMonth - 1]} {selectedYear}
            </DialogTitle>
            <DialogDescription>
              Total: {formatEuro(comptabiliteData.totalDebit)} ({achats.length} opérations)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {achats.length > 0 ? (
              achats.map((achat) => (
                <div key={achat.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      achat.type === 'achat_produit' ? 'bg-blue-500/20' :
                      achat.type === 'taxes' ? 'bg-red-500/20' :
                      achat.type === 'carburant' ? 'bg-orange-500/20' : 'bg-purple-500/20'
                    }`}>
                      {achat.type === 'achat_produit' ? <Package className="h-4 w-4 text-blue-400" /> :
                       achat.type === 'taxes' ? <Receipt className="h-4 w-4 text-red-400" /> :
                       achat.type === 'carburant' ? <Fuel className="h-4 w-4 text-orange-400" /> :
                       <DollarSign className="h-4 w-4 text-purple-400" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {achat.productDescription || achat.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(achat.date).toLocaleDateString('fr-FR')}
                        {achat.type === 'achat_produit' && ` - Qté: ${achat.quantity}`}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-red-600">
                    {formatEuro(achat.totalCost)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Aucun débit ce mois</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Bénéfice Ventes */}
      <Dialog open={showBeneficeVentesModal} onOpenChange={setShowBeneficeVentesModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600">
              <TrendingUp className="h-6 w-6" />
              Détails Bénéfice Ventes - {MONTHS[selectedMonth - 1]} {selectedYear}
            </DialogTitle>
            <DialogDescription>
              Total: {formatEuro(comptabiliteData.salesProfit)} ({comptabiliteData.salesCount} ventes)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {monthlySales.length > 0 ? (
              monthlySales.map((sale) => {
                const profit = sale.products && Array.isArray(sale.products) 
                  ? (sale.totalProfit || 0) 
                  : sale.profit;
                return (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {sale.products && Array.isArray(sale.products) 
                          ? sale.products.map((p: any) => p.description).join(', ')
                          : sale.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(sale.date).toLocaleDateString('fr-FR')}
                        {sale.clientName && ` - ${sale.clientName}`}
                      </p>
                    </div>
                    <p className={`text-lg font-bold ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatEuro(profit)}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500 py-8">Aucune vente ce mois</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Bénéfice Réel */}
      <Dialog open={showBeneficeReelModal} onOpenChange={setShowBeneficeReelModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${comptabiliteData.beneficeReel >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              <Wallet className="h-6 w-6" />
              Détails Bénéfice Réel - {MONTHS[selectedMonth - 1]} {selectedYear}
            </DialogTitle>
            <DialogDescription>
              Bénéfice Réel = Bénéfice Ventes - (Achats + Dépenses)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Résumé */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <p className="text-sm text-blue-600 font-medium">Bénéfice Ventes</p>
                <p className="text-xl font-bold text-blue-700">{formatEuro(comptabiliteData.salesProfit)}</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                <p className="text-sm text-red-600 font-medium">Total Dépenses</p>
                <p className="text-xl font-bold text-red-700">{formatEuro(comptabiliteData.achatsTotal + comptabiliteData.depensesTotal)}</p>
              </div>
              <div className={`p-4 rounded-lg text-center ${comptabiliteData.beneficeReel >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <p className={`text-sm font-medium ${comptabiliteData.beneficeReel >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>Bénéfice Réel</p>
                <p className={`text-xl font-bold ${comptabiliteData.beneficeReel >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{formatEuro(comptabiliteData.beneficeReel)}</p>
              </div>
            </div>

            {/* Détails des dépenses */}
            <div className="border-t pt-4">
              <p className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Détail des dépenses</p>
              <div className="space-y-2">
                <div className="flex justify-between p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded">
                  <span className="text-indigo-700 dark:text-indigo-300">Achats Produits</span>
                  <span className="font-bold text-indigo-800 dark:text-indigo-200">{formatEuro(comptabiliteData.achatsTotal)}</span>
                </div>
                <div className="flex justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                  <span className="text-orange-700 dark:text-orange-300">Autres Dépenses</span>
                  <span className="font-bold text-orange-800 dark:text-orange-200">{formatEuro(comptabiliteData.depensesTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Détails des dépenses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border-indigo-500/30 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600 font-medium">Achats Produits</p>
                <p className="text-xl font-bold text-indigo-500">{formatEuro(comptabiliteData.achatsTotal)}</p>
              </div>
              <Package className="h-8 w-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500/20 to-amber-600/20 border-orange-500/30 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Autres Dépenses</p>
                <p className="text-xl font-bold text-orange-500">{formatEuro(comptabiliteData.depensesTotal)}</p>
              </div>
              <Receipt className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-cyan-500/30 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-400 font-medium">Solde Net</p>
                <p className={`text-xl font-bold ${comptabiliteData.soldeNet >= 0 ? 'text-cyan-600' : 'text-red-300'}`}>
                  {formatEuro(comptabiliteData.soldeNet)}
                </p>
              </div>
              <PiggyBank className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques - Ordre: Historique, Répartition Dépenses, Évolution Mensuelle */}
      <Tabs defaultValue="historique" className="w-full">
<TabsList
  className="
    grid w-full
    grid-cols-1
    sm:grid-cols-2
    md:grid-cols-3
    gap-3
    bg-white/90 dark:bg-gray-800/90
    shadow-xl
    rounded-xl
    h-auto
    p-2
    sm:p-3
  "
>
  <TabsTrigger
    value="historique"
    className="
      flex items-center justify-center
      gap-2
      h-12 sm:h-14
      px-3
      data-[state=active]:bg-gradient-to-r
      data-[state=active]:from-purple-600
      data-[state=active]:to-pink-600
      data-[state=active]:text-white
      transition-all duration-300
      rounded-lg
      font-bold
      text-sm sm:text-base
    "
  >
    <Receipt className="h-4 w-4 shrink-0" />
    <span className="text-center">Historique</span>
  </TabsTrigger>

  <TabsTrigger
    value="repartition"
    className="
      flex items-center justify-center
      gap-2
      h-12 sm:h-14
      px-3
      data-[state=active]:bg-gradient-to-r
      data-[state=active]:from-blue-600
      data-[state=active]:to-indigo-600
      data-[state=active]:text-white
      transition-all duration-300
      rounded-lg
      font-bold
      text-sm sm:text-base
      text-center
    "
  >
    <Calculator className="h-4 w-4 shrink-0" />
    <span className="text-center">Répartition Dépenses</span>
  </TabsTrigger>

  <TabsTrigger
    value="evolution"
    className="
      flex items-center justify-center
      gap-2
      h-12 sm:h-14
      px-3
      data-[state=active]:bg-gradient-to-r
      data-[state=active]:from-emerald-600
      data-[state=active]:to-teal-600
      data-[state=active]:text-white
      transition-all duration-300
      rounded-lg
      font-bold
      text-sm sm:text-base
      text-center
    "
  >
    <BarChart3 className="h-4 w-4 shrink-0" />
    <span className="text-center">Évolution Mensuelle</span>
  </TabsTrigger>
</TabsList>


        {/* Historique - Affiche uniquement le mois en cours */}
        <TabsContent value="historique" className="mt-6">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader className="flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="
          flex items-center gap-3 px-6 py-4
          rounded-2xl
          bg-white/70 dark:bg-white/10
          backdrop-blur-xl
          shadow-[0_20px_50px_rgba(0,0,0,0.15)]
          border border-white/30
        "
      >
        <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />

        <CardTitle
          className="
            text-xl font-semibold tracking-wide
            bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900
            dark:from-white dark:via-gray-300 dark:to-white
            bg-clip-text text-transparent
            text-center
          "
        >
          Historique des Achats et Dépenses
          <span className="block text-sm text-green-600 font-bold mt-1 opacity-80">
            {MONTHS[selectedMonth - 1]} {selectedYear}
          </span>
        </CardTitle>
      </motion.div>
                </CardHeader>
            <CardContent>
              {achats.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {achats.map((achat) => (
                    <div key={achat.id} className="flex items-center justify-between p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          achat.type === 'achat_produit' ? 'bg-blue-500/20' :
                          achat.type === 'taxes' ? 'bg-red-500/20' :
                          achat.type === 'carburant' ? 'bg-orange-500/20' : 'bg-purple-500/20'
                        }`}>
                          {achat.type === 'achat_produit' ? <Package className="h-5 w-5 text-blue-400" /> :
                           achat.type === 'taxes' ? <Receipt className="h-5 w-5 text-red-400" /> :
                           achat.type === 'carburant' ? <Fuel className="h-5 w-5 text-orange-400" /> :
                           <DollarSign className="h-5 w-5 text-purple-400" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {achat.productDescription || achat.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(achat.date).toLocaleDateString('fr-FR')}
                            {achat.fournisseur && ` • ${achat.fournisseur}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-400">-{formatEuro(achat.totalCost)}</p>
                        {achat.quantity && (
                          <Badge variant="outline" className="mt-1">
                            Qté: {achat.quantity}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <p>Aucun achat ou dépense pour {MONTHS[selectedMonth - 1]} {selectedYear}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repartition" className="mt-6">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="
          flex items-center gap-3 px-6 py-4
          rounded-2xl
          bg-white/70 dark:bg-white/10
          backdrop-blur-xl
          shadow-[0_20px_50px_rgba(0,0,0,0.15)]
          border border-white/30
        "
      >
        <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />

        <CardTitle
          className="
            text-xl font-semibold tracking-wide
            bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900
            dark:from-white dark:via-gray-300 dark:to-white
            bg-clip-text text-transparent
            text-center
          "
        >
          Répartition des Dépenses
          <span className="block text-sm text-green-600 font-bold mt-1 opacity-80">
            {MONTHS[selectedMonth - 1]} {selectedYear}
          </span>
        </CardTitle>
      </motion.div>
                </CardHeader>
            <CardContent>
              {depensesRepartition.length > 0 ? (
                <StablePieChart 
                  data={depensesRepartition} 
                  formatEuro={formatEuro}
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <p>Aucune dépense enregistrée pour cette période</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evolution" className="mt-6">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="
          flex items-center gap-3 px-6 py-4
          rounded-2xl
          bg-white/70 dark:bg-white/10
          backdrop-blur-xl
          shadow-[0_20px_50px_rgba(0,0,0,0.15)]
          border border-white/30
        "
      >
        <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />

        <CardTitle
          className="
            text-xl font-semibold tracking-wide
            bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900
            dark:from-white dark:via-gray-300 dark:to-white
            bg-clip-text text-transparent
            text-center
          "
        >
          Évolution Mensuelle
          <span className="block text-sm text-green-600 font-bold mt-1 opacity-80">
            {MONTHS[selectedMonth - 1]} {selectedYear}
          </span>
        </CardTitle>
      </motion.div>
                </CardHeader>
            <CardContent>
              <StableBarChart 
                data={monthlyChartData} 
                formatEuro={formatEuro}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Formulaire Achat */}
      <Dialog open={showAchatForm} onOpenChange={setShowAchatForm}>
        <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              Nouvel Achat Produit
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Enregistrez un nouvel achat de produit
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Recherche de produit */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                <Search className="h-4 w-4 inline mr-2" />
                Rechercher un produit
              </Label>
              <div className="relative">
                <Input
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Tapez au moins 3 caractères..."
                  className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-600"
                />
                {filteredProducts.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleSelectProduct(product)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-between"
                      >
                        <span className="font-medium">{product.description}</span>
                        <Badge variant="outline">{formatEuro(product.purchasePrice)}</Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedProduct && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {selectedProduct.description} sélectionné
                </Badge>
              )}
            </div>

            {/* Description produit - modifiable même si produit sélectionné */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {selectedProduct ? '✏️ Modifier le nom du produit (sera mis à jour dans products.json)' : 'Ou créer un nouveau produit'}
              </Label>
              <Input
                value={achatForm.productDescription}
                onChange={(e) => handleAchatFormChange('productDescription', e.target.value)}
                placeholder="Description du produit"
                className="bg-white/80 dark:bg-gray-800/80"
              />
              {selectedProduct && achatForm.productDescription !== selectedProduct.description && (
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                  ⚠️ Le nom sera modifié de "{selectedProduct.description}" à "{achatForm.productDescription}"
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Prix d'achat */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    Prix d'achat (€)
                  </Label>
                  {selectedProduct && (
                    <span className="text-sm font-bold text-red-600 bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full border border-red-200 dark:border-red-700 flex items-center gap-1">
                      Actuel: {formatEuro(selectedProduct.purchasePrice)}
                    </span>
                  )}
                </div>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={achatForm.purchasePrice || ''}
                  onChange={(e) => handleAchatFormChange('purchasePrice', parseFloat(e.target.value) || 0)}
                  placeholder={selectedProduct ? "Nouveau prix (optionnel)" : "Prix d'achat"}
                  className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl text-lg font-medium shadow-sm transition-all duration-200"
                />
                {selectedProduct && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    💡 Laissez vide pour garder le prix actuel
                  </p>
                )}
              </div>
              
              {/* Quantité */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    Quantité à ajouter *
                  </Label>
                  {selectedProduct && (
                    <span className="text-sm font-bold text-red-600 bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full border border-red-200 dark:border-red-700 flex items-center gap-1">
                      Stock: {selectedProduct.quantity}
                    </span>
                  )}
                </div>
                <Input
                  type="number"
                  min="1"
                  value={achatForm.quantity || ''}
                  onChange={(e) => handleAchatFormChange('quantity', parseInt(e.target.value) || 0)}
                  placeholder="Quantité à ajouter"
                  className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl text-lg font-medium shadow-sm transition-all duration-200"
                />
                {selectedProduct && achatForm.quantity > 0 && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    ✓ Nouveau stock: {selectedProduct.quantity + achatForm.quantity} unités
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-purple-500" />
                  Fournisseur
                </Label>
                <Input
                  value={achatForm.fournisseur || ''}
                  onChange={(e) => handleAchatFormChange('fournisseur', e.target.value)}
                  placeholder="Nom du fournisseur"
                  className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl font-medium shadow-sm transition-all duration-200"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-indigo-500" />
                  Caractéristiques
                </Label>
                <Textarea
                  value={achatForm.caracteristiques || ''}
                  onChange={(e) => handleAchatFormChange('caracteristiques', e.target.value)}
                  placeholder="Caractéristiques du produit..."
                  className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl font-medium shadow-sm transition-all duration-200 resize-none"
                  rows={2}
                />
              </div>
            </div>

            {/* Résumé du coût */}
            {achatForm.quantity > 0 && (
              <Card className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-emerald-500/30 shadow-lg">
                <CardContent className="pt-5 pb-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-emerald-600" />
                      <span className="font-bold text-gray-800 dark:text-gray-100">Coût total de cet achat:</span>
                    </div>
                    <span className="text-2xl font-black text-emerald-800 dark:text-emerald-400">
                      {formatEuro((achatForm.purchasePrice > 0 ? achatForm.purchasePrice : (selectedProduct?.purchasePrice || 0)) * achatForm.quantity)}
                    </span>
                  </div>
                  {selectedProduct && achatForm.purchasePrice === 0 && (
                    <p className="text-sm text-gray-500 mt-2 italic">
                      * Calculé avec le prix actuel du produit
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter className="gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              variant="outline" 
              onClick={() => setShowAchatForm(false)}
              className="h-12 px-6 rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmitAchat}
              disabled={!achatForm.productDescription || achatForm.quantity <= 0}
              className="h-12 px-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white shadow-xl rounded-xl font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Enregistrer l'achat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Formulaire Dépense */}
      <Dialog open={showDepenseForm} onOpenChange={setShowDepenseForm}>
        <DialogContent className="sm:max-w-lg bg-gradient-to-br from-white via-orange-50/30 to-red-50/50 dark:from-gray-900 dark:via-orange-900/20 dark:to-red-900/20 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 shadow-lg">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              Nouvelle Dépense
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Enregistrez une nouvelle dépense (taxes, carburant, autres)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Type de dépense</Label>
              <Select
                value={depenseForm.type}
                onValueChange={(v) => handleDepenseFormChange('type', v)}
              >
                <SelectTrigger className="bg-white/80 dark:bg-gray-800/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="taxes">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4" /> Taxes
                    </div>
                  </SelectItem>
                  <SelectItem value="carburant">
                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4" /> Carburant
                    </div>
                  </SelectItem>
                  <SelectItem value="autre_depense">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" /> Autre
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Description</Label>
              <Input
                value={depenseForm.description}
                onChange={(e) => handleDepenseFormChange('description', e.target.value)}
                placeholder="Description de la dépense"
                className="bg-white/80 dark:bg-gray-800/80"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Montant (€)</Label>
              <Input
                type="number"
                value={depenseForm.montant || ''}
                onChange={(e) => handleDepenseFormChange('montant', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="bg-white/80 dark:bg-gray-800/80"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Catégorie (optionnel)</Label>
              <Input
                value={depenseForm.categorie || ''}
                onChange={(e) => handleDepenseFormChange('categorie', e.target.value)}
                placeholder="Ex: Transport, Fournitures..."
                className="bg-white/80 dark:bg-gray-800/80"
              />
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowDepenseForm(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmitDepense}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Enregistrer la dépense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modale d'export PDF */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-white via-purple-50/30 to-fuchsia-50/50 dark:from-gray-900 dark:via-purple-900/20 dark:to-fuchsia-900/20 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-lg">
                <FileDown className="h-6 w-6 text-white" />
              </div>
              Exporter la Comptabilité
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Sélectionnez le mois et l'année à exporter en PDF
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700 dark:text-gray-200">Mois</Label>
                <Select value={exportMonth.toString()} onValueChange={(v) => setExportMonth(parseInt(v))}>
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-2 border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month, index) => (
                      <SelectItem key={index} value={(index + 1).toString()}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700 dark:text-gray-200">Année</Label>
                <Select value={exportYear.toString()} onValueChange={(v) => setExportYear(parseInt(v))}>
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-2 border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2023, 2024, 2025, 2026].map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className="bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-pink-500/10 border-purple-500/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Le PDF contiendra :</strong>
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                  <li>📦 Liste des produits vendus</li>
                  <li>💸 Liste des dépenses</li>
                  <li>📊 Totaux et bénéfice réel</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleExportPDF}
              className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white shadow-xl"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Télécharger PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComptabiliteModule;
