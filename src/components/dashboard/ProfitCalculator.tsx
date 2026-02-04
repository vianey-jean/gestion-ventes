import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';
import { Product } from '@/types';
import ProductSearchInput from '@/components/dashboard/ProductSearchInput';
import { beneficeService } from '@/service/beneficeService';
import ModernContainer from '@/components/dashboard/forms/ModernContainer';
import ModernActionButton from '@/components/dashboard/forms/ModernActionButton';
import { ModernTable, ModernTableHeader, ModernTableRow, ModernTableHead, ModernTableCell, TableBody } from '@/components/dashboard/forms/ModernTable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { 
  Calculator, 
  TrendingUp, 
  AlertCircle, 
  DollarSign, 
  Percent, 
  Save, 
  Search, 
  Eye, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Crown, 
  Diamond,
  Target,
  PiggyBank,
  TrendingDown,
  BarChart3,
  Coins
} from 'lucide-react';
import PremiumLoading from '@/components/ui/premium-loading';

interface ProfitCalculation {
  prixAchat: number;
  taxeDouane: number;
  tva: number;
  autresFrais: number;
  coutTotal: number;
  margeDesire: number;
  prixVenteRecommande: number;
  beneficeNet: number;
  tauxMarge: number;
}

interface BeneficeData extends ProfitCalculation {
  id?: string;
  productId: string;
  productDescription: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProfitCalculatorProps {
  className?: string;
  onCalculationChange?: (calculation: ProfitCalculation) => void;
  initialValues?: Partial<ProfitCalculation>;
  compact?: boolean;
}

const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({
  className,
  onCalculationChange,
  initialValues = {},
  compact = false
}) => {
  const { formatEuro } = useCurrencyFormatter();
  const { toast } = useToast();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productDescription, setProductDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [beneficesList, setBeneficesList] = useState<BeneficeData[]>([]);
  const [showTable, setShowTable] = useState(true);
  
  const [values, setValues] = useState<ProfitCalculation>({
    prixAchat: initialValues.prixAchat || 0,
    taxeDouane: initialValues.taxeDouane || 0,
    tva: initialValues.tva || 20,
    autresFrais: initialValues.autresFrais || 0,
    coutTotal: 0,
    margeDesire: initialValues.margeDesire || 30,
    prixVenteRecommande: 0,
    beneficeNet: 0,
    tauxMarge: 0
  });

  const [prixVenteCustom, setPrixVenteCustom] = useState<number>(0);
  const [showCustomPrice, setShowCustomPrice] = useState(false);

  useEffect(() => {
    loadBeneficesData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadBeneficesData();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setProductDescription(product.description);
    setValues(prev => ({
      ...prev,
      prixAchat: product.purchasePrice || 0
    }));
    loadExistingBeneficeData(product.id);
  };

  const loadBeneficesData = async () => {
    try {
      const data = await beneficeService.getBenefices();
      setBeneficesList(data);
    } catch (error) {
      setBeneficesList([]);
    }
  };

  const loadExistingBeneficeData = async (productId: string) => {
    try {
      const beneficeData = await beneficeService.getBeneficeByProductId(productId);
      if (beneficeData) {
        setValues({
          prixAchat: beneficeData.prixAchat || 0,
          taxeDouane: beneficeData.taxeDouane || 0,
          tva: beneficeData.tva || 20,
          autresFrais: beneficeData.autresFrais || 0,
          coutTotal: beneficeData.coutTotal || 0,
          margeDesire: beneficeData.margeDesire || 30,
          prixVenteRecommande: beneficeData.prixVenteRecommande || 0,
          beneficeNet: beneficeData.beneficeNet || 0,
          tauxMarge: beneficeData.tauxMarge || 0
        });
        toast({
          title: "Données chargées",
          description: `Calculs existants chargés pour ${beneficeData.productDescription}`,
        });
      }
    } catch (error) {
      // Aucun calcul existant
    }
  };

  useEffect(() => {
    if (values.prixAchat > 0) {
      const coutSansTva = values.prixAchat + values.taxeDouane + values.autresFrais;
      const coutAvecTva = coutSansTva * (1 + values.tva / 100);
      const prixVenteRecommande = coutAvecTva * (1 + values.margeDesire / 100);
      const beneficeNet = prixVenteRecommande - coutAvecTva;
      const tauxMarge = coutAvecTva > 0 ? (beneficeNet / coutAvecTva) * 100 : 0;
      const newCalculation = { ...values, coutTotal: coutAvecTva, prixVenteRecommande, beneficeNet, tauxMarge };
      setValues(newCalculation);
      onCalculationChange?.(newCalculation);
    }
  }, [values.prixAchat, values.taxeDouane, values.tva, values.autresFrais, values.margeDesire, onCalculationChange]);

  const calculateWithCustomPrice = () => {
    if (prixVenteCustom > 0 && values.coutTotal > 0) {
      const beneficeNet = prixVenteCustom - values.coutTotal;
      const tauxMarge = (beneficeNet / values.coutTotal) * 100;
      const customCalculation = { ...values, prixVenteRecommande: prixVenteCustom, beneficeNet, tauxMarge };
      setValues(customCalculation);
      onCalculationChange?.(customCalculation);
    }
  };

  const updateValue = (field: keyof ProfitCalculation, value: number) => {
    setValues(prev => ({ ...prev, [field]: isNaN(value) ? 0 : value }));
  };

  const handleSave = async () => {
    if (!selectedProduct) {
      toast({ title: "Erreur", description: "Veuillez sélectionner un produit avant de sauvegarder.", variant: "destructive" , className: "notification-erreur",});
      return;
    }

    const existingBenefice = beneficesList.find(b => b.productId === selectedProduct.id);
    if (existingBenefice) {
      toast({ title: "Erreur", description: "Ce produit a déjà un calcul de bénéfice enregistré.", variant: "destructive" , className: "notification-erreur",});
      return;
    }

    setIsLoading(true);
    try {
      await beneficeService.createBenefice({
        productId: selectedProduct.id,
        productDescription: productDescription || selectedProduct.description,
        ...values
      });
      toast({ title: "Succès", description: "Calcul de bénéfice sauvegardé avec succès!" });
      await loadBeneficesData();
      setSelectedProduct(null);
      setProductDescription('');
      setValues({
        prixAchat: 0,
        taxeDouane: 0,
        tva: 20,
        autresFrais: 0,
        coutTotal: 0,
        margeDesire: 30,
        prixVenteRecommande: 0,
        beneficeNet: 0,
        tauxMarge: 0
      });
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de sauvegarder le calcul de bénéfice.", variant: "destructive", className: "notification-erreur", });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await beneficeService.deleteBenefice(id);
      toast({ title: "Succès", description: "Calcul de bénéfice supprimé avec succès!" });
      await loadBeneficesData();
      setTimeout(() => window.dispatchEvent(new CustomEvent('benefice-deleted')), 100);
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer le calcul de bénéfice.", variant: "destructive", className: "notification-erreur", });
    }
  };

  const isRentable = (values.tauxMarge || 0) >= 20;

  if (isLoading) {
    return (
      <PremiumLoading
        text="Calcul des Bénéfices"
        size="md"
        variant="ventes"
        showText={true}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Calculateur Premium */}
      <ModernContainer
        title="Calculateur Premium de Bénéfices"
        icon={Diamond}
        gradient="purple"
        className={className}
        headerActions={
          <div className="flex items-center gap-2">
            <ModernActionButton
              icon={Target}
              gradient="indigo"
              buttonSize="sm"
              onClick={() => console.log('Optimisation des marges')}
            >
              Optimiser
            </ModernActionButton>
          </div>
        }
      >
        <div className="space-y-8">
          {/* Recherche de produit */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl text-white shadow-lg">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Sélection du produit
              </h3>
            </div>
            
            <ProductSearchInput
              onProductSelect={handleProductSelect}
              selectedProduct={selectedProduct}
            />
            
            {selectedProduct && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border-2 border-blue-200 shadow-md">
                <Label htmlFor="productDescription" className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-3">
                  <Edit3 className="h-4 w-4" />
                  Description du produit
                </Label>
                <Input
                  id="productDescription"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Description du produit"
                  className="border-blue-300 focus:border-blue-500 bg-white/80"
                />
              </div>
            )}
          </div>

          {selectedProduct && (
            <>
              {/* Saisie des coûts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white shadow-lg">
                      <Coins className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Coûts d'acquisition
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-shadow">
                      <Label htmlFor="prixAchat" className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 mb-3">
                        <DollarSign className="h-4 w-4" />
                        Prix d'achat (€)
                      </Label>
                      <Input
                        id="prixAchat"
                        type="number"
                        value={values.prixAchat || ''}
                        onChange={(e) => updateValue('prixAchat', Number(e.target.value))}
                        placeholder="0.00"
                        className="border-emerald-300 focus:border-emerald-500 bg-white/80 text-lg font-semibold"
                      />
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
                      <Label htmlFor="taxeDouane" className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2 mb-3">
                        <BarChart3 className="h-4 w-4" />
                        Taxes douanières (€)
                      </Label>
                      <Input
                        id="taxeDouane"
                        type="number"
                        value={values.taxeDouane || ''}
                        onChange={(e) => updateValue('taxeDouane', Number(e.target.value))}
                        placeholder="0.00"
                        className="border-blue-300 focus:border-blue-500 bg-white/80"
                      />
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
                      <Label htmlFor="tva" className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2 mb-3">
                        <Percent className="h-4 w-4" />
                        TVA (%)
                      </Label>
                      <Input
                        id="tva"
                        type="number"
                        value={values.tva || ''}
                        onChange={(e) => updateValue('tva', Number(e.target.value))}
                        placeholder="20"
                        className="border-purple-300 focus:border-purple-500 bg-white/80"
                      />
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
                      <Label htmlFor="autresFrais" className="font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-2 mb-3">
                        <PiggyBank className="h-4 w-4" />
                        Autres frais (€)
                      </Label>
                      <Input
                        id="autresFrais"
                        type="number"
                        value={values.autresFrais || ''}
                        onChange={(e) => updateValue('autresFrais', Number(e.target.value))}
                        placeholder="0.00"
                        className="border-orange-300 focus:border-orange-500 bg-white/80"
                      />
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Transport, stockage, manutention, etc.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white shadow-lg">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Calcul de marge
                    </h3>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
                    <Label htmlFor="margeDesire" className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4" />
                      Marge désirée (%)
                    </Label>
                    <Input
                      id="margeDesire"
                      type="number"
                      value={values.margeDesire || ''}
                      onChange={(e) => updateValue('margeDesire', Number(e.target.value))}
                      placeholder="30"
                      className="border-purple-300 focus:border-purple-500 bg-white/80 text-lg font-semibold"
                    />
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-emerald-900/20 dark:via-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 border-2 border-gradient-to-r border-emerald-300 shadow-2xl">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center p-4 bg-white/70 rounded-lg">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Calculator className="h-5 w-5 text-blue-600" />
                          Coût total (TTC):
                        </span>
                        <span className="font-bold text-xl text-blue-600">{formatEuro(values.coutTotal || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-white/70 rounded-lg">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Crown className="h-5 w-5 text-emerald-600" />
                          Prix de vente recommandé:
                        </span>
                        <span className="font-bold text-emerald-600 text-2xl">
                          {formatEuro(values.prixVenteRecommande || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-white/70 rounded-lg">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-purple-600" />
                          Bénéfice net:
                        </span>
                        <span className={cn("font-bold text-2xl", isRentable ? "text-emerald-600" : "text-red-600")}>
                          {formatEuro(values.beneficeNet || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-white/70 rounded-lg">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-indigo-600" />
                          Taux de marge:
                        </span>
                        <span className={cn("font-bold text-xl", isRentable ? "text-emerald-600" : "text-red-600")}>
                          {(values.tauxMarge || 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bouton de sauvegarde */}
                  <ModernActionButton
                    icon={Save}
                    onClick={handleSave}
                    isLoading={isLoading}
                    disabled={!selectedProduct}
                    gradient="green"
                    buttonSize="lg"
                    className="w-full py-4 text-lg font-bold shadow-2xl"
                  >
                    {isLoading ? 'Sauvegarde...' : 'Valider et Sauvegarder'}
                  </ModernActionButton>
                </div>
              </div>

              {/* Prix de vente personnalisé */}
              <div className="border-t-2 border-gray-200 pt-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white shadow-lg">
                      <Edit3 className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Tester un prix de vente personnalisé
                    </h3>
                  </div>
                  <ModernActionButton
                    onClick={() => setShowCustomPrice(!showCustomPrice)}
                    variant="outline"
                    gradient="indigo"
                    icon={showCustomPrice ? TrendingDown : TrendingUp}
                  >
                    {showCustomPrice ? 'Masquer' : 'Afficher'}
                  </ModernActionButton>
                </div>
                
                {showCustomPrice && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-8 border-2 border-indigo-200 shadow-lg">
                    <div className="space-y-2">
                      <Label htmlFor="prixVenteCustom" className="font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Prix de vente personnalisé (€)
                      </Label>
                      <Input
                        id="prixVenteCustom"
                        type="number"
                        value={prixVenteCustom}
                        onChange={(e) => setPrixVenteCustom(Number(e.target.value))}
                        placeholder="0.00"
                        className="border-indigo-300 focus:border-indigo-500 bg-white/80 text-lg font-semibold"
                      />
                    </div>
                    <div className="flex items-end">
                      <ModernActionButton
                        onClick={calculateWithCustomPrice}
                        gradient="indigo"
                        icon={Calculator}
                        className="w-full"
                        buttonSize="lg"
                      >
                        Calculer
                      </ModernActionButton>
                    </div>
                    <div className="flex items-center justify-center">
                      {prixVenteCustom > 0 && (
                        <div className="text-center bg-white/70 rounded-lg p-4 w-full">
                          <span className="text-sm text-gray-600 block mb-1">Marge calculée:</span>
                          <span className={cn("font-bold text-2xl", isRentable ? "text-emerald-600" : "text-red-600")}>
                            {(values.tauxMarge || 0).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Alertes */}
              {!isRentable && values.prixAchat > 0 && (
                <Alert className="border-red-200 bg-red-50 text-red-800 shadow-lg">
                  <AlertCircle className="h-5 w-5" />
                  <AlertDescription className="font-semibold">
                    <strong>⚠️ Attention:</strong> Votre marge est inférieure à 20%. 
                    Considérez augmenter votre prix de vente ou réduire vos coûts.
                  </AlertDescription>
                </Alert>
              )}
              
              {isRentable && values.prixAchat > 0 && (
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800 shadow-lg">
                  <TrendingUp className="h-5 w-5" />
                  <AlertDescription className="font-semibold">
                    <strong>🎉 Excellent!</strong> Votre produit est rentable avec une marge de {(values.tauxMarge || 0).toFixed(1)}%.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
      </ModernContainer>

      {/* Table des calculs de bénéfices */}
      <ModernContainer
        title="Historique des Calculs Premium"
        icon={Eye}
        gradient="indigo"
        headerActions={
          <ModernActionButton
            onClick={() => setShowTable(!showTable)}
            variant="ghost"
            gradient="indigo"
            icon={showTable ? TrendingDown : TrendingUp}
          >
            {showTable ? 'Masquer' : 'Afficher'}
          </ModernActionButton>
        }
      >
        {showTable && (
          <div className="overflow-hidden">
            {Array.isArray(beneficesList) && beneficesList.length > 0 ? (
              <ModernTable>
                <ModernTableHeader>
                  <ModernTableRow>
                    <ModernTableHead className="font-bold text-purple-700">
                      <div className="flex items-center gap-2">
                        <Diamond className="h-4 w-4" />
                        Produit
                      </div>
                    </ModernTableHead>
                    <ModernTableHead className="font-bold text-emerald-700">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Prix d'achat
                      </div>
                    </ModernTableHead>
                    <ModernTableHead className="font-bold text-blue-700">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Coût total
                      </div>
                    </ModernTableHead>
                    <ModernTableHead className="font-bold text-indigo-700">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        Prix de vente
                      </div>
                    </ModernTableHead>
                    <ModernTableHead className="font-bold text-green-700">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Bénéfice
                      </div>
                    </ModernTableHead>
                    <ModernTableHead className="font-bold text-orange-700">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Marge %
                      </div>
                    </ModernTableHead>
                    <ModernTableHead className="font-bold text-gray-700">Actions</ModernTableHead>
                  </ModernTableRow>
                </ModernTableHeader>
                <TableBody>
                  {beneficesList.map((benefice) => (
                    <ModernTableRow key={benefice.id} className="hover:bg-purple-50/50 transition-colors">
                      <ModernTableCell className="font-bold text-purple-800 dark:text-purple-300">
                        {benefice.productDescription}
                      </ModernTableCell>
                      <ModernTableCell className="font-bold text-emerald-700">
                        {formatEuro(benefice.prixAchat)}
                      </ModernTableCell>
                      <ModernTableCell className="font-bold text-blue-700">
                        {formatEuro(benefice.coutTotal)}
                      </ModernTableCell>
                      <ModernTableCell className="font-bold text-indigo-700">
                        {formatEuro(benefice.prixVenteRecommande)}
                      </ModernTableCell>
                      <ModernTableCell className={cn("font-bold", 
                        benefice.beneficeNet > 0 ? "text-emerald-600" : "text-red-600"
                      )}>
                        {formatEuro(benefice.beneficeNet)}
                      </ModernTableCell>
                      <ModernTableCell className={cn("font-bold",
                        (benefice.tauxMarge || 0) >= 20 ? "text-emerald-600" : "text-red-600"
                      )}>
                        {(benefice.tauxMarge || 0).toFixed(1)}%
                      </ModernTableCell>
                      <ModernTableCell>
                        <ModernActionButton
                      onClick={() => {
                        if (benefice.id && window.confirm("Êtes-vous sûr de vouloir supprimer ce calcul ?")) {
                          handleDelete(benefice.id);
                        }
                      }}
                      variant="ghost"
                      gradient="red"
                      icon={Trash2}
                      buttonSize="sm"
                      className="text-red-800 hover:bg-red-50"
                    >
                      Supprimer
                    </ModernActionButton>

                      </ModernTableCell>
                    </ModernTableRow>
                  ))}
                </TableBody>
              </ModernTable>
            ) : (
              <div className="text-center py-16">
                <div className="flex flex-col items-center gap-6">
                  <div className="p-6 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full">
                    <Calculator className="h-12 w-12 text-purple-600" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-gray-600 dark:text-gray-400">Aucun calcul de bénéfice enregistré</p>
                    <p className="text-sm text-gray-500">Commencez par calculer et sauvegarder vos bénéfices premium</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ModernContainer>
    </div>
  );
};

export default ProfitCalculator;
