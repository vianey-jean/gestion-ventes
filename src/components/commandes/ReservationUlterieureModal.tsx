/**
 * ReservationUlterieureModal
 * ---------------------------------------------------------------
 * Modale pour configurer une réservation ultérieure.
 * - Option A : choisir une date précise (max +10 jours à partir d'aujourd'hui)
 * - Option B : "date ultérieure inconnue" (à ajuster avant 10j sinon suppression auto)
 */
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Hourglass, Sparkles, Clock, CalendarClock, X } from 'lucide-react';
import { toast } from 'sonner';

export interface UlterieurConfig {
  mode: 'date' | 'inconnu';
  date?: string; // ISO YYYY-MM-DD
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initial?: UlterieurConfig | null;
  onConfirm: (config: UlterieurConfig | null) => void;
}

const ReservationUlterieureModal: React.FC<Props> = ({ isOpen, onClose, initial, onConfirm }) => {
  const today = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
  const max10 = React.useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + 10);
    return d.toISOString().slice(0, 10);
  }, []);

  const [mode, setMode] = React.useState<'date' | 'inconnu'>(initial?.mode || 'date');
  const [date, setDate] = React.useState<string>(initial?.date || '');

  React.useEffect(() => {
    if (isOpen) {
      setMode(initial?.mode || 'date');
      setDate(initial?.date || '');
    }
  }, [isOpen, initial]);

  const handleConfirm = () => {
    if (mode === 'date') {
      if (!date) { toast.error('Veuillez choisir une date'); return; }
      if (date < today) { toast.error('La date ne peut pas être dans le passé'); return; }
      if (date > max10) { toast.error('La date doit être dans les 10 prochains jours'); return; }
      onConfirm({ mode: 'date', date });
    } else {
      onConfirm({ mode: 'inconnu' });
    }
    onClose();
  };

  const handleRemove = () => { onConfirm(null); onClose(); };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg rounded-3xl border-2 border-amber-300/60 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-orange-950/40 dark:to-yellow-950/40 shadow-[0_20px_60px_-15px_rgba(251,146,60,0.6)] backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent">
            <span className="relative inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 shadow-lg text-white">
              <Hourglass className="h-6 w-6 animate-pulse" />
              <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-200" />
            </span>
            Réservation ultérieure
          </DialogTitle>
          <DialogDescription className="text-sm text-amber-800/80 dark:text-amber-200/80">
            Planifiez une réservation flexible. Elle sera automatiquement supprimée après 10 jours si elle n'est pas confirmée.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Choix du mode */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('date')}
              className={`p-4 rounded-2xl border-2 transition-all text-left ${mode === 'date'
                ? 'border-orange-500 bg-white/80 dark:bg-orange-950/30 shadow-lg scale-[1.02]'
                : 'border-amber-200 bg-white/40 dark:bg-amber-950/20 hover:border-amber-400'
                }`}
            >
              <CalendarClock className="h-6 w-6 text-orange-600 dark:text-orange-400 mb-1" />
              <div className="font-bold text-sm text-amber-900 dark:text-amber-100">Date choisie</div>
              <div className="text-xs text-amber-700/70 dark:text-amber-200/70">Dans les 10 jours</div>
            </button>
            <button
              type="button"
              onClick={() => setMode('inconnu')}
              className={`p-4 rounded-2xl border-2 transition-all text-left ${mode === 'inconnu'
                ? 'border-orange-500 bg-white/80 dark:bg-orange-950/30 shadow-lg scale-[1.02]'
                : 'border-amber-200 bg-white/40 dark:bg-amber-950/20 hover:border-amber-400'
                }`}
            >
              <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400 mb-1" />
              <div className="font-bold text-sm text-amber-900 dark:text-amber-100">Ultérieur</div>
              <div className="text-xs text-amber-700/70 dark:text-amber-200/70">À définir avant 10 jours</div>
            </button>
          </div>

          {mode === 'date' && (
            <div>
              <Label htmlFor="ult-date" className="text-sm font-bold text-amber-900 dark:text-amber-100">
                Date prévue
              </Label>
              <Input
                id="ult-date"
                type="date"
                min={today}
                max={max10}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-2 border-2 border-amber-300 focus:border-orange-500 bg-white/80 dark:bg-gray-900 rounded-xl"
              />
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Maximum : {new Date(max10).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}

          {mode === 'inconnu' && (
            <div className="p-4 rounded-2xl bg-orange-100/50 dark:bg-orange-900/20 border border-orange-300/50">
              <p className="text-sm text-orange-900 dark:text-orange-100 font-medium">
                ⚠️ Sans date précise, cette réservation sera <strong>supprimée automatiquement dans 10 jours</strong>.
                Vous devez basculer son statut en « En attente » avant l'expiration.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          {initial && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
            >
              <X className="h-4 w-4 mr-2" /> Retirer
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl border-amber-300"
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="flex-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white font-bold shadow-lg rounded-xl"
          >
            <Sparkles className="h-4 w-4 mr-2" /> Valider
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationUlterieureModal;
