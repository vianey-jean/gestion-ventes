/**
 * Alerte indisponibilité + conflit RDV — extraite de CommandeFormDialog
 */
import React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface Suggestion { heureDebut: string; heureFin: string; label: string; }

export interface IndisponibiliteAlertProps {
  availability: { disponible: boolean; message?: string; suggestions?: Suggestion[] };
  localRdvMode: boolean;
  rdvConflict: { busy: boolean; message?: string };
  onApplySuggestion: (s: Suggestion) => void;
}

const IndisponibiliteAlert: React.FC<IndisponibiliteAlertProps> = ({
  availability, localRdvMode, rdvConflict, onApplySuggestion,
}) => {
  return (
    <>
      {!availability.disponible && (
        <div className="p-4 rounded-xl border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 shadow">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-red-700 dark:text-red-300 text-sm">🚫 Créneau indisponible</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{availability.message}</p>
              {availability.suggestions && availability.suggestions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {availability.suggestions.map((s, i) => (
                    <button key={i} type="button"
                      onClick={() => onApplySuggestion(s)}
                      className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-semibold border border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800/50 transition"
                    >
                      ✅ {s.label} ({s.heureDebut} - {s.heureFin})
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {localRdvMode && rdvConflict.busy && (
        <div className="p-4 rounded-xl border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 shadow">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-red-700 dark:text-red-300 text-sm">🚫 Créneau RDV occupé</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{rdvConflict.message}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IndisponibiliteAlert;
