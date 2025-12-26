/**
 * Composant Hero pour la page Commandes
 * Affiche le titre et les éléments décoratifs de la page
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, Diamond, Star } from 'lucide-react';

const CommandesHero: React.FC = () => {
  return (
    <div className="text-center mb-6 sm:mb-8 md:mb-12 relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-pink-300/20 dark:bg-pink-600/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 dark:from-purple-500/20 dark:via-pink-500/20 dark:to-indigo-500/20 backdrop-blur-xl rounded-full text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-bold mb-4 sm:mb-6 border-2 border-purple-300/50 dark:border-purple-600/50 shadow-2xl">
        <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
        <span className="hidden xs:inline">Gestion Premium</span>
        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500" />
      </div>
      
      <motion.h1
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black 
                  bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 
                  bg-[length:200%_200%] animate-gradient 
                  bg-clip-text text-transparent mb-4 sm:mb-6 text-center px-2
                  drop-shadow-2xl"
      >
        <span className="inline-flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
          <Diamond className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 text-purple-600" />
          <span>Commandes & Réservations</span>
          <Star className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 text-pink-600" />
        </span>
      </motion.h1>
      <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4 font-medium">
        Une expérience de gestion <span className="font-bold text-purple-600 dark:text-purple-400">ultra-premium</span> pour vos commandes d'élite
      </p>
    </div>
  );
};

export default CommandesHero;
