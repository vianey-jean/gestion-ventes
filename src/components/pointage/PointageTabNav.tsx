import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, ListTodo, StickyNote, CalendarHeart } from 'lucide-react';

interface PointageTabNavProps {
  activeTab: 'pointage' | 'tache' | 'notes' | 'rdv';
  onTabChange: (tab: 'pointage' | 'tache' | 'notes' | 'rdv') => void;
}

const PointageTabNav: React.FC<PointageTabNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 pt-6">
      <div className="flex gap-1 sm:gap-2 p-1 sm:p-1.5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-xl w-full max-w-2xl mx-auto overflow-hidden">
        <button
          onClick={() => onTabChange('pointage')}
          className={cn(
            'flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-2 px-1 sm:px-3 py-2 sm:py-3 rounded-xl font-bold text-[10px] sm:text-sm transition-all duration-300',
            activeTab === 'pointage'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
              : 'text-muted-foreground hover:bg-white/50 dark:hover:bg-white/10'
          )}
        >
          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="truncate">Pointage</span>
        </button>
        <button
          onClick={() => onTabChange('tache')}
          className={cn(
            'flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-2 px-1 sm:px-3 py-2 sm:py-3 rounded-xl font-bold text-[10px] sm:text-sm transition-all duration-300',
            activeTab === 'tache'
              ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30'
              : 'text-muted-foreground hover:bg-white/50 dark:hover:bg-white/10'
          )}
        >
          <ListTodo className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="truncate">Tâches</span>
        </button>
        <button
          onClick={() => onTabChange('rdv')}
          className={cn(
            'flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-2 px-1 sm:px-3 py-2 sm:py-3 rounded-xl font-bold text-[10px] sm:text-sm transition-all duration-300',
            activeTab === 'rdv'
              ? 'bg-gradient-to-r from-pink-500 via-fuchsia-500 to-rose-500 text-white shadow-lg shadow-pink-500/30'
              : 'text-muted-foreground hover:bg-white/50 dark:hover:bg-white/10'
          )}
        >
          <CalendarHeart className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="truncate">RDV</span>
        </button>
        <button
          onClick={() => onTabChange('notes')}
          className={cn(
            'flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-2 px-1 sm:px-3 py-2 sm:py-3 rounded-xl font-bold text-[10px] sm:text-sm transition-all duration-300',
            activeTab === 'notes'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
              : 'text-muted-foreground hover:bg-white/50 dark:hover:bg-white/10'
          )}
        >
          <StickyNote className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="truncate">Notes</span>
        </button>
      </div>
    </div>
  );
};

export default PointageTabNav;
