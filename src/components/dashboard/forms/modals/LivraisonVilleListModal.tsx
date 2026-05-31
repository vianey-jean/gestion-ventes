import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { livraisonVilleApi, LivraisonVille } from '@/services/api/villesApi';
import { Pencil, Trash2, Check, X, MapPin } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const LivraisonVilleListModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [villes, setVilles] = useState<LivraisonVille[]>([]);
  const [loading, setLoading] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editFee, setEditFee] = useState('0');
  const [confirmDel, setConfirmDel] = useState<LivraisonVille | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const list = await livraisonVilleApi.getAll();
      setVilles(list);
    } catch { setVilles([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (isOpen) load(); }, [isOpen]);

  const startEdit = (idx: number) => {
    setEditIdx(idx);
    setEditName(villes[idx].ville);
    setEditFee(String(villes[idx].fee));
  };
  const cancelEdit = () => { setEditIdx(null); setEditName(''); setEditFee('0'); };

  const saveEdit = async () => {
    if (editIdx === null) return;
    const original = villes[editIdx].ville;
    const name = editName.trim();
    if (!name) { toast({ title: 'Erreur', description: 'Nom requis', variant: 'destructive' }); return; }
    try {
      const list = await livraisonVilleApi.update(original, name, Number(editFee) || 0);
      setVilles(list);
      cancelEdit();
      toast({ title: 'Modifié', description: `Ville "${name}" mise à jour`, className: 'notification-success' });
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.response?.data?.message || 'Modification impossible', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    try {
      const list = await livraisonVilleApi.remove(confirmDel.ville);
      setVilles(list);
      toast({ title: 'Supprimé', description: `Ville "${confirmDel.ville}" supprimée`, className: 'notification-success' });
    } catch {
      toast({ title: 'Erreur', description: 'Suppression impossible', variant: 'destructive' });
    } finally { setConfirmDel(null); }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-blue-600" /> Détail des villes de livraison</DialogTitle>
            <DialogDescription>Modifier ou supprimer une ville et son tarif de livraison.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-2">
            <div className="space-y-2">
              {loading && <p className="text-sm text-muted-foreground p-3">Chargement…</p>}
              {!loading && villes.length === 0 && <p className="text-sm text-muted-foreground p-3">Aucune ville enregistrée.</p>}
              {villes.map((v, idx) => (
                <div key={v.ville} className="flex items-center gap-2 p-3 rounded-lg border bg-gradient-to-r from-slate-50 to-white">
                  {editIdx === idx ? (
                    <>
                      <Input className="flex-1" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Ville" />
                      <Input className="w-28" type="number" step="0.01" min="0" value={editFee} onChange={(e) => setEditFee(e.target.value)} placeholder="Frais €" />
                      <Button size="sm" onClick={saveEdit} className="bg-emerald-600 hover:bg-emerald-700"><Check className="h-4 w-4" /></Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}><X className="h-4 w-4" /></Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p className="font-semibold">{v.ville}</p>
                        <p className="text-xs text-muted-foreground">{v.fee === 0 ? 'Gratuit' : `${v.fee.toFixed(2)} €`}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => startEdit(idx)} className="text-blue-600 hover:bg-blue-50"><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmDel(v)} className="text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la ville ?</AlertDialogTitle>
            <AlertDialogDescription>
              Confirmez la suppression de "{confirmDel?.ville}" ({confirmDel?.fee === 0 ? 'gratuit' : `${confirmDel?.fee} €`}). Cette action est définitive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LivraisonVilleListModal;
