/**
 * MaintenanceSection — Carte dans Profil > Sécurité
 * Permet à l'admin principal d'activer/désactiver le mode maintenance
 * et de programmer des maintenances automatiques.
 */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Power, AlertTriangle, CheckCircle, Plus, Pencil, Trash2, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import api from '@/service/api';

interface MaintenanceSectionProps {
  userRole?: string;
}

interface ScheduledMaintenance {
  id: string;
  startAt: string;
  endAt: string;
  days: number;
  hours: number;
  message: string;
  triggered?: boolean;
}

const cardClass = "relative rounded-2xl backdrop-blur-2xl bg-white/80 dark:bg-white/[0.03] border border-white/20 dark:border-white/10 shadow-xl overflow-hidden";

const toLocalInput = (iso?: string) => {
  if (!iso) {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const MaintenanceSection: React.FC<MaintenanceSectionProps> = ({ userRole }) => {
  const { toast } = useToast();
  const isAdminPrincipal = userRole === 'administrateur principale';

  const [maintenant, setMaintenant] = useState(false);
  const [message, setMessage] = useState('');
  const [activatedAt, setActivatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValue, setPendingValue] = useState(false);

  // Scheduled
  const [scheduled, setScheduled] = useState<ScheduledMaintenance[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fStartAt, setFStartAt] = useState(toLocalInput());
  const [fDays, setFDays] = useState<string>('0');
  const [fHours, setFHours] = useState<string>('1');
  const [fMessage, setFMessage] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (isAdminPrincipal) {
      fetchStatus();
      fetchScheduled();
    }
  }, [isAdminPrincipal]);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/api/maintenance/status');
      setMaintenant(!!res.data?.maintenant);
      setMessage(res.data?.message || '');
      setActivatedAt(res.data?.activatedAt || null);
    } catch (e) {
      console.error('Erreur statut maintenance:', e);
    }
  };

  const fetchScheduled = async () => {
    try {
      const res = await api.get('/api/maintenance/scheduled');
      setScheduled(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Erreur scheduled:', e);
    }
  };

  const handleToggleRequest = (newValue: boolean) => {
    setPendingValue(newValue);
    setConfirmOpen(true);
  };

  const applyToggle = async () => {
    try {
      setLoading(true);
      const res = await api.put('/api/maintenance/toggle', { maintenant: pendingValue, message });
      if (res.data?.success) {
        setMaintenant(pendingValue);
        setActivatedAt(res.data.activatedAt || null);
        toast({
          title: pendingValue ? '🔧 Maintenance activée' : '✅ Maintenance désactivée',
          description: pendingValue ? 'Seul l\'admin principal peut désormais se connecter.' : 'Le site est de nouveau accessible à tous.',
          className: pendingValue ? 'bg-amber-600 text-white border-amber-600' : 'bg-green-600 text-white border-green-600',
        });
      }
      setConfirmOpen(false);
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.response?.data?.message || 'Impossible de modifier le statut', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const saveMessage = async () => {
    try {
      setLoading(true);
      const res = await api.put('/api/maintenance/toggle', { maintenant, message });
      if (res.data?.success) {
        toast({ title: '✅ Message mis à jour', description: 'Le message de maintenance a été enregistré.', className: 'bg-green-600 text-white border-green-600' });
      }
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.response?.data?.message || 'Erreur lors de la sauvegarde', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFStartAt(toLocalInput());
    setFDays('0');
    setFHours('1');
    setFMessage(message || '');
    setModalOpen(true);
  };

  const openEditModal = (s: ScheduledMaintenance) => {
    setEditingId(s.id);
    setFStartAt(toLocalInput(s.startAt));
    setFDays(String(s.days || 0));
    setFHours(String(s.hours || 0));
    setFMessage(s.message || '');
    setModalOpen(true);
  };

  const submitScheduled = async () => {
    const d = Number(fDays) || 0;
    const h = Number(fHours) || 0;
    if (!fStartAt) return toast({ title: 'Erreur', description: 'Date de début requise', variant: 'destructive' });
    if (d <= 0 && h <= 0) return toast({ title: 'Erreur', description: 'Durée requise (jours ou heures)', variant: 'destructive' });
    try {
      setLoading(true);
      const payload = {
        startAt: new Date(fStartAt).toISOString(),
        days: d,
        hours: h,
        message: fMessage,
      };
      if (editingId) {
        await api.put(`/api/maintenance/scheduled/${editingId}`, payload);
        toast({ title: '✅ Modifiée', description: 'Maintenance programmée mise à jour', className: 'bg-green-600 text-white border-green-600' });
      } else {
        await api.post('/api/maintenance/scheduled', payload);
        toast({ title: '✅ Programmée', description: 'Maintenance automatique enregistrée', className: 'bg-green-600 text-white border-green-600' });
      }
      setModalOpen(false);
      fetchScheduled();
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.response?.data?.message || 'Erreur enregistrement', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setLoading(true);
      await api.delete(`/api/maintenance/scheduled/${deleteId}`);
      toast({ title: '🗑️ Supprimée', description: 'Maintenance programmée supprimée', className: 'bg-red-600 text-white border-red-600' });
      setDeleteId(null);
      fetchScheduled();
      fetchStatus();
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.response?.data?.message || 'Erreur suppression', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdminPrincipal) return null;

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={cardClass}>
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500" />
        <div className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Mode maintenance</span>
              <p className="text-xs text-muted-foreground mt-0.5">Bloque l'accès au site sauf admin principal</p>
            </div>
          </div>

          <div className={`rounded-xl p-3 mb-4 border ${
            maintenant
              ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-200/30'
              : 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200/30'
          }`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {maintenant ? <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                <div className="min-w-0">
                  <p className={`text-sm font-bold ${maintenant ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    {maintenant ? 'Maintenance ACTIVE' : 'Site accessible'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {maintenant && activatedAt ? `Activé le ${new Date(activatedAt).toLocaleString('fr-FR')}` : maintenant ? 'En cours' : 'Tous les utilisateurs peuvent se connecter'}
                  </p>
                </div>
              </div>
              <Switch checked={maintenant} onCheckedChange={handleToggleRequest} disabled={loading} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message affiché</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Le site est en maintenance..."
              rows={3}
              className="rounded-xl border-amber-200/30 dark:border-amber-800/20 resize-none"
            />
            <Button
              onClick={saveMessage}
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 h-9 text-sm"
            >
              <Power className="w-4 h-4 mr-2" /> Sauvegarder le message
            </Button>
          </div>

          {/* Maintenance auto programmées */}
          <div className="mt-5 pt-5 border-t border-amber-200/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Maintenance auto</span>
              </div>
              <Button
                size="sm"
                onClick={openAddModal}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 h-8 text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter
              </Button>
            </div>

            {scheduled.length === 0 ? (
              <p className="text-[11px] text-muted-foreground italic text-center py-3">Aucune maintenance programmée</p>
            ) : (
              <div className="space-y-2">
                {scheduled.map((s) => (
                  <div key={s.id} className="rounded-xl p-3 bg-white/40 dark:bg-white/[0.02] border border-amber-200/30 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground">
                        {new Date(s.startAt).toLocaleString('fr-FR')}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Durée : {s.days > 0 ? `${s.days}j ` : ''}{s.hours > 0 ? `${s.hours}h` : ''} → fin {new Date(s.endAt).toLocaleString('fr-FR')}
                      </p>
                      {s.message && <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{s.message}</p>}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => openEditModal(s)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteId(s.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/30 p-2.5 mt-4">
            <p className="text-[11px] text-amber-700 dark:text-amber-400 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>Quand la maintenance est active, après la vérification de sécurité, tous les visiteurs voient la page de maintenance. Seul un admin principal peut se connecter.</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Toggle confirm */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0a0020]/95 border border-amber-200/30 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <Wrench className="w-5 h-5" /> {pendingValue ? 'Activer la maintenance ?' : 'Désactiver la maintenance ?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingValue
                ? 'Tous les utilisateurs (sauf vous) seront déconnectés et redirigés vers la page de maintenance.'
                : 'Le site redeviendra accessible à tous les utilisateurs immédiatement.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={applyToggle} disabled={loading} className={`rounded-xl text-white ${pendingValue ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`}>
              {loading ? 'Traitement...' : 'Confirmer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add/Edit scheduled modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0a0020]/95 border border-amber-200/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <CalendarClock className="w-5 h-5" />
              {editingId ? 'Modifier la maintenance auto' : 'Programmer une maintenance auto'}
            </DialogTitle>
            <DialogDescription>
              Le site passera automatiquement en maintenance à la date prévue, puis se réactivera à la fin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Date et heure de début</Label>
              <Input type="datetime-local" value={fStartAt} onChange={(e) => setFStartAt(e.target.value)} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nombre de jours</Label>
                <Input type="number" min="0" value={fDays} onChange={(e) => setFDays(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Nombre d'heures</Label>
                <Input type="number" min="0" value={fHours} onChange={(e) => setFHours(e.target.value)} className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Message affiché</Label>
              <Textarea value={fMessage} onChange={(e) => setFMessage(e.target.value)} rows={3} placeholder="Le site est en maintenance..." className="rounded-xl resize-none" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} className="rounded-xl">Annuler</Button>
            <Button onClick={submitScheduled} disabled={loading} className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              {loading ? '...' : editingId ? 'Modifier' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" /> Supprimer cette maintenance ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La maintenance programmée sera retirée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={loading} className="rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white">
              {loading ? '...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MaintenanceSection;
