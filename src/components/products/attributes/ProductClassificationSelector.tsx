/**
 * ProductClassificationSelector — Sélecteur réutilisable pour classer un produit :
 * catégorie (perruque/tissage/extension/autres) → modèle → (devant si perruque) → couleur → taille.
 *
 * Sert à la création d'un produit ET au filtrage (mode="filter").
 * Utilise les attributs stockés en base via useProductAttributes.
 *
 * Le nom du produit est reconstruit dans l'ordre :
 *   categorie [modele] [devant] [couleur] [taille pouces]
 */
import React, { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import useProductAttributes from '@/hooks/useProductAttributes';

export type ProductCategory = 'Perruque' | 'Tissages' | 'Extension' | 'Autres';

export interface ClassificationValue {
  categorie?: ProductCategory | '';
  modele?: string;
  couleur?: string;
  taille?: string;
  devant?: string;
  autres?: string;
}

interface Props {
  value: ClassificationValue;
  onChange: (v: ClassificationValue) => void;
  /** create = tous les champs, filter = optionnels */
  mode?: 'create' | 'filter';
  /** Masquer le sélecteur de catégorie (déjà connu) */
  hideCategorie?: boolean;
  /** Style clair (fond blanc) ou sombre */
  variant?: 'light' | 'dark';
}

const CATEGORIES: { key: ProductCategory; label: string }[] = [
  { key: 'Perruque', label: 'Perruque' },
  { key: 'Tissages', label: 'Tissages' },
  { key: 'Extension', label: 'Extension' },
  { key: 'Autres', label: 'Autres' },
];

export function buildProductName(v: ClassificationValue): string {
  const parts: string[] = [];
  if (v.categorie) parts.push(v.categorie);
  if (v.modele) parts.push(v.modele);
  if (v.autres) parts.push(v.autres);
  if (v.devant) parts.push(v.devant);
  if (v.couleur) parts.push(v.couleur);
  if (v.taille) parts.push(`${v.taille} pouces`);
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

const ProductClassificationSelector: React.FC<Props> = ({
  value, onChange, mode = 'create', hideCategorie = false, variant = 'light',
}) => {
  const { items: modeles } = useProductAttributes('modele');
  const { items: tailles } = useProductAttributes('taille');
  const { items: couleurs } = useProductAttributes('couleur');
  const { items: devants } = useProductAttributes('devant');
  const { items: autres } = useProductAttributes('autres');

  const previewName = useMemo(() => {
  const name = buildProductName(value);
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : '';
}, [value]);

  const showDevant = value.categorie === 'Perruque';

  const labelCls = variant === 'dark' ? 'text-white/80' : 'text-foreground';
  const chipBase = 'px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer select-none';
  const chipInactive = variant === 'dark'
    ? 'bg-white/5 border-white/15 text-white/70 hover:border-white/40'
    : 'bg-white border-violet-200 text-gray-700 hover:border-violet-400';
  const chipActive = 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-transparent shadow-md shadow-violet-500/30';

  const Chip: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button type="button" onClick={onClick} className={`${chipBase} ${active ? chipActive : chipInactive}`}>{children}</button>
  );

  return (
    <div className="space-y-4">
      {!hideCategorie && (
        <div className="space-y-2">
          <Label className={`text-sm font-bold ${labelCls}`}>Catégorie {mode === 'create' && <span className="text-red-500">*</span>}</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <Chip key={c.key} active={value.categorie === c.key} onClick={() => onChange({ ...value, categorie: c.key, devant: c.key === 'Perruque' ? value.devant : '' })}>
                {c.label}
              </Chip>
            ))}
            {mode === 'filter' && value.categorie && (
              <Chip active={false} onClick={() => onChange({ ...value, categorie: '', devant: '' })}>Effacer</Chip>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label className={`text-sm font-bold ${labelCls}`}>Modèle</Label>
        {modeles.length === 0 ? (
          <p className="text-xs text-muted-foreground">Aucun modèle. Ajoutez-en via « Ajouter modèle ».</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {modeles.map(m => (
              <Chip key={m.id} active={value.modele === m.nom} onClick={() => onChange({ ...value, modele: value.modele === m.nom ? '' : m.nom })}>{m.nom}</Chip>
            ))}
          </div>
        )}
      </div>

      {autres.length > 0 && (
        <div className="space-y-2">
          <Label className={`text-sm font-bold ${labelCls}`}>
            Autres <span className="text-xs font-normal text-muted-foreground">(facultatif)</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {autres.map(a => (
              <Chip key={a.id} active={value.autres === a.nom} onClick={() => onChange({ ...value, autres: value.autres === a.nom ? '' : a.nom })}>{a.nom}</Chip>
            ))}
          </div>
        </div>
      )}


      {showDevant && (
        <div className="space-y-2">
          <Label className={`text-sm font-bold ${labelCls}`}>Devant (Perruque)</Label>
          {devants.length === 0 ? (
            <p className="text-xs text-muted-foreground">Aucun devant. Ajoutez-en via « Ajouter devant ».</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {devants.map(d => (
                <Chip key={d.id} active={value.devant === d.nom} onClick={() => onChange({ ...value, devant: value.devant === d.nom ? '' : d.nom })}>{d.nom}</Chip>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label className={`text-sm font-bold ${labelCls}`}>Couleur</Label>
        {couleurs.length === 0 ? (
          <p className="text-xs text-muted-foreground">Aucune couleur. Ajoutez-en via « Ajouter couleur ».</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {couleurs.map(c => (
              <Chip key={c.id} active={value.couleur === c.nom} onClick={() => onChange({ ...value, couleur: value.couleur === c.nom ? '' : c.nom })}>{c.nom}</Chip>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label className={`text-sm font-bold ${labelCls}`}>Taille (pouces)</Label>
        {tailles.length === 0 ? (
          <p className="text-xs text-muted-foreground">Aucune taille. Ajoutez-en via « Ajouter taille ».</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tailles.map(t => (
              <Chip key={t.id} active={value.taille === t.nom} onClick={() => onChange({ ...value, taille: value.taille === t.nom ? '' : t.nom })}>{t.nom}</Chip>
            ))}
          </div>
        )}
      </div>

      {previewName && (
        <div className={`p-3 rounded-xl ${variant === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-violet-50 border border-violet-200'}`}>
          <p className={`text-xs font-bold uppercase tracking-wide ${variant === 'dark' ? 'text-white/60' : 'text-violet-600'} mb-1`}>Nom généré</p>
          <p className={`text-sm font-bold ${variant === 'dark' ? 'text-white' : 'text-violet-900'} flex items-center gap-1.5`}>
            <Sparkles className="h-3.5 w-3.5" /> {previewName}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductClassificationSelector;