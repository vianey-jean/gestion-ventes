/**
 * EpargneCard.tsx
 * Module Épargne ultra-premium (style page de connexion) :
 * - Carte cliquable -> modale listant les propriétaires et leurs comptes
 * - Création de propriétaire (=> db/compte-<NOM>.json) et ajout de comptes
 * - Historique d'un compte : versements / retraits, édition, suppression
 * - Montants affichés en Ar (gauche) et Fmg (droite, Ar x 5)
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  PiggyBank, Plus, Sparkles, Crown, Wallet, ArrowDownCircle, ArrowUpCircle,
  Pencil, Trash2, ChevronRight, Loader2, Users, RefreshCcw, ArrowLeft,
} from 'lucide-react';
import epargneApi, { EpargneOwner, EpargneCompte, EpargneOperation, formatAr, formatFmg } from '@/services/api/epargneApi';

const cardShell =
  'relative overflow-hidden rounded-[2rem] border border-emerald-200/60 dark:border-emerald-700/40 bg-gradient-to-br from-white via-emerald-50/70 to-teal-50/60 dark:from-slate-900 dark:via-emerald-950/40 dark:to-teal-950/30';

const AmountPair: React.FC<{ ar: number; className?: string }> = ({ ar, className = '' }) => (
  <div className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 ${className}`}>
    <span className="font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums">{formatAr(ar)}</span>
    <span className="text-xs font-bold text-teal-600/80 dark:text-teal-300/80 tabular-nums">{formatFmg(ar)}</span>
  </div>
);

const EpargneCard: React.FC = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [owners, setOwners] = useState<EpargneOwner[]>([]);

  // Sélection
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
  const [selectedCompteId, setSelectedCompteId] = useState<string | null>(null);

  // Dialogues
  const [ownerFormOpen, setOwnerFormOpen] = useState(false);
  const [compteFormOpen, setCompteFormOpen] = useState<{ ownerId: string } | null>(null);
  const [editCompte, setEditCompte] = useState<{ ownerId: string; compteId: string } | null>(null);
  const [opForm, setOpForm] = useState<null | {
    type: 'versement' | 'retrait';
    montant: string;
    date: string;
    description: string;
    editId?: string;
  }>(null);
  const [confirm, setConfirm] = useState<null | { label: string; action: () => Promise<void> }>(null);
  const [busy, setBusy] = useState(false);

  const [ownerDraft, setOwnerDraft] = useState({ personName: '', accountName: '', address: '', description: '' });
  const [compteDraft, setCompteDraft] = useState({ accountName: '', description: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await epargneApi.getAll();
      setOwners(data);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de charger les comptes épargne', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const selectedOwner = useMemo(
    () => owners.find((o) => o.id === selectedOwnerId) || null,
    [owners, selectedOwnerId]
  );
  const selectedCompte: EpargneCompte | null = useMemo(
    () => selectedOwner?.comptes?.find((c) => c.id === selectedCompteId) || null,
    [selectedOwner, selectedCompteId]
  );

  const totalGlobal = useMemo(() => owners.reduce((s, o) => s + (Number(o.soldeTotal) || 0), 0), [owners]);

  /* ------------------------------ Actions ------------------------------ */
  const createOwner = async () => {
    if (!ownerDraft.personName.trim() || !ownerDraft.accountName.trim()) {
      toast({ title: 'Champs requis', description: 'Nom de la personne et nom du compte', variant: 'destructive' });
      return;
    }
    setBusy(true);
    try {
      await epargneApi.createOwner({
        personName: ownerDraft.personName.trim(),
        accountName: ownerDraft.accountName.trim(),
        address: ownerDraft.address.trim(),
        description: ownerDraft.description.trim(),
      });
      setOwnerDraft({ personName: '', accountName: '', address: '', description: '' });
      setOwnerFormOpen(false);
      await load();
      toast({ title: 'Compte créé', className: 'bg-emerald-600 text-white' });
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.response?.data?.message || 'Création impossible', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const addCompte = async () => {
    if (!compteFormOpen) return;
    if (!compteDraft.accountName.trim()) {
      toast({ title: 'Nom du compte requis', variant: 'destructive' });
      return;
    }
    setBusy(true);
    try {
      await epargneApi.addCompte(compteFormOpen.ownerId, {
        accountName: compteDraft.accountName.trim(),
        description: compteDraft.description.trim(),
      });
      setCompteDraft({ accountName: '', description: '' });
      setCompteFormOpen(null);
      await load();
      toast({ title: 'Compte ajouté', className: 'bg-emerald-600 text-white' });
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.response?.data?.message || 'Ajout impossible', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const submitCompteUpdate = async () => {
    if (!editCompte) return;
    if (!compteDraft.accountName.trim()) {
      toast({ title: 'Nom du compte requis', variant: 'destructive' });
      return;
    }
    setBusy(true);
    try {
      await epargneApi.updateCompte(editCompte.ownerId, editCompte.compteId, {
        accountName: compteDraft.accountName.trim(),
        description: compteDraft.description.trim(),
      });
      setCompteDraft({ accountName: '', description: '' });
      setEditCompte(null);
      await load();
      toast({ title: 'Compte mis à jour', className: 'bg-emerald-600 text-white' });
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.response?.data?.message || 'Modification impossible', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const submitOperation = async () => {
    if (!opForm || !selectedOwner || !selectedCompte) return;
    const montant = Number(String(opForm.montant).replace(',', '.'));
    if (!montant || montant <= 0) {
      toast({ title: 'Montant invalide', description: 'Saisissez un montant en Ariary', variant: 'destructive' });
      return;
    }
    setBusy(true);
    try {
      const payload = {
        type: opForm.type,
        montant,
        date: opForm.date,
        description: opForm.description.trim(),
      };
      if (opForm.editId) {
        await epargneApi.updateOperation(selectedOwner.id, selectedCompte.id, opForm.editId, payload);
      } else {
        await epargneApi.addOperation(selectedOwner.id, selectedCompte.id, payload);
      }
      setOpForm(null);
      await load();
      toast({ title: opForm.editId ? 'Opération modifiée' : 'Opération enregistrée', className: 'bg-emerald-600 text-white' });
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.response?.data?.message || 'Enregistrement impossible', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const runConfirm = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      await confirm.action();
      await load();
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.response?.data?.message || 'Suppression impossible', variant: 'destructive' });
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  const todayISO = new Date().toISOString().slice(0, 10);

  /* ------------------------------ Rendu ------------------------------ */
  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.99 }}
        className={`${cardShell} group w-full h-full text-left p-6 sm:p-8 shadow-[0_30px_80px_rgba(16,185,129,0.18)] hover:shadow-[0_40px_120px_rgba(16,185,129,0.32)] transition-all duration-500`}
      >
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/10 animate-pulse" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-teal-400/15 to-transparent" />

        <div className="relative flex items-center gap-4">
          <div className="relative rounded-2xl p-4 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 shadow-[0_15px_40px_rgba(16,185,129,0.5)]">
            <PiggyBank className="h-7 w-7 text-white" />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-emerald-200 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-extrabold tracking-wide bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-700 dark:from-emerald-300 dark:via-teal-300 dark:to-cyan-300 bg-clip-text text-transparent flex items-center gap-2">
              Épargne
              <Crown className="h-5 w-5 text-amber-500 shrink-0" />
            </h3>
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 truncate">
              Comptes d'épargne — versements & retraits
            </p>
          </div>
        </div>

        <div className="relative mt-5 flex items-center justify-between gap-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700/80 dark:text-emerald-300/80">
            Cliquez pour ouvrir
          </div>
          <ChevronRight className="h-5 w-5 text-emerald-600 dark:text-emerald-300 group-hover:translate-x-1 transition-transform" />
        </div>
      </motion.button>

      {/* Modale principale */}
      <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
        <DialogContent className="max-w-4xl w-[96vw] p-0 overflow-hidden bg-gradient-to-br from-white via-emerald-50/60 to-teal-50/50 dark:from-slate-950 dark:via-emerald-950/40 dark:to-teal-950/30 border border-emerald-200/60 dark:border-emerald-800/50">
          <DialogHeader className="p-5 sm:p-6 pb-3 border-b border-emerald-200/50 dark:border-emerald-800/40">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="rounded-xl p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                <PiggyBank className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent font-extrabold">
                {selectedCompte ? `${selectedOwner?.personName} — ${selectedCompte.accountName}` : 'Comptes épargne'}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="p-4 sm:p-6 pt-4">
            {/* Barre d'actions */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
              {selectedCompte ? (
                <>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setSelectedCompteId(null)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1.5" /> Retour
                  </Button>
                  <Button
                    className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                    onClick={() => setOpForm({ type: 'versement', montant: '', date: todayISO, description: '' })}
                  >
                    <ArrowDownCircle className="h-4 w-4 mr-1.5" /> Versement
                  </Button>
                  <Button
                    className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white"
                    onClick={() => setOpForm({ type: 'retrait', montant: '', date: todayISO, description: '' })}
                  >
                    <ArrowUpCircle className="h-4 w-4 mr-1.5" /> Retrait
                  </Button>
                </>
              ) : (
                <Button
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                  onClick={() => setOwnerFormOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1.5" /> Créer un compte
                </Button>
              )}
              <Button variant="outline" className="rounded-xl ml-auto" onClick={load} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              </Button>
            </div>

            <ScrollArea className="max-h-[60vh] pr-2">
              <AnimatePresence mode="wait">
                {selectedCompte && selectedOwner ? (
                  <motion.div
                    key="historique"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                  >
                    <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-800/50 bg-white/70 dark:bg-slate-900/60 p-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-300">Solde du compte</p>
                        <AmountPair ar={selectedCompte.solde} className="text-lg" />
                      </div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {selectedCompte.operationsCount} opération(s)
                      </p>
                    </div>

                    {(selectedCompte.operations || []).length === 0 ? (
                      <div className="py-12 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                        Aucune opération pour ce compte.
                      </div>
                    ) : (
                      [...(selectedCompte.operations || [])]
                        .sort((a, b) => String(b.date).localeCompare(String(a.date)))
                        .map((op: EpargneOperation) => (
                          <motion.div
                            key={op.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl border border-slate-200/70 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/60 p-4 flex flex-wrap items-center gap-3 hover:shadow-lg transition-shadow"
                          >
                            <div
                              className={`rounded-xl p-2.5 shadow-md ${
                                op.type === 'versement'
                                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                                  : 'bg-gradient-to-br from-rose-500 to-orange-500'
                              }`}
                            >
                              {op.type === 'versement' ? (
                                <ArrowDownCircle className="h-5 w-5 text-white" />
                              ) : (
                                <ArrowUpCircle className="h-5 w-5 text-white" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-extrabold capitalize text-slate-800 dark:text-slate-100">
                                {op.type}
                                <span className="ml-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                  {op.date}
                                </span>
                              </p>
                              {op.description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{op.description}</p>
                              )}
                              <AmountPair ar={op.montant} className="mt-1 text-sm" />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="rounded-xl text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                onClick={() =>
                                  setOpForm({
                                    type: op.type,
                                    montant: String(op.montant),
                                    date: op.date,
                                    description: op.description || '',
                                    editId: op.id,
                                  })
                                }
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                onClick={() =>
                                  setConfirm({
                                    label: `Supprimer cette opération (${formatAr(op.montant)}) ?`,
                                    action: async () => {
                                      await epargneApi.deleteOperation(selectedOwner.id, selectedCompte.id, op.id);
                                    },
                                  })
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="liste"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-800/50 bg-white/70 dark:bg-slate-900/60 p-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                        <Users className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">{owners.length} propriétaire(s)</span>
                      </div>
                      <AmountPair ar={totalGlobal} className="text-base" />
                    </div>

                    {loading ? (
                      <div className="py-14 flex justify-center">
                        <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
                      </div>
                    ) : owners.length === 0 ? (
                      <div className="py-14 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                        Aucun compte enregistré. Créez le premier compte.
                      </div>
                    ) : (
                      owners.map((owner) => (
                        <motion.div
                          key={owner.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-2xl border border-slate-200/70 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/60 p-4 space-y-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-base font-extrabold text-slate-800 dark:text-slate-100 truncate">
                                {owner.personName}
                              </p>
                              {owner.address && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{owner.address}</p>
                              )}
                              <AmountPair ar={owner.soldeTotal} className="mt-1 text-sm" />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => {
                                  setCompteDraft({ accountName: '', description: '' });
                                  setCompteFormOpen({ ownerId: owner.id });
                                }}
                              >
                                <Plus className="h-4 w-4 mr-1" /> Ajouter un compte
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                onClick={() =>
                                  setConfirm({
                                    label: `Supprimer définitivement ${owner.personName} et tous ses comptes ?`,
                                    action: async () => {
                                      await epargneApi.deleteOwner(owner.id);
                                    },
                                  })
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-2">
                            {(owner.comptes || []).map((c) => (
                              <div
                                key={c.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                  setSelectedOwnerId(owner.id);
                                  setSelectedCompteId(c.id);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setSelectedOwnerId(owner.id);
                                    setSelectedCompteId(c.id);
                                  }
                                }}
                                className="group text-left rounded-xl border border-emerald-200/60 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50/80 to-teal-50/60 dark:from-emerald-950/30 dark:to-teal-950/20 p-3 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                                    <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-300 shrink-0" />
                                    {c.accountName}
                                  </span>
                                  <div className="flex items-center gap-0.5">
                                    <button
                                      type="button"
                                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCompteDraft({ accountName: c.accountName, description: c.description || '' });
                                        setEditCompte({ ownerId: owner.id, compteId: c.id });
                                      }}
                                      aria-label="Modifier le compte"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirm({
                                          label: `Supprimer le compte « ${c.accountName} » ?`,
                                          action: async () => {
                                            await epargneApi.deleteCompte(owner.id, c.id);
                                          },
                                        });
                                      }}
                                      aria-label="Supprimer le compte"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                    <ChevronRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-1 transition-transform ml-0.5" />
                                  </div>
                                </div>
                                <AmountPair ar={c.solde} className="mt-1.5 text-sm" />
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Création propriétaire */}
      <Dialog open={ownerFormOpen} onOpenChange={(v) => !busy && setOwnerFormOpen(v)}>
        <DialogContent className="max-w-md bg-gradient-to-br from-white via-emerald-50/60 to-teal-50/50 dark:from-slate-950 dark:via-emerald-950/40 dark:to-teal-950/30">
          <DialogHeader>
            <DialogTitle className="font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Créer un compte
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nom et Prénom de la personne</Label>
              <Input
                value={ownerDraft.personName}
                onChange={(e) => setOwnerDraft({ ...ownerDraft, personName: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nom du compte</Label>
              <Input
                value={ownerDraft.accountName}
                onChange={(e) => setOwnerDraft({ ...ownerDraft, accountName: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Adresse</Label>
              <Input
                value={ownerDraft.address}
                onChange={(e) => setOwnerDraft({ ...ownerDraft, address: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description du compte</Label>
              <Textarea
                value={ownerDraft.description}
                onChange={(e) => setOwnerDraft({ ...ownerDraft, description: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setOwnerFormOpen(false)} disabled={busy}>
              Annuler
            </Button>
            <Button className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white" onClick={createOwner} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />} Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ajout de compte */}
      <Dialog open={!!compteFormOpen} onOpenChange={(v) => !busy && !v && setCompteFormOpen(null)}>
        <DialogContent className="max-w-md bg-gradient-to-br from-white via-emerald-50/60 to-teal-50/50 dark:from-slate-950 dark:via-emerald-950/40 dark:to-teal-950/30">
          <DialogHeader>
            <DialogTitle className="font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Ajouter un compte
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nom du compte (épargne, courant…)</Label>
              <Input
                value={compteDraft.accountName}
                onChange={(e) => setCompteDraft({ ...compteDraft, accountName: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={compteDraft.description}
                onChange={(e) => setCompteDraft({ ...compteDraft, description: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setCompteFormOpen(null)} disabled={busy}>
              Annuler
            </Button>
            <Button className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white" onClick={addCompte} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />} Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modification de compte */}
      <Dialog open={!!editCompte} onOpenChange={(v) => !busy && !v && setEditCompte(null)}>
        <DialogContent className="max-w-md bg-gradient-to-br from-white via-emerald-50/60 to-teal-50/50 dark:from-slate-950 dark:via-emerald-950/40 dark:to-teal-950/30">
          <DialogHeader>
            <DialogTitle className="font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Modifier le compte
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nom du compte</Label>
              <Input
                value={compteDraft.accountName}
                onChange={(e) => setCompteDraft({ ...compteDraft, accountName: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={compteDraft.description}
                onChange={(e) => setCompteDraft({ ...compteDraft, description: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setEditCompte(null)} disabled={busy}>
              Annuler
            </Button>
            <Button className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white" onClick={submitCompteUpdate} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />} Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Versement / Retrait */}
      <Dialog open={!!opForm} onOpenChange={(v) => !busy && !v && setOpForm(null)}>
        <DialogContent className="max-w-md bg-gradient-to-br from-white via-emerald-50/60 to-teal-50/50 dark:from-slate-950 dark:via-emerald-950/40 dark:to-teal-950/30">
          <DialogHeader>
            <DialogTitle className="font-extrabold capitalize bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {opForm?.editId ? 'Modifier' : 'Nouveau'} {opForm?.type}
            </DialogTitle>
          </DialogHeader>
          {opForm && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Montant (Ar)</Label>
                <Input
                  type="number"
                  min={0}
                  value={opForm.montant}
                  onChange={(e) => setOpForm({ ...opForm, montant: e.target.value })}
                  className="rounded-xl"
                />
                <p className="text-xs font-semibold text-teal-600 dark:text-teal-300">
                  = {formatFmg(Number(String(opForm.montant).replace(',', '.')) || 0)}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={opForm.date}
                  onChange={(e) => setOpForm({ ...opForm, date: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  value={opForm.description}
                  onChange={(e) => setOpForm({ ...opForm, description: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setOpForm(null)} disabled={busy}>
              Annuler
            </Button>
            <Button className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white" onClick={submitOperation} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />} Valider
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation de suppression */}
      <AlertDialog open={!!confirm} onOpenChange={(v) => !busy && !v && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmation</AlertDialogTitle>
            <AlertDialogDescription>{confirm?.label}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-rose-600 hover:bg-rose-700" onClick={(e) => { e.preventDefault(); runConfirm(); }} disabled={busy}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EpargneCard;
