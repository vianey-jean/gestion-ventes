import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, Diamond, Star } from 'lucide-react';

const CommandesHero: React.FC = () => {
  return (
    <div className="text-center mb-6 sm:mb-8 md:mb-12 relative overflow-hidden">
      {/* Decorative floating elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div 
          className="absolute top-0 left-1/4 w-72 h-72 bg-purple-300/30 dark:bg-purple-600/20 rounded-full blur-3xl animate-float-slow"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1.1 }}
          transition={{ repeat: Infinity, duration: 12, repeatType: "reverse" }}
        />
        <motion.div 
          className="absolute top-0 right-1/4 w-72 h-72 bg-pink-300/30 dark:bg-pink-600/20 rounded-full blur-3xl animate-float-slow"
          initial={{ scale: 0.85 }}
          animate={{ scale: 1.15 }}
          transition={{ repeat: Infinity, duration: 14, repeatType: "reverse" }}
        />
        <motion.div 
          className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-300/20 dark:bg-indigo-600/10 rounded-full blur-4xl animate-float-slower"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 16, repeatType: "reverse" }}
        />
      </div>
      
      {/* Badge premium */}
      <div className="
        inline-flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-4
        bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-indigo-500/20 
        dark:from-purple-500/30 dark:via-pink-500/30 dark:to-indigo-500/30
        backdrop-blur-xl rounded-full
        text-purple-700 dark:text-purple-300
        text-xs sm:text-sm font-bold
        mb-5 sm:mb-6
        border-2 border-purple-300/50 dark:border-purple-600/50
        shadow-[0_20px_40px_rgba(139,92,246,0.4)]
        hover:shadow-[0_25px_50px_rgba(139,92,246,0.5)]
        transition-all duration-500
      ">
        <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 drop-shadow-lg animate-pulse" />
        <span className="hidden xs:inline">Gestion Premium</span>
        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-pink-500 animate-spin-slow" />
      </div>
      
      {/* Hero Title */}
      <motion.h1
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="
          text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black 
          bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600
          bg-[length:200%_200%] animate-gradient
          bg-clip-text text-transparent
          mb-4 sm:mb-6
          text-center px-2
          drop-shadow-[0_10px_20px_rgba(139,92,246,0.5)]
        "
      >
        <span className="inline-flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
          <Diamond className="h-7 w-7 sm:h-8 sm:w-8 md:h-12 md:w-12 text-purple-600 drop-shadow-lg animate-bounce-slow" />
          <span>Commandes & Réservations</span>
          <Star className="h-7 w-7 sm:h-8 sm:w-8 md:h-12 md:w-12 text-pink-600 drop-shadow-lg animate-bounce-slow delay-150" />
        </span>
      </motion.h1>
      
      {/* Subtitle */}
      <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4 font-medium">
        Une expérience de gestion <span className="font-bold text-purple-600 dark:text-purple-400 drop-shadow-md">ultra-premium</span> pour vos commandes d'élite
      </p>
    </div>
  );
};

export default CommandesHero;
