/**
 * =============================================================================
 * DashboardTabNavigation - Navigation par onglets du dashboard
 * =============================================================================
 *
 * Version responsive améliorée SANS changer le style visuel.
 * - Responsive mobile / tablette / desktop
 * - Scroll horizontal sur très petits écrans
 * - Taille des icônes et textes adaptative
 * - Grid flexible
 * - Overflow géré proprement
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
    gradient: 'from-purple-600 via-pink-600 to-purple-700',
    hoverGradient:
      'from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30',
    activeClass:
      'data-[state=active]:shadow-purple-500/30 shadow-purple-500/40',
    iconBg: 'from-purple-500/20 to-pink-500/20',
  },

  {
    value: 'pret-familles',
    label: 'Prêt Familles',
    shortLabel: 'Prêt',
    icon: Users,
    badgeIcon: Crown,
    gradient: 'from-blue-600 via-cyan-600 to-blue-700',
    hoverGradient:
      'from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30',
    activeClass:
      'data-[state=active]:shadow-blue-500/30 shadow-blue-500/40',
    iconBg: 'from-blue-500/20 to-cyan-500/20',
  },

  {
    value: 'pret-produits',
    label: 'Prêt Produits',
    shortLabel: 'Prêt',
    icon: Package,
    badgeIcon: Gem,
    gradient: 'from-indigo-600 via-violet-600 to-indigo-700',
    hoverGradient:
      'from-indigo-50 to-violet-50 dark:from-indigo-900/30 dark:to-violet-900/30',
    activeClass:
      'data-[state=active]:shadow-indigo-500/30 shadow-indigo-500/40',
    iconBg: 'from-indigo-500/20 to-violet-500/20',
  },

  {
    value: 'depenses',
    label: 'Dépenses du Mois',
    shortLabel: 'Dépenses',
    icon: CreditCard,
    badgeIcon: Zap,
    gradient: 'from-rose-600 via-pink-600 to-rose-700',
    hoverGradient:
      'from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30',
    activeClass:
      'data-[state=active]:shadow-rose-500/30 shadow-rose-500/40',
    iconBg: 'from-rose-500/20 to-pink-500/20',
  },

  {
    value: 'inventaire',
    label: 'Inventaire',
    shortLabel: 'Inventaire',
    icon: Archive,
    badgeIcon: Diamond,
    gradient: 'from-emerald-600 via-teal-600 to-emerald-700',
    hoverGradient:
      'from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30',
    activeClass:
      'data-[state=active]:shadow-emerald-500/30 shadow-emerald-500/40',
    iconBg: 'from-emerald-500/20 to-teal-500/20',
  },

  {
    value: 'calcul-benefice',
    label: 'Calcul Bénéfice',
    shortLabel: 'Calcul',
    icon: Calculator,
    badgeIcon: Award,
    gradient: 'from-amber-600 via-yellow-600 to-amber-700',
    hoverGradient:
      'from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30',
    activeClass:
      'data-[state=active]:shadow-amber-500/30 shadow-amber-500/40',
    iconBg: 'from-amber-500/20 to-yellow-500/20',
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
    <div className="w-full overflow-hidden">
      {/* Scroll horizontal sécurisé sur petits écrans */}
      <div className="overflow-x-auto scrollbar-hide">
        <TabsList
          className={cn(
            // Container
            'relative w-full min-w-[640px] lg:min-w-0',

            // Grid responsive
            'grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6',

            // Spacing responsive
            'gap-2 sm:gap-3',

            // Padding responsive
            'p-2 sm:p-3',

            // Style original conservé
            'bg-gradient-to-br from-white/60 to-gray-50/60',
            'dark:from-gray-900/60 dark:to-gray-800/60',
            'backdrop-blur-xl',

            // Radius responsive
            'rounded-xl sm:rounded-2xl',

            // Border
            'border border-white/40 dark:border-gray-700/40',

            // Shadow
            'shadow-inner',

            // Height
            'h-auto'
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
                  // Base
                  'group relative overflow-hidden',

                  // Layout responsive
                  'flex flex-col sm:flex-row',
                  'items-center justify-center',

                  // Gap responsive
                  'gap-1 sm:gap-2 md:gap-3',

                  // Taille responsive
                  'min-h-[88px] sm:min-h-[90px] md:min-h-[96px]',

                  // Padding responsive
                  'px-2 sm:px-3 md:px-5',
                  'py-3 sm:py-4',

                  // Radius
                  'rounded-xl sm:rounded-2xl',

                  // Texte
                  'font-bold uppercase',
                  'text-[10px] xs:text-xs sm:text-sm',

                  // Animation
                  'transition-all duration-300 ease-out',

                  // Hover
                  `hover:bg-gradient-to-r hover:${tab.hoverGradient}`,
                  'hover:scale-[1.02]',

                  // Active
                  `data-[state=active]:bg-gradient-to-r data-[state=active]:${tab.gradient}`,
                  'data-[state=active]:text-white',
                  'data-[state=active]:shadow-2xl',
                  'data-[state=active]:scale-[1.03]',

                  // Shadow color
                  tab.activeClass,

                  // Couleurs texte
                  isActive
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-300'
                )}
              >
                {/* ================================
                    ICON
                ================================= */}
                <div
                  className={cn(
                    'relative shrink-0',

                    // Taille responsive
                    'p-1.5 sm:p-2',

                    // Radius
                    'rounded-lg sm:rounded-xl',

                    // Shadow
                    'shadow-lg',

                    // Background
                    `bg-gradient-to-br ${tab.iconBg}`,

                    // Active state
                    'group-data-[state=active]:bg-white/20'
                  )}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />

                  <BadgeIcon
                    className={cn(
                      'absolute',
                      '-top-1 -right-1',

                      // Responsive size
                      'h-2.5 w-2.5 sm:h-3 sm:w-3',

                      // Style
                      'text-yellow-400',

                      // Animation
                      'opacity-0 group-hover:opacity-100',
                      'transition-opacity duration-300'
                    )}
                  />
                </div>

                {/* ================================
                    LABEL
                ================================= */}
                <div
                  className={cn(
                    'flex flex-col items-center sm:items-start',
                    'justify-center',
                    'leading-tight',
                    'text-center sm:text-left',
                    'max-w-full'
                  )}
                >
                  {/* Mobile */}
                  <span className="sm:hidden truncate">
                    {tab.shortLabel}
                  </span>

                  {/* Desktop */}
                  <span className="hidden sm:block">
                    {tab.label}
                  </span>
                </div>

                {/* Glow effect */}
                <div
                  className={cn(
                    'absolute inset-0 rounded-xl sm:rounded-2xl',
                    'opacity-0 group-hover:opacity-100',
                    'transition-opacity duration-500',
                    'bg-white/5 pointer-events-none'
                  )}
                />
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>
    </div>
  );
};

export default DashboardTabNavigation;