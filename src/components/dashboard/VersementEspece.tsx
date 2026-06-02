/**
 * VersementEspece - Composant ultra-luxe pour gérer les versements espèce
 * avec fenêtre glissante de 30 jours et plafond mensuel autorisé.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  Banknote, Plus, Trash2, Pencil, Settings2, Calendar, TrendingUp,
  Sparkles, Coins, Crown, ShieldCheck, CalendarClock, Wallet
} from 'lucide-react';
import { versementService } from '@/service/api';

type Versement = {
  id: string;
  date: string;
  montant: number;
  description?: string;
  createdAt?: string;
};

const formatAmount = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);

const formatDateFR = (d: string) => {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
    }).format(new Date(d));
  } catch {
    return d;
  }
};

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

const VersementEspece: React.FC = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [maxOpen, setMaxOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [forecastOpen, setForecastOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
      await versementService.setMax(v);
      setMaxMonthly(v);
      setMaxOpen(false);
      setNewMaxValue('');
      toast({ title: 'Succès', description: 'Plafond mensuel mis à jour', className: 'bg-app-green text-white' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour', variant: 'destructive' });
    }
  };

  const handleAdd = async () => {
    const m = parseFloat(newV.montant);
    if (!newV.date || isNaN(m) || m <= 0) {
      toast({ title: 'Erreur', description: 'Date et montant requis', variant: 'destructive' });
      return;
    }
    try {
      await versementService.add({ date: newV.date, montant: m, description: newV.description });
      setAddOpen(false);
      setNewV({ date: new Date().toISOString().substring(0, 10), montant: '', description: '' });
      fetchAll();
      toast({ title: 'Versement enregistré', description: formatAmount(m), className: 'bg-app-green text-white' });
    } catch {
      toast({ title: 'Erreur', description: 'Échec de l\'enregistrement', variant: 'destructive' });
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
        className="group relative w-full text-left overflow-hidden
                   rounded-[2rem]
                   bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50
                   dark:from-amber-900/30 dark:via-yellow-900/20 dark:to-orange-900/30
                   border border-amber-200/60 dark:border-amber-700/40
                   shadow-[0_30px_80px_rgba(245,158,11,0.25)]
                   hover:shadow-[0_40px_120px_rgba(245,158,11,0.4)]
                   transition-all duration-500 hover:-translate-y-1
                   p-6 sm:p-8"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-300/10 via-transparent to-yellow-300/20 pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="relative rounded-2xl p-4
                            bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500
                            shadow-[0_15px_40px_rgba(245,158,11,0.5)]
                            border border-amber-300/40">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <Button
              onClick={() => { setNewMaxValue(String(maxMonthly || '')); setMaxOpen(true); }}
              className="group h-auto py-4 bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-[0_15px_40px_rgba(139,92,246,0.4)] rounded-2xl border border-violet-300/30"
            >
              <Settings2 className="h-5 w-5 mr-2" />
              <div className="text-left">
                <div className="text-xs opacity-90 font-medium">Plafond mensuel</div>
                <div className="font-extrabold">{formatAmount(maxMonthly)}</div>
              </div>
            </Button>

            <Button
              onClick={() => setForecastOpen(true)}
              className="group h-auto py-4 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-[0_15px_40px_rgba(16,185,129,0.4)] rounded-2xl border border-emerald-300/30"
            >
              <ShieldCheck className="h-5 w-5 mr-2" />
              <div className="text-left">
                <div className="text-xs opacity-90 font-medium">Reste de droit</div>
                <div className="font-extrabold">{formatAmount(reste)}</div>
              </div>
            </Button>

            <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border border-amber-200 dark:border-amber-700/40 shadow-inner">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
                <TrendingUp className="h-4 w-4" />
                Total fenêtre
              </div>
              <div className="text-xl font-extrabold text-amber-800 dark:text-amber-200 mt-1">
                {formatAmount(totalWindow)}
              </div>
              <div className="text-[10px] text-amber-600 dark:text-amber-300/80">{windowVersements.length} versement(s)</div>
            </div>

            <Button
              onClick={() => setAddOpen(true)}
              className="group h-auto py-4 bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-[0_15px_40px_rgba(244,63,94,0.4)] rounded-2xl border border-rose-300/30"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="font-extrabold">Nouveau versement</span>
            </Button>
          </div>

          {/* Tableau */}
          <div className="mt-6 rounded-2xl overflow-hidden border border-amber-200/50 dark:border-amber-700/30 bg-white/70 dark:bg-gray-900/40">
            <div className="px-5 py-3 bg-gradient-to-r from-amber-100/80 to-yellow-100/80 dark:from-amber-900/30 dark:to-yellow-900/30 border-b border-amber-200/50 flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-amber-600" />
              <span className="font-bold text-amber-800 dark:text-amber-200">
                Du {formatDateFR(addDays(today, -30).toISOString())} au {formatDateFR(today.toISOString())}
              </span>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-amber-50/50 dark:bg-amber-900/20">
                    <TableHead className="font-bold text-amber-700 dark:text-amber-300">Date</TableHead>
                    <TableHead className="font-bold text-amber-700 dark:text-amber-300">Description</TableHead>
                    <TableHead className="text-right font-bold text-amber-700 dark:text-amber-300">Montant</TableHead>
                    <TableHead className="text-right font-bold text-amber-700 dark:text-amber-300">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-amber-600">Chargement...</TableCell></TableRow>
                  ) : windowVersements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="rounded-full p-5 bg-gradient-to-br from-amber-200/60 to-yellow-200/60">
                            <Coins className="h-10 w-10 text-amber-600" />
                          </div>
                          <p className="text-amber-700 dark:text-amber-300 font-medium">
                            Aucun versement sur cette période
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    windowVersements.map(v => (
                      <TableRow key={v.id} className="hover:bg-amber-50/40 dark:hover:bg-amber-900/10 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-amber-500" />
                            {formatDateFR(v.date)}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{v.description || '—'}</TableCell>
                        <TableCell className="text-right font-extrabold text-amber-700 dark:text-amber-300">
                          {formatAmount(v.montant)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditModal(v)}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 mr-1"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => requestDelete(v.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="px-5 py-4 bg-gradient-to-r from-amber-100/80 to-orange-100/80 dark:from-amber-900/30 dark:to-orange-900/30 border-t border-amber-200/50 flex justify-between items-center flex-wrap gap-2">
              <span className="text-sm font-bold text-amber-800 dark:text-amber-200">
                Nombre : {windowVersements.length}
              </span>
              <span className="text-lg font-extrabold text-amber-800 dark:text-amber-200">
                Total : {formatAmount(totalWindow)}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modale Plafond */}
      <Dialog open={maxOpen} onOpenChange={setMaxOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-violet-600" />
              Plafond mensuel autorisé
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Montant maximum sur 30 jours glissants</Label>
            <Input
              type="number"
              step="0.01"
              value={newMaxValue}
              onChange={(e) => setNewMaxValue(e.target.value)}
              placeholder="ex: 1500"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMaxOpen(false)}>Annuler</Button>
            <Button onClick={handleSetMax} className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modale Ajout */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-rose-600" />
              Nouveau versement espèce
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Date</Label>
              <Input type="date" value={newV.date} onChange={(e) => setNewV(s => ({ ...s, date: e.target.value }))} />
            </div>
            <div>
              <Label>Montant (€)</Label>
              <Input type="number" step="0.01" value={newV.montant} onChange={(e) => setNewV(s => ({ ...s, montant: e.target.value }))} placeholder="ex: 200" />
            </div>
            <div>
              <Label>Description (optionnel)</Label>
              <Input value={newV.description} onChange={(e) => setNewV(s => ({ ...s, description: e.target.value }))} placeholder="ex: Versement banque" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Annuler</Button>
            <Button onClick={handleAdd} className="bg-gradient-to-r from-rose-500 to-pink-600 text-white">
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modale Modifier */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-blue-600" />
              Modifier le versement
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Date</Label>
              <Input type="date" value={editingV?.date || ''} onChange={(e) => setEditingV(s => s ? ({ ...s, date: e.target.value }) : null)} />
            </div>
            <div>
              <Label>Montant (€)</Label>
              <Input type="number" step="0.01" value={editingV?.montant || ''} onChange={(e) => setEditingV(s => s ? ({ ...s, montant: Number(e.target.value) }) : null)} placeholder="ex: 200" />
            </div>
            <div>
              <Label>Description (optionnel)</Label>
              <Input value={editingV?.description || ''} onChange={(e) => setEditingV(s => s ? ({ ...s, description: e.target.value }) : null)} placeholder="ex: Versement banque" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Annuler</Button>
            <Button onClick={requestEdit} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modale Prévision 30 jours */}
      <Dialog open={forecastOpen} onOpenChange={setForecastOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Reste de droit sur les 30 prochains jours
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-200/50 mb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="text-xs uppercase font-bold text-emerald-700 dark:text-emerald-300 tracking-wider">Disponible aujourd'hui</div>
                <div className="text-3xl font-extrabold text-emerald-800 dark:text-emerald-200">{formatAmount(reste)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase font-bold text-emerald-700 dark:text-emerald-300 tracking-wider">Plafond mensuel</div>
                <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{formatAmount(maxMonthly)}</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-emerald-200/50">
            <Table>
              <TableHeader>
                <TableRow className="bg-emerald-50 dark:bg-emerald-900/20">
                  <TableHead className="font-bold text-emerald-700 dark:text-emerald-300">Date</TableHead>
                  <TableHead className="text-right font-bold text-emerald-700 dark:text-emerald-300">Libéré ce jour</TableHead>
                  <TableHead className="text-right font-bold text-emerald-700 dark:text-emerald-300">Disponible total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forecast.map((row, i) => (
                  <TableRow key={i} className={row.libere > 0 ? 'bg-emerald-50/40 dark:bg-emerald-900/10' : ''}>
                    <TableCell className="font-medium">{formatDateFR(row.date.toISOString())}</TableCell>
                    <TableCell className="text-right font-bold text-emerald-700 dark:text-emerald-300">
                      {row.libere > 0 ? `+${formatAmount(row.libere)}` : '—'}
                    </TableCell>
                    <TableCell className="text-right font-extrabold">{formatAmount(row.disponible)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-gray-900 dark:via-slate-900 dark:to-zinc-900 border border-gray-200 dark:border-gray-700 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-gray-800 dark:text-gray-200">
              {confirmData?.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600 dark:text-gray-300">
              {confirmData?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel onClick={() => setConfirmOpen(false)} className="rounded-xl border-gray-300 dark:border-gray-600">
              Non, annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmData?.onConfirm()}
              className="rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700"
            >
              Oui, confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default VersementEspece;
