/**
 * RdvTacheCalendar.tsx - Calendrier mensuel des RDV-tâches avec compteur par jour.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RdvTache } from '@/services/api/rdvTachesApi';

interface Props {
  currentDate: Date;
  rdvs: RdvTache[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (dateStr: string) => void;
}

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const RdvTacheCalendar: React.FC<Props> = ({ currentDate, rdvs, onPrevMonth, onNextMonth, onDayClick }) => {
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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="rounded-3xl bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl p-4 sm:p-6">
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
          return (
            <div key={day}
              onClick={() => onDayClick(dateStr)}
              className={cn(
                'relative p-1 sm:p-2 rounded-xl sm:rounded-2xl transition-all duration-200 min-h-[52px] sm:min-h-[68px] flex flex-col items-center justify-start cursor-pointer hover:scale-105',
                isToday
                  ? 'bg-gradient-to-br from-pink-500/20 to-fuchsia-500/20 border-2 border-pink-500/40 shadow-lg shadow-pink-500/20'
                  : 'bg-white/40 dark:bg-white/5 border border-white/10 hover:bg-white/60 dark:hover:bg-white/10'
              )}
            >
              <span className={cn('text-xs sm:text-sm font-bold', isToday ? 'text-pink-600 dark:text-pink-400' : '')}>{day}</span>
              {count > 0 && (
                <div className="mt-1 flex flex-col items-center gap-0.5">
                  <span className="w-2 h-2 rounded-full bg-pink-500 shadow-lg shadow-pink-500/50" />
                  <span className="text-[9px] sm:text-[10px] font-black text-pink-600 dark:text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded-full border border-pink-500/30">
                    {count} RDV
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default RdvTacheCalendar;
