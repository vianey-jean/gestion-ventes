/**
 * ProductAttributeManagerButton — Bouton "Ajouter <attribut>" réutilisable.
 * Ouvre ProductAttributeDialog pour créer et enregistrer en base.
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AttributeKind } from '@/services/api/productAttributesApi';
import useProductAttributes from '@/hooks/useProductAttributes';
import ProductAttributeDialog from './ProductAttributeDialog';

const KIND_LABELS: Record<AttributeKind, { button: string; gradient: string; shadow: string }> = {
  modele: { button: 'Ajouter modèle', gradient: 'from-purple-500 to-fuchsia-600', shadow: 'shadow-purple-500/30' },
  taille: { button: 'Ajouter taille', gradient: 'from-sky-500 to-cyan-600', shadow: 'shadow-sky-500/30' },
  couleur: { button: 'Ajouter couleur', gradient: 'from-pink-500 to-rose-600', shadow: 'shadow-pink-500/30' },
  devant: { button: 'Ajouter devant', gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/30' },
};

interface Props {
  kind: AttributeKind;
  className?: string;
}

const ProductAttributeManagerButton: React.FC<Props> = ({ kind, className }) => {
  const [open, setOpen] = useState(false);
  const { create } = useProductAttributes(kind);
  const cfg = KIND_LABELS[kind];

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className={`w-full sm:w-auto h-11 sm:h-12 px-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r ${cfg.gradient} ${cfg.shadow} shadow-lg hover:shadow-xl transition-all border-0 ${className || ''}`}
      >
        <Plus className="h-4 w-4 mr-1.5" /> {cfg.button}
      </Button>
      <ProductAttributeDialog
        open={open}
        onOpenChange={setOpen}
        kind={kind}
        onCreate={(nom, description) => create(nom, description)}
      />
    </>
  );
};

export default ProductAttributeManagerButton;