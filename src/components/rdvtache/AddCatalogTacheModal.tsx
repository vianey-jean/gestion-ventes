/**
 * AddCatalogTacheModal.tsx - Modale pour ajouter un type de tâche RDV (tissage, tresse, etc.)
 */
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scissors, X } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: { nom: string; description?: string }) => Promise<void>;
}

const AddCatalogTacheModal: React.FC<Props> = ({ open, onOpenChange, onSubmit }) => {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (!open) { setNom(''); setDescription(''); } }, [open]);

  const handle = async () => {
    if (!nom.trim()) return;
    setSubmitting(true);
    try { await onSubmit({ nom: nom.trim(), description: description.trim() || undefined }); }
    finally { setSubmitting(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-fuchsia-900/30 to-pink-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-w-md">
        <DialogHeader className="text-center space-y-3 pb-4">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-pink-500 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-xl shadow-pink-500/30">
            <Scissors className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-xl font-black bg-gradient-to-r from-pink-400 to-fuchsia-400 bg-clip-text text-transparent">
            ✨ Nouvelle tâche RDV
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-white/80">Nom de la tâche *</Label>
            <Input value={nom} onChange={e => setNom(e.target.value)}
              placeholder="Ex: Tissage, Tresse, Perruque, Extension..."
              className="bg-white/10 border border-white/20 focus:border-pink-400 rounded-xl text-white placeholder:text-white/40" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-white/80">Description (optionnel)</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Détails complémentaires"
              className="bg-white/10 border border-white/20 focus:border-fuchsia-400 rounded-xl text-white placeholder:text-white/40" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handle} disabled={!nom.trim() || submitting}
              className="flex-1 bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white shadow-lg shadow-pink-500/30 hover:scale-105 transition-all rounded-xl">
              ✅ Ajouter
            </Button>
            <Button onClick={() => onOpenChange(false)} variant="outline"
              className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl">
              <X className="h-4 w-4 mr-1" /> Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCatalogTacheModal;
