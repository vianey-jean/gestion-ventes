import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ListTodo, Plus, CalendarDays, Eye, Sparkles, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TacheHeroProps {
  totalTaches: number;
  todayCount: number;
  pertinentCount: number;
  optionnelCount: number;
  premiumBtnClass: string;
  mirrorShine: string;
  onAddTache: () => void;
  onShowToday: () => void;
  onShowWeek: () => void;
  onAddTravailleur?: () => void;
}

const TacheHero: React.FC<TacheHeroProps> = ({
  totalTaches, todayCount, pertinentCount, optionnelCount,
  premiumBtnClass, mirrorShine,
  onAddTache, onShowToday, onShowWeek, onAddTravailleur
}) => {
  return (
    <div className="relative overflow-hidden py-8 sm:py-12">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-fuchsia-500/5" />
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 backdrop-blur-xl">
            <ListTodo className="h-5 w-5 text-violet-500" />
            <span className="text-sm font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">Gestion des Tâches</span>
            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-violet-400 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent mb-2">
            📋 Planificateur de Tâches
          </h1>
          <p className="text-muted-foreground">Organisez et suivez vos tâches quotidiennes</p>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <div className="px-5 py-3 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
              <p className="text-xs text-muted-foreground">Total tâches</p>
              <p className="text-xl font-black text-violet-500">{totalTaches}</p>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
              <p className="text-xs text-muted-foreground">Aujourd'hui</p>
              <p className="text-xl font-black text-blue-500">{todayCount}</p>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
              <p className="text-xs text-muted-foreground">🔴 Pertinentes</p>
              <p className="text-xl font-black text-red-500">{pertinentCount}</p>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
              <p className="text-xs text-muted-foreground">🟢 Optionnelles</p>
              <p className="text-xl font-black text-emerald-500">{optionnelCount}</p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-purple-700 to-fuchsia-800 rounded-2xl sm:rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.45)] p-5 sm:p-7 border border-white/25 mt-6">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
            <div className="relative flex flex-wrap justify-center gap-3 sm:gap-4">
              <Button onClick={onAddTache}
                className={cn(premiumBtnClass, "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border-emerald-300/40 text-white shadow-[0_20px_70px_rgba(16,185,129,0.6)]")}>
                <span className={mirrorShine} />
                <span className="relative flex items-center"><Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Ajouter une Tâche</span>
              </Button>
              <Button onClick={onShowToday}
                className={cn(premiumBtnClass, "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 border-blue-300/40 text-white shadow-[0_20px_70px_rgba(59,130,246,0.5)]")}>
                <span className={mirrorShine} />
                <span className="relative flex items-center"><Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Tâches du jour</span>
              </Button>
              <Button onClick={onShowWeek}
                className={cn(premiumBtnClass, "bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 border-amber-300/40 text-white shadow-[0_20px_70px_rgba(245,158,11,0.5)]")}>
                <span className={mirrorShine} />
                <span className="relative flex items-center"><CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Tâches de la semaine</span>
              </Button>
              {onAddTravailleur && (
                <Button onClick={onAddTravailleur}
                  className={cn(premiumBtnClass, "bg-gradient-to-br from-rose-500 via-pink-600 to-red-700 border-rose-300/40 text-white shadow-[0_20px_70px_rgba(244,63,94,0.5)]")}>
                  <span className={mirrorShine} />
                  <span className="relative flex items-center"><UserPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Ajouter Travailleur</span>
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TacheHero;
