
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
import { PlusCircle, Edit, CalendarIcon, Loader2, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { Product, PretProduit } from '@/types';
import { pretProduitService } from '@/service/api';

const PretProduits: React.FC = () => {
  const [prets, setPrets] = useState<PretProduit[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ajoutAvanceDialogOpen, setAjoutAvanceDialogOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');
  const [nom, setNom] = useState('');
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
    setDate(new Date(pret.date));
    setDescription(pret.description);
    setNom(pret.nom || '');
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
        date: format(date, 'yyyy-MM-dd'),
        description,
        nom,
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
        date: selectedPret.date, // Conserver la date d'origine
        description: selectedPret.description,
        nom: selectedPret.nom,
        prixVente: selectedPret.prixVente,
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
    setDate(new Date());
    setDescription('');
    setNom('');
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
    <div className="mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Prêts de Produits</h2>
        <div className="flex items-center gap-4">
          <div className="text-lg font-semibold ">
            Total Reste: <span className="text-app-red">{formatCurrency(totalReste)}</span>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="bg-app-green hover:bg-opacity-90 card-3d">
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajout de Prêt
          </Button>
          <Button onClick={() => setSearchDialogOpen(true)} className="bg-app-blue hover:bg-opacity-90 card-3d">
            <Edit className="mr-2 h-4 w-4" />
            Modifier un Prêt
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-app-blue mr-2" />
              <p>Chargement des données...</p>
            </div>
          ) : (
            <Table className='card-3d'>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold text-red-600">Date</TableHead>
                  <TableHead className="font-bold text-red-600">Description</TableHead>
                  <TableHead className="font-bold text-red-600">Nom</TableHead>
                  <TableHead className="text-right font-bold text-red-600">Prix du produit vendu</TableHead>
                  <TableHead className="text-right font-bold text-red-600">Avance Reçue</TableHead>
                  <TableHead className="text-right font-bold text-red-600">Reste</TableHead>
                  <TableHead className="text-center font-bold text-red-600">Paiement</TableHead>
                  <TableHead className="text-center font-bold text-red-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prets.map((pret) => (
                  <TableRow key={pret.id} className="cursor-pointer" onClick={() => handleRowClick(pret)}>
                    <TableCell>{format(new Date(pret.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="font-medium">{pret.description}</TableCell>
                    <TableCell>{pret.nom || '-'}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(pret.prixVente)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(pret.avanceRecue)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(pret.reste)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${pret.estPaye ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {pret.estPaye ? 'Tout payé' : 'Reste à payer'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={(e) => selectPretForAjoutAvance(pret, e)} 
                          className="text-app-green hover:text-app-green/80"
                          title="Ajouter une avance"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={(e) => handleEditClick(pret, e)} 
                          className="text-app-blue hover:text-app-blue/80"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={(e) => selectPretForDelete(pret, e)} 
                          className="text-app-red hover:text-app-red/80"
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
          )}
        </div>
      </Card>
      
      {/* Formulaire d'ajout de prêt */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un prêt de produit</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PP', { locale: fr }) : <span>Sélectionner une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                    className={cn("p-3")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <div className="relative">
                <Input 
                  id="description" 
                  value={description} 
                  onChange={(e) => handleSearch(e.target.value)} 
                  placeholder="Saisir au moins 3 caractères pour rechercher"
                />
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1">
                    {searchResults.map((product) => (
                      <div 
                        key={product.id} 
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectProduct(product)}
                      >
                        {product.description} (Prix: {formatCurrency(product.purchasePrice)})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="nom">Nom</Label>
              <Input 
                id="nom" 
                value={nom} 
                onChange={(e) => setNom(e.target.value)}
                placeholder="Nom de l'acheteur"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="prixVente">Prix du produit vendu</Label>
              <Input 
                id="prixVente" 
                type="number" 
                value={prixVente} 
                onChange={(e) => setPrixVente(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="avanceRecue">Avance reçue</Label>
              <Input 
                id="avanceRecue" 
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
                <p className={reste > 0 ? 'text-app-red font-semibold' : 'text-app-green font-semibold'}>
                  {formatCurrency(reste)}
                </p>
              </div>
              <div className="flex justify-between mt-1">
                <p><strong>Statut:</strong></p>
                <p className={estPaye ? 'text-app-green font-semibold' : 'text-app-red font-semibold'}>
                  {estPaye ? 'Tout payé' : 'Reste à payer'}
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !description || !prixVente || parseFloat(prixVente) <= 0}
              className="mt-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Enregistrer le prêt
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
      
      {/* Formulaire de modification de prêt */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier un prêt</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editDate">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                    disabled
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PP', { locale: fr }) : <span>Sélectionner une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                    disabled
                    className={cn("p-3")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="editDescription">Description</Label>
              <Input 
                id="editDescription" 
                value={description} 
                disabled
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="editNom">Nom</Label>
              <Input 
                id="editNom" 
                value={nom} 
                disabled
              />
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
                <p className={reste > 0 ? 'text-app-red font-semibold' : 'text-app-green font-semibold'}>
                  {formatCurrency(reste)}
                </p>
              </div>
              <div className="flex justify-between mt-1">
                <p><strong>Statut:</strong></p>
                <p className={estPaye ? 'text-app-green font-semibold' : 'text-app-red font-semibold'}>
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
