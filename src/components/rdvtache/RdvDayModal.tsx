/**
 * RdvDayModal.tsx - Modale "RDV du jour" avec horaire 4h-23h, édition/suppression.
 */
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Phone, MapPin, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RdvTache } from '@/services/api/rdvTachesApi';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selectedDay: string | null;
  rdvs: RdvTache[];
  onAdd: () => void;
  onEdit: (r: RdvTache) => void;
  onDelete: (id: string) => void;
}

const HOURS = Array.from({ length: 20 }, (_, i) => i + 4); // 4..23

const STATUT_COLORS: Record<string, string> = {
  planifie: 'bg-white/90 border-white/60 text-slate-900',
  confirme: 'bg-emerald-500/90 border-emerald-400 text-white',
  annule: 'bg-red-500/90 border-red-400 text-white',
  reporte: 'bg-blue-500/90 border-blue-400 text-white',
  termine: 'bg-amber-900 border-amber-900 text-amber-100 underline decoration-2 underline-offset-2',

};

const STATUT_LABEL: Record<string, string> = {
  planifie: 'Planifié',
  confirme: 'Confirmé',
  annule: 'Annulé',
  reporte: 'Reporté',
  termine: 'Terminé',
};

const STATUT_EMOJI: Record<string, string> = {
  planifie: '📅', confirme: '✅', annule: '❌', reporte: '🔄', termine: '🏁',
};

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const RdvDayModal: React.FC<Props> = ({ open, onOpenChange, selectedDay, rdvs, onAdd, onEdit, onDelete }) => {
  const dayRdvs = rdvs
    .filter(r => r.date === selectedDay && r.statut !== 'annule')
    .sort((a, b) => toMin(a.heureDebut) - toMin(b.heureDebut));

  const formatDate = (s: string | null) => {
    if (!s) return '';
    const d = new Date(s + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const rdvsAtHour = (h: number) => dayRdvs.filter(r => parseInt(r.heureDebut.split(':')[0]) === h);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-pink-900/30 to-fuchsia-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-w-2xl max-h-[85vh] overflow-hidden">
        <DialogHeader className="text-center space-y-2 pb-3">
          <DialogTitle className="text-lg font-black bg-gradient-to-r from-pink-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent">
            💇 RDV du {formatDate(selectedDay)}
          </DialogTitle>
          <div className="flex justify-center">
            <Button onClick={onAdd}
              className="bg-gradient-to-br from-pink-500 via-fuchsia-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 hover:scale-105 transition-all !py-1.5 !px-4 !text-xs rounded-xl">
              <Plus className="h-3 w-3 mr-1" /> Ajouter
            </Button>
          </div>
          <p className="text-[11px] text-white/50">{dayRdvs.length} rendez-vous au total</p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] pr-2 space-y-0.5">
          {HOURS.map(hour => {
            const hourRdvs = rdvsAtHour(hour);
            return (
              <div key={hour} className={cn('flex gap-3 py-2 px-3 rounded-xl border border-transparent',
                hourRdvs.length > 0 ? 'bg-white/5' : 'hover:bg-white/5')}>
                <div className="w-14 shrink-0 text-right">
                  <span className="text-xs font-bold text-white/40">{String(hour).padStart(2, '0')}:00</span>
                </div>
                <div className="flex-1 min-h-[36px] flex flex-col gap-1">
                  {hourRdvs.length === 0 && <div className="h-[1px] bg-white/5 mt-4" />}
                  {hourRdvs.map(r => {
                    const isTermine = r.statut === 'termine';
                    return (
                    <div key={r.id} className={cn('flex items-center gap-2 px-3 py-2 rounded-xl border group transition-all', STATUT_COLORS[r.statut] || STATUT_COLORS.planifie)}>
                      <Sparkles className="h-4 w-4 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate flex items-center gap-1.5 flex-wrap">
                          <span>{STATUT_EMOJI[r.statut] || ''} {r.tacheNom}</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-black/20 text-[9px] font-black uppercase tracking-wide">
                            {STATUT_LABEL[r.statut] || r.statut}
                          </span>
                        </p>
                        <p className="text-[10px] opacity-80 truncate flex items-center gap-1">
                          {r.heureDebut} - {r.heureFin} • <User className="h-3 w-3" /> {r.clientNom}
                          {r.personneNom && ` • 👤 ${r.personneNom}`}
                        </p>
                        {(r.lieu || r.telephone) && (
                          <p className="text-[10px] opacity-60 truncate flex items-center gap-2 mt-0.5">
                            {r.lieu && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{r.lieu}</span>}
                            {r.telephone && <span className="flex items-center gap-0.5"><Phone className="h-3 w-3" />{r.telephone}</span>}
                          </p>
                        )}
                      </div>
                      {!isTermine && (
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => onEdit(r)} className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/30">
                            <Pencil className="h-3.5 w-3.5 text-emerald-400" />
                          </button>
                          <button onClick={() => onDelete(r.id)} className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 border border-red-500/30">
                            <Trash2 className="h-3.5 w-3.5 text-red-400" />
                          </button>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RdvDayModal;
