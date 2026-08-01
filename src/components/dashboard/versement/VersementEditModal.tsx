/**
 * Modale Modification d'un versement espèce
 */
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil } from 'lucide-react';
import PremiumLoading from '@/components/ui/premium-loading';
import BankSelectField from './BankSelectField';
import { Bank, Versement } from './versementUtils';

interface VersementEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versement: Versement | null;
  onChange: (updater: (s: Versement | null) => Versement | null) => void;
  banks: Bank[];
  banksLoading?: boolean;
  onAddBank: () => void;
  onSave: () => void;
  saving?: boolean;
}

const VersementEditModal: React.FC<VersementEditModalProps> = ({
  open, onOpenChange, versement, onChange, banks, banksLoading, onAddBank, onSave, saving = false
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Pencil className="h-5 w-5 text-blue-600" />
          Modifier le versement
        </DialogTitle>
      </DialogHeader>
      {saving ? (
        <PremiumLoading text="Mise à jour du versement…" size="md" variant="dashboard" />
      ) : (
        <div className="space-y-3 py-2">
          <div>
            <Label>Date</Label>
            <Input type="date" value={versement?.date || ''} onChange={(e) => onChange(s => s ? ({ ...s, date: e.target.value }) : null)} />
          </div>
          <div>
            <Label>Montant (€)</Label>
            <Input type="number" step="0.01" value={versement?.montant ?? ''} onChange={(e) => onChange(s => s ? ({ ...s, montant: Number(e.target.value) }) : null)} placeholder="ex: 200" />
          </div>
          <BankSelectField
            banks={banks}
            loading={banksLoading}
            value={versement?.description}
            onChange={(val) => onChange(s => s ? ({ ...s, description: val }) : null)}
            onAddBank={onAddBank}
          />
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
        <Button onClick={onSave} disabled={saving} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          Enregistrer
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default VersementEditModal;
