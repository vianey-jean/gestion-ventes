import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, RotateCcw, CreditCard, Save, Wallet, ArrowUp, ArrowDown, DollarSign } from 'lucide-react';
import MonthlyResetHandler from './MonthlyResetHandler';
import { useIsMobile } from '@/hooks/use-mobile';
import { depenseService } from '@/service/api';

const DepenseDuMois = () => {

   // Noms des mois en français
 const monthNames = [
  'JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
  'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'
];

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
      setDepensesFixe(depensesFixeData || {
        free: '',
        internetZeop: '',
        assuranceVoiture: '',
        autreDepense: '',
        assuranceVie: '',
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
      
      if (editMouvementId) {
        // Mise à jour d'un mouvement existant
        await depenseService.updateMouvement(editMouvementId, newMouvement);
        
        toast({
          title: "Succès",
          description: "Mouvement mis à jour avec succès",
          className: "bg-app-green text-white",
        });
      } else {
        // Création d'un nouveau mouvement
        await depenseService.addMouvement(newMouvement);
        
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
      await depenseService.updateDepensesFixe(depensesFixe);
      
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

  return (
    <div className="space-y-6">
      <MonthlyResetHandler />
      
      {/* En-tête avec titre et boutons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h2 className="text-2xl font-bold mb-4 sm:mb-0">
          <Wallet className="inline-block mr-2 h-6 w-6" />
          Dépenses du mois
        </h2>
        <h2 className="text-xl font-bold text-app-red mr-4">
              {monthNames[currentMonth]} {currentYear}
          </h2>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            className="btn-3d" 
            onClick={() => setIsFixeDialogOpen(true)}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Dépenses fixes
          </Button>
          <Button 
            className="btn-3d bg-app-green text-white" 
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
            variant="outline" 
            className="btn-3d border-app-red text-app-red" 
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        </div>
      </div>
      
      {/* Affichage du solde */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6 card-3d">
        <h3 className="text-lg font-semibold mb-2">
          <DollarSign className="inline-block mr-2 h-5 w-5" />
          Solde actuel
        </h3>
        <p className={`text-2xl font-bold ${solde >= 0 ? 'text-app-green' : 'text-app-red'}`}>
          {formatAmount(solde)}
        </p>
      </div>
      
      {/* Tableau des mouvements */}
      <div className="table-responsive">
        <Table className={isMobile ? "table-responsive-stack" : ""}>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead className="text-right">Débit</TableHead>
              <TableHead className="text-right">Crédit</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!Array.isArray(mouvements) || mouvements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                  Aucun mouvement enregistré
                </TableCell>
              </TableRow>
            ) : (
              mouvements.map((mouvement) => (
                <TableRow key={mouvement.id}>
                  <TableCell data-label="Date">{formatDate(mouvement.date)}</TableCell>
                  <TableCell data-label="Description">{mouvement.description}</TableCell>
                  <TableCell data-label="Catégorie">{mouvement.categorie}</TableCell>
                  <TableCell data-label="Débit" className="text-right text-app-red">
                    {mouvement.debit ? (
                      <><ArrowDown className="inline mr-1 h-4 w-4" />{formatAmount(mouvement.debit)}</>
                    ) : '-'}
                  </TableCell>
                  <TableCell data-label="Crédit" className="text-right text-app-green">
                    {mouvement.credit ? (
                      <><ArrowUp className="inline mr-1 h-4 w-4" />{formatAmount(mouvement.credit)}</>
                    ) : '-'}
                  </TableCell>
                  <TableCell data-label="Actions" className="text-right space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="btn-3d"
                      onClick={() => handleEdit(mouvement)}
                    >
                      <Edit className="h-4 w-4 text-app-blue" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="btn-3d"
                      onClick={() => {
                        setDeleteId(mouvement.id);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-app-red" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Dialogue d'ajout/modification de mouvement */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editMouvementId ? 
                <><Edit className="inline mr-2 h-5 w-5" />Modifier le mouvement</> : 
                <><Plus className="inline mr-2 h-5 w-5" />Ajouter un mouvement</>
              }
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newMouvement.description}
                  onChange={(e) => setNewMouvement({...newMouvement, description: e.target.value})}
                  required
                  className="btn-3d"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categorie">Catégorie</Label>
                <Select
                  value={newMouvement.categorie}
                  onValueChange={(value) => setNewMouvement({...newMouvement, categorie: value})}
                  required
                >
                  <SelectTrigger id="categorie" className="btn-3d">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chargeFixe">Charge Fixe</SelectItem>
                    <SelectItem value="Autres">Autres</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newMouvement.date}
                  onChange={(e) => setNewMouvement({...newMouvement, date: e.target.value})}
                  required
                  className="btn-3d"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="debit">Débit (€)</Label>
                  <div className="relative">
                    <ArrowDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-app-red" />
                    <Input
                      id="debit"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newMouvement.debit}
                      onChange={(e) => setNewMouvement({...newMouvement, debit: e.target.value, credit: ''})}
                      className="pl-8 btn-3d"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="credit">Crédit (€)</Label>
                  <div className="relative">
                    <ArrowUp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-app-green" />
                    <Input
                      id="credit"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newMouvement.credit}
                      onChange={(e) => setNewMouvement({...newMouvement, credit: e.target.value, debit: ''})}
                      className="pl-8 btn-3d"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="btn-3d"
              >
                Annuler
              </Button>
              <Button type="submit" className="bg-app-green text-white btn-3d">
                {editMouvementId ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle><Trash2 className="inline mr-2 h-5 w-5 text-app-red" />Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p className="py-4">Êtes-vous sûr de vouloir supprimer ce mouvement ? Cette action est irréversible.</p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="btn-3d"
            >
              Annuler
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleDelete}
              className="btn-3d"
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue des dépenses fixes */}
      <Dialog open={isFixeDialogOpen} onOpenChange={setIsFixeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle><CreditCard className="inline mr-2 h-5 w-5" />Dépenses fixes mensuelles</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
                       
              <div className="space-y-2">
                <Label htmlFor="free">Free (€)</Label>
                <div className="relative">
                  <ArrowDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-app-red" />
                  <Input
                    id="free"
                    type="number"
                    min="0"
                    step="0.01"
                    value={depensesFixe.free}
                    onChange={(e) => setDepensesFixe({...depensesFixe, free: e.target.value})}
                    className="pl-8 btn-3d"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="internetZeop">internet Zeop (€)</Label>
                <div className="relative">
                  <ArrowDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-app-red" />
                  <Input
                    id="internetZeop"
                    type="number"
                    min="0"
                    step="0.01"
                    value={depensesFixe.internetZeop}
                    onChange={(e) => setDepensesFixe({...depensesFixe, internetZeop: e.target.value})}
                    className="pl-8 btn-3d"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assuranceVoiture">Assurance Voiture (€)</Label>
                <div className="relative">
                  <ArrowDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-app-red" />
                  <Input
                    id="assuranceVoiture"
                    type="number"
                    min="0"
                    step="0.01"
                    value={depensesFixe.assuranceVoiture}
                    onChange={(e) => setDepensesFixe({...depensesFixe, assuranceVoiture: e.target.value})}
                    className="pl-8 btn-3d"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="autreDepense">Autre Depense (€)</Label>
                <div className="relative">
                  <ArrowDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-app-red" />
                  <Input
                    id="autreDepense"
                    type="number"
                    min="0"
                    step="0.01"
                    value={depensesFixe.autreDepense}
                    onChange={(e) => setDepensesFixe({...depensesFixe, autreDepense: e.target.value})}
                    className="pl-8 btn-3d"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assuranceVie">Assurance Vie (€)</Label>
                <div className="relative">
                  <ArrowDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-app-red" />
                  <Input
                    id="assuranceVie"
                    type="number"
                    min="0"
                    step="0.01"
                    value={depensesFixe.assuranceVie}
                    onChange={(e) => setDepensesFixe({...depensesFixe, assuranceVie: e.target.value})}
                    className="pl-8 btn-3d"
                  />
                </div>
              </div>

            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFixeDialogOpen(false)}
              className="btn-3d"
            >
              Annuler
            </Button>
            <Button 
              type="button"
              className="bg-app-green text-white btn-3d"
              onClick={handleUpdateDepensesFixe}
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
