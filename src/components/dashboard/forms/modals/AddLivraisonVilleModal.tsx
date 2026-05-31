import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { livraisonVilleApi } from '@/services/api/villesApi';
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
  const { toast } = useToast();

  const handleSave = async () => {
    const v = ville.trim();
    if (!v) {
      toast({ title: 'Erreur', description: 'Le nom de la ville est requis', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await livraisonVilleApi.add(v, Number(fee) || 0);
      toast({ title: 'Succès', description: `Ville "${v}" enregistrée`, className: 'notification-success' });
      setVille(''); setFee('0');
      onSaved?.();
      onClose();
    } catch (e) {
      toast({ title: 'Erreur', description: "Impossible d'enregistrer la ville", variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
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
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddLivraisonVilleModal;
