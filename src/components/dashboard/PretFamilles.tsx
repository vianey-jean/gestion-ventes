
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

interface PretFamille {
  id: string;
  nom: string;
  pretTotal: number;
  soldeRestant: number;
  dernierRemboursement: number;
  dateRemboursement: string;
}

const PretFamilles: React.FC = () => {
  const [prets, setPrets] = useState<PretFamille[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<PretFamille[]>([]);
  const [selectedPret, setSelectedPret] = useState<PretFamille | null>(null);
  const [montantRemboursement, setMontantRemboursement] = useState('');
  const { toast } = useToast();

  // Simuler le chargement des données depuis le serveur
  useEffect(() => {
    const fetchPrets = async () => {
      try {
        setLoading(true);
        // Simulation - À remplacer par une vraie API call
        // const response = await axios.get('/api/prets-familles');
        // setPrets(response.data);
        
        // Données simulées pour démonstration
        const mockData: PretFamille[] = [
          { id: '1', nom: 'Famille Martin', pretTotal: 2000, soldeRestant: 1500, dernierRemboursement: 500, dateRemboursement: '2024-04-15' },
          { id: '2', nom: 'Famille Dupont', pretTotal: 1000, soldeRestant: 500, dernierRemboursement: 200, dateRemboursement: '2024-04-10' },
          { id: '3', nom: 'Famille Bernard', pretTotal: 3000, soldeRestant: 2000, dernierRemboursement: 1000, dateRemboursement: '2024-04-05' },
        ];
        setPrets(mockData);
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
  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.length >= 3) {
      const results = prets.filter(pret => 
        pret.nom.toLowerCase().includes(text.toLowerCase())
      );
      setSearchResults(results);
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
        pretTotal: soldRst,
        soldeRestant: pretReel,
        dernierRemboursement: dernierRem,
        dateRemboursement: new Date().toISOString().split('T')[0]
      };
      
      // Simulation - À remplacer par une vraie API call
      // await axios.put(`/api/prets-familles/${selectedPret.id}`, updatedPret);
      
      // Mettre à jour l'état local
      setPrets(prets.map(pret => 
        pret.id === selectedPret.id ? updatedPret : pret
      ));
      
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
      setDialogOpen(false);
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

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Prêts aux Familles</h2>
        <Button onClick={() => setDialogOpen(true)} className="bg-app-blue hover:bg-opacity-90">
          Remboursement
        </Button>
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
    </div>
  );
};

export default PretFamilles;
