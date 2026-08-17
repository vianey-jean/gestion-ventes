/**
 * =============================================================================
 * DashboardTabNavigation - Navigation par onglets du dashboard
 * =============================================================================
 *
 * Version ultra moderne, responsive et animée
 *
 * Responsive :
 * - 📱 Mobile        : 1 colonne
 * - 📲 Tablette      : 2 colonnes
 * - 📲 Tablette large: 3 colonnes
 * - 🖥️ Desktop       : 6 colonnes
 *
 * Design :
 * - Glassmorphism
 * - Gradients premium
 * - Active state avec glow
 * - Animations hover / active
 * - Indicateurs visuels
 * - Dark mode
 * - Aucun scroll horizontal
 *
 * Logique :
 * - activeTab conservé
 * - value des tabs conservées
 * - Aucun changement de comportement
 *
 * @module DashboardTabNavigation
 */

import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import {
  ShoppingCart,
  Users,
  Package,
  CreditCard,
  Archive,
  Calculator,
  Sparkles,
  Crown,
  Gem,
  Zap,
  Diamond,
  Award,
  ChevronRight,
} from 'lucide-react';

/** ============================================================================
 * TYPES
 * ========================================================================== */

interface TabConfig {
  value: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badgeIcon: React.ElementType;
  gradient: string;
  hoverGradient: string;
  activeClass: string;
  iconBg: string;
}

/** ============================================================================
 * CONFIGURATION DES ONGLETS
 * ========================================================================== */

const TABS: TabConfig[] = [
  {
    value: 'ventes',
    label: 'Ventes Produits',
    shortLabel: 'Ventes',
    icon: ShoppingCart,
    badgeIcon: Sparkles,
    gradient:
      'from-purple-600 via-pink-600 to-purple-700',
    hoverGradient:
      'from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30',
    activeClass:
      'data-[state=active]:shadow-purple-500/30 shadow-purple-500/40',
    iconBg:
      'from-purple-500/20 to-pink-500/20',
  },

  {
    value: 'pret-familles',
    label: 'Prêt Familles',
    shortLabel: 'Prêt',
    icon: Users,
    badgeIcon: Crown,
    gradient:
      'from-blue-600 via-cyan-600 to-blue-700',
    hoverGradient:
      'from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30',
    activeClass:
      'data-[state=active]:shadow-blue-500/30 shadow-blue-500/40',
    iconBg:
      'from-blue-500/20 to-cyan-500/20',
  },

  {
    value: 'pret-produits',
    label: 'Prêt Produits',
    shortLabel: 'Prêt',
    icon: Package,
    badgeIcon: Gem,
    gradient:
      'from-indigo-600 via-violet-600 to-indigo-700',
    hoverGradient:
      'from-indigo-50 to-violet-50 dark:from-indigo-900/30 dark:to-violet-900/30',
    activeClass:
      'data-[state=active]:shadow-indigo-500/30 shadow-indigo-500/40',
    iconBg:
      'from-indigo-500/20 to-violet-500/20',
  },

  {
    value: 'depenses',
    label: 'Dépenses du Mois',
    shortLabel: 'Dépenses',
    icon: CreditCard,
    badgeIcon: Zap,
    gradient:
      'from-rose-600 via-pink-600 to-rose-700',
    hoverGradient:
      'from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30',
    activeClass:
      'data-[state=active]:shadow-rose-500/30 shadow-rose-500/40',
    iconBg:
      'from-rose-500/20 to-pink-500/20',
  },

  {
    value: 'inventaire',
    label: 'Inventaire',
    shortLabel: 'Inventaire',
    icon: Archive,
    badgeIcon: Diamond,
    gradient:
      'from-emerald-600 via-teal-600 to-emerald-700',
    hoverGradient:
      'from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30',
    activeClass:
      'data-[state=active]:shadow-emerald-500/30 shadow-emerald-500/40',
    iconBg:
      'from-emerald-500/20 to-teal-500/20',
  },

  {
    value: 'calcul-benefice',
    label: 'Calcul Bénéfice',
    shortLabel: 'Calcul',
    icon: Calculator,
    badgeIcon: Award,
    gradient:
      'from-amber-600 via-yellow-600 to-amber-700',
    hoverGradient:
      'from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30',
    activeClass:
      'data-[state=active]:shadow-amber-500/30 shadow-amber-500/40',
    iconBg:
      'from-amber-500/20 to-yellow-500/20',
  },
];

/** ============================================================================
 * PROPS
 * ========================================================================== */

interface DashboardTabNavigationProps {
  activeTab: string;
  isMobile?: boolean;
}

/** ============================================================================
 * COMPONENT
 * ========================================================================== */

const DashboardTabNavigation: React.FC<
  DashboardTabNavigationProps
> = ({ activeTab }) => {
  return (
    <div className="relative w-full">

      {/* =====================================================================
          OUTER CONTAINER
      ====================================================================== */}

      <div
        className="
          relative
          w-full
          overflow-hidden
          rounded-2xl
          border
          border-white/50
          bg-white/60
          p-2
          shadow-[0_20px_60px_-25px_rgba(88,28,135,0.25)]
          backdrop-blur-2xl

          sm:rounded-3xl
          sm:p-3

          dark:border-white/10
          dark:bg-gray-950/60
        "
      >

        {/* ===================================================================
            BACKGROUND GLOW
        ==================================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            -left-20
            -top-20
            h-48
            w-48
            rounded-full
            bg-purple-500/10
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-24
            -right-20
            h-56
            w-56
            rounded-full
            bg-indigo-500/10
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            h-32
            w-32
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-pink-500/5
            blur-3xl
          "
        />

        {/* ===================================================================
            TABS
        ==================================================================== */}

        <TabsList
          className={cn(

            // -----------------------------------------------------------------
            // Container
            // -----------------------------------------------------------------

            'relative',
            'z-10',
            'w-full',
            'h-auto',

            // -----------------------------------------------------------------
            // 📱 MOBILE
            // 1 colonne
            // -----------------------------------------------------------------

            'grid',
            'grid-cols-1',

            // -----------------------------------------------------------------
            // 📲 TABLETTE
            // 2 colonnes
            // -----------------------------------------------------------------

            'sm:grid-cols-2',

            // -----------------------------------------------------------------
            // 📲 TABLETTE LARGE
            // 3 colonnes
            // -----------------------------------------------------------------

            'md:grid-cols-3',

            // -----------------------------------------------------------------
            // 🖥️ DESKTOP
            // 6 colonnes
            // -----------------------------------------------------------------

            'lg:grid-cols-6',

            // -----------------------------------------------------------------
            // Espacement
            // -----------------------------------------------------------------

            'gap-2',
            'sm:gap-3',
            'lg:gap-3.5',

            // -----------------------------------------------------------------
            // Padding
            // -----------------------------------------------------------------

            'p-0',

            // -----------------------------------------------------------------
            // Background
            // -----------------------------------------------------------------

            'bg-transparent',

            // -----------------------------------------------------------------
            // Border
            // -----------------------------------------------------------------

            'border-0',

            // -----------------------------------------------------------------
            // Shadow
            // -----------------------------------------------------------------

            'shadow-none'
          )}
        >

          {TABS.map((tab) => {
            const Icon = tab.icon;
            const BadgeIcon = tab.badgeIcon;

            const isActive = activeTab === tab.value;

            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(

                  // ===========================================================
                  // BASE
                  // ===========================================================

                  'group',
                  'relative',
                  'isolate',
                  'w-full',
                  'overflow-hidden',

                  // ===========================================================
                  // DIMENSIONS
                  // ===========================================================

                  // Mobile
                  'min-h-[76px]',

                  // Tablette
                  'sm:min-h-[86px]',

                  // Tablette large
                  'md:min-h-[92px]',

                  // Desktop
                  'lg:min-h-[100px]',

                  // ===========================================================
                  // LAYOUT
                  // ===========================================================

                  'flex',
                  'flex-row',
                  'items-center',
                  'justify-start',

                  // ===========================================================
                  // GAP
                  // ===========================================================

                  'gap-3',
                  'sm:gap-3.5',
                  'lg:gap-3',

                  // ===========================================================
                  // PADDING
                  // ===========================================================

                  'px-3.5',
                  'py-3',

                  'sm:px-4',
                  'sm:py-3.5',

                  'md:px-4',

                  'lg:px-3',
                  'lg:py-4',

                  // ===========================================================
                  // RADIUS
                  // ===========================================================

                  'rounded-xl',
                  'sm:rounded-2xl',

                  // ===========================================================
                  // TYPOGRAPHY
                  // ===========================================================

                  'font-bold',
                  'uppercase',
                  'tracking-wide',

                  'text-xs',
                  'sm:text-sm',

                  // ===========================================================
                  // DEFAULT COLORS
                  // ===========================================================

                  'text-gray-600',
                  'dark:text-gray-300',

                  // ===========================================================
                  // DEFAULT BACKGROUND
                  // ===========================================================

                  'bg-white/50',
                  'dark:bg-gray-900/50',

                  // ===========================================================
                  // BORDER
                  // ===========================================================

                  'border',
                  'border-transparent',

                  // ===========================================================
                  // SHADOW
                  // ===========================================================

                  'shadow-sm',

                  // ===========================================================
                  // ANIMATION
                  // ===========================================================

                  'transform-gpu',
                  'transition-all',
                  'duration-300',
                  'ease-out',

                  // ===========================================================
                  // HOVER
                  // ===========================================================

                  'hover:-translate-y-0.5',
                  'hover:scale-[1.01]',
                  'hover:shadow-lg',
                  'hover:border-white/70',

                  // ===========================================================
                  // FOCUS
                  // ===========================================================

                  'focus-visible:outline-none',
                  'focus-visible:ring-2',
                  'focus-visible:ring-purple-500/40',
                  'focus-visible:ring-offset-1',

                  // ===========================================================
                  // HOVER GRADIENT
                  // ===========================================================

                  'hover:bg-gradient-to-r',
                  `hover:${tab.hoverGradient}`,

                  // ===========================================================
                  // ACTIVE GRADIENT
                  // ===========================================================

                  'data-[state=active]:bg-gradient-to-r',
                  `data-[state=active]:${tab.gradient}`,

                  // ===========================================================
                  // ACTIVE STATE
                  // ===========================================================

                  'data-[state=active]:text-white',
                  'data-[state=active]:border-white/20',
                  'data-[state=active]:shadow-2xl',
                  'data-[state=active]:scale-[1.015]',
                  'data-[state=active]:-translate-y-0.5',

                  // ===========================================================
                  // ACTIVE SHADOW
                  // ===========================================================

                  tab.activeClass
                )}
              >

                {/* ============================================================
                    BACKGROUND GLOW
                ============================================================= */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    -z-10
                    rounded-2xl
                    bg-white/10
                    opacity-0
                    blur-xl
                    transition-all
                    duration-500
                    group-hover:opacity-100
                    group-data-[state=active]:opacity-100
                  "
                />

                {/* ============================================================
                    SHINE EFFECT
                ============================================================= */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    -z-0
                    -translate-x-full
                    bg-gradient-to-r
                    from-transparent
                    via-white/20
                    to-transparent
                    transition-transform
                    duration-700
                    group-hover:translate-x-full
                  "
                />

                {/* ============================================================
                    ICON CONTAINER
                ============================================================= */}

                <div
                  className={cn(
                    'relative',
                    'z-10',
                    'shrink-0',

                    // ---------------------------------------------------------
                    // Dimensions
                    // ---------------------------------------------------------

                    'flex',
                    'h-10',
                    'w-10',
                    'items-center',
                    'justify-center',

                    'sm:h-11',
                    'sm:w-11',

                    'md:h-12',
                    'md:w-12',

                    'lg:h-12',
                    'lg:w-12',

                    // ---------------------------------------------------------
                    // Radius
                    // ---------------------------------------------------------

                    'rounded-xl',
                    'sm:rounded-2xl',

                    // ---------------------------------------------------------
                    // Gradient
                    // ---------------------------------------------------------

                    `bg-gradient-to-br ${tab.iconBg}`,

                    // ---------------------------------------------------------
                    // Border
                    // ---------------------------------------------------------

                    'border',
                    'border-white/30',
                    'dark:border-white/10',

                    // ---------------------------------------------------------
                    // Shadow
                    // ---------------------------------------------------------

                    'shadow-md',

                    // ---------------------------------------------------------
                    // Animation
                    // ---------------------------------------------------------

                    'transform-gpu',
                    'transition-all',
                    'duration-300',

                    'group-hover:scale-110',
                    'group-hover:rotate-2',

                    // ---------------------------------------------------------
                    // Active
                    // ---------------------------------------------------------

                    'group-data-[state=active]:bg-white/20',
                    'group-data-[state=active]:border-white/20',
                    'group-data-[state=active]:shadow-lg',
                    'group-data-[state=active]:scale-105'
                  )}
                >

                  {/* ---------------------------------------------------------
                      Icon glow
                  ---------------------------------------------------------- */}

                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      rounded-xl
                      bg-white/20
                      opacity-0
                      blur-md
                      transition-opacity
                      duration-300
                      group-hover:opacity-100
                    "
                  />

                  {/* ---------------------------------------------------------
                      Main icon
                  ---------------------------------------------------------- */}

                  <Icon
                    className="
                      relative
                      z-10
                      h-5
                      w-5

                      sm:h-5
                      sm:w-5

                      md:h-5
                      md:w-5

                      lg:h-6
                      lg:w-6

                      transition-all
                      duration-300

                      group-hover:scale-110
                    "
                  />

                  {/* ---------------------------------------------------------
                      Badge icon
                  ---------------------------------------------------------- */}

                  <div
                    className="
                      absolute
                      -right-1
                      -top-1
                      flex
                      h-4
                      w-4
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/50
                      bg-white
                      shadow-md
                      opacity-0
                      scale-75
                      transition-all
                      duration-300

                      group-hover:scale-100
                      group-hover:opacity-100

                      group-data-[state=active]:scale-100
                      group-data-[state=active]:opacity-100

                      dark:border-gray-700
                      dark:bg-gray-900
                    "
                  >
                    <BadgeIcon
                      className="
                        h-2.5
                        w-2.5
                        text-yellow-500
                        drop-shadow-sm
                      "
                    />
                  </div>
                </div>

                {/* ============================================================
                    LABEL CONTAINER
                ============================================================= */}

                <div
                  className="
                    relative
                    z-10
                    min-w-0
                    flex-1
                    text-left
                  "
                >

                  {/* ---------------------------------------------------------
                      Mobile label
                  ---------------------------------------------------------- */}

                  <span
                    className="
                      block
                      truncate
                      sm:hidden
                    "
                  >
                    {tab.shortLabel}
                  </span>

                  {/* ---------------------------------------------------------
                      Tablet / Desktop label
                  ---------------------------------------------------------- */}

                  <span
                    className="
                      hidden
                      truncate
                      sm:block
                    "
                  >
                    {tab.label}
                  </span>

                  {/* ---------------------------------------------------------
                      Active underline
                  ---------------------------------------------------------- */}

                  <div
                    className="
                      mt-1.5
                      h-0.5
                      w-0
                      rounded-full
                      bg-white
                      opacity-0
                      shadow-[0_0_10px_rgba(255,255,255,0.9)]
                      transition-all
                      duration-500

                      group-data-[state=active]:w-8
                      group-data-[state=active]:opacity-100
                    "
                  />
                </div>

                {/* ============================================================
                    ACTIVE DOT
                ============================================================= */}

                <div
                  className="
                    relative
                    z-10
                    h-2
                    w-2
                    shrink-0
                    rounded-full
                    bg-white
                    opacity-0
                    scale-0
                    shadow-[0_0_10px_rgba(255,255,255,0.9)]
                    transition-all
                    duration-300

                    group-data-[state=active]:scale-100
                    group-data-[state=active]:opacity-100
                  "
                />

                {/* ============================================================
                    CHEVRON
                ============================================================= */}

                <ChevronRight
                  className="
                    relative
                    z-10
                    hidden
                    h-4
                    w-4
                    shrink-0
                    -translate-x-1
                    opacity-0
                    transition-all
                    duration-300

                    sm:block

                    group-hover:translate-x-0
                    group-hover:opacity-50

                    group-data-[state=active]:opacity-80
                  "
                />

                {/* ============================================================
                    BOTTOM ACTIVE INDICATOR
                ============================================================= */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    bottom-0
                    left-1/2
                    h-1
                    w-0
                    -translate-x-1/2
                    rounded-full
                    bg-white
                    opacity-0
                    shadow-[0_0_15px_rgba(255,255,255,0.9)]
                    transition-all
                    duration-500

                    group-data-[state=active]:w-12
                    group-data-[state=active]:opacity-100
                  "
                />

              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      {/* =====================================================================
          MOBILE DECORATIVE INDICATOR
      ====================================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-1
          left-1/2
          h-1
          w-10
          -translate-x-1/2
          rounded-full
          bg-gray-300/70

          sm:hidden

          dark:bg-gray-700/70
        "
      />
    </div>
  );
};

export default DashboardTabNavigation;