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
  CalendarDays, Building2, User, Power, Zap, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import pointageAutoApi, { PointageAutoEntry } from '@/services/api/pointageAutoApi';
import travailleurApi, { Travailleur } from '@/services/api/travailleurApi';
import entrepriseApi, { Entreprise } from '@/services/api/entrepriseApi';

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

  const remove = async (id: string) => {
    if (!confirm('Supprimer ce pointage automatique ?')) return;
    try {
      await pointageAutoApi.delete(id);
      toast({ title: 'Supprimé' });
      fetchAll();
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const toggleActive = async (item: PointageAutoEntry) => {
    try {
      await pointageAutoApi.update(item.id, { active: !item.active });
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
            <div className="animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full" />
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
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => toggleActive(item)}
                        className={`p-1 rounded ${item.active ? 'text-emerald-600 hover:bg-emerald-500/10' : 'text-muted-foreground hover:bg-muted'}`}
                        title={item.active ? 'Désactiver' : 'Activer'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openEdit(item)} className="p-1 rounded text-blue-600 hover:bg-blue-500/10">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => remove(item.id)} className="p-1 rounded text-red-600 hover:bg-red-500/10">
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
    </div>
  );
};

export default PointageAutoSection;
