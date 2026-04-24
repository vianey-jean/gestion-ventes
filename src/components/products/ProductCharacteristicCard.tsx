/**
 * ProductCharacteristicCard.tsx
 * Carte "Caractéristique" affichant : description, taille extraite (ex: 26),
 * un code-barre généré et le code produit. Réutilisable dans la table et
 * dans la modale d'impression.
 */
import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { cn } from '@/lib/utils';
import { getBarcodeValue } from '@/lib/barcodeCodec';
import type { ProductCaracteristique } from '@/types/product';

export interface ProductCharLike {
  id: string;
  code?: string;
  description: string;
  caracteristique?: ProductCaracteristique;
}

/** Extrait un nombre type "26" depuis "26 pouces" / "26\"" / "26 inch" / "Taille 26" */
export const extractSize = (description: string): string | null => {
  if (!description) return null;
  const re = /(\d{1,3})\s*("|''|pouces?|inch(?:es)?|po\b)/i;
  const m = description.match(re);
  if (m) return m[1];
  // fallback: premier nombre isolé entre 6 et 40 (tailles courantes cheveux/écrans)
  const m2 = description.match(/\b(\d{1,2})\b/);
  if (m2) {
    const n = parseInt(m2[1], 10);
    if (n >= 6 && n <= 40) return m2[1];
  }
  return null;
};

interface Props {
  product: ProductCharLike;
  /** "compact" pour la cellule de table, "full" pour la modale/impression */
  variant?: 'compact' | 'full';
  className?: string;
  /** Prix optionnel (en €) à afficher à droite du code-barre (impression uniquement) */
  priceEuro?: number | null;
}

const ProductCharacteristicCard: React.FC<Props> = ({ product, variant = 'compact', className, priceEuro }) => {
  const barcodeRef = useRef<SVGSVGElement | null>(null);
  // Priorité : caractéristique persistée -> sinon extraction depuis la description
  const carac = product.caracteristique;
  const size = (carac && carac.numero) || extractSize(product.description);
  const displayName = (carac && carac.nom) || product.description;
  const displayCode = (carac && carac.code) || product.code || '—';
  const barcodeValue =
    getBarcodeValue(carac, product.code || product.id?.slice(0, 10) || 'NOCODE');

  useEffect(() => {
    if (!barcodeRef.current) return;
    try {
      JsBarcode(barcodeRef.current, barcodeValue, {
        format: 'CODE128',
        displayValue: false,
        margin: 0,
        height: variant === 'full' ? 70 : 32,
        width: variant === 'full' ? 2 : 1.4,
        background: 'transparent',
        lineColor: '#1e1b4b',
      });
    } catch (e) {
      // valeur invalide -> on ignore
    }
  }, [barcodeValue, variant]);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-1 rounded-xl border border-violet-200/40 dark:border-violet-800/30 bg-gradient-to-br from-white via-violet-50/40 to-fuchsia-50/30 dark:from-slate-900 dark:via-violet-950/40 dark:to-fuchsia-950/20 px-2 py-2 shadow-sm',
        variant === 'full' ? 'p-6 gap-3 w-full max-w-md mx-auto' : 'min-w-[140px] max-w-[180px]',
        className
      )}
    >
      {/* Description (au-dessus) */}
      <p
        className={cn(
          'text-center font-bold text-violet-900 dark:text-violet-100 leading-tight break-words',
          variant === 'full' ? 'text-base' : 'text-[10px] line-clamp-2'
        )}
        title={displayName}
      >
        {displayName}
      </p>

      {/* Taille (juste en-dessous) */}
      {size && (
        <div
          className={cn(
            'font-black bg-gradient-to-br from-violet-600 to-fuchsia-600 bg-clip-text text-transparent leading-none',
            variant === 'full' ? 'text-6xl' : 'text-2xl'
          )}
        >
          {size}
        </div>
      )}

      {/* Code-barres */}
      <div className={cn('flex items-center justify-center gap-3 w-full', variant === 'full' ? 'gap-4' : 'gap-2')}>
        <svg
          ref={barcodeRef}
          className={cn(variant === 'full' ? 'w-56 h-20' : 'w-full h-8')}
        />
        {typeof priceEuro === 'number' && !isNaN(priceEuro) && (
          <div
            className={cn(
              'font-black bg-gradient-to-br from-emerald-600 to-green-600 bg-clip-text text-transparent leading-none whitespace-nowrap',
              variant === 'full' ? 'text-3xl' : 'text-sm'
            )}
          >
            {priceEuro.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
          </div>
        )}
      </div>

      {/* Code produit */}
      <p
        className={cn(
          'font-mono tracking-widest text-violet-700 dark:text-violet-300',
          variant === 'full' ? 'text-sm' : 'text-[10px]'
        )}
      >
        {displayCode}
      </p>

      {/* Message de remerciement */}
      {variant === 'full' && (
        <p className="text-center italic text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1 px-2">
          Merci pour votre achat chez RIZIKY BEAUTÉ — votre satisfaction est notre plus belle récompense.
        </p>
      )}
    </div>
  );
};

export default ProductCharacteristicCard;