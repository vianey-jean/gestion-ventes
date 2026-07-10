/**
 * ProductAttributesToolbar — Barre réutilisable regroupant les 4 boutons
 * d'ajout d'attribut produit (modèle / taille / couleur / devant) avec
 * une flèche pour afficher/cacher, persistée dans localStorage.
 */
import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductAttributeManagerButton from './ProductAttributeManagerButton';

const STORAGE_KEY = 'produits.attributesToolbar.visible';

const ProductAttributesToolbar: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw === null ? true : raw === 'true';
    } catch { return true; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, String(visible)); } catch { /* noop */ }
  }, [visible]);

  return (
    <div className="rounded-2xl border border-violet-200/30 dark:border-violet-800/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-3 sm:p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-md shadow-violet-500/30 shrink-0">
            <Palette className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-foreground truncate">Attributs produit</p>
            <p className="text-[11px] text-muted-foreground truncate">Modèle, couleur, taille, devant</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setVisible(v => !v)}
          className="rounded-xl h-9 shrink-0"
          aria-label={visible ? 'Cacher les boutons' : 'Afficher les boutons'}
        >
          {visible ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <span className="ml-1 hidden sm:inline text-xs font-bold">{visible ? 'Cacher' : 'Afficher'}</span>
        </Button>
      </div>
      {visible && (
        <div className="flex flex-wrap gap-2">
          <ProductAttributeManagerButton kind="modele" />
          <ProductAttributeManagerButton kind="taille" />
          <ProductAttributeManagerButton kind="couleur" />
          <ProductAttributeManagerButton kind="devant" />
        </div>
      )}
    </div>
  );
};

export default ProductAttributesToolbar;