import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { Product, SaleProduct, Sale } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Plus, Package } from 'lucide-react';
import ProductPhotoSlideshow from '../ProductPhotoSlideshow';
import { calculateSaleProfit } from './utils/saleCalculations';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import AdvancePaymentModal from './AdvancePaymentModal';
import PretProduitFromSaleModal from './PretProduitFromSaleModal';
import axios from 'axios';
import { setFormProtection } from '@/hooks/use-realtime-sync';

// Sub-components
import SaleClientSection from './sections/SaleClientSection';
import SaleProductCard from './sections/SaleProductCard';
import SaleTotalsSection from './sections/SaleTotalsSection';
import SaleFormActions from './sections/SaleFormActions';
import ReservedProductModal from './modals/ReservedProductModal';
import { FormProduct, ReductionType, createEmptyFormProduct, computeReductionAmount } from './types/saleFormTypes';
import DuplicateClientModal from '@/components/clients/DuplicateClientModal';
import { findMatchingClients, matchSignature, type ClientLike, type ClientMatch } from '@/utils/clientMatch';
import { computeClientCaracteristique } from '@/utils/clientCharacteristic';
import { livraisonVilleApi, LivraisonVille } from '@/services/api/villesApi';

interface MultiProductSaleFormProps {
  isOpen: boolean;
  onClose: () => void;
  editSale?: Sale;
  onRefund?: (sale: Sale) => void;
}

const MultiProductSaleForm: React.FC<MultiProductSaleFormProps> = ({ isOpen, onClose, editSale, onRefund }) => {
  const { products, addSale, updateSale, deleteSale, sales } = useApp();
  const { toast } = useToast();
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientPhones, setClientPhones] = useState<string[]>([]);
  const [clientAddress, setClientAddress] = useState('');
  const [clientVille, setClientVille] = useState('');
  
  const [clientPhoto, setClientPhoto] = useState<string | null>(null);
  const [formProducts, setFormProducts] = useState<FormProduct[]>([createEmptyFormProduct()]);
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

  // États pour la modale de confirmation produit réservé
  const [reservedModalOpen, setReservedModalOpen] = useState(false);
  const [pendingReservedProduct, setPendingReservedProduct] = useState<{ product: Product; index: number } | null>(null);
  // État pour la modale de suppression de réservation bloquante
  const [reservationConflictModalOpen, setReservationConflictModalOpen] = useState(false);
  const [conflictingReservation, setConflictingReservation] = useState<any>(null);
  const [pendingConflictProduct, setPendingConflictProduct] = useState<{ product: Product; index: number } | null>(null);
  // État pour le slideshow photo produit
  const [slideshowProduct, setSlideshowProduct] = useState<{ photos: string[]; mainPhoto?: string; name: string } | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

  // Détection des doublons client + caractéristique
  const [allClients, setAllClients] = useState<ClientLike[]>([]);
  const [allCommandes, setAllCommandes] = useState<any[]>([]);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState<ClientMatch[]>([]);
  /** Empêche la réouverture en boucle pour la même saisie + signatures explicitement rejetées */
  const dismissedSigsRef = useRef<Set<string>>(new Set());
  /** Quand l'utilisateur a sélectionné/édité un client, on ne re-détecte pas tant que les données ne changent pas */
  const acceptedSigRef = useRef<string | null>(null);

  // Villes de livraison (pour récupérer le tarif d'origine de la ville)
  const [villesLivraison, setVillesLivraison] = useState<LivraisonVille[]>([]);
  useEffect(() => {
    if (!isOpen) return;
    livraisonVilleApi.getAll().then(setVillesLivraison).catch(() => setVillesLivraison([]));
  }, [isOpen]);

  // Charger clients + commandes à l'ouverture (pour matching et caractéristique)
  useEffect(() => {
    if (!isOpen) return;
    const token = localStorage.getItem('token');
    Promise.all([
      axios.get(`${API_BASE_URL}/api/clients`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data).catch(() => []),
      axios.get(`${API_BASE_URL}/api/commandes`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data).catch(() => []),
    ]).then(([cs, cmds]) => {
      setAllClients(Array.isArray(cs) ? cs : []);
      setAllCommandes(Array.isArray(cmds) ? cmds : []);
    });
  }, [isOpen, API_BASE_URL]);

  const currentClientCaracteristique = React.useMemo(() => {
    if (!clientName || clientName.trim().length < 2) return null;
    return computeClientCaracteristique(clientName, allClients as any, sales || [], allCommandes as any);
  }, [clientName, allClients, sales, allCommandes]);

  // Détection debounced des doublons
  useEffect(() => {
    if (!isOpen || editSale) return;
    const phones = [clientPhone, ...clientPhones].filter(Boolean);
    const addresses = [clientAddress].filter(Boolean);
    const typed = { nom: clientName, phones, addresses };
    const sig = matchSignature(typed);
    if (!clientName.trim() && phones.length === 0 && addresses.length === 0) return;
    if (acceptedSigRef.current === sig) return;
    if (dismissedSigsRef.current.has(sig)) return;
    const t = setTimeout(() => {
      const matches = findMatchingClients(allClients, typed);
      if (matches.length > 0) {
        setDuplicateMatches(matches);
        setDuplicateModalOpen(true);
      }
    }, 600);
    return () => clearTimeout(t);
  }, [isOpen, editSale, clientName, clientPhone, clientPhones, clientAddress, allClients]);

  const closeDuplicateModal = () => {
    const phones = [clientPhone, ...clientPhones].filter(Boolean);
    const addresses = [clientAddress].filter(Boolean);
    dismissedSigsRef.current.add(matchSignature({ nom: clientName, phones, addresses }));
    setDuplicateModalOpen(false);
  };

  const handleUseExistingFromDuplicate = (client: ClientLike) => {
    handleClientSelect(client);
    const phones = client.phones && client.phones.length ? client.phones : (client.phone ? [client.phone] : []);
    acceptedSigRef.current = matchSignature({
      nom: client.nom,
      phones,
      addresses: client.addresses && client.addresses.length ? client.addresses : (client.adresse ? [client.adresse] : []),
    });
    // Rafraîchir la liste locale pour refléter d'éventuelles modifs
    const token = localStorage.getItem('token');
    axios.get(`${API_BASE_URL}/api/clients`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setAllClients(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  };

  const handleUpdateExistingClient = async (clientId: string, patch: { nom: string; phones: string[]; addresses: string[] }) => {
    const token = localStorage.getItem('token');
    const fd = new FormData();
    fd.append('nom', patch.nom);
    fd.append('phones', JSON.stringify(patch.phones));
    fd.append('addresses', JSON.stringify(patch.addresses));
    fd.append('adresse', patch.addresses[0] || '');
    try {
      await axios.put(`${API_BASE_URL}/api/clients/${clientId}`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      const r = await axios.get(`${API_BASE_URL}/api/clients`, { headers: { Authorization: `Bearer ${token}` } });
      setAllClients(Array.isArray(r.data) ? r.data : []);
      toast({ title: 'Client mis à jour', description: `${patch.nom} a été modifié`, className: 'notification-success' });
    } catch (err) {
      console.error('Erreur maj client:', err);
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le client', variant: 'destructive', className: 'notification-erreur' });
    }
  };

  // Référence pour éviter les réinitialisations multiples
  const isInitializedRef = useRef(false);
  const lastEditSaleIdRef = useRef<string | null>(null);

  // Activer/désactiver la protection de synchronisation quand le formulaire s'ouvre/ferme
  useEffect(() => {
    if (isOpen) {
      setFormProtection(true);
      console.log('Protection formulaire activée - synchronisation bloquée');
    } else {
      setFormProtection(false);
      console.log('Protection formulaire désactivée - synchronisation autorisée');
      isInitializedRef.current = false;
      lastEditSaleIdRef.current = null;
    }
    return () => { setFormProtection(false); };
  }, [isOpen]);

  // Réinitialiser le formulaire UNIQUEMENT à l'ouverture initiale ou changement de vente
  useEffect(() => {
    const loadSaleData = async () => {
      const editSaleId = editSale?.id || null;
      const shouldInitialize = isOpen && (!isInitializedRef.current || lastEditSaleIdRef.current !== editSaleId);
      
      if (!shouldInitialize) return;

      isInitializedRef.current = true;
      lastEditSaleIdRef.current = editSaleId;

      if (editSale) {
        setDate(new Date(editSale.date).toISOString().split('T')[0]);
        setClientName(editSale.clientName || '');
        setClientPhone(editSale.clientPhone || '');
        setClientAddress(editSale.clientAddress || '');
        setClientVille((editSale as any).clientVille || '');
        
        const hasReste = editSale.reste && editSale.reste > 0;
        if (hasReste) {
          setShowAdvanceSection(true);
          setAvancePrice(editSale.totalSellingPrice?.toString() || '0');
          setReste(editSale.reste.toString());
          
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
        
        if (editSale.products && editSale.products.length > 0) {
          const loadedProducts = editSale.products.map(saleProduct => {
            const product = products.find(p => p.id === saleProduct.productId);
            const isAdvance = saleProduct.description.toLowerCase().includes('avance');
            const absQuantity = Math.abs(saleProduct.quantitySold) || 1;
            const purchasePriceUnit = isAdvance ? saleProduct.purchasePrice : (saleProduct.purchasePrice / absQuantity);
            const sellingPriceUnit = isAdvance ? saleProduct.sellingPrice : (saleProduct.sellingPrice / absQuantity);
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
              maxQuantity: product ? (product.quantity || 0) + Math.abs(saleProduct.quantitySold) : 0,
              isAdvanceProduct: isAdvance,
              isPretProduit: isPret,
              deliveryLocation: saleProduct.deliveryLocation || 'Saint-Denis',
              deliveryFee: (saleProduct.deliveryFee || 0).toString(),
              avancePretProduit: isPret && saleProduct.sellingPrice > 0 ? saleProduct.sellingPrice.toString() : '',
              reduction: (saleProduct as any).reduction !== undefined && (saleProduct as any).reduction !== null ? String((saleProduct as any).reduction) : '',
              reductionType: ((saleProduct as any).reductionType as any) || ''
            };
          });
          setFormProducts(loadedProducts);
        }
      } else {
        setDate(new Date().toISOString().split('T')[0]);
        setClientName('');
        setClientPhone('');
        setClientAddress('');
        setClientVille('');
        setClientPhoto(null);
        setFormProducts([createEmptyFormProduct()]);
        setShowAdvanceSection(false);
        setAvancePrice('');
        setReste('');
        setNextPaymentDate('');
      }
    };
    loadSaleData();
  }, [isOpen, editSale]);

  // Gestion du client
  const handleClientSelect = (client: any) => {
    if (client) {
      const phones = client.phones && client.phones.length > 0 ? client.phones : (client.phone ? [client.phone] : []);
      setClientName(client.nom);
      setClientPhones(phones);
      setClientPhone(phones[0] || '');
      setClientAddress(client.adresse);
      setClientVille(client.ville || '');
      setClientPhoto(client.photo || null);
    } else {
      setClientPhones([]);
      setClientPhone('');
      setClientAddress('');
      setClientVille('');
      setClientPhoto(null);
    }
  };

  // Ajouter un nouveau produit
  const addNewProduct = () => {
    setFormProducts(prev => [...prev, createEmptyFormProduct()]);
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

  // Exécuter la suppression confirmée - avec gestion stock vente vs remboursement
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
        // Vérifier si c'est un remboursement
        const isRefund = editSale.isRefund === true;

        if (isRefund) {
          // REMBOURSEMENT: soustraire la quantité du stock
          // deleteSale va ajouter les quantités au stock (comportement par défaut du backend),
          // donc on doit compenser en soustrayant 2x la quantité pour obtenir un net de -quantité
          const token = localStorage.getItem('token');
          const saleProducts = editSale.products || [];

          // D'abord supprimer la vente (le backend va ajouter les quantités au stock)
          const success = await deleteSale(editSale.id);

          if (success) {
            // Maintenant soustraire 2x les quantités pour compenser l'ajout du backend + la soustraction voulue
            for (const sp of saleProducts) {
              if (sp.productId && sp.quantitySold > 0) {
                try {
                  // Récupérer le produit actuel pour connaître sa quantité après l'ajout du backend
                  const productResponse = await axios.get(`${API_BASE_URL}/api/products/${sp.productId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  const currentProduct = productResponse.data;
                  const newQuantity = (currentProduct.quantity || 0) - (2 * sp.quantitySold);
                  
                  await axios.put(`${API_BASE_URL}/api/products/${sp.productId}`, {
                    quantity: Math.max(0, newQuantity)
                  }, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  console.log(`📦 Stock ajusté (remboursement supprimé): ${sp.description} → -${sp.quantitySold}`);
                } catch (err) {
                  console.error(`Erreur ajustement stock produit ${sp.productId}:`, err);
                }
              }
            }
            toast({
              title: "Succès",
              description: "Le remboursement a été supprimé et le stock a été ajusté",
              className: "notification-success",
            });
            onClose();
          }
        } else {
          // VENTE NORMALE: deleteSale gère déjà la restauration du stock via le backend
          const success = await deleteSale(editSale.id);
          if (success) {
            toast({
              title: "Succès",
              description: "La vente a été supprimée et le stock a été restauré",
              className: "notification-success",
            });
            onClose();
          }
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

  // Sélection d'un produit - vérifie les réservations bloquantes
  const handleProductSelect = async (product: Product, index: number) => {
    // Vérifier les réservations actives qui bloquent le stock
    try {
      const token = localStorage.getItem('token');
      const commandesResponse = await axios.get(`${API_BASE_URL}/api/commandes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allCommandes = commandesResponse.data;
      
      // Calculer la quantité réservée pour ce produit
      let reservedQty = 0;
      let blockingReservation: any = null;
      allCommandes.forEach((c: any) => {
        if (c.statut === 'valide' || c.statut === 'annule') return;
        if (c.type !== 'reservation') return;
        c.produits?.forEach((p: any) => {
          if (p.nom.toLowerCase() === product.description.toLowerCase()) {
            reservedQty += p.quantite;
            if (!blockingReservation) blockingReservation = c;
          }
        });
      });
      
      const availableQty = product.quantity - reservedQty;
      
      // Si tout le stock est réservé, proposer de supprimer la réservation
      if (availableQty <= 0 && blockingReservation) {
        setConflictingReservation(blockingReservation);
        setPendingConflictProduct({ product, index });
        setReservationConflictModalOpen(true);
        return;
      }
    } catch (error) {
      console.error('Erreur vérification réservations:', error);
    }

    if ((product as any).reserver === 'oui' && product.quantity === 1) {
      setPendingReservedProduct({ product, index });
      setReservedModalOpen(true);
      return;
    }
    applyProductSelection(product, index);
  };

  // Confirmation de vente d'un produit réservé
  const handleReservedConfirm = () => {
    if (pendingReservedProduct) {
      applyProductSelection(pendingReservedProduct.product, pendingReservedProduct.index);
    }
    setReservedModalOpen(false);
    setPendingReservedProduct(null);
  };

  // Refus de vente d'un produit réservé → fermer tout
  const handleReservedCancel = () => {
    setReservedModalOpen(false);
    setPendingReservedProduct(null);
    onClose();
  };

  // Confirmer la suppression d'une réservation bloquante
  const handleConflictReservationDelete = async () => {
    if (!conflictingReservation || !pendingConflictProduct) return;
    try {
      const token = localStorage.getItem('token');
      // Supprimer la réservation
      await axios.delete(`${API_BASE_URL}/api/commandes/${conflictingReservation.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Supprimer le RDV lié s'il existe
      try {
        const rdvResponse = await axios.get(`${API_BASE_URL}/api/rdv`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const rdvToDelete = rdvResponse.data.find((r: any) => r.commandeId === conflictingReservation.id);
        if (rdvToDelete) {
          await axios.delete(`${API_BASE_URL}/api/rdv/${rdvToDelete.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      } catch (rdvErr) {
        console.error('Erreur suppression RDV lié:', rdvErr);
      }
      // Dé-réserver le produit
      await axios.put(`${API_BASE_URL}/api/products/${pendingConflictProduct.product.id}`, { reserver: 'non' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({
        title: 'Réservation supprimée',
        description: `La réservation de ${conflictingReservation.clientNom} a été supprimée`,
        className: "notification-success",
      });
      // Appliquer la sélection du produit maintenant libre
      applyProductSelection(pendingConflictProduct.product, pendingConflictProduct.index);
    } catch (error) {
      console.error('Erreur suppression réservation:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la réservation',
        variant: 'destructive',
        className: "notification-erreur",
      });
    } finally {
      setReservationConflictModalOpen(false);
      setConflictingReservation(null);
      setPendingConflictProduct(null);
    }
  };

  // Appliquer la sélection du produit (logique extraite)
  const applyProductSelection = (product: Product, index: number) => {
    const isAdvance = product.description.toLowerCase().includes('avance');
    const productQuantity = product.quantity !== undefined ? product.quantity : 0;
    const purchasePriceUnit = product.purchasePrice;
    const suggestedSellingPrice = isAdvance ? '' : (product.purchasePrice * 1.2).toFixed(2);

    const isPretProduit = product.description.toLowerCase().includes('prêt') || 
                          product.description.toLowerCase().includes('pret');

    if (isPretProduit) {
      setCurrentPretProductIndex(index);
      setPretProduitModalOpen(true);
      return;
    }

    const isAdvancePerruqueOuTissages = product.description.toLowerCase().includes('avance') && 
                                         (product.description.toLowerCase().includes('perruque') || 
                                          product.description.toLowerCase().includes('tissage'));

    if (isAdvancePerruqueOuTissages) {
      setCurrentAdvanceProductIndex(index);
      setAdvancePaymentModalOpen(true);
      
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
          sellingPriceUnit: '',
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
          profit: '0',
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

  // Mise à jour du profit (en tenant compte de la réduction)
  const updateProfit = (index: number, priceUnit: string, quantity: string, purchasePriceUnit: string, reductionOverride?: string, reductionTypeOverride?: ReductionType) => {
    const product = formProducts[index];
    if (product.isAdvanceProduct) {
      setFormProducts(prev => {
        const newProducts = [...prev];
        newProducts[index] = { ...newProducts[index], profit: '0' };
        return newProducts;
      });
    } else {
      const q = Number(quantity || 0);
      const pu = Number(priceUnit || 0);
      const cu = Number(purchasePriceUnit || 0);
      const reductionVal = Number((reductionOverride !== undefined ? reductionOverride : product.reduction) || 0);
      const reductionTyp = (reductionTypeOverride !== undefined ? reductionTypeOverride : product.reductionType);
      const reductionAmt = computeReductionAmount(pu, q, reductionVal, reductionTyp);
      const profit = (pu * q - cu * q - reductionAmt).toFixed(2);
      setFormProducts(prev => {
        const newProducts = [...prev];
        newProducts[index] = { ...newProducts[index], profit };
        return newProducts;
      });
    }
  };

  const handleReductionChange = (value: string, type: ReductionType, index: number) => {
    setFormProducts(prev => {
      const newProducts = [...prev];
      newProducts[index] = { ...newProducts[index], reduction: value, reductionType: value ? (type || 'amount') : '' };
      return newProducts;
    });
    const product = formProducts[index];
    updateProfit(index, product.sellingPriceUnit, product.quantitySold, product.purchasePriceUnit, value, value ? (type || 'amount') : '');
  };


  const handleSellingPriceChange = (value: string, index: number) => {
    setFormProducts(prev => {
      const newProducts = [...prev];
      newProducts[index] = { ...newProducts[index], sellingPriceUnit: value };
      return newProducts;
    });
    const product = formProducts[index];
    updateProfit(index, value, product.quantitySold, product.purchasePriceUnit);
  };

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

  const handleAvanceProductChange = (value: string, index: number) => {
    setFormProducts(prev => {
      const newProducts = [...prev];
      newProducts[index] = { ...newProducts[index], avancePretProduit: value };
      return newProducts;
    });
  };

  const handleDeliveryChange = (location: string, fee: string, index: number) => {
    setFormProducts(prev => {
      const newProducts = [...prev];
      newProducts[index] = { ...newProducts[index], deliveryLocation: location, deliveryFee: fee };
      return newProducts;
    });
  };

  const handleShowSlideshow = (product: FormProduct) => {
    setSlideshowProduct({
      photos: product.selectedProduct?.photos || [],
      mainPhoto: product.selectedProduct?.mainPhoto || product.selectedProduct?.photos?.[0],
      name: product.selectedProduct?.description || ''
    });
  };

  // Gestion des clients
  const handleClientData = async (clientName: string, clientPhone: string, clientAddress: string, clientVille: string) => {
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
        // Si on a renseigné une ville et qu'elle n'existe pas encore ou diffère => mettre à jour
        const newVille = (clientVille || '').trim();
        if (newVille && newVille !== (existingClient.ville || '').trim()) {
          try {
            const fd = new FormData();
            fd.append('nom', existingClient.nom);
            fd.append('phones', JSON.stringify(existingClient.phones || (existingClient.phone ? [existingClient.phone] : [])));
            fd.append('addresses', JSON.stringify(existingClient.addresses || (existingClient.adresse ? [existingClient.adresse] : [])));
            fd.append('adresse', existingClient.adresse || '');
            fd.append('ville', newVille);
            await axios.put(`${API_BASE_URL}/api/clients/${existingClient.id}`, fd, {
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
          } catch (e) { console.error('Erreur maj ville client:', e); }
        }
        return existingClient;
      }

      if (clientPhone.trim() && clientAddress.trim()) {
        const newClientResponse = await axios.post(`${API_BASE_URL}/api/clients`, {
          nom: clientName, phone: clientPhone, adresse: clientAddress, ville: (clientVille || '').trim()
        }, { headers: { Authorization: `Bearer ${token}` } });
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
      const reductionVal = Number(product.reduction || 0);
      const reductionAmt = product.isAdvanceProduct
        ? 0
        : computeReductionAmount(sellingPriceUnit, quantity, reductionVal, product.reductionType);

      let purchasePrice, sellingPrice;
      if (product.isAdvanceProduct) {
        purchasePrice = purchasePriceUnit;
        sellingPrice = sellingPriceUnit;
      } else {
        purchasePrice = purchasePriceUnit * quantity;
        sellingPrice = sellingPriceUnit * quantity - reductionAmt;
      }

      return {
        totalPurchasePrice: totals.totalPurchasePrice + purchasePrice,
        totalSellingPrice: totals.totalSellingPrice + sellingPrice + deliveryFee,
        totalProfit: totals.totalProfit + Number(product.profit || 0),
        totalDeliveryFee: totals.totalDeliveryFee + deliveryFee,
        totalReduction: (totals as any).totalReduction
          ? (totals as any).totalReduction + reductionAmt
          : reductionAmt
      };
    }, { totalPurchasePrice: 0, totalSellingPrice: 0, totalProfit: 0, totalDeliveryFee: 0, totalReduction: 0 });
  };

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
      if (clientName.trim()) {
        await handleClientData(clientName, clientPhone, clientAddress, clientVille);
      }

      const saleProducts: SaleProduct[] = validProducts.map(product => {
        const quantity = product.isAdvanceProduct ? 0 : Number(product.quantitySold);
        const purchasePriceUnit = Number(product.purchasePriceUnit);
        const sellingPriceUnit = Number(product.sellingPriceUnit);
        const deliveryFee = Number(product.deliveryFee || 0);
        
        const isPretProduit = product.isPretProduit || 
                              product.description.toLowerCase().includes('prêt') || 
                              product.description.toLowerCase().includes('pret');
        
        const reductionVal = Number(product.reduction || 0);
        const reductionTyp: ReductionType = product.reductionType || '';
        const reductionAmt = product.isAdvanceProduct || isPretProduit
          ? 0
          : computeReductionAmount(sellingPriceUnit, quantity, reductionVal, reductionTyp);

        let purchasePrice, sellingPrice, sellingPriceBeforeReduction;
        if (product.isAdvanceProduct) {
          purchasePrice = purchasePriceUnit;
          sellingPrice = sellingPriceUnit;
          sellingPriceBeforeReduction = sellingPriceUnit;
        } else if (isPretProduit) {
          purchasePrice = purchasePriceUnit * quantity;
          const avanceValue = product.avancePretProduit?.trim();
          sellingPrice = avanceValue && Number(avanceValue) > 0 ? Number(avanceValue) : 0;
          sellingPriceBeforeReduction = sellingPrice;
        } else {
          purchasePrice = purchasePriceUnit * quantity;
          sellingPriceBeforeReduction = sellingPriceUnit * quantity;
          sellingPrice = sellingPriceBeforeReduction - reductionAmt;
        }

        // Tarif d'origine de la ville sélectionnée (depuis la base livraison-ville)
        const cityEntry = villesLivraison.find(v => v.ville.toLowerCase() === (product.deliveryLocation || '').toLowerCase());
        const originalDeliveryFee = cityEntry ? Number(cityEntry.fee) : deliveryFee;
        const deliveryFeeAdjustment = deliveryFee - originalDeliveryFee; // négatif = réduction, positif = augmentation

        return {
          productId: product.productId,
          description: product.description,
          quantitySold: quantity,
          purchasePrice,
          sellingPrice, // prix de vente final (après réduction)
          profit: Number(product.profit),
          deliveryFee, // frais de livraison final
          deliveryLocation: product.deliveryLocation,
          originalDeliveryFee, // tarif standard de la ville
          deliveryFeeAdjustment, // différence appliquée (- réduction / + augmentation)
          reduction: reductionVal || 0,
          reductionType: reductionTyp,
          reductionAmount: reductionAmt,
          sellingPriceBeforeReduction // prix de vente réel avant réduction
        };
      });


      const totals = getTotals();
      const avancePriceValue = Number(avancePrice) || 0;
      // Mode avance actif dès que la section est affichée et qu'une valeur (même 0) a été saisie
      const isAdvanceMode = showAdvanceSection && avancePrice.trim() !== '' && !isNaN(Number(avancePrice));
      const finalSellingPrice = isAdvanceMode ? avancePriceValue : totals.totalSellingPrice;
      const resteValue = isAdvanceMode ? Number(reste) : 0;
      
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
        clientVille: clientVille || null,
        reste: resteValue,
        nextPaymentDate: isAdvanceMode ? nextPaymentDate : null,
      };

      let success;
      
      if (editSale) {
        success = await updateSale({ ...saleData, id: editSale.id });
        
        if (success && isAdvanceMode && nextPaymentDate) {
          try {
            const token = localStorage.getItem('token');
            const pretProduitsResponse = await axios.get(`${API_BASE_URL}/api/pretproduits`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const existingPretProduit = pretProduitsResponse.data.find((p: any) => 
              p.nom === clientName && p.date === date
            );
            const productsDescription = validProducts.map(p => p.description).join(', ');
            const pretProduitData = {
              date, datePaiement: nextPaymentDate, phone: clientPhone || '',
              description: productsDescription, nom: clientName,
              prixVente: totals.totalSellingPrice, avanceRecue: avancePriceValue,
              reste: resteValue, estPaye: resteValue === 0,
              productId: validProducts.length === 1 ? validProducts[0].productId : undefined,
            };
            if (existingPretProduit) {
              await axios.put(`${API_BASE_URL}/api/pretproduits/${existingPretProduit.id}`, pretProduitData, {
                headers: { Authorization: `Bearer ${token}` }
              });
            } else {
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
        
        if (success && isAdvanceMode && nextPaymentDate) {
          try {
            const token = localStorage.getItem('token');
            const productsDescription = validProducts.map(p => p.description).join(', ');
            const pretProduitData = {
              date, datePaiement: nextPaymentDate, phone: clientPhone || '',
              description: productsDescription, nom: clientName,
              prixVente: totals.totalSellingPrice, avanceRecue: avancePriceValue,
              reste: resteValue, estPaye: resteValue === 0,
              productId: validProducts.length === 1 ? validProducts[0].productId : undefined,
            };
            await axios.post(`${API_BASE_URL}/api/pretproduits`, pretProduitData, {
              headers: { Authorization: `Bearer ${token}` }
            });
            toast({
              title: "Succès",
              description: `Vente enregistrée et prêt produit créé avec succès`,
              variant: "default", className: "notification-success",
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
      
      if (success && !(isAdvanceMode && nextPaymentDate)) {
        toast({
          title: "Succès",
          description: editSale 
            ? `Vente avec ${saleProducts.length} produit(s) mise à jour avec succès`
            : `Vente avec ${saleProducts.length} produit(s) ajoutée avec succès`,
          variant: "default", className: "notification-success",
        });
      }
      
      if (success) {
        // Vérifier si des produits vendus étaient réservés, et supprimer les réservations correspondantes
        for (const product of validProducts) {
          if ((product.selectedProduct as any)?.reserver === 'oui') {
            try {
              const token = localStorage.getItem('token');
              const commandesResponse = await axios.get(`${API_BASE_URL}/api/commandes`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              const allCommandes = commandesResponse.data;
              const reservationToDelete = allCommandes.find((c: any) => 
                c.type === 'reservation' && 
                c.statut !== 'valide' && c.statut !== 'annule' &&
                c.produits?.some((p: any) => p.nom.toLowerCase() === product.description.toLowerCase())
              );
              if (reservationToDelete) {
                await axios.delete(`${API_BASE_URL}/api/commandes/${reservationToDelete.id}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                console.log('✅ Réservation supprimée après vente:', reservationToDelete.id);

                try {
                  const rdvResponse = await axios.get(`${API_BASE_URL}/api/rdv`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  const rdvToDelete = rdvResponse.data.find((r: any) => r.commandeId === reservationToDelete.id);
                  if (rdvToDelete) {
                    await axios.delete(`${API_BASE_URL}/api/rdv/${rdvToDelete.id}`, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log('✅ RDV lié à la réservation supprimé:', rdvToDelete.id);
                  }
                } catch (rdvError) {
                  console.error('Erreur suppression RDV lié:', rdvError);
                }
              }
              await axios.put(`${API_BASE_URL}/api/products/${product.productId}`, { reserver: 'non' }, {
                headers: { Authorization: `Bearer ${token}` }
              });
            } catch (error) {
              console.error('Erreur suppression réservation après vente:', error);
            }
          }
        }
        // Réinitialiser la ville client après enregistrement
        setClientVille('');
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
  const hasValidProducts = formProducts.filter(p => p.selectedProduct && p.sellingPriceUnit).length > 0;

  return (
  


  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-5xl max-h-[92vh] overflow-y-auto border border-white/20 bg-[#F4F7FB]/95 backdrop-blur* shadow-[0_20px_80px_rgba(15,23,42,0.18)] rounded-[2rem] text-slate-900">

      {/* Glow effects */}
      <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="absolute bottom-0 -left-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      </div>

      <DialogHeader className="relative z-10 border-b border-slate-200 pb-6">
        <DialogTitle className="text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-transparent">
          {editSale
            ? 'Modifier la vente multi-produits'
            : 'Ajouter une vente multi-produits'}
        </DialogTitle>

        <DialogDescription className="text-sm text-slate-500 leading-relaxed">
          {editSale
            ? 'Modifiez les détails de cette vente avec plusieurs produits.'
            : 'Enregistrez une vente avec un ou plusieurs produits.'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-8 pt-2">

        {/* Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3 rounded-2xl border border-white/40 bg-white/80 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur*">

            <Label
              htmlFor="date"
              className="text-sm uppercase tracking-[0.2em] text-slate-500 font-semibold"
            >
              Date de vente
            </Label>

            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-14 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 transition-all duration-300"
            />
          </div>
        </div>

        {/* Client Section */}
        <div className="rounded-[1.8rem] border border-white/40 bg-white/75 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur*">

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Informations Client
              </h2>

              <p className="text-sm text-slate-500">
                Gestion complète du client premium
              </p>
            </div>

            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
              <span className="text-lg font-black text-white">C</span>
            </div>
          </div>

          <SaleClientSection
            clientName={clientName}
            setClientName={setClientName}
            clientPhone={clientPhone}
            setClientPhone={setClientPhone}
            clientPhones={clientPhones}
            clientAddress={clientAddress}
            setClientAddress={setClientAddress}
            onClientSelect={handleClientSelect}
            isSubmitting={isSubmitting}
            clientPhoto={clientPhoto}
            clientVille={clientVille}
            setClientVille={setClientVille}
            currentClientCaracteristique={currentClientCaracteristique}
          />
        </div>

        {/* Products */}
        <div className="space-y-6">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Produits de la vente
              </h2>

              <p className="text-sm text-slate-500">
                Ajoutez et configurez les produits vendus
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2">
              <span className="text-sm font-semibold text-emerald-700">
                {formProducts.length} produit(s)
              </span>
            </div>
          </div>

          <div className="space-y-5">
            {formProducts.map((product, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-[1.8rem] border border-white/50 bg-gradient-to-br from-white to-slate-50 p-[1px] transition-all duration-500 hover:border-fuchsia-300 hover:shadow-[0_12px_40px_rgba(217,70,239,0.12)]"
              >

                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/0 via-fuchsia-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative rounded-[1.7rem] bg-white/90 p-5 backdrop-blur*">

                  <SaleProductCard
                    product={product}
                    index={index}
                    canDelete={formProducts.length > 1}
                    isSubmitting={isSubmitting}
                    onProductSelect={handleProductSelect}
                    onSellingPriceChange={handleSellingPriceChange}
                    onQuantityChange={handleQuantityChange}
                    onDeleteProduct={handleDeleteProduct}
                    onAvanceChange={handleAvanceProductChange}
                    onDeliveryChange={handleDeliveryChange}
                    onShowSlideshow={handleShowSlideshow}
                    onReductionChange={handleReductionChange}
                    clientVille={clientVille}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add product button */}
        <div className="flex justify-center py-4">
          <Button
            type="button"
            onClick={addNewProduct}
            className="group relative overflow-hidden rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-8 py-6 text-base font-bold text-white shadow-[0_10px_35px_rgba(16,185,129,0.25)] transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_15px_45px_rgba(16,185,129,0.35)]"
          >

            <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <Plus className="mr-3 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />

            Ajouter un autre produit
          </Button>
        </div>

        {/* Totals & Advance */}
        {formProducts.some(p => p.selectedProduct) && (
          <div className="rounded-[2rem] border border-white/50 bg-gradient-to-br from-white to-slate-100 p-6 shadow-[0_15px_60px_rgba(15,23,42,0.08)] backdrop-blur*">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Résumé financier
                </h2>

                <p className="text-sm text-slate-500">
                  Vue globale des montants et bénéfices
                </p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 px-4 py-2 shadow-lg shadow-yellow-500/20">
                <span className="text-sm font-bold text-black">
                  Premium
                </span>
              </div>
            </div>

            <SaleTotalsSection
              totals={totals}
              showAdvanceSection={showAdvanceSection}
              setShowAdvanceSection={setShowAdvanceSection}
              avancePrice={avancePrice}
              onAvancePriceChange={handleAvancePriceChange}
              reste={reste}
              nextPaymentDate={nextPaymentDate}
              setNextPaymentDate={setNextPaymentDate}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="rounded-[1.8rem] border border-white/40 bg-white/75 p-5 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur*">

          <SaleFormActions
            editSale={editSale}
            isSubmitting={isSubmitting}
            hasValidProducts={hasValidProducts}
            onDeleteSale={handleDeleteSale}
            onRefund={onRefund}
            onClose={onClose}
          />
        </div>
      </form>
    </DialogContent>

    {/* Modals */}
    <AdvancePaymentModal
      isOpen={advancePaymentModalOpen}
      onClose={() => {
        setAdvancePaymentModalOpen(false);
        setCurrentAdvanceProductIndex(null);
      }}
      onConfirm={handleAdvancePaymentConfirm}
    />

    <PretProduitFromSaleModal
      isOpen={pretProduitModalOpen}
      onClose={() => {
        setPretProduitModalOpen(false);
        setCurrentPretProductIndex(null);
      }}
      onPretCreated={handlePretProduitCreated}
    />

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

    <ReservedProductModal
      isOpen={reservedModalOpen}
      onOpenChange={setReservedModalOpen}
      pendingProduct={pendingReservedProduct}
      onConfirm={handleReservedConfirm}
      onCancel={handleReservedCancel}
    />

    {/* Modale de conflit de réservation */}
    <AlertDialog
      open={reservationConflictModalOpen}
      onOpenChange={setReservationConflictModalOpen}
    >
      <AlertDialogContent className="border border-white/40 bg-white/95 backdrop-blur* rounded-[2rem] shadow-[0_20px_80px_rgba(15,23,42,0.12)] max-w-md text-slate-900">

        <AlertDialogHeader>

          <div className="mb-4 flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/20">
              <Package className="h-6 w-6 text-white" />
            </div>

            <div>
              <AlertDialogTitle className="text-2xl font-black text-slate-900">
                Stock réservé
              </AlertDialogTitle>

              <p className="text-sm text-slate-500">
                Action nécessitant confirmation
              </p>
            </div>
          </div>

          <AlertDialogDescription className="text-base leading-relaxed text-slate-600">

            Le produit{" "}
            <span className="font-bold text-slate-900">
              "{pendingConflictProduct?.product.description}"
            </span>{" "}
            est entièrement réservé par{" "}
            <span className="font-bold text-fuchsia-600">
              {conflictingReservation?.clientNom}
            </span>.
            <br />
            <br />
            Voulez-vous supprimer cette réservation pour libérer le stock ?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-4 pt-4">

          <AlertDialogCancel
            onClick={() => {
              setReservationConflictModalOpen(false);
              setConflictingReservation(null);
              setPendingConflictProduct(null);
            }}
            className="h-12 rounded-2xl border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-300"
          >
            Non, annuler
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleConflictReservationDelete}
            className="h-12 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 font-bold text-white shadow-lg shadow-red-500/20 hover:opacity-90 transition-all duration-300"
          >
            Oui, supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <ProductPhotoSlideshow
      photos={slideshowProduct?.photos || []}
      mainPhoto={slideshowProduct?.mainPhoto}
      productName={slideshowProduct?.name || ''}
      isOpen={!!slideshowProduct}
      onClose={() => setSlideshowProduct(null)}
      baseUrl={API_BASE_URL}
    />

    <DuplicateClientModal
      isOpen={duplicateModalOpen}
      onClose={closeDuplicateModal}
      matches={duplicateMatches}
      typed={{
        nom: clientName,
        phones: [clientPhone, ...clientPhones].filter(Boolean),
        addresses: [clientAddress].filter(Boolean),
      }}
      onUseExisting={handleUseExistingFromDuplicate}
      onUpdateClient={handleUpdateExistingClient}
      onCreateNew={() => { /* l'utilisateur garde sa saisie courante */ }}
    />
  </Dialog>
);
 
};

export default MultiProductSaleForm;
