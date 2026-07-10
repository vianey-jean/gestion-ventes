/**
 * ClassificationSearchPopover — Bouton + popover utilisant
 * ProductClassificationSelector pour filtrer une liste de produits.
 * Remplace les chips CATEGORY_OPTIONS ; le résultat est injecté dans la
 * barre de recherche du parent via `onApply`.
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, Sparkles, RotateCcw, Check } from 'lucide-react';
import ProductClassificationSelector, {
  ClassificationValue,
  buildProductName,
  ProductCategory as PCCategory,
} from './ProductClassificationSelector';

export type SearchCategory = 'all' | 'perruque' | 'tissages' | 'extension' | 'autres';

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
  const [value, setValue] = useState<ClassificationValue>({
    categorie: currentCategory === 'all' ? '' : (currentCategory as PCCategory),
  });

  const apply = () => {
    const name = buildProductName(value);
    const category: SearchCategory = (value.categorie || 'all') as SearchCategory;
    onApply({ name, category });
    setOpen(false);
  };

  const reset = () => {
    setValue({});
    onApply({ name: '', category: 'all' });
    setOpen(false);
  };

  const activeCount = [value.categorie, value.modele, value.couleur, value.taille, value.devant].filter(Boolean).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
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
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[min(92vw,420px)] max-h-[70vh] overflow-y-auto p-4 rounded-2xl border-purple-200 dark:border-purple-800 shadow-2xl bg-white dark:bg-gray-900"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-200 font-black">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">Filtre attributs produit</span>
          </div>
        </div>
        <ProductClassificationSelector value={value} onChange={setValue} mode="filter" variant="light" />
        <div className="mt-4 flex gap-2">
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
      </PopoverContent>
    </Popover>
  );
};

export default ClassificationSearchPopover;
