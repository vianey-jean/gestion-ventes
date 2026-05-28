/**
 * RdvRescheduleModal.tsx — Modale de confirmation
 * "Modifier l'horaire / Déplacer ce RDV ?".
 * Demande la nouvelle date (optionnelle), l'heure de début et de fin,
 * puis valide avec un bouton dédié.
 */
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CalendarHeart, Clock, Save, X } from 'lucide-react';
import { RdvTache } from '@/services/api/rdvTachesApi';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  rdv: RdvTache | null;
  newDate?: string;          // date cible (drop)
  suggestedStart?: string;   // heure pré-remplie
  onConfirm: (payload: { date: string; heureDebut: string; heureFin: string }) => Promise<void> | void;
}

const toMin = (t: string) => {
  const [h, m] = (t || '00:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};
const toTime = (min: number) => {
  const m = Math.max(0, Math.min(23 * 60 + 59, min));
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

const RdvRescheduleModal: React.FC<Props> = ({ open, onOpenChange, rdv, newDate, suggestedStart, onConfirm }) => {
  const [date, setDate] = useState('');
  const [heureDebut, setHeureDebut] = useState('');
  const [heureFin, setHeureFin] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!rdv) return;
    const baseStart = suggestedStart || rdv.heureDebut;
    const durMin = Math.max(15, toMin(rdv.heureFin) - toMin(rdv.heureDebut));
    setDate(newDate || rdv.date);
    setHeureDebut(baseStart);
    setHeureFin(toTime(toMin(baseStart) + durMin));
    setError('');
  }, [rdv, newDate, suggestedStart, open]);

  const handleConfirm = async () => {
    setError('');
    if (!date || !heureDebut || !heureFin) {
      setError('Tous les champs sont requis');
      return;
    }
    if (toMin(heureFin) <= toMin(heureDebut)) {
      setError('L\'heure de fin doit être après l\'heure de début');
      return;
    }
    try {
      setSaving(true);
      await onConfirm({ date, heureDebut, heureFin });
      onOpenChange(false);
    } catch (e: any) {
      setError(e?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const sameDay = rdv && date === rdv.date;
  const title = sameDay ? "Modifier l'horaire du RDV ?" : "Déplacer ce RDV ?";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl bg-gradient-to-br from-slate-900 via-pink-900/30 to-fuchsia-900/20 backdrop-blur-2xl border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-base font-black bg-gradient-to-r from-pink-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent flex items-center gap-2">
            <CalendarHeart className="w-5 h-5" /> {title}
          </DialogTitle>
        </DialogHeader>

        {rdv && (
          <div className="space-y-3 pt-1">
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <p className="text-[11px] text-white/60">RDV</p>
              <p className="text-sm font-bold text-white">✨ {rdv.tacheNom}</p>
              <p className="text-[11px] text-white/60 mt-0.5">
                Client : <span className="text-white/80">{rdv.clientNom}</span>
              </p>
              <p className="text-[10px] text-white/50 mt-0.5">
                Avant : {rdv.date} • {rdv.heureDebut} → {rdv.heureFin}
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-white/70 flex items-center gap-1 mb-1">
                <CalendarHeart className="w-3 h-3" /> Nouvelle date
              </label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="bg-white/10 border-white/20 text-white" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-white/70 flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3" /> Heure début
                </label>
                <Input type="time" value={heureDebut} onChange={(e) => setHeureDebut(e.target.value)}
                  min="04:00" max="23:59"
                  className="bg-white/10 border-white/20 text-white" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-white/70 flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3" /> Heure fin
                </label>
                <Input type="time" value={heureFin} onChange={(e) => setHeureFin(e.target.value)}
                  min="04:00" max="23:59"
                  className="bg-white/10 border-white/20 text-white" />
              </div>
            </div>

            {error && (
              <p className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-2 py-1">{error}</p>
            )}

            <div className="flex gap-2 pt-2">
              <Button onClick={() => onOpenChange(false)} variant="ghost"
                className="flex-1 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10">
                <X className="w-4 h-4 mr-1" /> Annuler
              </Button>
              <Button onClick={handleConfirm} disabled={saving}
                className="flex-1 rounded-xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-rose-500 text-white font-bold">
                <Save className="w-4 h-4 mr-1" /> {saving ? 'Validation…' : 'Valider et enregistrer'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RdvRescheduleModal;
