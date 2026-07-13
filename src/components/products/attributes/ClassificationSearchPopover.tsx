/**
 * ClassificationSearchPopover — Bouton + modale centrée utilisant
 * ProductClassificationSelector pour filtrer une liste de produits.
 * S'ouvre comme une Dialog centrée (mobile/tablette/desktop), avec un
 * contenu scrollable et une barre d'actions collée en bas.
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Filter, Sparkles, RotateCcw, Check } from 'lucide-react';
import ProductClassificationSelector, {
  ClassificationValue,
  buildProductName,
  ProductCategory as PCCategory,
} from './ProductClassificationSelector';

export type SearchCategory = 'all' | 'perruque' | 'tissage' | 'extension' | 'autres';

interface Props {
  currentCategory: SearchCategory;
  onApply: (result: { name: string; category: SearchCategory }) => void;
  label?: string;
  className?: string;
}

const ClassificationSearchPopover: React.FC<Props> = ({
  currentCategory,
  onApply,
  label = 'Filtrer par attributs',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const toPC = (c: SearchCategory): PCCategory | '' => {
    switch (c) {
      case 'perruque': return 'Perruque';
      case 'tissage': return 'Tissages';
      case 'extension': return 'Extension';
      case 'autres': return 'Autres';
      default: return '';
    }
  };
  const fromPC = (c: PCCategory | '' | undefined): SearchCategory => {
    switch (c) {
      case 'Perruque': return 'perruque';
      case 'Tissages': return 'tissage';
      case 'Extension': return 'extension';
      case 'Autres': return 'autres';
      default: return 'all';
    }
  };
  const [value, setValue] = useState<ClassificationValue>({
    categorie: toPC(currentCategory),
  });

  const apply = () => {
    const name = buildProductName(value);
    onApply({ name, category: fromPC(value.categorie) });
    setOpen(false);
  };

  const reset = () => {
    setValue({});
    onApply({ name: '', category: 'all' });
    setOpen(false);
  };

  const activeCount = [value.categorie, value.modele, value.couleur, value.taille, value.devant].filter(Boolean).length;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className={`h-9 rounded-full border-purple-300 dark:border-purple-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 hover:from-purple-100 hover:to-pink-100 text-purple-700 dark:text-purple-200 font-bold shadow-sm ${className}`}
      >
        <Filter className="h-4 w-4 mr-1.5" />
        {label}
        {activeCount > 0 && (
          <span className="ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white">
            {activeCount}
          </span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="p-0 gap-0 w-[calc(100vw-2rem)] sm:w-[min(92vw,460px)] max-w-[460px] max-h-[85vh] rounded-2xl border-purple-200 dark:border-purple-800 shadow-2xl bg-white dark:bg-gray-900 flex flex-col top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <DialogHeader className="px-4 pt-4 pb-3 border-b border-purple-100 dark:border-purple-900/50 shrink-0">
            <DialogTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-200 font-black text-sm">
              <Sparkles className="h-4 w-4" />
              Filtre attributs produit
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0 overscroll-contain">
            <ProductClassificationSelector value={value} onChange={setValue} mode="filter" variant="light" />
          </div>

          <div className="shrink-0 flex gap-2 px-4 py-3 border-t border-purple-100 dark:border-purple-900/50 bg-white dark:bg-gray-900 rounded-b-2xl">
            <Button type="button" variant="outline" size="sm" onClick={reset} className="rounded-xl">
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Réinitialiser
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={apply}
              className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-bold"
            >
              <Check className="h-3.5 w-3.5 mr-1.5" /> Appliquer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClassificationSearchPopover;
