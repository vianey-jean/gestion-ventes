/**
 * PointageAutoSection — Gestion des règles de pointage automatique
 * (Profil > Paramètres > Paramètres des modules)
 *
 * Permet à l'admin de définir des règles "personne + jour(s) + entreprise"
 * qui seront automatiquement proposées chaque jour via un modal avec chrono.
 *
 * Design : ultra luxe inspiré du Module Comptabilité (gradients emerald/teal,
 * glassmorphism, animations framer-motion).
 *
 * CRUD complet : ajouter, modifier, supprimer, activer/désactiver.
 * Données persistées dans server/db/pointageauto.json.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, X, Save, Crown, Sparkles, Diamond,
  CalendarDays, Building2, User, Power, Zap, ChevronDown, ChevronUp,
  ShieldAlert, AlertTriangle, XCircle, Clock, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import pointageAutoApi, { PointageAutoEntry } from '@/services/api/pointageAutoApi';
import travailleurApi, { Travailleur } from '@/services/api/travailleurApi';
import entrepriseApi, { Entreprise } from '@/services/api/entrepriseApi';
import PremiumLoading from '@/components/ui/premium-loading';

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

interface FormState {
  travailleurId: string;
  travailleurNom: string;
  joursMode: 'toute' | 'choisis';
  joursChoisis: string[];
  entrepriseId: string;
  entrepriseNom: string;
  typePaiement: 'journalier' | 'horaire';
  heures: number;
  prixHeure: number;
  prixJournalier: number;
  active: boolean;
}

const emptyForm: FormState = {
  travailleurId: '',
  travailleurNom: '',
  joursMode: 'toute',
  joursChoisis: [],
  entrepriseId: '',
  entrepriseNom: '',
  typePaiement: 'journalier',
  heures: 0,
  prixHeure: 0,
  prixJournalier: 0,
  active: true,
};

const PointageAutoSection: React.FC = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<PointageAutoEntry[]>([]);
  const [travailleurs, setTravailleurs] = useState<Travailleur[]>([]);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PointageAutoEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  // Modal désactivation (permanent/temporaire)
  const [deactivateTarget, setDeactivateTarget] = useState<PointageAutoEntry | null>(null);
  // Modal réactivation avec date de début
  const [reactivateTarget, setReactivateTarget] = useState<PointageAutoEntry | null>(null);
  const [reactivateDate, setReactivateDate] = useState<string>('');
  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [pa, tr, en] = await Promise.all([
        pointageAutoApi.getAll(),
        travailleurApi.getAll(),
        entrepriseApi.getAll(),
      ]);
      setItems(pa.data || []);
      setTravailleurs(tr.data || []);
      setEntreprises(en.data || []);
    } catch {
      // silencieux
    } finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item: PointageAutoEntry) => {
    setEditingId(item.id);
    setForm({
      travailleurId: item.travailleurId,
      travailleurNom: item.travailleurNom,
      joursMode: item.jours === 'toute' ? 'toute' : 'choisis',
      joursChoisis: Array.isArray(item.jours) ? item.jours : [],
      entrepriseId: item.entrepriseId,
      entrepriseNom: item.entrepriseNom,
      typePaiement: item.typePaiement,
      heures: item.heures,
      prixHeure: item.prixHeure,
      prixJournalier: item.prixJournalier,
      active: item.active,
    });
    setShowForm(true);
  };

  const computeMontant = (f: FormState): number => {
    if (f.typePaiement === 'horaire') return Number((f.heures * f.prixHeure).toFixed(2));
    return Number(f.prixJournalier);
  };

  const submit = async () => {
    if (!form.travailleurId || !form.entrepriseId) {
      toast({ title: 'Champs requis', description: 'Personne et entreprise sont obligatoires', variant: 'destructive' });
      return;
    }
    if (form.joursMode === 'choisis' && form.joursChoisis.length === 0) {
      toast({ title: 'Jours requis', description: 'Sélectionnez au moins un jour', variant: 'destructive' });
      return;
    }
    const payload = {
      travailleurId: form.travailleurId,
      travailleurNom: form.travailleurNom,
      jours: form.joursMode === 'toute' ? ('toute' as const) : form.joursChoisis,
      entrepriseId: form.entrepriseId,
      entrepriseNom: form.entrepriseNom,
      typePaiement: form.typePaiement,
      heures: Number(form.heures) || 0,
      prixHeure: Number(form.prixHeure) || 0,
      prixJournalier: Number(form.prixJournalier) || 0,
      montantTotal: computeMontant(form),
      active: form.active,
    };
    try {
      if (editingId) {
        await pointageAutoApi.update(editingId, payload);
        toast({ title: 'Pointage automatique modifié' });
      } else {
        await pointageAutoApi.create(payload);
        toast({ title: 'Pointage automatique ajouté' });
      }
      setShowForm(false);
      fetchAll();
    } catch {
      toast({ title: 'Erreur', description: 'Sauvegarde impossible', variant: 'destructive' });
    }
  };

  const remove = (item: PointageAutoEntry) => {
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await pointageAutoApi.delete(deleteTarget.id);
      toast({ title: 'Supprimé avec succès' });
      setDeleteTarget(null);
      fetchAll();
    } catch {
      toast({ title: 'Erreur lors de la suppression', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = (item: PointageAutoEntry) => {
    // Désactivation permanente → blocage total
    if (item.permanentlyDisabled) {
      toast({
        title: 'Désactivation permanente',
        description: 'Cette règle a été désactivée de façon permanente et ne peut plus être réactivée.',
        variant: 'destructive',
      });
      return;
    }
    if (item.active) {
      // Désactiver → demander permanent ou temporaire
      setDeactivateTarget(item);
    } else {
      // Réactiver → demander la date de début
      const today = new Date().toISOString().slice(0, 10);
      setReactivateDate(today);
      setReactivateTarget(item);
    }
  };

  /** Désactive la règle (permanent ou temporaire) */
  const confirmDeactivate = async (permanent: boolean) => {
    if (!deactivateTarget) return;
    try {
      await pointageAutoApi.update(deactivateTarget.id, {
        active: false,
        permanentlyDisabled: permanent,
      });
      toast({
        title: permanent ? 'Désactivation permanente' : 'Désactivation temporaire',
        description: permanent
          ? 'Cette règle ne pourra plus être réactivée.'
          : 'Vous pourrez la réactiver quand vous voulez.',
      });
      setDeactivateTarget(null);
      fetchAll();
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  /** Réactive avec date de début (permet pointages rétroactifs) */
  const confirmReactivate = async () => {
    if (!reactivateTarget || !reactivateDate) return;
    try {
      await pointageAutoApi.update(reactivateTarget.id, {
        active: true,
        permanentlyDisabled: false,
        reactivationStartDate: reactivateDate,
      });
      toast({
        title: 'Pointage automatique réactivé',
        description: `Les pointages seront générés depuis le ${reactivateDate}`,
      });
      setReactivateTarget(null);
      fetchAll();
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const formatJours = (jours: string[] | 'toute') =>
    jours === 'toute' ? 'Toute la semaine' : (Array.isArray(jours) ? jours.join(', ') : '');

  return (
    <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-300/30 p-3">
      {/* Header luxe — cliquable pour plier/déplier */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setExpanded(p => !p)}
          className="flex items-center gap-2 flex-1 text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                Pointage automatique
              </span>
              <Crown className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Règles automatisées récurrentes
            </p>
          </div>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            : <ChevronDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
        </button>
        {expanded && (
          <Button
            size="sm"
            onClick={openCreate}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md shadow-emerald-500/30 rounded-lg h-8 px-3 ml-2"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter
          </Button>
        )}
      </div>

      {/* Liste — affichée uniquement si expanded */}
      {expanded && (
        loading ? (
          <div className="flex justify-center py-3">
            <PremiumLoading text="Chargement..." size="md" overlay={false} variant="default" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-4 text-xs text-muted-foreground">
            Aucun pointage automatique configuré
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {items.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="rounded-lg bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-500/20 p-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <User className="w-3 h-3 text-emerald-600" />
                        <span className="text-xs font-bold text-foreground truncate">{item.travailleurNom}</span>
                        {item.active ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold">ACTIF</span>
                        ) : item.permanentlyDisabled ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-700 dark:text-red-300 font-semibold">DÉSACTIVÉ DÉFINITIVEMENT</span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Inactif</span>
                        )}
                      </div>
                      <div className="space-y-0.5 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1"><Building2 className="w-3 h-3" />{item.entrepriseNom}</div>
                        <div className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{formatJours(item.jours)}</div>
                        <div className="flex items-center gap-1"><Diamond className="w-3 h-3" />
                          {item.typePaiement === 'horaire'
                            ? `${item.heures}h × ${item.prixHeure}€ = ${item.montantTotal}€`
                            : `${item.prixJournalier}€/jour`}
                        </div>
                        {item.active && item.reactivationStartDate && (
                          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <Zap className="w-3 h-3" />Depuis : {item.reactivationStartDate}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => toggleActive(item)}
                        disabled={item.permanentlyDisabled}
                        className={`p-1 rounded ${item.permanentlyDisabled ? 'text-muted-foreground/40 cursor-not-allowed' : item.active ? 'text-emerald-600 hover:bg-emerald-500/10' : 'text-muted-foreground hover:bg-muted'}`}
                        title={item.permanentlyDisabled ? 'Désactivé définitivement' : item.active ? 'Désactiver' : 'Activer'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openEdit(item)} className="p-1 rounded text-blue-600 hover:bg-blue-500/10">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => remove(item)} className="p-1 rounded text-red-600 hover:bg-red-500/10">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )
      )}

      {/* Modal formulaire — design ultra luxe */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 22 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-emerald-900/95 via-teal-900/95 to-green-900/95 border-2 border-emerald-500/40 shadow-2xl shadow-emerald-500/30 backdrop-blur-2xl"
            >
              {/* Decoratives */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-bl-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-400/20 to-transparent rounded-tr-full pointer-events-none" />

              {/* Header */}
              <div className="relative p-5 border-b border-emerald-500/30">
                <button onClick={() => setShowForm(false)} className="absolute top-3 right-3 p-1.5 rounded-lg text-emerald-200 hover:bg-white/10">
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/40">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black bg-gradient-to-r from-emerald-300 via-teal-300 to-green-300 bg-clip-text text-transparent flex items-center gap-2">
                      {editingId ? 'Modifier' : 'Nouveau'} Pointage Auto
                      <Crown className="w-4 h-4 text-yellow-400 animate-pulse" />
                    </h3>
                    <p className="text-xs text-emerald-200/80 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Configuration premium
                    </p>
                  </div>
                </div>
              </div>

              {/* Form body */}
              <div className="relative p-5 space-y-4">
                {/* Personne */}
                <div className="space-y-1.5">
                  <Label className="text-emerald-200 text-xs font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Personne
                  </Label>
                  <Select
                    value={form.travailleurId}
                    onValueChange={v => {
                      const t = travailleurs.find(x => x.id === v);
                      setForm(f => ({ ...f, travailleurId: v, travailleurNom: t ? `${t.prenom} ${t.nom}` : '' }));
                    }}
                  >
                    <SelectTrigger className="bg-white/10 border-emerald-400/30 text-emerald-100 rounded-xl h-10">
                      <SelectValue placeholder="Sélectionner une personne" />
                    </SelectTrigger>
                    <SelectContent className="bg-emerald-900/95 backdrop-blur-xl border-emerald-600/50 text-emerald-100">
                      {travailleurs.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.prenom} {t.nom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Jours */}
                <div className="space-y-1.5">
                  <Label className="text-emerald-200 text-xs font-semibold flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" /> Jours
                  </Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, joursMode: 'toute' }))}
                      className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${form.joursMode === 'toute' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' : 'bg-white/10 text-emerald-200 hover:bg-white/20'}`}
                    >
                      Toute la semaine
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, joursMode: 'choisis' }))}
                      className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${form.joursMode === 'choisis' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' : 'bg-white/10 text-emerald-200 hover:bg-white/20'}`}
                    >
                      Jours choisis
                    </button>
                  </div>
                  {form.joursMode === 'choisis' && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {JOURS.map(j => {
                        const sel = form.joursChoisis.includes(j);
                        return (
                          <button
                            key={j}
                            type="button"
                            onClick={() => setForm(f => ({
                              ...f,
                              joursChoisis: sel ? f.joursChoisis.filter(x => x !== j) : [...f.joursChoisis, j]
                            }))}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition ${sel ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'bg-white/10 text-emerald-200 hover:bg-white/20'}`}
                          >
                            {j}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Entreprise */}
                <div className="space-y-1.5">
                  <Label className="text-emerald-200 text-xs font-semibold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Entreprise
                  </Label>
                  <Select
                    value={form.entrepriseId}
                    onValueChange={v => {
                      const e = entreprises.find(x => x.id === v);
                      setForm(f => ({
                        ...f,
                        entrepriseId: v,
                        entrepriseNom: e?.nom || '',
                        typePaiement: e?.typePaiement || f.typePaiement,
                        prixHeure: e?.typePaiement === 'horaire' ? (e.prix || f.prixHeure) : f.prixHeure,
                        prixJournalier: e?.typePaiement === 'journalier' ? (e.prix || f.prixJournalier) : f.prixJournalier,
                      }));
                    }}
                  >
                    <SelectTrigger className="bg-white/10 border-emerald-400/30 text-emerald-100 rounded-xl h-10">
                      <SelectValue placeholder="Sélectionner une entreprise" />
                    </SelectTrigger>
                    <SelectContent className="bg-emerald-900/95 backdrop-blur-xl border-emerald-600/50 text-emerald-100">
                      {entreprises.map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.nom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Type paiement & montants */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-emerald-200 text-xs font-semibold">Type</Label>
                    <Select
                      value={form.typePaiement}
                      onValueChange={(v: 'journalier' | 'horaire') => setForm(f => ({ ...f, typePaiement: v }))}
                    >
                      <SelectTrigger className="bg-white/10 border-emerald-400/30 text-emerald-100 rounded-xl h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-emerald-900/95 border-emerald-600/50 text-emerald-100">
                        <SelectItem value="journalier">Journalier</SelectItem>
                        <SelectItem value="horaire">Horaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {form.typePaiement === 'horaire' ? (
                    <>
                      <div className="space-y-1.5">
                        <Label className="text-emerald-200 text-xs font-semibold">Heures</Label>
                        <Input type="number" step="0.5" value={form.heures}
                          onChange={e => setForm(f => ({ ...f, heures: parseFloat(e.target.value) || 0 }))}
                          className="bg-white/10 border-emerald-400/30 text-emerald-100 rounded-xl h-10" />
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <Label className="text-emerald-200 text-xs font-semibold">Prix / heure (€)</Label>
                        <Input type="number" step="0.5" value={form.prixHeure}
                          onChange={e => setForm(f => ({ ...f, prixHeure: parseFloat(e.target.value) || 0 }))}
                          className="bg-white/10 border-emerald-400/30 text-emerald-100 rounded-xl h-10" />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-1.5">
                      <Label className="text-emerald-200 text-xs font-semibold">Prix journalier (€)</Label>
                      <Input type="number" step="1" value={form.prixJournalier}
                        onChange={e => setForm(f => ({ ...f, prixJournalier: parseFloat(e.target.value) || 0 }))}
                        className="bg-white/10 border-emerald-400/30 text-emerald-100 rounded-xl h-10" />
                    </div>
                  )}
                </div>

                {/* Montant total preview */}
                <div className="rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 px-4 py-3 flex items-center justify-between">
                  <span className="text-xs text-emerald-200 font-semibold">Montant total</span>
                  <span className="text-lg font-black bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                    {computeMontant(form).toFixed(2)} €
                  </span>
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between rounded-xl bg-white/5 border border-emerald-400/20 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Power className="w-4 h-4 text-emerald-300" />
                    <span className="text-sm text-emerald-100 font-semibold">Activer ce pointage auto</span>
                  </div>
                  <button
                    onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                    className={`relative w-11 h-6 rounded-full transition ${form.active ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : 'bg-white/20'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${form.active ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="relative p-4 border-t border-emerald-500/30 flex gap-2">
                <Button variant="outline" onClick={() => setShowForm(false)}
                  className="flex-1 bg-white/5 border-emerald-400/30 text-emerald-100 hover:bg-white/10 rounded-xl">
                  Annuler
                </Button>
                <Button onClick={submit}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/40 rounded-xl">
                  <Save className="w-4 h-4 mr-1.5" /> {editingId ? 'Modifier' : 'Ajouter'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog de confirmation ultra luxe */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && !deleting && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-950 via-rose-950/40 to-red-950/30 backdrop-blur-3xl border border-rose-300/20 rounded-3xl overflow-hidden shadow-[0_30px_120px_rgba(244,63,94,0.45)] max-w-md p-0">
          {/* Décor lumineux */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -right-32 w-72 h-72 bg-gradient-to-br from-rose-500/30 via-red-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-gradient-to-tr from-red-600/30 via-rose-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-rose-500/10 to-transparent rounded-full blur-2xl" />
          </div>

          {/* Bordure dégradée */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-rose-400/20 via-transparent to-red-400/20 p-[1px]">
              <div className="w-full h-full rounded-3xl bg-transparent" />
            </div>
          </div>

          <div className="relative p-7">
            <AlertDialogHeader className="space-y-5">
              {/* Icône premium */}
              <div className="mx-auto relative">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="relative w-24 h-24 bg-gradient-to-br from-rose-400 via-red-500 to-rose-700 rounded-3xl flex items-center justify-center shadow-[0_20px_60px_rgba(244,63,94,0.6)] rotate-3"
                >
                  <ShieldAlert className="h-12 w-12 text-white drop-shadow-2xl" strokeWidth={2.2} />
                  {/* Reflet */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 via-white/10 to-transparent opacity-60" />
                  {/* Diamond accent */}
                  <Diamond className="absolute -top-2 -right-2 h-5 w-5 text-rose-200 fill-rose-300 drop-shadow-lg" />
                  <Sparkles className="absolute -bottom-1 -left-1 h-4 w-4 text-yellow-200 fill-yellow-300 drop-shadow-lg" />
                </motion.div>
                {/* Halo */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-400 via-red-500 to-rose-700 rounded-3xl blur-2xl opacity-50 -z-10 scale-125 animate-pulse" />
              </div>

              <AlertDialogTitle className="text-center text-2xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-rose-200 via-red-100 to-rose-200 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(244,63,94,0.5)]">
                  Suppression définitive
                </span>
              </AlertDialogTitle>

              <AlertDialogDescription asChild>
                <div className="space-y-4 text-center">
                  <p className="text-sm text-rose-100/80 font-medium leading-relaxed">
                    Vous êtes sur le point de supprimer cette règle de pointage automatique.
                  </p>

                  {deleteTarget && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="relative mx-auto rounded-2xl bg-gradient-to-br from-white/10 via-rose-500/10 to-red-500/10 backdrop-blur-xl border border-rose-300/20 p-4 shadow-inner"
                    >
                      <div className="flex items-center gap-3 justify-center">
                        <div className="p-2 bg-gradient-to-br from-rose-400/30 to-red-500/30 rounded-xl border border-rose-300/30">
                          <User className="h-4 w-4 text-rose-100" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-white truncate max-w-[180px]">
                            {deleteTarget.travailleurNom || 'Personne'}
                          </p>
                          <p className="text-xs text-rose-200/70 truncate max-w-[180px]">
                            {deleteTarget.entrepriseNom || 'Entreprise'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex items-center justify-center gap-2 pt-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-amber-200 to-rose-200 bg-clip-text text-transparent">
                      Action irréversible
                    </span>
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="relative flex gap-3 pt-6 sm:flex-row">
              <AlertDialogCancel
                disabled={deleting}
                className={cn(
                  "flex-1 h-12 rounded-2xl font-bold text-sm m-0",
                  "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl",
                  "border border-white/20 hover:border-white/30",
                  "text-white/90 hover:text-white hover:bg-white/15",
                  "shadow-lg transition-all duration-300",
                  "flex items-center justify-center gap-2"
                )}
              >
                <XCircle className="h-4 w-4" />
                Annuler
              </AlertDialogCancel>

              <AlertDialogAction
                onClick={(e) => { e.preventDefault(); confirmDelete(); }}
                disabled={deleting}
                className={cn(
                  "flex-1 h-12 rounded-2xl font-black text-sm relative overflow-hidden",
                  "bg-gradient-to-br from-rose-500 via-red-600 to-rose-700",
                  "hover:from-rose-600 hover:via-red-700 hover:to-rose-800",
                  "text-white border border-rose-300/40",
                  "shadow-[0_20px_60px_rgba(244,63,94,0.6)] hover:shadow-[0_25px_70px_rgba(244,63,94,0.7)]",
                  "transition-all duration-300 transform hover:-translate-y-0.5",
                  "flex items-center justify-center gap-2",
                  "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                )}
              >
                {/* Mirror shine */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
                <span className="relative flex items-center gap-2">
                  {deleting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </>
                  )}
                </span>
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de désactivation : permanent ou temporaire */}
      <AnimatePresence>
        {deactivateTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeactivateTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 22 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl bg-gradient-to-br from-amber-900/95 via-orange-900/95 to-red-900/95 border-2 border-amber-500/40 shadow-2xl shadow-amber-500/30 backdrop-blur-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-transparent rounded-bl-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-red-400/20 to-transparent rounded-tr-full pointer-events-none" />
              <div className="relative p-5 border-b border-amber-500/30">
                <button onClick={() => setDeactivateTarget(null)} className="absolute top-3 right-3 p-1.5 rounded-lg text-amber-200 hover:bg-white/10">
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/40">
                    <Power className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black bg-gradient-to-r from-amber-300 via-orange-300 to-red-300 bg-clip-text text-transparent flex items-center gap-2">
                      Désactivation du pointage
                      <AlertTriangle className="w-4 h-4 text-amber-300 animate-pulse" />
                    </h3>
                    <p className="text-xs text-amber-200/80 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Choisissez le type
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative p-5 space-y-3">
                <p className="text-xs text-amber-100/90 leading-relaxed">
                  Voulez-vous désactiver <span className="font-bold">{deactivateTarget.travailleurNom}</span> de façon temporaire ou permanente ?
                </p>
                <button
                  onClick={() => confirmDeactivate(false)}
                  className="w-full p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-400/40 hover:from-amber-500/30 hover:to-orange-500/30 text-left transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/30">
                      <Clock className="w-4 h-4 text-amber-200" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-amber-100">Désactivation temporaire</div>
                      <div className="text-[11px] text-amber-200/70">Réactivable à tout moment</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => confirmDeactivate(true)}
                  className="w-full p-4 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-400/40 hover:from-red-500/30 hover:to-rose-500/30 text-left transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-red-500/30">
                      <ShieldAlert className="w-4 h-4 text-red-200" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-red-100">Désactivation permanente</div>
                      <div className="text-[11px] text-red-200/70">Ne pourra plus être réactivée</div>
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de réactivation : date de début */}
      <AnimatePresence>
        {reactivateTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setReactivateTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 22 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl bg-gradient-to-br from-emerald-900/95 via-teal-900/95 to-green-900/95 border-2 border-emerald-500/40 shadow-2xl shadow-emerald-500/30 backdrop-blur-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-bl-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-400/20 to-transparent rounded-tr-full pointer-events-none" />
              <div className="relative p-5 border-b border-emerald-500/30">
                <button onClick={() => setReactivateTarget(null)} className="absolute top-3 right-3 p-1.5 rounded-lg text-emerald-200 hover:bg-white/10">
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/40">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black bg-gradient-to-r from-emerald-300 via-teal-300 to-green-300 bg-clip-text text-transparent flex items-center gap-2">
                      Réactivation du pointage
                      <Crown className="w-4 h-4 text-yellow-400 animate-pulse" />
                    </h3>
                    <p className="text-xs text-emerald-200/80 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Date de début
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative p-5 space-y-4">
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  À partir de quelle date les pointages automatiques doivent-ils reprendre pour <span className="font-bold">{reactivateTarget.travailleurNom}</span> ? Tous les jours manqués depuis cette date seront rattrapés.
                </p>
                <div className="space-y-1.5">
                  <Label className="text-emerald-200 text-xs font-semibold flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" /> Date de début
                  </Label>
                  <Input
                    type="date"
                    value={reactivateDate}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={e => setReactivateDate(e.target.value)}
                    className="bg-white/10 border-emerald-400/30 text-emerald-100 rounded-xl h-10"
                  />
                </div>
              </div>
              <div className="relative p-4 border-t border-emerald-500/30 flex gap-2">
                <Button variant="outline" onClick={() => setReactivateTarget(null)}
                  className="flex-1 bg-white/5 border-emerald-400/30 text-emerald-100 hover:bg-white/10 rounded-xl">
                  Annuler
                </Button>
                <Button onClick={confirmReactivate} disabled={!reactivateDate}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/40 rounded-xl">
                  <Check className="w-4 h-4 mr-1.5" /> Valider
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PointageAutoSection;
