/**
 * =============================================================================
 * Page de gestion des Commandes et Réservations
 * =============================================================================
 * 
 * Cette page permet de gérer les commandes et réservations clients.
 * Elle intègre la synchronisation automatique avec les rendez-vous.
 * 
 * FONCTIONNALITÉS PRINCIPALES:
 * - Création/modification/suppression de commandes et réservations
 * - Gestion des statuts avec synchronisation RDV automatique
 * - Export PDF des commandes par date
 * - Création de RDV depuis une réservation avec modal premium
 * - Validation des commandes avec enregistrement en vente
 * 
 * SYNCHRONISATION RDV:
 * - Lors d'un changement de statut de réservation, le RDV lié est mis à jour
 * - Mapping des statuts: voir reservationRdvSyncService
 * 
 * @module CommandesPage
 * @author Système de gestion des ventes
 * @version 4.0.0 - Refactorisé avec composants extraits
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Commande, CommandeProduit, CommandeStatut } from '@/types/commande';
import api from '@/service/api';
import { rdvFromReservationService } from '@/services/rdvFromReservationService';
import { reservationRdvSyncService } from '@/services/reservationRdvSyncService';
import Layout from '@/components/Layout';
import PremiumLoading from '@/components/ui/premium-loading';

// Import des composants refactorisés
import {
  CommandesHero,
  CommandesSearchBar,
  CommandesTable,
  CommandeFormDialog,
  ReporterModal,
  ValidationDialog,
  CancellationDialog,
  DeleteDialog,
  RdvCreationModal,
  RdvConfirmationModal
} from '@/components/commandes';

// ============================================================================
// Types locaux
// ============================================================================

interface Client {
  id: string;
  nom: string;
  phone: string;
  adresse: string;
}

interface Product {
  id: string;
  description: string;
  purchasePrice: number;
  quantity: number;
}

// ============================================================================
// Composant Principal
// ============================================================================

const CommandesPage: React.FC = () => {
  // =========================================================================
  // États principaux
  // =========================================================================
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCommande, setEditingCommande] = useState<Commande | null>(null);
  
  // =========================================================================
  // États du formulaire client
  // =========================================================================
  const [clientNom, setClientNom] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  
  // =========================================================================
  // États du formulaire type et dates
  // =========================================================================
  const [type, setType] = useState<'commande' | 'reservation'>('commande');
  const [dateArrivagePrevue, setDateArrivagePrevue] = useState('');
  const [dateEcheance, setDateEcheance] = useState('');
  const [horaire, setHoraire] = useState('');
  
  // =========================================================================
  // États du formulaire produits
  // =========================================================================
  const [produitNom, setProduitNom] = useState('');
  const [prixUnitaire, setPrixUnitaire] = useState('');
  const [quantite, setQuantite] = useState('1');
  const [prixVente, setPrixVente] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [produitsListe, setProduitsListe] = useState<CommandeProduit[]>([]);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  
  // =========================================================================
  // États de recherche et tri
  // =========================================================================
  const [commandeSearch, setCommandeSearch] = useState('');
  const [sortDateAsc, setSortDateAsc] = useState(true);
  
  // =========================================================================
  // États des modales de confirmation
  // =========================================================================
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  
  // =========================================================================
  // États export PDF
  // =========================================================================
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportDate, setExportDate] = useState('');
  
  // =========================================================================
  // États modale Reporter
  // =========================================================================
  const [reporterModalOpen, setReporterModalOpen] = useState(false);
  const [reporterCommandeId, setReporterCommandeId] = useState<string | null>(null);
  const [reporterDate, setReporterDate] = useState('');
  const [reporterHoraire, setReporterHoraire] = useState('');
  
  // =========================================================================
  // États création RDV depuis réservation
  // =========================================================================
  const [showRdvConfirmDialog, setShowRdvConfirmDialog] = useState(false);
  const [showRdvFormModal, setShowRdvFormModal] = useState(false);
  const [pendingReservationForRdv, setPendingReservationForRdv] = useState<Commande | null>(null);
  const [isRdvLoading, setIsRdvLoading] = useState(false);

  // =========================================================================
  // Effets
  // =========================================================================
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchCommandes(), fetchClients(), fetchProducts()]);
      setIsLoading(false);
    };
    
    loadData();
    
    // Vérification périodique des notifications
    const interval = setInterval(checkNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // =========================================================================
  // Fonctions de chargement des données
  // =========================================================================

  const fetchCommandes = async () => {
    try {
      const response = await api.get('/api/commandes');
      setCommandes(response.data);
    } catch (error) {
      console.error('Error fetching commandes:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les commandes',
        className: "bg-app-red text-white",
        variant: 'destructive',
      });
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/api/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // =========================================================================
  // Mémos de filtrage
  // =========================================================================

  const filteredCommandes = useMemo(() => {
    const commandesToFilter = commandeSearch.length >= 3 
      ? commandes 
      : commandes.filter(c => c.statut !== 'valide' && c.statut !== 'annule');
    
    let filtered = commandesToFilter;
    if (commandeSearch.length >= 3) {
      const searchLower = commandeSearch.toLowerCase();
      filtered = commandesToFilter.filter(commande => 
        commande.clientNom.toLowerCase().includes(searchLower) ||
        commande.clientPhone.includes(searchLower) ||
        commande.produits.some(p => p.nom.toLowerCase().includes(searchLower))
      );
    }
    
    return [...filtered].sort((a, b) => {
      const dateStrA = a.type === 'commande' ? a.dateArrivagePrevue || '' : a.dateEcheance || '';
      const dateStrB = b.type === 'commande' ? b.dateArrivagePrevue || '' : b.dateEcheance || '';
      const dateA = new Date(dateStrA);
      const dateB = new Date(dateStrB);
      
      const dateDiff = sortDateAsc 
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
      
      if (dateDiff === 0) {
        const horaireA = a.horaire || '23:59';
        const horaireB = b.horaire || '23:59';
        return sortDateAsc 
          ? horaireA.localeCompare(horaireB)
          : horaireB.localeCompare(horaireA);
      }
      
      return dateDiff;
    });
  }, [commandes, commandeSearch, sortDateAsc]);

  const filteredClients = useMemo(() => {
    if (clientSearch.length < 3) return [];
    return clients.filter(client => 
      client.nom.toLowerCase().includes(clientSearch.toLowerCase())
    );
  }, [clientSearch, clients]);

  const filteredProducts = useMemo(() => {
    if (productSearch.length < 3) return [];
    
    const usedProductNames = new Set<string>();
    commandes.forEach(commande => {
      if (editingCommande && commande.id === editingCommande.id) return;
      if (commande.statut === 'valide' || commande.statut === 'annule') return;
      
      commande.produits.forEach(produit => {
        usedProductNames.add(produit.nom.toLowerCase());
      });
    });
    
    return products.filter(product => {
      const matchesSearch = product.description.toLowerCase().includes(productSearch.toLowerCase());
      const isNotUsed = !usedProductNames.has(product.description.toLowerCase());
      const hasStock = product.quantity > 0;
      return matchesSearch && isNotUsed && hasStock;
    });
  }, [productSearch, products, commandes, editingCommande]);

  const commandesForExportDate = useMemo(() => {
    if (!exportDate) return [];
    return commandes.filter(c => {
      const dateStr = c.type === 'commande' ? c.dateArrivagePrevue : c.dateEcheance;
      return dateStr === exportDate;
    }).sort((a, b) => {
      const horaireA = a.horaire || '23:59';
      const horaireB = b.horaire || '23:59';
      return horaireA.localeCompare(horaireB);
    });
  }, [commandes, exportDate]);

  // =========================================================================
  // Gestion des notifications
  // =========================================================================

  const checkNotifications = useCallback(() => {
    const now = new Date();
    commandes.forEach((commande) => {
      if (commande.type === 'commande' && commande.statut === 'arrive' && !commande.notificationEnvoyee) {
        toast({
          title: '📦 Produit arrivé!',
          description: `Contacter ${commande.clientNom} (${commande.clientPhone})`,
        });
        updateNotificationStatus(commande.id);
      }
      
      if (commande.type === 'reservation' && commande.dateEcheance) {
        const echeance = new Date(commande.dateEcheance);
        if (now >= echeance && !commande.notificationEnvoyee) {
          toast({
            title: '⏰ Réservation échue!',
            description: `Demander à ${commande.clientNom} s'il veut toujours ce produit`,
          });
          updateNotificationStatus(commande.id);
        }
      }
    });
  }, [commandes]);

  const updateNotificationStatus = async (id: string) => {
    try {
      await api.put(`/api/commandes/${id}`, { notificationEnvoyee: true });
      fetchCommandes();
    } catch (error) {
      console.error('Error updating notification status:', error);
    }
  };

  // =========================================================================
  // Gestion de la sélection client/produit
  // =========================================================================

  const handleClientSelect = useCallback((client: Client) => {
    setClientNom(client.nom);
    setClientPhone(client.phone);
    setClientAddress(client.adresse);
    setClientSearch(client.nom);
    setShowClientSuggestions(false);
  }, []);

  const handleProductSelect = useCallback((product: Product) => {
    setProduitNom(product.description);
    setPrixUnitaire(product.purchasePrice.toString());
    setProductSearch(product.description);
    setShowProductSuggestions(false);
    setSelectedProduct(product);
  }, []);

  // =========================================================================
  // Validation du formulaire
  // =========================================================================

  const isFormValid = useCallback(() => {
    return (
      clientNom.trim() !== '' &&
      clientPhone.trim() !== '' &&
      clientAddress.trim() !== '' &&
      produitsListe.length > 0 &&
      (type === 'commande' ? dateArrivagePrevue.trim() !== '' : dateEcheance.trim() !== '')
    );
  }, [clientNom, clientPhone, clientAddress, produitsListe, type, dateArrivagePrevue, dateEcheance]);

  // =========================================================================
  // Reset des formulaires
  // =========================================================================

  const resetForm = useCallback(() => {
    setClientNom('');
    setClientPhone('');
    setClientAddress('');
    setProduitNom('');
    setPrixUnitaire('');
    setQuantite('1');
    setPrixVente('');
    setDateArrivagePrevue('');
    setDateEcheance('');
    setHoraire('');
    setType('commande');
    setClientSearch('');
    setProductSearch('');
    setProduitsListe([]);
    setEditingCommande(null);
    setSelectedProduct(null);
    setEditingProductIndex(null);
  }, []);

  const resetProductFields = useCallback(() => {
    setProduitNom('');
    setPrixUnitaire('');
    setQuantite('1');
    setPrixVente('');
    setProductSearch('');
    setEditingProductIndex(null);
    setSelectedProduct(null);
  }, []);

  // =========================================================================
  // Gestion du panier de produits
  // =========================================================================

  const handleAddProduit = useCallback(() => {
    if (!produitNom.trim() || !prixUnitaire.trim() || !quantite.trim() || !prixVente.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs du produit',
        className: "bg-app-red text-white",
        variant: 'destructive',
      });
      return;
    }

    const quantiteInt = parseInt(quantite);
    const existingProduct = products.find(p => p.description.toLowerCase() === produitNom.toLowerCase());
    
    if (existingProduct) {
      if (existingProduct.quantity <= 0) {
        toast({
          title: 'Stock insuffisant',
          description: `${produitNom} n'a plus de stock disponible`,
          className: "bg-app-red text-white",
          variant: 'destructive',
        });
        return;
      }
      
      if (quantiteInt > existingProduct.quantity) {
        toast({
          title: 'Quantité insuffisante',
          description: `Stock disponible: ${existingProduct.quantity} unités`,
          className: "bg-app-red text-white",
          variant: 'destructive',
        });
        return;
      }
    }

    const nouveauProduit: CommandeProduit = {
      nom: produitNom,
      prixUnitaire: parseFloat(prixUnitaire),
      quantite: quantiteInt,
      prixVente: parseFloat(prixVente),
    };

    if (editingProductIndex !== null) {
      const nouveauxProduits = [...produitsListe];
      nouveauxProduits[editingProductIndex] = nouveauProduit;
      setProduitsListe(nouveauxProduits);
      toast({ title: 'Produit modifié', description: `${nouveauProduit.nom} a été mis à jour` });
    } else {
      setProduitsListe([...produitsListe, nouveauProduit]);
      toast({ title: 'Produit ajouté', description: `${nouveauProduit.nom} ajouté au panier` });
    }
    
    resetProductFields();
  }, [produitNom, prixUnitaire, quantite, prixVente, products, editingProductIndex, produitsListe, resetProductFields]);

  const handleEditProduit = useCallback((index: number) => {
    const produit = produitsListe[index];
    setProduitNom(produit.nom);
    setPrixUnitaire(produit.prixUnitaire.toString());
    setQuantite(produit.quantite.toString());
    setPrixVente(produit.prixVente.toString());
    setProductSearch(produit.nom);
    setEditingProductIndex(index);
    
    const productFromList = products.find(p => p.description.toLowerCase() === produit.nom.toLowerCase());
    setSelectedProduct(productFromList || null);
  }, [produitsListe, products]);

  const handleRemoveProduit = useCallback((index: number) => {
    setProduitsListe(prev => prev.filter((_, i) => i !== index));
    
    if (editingProductIndex === index) {
      resetProductFields();
    } else if (editingProductIndex !== null && editingProductIndex > index) {
      setEditingProductIndex(editingProductIndex - 1);
    }
    
    toast({ title: 'Produit retiré', description: 'Le produit a été retiré du panier' });
  }, [editingProductIndex, resetProductFields]);

  // =========================================================================
  // Soumission du formulaire
  // =========================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs et ajouter au moins un produit',
        className: "bg-app-red text-white",
        variant: 'destructive',
      });
      return;
    }

    const commandeData: Partial<Commande> = {
      clientNom,
      clientPhone,
      clientAddress,
      type,
      produits: produitsListe,
      dateCommande: new Date().toISOString(),
      statut: type === 'commande' ? 'en_route' : 'en_attente',
    };

    if (type === 'commande') {
      commandeData.dateArrivagePrevue = dateArrivagePrevue;
    } else {
      commandeData.dateEcheance = dateEcheance;
    }
    
    if (horaire) {
      commandeData.horaire = horaire;
    }

    try {
      // Créer le client s'il n'existe pas
      const existingClient = clients.find(c => c.nom.toLowerCase() === clientNom.toLowerCase());
      if (!existingClient) {
        await api.post('/api/clients', { nom: clientNom, phone: clientPhone, adresse: clientAddress });
        await fetchClients();
      }

      // Créer les produits s'ils n'existent pas
      for (const produit of produitsListe) {
        const existingProduct = products.find(p => p.description.toLowerCase() === produit.nom.toLowerCase());
        if (!existingProduct) {
          await api.post('/api/products', {
            description: produit.nom,
            purchasePrice: produit.prixUnitaire,
            quantity: produit.quantite
          });
        }
      }
      await fetchProducts();

      if (editingCommande) {
        await api.put(`/api/commandes/${editingCommande.id}`, commandeData);
        
        // Synchroniser le RDV si c'est une réservation
        if (type === 'reservation' && dateEcheance && horaire) {
          const updatedCommande = { ...editingCommande, ...commandeData } as Commande;
          try {
            await rdvFromReservationService.updateRdvFromCommande(updatedCommande);
          } catch (err) {
            console.error('Erreur mise à jour RDV:', err);
          }
        }
        
        toast({ title: 'Succès', description: 'Commande modifiée avec succès', className: "bg-app-green text-white" });
      } else {
        const response = await api.post('/api/commandes', commandeData);
        const newCommande = response.data as Commande;
        
        // Proposer de créer un RDV si c'est une réservation avec date et horaire
        if (type === 'reservation' && dateEcheance && horaire) {
          setPendingReservationForRdv(newCommande);
          setShowRdvConfirmDialog(true);
        }
        
        toast({ title: 'Succès', description: 'Commande ajoutée avec succès', className: "bg-app-green text-white" });
      }
      
      fetchCommandes();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving commande:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder la commande',
        className: "bg-app-red text-white",
        variant: 'destructive',
      });
    }
  };

  // =========================================================================
  // Édition d'une commande
  // =========================================================================

  const handleEdit = useCallback((commande: Commande) => {
    setEditingCommande(commande);
    setClientNom(commande.clientNom);
    setClientPhone(commande.clientPhone);
    setClientAddress(commande.clientAddress);
    setType(commande.type);
    setProduitsListe(commande.produits);
    setDateArrivagePrevue(commande.dateArrivagePrevue || '');
    setDateEcheance(commande.dateEcheance || '');
    setHoraire(commande.horaire || '');
    setClientSearch(commande.clientNom);
    setIsDialogOpen(true);
  }, []);

  // =========================================================================
  // Suppression d'une commande
  // =========================================================================

  const handleDelete = async (id: string) => {
    try {
      // Supprimer le RDV lié si existant
      try {
        await rdvFromReservationService.deleteRdvFromCommande(id);
      } catch (err) {
        console.error('Erreur suppression RDV lié:', err);
      }
      
      await api.delete(`/api/commandes/${id}`);
      toast({ title: 'Succès', description: 'Commande supprimée', className: "bg-app-green text-white" });
      fetchCommandes();
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting commande:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la commande',
        className: "bg-app-red text-white",
        variant: 'destructive',
      });
    }
  };

  // =========================================================================
  // Gestion des statuts
  // =========================================================================

  const handleStatusChange = async (id: string, newStatus: CommandeStatut | 'reporter') => {
    const commande = commandes.find(c => c.id === id);
    if (!commande) return;
    
    // Cas spéciaux: validation, annulation et report
    if (newStatus === 'valide') {
      setValidatingId(id);
      return;
    }
    
    if (newStatus === 'annule') {
      setCancellingId(id);
      return;
    }
    
    if (newStatus === 'reporter') {
      const currentDate = commande.type === 'commande' ? commande.dateArrivagePrevue : commande.dateEcheance;
      setReporterDate(currentDate || '');
      setReporterHoraire(commande.horaire || '');
      setReporterCommandeId(id);
      setReporterModalOpen(true);
      return;
    }
    
    // Si on change le statut d'une commande validée
    if (commande.statut === 'valide' && commande.saleId) {
      try {
        await api.delete(`/api/sales/${commande.saleId}`);
        await api.put(`/api/commandes/${id}`, { statut: newStatus, saleId: null });
        toast({ title: 'Succès', description: 'Statut mis à jour et vente annulée', className: "bg-app-green text-white" });
        await Promise.all([fetchCommandes(), fetchProducts()]);
        return;
      } catch (error) {
        console.error('Error reverting validation:', error);
        toast({ title: 'Erreur', description: 'Impossible de mettre à jour le statut', className: "bg-app-red text-white", variant: 'destructive' });
        return;
      }
    }
    
    try {
      await api.put(`/api/commandes/${id}`, { statut: newStatus });
      
      // Synchroniser le RDV si c'est une réservation
      if (commande.type === 'reservation') {
        await reservationRdvSyncService.syncRdvStatus(id, newStatus as CommandeStatut);
      }
      
      toast({ title: 'Succès', description: 'Statut mis à jour', className: "bg-app-green text-white" });
      fetchCommandes();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le statut', className: "bg-app-red text-white", variant: 'destructive' });
    }
  };

  // =========================================================================
  // Confirmation d'annulation
  // =========================================================================

  const confirmCancellation = async () => {
    if (!cancellingId) return;
    
    const commande = commandes.find(c => c.id === cancellingId);
    
    try {
      // Supprimer la vente si la commande était validée
      if (commande && commande.statut === 'valide' && commande.saleId) {
        await api.delete(`/api/sales/${commande.saleId}`);
      }
      
      await api.put(`/api/commandes/${cancellingId}`, { statut: 'annule', saleId: null });
      
      // Annuler le RDV si c'est une réservation
      if (commande && commande.type === 'reservation') {
        try {
          await api.put(`/api/rdv/by-commande/${cancellingId}`, { statut: 'annule' });
        } catch (rdvError) {
          console.log('RDV non trouvé:', rdvError);
        }
      }
      
      toast({ title: 'Succès', description: 'Commande annulée', className: "bg-app-green text-white" });
      await Promise.all([fetchCommandes(), fetchProducts()]);
      setCancellingId(null);
    } catch (error) {
      console.error('Error cancelling:', error);
      toast({ title: 'Erreur', description: "Impossible d'annuler", className: "bg-app-red text-white", variant: 'destructive' });
    }
  };

  // =========================================================================
  // Confirmation de validation
  // =========================================================================

  const confirmValidation = async () => {
    if (!validatingId) return;
    
    const commandeToValidate = commandes.find(c => c.id === validatingId);
    if (!commandeToValidate) return;
    
    try {
      // Vérifier le stock
      for (const p of commandeToValidate.produits) {
        const existingProduct = products.find(prod => prod.description.toLowerCase() === p.nom.toLowerCase());
        if (existingProduct && existingProduct.quantity < p.quantite) {
          toast({
            title: 'Stock insuffisant',
            description: `Stock disponible pour ${p.nom}: ${existingProduct.quantity} unités`,
            className: "bg-app-red text-white",
            variant: 'destructive',
          });
          return;
        }
      }
      
      const today = new Date().toISOString().split('T')[0];
      
      // Préparer les données de vente
      const saleProducts = [];
      for (const p of commandeToValidate.produits) {
        let product = products.find(prod => prod.description.toLowerCase() === p.nom.toLowerCase());
        
        if (!product) {
          const newProductResponse = await api.post('/api/products', {
            description: p.nom,
            purchasePrice: p.prixUnitaire,
            quantity: p.quantite
          });
          product = newProductResponse.data;
        }
        
        saleProducts.push({
          productId: product.id,
          description: p.nom,
          quantitySold: p.quantite,
          purchasePrice: p.prixUnitaire * p.quantite,
          sellingPrice: p.prixVente * p.quantite,
          profit: (p.prixVente - p.prixUnitaire) * p.quantite,
          deliveryFee: 0,
          deliveryLocation: "Saint-Denis"
        });
      }
      
      const totalPurchasePrice = commandeToValidate.produits.reduce((sum, p) => sum + (p.prixUnitaire * p.quantite), 0);
      const totalSellingPrice = commandeToValidate.produits.reduce((sum, p) => sum + (p.prixVente * p.quantite), 0);
      
      const saleData = {
        date: today,
        products: saleProducts,
        totalPurchasePrice,
        totalSellingPrice,
        totalProfit: totalSellingPrice - totalPurchasePrice,
        clientName: commandeToValidate.clientNom,
        clientAddress: commandeToValidate.clientAddress,
        clientPhone: commandeToValidate.clientPhone,
        reste: 0,
        nextPaymentDate: null
      };
      
      // Synchroniser le RDV si c'est une réservation
      if (commandeToValidate.type === 'reservation') {
        try {
          await api.put(`/api/rdv/by-commande/${validatingId}`, { statut: 'confirme' });
        } catch (rdvError) {
          console.log('RDV non trouvé:', rdvError);
        }
      }
      
      // Créer la vente
      const saleResponse = await api.post('/api/sales', saleData);
      const createdSale = saleResponse.data;
      
      // Mettre à jour la commande
      await api.put(`/api/commandes/${validatingId}`, { 
        statut: 'valide',
        saleId: createdSale.id
      });
      
      toast({ title: 'Succès', description: 'Commande validée et enregistrée comme vente', className: "bg-app-green text-white" });
      
      await Promise.all([fetchCommandes(), fetchProducts()]);
      setValidatingId(null);
    } catch (error) {
      console.error('Error validating:', error);
      toast({ title: 'Erreur', description: 'Impossible de valider', className: "bg-app-red text-white", variant: 'destructive' });
    }
  };

  // =========================================================================
  // Gestion du report
  // =========================================================================

  const handleReporterConfirm = async () => {
    if (!reporterCommandeId || !reporterDate) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner une date', className: "bg-app-red text-white", variant: 'destructive' });
      return;
    }
    
    try {
      const commande = commandes.find(c => c.id === reporterCommandeId);
      if (!commande) return;
      
      const updateData: Record<string, unknown> = {
        statut: 'reporter',
        horaire: reporterHoraire || undefined
      };
      
      if (commande.type === 'commande') {
        updateData.dateArrivagePrevue = reporterDate;
      } else {
        updateData.dateEcheance = reporterDate;
      }
      
      await api.put(`/api/commandes/${reporterCommandeId}`, updateData);
      
      // Synchroniser le RDV si c'est une réservation
      if (commande.type === 'reservation') {
        try {
          const heureDebut = reporterHoraire || '09:00';
          const [h, m] = heureDebut.split(':').map(Number);
          const endH = (h + 1) % 24;
          const heureFin = `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
          
          await api.put(`/api/rdv/by-commande/${reporterCommandeId}`, {
            date: reporterDate,
            heureDebut,
            heureFin,
            statut: 'reporte'
          });
        } catch (rdvError) {
          console.log('RDV non trouvé:', rdvError);
        }
      }
      
      toast({
        title: 'Succès',
        description: `Reporté au ${new Date(reporterDate).toLocaleDateString('fr-FR')}${reporterHoraire ? ' à ' + reporterHoraire : ''}`,
        className: "bg-app-green text-white",
      });
      
      fetchCommandes();
      setReporterModalOpen(false);
      setReporterCommandeId(null);
      setReporterDate('');
      setReporterHoraire('');
    } catch (error) {
      console.error('Error updating date:', error);
      toast({ title: 'Erreur', description: 'Impossible de reporter', className: "bg-app-red text-white", variant: 'destructive' });
    }
  };

  // =========================================================================
  // Gestion de la création RDV depuis réservation
  // =========================================================================

  const handleCreateRdvFromReservation = async (titre: string, description: string) => {
    if (!pendingReservationForRdv) return;
    
    setIsRdvLoading(true);
    
    try {
      const heureDebut = pendingReservationForRdv.horaire || '09:00';
      const [hours, minutes] = heureDebut.split(':').map(Number);
      const endHours = (hours + 1) % 24;
      const heureFin = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      const rdvData = {
        titre: titre || `Réservation pour ${pendingReservationForRdv.clientNom}`,
        description: description || '',
        clientNom: pendingReservationForRdv.clientNom,
        clientTelephone: pendingReservationForRdv.clientPhone,
        clientAdresse: pendingReservationForRdv.clientAddress,
        date: pendingReservationForRdv.dateEcheance,
        heureDebut,
        heureFin,
        lieu: pendingReservationForRdv.clientAddress,
        statut: 'planifie',
        notes: `Créé depuis une réservation`,
        produits: pendingReservationForRdv.produits.map(p => ({
          nom: p.nom,
          quantite: p.quantite,
          prixUnitaire: p.prixUnitaire,
          prixVente: p.prixVente,
        })),
        commandeId: pendingReservationForRdv.id,
      };
      
      await api.post('/api/rdv', rdvData);
      
      toast({
        title: '📅 Rendez-vous créé',
        description: `Le RDV a été créé pour le ${pendingReservationForRdv.dateEcheance}`,
        className: "bg-app-green text-white",
      });
    } catch (err) {
      console.error('Erreur création RDV:', err);
      toast({ title: 'Erreur', description: 'Impossible de créer le rendez-vous', className: "bg-app-red text-white", variant: 'destructive' });
    } finally {
      setIsRdvLoading(false);
      setShowRdvFormModal(false);
      setPendingReservationForRdv(null);
    }
  };

  const handleDeclineRdv = useCallback(() => {
    setShowRdvConfirmDialog(false);
    setPendingReservationForRdv(null);
  }, []);

  const handleAcceptRdv = useCallback(() => {
    setShowRdvConfirmDialog(false);
    setShowRdvFormModal(true);
  }, []);

  const handleCloseRdvModal = useCallback(() => {
    setShowRdvFormModal(false);
    setPendingReservationForRdv(null);
  }, []);

  // =========================================================================
  // Options de statut
  // =========================================================================

  const getStatusOptions = useCallback((commandeType: 'commande' | 'reservation') => {
    if (commandeType === 'commande') {
      return [
        { value: 'en_route', label: '📦 En Route' },
        { value: 'arrive', label: '✅ Arrivé' },
        { value: 'valide', label: '💎 Validé' },
        { value: 'annule', label: '❌ Annulé' },
        { value: 'reporter', label: '📅 Reporter' },
      ];
    }
    return [
      { value: 'en_attente', label: '⏳ En Attente' },
      { value: 'valide', label: '💎 Validé' },
      { value: 'annule', label: '❌ Annulé' },
      { value: 'reporter', label: '📅 Reporter' },
    ];
  }, []);

  // =========================================================================
  // Export PDF
  // =========================================================================

  const handleExportPDF = useCallback(() => {
    if (commandesForExportDate.length === 0) {
      toast({
        title: 'Aucune donnée',
        description: `Aucune commande ou réservation pour cette date`,
        className: "bg-app-red text-white",
        variant: 'destructive',
      });
      return;
    }

    const doc = new jsPDF('portrait', 'mm', 'a4');
    const dateFormatted = new Date(exportDate).toLocaleDateString('fr-FR', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Commandes & Réservations', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${dateFormatted}`, 105, 28, { align: 'center' });
    doc.text(`Total: ${commandesForExportDate.length} entrée(s)`, 105, 35, { align: 'center' });

    const tableData = commandesForExportDate.map(c => {
      const produits = c.produits.map(p => `${p.nom} (x${p.quantite})`).join('\n');
      const prixDetail = c.produits.map(p => `${p.prixVente}€ x ${p.quantite}`).join('\n');
      const total = c.produits.reduce((sum, p) => sum + (p.prixVente * p.quantite), 0).toFixed(2);
      const dateEch = c.type === 'commande' 
        ? new Date(c.dateArrivagePrevue || '').toLocaleDateString('fr-FR')
        : new Date(c.dateEcheance || '').toLocaleDateString('fr-FR');
      
      return [
        `${c.clientNom}\n${c.clientAddress}`,
        c.clientPhone,
        produits,
        `${prixDetail}\n\nTotal: ${total}€`,
        `${dateEch}\n${c.horaire || '-'}`
      ];
    });

    autoTable(doc, {
      startY: 42,
      head: [['Client', 'Contact', 'Produit', 'Prix', 'Date/Horaire']],
      body: tableData,
      styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak', valign: 'top' },
      headStyles: { fillColor: [147, 51, 234], textColor: 255, fontStyle: 'bold', halign: 'center' },
      columnStyles: { 0: { cellWidth: 45 }, 1: { cellWidth: 25 }, 2: { cellWidth: 45 }, 3: { cellWidth: 35 }, 4: { cellWidth: 30 } },
      alternateRowStyles: { fillColor: [245, 243, 255] }
    });

    doc.save(`commandes_${exportDate}.pdf`);
    toast({ title: 'Succès', description: 'Export PDF effectué', className: "bg-app-green text-white" });
    setExportDialogOpen(false);
    setExportDate('');
  }, [commandesForExportDate, exportDate]);

  // =========================================================================
  // Rendu
  // =========================================================================

  if (isLoading) {
    return (
      <Layout>
        <PremiumLoading 
          text="Chargement des commandes..."
          size="xl"
          overlay={true}
          variant="default"
        />
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Header */}
      <CommandesHero />

      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Barre de recherche et actions */}
        <CommandesSearchBar
          commandeSearch={commandeSearch}
          setCommandeSearch={setCommandeSearch}
          exportDialogOpen={exportDialogOpen}
          setExportDialogOpen={setExportDialogOpen}
          exportDate={exportDate}
          setExportDate={setExportDate}
          commandesForExportDate={commandesForExportDate}
          handleExportPDF={handleExportPDF}
          onNewCommande={() => setIsDialogOpen(true)}
        />

        {/* Dialog Nouvelle/Modifier Commande */}
        <CommandeFormDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingCommande={editingCommande}
          clientNom={clientNom}
          setClientNom={setClientNom}
          clientPhone={clientPhone}
          setClientPhone={setClientPhone}
          clientAddress={clientAddress}
          setClientAddress={setClientAddress}
          clientSearch={clientSearch}
          setClientSearch={setClientSearch}
          showClientSuggestions={showClientSuggestions}
          setShowClientSuggestions={setShowClientSuggestions}
          filteredClients={filteredClients}
          handleClientSelect={handleClientSelect}
          type={type}
          setType={setType}
          produitNom={produitNom}
          setProduitNom={setProduitNom}
          prixUnitaire={prixUnitaire}
          setPrixUnitaire={setPrixUnitaire}
          quantite={quantite}
          setQuantite={setQuantite}
          prixVente={prixVente}
          setPrixVente={setPrixVente}
          productSearch={productSearch}
          setProductSearch={setProductSearch}
          showProductSuggestions={showProductSuggestions}
          setShowProductSuggestions={setShowProductSuggestions}
          filteredProducts={filteredProducts}
          handleProductSelect={handleProductSelect}
          selectedProduct={selectedProduct}
          produitsListe={produitsListe}
          editingProductIndex={editingProductIndex}
          handleAddProduit={handleAddProduit}
          handleEditProduit={handleEditProduit}
          handleRemoveProduit={handleRemoveProduit}
          dateArrivagePrevue={dateArrivagePrevue}
          setDateArrivagePrevue={setDateArrivagePrevue}
          dateEcheance={dateEcheance}
          setDateEcheance={setDateEcheance}
          horaire={horaire}
          setHoraire={setHoraire}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
        />

        {/* Table des commandes */}
        <CommandesTable
          filteredCommandes={filteredCommandes}
          totalActiveCommandes={commandes.filter(c => c.statut !== 'valide' && c.statut !== 'annule').length}
          commandeSearch={commandeSearch}
          sortDateAsc={sortDateAsc}
          setSortDateAsc={setSortDateAsc}
          handleEdit={handleEdit}
          handleStatusChange={handleStatusChange}
          setDeleteId={setDeleteId}
          getStatusOptions={getStatusOptions}
        />
      </div>

      {/* Modales de confirmation */}
      <ValidationDialog
        isOpen={validatingId !== null}
        onConfirm={confirmValidation}
        onCancel={() => setValidatingId(null)}
      />

      <CancellationDialog
        isOpen={cancellingId !== null}
        onConfirm={confirmCancellation}
        onCancel={() => setCancellingId(null)}
      />

      <DeleteDialog
        isOpen={deleteId !== null}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />

      {/* Modale Reporter */}
      <ReporterModal
        isOpen={reporterModalOpen}
        onOpenChange={setReporterModalOpen}
        reporterDate={reporterDate}
        setReporterDate={setReporterDate}
        reporterHoraire={reporterHoraire}
        setReporterHoraire={setReporterHoraire}
        onConfirm={handleReporterConfirm}
        onCancel={() => {
          setReporterModalOpen(false);
          setReporterCommandeId(null);
          setReporterDate('');
          setReporterHoraire('');
        }}
      />

      {/* Modales RDV */}
      <RdvConfirmationModal
        isOpen={showRdvConfirmDialog}
        onClose={handleDeclineRdv}
        onConfirm={handleAcceptRdv}
        reservation={pendingReservationForRdv ? {
          clientNom: pendingReservationForRdv.clientNom,
          dateEcheance: pendingReservationForRdv.dateEcheance || '',
          horaire: pendingReservationForRdv.horaire || '',
          clientAddress: pendingReservationForRdv.clientAddress
        } : null}
      />

      <RdvCreationModal
        isOpen={showRdvFormModal}
        onClose={handleCloseRdvModal}
        onConfirm={handleCreateRdvFromReservation}
        reservation={pendingReservationForRdv ? {
          id: pendingReservationForRdv.id,
          clientNom: pendingReservationForRdv.clientNom,
          clientPhone: pendingReservationForRdv.clientPhone,
          clientAddress: pendingReservationForRdv.clientAddress,
          dateEcheance: pendingReservationForRdv.dateEcheance || '',
          horaire: pendingReservationForRdv.horaire || '',
          produits: pendingReservationForRdv.produits
        } : null}
        isLoading={isRdvLoading}
      />
    </Layout>
  );
};

export default CommandesPage;
