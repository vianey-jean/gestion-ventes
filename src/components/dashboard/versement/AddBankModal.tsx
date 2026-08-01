/**
 * Modale Ajouter une banque
 */
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Trash2 } from 'lucide-react';
import PremiumLoading from '@/components/ui/premium-loading';
import { Bank } from './versementUtils';

interface AddBankModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  onNameChange: (v: string) => void;
  banks: Bank[];
  loading?: boolean;
  onSave: () => void;
  onRemoveBank: (id: string) => void;
}

const AddBankModal: React.FC<AddBankModalProps> = ({
  open, onOpenChange, name, onNameChange, banks, loading = false, onSave, onRemoveBank
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-amber-600" />
          Ajouter une banque
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-3 py-2">
        <Label>Nom de la banque</Label>
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="ex: Crédit Agricole"
          onKeyDown={(e) => { if (e.key === 'Enter') onSave(); }}
          autoFocus
        />
        {loading ? (
          <PremiumLoading text="Chargement des banques…" size="sm" variant="ventes" />
        ) : banks.length > 0 && (
          <div className="pt-2 border-t">
            <div className="text-xs font-semibold text-gray-500 mb-2">Banques enregistrées</div>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {banks.map(b => (
                <span key={b.id} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  <Building2 className="h-3 w-3" />
                  {b.name}
                  <button
                    type="button"
                    onClick={() => onRemoveBank(b.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Supprimer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
        <Button onClick={onSave} className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
          Enregistrer
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default AddBankModal;
