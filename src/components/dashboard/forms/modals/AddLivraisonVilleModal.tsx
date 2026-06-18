import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { livraisonVilleApi, LivraisonVille } from '@/services/api/villesApi';
import { MapPin } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const AddLivraisonVilleModal: React.FC<Props> = ({ isOpen, onClose, onSaved }) => {
  const [ville, setVille] = useState('');
  const [fee, setFee] = useState('0');
  const [saving, setSaving] = useState(false);
  const [confirmUpdate, setConfirmUpdate] = useState<{ existing: LivraisonVille; newFee: number } | null>(null);
  const { toast } = useToast();

  const reset = () => { setVille(''); setFee('0'); };

  const handleSave = async () => {
    const v = ville.trim();
    if (!v) {
      toast({ title: 'Erreur', description: 'Le nom de la ville est requis', variant: 'destructive' });
      return;
    }
    const newFee = Number(fee) || 0;
    setSaving(true);
    try {
      // Vérifier si la ville existe déjà
      const list = await livraisonVilleApi.getAll();
      const existing = list.find(x => x.ville.toLowerCase() === v.toLowerCase());
      if (existing) {
        // Demander confirmation pour modifier le tarif
        setConfirmUpdate({ existing, newFee });
        setSaving(false);
        return;
      }
      // Sinon enregistrer
      await livraisonVilleApi.add(v, newFee);
      toast({ title: 'Succès', description: `Ville "${v}" enregistrée`, className: 'notification-success' });
      reset();
      onSaved?.();
      onClose();
    } catch (e) {
      toast({ title: 'Erreur', description: "Impossible d'enregistrer la ville", variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const confirmUpdateTarif = async () => {
    if (!confirmUpdate) return;
    setSaving(true);
    try {
      await livraisonVilleApi.update(confirmUpdate.existing.ville, confirmUpdate.existing.ville, confirmUpdate.newFee);
      toast({ title: 'Tarif modifié', description: `Tarif de "${confirmUpdate.existing.ville}" mis à jour`, className: 'notification-success' });
      setConfirmUpdate(null);
      reset();
      onSaved?.();
      onClose();
    } catch {
      toast({ title: 'Erreur', description: 'Modification impossible', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-emerald-600" /> Nouvelle ville de livraison</DialogTitle>
            <DialogDescription>Ajouter une ville et son tarif de livraison à la base.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Ville</Label>
              <Input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Ex: Saint-Pierre" disabled={saving} />
            </div>
            <div className="space-y-2">
              <Label>Tarif de livraison (€)</Label>
              <Input type="number" step="0.01" min="0" value={fee} onChange={(e) => setFee(e.target.value)} disabled={saving} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={saving}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Vérification…' : 'Enregistrer'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmUpdate} onOpenChange={(o) => !o && setConfirmUpdate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ville déjà existante</AlertDialogTitle>
            <AlertDialogDescription>
              La ville "{confirmUpdate?.existing.ville}" existe déjà avec un tarif de {confirmUpdate?.existing.fee} €.
              Voulez-vous modifier son tarif à {confirmUpdate?.newFee} € ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Non, annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUpdateTarif} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
              Oui, modifier le tarif
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AddLivraisonVilleModal;
