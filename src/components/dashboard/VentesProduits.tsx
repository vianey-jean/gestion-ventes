import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedSalesData, useOptimizedProductData } from '@/services/dataOptimizationService';
import { useAccessibility } from '@/components/accessibility/AccessibilityProvider';
import { ShoppingCart, Sparkles, Diamond, ChevronDown, ChevronUp, BarChart3, EyeOff, ArrowLeft, Zap } from 'lucide-react';
import PremiumLoading from '../ui/premium-loading';
import SalesOverviewSection from './sections/SalesOverviewSection';
import SalesManagementSection from './sections/SalesManagementSection';
import { saleApiService } from '@/services/api';
import type { Sale } from '@/types/sale';

const OVERVIEW_STORAGE_KEY = 'ventesProduits:showOverview';

/**
 * Composant principal pour la gestion des ventes et produits
 * Affiche uniquement la gestion des ventes (sans le tableau de bord avancé)
 */
const VentesProduits: React.FC = React.memo(() => {
  const { 
    sales, 
    products, 
    isLoading: appLoading,
    currentMonth,
    currentYear
  } = useApp();
  
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { announceToScreenReader } = useAccessibility();

  const optimizedSalesData = useOptimizedSalesData(sales);
  const optimizedProductData = useOptimizedProductData(products);

  const [showOverview, setShowOverview] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(OVERVIEW_STORAGE_KEY);
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    try {
      localStorage.setItem(OVERVIEW_STORAGE_KEY, String(showOverview));
    } catch {}
  }, [showOverview]);

  const toggleOverview = () => {
    setShowOverview(v => {
      const next = !v;
      announceToScreenReader(next ? 'Vue d\'ensemble affichée' : 'Vue d\'ensemble masquée');
      return next;
    });
  };

  // ================= NAVIGATION DEPUIS ClientFideliteModal =================
  // On lit sessionStorage 'fideliteSaleNav' pour surcharger l'affichage.
  const [fideliteNav, setFideliteNav] = useState<{
    saleId: string;
    month: number;
    year: number;
    clientName?: string;
  } | null>(null);
  const [overrideSales, setOverrideSales] = useState<Sale[] | null>(null);
  const [loadingOverride, setLoadingOverride] = useState(false);

  const readNav = useCallback(() => {
    try {
      const raw = sessionStorage.getItem('fideliteSaleNav');
      if (!raw) return null;
      const p = JSON.parse(raw);
      if (
        p &&
        typeof p.saleId === 'string' &&
        typeof p.month === 'number' &&
        typeof p.year === 'number'
      ) {
        return p;
      }
    } catch {}
    return null;
  }, []);

  useEffect(() => {
    const nav = readNav();
    if (nav) setFideliteNav(nav);

    const onNav = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) setFideliteNav(detail);
      else {
        const n = readNav();
        if (n) setFideliteNav(n);
      }
    };
    window.addEventListener('fidelite-sale-nav', onNav as EventListener);
    return () => window.removeEventListener('fidelite-sale-nav', onNav as EventListener);
  }, [readNav]);

  useEffect(() => {
    let alive = true;
    if (!fideliteNav) {
      setOverrideSales(null);
      return;
    }
    // Si le mois demandé = mois en cours, on utilise directement les ventes du contexte
    if (fideliteNav.month === currentMonth && fideliteNav.year === currentYear) {
      setOverrideSales(null);
      return;
    }
    setLoadingOverride(true);
    saleApiService
      .getByMonth(fideliteNav.month, fideliteNav.year)
      .then((data) => {
        if (alive) setOverrideSales(data || []);
      })
      .catch(() => {
        if (alive) setOverrideSales([]);
      })
      .finally(() => {
        if (alive) setLoadingOverride(false);
      });
    return () => {
      alive = false;
    };
  }, [fideliteNav, currentMonth, currentYear]);

  const handleReturnToCurrent = useCallback(() => {
    try {
      sessionStorage.removeItem('fideliteSaleNav');
    } catch {}
    setFideliteNav(null);
    setOverrideSales(null);
  }, []);

  const effectiveSales = overrideSales ?? sales;

  if (!isAuthenticated) {
    return (
      <PremiumLoading
        text="Authentification requise"
        variant="ventes"
        size="lg"
      />
    );
  }

  if (appLoading || authLoading) {
    return (
      <PremiumLoading 
        text="Chargement des Ventes et Produits ...."
        size="md"
        variant="ventes"
        showText={true}
      />
    );
  }

  return (
    <div 
      className="space-y-4 sm:space-y-6 md:space-y-8 p-3 sm:p-4 md:p-6 bg-gradient-to-br from-gray-50 via-purple-50/30 to-white dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 min-h-screen"
      role="main"
      aria-label="Gestion des ventes et produits"
    >
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4 sm:mb-6 md:mb-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-xl shadow-emerald-500/30">
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Gestion des Ventes
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                Mois en cours: {currentMonth}/{currentYear}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {fideliteNav && (
              <>
                <style>{`
                  @keyframes rizikyReturnBtn {
                    0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.85), 0 0 30px rgba(16,185,129,.75); transform: scale(1); }
                    50%     { box-shadow: 0 0 0 14px rgba(16,185,129,0), 0 0 10px rgba(16,185,129,.25); transform: scale(1.04); }
                  }
                  @keyframes rizikyReturnGlow {
                    0%,100% { background-position: 0% 50%; }
                    50%     { background-position: 100% 50%; }
                  }
                  .riziky-return-btn {
                    animation: rizikyReturnBtn 1.15s ease-in-out infinite, rizikyReturnGlow 3s ease infinite;
                    background-size: 200% 200%;
                  }
                `}</style>
                <motion.button
                  type="button"
                  onClick={handleReturnToCurrent}
                  initial={{ opacity: 0, scale: 0.85, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  title={`Retour aux ventes du mois en cours (${currentMonth}/${currentYear})`}
                  aria-label="Revenir à la vente du mois en cours"
                  className="riziky-return-btn inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-white text-xs sm:text-sm bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 border-2 border-emerald-300/70 shadow-2xl"
                >
                  <ArrowLeft className="h-4 w-4 animate-pulse" />
                  <span className="hidden xs:inline sm:inline">Revenir à la vente du mois en cours</span>
                  <span className="inline xs:hidden sm:hidden">Retour mois</span>
                  <Zap className="h-4 w-4 text-yellow-200 animate-pulse" />
                </motion.button>
              </>
            )}
            <Diamond className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
              Premium
            </span>
          </div>
        </div>
      </motion.header>

      {/* Sales content directly without tabs */}
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        {/* Toggle bar for SalesOverviewSection */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center justify-between gap-3 rounded-xl sm:rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm"
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/30">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">
              Vue d'ensemble des ventes
            </span>
          </div>
          <button
            type="button"
            onClick={toggleOverview}
            aria-expanded={showOverview}
            aria-controls="sales-overview-panel"
            aria-label={showOverview ? "Masquer la vue d'ensemble" : "Afficher la vue d'ensemble"}
            className="group relative inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95"
          >
            <span className="hidden xs:inline sm:inline">
              {showOverview ? 'Masquer' : 'Afficher'}
            </span>
            <motion.span
              animate={{ rotate: showOverview ? 0 : 180 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="inline-flex"
            >
              {showOverview ? (
                <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </motion.span>
          </button>
        </motion.div>

        <AnimatePresence initial={false}>
          {showOverview && (
            <motion.div
              key="sales-overview-panel"
              id="sales-overview-panel"
              initial={{ opacity: 0, height: 0, y: -12 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <SalesOverviewSection
                sales={sales}
                productData={optimizedProductData as any}
                currentMonth={currentMonth}
                currentYear={currentYear}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <SalesManagementSection 
          sales={effectiveSales}
          products={products}
          currentMonth={currentMonth}
          currentYear={currentYear}
          showActions={showOverview}
          overrideMonth={fideliteNav ? fideliteNav.month : undefined}
          overrideYear={fideliteNav ? fideliteNav.year : undefined}
          highlightSaleId={fideliteNav ? fideliteNav.saleId : undefined}
          onReturnToCurrent={handleReturnToCurrent}
        />

      </div>
    </div>
  );
});

VentesProduits.displayName = 'VentesProduits';

export default VentesProduits;
