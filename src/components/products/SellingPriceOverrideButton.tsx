/**
 * SellingPriceOverrideButton.tsx
 * Petit bouton « + » affiché à côté d'un champ Prix de vente.
 * Ouvre une mini-modale permettant de saisir un NOUVEAU prix de vente unitaire.
 * Le parent reçoit le nouveau prix via onApply et se charge de l'enregistrement.
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Plus, TrendingUp } from 'lucide-react';

interface Props {
  /** Prix actuellement appliqué (pré-rempli dans la mini-modale) */
  currentPrice?: number | string;
  /** Appelé avec le nouveau prix unitaire validé */
  onApply: (price: number) => void;
  title?: string;
  disabled?: boolean;
  className?: string;
}

const SellingPriceOverrideButton: React.FC<Props> = ({
  currentPrice, onApply, title = 'Nouveau prix de vente', disabled, className,
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const openDialog = () => {
    setValue(currentPrice !== undefined && currentPrice !== null ? String(currentPrice) : '');
    setOpen(true);
  };

  const apply = () => {
    const n = parseFloat(value);
    if (isNaN(n) || n < 0) return;
    onApply(n);
    setOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        size="icon"
        variant="outline"
        disabled={disabled}
        onClick={openDialog}
        title={title}
        aria-label={title}
        className={`h-9 w-9 shrink-0 rounded-xl border-emerald-400/40 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 ${className || ''}`}
      >
        <Plus className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-black">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              {title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label className="text-xs font-bold">Prix de vente unitaire (€)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); apply(); } }}
              placeholder="0,00"
              className="rounded-xl"
            />
            <p className="text-[11px] text-muted-foreground">
              Ce prix remplacera l'ancien prix de vente du produit lors de l'enregistrement.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">
              Annuler
            </Button>
            <Button type="button" onClick={apply} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
              Appliquer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SellingPriceOverrideButton;
