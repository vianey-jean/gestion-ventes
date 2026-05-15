/**
 * =============================================================================
 * DashboardPage - Page principale unifiée avec barre latérale
 * =============================================================================
 *
 * Refonte UI Ultra Luxe / Glassmorphism Premium / Modern SaaS
 * ⚠️ Aucune logique métier modifiée
 * ⚠️ Même structure fonctionnelle
 * ⚠️ Couleurs de fond conservées
 *
 * @module DashboardPage
 */

import React, { useState, Suspense, lazy } from 'react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
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

// ======================= LAZY LOAD =======================

const VentesContent = lazy(() => import('@/pages/VentesEmbedded'));
const CommandesPage = lazy(() => import('@/pages/CommandesPage'));
const RdvPage = lazy(() => import('@/pages/RdvPage'));
const ComptabiliteFinancesContent = lazy(
  () => import('@/components/dashboard/AdvancedDashboard')
);
const ClientsPage = lazy(() => import('@/pages/ClientsPage'));
const ProduitsPage = lazy(() => import('@/pages/ProduitsPage'));
const PointagePage = lazy(() => import('@/pages/PointagePage'));

// ======================= TYPES =======================

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

// ======================= SIDEBAR CONFIG =======================

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    id: 'ventes',
    label: 'Ventes & Produits',
    shortLabel: 'Ventes',
    icon: ShoppingCart,
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    shadow: 'shadow-violet-500/30',
    hoverBg: 'hover:bg-violet-500/10',
    activeText: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'commandes',
    label: 'Commandes',
    shortLabel: 'Commandes',
    icon: Package,
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/30',
    hoverBg: 'hover:bg-emerald-500/10',
    activeText: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'rdv',
    label: 'Rendez-vous',
    shortLabel: 'RDV',
    icon: CalendarDays,
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    iconBg: 'bg-gradient-to-br from-orange-500 to-amber-600',
    shadow: 'shadow-orange-500/30',
    hoverBg: 'hover:bg-orange-500/10',
    activeText: 'text-orange-600 dark:text-orange-400',
  },
  {
    id: 'comptabilite',
    label: 'Comptabilité & Finances',
    shortLabel: 'Compta',
    icon: TrendingUp,
    gradient: 'from-cyan-500 via-sky-500 to-blue-600',
    iconBg: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    shadow: 'shadow-cyan-500/30',
    hoverBg: 'hover:bg-cyan-500/10',
    activeText: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    id: 'clients',
    label: 'Clients',
    shortLabel: 'Clients',
    icon: Users,
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    iconBg: 'bg-gradient-to-br from-pink-500 to-rose-600',
    shadow: 'shadow-pink-500/30',
    hoverBg: 'hover:bg-pink-500/10',
    activeText: 'text-pink-600 dark:text-pink-400',
  },
  {
    id: 'produits',
    label: 'Produits',
    shortLabel: 'Produits',
    icon: Box,
    gradient: 'from-fuchsia-500 via-purple-500 to-indigo-500',
    iconBg: 'bg-gradient-to-br from-fuchsia-500 to-purple-600',
    shadow: 'shadow-fuchsia-500/30',
    hoverBg: 'hover:bg-fuchsia-500/10',
    activeText: 'text-fuchsia-600 dark:text-fuchsia-400',
  },
  {
    id: 'pointage',
    label: 'Pointage & Tâches',
    shortLabel: 'Pointage',
    icon: Clock,
    gradient: 'from-indigo-500 via-blue-500 to-cyan-500',
    iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-600',
    shadow: 'shadow-indigo-500/30',
    hoverBg: 'hover:bg-indigo-500/10',
    activeText: 'text-indigo-600 dark:text-indigo-400',
  },
];

// ======================= COMPONENT =======================

