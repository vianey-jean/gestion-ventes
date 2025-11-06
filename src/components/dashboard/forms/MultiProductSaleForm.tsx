import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { Product, SaleProduct, Sale } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Package, Euro, Edit3 } from 'lucide-react';
import ProductSearchInput from '../ProductSearchInput';
import SaleQuantityInput from './SaleQuantityInput';
import ClientSearchInput from '../ClientSearchInput';
import { calculateSaleProfit } from './utils/saleCalculations';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import axios from 'axios';

interface MultiProductSaleFormProps {
  isOpen: boolean;
  onClose: () => void;
  editSale?: Sale;
}

interface FormProduct {
  productId: string;
  description: string;
  sellingPriceUnit: string;
  quantitySold: string;
  purchasePriceUnit: string;
  profit: string;
  selectedProduct: Product | null;
  maxQuantity: number;
  isAdvanceProduct: boolean;
}

const MultiProductSaleForm: React.FC<MultiProductSaleFormProps> = ({ isOpen, onClose, editSale }) => {
  const { products, addSale, updateSale, deleteSale } = useApp();
  const { toast } = useToast();
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [formProducts, setFormProducts] = useState<FormProduct[]>([{
    productId: '',
    description: '',
    sellingPriceUnit: '',
    quantitySold: '1',
    purchasePriceUnit: '',
    profit: '',
    selectedProduct: null,
    maxQuantity: 0,
    isAdvanceProduct: false
  }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'sale' | 'product', index?: number } | null>(null);
  
  // États pour la fonctionnalité Avance
  const [showAdvanceSection, setShowAdvanceSection] = useState(false);
  const [avancePrice, setAvancePrice] = useState('');
  const [reste, setReste] = useState('');
  const [nextPaymentDate, setNextPaymentDate] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

  // Réinitialiser le formulaire quand il s'ouvre ou charger les données d'édition
  useEffect(() => {
    const loadSaleData = async () => {
      if (isOpen) {
        if (editSale) {
          // Mode édition - charger les données existantes
          setDate(new Date(editSale.date).toISOString().split('T')[0]);
          setClientName(editSale.clientName || '');
          setClientPhone(editSale.clientPhone || '');
          setClientAddress(editSale.clientAddress || '');
          
          // Charger les données d'avance si elles existent
          const hasReste = editSale.reste && editSale.reste > 0;
          if (hasReste) {
            setShowAdvanceSection(true);
            // Le prix d'avance est stocké dans totalSellingPrice de la vente
            setAvancePrice(editSale.totalSellingPrice?.toString() || '0');
            setReste(editSale.reste.toString());
            
            // Charger la date de prochaine paiement depuis pretproduits
            try {
              const token = localStorage.getItem('token');
              const response = await axios.get(`${API_BASE_URL}/api/pretproduits`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              const pretProduit = response.data.find((p: any) => 
                p.nom === editSale.clientName && p.date === editSale.date
              );
              
              if (pretProduit && pretProduit.datePaiement) {
                setNextPaymentDate(new Date(pretProduit.datePaiement).toISOString().split('T')[0]);
              }
            } catch (error) {
              console.error('Erreur lors du chargement de la date de paiement:', error);
            }
          } else {
            setShowAdvanceSection(false);
            setAvancePrice('');
            setReste('');
            setNextPaymentDate('');
          }
          
          // Charger les produits existants
          if (editSale.products && editSale.products.length > 0) {
            const loadedProducts = editSale.products.map(saleProduct => {
              const product = products.find(p => p.id === saleProduct.productId);
              const isAdvance = saleProduct.description.toLowerCase().includes('avance');
              
              const purchasePriceUnit = isAdvance ? saleProduct.purchasePrice : (saleProduct.purchasePrice / saleProduct.quantitySold);
              const sellingPriceUnit = isAdvance ? saleProduct.sellingPrice : (saleProduct.sellingPrice / saleProduct.quantitySold);
              
              return {
                productId: saleProduct.productId,
                description: saleProduct.description,
                sellingPriceUnit: sellingPriceUnit.toString(),
                quantitySold: saleProduct.quantitySold.toString(),
                purchasePriceUnit: purchasePriceUnit.toString(),
                profit: saleProduct.profit.toString(),
                selectedProduct: product || null,
                maxQuantity: product ? (product.quantity || 0) + saleProduct.quantitySold : 0,
                isAdvanceProduct: isAdvance
              };
            });
            setFormProducts(loadedProducts);
          }
        } else {
          // Mode création - réinitialiser
          setDate(new Date().toISOString().split('T')[0]);
          setClientName('');
          setClientPhone('');
          setClientAddress('');
          setFormProducts([{
            productId: '',
            description: '',
            sellingPriceUnit: '',
            quantitySold: '1',
            purchasePriceUnit: '',
            profit: '',
            selectedProduct: null,
            maxQuantity: 0,
            isAdvanceProduct: false
          }]);
          // Réinitialiser les champs avance
          setShowAdvanceSection(false);
          setAvancePrice('');
          setReste('');
          setNextPaymentDate('');
        }
      }
    };
    
    loadSaleData();
  }, [isOpen, editSale, products]);

  // Gestion du client
  const handleClientSelect = (client: any) => {
    if (client) {
      setClientName(client.nom);
      setClientPhone(client.phone);
      setClientAddress(client.adresse);
    } else {
      setClientPhone('');
      setClientAddress('');
    }
  };

  // Ajouter un nouveau produit
  const addNewProduct = () => {
    setFormProducts(prev => [...prev, {
      productId: '',
      description: '',
      sellingPriceUnit: '',
      quantitySold: '1',
      purchasePriceUnit: '',
      profit: '',
      selectedProduct: null,
      maxQuantity: 0,
      isAdvanceProduct: false
    }]);
  };

  // Confirmer suppression d'un produit
  const handleDeleteProduct = (index: number) => {
    setDeleteTarget({ type: 'product', index });
    setDeleteDialogOpen(true);
  };

  // Confirmer suppression de toute la vente
  const handleDeleteSale = () => {
    setDeleteTarget({ type: 'sale' });
    setDeleteDialogOpen(true);
  };

  // Exécuter la suppression confirmée
  const executeDelete = async () => {
    if (!deleteTarget) return;

    setIsSubmitting(true);
    try {
      if (deleteTarget.type === 'product' && deleteTarget.index !== undefined) {
        // Supprimer un produit individuel
        if (formProducts.length > 1) {
          setFormProducts(prev => prev.filter((_, i) => i !== deleteTarget.index));
          toast({
            title: "Produit supprimé",
            description: "Le produit a été retiré de la vente",
            className: "notification-success",
          });
        }
      } else if (deleteTarget.type === 'sale' && editSale && deleteSale) {
        // Supprimer toute la vente
        const success = await deleteSale(editSale.id);
        if (success) {
          toast({
            title: "Succès",
            description: "La vente a été supprimée avec succès",
            className: "notification-success",
          });
          onClose();
        }
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  // Sélection d'un produit
  const handleProductSelect = (product: Product, index: number) => {
    const isAdvance = product.description.toLowerCase().includes('avance');
    const productQuantity = product.quantity !== undefined ? product.quantity : 0;
    const purchasePriceUnit = product.purchasePrice;
    const suggestedSellingPrice = isAdvance ? '' : (product.purchasePrice * 1.2).toFixed(2);

    setFormProducts(prev => {
      const newProducts = [...prev];
      const newQuantity = isAdvance ? '0' : '1';
      const newPurchasePriceUnit = purchasePriceUnit.toString();
      const newSellingPriceUnit = isAdvance ? '' : suggestedSellingPrice;
      
      let initialProfit = '0';
      if (!isAdvance && suggestedSellingPrice) {
        const A = Number(newPurchasePriceUnit) * Number(newQuantity);
        const V = Number(suggestedSellingPrice) * Number(newQuantity);
        initialProfit = (V - A).toFixed(2);
      }

      newProducts[index] = {
        ...newProducts[index],
        productId: String(product.id),
        description: product.description,
        selectedProduct: product,
        maxQuantity: productQuantity,
        isAdvanceProduct: isAdvance,
        purchasePriceUnit: newPurchasePriceUnit,
        sellingPriceUnit: newSellingPriceUnit,
        quantitySold: newQuantity,
        profit: initialProfit,
      };
      
      return newProducts;
    });
  };

  // Mise à jour du profit
  const updateProfit = (index: number, priceUnit: string, quantity: string, purchasePriceUnit: string) => {
    const product = formProducts[index];
    if (product.isAdvanceProduct) {
      const profit = Number(priceUnit || 0) - Number(purchasePriceUnit || 0);
      setFormProducts(prev => {
        const newProducts = [...prev];
        newProducts[index] = { ...newProducts[index], profit: profit.toFixed(2) };
        return newProducts;
      });
    } else {
      const profit = calculateSaleProfit(priceUnit, quantity, purchasePriceUnit);
      setFormProducts(prev => {
        const newProducts = [...prev];
        newProducts[index] = { ...newProducts[index], profit: profit };
        return newProducts;
      });
    }
  };

  // Changement du prix de vente
  const handleSellingPriceChange = (value: string, index: number) => {
    setFormProducts(prev => {
      const newProducts = [...prev];
      newProducts[index] = { ...newProducts[index], sellingPriceUnit: value };
      return newProducts;
    });
    const product = formProducts[index];
    updateProfit(index, value, product.quantitySold, product.purchasePriceUnit);
  };

  // Changement de la quantité
  const handleQuantityChange = (value: string, index: number) => {
    const product = formProducts[index];
    if (!product.isAdvanceProduct) {
      setFormProducts(prev => {
        const newProducts = [...prev];
        newProducts[index] = { ...newProducts[index], quantitySold: value };
        return newProducts;
      });
      updateProfit(index, product.sellingPriceUnit, value, product.purchasePriceUnit);
    }
  };

  // Gestion des clients
  const handleClientData = async (clientName: string, clientPhone: string, clientAddress: string) => {
    if (!clientName.trim()) return null;

    try {
      const token = localStorage.getItem('token');
      
      const existingClientsResponse = await axios.get(`${API_BASE_URL}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const existingClient = existingClientsResponse.data.find((client: any) => 
        client.nom.toLowerCase() === clientName.toLowerCase()
      );
      
      if (existingClient) {
        return existingClient;
      }
      
      if (clientPhone.trim() && clientAddress.trim()) {
        const newClientResponse = await axios.post(`${API_BASE_URL}/api/clients`, {
          nom: clientName,
          phone: clientPhone,
          adresse: clientAddress
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        toast({
          title: "Client enregistré",
          description: `Le client ${clientName} a été ajouté à votre base de données`,
          className: "notification-success",
        });
        
        return newClientResponse.data;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la gestion du client:', error);
      return null;
    }
  };

  // Calculer les totaux
  const getTotals = () => {
    return formProducts.reduce((totals, product) => {
      const quantity = product.isAdvanceProduct ? 0 : Number(product.quantitySold || 0);
      const purchasePriceUnit = Number(product.purchasePriceUnit || 0);
      const sellingPriceUnit = Number(product.sellingPriceUnit || 0);
      
      let purchasePrice, sellingPrice;
      
      if (product.isAdvanceProduct) {
        purchasePrice = purchasePriceUnit;
        sellingPrice = sellingPriceUnit;
      } else {
        purchasePrice = purchasePriceUnit * quantity;
        sellingPrice = sellingPriceUnit * quantity;
      }
      
      return {
        totalPurchasePrice: totals.totalPurchasePrice + purchasePrice,
        totalSellingPrice: totals.totalSellingPrice + sellingPrice,
        totalProfit: totals.totalProfit + Number(product.profit || 0)
      };
    }, { totalPurchasePrice: 0, totalSellingPrice: 0, totalProfit: 0 });
  };

  // Calculer automatiquement le reste quand l'avance change
  const handleAvancePriceChange = (value: string) => {
    setAvancePrice(value);
    const totals = getTotals();
    const avance = Number(value) || 0;
    const resteCalculated = totals.totalSellingPrice - avance;
    setReste(resteCalculated >= 0 ? resteCalculated.toFixed(2) : '0');
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validProducts = formProducts.filter(p => p.selectedProduct && p.sellingPriceUnit);
    if (validProducts.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un produit avec un prix de vente.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Gérer le client
      if (clientName.trim()) {
        await handleClientData(clientName, clientPhone, clientAddress);
      }

      // Préparer les données de vente
      const saleProducts: SaleProduct[] = validProducts.map(product => {
        const quantity = product.isAdvanceProduct ? 0 : Number(product.quantitySold);
        const purchasePriceUnit = Number(product.purchasePriceUnit);
        const sellingPriceUnit = Number(product.sellingPriceUnit);
        
        let purchasePrice, sellingPrice;
        
        if (product.isAdvanceProduct) {
          purchasePrice = purchasePriceUnit;
          sellingPrice = sellingPriceUnit;
        } else {
          purchasePrice = purchasePriceUnit * quantity;
          sellingPrice = sellingPriceUnit * quantity;
        }

        return {
          productId: product.productId,
          description: product.description,
          quantitySold: quantity,
          purchasePrice: purchasePrice,
          sellingPrice: sellingPrice,
          profit: Number(product.profit)
        };
      });

      const totals = getTotals();
      
      // Déterminer le prix de vente à enregistrer
      const avancePriceValue = Number(avancePrice) || 0;
      const finalSellingPrice = avancePriceValue > 0 ? avancePriceValue : totals.totalSellingPrice;
      const resteValue = avancePriceValue > 0 ? Number(reste) : 0;
      
      const saleData = {
        date,
        products: saleProducts,
        totalPurchasePrice: totals.totalPurchasePrice,
        totalSellingPrice: finalSellingPrice,
        totalProfit: totals.totalProfit,
        clientName: clientName || null,
        clientAddress: clientAddress || null,
        clientPhone: clientPhone || null,
        reste: resteValue,
        nextPaymentDate: avancePriceValue > 0 ? nextPaymentDate : null,
      };

      let success;
      
      if (editSale) {
        success = await updateSale({ ...saleData, id: editSale.id });
        
        // Si c'est une modification avec avance, mettre à jour pretproduits
        if (success && avancePriceValue > 0 && nextPaymentDate) {
          try {
            const token = localStorage.getItem('token');
            
            // Chercher le pretproduit existant par nom et date
            const pretProduitsResponse = await axios.get(`${API_BASE_URL}/api/pretproduits`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            const existingPretProduit = pretProduitsResponse.data.find((p: any) => 
              p.nom === clientName && p.date === date
            );
            
            const productsDescription = validProducts.map(p => p.description).join(', ');
            
            const pretProduitData = {
              date: date,
              datePaiement: nextPaymentDate,
              phone: clientPhone || '',
              description: productsDescription,
              nom: clientName,
              prixVente: totals.totalSellingPrice,
              avanceRecue: avancePriceValue,
              reste: resteValue,
              estPaye: resteValue === 0,
              productId: validProducts.length === 1 ? validProducts[0].productId : undefined,
            };
            
            if (existingPretProduit) {
              // Mettre à jour le pretproduit existant
              await axios.put(`${API_BASE_URL}/api/pretproduits/${existingPretProduit.id}`, pretProduitData, {
                headers: { Authorization: `Bearer ${token}` }
              });
            } else {
              // Créer un nouveau pretproduit
              await axios.post(`${API_BASE_URL}/api/pretproduits`, pretProduitData, {
                headers: { Authorization: `Bearer ${token}` }
              });
            }
          } catch (error) {
            console.error('Erreur lors de la mise à jour du prêt produit:', error);
          }
        }
      } else {
        success = await addSale(saleData);
        
        // Si avance est remplie, enregistrer aussi dans pretproduits
        if (success && avancePriceValue > 0 && nextPaymentDate) {
          try {
            const token = localStorage.getItem('token');
            
            // Créer la description des produits
            const productsDescription = validProducts.map(p => p.description).join(', ');
            
            const pretProduitData = {
              date: date,
              datePaiement: nextPaymentDate,
              phone: clientPhone || '',
              description: productsDescription,
              nom: clientName,
              prixVente: totals.totalSellingPrice,
              avanceRecue: avancePriceValue,
              reste: resteValue,
              estPaye: resteValue === 0,
              productId: validProducts.length === 1 ? validProducts[0].productId : undefined,
            };

            await axios.post(`${API_BASE_URL}/api/pretproduits`, pretProduitData, {
              headers: { Authorization: `Bearer ${token}` }
            });

            toast({
              title: "Succès",
              description: `Vente enregistrée et prêt produit créé avec succès`,
              variant: "default",
              className: "notification-success",
            });
          } catch (error) {
            console.error('Erreur lors de l\'enregistrement du prêt produit:', error);
            toast({
              title: "Attention",
              description: "Vente enregistrée mais erreur lors de la création du prêt produit",
              variant: "destructive",
            });
          }
        }
      }
      
      if (success && !(avancePriceValue > 0 && nextPaymentDate)) {
        toast({
          title: "Succès",
          description: editSale 
            ? `Vente avec ${saleProducts.length} produit(s) mise à jour avec succès`
            : `Vente avec ${saleProducts.length} produit(s) ajoutée avec succès`,
          variant: "default",
          className: "notification-success",
        });
      }
      
      if (success) {
        onClose();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totals = getTotals();

  return (
<Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>
        {editSale ? 'Modifier la vente multi-produits' : 'Ajouter une vente multi-produits'}
      </DialogTitle>
      <DialogDescription>
        {editSale
          ? 'Modifiez les détails de cette vente avec plusieurs produits.'
          : 'Enregistrez une vente avec un ou plusieurs produits.'}
      </DialogDescription>
    </DialogHeader>

    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date et client */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date de vente</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {/* Informations client */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-sm text-blue-700 dark:text-blue-300">
            Informations Client
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ClientSearchInput
            value={clientName}
            onChange={setClientName}
            onClientSelect={handleClientSelect}
            disabled={isSubmitting}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientPhone">Numéro de téléphone</Label>
              <Input
                id="clientPhone"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="Ex: 0692123456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientAddress">Adresse</Label>
              <Input
                id="clientAddress"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Adresse complète du client"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Produits */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Produits</h3>
          {/* <Button
            type="button"
            onClick={addNewProduct}
            className="bg-green-600 hover:bg-green-700"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un produit
          </Button> */}
        </div>

        {formProducts.map((product, index) => (
          <Card
            key={index}
            className="border-2 border-gray-200 dark:border-gray-700"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Produit {index + 1}
                  {product.isAdvanceProduct && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                      Avance
                    </span>
                  )}
                </CardTitle>
                {formProducts.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteProduct(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sélection produit */}
              <div className="space-y-2">
                <Label>Produit</Label>
                <ProductSearchInput
                  onProductSelect={(prod) => handleProductSelect(prod, index)}
                  selectedProduct={product.selectedProduct}
                />
              </div>

              {product.selectedProduct && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Prix d'achat unitaire */}
                  <div className="space-y-2">
                    <Label>Prix d'achat unitaire (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={product.purchasePriceUnit}
                      readOnly
                      disabled
                    />
                  </div>

                  {/* Prix de vente unitaire */}
                  <div className="space-y-2">
                    <Label>Prix de vente unitaire (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={product.sellingPriceUnit}
                      onChange={(e) =>
                        handleSellingPriceChange(e.target.value, index)
                      }
                      disabled={isSubmitting}
                      className={
                        Number(product.profit) < 0 ? 'border-red-500' : ''
                      }
                    />
                  </div>

                  {/* Quantité */}
                  <SaleQuantityInput
                    quantity={product.quantitySold}
                    maxQuantity={product.maxQuantity}
                    onChange={(value) =>
                      handleQuantityChange(value, index)
                    }
                    disabled={isSubmitting || product.isAdvanceProduct}
                    showAvailableStock={!product.isAdvanceProduct}
                  />

                  {/* Bénéfice */}
                  <div className="space-y-2">
                    <Label>Bénéfice (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={product.profit}
                      readOnly
                      disabled
                      className={
                        Number(product.profit) < 0
                          ? 'border-red-500 bg-red-50'
                          : ''
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bouton ajouté juste avant les totaux */}
      <div className="text-center py-4">
        <Button
          type="button"
          onClick={addNewProduct}
          variant="outline"
          className="text-green-600 border-green-600 hover:bg-green-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un autre produit
        </Button>
      </div>

      {/* Totaux */}
      {formProducts.some((p) => p.selectedProduct) && (
        <>
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Totaux de la vente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Prix d'achat total
                  </p>
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {totals.totalPurchasePrice.toFixed(2)} €
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Prix de vente total
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    {totals.totalSellingPrice.toFixed(2)} €
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Bénéfice total
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      totals.totalProfit >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {totals.totalProfit.toFixed(2)} €
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bouton Avance */}
          <div className="text-center">
            <Button
              type="button"
              onClick={() => setShowAdvanceSection(!showAdvanceSection)}
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20"
            >
              {showAdvanceSection ? 'Masquer Avance' : 'Avance'}
            </Button>
          </div>

          {/* Section Avance */}
          {showAdvanceSection && (
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-sm text-blue-700 dark:text-blue-300">
                  Paiement avec Avance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Prix Avance */}
                  <div className="space-y-2">
                    <Label htmlFor="avancePrice">Prix Avance (€)</Label>
                    <Input
                      id="avancePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      max={totals.totalSellingPrice}
                      value={avancePrice}
                      onChange={(e) => handleAvancePriceChange(e.target.value)}
                      placeholder="Entrer l'avance"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Reste (calculé automatiquement) */}
                  <div className="space-y-2">
                    <Label htmlFor="reste">Reste (€)</Label>
                    <Input
                      id="reste"
                      type="number"
                      step="0.01"
                      value={reste}
                      readOnly
                      disabled
                      className="bg-gray-100 dark:bg-gray-800"
                    />
                  </div>

                  {/* Date prochaine Paiement */}
                  <div className="space-y-2">
                    <Label htmlFor="nextPaymentDate">Date prochaine Paiement</Label>
                    <Input
                      id="nextPaymentDate"
                      type="date"
                      value={nextPaymentDate}
                      onChange={(e) => setNextPaymentDate(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {avancePrice && Number(avancePrice) > 0 && (
                  <div className="text-sm text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 p-3 rounded">
                    <p className="font-semibold">Information:</p>
                    <p>Cette vente sera enregistrée avec un prix de vente de {Number(avancePrice).toFixed(2)} € (avance) et un reste de {reste} € sera enregistré.</p>
                    <p className="mt-2">Un prêt produit sera automatiquement créé dans votre base de données.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      <DialogFooter>
        {editSale && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDeleteSale}
            disabled={isSubmitting}
            className="mr-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer toute la vente
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Annuler
        </Button>

        <Button
          type="submit"
          className="bg-app-green hover:bg-opacity-90"
          disabled={
            isSubmitting ||
            formProducts.filter(
              (p) => p.selectedProduct && p.sellingPriceUnit
            ).length === 0
          }
        >
          {isSubmitting
            ? 'Enregistrement...'
            : editSale
            ? 'Mettre à jour'
            : 'Ajouter la vente'}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>

  {/* Dialog de confirmation de suppression */}
  <ConfirmDeleteDialog
    isOpen={deleteDialogOpen}
    onClose={() => {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }}
    onConfirm={executeDelete}
    title={
      deleteTarget?.type === 'sale'
        ? 'Supprimer toute la vente'
        : 'Supprimer ce produit'
    }
    description={
      deleteTarget?.type === 'sale'
        ? 'Êtes-vous sûr de vouloir supprimer définitivement cette vente complète ? Cette action est irréversible.'
        : 'Êtes-vous sûr de vouloir supprimer ce produit de la vente ? Cette action est irréversible.'
    }
    isSubmitting={isSubmitting}
  />
</Dialog>

  );
};

export default MultiProductSaleForm;