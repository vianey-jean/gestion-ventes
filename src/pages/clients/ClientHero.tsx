/**
 * =============================================================================
 * ClientHero - Section héroïque de la page Clients
 * =============================================================================
 * 
 * Affiche le header premium avec le compteur de clients et le bouton d'ajout.
 * 
 * @module ClientHero
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users, Crown, Star, Diamond, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface ClientHeroProps {
  /** Nombre total de clients */
  clientCount: number;
  /** Callback pour ouvrir le formulaire d'ajout */
  onAddClient: () => void;
}

const ClientHero: React.FC<ClientHeroProps> = ({ clientCount, onAddClient }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 dark:from-purple-800 dark:via-violet-800 dark:to-indigo-800">
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Particules flottantes décoratives */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-4 h-4 bg-yellow-300/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-6 h-6 bg-pink-300/30 rounded-full animate-bounce"></div>
        <div className="absolute bottom-32 left-40 w-5 h-5 bg-blue-300/30 rounded-full animate-pulse"></div>
        <div className="absolute top-60 left-1/2 w-3 h-3 bg-green-300/30 rounded-full animate-bounce"></div>
      </div>
      
      <div className="relative container mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-12 md:py-20">
        <div className="text-center">
          {/* Icônes et titre */}
          <div className="inline-flex flex-col xs:flex-row items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="relative">
              <Crown className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-yellow-300 animate-pulse" />
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                <Star className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
              </div>
            </div>
           
            <motion.h1
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="text-5xl md:text-6xl font-extrabold 
                        bg-gradient-to-r from-purple-600 via-red-600 to-indigo-600 
                        bg-[length:200%_200%] animate-gradient 
                        bg-clip-text text-transparent mb-6 text-center text-3d"
            >
               Listes Clients <span className="text-transparent bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 bg-clip-text animate-pulse">Élite</span>
            </motion.h1>

            <div className="relative">
              <Diamond className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-purple-200 animate-spin-slow" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl"></div>
            </div>
          </div>
          
          {/* Sous-titre */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-purple-100 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            Gérez vos clients VIP avec une sophistication et une élégance incomparables
          </p>
          
          {/* Compteur et bouton d'ajout */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-2 sm:gap-3">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-emerald-300 shrink-0" />
                <span className="text-white font-bold text-base sm:text-lg md:text-xl">
                  {clientCount} Client{clientCount > 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <Button 
              onClick={onAddClient} 
              className="group bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 hover:from-yellow-500 hover:via-orange-500 hover:to-red-500 text-black font-bold px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-yellow-500/30 transform hover:-translate-y-2 transition-all duration-500 border-2 border-yellow-300/50 w-full sm:w-auto"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:rotate-90 transition-transform duration-300 shrink-0" />
              <span className="text-sm sm:text-base md:text-lg whitespace-nowrap">
                Nouveau Client<span className="hidden xs:inline"> Élite</span>
              </span>
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3 group-hover:scale-125 transition-transform duration-300 shrink-0" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientHero;
