/**
 * ConfirmationRdvButton
 * - Visible si au moins un RDV (statut planifie/confirme/reporte) commence dans les
 *   prochaines 24h. Sinon caché.
 * - Pulse "ultra luxe" tant qu'il reste un RDV non confirmé (en_attente) dans la fenêtre.
 * - Modale: liste triée par horaire le plus proche. Sélection d'un RDV -> détail +
 *   actions Maintenu / Annulé / Reporter. Synchronise commandes, rdv, taches et la base
 *   confirmation-rdv.json
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, CalendarClock, Clock, MapPin, Phone, User, Sparkles, Package, ChevronRight, X } from 'lucide-react';
import { RDV } from '@/types/rdv';
import { confirmationRdvApi, ConfirmationRdvEntry } from '@/services/api/confirmationRdvApi';
import rdvApiService from '@/services/api/rdvApi';
import commandeApi from '@/services/api/commandeApi';
import tacheApi from '@/services/api/tacheApi';
import { toast } from 'sonner';

interface Props {
  rdvs: RDV[];
  onAfterUpdate?: () => void;
}

const ACTIVE_STATUTS = new Set(['planifie', 'confirme', 'reporte']);

const within24h = (rdv: RDV): boolean => {
  if (!ACTIVE_STATUTS.has(rdv.statut)) return false;
  if (!rdv.date || !rdv.heureDebut) return false;
  const start = new Date(`${rdv.date}T${rdv.heureDebut}:00`);
  if (isNaN(start.getTime())) return false;
  const now = new Date();
  const diffMs = start.getTime() - now.getTime();
  return diffMs >= 0 && diffMs <= 24 * 60 * 60 * 1000;
};

const ConfirmationRdvButton: React.FC<Props> = ({ rdvs, onAfterUpdate }) => {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<ConfirmationRdvEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportData, setReportData] = useState({ date: '', heureDebut: '', heureFin: '' });
  const [busy, setBusy] = useState(false);
  // Tick chaque minute pour réévaluer la fenêtre 24h
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const upcoming = useMemo(
    () => rdvs.filter(within24h).sort((a, b) =>
      `${a.date}T${a.heureDebut}`.localeCompare(`${b.date}T${b.heureDebut}`)
    ),
    [rdvs]
  );

  // Sync silencieux quand la liste change
  useEffect(() => {
    if (upcoming.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await confirmationRdvApi.sync(upcoming);
        if (!cancelled) setEntries(data);
      } catch { /* silencieux */ }
    })();
    return () => { cancelled = true; };
  }, [upcoming]);

  const upcomingIds = useMemo(() => new Set(upcoming.map(r => r.id)), [upcoming]);

  const visibleEntries = useMemo(() => {
    const byId = new Map(entries.map(e => [e.id, e]));
    return upcoming
      .map(r => byId.get(r.id) || ({
        id: r.id, titre: r.titre, clientNom: r.clientNom,
        clientTelephone: r.clientTelephone || '', clientAdresse: r.clientAdresse || '',
        date: r.date, heureDebut: r.heureDebut, heureFin: r.heureFin,
        lieu: r.lieu || '', description: r.description || '',
        produits: r.produits || [], commandeId: r.commandeId || null,
        statutRdv: r.statut, confirmationStatut: 'en_attente',
        confirmedAt: null, createdAt: '', updatedAt: '',
      } as ConfirmationRdvEntry));
  }, [entries, upcoming]);

  // Pulse si au moins un RDV de la fenêtre est encore "en_attente"
  const hasPending = useMemo(
    () => visibleEntries.some(e => e.confirmationStatut === 'en_attente'),
    [visibleEntries]
  );

  const isVisible = upcoming.length > 0;

  const selected = useMemo(
    () => visibleEntries.find(e => e.id === selectedId) || null,
    [visibleEntries, selectedId]
  );

  const handleOpen = async () => {
    setOpen(true);
    try {
      const data = upcoming.length > 0
        ? await confirmationRdvApi.sync(upcoming)
        : await confirmationRdvApi.getAll();
      setEntries(data);
    } catch {
      toast.error('Erreur de chargement des confirmations');
    }
  };

  const propagate = async (rdvId: string, commandeId: string | null | undefined, action: 'maintenu' | 'annule' | 'reporter', newDate?: string, newHd?: string, newHf?: string) => {
    // Mapping statuts:
    //  - maintenu -> RDV: confirme; commande/tache: en_attente
    //  - annule  -> RDV/commande: annule; tache: completed
    //  - reporter-> RDV: reporte; commande: reporter; tache: nouvelle date
    const rdvStatut = action === 'maintenu' ? 'confirme' : action === 'annule' ? 'annule' : 'reporte';
    const cmdStatut = action === 'maintenu' ? 'en_attente' : action === 'annule' ? 'annule' : 'reporter';

    // RDV
    try {
      const payload: any = { statut: rdvStatut };
      if (action === 'reporter' && newDate && newHd) {
        payload.date = newDate;
        payload.heureDebut = newHd;
        payload.heureFin = newHf || newHd;
      }
      await rdvApiService.update(rdvId, payload);
    } catch (e) { console.warn('rdv update failed', e); }

    // Commande
    if (commandeId) {
      try {
        const payload: any = { statut: cmdStatut };
        if (action === 'reporter' && newDate && newHd) {
          payload.dateEcheance = newDate;
          payload.horaire = newHd;
          if (newHf) payload.horaireFin = newHf;
        }
        await commandeApi.update(commandeId, payload);
      } catch (e) { console.warn('commande update failed', e); }
    }

    // Tâche liée à la commande
    if (commandeId) {
      try {
        if (action === 'maintenu') {
          await (await import('@/services/api/api')).default.put(`/api/taches/by-commande/${commandeId}`, { completed: false });
        } else if (action === 'annule') {
          await (await import('@/services/api/api')).default.delete(`/api/taches/by-commande/${commandeId}`);
        } else if (action === 'reporter' && newDate && newHd) {
          await (await import('@/services/api/api')).default.put(`/api/taches/by-commande/${commandeId}`, {
            date: newDate, heureDebut: newHd, heureFin: newHf || newHd,
          });
        }
      } catch (e) { console.warn('tache sync failed', e); }
    }

    // Confirmation DB
    try {
      await confirmationRdvApi.update(rdvId, {
        confirmationStatut: action,
        ...(action === 'reporter' && newDate ? { date: newDate, heureDebut: newHd, heureFin: newHf } : {}),
      });
    } catch (e) { console.warn('confirmation-rdv update failed', e); }
  };

  const handleAction = async (action: 'maintenu' | 'annule') => {
    if (!selected) return;
    setBusy(true);
    try {
      await propagate(selected.id, selected.commandeId, action);
      // Mise à jour locale optimiste
      setEntries(prev => prev.map(e => e.id === selected.id ? { ...e, confirmationStatut: action } : e));
      toast.success(action === 'maintenu' ? 'Rendez-vous maintenu' : 'Rendez-vous annulé');
      setSelectedId(null);
      onAfterUpdate?.();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setBusy(false);
    }
  };

  const openReport = () => {
    if (!selected) return;
    setReportData({ date: selected.date, heureDebut: selected.heureDebut, heureFin: selected.heureFin });
    setReportOpen(true);
  };

  const handleReport = async () => {
    if (!selected) return;
    if (!reportData.date || !reportData.heureDebut) {
      toast.error('Date et heure de début requises');
      return;
    }
    setBusy(true);
    try {
      await propagate(selected.id, selected.commandeId, 'reporter', reportData.date, reportData.heureDebut, reportData.heureFin);
      setEntries(prev => prev.map(e => e.id === selected.id ? {
        ...e, confirmationStatut: 'reporter',
        date: reportData.date, heureDebut: reportData.heureDebut, heureFin: reportData.heureFin || reportData.heureDebut,
      } : e));
      toast.success('Rendez-vous reporté');
      setReportOpen(false);
      setSelectedId(null);
      onAfterUpdate?.();
    } catch {
      toast.error('Erreur lors du report');
    } finally {
      setBusy(false);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <Button
        onClick={handleOpen}
        className={`group relative overflow-hidden bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:from-violet-700 hover:via-fuchsia-700 hover:to-amber-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] rounded-xl px-4 py-2 h-auto ${hasPending ? 'confirmation-luxury-pulse' : ''}`}
      >
        {hasPending && (
          <>
            <span className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-fuchsia-300/70 animate-ping" />
            <span className="pointer-events-none absolute -inset-[2px] rounded-xl bg-gradient-to-r from-violet-400/0 via-white/40 to-amber-300/0 confirmation-luxury-shimmer" />
            <span className="pointer-events-none absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-300 shadow-[0_0_10px_2px_rgba(252,211,77,0.95)] animate-pulse" />
          </>
        )}
        <div className="relative flex items-center gap-2">
          <div className={`flex items-center justify-center h-7 w-7 rounded-lg bg-white/20 backdrop-blur-sm ${hasPending ? 'animate-bounce' : ''}`}>
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[10px] opacity-80">Prochaines 24h</span>
            <span className="font-bold text-sm">Confirmation</span>
          </div>
        </div>
      </Button>

      {/* Liste */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-white via-fuchsia-50/40 to-amber-50/40 dark:from-gray-900 dark:via-fuchsia-950/20 dark:to-amber-950/10 border-fuchsia-200/50 dark:border-fuchsia-800/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-amber-500 text-white shadow-lg">
                <CalendarClock className="h-5 w-5" />
              </div>
              <span className="bg-gradient-to-r from-violet-700 via-fuchsia-700 to-amber-600 bg-clip-text text-transparent font-bold">
                Confirmation des rendez-vous (24h)
              </span>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-3">
            <div className="space-y-3">
              {visibleEntries.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">Aucun rendez-vous dans les prochaines 24h</div>
              )}
              {visibleEntries.map((e) => {
                const isSel = selectedId === e.id;
                const statutColor =
                  e.confirmationStatut === 'maintenu' ? 'bg-emerald-600' :
                    e.confirmationStatut === 'annule' ? 'bg-rose-600' :
                      e.confirmationStatut === 'reporter' ? 'bg-amber-500' : 'bg-slate-400';
                const statutLabel =
                  e.confirmationStatut === 'maintenu' ? 'Maintenu' :
                    e.confirmationStatut === 'annule' ? 'Annulé' :
                      e.confirmationStatut === 'reporter' ? 'Reporté' : 'En attente';
                return (
                  <button
                    key={e.id}
                    onClick={() => setSelectedId(e.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 hover:shadow-lg ${isSel
                      ? 'bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-950/20 border-fuchsia-400 ring-2 ring-fuchsia-300/50'
                      : 'bg-white/70 dark:bg-gray-800/50 border-fuchsia-100 dark:border-fuchsia-800/30'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${isSel ? 'border-fuchsia-600 bg-fuchsia-600' : 'border-muted-foreground'
                        }`}>
                        {isSel && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-foreground">
                          {e.produits && e.produits.length > 0 ? (
                            <div className="space-y-1">
                              {e.produits.map((p, i) => (
                                <div key={i} className="flex justify-between">
                                  <span>
                                    {p.nom}{' '}
                                    <span className="text-fuchsia-600 font-bold">
                                      x{p.quantite}
                                    </span>
                                  </span>
                                  <span className="font-semibold">
                                    {p.prixVente}€
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            e.titre || e.clientNom
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {e.date} • {e.heureDebut}
                          {e.heureFin ? ' - ' + e.heureFin : ''}
                          <span>•</span>
                          <span>{e.clientNom}</span>
                        </div>
                      </div>
                      <Badge className={`${statutColor} text-white`}>{statutLabel}</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Détail + actions */}
      <Dialog open={!!selected && !reportOpen} onOpenChange={(o) => !o && setSelectedId(null)}>
        <DialogContent className="max-w-lg bg-gradient-to-br from-white via-fuchsia-50/40 to-amber-50/40 dark:from-gray-900 dark:via-fuchsia-950/20 dark:to-amber-950/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-fuchsia-600" />
              <span className="bg-gradient-to-r from-violet-700 to-fuchsia-700 bg-clip-text text-transparent">
                Détail du rendez-vous
              </span>
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 text-sm">
              <div className="p-3 rounded-lg bg-white/70 dark:bg-gray-800/50 border border-fuchsia-100 dark:border-fuchsia-800/30 space-y-2">
                <div className="font-bold flex items-center gap-2 text-foreground">
                  <User className="h-4 w-4 text-fuchsia-600" /> {selected.clientNom}
                </div>
                <div className="pl-6 flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3 w-3" /> {selected.clientTelephone || '—'}
                </div>
                <div className="pl-6 flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-3 w-3 mt-0.5" /> {selected.clientAdresse || selected.lieu || '—'}
                </div>
                <div className="pl-6 flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3 w-3" /> {selected.date} • {selected.heureDebut}{selected.heureFin ? ' - ' + selected.heureFin : ''}
                </div>
              </div>

              {selected.produits && selected.produits.length > 0 && (
                <div className="p-3 rounded-lg bg-white/70 dark:bg-gray-800/50 border border-fuchsia-100 dark:border-fuchsia-800/30 space-y-2">
                  <div className="font-bold flex items-center gap-2 text-foreground">
                    <Package className="h-4 w-4 text-fuchsia-600" /> Produits
                  </div>
                  <div className="pl-6 space-y-1">
                    {selected.produits.map((p, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{p.nom} <span className="text-fuchsia-600 font-bold">x{p.quantite}</span></span>
                        <span className="font-semibold">{p.prixVente}€</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.description && (
                <div className="p-3 rounded-lg bg-white/70 dark:bg-gray-800/50 border border-fuchsia-100 dark:border-fuchsia-800/30 text-muted-foreground">
                  {selected.description}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 pt-2">
                <Button
                  disabled={busy}
                  onClick={() => handleAction('maintenu')}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Maintenu
                </Button>
                <Button
                  disabled={busy}
                  onClick={() => handleAction('annule')}
                  className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-md"
                >
                  <XCircle className="h-4 w-4 mr-1" /> Annulé
                </Button>
                <Button
                  disabled={busy}
                  onClick={openReport}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md"
                >
                  <CalendarClock className="h-4 w-4 mr-1" /> Reporter
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reporter */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-md bg-gradient-to-br from-white via-amber-50/40 to-orange-50/40 dark:from-gray-900 dark:via-amber-950/20 dark:to-orange-950/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-amber-600" />
              Reporter le rendez-vous
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Nouvelle date</Label>
              <Input type="date" value={reportData.date} onChange={(e) => setReportData(d => ({ ...d, date: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Heure début</Label>
                <Input type="time" value={reportData.heureDebut} onChange={(e) => setReportData(d => ({ ...d, heureDebut: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Heure fin</Label>
                <Input type="time" value={reportData.heureFin} onChange={(e) => setReportData(d => ({ ...d, heureFin: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setReportOpen(false)} disabled={busy}>
                <X className="h-4 w-4 mr-1" /> Annuler
              </Button>
              <Button onClick={handleReport} disabled={busy} className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                <CheckCircle2 className="h-4 w-4 mr-1" /> Confirmer le report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConfirmationRdvButton;
