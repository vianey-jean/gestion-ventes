/**
 * ReporterModal — report d'une commande/réservation/RDV.
 * Pour les commandes de type RDV: vérifie la disponibilité du créneau dans rdv-taches.json
 * et n'affiche le bouton "Valider" que si le créneau est libre.
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';

interface ReporterModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reporterDate: string;
  setReporterDate: (date: string) => void;
  reporterHoraire: string;
  setReporterHoraire: (horaire: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isRdv?: boolean;
  reporterHoraireFin?: string;
  setReporterHoraireFin?: (h: string) => void;
  rdvBusy?: boolean;
  rdvBusyMessage?: string;
}

const ReporterModal: React.FC<ReporterModalProps> = ({
  isOpen, onOpenChange,
  reporterDate, setReporterDate,
  reporterHoraire, setReporterHoraire,
  onConfirm, onCancel,
  isRdv = false,
  reporterHoraireFin = '',
  setReporterHoraireFin,
  rdvBusy = false,
  rdvBusyMessage = '',
}) => {
  const canValidate = isRdv
    ? Boolean(reporterDate && reporterHoraire && reporterHoraireFin && !rdvBusy)
    : Boolean(reporterDate);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/30 dark:via-amber-900/30 dark:to-yellow-900/30 border-2 border-orange-300 dark:border-orange-700">
        <DialogHeader>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="h-6 w-6 text-orange-500" />
          </div>
          <DialogTitle className="text-xl font-bold text-center text-orange-700 dark:text-orange-300">
            {isRdv ? 'Reporter le RDV' : 'Reporter à une nouvelle date'}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {isRdv
              ? 'Choisissez une nouvelle date et un créneau libre dans le planning RDV'
              : "Sélectionnez la nouvelle date et l'horaire"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="reporterDate" className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Nouvelle date
            </Label>
            <Input
              id="reporterDate" type="date"
              value={reporterDate}
              onChange={(e) => setReporterDate(e.target.value)}
              className="border-2 border-orange-300 dark:border-orange-700"
              required
            />
          </div>

          <div className={isRdv ? 'grid grid-cols-2 gap-3' : ''}>
            <div>
              <Label htmlFor="reporterHoraire" className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" /> {isRdv ? 'Début' : 'Horaire (optionnel)'}
              </Label>
              <Input
                id="reporterHoraire" type="time"
                value={reporterHoraire}
                onChange={(e) => setReporterHoraire(e.target.value)}
                className="border-2 border-orange-300 dark:border-orange-700"
                required={isRdv}
              />
            </div>
            {isRdv && setReporterHoraireFin && (
              <div>
                <Label htmlFor="reporterHoraireFin" className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Fin
                </Label>
                <Input
                  id="reporterHoraireFin" type="time"
                  value={reporterHoraireFin}
                  onChange={(e) => setReporterHoraireFin(e.target.value)}
                  className="border-2 border-orange-300 dark:border-orange-700"
                  required
                />
              </div>
            )}
          </div>

          {isRdv && rdvBusy && (
            <div className="p-3 rounded-lg border-2 border-red-300 bg-red-50 dark:bg-red-900/30 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-700 dark:text-red-300">
                <p className="font-bold">Créneau occupé</p>
                <p className="text-xs">{rdvBusyMessage || 'Veuillez choisir un autre créneau.'}</p>
              </div>
            </div>
          )}
          {isRdv && !rdvBusy && reporterDate && reporterHoraire && reporterHoraireFin && (
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-300 text-xs text-green-700 dark:text-green-300 text-center font-semibold">
              ✅ Créneau libre
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
          {canValidate && (
            <Button
              type="button"
              onClick={onConfirm}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
            >
              Valider le report
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReporterModal;
