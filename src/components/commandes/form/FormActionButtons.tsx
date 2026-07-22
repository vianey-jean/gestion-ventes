/**
 * Boutons d'action du formulaire — extraits de CommandeFormDialog
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarClock } from 'lucide-react';

export interface FormActionButtonsProps {
  onCancel: () => void;
  localRdvMode: boolean;
  rdvConflictBusy: boolean;
  submittingRdv: boolean;
  rdvDate: string;
  horaire: string;
  clientNom: string;
  editingCommande: boolean;
  type: 'commande' | 'reservation' | 'rdv';
  availabilityDisponible: boolean;
}

const FormActionButtons: React.FC<FormActionButtonsProps> = ({
  onCancel, localRdvMode, rdvConflictBusy, submittingRdv,
  rdvDate, horaire, clientNom, editingCommande, type, availabilityDisponible,
}) => {
  return (
    <div className="flex justify-end gap-3 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}
        className="border-2 border-gray-300 dark:border-gray-700"
      >
        Annuler
      </Button>
      {localRdvMode ? (
        !rdvConflictBusy && (
          <Button type="submit"
            disabled={submittingRdv || !rdvDate || !horaire || !clientNom}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg disabled:opacity-50"
          >
            <CalendarClock className="mr-2 h-4 w-4" />
            Créer la commande (RDV)
          </Button>
        )
      ) : (
        <Button type="submit" disabled={!availabilityDisponible}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {editingCommande ? 'Modifier' : 'Créer'} la {type === 'commande' ? 'commande' : 'réservation'}
        </Button>
      )}
    </div>
  );
};

export default FormActionButtons;
