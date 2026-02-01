/**
 * DebitDetailsModal - Modal affichant les détails du débit (achats/dépenses)
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowDownCircle, Package, Receipt, Fuel, DollarSign } from 'lucide-react';
import { NouvelleAchat } from '@/types/comptabilite';
import { MONTHS } from '@/hooks/useComptabilite';

export interface DebitDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achats: NouvelleAchat[];
  totalDebit: number;
  selectedMonth: number;
  selectedYear: number;
  formatEuro: (value: number) => string;
}

const DebitDetailsModal: React.FC<DebitDetailsModalProps> = ({
  isOpen,
  onClose,
  achats,
  totalDebit,
  selectedMonth,
  selectedYear,
  formatEuro
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'achat_produit': return <Package className="h-4 w-4 text-blue-400" />;
      case 'taxes': return <Receipt className="h-4 w-4 text-red-400" />;
      case 'carburant': return <Fuel className="h-4 w-4 text-orange-400" />;
      default: return <DollarSign className="h-4 w-4 text-purple-400" />;
    }
  };

  const getTypeClass = (type: string) => {
    switch (type) {
      case 'achat_produit': return 'bg-blue-500/20';
      case 'taxes': return 'bg-red-500/20';
      case 'carburant': return 'bg-orange-500/20';
      default: return 'bg-purple-500/20';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <ArrowDownCircle className="h-6 w-6" />
            Détails Débit - {MONTHS[selectedMonth - 1]} {selectedYear}
          </DialogTitle>
          <DialogDescription>
            Total: {formatEuro(totalDebit)} ({achats.length} opérations)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {achats.length > 0 ? (
            achats.map((achat) => (
              <div key={achat.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getTypeClass(achat.type)}`}>
                    {getTypeIcon(achat.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {achat.productDescription || achat.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(achat.date).toLocaleDateString('fr-FR')}
                      {achat.type === 'achat_produit' && ` - Qté: ${achat.quantity}`}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-bold text-red-600">
                  {formatEuro(achat.totalCost)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">Aucun débit ce mois</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DebitDetailsModal;
