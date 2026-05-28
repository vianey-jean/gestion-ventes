/**
 * RdvTacheCalendar.tsx - Calendrier mensuel des RDV-tâches avec compteur par jour.
 * Drag-and-drop : on peut faire glisser un chip RDV vers une autre case jour
 * pour le reporter. Les RDV issus des Commandes (commandeId) sont verrouillés 🔒.
 * Mode "pick-date" : si activé, un clic sur une case déclenche directement
 * onDayPicked(date) au lieu de l'ouverture standard.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Lock, MousePointerClick } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RdvTache } from '@/services/api/rdvTachesApi';

interface Props {
  currentDate: Date;
  rdvs: RdvTache[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (dateStr: string) => void;
  onRdvDropOnDay?: (rdv: RdvTache, dateStr: string) => void;
  pickMode?: { rdv: RdvTache } | null;
  onDayPicked?: (rdv: RdvTache, dateStr: string) => void;
  onCancelPick?: () => void;
}

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const RdvTacheCalendar: React.FC<Props> = ({
  currentDate, rdvs, onPrevMonth, onNextMonth, onDayClick,
  onRdvDropOnDay, pickMode, onDayPicked, onCancelPick,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const days: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= lastDay.getDate(); i++) days.push(i);

  const todayStr = new Date().toISOString().split('T')[0];
  const dateOf = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const rdvsOf = (d: number) => rdvs.filter(r => r.date === dateOf(d) && r.statut !== 'annule');

  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [draggingRdvId, setDraggingRdvId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, r: RdvTache) => {
    if (r.commandeId) { e.preventDefault(); return; }
    e.dataTransfer.setData('application/x-rdv-id', r.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingRdvId(r.id);
  };
  const handleDragEnd = () => { setDraggingRdvId(null); setDragOverDate(null); };

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    if (e.dataTransfer.types.includes('application/x-rdv-id')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverDate(dateStr);
    }
  };
  const handleDrop = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('application/x-rdv-id');
    setDragOverDate(null);
    setDraggingRdvId(null);
    if (!id) return;
    const r = rdvs.find(x => x.id === id);
    if (r && onRdvDropOnDay) onRdvDropOnDay(r, dateStr);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="rounded-3xl bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl p-4 sm:p-6">

      {pickMode && (
        <div className="mb-4 rounded-2xl bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 border border-pink-500/40 px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-xs sm:text-sm font-bold text-pink-700 dark:text-pink-300 flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 animate-pulse" />
            Cliquez sur une date pour déplacer « {pickMode.rdv.tacheNom} »
          </p>
          <button onClick={onCancelPick}
            className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-600 dark:text-red-300 text-[11px] font-bold">
            Annuler
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <button onClick={onPrevMonth} className="p-2 rounded-xl bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 transition-all shadow-lg">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-pink-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">
          {MOIS[month]} {year}
        </h2>
        <button onClick={onNextMonth} className="p-2 rounded-xl bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 transition-all shadow-lg">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {JOURS.map(j => (
          <div key={j} className="text-center text-xs sm:text-sm font-bold text-muted-foreground py-2">{j}</div>
        ))}
        {days.map((day, idx) => {
          if (day === null) return <div key={`e-${idx}`} />;
          const dateStr = dateOf(day);
          const dayRdvs = rdvsOf(day);
          const isToday = dateStr === todayStr;
          const count = dayRdvs.length;
          const isDragOver = dragOverDate === dateStr;
          const isPick = !!pickMode;
          return (
            <div key={day}
              onClick={() => {
                if (isPick && onDayPicked && pickMode) { onDayPicked(pickMode.rdv, dateStr); return; }
                onDayClick(dateStr);
              }}
              onDragOver={(e) => handleDragOver(e, dateStr)}
              onDragLeave={() => setDragOverDate(prev => (prev === dateStr ? null : prev))}
              onDrop={(e) => handleDrop(e, dateStr)}
              className={cn(
                'relative p-1 sm:p-2 rounded-xl sm:rounded-2xl transition-all duration-200 min-h-[68px] sm:min-h-[92px] flex flex-col items-stretch justify-start cursor-pointer hover:scale-[1.03]',
                isToday
                  ? 'bg-gradient-to-br from-pink-500/20 to-fuchsia-500/20 border-2 border-pink-500/40 shadow-lg shadow-pink-500/20'
                  : 'bg-white/40 dark:bg-white/5 border border-white/10 hover:bg-white/60 dark:hover:bg-white/10',
                isDragOver && 'ring-2 ring-pink-500 scale-105 bg-pink-500/30',
                isPick && 'ring-2 ring-fuchsia-400/60 animate-pulse'
              )}
            >
              <div className="flex items-center justify-between px-0.5">
                <span className={cn('text-xs sm:text-sm font-bold', isToday ? 'text-pink-600 dark:text-pink-400' : '')}>{day}</span>
                {count > 0 && (
                  <span className="text-[9px] font-black text-pink-600 dark:text-pink-300 bg-pink-500/15 px-1.5 py-0.5 rounded-full border border-pink-500/30">
                    {count}
                  </span>
                )}
              </div>
              {/* Chips RDV (max 3) */}
              <div className="mt-1 space-y-0.5 flex flex-col">
                {dayRdvs.slice(0, 3).map(r => {
                  const locked = !!r.commandeId;
                  return (
                    <div
                      key={r.id}
                      draggable={!locked}
                      onDragStart={(e) => handleDragStart(e, r)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => { e.stopPropagation(); onDayClick(dateStr); }}
                      title={`${r.heureDebut} • ${r.tacheNom} • ${r.clientNom}${locked ? ' (verrouillé)' : ''}`}
                      className={cn(
                        'text-[9px] sm:text-[10px] font-bold truncate px-1 py-0.5 rounded-md border transition-all',
                        locked
                          ? 'bg-amber-500/20 border-amber-500/30 text-amber-700 dark:text-amber-300 cursor-not-allowed'
                          : 'bg-pink-500/15 border-pink-500/30 text-pink-700 dark:text-pink-300 hover:bg-pink-500/25 cursor-grab active:cursor-grabbing',
                        draggingRdvId === r.id && 'opacity-40'
                      )}
                    >
                      {locked && <Lock className="inline w-2.5 h-2.5 mr-0.5 -mt-0.5" />}
                      {r.heureDebut} · {r.tacheNom}
                    </div>
                  );
                })}
                {count > 3 && (
                  <span className="text-[9px] text-pink-500 font-bold text-center">+{count - 3} autres</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default RdvTacheCalendar;
