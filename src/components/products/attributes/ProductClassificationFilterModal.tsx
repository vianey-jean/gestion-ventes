/**
 * ProductClassificationFilterModal — Modale de filtrage par classification.
 * Affiche ProductClassificationSelector en mode "filter" pour la catégorie
 * choisie, puis expose les sélections au parent (modele/couleur/taille/devant).
 */
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ProductClassificationSelector, { ClassificationValue, ProductCategory } from './ProductClassificationSelector';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categorie: ProductCategory;
  initial?: ClassificationValue;
  onApply: (v: ClassificationValue) => void;
}

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  perruque: 'Perruques', tissage: 'Tissages', extension: 'Extensions', autres: 'Autres',
};

const ProductClassificationFilterModal: React.FC<Props> = ({ open, onOpenChange, categorie, initial, onApply }) => {
  const [value, setValue] = useState<ClassificationValue>({ categorie, ...(initial || {}) });

  useEffect(() => {
    if (open) setValue({ categorie, ...(initial || {}) });
  }, [open, categorie, initial]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filtrer : {CATEGORY_LABEL[categorie]}</DialogTitle>
          <DialogDescription>Sélectionnez le modèle, la couleur et la taille (facultatif).</DialogDescription>
        </DialogHeader>
        <ProductClassificationSelector
          value={value}
          onChange={setValue}
          mode="filter"
          hideCategorie
        />
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { setValue({ categorie }); onApply({ categorie }); onOpenChange(false); }}>
            Réinitialiser
          </Button>
          <Button onClick={() => { onApply(value); onOpenChange(false); }}>Appliquer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductClassificationFilterModal;