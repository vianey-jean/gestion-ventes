/**
 * BlockageIpCard — Carte « Blocage IP » (page Profil / Sécurité)
 *
 * - Liste des adresses IP bloquées (base de données serveur)
 * - Modale d'ajout d'une IP avec motif
 * - AlertDialog de confirmation avant blocage
 * - Suppression (déblocage) d'une IP
 */
import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Ban, Plus, Trash2, Globe, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import PremiumLoading from '@/components/ui/premium-loading';
import blockageIpApi, { BlockedIp } from '@/services/api/blockageIpApi';

const IP_REGEX = /^(\d{1,3}\.){3}\d{1,3}$|^[0-9a-f:]+$/i;

const BlockageIpCard: React.FC = () => {
  const { toast } = useToast();

  const [ips, setIps] = useState<BlockedIp[]>([]);
  const [currentIp, setCurrentIp] = useState('');
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [newIp, setNewIp] = useState('');
  const [reason, setReason] = useState('');

  const [confirmBlock, setConfirmBlock] = useState(false);
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState<BlockedIp | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await blockageIpApi.getAll();
      setIps(data.ips);
      setCurrentIp(data.currentIp);
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openConfirm = () => {
    const value = newIp.trim();
    if (!value || !IP_REGEX.test(value)) {
      toast({ title: 'Adresse IP invalide', description: 'Saisissez une adresse IPv4 ou IPv6 valide.', variant: 'destructive' });
      return;
    }
    if (value.toLowerCase() === currentIp.toLowerCase()) {
      toast({ title: 'Action impossible', description: 'Vous ne pouvez pas bloquer votre propre adresse IP.', variant: 'destructive' });
      return;
    }
    setConfirmBlock(true);
  };

  const handleBlock = async () => {
    try {
      setSaving(true);
      const entry = await blockageIpApi.add(newIp.trim(), reason.trim() || undefined);
      setIps(prev => [...prev, entry]);
      setConfirmBlock(false);
      setShowAdd(false);
      setNewIp(''); setReason('');
      toast({ title: '🚫 IP bloquée', description: `${entry.ip} ne peut plus accéder au site.`, className: 'bg-red-600 text-white border-red-600' });
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.response?.data?.message || 'Blocage impossible', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      setDeleting(true);
      await blockageIpApi.remove(toDelete.id);
      setIps(prev => prev.filter(i => i.id !== toDelete.id));
      toast({ title: '✅ IP débloquée', description: `${toDelete.ip} a de nouveau accès au site.`, className: 'bg-green-600 text-white border-green-600' });
      setToDelete(null);
    } catch {
      toast({ title: 'Erreur', description: 'Déblocage impossible', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-white/20 dark:border-white/10 shadow-xl overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />
        <div className="p-5">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-red-500 to-orange-600 shadow-red-500/30">
                <Ban className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Blocage IP</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Interdire l'accès au site à une adresse IP
                </p>
              </div>
            </div>
            <Button size="sm" onClick={() => setShowAdd(true)}
              className="rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600">
              <Plus className="w-4 h-4 mr-1" /> Bloquer une IP
            </Button>
          </div>

          {currentIp && (
            <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="w-3.5 h-3.5" />
              Votre adresse IP actuelle : <span className="font-mono font-semibold text-foreground">{currentIp}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <PremiumLoading text="Chargement des IP bloquées..." size="md" overlay={false} variant="default" />
            </div>
          ) : ips.length === 0 ? (
            <div className="rounded-xl border border-dashed border-red-200/40 dark:border-red-800/20 py-8 text-center">
              <ShieldAlert className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Aucune adresse IP bloquée</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
              {ips.map(entry => (
                <div key={entry.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-gradient-to-br from-red-50/40 to-white dark:from-red-950/10 dark:to-white/[0.02] border border-red-200/20 dark:border-red-800/10 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-mono font-semibold text-foreground truncate">{entry.ip}</p>
                    {entry.reason && <p className="text-xs text-muted-foreground truncate">{entry.reason}</p>}
                    <p className="text-[10px] text-muted-foreground/70">
                      {new Date(entry.createdAt).toLocaleString('fr-FR')}
                      {entry.createdBy ? ` • ${entry.createdBy}` : ''}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setToDelete(entry)}
                    className="rounded-lg text-red-600 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* MODALE D'AJOUT */}
      <Dialog open={showAdd} onOpenChange={v => { setShowAdd(v); if (!v) { setNewIp(''); setReason(''); } }}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="w-5 h-5" /> Bloquer une adresse IP
            </DialogTitle>
            <DialogDescription>
              L'adresse sera enregistrée en base de données et n'aura plus aucun accès au site.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input value={newIp} onChange={e => setNewIp(e.target.value)}
              placeholder="Ex : 192.168.1.42" className="rounded-xl font-mono" />
            <Input value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Motif (optionnel)" className="rounded-xl" />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setShowAdd(false)}>Annuler</Button>
            <Button onClick={openConfirm}
              className="rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600">
              Bloquer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION DE BLOCAGE */}
      <AlertDialog open={confirmBlock} onOpenChange={setConfirmBlock}>
        <AlertDialogContent className="rounded-3xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Confirmer le blocage</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment bloquer l'adresse <span className="font-mono font-semibold">{newIp}</span> ?
              Elle ne pourra plus accéder à ce site.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <Button onClick={handleBlock} disabled={saving}
              className="rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600">
              {saving ? 'Blocage...' : 'Confirmer'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CONFIRMATION DE DÉBLOCAGE */}
      <AlertDialog open={!!toDelete} onOpenChange={v => !v && setToDelete(null)}>
        <AlertDialogContent className="rounded-3xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Débloquer cette IP ?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-mono font-semibold">{toDelete?.ip}</span> pourra de nouveau accéder au site.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <Button onClick={handleDelete} disabled={deleting}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
              {deleting ? 'Déblocage...' : 'Débloquer'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BlockageIpCard;
