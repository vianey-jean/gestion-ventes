import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ModernTable, ModernTableHeader, ModernTableRow, ModernTableHead, ModernTableCell, TableBody } from '@/components/dashboard/forms/ModernTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Package, Plus, Trash2, Edit, ShoppingCart, TrendingUp } from 'lucide-react';
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
  
  // Liste des produits ajoutés au panier
  const [produitsListe, setProduitsListe] = useState<CommandeProduit[]>([]);
  
  // État pour gérer l'édition d'un produit dans le panier
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  
  // Autocomplete state
  const [clientSearch, setClientSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);

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

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (productSearch.length < 3) return [];
    return products.filter(product => 
      product.description.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [productSearch, products]);

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
        });
      } else {
        await api.post('/api/commandes', commandeData);
        toast({
          title: 'Succès',
          description: 'Commande ajoutée avec succès',
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
    setClientSearch(commande.clientNom);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/commandes/${id}`);
      toast({
        title: 'Succès',
        description: 'Commande supprimée avec succès',
      });
      fetchCommandes();
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting commande:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la commande',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'en_route' | 'arrive' | 'en_attente') => {
    try {
      await api.put(`/api/commandes/${id}`, { statut: newStatus });
      toast({
        title: 'Succès',
        description: 'Statut mis à jour',
      });
      fetchCommandes();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut',
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
      default:
        return <Badge>{statut}</Badge>;
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
       {/* Hero Header */}
                  <div className="text-center mb-6 sm:mb-8 md:mb-12">
                    <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full text-purple-600 dark:text-purple-400 text-xs sm:text-sm font-medium mb-4 sm:mb-6 border border-purple-200 dark:border-purple-800">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden xs:inline">Commandes ou Reservation</span>
                      <span className="xs:hidden">Temps réel</span>
                    </div>
                    
                        <motion.h1
                          initial={{ opacity: 0, y: 60, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold 
                                    bg-gradient-to-r from-purple-600 via-red-600 to-indigo-600 
                                    bg-[length:200%_200%] animate-gradient 
                                    bg-clip-text text-transparent mb-4 sm:mb-6 text-center text-3d px-2"
                        >
                          Commandes ou Reservation
                        </motion.h1>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
                      Gérez efficacement vos commandes ou reservations
                    </p>
                  </div>
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Commandes & Réservations
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos commandes et réservations clients
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto" size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Commande/Réservation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20 backdrop-blur-xl border-2 border-purple-200/50 dark:border-purple-700/50 shadow-2xl">
            <DialogHeader className="border-b border-purple-200 dark:border-purple-800 pb-4">
              <DialogTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                {editingCommande ? '✨ Modifier' : '🎯 Nouvelle'} Commande Premium
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground mt-2">
                Remplissez tous les champs pour créer votre commande d'élite
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              {/* Section Client */}
              <div className="space-y-4 p-5 rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
                <h3 className="font-bold text-xl flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm">1</span>
                  Informations Client
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

              {/* Section Produit */}
              <div className="space-y-4 p-5 rounded-xl bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-rose-900/20 border-2 border-purple-200 dark:border-purple-800 shadow-lg">
                <h3 className="font-bold text-xl flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm">2</span>
                  Informations Produit
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
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                  >
                    {editingProductIndex !== null ? (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier ce produit
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter ce produit
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
                              className="hover:bg-purple-100 dark:hover:bg-purple-900/20"
                              title="Modifier ce produit"
                            >
                              <Edit className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveProduit(index)}
                              className="hover:bg-red-100 dark:hover:bg-red-900/20"
                              title="Supprimer ce produit"
                            >
                              <Trash2 className="h-9 w-9 text-red-500" />
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

              {/* Section Détails */}
              <div className="space-y-4 p-5 rounded-xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 border-2 border-amber-200 dark:border-amber-800 shadow-lg">
                <h3 className="font-bold text-xl flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white text-sm">3</span>
                  Détails de la Commande
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
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white shadow-2xl hover:shadow-purple-500/50 transform hover:-translate-y-1 transition-all duration-300 rounded-xl" 
                disabled={!isFormValid()}
              >
                {editingCommande ? '✅ Modifier la Commande' : '✨ Créer la Commande Premium'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-2xl bg-gradient-to-br from-background via-background/95 to-primary/10 dark:from-background dark:via-background/95 dark:to-primary/20 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl font-bold tracking-tight">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shadow-md">
              <Package className="h-5 w-5" />
            </span>
            <span>Liste des Commandes et Réservations</span>
          </CardTitle>
          <CardDescription className="mt-1 text-sm md:text-base text-muted-foreground">
            Total: {commandes.length} {commandes.length > 1 ? 'commandes' : 'commande'}
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
                <ModernTableHead>Date</ModernTableHead>
                <ModernTableHead>Statut</ModernTableHead>
                <ModernTableHead>Actions</ModernTableHead>
              </ModernTableRow>
            </ModernTableHeader>

              <TableBody>
                {commandes.map((commande) => (
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
                            Qté: {p.quantite}
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
                    </ModernTableCell>
                    <ModernTableCell className="align-top">
                      <Badge
                        className="bg-blue-600 text-white hover:bg-blue-700"
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
                        </div>
                      ) : (
                        <div>
                          <div className="text-xs text-muted-foreground">Échéance:</div>
                          <div>{new Date(commande.dateEcheance || '').toLocaleDateString()}</div>
                        </div>
                      )}
                    </ModernTableCell>
                    <ModernTableCell className="align-top">
                      {commande.type === 'commande' ? (
                        <Select
                          value={commande.statut}
                          onValueChange={(value) => handleStatusChange(commande.id, value as any)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                          <SelectItem 
                            value="en_route" 
                            className="text-purple-600 font-semibold"
                          >
                            En route
                          </SelectItem>

                          <SelectItem 
                            value="arrive" 
                            className="text-green-600 font-semibold"
                          >
                            Arrivé
                          </SelectItem>
                        </SelectContent>

                        </Select>
                      ) : (
                        getStatusBadge(commande.statut)
                      )}
                    </ModernTableCell>
                    <ModernTableCell className="align-top">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(commande)}
                          className="hover:bg-primary/10"
                        >
                          <Edit className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(commande.id)}
                          className="hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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
      </div>
    </Layout>
  );
}
