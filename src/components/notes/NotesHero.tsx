/**
 * NotesHero - Hero modernisé pour la vue Notes Kanban
 * Inspiré de PointageHero (background aurora cosmique).
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Plus,
  StickyNote,
  Columns3,
  Sparkles,
  Share2,
  MessageCircle,
  Filter,
} from 'lucide-react';

export interface NotesHeroProps {
  notesCount: number;
  columnsCount: number;
  commentCount: number;
  onNewNote: () => void;
  onNewColumn: () => void;
  onShareNotes: () => void;
  onSelectiveShare: () => void;
  onViewComments: () => void;
}

const NotesHero: React.FC<NotesHeroProps> = ({
  notesCount,
  columnsCount,
  commentCount,
  onNewNote,
  onNewColumn,
  onShareNotes,
  onSelectiveShare,
  onViewComments,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-amber-950/40 to-rose-950 shadow-[0_30px_80px_-20px_rgba(245,158,11,0.35)] py-8 sm:py-10 mb-6">
      {/* Aurora orbs */}
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-10 left-1/4 w-[24rem] h-[24rem] bg-amber-500/20 rounded-full blur-[110px] pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-10 right-1/4 w-[26rem] h-[26rem] bg-rose-500/20 rounded-full blur-[120px] pointer-events-none"
      />
      {/* Grid mask */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-400/50 to-transparent" />

      <div className="relative z-10 text-center px-4">
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/[0.07] backdrop-blur-2xl border border-white/[0.12] shadow-[0_10px_40px_rgba(245,158,11,0.3)] mb-4"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <StickyNote className="h-5 w-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-black bg-gradient-to-r from-amber-200 via-orange-200 to-rose-200 bg-clip-text text-transparent flex items-center gap-2">
              Prise de Notes
              <Sparkles className="h-4 w-4 text-amber-300 animate-pulse drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
            </h2>
            <p className="text-xs text-amber-100/60">
              {notesCount} notes · {columnsCount} colonnes
            </p>
          </div>
        </motion.div>

        <div className="relative overflow-hidden bg-gradient-to-br from-amber-700/70 via-orange-700/70 to-rose-800/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.45)] p-5 sm:p-6 border border-white/25 max-w-2xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex flex-wrap justify-center gap-3">
            <Button
              onClick={onNewNote}
              className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-700 border border-cyan-300/40 text-white shadow-[0_20px_70px_rgba(6,182,212,0.5)] hover:shadow-[0_35px_100px_rgba(6,182,212,0.7)] rounded-2xl px-5 py-2.5 font-bold text-sm transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4 mr-2" /> Nouvelle note
            </Button>
            <Button
              onClick={onNewColumn}
              className="relative overflow-hidden bg-gradient-to-br from-violet-500 via-violet-600 to-purple-700 border border-violet-300/40 text-white shadow-[0_20px_70px_rgba(139,92,246,0.5)] hover:shadow-[0_35px_100px_rgba(139,92,246,0.7)] rounded-2xl px-5 py-2.5 font-bold text-sm transition-all hover:scale-105 active:scale-95"
            >
              <Columns3 className="h-4 w-4 mr-2" /> Ajouter colonne
            </Button>
            <Button
              onClick={onShareNotes}
              className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border border-emerald-300/40 text-white shadow-[0_20px_70px_rgba(16,185,129,0.5)] hover:shadow-[0_35px_100px_rgba(16,185,129,0.7)] rounded-2xl px-5 py-2.5 font-bold text-sm transition-all hover:scale-105 active:scale-95"
            >
              <Share2 className="h-4 w-4 mr-2" /> Partager notes
            </Button>
            <Button
              onClick={onSelectiveShare}
              className="relative overflow-hidden bg-gradient-to-br from-fuchsia-500 via-pink-600 to-rose-700 border border-fuchsia-300/40 text-white shadow-[0_20px_70px_rgba(217,70,239,0.5)] hover:shadow-[0_35px_100px_rgba(217,70,239,0.7)] rounded-2xl px-5 py-2.5 font-bold text-sm transition-all hover:scale-105 active:scale-95"
            >
              <Filter className="h-4 w-4 mr-2" /> Partage sélectif
            </Button>
            <Button
              onClick={onViewComments}
              className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 border border-blue-300/40 text-white shadow-[0_20px_70px_rgba(59,130,246,0.5)] rounded-2xl px-5 py-2.5 font-bold text-sm transition-all hover:scale-105 active:scale-95"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {commentCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[20px] h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-lg animate-pulse z-10">
                  {commentCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesHero;
