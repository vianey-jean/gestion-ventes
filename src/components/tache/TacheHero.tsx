/**
 * TacheHero - Hero modernisé pour la page Tâches
 * Inspiré de PointageHero (style cosmique aurora glass) — props inchangés.
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import {
  ListTodo,
  Plus,
  CalendarDays,
  Eye,
  Sparkles,
  UserPlus,
  Clock,
  CheckCircle,
  Share2,
  Filter,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tache } from '@/services/api/tacheApi';

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
  onShareTaches?: () => void;
  onSelectiveShareTaches?: () => void;
  onViewComments?: () => void;
  commentCount?: number;
  allTaches?: Tache[];
  onNavigateToDate?: (dateStr: string) => void;
}

const TacheHero: React.FC<TacheHeroProps> = ({
  totalTaches,
  todayCount,
  pertinentCount,
  optionnelCount,
  premiumBtnClass,
  mirrorShine,
  onAddTache,
  onShowToday,
  onShowWeek,
  onAddTravailleur,
  onShareTaches,
  onSelectiveShareTaches,
  onViewComments,
  commentCount = 0,
  allTaches = [],
  onNavigateToDate,
}) => {
  const [showTotalModal, setShowTotalModal] = useState(false);
  const [showTodayModal, setShowTodayModal] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const uncompletedTaches = allTaches.filter((t) => !t.completed);
  const todayTaches = allTaches.filter((t) => t.date === todayStr);

  const handleTacheClick = (tache: Tache) => {
    setShowTotalModal(false);
    setShowTodayModal(false);
    onNavigateToDate?.(tache.date);
  };

  const renderTacheList = (taches: Tache[]) => {
    const sorted = [...taches].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.heureDebut.localeCompare(b.heureDebut);
    });
    return (
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {sorted.length === 0 && (
          <p className="text-sm text-white/50 text-center py-4">Aucune tâche</p>
        )}
        {sorted.map((t) => (
          <div
            key={t.id}
            onClick={() => handleTacheClick(t)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]',
              t.completed && 'opacity-50',
              t.importance === 'pertinent'
                ? 'bg-red-500/15 border-red-500/30'
                : 'bg-emerald-500/15 border-emerald-500/30',
            )}
          >
            <div
              className={cn(
                'w-2.5 h-2.5 rounded-full shrink-0',
                t.importance === 'pertinent' ? 'bg-red-500' : 'bg-emerald-500',
              )}
            />
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'text-sm font-bold text-white truncate',
                  t.completed && 'line-through text-white/50',
                )}
              >
                {t.description}
              </p>
              <p className="text-[11px] text-white/50">
                📅 {t.date} • <Clock className="inline h-3 w-3" /> {t.heureDebut} - {t.heureFin}
                {t.travailleurNom && ` • ${t.travailleurNom}`}
              </p>
            </div>
            {t.completed && <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-violet-950/70 to-fuchsia-950 border border-white/10 shadow-[0_30px_80px_-20px_rgba(168,85,247,0.4)] py-10 sm:py-14">
        {/* Aurora orbs */}
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-10 left-1/4 w-[26rem] h-[26rem] bg-violet-500/25 rounded-full blur-[110px] pointer-events-none"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-10 right-1/4 w-[28rem] h-[28rem] bg-fuchsia-500/20 rounded-full blur-[120px] pointer-events-none"
        />
        {/* Grid mask */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        {/* Shimmer borders */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/50 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="inline-flex items-center gap-3 mb-5 px-6 py-3 rounded-full bg-white/[0.07] border border-white/[0.12] backdrop-blur-2xl shadow-[0_10px_40px_rgba(168,85,247,0.3)]"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              >
                <ListTodo className="h-5 w-5 text-violet-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.7)]" />
              </motion.div>
              <span className="text-sm font-bold text-violet-100">Gestion des Tâches</span>
              <Sparkles className="h-4 w-4 text-amber-300 animate-pulse drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-violet-200 via-purple-200 to-fuchsia-200 bg-clip-text text-transparent mb-2 tracking-tight drop-shadow-[0_4px_30px_rgba(168,85,247,0.4)]"
            >
              📋 Planificateur de Tâches
            </motion.h1>
            <p className="text-violet-100/60 text-sm sm:text-base font-medium">
              Organisez et suivez vos tâches quotidiennes
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {[
                {
                  label: 'Total tâches',
                  value: totalTaches,
                  color: 'text-violet-300',
                  glow: 'rgba(168,85,247,0.4)',
                  onClick: () => totalTaches > 0 && setShowTotalModal(true),
                  interactive: totalTaches > 0,
                },
                {
                  label: "Aujourd'hui",
                  value: todayCount,
                  color: 'text-blue-300',
                  glow: 'rgba(59,130,246,0.4)',
                  onClick: () => todayCount > 0 && setShowTodayModal(true),
                  interactive: todayCount > 0,
                },
                {
                  label: '🔴 Pertinentes',
                  value: pertinentCount,
                  color: 'text-red-300',
                  glow: 'rgba(239,68,68,0.4)',
                },
                {
                  label: '🟢 Optionnelles',
                  value: optionnelCount,
                  color: 'text-emerald-300',
                  glow: 'rgba(16,185,129,0.4)',
                },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  whileHover={{ y: -4, scale: 1.03 }}
                  onClick={s.onClick}
                  className={cn(
                    'px-5 py-3 rounded-2xl bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] shadow-[0_10px_40px_rgba(0,0,0,0.3)]',
                    s.interactive && 'cursor-pointer',
                  )}
                >
                  <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">
                    {s.label}
                  </p>
                  <p
                    className={`text-xl font-black ${s.color}`}
                    style={{ textShadow: `0 0 20px ${s.glow}` }}
                  >
                    {s.value}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-violet-800/70 via-purple-800/70 to-fuchsia-900/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.45)] p-5 sm:p-7 border border-white/25 mt-6">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
              <div className="relative flex flex-wrap justify-center gap-3 sm:gap-4">
                <Button
                  onClick={onAddTache}
                  className={cn(
                    premiumBtnClass,
                    'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border-emerald-300/40 text-white shadow-[0_20px_70px_rgba(16,185,129,0.6)] hover:shadow-[0_35px_100px_rgba(16,185,129,0.75)]',
                  )}
                >
                  <span className={mirrorShine} />
                  <span className="relative flex items-center">
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Ajouter une Tâche
                  </span>
                </Button>
                <Button
                  onClick={onShowToday}
                  className={cn(
                    premiumBtnClass,
                    'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 border-blue-300/40 text-white shadow-[0_20px_70px_rgba(59,130,246,0.5)] hover:shadow-[0_35px_100px_rgba(59,130,246,0.7)]',
                  )}
                >
                  <span className={mirrorShine} />
                  <span className="relative flex items-center">
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Tâches du jour
                  </span>
                </Button>
                <Button
                  onClick={onShowWeek}
                  className={cn(
                    premiumBtnClass,
                    'bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 border-amber-300/40 text-white shadow-[0_20px_70px_rgba(245,158,11,0.5)] hover:shadow-[0_35px_100px_rgba(245,158,11,0.7)]',
                  )}
                >
                  <span className={mirrorShine} />
                  <span className="relative flex items-center">
                    <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Tâches de la semaine
                  </span>
                </Button>
                {onAddTravailleur && (
                  <Button
                    onClick={onAddTravailleur}
                    className={cn(
                      premiumBtnClass,
                      'bg-gradient-to-br from-rose-500 via-pink-600 to-red-700 border-rose-300/40 text-white shadow-[0_20px_70px_rgba(244,63,94,0.5)] hover:shadow-[0_35px_100px_rgba(244,63,94,0.7)]',
                    )}
                  >
                    <span className={mirrorShine} />
                    <span className="relative flex items-center">
                      <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Ajouter Travailleur
                    </span>
                  </Button>
                )}
                {onShareTaches && (
                  <Button
                    onClick={onShareTaches}
                    className={cn(
                      premiumBtnClass,
                      'bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-700 border-teal-300/40 text-white shadow-[0_20px_70px_rgba(20,184,166,0.5)] hover:shadow-[0_35px_100px_rgba(20,184,166,0.7)]',
                    )}
                  >
                    <span className={mirrorShine} />
                    <span className="relative flex items-center">
                      <Share2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Partager tâches
                    </span>
                  </Button>
                )}
                {onSelectiveShareTaches && (
                  <Button
                    onClick={onSelectiveShareTaches}
                    className={cn(
                      premiumBtnClass,
                      'bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 border-violet-300/40 text-white shadow-[0_20px_70px_rgba(139,92,246,0.5)] hover:shadow-[0_35px_100px_rgba(139,92,246,0.7)]',
                    )}
                  >
                    <span className={mirrorShine} />
                    <span className="relative flex items-center">
                      <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Partage sélectif
                    </span>
                  </Button>
                )}
                {onViewComments && (
                  <Button
                    onClick={onViewComments}
                    className={cn(
                      premiumBtnClass,
                      'overflow-visible relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 border-blue-300/40 text-white shadow-[0_20px_70px_rgba(59,130,246,0.5)] hover:shadow-[0_35px_100px_rgba(59,130,246,0.7)]',
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

      {/* Modal Total Tâches */}
      <Dialog open={showTotalModal} onOpenChange={setShowTotalModal}>
        <DialogContent className="bg-gradient-to-br from-slate-900 via-violet-900/30 to-purple-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-w-lg">
          <DialogHeader className="text-center space-y-2 pb-3">
            <DialogTitle className="text-lg font-black bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              📋 Toutes les tâches non terminées ({uncompletedTaches.length})
            </DialogTitle>
            <p className="text-xs text-white/50">
              Cliquez sur une tâche pour la voir dans le calendrier
            </p>
          </DialogHeader>
          {renderTacheList(uncompletedTaches)}
        </DialogContent>
      </Dialog>

      {/* Modal Aujourd'hui */}
      <Dialog open={showTodayModal} onOpenChange={setShowTodayModal}>
        <DialogContent className="bg-gradient-to-br from-slate-900 via-violet-900/30 to-purple-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-w-lg">
          <DialogHeader className="text-center space-y-2 pb-3">
            <DialogTitle className="text-lg font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              📅 Tâches d'aujourd'hui ({todayTaches.length})
            </DialogTitle>
            <p className="text-xs text-white/50">
              Cliquez sur une tâche pour la voir dans le calendrier
            </p>
          </DialogHeader>
          {renderTacheList(todayTaches)}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TacheHero;
