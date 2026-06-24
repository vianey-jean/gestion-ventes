/**
 * CityFormModal - Modale réutilisable pour ajouter ou modifier une ville
 */
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

export interface CityFormModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialValue?: string;
  title?: string;
  confirmLabel?: string;
  onSubmit: (ville: string) => Promise<void> | void;
}

const CityFormModal: React.FC<CityFormModalProps> = ({
  open,
  onOpenChange,
  initialValue = '',
  title = 'Ajouter une ville',
  confirmLabel = 'Ajouter',
  onSubmit,
}) => {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setValue(initialValue);
  }, [open, initialValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    try {
      setSaving(true);
      await onSubmit(trimmed);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" /> {title}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            autoFocus
            placeholder="Nom de la ville"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={saving || !value.trim()}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
            >
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CityFormModal;
