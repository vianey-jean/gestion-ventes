import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarOff, Plus, Trash2, Clock, AlertTriangle, Edit, Repeat, CalendarDays
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import indisponibleApi, { Indisponibilite } from '@/services/api/indisponibleApi';

const JOURS_SEMAINE = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

const getJourSemaine = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day); // LOCAL SAFE (pas de décalage)
  return JOURS_SEMAINE[d.getDay()];
};

const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};


interface GroupedIndispo {
  groupId: string;
  jourSemaine: string;
  recurrence: string;
  heureDebut: string;
  heureFin: string;
  journeeComplete: boolean;
  motif: string;
  entries: Indisponibilite[];
  firstEntry: Indisponibilite;
}

const IndisponibiliteSection: React.FC = () => {
  const { toast } = useToast();
  const [indisponibilites, setIndisponibilites] = useState<Indisponibilite[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmGroup, setDeleteConfirmGroup] = useState<GroupedIndispo | null>(null);
  const [saving, setSaving] = useState(false);

  // Add form
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    heureDebut: '08:00',
    heureFin: '18:00',
    motif: '',
    journeeComplete: false,
    recurrence: 'once' as 'once' | 'weekly',
    nombreSemaines: 4,
  });

  // Edit form
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupedIndispo | null>(null);
  const [editForm, setEditForm] = useState({
    heureDebut: '08:00',
    heureFin: '18:00',
    motif: '',
    journeeComplete: false,
  });
  const [editSelectedDates, setEditSelectedDates] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await indisponibleApi.getAll();
      setIndisponibilites(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  // Group entries by groupId
  const grouped = useMemo(() => {
    const map = new Map<string, Indisponibilite[]>();
    indisponibilites.forEach(item => {
      const key = item.groupId || item.id;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });

    const groups: GroupedIndispo[] = [];
    map.forEach((entries, groupId) => {
      const first = entries.sort((a, b) => a.date.localeCompare(b.date))[0];
      groups.push({
        groupId,
        jourSemaine: first.jourSemaine || getJourSemaine(first.date),
        recurrence: first.recurrence || 'once',
        heureDebut: first.heureDebut,
        heureFin: first.heureFin,
        journeeComplete: first.journeeComplete,
        motif: first.motif,
        entries,
        firstEntry: first,
      });
    });

    return groups.sort((a, b) => b.firstEntry.date.localeCompare(a.firstEntry.date));
  }, [indisponibilites]);

  const handleAdd = async () => {
    try {
      setSaving(true);
      await indisponibleApi.create({
        date: form.date,
        heureDebut: form.heureDebut,
        heureFin: form.heureFin,
        motif: form.motif,
        journeeComplete: form.journeeComplete,
        recurrence: form.recurrence,
        nombreSemaines: form.recurrence === 'weekly' ? form.nombreSemaines : 1,
      });

      const jour = getJourSemaine(form.date);
      const desc = form.recurrence === 'weekly'
        ? `Chaque ${jour} pendant ${form.nombreSemaines} semaines`
        : `Le ${formatDate(form.date)}`;

      toast({
        title: '✅ Indisponibilité ajoutée',
        description: desc,
        className: 'bg-green-600 text-white border-green-600'
      });
      setShowAddDialog(false);
      setForm({
        date: new Date().toISOString().split('T')[0],
        heureDebut: '08:00', heureFin: '18:00', motif: '',
        journeeComplete: false, recurrence: 'once', nombreSemaines: 4
      });
      fetchData();
    } catch {
      toast({ title: 'Erreur', description: "Impossible d'ajouter", variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleEditOpen = (group: GroupedIndispo) => {
    setEditingGroup(group);
    setEditForm({
      heureDebut: group.heureDebut,
      heureFin: group.heureFin,
      motif: group.motif,
      journeeComplete: group.journeeComplete,
    });
    setEditSelectedDates(group.entries.map(e => e.date));
    setShowEditDialog(true);
  };

  const handleEditSubmit = async () => {
    if (!editingGroup) return;
    try {
      setSaving(true);
      await indisponibleApi.update(editingGroup.firstEntry.id, {
        ...editForm,
        selectedDates: editSelectedDates,
      });
      toast({
        title: '✅ Modifié',
        description: `${editSelectedDates.length} date(s) mise(s) à jour`,
        className: 'bg-green-600 text-white border-green-600'
      });
      setShowEditDialog(false);
      setEditingGroup(null);
      fetchData();
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de modifier', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async (group: GroupedIndispo) => {
    try {
      if (group.entries.length > 1 && group.groupId) {
        await indisponibleApi.deleteGroup(group.groupId);
      } else {
        await indisponibleApi.delete(group.firstEntry.id);
      }
      toast({
        title: '✅ Supprimé',
        description: `${group.entries.length} indisponibilité(s) supprimée(s)`,
        className: 'bg-green-600 text-white border-green-600'
      });
      setDeleteConfirmGroup(null);
      fetchData();
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de supprimer', variant: 'destructive' });
    }
  };

  const toggleEditDate = (date: string) => {
    setEditSelectedDates(prev =>
      prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
    );
  };

  const jourFromDate = form.date ? getJourSemaine(form.date) : '';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <CalendarOff className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-foreground">Jours indisponibles / Congés</span>
        </div>
        <Button
          size="sm"
          onClick={() => setShowAddDialog(true)}
          className="rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-300/30 text-red-600 dark:text-red-400 hover:from-red-500/20 hover:to-orange-500/20 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" /> Ajouter
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full" />
        </div>
      ) : grouped.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Aucun jour indisponible configuré</p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {grouped.map(group => (
            <motion.div
              key={group.groupId}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between rounded-xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 border border-red-200/30 dark:border-red-800/20 p-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground capitalize truncate">
                    {group.recurrence === 'weekly'
                      ? `Chaque ${group.jourSemaine}`
                      : formatDate(group.firstEntry.date)
                    }
                  </p>
                  {group.entries.length > 1 && (
                    <span className="inline-flex items-center gap-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full px-2 py-0.5 shrink-0">
                      <Repeat className="w-3 h-3" />
                      {group.entries.length}x
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {group.journeeComplete ? '🔒 Journée complète' : `⏰ ${group.heureDebut} - ${group.heureFin}`}
                  {group.motif && ` • ${group.motif}`}
                </p>
                {group.entries.length > 1 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Du {formatDate(group.entries[0].date)} au {formatDate(group.entries[group.entries.length - 1].date)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm" variant="ghost"
                  onClick={() => handleEditOpen(group)}
                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-8 w-8 p-0"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm" variant="ghost"
                  onClick={() => setDeleteConfirmGroup(group)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ===== Add Dialog ===== */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <CalendarOff className="w-5 h-5" /> Ajouter un jour indisponible
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Date de début *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="rounded-xl"
              />
              {form.date && (
                <p className="text-xs text-muted-foreground capitalize">
                  <CalendarDays className="w-3 h-3 inline mr-1" />
                  {getJourSemaine(form.date)} — {formatDate(form.date)}
                </p>
              )}
            </div>

            {/* Recurrence */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-1">
                <Repeat className="w-3 h-3" /> Récurrence
              </Label>
              <Select
                value={form.recurrence}
                onValueChange={(v: 'once' | 'weekly') => setForm({ ...form, recurrence: v })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Juste cette date</SelectItem>
                  <SelectItem value="weekly">
                    Chaque {jourFromDate || 'semaine'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <AnimatePresence>
              {form.recurrence === 'weekly' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <Label className="text-sm font-semibold">Nombre de semaines</Label>
                  <Select
                    value={form.nombreSemaines.toString()}
                    onValueChange={v => setForm({ ...form, nombreSemaines: parseInt(v) })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 52].map(n => (
                        <SelectItem key={n} value={n.toString()}>
                          {n} semaines ({n} {jourFromDate}s)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Full day toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, journeeComplete: !form.journeeComplete })}
                className={`relative w-11 h-6 rounded-full transition-all duration-300 ${form.journeeComplete ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-muted'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${form.journeeComplete ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-sm text-foreground">Journée complète</span>
            </div>

            <AnimatePresence>
              {!form.journeeComplete && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 gap-3 overflow-hidden"
                >
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> De
                    </Label>
                    <Input
                      type="time"
                      value={form.heureDebut}
                      onChange={e => setForm({ ...form, heureDebut: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> À
                    </Label>
                    <Input
                      type="time"
                      value={form.heureFin}
                      onChange={e => setForm({ ...form, heureFin: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Motif (optionnel)</Label>
              <Input
                value={form.motif}
                onChange={e => setForm({ ...form, motif: e.target.value })}
                placeholder="Ex: Congé, Rendez-vous personnel..."
                className="rounded-xl"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} className="rounded-xl">Annuler</Button>
            <Button
              onClick={handleAdd}
              disabled={!form.date || saving}
              className="rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600"
            >
              {saving ? 'Enregistrement...' : '✅ Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Edit Dialog ===== */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="rounded-3xl max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600">
              <Edit className="w-5 h-5" /> Modifier l'indisponibilité
            </DialogTitle>
          </DialogHeader>

          {editingGroup && (
            <div className="space-y-4 py-2">
              {/* Time settings */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, journeeComplete: !editForm.journeeComplete })}
                  className={`relative w-11 h-6 rounded-full transition-all duration-300 ${editForm.journeeComplete ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-muted'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${editForm.journeeComplete ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm text-foreground">Journée complète</span>
              </div>

              <AnimatePresence>
                {!editForm.journeeComplete && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 gap-3 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> De
                      </Label>
                      <Input
                        type="time"
                        value={editForm.heureDebut}
                        onChange={e => setEditForm({ ...editForm, heureDebut: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> À
                      </Label>
                      <Input
                        type="time"
                        value={editForm.heureFin}
                        onChange={e => setEditForm({ ...editForm, heureFin: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Motif (optionnel)</Label>
                <Input
                  value={editForm.motif}
                  onChange={e => setEditForm({ ...editForm, motif: e.target.value })}
                  placeholder="Ex: Congé, Rendez-vous personnel..."
                  className="rounded-xl"
                />
              </div>

              {/* Date selection for groups */}
              {editingGroup.entries.length > 1 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Dates à conserver</Label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditSelectedDates(editingGroup.entries.map(e => e.date))}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Tout
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditSelectedDates([])}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Aucun
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1 max-h-40 overflow-y-auto rounded-xl border border-border p-2">
                    {editingGroup.entries
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .map(entry => (
                        <label
                          key={entry.id}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/50 cursor-pointer"
                        >
                          <Checkbox
                            checked={editSelectedDates.includes(entry.date)}
                            onCheckedChange={() => toggleEditDate(entry.date)}
                          />
                          <span className="text-sm capitalize">{formatDate(entry.date)}</span>
                        </label>
                      ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {editSelectedDates.length}/{editingGroup.entries.length} date(s) sélectionnée(s)
                    {editSelectedDates.length < editingGroup.entries.length && (
                      <span className="text-orange-500"> — les dates non cochées seront supprimées</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="rounded-xl">Annuler</Button>
            <Button
              onClick={handleEditSubmit}
              disabled={saving || (editingGroup && editingGroup.entries.length > 1 && editSelectedDates.length === 0)}
              className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
            >
              {saving ? 'Enregistrement...' : '✅ Modifier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Delete Confirm ===== */}
      <AlertDialog open={!!deleteConfirmGroup} onOpenChange={v => { if (!v) setDeleteConfirmGroup(null); }}>
        <AlertDialogContent className="rounded-3xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" /> Supprimer ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirmGroup && deleteConfirmGroup.entries.length > 1
                ? `Voulez-vous supprimer les ${deleteConfirmGroup.entries.length} indisponibilités de ce groupe (chaque ${deleteConfirmGroup.jourSemaine}) ? Tous les créneaux redeviendront disponibles.`
                : 'Voulez-vous vraiment supprimer cette indisponibilité ? Le créneau redeviendra disponible.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <Button
              onClick={() => deleteConfirmGroup && handleDeleteGroup(deleteConfirmGroup)}
              className="rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white"
            >
              Supprimer {deleteConfirmGroup && deleteConfirmGroup.entries.length > 1 ? `(${deleteConfirmGroup.entries.length})` : ''}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default IndisponibiliteSection;
