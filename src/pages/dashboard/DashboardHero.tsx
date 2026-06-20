/**
 * =============================================================================
 * DashboardHero - Section héroïque du tableau de bord
 * =============================================================================
 * 
 * Affiche le titre animé et la description du dashboard premium.
 * Composant purement visuel sans logique métier.
 * 
 * @module DashboardHero
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, Diamond, Gem, Star, Award, Zap } from 'lucide-react';

const DashboardHero: React.FC = () => {
  return (
    <div className="relative text-center mb-6 sm:mb-8 md:mb-12 overflow-hidden py-10 sm:py-14 md:py-16 rounded-3xl bg-gradient-to-br from-slate-950 via-purple-950/70 to-indigo-950 border border-white/10 shadow-[0_30px_80px_-20px_rgba(139,92,246,0.4)]">
      {/* Aurora mesh background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 left-1/4 w-[28rem] h-[28rem] bg-purple-500/25 blur-[110px] rounded-full"
          animate={{ y: [0, -30, 0], x: [0, 25, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -top-10 right-1/4 w-[26rem] h-[26rem] bg-pink-500/25 blur-[110px] rounded-full"
          animate={{ y: [0, 30, 0], x: [0, -25, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-indigo-500/15 blur-[120px] rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Animated grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      {/* Shimmer borders */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-400/50 to-transparent" />

      {/* Floating sparkle particles */}
      {[...Array(6)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/70 shadow-[0_0_10px_rgba(255,255,255,0.8)] pointer-events-none"
          style={{ top: `${15 + (i * 11) % 70}%`, left: `${8 + (i * 17) % 84}%` }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.4, 0.5] }}
          transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
        />
      ))}

      {/* Badge premium animé */}
      <motion.div 
        initial={{ opacity: 0, y: -20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ scale: 1.05, y: -2 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="relative z-10 inline-flex items-center px-5 sm:px-7 py-2.5 sm:py-3 bg-white/[0.07] backdrop-blur-2xl rounded-full text-purple-200 text-xs sm:text-sm font-bold mb-5 sm:mb-7 border border-white/[0.12] shadow-[0_10px_40px_rgba(139,92,246,0.35)] cursor-default"
      >
        <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <Crown className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]" />
        </motion.div>
        <span className="hidden xs:inline">Tableau de bord Premium en temps réel</span>
        <span className="xs:hidden">Dashboard Premium</span>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 ml-2 text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.7)]" />
        </motion.div>
      </motion.div>
      
      {/* Titre principal animé */}
      <motion.h1
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative z-10 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black 
                  bg-gradient-to-r from-purple-200 via-pink-200 to-indigo-200
                  bg-[length:200%_200%] animate-gradient 
                  bg-clip-text text-transparent mb-4 sm:mb-6 text-center px-2 tracking-tight
                  drop-shadow-[0_4px_30px_rgba(168,85,247,0.45)]"
      >
        <motion.span className="inline-block relative mr-2 sm:mr-3 align-middle" animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }} transition={{ duration: 5, repeat: Infinity }}>
          <span className="absolute inset-0 bg-purple-400/30 blur-2xl rounded-full" />
          <Diamond className="relative inline h-9 w-9 sm:h-12 sm:w-12 text-purple-300 drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]" />
        </motion.span>
        Tableau de Bord
        <motion.span className="inline-block relative ml-2 sm:ml-3 align-middle" animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.1, 1] }} transition={{ duration: 5, repeat: Infinity }}>
          <span className="absolute inset-0 bg-pink-400/30 blur-2xl rounded-full" />
          <Gem className="relative inline h-9 w-9 sm:h-12 sm:w-12 text-pink-300 drop-shadow-[0_0_20px_rgba(244,114,182,0.8)]" />
        </motion.span>
      </motion.h1>
      
      {/* Description */}
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative z-10 text-sm sm:text-base md:text-lg lg:text-xl text-purple-100/70 max-w-2xl mx-auto px-4 flex items-center justify-center gap-2 font-medium"
      >
        <motion.span animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }} transition={{ duration: 3, repeat: Infinity }}>
          <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.7)]" />
        </motion.span>
        Gérez efficacement vos ventes, inventaires et finances en un seul endroit
        <motion.span animate={{ scale: [1, 1.3, 1], rotate: [0, -180, -360] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }}>
          <Award className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.7)]" />
        </motion.span>
      </motion.p>

      {/* Bottom power line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
        className="relative z-10 mt-6 mx-auto h-px w-32 sm:w-48 bg-gradient-to-r from-transparent via-purple-400 to-transparent origin-center"
      />
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 mt-3 inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-purple-300/60 uppercase tracking-[0.3em]"
      >
        <Zap className="h-3 w-3 text-pink-300" />
        Live
        <Zap className="h-3 w-3 text-purple-300" />
      </motion.div>
    </div>
  );
};

export default DashboardHero;
