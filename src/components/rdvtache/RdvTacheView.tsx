/**
 * RdvTacheView.tsx - Vue principale de l'onglet "RDV" du module Pointage.
 * Boutons : Ajouter RDV, RDV du jour, Ajouter tâche, Ajouter travailleur.
 * Affiche un calendrier mensuel avec compteur de RDV par jour.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CalendarHeart, Eye, Plus, Scissors, UserPlus, Sparkles, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import rdvTachesApi, { RdvTache } from '@/services/api/rdvTachesApi';
import tachesRdvApi, { TacheRdvCatalog } from '@/services/api/tachesRdvApi';
import travailleurApi from '@/services/api/travailleurApi';
import RdvTacheCalendar from './RdvTacheCalendar';
import RdvDayModal from './RdvDayModal';
import RdvFormModal from './RdvFormModal';
import AddCatalogTacheModal from './AddCatalogTacheModal';
import ConfirmDialog from './ConfirmDialog';
import TravailleurModal from '@/components/pointage/modals/TravailleurModal';

const premiumBtnClass = "group relative overflow-hidden rounded-xl sm:rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 px-4 py-2 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold";
const mirrorShine = "absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500";

const todayStr = () => new Date().toISOString().split('T')[0];

const RdvTacheView: React.FC = () => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rdvs, setRdvs] = useState<RdvTache[]>([]);
  const [catalog, setCatalog] = useState<TacheRdvCatalog[]>([]);
  const [loading, setLoading] = useState(true);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showAddCatalog, setShowAddCatalog] = useState(false);
  const [showTravailleurModal, setShowTravailleurModal] = useState(false);
  const [showCatalogListModal, setShowCatalogListModal] = useState(false);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [editing, setEditing] = useState<RdvTache | null>(null);
  const [defaultDate, setDefaultDate] = useState<string | undefined>(undefined);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pendingEdit, setPendingEdit] = useState<RdvTache | null>(null);

  const [travForm, setTravForm] = useState({ nom: '', prenom: '', adresse: '', phone: '', genre: 'femme' as 'homme' | 'femme', role: 'autre' as 'administrateur' | 'autre' });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [rRes, cRes] = await Promise.all([
        rdvTachesApi.getByMonth(year, month + 1),
        tachesRdvApi.getAll(),
      ]);
      setRdvs(Array.isArray(rRes.data) ? rRes.data : []);
      setCatalog(Array.isArray(cRes.data) ? cRes.data : []);
    } catch (e) {
      console.error('Erreur chargement RDV-taches:', e);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Poll léger pour resync (5s) — le backend écrit les fichiers JSON synchroniquement
  useEffect(() => {
    const t = setInterval(() => {
      rdvTachesApi.getByMonth(year, month + 1).then(r => {
        setRdvs(prev => {
          const next = Array.isArray(r.data) ? r.data : [];
          if (next.length === prev.length && next.every((n, i) => prev[i]?.updatedAt === n.updatedAt && prev[i]?.id === n.id)) return prev;
          return next;
        });
      }).catch(() => {});
    }, 5000);
    return () => clearInterval(t);
  }, [year, month]);

  // --- Handlers RDV ---
  const handleSubmitRdv = async (data: Omit<RdvTache, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => {
    if (id) {
      const updated = await rdvTachesApi.update(id, data);
      setRdvs(prev => prev.map(r => r.id === id ? updated.data : r));
      toast({ title: '✅ RDV modifié' });
    } else {
      const created = await rdvTachesApi.create(data);
      setRdvs(prev => [...prev, created.data]);
      toast({ title: '✅ RDV créé', description: `${created.data.tacheNom} • ${created.data.date}` });
    }
    setShowFormModal(false);
    setEditing(null);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await rdvTachesApi.delete(deleteId);
      setRdvs(prev => prev.filter(r => r.id !== deleteId));
      toast({ title: '✅ RDV supprimé' });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setDeleteId(null);
    }
  };

  // --- Handlers Catalog tâche ---
  const handleAddCatalog = async (data: { nom: string; description?: string }) => {
    try {
      const created = await tachesRdvApi.create(data);
      setCatalog(prev => [...prev, created.data]);
      toast({ title: '✅ Tâche ajoutée', description: created.data.nom });
      setShowAddCatalog(false);
    } catch (err: any) {
      toast({ title: 'Erreur', description: err?.response?.data?.error || 'Ajout impossible', variant: 'destructive' });
    }
  };

  // --- Handler Travailleur ---
  const handleAddTravailleur = async () => {
    if (!travForm.nom || !travForm.prenom) {
      toast({ title: 'Erreur', description: 'Nom et prénom requis', variant: 'destructive' });
      return;
    }
    try {
      await travailleurApi.create(travForm);
      toast({ title: '✅ Travailleur ajouté' });
      setTravForm({ nom: '', prenom: '', adresse: '', phone: '', genre: 'femme', role: 'autre' });
      setShowTravailleurModal(false);
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const today = todayStr();
  const todayRdvs = rdvs.filter(r => r.date === today);
  const totalActifs = rdvs.filter(r => r.statut !== 'annule' && r.statut !== 'termine').length;

  return (
    <>
      {/* HERO */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 pt-6">
        <div className="rounded-3xl bg-gradient-to-br from-pink-500/10 via-fuchsia-500/10 to-rose-500/10 dark:from-pink-500/5 dark:via-fuchsia-500/5 dark:to-rose-500/5 backdrop-blur-2xl border border-pink-500/20 shadow-2xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-rose-500 flex items-center justify-center shadow-xl shadow-pink-500/40">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-pink-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">
                    Rendez-vous Beauté
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                    Tissages • Tresses • Perruques • Extensions
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-[11px] font-bold text-pink-600 dark:text-pink-300">
                  📅 {totalActifs} RDV actifs
                </span>
                <span className="px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-[11px] font-bold text-fuchsia-600 dark:text-fuchsia-300">
                  🌟 {todayRdvs.length} aujourd'hui
                </span>
                <button
                  type="button"
                  onClick={() => setShowCatalogListModal(true)}
                  className="px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-[11px] font-bold text-rose-600 dark:text-rose-300 hover:bg-rose-500/25 hover:scale-105 transition-all cursor-pointer"
                >
                  ✂️ {catalog.length} tâches au catalogue
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={() => { setEditing(null); setDefaultDate(today); setShowFormModal(true); }}
                className={cn(premiumBtnClass, 'bg-gradient-to-br from-pink-500 via-fuchsia-500 to-rose-500 border-pink-300/40 text-white shadow-lg shadow-pink-500/30')}>
                <span className={mirrorShine} />
                <span className="relative flex items-center gap-1.5"><CalendarHeart className="h-4 w-4" /> Ajouter RDV</span>
              </button>
              <button onClick={() => { setSelectedDay(today); setShowDayModal(true); }}
                className={cn(premiumBtnClass, 'bg-gradient-to-br from-amber-500 to-orange-500 border-amber-300/40 text-white shadow-lg shadow-amber-500/30')}>
                <span className={mirrorShine} />
                <span className="relative flex items-center gap-1.5"><Eye className="h-4 w-4" /> RDV du jour</span>
              </button>
              <button onClick={() => setShowAddCatalog(true)}
                className={cn(premiumBtnClass, 'bg-gradient-to-br from-violet-500 to-purple-600 border-violet-300/40 text-white shadow-lg shadow-violet-500/30')}>
                <span className={mirrorShine} />
                <span className="relative flex items-center gap-1.5"><Scissors className="h-4 w-4" /> Ajouter tâche</span>
              </button>
              <button onClick={() => setShowTravailleurModal(true)}
                className={cn(premiumBtnClass, 'bg-gradient-to-br from-red-500 to-rose-600 border-red-300/40 text-white shadow-lg shadow-red-500/30')}>
                <span className={mirrorShine} />
                <span className="relative flex items-center gap-1.5"><UserPlus className="h-4 w-4" /> Travailleur</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 pb-12 pt-6 space-y-6">
        <RdvTacheCalendar
          currentDate={currentDate}
          rdvs={rdvs}
          onPrevMonth={() => setCurrentDate(new Date(year, month - 1, 1))}
          onNextMonth={() => setCurrentDate(new Date(year, month + 1, 1))}
          onDayClick={(d) => { setSelectedDay(d); setShowDayModal(true); }}
        />

        {/* Liste catalogue compacte */}
        {catalog.length > 0 && (
          <div className="rounded-3xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/10 p-4">
            <p className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-2">
              <Scissors className="h-3.5 w-3.5 text-fuchsia-400" /> Catalogue des tâches
            </p>
            <div className="flex flex-wrap gap-2">
              {catalog.map(c => (
                <span key={c.id}
                  className="px-3 py-1 rounded-full text-[11px] font-bold bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-600 dark:text-fuchsia-300">
                  ✨ {c.nom}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <RdvDayModal
        open={showDayModal}
        onOpenChange={setShowDayModal}
        selectedDay={selectedDay}
        rdvs={rdvs}
        onAdd={() => { setEditing(null); setDefaultDate(selectedDay || today); setShowDayModal(false); setShowFormModal(true); }}
        onEdit={(r) => setPendingEdit(r)}
        onDelete={(id) => setDeleteId(id)}
      />

      <RdvFormModal
        open={showFormModal}
        onOpenChange={(v) => { setShowFormModal(v); if (!v) setEditing(null); }}
        catalog={catalog}
        editing={editing}
        defaultDate={defaultDate}
        onSubmit={handleSubmitRdv}
      />

      <AddCatalogTacheModal
        open={showAddCatalog}
        onOpenChange={setShowAddCatalog}
        onSubmit={handleAddCatalog}
      />

      <TravailleurModal
        open={showTravailleurModal}
        onOpenChange={setShowTravailleurModal}
        form={travForm}
        setForm={setTravForm}
        onSubmit={handleAddTravailleur}
        premiumBtnClass={premiumBtnClass}
        mirrorShine={mirrorShine}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => { if (!v) setDeleteId(null); }}
        title="Supprimer ce RDV ?"
        description="Cette action est irréversible."
        confirmLabel="🗑️ Supprimer"
        destructive
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={!!pendingEdit}
        onOpenChange={(v) => { if (!v) setPendingEdit(null); }}
        title="Modifier ce RDV ?"
        description="Vous allez ouvrir le formulaire d'édition."
        confirmLabel="✏️ Modifier"
        onConfirm={() => {
          if (pendingEdit) {
            setEditing(pendingEdit);
            setDefaultDate(pendingEdit.date);
            setShowDayModal(false);
            setShowFormModal(true);
          }
          setPendingEdit(null);
        }}
      />

      {/* Modale Liste catalogue tâches */}
      <Dialog open={showCatalogListModal} onOpenChange={setShowCatalogListModal}>
        <DialogContent className="bg-gradient-to-br from-slate-900 via-rose-900/30 to-pink-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-w-lg max-h-[80vh] overflow-hidden">
          <DialogHeader className="text-center space-y-2 pb-3">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-xl shadow-rose-500/30">
              <Scissors className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-lg font-black bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400 bg-clip-text text-transparent">
              ✂️ Catalogue des tâches ({catalog.length})
            </DialogTitle>
            <p className="text-[11px] text-white/50">Liste complète des prestations disponibles</p>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[55vh] pr-2 space-y-2">
            {catalog.length === 0 && (
              <p className="text-center text-xs text-white/40 py-8">Aucune tâche au catalogue</p>
            )}
            {catalog.map((c, i) => (
              <div key={c.id}
                className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-500/20 hover:border-rose-400/50 transition-all">
                <span className="shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 text-white text-[11px] font-black flex items-center justify-center shadow-md">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">✨ {c.nom}</p>
                  {c.description && (
                    <p className="text-[11px] text-white/60 mt-0.5 line-clamp-2">{c.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RdvTacheView;
