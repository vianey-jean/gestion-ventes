/**
 * ProductAttributeDialog — Modale réutilisable pour créer un attribut produit
 * (modèle, taille, couleur ou devant). Formulaire : nom + description.
 * Utilisée par ProductAttributeManagerButton.
 */
import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AttributeKind } from '@/services/api/productAttributesApi';

const LABELS: Record<AttributeKind, { title: string; nomLabel: string; nomPlaceholder: string }> = {
  modele: { title: 'Nouveau modèle', nomLabel: 'Nom du modèle', nomPlaceholder: 'ex : Bouclé, Lisse droit, Lisse ondulé...' },
  taille: { title: 'Nouvelle taille', nomLabel: 'Taille (pouces)', nomPlaceholder: 'ex : 10, 12, 14... 32' },
  couleur: { title: 'Nouvelle couleur', nomLabel: 'Nom de la couleur', nomPlaceholder: 'ex : Noir, Blonde miel, Rouge bordeau...' },
  devant: { title: 'Nouveau devant', nomLabel: 'Type de devant', nomPlaceholder: 'ex : Frange, Lace frontale 13x4, Lace frontale T...' },
  autres: { title: 'Nouvel attribut (Autres)', nomLabel: 'Nom', nomPlaceholder: 'ex : Densité, Matière, Style...' },
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  kind: AttributeKind;
  onCreate: (nom: string, description: string) => Promise<unknown>;
}

const ProductAttributeDialog: React.FC<Props> = ({ open, onOpenChange, kind, onCreate }) => {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const cfg = LABELS[kind];

  const handleSave = async () => {
    if (!nom.trim()) {
      toast({ title: 'Erreur', description: 'Le nom est requis', variant: 'destructive' });
      return;
    }
    try {
      setSaving(true);
      await onCreate(nom.trim(), description.trim());
      toast({ title: 'Succès', description: `${cfg.title} enregistré`, className: 'notification-success' });
      setNom(''); setDescription('');
      onOpenChange(false);
    } catch {
      toast({ title: 'Erreur', description: "Impossible d'enregistrer", variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!saving) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{cfg.title}</DialogTitle>
          <DialogDescription>Renseignez le nom et une description facultative.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>{cfg.nomLabel}</Label>
            <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder={cfg.nomPlaceholder} />
          </div>
          <div className="space-y-1.5">
            <Label>Description (facultatif)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Annuler</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductAttributeDialog;