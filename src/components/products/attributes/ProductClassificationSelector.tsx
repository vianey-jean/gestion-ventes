/**
 * ProductClassificationSelector
 *
 * VERSION ULTRA PREMIUM / LUXE
 *
 * - Design moderne violet / fuchsia / rose
 * - Animations avancées
 * - Micro-interactions
 * - Effets glow
 * - Effet shine
 * - Particules animées
 * - Nom généré avec le même fond premium
 * - Responsive mobile / tablette / desktop
 * - Bouton Réinitialiser
 * - Icônes responsive
 * - Compatible light / dark
 * - Compatible legacy + kinds dynamiques
 * - Support multiple
 */

import React, { useMemo, useState } from 'react';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

import {
  Sparkles,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Smartphone,
  Tablet,
  Monitor,
  SlidersHorizontal,
  Check,
  WandSparkles,
  Stars,
  Zap,
} from 'lucide-react';

import useProductAttributes from '@/hooks/useProductAttributes';
import useAttributeKinds from '@/hooks/useAttributeKinds';

import type { AttributeKindDef } from '@/services/api/attributKindsApi';

/* =========================================================
   TYPES
========================================================= */

export type ProductCategory =
  | 'Perruque'
  | 'Tissages'
  | 'Extension'
  | 'Autres';

export interface ClassificationValue {
  categorie?: ProductCategory | '';
  modele?: string;
  couleur?: string;
  taille?: string;
  devant?: string;
  autres?: string;

  extras?: Record<string, string>;
}

interface Props {
  value: ClassificationValue;

  onChange: (v: ClassificationValue) => void;

  mode?: 'create' | 'filter';

  hideCategorie?: boolean;

  variant?: 'light' | 'dark';

  multiple?: boolean;

  defaultOpen?: boolean;
}

/* =========================================================
   CATEGORIES
========================================================= */

const CATEGORIES: {
  key: ProductCategory;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    key: 'Perruque',
    label: 'Perruque',
    description: 'Looks complets',
    icon: '✦',
  },
  {
    key: 'Tissages',
    label: 'Tissages',
    description: 'Textures premium',
    icon: '◈',
  },
  {
    key: 'Extension',
    label: 'Extension',
    description: 'Longueurs & volumes',
    icon: '✧',
  },
  {
    key: 'Autres',
    label: 'Autres',
    description: 'Autres produits',
    icon: '◇',
  },
];

/* =========================================================
   LEGACY
========================================================= */

const LEGACY_KEYS = [
  'modele',
  'autres',
  'devant',
  'couleur',
  'taille',
] as const;

type LegacyKey = (typeof LEGACY_KEYS)[number];

/* =========================================================
   HELPERS
========================================================= */

function isTailleKind(
  kind: AttributeKindDef,
): boolean {
  if (kind.legacy === 'taille') {
    return true;
  }

  const label =
    `${kind.slug || ''} ${kind.nom || ''}`.toLowerCase();

  return label.includes('taille');
}

/* =========================================================
   FORMAT TAILLE
========================================================= */

export function formatTailleValue(
  nom: string,
): string {
  const v = (nom || '').trim();

  if (!v) {
    return v;
  }

  if (/pouce/i.test(v)) {
    return v;
  }

  return `${v} Pouces`;
}

/* =========================================================
   GET VALUE
========================================================= */

function getKindValue(
  value: ClassificationValue,
  kind: AttributeKindDef,
): string {
  if (
    kind.legacy &&
    (LEGACY_KEYS as readonly string[]).includes(
      kind.legacy,
    )
  ) {
    return (
      value[kind.legacy as LegacyKey] || ''
    ) as string;
  }

  return value.extras?.[kind.id] || '';
}

/* =========================================================
   SET VALUE
========================================================= */

function setKindValue(
  value: ClassificationValue,
  kind: AttributeKindDef,
  next: string,
): ClassificationValue {
  if (
    kind.legacy &&
    (LEGACY_KEYS as readonly string[]).includes(
      kind.legacy,
    )
  ) {
    return {
      ...value,
      [kind.legacy as LegacyKey]: next,
    };
  }

  const extras = {
    ...(value.extras || {}),
  };

  if (next) {
    extras[kind.id] = next;
  } else {
    delete extras[kind.id];
  }

  return {
    ...value,
    extras,
  };
}

