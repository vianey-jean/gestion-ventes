/**
 * VersementEspece - Composant ultra-luxe pour gérer les versements espèce
 * avec fenêtre glissante de 30 jours et plafond mensuel autorisé.
 * Décomposé en composants réutilisables (dossier ./versement).
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Banknote, Sparkles, Crown } from 'lucide-react';
import { versementService, bankService } from '@/service/api';
import {
  VersementActions,
  VersementTable,
  VersementPlafondModal,
  VersementAddModal,
  VersementEditModal,
  VersementForecastModal,
  AddBankModal,
  VersementConfirmDialog,
  Versement,
  Bank,
  formatAmount,
  formatDateFR,
  startOfDay,
  addDays,
} from './versement';

const VersementEspece: React.FC = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [maxOpen, setMaxOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [forecastOpen, setForecastOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [maxMonthly, setMaxMonthly] = useState(0);
  const [versements, setVersements] = useState<Versement[]>([]);
  const [newMaxValue, setNewMaxValue] = useState('');
  const [newV, setNewV] = useState({
    date: new Date().toISOString().substring(0, 10),
    montant: '',
    description: '',
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editingV, setEditingV] = useState<Versement | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  // Banques
  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [addBankOpen, setAddBankOpen] = useState(false);
  const [newBankName, setNewBankName] = useState('');

  const fetchBanks = async () => {
    try {
      setBanksLoading(true);
      setBanks(await bankService.getAll());
    } catch (e) { console.error(e); }
    finally { setBanksLoading(false); }
  };
  useEffect(() => { fetchBanks(); }, []);

  const handleAddBank = async () => {
    const name = newBankName.trim();
    if (!name) {
      toast({ title: 'Erreur', description: 'Nom requis', variant: 'destructive' });
      return;
    }
    try {
      const bank = await bankService.add(name);
      await fetchBanks();
      // sélectionne automatiquement la nouvelle banque
      if (editOpen && editingV) {
        setEditingV(s => s ? ({ ...s, description: bank.name }) : null);
      } else {
        setNewV(s => ({ ...s, description: bank.name }));
      }
      setAddBankOpen(false);
      setNewBankName('');
      toast({ title: 'Banque ajoutée', description: bank.name, className: 'bg-app-green text-white' });
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.response?.data?.message || 'Échec ajout', variant: 'destructive' });
    }
  };

  const handleRemoveBank = async (id: string) => {
    try { await bankService.remove(id); fetchBanks(); } catch { /* silencieux */ }
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const data = await versementService.getAll();
      setMaxMonthly(Number(data.maxMonthly) || 0);
      setVersements(Array.isArray(data.versements) ? data.versements : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Fenêtre glissante : aujourd'hui-30 jours -> aujourd'hui
  const today = startOfDay(new Date());
  const windowStart = addDays(today, -30);

  const windowVersements = useMemo(
    () =>
      versements
        .filter((v) => {
          const d = startOfDay(new Date(v.date));
          return d > windowStart && d <= today;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [versements, today.getTime()]
  );

  const totalWindow = useMemo(
    () => windowVersements.reduce((s, v) => s + (Number(v.montant) || 0), 0),
    [windowVersements]
  );

  const reste = Math.max(0, maxMonthly - totalWindow);

  // Prévision sur 30 jours : à chaque jour futur, combien sera disponible
  const forecast = useMemo(() => {
    const rows: Array<{ date: Date; disponible: number; libere: number }> = [];
    let lastDispo = reste;
    for (let i = 1; i <= 30; i++) {
      const d = addDays(today, i);
      const winStart = addDays(d, -30);
      const sumInWin = versements.reduce((s, v) => {
        const dv = startOfDay(new Date(v.date));
        return (dv > winStart && dv <= d) ? s + (Number(v.montant) || 0) : s;
      }, 0);
      const dispo = Math.max(0, maxMonthly - sumInWin);
      const libere = Math.max(0, dispo - lastDispo);
      rows.push({ date: d, disponible: dispo, libere });
      lastDispo = dispo;
    }
    return rows;
  }, [versements, maxMonthly, today.getTime(), reste]);

  const handleSetMax = async () => {
    const v = parseFloat(newMaxValue);
    if (isNaN(v) || v < 0) {
      toast({ title: 'Erreur', description: 'Montant invalide', variant: 'destructive' });
      return;
    }
    try {
      setSaving(true);
      await versementService.setMax(v);
      setMaxMonthly(v);
      setMaxOpen(false);
      setNewMaxValue('');
      toast({ title: 'Succès', description: 'Plafond mensuel mis à jour', className: 'bg-app-green text-white' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    const m = parseFloat(newV.montant);
    if (!newV.date || isNaN(m) || m <= 0) {
      toast({ title: 'Erreur', description: 'Date et montant requis', variant: 'destructive' });
      return;
    }
    try {
      setSaving(true);
      await versementService.add({ date: newV.date, montant: m, description: newV.description });
      setAddOpen(false);
      setNewV({ date: new Date().toISOString().substring(0, 10), montant: '', description: '' });
      fetchAll();
      toast({ title: 'Versement enregistré', description: formatAmount(m), className: 'bg-app-green text-white' });
    } catch {
      toast({ title: 'Erreur', description: 'Échec de l\'enregistrement', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (id: string) => {
    setConfirmData({
      title: 'Confirmer la suppression',
      message: 'Êtes-vous sûr de vouloir supprimer ce versement ? Cette action est irréversible.',
      onConfirm: async () => {
        try {
          await versementService.remove(id);
          fetchAll();
          toast({ title: 'Supprimé', className: 'bg-app-blue text-white' });
        } catch {
          toast({ title: 'Erreur', variant: 'destructive' });
        } finally {
          setConfirmOpen(false);
          setConfirmData(null);
        }
      },
    });
    setConfirmOpen(true);
  };

  const openEditModal = (v: Versement) => {
    setEditingV({ ...v });
    setEditOpen(true);
  };

  const requestEdit = () => {
    if (!editingV) return;
    const m = parseFloat(String(editingV.montant));
    if (!editingV.date || isNaN(m) || m <= 0) {
      toast({ title: 'Erreur', description: 'Date et montant requis', variant: 'destructive' });
      return;
    }
    setConfirmData({
      title: 'Confirmer la modification',
      message: `Modifier le versement du ${formatDateFR(editingV.date)} pour un montant de ${formatAmount(m)} ?`,
      onConfirm: async () => {
        try {
          await versementService.update(editingV.id, {
            date: editingV.date,
            montant: m,
            description: editingV.description,
          });
          setEditOpen(false);
          setEditingV(null);
          fetchAll();
          toast({ title: 'Versement modifié', description: formatAmount(m), className: 'bg-app-green text-white' });
        } catch {
          toast({ title: 'Erreur', description: 'Échec de la modification', variant: 'destructive' });
        } finally {
          setConfirmOpen(false);
          setConfirmData(null);
        }
      },
    });
    setConfirmOpen(true);
  };

  // Carte cliquable
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative w-full text-left overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/30 dark:via-yellow-900/20 dark:to-orange-900/30 border border-amber-200/60 dark:border-amber-700/40 shadow-[0_30px_80px_rgba(245,158,11,0.25)] hover:shadow-[0_40px_120px_rgba(245,158,11,0.4)] transition-all duration-500 hover:-translate-y-1 p-6 sm:p-8"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-300/10 via-transparent to-yellow-300/20 pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-300/20 rounded-full pointer-events-none" />

        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="relative rounded-2xl p-4 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 shadow-[0_15px_40px_rgba(245,158,11,0.5)] border border-amber-300/40">
              <Banknote className="h-7 w-7 text-white drop-shadow-lg" />
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-200 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold tracking-wide bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-700 dark:from-amber-300 dark:via-orange-300 dark:to-yellow-300 bg-clip-text text-transparent flex items-center gap-2">
                Versement espèce
                <Crown className="h-5 w-5 text-amber-500" />
              </h3>
              <p className="text-xs sm:text-sm text-amber-700/80 dark:text-amber-200/80 font-medium">
                Voir l'historique des 30 derniers jours
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-700 dark:text-amber-300 drop-shadow-sm">
              {formatAmount(totalWindow)}
            </span>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-amber-600/80 dark:text-amber-300/80 font-bold">
              30 derniers jours · {windowVersements.length} versement{windowVersements.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </button>

      {/* Modale principale */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-amber-50/40 to-yellow-50/40 dark:from-gray-900 dark:via-amber-950/30 dark:to-yellow-950/30 border border-amber-200/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="relative rounded-xl p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                <Banknote className="h-6 w-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent font-extrabold">
                Versements espèce
              </span>
            </DialogTitle>
          </DialogHeader>

          {/* Actions principales */}
          <VersementActions
            maxMonthly={maxMonthly}
            reste={reste}
            totalWindow={totalWindow}
            count={windowVersements.length}
            onOpenPlafond={() => { setNewMaxValue(String(maxMonthly || '')); setMaxOpen(true); }}
            onOpenForecast={() => setForecastOpen(true)}
            onOpenAdd={() => setAddOpen(true)}
          />

          {/* Tableau */}
          <VersementTable
            versements={windowVersements}
            loading={loading}
            periodStart={addDays(today, -30).toISOString()}
            periodEnd={today.toISOString()}
            total={totalWindow}
            onEdit={openEditModal}
            onDelete={requestDelete}
          />
        </DialogContent>
      </Dialog>

      {/* Modale Plafond */}
      <VersementPlafondModal
        open={maxOpen}
        onOpenChange={setMaxOpen}
        value={newMaxValue}
        onValueChange={setNewMaxValue}
        onSave={handleSetMax}
        saving={saving}
      />

      {/* Modale Ajout */}
      <VersementAddModal
        open={addOpen}
        onOpenChange={setAddOpen}
        value={newV}
        onChange={(updater) => setNewV(updater)}
        banks={banks}
        banksLoading={banksLoading}
        onAddBank={() => { setNewBankName(''); setAddBankOpen(true); }}
        onSave={handleAdd}
        saving={saving}
      />

      {/* Modale Modifier */}
      <VersementEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        versement={editingV}
        onChange={(updater) => setEditingV(updater)}
        banks={banks}
        banksLoading={banksLoading}
        onAddBank={() => { setNewBankName(''); setAddBankOpen(true); }}
        onSave={requestEdit}
      />

      {/* Modale Prévision 30 jours */}
      <VersementForecastModal
        open={forecastOpen}
        onOpenChange={setForecastOpen}
        forecast={forecast}
        reste={reste}
        maxMonthly={maxMonthly}
        loading={loading}
      />

      {/* Modale Ajouter Banque */}
      <AddBankModal
        open={addBankOpen}
        onOpenChange={setAddBankOpen}
        name={newBankName}
        onNameChange={setNewBankName}
        banks={banks}
        loading={banksLoading}
        onSave={handleAddBank}
        onRemoveBank={handleRemoveBank}
      />

      {/* Confirmation */}
      <VersementConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmData?.title}
        message={confirmData?.message}
        onConfirm={() => confirmData?.onConfirm()}
      />
    </>
  );
};

export default VersementEspece;
