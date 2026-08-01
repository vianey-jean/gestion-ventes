/**
 * Modale Ajout d'un versement espèce
 */
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import PremiumLoading from '@/components/ui/premium-loading';
import BankSelectField from './BankSelectField';
import { Bank } from './versementUtils';

interface NewVersement { date: string; montant: string; description: string }

interface VersementAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: NewVersement;
  onChange: (updater: (s: NewVersement) => NewVersement) => void;
  banks: Bank[];
  banksLoading?: boolean;
  onAddBank: () => void;
  onSave: () => void;
  saving?: boolean;
}

const VersementAddModal: React.FC<VersementAddModalProps> = ({
  open, onOpenChange, value, onChange, banks, banksLoading, onAddBank, onSave, saving = false
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-rose-600" />
          Nouveau versement espèce
        </DialogTitle>
      </DialogHeader>
      {saving ? (
        <PremiumLoading text="Enregistrement du versement…" size="md" variant="ventes" />
      ) : (
        <div className="space-y-3 py-2">
          <div>
            <Label>Date</Label>
            <Input type="date" value={value.date} onChange={(e) => onChange(s => ({ ...s, date: e.target.value }))} />
          </div>
          <div>
            <Label>Montant (€)</Label>
            <Input type="number" step="0.01" value={value.montant} onChange={(e) => onChange(s => ({ ...s, montant: e.target.value }))} placeholder="ex: 200" />
          </div>
          <BankSelectField
            banks={banks}
            loading={banksLoading}
            value={value.description}
            onChange={(val) => onChange(s => ({ ...s, description: val }))}
            onAddBank={onAddBank}
          />
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
        <Button onClick={onSave} disabled={saving} className="bg-gradient-to-r from-rose-500 to-pink-600 text-white">
          Enregistrer
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default VersementAddModal;
