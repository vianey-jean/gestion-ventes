
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DepenseMouvement {
  id: string;
  date: string;
  description: string;
  categorie: string;
  debit: number;
  credit: number;
  solde: number;
}

interface DepenseFixe {
  free: number;
  internetZeop: number;
  assuranceVoiture: number;
  autreDepense: number;
  assuranceVie: number;
  total: number;
}

// Catégories de dépenses/revenus
const categories = [
  { id: 'free', label: 'Free', isFixe: true },
  { id: 'internetZeop', label: 'Internet Zeop', isFixe: true },
  { id: 'assuranceVoiture', label: 'Assurance Voiture', isFixe: true },
  { id: 'autreDepense', label: 'Autre dépense', isFixe: true },
  { id: 'assuranceVie', label: 'Assurance de vie', isFixe: true },
  { id: 'courses', label: 'Courses', isFixe: false },
  { id: 'restaurant', label: 'Restaurant', isFixe: false },
  { id: 'loisirs', label: 'Loisirs', isFixe: false },
  { id: 'salaire', label: 'Salaire', isFixe: false },
  { id: 'autre', label: 'Autre', isFixe: false },
];

const DepenseDuMois: React.FC = () => {
  // États
  const [mouvements, setMouvements] = useState<DepenseMouvement[]>([]);
  const [depensesFixe, setDepensesFixe] = useState<DepenseFixe>({
    free: 19.99,
    internetZeop: 39.99,
    assuranceVoiture: 85,
    autreDepense: 45,
    assuranceVie: 120,
    total: 309.98
  });
  const [loading, setLoading] = useState(false);
  const [ajoutDialogOpen, setAjoutDialogOpen] = useState(false);
  const [depenseFixeDialogOpen, setDepenseFixeDialogOpen] = useState(false);
  
  // États du formulaire d'ajout
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');
  const [categorie, setCategorie] = useState('');
  const [debit, setDebit] = useState('');
  const [credit, setCredit] = useState('');
  
  // États du formulaire de dépenses fixes
  const [tempDepensesFixe, setTempDepensesFixe] = useState<DepenseFixe>(depensesFixe);
  
  const { toast } = useToast();
  
  // Mois actuel pour l'affichage
  const moisActuel = format(new Date(), 'MMMM yyyy', { locale: fr });

  // Simuler le chargement des données depuis le serveur
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulation - À remplacer par de vraies API calls
        // const reponseMovements = await axios.get('/api/depenses/mouvements');
        // const reponseFixe = await axios.get('/api/depenses/fixe');
        // setMouvements(reponseMovements.data);
        // setDepensesFixe(reponseFixe.data);
        
        // Données simulées pour démonstration
        const mockMouvements: DepenseMouvement[] = [
          { id: '1', date: '2023-04-05', description: 'Salaire', categorie: 'salaire', debit: 0, credit: 2000, solde: 2000 },
          { id: '2', date: '2023-04-10', description: 'Courses Leclerc', categorie: 'courses', debit: 150, credit: 0, solde: 1850 },
          { id: '3', date: '2023-04-15', description: 'Restaurant', categorie: 'restaurant', debit: 45, credit: 0, solde: 1805 },
          { id: '4', date: '2023-04-20', description: 'Free Mobile', categorie: 'free', debit: 19.99, credit: 0, solde: 1785.01 },
        ];
        setMouvements(mockMouvements);
      } catch (error) {
        console.error('Erreur lors du chargement des données', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les données',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Calculer les totaux
  const totalDebit = mouvements.reduce((sum, mvt) => sum + mvt.debit, 0);
  const totalCredit = mouvements.reduce((sum, mvt) => sum + mvt.credit, 0);
  const soldeCompte = mouvements.length > 0 ? mouvements[mouvements.length - 1].solde : 0;

  // Gestion du formulaire de dépense/crédit
  const handleCategorieChange = (value: string) => {
    setCategorie(value);
    
    // Si catégorie fixe, récupérer le montant
    const cat = categories.find(c => c.id === value);
    if (cat?.isFixe) {
      setDebit(depensesFixe[value as keyof DepenseFixe].toString());
      setCredit('');
    }
  };

  // Gestion de l'exclusivité débit/crédit
  const handleDebitChange = (value: string) => {
    setDebit(value);
    if (value) {
      setCredit('');
    }
  };

  const handleCreditChange = (value: string) => {
    setCredit(value);
    if (value) {
      setDebit('');
    }
  };

  // Enregistrer une nouvelle dépense/crédit
  const handleAjoutMouvement = async () => {
    if (!description) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir une description',
        variant: 'destructive',
      });
      return;
    }

    if (!categorie) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une catégorie',
        variant: 'destructive',
      });
      return;
    }

    if ((!debit || parseFloat(debit) <= 0) && (!credit || parseFloat(credit) <= 0)) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir un montant valide (débit ou crédit)',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const debitValue = parseFloat(debit) || 0;
      const creditValue = parseFloat(credit) || 0;
      
      // Calculer le nouveau solde
      const dernierSolde = mouvements.length > 0 ? mouvements[mouvements.length - 1].solde : 0;
      const nouveauSolde = dernierSolde + creditValue - debitValue;
      
      const nouveauMouvement: DepenseMouvement = {
        id: Date.now().toString(), // ID temporaire, sera remplacé par l'ID du serveur
        date: format(date, 'yyyy-MM-dd'),
        description,
        categorie,
        debit: debitValue,
        credit: creditValue,
        solde: nouveauSolde
      };
      
      // Simulation - À remplacer par une vraie API call
      // const response = await axios.post('/api/depenses/mouvements', nouveauMouvement);
      // const savedMouvement = response.data;
      
      // Mise à jour de l'état local
      setMouvements([...mouvements, nouveauMouvement]);
      
      toast({
        title: 'Succès',
        description: 'Mouvement enregistré avec succès',
        variant: 'default',
        className: 'notification-success',
      });
      
      // Réinitialiser le formulaire
      setDate(new Date());
      setDescription('');
      setCategorie('');
      setDebit('');
      setCredit('');
      setAjoutDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du mouvement', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le mouvement',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour les dépenses fixes
  const handleUpdateDepensesFixe = async () => {
    try {
      setLoading(true);
      
      // Calculer le total
      const total = tempDepensesFixe.free + 
                    tempDepensesFixe.internetZeop + 
                    tempDepensesFixe.assuranceVoiture + 
                    tempDepensesFixe.autreDepense + 
                    tempDepensesFixe.assuranceVie;
      
      const updatedDepensesFixe = {
        ...tempDepensesFixe,
        total
      };
      
      // Simulation - À remplacer par une vraie API call
      // await axios.put('/api/depenses/fixe', updatedDepensesFixe);
      
      // Mise à jour de l'état local
      setDepensesFixe(updatedDepensesFixe);
      
      toast({
        title: 'Succès',
        description: 'Dépenses fixes mises à jour avec succès',
        variant: 'default',
        className: 'notification-success',
      });
      
      setDepenseFixeDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des dépenses fixes', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour les dépenses fixes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour une valeur dans les dépenses fixes temporaires
  const handleDepenseFixeChange = (key: keyof DepenseFixe, value: string) => {
    setTempDepensesFixe(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0
    }));
  };

  return (
    <div className="mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold">Dépenses du mois</h2>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button onClick={() => setAjoutDialogOpen(true)} className="bg-app-green hover:bg-opacity-90">
            Ajout dépense/crédit
          </Button>
          <Button onClick={() => {
            setTempDepensesFixe(depensesFixe);
            setDepenseFixeDialogOpen(true);
          }} className="bg-app-blue hover:bg-opacity-90">
            Dépenses fixes du mois
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="text-xl font-semibold">
          Mois: <span className="text-app-purple capitalize">{moisActuel}</span>
        </div>
        <div className="text-xl font-semibold mt-2 sm:mt-0">
          Solde dans le compte: <span className={soldeCompte >= 0 ? 'text-app-green' : 'text-app-red'}>
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(soldeCompte)}
          </span>
        </div>
      </div>
      
      <Card className="mb-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Solde</h3>
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
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Débit (dépense)</TableHead>
                  <TableHead className="text-right">Crédit (revenu)</TableHead>
                  <TableHead className="text-right">Solde</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mouvements.map((mvt) => (
                  <TableRow key={mvt.id}>
                    <TableCell>{format(new Date(mvt.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="font-medium">{mvt.description}</TableCell>
                    <TableCell>
                      {categories.find(c => c.id === mvt.categorie)?.label || mvt.categorie}
                    </TableCell>
                    <TableCell className="text-right text-app-red">
                      {mvt.debit > 0 ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(mvt.debit) : '-'}
                    </TableCell>
                    <TableCell className="text-right text-app-green">
                      {mvt.credit > 0 ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(mvt.credit) : '-'}
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${mvt.solde >= 0 ? 'text-app-green' : 'text-app-red'}`}>
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(mvt.solde)}
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Ligne des totaux */}
                <TableRow className="font-bold">
                  <TableCell colSpan={3}>TOTAL</TableCell>
                  <TableCell className="text-right text-app-red">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalDebit)}
                  </TableCell>
                  <TableCell className="text-right text-app-green">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalCredit)}
                  </TableCell>
                  <TableCell className={`text-right ${soldeCompte >= 0 ? 'text-app-green' : 'text-app-red'}`}>
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(soldeCompte)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
      
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Dépenses fixes</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-right">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Free</TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(depensesFixe.free)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Internet Zeop</TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(depensesFixe.internetZeop)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Assurance voiture</TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(depensesFixe.assuranceVoiture)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Autre dépense</TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(depensesFixe.autreDepense)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Assurance de vie</TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(depensesFixe.assuranceVie)}
                </TableCell>
              </TableRow>
              <TableRow className="font-bold">
                <TableCell>TOTAL</TableCell>
                <TableCell className="text-right text-app-red">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(depensesFixe.total)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>
      
      {/* Formulaire d'ajout de dépense/crédit */}
      <Dialog open={ajoutDialogOpen} onOpenChange={setAjoutDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter une dépense ou un crédit</DialogTitle>
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
              <Input 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Description de la dépense ou du crédit"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="categorie">Catégorie</Label>
              <Select value={categorie} onValueChange={handleCategorieChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sélectionner...</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="debit">Débit (dépense)</Label>
              <Input 
                id="debit" 
                type="number" 
                value={debit} 
                onChange={(e) => handleDebitChange(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                disabled={!!credit}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="credit">Crédit (revenu)</Label>
              <Input 
                id="credit" 
                type="number" 
                value={credit} 
                onChange={(e) => handleCreditChange(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                disabled={!!debit}
              />
            </div>
            
            <Button 
              onClick={handleAjoutMouvement} 
              disabled={loading || !description || !categorie || ((!debit || parseFloat(debit) <= 0) && (!credit || parseFloat(credit) <= 0))}
              className="mt-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Formulaire de dépenses fixes */}
      <Dialog open={depenseFixeDialogOpen} onOpenChange={setDepenseFixeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Dépenses fixes du mois</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="free">Free</Label>
              <Input 
                id="free" 
                type="number" 
                value={tempDepensesFixe.free.toString()} 
                onChange={(e) => handleDepenseFixeChange('free', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="internetZeop">Internet Zeop</Label>
              <Input 
                id="internetZeop" 
                type="number" 
                value={tempDepensesFixe.internetZeop.toString()} 
                onChange={(e) => handleDepenseFixeChange('internetZeop', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="assuranceVoiture">Assurance voiture</Label>
              <Input 
                id="assuranceVoiture" 
                type="number" 
                value={tempDepensesFixe.assuranceVoiture.toString()} 
                onChange={(e) => handleDepenseFixeChange('assuranceVoiture', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="autreDepense">Autre dépense</Label>
              <Input 
                id="autreDepense" 
                type="number" 
                value={tempDepensesFixe.autreDepense.toString()} 
                onChange={(e) => handleDepenseFixeChange('autreDepense', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="assuranceVie">Assurance de vie</Label>
              <Input 
                id="assuranceVie" 
                type="number" 
                value={tempDepensesFixe.assuranceVie.toString()} 
                onChange={(e) => handleDepenseFixeChange('assuranceVie', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between">
                <p><strong>Total:</strong></p>
                <p className="text-app-red font-semibold">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
                    parseFloat(tempDepensesFixe.free.toString() || '0') +
                    parseFloat(tempDepensesFixe.internetZeop.toString() || '0') +
                    parseFloat(tempDepensesFixe.assuranceVoiture.toString() || '0') +
                    parseFloat(tempDepensesFixe.autreDepense.toString() || '0') +
                    parseFloat(tempDepensesFixe.assuranceVie.toString() || '0')
                  )}
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleUpdateDepensesFixe} 
              disabled={loading}
              className="mt-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Enregistrer les dépenses fixes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepenseDuMois;
