import React, { useState, useEffect, useRef } from 'react';
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
import AdvancePaymentModal from './AdvancePaymentModal';
import PretProduitFromSaleModal from './PretProduitFromSaleModal';
import axios from 'axios';
import { setFormProtection } from '@/hooks/use-realtime-sync';

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
  isPretProduit: boolean;
  deliveryLocation: string;
  deliveryFee: string;
  avancePretProduit: string;
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
    isAdvanceProduct: false,
    isPretProduit: false,
    deliveryLocation: 'Saint-Denis',
    deliveryFee: '0',
    avancePretProduit: ''
  }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'sale' | 'product', index?: number } | null>(null);
  
  // États pour la fonctionnalité Avance
  const [showAdvanceSection, setShowAdvanceSection] = useState(false);
  const [avancePrice, setAvancePrice] = useState('');
  const [reste, setReste] = useState('');
  const [nextPaymentDate, setNextPaymentDate] = useState('');
  
  // États pour la modale de paiement d'avance sur prêts existants
  const [advancePaymentModalOpen, setAdvancePaymentModalOpen] = useState(false);
  const [currentAdvanceProductIndex, setCurrentAdvanceProductIndex] = useState<number | null>(null);
  
  // États pour la modale de création de prêt produit
  const [pretProduitModalOpen, setPretProduitModalOpen] = useState(false);
  const [currentPretProductIndex, setCurrentPretProductIndex] = useState<number | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

  // Référence pour éviter les réinitialisations multiples
  const isInitializedRef = useRef(false);
  const lastEditSaleIdRef = useRef<string | null>(null);

  // Activer/désactiver la protection de synchronisation quand le formulaire s'ouvre/ferme
  useEffect(() => {
    if (isOpen) {
      // Activer la protection - bloquer toute synchronisation
      setFormProtection(true);
      console.log('Protection formulaire activée - synchronisation bloquée');
    } else {
      // Désactiver la protection quand le formulaire se ferme
      setFormProtection(false);
      console.log('Protection formulaire désactivée - synchronisation autorisée');
      // Réinitialiser les refs quand le formulaire se ferme
      isInitializedRef.current = false;
      lastEditSaleIdRef.current = null;
    }

    // Cleanup: toujours désactiver la protection à la destruction du composant
    return () => {
      setFormProtection(false);
    };
  }, [isOpen]);

  // Réinitialiser le formulaire UNIQUEMENT à l'ouverture initiale ou changement de vente
  useEffect(() => {
    const loadSaleData = async () => {
      // Ne charger que si le formulaire vient de s'ouvrir et n'est pas déjà initialisé
      // OU si on change de vente en édition
      const editSaleId = editSale?.id || null;
      const shouldInitialize = isOpen && (!isInitializedRef.current || lastEditSaleIdRef.current !== editSaleId);
      
      if (!shouldInitialize) {
        return; // Ne pas réinitialiser si déjà initialisé
      }

      isInitializedRef.current = true;
      lastEditSaleIdRef.current = editSaleId;

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
            
            const isPret = saleProduct.description.toLowerCase().includes('prêt') || 
                           saleProduct.description.toLowerCase().includes('pret');
            
            return {
              productId: saleProduct.productId,
              description: saleProduct.description,
              sellingPriceUnit: sellingPriceUnit.toString(),
              quantitySold: saleProduct.quantitySold.toString(),
              purchasePriceUnit: purchasePriceUnit.toString(),
              profit: saleProduct.profit.toString(),
              selectedProduct: product || null,
              maxQuantity: product ? (product.quantity || 0) + saleProduct.quantitySold : 0,
              isAdvanceProduct: isAdvance,
              isPretProduit: isPret,
              deliveryLocation: saleProduct.deliveryLocation || 'Saint-Denis',
              deliveryFee: (saleProduct.deliveryFee || 0).toString(),
              avancePretProduit: isPret && saleProduct.sellingPrice > 0 ? saleProduct.sellingPrice.toString() : ''
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
          isAdvanceProduct: false,
          isPretProduit: false,
          deliveryLocation: 'Saint-Denis',
          deliveryFee: '0',
          avancePretProduit: ''
        }]);
        // Réinitialiser les champs avance
        setShowAdvanceSection(false);
        setAvancePrice('');
        setReste('');
        setNextPaymentDate('');
      }
    };
    
    loadSaleData();
  }, [isOpen, editSale]); // Retiré 'products' des dépendances pour éviter les réinitialisations

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
      isAdvanceProduct: false,
      isPretProduit: false,
      deliveryLocation: 'Saint-Denis',
      deliveryFee: '0',
      avancePretProduit: ''
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
         className: "notification-erreur",
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

    // Vérifier si c'est "Prêt Produit" - nouveau comportement
    const isPretProduit = product.description.toLowerCase().includes('prêt') || 
                          product.description.toLowerCase().includes('pret');

    if (isPretProduit) {
      // Ouvrir la modale pour créer un nouveau prêt produit
      setCurrentPretProductIndex(index);
      setPretProduitModalOpen(true);
      return;
    }

    // Vérifier si c'est "Avance Perruque ou Tissages"
    const isAdvancePerruqueOuTissages = product.description.toLowerCase().includes('avance') && 
                                         (product.description.toLowerCase().includes('perruque') || 
                                          product.description.toLowerCase().includes('tissage'));

    if (isAdvancePerruqueOuTissages) {
      // Ouvrir la modale pour sélectionner les prêts existants
      setCurrentAdvanceProductIndex(index);
      setAdvancePaymentModalOpen(true);
      
      // Préremplir les données de base du produit
      setFormProducts(prev => {
        const newProducts = [...prev];
        newProducts[index] = {
          ...newProducts[index],
          productId: String(product.id),
          description: product.description,
          selectedProduct: product,
          maxQuantity: productQuantity,
          isAdvanceProduct: true,
          isPretProduit: false,
          purchasePriceUnit: purchasePriceUnit.toString(),
          sellingPriceUnit: '', // Sera rempli après la modale
          quantitySold: '0',
          profit: '0',
        };
        return newProducts;
      });
      return;
    }

    setFormProducts(prev => {
      const newProducts = [...prev];
      const newQuantity = isAdvance ? '0' : '1';
      const newPurchasePriceUnit = purchasePriceUnit.toString();
      const newSellingPriceUnit = isAdvance ? '' : suggestedSellingPrice;
      
      // Pour les produits "Avance", le bénéfice est toujours 0
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
        isPretProduit: false,
        purchasePriceUnit: newPurchasePriceUnit,
        sellingPriceUnit: newSellingPriceUnit,
        quantitySold: newQuantity,
        profit: initialProfit,
      };
      
      return newProducts;
    });
  };

  // Gérer la confirmation de la modale d'avance sur prêts existants
  const handleAdvancePaymentConfirm = (totalAdvance: number) => {
    if (currentAdvanceProductIndex !== null) {
      setFormProducts(prev => {
        const newProducts = [...prev];
        newProducts[currentAdvanceProductIndex] = {
          ...newProducts[currentAdvanceProductIndex],
          sellingPriceUnit: totalAdvance.toString(),
          profit: '0', // Les avances n'ont pas de bénéfice
        };
        return newProducts;
      });
      
      setCurrentAdvanceProductIndex(null);
      toast({
        title: 'Succès',
        description: `Avance de ${totalAdvance.toLocaleString('fr-FR')} € ajoutée au produit`,
      });
    }
  };

  // Gérer la création d'un prêt produit depuis la modale
  const handlePretProduitCreated = (pretProduit: any, product: Product) => {
    if (currentPretProductIndex !== null) {
      setFormProducts(prev => {
        const newProducts = [...prev];
        newProducts[currentPretProductIndex] = {
          ...newProducts[currentPretProductIndex],
          productId: String(product.id),
          description: `Prêt - ${pretProduit.description}`,
          selectedProduct: product,
          maxQuantity: product.quantity || 0,
          isAdvanceProduct: false,
          isPretProduit: true,
          purchasePriceUnit: product.purchasePrice.toString(),
          sellingPriceUnit: '',
          quantitySold: '1',
          profit: '0',
          avancePretProduit: ''
        };
        return newProducts;
      });
      
      setCurrentPretProductIndex(null);
      toast({
        title: 'Succès',
        description: `Prêt produit ajouté - veuillez entrer le prix de vente`,
        className: "notification-success",
      });
    }
  };

  // Mise à jour du profit
  const updateProfit = (index: number, priceUnit: string, quantity: string, purchasePriceUnit: string) => {
    const product = formProducts[index];
    if (product.isAdvanceProduct) {
      // Pour les produits "Avance", le bénéfice est toujours 0
      setFormProducts(prev => {
        const newProducts = [...prev];
        newProducts[index] = { ...newProducts[index], profit: '0' };
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
      const deliveryFee = Number(product.deliveryFee || 0);
      
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
        totalSellingPrice: totals.totalSellingPrice + sellingPrice + deliveryFee,
        totalProfit: totals.totalProfit + Number(product.profit || 0),
        totalDeliveryFee: totals.totalDeliveryFee + deliveryFee
      };
    }, { totalPurchasePrice: 0, totalSellingPrice: 0, totalProfit: 0, totalDeliveryFee: 0 });
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
        variant: "destructive", className: "notification-erreur",
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
        const deliveryFee = Number(product.deliveryFee || 0);
        
        // Détecter automatiquement si c'est un prêt produit
        const isPretProduit = product.isPretProduit || 
                              product.description.toLowerCase().includes('prêt') || 
                              product.description.toLowerCase().includes('pret');
        
        let purchasePrice, sellingPrice;
        
        if (product.isAdvanceProduct) {
          purchasePrice = purchasePriceUnit;
          sellingPrice = sellingPriceUnit;
        } else if (isPretProduit) {
          // Pour les prêts produits, sellingPrice = avance si rempli, sinon 0
          purchasePrice = purchasePriceUnit * quantity;
          // Si avance est vide ou 0, sellingPrice = 0, sinon sellingPrice = montant avance
          const avanceValue = product.avancePretProduit?.trim();
          sellingPrice = avanceValue && Number(avanceValue) > 0 ? Number(avanceValue) : 0;
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
          profit: Number(product.profit),
          deliveryFee: deliveryFee,
          deliveryLocation: product.deliveryLocation
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
        totalDeliveryFee: totals.totalDeliveryFee,
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
        variant: "destructive", className: "notification-erreur",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totals = getTotals();

  return (
<Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-400">
    <DialogHeader>
      <DialogTitle>
        {editSale ? 'Modifier la vente multi-produits' : 'Ajouter une vente multi-produits'}
      </DialogTitle>
      <DialogDescription>
       <p className="text-white">
  {editSale
    ? 'Modifiez les détails de cette vente avec plusieurs produits.'
    : 'Enregistrez une vente avec un ou plusieurs produits.'}
</p>
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

      {/* Informations client - Premium Design */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 dark:from-blue-900/30 dark:via-indigo-900/20 dark:to-purple-900/10 border-0 shadow-xl shadow-blue-500/10 rounded-2xl">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-indigo-300/20 rounded-full blur-2xl" />
        </div>
        <CardHeader className="relative pb-2">
          <CardTitle className="text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <Package className="h-4 w-4 text-white" />
            </div>
            Informations Client
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <ClientSearchInput
            value={clientName}
            onChange={setClientName}
            onClientSelect={handleClientSelect}
            disabled={isSubmitting}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientPhone" className="font-semibold text-gray-700 dark:text-gray-300">Numéro de téléphone</Label>
              <Input
                id="clientPhone"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="Ex: 0692123456"
                className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientAddress" className="font-semibold text-gray-700 dark:text-gray-300">Adresse</Label>
              <Input
                id="clientAddress"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Adresse complète du client"
                className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all duration-300"
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
            className="relative overflow-hidden border-0 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/30 rounded-2xl bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 dark:from-gray-800 dark:via-gray-800/80 dark:to-blue-900/20"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-200/10 rounded-full blur-2xl" />
            </div>
            <CardHeader className="relative pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                    <Package className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
                    Produit {index + 1}
                  </span>
                  {product.isAdvanceProduct && (
                    <span className="text-xs bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-3 py-1 rounded-full font-semibold shadow-sm">
                      ⭐ Avance
                    </span>
                  )}
                </CardTitle>
                {formProducts.length > 1 && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleDeleteProduct(index)}
                    className="h-9 px-3 rounded-xl font-bold text-sm bg-gradient-to-r from-red-500 via-red-600 to-rose-600 hover:from-red-600 hover:via-red-700 hover:to-rose-700 text-white border-0 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
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

                  {/* Avance (visible uniquement pour les prêts produits) */}
                  {product.isPretProduit && (
                    <div className="space-y-2">
                      <Label>Avance (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={product.avancePretProduit}
                        onChange={(e) => {
                          const avanceValue = e.target.value;
                          setFormProducts(prev => {
                            const newProducts = [...prev];
                            newProducts[index] = {
                              ...newProducts[index],
                              avancePretProduit: avanceValue
                            };
                            return newProducts;
                          });
                        }}
                        placeholder="Montant de l'avance"
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-gray-500">
                        Facultatif - Si vide, le prix de vente sera 0
                      </p>
                    </div>
                  )}

                  {/* Frais de livraison */}
                  <div className="space-y-2 col-span-2">
                    <Label>Frais de livraison</Label>
                    <select
                      value={product.deliveryLocation}
                      onChange={(e) => {
                        const location = e.target.value;
                        let fee = '0';
                        
                        if (['Saint-Suzanne', 'Sainte-Marie', 'Saint-Denis', 'La Possession', 'Le Port', 'Saint-Paul'].includes(location)) {
                          fee = '0';
                        } else if (['Saint-André', 'Saint-Benoît', 'Saint-Leu'].includes(location)) {
                          fee = '10';
                        } else if (['Saint-Louis', 'Saint-Pierre', 'Le Tampon', 'Saint-Joseph'].includes(location)) {
                          fee = '20';
                        } else if (location === 'Exonération') {
                          fee = '0';
                        }
                        
                        setFormProducts(prev => {
                          const newProducts = [...prev];
                          newProducts[index] = {
                            ...newProducts[index],
                            deliveryLocation: location,
                            deliveryFee: fee
                          };
                          return newProducts;
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isSubmitting}
                    >
                      <option value="Saint-Suzanne">Saint-Suzanne: gratuit</option>
                      <option value="Sainte-Marie">Sainte-Marie: gratuit</option>
                      <option value="Saint-Denis">Saint-Denis: gratuit</option>
                      <option value="La Possession">La Possession: gratuit</option>
                      <option value="Le Port">Le Port: gratuit</option>
                      <option value="Saint-Paul">Saint-Paul: gratuit</option>
                      <option value="Saint-André">Saint-André: 10€</option>
                      <option value="Saint-Benoît">Saint-Benoît: 10€</option>
                      <option value="Saint-Leu">Saint-Leu: 10€</option>
                      <option value="Saint-Louis">Saint-Louis: 20€</option>
                      <option value="Saint-Pierre">Saint-Pierre: 20€</option>
                      <option value="Le Tampon">Le Tampon: 20€</option>
                      <option value="Saint-Joseph">Saint-Joseph: 20€</option>
                      <option value="Autres">Autres: montant personnalisé</option>
                      <option value="Exonération">Exonération: 0€</option>
                    </select>
                    {product.deliveryLocation === 'Autres' && (
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={product.deliveryFee}
                        onChange={(e) => {
                          setFormProducts(prev => {
                            const newProducts = [...prev];
                            newProducts[index] = {
                              ...newProducts[index],
                              deliveryFee: e.target.value
                            };
                            return newProducts;
                          });
                        }}
                        placeholder="Montant personnalisé"
                        className="mt-2"
                        disabled={isSubmitting}
                      />
                    )}
                    <p className="text-sm text-gray-500">
                      Frais: {Number(product.deliveryFee).toFixed(2)} €
                    </p>
                  </div>

                  {/* Bénéfice */}
                  <div className="space-y-2 col-span-2">
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

      {/* Bouton premium pour ajouter un produit */}
      <div className="text-center py-4">
        <Button
          type="button"
          onClick={addNewProduct}
          className="rounded-xl font-bold bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 transform hover:-translate-y-0.5 px-6"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajouter un autre produit
        </Button>
      </div>

      {/* Totaux */}
      {formProducts.some((p) => p.selectedProduct) && (
        <>
          <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50/50 to-teal-50/30 dark:from-green-900/30 dark:via-emerald-900/20 dark:to-teal-900/10 border-0 shadow-xl shadow-green-500/10 rounded-2xl">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-green-300/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-emerald-300/20 rounded-full blur-2xl" />
            </div>
            <CardHeader className="relative pb-2">
              <CardTitle className="text-base font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Euro className="h-4 w-4 text-white" />
                </div>
                Totaux de la vente
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white/60 dark:bg-gray-800/40 rounded-xl p-3 shadow-sm">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Prix d'achat total
                  </p>
                  <p className="text-lg font-black text-gray-800 dark:text-gray-200">
                    {totals.totalPurchasePrice.toFixed(2)} €
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/40 rounded-xl p-3 shadow-sm">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Frais de livraison
                  </p>
                  <p className="text-lg font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {totals.totalDeliveryFee.toFixed(2)} €
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/40 rounded-xl p-3 shadow-sm">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Prix de vente total
                  </p>
                  <p className="text-lg font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {totals.totalSellingPrice.toFixed(2)} €
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/40 rounded-xl p-3 shadow-sm">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Bénéfice total
                  </p>
                  <p
                    className={`text-lg font-black ${
                      totals.totalProfit >= 0
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'
                        : 'bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent'
                    }`}
                  >
                    {totals.totalProfit.toFixed(2)} €
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bouton Avance Premium */}
          <div className="text-center">
            <Button
              type="button"
              onClick={() => setShowAdvanceSection(!showAdvanceSection)}
              className="rounded-xl font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-0.5 px-6"
            >
              {showAdvanceSection ? '✕ Masquer Avance' : '💳 Avance'}
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

      <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
        {editSale && (
          <Button
            type="button"
            onClick={handleDeleteSale}
            disabled={isSubmitting}
            className="sm:mr-auto rounded-xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-rose-600 hover:from-red-600 hover:via-red-700 hover:to-rose-700 text-white border-0 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
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
          className="rounded-xl border-2 border-gray-300 hover:bg-gray-50 font-semibold transition-all duration-300"
        >
          Annuler
        </Button>

        <Button
          type="submit"
          disabled={
            isSubmitting ||
            formProducts.filter(
              (p) => p.selectedProduct && p.sellingPriceUnit
            ).length === 0
          }
          className="rounded-xl font-bold bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          {isSubmitting
            ? 'Enregistrement...'
            : editSale
            ? '✓ Mettre à jour'
            : '✓ Ajouter la vente'}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>

  {/* Modale de paiement d'avance sur prêts existants */}
  <AdvancePaymentModal
    isOpen={advancePaymentModalOpen}
    onClose={() => {
      setAdvancePaymentModalOpen(false);
      setCurrentAdvanceProductIndex(null);
    }}
    onConfirm={handleAdvancePaymentConfirm}
  />

  {/* Modale de création de prêt produit */}
  <PretProduitFromSaleModal
    isOpen={pretProduitModalOpen}
    onClose={() => {
      setPretProduitModalOpen(false);
      setCurrentPretProductIndex(null);
    }}
    onPretCreated={handlePretProduitCreated}
  />

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