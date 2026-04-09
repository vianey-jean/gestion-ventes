/**
 * =============================================================================
 * OverdueReservationModal - Panneau de réservation en retard (bas gauche)
 * =============================================================================
 * 
 * Affiché en position fixe en bas à gauche quand une réservation a dépassé
 * sa date/horaire de 30 minutes. Non-bloquant : l'utilisateur peut naviguer.
 * Le chrono est persisté en base de données (champ overdueTimerStart).
 * 
 * Si le chrono est expiré à la connexion, affiche 5s pour action rapide.
 * 
 * @module OverdueReservationModal
 */

import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Calendar, AlertTriangle, Timer, X } from 'lucide-react';
import { Commande } from '@/types/commande';

interface OverdueReservationModalProps {
  /** Réservation en retard à afficher */
  reservation: Commande | null;
  /** Est-ce que le panneau est visible */
  isOpen: boolean;
  /** Action: valider la réservation */
  onValidate: (id: string) => void;
  /** Action: annuler la réservation */
  onCancel: (id: string) => void;
  /** Action: reporter la réservation */
  onPostpone: (id: string) => void;
}

const AUTO_VALIDATE_DELAY = 30 * 60; // 30 minutes en secondes
const GRACE_PERIOD = 5; // 5 secondes de grâce si chrono déjà expiré

const OverdueReservationModal: React.FC<OverdueReservationModalProps> = ({
  reservation,
  isOpen,
  onValidate,
  onCancel,
  onPostpone,
}) => {
  const [countdown, setCountdown] = useState(AUTO_VALIDATE_DELAY);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoValidatedRef = useRef(false);

  // Calculer le countdown basé sur overdueTimerStart persisté en DB
  useEffect(() => {
    if (!isOpen || !reservation) return;

    autoValidatedRef.current = false;

    // Calculer le temps restant depuis overdueTimerStart
    let initialCountdown = AUTO_VALIDATE_DELAY;
    if (reservation.overdueTimerStart) {
      const startTime = new Date(reservation.overdueTimerStart).getTime();
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      initialCountdown = AUTO_VALIDATE_DELAY - elapsed;

      // Si le chrono est déjà expiré, donner 5s de grâce
      if (initialCountdown <= 0) {
        initialCountdown = GRACE_PERIOD;
      }
    }

    setCountdown(Math.max(0, initialCountdown));

    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (!autoValidatedRef.current) {
            autoValidatedRef.current = true;
            onValidate(reservation.id);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isOpen, reservation?.id, reservation?.overdueTimerStart]);

  if (!reservation || !isOpen) return null;

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const horaireDisplay = reservation.horaire || 'Non défini';
  const dateDisplay = reservation.dateEcheance
    ? new Date(reservation.dateEcheance).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : 'Date non définie';

  const isGracePeriod = countdown <= GRACE_PERIOD;

  return (
    <div className="fixed bottom-4 left-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] animate-in slide-in-from-bottom-5 duration-300">
      <div className="rounded-xl border-2 border-amber-400 dark:border-amber-600 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-900/90 dark:via-orange-900/90 dark:to-red-900/90 shadow-2xl backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-amber-500 animate-pulse flex-shrink-0" />
          <h3 className="text-sm font-bold text-amber-700 dark:text-amber-300 flex-1">
            ⏰ Réservation en retard
          </h3>
        </div>

        {/* Info */}
        <div className="px-4 pb-2 space-y-1">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">{dateDisplay}</strong> vers <strong className="text-foreground">{horaireDisplay}</strong>
          </p>
          <p className="text-xs text-muted-foreground">
            Client : <strong className="text-foreground">{reservation.clientNom}</strong>
          </p>
          {reservation.produits && reservation.produits.length > 0 && (
            <p className="text-xs text-muted-foreground truncate">
              Produits : {reservation.produits.map(p => p.nom).join(', ')}
            </p>
          )}
        </div>

        {/* Chrono */}
        <div className={`flex items-center justify-center gap-2 py-2 px-4 mx-3 mb-2 rounded-lg border ${
          isGracePeriod 
            ? 'bg-red-200 dark:bg-red-800/50 border-red-400 dark:border-red-600' 
            : 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700'
        }`}>
          <Timer className="h-4 w-4 text-red-500 animate-pulse" />
          <span className="text-xs font-medium text-red-700 dark:text-red-300">
            {isGracePeriod ? 'Action rapide :' : 'Auto-validation :'}
          </span>
          <span className="text-base font-bold text-red-600 dark:text-red-400 font-mono tabular-nums">
            {formatCountdown(countdown)}
          </span>
        </div>

        {/* Boutons */}
        <div className="flex gap-1.5 px-3 pb-3">
          <Button
            type="button"
            size="sm"
            onClick={() => onPostpone(reservation.id)}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white flex-1 text-xs h-8"
          >
            <Calendar className="h-3.5 w-3.5 mr-1" />
            Reporter
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => onCancel(reservation.id)}
            className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white flex-1 text-xs h-8"
          >
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Annuler
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => onValidate(reservation.id)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white flex-1 text-xs h-8"
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Valider
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OverdueReservationModal;
