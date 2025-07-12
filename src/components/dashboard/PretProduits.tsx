import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, CalendarIcon, Loader2, Trash2, Plus, CreditCard, TrendingUp, Wallet, CheckCircle, Clock, Search, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { Product, PretProduit } from '@/types';
import { pretProduitService } from '@/service/api';
import { motion } from 'framer-motion';
import PretRetardNotification from './PretRetardNotification';

const PretProduits: React.FC = () => {
  const [prets, setPrets] = useState<PretProduit[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ajoutAvanceDialogOpen, setAjoutAvanceDialogOpen] = useState(false);
  const [datePret, setDatePret] = useState<Date>(new Date());
  const [datePaiement, setDatePaiement] = useState<Date | undefined>();
  const [description, setDescription] = useState('');
  const [nom, setNom] = useState('');
  const [phone, setPhone] = useState('');
  const [prixVente, setPrixVente] = useState('');
  const [avanceRecue, setAvanceRecue] = useState('');
  const [ajoutAvance, setAjoutAvance] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchPretResults, setSearchPretResults] = useState<PretProduit[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPret, setSelectedPret] = useState<PretProduit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { products, searchProducts } = useApp();
  const { toast } = useToast();

  // Calculer reste automatiquement
  const reste = React.useMemo(() => {
    const prix = parseFloat(prixVente) || 0;
    const avance = parseFloat(avanceRecue) || 0;
    return prix - avance;
  }, [prixVente, avanceRecue]);

  // Calculer nouveau reste après ajout d'avance
  const nouveauReste = React.useMemo(() => {
    if (!selectedPret) return 0;
    
    const prix = selectedPret.prixVente || 0;
    const avanceActuelle = selectedPret.avanceRecue || 0;
    const nouvelleAvance = parseFloat(ajoutAvance) || 0;
    
    return prix - (avanceActuelle + nouvelleAvance);
  }, [selectedPret, ajoutAvance]);

  // Nouvel état du paiement après ajout d'avance
  const nouveauEstPaye = nouveauReste <= 0;

  // État du paiement
  const estPaye = reste <= 0;

  // Fonction pour vérifier si une date de paiement est dépassée
  const isDatePaiementDepassee = (datePaiement: string) => {
    const date = new Date(datePaiement);
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < aujourdhui;
  };

  // Fonction pour déterminer la classe CSS de la date de paiement
  const getDatePaiementClass = (pret: PretProduit) => {
    if (!pret.datePaiement) return "font-medium text-green-600";
    
    const isDepassee = isDatePaiementDepassee(pret.datePaiement);
    
    if (pret.estPaye) {
      // Si le prêt est payé, toujours en vert
      return "font-medium text-green-600";
    } else if (isDepassee) {
      // Si le prêt n'est pas payé et la date est dépassée, rouge et clignotant
      return "font-medium text-red-600 animate-pulse font-bold";
    } else {
      // Si le prêt n'est pas payé et la date n'est pas dépassée, vert
      return "font-medium text-green-600";
    }
  };

  // Charger les données depuis l'API
  const fetchPrets = async () => {
    try {
      setLoading(true);
      const data = await pretProduitService.getPretProduits();
      setPrets(data);
    } catch (error) {
      console.error('Erreur lors du chargement des prêts produits', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les prêts produits',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrets();
  }, [toast]);

  // Calculer le total restant
  const totalReste = prets.reduce((sum, pret) => sum + pret.reste, 0);
  const totalAvances = prets.reduce((sum, pret) => sum + pret.avanceRecue, 0);
  const totalVentes = prets.reduce((sum, pret) => sum + pret.prixVente, 0);
  const pretsPayes = prets.filter(pret => pret.estPaye).length;

  // Recherche des produits par description
  const handleSearch = async (text: string) => {
    setDescription(text);
    if (text.length >= 3) {
      try {
        const results = await searchProducts(text);
        setSearchResults(results);
      } catch (error) {
        console.error('Erreur lors de la recherche de produits', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Recherche des prêts par description
  const handleSearchPret = async (text: string) => {
    setSearchTerm(text);
    if (text.length >= 3) {
      try {
        const filtered = prets.filter(pret => 
          pret.description.toLowerCase().includes(text.toLowerCase())
        );
        setSearchPretResults(filtered);
      } catch (error) {
        console.error('Erreur lors de la recherche de prêts', error);
      }
    } else {
      setSearchPretResults([]);
    }
  };

  // Sélectionner un produit dans les résultats de recherche
  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setDescription(product.description);
    setPrixVente(product.purchasePrice.toString());
    setSearchResults([]);
  };

  // Sélectionner un prêt pour modification
  const selectPretForEdit = (pret: PretProduit) => {
    setSelectedPret(pret);
    setDatePret(new Date(pret.date));
    setDatePaiement(pret.datePaiement ? new Date(pret.datePaiement) : undefined);
    setDescription(pret.description);
    setNom(pret.nom || '');
    setPhone(pret.phone || '');
    setPrixVente(pret.prixVente.toString());
    setAvanceRecue(pret.avanceRecue.toString());
    setSearchPretResults([]);
    setSearchDialogOpen(false);
    setEditDialogOpen(true);
  };

  // Sélectionner un prêt pour ajouter une avance
  const selectPretForAjoutAvance = (pret: PretProduit, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche le déclenchement du onClick de la ligne
    setSelectedPret(pret);
    setAjoutAvance('');
    setAjoutAvanceDialogOpen(true);
  };

  // Sélectionner un prêt pour suppression
  const selectPretForDelete = (pret: PretProduit, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche le déclenchement du onClick de la ligne
    setSelectedPret(pret);
    setDeleteDialogOpen(true);
  };

  // Sélectionner un prêt depuis le tableau pour édition
  const handleRowClick = (pret: PretProduit) => {
    selectPretForEdit(pret);
  };

  // Ouvrir le formulaire d'édition pour un prêt
  const handleEditClick = (pret: PretProduit, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche le déclenchement du onClick de la ligne
    selectPretForEdit(pret);
  };

  // Enregistrer le prêt
  const handleSubmit = async () => {
    if (!description) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir une description',
        variant: 'destructive',
      });
      return;
    }

    if (!prixVente || parseFloat(prixVente) <= 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir un prix de vente valide',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const newPret: Omit<PretProduit, 'id'> = {
        date: format(datePret, 'yyyy-MM-dd'),
        datePaiement: datePaiement ? format(datePaiement, 'yyyy-MM-dd') : undefined,
        description,
        nom,
        phone,
        prixVente: parseFloat(prixVente),
        avanceRecue: parseFloat(avanceRecue) || 0,
        reste,
        estPaye,
        productId: selectedProduct?.id
      };
      
      // Enregistrer via l'API
      await pretProduitService.addPretProduit(newPret);
      
      // Recharger les données
      await fetchPrets();
      
      toast({
        title: 'Succès',
        description: 'Prêt enregistré avec succès',
        variant: 'default',
        className: 'notification-success',
      });
      
      // Réinitialiser le formulaire
      resetForm();
      setDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du prêt', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le prêt',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un prêt existant
  const handleUpdate = async () => {
    if (!selectedPret) return;

    try {
      setLoading(true);
      
      const updatedPret: PretProduit = {
        ...selectedPret,
        datePaiement: datePaiement ? format(datePaiement, 'yyyy-MM-dd') : undefined,
        nom,
        phone,
        avanceRecue: parseFloat(avanceRecue) || 0,
        reste: reste,
        estPaye: estPaye
      };
      
      // Mettre à jour via l'API
      await pretProduitService.updatePretProduit(selectedPret.id, updatedPret);
      
      // Recharger les données
      await fetchPrets();
      
      toast({
        title: 'Succès',
        description: 'Prêt mis à jour avec succès',
        variant: 'default',
        className: 'notification-success',
      });
      
      // Réinitialiser le formulaire
      resetForm();
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du prêt', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le prêt',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Ajouter une avance à un prêt
  const handleAjoutAvance = async () => {
    if (!selectedPret) return;
    
    if (!ajoutAvance || parseFloat(ajoutAvance) <= 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir un montant valide',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Calculer la nouvelle avance totale
      const nouvelleAvanceRecue = selectedPret.avanceRecue + parseFloat(ajoutAvance);
      
      // Calculer le nouveau reste
      const nouveauReste = selectedPret.prixVente - nouvelleAvanceRecue;
      
      // Déterminer si le prêt est maintenant entièrement payé
      const nouveauEstPaye = nouveauReste <= 0;
      
      const updatedPret: PretProduit = {
        ...selectedPret,
        avanceRecue: nouvelleAvanceRecue,
        reste: nouveauReste,
        estPaye: nouveauEstPaye
      };
      
      // Mettre à jour via l'API
      await pretProduitService.updatePretProduit(selectedPret.id, updatedPret);
      
      // Recharger les données
      await fetchPrets();
      
      toast({
        title: 'Succès',
        description: 'Avance ajoutée avec succès',
        variant: 'default',
        className: 'notification-success',
      });
      
      // Réinitialiser le formulaire
      setAjoutAvance('');
      setSelectedPret(null);
      setAjoutAvanceDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'avance', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter l\'avance',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un prêt
  const handleDelete = async () => {
    if (!selectedPret) return;

    try {
      setLoading(true);
      
      // Supprimer via l'API
      await pretProduitService.deletePretProduit(selectedPret.id);
      
      // Recharger les données
      await fetchPrets();
      
      toast({
        title: 'Succès',
        description: 'Prêt supprimé avec succès',
        variant: 'default',
        className: 'notification-success',
      });
      
      // Réinitialiser et fermer
      resetForm();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la suppression du prêt', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le prêt',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setSelectedPret(null);
    setDatePret(new Date());
    setDatePaiement(undefined);
    setDescription('');
    setNom('');
    setPhone('');
    setPrixVente('');
    setAvanceRecue('');
    setAjoutAvance('');
    setSelectedProduct(null);
  };

  // Format de devise
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-slate-900 p-6">
      {/* Notifications des prêts en retard */}
      <PretRetardNotification prets={prets} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Hero Header */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 backdrop-blur-sm rounded-full text-purple-600 dark:text-purple-400 text-sm font-semibold mb-6 border border-purple-200/50 dark:border-purple-800/50"
          >
            <CreditCard className="h-5 w-5 mr-2 animate-pulse" />
            Gestion Premium des Prêts
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Prêts Produits
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Gérez vos prêts avec élégance et efficacité
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-100 text-sm">Total Ventes</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalVentes)}</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-sm">Avances Reçues</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalAvances)}</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-none shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-orange-100 text-sm">Reste à Payer</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalReste)}</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-purple-100 text-sm">Prêts Payés</p>
                    <p className="text-2xl font-bold">{pretsPayes}/{prets.length}</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-wrap gap-4 mb-8 justify-center"
        >
          <Button 
            onClick={() => setDialogOpen(true)} 
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 rounded-xl font-semibold"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Nouveau Prêt
          </Button>
          
          <Button 
            onClick={() => setSearchDialogOpen(true)} 
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 rounded-xl font-semibold"
          >
            <Search className="mr-2 h-5 w-5" />
            Rechercher
          </Button>
        </motion.div>
        
        {/* Main Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 shadow-2xl">
            <div className="p-8">
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-lg text-gray-600 dark:text-gray-300">Chargement des données...</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="border-gray-200 dark:border-gray-700">
                        <TableHead className="font-bold text-purple-600 dark:text-purple-400 text-left">Date de Prêt</TableHead>
                        <TableHead className="font-bold text-purple-600 dark:text-purple-400 text-left">Date Paiement</TableHead>
                        <TableHead className="font-bold text-purple-600 dark:text-purple-400 text-left">Description</TableHead>
                        <TableHead className="font-bold text-purple-600 dark:text-purple-400 text-left">Nom</TableHead>
                        <TableHead className="font-bold text-purple-600 dark:text-purple-400 text-left">Téléphone</TableHead>
                        <TableHead className="font-bold text-purple-600 dark:text-purple-400 text-right">Prix Vente</TableHead>
                        <TableHead className="font-bold text-purple-600 dark:text-purple-400 text-right">Avance</TableHead>
                        <TableHead className="font-bold text-purple-600 dark:text-purple-400 text-right">Reste</TableHead>
                        <TableHead className="font-bold text-purple-600 dark:text-purple-400 text-center">Statut</TableHead>
                        <TableHead className="font-bold text-purple-600 dark:text-purple-400 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prets.map((pret) => (
                        <TableRow 
                          key={pret.id} 
                          className="cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all duration-200 border-gray-100 dark:border-gray-700" 
                          onClick={() => selectPretForEdit(pret)}
                        >
                          <TableCell className="font-medium">{format(new Date(pret.date), 'dd/MM/yyyy')}</TableCell>
                          <TableCell className={getDatePaiementClass(pret)} >
                            {pret.datePaiement ? format(new Date(pret.datePaiement), 'dd/MM/yyyy') : '-'}
                          </TableCell>
                          <TableCell className="font-medium text-gray-900 dark:text-gray-100">{pret.description}</TableCell>
                          <TableCell className="text-purple-600 dark:text-purple-300 font-bold">{pret.nom || '-'}</TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-300">
                            {pret.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-6 w-6 text-green-800" />
                                <span className="text-red-800 font-bold">{pret.phone}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(pret.prixVente)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-blue-600">
                            {formatCurrency(pret.avanceRecue)}
                          </TableCell>
                          <TableCell className="text-right font-bold text-orange-600">
                            {formatCurrency(pret.reste)}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                              pret.estPaye 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                            }`}>
                              {pret.estPaye ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Payé
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  En cours
                                </>
                              )}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center space-x-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPret(pret);
                                  setAjoutAvance('');
                                  setAjoutAvanceDialogOpen(true);
                                }} 
                                className="p-2 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 transition-colors"
                                title="Ajouter une avance"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectPretForEdit(pret);
                                }} 
                                className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
                                title="Modifier"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPret(pret);
                                  setDeleteDialogOpen(true);
                                }} 
                                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>
      
      {/* Formulaire d'ajout de prêt */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Ajouter un prêt de produit
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="datePret" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date de prêt</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300 dark:border-gray-600",
                        !datePret && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {datePret ? format(datePret, "PPP", { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={datePret}
                      onSelect={(newDate) => setDatePret(newDate || new Date())}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="datePaiement" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date de paiement prévue</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300 dark:border-gray-600",
                        !datePaiement && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {datePaiement ? format(datePaiement, "PPP", { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={datePaiement}
                      onSelect={setDatePaiement}
                      disabled={(date) =>
                        date < new Date("1900-01-01")
                      }
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description du produit</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Tapez pour rechercher un produit..."
                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300 dark:border-gray-600"
              />
              {searchResults.length > 0 && (
                <div className="border rounded-md max-h-40 overflow-y-auto bg-white dark:bg-gray-800">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => selectProduct(product)}
                    >
                      <div className="text-sm font-medium">{product.description}</div>
                      <div className="text-xs text-gray-500">Prix: {formatCurrency(product.purchasePrice)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nom" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nom du client</Label>
                <Input
                  id="nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Nom du client"
                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300 dark:border-gray-600"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Numéro de téléphone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+262 692 123 456"
                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="prixVente" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Prix de vente (€)</Label>
                <Input
                  id="prixVente"
                  type="number"
                  step="0.01"
                  value={prixVente}
                  onChange={(e) => setPrixVente(e.target.value)}
                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300 dark:border-gray-600"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="avanceRecue" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Avance reçue (€)</Label>
                <Input
                  id="avanceRecue"
                  type="number"
                  step="0.01"
                  value={avanceRecue}
                  onChange={(e) => setAvanceRecue(e.target.value)}
                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>

            {(prixVente || avanceRecue) && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Reste à payer:</span>
                  <span className={`font-bold text-lg ${reste <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {formatCurrency(reste)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Statut:</span>
                  <span className={`text-sm font-semibold ${estPaye ? 'text-green-600' : 'text-orange-600'}`}>
                    {estPaye ? 'Entièrement payé' : 'Paiement en cours'}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Formulaire de modification de prêt */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier un prêt</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editDatePret">Date de prêt</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !datePret && "text-muted-foreground"
                      )}
                      disabled
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {datePret ? format(datePret, 'PP', { locale: fr }) : <span>Sélectionner une date</span>}
                    </Button>
                  </PopoverTrigger>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="editDatePaiement">Date de paiement prévue</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !datePaiement && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {datePaiement ? format(datePaiement, 'PP', { locale: fr }) : <span>Sélectionner une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={datePaiement}
                      onSelect={setDatePaiement}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="editDescription">Description</Label>
              <Input 
                id="editDescription" 
                value={description} 
                disabled
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editNom">Nom</Label>
                <Input 
                  id="editNom" 
                  value={nom} 
                  onChange={(e) => setNom(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="editPhone">Numéro de téléphone</Label>
                <Input 
                  id="editPhone" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+262 692 123 456"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="editPrixVente">Prix du produit vendu</Label>
              <Input 
                id="editPrixVente" 
                type="number" 
                value={prixVente} 
                disabled
                className="bg-gray-100"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="editAvanceRecue">Avance reçue</Label>
              <Input 
                id="editAvanceRecue" 
                type="number" 
                value={avanceRecue} 
                onChange={(e) => setAvanceRecue(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between">
                <p><strong>Reste:</strong></p>
                <p className={reste > 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                  {formatCurrency(reste)}
                </p>
              </div>
              <div className="flex justify-between mt-1">
                <p><strong>Statut:</strong></p>
                <p className={estPaye ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {estPaye ? 'Tout payé' : 'Reste à payer'}
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleUpdate} 
              disabled={loading || !selectedPret}
              className="mt-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Enregistrer les modifications
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Formulaire d'ajout d'avance */}
      <Dialog open={ajoutAvanceDialogOpen} onOpenChange={setAjoutAvanceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter une avance</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedPret && (
              <>
                <div className="bg-gray-50 p-4 rounded-md mb-2">
                  <p><strong>Description:</strong> {selectedPret.description}</p>
                  <p><strong>Nom:</strong> {selectedPret.nom || '-'}</p>
                  <div className="flex justify-between mt-2">
                    <span>Prix: {formatCurrency(selectedPret.prixVente)}</span>
                    <span>Avance reçue: {formatCurrency(selectedPret.avanceRecue)}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Reste actuel: {formatCurrency(selectedPret.reste)}</span>
                    <span className={selectedPret.estPaye ? 'text-app-green' : 'text-app-red'}>
                      {selectedPret.estPaye ? 'Tout payé' : 'Reste à payer'}
                    </span>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="ajoutAvance">Montant de l'avance à ajouter</Label>
                  <Input 
                    id="ajoutAvance" 
                    type="number" 
                    value={ajoutAvance} 
                    onChange={(e) => setAjoutAvance(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="text-lg"
                  />
                </div>
                
                {/* Simulation des nouveaux montants */}
                {parseFloat(ajoutAvance) > 0 && (
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                    <h3 className="font-medium text-blue-700 mb-2">Après ajout de cette avance:</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-600">Avance actuelle:</p>
                        <p className="font-medium">{formatCurrency(selectedPret.avanceRecue)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">+ Nouvelle avance:</p>
                        <p className="font-medium text-app-green">{formatCurrency(parseFloat(ajoutAvance) || 0)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">= Total avance:</p>
                        <p className="font-medium">{formatCurrency(selectedPret.avanceRecue + (parseFloat(ajoutAvance) || 0))}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Nouveau reste:</p>
                        <p className={`font-medium ${nouveauReste > 0 ? 'text-app-red' : 'text-app-green'}`}>
                          {formatCurrency(nouveauReste)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-blue-200">
                      <p className="text-sm">
                        <strong>Nouveau statut:</strong> 
                        <span className={nouveauEstPaye ? 'text-app-green ml-2' : 'text-app-red ml-2'}>
                          {nouveauEstPaye ? 'Tout payé' : 'Reste à payer'}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
            
            <Button 
              onClick={handleAjoutAvance} 
              disabled={loading || !ajoutAvance || parseFloat(ajoutAvance) <= 0}
              className="mt-2 bg-app-green hover:bg-app-green/90"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Enregistrer l'avance
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de recherche pour modifier un prêt */}
      <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Rechercher un prêt à modifier</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="searchPret">Description du prêt</Label>
              <div className="relative">
                <Input 
                  id="searchPret" 
                  value={searchTerm} 
                  onChange={(e) => handleSearchPret(e.target.value)} 
                  placeholder="Saisir au moins 3 caractères pour rechercher"
                />
                {searchPretResults.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {searchPretResults.map((pret) => (
                      <div 
                        key={pret.id} 
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectPretForEdit(pret)}
                      >
                        <p className="font-medium">{pret.description}</p>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Prix: {formatCurrency(pret.prixVente)}</span>
                          <span>Reste: {formatCurrency(pret.reste)}</span>
                          <span>Avance: {formatCurrency(pret.avanceRecue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Êtes-vous sûr de vouloir supprimer ce prêt ?</p>
            {selectedPret && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p><strong>Description:</strong> {selectedPret.description}</p>
                <p><strong>Montant:</strong> {formatCurrency(selectedPret.prixVente)}</p>
                <p><strong>Date:</strong> {format(new Date(selectedPret.date), 'dd/MM/yyyy')}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="ml-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PretProduits;
