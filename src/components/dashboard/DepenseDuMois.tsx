import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, RotateCcw, CreditCard, Save, Wallet, ArrowUp, ArrowDown, DollarSign, Calendar, Sparkles, Award, TrendingUp, TrendingDown } from 'lucide-react';
import MonthlyResetHandler from './MonthlyResetHandler';
import { useIsMobile } from '@/hooks/use-mobile';
import { depenseService } from '@/service/api';
import { useApp } from '@/contexts/AppContext';

// Fonction pour formater le mois en français
const formatMonthInFrench = (monthIndex: number): string => {
  const months = [
    'JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
    'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'
  ];
  return months[monthIndex -1] || 'MOIS INCONNU';
};

const DepenseDuMois = () => {
  const [mouvements, setMouvements] = useState([]);
  const [newMouvement, setNewMouvement] = useState({
    description: '',
    categorie: '',
    date: new Date().toISOString().substring(0, 10),
    debit: '',
    credit: '',
  });
  const [editMouvementId, setEditMouvementId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFixeDialogOpen, setIsFixeDialogOpen] = useState(false);
  const [depensesFixe, setDepensesFixe] = useState({
    free: '',
    internetZeop: '',
    assuranceVoiture: '',
    autreDepense: '',
    assuranceVie: '',
  });
  
  const { 
    currentMonth,
    currentYear,
  } = useApp();
  
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Calcul du solde - Make sure mouvements is an array before calling reduce
  const solde = Array.isArray(mouvements) ? mouvements.reduce((total, m) => {
    return total + (parseFloat(m.credit) || 0) - (parseFloat(m.debit) || 0);
  }, 0) : 0;

  // Formatage des dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR').format(date);
  };

  // Formatage des montants
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount || 0);
  };

  // Récupération des mouvements
  const fetchMouvements = async () => {
    try {
      const mouvementsData = await depenseService.getMouvements();
      setMouvements(mouvementsData || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des mouvements:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les mouvements",
        variant: "destructive",
      });
      setMouvements([]);
    }
  };

  // Récupération des dépenses fixes
  const fetchDepensesFixe = async () => {
    try {
      const depensesFixeData = await depenseService.getDepensesFixe();
      setDepensesFixe({
        free: (depensesFixeData.free || 0).toString(),
        internetZeop: (depensesFixeData.internetZeop || 0).toString(),
        assuranceVoiture: (depensesFixeData.assuranceVoiture || 0).toString(),
        autreDepense: (depensesFixeData.autreDepense || 0).toString(),
        assuranceVie: (depensesFixeData.assuranceVie || 0).toString(),
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des dépenses fixes:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les dépenses fixes",
        variant: "destructive",
      });
    }
  };

  // Ajout/Modification d'un mouvement
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validation des données
      if (!newMouvement.description || !newMouvement.categorie || (!newMouvement.debit && !newMouvement.credit)) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive",
        });
        return;
      }

      // Créer l'objet mouvement avec le solde calculé
      const mouvementData = {
        ...newMouvement,
        solde: solde + (parseFloat(newMouvement.credit) || 0) - (parseFloat(newMouvement.debit) || 0)
      };
      
      if (editMouvementId) {
        // Mise à jour d'un mouvement existant
        await depenseService.updateMouvement(editMouvementId, mouvementData);
        
        toast({
          title: "Succès",
          description: "Mouvement mis à jour avec succès",
          className: "bg-app-green text-white",
        });
      } else {
        // Création d'un nouveau mouvement
        await depenseService.addMouvement(mouvementData);
        
        toast({
          title: "Succès",
          description: "Mouvement ajouté avec succès",
          className: "bg-app-green text-white",
        });
      }
      
      // Réinitialisation et rechargement des données
      setNewMouvement({
        description: '',
        categorie: '',
        date: new Date().toISOString().substring(0, 10),
        debit: '',
        credit: '',
      });
      setEditMouvementId(null);
      setIsDialogOpen(false);
      fetchMouvements();
    } catch (error) {
      console.error("Erreur lors de l'ajout/modification du mouvement:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive",
      });
    }
  };

  // Suppression d'un mouvement
  const handleDelete = async () => {
    try {
      await depenseService.deleteMouvement(deleteId);
      
      toast({
        title: "Succès",
        description: "Mouvement supprimé avec succès",
        className: "bg-app-green text-white",
      });
      
      setIsDeleteDialogOpen(false);
      fetchMouvements();
    } catch (error) {
      console.error("Erreur lors de la suppression du mouvement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le mouvement",
        variant: "destructive",
      });
    }
  };

  // Modification d'un mouvement existant
  const handleEdit = (mouvement) => {
    setNewMouvement({
      description: mouvement.description,
      categorie: mouvement.categorie,
      date: mouvement.date.substring(0, 10),
      debit: mouvement.debit || '',
      credit: mouvement.credit || '',
    });
    setEditMouvementId(mouvement.id);
    setIsDialogOpen(true);
  };

  // Mise à jour des dépenses fixes
  const handleUpdateDepensesFixe = async () => {
    try {
      // Convertir les strings en numbers pour l'API
      const depensesFixeNumbers = {
        free: parseFloat(depensesFixe.free) || 0,
        internetZeop: parseFloat(depensesFixe.internetZeop) || 0,
        assuranceVoiture: parseFloat(depensesFixe.assuranceVoiture) || 0,
        autreDepense: parseFloat(depensesFixe.autreDepense) || 0,
        assuranceVie: parseFloat(depensesFixe.assuranceVie) || 0,
      };
      
      await depenseService.updateDepensesFixe(depensesFixeNumbers);
      
      toast({
        title: "Succès",
        description: "Dépenses fixes mises à jour avec succès",
        className: "bg-app-green text-white",
      });
      
      setIsFixeDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour des dépenses fixes:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les dépenses fixes",
        variant: "destructive",
      });
    }
  };

  // Chargement des données au montage du composant
  useEffect(() => {
    fetchMouvements();
    fetchDepensesFixe();
  }, []);

  // Réinitialisation manuelle de tous les mouvements
  const handleReset = async () => {
    try {
      await depenseService.resetMouvements();
      
      toast({
        title: "Succès",
        description: "Tous les mouvements ont été réinitialisés",
        className: "bg-app-blue text-white",
      });
      
      fetchMouvements();
    } catch (error) {
      console.error("Erreur lors de la réinitialisation des mouvements:", error);
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser les mouvements",
        variant: "destructive",
      });
    }
  };

  // Gérer le changement de catégorie dans le formulaire
  const handleCategorieChange = (value) => {
    if (value === "chargeFixe") {
      // Si charge fixe est sélectionné, pré-remplir avec les données de dépenses fixes
      depenseService.getDepensesFixe().then(depensesFixeData => {
        setNewMouvement({
          ...newMouvement,
          categorie: value,
          description: "Charge fixe",
          debit: (depensesFixeData.total || 0).toString(),
          credit: ''
        });
      });
    } else {
      // Sinon, réinitialiser les champs
      setNewMouvement({
        ...newMouvement,
        categorie: value,
        description: '',
        debit: '',
        credit: ''
      });
    }
  };

  const estPositif = solde >= 0;

  return (
    <div className="space-y-8">
      <MonthlyResetHandler />
      
      {/* Header luxueux avec gradient */}
      <div className="bg-gradient-to-br from-cyan-600 via-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 border border-white/20">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Dépenses du mois</h2>
              <div className="flex items-center gap-2 text-white/90">
                <Calendar className="h-5 w-5" />
                <span className="text-xl font-semibold">
                  {formatMonthInFrench(currentMonth)} {currentYear}
                </span>
              </div>
            </div>
            <Sparkles className="h-6 w-6 text-white animate-pulse" />
          </div>

          {/* Boutons d'action modernisés */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => setIsFixeDialogOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Dépenses fixes
            </Button>
            <Button 
              className="bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-300 hover:scale-105 shadow-lg" 
              onClick={() => {
                setEditMouvementId(null);
                setNewMouvement({
                  description: '',
                  categorie: '',
                  date: new Date().toISOString().substring(0, 10),
                  debit: '',
                  credit: '',
                });
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
            <Button 
              onClick={handleReset}
              className="bg-red-500/80 hover:bg-red-600 text-white border border-red-400/50 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </div>
      </div>
      
      {/* Affichage du solde modernisé */}
      <div className="bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-900/95 dark:to-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full p-4">
              <DollarSign className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Solde actuel</h3>
              <div className="flex items-center gap-4">
                <span className={`text-4xl font-bold ${estPositif ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatAmount(solde)}
                </span>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  estPositif 
                    ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 dark:from-emerald-900/30 dark:to-teal-900/30 dark:text-emerald-300' 
                    : 'bg-gradient-to-r from-red-100 to-orange-100 text-red-700 dark:from-red-900/30 dark:to-orange-900/30 dark:text-red-300'
                }`}>
                  {estPositif ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  <span className="font-bold text-lg">
                    {estPositif ? 'Bonne situation' : 'Découvert'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <Award className="h-12 w-12 text-gray-300 dark:text-gray-600" />
          </div>
        </div>
      </div>
      
      {/* Tableau des mouvements modernisé */}
      <div className="bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-900/95 dark:to-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Header du tableau */}
        <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-2">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Mouvements du mois</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className={isMobile ? "table-responsive-stack" : ""}>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-none hover:bg-gradient-to-r">
                <TableHead className="font-bold text-indigo-600 dark:text-indigo-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                  </div>
                </TableHead>
                <TableHead className="font-bold text-indigo-600 dark:text-indigo-400">
                  <div className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Description
                  </div>
                </TableHead>
                <TableHead className="font-bold text-indigo-600 dark:text-indigo-400">Catégorie</TableHead>
                <TableHead className="text-right font-bold text-indigo-600 dark:text-indigo-400">
                  <div className="flex items-center justify-end gap-2">
                    <ArrowDown className="h-4 w-4" />
                    Débit
                  </div>
                </TableHead>
                <TableHead className="text-right font-bold text-indigo-600 dark:text-indigo-400">
                  <div className="flex items-center justify-end gap-2">
                    <ArrowUp className="h-4 w-4" />
                    Crédit
                  </div>
                </TableHead>
                <TableHead className="text-right font-bold text-indigo-600 dark:text-indigo-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!Array.isArray(mouvements) || mouvements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full p-6">
                        <Wallet className="h-12 w-12 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Aucun mouvement enregistré</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Commencez à ajouter vos premiers mouvements</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                mouvements.map((mouvement, index) => (
                  <TableRow 
                    key={mouvement.id}
                    className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 transition-all duration-300 border-b border-gray-100/50 dark:border-gray-700/50"
                  >
                    <TableCell data-label="Date">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full w-8 h-8 flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            {index + 1}
                          </span>
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {formatDate(mouvement.date)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell data-label="Description" className="font-medium text-gray-800 dark:text-gray-200">
                      {mouvement.description}
                    </TableCell>
                    <TableCell data-label="Catégorie">
                      <span className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 px-3 py-1 rounded-full text-purple-700 dark:text-purple-300 font-medium text-sm">
                        {mouvement.categorie}
                      </span>
                    </TableCell>
                    <TableCell data-label="Débit" className="text-right">
                      {mouvement.debit ? (
                        <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 px-3 py-1 rounded-full inline-block">
                          <ArrowDown className="inline mr-1 h-4 w-4 text-red-600 dark:text-red-400" />
                          <span className="font-bold text-red-700 dark:text-red-300">
                            {formatAmount(mouvement.debit)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell data-label="Crédit" className="text-right">
                      {mouvement.credit ? (
                        <div className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 px-3 py-1 rounded-full inline-block">
                          <ArrowUp className="inline mr-1 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-bold text-emerald-700 dark:text-emerald-300">
                            {formatAmount(mouvement.credit)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell data-label="Actions" className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 rounded-full"
                        onClick={() => handleEdit(mouvement)}
                      >
                        <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 rounded-full"
                        onClick={() => {
                          setDeleteId(mouvement.id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Dialogue d'ajout/modification de mouvement */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-white/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-2">
                {editMouvementId ? <Edit className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white" />}
              </div>
              {editMouvementId ? 'Modifier le mouvement' : 'Ajouter un mouvement'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 py-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-3">
                <Label htmlFor="categorie" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Catégorie</Label>
                <Select
                  value={newMouvement.categorie}
                  onValueChange={handleCategorieChange}
                  required
                >
                  <SelectTrigger id="categorie" className="bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chargeFixe">Charge Fixe</SelectItem>
                    <SelectItem value="Autres">Autres</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</Label>
                <Input
                  id="description"
                  value={newMouvement.description}
                  onChange={(e) => setNewMouvement({...newMouvement, description: e.target.value})}
                  required
                  className="bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3"
                  disabled={newMouvement.categorie === "chargeFixe"}
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="date" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newMouvement.date}
                  onChange={(e) => setNewMouvement({...newMouvement, date: e.target.value})}
                  required
                  className="bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="debit" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Débit (€)</Label>
                  <div className="relative">
                    <ArrowDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                    <Input
                      id="debit"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newMouvement.debit}
                      onChange={(e) => setNewMouvement({...newMouvement, debit: e.target.value, credit: ''})}
                      className="pl-10 bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3"
                      disabled={newMouvement.categorie === "chargeFixe" || !!newMouvement.credit}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="credit" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Crédit (€)</Label>
                  <div className="relative">
                    <ArrowUp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-500" />
                    <Input
                      id="credit"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newMouvement.credit}
                      onChange={(e) => setNewMouvement({...newMouvement, credit: e.target.value, debit: ''})}
                      className="pl-10 bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3"
                      disabled={newMouvement.categorie === "chargeFixe" || !!newMouvement.debit}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all duration-300 hover:scale-105"
              >
                {editMouvementId ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-white/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-full p-2">
                <Trash2 className="h-5 w-5 text-white" />
              </div>
              Confirmer la suppression
            </DialogTitle>
          </DialogHeader>
          <p className="py-6 text-gray-700 dark:text-gray-300">Êtes-vous sûr de vouloir supprimer ce mouvement ? Cette action est irréversible.</p>
          <DialogFooter className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl"
            >
              Annuler
            </Button>
            <Button 
              type="button" 
              onClick={handleDelete}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl transition-all duration-300 hover:scale-105"
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue des dépenses fixes */}
      <Dialog open={isFixeDialogOpen} onOpenChange={setIsFixeDialogOpen}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-white/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-2">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              Dépenses fixes mensuelles
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-3">
                <Label htmlFor="free" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Free (€)</Label>
                <div className="relative">
                  <ArrowDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  <Input
                    id="free"
                    type="number"
                    min="0"
                    step="0.01"
                    value={depensesFixe.free}
                    onChange={(e) => setDepensesFixe({...depensesFixe, free: e.target.value})}
                    className="pl-10 bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="internetZeop" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Internet Zeop (€)</Label>
                <div className="relative">
                  <ArrowDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  <Input
                    id="internetZeop"
                    type="number"
                    min="0"
                    step="0.01"
                    value={depensesFixe.internetZeop}
                    onChange={(e) => setDepensesFixe({...depensesFixe, internetZeop: e.target.value})}
                    className="pl-10 bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="assuranceVoiture" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Assurance Voiture (€)</Label>
                <div className="relative">
                  <ArrowDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  <Input
                    id="assuranceVoiture"
                    type="number"
                    min="0"
                    step="0.01"
                    value={depensesFixe.assuranceVoiture}
                    onChange={(e) => setDepensesFixe({...depensesFixe, assuranceVoiture: e.target.value})}
                    className="pl-10 bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="autreDepense" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Autre Dépense (€)</Label>
                <div className="relative">
                  <ArrowDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  <Input
                    id="autreDepense"
                    type="number"
                    min="0"
                    step="0.01"
                    value={depensesFixe.autreDepense}
                    onChange={(e) => setDepensesFixe({...depensesFixe, autreDepense: e.target.value})}
                    className="pl-10 bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="assuranceVie" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Assurance Vie (€)</Label>
                <div className="relative">
                  <ArrowDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  <Input
                    id="assuranceVie"
                    type="number"
                    min="0"
                    step="0.01"
                    value={depensesFixe.assuranceVie}
                    onChange={(e) => setDepensesFixe({...depensesFixe, assuranceVie: e.target.value})}
                    className="pl-10 bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFixeDialogOpen(false)}
              className="bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl"
            >
              Annuler
            </Button>
            <Button 
              type="button"
              onClick={handleUpdateDepensesFixe}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all duration-300 hover:scale-105"
            >
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepenseDuMois;
