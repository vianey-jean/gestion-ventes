
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
import { pretFamilleService } from '@/service/api';
import { PretFamille } from '@/types';

const PretFamilles: React.FC = () => {
  const [prets, setPrets] = useState<PretFamille[]>([]);
  const [loading, setLoading] = useState(false);
  const [remboursementDialogOpen, setRemboursementDialogOpen] = useState(false);
  const [demandePretDialogOpen, setDemandePretDialogOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<PretFamille[]>([]);
  const [selectedPret, setSelectedPret] = useState<PretFamille | null>(null);
  const [montantRemboursement, setMontantRemboursement] = useState('');
  
  // États pour demande de prêt
  const [nouvNom, setNouvNom] = useState('');
  const [nouvPretTotal, setNouvPretTotal] = useState('');
  const [nouvDate, setNouvDate] = useState<Date>(new Date());
  
  const { toast } = useToast();

  // Charger les données depuis l'API
  useEffect(() => {
    const fetchPrets = async () => {
      try {
        setLoading(true);
        const data = await pretFamilleService.getPretFamilles();
        setPrets(data);
      } catch (error) {
        console.error('Erreur lors du chargement des prêts', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les prêts familles',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPrets();
  }, [toast]);

  // Calculer les totaux
  const totalPret = prets.reduce((sum, pret) => sum + pret.pretTotal, 0);
  const totalSolde = prets.reduce((sum, pret) => sum + pret.soldeRestant, 0);

  // Recherche des familles par nom
  const handleSearch = async (text: string) => {
    setSearchText(text);
    if (text.length >= 3) {
      try {
        const results = await pretFamilleService.searchByName(text);
        setSearchResults(results);
      } catch (error) {
        console.error('Erreur lors de la recherche', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Sélectionner une famille dans les résultats de recherche
  const selectFamille = (pret: PretFamille) => {
    setSelectedPret(pret);
    setSearchText(pret.nom);
    setSearchResults([]);
  };

  // Enregistrer le remboursement
  const handleRemboursement = async () => {
    if (!selectedPret) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une famille',
        variant: 'destructive',
      });
      return;
    }

    if (!montantRemboursement || parseFloat(montantRemboursement) <= 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir un montant de remboursement valide',
        variant: 'destructive',
      });
      return;
    }

    const montant = parseFloat(montantRemboursement);
    
    if (montant > selectedPret.soldeRestant) {
      toast({
        title: 'Erreur',
        description: 'Le montant de remboursement ne peut pas être supérieur au solde restant',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Calculer les nouvelles valeurs
      const dernierRem = montant;
      const soldRst = selectedPret.soldeRestant;
      const pretReel = soldRst - dernierRem;
      
      // Créer l'objet mis à jour
      const updatedPret: PretFamille = {
        ...selectedPret,
        soldeRestant: pretReel,
        dernierRemboursement: dernierRem,
        dateRemboursement: new Date().toISOString().split('T')[0]
      };
      
      // Mettre à jour via l'API
      await pretFamilleService.updatePretFamille(selectedPret.id, updatedPret);
      
      // Recharger les données
      const updatedPrets = await pretFamilleService.getPretFamilles();
      setPrets(updatedPrets);
      
      toast({
        title: 'Succès',
        description: 'Remboursement enregistré avec succès',
        variant: 'default',
        className: 'notification-success',
      });
      
      // Réinitialiser le formulaire
      setSelectedPret(null);
      setSearchText('');
      setMontantRemboursement('');
      setRemboursementDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du remboursement', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le remboursement',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Enregistrer une nouvelle demande de prêt
  const handleDemandePret = async () => {
    if (!nouvNom) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir un nom',
        variant: 'destructive',
      });
      return;
    }

    if (!nouvPretTotal || parseFloat(nouvPretTotal) <= 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir un montant de prêt valide',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const newPret: Omit<PretFamille, 'id'> = {
        nom: nouvNom,
        pretTotal: parseFloat(nouvPretTotal),
        soldeRestant: parseFloat(nouvPretTotal),
        dernierRemboursement: 0,
        dateRemboursement: format(nouvDate, 'yyyy-MM-dd')
      };
      
      // Enregistrer via l'API
      await pretFamilleService.addPretFamille(newPret);
      
      // Recharger les données
      const updatedPrets = await pretFamilleService.getPretFamilles();
      setPrets(updatedPrets);
      
      toast({
        title: 'Succès',
        description: 'Demande de prêt enregistrée avec succès',
        variant: 'default',
        className: 'notification-success',
      });
      
      // Réinitialiser le formulaire
      setNouvNom('');
      setNouvPretTotal('');
      setNouvDate(new Date());
      setDemandePretDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la demande de prêt', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer la demande de prêt',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Prêts aux Familles</h2>
        <div className="flex gap-2">
          <Button onClick={() => setRemboursementDialogOpen(true)} className="bg-app-blue hover:bg-opacity-90">
            Remboursement
          </Button>
          <Button onClick={() => setDemandePretDialogOpen(true)} className="bg-app-green hover:bg-opacity-90">
            Demande Prêt
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
                  <TableHead>Nom</TableHead>
                  <TableHead className="text-right">Prêt Total</TableHead>
                  <TableHead className="text-right">Solde Restant</TableHead>
                  <TableHead className="text-right">Dernier Remboursement</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prets.map((pret) => (
                  <TableRow key={pret.id}>
                    <TableCell className="font-medium">{pret.nom}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(pret.pretTotal)}
                    </TableCell>
                    <TableCell className="text-right text-app-red font-semibold">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(pret.soldeRestant)}
                    </TableCell>
                    <TableCell className="text-right text-app-green">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(pret.dernierRemboursement)}
                    </TableCell>
                    <TableCell className="text-right">{pret.dateRemboursement}</TableCell>
                  </TableRow>
                ))}
                
                {/* Ligne des totaux */}
                <TableRow className="font-bold">
                  <TableCell>TOTAL</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalPret)}
                  </TableCell>
                  <TableCell className="text-right text-app-red">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalSolde)}
                  </TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
      
      {/* Formulaire de remboursement */}
      <Dialog open={remboursementDialogOpen} onOpenChange={setRemboursementDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Enregistrer un remboursement</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nom">Nom de la famille</Label>
              <div className="relative">
                <Input 
                  id="nom" 
                  value={searchText} 
                  onChange={(e) => handleSearch(e.target.value)} 
                  placeholder="Saisir au moins 3 caractères"
                />
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1">
                    {searchResults.map((result) => (
                      <div 
                        key={result.id} 
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectFamille(result)}
                      >
                        {result.nom} (Solde: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(result.soldeRestant)})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="montant">Montant du remboursement</Label>
              <Input 
                id="montant" 
                type="number" 
                value={montantRemboursement} 
                onChange={(e) => setMontantRemboursement(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            
            {selectedPret && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p><strong>Solde actuel:</strong> {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(selectedPret.soldeRestant)}</p>
                {montantRemboursement && !isNaN(parseFloat(montantRemboursement)) && (
                  <p><strong>Nouveau solde:</strong> {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(selectedPret.soldeRestant - parseFloat(montantRemboursement))}</p>
                )}
              </div>
            )}
            
            <Button 
              onClick={handleRemboursement} 
              disabled={loading || !selectedPret || !montantRemboursement || parseFloat(montantRemboursement) <= 0}
              className="mt-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Enregistrer le remboursement
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Formulaire de demande de prêt */}
      <Dialog open={demandePretDialogOpen} onOpenChange={setDemandePretDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Enregistrer une demande de prêt</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nouvNom">Nom de la famille</Label>
              <Input 
                id="nouvNom" 
                value={nouvNom} 
                onChange={(e) => setNouvNom(e.target.value)}
                placeholder="Nom de la famille"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="nouvPretTotal">Montant du prêt</Label>
              <Input 
                id="nouvPretTotal" 
                type="number" 
                value={nouvPretTotal} 
                onChange={(e) => setNouvPretTotal(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="nouvDate">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !nouvDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {nouvDate ? format(nouvDate, 'PP', { locale: fr }) : <span>Sélectionner une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={nouvDate}
                    onSelect={(date) => date && setNouvDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <Button 
              onClick={handleDemandePret} 
              disabled={loading || !nouvNom || !nouvPretTotal || parseFloat(nouvPretTotal) <= 0}
              className="mt-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Enregistrer la demande de prêt
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PretFamilles;
