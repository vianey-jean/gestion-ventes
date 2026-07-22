/**
 * FideliteListModal — Modale réutilisable de gestion des paliers de fidélité.
 * - Liste tous les paliers (Nouveau, Standard, Bon, Fidèle, VIP, ou personnalisés).
 * - Actions: éditer (min/max), supprimer, ajouter un nouveau palier.
 * - Toute modification déclenche un rebuild de fidelite.json côté serveur,
 *   donc les badges de fidélité des clients sont resynchronisés automatiquement.
 * - Emet l'événement "listes-fidelite-updated" pour rafraîchir les composants.
 */
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Crown, Pencil, Plus, Trash2, Sparkles, Save, X } from 'lucide-react';
import listesFideliteApi, { FideliteTierConfig } from '@/services/api/listesFideliteApi';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const emptyForm = (): FideliteTierConfig => ({
  id: '', label: '', min: 0, max: 0, order: 0, grad: 'from-slate-500 to-slate-700',
});

const FideliteListModal: React.FC<Props> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [list, setList] = useState<FideliteTierConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<FideliteTierConfig | null>(null);
  const [creating, setCreating] = useState<FideliteTierConfig | null>(null);
  const [toDelete, setToDelete] = useState<FideliteTierConfig | null>(null);
  const [maxOpen, setMaxOpen] = useState(false); // pour marquer max=∞

  const reload = async () => {
    setLoading(true);
    try {
      const data = await listesFideliteApi.getAll();
      setList(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { if (open) reload(); }, [open]);

  const notify = () => {
    window.dispatchEvent(new CustomEvent('listes-fidelite-updated'));
    window.dispatchEvent(new CustomEvent('sales-updated'));
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    try {
      const patch: Partial<FideliteTierConfig> = {
        label: editing.label,
        min: Number(editing.min),
        max: maxOpen ? null : Number(editing.max),
      };
      const data = await listesFideliteApi.update(editing.id, patch);
      setList(data); setEditing(null); notify();
      toast({ title: 'Palier mis à jour', className: 'notification-success' });
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.response?.data?.message || 'Modification refusée', variant: 'destructive', className: 'notification-erreur' });
    }
  };

  const handleCreate = async () => {
    if (!creating) return;
    if (!creating.label.trim()) {
      toast({ title: 'Erreur', description: 'Le nom du palier est obligatoire', variant: 'destructive', className: 'notification-erreur' });
      return;
    }
    // Vérifier localement que le min n'est pas déjà occupé par le max d'un autre
    const min = Number(creating.min);
    const occupied = list.find(t => {
      const tMax = t.max === null ? Infinity : t.max;
      return min >= t.min && min <= tMax;
    });
    if (occupied) {
      toast({
        title: 'Palier occupé',
        description: `Le minimum ${min} est déjà couvert par "${occupied.label}". Modifiez ce palier avant d'ajouter le nouveau.`,
        variant: 'destructive',
        className: 'notification-erreur',
      });
      return;
    }
    try {
      const payload = {
        label: creating.label,
        min: Number(creating.min),
        max: maxOpen ? null : Number(creating.max),
        grad: creating.grad,
      };
      const data = await listesFideliteApi.add(payload);
      setList(data); setCreating(null); notify();
      toast({ title: 'Palier ajouté', className: 'notification-success' });
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.response?.data?.message || 'Ajout refusé', variant: 'destructive', className: 'notification-erreur' });
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      const data = await listesFideliteApi.remove(toDelete.id);
      setList(data); setToDelete(null); notify();
      toast({ title: 'Palier supprimé', className: 'notification-success' });
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.response?.data?.message || 'Suppression refusée', variant: 'destructive', className: 'notification-erreur' });
    }
  };

  const startEdit = (t: FideliteTierConfig) => {
    setEditing({ ...t });
    setMaxOpen(t.max === null);
  };
  const startCreate = () => {
    const maxUsed = list.reduce((m, t) => Math.max(m, t.max === null ? m : t.max), -1);
    setCreating({ ...emptyForm(), min: maxUsed + 1, max: maxUsed + 1, order: list.length });
    setMaxOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl p-0 gap-0 rounded-3xl overflow-hidden border-0 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/60">
          <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-purple-600/20 via-fuchsia-600/20 to-pink-600/20 border-b border-white/10">
            <DialogTitle className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Crown className="w-5 h-5 text-black" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-white/60 font-semibold">Configuration</p>
                <p className="text-lg font-black">Paliers de fidélité</p>
              </div>
              <Button
                onClick={startCreate}
                className="ml-auto h-9 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:opacity-90 shadow-lg"
              >
                <Plus className="w-4 h-4 mr-1" /> Ajouter
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="p-5 sm:p-6 max-h-[70vh] overflow-y-auto space-y-3">
            {loading && <p className="text-white/60 text-sm">Chargement…</p>}
            {!loading && list.map((t) => (
              <div key={t.id} className={`rounded-2xl p-4 border border-white/10 bg-gradient-to-r ${t.grad} shadow-lg flex items-center justify-between gap-3`}>
                <div className="min-w-0 text-white">
                  <p className="font-black text-base truncate flex items-center gap-2">
                    <Sparkles className="w-4 h-4 opacity-80" /> {t.label}
                  </p>
                  <p className="text-xs opacity-90 mt-1">
                    Achats requis : <span className="font-bold">{t.min}</span>
                    {t.max === null ? ' et plus' : t.min === t.max ? '' : ` à ${t.max}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(t)}
                    className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur flex items-center justify-center text-white transition-all"
                    title="Modifier"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setToDelete(t)}
                    className="w-9 h-9 rounded-xl bg-red-500/80 hover:bg-red-600 flex items-center justify-center text-white transition-all"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {!loading && list.length === 0 && (
              <p className="text-white/60 text-sm text-center py-8">Aucun palier configuré.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modale édition */}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-violet-600" /> Modifier le palier
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 pt-2">
              <div>
                <Label>Nom du palier</Label>
                <Input value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Produits min.</Label>
                  <Input type="number" min={0} value={editing.min} onChange={(e) => setEditing({ ...editing, min: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Produits max.</Label>
                  <Input type="number" min={0} disabled={maxOpen} value={maxOpen ? '' : editing.max ?? 0} onChange={(e) => setEditing({ ...editing, max: Number(e.target.value) })} placeholder={maxOpen ? '∞' : ''} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={maxOpen} onChange={(e) => setMaxOpen(e.target.checked)} />
                Palier ouvert (aucun maximum)
              </label>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setEditing(null)} className="text-red-600 border-red-300 hover:bg-red-50 font-bold">
                  <X className="w-4 h-4 mr-1" /> Annuler
                </Button>
                <Button onClick={handleSaveEdit} className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                  <Save className="w-4 h-4 mr-1" /> Enregistrer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modale création */}
      <Dialog open={!!creating} onOpenChange={(v) => !v && setCreating(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" /> Nouveau palier
            </DialogTitle>
          </DialogHeader>
          {creating && (
            <div className="space-y-4 pt-2">
              <div>
                <Label>Nom du palier</Label>
                <Input value={creating.label} onChange={(e) => setCreating({ ...creating, label: e.target.value })} placeholder="Ex: Client Diamant" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Produits min.</Label>
                  <Input type="number" min={0} value={creating.min} onChange={(e) => setCreating({ ...creating, min: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Produits max.</Label>
                  <Input type="number" min={0} disabled={maxOpen} value={maxOpen ? '' : creating.max ?? 0} onChange={(e) => setCreating({ ...creating, max: Number(e.target.value) })} placeholder={maxOpen ? '∞' : ''} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={maxOpen} onChange={(e) => setMaxOpen(e.target.checked)} />
                Palier ouvert (aucun maximum)
              </label>
              <p className="text-xs text-muted-foreground">
                Astuce : si le minimum est déjà couvert par un autre palier, modifiez-le d'abord.
              </p>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setCreating(null)} className="text-red-600 border-red-300 hover:bg-red-50 font-bold">
                  <X className="w-4 h-4 mr-1" /> Annuler
                </Button>
                <Button onClick={handleCreate} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                  <Save className="w-4 h-4 mr-1" /> Créer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation suppression */}
      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce palier ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le palier "<b>{toDelete?.label}</b>" sera supprimé. Les clients de ce palier basculeront automatiquement sur le palier correspondant à leur nombre d'achats.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-red-600 font-bold">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FideliteListModal;
