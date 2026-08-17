/**
 * ClientFilterBar — Barre de tri/filtres PREMIUM
 *
 * Design :
 * - Ultra moderne
 * - Luxe / premium
 * - Responsive
 * - Mode clair / sombre
 * - Aucun effet de flou
 * - Animations et micro-interactions
 */

import React, { useEffect, useState } from 'react';

import {
  ArrowUp,
  ArrowDown,
  Crown,
  MapPin,
  X,
  SlidersHorizontal,
  Sparkles,
  ChevronDown,
  Check,
  RotateCcw,
  SortAsc,
  Navigation,
} from 'lucide-react';

import { clientsVillesApi } from '@/services/api/villesApi';

import listesFideliteApi, {
  FideliteTierConfig,
} from '@/services/api/listesFideliteApi';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export type FidelityTier = string;

interface Props {
  sortDir: 'asc' | 'desc';
  onToggleSort: () => void;

  tierFilter: FidelityTier | null;
  onChangeTier: (t: FidelityTier | null) => void;

  villeFilter: string | null;
  onChangeVille: (v: string | null) => void;
}

const ClientFilterBar: React.FC<Props> = ({
  sortDir,
  onToggleSort,
  tierFilter,
  onChangeTier,
  villeFilter,
  onChangeVille,
}) => {
  const [villes, setVilles] = useState<string[]>([]);
  const [tiers, setTiers] = useState<FideliteTierConfig[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  /*
   * Chargement initial
   */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsVisible(true);
    }, 80);

    clientsVillesApi
      .getAll()
      .then((data) => {
        setVilles(data);
      })
      .catch(() => {
        setVilles([]);
      });

    const loadTiers = () => {
      listesFideliteApi
        .getAll()
        .then((data) => {
          setTiers(data);
        })
        .catch(() => {
          setTiers([]);
        });
    };

    loadTiers();

    window.addEventListener(
      'listes-fidelite-updated',
      loadTiers
    );

    return () => {
      window.clearTimeout(timer);

      window.removeEventListener(
        'listes-fidelite-updated',
        loadTiers
      );
    };
  }, []);

  /*
   * Tier actuel
   */
  const currentTier = tiers.find(
    (tier) => tier.id === tierFilter
  );

  /*
   * Nombre de filtres actifs
   */
  const activeFiltersCount =
    [tierFilter, villeFilter].filter(Boolean).length;

  const hasFilters = activeFiltersCount > 0;

  /*
   * Reset complet
   */
  const resetFilters = () => {
    onChangeTier(null);
    onChangeVille(null);
  };

  return (
    <div
      className={`
        w-full
        mb-5
        sm:mb-6
        md:mb-7

        transition-all
        duration-700
       ease-smooth

        ${
          isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4'
        }
      `}
    >
      {/* =====================================================
          CONTENEUR PRINCIPAL
      ====================================================== */}

      <div
        className="
          group/container
          relative
          w-full
          overflow-hidden

          rounded-2xl
          sm:rounded-3xl

          border
          border-gray-200
          dark:border-gray-800

          bg-white
          dark:bg-gray-950

          shadow-[0_8px_30px_rgba(15,23,42,0.06)]
          dark:shadow-[0_12px_35px_rgba(0,0,0,0.35)]

          transition-all
          duration-500

          hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)]
          dark:hover:shadow-[0_18px_45px_rgba(0,0,0,0.45)]
        "
      >
        {/* =====================================================
            LIGNE PREMIUM ANIMÉE
        ====================================================== */}

        <div
          className="
            absolute
            top-0
            left-0
            right-0
            h-[3px]

            bg-gradient-to-r
            from-violet-500
            via-fuchsia-500
            to-blue-500

            bg-[length:200%_100%]

            animate-[premiumGradient_5s_ease_infinite]
          "
        />

        {/* Petite ligne décorative inférieure */}

        <div
          className="
            absolute
            bottom-0
            left-1/2

            h-[1px]
            w-0

            bg-gradient-to-r
            from-transparent
            via-violet-500
            to-transparent

            opacity-0

            transition-all
            duration-700

            group-hover/container:left-0
            group-hover/container:w-full
            group-hover/container:opacity-70
          "
        />

        {/* =====================================================
            CONTENU
        ====================================================== */}

        <div className="relative p-3 sm:p-4 md:p-5 lg:p-6">
          {/* ===================================================
              HEADER
          ==================================================== */}

          <div
            className="
              flex
              flex-col
              gap-3

              sm:flex-row
              sm:items-center
              sm:justify-between

              mb-4
              sm:mb-5
            "
          >
            {/* TITRE */}

            <div className="flex items-center gap-3 min-w-0">
              {/* ICON PRINCIPALE */}

              <div
                className="
                  relative
                  shrink-0

                  flex
                  items-center
                  justify-center

                  w-10
                  h-10

                  sm:w-11
                  sm:h-11

                  rounded-xl
                  sm:rounded-2xl

                  bg-gradient-to-br
                  from-violet-500
                  via-fuchsia-500
                  to-indigo-600

                  text-white

                  shadow-[0_8px_20px_rgba(139,92,246,0.25)]

                  transition-all
                  duration-500

                  group-hover/container:scale-105
                  group-hover/container:-rotate-2
                "
              >
                <SlidersHorizontal
                  className="
                    w-4
                    h-4
                    sm:w-5
                    sm:h-5

                    transition-transform
                    duration-500

                    group-hover/container:rotate-12
                  "
                />

                {/* Point lumineux */}

                <span
                  className="
                    absolute
                    top-1
                    right-1

                    w-1.5
                    h-1.5

                    rounded-full

                    bg-white

                    animate-pulse
                  "
                />
              </div>

              {/* TEXTE */}

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3
                    className="
                      text-sm
                      sm:text-base
                      md:text-lg

                      font-bold

                      tracking-tight

                      text-gray-950
                      dark:text-white
                    "
                  >
                    Filtres & classement
                  </h3>

                  <Sparkles
                    className="
                      hidden
                      sm:block

                      w-4
                      h-4

                      text-fuchsia-500

                      animate-[sparkle_2.5s_ease-in-out_infinite]
                    "
                  />
                </div>

                <p
                  className="
                    mt-0.5

                    text-[10px]
                    sm:text-xs

                    text-gray-500
                    dark:text-gray-400
                  "
                >
                  Affinez votre liste de clients
                </p>
              </div>
            </div>

            {/* =================================================
                INDICATEUR FILTRES
            ================================================== */}

            {hasFilters && (
              <div
                className="
                  flex
                  items-center
                  gap-2

                  w-fit

                  px-3
                  py-1.5

                  rounded-full

                  bg-violet-50
                  dark:bg-violet-950/60

                  border
                  border-violet-200
                  dark:border-violet-800

                  text-violet-700
                  dark:text-violet-300

                  text-[10px]
                  sm:text-xs

                  font-bold

                  animate-[filterBadgeIn_0.4s_cubic-bezier(0.22,1,0.36,1)]
                "
              >
                <span
                  className="
                    flex
                    items-center
                    justify-center

                    w-5
                    h-5

                    rounded-full

                    bg-violet-600
                    dark:bg-violet-500

                    text-white

                    text-[10px]

                    animate-[countPop_0.4s_ease-out]
                  "
                >
                  {activeFiltersCount}
                </span>

                <span>
                  filtre
                  {activeFiltersCount > 1 ? 's' : ''} actif
                  {activeFiltersCount > 1 ? 's' : ''}
                </span>

                <Sparkles
                  className="
                    w-3
                    h-3

                    text-violet-500

                    animate-pulse
                  "
                />
              </div>
            )}
          </div>

          {/* ===================================================
              FILTRES
          ==================================================== */}

          <div
            className="
              flex
              flex-wrap

              gap-2
              sm:gap-2.5
              md:gap-3
            "
          >
            {/* =================================================
                TRI PAR NOM
            ================================================== */}

            <button
              type="button"
              onClick={onToggleSort}
              aria-label={`Trier les clients ${
                sortDir === 'asc'
                  ? 'de Z à A'
                  : 'de A à Z'
              }`}
              className="
                group/sort

                relative

                flex
                items-center
                justify-center
                gap-2

                min-h-[42px]
                sm:min-h-[44px]

                px-3
                sm:px-4

                rounded-xl
                sm:rounded-2xl

                border
                border-gray-200
                dark:border-gray-800

                bg-gray-50
                dark:bg-gray-900

                text-gray-800
                dark:text-gray-200

                text-xs
                sm:text-sm

                font-semibold

                overflow-hidden

                transition-all
                duration-300

                hover:border-violet-300
                dark:hover:border-violet-700

                hover:bg-violet-50
                dark:hover:bg-violet-950/50

                hover:text-violet-700
                dark:hover:text-violet-300

                hover:-translate-y-0.5

                active:scale-95
              "
            >
              {/* Accent */}

              <span
                className="
                  absolute
                  inset-y-0
                  left-0

                  w-0

                  bg-violet-500/5

                  transition-all
                  duration-300

                  group-hover/sort:w-full
                "
              />

              <SortAsc
                className="
                  relative
                  w-4
                  h-4

                  text-violet-500

                  transition-all
                  duration-500

                  group-hover/sort:scale-110
                  group-hover/sort:rotate-6
                "
              />

              <span className="relative">
                Nom
              </span>

              {/* Flèches */}

              <span
                className="
                  relative

                  flex
                  flex-col

                  transition-transform
                  duration-300

                  group-hover/sort:scale-110
                "
              >
                <ArrowUp
                  className={`
                    h-3
                    w-3

                    transition-all
                    duration-300

                    ${
                      sortDir === 'asc'
                        ? `
                          text-violet-600
                          dark:text-violet-400
                          scale-125
                        `
                        : `
                          text-gray-300
                          dark:text-gray-700
                        `
                    }
                  `}
                />

                <ArrowDown
                  className={`
                    h-3
                    w-3
                    -mt-1

                    transition-all
                    duration-300

                    ${
                      sortDir === 'desc'
                        ? `
                          text-violet-600
                          dark:text-violet-400
                          scale-125
                        `
                        : `
                          text-gray-300
                          dark:text-gray-700
                        `
                    }
                  `}
                />
              </span>

              <span
                className="
                  hidden
                  sm:inline

                  text-[10px]
                  sm:text-xs

                  text-gray-500
                  dark:text-gray-500
                "
              >
                {sortDir === 'asc'
                  ? 'A → Z'
                  : 'Z → A'}
              </span>
            </button>

            {/* =================================================
                FILTRE FIDÉLITÉ
            ================================================== */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`
                    group/tier

                    relative

                    flex
                    items-center
                    gap-2

                    min-h-[42px]
                    sm:min-h-[44px]

                    px-3
                    sm:px-4

                    rounded-xl
                    sm:rounded-2xl

                    border

                    text-xs
                    sm:text-sm

                    font-semibold

                    overflow-hidden

                    transition-all
                    duration-300

                    active:scale-95

                    ${
                      currentTier
                        ? `
                          bg-gradient-to-r
                          ${currentTier.grad}

                          text-white

                          border-transparent

                          shadow-[0_8px_22px_rgba(139,92,246,0.22)]

                          hover:-translate-y-0.5
                          hover:shadow-[0_12px_28px_rgba(139,92,246,0.30)]
                        `
                        : `
                          bg-gray-50
                          dark:bg-gray-900

                          border-gray-200
                          dark:border-gray-800

                          text-gray-800
                          dark:text-gray-200

                          hover:bg-amber-50
                          dark:hover:bg-amber-950/40

                          hover:border-amber-300
                          dark:hover:border-amber-700

                          hover:text-amber-700
                          dark:hover:text-amber-300

                          hover:-translate-y-0.5
                        `
                    }
                  `}
                >
                  {/* Shine */}

                  {currentTier && (
                    <span
                      className="
                        absolute
                        inset-0

                        bg-gradient-to-r
                        from-transparent
                        via-white/15
                        to-transparent

                        -translate-x-full

                        group-hover/tier:translate-x-full

                        transition-transform
                        duration-700
                      "
                    />
                  )}

                  <Crown
                    className="
                      relative
                      w-4
                      h-4

                      transition-all
                      duration-500

                      group-hover/tier:scale-110
                      group-hover/tier:-rotate-6
                    "
                  />

                  <span className="relative max-w-[150px] truncate">
                    Fidélité
                    {currentTier
                      ? ` : ${currentTier.label}`
                      : ''}
                  </span>

                  {currentTier ? (
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label="Supprimer le filtre fidélité"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onChangeTier(null);
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === 'Enter' ||
                          e.key === ' '
                        ) {
                          e.preventDefault();
                          e.stopPropagation();
                          onChangeTier(null);
                        }
                      }}
                      className="
                        relative

                        ml-1
                        p-1

                        rounded-full

                        hover:bg-white/20

                        transition-all
                        duration-300

                        hover:rotate-90
                        hover:scale-110
                      "
                    >
                      <X className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <ChevronDown
                      className="
                        relative

                        w-3.5
                        h-3.5

                        opacity-50

                        transition-transform
                        duration-300

                        group-data-[state=open]/tier:rotate-180
                      "
                    />
                  )}
                </button>
              </DropdownMenuTrigger>

              {/* MENU */}

              <DropdownMenuContent
                align="start"
                sideOffset={8}
                className="
                  w-[270px]

                  p-2

                  rounded-2xl

                  bg-white
                  dark:bg-gray-950

                  border
                  border-gray-200
                  dark:border-gray-800

                  shadow-[0_20px_50px_rgba(15,23,42,0.14)]
                  dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)]

                  animate-in
                  fade-in-0
                  zoom-in-95
                  slide-in-from-top-2

                  duration-200
                "
              >
                <DropdownMenuLabel
                  className="
                    px-3
                    py-2

                    text-[10px]
                    sm:text-xs

                    uppercase
                    tracking-[0.15em]

                    font-bold

                    text-gray-400
                    dark:text-gray-500
                  "
                >
                  Niveau de fidélité
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {tiers.map((tier) => {
                  const isActive =
                    tierFilter === tier.id;

                  return (
                    <DropdownMenuItem
                      key={tier.id}
                      onClick={() =>
                        onChangeTier(tier.id)
                      }
                      className="
                        group/item

                        flex
                        items-center
                        gap-3

                        rounded-xl

                        px-3
                        py-3

                        cursor-pointer

                        transition-all
                        duration-200

                        hover:bg-gray-100
                        dark:hover:bg-gray-900

                        focus:bg-gray-100
                        dark:focus:bg-gray-900
                      "
                    >
                      {/* Couleur */}

                      <span
                        className={`
                          relative

                          w-3
                          h-3

                          rounded-full

                          bg-gradient-to-r
                          ${tier.grad}

                          transition-all
                          duration-300

                          ${
                            isActive
                              ? 'scale-125'
                              : 'group-hover/item:scale-125'
                          }
                        `}
                      >
                        {isActive && (
                          <span
                            className="
                              absolute
                              inset-[-3px]

                              rounded-full

                              border
                              border-violet-400/40

                              animate-ping
                            "
                          />
                        )}
                      </span>

                      {/* Nom */}

                      <span
                        className="
                          flex-1

                          font-medium

                          text-gray-800
                          dark:text-gray-200
                        "
                      >
                        {tier.label}
                      </span>

                      {/* Check */}

                      {isActive && (
                        <span
                          className="
                            flex
                            items-center
                            justify-center

                            w-6
                            h-6

                            rounded-full

                            bg-violet-100
                            dark:bg-violet-950

                            text-violet-600
                            dark:text-violet-400

                            animate-[checkPop_0.25s_ease-out]
                          "
                        >
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </DropdownMenuItem>
                  );
                })}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() =>
                    onChangeTier(null)
                  }
                  className="
                    rounded-xl

                    px-3
                    py-3

                    cursor-pointer

                    text-gray-500
                    dark:text-gray-400

                    hover:bg-gray-100
                    dark:hover:bg-gray-900
                  "
                >
                  <RotateCcw className="w-4 h-4 mr-2" />

                  Toutes les fidélités
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* =================================================
                FILTRE VILLE
            ================================================== */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`
                    group/city

                    relative

                    flex
                    items-center
                    gap-2

                    min-h-[42px]
                    sm:min-h-[44px]

                    px-3
                    sm:px-4

                    rounded-xl
                    sm:rounded-2xl

                    border

                    text-xs
                    sm:text-sm

                    font-semibold

                    overflow-hidden

                    transition-all
                    duration-300

                    active:scale-95

                    ${
                      villeFilter
                        ? `
                          bg-gradient-to-r
                          from-blue-600
                          to-indigo-600

                          text-white

                          border-transparent

                          shadow-[0_8px_22px_rgba(37,99,235,0.22)]

                          hover:-translate-y-0.5

                          hover:shadow-[0_12px_28px_rgba(37,99,235,0.30)]
                        `
                        : `
                          bg-gray-50
                          dark:bg-gray-900

                          border-gray-200
                          dark:border-gray-800

                          text-gray-800
                          dark:text-gray-200

                          hover:bg-blue-50
                          dark:hover:bg-blue-950/40

                          hover:border-blue-300
                          dark:hover:border-blue-700

                          hover:text-blue-700
                          dark:hover:text-blue-300

                          hover:-translate-y-0.5
                        `
                    }
                  `}
                >
                  {/* Shine */}

                  {villeFilter && (
                    <span
                      className="
                        absolute
                        inset-0

                        bg-gradient-to-r
                        from-transparent
                        via-white/15
                        to-transparent

                        -translate-x-full

                        group-hover/city:translate-x-full

                        transition-transform
                        duration-700
                      "
                    />
                  )}

                  <Navigation
                    className="
                      relative

                      w-4
                      h-4

                      transition-all
                      duration-500

                      group-hover/city:scale-110
                      group-hover/city:-rotate-6
                    "
                  />

                  <span className="relative max-w-[150px] truncate">
                    Ville
                    {villeFilter
                      ? ` : ${villeFilter}`
                      : ''}
                  </span>

                  {villeFilter ? (
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label="Supprimer le filtre ville"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onChangeVille(null);
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === 'Enter' ||
                          e.key === ' '
                        ) {
                          e.preventDefault();
                          e.stopPropagation();
                          onChangeVille(null);
                        }
                      }}
                      className="
                        relative

                        ml-1
                        p-1

                        rounded-full

                        hover:bg-white/20

                        transition-all
                        duration-300

                        hover:rotate-90
                        hover:scale-110
                      "
                    >
                      <X className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <ChevronDown
                      className="
                        relative

                        w-3.5
                        h-3.5

                        opacity-50

                        transition-transform
                        duration-300

                        group-data-[state=open]/city:rotate-180
                      "
                    />
                  )}
                </button>
              </DropdownMenuTrigger>

              {/* MENU VILLES */}

              <DropdownMenuContent
                align="start"
                sideOffset={8}
                className="
                  w-[280px]
                  sm:w-[300px]

                  max-h-[360px]

                  overflow-y-auto

                  p-2

                  rounded-2xl

                  bg-white
                  dark:bg-gray-950

                  border
                  border-gray-200
                  dark:border-gray-800

                  shadow-[0_20px_50px_rgba(15,23,42,0.14)]
                  dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)]

                  animate-in
                  fade-in-0
                  zoom-in-95
                  slide-in-from-top-2

                  duration-200
                "
              >
                <DropdownMenuLabel
                  className="
                    px-3
                    py-2

                    text-[10px]
                    sm:text-xs

                    uppercase
                    tracking-[0.15em]

                    font-bold

                    text-gray-400
                    dark:text-gray-500
                  "
                >
                  Localisation
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {villes.length === 0 && (
                  <DropdownMenuItem
                    disabled
                    className="
                      rounded-xl
                      py-3

                      text-gray-400
                    "
                  >
                    <MapPin className="w-4 h-4 mr-2" />

                    Aucune ville enregistrée
                  </DropdownMenuItem>
                )}

                {villes.map((ville) => {
                  const isActive =
                    villeFilter === ville;

                  return (
                    <DropdownMenuItem
                      key={ville}
                      onClick={() =>
                        onChangeVille(ville)
                      }
                      className="
                        group/cityitem

                        flex
                        items-center
                        gap-3

                        rounded-xl

                        px-3
                        py-3

                        cursor-pointer

                        transition-all
                        duration-200

                        hover:bg-blue-50
                        dark:hover:bg-blue-950/40

                        focus:bg-blue-50
                        dark:focus:bg-blue-950/40
                      "
                    >
                      <span
                        className={`
                          flex
                          items-center
                          justify-center

                          w-8
                          h-8

                          rounded-lg

                          transition-all
                          duration-300

                          ${
                            isActive
                              ? `
                                bg-blue-100
                                dark:bg-blue-950

                                text-blue-600
                                dark:text-blue-400

                                scale-105
                              `
                              : `
                                bg-gray-100
                                dark:bg-gray-900

                                text-gray-500
                                dark:text-gray-400

                                group-hover/cityitem:bg-blue-100
                                dark:group-hover/cityitem:bg-blue-950

                                group-hover/cityitem:text-blue-500

                                group-hover/cityitem:scale-105
                              `
                          }
                        `}
                      >
                        <MapPin className="w-4 h-4" />
                      </span>

                      <span
                        className="
                          flex-1

                          font-medium

                          text-gray-800
                          dark:text-gray-200
                        "
                      >
                        {ville}
                      </span>

                      {isActive && (
                        <span
                          className="
                            flex
                            items-center
                            justify-center

                            w-6
                            h-6

                            rounded-full

                            bg-blue-100
                            dark:bg-blue-950

                            text-blue-600
                            dark:text-blue-400

                            animate-[checkPop_0.25s_ease-out]
                          "
                        >
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </DropdownMenuItem>
                  );
                })}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() =>
                    onChangeVille(null)
                  }
                  className="
                    rounded-xl

                    px-3
                    py-3

                    cursor-pointer

                    text-gray-500
                    dark:text-gray-400

                    hover:bg-gray-100
                    dark:hover:bg-gray-900
                  "
                >
                  <RotateCcw className="w-4 h-4 mr-2" />

                  Toutes les villes
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* =================================================
                RESET
            ================================================== */}

            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                aria-label="Réinitialiser les filtres"
                className="
                  group/reset

                  flex
                  items-center
                  justify-center
                  gap-2

                  min-h-[42px]
                  sm:min-h-[44px]

                  px-3
                  sm:px-4

                  rounded-xl
                  sm:rounded-2xl

                  border
                  border-red-200
                  dark:border-red-900

                  bg-red-50
                  dark:bg-red-950/40

                  text-red-600
                  dark:text-red-400

                  text-xs
                  sm:text-sm

                  font-semibold

                  transition-all
                  duration-300

                  hover:bg-red-100
                  dark:hover:bg-red-950

                  hover:border-red-300
                  dark:hover:border-red-800

                  hover:-translate-y-0.5

                  active:scale-95

                  animate-[resetIn_0.35s_ease-out]
                "
              >
                <X
                  className="
                    w-4
                    h-4

                    transition-transform
                    duration-500

                    group-hover/reset:rotate-90
                    group-hover/reset:scale-110
                  "
                />

                <span className="hidden sm:inline">
                  Réinitialiser
                </span>
              </button>
            )}
          </div>

          {/* ===================================================
              RÉSUMÉ DES FILTRES
          ==================================================== */}

          {hasFilters && (
            <div
              className="
                mt-4
                pt-4

                border-t
                border-gray-100
                dark:border-gray-900

                flex
                flex-wrap
                items-center
                gap-2

                animate-[summaryIn_0.4s_ease-out]
              "
            >
              <span
                className="
                  text-[10px]
                  sm:text-xs

                  font-semibold

                  uppercase
                  tracking-wider

                  text-gray-400
                  dark:text-gray-500
                "
              >
                Actifs :
              </span>

              {/* Tier */}

              {currentTier && (
                <button
                  type="button"
                  onClick={() =>
                    onChangeTier(null)
                  }
                  className="
                    group/tag

                    flex
                    items-center
                    gap-1.5

                    px-2.5
                    py-1

                    rounded-lg

                    bg-violet-50
                    dark:bg-violet-950/50

                    border
                    border-violet-200
                    dark:border-violet-800

                    text-violet-700
                    dark:text-violet-300

                    text-[10px]
                    sm:text-xs

                    font-semibold

                    transition-all
                    duration-200

                    hover:bg-violet-100
                    dark:hover:bg-violet-950

                    hover:scale-[1.02]
                  "
                >
                  <Crown className="w-3 h-3" />

                  <span className="max-w-[120px] truncate">
                    {currentTier.label}
                  </span>

                  <X
                    className="
                      w-3
                      h-3

                      transition-transform
                      duration-300

                      group-hover/tag:rotate-90
                    "
                  />
                </button>
              )}

              {/* Ville */}

              {villeFilter && (
                <button
                  type="button"
                  onClick={() =>
                    onChangeVille(null)
                  }
                  className="
                    group/tag

                    flex
                    items-center
                    gap-1.5

                    px-2.5
                    py-1

                    rounded-lg

                    bg-blue-50
                    dark:bg-blue-950/50

                    border
                    border-blue-200
                    dark:border-blue-800

                    text-blue-700
                    dark:text-blue-300

                    text-[10px]
                    sm:text-xs

                    font-semibold

                    transition-all
                    duration-200

                    hover:bg-blue-100
                    dark:hover:bg-blue-950

                    hover:scale-[1.02]
                  "
                >
                  <MapPin className="w-3 h-3" />

                  <span className="max-w-[120px] truncate">
                    {villeFilter}
                  </span>

                  <X
                    className="
                      w-3
                      h-3

                      transition-transform
                      duration-300

                      group-hover/tag:rotate-90
                    "
                  />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          ANIMATIONS CSS
      ====================================================== */}

      <style>
        {`
          @keyframes premiumGradient {
            0% {
              background-position: 0% 50%;
            }

            50% {
              background-position: 100% 50%;
            }

            100% {
              background-position: 0% 50%;
            }
          }

          @keyframes sparkle {
            0%,
            100% {
              opacity: 0.45;
              transform: scale(1) rotate(0deg);
            }

            50% {
              opacity: 1;
              transform: scale(1.18) rotate(12deg);
            }
          }

          @keyframes filterBadgeIn {
            from {
              opacity: 0;
              transform: translateY(-6px) scale(0.92);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes countPop {
            0% {
              opacity: 0;
              transform: scale(0.5);
            }

            70% {
              transform: scale(1.15);
            }

            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes checkPop {
            0% {
              opacity: 0;
              transform: scale(0.5) rotate(-15deg);
            }

            70% {
              transform: scale(1.12) rotate(3deg);
            }

            100% {
              opacity: 1;
              transform: scale(1) rotate(0deg);
            }
          }

          @keyframes resetIn {
            from {
              opacity: 0;
              transform: translateX(-8px) scale(0.96);
            }

            to {
              opacity: 1;
              transform: translateX(0) scale(1);
            }
          }

          @keyframes summaryIn {
            from {
              opacity: 0;
              transform: translateY(-5px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /*
           * Accessibilité :
           * On réduit les animations si l'utilisateur
           * préfère réduire les mouvements.
           */

          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ClientFilterBar;