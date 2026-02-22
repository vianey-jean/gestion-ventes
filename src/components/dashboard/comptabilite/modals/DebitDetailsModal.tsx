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
      case 'achat_produit': return <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'taxes': return <Receipt className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'carburant': return <Fuel className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      default: return <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    }
  };

  const getTypeClass = (type: string) => {
    switch (type) {
      case 'achat_produit': return 'bg-blue-100 dark:bg-blue-500/20 border-blue-200 dark:border-blue-500/20';
      case 'taxes': return 'bg-red-100 dark:bg-red-500/20 border-red-200 dark:border-red-500/20';
      case 'carburant': return 'bg-orange-100 dark:bg-orange-500/20 border-orange-200 dark:border-orange-500/20';
      default: return 'bg-purple-100 dark:bg-purple-500/20 border-purple-200 dark:border-purple-500/20';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto
        bg-gradient-to-br from-white/98 via-gray-50/98 to-gray-100/98
        dark:from-gray-900/98 dark:via-gray-800/98 dark:to-gray-900/98
        backdrop-blur-2xl
        border border-gray-200/60 dark:border-white/15
        shadow-[0_40px_120px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_120px_rgba(0,0,0,0.5)]
        rounded-2xl sm:rounded-3xl">

        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="relative p-3 rounded-2xl
              bg-gradient-to-br from-red-100 via-rose-100 to-red-50
              dark:from-red-500/20 dark:via-rose-500/20 dark:to-red-500/10
              border border-red-200/60 dark:border-red-500/20
              shadow-[0_10px_40px_rgba(239,68,68,0.2)]">
              <ArrowDownCircle className="h-6 w-6 text-red-600 dark:text-red-400 drop-shadow-lg" />
            </div>
            <span className="bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent font-black text-xl sm:text-2xl">
              Détails Débit - {MONTHS[selectedMonth - 1]} {selectedYear}
            </span>
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-white/50 text-sm sm:text-base">
            Total: <span className="font-bold text-red-600 dark:text-red-400">{formatEuro(totalDebit)}</span> ({achats.length} opérations)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {achats.length > 0 ? (
            achats.map((achat) => (
              <div
                key={achat.id}
                className="flex items-center justify-between p-4
                  bg-gray-50/80 dark:bg-white/[0.04]
                  border border-gray-200/60 dark:border-white/[0.08]
                  rounded-xl backdrop-blur-sm transition-all duration-300
                  hover:scale-[1.01] hover:border-red-300 dark:hover:border-red-500/20
                  shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${getTypeClass(achat.type)}`}>
                    {getTypeIcon(achat.type)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white/90">
                      {achat.productDescription || achat.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-white/40 mt-0.5">
                      {new Date(achat.date).toLocaleDateString('fr-FR')}
                      {achat.type === 'achat_produit' && ` - Qté: ${achat.quantity}`}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-black text-red-600 dark:text-red-400">
                  {formatEuro(achat.totalCost)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 dark:text-white/40 py-8">Aucun débit ce mois</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DebitDetailsModal;
