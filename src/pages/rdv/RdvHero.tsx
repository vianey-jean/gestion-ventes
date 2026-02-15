/**
 * =============================================================================
 * RdvHero - Section héroïque de la page Rendez-vous
 * =============================================================================
 * 
 * Header premium avec titre, description et bouton de création.
 * 
 * @module RdvHero
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Crown, Sparkles, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RdvHeroProps {
  onNewRdv: () => void;
}

const RdvHero: React.FC<RdvHeroProps> = ({ onNewRdv }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 py-10 px-4 mb-8 border-b border-amber-200/50 dark:border-amber-700/30"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-amber-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-purple-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-purple-600 rounded-2xl shadow-xl shadow-amber-500/30">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Gestion des Rendez-vous
              </h1>
              <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
            </div>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Planifiez et gérez vos rendez-vous clients - <span className="text-red-600 font-bold capitalize">{format(new Date(), 'MMMM yyyy', { locale: fr })}</span>
            </p>
          </div>
          <Button 
            onClick={onNewRdv} 
            size="lg" 
            className="bg-gradient-to-r from-amber-500 via-purple-500 to-blue-500 hover:from-amber-600 hover:via-purple-600 hover:to-blue-600 text-white shadow-xl shadow-purple-500/30 border-0 font-semibold"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouveau rendez-vous
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default RdvHero;
