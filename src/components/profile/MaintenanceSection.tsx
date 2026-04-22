/**
 * MaintenanceSection — Carte dans Profil > Sécurité
 * Permet à l'admin principal d'activer/désactiver le mode maintenance.
 */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Power, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import api from '@/service/api';

interface MaintenanceSectionProps {
  userRole?: string;
}

const cardClass = "relative rounded-2xl backdrop-blur-2xl bg-white/80 dark:bg-white/[0.03] border border-white/20 dark:border-white/10 shadow-xl overflow-hidden";

const MaintenanceSection: React.FC<MaintenanceSectionProps> = ({ userRole }) => {
  const { toast } = useToast();
  const isAdminPrincipal = userRole === 'administrateur principale';

  const [maintenant, setMaintenant] = useState(false);
  const [message, setMessage] = useState('');
  const [activatedAt, setActivatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValue, setPendingValue] = useState(false);

  useEffect(() => {
    if (isAdminPrincipal) fetchStatus();
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

          <div className="rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/30 p-2.5 mt-4">
            <p className="text-[11px] text-amber-700 dark:text-amber-400 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>Quand la maintenance est active, après la vérification de sécurité, tous les visiteurs voient la page de maintenance. Seul un admin principal peut se connecter.</span>
            </p>
          </div>
        </div>
      </motion.div>

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
    </>
  );
};

export default MaintenanceSection;