const DashboardPage = () => {
  const [activeSection, setActiveSection] = useState('ventes');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isMobile = useIsMobile();

  const [tacheCount, setTacheCount] = useState(0);

  // ======================= FETCH TACHES =======================

  React.useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await tacheApi.getAll();

        const todayStr = new Date().toISOString().split('T')[0];

        setTacheCount(
          res.data.filter(
            (t: any) => !t.completed && t.date >= todayStr
          ).length
        );
      } catch {
        /* silent */
      }
    };

    fetchCount();

    const interval = setInterval(fetchCount, 30000);

    return () => clearInterval(interval);
  }, []);

  // ======================= MAIN CONTENT OFFSET =======================

  React.useEffect(() => {
    const mainContent = document.getElementById('main-content');

    if (!isMobile && mainContent) {
      const sidebarWidth = sidebarCollapsed ? 96 : 320;

      mainContent.style.marginLeft = `${sidebarWidth}px`;

      return () => {
        mainContent.style.marginLeft = '0';
      };
    }
  }, [isMobile, sidebarCollapsed]);

  const activeItem = SIDEBAR_ITEMS.find(
    (i) => i.id === activeSection
  )!;

  // ======================= SECTION CHANGE =======================

  const handleSectionChange = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
  };

  // ======================= RENDER CONTENT =======================

  const renderContent = () => {
    const fallback = (
      <PremiumLoading
        text="Chargement..."
        size="lg"
        overlay={false}
        variant="default"
      />
    );

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
            <CommandesPage embedded />
          </Suspense>
        );

      case 'rdv':
        return (
          <Suspense fallback={fallback}>
            <RdvPage embedded />
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
            <ClientsPage embedded />
          </Suspense>
        );

      case 'produits':
        return (
          <Suspense fallback={fallback}>
            <ProduitsPage embedded />
          </Suspense>
        );

      case 'pointage':
        return (
          <Suspense fallback={fallback}>
            <PointagePage embedded />
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

  // ======================= SEO =======================

  const seoTitles: Record<string, string> = {
    ventes: 'Ventes',
    commandes: 'Commandes',
    rdv: 'Rendez-vous',
    comptabilite: 'Comptabilité & Finances',
    clients: 'Clients',
    produits: 'Produits',
    pointage: 'Pointage',
  };

  // ======================= JSX =======================

  return (
    <Layout requireAuth>
      <SEOHead
        title={seoTitles[activeSection] || 'Dashboard'}
        description={`Gestion des ${
          seoTitles[activeSection]?.toLowerCase() || 'ventes'
        } - Tableau de bord`}
      />

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-[#030014] dark:via-[#090018] dark:to-[#10002d]">

        {/* ======================= BACKGROUND FX ======================= */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">

          <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[140px]" />

          <div className="absolute top-1/2 -right-40 h-[450px] w-[450px] rounded-full bg-fuchsia-500/10 blur-[140px]" />

          <div className="absolute bottom-0 left-1/3 h-[350px] w-[350px] rounded-full bg-cyan-500/10 blur-[120px]" />

          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        {/* ======================= MOBILE BAR ======================= */}

        {isMobile && (
          <div className="sticky top-16 z-50 px-3 pt-3">

            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/60 dark:bg-white/[0.04] backdrop-blur* shadow-[0_10px_60px_rgba(0,0,0,0.25)]"
            >

              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent pointer-events-none" />

              <div className="relative flex items-center gap-2 p-3">

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/40 dark:bg-white/5 px-4 py-2.5 shadow-lg backdrop-blur*"
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5 text-violet-500" />
                  ) : (
                    <Menu className="h-5 w-5 text-violet-500" />
                  )}

                  <span className="text-sm font-black text-violet-600 dark:text-violet-400">
                    {activeItem.shortLabel}
                  </span>
                </button>

                <div className="flex-1 overflow-x-auto scrollbar-none">
                  <div className="flex gap-2">
                    {SIDEBAR_ITEMS.map((item) => {
                      const Icon = item.icon;

                      const isActive =
                        activeSection === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() =>
                            handleSectionChange(item.id)
                          }
                          className={cn(
                            'relative flex-shrink-0 rounded-2xl p-2.5 transition-all duration-300',
                            isActive
                              ? `${item.iconBg} shadow-2xl ${item.shadow}`
                              : 'bg-white/40 dark:bg-white/[0.05] border border-white/10'
                          )}
                        >
                          <Icon
                            className={cn(
                              'h-4 w-4',
                              isActive
                                ? 'text-white'
                                : 'text-muted-foreground'
                            )}
                          />

                          {item.id === 'pointage' &&
                            tacheCount > 0 && (
                              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-lg animate-pulse">
                                {tacheCount}
                              </span>
                            )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ======================= IMPORTANT MOBILE SPACING ======================= */}
            {/* Ajout d'espace visible sous la navbar mobile */}
            <div className="h-5 mt-[30px]" />

            {/* ======================= MOBILE DROPDOWN ======================= */}

            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -10,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: -10,
                    scale: 0.98,
                  }}
                  className="mt-3 overflow-hidden rounded-3xl border border-white/20 bg-white/70 dark:bg-white/[0.04] backdrop-blur* shadow-[0_20px_80px_rgba(0,0,0,0.35)]"
                >
                  <div className="grid grid-cols-2 gap-2 p-3">
                    {SIDEBAR_ITEMS.map((item) => {
                      const Icon = item.icon;

                      const isActive =
                        activeSection === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() =>
                            handleSectionChange(item.id)
                          }
                          className={cn(
                            'relative flex items-center gap-3 overflow-hidden rounded-2xl px-3 py-3 transition-all duration-300',
                            isActive
                              ? `bg-gradient-to-r ${item.gradient} text-white shadow-2xl`
                              : 'border border-white/10 bg-white/40 dark:bg-white/[0.03]'
                          )}
                        >
                          <div
                            className={cn(
                              'flex h-9 w-9 items-center justify-center rounded-xl',
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

                          {item.id === 'pointage' &&
                            tacheCount > 0 && (
                              <Badge className="ml-auto border-0 bg-red-500 text-[10px] text-white animate-pulse">
                                {tacheCount}
                              </Badge>
                            )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ======================= DESKTOP LAYOUT ======================= */}

        <div
          className={cn(
            'relative flex',
            isMobile && 'pt-2'
          )}
        >

          {/* ======================= SIDEBAR ======================= */}

          {!isMobile && (
            <motion.aside
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className={cn(
                'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] transition-all duration-500',
                sidebarCollapsed ? 'w-24' : 'w-80'
              )}
            >
              <div className="h-full p-4">

                <div className="relative flex h-full flex-col overflow-hidden rounded-[32px] border border-white/15 bg-white/60 dark:bg-white/[0.045] backdrop-blur*-[30px] shadow-[0_20px_80px_rgba(0,0,0,0.35)]">

                  <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.15),transparent_40%,transparent_60%,rgba(255,255,255,0.08))]" />

                  {/* ======================= HEADER ======================= */}

                  <div className="relative border-b border-white/10 p-5">

                    <div className="flex items-center justify-between">

                      {!sidebarCollapsed && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-3"
                        >
                          <div className="relative">

                            <div className="absolute inset-0 rounded-2xl bg-violet-500 blur-xl opacity-60" />

                            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 shadow-2xl shadow-violet-500/40">
                              <Crown className="h-5 w-5 text-white" />
                            </div>
                          </div>

                          <div>
                            <h1 className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 bg-clip-text text-xl font-black text-transparent">
                              Dashboard
                            </h1>

                            <div className="mt-1 flex items-center gap-1">
                              <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />

                              <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                                Ultra Luxury Suite
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <button
                        onClick={() =>
                          setSidebarCollapsed(
                            !sidebarCollapsed
                          )
                        }
                        className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/40 dark:bg-white/[0.04] p-3 backdrop-blur* transition-all duration-300 hover:scale-105 hover:bg-violet-500/10"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/10 to-violet-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                        {sidebarCollapsed ? (
                          <ChevronRight className="relative h-4 w-4 text-violet-500" />
                        ) : (
                          <ChevronLeft className="relative h-4 w-4 text-violet-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* PREMIUM LINE */}
                  <div className="h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 via-cyan-500 to-blue-500" />

                  {/* ======================= NAVIGATION ======================= */}

                  <nav className="relative flex-1 space-y-2 overflow-y-auto p-4 scrollbar-none">

                    {SIDEBAR_ITEMS.map((item) => {
                      const Icon = item.icon;

                      const isActive =
                        activeSection === item.id;

                      return (
                        <div
                          key={item.id}
                          className="relative"
                        >
                          <motion.button
                            whileHover={{
                              scale: 1.02,
                            }}
                            whileTap={{
                              scale: 0.98,
                            }}
                            onClick={() =>
                              handleSectionChange(item.id)
                            }
                            className={cn(
                              'group relative flex w-full items-center gap-4 overflow-hidden rounded-3xl transition-all duration-500',
                              sidebarCollapsed
                                ? 'justify-center p-3'
                                : 'px-4 py-4',
                              isActive
                                ? `bg-gradient-to-r ${item.gradient} text-white shadow-2xl ${item.shadow}`
                                : 'border border-white/10 bg-white/30 dark:bg-white/[0.025] hover:border-violet-500/20 hover:bg-white/50 dark:hover:bg-white/[0.05]'
                            )}
                          >

                            {isActive && (
                              <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.25),transparent)] animate-pulse" />
                            )}

                            <div
                              className={cn(
                                'relative flex-shrink-0 overflow-hidden rounded-2xl transition-all duration-300',
                                sidebarCollapsed
                                  ? 'h-12 w-12'
                                  : 'h-11 w-11',
                                isActive
                                  ? 'bg-white/20 backdrop-blur*'
                                  : `${item.iconBg} shadow-xl`
                              )}
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />

                              <div className="relative flex h-full w-full items-center justify-center">
                                <Icon className="h-5 w-5 text-white" />
                              </div>
                            </div>

                            {!sidebarCollapsed && (
                              <div className="flex-1 text-left">
                                <span
                                  className={cn(
                                    'block text-sm font-black tracking-wide',
                                    isActive
                                      ? 'text-white'
                                      : 'text-foreground'
                                  )}
                                >
                                  {item.label}
                                </span>

                                <span
                                  className={cn(
                                    'mt-0.5 block text-[10px] uppercase tracking-[0.2em]',
                                    isActive
                                      ? 'text-white/70'
                                      : 'text-muted-foreground'
                                  )}
                                >
                                  module
                                </span>
                              </div>
                            )}

                            {isActive &&
                              !sidebarCollapsed && (
                                <div className="relative">
                                  <Diamond className="h-4 w-4 text-white/80" />
                                </div>
                              )}
                          </motion.button>

                          {item.id === 'pointage' &&
                            tacheCount > 0 && (
                              <div className="absolute -right-1 -top-1 z-20">
                                <Badge className="border-2 border-white bg-red-500 px-2 py-0 text-[10px] font-bold text-white shadow-2xl animate-pulse">
                                  {tacheCount}
                                </Badge>
                              </div>
                            )}
                        </div>
                      );
                    })}
                  </nav>

                  {/* ======================= FOOTER ======================= */}

                  {!sidebarCollapsed && (
                    <div className="relative border-t border-white/10 p-5">

                      <div className="overflow-hidden rounded-3xl border border-violet-500/10 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-cyan-500/10 p-4 backdrop-blur*">

                        <div className="flex items-center gap-3">

                          <div className="relative">

                            <div className="absolute inset-0 rounded-2xl bg-fuchsia-500 blur-lg opacity-60" />

                            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600">
                              <Gem className="h-5 w-5 text-white" />
                            </div>
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
                            <Zap className="h-4 w-4 text-amber-400 animate-pulse" />
                          </div>
                        </div>

                        <div className="mt-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                        <div className="mt-4 flex items-center justify-between">

                          <div>
                            <p className="text-[11px] font-bold text-blue-500">
                              Créé par Jean Rabemanalina
                            </p>

                            <p className="text-[10px] text-muted-foreground">
                              © 2026 Luxury Dashboard
                            </p>
                          </div>

                          <Star className="h-4 w-4 text-amber-400" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.aside>
          )}

          {/* ======================= MAIN CONTENT ======================= */}

          <main
            className={cn(
              'relative flex-1 min-w-0',
              // IMPORTANT MOBILE SPACING
              isMobile
                ? 'px-2 pb-6'
                : ''
            )}
          >

            {/* MOBILE CONTENT SEPARATOR */}
            {isMobile && (
              <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-violet-300/40 dark:via-violet-500/20 to-transparent" />
            )}

            <div className="relative z-10">

              <AnimatePresence mode="wait">

                <motion.div
                  key={activeSection}
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -15,
                  }}
                  transition={{
                    duration: 0.35,
                  }}
                  className={cn(
                    'relative',
                    // IMPORTANT MOBILE CARD EFFECT
                    isMobile &&
                      'rounded-[28px] border border-white/10 bg-white/20 dark:bg-white/[0.02] backdrop-blur* overflow-hidden'
                  )}
                >
                  {renderContent()}
                </motion.div>

              </AnimatePresence>

            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;