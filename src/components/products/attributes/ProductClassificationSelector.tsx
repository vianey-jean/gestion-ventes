/**
 * ProductClassificationSelector — Sélecteur réutilisable pour classer un produit.
 *
 * La catégorie (Perruque/Tissages/Extension/Autres) reste fixe. Les autres
 * sections (modèle, couleur, taille, devant, autres, ET tous les kinds
 * personnalisés créés via ProductAttributesToolbar) sont récupérées
 * dynamiquement depuis la base via useAttributeKinds.
 *
 * Compatibilité : pour les kinds legacy (modele/taille/couleur/devant/autres),
 * la sélection est écrite dans les champs éponymes de ClassificationValue
 * afin que AddProductModal / EditProductModal / ProduitsPage continuent de
 * fonctionner sans modification. Les kinds personnalisés sont stockés dans
 * `value.extras[kindId]`.
 */
import { useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import useProductAttributes from '@/hooks/useProductAttributes';
import useAttributeKinds from '@/hooks/useAttributeKinds';
import type { AttributeKindDef } from '@/services/api/attributKindsApi';

export type ProductCategory = 'Perruque' | 'Tissages' | 'Extension' | 'Autres';

export interface ClassificationValue {
  categorie?: ProductCategory | '';
  modele?: string;
  couleur?: string;
  taille?: string;
  devant?: string;
  autres?: string;
  /** Valeurs des kinds dynamiques (non-legacy) indexées par kind id. */
  extras?: Record<string, string>;
}

interface Props {
  value: ClassificationValue;
  onChange: (v: ClassificationValue) => void;
  mode?: 'create' | 'filter';
  hideCategorie?: boolean;
  variant?: 'light' | 'dark';
}

const CATEGORIES: { key: ProductCategory; label: string }[] = [
  { key: 'Perruque', label: 'Perruque' },
  { key: 'Tissages', label: 'Tissages' },
  { key: 'Extension', label: 'Extension' },
  { key: 'Autres', label: 'Autres' },
];

const LEGACY_KEYS = ['modele', 'autres', 'devant', 'couleur', 'taille'] as const;
type LegacyKey = typeof LEGACY_KEYS[number];

function getKindValue(value: ClassificationValue, kind: AttributeKindDef): string {
  if (kind.legacy && (LEGACY_KEYS as readonly string[]).includes(kind.legacy)) {
    return (value[kind.legacy as LegacyKey] || '') as string;
  }
  return value.extras?.[kind.id] || '';
}

function setKindValue(value: ClassificationValue, kind: AttributeKindDef, next: string): ClassificationValue {
  if (kind.legacy && (LEGACY_KEYS as readonly string[]).includes(kind.legacy)) {
    return { ...value, [kind.legacy as LegacyKey]: next };
  }
  const extras = { ...(value.extras || {}) };
  if (next) extras[kind.id] = next; else delete extras[kind.id];
  return { ...value, extras };
}

export function buildProductName(v: ClassificationValue): string {
  const parts: string[] = [];
  if (v.categorie) parts.push(v.categorie);
  if (v.modele) parts.push(v.modele);
  if (v.autres) parts.push(v.autres);
  if (v.devant) parts.push(v.devant);
  if (v.extras) {
    for (const key of Object.keys(v.extras).sort()) {
      const val = v.extras[key];
      if (val) parts.push(val);
    }
  }
  if (v.couleur) parts.push(v.couleur);
  if (v.taille) parts.push(`${v.taille} pouces`);
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

/** Compte les sélections actives (utilisé par ClassificationSearchPopover). */
export function countActive(v: ClassificationValue): number {
  let n = 0;
  if (v.categorie) n++;
  for (const k of LEGACY_KEYS) if (v[k]) n++;
  if (v.extras) n += Object.values(v.extras).filter(Boolean).length;
  return n;
}

/** Rendu d'une section d'attribut pour un kind donné. */
const KindSection: React.FC<{
  kind: AttributeKindDef;
  value: ClassificationValue;
  onChange: (v: ClassificationValue) => void;
  labelCls: string;
  chipBase: string;
  chipInactive: string;
  chipActive: string;
}> = ({ kind, value, onChange, labelCls, chipBase, chipInactive, chipActive }) => {
  const { items } = useProductAttributes(kind.legacy || kind.id);
  const selected = getKindValue(value, kind);
  const isDevant = kind.legacy === 'devant';
  // "devant" n'apparaît que pour la catégorie Perruque
  if (isDevant && value.categorie !== 'Perruque') return null;
  return (
    <div className="space-y-2">
      <Label className={`text-sm font-bold ${labelCls}`}>{kind.nom}{isDevant ? ' (Perruque)' : ''}</Label>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">Aucune valeur. Ajoutez-en depuis « {kind.nom} ».</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map(it => (
            <button
              key={it.id}
              type="button"
              onClick={() => onChange(setKindValue(value, kind, selected === it.nom ? '' : it.nom))}
              className={`${chipBase} ${selected === it.nom ? chipActive : chipInactive}`}
            >{it.nom}</button>
          ))}
        </div>
      )}
    </div>
  );
};


const ProductClassificationSelector: React.FC<Props> = ({
  value, onChange, mode = 'create', hideCategorie = false, variant = 'light',
}) => {
  const { kinds } = useAttributeKinds();

  const previewName = useMemo(() => {
    const name = buildProductName(value);
    return name ? name.charAt(0).toUpperCase() + name.slice(1) : '';
  }, [value]);

  const [collapsed, setCollapsed] = useState(true);

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
    <div className={`rounded-xl border ${variant === 'dark' ? 'border-white/10 bg-white/5' : 'border-violet-200 bg-white'}`}>
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
        <div>
          <h3 className={`font-bold ${variant === 'dark' ? 'text-white' : 'text-violet-700'}`}>Classification du produit</h3>
          <p className={`text-xs ${variant === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>Catégorie, attributs personnalisables…</p>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed); }}>
          {collapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </Button>
      </div>

      {!collapsed && (
        <div className="space-y-4 px-4 pb-4">
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

          {kinds.map(k => (
            <KindSection
              key={k.id}
              kind={k}
              value={value}
              onChange={onChange}
              labelCls={labelCls}
              chipBase={chipBase}
              chipInactive={chipInactive}
              chipActive={chipActive}
            />
          ))}

          {previewName && (
            <div className={`p-3 rounded-xl ${variant === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-violet-50 border border-violet-200'}`}>
              <p className={`text-xs font-bold uppercase tracking-wide ${variant === 'dark' ? 'text-white/60' : 'text-violet-600'} mb-1`}>Nom généré</p>
              <p className={`text-sm font-bold ${variant === 'dark' ? 'text-white' : 'text-violet-900'} flex items-center gap-1.5`}>
                <Sparkles className="h-3.5 w-3.5" /> {previewName}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductClassificationSelector;
