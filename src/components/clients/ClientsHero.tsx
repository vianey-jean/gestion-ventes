/**
 * ClientsHero - Section Hero pour la page Clients (Version Luxe Responsive)
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Crown, Star, Diamond, Users, Plus, Sparkles, Gem, Zap } from 'lucide-react';

interface ClientsHeroProps {
  clientsCount: number;
  onAddClient: () => void;
}

const ClientsHero: React.FC<ClientsHeroProps> = ({ clientsCount, onAddClient }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 dark:from-purple-800 dark:via-violet-800 dark:to-indigo-800 rounded-2xl sm:rounded-3xl shadow-2xl">
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Particules flottantes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-3 h-3 sm:w-4 sm:h-4 bg-yellow-300/30 rounded-full animate-pulse" />
        <div className="absolute top-20 right-16 w-4 h-4 sm:w-6 sm:h-6 bg-pink-300/30 rounded-full animate-bounce" />
        <div className="absolute bottom-16 left-20 w-3 h-3 sm:w-5 sm:h-5 bg-blue-300/30 rounded-full animate-pulse" />
        <div className="absolute top-32 left-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-green-300/30 rounded-full animate-bounce" />
      </div>
      
      <div className="relative container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        <div className="text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4 sm:mb-6"
          >
            <div className="relative">
              <Crown className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-yellow-300 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                <Star className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
              </div>
            </div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white"
            >
              Listes Clients{' '}
              <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 bg-clip-text text-transparent animate-pulse">
                Élite
              </span>
            </motion.h1>
            
            <div className="relative">
              <Diamond className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-purple-200" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl" />
            </div>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-purple-100 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4"
          >
            Gérez vos clients VIP avec une sophistication et une élégance incomparables
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-white/20 shadow-xl">
              <div className="flex items-center gap-2 sm:gap-3">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-emerald-300 shrink-0" />
                <span className="text-white font-bold text-sm sm:text-base md:text-lg">
                  {clientsCount} Client{clientsCount > 1 ? 's' : ''}
                </span>
                <Gem className="w-4 h-4 text-yellow-400 hidden sm:block" />
              </div>
            </div>
            
            <Button 
              onClick={onAddClient} 
              className="group bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 hover:from-yellow-500 hover:via-orange-500 hover:to-red-500 text-black font-bold px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-yellow-500/30 transform hover:-translate-y-1 transition-all duration-500 border-2 border-yellow-300/50 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:rotate-90 transition-transform duration-300 shrink-0" />
              <span className="text-xs sm:text-sm md:text-base whitespace-nowrap">
                Nouveau Client
                <span className="hidden xs:inline"> Élite</span>
              </span>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:scale-125 transition-transform duration-300 shrink-0" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ClientsHero;
