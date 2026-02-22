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
      case 'achat_produit': return 'bg-blue-500/20 border-blue-500/20';
      case 'taxes': return 'bg-red-500/20 border-red-500/20';
      case 'carburant': return 'bg-orange-500/20 border-orange-500/20';
      default: return 'bg-purple-500/20 border-purple-500/20';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] shadow-[0_32px_80px_rgba(0,0,0,0.5)] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-red-400">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/20 backdrop-blur-sm">
              <ArrowDownCircle className="h-6 w-6 text-red-400" />
            </div>
            <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent font-black text-xl">
              Détails Débit - {MONTHS[selectedMonth - 1]} {selectedYear}
            </span>
          </DialogTitle>
          <DialogDescription className="text-white/50">
            Total: <span className="font-bold text-red-400">{formatEuro(totalDebit)}</span> ({achats.length} opérations)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {achats.length > 0 ? (
            achats.map((achat) => (
              <div key={achat.id} className="flex items-center justify-between p-4 bg-white/[0.04] border border-white/[0.08] rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:border-red-500/20">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${getTypeClass(achat.type)}`}>
                    {getTypeIcon(achat.type)}
                  </div>
                  <div>
                    <p className="font-semibold text-white/90">
                      {achat.productDescription || achat.description}
                    </p>
                    <p className="text-sm text-white/40 mt-0.5">
                      {new Date(achat.date).toLocaleDateString('fr-FR')}
                      {achat.type === 'achat_produit' && ` - Qté: ${achat.quantity}`}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-black text-red-400">
                  {formatEuro(achat.totalCost)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-white/40 py-8">Aucun débit ce mois</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DebitDetailsModal;
