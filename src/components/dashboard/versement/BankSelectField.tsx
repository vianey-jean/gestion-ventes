/**
 * Champ réutilisable de sélection de banque (avec bouton d'ajout)
 */
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Plus } from 'lucide-react';
import PremiumLoading from '@/components/ui/premium-loading';
import { Bank } from './versementUtils';

interface BankSelectFieldProps {
  banks: Bank[];
  value?: string;
  onChange: (value: string) => void;
  onAddBank: () => void;
  loading?: boolean;
}

const BankSelectField: React.FC<BankSelectFieldProps> = ({ banks, value, onChange, onAddBank, loading = false }) => (
  <div>
    <Label className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-amber-600" /> Banque (description)
    </Label>
    <div className="flex gap-2">
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Choisir une banque..." />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <div className="py-2">
              <PremiumLoading text="Chargement des banques…" size="sm" variant="ventes" />
            </div>
          ) : banks.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">Aucune banque</div>
          ) : banks.map(b => (
            <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onAddBank}
        className="border-amber-300 text-amber-600 hover:bg-amber-50"
        title="Ajouter une banque"
      >
        <Plus className="h-4 w-4" />
        <Building2 className="h-4 w-4 ml-0.5" />
      </Button>
    </div>
  </div>
);

export default BankSelectField;
