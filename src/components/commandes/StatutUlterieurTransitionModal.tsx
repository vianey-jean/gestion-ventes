/**
 * StatutUlterieurTransitionModal
 * ---------------------------------------------------------------
 * Ouvre quand on bascule une réservation "ultérieure" → "en attente".
 * Demande date d'échéance, heure début et heure fin.
 */
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarClock, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: { dateEcheance: string; horaire: string; horaireFin: string }) => void;
  initialDate?: string;
  initialHoraire?: string;
  initialHoraireFin?: string;
}

const StatutUlterieurTransitionModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, initialDate, initialHoraire, initialHoraireFin }) => {
  const [date, setDate] = React.useState(initialDate || '');
  const [h1, setH1] = React.useState(initialHoraire || '');
  const [h2, setH2] = React.useState(initialHoraireFin || '');

  React.useEffect(() => {
    if (isOpen) {
      setDate(initialDate || '');
      setH1(initialHoraire || '');
      setH2(initialHoraireFin || '');
    }
  }, [isOpen, initialDate, initialHoraire, initialHoraireFin]);

  const submit = () => {
    if (!date || !h1 || !h2) { toast.error('Renseignez date, heure début et heure de fin'); return; }
    if (h2 <= h1) { toast.error('L\'heure de fin doit être après l\'heure de début'); return; }
    onConfirm({ dateEcheance: date, horaire: h1, horaireFin: h2 });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md rounded-3xl border-2 border-blue-300/60 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 shadow-[0_20px_60px_-15px_rgba(99,102,241,0.6)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-black text-indigo-700 dark:text-indigo-200">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <CalendarClock className="h-5 w-5" />
            </span>
            Confirmer la planification
          </DialogTitle>
          <DialogDescription className="text-sm text-indigo-700/80 dark:text-indigo-200/70">
            Renseignez la date et le créneau horaire de la réservation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="tr-date" className="text-sm font-bold text-indigo-900 dark:text-indigo-100">
              📅 Date d'échéance
            </Label>
            <Input id="tr-date" type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="mt-2 border-2 border-indigo-300 focus:border-indigo-500 bg-white/80 dark:bg-gray-900 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="tr-h1" className="text-sm font-bold text-indigo-900 dark:text-indigo-100">
                <Clock className="inline h-3 w-3 mr-1" /> Début
              </Label>
              <Input id="tr-h1" type="time" value={h1} onChange={(e) => setH1(e.target.value)}
                className="mt-2 border-2 border-indigo-300 focus:border-indigo-500 bg-white/80 dark:bg-gray-900 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="tr-h2" className="text-sm font-bold text-indigo-900 dark:text-indigo-100">
                <Clock className="inline h-3 w-3 mr-1" /> Fin
              </Label>
              <Input id="tr-h2" type="time" value={h2} onChange={(e) => setH2(e.target.value)}
                className="mt-2 border-2 border-indigo-300 focus:border-indigo-500 bg-white/80 dark:bg-gray-900 rounded-xl" />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">Annuler</Button>
          <Button onClick={submit} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg">
            <CheckCircle2 className="h-4 w-4 mr-2" /> Confirmer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatutUlterieurTransitionModal;
