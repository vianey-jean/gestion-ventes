/**
 * =============================================================================
 * DashboardPage - Ultra Luxury Premium SaaS
 * =============================================================================
 *
 * UI :
 * - Ultra Glassmorphism
 * - Aurora animated background
 * - Premium micro-interactions
 * - Animated active navigation
 * - Smooth section transitions
 * - Luxury glow / shine effects
 * - Desktop + Mobile optimized
 *
 * ⚠️ Aucune logique métier modifiée
 * ⚠️ Même structure fonctionnelle
 * ⚠️ Couleurs de fond conservées
 */

import React, {
  useState,
  Suspense,
  lazy,
  useEffect,
  useMemo,
} from 'react';

import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

import {
  motion,
  AnimatePresence,
} from 'framer-motion';

import { Badge } from '@/components/ui/badge';
import PremiumLoading from '@/components/ui/premium-loading';

import {
  ShoppingCart,
  Package,
  CalendarDays,
  TrendingUp,
  Users,
  Box,
  Clock,
  Crown,
  Sparkles,
  Diamond,
  ChevronLeft,
  ChevronRight,
  Gem,
  Star,
  Menu,
  X,
  Zap,
} from 'lucide-react';

import tacheApi from '@/services/api/tacheApi';

// =============================================================================
// LAZY LOAD
// =============================================================================

const VentesContent = lazy(
  () => import('@/pages/VentesEmbedded')
);

const CommandesPage = lazy(
  () => import('@/pages/CommandesPage')
);

const RdvPage = lazy(
  () => import('@/pages/RdvPage')
);

const ComptabiliteFinancesContent = lazy(
  () => import('@/components/dashboard/AdvancedDashboard')
);

const ClientsPage = lazy(
  () => import('@/pages/ClientsPage')
);

const ProduitsPage = lazy(
  () => import('@/pages/ProduitsPage')
);

const PointagePage = lazy(
  () => import('@/pages/PointagePage')
);

// =============================================================================
// TYPES
// =============================================================================

interface SidebarItem {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
  shadow: string;
  hoverBg: string;
  activeText: string;
}

// =============================================================================
// SIDEBAR CONFIGURATION
// =============================================================================

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    id: 'ventes',
    label: 'Ventes & Produits',
    shortLabel: 'Ventes',
    icon: ShoppingCart,
    gradient:
      'from-violet-500 via-purple-500 to-fuchsia-500',
    iconBg:
      'bg-gradient-to-br from-violet-500 to-purple-600',
    shadow:
      'shadow-violet-500/30',
    hoverBg:
      'hover:bg-violet-500/10',
    activeText:
      'text-violet-600 dark:text-violet-400',
  },

  {
    id: 'commandes',
    label: 'Commandes',
    shortLabel: 'Commandes',
    icon: Package,
    gradient:
      'from-emerald-500 via-teal-500 to-cyan-500',
    iconBg:
      'bg-gradient-to-br from-emerald-500 to-teal-600',
    shadow:
      'shadow-emerald-500/30',
    hoverBg:
      'hover:bg-emerald-500/10',
    activeText:
      'text-emerald-600 dark:text-emerald-400',
  },

  {
    id: 'rdv',
    label: 'Rendez-vous',
    shortLabel: 'RDV',
    icon: CalendarDays,
    gradient:
      'from-orange-500 via-amber-500 to-yellow-500',
    iconBg:
      'bg-gradient-to-br from-orange-500 to-amber-600',
    shadow:
      'shadow-orange-500/30',
    hoverBg:
      'hover:bg-orange-500/10',
    activeText:
      'text-orange-600 dark:text-orange-400',
  },

  {
    id: 'comptabilite',
    label: 'Comptabilité & Finances',
    shortLabel: 'Compta',
    icon: TrendingUp,
    gradient:
      'from-cyan-500 via-sky-500 to-blue-600',
    iconBg:
      'bg-gradient-to-br from-cyan-500 to-blue-600',
    shadow:
      'shadow-cyan-500/30',
    hoverBg:
      'hover:bg-cyan-500/10',
    activeText:
      'text-cyan-600 dark:text-cyan-400',
  },

  {
    id: 'clients',
    label: 'Clients',
    shortLabel: 'Clients',
    icon: Users,
    gradient:
      'from-pink-500 via-rose-500 to-red-500',
    iconBg:
      'bg-gradient-to-br from-pink-500 to-rose-600',
    shadow:
      'shadow-pink-500/30',
    hoverBg:
      'hover:bg-pink-500/10',
    activeText:
      'text-pink-600 dark:text-pink-400',
  },

  {
    id: 'produits',
    label: 'Produits',
    shortLabel: 'Produits',
    icon: Box,
    gradient:
      'from-fuchsia-500 via-purple-500 to-indigo-500',
    iconBg:
      'bg-gradient-to-br from-fuchsia-500 to-purple-600',
    shadow:
      'shadow-fuchsia-500/30',
    hoverBg:
      'hover:bg-fuchsia-500/10',
    activeText:
      'text-fuchsia-600 dark:text-fuchsia-400',
  },

  {
    id: 'pointage',
    label: 'Pointage & Tâches',
    shortLabel: 'Pointage',
    icon: Clock,
    gradient:
      'from-indigo-500 via-blue-500 to-cyan-500',
    iconBg:
      'bg-gradient-to-br from-indigo-500 to-blue-600',
    shadow:
      'shadow-indigo-500/30',
    hoverBg:
      'hover:bg-indigo-500/10',
    activeText:
      'text-indigo-600 dark:text-indigo-400',
  },
];

// =============================================================================
// ANIMATION CONFIG
// =============================================================================

const sidebarContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.075,
      delayChildren: 0.2,
    },
  },
};

const sidebarItemVariants = {
  hidden: {
    opacity: 0,
    x: -25,
    scale: 0.96,
    filter: 'blur(5px)',
  },

  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: 'blur(0px)',

    transition: {
      type: 'spring' as const,
      stiffness: 380,
      damping: 28,
      mass: 0.7,
    },
  },
};

const contentVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.985,
    filter: 'blur(5px)',
  },

  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',

    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },

  exit: {
    opacity: 0,
    y: -15,
    scale: 0.99,
    filter: 'blur(4px)',

    transition: {
      duration: 0.25,
      ease: [0.4, 0, 1, 1] as const,
    },
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

const DashboardPage = () => {  // ===========================================================================
  // STATE
  // ===========================================================================

  const [activeSection, setActiveSection] =
    useState('ventes');

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [tacheCount, setTacheCount] =
    useState(0);

  const isMobile = useIsMobile();

  // ===========================================================================
  // ACTIVE ITEM
  // ===========================================================================

  const activeItem = useMemo(
    () =>
      SIDEBAR_ITEMS.find(
        (item) => item.id === activeSection
      ) || SIDEBAR_ITEMS[0],
    [activeSection]
  );

  // ===========================================================================
  // FETCH TACHES
  // ===========================================================================

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await tacheApi.getAll();

        const todayStr =
          new Date()
            .toISOString()
            .split('T')[0];

        setTacheCount(
          res.data.filter(
            (t: any) =>
              !t.completed &&
              t.date >= todayStr
          ).length
        );
      } catch {
        // Silent
      }
    };

    fetchCount();

    const interval = setInterval(
      fetchCount,
      30000
    );

    return () =>
      clearInterval(interval);
  }, []);

  // ===========================================================================
  // IDLE PREFETCH
  // ===========================================================================

  useEffect(() => {
    const prefetch = () => {
      import('@/pages/CommandesPage');
      import('@/pages/RdvPage');
      import('@/components/dashboard/AdvancedDashboard');
      import('@/pages/ClientsPage');
      import('@/pages/ProduitsPage');
      import('@/pages/PointagePage');
    };

    const w = window as any;

    if (
      typeof w.requestIdleCallback ===
      'function'
    ) {
      const id =
        w.requestIdleCallback(
          prefetch,
          {
            timeout: 3000,
          }
        );

      return () =>
        w.cancelIdleCallback?.(id);
    }

    const timeout =
      setTimeout(
        prefetch,
        1500
      );

    return () =>
      clearTimeout(timeout);
  }, []);

  // ===========================================================================
  // NAVIGATION DEPUIS CLIENT FIDELITE
  // ===========================================================================

  useEffect(() => {
    const onNav = () => {
      setActiveSection('ventes');
      setMobileMenuOpen(false);
    };

    window.addEventListener(
      'fidelite-sale-nav',
      onNav as EventListener
    );

    try {
      const raw =
        sessionStorage.getItem(
          'fideliteSaleNav'
        );

      if (raw) {
        const p = JSON.parse(raw);

        if (
          p &&
          Date.now() -
            (p.ts || 0) <
            30_000
        ) {
          setActiveSection(
            'ventes'
          );
        }
      }
    } catch {
      // Silent
    }

    return () =>
      window.removeEventListener(
        'fidelite-sale-nav',
        onNav as EventListener
      );
  }, []);

  // ===========================================================================
  // MAIN CONTENT OFFSET
  // ===========================================================================

  useEffect(() => {
    const mainContent =
      document.getElementById(
        'main-content'
      );

    if (
      !isMobile &&
      mainContent
    ) {
      const sidebarWidth =
        sidebarCollapsed
          ? 96
          : 320;

      mainContent.style.marginLeft =
        `${sidebarWidth}px`;

      return () => {
        mainContent.style.marginLeft =
          '0';
      };
    }
  }, [
    isMobile,
    sidebarCollapsed,
  ]);

  // ===========================================================================
  // SECTION CHANGE
  // ===========================================================================

  const handleSectionChange = (
    id: string
  ) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
  };

  // ===========================================================================
  // CONTENT FALLBACK
  // ===========================================================================

  const fallback = (
    <div className="flex min-h-[300px] items-center justify-center">
      <PremiumLoading
        text="Chargement..."
        size="lg"
        overlay={false}
        variant="default"
      />
    </div>
  );

  // ===========================================================================
  // RENDER CONTENT
  // ===========================================================================

  const renderContent = () => {
    switch (activeSection) {
      case 'ventes':
        return (
          <Suspense fallback={fallback}>
            <VentesContent />
          </Suspense>
        );

      case 'commandes':
        return (
          <Suspense fallback={fallback}>
            <CommandesPage
              embedded
            />
          </Suspense>
        );

      case 'rdv':
        return (
          <Suspense fallback={fallback}>
            <RdvPage
              embedded
            />
          </Suspense>
        );

      case 'comptabilite':
        return (
          <Suspense fallback={fallback}>
            <ComptabiliteFinancesContent />
          </Suspense>
        );

      case 'clients':
        return (
          <Suspense fallback={fallback}>
            <ClientsPage
              embedded
            />
          </Suspense>
        );

      case 'produits':
        return (
          <Suspense fallback={fallback}>
            <ProduitsPage
              embedded
            />
          </Suspense>
        );

      case 'pointage':
        return (
          <Suspense fallback={fallback}>
            <PointagePage
              embedded
            />
          </Suspense>
        );

      default:
        return (
          <Suspense fallback={fallback}>
            <VentesContent />
          </Suspense>
        );
    }
  };

  // ===========================================================================
  // SEO
  // ===========================================================================

  const seoTitles: Record<
    string,
    string
  > = {
    ventes: 'Ventes',
    commandes: 'Commandes',
    rdv: 'Rendez-vous',
    comptabilite:
      'Comptabilité & Finances',
    clients: 'Clients',
    produits: 'Produits',
    pointage: 'Pointage',
  };

  // ===========================================================================
  // JSX
  // ===========================================================================

  return (
    <Layout requireAuth>
     <SEOHead
  title={
    seoTitles[
      activeSection
    ] || 'Dashboard'
  }
  description={`Gestion des ${
    seoTitles[
      activeSection
    ]?.toLowerCase() ||
    'ventes'
  } - Tableau de bord`}
/>
      {/* =====================================================================
          PAGE BACKGROUND
      ====================================================================== */}

      <div
        className="
          relative
          min-h-screen
          overflow-hidden
          bg-gradient-to-br
          from-slate-50
          via-blue-50/30
          to-indigo-50/20
          dark:from-[#030014]
          dark:via-[#090018]
          dark:to-[#10002d]
        "
      >

        {/* ===================================================================
            ANIMATED AURORA
        ==================================================================== */}

        {!isMobile && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">

            {/* Violet Aurora */}
            <motion.div
              className="
                absolute
                -left-40
                -top-40
                h-[600px]
                w-[600px]
                rounded-full
                bg-violet-500/10
                blur-[110px]
              "
              animate={{
                x: [
                  0,
                  80,
                  20,
                  0,
                ],

                y: [
                  0,
                  40,
                  100,
                  0,
                ],

                scale: [
                  1,
                  1.15,
                  0.95,
                  1,
                ],

                opacity: [
                  0.3,
                  0.55,
                  0.3,
                  0.3,
                ],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Fuchsia Aurora */}
            <motion.div
              className="
                absolute
                -right-40
                top-[25%]
                h-[550px]
                w-[550px]
                rounded-full
                bg-fuchsia-500/10
                blur-[120px]
              "
              animate={{
                x: [
                  0,
                  -70,
                  -20,
                  0,
                ],

                y: [
                  0,
                  80,
                  -30,
                  0,
                ],

                scale: [
                  1,
                  0.9,
                  1.15,
                  1,
                ],

                opacity: [
                  0.25,
                  0.5,
                  0.3,
                  0.25,
                ],
              }}
              transition={{
                duration: 22,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Cyan Aurora */}
            <motion.div
              className="
                absolute
                bottom-[-180px]
                left-[30%]
                h-[500px]
                w-[500px]
                rounded-full
                bg-cyan-500/10
                blur-[120px]
              "
              animate={{
                x: [
                  -30,
                  80,
                  0,
                  -30,
                ],

                y: [
                  0,
                  -60,
                  20,
                  0,
                ],

                scale: [
                  1,
                  1.1,
                  0.9,
                  1,
                ],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Grid */}
            <div
              className="
                absolute
                inset-0
                opacity-[0.025]
                dark:opacity-[0.045]
                bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)]
                [background-size:28px_28px]
              "
            />

            {/* Vignette */}
            <div
              className="
                absolute
                inset-0
                bg-[radial-gradient(circle_at_center,transparent_0%,rgba(3,0,20,0.08)_65%,rgba(3,0,20,0.35)_100%)]
              "
            />
          </div>
        )}

        {/* ===================================================================
            MOBILE NAVIGATION
        ==================================================================== */}

        {isMobile && (
          <div className="sticky top-16 z-50 px-3 pt-3">

            <motion.div
              initial={{
                opacity: 0,
                y: -20,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                duration: 0.55,
                ease: [
                  0.22,
                  1,
                  0.36,
                  1,
                ],
              }}
              className="
                relative
                overflow-hidden
                rounded-[28px]
                border
                border-white/20
                bg-white/80
                shadow-[0_15px_70px_rgba(0,0,0,0.18)]
                backdrop-blur-2xl
                dark:bg-white/[0.045]
                dark:shadow-[0_15px_70px_rgba(0,0,0,0.45)]
              "
            >

              {/* Shine */}
              <motion.div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.18)_50%,transparent_80%)]
                "
                animate={{
                  x: [
                    '-120%',
                    '120%',
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatDelay: 4,
                  ease: 'easeInOut',
                }}
              />

              <div className="relative flex items-center gap-2 p-3">

                {/* Mobile Menu Button */}

                <motion.button
                  whileTap={{
                    scale: 0.94,
                  }}
                  whileHover={{
                    scale: 1.03,
                  }}
                  onClick={() =>
                    setMobileMenuOpen(
                      !mobileMenuOpen
                    )
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-2xl
                    border
                    border-white/20
                    bg-white/70
                    px-4
                    py-2.5
                    shadow-lg
                    backdrop-blur-xl
                    dark:bg-white/[0.06]
                  "
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5 text-violet-500" />
                  ) : (
                    <Menu className="h-5 w-5 text-violet-500" />
                  )}

                  <span className="text-sm font-black text-violet-600 dark:text-violet-400">
                    {activeItem.shortLabel}
                  </span>
                </motion.button>

                {/* Mobile Icons */}

                <div className="flex-1 overflow-x-auto scrollbar-none">
                  <div className="flex gap-2">

                    {SIDEBAR_ITEMS.map(
                      (
                        item,
                        index
                      ) => {
                        const Icon =
                          item.icon;

                        const isActive =
                          activeSection ===
                          item.id;

                        return (
                          <motion.button
                            key={item.id}
                            initial={{
                              opacity: 0,
                              scale: 0.8,
                            }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                            }}
                            transition={{
                              delay:
                                index *
                                0.05,
                            }}
                            whileHover={{
                              scale: 1.08,
                            }}
                            whileTap={{
                              scale: 0.92,
                            }}
                            onClick={() =>
                              handleSectionChange(
                                item.id
                              )
                            }
                            className={cn(
                              `
                                relative
                                flex-shrink-0
                                rounded-2xl
                                p-2.5
                                transition-all
                                duration-300
                              `,
                              isActive
                                ? `${item.iconBg} shadow-2xl ${item.shadow}`
                                : `
                                    border
                                    border-white/10
                                    bg-white/40
                                    dark:bg-white/[0.05]
                                  `
                            )}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="mobileActiveGlow"
                                className="
                                  absolute
                                  -inset-1
                                  rounded-2xl
                                  bg-white/20
                                  blur-md
                                "
                              />
                            )}

                            <Icon
                              className={cn(
                                'relative h-4 w-4',
                                isActive
                                  ? 'text-white'
                                  : 'text-muted-foreground'
                              )}
                            />

                            {item.id ===
                              'pointage' &&
                              tacheCount >
                                0 && (
                                <span
                                  className="
                                    absolute
                                    -right-1
                                    -top-1
                                    flex
                                    h-4
                                    min-w-[16px]
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-red-500
                                    px-1
                                    text-[10px]
                                    font-bold
                                    text-white
                                    shadow-lg
                                  "
                                >
                                  {tacheCount}
                                </span>
                              )}
                          </motion.button>
                        );
                      }
                    )}

                  </div>
                </div>
              </div>
            </motion.div>

            {/* Mobile spacing */}

            <div className="h-5 mt-5" />

            {/* Mobile Dropdown */}

            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -12,
                    scale: 0.96,
                    filter: 'blur(6px)',
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: 'blur(0px)',
                  }}
                  exit={{
                    opacity: 0,
                    y: -10,
                    scale: 0.97,
                    filter: 'blur(4px)',
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                  className="
                    mt-3
                    overflow-hidden
                    rounded-[28px]
                    border
                    border-white/20
                    bg-white/75
                    shadow-[0_25px_90px_rgba(0,0,0,0.25)]
                    backdrop-blur-2xl
                    dark:bg-white/[0.045]
                  "
                >
                  <div className="grid grid-cols-2 gap-2 p-3">

                    {SIDEBAR_ITEMS.map(
                      (
                        item,
                        index
                      ) => {
                        const Icon =
                          item.icon;

                        const isActive =
                          activeSection ===
                          item.id;

                        return (
                          <motion.button
                            key={item.id}
                            initial={{
                              opacity: 0,
                              y: 10,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            transition={{
                              delay:
                                index *
                                0.045,
                            }}
                            whileHover={{
                              scale: 1.025,
                            }}
                            whileTap={{
                              scale: 0.97,
                            }}
                            onClick={() =>
                              handleSectionChange(
                                item.id
                              )
                            }
                            className={cn(
                              `
                                relative
                                flex
                                items-center
                                gap-3
                                overflow-hidden
                                rounded-2xl
                                px-3
                                py-3
                              `,
                              isActive
                                ? `bg-gradient-to-r ${item.gradient} text-white shadow-2xl`
                                : `
                                    border
                                    border-white/10
                                    bg-white/40
                                    dark:bg-white/[0.03]
                                  `
                            )}
                          >
                            <div
                              className={cn(
                                `
                                  flex
                                  h-9
                                  w-9
                                  items-center
                                  justify-center
                                  rounded-xl
                                `,
                                isActive
                                  ? 'bg-white/20'
                                  : item.iconBg
                              )}
                            >
                              <Icon className="h-4 w-4 text-white" />
                            </div>

                            <span className="text-xs font-bold">
                              {item.shortLabel}
                            </span>

                            {item.id ===
                              'pointage' &&
                              tacheCount >
                                0 && (
                                <Badge className="ml-auto border-0 bg-red-500 text-[10px] text-white shadow-lg">
                                  {tacheCount}
                                </Badge>
                              )}
                          </motion.button>
                        );
                      }
                    )}

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ===================================================================
            DESKTOP MAIN
        ==================================================================== */}

        <div
          className={cn(
            'relative flex',
            isMobile &&
              'pt-2'
          )}
        >

          {/* =================================================================
              SIDEBAR
          ================================================================== */}

          {!isMobile && (
            <motion.aside
              initial={{
                x: -80,
                opacity: 0,
                filter: 'blur(8px)',
              }}
              animate={{
                x: 0,
                opacity: 1,
                filter: 'blur(0px)',
              }}
              transition={{
                duration: 0.8,
                ease: [
                  0.22,
                  1,
                  0.36,
                  1,
                ],
              }}
              className={cn(
                `
                  fixed
                  left-0
                  top-16
                  z-40
                  h-[calc(100vh-4rem)]
                  transition-all
                  duration-500
                `,
                sidebarCollapsed
                  ? 'w-24'
                  : 'w-80'
              )}
            >
              <div className="h-full p-4">

                <div
                  className="
                    relative
                    flex
                    h-full
                    flex-col
                    overflow-hidden
                    rounded-[34px]
                    border
                    border-white/15
                    bg-white/60
                    shadow-[0_20px_80px_rgba(0,0,0,0.22)]
                    backdrop-blur-2xl
                    dark:bg-white/[0.045]
                    dark:shadow-[0_20px_80px_rgba(0,0,0,0.45)]
                  "
                >

                  {/* Glass light */}

                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-[linear-gradient(120deg,rgba(255,255,255,0.16),transparent_35%,transparent_65%,rgba(255,255,255,0.07))]
                    "
                  />

                  {/* =================================================================
                      HEADER
                  ================================================================== */}

                  <div className="relative overflow-hidden border-b border-white/10 p-5">

                    {/* Header shine */}

                    <motion.div
                      className="
                        pointer-events-none
                        absolute
                        inset-0
                        bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.10)_50%,transparent_80%)]
                      "
                      animate={{
                        x: [
                          '-120%',
                          '120%',
                        ],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        repeatDelay: 5,
                        ease: 'easeInOut',
                      }}
                    />

                    <div className="relative flex items-center justify-between">

                      {!sidebarCollapsed && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            x: -15,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          transition={{
                            delay: 0.35,
                          }}
                          className="flex items-center gap-3"
                        >

                          {/* Crown */}

                          <div className="relative">

                            <motion.div
                              className="
                                relative
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-2xl
                                bg-gradient-to-br
                                from-violet-500
                                via-purple-500
                                to-fuchsia-500
                              "
                              animate={{
                                boxShadow: [
                                  '0 10px 35px rgba(139,92,246,0.25)',
                                  '0 15px 55px rgba(217,70,239,0.45)',
                                  '0 10px 35px rgba(139,92,246,0.25)',
                                ],
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                            >

                              <motion.div
                                animate={{
                                  rotate: [
                                    0,
                                    5,
                                    -5,
                                    0,
                                  ],
                                }}
                                transition={{
                                  duration: 4,
                                  repeat: Infinity,
                                  ease: 'easeInOut',
                                }}
                              >
                                <Crown className="h-5 w-5 text-white" />
                              </motion.div>

                              <div
                                className="
                                  absolute
                                  inset-0
                                  rounded-2xl
                                  bg-gradient-to-tr
                                  from-transparent
                                  via-white/30
                                  to-transparent
                                "
                              />
                            </motion.div>
                          </div>

                          <div>
                            <h1
                              className="
                                bg-gradient-to-r
                                from-violet-500
                                via-fuchsia-500
                                to-cyan-500
                                bg-clip-text
                                text-xl
                                font-black
                                text-transparent
                              "
                            >
                              Dashboard
                            </h1>

                            <div className="mt-1 flex items-center gap-1">

                              <Sparkles
                                className="
                                  h-3
                                  w-3
                                  animate-pulse
                                  text-amber-400
                                "
                              />

                              <span
                                className="
                                  text-[11px]
                                  font-semibold
                                  uppercase
                                  tracking-wider
                                  text-muted-foreground
                                "
                              >
                                Ultra Luxury Suite
                              </span>

                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Collapse button */}

                      <motion.button
                        whileHover={{
                          scale: 1.08,
                          rotate: sidebarCollapsed
                            ? 0
                            : 0,
                        }}
                        whileTap={{
                          scale: 0.92,
                        }}
                        onClick={() =>
                          setSidebarCollapsed(
                            !sidebarCollapsed
                          )
                        }
                        className="
                          group
                          relative
                          overflow-hidden
                          rounded-2xl
                          border
                          border-white/15
                          bg-white/40
                          p-3
                          shadow-lg
                          backdrop-blur-xl
                          transition-all
                          duration-300
                          hover:bg-violet-500/10
                        "
                      >
                        <div
                          className="
                            absolute
                            inset-0
                            bg-gradient-to-r
                            from-violet-500/0
                            via-violet-500/15
                            to-violet-500/0
                            opacity-0
                            transition-opacity
                            duration-300
                            group-hover:opacity-100
                          "
                        />

                        {sidebarCollapsed ? (
                          <ChevronRight className="relative h-4 w-4 text-violet-500" />
                        ) : (
                          <ChevronLeft className="relative h-4 w-4 text-violet-500" />
                        )}
                      </motion.button>

                    </div>
                  </div>

                  {/* Premium line */}

                  <motion.div
                    className="
                      h-[2px]
                      bg-gradient-to-r
                      from-violet-500
                      via-fuchsia-500
                      via-cyan-500
                      to-blue-500
                    "
                    animate={{
                      backgroundPosition: [
                        '0% 50%',
                        '100% 50%',
                        '0% 50%',
                      ],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />

                  {/* =================================================================
                      NAVIGATION
                  ================================================================== */}

                  <motion.nav
                    variants={
                      sidebarContainerVariants
                    }
                    initial="hidden"
                    animate="visible"
                    className="
                      relative
                      flex-1
                      space-y-2
                      overflow-y-auto
                      p-4
                      scrollbar-none
                    "
                  >

                    {SIDEBAR_ITEMS.map(
                      (item) => {
                        const Icon =
                          item.icon;

                        const isActive =
                          activeSection ===
                          item.id;

                        return (
                          <div
                            key={item.id}
                            className="relative"
                          >

                            <motion.button
                              variants={
                                sidebarItemVariants
                              }
                              whileHover={{
                                scale: 1.025,
                                x:
                                  sidebarCollapsed
                                    ? 0
                                    : 5,
                              }}
                              whileTap={{
                                scale: 0.97,
                              }}
                              onClick={() =>
                                handleSectionChange(
                                  item.id
                                )
                              }
                              className={cn(
                                `
                                  group
                                  relative
                                  flex
                                  w-full
                                  items-center
                                  gap-4
                                  overflow-hidden
                                  rounded-3xl
                                  transition-all
                                  duration-500
                                  will-change-transform
                                `,
                                sidebarCollapsed
                                  ? 'justify-center p-3'
                                  : 'px-4 py-4',

                                isActive
                                  ? `
                                      bg-gradient-to-r
                                      ${item.gradient}
                                      text-white
                                      shadow-2xl
                                      ${item.shadow}
                                    `
                                  : `
                                      border
                                      border-white/10
                                      bg-white/25
                                      backdrop-blur-xl
                                      hover:border-white/20
                                      hover:bg-white/50
                                      hover:shadow-[0_15px_45px_rgba(139,92,246,0.12)]
                                      dark:bg-white/[0.025]
                                      dark:hover:bg-white/[0.07]
                                    `
                              )}
                            >

                              {/* Active glow */}

                              {isActive && (
                                <>
                                  <motion.div
                                    layoutId="activeGlow"
                                    className="
                                      absolute
                                      -inset-[2px]
                                      rounded-3xl
                                      bg-white/30
                                      opacity-50
                                      blur-xl
                                    "
                                    transition={{
                                      type: 'spring',
                                      stiffness: 300,
                                      damping: 30,
                                    }}
                                  />

                                  <motion.div
                                    className="
                                      absolute
                                      inset-0
                                      bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.35)_50%,transparent_80%)]
                                    "
                                    animate={{
                                      x: [
                                        '-120%',
                                        '120%',
                                      ],
                                    }}
                                    transition={{
                                      duration: 2.2,
                                      repeat: Infinity,
                                      repeatDelay: 2.5,
                                      ease: 'easeInOut',
                                    }}
                                  />
                                </>
                              )}

                              {/* Icon */}

                              <motion.div
                                className={cn(
                                  `
                                    relative
                                    flex-shrink-0
                                    overflow-hidden
                                    rounded-2xl
                                    shadow-xl
                                  `,
                                  sidebarCollapsed
                                    ? 'h-12 w-12'
                                    : 'h-11 w-11',

                                  isActive
                                    ? 'bg-white/20'
                                    : item.iconBg
                                )}
                                whileHover={{
                                  scale: 1.08,
                                }}
                              >

                                <div
                                  className="
                                    absolute
                                    inset-0
                                    bg-gradient-to-br
                                    from-white/25
                                    to-transparent
                                  "
                                />

                                <motion.div
                                  className="
                                    relative
                                    flex
                                    h-full
                                    w-full
                                    items-center
                                    justify-center
                                  "
                                  animate={
                                    isActive
                                      ? {
                                          scale: [
                                            1,
                                            1.08,
                                            1,
                                          ],
                                        }
                                      : {}
                                  }
                                  transition={{
                                    duration: 2,
                                    repeat:
                                      isActive
                                        ? Infinity
                                        : 0,
                                  }}
                                >
                                  <Icon className="h-5 w-5 text-white" />
                                </motion.div>
                              </motion.div>

                              {/* Text */}

                              {!sidebarCollapsed && (
                                <div className="flex-1 text-left">

                                  <span
                                    className={cn(
                                      `
                                        block
                                        text-sm
                                        font-black
                                        tracking-wide
                                      `,
                                      isActive
                                        ? 'text-white'
                                        : 'text-foreground'
                                    )}
                                  >
                                    {item.label}
                                  </span>

                                  <span
                                    className={cn(
                                      `
                                        mt-0.5
                                        block
                                        text-[10px]
                                        uppercase
                                        tracking-[0.2em]
                                      `,
                                      isActive
                                        ? 'text-white/70'
                                        : 'text-muted-foreground'
                                    )}
                                  >
                                    module
                                  </span>

                                </div>
                              )}

                              {/* Active diamond */}

                              {isActive &&
                                !sidebarCollapsed && (
                                  <motion.div
                                    initial={{
                                      opacity: 0,
                                      scale: 0,
                                      rotate: -45,
                                    }}
                                    animate={{
                                      opacity: 1,
                                      scale: 1,
                                      rotate: 0,
                                    }}
                                  >
                                    <Diamond className="h-4 w-4 text-white/80" />
                                  </motion.div>
                                )}

                            </motion.button>

                            {/* Task badge */}

                            {item.id ===
                              'pointage' &&
                              tacheCount >
                                0 && (
                                <motion.div
                                  initial={{
                                    scale: 0,
                                  }}
                                  animate={{
                                    scale: 1,
                                  }}
                                  className="
                                    absolute
                                    -right-1
                                    -top-1
                                    z-20
                                  "
                                >
                                  <Badge
                                    className="
                                      border-2
                                      border-white
                                      bg-red-500
                                      px-2
                                      py-0
                                      text-[10px]
                                      font-bold
                                      text-white
                                      shadow-2xl
                                      animate-pulse
                                    "
                                  >
                                    {tacheCount}
                                  </Badge>
                                </motion.div>
                              )}

                          </div>
                        );
                      }
                    )}

                  </motion.nav>
                                    {/* =================================================================
                      PREMIUM FOOTER
                  ================================================================== */}

                  {!sidebarCollapsed && (
                    <div className="relative border-t border-white/10 p-5">

                      <motion.div
                        whileHover={{
                          y: -3,
                          scale: 1.01,
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 20,
                        }}
                        className="
                          relative
                          overflow-hidden
                          rounded-3xl
                          border
                          border-violet-500/10
                          bg-gradient-to-br
                          from-violet-500/10
                          via-fuchsia-500/5
                          to-cyan-500/10
                          p-4
                          shadow-[0_15px_50px_rgba(139,92,246,0.08)]
                        "
                      >

                        {/* Animated aura */}

                        <motion.div
                          className="
                            pointer-events-none
                            absolute
                            -inset-20
                            bg-gradient-to-r
                            from-transparent
                            via-white/10
                            to-transparent
                            blur-2xl
                          "
                          animate={{
                            rotate: [
                              0,
                              360,
                            ],
                          }}
                          transition={{
                            duration: 18,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                        />

                        <div className="relative">

                          <div className="flex items-center gap-3">

                            {/* Gem */}

                            <div className="relative">

                              <motion.div
                                className="
                                  relative
                                  flex
                                  h-11
                                  w-11
                                  items-center
                                  justify-center
                                  rounded-2xl
                                  bg-gradient-to-br
                                  from-fuchsia-500
                                  to-violet-600
                                "
                                animate={{
                                  boxShadow: [
                                    '0 5px 20px rgba(217,70,239,0.2)',
                                    '0 8px 35px rgba(139,92,246,0.4)',
                                    '0 5px 20px rgba(217,70,239,0.2)',
                                  ],
                                }}
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                  ease: 'easeInOut',
                                }}
                              >
                                <Gem className="h-5 w-5 text-white" />

                                <div
                                  className="
                                    absolute
                                    inset-0
                                    rounded-2xl
                                    bg-gradient-to-tr
                                    from-transparent
                                    via-white/30
                                    to-transparent
                                  "
                                />
                              </motion.div>

                            </div>

                            <div className="flex flex-col">

                              <span className="text-xs font-black tracking-wide text-foreground">
                                Ultra Premium
                              </span>

                              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                Enterprise Edition
                              </span>

                            </div>

                            <div className="ml-auto">

                              <motion.div
                                animate={{
                                  rotate: [
                                    0,
                                    10,
                                    -10,
                                    0,
                                  ],
                                  scale: [
                                    1,
                                    1.15,
                                    1,
                                  ],
                                }}
                                transition={{
                                  duration: 2.5,
                                  repeat: Infinity,
                                }}
                              >
                                <Zap className="h-4 w-4 text-amber-400" />
                              </motion.div>

                            </div>

                          </div>

                          {/* Separator */}

                          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                          {/* Copyright */}

                          <div className="mt-4 flex items-center justify-between">

                            <div>

                              <p className="text-[11px] font-bold text-blue-500">
                                Créé par Jean Rabemanalina
                              </p>

                              <p className="text-[10px] text-muted-foreground">
                                © 2026 Luxury Dashboard
                              </p>

                            </div>

                            <motion.div
                              animate={{
                                rotate: [
                                  0,
                                  10,
                                  -10,
                                  0,
                                ],
                                scale: [
                                  1,
                                  1.15,
                                  1,
                                ],
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                              }}
                            >
                              <Star className="h-4 w-4 text-amber-400" />
                            </motion.div>

                          </div>

                        </div>
                      </motion.div>

                    </div>
                  )}

                </div>
              </div>
            </motion.aside>
          )}

          {/* =====================================================================
              MAIN CONTENT
          ====================================================================== */}

          <main
            id="main-content"
            className={cn(
              'relative min-w-0 flex-1',
              isMobile
                ? 'px-2 pb-6'
                : ''
            )}
          >

            {/* Mobile separator */}

            {isMobile && (
              <motion.div
                initial={{
                  scaleX: 0,
                  opacity: 0,
                }}
                animate={{
                  scaleX: 1,
                  opacity: 1,
                }}
                transition={{
                  duration: 0.6,
                }}
                className="
                  mb-4
                  h-px
                  w-full
                  origin-center
                  bg-gradient-to-r
                  from-transparent
                  via-violet-300/40
                  to-transparent
                  dark:via-violet-500/20
                "
              />
            )}

            <div className="relative z-10">

              {/* =================================================================
                  CONTENT GLOW
              ================================================================== */}

              {!isMobile && (
                <motion.div
                  key={`glow-${activeSection}`}
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 1,
                  }}
                  className="
                    pointer-events-none
                    absolute
                    left-1/2
                    top-20
                    h-[400px]
                    w-[600px]
                    -translate-x-1/2
                    rounded-full
                    bg-violet-500/[0.035]
                    blur-[100px]
                  "
                />
              )}

              {/* =================================================================
                  SECTION CONTENT
              ================================================================== */}

              <AnimatePresence mode="wait">

                <motion.div
                  key={activeSection}
                  variants={
                    contentVariants
                  }
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={cn(
                    `
                      relative
                      will-change-transform
                    `,
                    isMobile &&
                      `
                        overflow-hidden
                        rounded-[28px]
                        border
                        border-white/10
                        bg-white/20
                        shadow-[0_15px_50px_rgba(0,0,0,0.06)]
                        backdrop-blur-xl
                        dark:bg-white/[0.02]
                      `
                  )}
                >

                  {renderContent()}

                </motion.div>

              </AnimatePresence>

            </div>
          </main>
        </div>

        {/* =====================================================================
            GLOBAL FLOATING LIGHTS
        ====================================================================== */}

        {!isMobile && (
          <>
            <motion.div
              className="
                pointer-events-none
                fixed
                left-[25%]
                top-[15%]
                h-2
                w-2
                rounded-full
                bg-violet-400/40
                blur-[2px]
              "
              animate={{
                y: [
                  0,
                  -40,
                  0,
                ],
                opacity: [
                  0.2,
                  0.8,
                  0.2,
                ],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
            />

            <motion.div
              className="
                pointer-events-none
                fixed
                right-[25%]
                top-[35%]
                h-1.5
                w-1.5
                rounded-full
                bg-cyan-400/40
                blur-[2px]
              "
              animate={{
                y: [
                  0,
                  35,
                  0,
                ],
                opacity: [
                  0.15,
                  0.7,
                  0.15,
                ],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: 1,
              }}
            />

            <motion.div
              className="
                pointer-events-none
                fixed
                bottom-[20%]
                left-[45%]
                h-1.5
                w-1.5
                rounded-full
                bg-fuchsia-400/40
                blur-[2px]
              "
              animate={{
                y: [
                  0,
                  -30,
                  0,
                ],
                x: [
                  0,
                  20,
                  0,
                ],
                opacity: [
                  0.1,
                  0.6,
                  0.1,
                ],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                delay: 2,
              }}
            />
          </>
        )}

      </div>
    </Layout>
  );
};

export default DashboardPage;