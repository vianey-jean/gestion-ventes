import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Search, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

interface PretProduit {
  id: string;
  nom: string;
  phone: string;
  date: string;
  description: string;
  prixVente: number;
  reste: number;
  dateProchaineVente: string | null;
  avanceRecue?: number;
  estPaye?: boolean;
  paiements?: { date: string; montant: number }[];
}

interface AdvancePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (totalAdvance: number) => void;
}

interface PretWithPayment {
  pret: PretProduit;
  payment: string;
  paymentDate: string;
}

const AdvancePaymentModal: React.FC<AdvancePaymentModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const { toast } = useToast();
  const [searchName, setSearchName] = useState('');
  const [searchResults, setSearchResults] = useState<PretProduit[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPrets, setSelectedPrets] = useState<PretWithPayment[]>([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

  // Recherche automatique après 3 caractères
  useEffect(() => {
    const searchPrets = async () => {
      if (searchName.length >= 3) {
        setIsSearching(true);
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${API_BASE_URL}/api/pretproduits`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const allPretProduits: PretProduit[] = response.data || [];
          const searchTerm = searchName.toLowerCase();

          const filteredPrets = allPretProduits.filter((pret) =>
            pret.nom &&
            pret.nom.toLowerCase().includes(searchTerm) &&
            pret.reste > 0
          );

          setSearchResults(filteredPrets);
        } catch (error) {
          console.error('Erreur lors de la recherche des prêts:', error);
          toast({
            title: 'Erreur',
            description: 'Erreur lors de la recherche des prêts',
            variant: 'destructive'
          });
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(searchPrets, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchName, API_BASE_URL, toast]);

  // Ajouter un prêt à la sélection
  const handleSelectPret = (pret: PretProduit) => {
    const alreadySelected = selectedPrets.find(sp => sp.pret.id === pret.id);
    if (!alreadySelected) {
      const today = new Date().toISOString().split('T')[0];
      setSelectedPrets(prev => [...prev, { pret, payment: '', paymentDate: today }]);
    }
  };

  // Retirer un prêt de la sélection
  const handleRemovePret = (pretId: string) => {
    setSelectedPrets(prev => prev.filter(sp => sp.pret.id !== pretId));
  };

  // Mettre à jour le paiement d'un prêt
  const handlePaymentChange = (pretId: string, payment: string) => {
    setSelectedPrets(prev => prev.map(sp =>
      sp.pret.id === pretId ? { ...sp, payment } : sp
    ));
  };

  // Mettre à jour la date de paiement d'un prêt
  const handlePaymentDateChange = (pretId: string, paymentDate: string) => {
    setSelectedPrets(prev => prev.map(sp =>
      sp.pret.id === pretId ? { ...sp, paymentDate } : sp
    ));
  };

  // Calculer le total des avances
  const getTotalAdvance = () => {
    return selectedPrets.reduce((sum, sp) => {
      const payment = parseFloat(sp.payment) || 0;
      return sum + payment;
    }, 0);
  };

  // Vérifier si le bouton valider doit être désactivé
  const isValidateDisabled = () => {
    if (selectedPrets.length === 0) return true;

    return selectedPrets.some(sp => {
      const payment = parseFloat(sp.payment) || 0;
      return payment <= 0 || payment > sp.pret.reste;
    });
  };

  // Valider et appliquer les avances
  const handleValidate = async () => {
    try {
      const token = localStorage.getItem('token');

      // Appliquer les paiements à chaque prêt
      for (const sp of selectedPrets) {
        const payment = parseFloat(sp.payment) || 0;
        const newReste = sp.pret.reste - payment;
        const paymentDate = sp.paymentDate || new Date().toISOString().split('T')[0];

        const existingPaiements = Array.isArray(sp.pret.paiements) ? sp.pret.paiements : [];
        const updatedPaiements = [
          ...existingPaiements,
          { date: paymentDate, montant: payment },
        ];

        const newAvanceRecue = (sp.pret.avanceRecue || 0) + payment;

        await axios.put(
          `${API_BASE_URL}/api/pretproduits/${sp.pret.id}`,
          {
            reste: newReste,
            avanceRecue: newAvanceRecue,
            estPaye: newReste === 0,
            paiements: updatedPaiements,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      const totalAdvance = getTotalAdvance();
      onConfirm(totalAdvance);

      toast({
        title: 'Succès',
        description: `Avances appliquées avec succès. Total: ${totalAdvance.toLocaleString('fr-FR')} €`,
        className: "notification-success",
      });

      // Réinitialiser
      setSearchName('');
      setSearchResults([]);
      setSelectedPrets([]);
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'application des avances:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'application des avances',
        variant: 'destructive'
      });
    }
  };

  // Réinitialiser lors de la fermeture
  const handleClose = () => {
    setSearchName('');
    setSearchResults([]);
    setSelectedPrets([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl border-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl shadow-2xl rounded-3xl max-h-[92vh] overflow-y-auto p-0">
        
        {/* HEADER */}
        <DialogHeader className="border-b border-border/50 px-8 py-6 bg-gradient-to-r from-primary/10 via-background to-primary/5">
          <DialogTitle className="text-3xl font-black tracking-tight bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
            Paiement des Avances
          </DialogTitle>

          <DialogDescription className="text-base text-muted-foreground mt-2">
            Recherchez un client et appliquez des avances sur ses prêts en quelques secondes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 px-8 py-8">

          {/* SEARCH */}
          <div className="space-y-3">
            <Label
              htmlFor="search-name"
              className="text-sm font-semibold tracking-wide"
            >
              Rechercher un client
            </Label>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />

              <Input
                id="search-name"
                type="text"
                placeholder="Tapez le nom du client..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="
                  pl-12 h-14 rounded-2xl border-border/50
                  bg-background/70 backdrop-blur-xl
                  shadow-sm hover:shadow-md
                  focus-visible:ring-2 focus-visible:ring-primary/40
                  transition-all duration-300 text-base
                "
              />
            </div>
          </div>

          {/* SEARCH RESULTS */}
          {searchName.length >= 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  Résultats trouvés
                </Label>

                <div className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {searchResults.length} prêt(s)
                </div>
              </div>

              {isSearching ? (
                <div className="py-10 text-center rounded-2xl border bg-muted/30 text-muted-foreground">
                  Recherche en cours...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-10 text-center rounded-2xl border bg-muted/30 text-muted-foreground">
                  Aucun prêt trouvé
                </div>
              ) : (
                <div className="grid gap-4 max-h-[320px] overflow-y-auto pr-2">
                  {searchResults.map(pret => {
                    const isSelected = selectedPrets.find(sp => sp.pret.id === pret.id);

                    return (
                      <Card
                        key={pret.id}
                        onClick={() => !isSelected && handleSelectPret(pret)}
                        className={`
                          group cursor-pointer rounded-3xl border transition-all duration-300
                          hover:shadow-2xl hover:-translate-y-1
                          bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl
                          ${isSelected
                            ? 'border-primary shadow-lg ring-2 ring-primary/20'
                            : 'border-border/50 hover:border-primary/40'}
                        `}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between gap-6">

                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                  {pret.nom.charAt(0)}
                                </div>

                                <div>
                                  <h3 className="font-bold text-lg">
                                    {pret.nom}
                                  </h3>

                                  <p className="text-sm text-muted-foreground">
                                    {pret.description}
                                  </p>
                                </div>
                              </div>

                              <div className="flex gap-6 text-sm text-muted-foreground pt-1">
                                <span>
                                  📅 {new Date(pret.date).toLocaleDateString('fr-FR')}
                                </span>

                                <span>
                                  💳 {pret.prixVente.toLocaleString('fr-FR')} €
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                                Reste
                              </p>

                              <p className="text-2xl font-black text-destructive">
                                {pret.reste.toLocaleString('fr-FR')} €
                              </p>
                            </div>

                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SELECTED PRETS */}
          {selectedPrets.length > 0 && (
            <div className="space-y-6">

              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  Prêts sélectionnés
                </Label>

                <div className="px-4 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-semibold">
                  {selectedPrets.length} sélectionné(s)
                </div>
              </div>

              <div className="grid gap-6">

                {selectedPrets.map((sp) => {
                  const payment = parseFloat(sp.payment) || 0;
                  const isPaymentValid = payment > 0 && payment <= sp.pret.reste;
                  const isPaymentExceeded = payment > sp.pret.reste;

                  return (
                    <Card
                      key={sp.pret.id}
                      className="
                        rounded-3xl overflow-hidden border-0
                        bg-gradient-to-br from-white to-zinc-50
                        dark:from-zinc-900 dark:to-zinc-950
                        shadow-xl
                      "
                    >
                      <CardHeader className="pb-4 border-b bg-muted/20">
                        <div className="flex justify-between items-start gap-4">

                          <div className="space-y-1">
                            <CardTitle className="text-xl font-bold">
                              {sp.pret.nom}
                            </CardTitle>

                            <p className="text-muted-foreground">
                              {sp.pret.description}
                            </p>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePret(sp.pret.id)}
                            className="
                              rounded-xl hover:bg-destructive/10
                              hover:text-destructive text-xl
                            "
                          >
                            ×
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-6 p-6">

                        <div className="grid md:grid-cols-2 gap-6">

                          {/* RESTE */}
                          <div className="rounded-2xl bg-destructive/5 border border-destructive/10 p-5">
                            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                              Reste à payer
                            </Label>

                            <p className="mt-2 text-3xl font-black text-destructive">
                              {sp.pret.reste.toLocaleString('fr-FR')} €
                            </p>
                          </div>

                          {/* PAYMENT */}
                          <div className="space-y-4">

                            <div>
                              <Label
                                htmlFor={`payment-${sp.pret.id}`}
                                className="text-xs uppercase tracking-widest"
                              >
                                Avance à ajouter
                              </Label>

                              <Input
                                id={`payment-${sp.pret.id}`}
                                type="number"
                                step="0.01"
                                min="0"
                                max={sp.pret.reste}
                                value={sp.payment}
                                onChange={(e) => handlePaymentChange(sp.pret.id, e.target.value)}
                                className={`
                                  mt-2 h-14 rounded-2xl text-lg font-semibold
                                  ${isPaymentExceeded
                                    ? 'border-destructive focus-visible:ring-destructive/40'
                                    : ''}
                                `}
                              />
                            </div>

                            <div>
                              <Label
                                htmlFor={`payment-date-${sp.pret.id}`}
                                className="text-xs uppercase tracking-widest"
                              >
                                Date de l'avance
                              </Label>

                              <Input
                                id={`payment-date-${sp.pret.id}`}
                                type="date"
                                value={sp.paymentDate}
                                onChange={(e) => handlePaymentDateChange(sp.pret.id, e.target.value)}
                                className="mt-2 h-14 rounded-2xl"
                              />
                            </div>

                          </div>
                        </div>

                        {/* ALERTS */}
                        {isPaymentExceeded && (
                          <div className="
                            flex items-center gap-3 rounded-2xl
                            border border-destructive/20
                            bg-destructive/5 p-4 text-destructive
                          ">
                            <AlertCircle className="h-5 w-5" />

                            <span className="font-medium">
                              L'avance ne peut pas dépasser le reste à payer
                            </span>
                          </div>
                        )}

                        {isPaymentValid && (
                          <div className="
                            flex items-center gap-3 rounded-2xl
                            border border-emerald-500/20
                            bg-emerald-500/5 p-4 text-emerald-600
                          ">
                            <CheckCircle className="h-5 w-5" />

                            <span className="font-semibold">
                              Nouveau reste :
                              {' '}
                              {(sp.pret.reste - payment).toLocaleString('fr-FR')} €
                            </span>
                          </div>
                        )}

                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* TOTAL */}
              <Card className="
                rounded-3xl border-0 overflow-hidden
                bg-gradient-to-r from-primary to-violet-600
                text-white shadow-2xl
              ">
                <CardContent className="p-8">
                  <div className="flex justify-between items-center">

                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-white/70">
                        Total des avances
                      </p>

                      <h2 className="text-4xl font-black mt-2">
                        {getTotalAdvance().toLocaleString('fr-FR')} €
                      </h2>
                    </div>

                    <div className="h-20 w-20 rounded-3xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-3xl">
                      💰
                    </div>

                  </div>
                </CardContent>
              </Card>

            </div>
          )}
        </div>

        {/* FOOTER */}
        <DialogFooter className="
          border-t border-border/50
          px-8 py-6 bg-muted/20
          flex-row gap-3
        ">
          <Button
            variant="outline"
            onClick={handleClose}
            className="
              h-12 px-8 rounded-2xl
              border-border/50
            "
          >
            Annuler
          </Button>

          <Button
            onClick={handleValidate}
            disabled={isValidateDisabled()}
            className="
              h-12 px-8 rounded-2xl
              bg-gradient-to-r from-primary to-violet-600
              hover:opacity-90 transition-all
              shadow-lg shadow-primary/30
              text-white font-semibold
            "
          >
            Valider les Avances
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};

export default AdvancePaymentModal;