
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { authService } from '@/service/api';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, RotateCcw, CreditCard, Save } from 'lucide-react';
import MonthlyResetHandler from './MonthlyResetHandler';
import { useIsMobile } from '@/hooks/use-mobile';

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
    salaire: '',
    loyer: '',
    creditVoiture: '',
    eau: '',
    electricite: '',
    internet: '',
    telephone: '',
    assurances: '',
  });
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Calcul du solde
  const solde = mouvements.reduce((total, m) => {
    return total + (parseFloat(m.credit) || 0) - (parseFloat(m.debit) || 0);
  }, 0);

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
      const token = authService.getToken();
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/depenses/mouvements`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMouvements(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des mouvements:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les mouvements",
        variant: "destructive",
      });
    }
  };

  // Récupération des dépenses fixes
  const fetchDepensesFixe = async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/depenses/fixe`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setDepensesFixe(response.data);
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
      const token = authService.getToken();
      
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
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/depenses/mouvements/${editMouvementId}`,
          newMouvement,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        toast({
          title: "Succès",
          description: "Mouvement mis à jour avec succès",
          className: "bg-app-green text-white",
        });
      } else {
        // Création d'un nouveau mouvement
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/depenses/mouvements`,
          newMouvement,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
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
      const token = authService.getToken();
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/depenses/mouvements/${deleteId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
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
      const token = authService.getToken();
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/depenses/fixe`,
        depensesFixe,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
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
      const token = authService.getToken();
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/depenses/reset`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
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
        <h2 className="text-2xl font-bold mb-4 sm:mb-0">Dépenses du mois</h2>
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
        <h3 className="text-lg font-semibold mb-2">Solde actuel</h3>
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
            {mouvements.length === 0 ? (
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
                    {mouvement.debit ? formatAmount(mouvement.debit) : '-'}
                  </TableCell>
                  <TableCell data-label="Crédit" className="text-right text-app-green">
                    {mouvement.credit ? formatAmount(mouvement.credit) : '-'}
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
            <DialogTitle>{editMouvementId ? 'Modifier le mouvement' : 'Ajouter un mouvement'}</DialogTitle>
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
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categorie">Catégorie</Label>
                <Select
                  value={newMouvement.categorie}
                  onValueChange={(value) => setNewMouvement({...newMouvement, categorie: value})}
                  required
                >
                  <SelectTrigger id="categorie">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alimentation">Alimentation</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Logement">Logement</SelectItem>
                    <SelectItem value="Loisirs">Loisirs</SelectItem>
                    <SelectItem value="Santé">Santé</SelectItem>
                    <SelectItem value="Éducation">Éducation</SelectItem>
                    <SelectItem value="Vêtements">Vêtements</SelectItem>
                    <SelectItem value="Salaire">Salaire</SelectItem>
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
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="debit">Débit (€)</Label>
                  <Input
                    id="debit"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newMouvement.debit}
                    onChange={(e) => setNewMouvement({...newMouvement, debit: e.target.value, credit: ''})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="credit">Crédit (€)</Label>
                  <Input
                    id="credit"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newMouvement.credit}
                    onChange={(e) => setNewMouvement({...newMouvement, credit: e.target.value, debit: ''})}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" className="bg-app-green text-white">
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
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p className="py-4">Êtes-vous sûr de vouloir supprimer ce mouvement ? Cette action est irréversible.</p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleDelete}
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
            <DialogTitle>Dépenses fixes mensuelles</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaire">Salaire (€)</Label>
                <Input
                  id="salaire"
                  type="number"
                  min="0"
                  step="0.01"
                  value={depensesFixe.salaire}
                  onChange={(e) => setDepensesFixe({...depensesFixe, salaire: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="loyer">Loyer (€)</Label>
                <Input
                  id="loyer"
                  type="number"
                  min="0"
                  step="0.01"
                  value={depensesFixe.loyer}
                  onChange={(e) => setDepensesFixe({...depensesFixe, loyer: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="creditVoiture">Crédit voiture (€)</Label>
                <Input
                  id="creditVoiture"
                  type="number"
                  min="0"
                  step="0.01"
                  value={depensesFixe.creditVoiture}
                  onChange={(e) => setDepensesFixe({...depensesFixe, creditVoiture: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="eau">Eau (€)</Label>
                <Input
                  id="eau"
                  type="number"
                  min="0"
                  step="0.01"
                  value={depensesFixe.eau}
                  onChange={(e) => setDepensesFixe({...depensesFixe, eau: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="electricite">Électricité (€)</Label>
                <Input
                  id="electricite"
                  type="number"
                  min="0"
                  step="0.01"
                  value={depensesFixe.electricite}
                  onChange={(e) => setDepensesFixe({...depensesFixe, electricite: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="internet">Internet (€)</Label>
                <Input
                  id="internet"
                  type="number"
                  min="0"
                  step="0.01"
                  value={depensesFixe.internet}
                  onChange={(e) => setDepensesFixe({...depensesFixe, internet: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone (€)</Label>
                <Input
                  id="telephone"
                  type="number"
                  min="0"
                  step="0.01"
                  value={depensesFixe.telephone}
                  onChange={(e) => setDepensesFixe({...depensesFixe, telephone: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assurances">Assurances (€)</Label>
                <Input
                  id="assurances"
                  type="number"
                  min="0"
                  step="0.01"
                  value={depensesFixe.assurances}
                  onChange={(e) => setDepensesFixe({...depensesFixe, assurances: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFixeDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              type="button"
              className="bg-app-green text-white"
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
