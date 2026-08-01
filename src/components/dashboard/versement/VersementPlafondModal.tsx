/**
 * Modale Plafond mensuel autorisé
 */
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings2 } from 'lucide-react';
import PremiumLoading from '@/components/ui/premium-loading';

interface VersementPlafondModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onValueChange: (v: string) => void;
  onSave: () => void;
  saving?: boolean;
}

const VersementPlafondModal: React.FC<VersementPlafondModalProps> = ({
  open, onOpenChange, value, onValueChange, onSave, saving = false
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-violet-600" />
          Plafond mensuel autorisé
        </DialogTitle>
      </DialogHeader>
      {saving ? (
        <PremiumLoading text="Enregistrement…" size="md" variant="default" />
      ) : (
        <div className="space-y-3 py-2">
          <Label>Montant maximum sur 30 jours glissants</Label>
          <Input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder="ex: 1500"
          />
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
        <Button onClick={onSave} disabled={saving} className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
          Enregistrer
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default VersementPlafondModal;