/* =========================================================
   BUILD PRODUCT NAME
========================================================= */

export function buildProductName(
  v: ClassificationValue,
): string {
  const parts: string[] = [];

  if (v.categorie) {
    parts.push(v.categorie);
  }

  if (v.modele) {
    parts.push(v.modele);
  }

  if (v.autres) {
    parts.push(v.autres);
  }

  if (v.devant) {
    parts.push(v.devant);
  }

  if (v.extras) {
    for (
      const key of Object.keys(v.extras).sort()
    ) {
      const val = v.extras[key];

      if (val) {
        parts.push(val);
      }
    }
  }

  if (v.couleur) {
    parts.push(v.couleur);
  }

  if (v.taille) {
    parts.push(
      formatTailleValue(v.taille),
    );
  }

  return parts
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* =========================================================
   COUNT ACTIVE
========================================================= */

export function countActive(
  v: ClassificationValue,
): number {
  let n = 0;

  if (v.categorie) {
    n++;
  }

  for (const k of LEGACY_KEYS) {
    if (v[k]) {
      n++;
    }
  }

  if (v.extras) {
    n += Object.values(
      v.extras,
    ).filter(Boolean).length;
  }

  return n;
}

/* =========================================================
   SPLIT MULTIPLE
========================================================= */

export function splitValues(
  v?: string,
): string[] {
  return (v || '')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
}

/* =========================================================
   KIND SECTION
========================================================= */

const KindSection: React.FC<{
  kind: AttributeKindDef;

  value: ClassificationValue;

  onChange: (
    v: ClassificationValue,
  ) => void;

  labelCls: string;

  chipBase: string;

  chipInactive: string;

  chipActive: string;

  multiple?: boolean;
}> = ({
  kind,
  value,
  onChange,
  labelCls,
  chipBase,
  chipInactive,
  chipActive,
  multiple,
}) => {
  const { items } =
    useProductAttributes(
      kind.legacy || kind.id,
    );

  const selected =
    getKindValue(value, kind);

  const selectedList =
    splitValues(selected);

  const isDevant =
    kind.legacy === 'devant';

  const isTaille =
    isTailleKind(kind);

  /* Devant uniquement pour Perruque */
  if (
    isDevant &&
    value.categorie !== 'Perruque'
  ) {
    return null;
  }

  return (
    <div
      className="
        group/attribute
        space-y-3

        animate-in
        fade-in
        slide-in-from-bottom-3

        duration-700
      "
    >
      {/* LABEL */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-3
        "
      >
        <Label
          className={`
            text-sm
            font-semibold
            tracking-wide

            transition-all
            duration-300

            group-hover/attribute:text-violet-500

            ${labelCls}
          `}
        >
          {kind.nom}

          {isDevant && (
            <span className="ml-1 text-xs opacity-60">
              • Perruque
            </span>
          )}
        </Label>

        {selected && (
          <span
            className="
              flex
              items-center
              gap-1

              rounded-full

              bg-gradient-to-r
              from-violet-500/10
              via-fuchsia-500/10
              to-pink-500/10

              px-2
              py-0.5

              text-[10px]
              font-bold
              uppercase
              tracking-wider

              text-violet-500

              animate-in
              fade-in
              zoom-in-75

              duration-500
            "
          >
            <Check
              className="
                h-3
                w-3

                animate-in
                zoom-in-50
                duration-300
              "
            />

            Sélectionné
          </span>
        )}
      </div>

      {/* VALUES */}

      {items.length === 0 ? (
        <div
          className="
            rounded-xl
            border
            border-dashed
            border-violet-200

            bg-gradient-to-br
            from-violet-50
            via-white
            to-fuchsia-50

            px-4
            py-3

            text-xs
            text-muted-foreground

            transition-all
            duration-500

            hover:-translate-y-0.5
            hover:border-violet-300
            hover:shadow-lg
            hover:shadow-violet-500/10
          "
        >
          Aucune valeur disponible.

          <span className="ml-1 font-medium">
            Ajoutez-en depuis « {kind.nom} ».
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((it) => {
            const label = isTaille
              ? formatTailleValue(it.nom)
              : it.nom;

            const active = multiple
              ? selectedList.includes(label)
              : selected === label;

            const next = multiple
              ? (
                  active
                    ? selectedList.filter(
                        (x) => x !== label,
                      )
                    : [
                        ...selectedList,
                        label,
                      ]
                ).join(' | ')
              : active
                ? ''
                : label;

            return (
              <button
                key={it.id}
                type="button"
                onClick={() =>
                  onChange(
                    setKindValue(
                      value,
                      kind,
                      next,
                    ),
                  )
                }
                className={`
                  ${chipBase}

                  ${
                    active
                      ? chipActive
                      : chipInactive
                  }

                  relative
                  overflow-hidden
                  transform-gpu

                  hover:-translate-y-1
                  active:scale-95

                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-violet-500
                  focus-visible:ring-offset-2

                  ${
                    active
                      ? `
                        shadow-xl
                        shadow-violet-500/30
                      `
                      : `
                        hover:shadow-lg
                        hover:shadow-violet-500/10
                      `
                  }
                `}
              >
                {/* SHINE */}

                <span
                  className="
                    pointer-events-none
                    absolute
                    inset-0

                    -translate-x-full

                    bg-gradient-to-r
                    from-transparent
                    via-white/40
                    to-transparent

                    transition-transform
                    duration-700

                    group-hover/attribute:translate-x-full
                  "
                />

                <span
                  className="
                    relative
                    z-10

                    flex
                    items-center
                    gap-1.5
                  "
                >
                  {active && (
                    <Check
                      className="
                        h-3
                        w-3

                        animate-in
                        zoom-in-50

                        duration-300
                      "
                    />
                  )}

                  {label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* =========================================================
   PREMIUM GENERATED NAME
========================================================= */

const GeneratedNamePreview: React.FC<{
  previewName: string;
  isDark: boolean;
}> = ({
  previewName,
  isDark,
}) => {
  return (
    <div
      className={`
        group/generated

        relative
        mt-7

        overflow-hidden

        rounded-2xl

        border

        p-[1px]

        animate-in
        fade-in
        zoom-in-95
        slide-in-from-bottom-4

        duration-700

        ${
          isDark
            ? `
              border-white/10
              bg-gradient-to-r
              from-violet-500
              via-fuchsia-500
              to-pink-500
            `
            : `
              border-transparent
              bg-gradient-to-r
              from-violet-500
              via-fuchsia-500
              to-pink-500
            `
        }
      `}
    >
      {/* ==========================================
          ANIMATED OUTER GLOW
      =========================================== */}

      <div
        className="
          pointer-events-none

          absolute
          -inset-4

          rounded-[2rem]

          bg-gradient-to-r
          from-violet-500/20
          via-fuchsia-500/20
          to-pink-500/20

          blur-2xl

          opacity-70

          animate-pulse

          transition-opacity
          duration-700

          group-hover/generated:opacity-100
        "
      />

      {/* ==========================================
          MAIN CARD
      =========================================== */}

      <div
        className={`
          relative
          overflow-hidden

          rounded-[15px]

          px-4
          py-4

          sm:px-5
          sm:py-5

          ${
            isDark
              ? `
                bg-slate-950/90
                backdrop-blur-xl
              `
              : `
                bg-gradient-to-br
                from-violet-600
                via-fuchsia-600
                to-pink-500

                text-white
              `
          }
        `}
      >
        {/* ========================================
            MOVING LIGHT
        ========================================= */}

        <div
          className="
            pointer-events-none

            absolute
            inset-y-0
            -left-1/2
            w-1/2

            skew-x-[-20deg]

            bg-gradient-to-r
            from-transparent
            via-white/20
            to-transparent

            animate-[shine_4s_ease-in-out_infinite]
          "
        />

        {/* ========================================
            LARGE GLOW
        ========================================= */}

        <div
          className="
            pointer-events-none

            absolute
            -right-16
            -top-16

            h-36
            w-36

            rounded-full

            bg-white/20

            blur-3xl

            animate-pulse
          "
        />

        <div
          className="
            pointer-events-none

            absolute
            -bottom-20
            -left-16

            h-32
            w-32

            rounded-full

            bg-violet-300/20

            blur-3xl

            animate-pulse
          "
        />

        {/* ========================================
            FLOATING PARTICLES
        ========================================= */}

        <span
          className="
            pointer-events-none

            absolute
            right-[22%]
            top-5

            h-1
            w-1

            rounded-full

            bg-white

            shadow-[0_0_12px_rgba(255,255,255,0.9)]

            animate-[float_3s_ease-in-out_infinite]
          "
        />

        <span
          className="
            pointer-events-none

            absolute
            right-[12%]
            bottom-6

            h-1.5
            w-1.5

            rounded-full

            bg-white/80

            shadow-[0_0_15px_rgba(255,255,255,0.9)]

            animate-[float_4s_ease-in-out_infinite_0.5s]
          "
        />

        <span
          className="
            pointer-events-none

            absolute
            left-[45%]
            top-8

            h-1
            w-1

            rounded-full

            bg-pink-200

            shadow-[0_0_10px_rgba(255,255,255,0.9)]

            animate-[float_2.5s_ease-in-out_infinite_1s]
          "
        />

        {/* ========================================
            CONTENT
        ========================================= */}

        <div
          className="
            relative
            z-10

            flex
            items-start
            gap-3
          "
        >
          {/* ICON */}

          <div
            className="
              relative

              flex
              h-11
              w-11
              shrink-0

              items-center
              justify-center

              overflow-hidden

              rounded-xl

              bg-white/15

              backdrop-blur-md

              ring-1
              ring-white/20

              shadow-lg
              shadow-black/10

              transition-all
              duration-500

              group-hover/generated:scale-110
              group-hover/generated:rotate-3
            "
          >
            {/* ICON GLOW */}

            <span
              className="
                absolute
                inset-0

                rounded-xl

                bg-white/10

                animate-pulse
              "
            />

            <WandSparkles
              className="
                relative
                z-10

                h-5
                w-5

                text-white

                animate-[sparkle_2s_ease-in-out_infinite]
              "
            />

            {/* ICON SHINE */}

            <span
              className="
                pointer-events-none

                absolute
                inset-0

                -translate-x-full

                bg-gradient-to-r
                from-transparent
                via-white/40
                to-transparent

                group-hover/generated:translate-x-full

                transition-transform
                duration-700
              "
            />
          </div>

          {/* TEXT */}

          <div className="min-w-0 flex-1">
            {/* LABEL */}

            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <p
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.2em]

                  text-white/70
                "
              >
                Nom généré
              </p>

              <Stars
                className="
                  h-3
                  w-3

                  text-yellow-200

                  animate-pulse
                "
              />
            </div>

            {/* PRODUCT NAME */}

            <p
              key={previewName}
              className="
                mt-1

                break-words

                text-sm
                sm:text-base

                font-black

                leading-relaxed

                tracking-tight

                text-white

                animate-in
                fade-in
                slide-in-from-left-2
                zoom-in-95

                duration-500
              "
            >
              {previewName}
            </p>

            {/* SUBTEXT */}

            <div
              className="
                mt-2

                flex
                items-center
                gap-1.5

                text-[10px]
                font-medium

                text-white/60
              "
            >
              <Zap
                className="
                  h-3
                  w-3

                  text-yellow-200

                  animate-pulse
                "
              />

              <span>
                Généré automatiquement à partir
                de votre classification
              </span>
            </div>
          </div>

          {/* PREMIUM BADGE */}

          <div
            className="
              hidden
              shrink-0

              sm:flex

              items-center
              gap-1

              rounded-full

              border
              border-white/20

              bg-white/10

              px-2.5
              py-1

              text-[9px]
              font-bold
              uppercase
              tracking-wider

              text-white/80

              backdrop-blur-md
            "
          >
            <Sparkles
              className="
                h-3
                w-3
              "
            />

            Premium
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const ProductClassificationSelector: React.FC<Props> = ({
  value,
  onChange,

  mode = 'create',

  hideCategorie = false,

  variant = 'light',

  multiple = false,

  defaultOpen = false,
}) => {
  const { kinds } =
    useAttributeKinds();

  const [collapsed, setCollapsed] =
    useState(!defaultOpen);

  /* =======================================================
     PREVIEW
  ======================================================= */

  const previewName = useMemo(() => {
    const name =
      buildProductName(value);

    return name
      ? name.charAt(0).toUpperCase() +
          name.slice(1)
      : '';
  }, [value]);

  /* =======================================================
     ACTIVE COUNT
  ======================================================= */

  const activeCount = useMemo(
    () => countActive(value),
    [value],
  );

  /* =======================================================
     RESET
  ======================================================= */

  const handleReset = () => {
    onChange({
      categorie: '',
      modele: '',
      couleur: '',
      taille: '',
      devant: '',
      autres: '',
      extras: {},
    });
  };

  const isDark =
    variant === 'dark';

  /* =======================================================
     LABEL
  ======================================================= */

  const labelCls = isDark
    ? 'text-white/80'
    : 'text-slate-700';

  /* =======================================================
     CHIPS
  ======================================================= */

  const chipBase = `
    rounded-full
    border

    px-3
    py-2

    sm:px-4

    text-xs
    sm:text-sm

    font-semibold

    transition-all
    duration-300
    ease-out

    cursor-pointer
    select-none

    backdrop-blur-sm
  `;

  const chipInactive = isDark
    ? `
      border-white/10
      bg-white/[0.04]

      text-white/70

      hover:border-violet-400/50
      hover:bg-violet-500/10
      hover:text-white
    `
    : `
      border-slate-200
      bg-white

      text-slate-700

      hover:border-violet-300
      hover:bg-violet-50
      hover:text-violet-700
    `;

  const chipActive = `
    border-transparent

    bg-gradient-to-r
    from-violet-600
    via-fuchsia-500
    to-pink-500

    text-white

    shadow-lg
    shadow-violet-500/25

    scale-[1.02]
  `;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className={`
        group

        relative
        overflow-hidden

        rounded-2xl

        border

        transition-all
        duration-500

        ${
          isDark
            ? `
              border-white/10
              bg-slate-950/70

              shadow-2xl
              shadow-black/20
            `
            : `
              border-violet-100
              bg-white

              shadow-xl
              shadow-violet-500/5
            `
        }
      `}
    >
      {/* ==================================================
          BACKGROUND GLOW
      ================================================== */}

      <div
        className="
          pointer-events-none

          absolute
          -right-20
          -top-20

          h-48
          w-48

          rounded-full

          bg-violet-500/10

          blur-3xl

          transition-all
          duration-1000

          group-hover:scale-150
          group-hover:bg-fuchsia-500/15
        "
      />

      <div
        className="
          pointer-events-none

          absolute
          -bottom-24
          -left-20

          h-48
          w-48

          rounded-full

          bg-fuchsia-500/5

          blur-3xl

          transition-all
          duration-1000

          group-hover:scale-125
        "
      />

      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        role="button"
        tabIndex={0}
        onClick={() =>
          setCollapsed(!collapsed)
        }
        onKeyDown={(e) => {
          if (
            e.key === 'Enter' ||
            e.key === ' '
          ) {
            setCollapsed(!collapsed);
          }
        }}
        className="
          relative
          z-10

          flex
          cursor-pointer

          items-center
          justify-between

          gap-3

          px-4
          py-4

          sm:px-5
          sm:py-5

          transition-colors
          duration-300

          hover:bg-violet-500/[0.025]
        "
      >
        {/* LEFT */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >
          {/* ICON */}

          <div
            className="
              relative

              flex
              h-11
              w-11
              shrink-0

              items-center
              justify-center

              overflow-hidden

              rounded-xl

              bg-gradient-to-br
              from-violet-600
              via-fuchsia-500
              to-pink-500

              text-white

              shadow-lg
              shadow-violet-500/25

              transition-all
              duration-500

              group-hover:rotate-3
              group-hover:scale-110
            "
          >
            <Sparkles
              className="
                h-5
                w-5

                animate-[sparkle_2s_ease-in-out_infinite]
              "
            />

            <span
              className="
                absolute
                inset-0

                bg-gradient-to-r
                from-transparent
                via-white/30
                to-transparent

                -translate-x-full

                group-hover:translate-x-full

                transition-transform
                duration-700
              "
            />
          </div>

          {/* TITLE */}

          <div className="min-w-0">
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <h3
                className={`
                  truncate

                  text-sm
                  sm:text-base

                  font-bold
                  tracking-tight

                  ${
                    isDark
                      ? 'text-white'
                      : 'text-slate-900'
                  }
                `}
              >
                Classification du produit
              </h3>

              {activeCount > 0 && (
                <span
                  className="
                    flex
                    h-5
                    min-w-5

                    items-center
                    justify-center

                    rounded-full

                    bg-gradient-to-r
                    from-violet-600
                    to-fuchsia-500

                    px-1.5

                    text-[10px]
                    font-bold
                    text-white

                    shadow-sm

                    animate-in
                    zoom-in-75

                    duration-300
                  "
                >
                  {activeCount}
                </span>
              )}
            </div>

            <p
              className={`
                mt-0.5

                hidden

                text-xs

                sm:block

                ${
                  isDark
                    ? 'text-white/50'
                    : 'text-slate-500'
                }
              `}
            >
              Catégorie, attributs et personnalisation
            </p>
          </div>
        </div>

        {/* ACTIONS */}

        <div
          className="
            flex
            items-center
            gap-1
          "
        >
          {activeCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();

                handleReset();
              }}
              className={`
                hidden

                gap-1.5

                rounded-xl

                text-xs

                transition-all
                duration-300

                sm:flex

                ${
                  isDark
                    ? `
                      text-white/60

                      hover:bg-red-500/10
                      hover:text-red-400
                    `
                    : `
                      text-slate-500

                      hover:bg-red-50
                      hover:text-red-500
                    `
                }
              `}
            >
              <RotateCcw
                className="
                  h-3.5
                  w-3.5
                "
              />

              Réinitialiser
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();

              setCollapsed(!collapsed);
            }}
            className={`
              h-9
              w-9

              rounded-xl

              transition-all
              duration-300

              ${
                isDark
                  ? `
                    text-white/60

                    hover:bg-white/10
                    hover:text-white
                  `
                  : `
                    text-slate-500

                    hover:bg-violet-50
                    hover:text-violet-600
                  `
              }
            `}
          >
            {collapsed ? (
              <ChevronDown
                className="h-5 w-5"
              />
            ) : (
              <ChevronUp
                className="h-5 w-5"
              />
            )}
          </Button>
        </div>
      </div>

      {/* ==================================================
          CONTENT
      ================================================== */}

      {!collapsed && (
        <div
          className="
            relative
            z-10

            animate-in
            fade-in
            slide-in-from-top-2

            duration-500

            px-4
            pb-5

            sm:px-5
          "
        >
          {/* =================================================
              MOBILE RESET
          ================================================= */}

          {activeCount > 0 && (
            <div
              className="
                mb-5

                sm:hidden

                animate-in
                fade-in
                slide-in-from-top-2

                duration-500
              "
            >
              <button
                type="button"
                onClick={handleReset}
                className={`
                  flex
                  w-full

                  items-center
                  justify-center

                  gap-2

                  rounded-xl

                  border

                  py-2.5

                  text-xs
                  font-semibold

                  transition-all
                  duration-300

                  active:scale-[0.98]

                  ${
                    isDark
                      ? `
                        border-white/10
                        bg-white/5
                        text-white/70

                        hover:bg-red-500/10
                        hover:text-red-400
                      `
                      : `
                        border-slate-200
                        bg-slate-50
                        text-slate-600

                        hover:border-red-200
                        hover:bg-red-50
                        hover:text-red-500
                      `
                  }
                `}
              >
                <RotateCcw
                  className="
                    h-3.5
                    w-3.5
                  "
                />

                Réinitialiser la sélection
              </button>
            </div>
          )}

          {/* =================================================
              DEVICE INDICATOR
          ================================================= */}

          <div
            className={`
              mb-5

              flex
              items-center
              justify-between

              rounded-xl

              border

              px-3
              py-2

              ${
                isDark
                  ? `
                    border-white/10
                    bg-white/[0.03]
                  `
                  : `
                    border-violet-100
                    bg-violet-50/50
                  `
              }
            `}
          >
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <SlidersHorizontal
                className={`
                  h-3.5
                  w-3.5

                  ${
                    isDark
                      ? 'text-violet-300'
                      : 'text-violet-600'
                  }
                `}
              />

              <span
                className={`
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-widest

                  ${
                    isDark
                      ? 'text-white/50'
                      : 'text-violet-600/70'
                  }
                `}
              >
                Personnalisation
              </span>
            </div>

            <div
              className={`
                flex
                items-center
                gap-1.5

                ${
                  isDark
                    ? 'text-white/40'
                    : 'text-slate-400'
                }
              `}
            >
              <Smartphone
                className="
                  h-3.5
                  w-3.5

                  sm:hidden
                "
              />

              <Tablet
                className="
                  hidden

                  h-3.5
                  w-3.5

                  sm:block
                  lg:hidden
                "
              />

              <Monitor
                className="
                  hidden

                  h-3.5
                  w-3.5

                  lg:block
                "
              />

              <span
                className="
                  text-[10px]
                "
              >
                <span className="sm:hidden">
                  Mobile
                </span>

                <span
                  className="
                    hidden
                    sm:inline
                    lg:hidden
                  "
                >
                  Tablette
                </span>

                <span
                  className="
                    hidden
                    lg:inline
                  "
                >
                  Desktop
                </span>
              </span>
            </div>
          </div>

          {/* =================================================
              CATEGORY
          ================================================= */}

          {!hideCategorie && (
            <div
              className="
                mb-6
                space-y-3

                animate-in
                fade-in
                slide-in-from-bottom-3

                duration-700
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >
                <Label
                  className={`
                    text-sm
                    font-semibold
                    tracking-wide

                    ${labelCls}
                  `}
                >
                  Catégorie

                  {mode === 'create' && (
                    <span
                      className="
                        ml-1
                        text-red-500
                      "
                    >
                      *
                    </span>
                  )}
                </Label>

                {value.categorie && (
                  <span
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wider

                      text-violet-500

                      animate-in
                      fade-in
                      slide-in-from-right-2
                    "
                  >
                    {value.categorie}
                  </span>
                )}
              </div>

              <div
                className="
                  grid
                  grid-cols-2

                  gap-2

                  sm:grid-cols-4
                "
              >
                {CATEGORIES.map(
                  (category) => {
                    const active =
                      value.categorie ===
                      category.key;

                    return (
                      <button
                        key={category.key}
                        type="button"
                        onClick={() =>
                          onChange({
                            ...value,

                            categorie:
                              category.key,

                            devant:
                              category.key ===
                              'Perruque'
                                ? value.devant
                                : '',
                          })
                        }
                        className={`
                          group/category

                          relative
                          overflow-hidden

                          rounded-xl
                          border

                          p-3

                          text-left

                          transition-all
                          duration-500

                          hover:-translate-y-1
                          active:scale-[0.97]

                          focus:outline-none

                          focus-visible:ring-2
                          focus-visible:ring-violet-500

                          ${
                            active
                              ? `
                                border-violet-400

                                bg-gradient-to-br
                                from-violet-600
                                via-fuchsia-500
                                to-pink-500

                                text-white

                                shadow-xl
                                shadow-violet-500/30

                                scale-[1.02]
                              `
                              : isDark
                                ? `
                                  border-white/10
                                  bg-white/[0.03]
                                  text-white/70

                                  hover:border-violet-400/40
                                  hover:bg-violet-500/10
                                `
                                : `
                                  border-slate-200
                                  bg-white
                                  text-slate-700

                                  hover:border-violet-300
                                  hover:bg-violet-50
                                `
                          }
                        `}
                      >
                        <div
                          className="
                            flex
                            items-start
                            justify-between
                            gap-2
                          "
                        >
                          <span
                            className={`
                              flex
                              h-8
                              w-8

                              items-center
                              justify-center

                              rounded-lg

                              text-base

                              transition-all
                              duration-500

                              ${
                                active
                                  ? `
                                    bg-white/20

                                    group-hover/category:rotate-6
                                    group-hover/category:scale-110
                                  `
                                  : isDark
                                    ? 'bg-white/5'
                                    : 'bg-violet-50'
                              }
                            `}
                          >
                            {category.icon}
                          </span>

                          {active && (
                            <span
                              className="
                                flex
                                h-5
                                w-5

                                items-center
                                justify-center

                                rounded-full

                                bg-white/20

                                animate-in
                                zoom-in-75

                                duration-300
                              "
                            >
                              <Check
                                className="h-3 w-3"
                              />
                            </span>
                          )}
                        </div>

                        <div className="mt-3">
                          <div
                            className="
                              text-xs
                              font-bold
                            "
                          >
                            {category.label}
                          </div>

                          <div
                            className={`
                              mt-0.5

                              text-[9px]

                              ${
                                active
                                  ? 'text-white/70'
                                  : isDark
                                    ? 'text-white/40'
                                    : 'text-slate-400'
                              }
                            `}
                          >
                            {category.description}
                          </div>
                        </div>

                        {/* SHINE */}

                        <span
                          className="
                            pointer-events-none

                            absolute
                            inset-0

                            -translate-x-full

                            bg-gradient-to-r
                            from-transparent
                            via-white/20
                            to-transparent

                            transition-transform
                            duration-700

                            group-hover/category:translate-x-full
                          "
                        />
                      </button>
                    );
                  },
                )}
              </div>

              {mode === 'filter' &&
                value.categorie && (
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...value,
                        categorie: '',
                        devant: '',
                      })
                    }
                    className="
                      text-[10px]
                      font-semibold
                      text-slate-400

                      transition-all
                      duration-300

                      hover:translate-x-1
                      hover:text-red-500
                    "
                  >
                    Effacer la catégorie
                  </button>
                )}
            </div>
          )}

          {/* =================================================
              SEPARATOR
          ================================================= */}

          {!hideCategorie &&
            kinds.length > 0 && (
              <div
                className={`
                  mb-6
                  h-px

                  ${
                    isDark
                      ? 'bg-white/10'
                      : 'bg-slate-100'
                  }
                `}
              />
            )}

          {/* =================================================
              ATTRIBUTES
          ================================================= */}

          <div className="space-y-6">
            {kinds.map(
              (kind, index) => (
                <React.Fragment
                  key={kind.id}
                >
                  <KindSection
                    kind={kind}
                    value={value}
                    onChange={onChange}
                    multiple={multiple}
                    labelCls={labelCls}
                    chipBase={chipBase}
                    chipInactive={
                      chipInactive
                    }
                    chipActive={
                      chipActive
                    }
                  />

                  {index <
                    kinds.length - 1 && (
                    <div
                      className={`
                        h-px

                        ${
                          isDark
                            ? 'bg-white/5'
                            : 'bg-slate-50'
                        }
                      `}
                    />
                  )}
                </React.Fragment>
              ),
            )}
          </div>

          {/* =================================================
              PREMIUM GENERATED NAME
          ================================================= */}

          {previewName &&
            !multiple && (
              <GeneratedNamePreview
                previewName={
                  previewName
                }
                isDark={isDark}
              />
            )}

          {/* =================================================
              MOBILE FOOTER
          ================================================= */}

          <div
            className="
              mt-5

              flex
              items-center
              justify-center
              gap-2

              text-[10px]
              font-medium
              text-slate-400

              sm:hidden

              animate-pulse
            "
          >
            <Smartphone
              className="
                h-3.5
                w-3.5
              "
            />

            <span>
              Interface optimisée mobile
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   EXPORT
========================================================= */

export default ProductClassificationSelector;