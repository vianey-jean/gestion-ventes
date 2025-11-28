import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ModernTable, ModernTableHeader, ModernTableRow, ModernTableHead, ModernTableCell, TableBody } from '@/components/dashboard/forms/ModernTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Package, Plus, Trash2, Edit, ShoppingCart, TrendingUp, Sparkles, Crown, Star, Gift, Award, Zap, Diamond, ArrowUp, ArrowDown } from 'lucide-react';
import { Commande, CommandeProduit } from '@/types/commande';
import api from '@/service/api';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Layout from '@/components/Layout';
import PremiumLoading from '@/components/ui/premium-loading';
import SaleQuantityInput from '@/components/dashboard/forms/SaleQuantityInput';
import { motion } from 'framer-motion';

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
}

export default function CommandesPage() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCommande, setEditingCommande] = useState<Commande | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Form state
  const [clientNom, setClientNom] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [type, setType] = useState<'commande' | 'reservation'>('commande');
  const [produitNom, setProduitNom] = useState('');
  const [prixUnitaire, setPrixUnitaire] = useState('');
  const [quantite, setQuantite] = useState('1');
  const [prixVente, setPrixVente] = useState('');
  const [dateArrivagePrevue, setDateArrivagePrevue] = useState('');
  const [dateEcheance, setDateEcheance] = useState('');
  const [horaire, setHoraire] = useState('');
  
  // Liste des produits ajoutés au panier
  const [produitsListe, setProduitsListe] = useState<CommandeProduit[]>([]);
  
  // État pour gérer l'édition d'un produit dans le panier
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  
  // Autocomplete state
  const [clientSearch, setClientSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  
  // État pour gérer l'ordre de tri par date
  const [sortDateAsc, setSortDateAsc] = useState(true); // true = du plus proche au plus loin
  
  // État pour la recherche de commandes
  const [commandeSearch, setCommandeSearch] = useState('');
  
  // État pour la confirmation de validation
  const [validatingId, setValidatingId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchCommandes(), fetchClients(), fetchProducts()]);
      setIsLoading(false);
    };
    
    loadData();
    
    // Check for notifications
    const interval = setInterval(checkNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

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

  // Filtrer et trier les commandes selon la recherche
  const filteredCommandes = useMemo(() => {
    // Si recherche active (3+ caractères), montrer TOUTES les commandes (même validées/annulées)
    const commandesToFilter = commandeSearch.length >= 3 
      ? commandes 
      : commandes.filter(c => c.statut !== 'valide' && c.statut !== 'annule');
    
    // Appliquer la recherche si >= 3 caractères
    let filtered = commandesToFilter;
    if (commandeSearch.length >= 3) {
      const searchLower = commandeSearch.toLowerCase();
      filtered = commandesToFilter.filter(commande => 
        commande.clientNom.toLowerCase().includes(searchLower) ||
        commande.clientPhone.includes(searchLower) ||
        commande.produits.some(p => p.nom.toLowerCase().includes(searchLower))
      );
    }
    
    // Trier par date (échéance ou arrivage)
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.type === 'commande' ? a.dateArrivagePrevue || '' : a.dateEcheance || '');
      const dateB = new Date(b.type === 'commande' ? b.dateArrivagePrevue || '' : b.dateEcheance || '');
      
      if (sortDateAsc) {
        // Du plus proche au plus loin
        return dateA.getTime() - dateB.getTime();
      } else {
        // Du plus loin au plus proche
        return dateB.getTime() - dateA.getTime();
      }
    });
  }, [commandes, commandeSearch, sortDateAsc]);

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

  const checkNotifications = () => {
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
  };

  const updateNotificationStatus = async (id: string) => {
    try {
      await api.put(`/api/commandes/${id}`, { notificationEnvoyee: true });
      fetchCommandes();
    } catch (error) {
      console.error('Error updating notification status:', error);
    }
  };

  // Filter clients based on search
  const filteredClients = useMemo(() => {
    if (clientSearch.length < 3) return [];
    return clients.filter(client => 
      client.nom.toLowerCase().includes(clientSearch.toLowerCase())
    );
  }, [clientSearch, clients]);

  // Filter products based on search - exclude products already used in other orders/reservations
  const filteredProducts = useMemo(() => {
    if (productSearch.length < 3) return [];
    
    // Get all product names that are already used in other orders/reservations
    const usedProductNames = new Set<string>();
    commandes.forEach(commande => {
      // Skip if we're editing this specific order (allow same products)
      if (editingCommande && commande.id === editingCommande.id) return;
      
      commande.produits.forEach(produit => {
        usedProductNames.add(produit.nom.toLowerCase());
      });
    });
    
    // Filter out products that are already used
    return products.filter(product => {
      const matchesSearch = product.description.toLowerCase().includes(productSearch.toLowerCase());
      const isNotUsed = !usedProductNames.has(product.description.toLowerCase());
      return matchesSearch && isNotUsed;
    });
  }, [productSearch, products, commandes, editingCommande]);

  const handleClientSelect = (client: Client) => {
    setClientNom(client.nom);
    setClientPhone(client.phone);
    setClientAddress(client.adresse);
    setClientSearch(client.nom);
    setShowClientSuggestions(false);
  };

  const handleProductSelect = (product: Product) => {
    setProduitNom(product.description);
    setPrixUnitaire(product.purchasePrice.toString());
    setProductSearch(product.description);
    setShowProductSuggestions(false);
  };

  const isFormValid = () => {
    return (
      clientNom.trim() !== '' &&
      clientPhone.trim() !== '' &&
      clientAddress.trim() !== '' &&
      produitsListe.length > 0 &&
      (type === 'commande' ? dateArrivagePrevue.trim() !== '' : dateEcheance.trim() !== '')
    );
  };

  const resetForm = () => {
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
  };

  const resetProductFields = () => {
    setProduitNom('');
    setPrixUnitaire('');
    setQuantite('1');
    setPrixVente('');
    setProductSearch('');
    setEditingProductIndex(null);
  };

  const handleAddProduit = () => {
    if (!produitNom.trim() || !prixUnitaire.trim() || !quantite.trim() || !prixVente.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs du produit',
        className: "bg-app-red text-white",
        variant: 'destructive',
      });
      return;
    }

    const nouveauProduit: CommandeProduit = {
      nom: produitNom,
      prixUnitaire: parseFloat(prixUnitaire),
      quantite: parseInt(quantite),
      prixVente: parseFloat(prixVente),
    };

    if (editingProductIndex !== null) {
      // Modifier le produit existant
      const nouveauxProduits = [...produitsListe];
      nouveauxProduits[editingProductIndex] = nouveauProduit;
      setProduitsListe(nouveauxProduits);
      setEditingProductIndex(null);
      
      toast({
        title: 'Produit modifié',
        description: `${nouveauProduit.nom} a été mis à jour`,
      });
    } else {
      // Ajouter un nouveau produit
      setProduitsListe([...produitsListe, nouveauProduit]);
      
      toast({
        title: 'Produit ajouté',
        description: `${nouveauProduit.nom} a été ajouté au panier`,
      });
    }
    
    resetProductFields();
  };

  const handleEditProduit = (index: number) => {
    const produit = produitsListe[index];
    setProduitNom(produit.nom);
    setPrixUnitaire(produit.prixUnitaire.toString());
    setQuantite(produit.quantite.toString());
    setPrixVente(produit.prixVente.toString());
    setProductSearch(produit.nom);
    setEditingProductIndex(index);
    
    toast({
      title: 'Mode édition',
      description: 'Modifiez les champs et cliquez sur "Ajouter ce produit" pour sauvegarder',
    });
  };

  const handleRemoveProduit = (index: number) => {
    const nouveauxProduits = produitsListe.filter((_, i) => i !== index);
    setProduitsListe(nouveauxProduits);
    
    // Si on était en train d'éditer ce produit, annuler l'édition
    if (editingProductIndex === index) {
      setEditingProductIndex(null);
      resetProductFields();
    } else if (editingProductIndex !== null && editingProductIndex > index) {
      // Ajuster l'index si on supprime un produit avant celui en édition
      setEditingProductIndex(editingProductIndex - 1);
    }
    
    toast({
      title: 'Produit retiré',
      description: 'Le produit a été retiré du panier',
    });
  };

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
        await api.post('/api/clients', {
          nom: clientNom,
          phone: clientPhone,
          adresse: clientAddress
        });
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
        toast({
          title: 'Succès',
          description: 'Commande modifiée avec succès',
          className: "bg-app-green text-white",
        });
      } else {
        await api.post('/api/commandes', commandeData);
        toast({
          title: 'Succès',
          description: 'Commande ajoutée avec succès',
          className: "bg-app-green text-white",
        });
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

  const handleEdit = (commande: Commande) => {
    setEditingCommande(commande);
    setClientNom(commande.clientNom);
    setClientPhone(commande.clientPhone);
    setClientAddress(commande.clientAddress);
    setType(commande.type);
    
    // Charger tous les produits de la commande
    setProduitsListe(commande.produits);
    
    setDateArrivagePrevue(commande.dateArrivagePrevue || '');
    setDateEcheance(commande.dateEcheance || '');
    setHoraire(commande.horaire || '');
    setClientSearch(commande.clientNom);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/commandes/${id}`);
      toast({
        title: 'Succès',
        description: 'Commande supprimée avec succès',
        className: "bg-app-green text-white",
      });
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

  // État pour la confirmation d'annulation
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: 'en_route' | 'arrive' | 'en_attente' | 'valide' | 'annule') => {
    // Si on passe à "valide", demander confirmation
    if (newStatus === 'valide') {
      setValidatingId(id);
      return;
    }
    
    // Si on passe à "annule", demander confirmation
    if (newStatus === 'annule') {
      setCancellingId(id);
      return;
    }
    
    try {
      await api.put(`/api/commandes/${id}`, { statut: newStatus });
      toast({
        title: 'Succès',
        description: 'Statut mis à jour',
        className: "bg-app-green text-white",
      });
      fetchCommandes();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut',
        className: "bg-app-red text-white",
        variant: 'destructive',
      });
    }
  };

  const confirmCancellation = async () => {
    if (!cancellingId) return;
    
    try {
      await api.put(`/api/commandes/${cancellingId}`, { statut: 'annule' });
      toast({
        title: 'Succès',
        description: 'Commande annulée avec succès',
        className: "bg-app-green text-white",
      });
      fetchCommandes();
      setCancellingId(null);
    } catch (error) {
      console.error('Error cancelling:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'annuler la commande',
        className: "bg-app-red text-white",
        variant: 'destructive',
      });
    }
  };

  const confirmValidation = async () => {
    if (!validatingId) return;
    
    // Trouver la commande à valider
    const commandeToValidate = commandes.find(c => c.id === validatingId);
    if (!commandeToValidate) return;
    
    try {
      // 1. Mettre à jour le statut de la commande
      await api.put(`/api/commandes/${validatingId}`, { statut: 'valide' });
      
      // 2. Enregistrer la vente dans sales.json
      const today = new Date().toISOString().split('T')[0];
      
      // Créer ou trouver les produits et construire saleProducts
      const saleProducts = [];
      for (const p of commandeToValidate.produits) {
        // Chercher le produit dans la liste existante
        let product = products.find(prod => prod.description.toLowerCase() === p.nom.toLowerCase());
        
        // Si le produit n'existe pas, le créer
        if (!product) {
          const newProductResponse = await api.post('/api/products', {
            description: p.nom,
            purchasePrice: p.prixUnitaire,
            quantity: 0 // Quantité 0 car c'est une commande/réservation
          });
          product = newProductResponse.data;
        }
        
        // Dans sales.json, on enregistre les prix TOTAUX (comme le formulaire de ventes) :
        // - purchasePrice = prixUnitaire * quantite (prix total d'achat)
        // - sellingPrice = prixVente * quantite (prix total de vente)
        // - quantitySold = quantite
        // - profit = (prixVente - prixUnitaire) * quantite
        const productProfit = (p.prixVente - p.prixUnitaire) * p.quantite;
        const totalPurchasePrice = p.prixUnitaire * p.quantite;
        const totalSellingPrice = p.prixVente * p.quantite;
        
        // Ajouter le produit au format attendu par l'API
        saleProducts.push({
          productId: product.id,
          description: p.nom,
          quantitySold: p.quantite,
          purchasePrice: totalPurchasePrice,  // Prix TOTAL d'achat (prixUnitaire * quantite)
          sellingPrice: totalSellingPrice,    // Prix TOTAL de vente (prixVente * quantite)
          profit: productProfit,              // Profit = (prixVente - prixUnitaire) * quantite
          deliveryFee: 0,
          deliveryLocation: "Saint-Denis"
        });
      }
      
      // Calculer les totaux pour sales.json :
      // - totalPurchasePrice = somme de tous (prixUnitaire * quantité)
      // - totalSellingPrice = somme de tous (prixVente * quantité)
      // - totalProfit = totalSellingPrice - totalPurchasePrice
      const totalPurchasePrice = commandeToValidate.produits.reduce((sum, p) => sum + (p.prixUnitaire * p.quantite), 0);
      const totalSellingPrice = commandeToValidate.produits.reduce((sum, p) => sum + (p.prixVente * p.quantite), 0);
      const totalProfit = totalSellingPrice - totalPurchasePrice;
      
      const saleData = {
        date: today,
        products: saleProducts,
        totalPurchasePrice,   // Somme de (prixUnitaire * quantité) de tous les produits
        totalSellingPrice,    // Somme de (prixVente * quantité) de tous les produits
        totalProfit,          // totalSellingPrice - totalPurchasePrice
        clientName: commandeToValidate.clientNom,
        clientAddress: commandeToValidate.clientAddress,
        clientPhone: commandeToValidate.clientPhone,
        reste: 0,
        nextPaymentDate: null
      };
      
      console.log('✅ Validation commande - Données à enregistrer dans sales.json:', saleData);
      await api.post('/api/sales', saleData);
      
      toast({
        title: 'Succès',
        description: 'Commande validée et enregistrée comme vente',
        className: "bg-app-green text-white",
      });
      
      // Rafraîchir les données
      await Promise.all([fetchCommandes(), fetchProducts()]);
      setValidatingId(null);
    } catch (error) {
      console.error('❌ Error validating:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de valider la commande',
        className: "bg-app-red text-white",
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'arrive':
        return <Badge className="text-green-600 font-semibold">Arrivé</Badge>;
      case 'en_route':
        return <Badge className="text-purple-600 font-semibold">En route</Badge>;
      case 'en_attente':
        return <Badge className="text-red-600 font-semibold">En attente</Badge>;
      case 'valide':
        return <Badge className="text-blue-600 font-semibold">Validé</Badge>;
      case 'annule':
        return <Badge className="text-gray-600 font-semibold">Annulé</Badge>;
      default:
        return <Badge>{statut}</Badge>;
    }
  };

  const getStatusOptions = (type: 'commande' | 'reservation') => {
    if (type === 'commande') {
      return [
        { value: 'en_route', label: 'En route' },
        { value: 'arrive', label: 'Arrivé' },
        { value: 'valide', label: 'Validé' },
        { value: 'annule', label: 'Annulé' }
      ];
    } else {
      return [
        { value: 'en_attente', label: 'En attente' },
        { value: 'valide', label: 'Validé' },
        { value: 'annule', label: 'Annulé' }
      ];
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <PremiumLoading 
          text="Bienvenue sur La page commandes ou reservation"
          size="xl"
          overlay={true}
          variant="default"
        />
      </Layout>
    );
  }

  return (
    <Layout>
       {/* Hero Header Premium */}
                  <div className="text-center mb-6 sm:mb-8 md:mb-12 relative">
                    {/* Decorative elements */}
                    <div className="absolute inset-0 -z-10 overflow-hidden">
                      <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-3xl"></div>
                      <div className="absolute top-0 right-1/4 w-72 h-72 bg-pink-300/20 dark:bg-pink-600/10 rounded-full blur-3xl"></div>
                    </div>
                    
                    <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 dark:from-purple-500/20 dark:via-pink-500/20 dark:to-indigo-500/20 backdrop-blur-xl rounded-full text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-bold mb-4 sm:mb-6 border-2 border-purple-300/50 dark:border-purple-600/50 shadow-2xl">
                      <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                      <span className="hidden xs:inline">Gestion Premium</span>
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500" />
                    </div>
                    
                        <motion.h1
                          initial={{ opacity: 0, y: 60, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black 
                                    bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 
                                    bg-[length:200%_200%] animate-gradient 
                                    bg-clip-text text-transparent mb-4 sm:mb-6 text-center px-2
                                    drop-shadow-2xl"
                        >
                          <span className="inline-flex items-center gap-3">
                            <Diamond className="h-8 w-8 sm:h-12 sm:w-12 text-purple-600" />
                            Commandes & Réservations
                            <Star className="h-8 w-8 sm:h-12 sm:w-12 text-pink-600" />
                          </span>
                        </motion.h1>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4 font-medium">
                      Une expérience de gestion <span className="font-bold text-purple-600 dark:text-purple-400">ultra-premium</span> pour vos commandes d'élite
                    </p>
                  </div>
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 flex items-center justify-center shadow-2xl">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                Commandes Premium
              </h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                Gestion d'élite de vos commandes
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Barre de recherche */}
          <div className="relative w-full md:flex-1">
            <Input
              value={commandeSearch}
              onChange={(e) => setCommandeSearch(e.target.value)}
              placeholder="🔍 Rechercher une commande (min. 3 caractères)..."
              className="border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white dark:bg-gray-900 shadow-lg pl-4"
            />
            {commandeSearch.length > 0 && commandeSearch.length < 3 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {3 - commandeSearch.length} caractère(s) restant(s)
              </div>
            )}
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white shadow-2xl hover:shadow-purple-500/50 border-0" size="lg">
                <Zap className="mr-2 h-5 w-5" />
                Nouvelle Commande Elite
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-purple-50/40 to-pink-50/40 dark:from-gray-900 dark:via-purple-900/30 dark:to-pink-900/30 backdrop-blur-2xl border-2 border-purple-300/50 dark:border-purple-600/50 shadow-[0_20px_70px_rgba(168,85,247,0.4)]">
            <DialogHeader className="border-b-2 border-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 dark:from-purple-700 dark:via-pink-700 dark:to-indigo-700 pb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Crown className="h-8 w-8 text-yellow-500 animate-pulse" />
                <Sparkles className="h-6 w-6 text-pink-500" />
              </div>
              <DialogTitle className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent text-center">
                {editingCommande ? (
                  <span className="flex items-center justify-center gap-2">
                    <Edit className="h-6 w-6 text-purple-600" />
                    Modifier Commande Premium
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Gift className="h-6 w-6 text-pink-600" />
                    Nouvelle Commande Elite
                  </span>
                )}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground mt-3 text-center font-medium">
                ✨ Créez une expérience d'achat exclusive et luxueuse ✨
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              {/* Section Client Premium */}
              <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 border-2 border-blue-300 dark:border-blue-700 shadow-[0_8px_30px_rgba(59,130,246,0.3)]">
                <h3 className="font-black text-xl flex items-center gap-3 text-blue-700 dark:text-blue-300">
                  <span className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm shadow-lg">
                    <Crown className="h-5 w-5" />
                  </span>
                  <span className="flex items-center gap-2">
                    Client Premium
                    <Star className="h-5 w-5 text-yellow-500" />
                  </span>
                </h3>
                
                <div className="relative">
                  <Label htmlFor="clientNom" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    👤 Nom du Client
                  </Label>
                  <Input
                    id="clientNom"
                    value={clientSearch}
                    onChange={(e) => {
                      setClientSearch(e.target.value);
                      setClientNom(e.target.value);
                      setShowClientSuggestions(e.target.value.length >= 3);
                    }}
                    placeholder="Saisir au moins 3 caractères..."
                    className="border-2 border-blue-300 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-gray-900 shadow-sm"
                    required
                  />
                  {showClientSuggestions && filteredClients.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                      {filteredClients.map((client) => (
                        <div
                          key={client.id}
                          className="p-3 hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 cursor-pointer transition-all duration-200 border-b border-gray-100 dark:border-gray-700 last:border-0"
                          onClick={() => handleClientSelect(client)}
                        >
                          <div className="font-semibold text-gray-900 dark:text-white">{client.nom}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                            📱 {client.phone}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientPhone" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                      📞 Téléphone
                    </Label>
                    <Input
                      id="clientPhone"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="Numéro de téléphone"
                      className="border-2 border-blue-300 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-gray-900 shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="clientAddress" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                      🏠 Adresse
                    </Label>
                    <Input
                      id="clientAddress"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      placeholder="Adresse complète"
                      className="border-2 border-blue-300 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-gray-900 shadow-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section Produit Premium */}
              <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-rose-900/30 border-2 border-purple-300 dark:border-purple-700 shadow-[0_8px_30px_rgba(168,85,247,0.3)]">
                <h3 className="font-black text-xl flex items-center gap-3 text-purple-700 dark:text-purple-300">
                  <span className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm shadow-lg">
                    <Diamond className="h-5 w-5" />
                  </span>
                  <span className="flex items-center gap-2">
                    Produit Luxe
                    <Sparkles className="h-5 w-5 text-pink-500" />
                  </span>
                </h3>
                
                <div className="relative">
                  <Label htmlFor="produitNom" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    📦 Nom du Produit
                  </Label>
                  <Input
                    id="produitNom"
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setProduitNom(e.target.value);
                      setShowProductSuggestions(e.target.value.length >= 3);
                    }}
                    placeholder="Saisir au moins 3 caractères..."
                    className="border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white dark:bg-gray-900 shadow-sm"
                  />
                  {showProductSuggestions && filteredProducts.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          className="p-3 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 cursor-pointer transition-all duration-200 border-b border-gray-100 dark:border-gray-700 last:border-0"
                          onClick={() => handleProductSelect(product)}
                        >
                          <div className="font-semibold text-gray-900 dark:text-white">{product.description}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            💰 Prix: {product.purchasePrice}€
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="prixUnitaire" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                      💵 Prix Unitaire (€)
                    </Label>
                    <Input
                      id="prixUnitaire"
                      type="number"
                      step="0.01"
                      value={prixUnitaire}
                      onChange={(e) => setPrixUnitaire(e.target.value)}
                      placeholder="0.00"
                      className="border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white dark:bg-gray-900 shadow-sm"
                    />
                  </div>

                  <div>
                    <SaleQuantityInput
                      quantity={quantite}
                      maxQuantity={1000}
                      onChange={setQuantite}
                      showAvailableStock={false}
                    />
                  </div>

                  <div>
                    <Label htmlFor="prixVente" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                      💎 Prix de Vente (€)
                    </Label>
                    <Input
                      id="prixVente"
                      type="number"
                      step="0.01"
                      value={prixVente}
                      onChange={(e) => setPrixVente(e.target.value)}
                      placeholder="0.00"
                      className="border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white dark:bg-gray-900 shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  {editingProductIndex !== null && (
                    <Button
                      type="button"
                      onClick={() => {
                        resetProductFields();
                        toast({
                          title: 'Édition annulée',
                          description: 'Retour au mode ajout',
                        });
                      }}
                      variant="outline"
                      className="border-purple-300 dark:border-purple-700"
                    >
                      Annuler
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={handleAddProduit}
                    className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white shadow-2xl hover:shadow-purple-500/50 transform hover:-translate-y-1 transition-all duration-300 rounded-xl font-bold"
                  >
                    {editingProductIndex !== null ? (
                      <>
                        <Edit className="mr-2 h-5 w-5" />
                        Modifier Produit Elite
                        <Sparkles className="ml-2 h-5 w-5" />
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-5 w-5" />
                        Ajouter Produit Luxe
                        <Diamond className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Liste des produits ajoutés */}
                {produitsListe.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-semibold text-sm text-purple-700 dark:text-purple-300 flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Produits dans le panier ({produitsListe.length})
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {produitsListe.map((produit, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border-2 shadow-sm transition-all ${
                            editingProductIndex === index 
                              ? 'border-purple-500 dark:border-purple-400 ring-2 ring-purple-200 dark:ring-purple-800' 
                              : 'border-purple-200 dark:border-purple-700'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-sm">
                              {produit.nom}
                              {editingProductIndex === index && (
                                <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
                                  En édition
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Qté: {produit.quantite} | Prix unitaire: {produit.prixUnitaire}€ | Prix vente: {produit.prixVente}€
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProduit(index)}
                              className="hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 rounded-xl transition-all duration-300"
                              title="Modifier ce produit"
                            >
                              <Edit className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveProduit(index)}
                              className="hover:bg-gradient-to-r hover:from-red-100 hover:to-rose-100 dark:hover:from-red-900/30 dark:hover:to-rose-900/30 rounded-xl transition-all duration-300"
                              title="Supprimer ce produit"
                            >
                              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-sm font-semibold text-right text-purple-700 dark:text-purple-300">
                      Total: {produitsListe.reduce((sum, p) => sum + (p.prixVente * p.quantite), 0).toFixed(2)}€
                    </div>
                  </div>
                )}
              </div>

              {/* Section Détails Premium */}
              <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/30 dark:via-orange-900/30 dark:to-yellow-900/30 border-2 border-amber-300 dark:border-amber-700 shadow-[0_8px_30px_rgba(251,146,60,0.3)]">
                <h3 className="font-black text-xl flex items-center gap-3 text-amber-700 dark:text-amber-300">
                  <span className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white text-sm shadow-lg">
                    <Award className="h-5 w-5" />
                  </span>
                  <span className="flex items-center gap-2">
                    Détails Elite
                    <Zap className="h-5 w-5 text-orange-500" />
                  </span>
                </h3>
                
                <div>
                  <Label htmlFor="type" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    🎯 Type
                  </Label>
                  <Select value={type} onValueChange={(value: 'commande' | 'reservation') => setType(value)}>
                    <SelectTrigger className="border-2 border-amber-300 dark:border-amber-700 focus:border-amber-500 dark:focus:border-amber-500 bg-white dark:bg-gray-900 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commande">📦 Commande</SelectItem>
                      <SelectItem value="reservation">🎫 Réservation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {type === 'commande' ? (
                  <div>
                    <Label htmlFor="dateArrivagePrevue" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                      📅 Date d'Arrivage Prévue
                    </Label>
                    <Input
                      id="dateArrivagePrevue"
                      type="date"
                      value={dateArrivagePrevue}
                      onChange={(e) => setDateArrivagePrevue(e.target.value)}
                      className="border-2 border-amber-300 dark:border-amber-700 focus:border-amber-500 dark:focus:border-amber-500 bg-white dark:bg-gray-900 shadow-sm"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="dateEcheance" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                      ⏰ Date d'Échéance
                    </Label>
                    <Input
                      id="dateEcheance"
                      type="date"
                      value={dateEcheance}
                      onChange={(e) => setDateEcheance(e.target.value)}
                      className="border-2 border-amber-300 dark:border-amber-700 focus:border-amber-500 dark:focus:border-amber-500 bg-white dark:bg-gray-900 shadow-sm"
                      required
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="horaire" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    🕐 Horaire (facultatif)
                  </Label>
                  <Input
                    id="horaire"
                    type="time"
                    value={horaire}
                    onChange={(e) => setHoraire(e.target.value)}
                    className="border-2 border-amber-300 dark:border-amber-700 focus:border-amber-500 dark:focus:border-amber-500 bg-white dark:bg-gray-900 shadow-sm"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-16 text-xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white shadow-[0_20px_60px_rgba(168,85,247,0.5)] hover:shadow-[0_20px_70px_rgba(236,72,153,0.6)] transform hover:-translate-y-2 hover:scale-105 transition-all duration-500 rounded-2xl border-2 border-white/20" 
                disabled={!isFormValid()}
              >
                <span className="flex items-center justify-center gap-3">
                  {editingCommande ? (
                    <>
                      <Edit className="h-6 w-6" />
                      Modifier la Commande Elite
                      <Sparkles className="h-6 w-6" />
                    </>
                  ) : (
                    <>
                      <Crown className="h-6 w-6 animate-pulse" />
                      Créer Commande Premium
                      <Star className="h-6 w-6" />
                    </>
                  )}
                </span>
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      </div>

      <Card className="border-2 border-purple-200/50 dark:border-purple-700/50 shadow-[0_20px_70px_rgba(168,85,247,0.3)] bg-gradient-to-br from-white via-purple-50/20 to-pink-50/20 dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10 rounded-3xl overflow-hidden backdrop-blur-sm">
        <CardHeader className="border-b-2 border-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 dark:from-purple-700 dark:via-pink-700 dark:to-indigo-700 bg-gradient-to-r from-purple-50/50 via-pink-50/50 to-indigo-50/50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-indigo-900/20 pb-6">
          <CardTitle className="flex items-center gap-4 text-xl md:text-2xl font-black tracking-tight">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 text-white shadow-2xl">
              <Gift className="h-7 w-7" />
            </span>
            <span>Liste des Commandes et Réservations</span>
          </CardTitle>
          <CardDescription className="mt-1 text-sm md:text-base text-muted-foreground">
            Total: {filteredCommandes.length} {filteredCommandes.length > 1 ? 'commandes' : 'commande'}
            {commandeSearch.length >= 3 && (
              <span className="ml-2 text-purple-600 dark:text-purple-400 font-semibold">
                (sur {commandes.filter(c => c.statut !== 'valide' && c.statut !== 'annule').length} actives)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <ModernTable className="min-w-full">
            <ModernTableHeader>
              <ModernTableRow >
                <ModernTableHead>Client</ModernTableHead>
                <ModernTableHead>Contact</ModernTableHead>
                <ModernTableHead>Produit</ModernTableHead>
                <ModernTableHead>Prix</ModernTableHead>
                <ModernTableHead>Type</ModernTableHead>
                <ModernTableHead>
                  <button
                    onClick={() => setSortDateAsc(!sortDateAsc)}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                    title={sortDateAsc ? "Trier du plus loin au plus proche" : "Trier du plus proche au plus loin"}
                  >
                    Date
                    {sortDateAsc ? (
                      <ArrowDown className="h-4 w-4 text-purple-600" />
                    ) : (
                      <ArrowUp className="h-4 w-4 text-purple-600" />
                    )}
                  </button>
                </ModernTableHead>
                <ModernTableHead>Statut</ModernTableHead>
                <ModernTableHead>Actions</ModernTableHead>
              </ModernTableRow>
            </ModernTableHeader>

              <TableBody>
                {filteredCommandes.map((commande) => (
                  <ModernTableRow
                    key={commande.id}
                    className="bg-background/40 hover:bg-primary/5 transition-colors"
                  >
                    <ModernTableCell className="align-top">
                      <div className="font-medium">{commande.clientNom}</div>
                      <div className="text-xs text-muted-foreground">
                        {commande.clientAddress}
                      </div>
                    </ModernTableCell>
                    <ModernTableCell className="align-top">
                      <span className="text-sm">{commande.clientPhone}</span>
                    </ModernTableCell>
                    <ModernTableCell className="align-top">
                      {commande.produits.map((p, idx) => (
                        <div key={idx} className="text-sm space-y-0.5">
                          <div className="font-medium">{p.nom}</div>
                         <div className="text-xs text-muted-foreground">
                          Qté: <span className="font-bold text-red-600">{p.quantite}</span>
                        </div>

                        </div>
                      ))}
                    </ModernTableCell>
                    <ModernTableCell className="align-top">
                      {commande.produits.map((p, idx) => (
                        <div key={idx} className="text-sm space-y-0.5">
                          <div>Unitaire: {p.prixUnitaire}€</div>
                          <div className="font-semibold">
                            Vente: {p.prixVente}€
                          </div>
                        </div>
                      ))}
                      {/* Prix total en gras et rouge */}
                      <div className="mt-3 pt-3 border-t-2 border-red-300 dark:border-red-700">
                        <div className="text-base font-black text-red-600 dark:text-red-500">
                          Prix Total: {commande.produits.reduce((sum, p) => sum + (p.prixVente * p.quantite), 0).toFixed(2)}€
                        </div>
                      </div>
                    </ModernTableCell>
                    <ModernTableCell className="align-top">
                     <Badge
                      className={
                        commande.type === 'commande'
                          ? "bg-purple-600 text-white hover:bg-purple-700"   // violet
                          : "bg-blue-600 text-white hover:bg-blue-700"       // bleu
                      }
                      variant={commande.type === 'commande' ? 'default' : 'secondary'}
                    >
                      {commande.type === 'commande' ? 'Commande' : 'Réservation'}
                    </Badge>

                    </ModernTableCell>

                    <ModernTableCell className="align-top text-sm">
                      {commande.type === 'commande' ? (
                        <div>
                          <div className="text-xs text-muted-foreground">Arrivage:</div>
                          <div>{new Date(commande.dateArrivagePrevue || '').toLocaleDateString()}</div>
                          {commande.horaire && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Horaire: {commande.horaire}
                            </div>
                          )}
                        </div>
                      ) : (
                        (() => {
                          const echeance = new Date(commande.dateEcheance || '');
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const echeanceDate = new Date(echeance);
                          echeanceDate.setHours(0, 0, 0, 0);
                          
                          const diffTime = echeanceDate.getTime() - today.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          
                          // Si la date est dépassée (diffDays < 0), clignoter en rouge
                          // Si la date est dans 2 jours ou moins (0 <= diffDays <= 2), clignoter en vert
                          const isOverdue = diffDays < 0;
                          const isNearDeadline = diffDays >= 0 && diffDays <= 2;
                          
                          return (
                            <div>
                              <div className="text-xs text-muted-foreground">Échéance:</div>
                              <div className={
                                isOverdue 
                                  ? "animate-pulse text-red-600 dark:text-red-500 font-bold"
                                  : isNearDeadline 
                                  ? "animate-pulse text-green-600 dark:text-green-500 font-bold"
                                  : ""
                              }>
                                {echeance.toLocaleDateString()}
                              </div>
                              {commande.horaire && (
                                <div className={`text-xs mt-1 ${
                                  isOverdue 
                                    ? "animate-pulse text-red-600 dark:text-red-500 font-semibold"
                                    : isNearDeadline 
                                    ? "animate-pulse text-green-600 dark:text-green-500 font-semibold"
                                    : "text-muted-foreground"
                                }`}>
                                  Horaire: {commande.horaire}
                                </div>
                              )}
                            </div>
                          );
                        })()
                      )}
                    </ModernTableCell>
                    <ModernTableCell className="align-top">
                      <Select
                        value={commande.statut}
                        onValueChange={(value) => handleStatusChange(commande.id, value as any)}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getStatusOptions(commande.type).map((option) => (
                            <SelectItem 
                              key={option.value}
                              value={option.value}
                              className={
                                option.value === 'en_route' ? 'text-purple-600 font-semibold' :
                                option.value === 'arrive' ? 'text-green-600 font-semibold' :
                                option.value === 'en_attente' ? 'text-red-600 font-semibold' :
                                option.value === 'valide' ? 'text-blue-600 font-semibold' :
                                option.value === 'annule' ? 'text-gray-600 font-semibold' :
                                ''
                              }
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </ModernTableCell>
                    <ModernTableCell className="align-top">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(commande)}
                          className="hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 rounded-xl transition-all duration-300"
                          title="Modifier"
                        >
                          <Edit className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(commande.id)}
                          className="hover:bg-gradient-to-r hover:from-red-100 hover:to-rose-100 dark:hover:from-red-900/30 dark:hover:to-rose-900/30 rounded-xl transition-all duration-300"
                          title="Supprimer"
                        >
                          <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </Button>
                      </div>
                    </ModernTableCell>
                  </ModernTableRow>
                ))}
              </TableBody>
            </ModernTable>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!validatingId} onOpenChange={(open) => !open && setValidatingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la validation</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir valider cette commande/réservation ? 
              Une fois validée, elle sera retirée de la liste.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmValidation} className="bg-blue-600 hover:bg-blue-700">
              Valider
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog confirmation annulation */}
      <AlertDialog open={!!cancellingId} onOpenChange={(open) => !open && setCancellingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l'annulation</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir annuler cette commande/réservation ? 
              Elle sera retirée de la liste mais conservée dans la base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancellation} className="bg-gray-600 hover:bg-gray-700">
              Annuler la commande
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </Layout>
  );
}
