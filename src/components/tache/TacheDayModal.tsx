import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Clock, Plus, Pencil, Trash2, GripVertical, AlertTriangle, CheckCircle, Timer, Check } from 'lucide-react';
import { Tache } from '@/services/api/tacheApi';

interface TacheDayModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selectedDay: string | null;
  taches: Tache[];
  onEdit: (t: Tache) => void;
  onDelete: (id: string) => void;
  onAddTache: () => void;
  onMoveTache: (id: string, newHeure: string) => void;
  onValidateTache: (t: Tache) => void;
  premiumBtnClass: string;
  mirrorShine: string;
}

const HOURS = Array.from({ length: 20 }, (_, i) => i + 4); // 4h to 23h

const useCountdown = (heureFin: string, date: string, open: boolean) => {
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    if (!open) return;
    const calc = () => {
      const now = new Date();
      const [h, m] = heureFin.split(':').map(Number);
      const end = new Date(date + 'T00:00:00');
      end.setHours(h, m, 0, 0);
      return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
    };
    setRemaining(calc());
    const interval = setInterval(() => setRemaining(calc()), 1000);
    return () => clearInterval(interval);
  }, [heureFin, date, open]);

  return remaining;
};

const CountdownDisplay: React.FC<{ heureFin: string; date: string; open: boolean }> = ({
  heureFin, date, open
}) => {
  const remaining = useCountdown(heureFin, date, open);

  if (remaining <= 0) {
    return <span className="text-[10px] font-black text-red-400 animate-pulse">⏰ À vérifier</span>;
  }

  const hours = Math.floor(remaining / 3600);
  const mins = Math.floor((remaining % 3600) / 60);
  const secs = remaining % 60;
  const isUrgent = remaining < 3600;

  return (
    <span className={cn(
      'text-[10px] font-mono font-black flex items-center gap-1 px-1.5 py-0.5 rounded-lg',
      isUrgent
        ? 'text-red-400 bg-red-500/10 border border-red-500/20 animate-pulse'
        : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
    )}>
      <Timer className="h-3 w-3" />
      {String(hours).padStart(2, '0')}:{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  );
};

const TacheDayModal: React.FC<TacheDayModalProps> = ({
  open, onOpenChange, selectedDay, taches, onEdit, onDelete, onAddTache, onMoveTache, onValidateTache, premiumBtnClass, mirrorShine
}) => {
  const dayTaches = taches.filter(t => t.date === selectedDay);
  const dragRef = useRef<{ tacheId: string; originHeure: string } | null>(null);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getTachesAtHour = (hour: number) => {
    return dayTaches.filter(t => {
      const tHour = parseInt(t.heureDebut.split(':')[0]);
      return tHour === hour;
    });
  };

  const handleDragStart = (e: React.DragEvent, tache: Tache) => {
    if (tache.importance === 'pertinent') {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('tacheId', tache.id);
    dragRef.current = { tacheId: tache.id, originHeure: tache.heureDebut };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    const tacheId = e.dataTransfer.getData('tacheId');
    if (tacheId) {
      const newHeure = `${String(hour).padStart(2, '0')}:00`;
      onMoveTache(tacheId, newHeure);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-violet-900/30 to-purple-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-w-2xl max-h-[85vh] overflow-hidden">
        <DialogHeader className="text-center space-y-2 pb-3">
          <DialogTitle className="text-lg font-black bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            📋 {formatDate(selectedDay)}
          </DialogTitle>
          <div className="flex justify-center">
            <Button onClick={onAddTache}
              className={cn(premiumBtnClass, "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-300/40 text-white shadow-lg !py-1.5 !px-3 !text-xs")}>
              <span className={mirrorShine} />
              <span className="relative flex items-center"><Plus className="h-3 w-3 mr-1" /> Ajouter</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] pr-2 space-y-0.5">
          {HOURS.map(hour => {
            const hourTaches = getTachesAtHour(hour);
            return (
              <div
                key={hour}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, hour)}
                className={cn(
                  'flex gap-3 py-2 px-3 rounded-xl transition-all border border-transparent',
                  hourTaches.length > 0 ? 'bg-white/5' : 'hover:bg-white/5',
                )}
              >
                <div className="w-14 shrink-0 text-right">
                  <span className="text-xs font-bold text-white/40">{String(hour).padStart(2, '0')}:00</span>
                </div>
                <div className="flex-1 min-h-[36px] flex flex-col gap-1">
                  {hourTaches.length === 0 && (
                    <div className="h-[1px] bg-white/5 mt-4" />
                  )}
                  {hourTaches.map(tache => (
                    <div
                      key={tache.id}
                      draggable={tache.importance !== 'pertinent'}
                      onDragStart={(e) => handleDragStart(e, tache)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl border transition-all group',
                        tache.completed && 'opacity-60',
                        tache.importance === 'pertinent'
                          ? 'bg-red-500/15 border-red-500/30 shadow-lg shadow-red-500/10'
                          : 'bg-emerald-500/15 border-emerald-500/30 shadow-lg shadow-emerald-500/10 cursor-grab active:cursor-grabbing'
                      )}
                    >
                      {tache.importance !== 'pertinent' && (
                        <GripVertical className="h-4 w-4 text-white/30 shrink-0" />
                      )}
                      <div className={cn(
                        'w-2 h-2 rounded-full shrink-0',
                        tache.importance === 'pertinent' ? 'bg-red-500' : 'bg-emerald-500'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-xs font-bold text-white truncate',
                          tache.completed && 'line-through text-white/50'
                        )}>
                          {tache.description}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] text-white/50">
                            {tache.heureDebut} - {tache.heureFin}
                            {tache.travailleurNom && ` • ${tache.travailleurNom}`}
                          </p>
                          {selectedDay && !tache.completed && (
                            <CountdownDisplay
                              heureFin={tache.heureFin}
                              date={selectedDay}
                              open={open}
                            />
                          )}
                          {tache.completed && (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle className="h-3 w-3" /> Terminée
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Validate button - always visible */}
                        {!tache.completed && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onValidateTache(tache); }}
                            className={cn(
                              'p-1.5 rounded-lg transition-all',
                              'bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/30'
                            )}
                            title="Valider cette tâche"
                          >
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          </button>
                        )}
                        {/* Edit/Delete - on hover for non-pertinent */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {tache.importance === 'pertinent' ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                          ) : (
                            <>
                              <button onClick={() => onEdit(tache)} className="p-1 rounded-lg hover:bg-white/10">
                                <Pencil className="h-3 w-3 text-blue-400" />
                              </button>
                              <button onClick={() => onDelete(tache.id)} className="p-1 rounded-lg hover:bg-white/10">
                                <Trash2 className="h-3 w-3 text-red-400" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TacheDayModal;
