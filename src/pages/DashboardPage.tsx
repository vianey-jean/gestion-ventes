/**
 * =============================================================================
 * DashboardPage - Page principale du tableau de bord
 * =============================================================================
 * 
 * Page container qui orchestre les sous-composants du dashboard :
 * - DashboardHero : titre animé et description
 * - DashboardTabNavigation : onglets de navigation
 * - DashboardTabContent : contenu de chaque onglet
 * 
 * Design moderne et luxueux avec icônes premium.
 * 
 * @module DashboardPage
 */

import React, { useState } from 'react';
import { Tabs } from '@/components/ui/tabs';
import Layout from '@/components/Layout';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';

// Sous-composants décomposés
import { DashboardHero, DashboardTabNavigation, DashboardTabContent } from './dashboard';

const DashboardPage = () => {
  /** Onglet actif du dashboard */
  const [activeTab, setActiveTab] = useState('ventes');
  /** Détection mobile */
  const isMobile = useIsMobile();

  return (
    <Layout requireAuth>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/80 to-purple-50/60 dark:from-gray-900 dark:via-purple-900/20 dark:to-slate-900">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          
          {/* Section héroïque */}
          <DashboardHero />

          {/* Système d'onglets */}
          <Tabs defaultValue="ventes" onValueChange={setActiveTab} className="space-y-4 sm:space-y-6 md:space-y-8">
            
            {/* Navigation des onglets */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className={cn(
                "relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl p-3 sm:p-4 md:p-6 border border-white/30 dark:border-gray-700/30",
                "before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-r before:from-purple-500/5 before:via-pink-500/5 before:to-indigo-500/5 before:pointer-events-none",
                isMobile && "pt-4 pb-6 sm:pt-6 sm:pb-8 md:pt-8 md:pb-12"
              )}
            >
              {/* Décoration gradient premium */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-pink-600/5 to-indigo-600/5 rounded-3xl pointer-events-none"></div>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-full"></div>
              
              <DashboardTabNavigation activeTab={activeTab} isMobile={isMobile} />
            </motion.div>
            
            {/* Zone de contenu */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/30 overflow-hidden"
            >
              {/* Éléments décoratifs */}
              <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-gradient-to-bl from-purple-400/10 via-pink-400/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-gradient-to-tr from-blue-400/10 via-cyan-400/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-yellow-400/5 to-amber-400/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="relative p-3 sm:p-4 md:p-6 lg:p-8">
                <DashboardTabContent />
              </div>
            </motion.div>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
