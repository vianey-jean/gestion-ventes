
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { Product, PretProduit } from '@/types';
import { pretProduitService } from '@/service/api';

const PretProduits: React.FC = () => {
  const [prets, setPrets] = useState<PretProduit[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');
  const [prixVente, setPrixVente] = useState('');
  const [avanceRecue, setAvanceRecue] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { products, searchProducts } = useApp();
  const { toast } = useToast();

  // Calculer reste automatiquement
  const reste = React.useMemo(() => {
    const prix = parseFloat(prixVente) || 0;
    const avance = parseFloat(avanceRecue) || 0;
    return prix - avance;
  }, [prixVente, avanceRecue]);

  // État du paiement
  const estPaye = reste <= 0;

  // Charger les données depuis l'API
  useEffect(() => {
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

  // Sélectionner un produit dans les résultats de recherche
  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setDescription(product.description);
    setPrixVente(product.purchasePrice.toString());
    setSearchResults([]);
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
        prixVente: parseFloat(prixVente),
        avanceRecue: parseFloat(avanceRecue) || 0,
        reste,
        estPaye,
        productId: selectedProduct?.id
      };
      
      // Enregistrer via l'API
      await pretProduitService.addPretProduit(newPret);
      
      // Recharger les données
      const updatedPrets = await pretProduitService.getPretProduits();
      setPrets(updatedPrets);
      
      toast({
        title: 'Succès',
        description: 'Prêt enregistré avec succès',
        variant: 'default',
        className: 'notification-success',
      });
      
      // Réinitialiser le formulaire
      setDate(new Date());
      setDescription('');
      setPrixVente('');
      setAvanceRecue('');
      setSelectedProduct(null);
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

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Prêts de Produits</h2>
        <div className="flex items-center gap-4">
          <div className="text-lg font-semibold">
            Total Reste: <span className="text-app-red">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalReste)}</span>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="bg-app-green hover:bg-opacity-90">
            Ajout de Prêt
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Prix du produit vendu</TableHead>
                  <TableHead className="text-right">Avance Reçue</TableHead>
                  <TableHead className="text-right">Reste</TableHead>
                  <TableHead className="text-center">Paiement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prets.map((pret) => (
                  <TableRow key={pret.id}>
                    <TableCell>{format(new Date(pret.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="font-medium">{pret.description}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(pret.prixVente)}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(pret.avanceRecue)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(pret.reste)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${pret.estPaye ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {pret.estPaye ? 'Tout payé' : 'Reste à payer'}
                      </span>
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
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
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
                        {product.description} (Prix: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(product.purchasePrice)})
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(reste)}
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
    </div>
  );
};

export default PretProduits;
