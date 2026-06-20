import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Clock, Building2, Plus, Timer, Sparkles, UserPlus, Users, BarChart3, Banknote, Share2, Filter, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PointageHeroProps {
  entreprisesCount: number;
  travailleursCount: number;
  pointagesCount: number;
  monthTotal: number;
  premiumBtnClass: string;
  mirrorShine: string;
  onAddEntreprise: () => void;
  onAddTravailleur: () => void;
  onNewPointage: () => void;
  onShowParPersonne: () => void;
  onShowYearlyTotal: () => void;
  onPriseAvance: () => void;
  onShowMonthDetail: () => void;
  onSharePointage?: () => void;
  onSelectiveSharePointage?: () => void;
  onViewComments?: () => void;
  commentCount?: number;
  year: number;
}

const PointageHero: React.FC<PointageHeroProps> = ({
  entreprisesCount, travailleursCount, pointagesCount, monthTotal,
  premiumBtnClass, mirrorShine,
  onAddEntreprise, onAddTravailleur, onNewPointage, onShowParPersonne, onShowYearlyTotal, onPriseAvance, onShowMonthDetail, onSharePointage, onSelectiveSharePointage, onViewComments, commentCount = 0, year
}) => {
  return (
    <div className="relative overflow-hidden py-10 sm:py-14 rounded-3xl bg-gradient-to-br from-slate-950 via-cyan-950/70 to-indigo-950 border border-white/10 shadow-[0_30px_80px_-20px_rgba(6,182,212,0.35)]">
      {/* Aurora glass orbs */}
      <motion.div animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-10 left-1/4 w-[26rem] h-[26rem] bg-cyan-500/25 rounded-full blur-[110px] pointer-events-none" />
      <motion.div animate={{ x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }} transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-10 right-1/4 w-[28rem] h-[28rem] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid mask */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      {/* Shimmer borders */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <motion.div whileHover={{ scale: 1.05, y: -2 }} className="inline-flex items-center gap-3 mb-5 px-6 py-3 rounded-full bg-white/[0.07] border border-white/[0.12] backdrop-blur-2xl shadow-[0_10px_40px_rgba(6,182,212,0.3)]">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
              <Clock className="h-5 w-5 text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
            </motion.div>
            <span className="text-sm font-bold text-cyan-100">Gestion du Pointage</span>
            <Sparkles className="h-4 w-4 text-amber-300 animate-pulse drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, ease: 'easeOut' }}
            className="text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-cyan-200 via-blue-200 to-indigo-200 bg-clip-text text-transparent mb-2 tracking-tight drop-shadow-[0_4px_30px_rgba(6,182,212,0.4)]">
            <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="inline-block mr-2 align-middle">
              <Timer className="inline h-9 w-9 sm:h-12 sm:w-12 text-cyan-300 drop-shadow-[0_0_18px_rgba(34,211,238,0.8)]" />
            </motion.span>
            Pointage de Travail
          </motion.h1>
          <p className="text-cyan-100/60 text-sm sm:text-base font-medium">Suivez vos heures et revenus par entreprise</p>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {[
              { label: 'Entreprises', value: entreprisesCount, color: 'text-cyan-300', glow: 'rgba(34,211,238,0.4)' },
              { label: 'Travailleurs', value: travailleursCount, color: 'text-purple-300', glow: 'rgba(168,85,247,0.4)' },
              { label: 'Pointages ce mois', value: pointagesCount, color: 'text-blue-300', glow: 'rgba(59,130,246,0.4)' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
                whileHover={{ y: -4, scale: 1.03 }}
                className="px-5 py-3 rounded-2xl bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
                <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">{s.label}</p>
                <p className={`text-xl font-black ${s.color}`} style={{ textShadow: `0 0 20px ${s.glow}` }}>{s.value}</p>
              </motion.div>
            ))}
            <motion.div whileHover={{ y: -4, scale: 1.03 }} onClick={onShowMonthDetail}
              className="px-5 py-3 rounded-2xl bg-white/[0.06] backdrop-blur-2xl border border-emerald-300/20 shadow-[0_10px_40px_rgba(16,185,129,0.25)] cursor-pointer hover:border-emerald-300/40 transition-colors">
              <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Total du mois</p>
              <p className="text-xl font-black text-emerald-300" style={{ textShadow: '0 0 20px rgba(16,185,129,0.5)' }}>{monthTotal.toFixed(2)}€</p>
              <p className="text-[10px] text-emerald-300/70 font-semibold">Cliquer pour détails</p>
            </motion.div>
            <motion.div whileHover={{ y: -4, scale: 1.03 }} onClick={onShowYearlyTotal}
              className="px-5 py-3 rounded-2xl bg-white/[0.06] backdrop-blur-2xl border border-amber-300/20 shadow-[0_10px_40px_rgba(245,158,11,0.25)] cursor-pointer hover:border-amber-300/40 transition-colors">
              <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Total de l'année {year}</p>
              <p className="text-xl font-black text-amber-300" style={{ textShadow: '0 0 20px rgba(245,158,11,0.5)' }}>📊 Voir</p>
            </motion.div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-cyan-800/70 via-blue-800/70 to-purple-900/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.45)] p-5 sm:p-7 border border-white/25 mt-6">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
            <div className="relative flex flex-wrap justify-center gap-3 sm:gap-4">
              <Button onClick={onAddEntreprise}
                className={cn(premiumBtnClass, "bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-700 border-cyan-300/40 text-white shadow-[0_20px_70px_rgba(6,182,212,0.5)] hover:shadow-[0_35px_100px_rgba(6,182,212,0.7)]")}>
                <span className={mirrorShine} />
                <span className="relative flex items-center"><Building2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Ajouter Entreprise</span>
              </Button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={onAddTravailleur}
                      className={cn(premiumBtnClass, "bg-gradient-to-br from-red-500 via-red-600 to-rose-700 border-red-300/40 text-white shadow-[0_20px_70px_rgba(239,68,68,0.5)] hover:shadow-[0_35px_100px_rgba(239,68,68,0.7)] !px-3 sm:!px-4")}>
                      <span className={mirrorShine} />
                      <span className="relative flex items-center"><UserPlus className="h-5 w-5 sm:h-6 sm:w-6" /></span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-red-600 text-white border-red-500 font-bold"><p>Ajouter un Travailleur</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button onClick={onNewPointage}
                className={cn(premiumBtnClass, "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border-emerald-300/40 text-white shadow-[0_20px_70px_rgba(16,185,129,0.6)] hover:shadow-[0_35px_100px_rgba(16,185,129,0.75)]")}>
                <span className={mirrorShine} />
                <span className="relative flex items-center"><Timer className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Nouveau Pointage</span>
              </Button>

              <Button onClick={onPriseAvance}
                className={cn(premiumBtnClass, "bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 border-amber-300/40 text-white shadow-[0_20px_70px_rgba(245,158,11,0.5)] hover:shadow-[0_35px_100px_rgba(245,158,11,0.7)]")}>
                <span className={mirrorShine} />
                <span className="relative flex items-center"><Banknote className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Prise Avance</span>
              </Button>

              <Button onClick={onShowParPersonne}
                className={cn(premiumBtnClass, "bg-gradient-to-br from-[#800020] via-[#900028] to-[#6b001a] border-[#c0506070] text-white shadow-[0_20px_70px_rgba(128,0,32,0.6)] hover:shadow-[0_35px_100px_rgba(128,0,32,0.75)]")}>
                <span className={mirrorShine} />
                <span className="relative flex items-center"><BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Afficher pointage Par Personne</span>
              </Button>

              {onSharePointage && (
                <Button onClick={onSharePointage}
                  className={cn(premiumBtnClass, "bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-700 border-teal-300/40 text-white shadow-[0_20px_70px_rgba(20,184,166,0.5)] hover:shadow-[0_35px_100px_rgba(20,184,166,0.7)]")}>
                  <span className={mirrorShine} />
                  <span className="relative flex items-center"><Share2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Partager pointage</span>
                </Button>
              )}
              {onSelectiveSharePointage && (
                <Button onClick={onSelectiveSharePointage}
                  className={cn(premiumBtnClass, "bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 border-violet-300/40 text-white shadow-[0_20px_70px_rgba(139,92,246,0.5)] hover:shadow-[0_35px_100px_rgba(139,92,246,0.7)]")}>
                  <span className={mirrorShine} />
                  <span className="relative flex items-center"><Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Partage sélectif</span>
                </Button>
              )}
              {onViewComments && (
                <Button
                  onClick={onViewComments}
                  className={cn(
                    premiumBtnClass,
                    "overflow-visible relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 border-blue-300/40 text-white shadow-[0_20px_70px_rgba(59,130,246,0.5)] hover:shadow-[0_35px_100px_rgba(59,130,246,0.7)]"
                  )}
                >
                  <span className={mirrorShine} />

                  <span className="relative flex items-center">
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  </span>

                  {commentCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[20px] h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-lg animate-pulse z-10">
                      {commentCount}
                    </span>
                  )}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PointageHero;
