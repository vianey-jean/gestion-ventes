/**
 * =============================================================================
 * TendancesHero - Section héroïque de la page Tendances
 * =============================================================================
 * 
 * Affiche le titre animé, le badge premium et la description.
 * Composant purement visuel, aucune logique métier.
 * 
 * @module TendancesHero
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const TendancesHero: React.FC = () => {
  return (
    <div className="text-center mb-12">
      {/* Badge premium avec icône animée */}
      <div className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-400/40 dark:from-emerald-700/50 dark:via-emerald-600/50 dark:to-emerald-500/30 backdrop-blur-xl rounded-full text-emerald-800 dark:text-emerald-200 text-sm font-semibold mb-6 border border-emerald-300 dark:border-emerald-700 shadow-lg">
        <TrendingUp className="h-5 w-5 mr-2 animate-pulse text-emerald-600 dark:text-emerald-300" />
        Analyse des tendances en temps réel
      </div>

      {/* Titre animé et luxueux */}
      <motion.h1
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="text-5xl md:text-6xl font-extrabold 
                   bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 
                   bg-[length:200%_200%] animate-gradient bg-clip-text text-transparent 
                   mb-6 text-center text-3d drop-shadow-xl"
      >
        Tendances & Analytics
      </motion.h1>

      {/* Description */}
      <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto 
                    bg-gradient-to-r from-gray-100/50 via-white/30 to-gray-100/50 dark:from-gray-800/30 dark:via-gray-700/30 dark:to-gray-800/30 
                    backdrop-blur-sm rounded-xl px-6 py-4 shadow-inner">
        Découvrez vos performances, identifiez les opportunités et optimisez vos ventes
      </p>
    </div>
  );
};

export default TendancesHero;
