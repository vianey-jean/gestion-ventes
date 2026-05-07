/**
 * PreparationLivraisonButton
 * - Affiche un bouton "Livraison" si au moins une commande/réservation du jour est
 *   en statut "en_attente" ou "reporter".
 * - Au clic: ouvre une modale listant ces livraisons du jour avec:
 *   - case oui/non "préparation terminée"
 *   - icône oeil pour voir le détail (client, produit, adresse, téléphone)
 *   - rayé en vert + "Fini" si terminé, sinon "En cours"
 * - Synchronise tous les statuts persistables (en_attente, valide, annule, reporter)
 *   dans la base prepa-livraison.json via /api/prepa-livraison.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Truck, Eye, MapPin, Phone, Package, User, X } from 'lucide-react';
import { Commande } from '@/types/commande';
import { prepaLivraisonApi, PrepaLivraisonEntry } from '@/services/api/prepaLivraisonApi';
import { toast } from 'sonner';

interface Props {
  filteredCommandes: Commande[];
}

const PERSIST_STATUTS = ['en_attente', 'valide', 'annule', 'reporter'];
const VISIBLE_STATUTS = ['en_attente', 'reporter'];

const isToday = (dateStr?: string | null) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const t = new Date();
  return d.getFullYear() === t.getFullYear() &&
         d.getMonth() === t.getMonth() &&
         d.getDate() === t.getDate();
};

const getRelevantDate = (c: Commande) =>
  c.type === 'commande' ? c.dateArrivagePrevue : c.dateEcheance;

const PreparationLivraisonButton: React.FC<Props> = ({ filteredCommandes }) => {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<PrepaLivraisonEntry[]>([]);
  const [detail, setDetail] = useState<PrepaLivraisonEntry | null>(null);
  const [loading, setLoading] = useState(false);

  // Commandes/réservations du jour à persister (tout sauf en_route/arrive)
  const todayPersistable = useMemo(
    () => filteredCommandes.filter(c => isToday(getRelevantDate(c)) && PERSIST_STATUTS.includes(c.statut)),
    [filteredCommandes]
  );

  // Bouton visible si au moins une livraison en_attente/reporter aujourd'hui
  const hasVisibleToday = useMemo(
    () => filteredCommandes.some(c => isToday(getRelevantDate(c)) && VISIBLE_STATUTS.includes(c.statut)),
    [filteredCommandes]
  );

  // Sync silencieux dès que la liste pertinente change
  useEffect(() => {
    if (todayPersistable.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await prepaLivraisonApi.sync(todayPersistable);
        if (!cancelled) setEntries(data);
      } catch (e) {
        // silencieux
      }
    })();
    return () => { cancelled = true; };
  }, [todayPersistable]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      // On synchronise puis on récupère
      const data = todayPersistable.length > 0
        ? await prepaLivraisonApi.sync(todayPersistable)
        : await prepaLivraisonApi.getAll();
      setEntries(data);
    } catch (e) {
      toast.error('Erreur de chargement préparation livraison');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async () => {
    setOpen(true);
    await loadEntries();
  };

  const visibleEntries = useMemo(() => {
    const todayIds = new Set(todayPersistable.map(c => c.id));
    return entries
      .filter(e => todayIds.has(e.id) && VISIBLE_STATUTS.includes(e.statut))
      .sort((a, b) => (a.horaire || '').localeCompare(b.horaire || ''));
  }, [entries, todayPersistable]);

  const handleToggleTermine = async (entry: PrepaLivraisonEntry, value: boolean) => {
    setEntries(prev => prev.map(e => e.id === entry.id
      ? { ...e, termine: value, statutLivraison: value ? 'fini' : 'en_cours' }
      : e));
    try {
      await prepaLivraisonApi.setTermine(entry.id, value);
    } catch {
      toast.error('Erreur lors de la mise à jour');
      // revert
      setEntries(prev => prev.map(e => e.id === entry.id
        ? { ...e, termine: !value, statutLivraison: !value ? 'fini' : 'en_cours' }
        : e));
    }
  };

  if (!hasVisibleToday) return null;

  return (
    <>
      <Button
        onClick={handleOpen}
        className="group relative overflow-hidden bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 hover:from-rose-600 hover:via-red-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-xl px-3 sm:px-4 py-2 h-auto"
      >
        <div className="relative flex items-center gap-2">
          <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-white/20 backdrop-blur-sm">
            <Truck className="h-4 w-4" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] opacity-80 leading-none">Préparation</span>
            <span className="font-bold text-sm leading-tight">Livraison</span>
          </div>
        </div>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-white via-rose-50/30 to-orange-50/30 dark:from-gray-900 dark:via-rose-950/20 dark:to-orange-950/20 border-rose-200/50 dark:border-rose-800/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-lg">
                <Truck className="h-5 w-5" />
              </div>
              <span className="bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent font-bold">
                Préparation de Livraison
              </span>
            </DialogTitle>
          </DialogHeader>

          {loading && (
            <div className="text-center py-6 text-sm text-muted-foreground">Chargement...</div>
          )}

          <ScrollArea className="max-h-[60vh] pr-3">
            <div className="space-y-3">
              {visibleEntries.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune livraison à préparer aujourd'hui
                </div>
              )}

              {visibleEntries.map((entry) => {
                const fini = entry.termine;
                return (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-xl border shadow-sm transition-all duration-200 ${
                      fini
                        ? 'bg-green-50/70 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                        : 'bg-white/70 dark:bg-gray-800/50 border-rose-100 dark:border-rose-800/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Checkbox
                          checked={fini}
                          onCheckedChange={(v) => handleToggleTermine(entry, !!v)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className={`font-bold ${fini ? 'line-through text-green-700 dark:text-green-400' : 'text-foreground'}`}>
                            {entry.clientNom}
                          </div>
                          <div className={`text-xs ${fini ? 'line-through text-green-600/70' : 'text-muted-foreground'}`}>
                            {entry.horaire ? `${entry.horaire}${entry.horaireFin ? ' - ' + entry.horaireFin : ''}` : 'Sans horaire'}
                            {' • '}
                            {entry.type === 'commande' ? 'Commande' : 'Réservation'}
                            {' • '}
                            {entry.produits?.length || 0} article(s)
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {fini ? (
                          <Badge className="bg-green-600 text-white">Fini</Badge>
                        ) : (
                          <Badge className="bg-amber-500 text-white">En cours</Badge>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDetail(entry)}
                          className="h-8 w-8 p-0 hover:bg-rose-100 dark:hover:bg-rose-900/30"
                          title="Voir détail"
                        >
                          <Eye className="h-4 w-4 text-rose-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Détail */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg bg-gradient-to-br from-white via-rose-50/30 to-orange-50/30 dark:from-gray-900 dark:via-rose-950/20 dark:to-orange-950/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5 text-rose-600" />
              Détail de la livraison
            </DialogTitle>
          </DialogHeader>

          {detail && (
            <div className="space-y-4 text-sm">
              <div className="p-3 rounded-lg bg-white/70 dark:bg-gray-800/50 border border-rose-100 dark:border-rose-800/30 space-y-2">
                <div className="font-bold flex items-center gap-2 text-foreground">
                  <User className="h-4 w-4 text-rose-600" /> Client
                </div>
                <div className="pl-6 text-foreground font-medium">{detail.clientNom}</div>
                <div className="pl-6 flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3 w-3" /> {detail.clientPhone || '—'}
                </div>
                <div className="pl-6 flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-3 w-3 mt-0.5" /> {detail.clientAddress || '—'}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white/70 dark:bg-gray-800/50 border border-rose-100 dark:border-rose-800/30 space-y-2">
                <div className="font-bold flex items-center gap-2 text-foreground">
                  <Package className="h-4 w-4 text-rose-600" /> Produits
                </div>
                <div className="pl-6 space-y-1">
                  {(detail.produits || []).map((p, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{p.nom} <span className="text-red-600 font-bold">x{p.quantite}</span></span>
                      <span className="font-semibold">{p.prixVente}€</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Statut: <strong className={detail.termine ? 'text-green-600' : 'text-amber-600'}>{detail.termine ? 'Fini' : 'En cours'}</strong></span>
                <span>{detail.horaire || ''}{detail.horaireFin ? ' - ' + detail.horaireFin : ''}</span>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setDetail(null)}>
                  <X className="h-4 w-4 mr-1" /> Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PreparationLivraisonButton;
