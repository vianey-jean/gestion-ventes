/**
 * RdvTachesHero - Hero modernisé pour la vue RDV/Tâches (Beauté)
 * Inspiré de PointageHero (aurora glass cosmique) + contenu spécifique RDV Beauté.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { CalendarHeart, Eye, Scissors, UserPlus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RdvTachesHeroProps {
  totalActifs: number;
  todayCount: number;
  catalogCount: number;
  onAddRdv: () => void;
  onShowDay: () => void;
  onAddCatalog: () => void;
  onAddTravailleur: () => void;
  onShowCatalogList: () => void;
}

const premiumBtnClass =
  'group relative overflow-hidden rounded-xl sm:rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 px-4 py-2 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold';
const mirrorShine =
  'absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500';

const RdvTachesHero: React.FC<RdvTachesHeroProps> = ({
  totalActifs,
  todayCount,
  catalogCount,
  onAddRdv,
  onShowDay,
  onAddCatalog,
  onAddTravailleur,
  onShowCatalogList,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 pt-6"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-rose-950/60 to-fuchsia-950 border border-pink-500/20 shadow-[0_30px_80px_-20px_rgba(236,72,153,0.45)] p-6 sm:p-8">
        {/* Aurora orbs */}
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-10 left-1/4 w-[22rem] h-[22rem] bg-pink-500/25 rounded-full blur-[110px] pointer-events-none"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-10 right-1/4 w-[24rem] h-[24rem] bg-fuchsia-500/20 rounded-full blur-[120px] pointer-events-none"
        />
        {/* Grid mask */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        {/* Shimmer borders */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-400/60 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/50 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-rose-500 flex items-center justify-center shadow-xl shadow-pink-500/40"
              >
                <Sparkles className="h-7 w-7 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]" />
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-pink-300 via-fuchsia-300 to-rose-300 bg-clip-text text-transparent drop-shadow-[0_4px_30px_rgba(236,72,153,0.4)]">
                  Rendez-vous Beauté
                </h1>
                <p className="text-xs sm:text-sm text-pink-100/60 font-medium">
                  Tissages • Tresses • Perruques • Extensions
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-[11px] font-bold text-pink-200">
                📅 {totalActifs} RDV actifs
              </span>
              <span className="px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-[11px] font-bold text-fuchsia-200">
                🌟 {todayCount} aujourd'hui
              </span>
              <button
                type="button"
                onClick={onShowCatalogList}
                className="px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-[11px] font-bold text-rose-200 hover:bg-rose-500/25 hover:scale-105 transition-all cursor-pointer"
              >
                ✂️ {catalogCount} tâches au catalogue
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={onAddRdv}
              className={cn(
                premiumBtnClass,
                'bg-gradient-to-br from-pink-500 via-fuchsia-500 to-rose-500 border-pink-300/40 text-white shadow-lg shadow-pink-500/30',
              )}
            >
              <span className={mirrorShine} />
              <span className="relative flex items-center gap-1.5">
                <CalendarHeart className="h-4 w-4" /> Ajouter RDV
              </span>
            </button>
            <button
              onClick={onShowDay}
              className={cn(
                premiumBtnClass,
                'bg-gradient-to-br from-amber-500 to-orange-500 border-amber-300/40 text-white shadow-lg shadow-amber-500/30',
              )}
            >
              <span className={mirrorShine} />
              <span className="relative flex items-center gap-1.5">
                <Eye className="h-4 w-4" /> RDV du jour
              </span>
            </button>
            <button
              onClick={onAddCatalog}
              className={cn(
                premiumBtnClass,
                'bg-gradient-to-br from-violet-500 to-purple-600 border-violet-300/40 text-white shadow-lg shadow-violet-500/30',
              )}
            >
              <span className={mirrorShine} />
              <span className="relative flex items-center gap-1.5">
                <Scissors className="h-4 w-4" /> Ajouter tâche
              </span>
            </button>
            <button
              onClick={onAddTravailleur}
              className={cn(
                premiumBtnClass,
                'bg-gradient-to-br from-red-500 to-rose-600 border-red-300/40 text-white shadow-lg shadow-red-500/30',
              )}
            >
              <span className={mirrorShine} />
              <span className="relative flex items-center gap-1.5">
                <UserPlus className="h-4 w-4" /> Travailleur
              </span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RdvTachesHero;
