/**
 * AutresDepensesModal - Modal affichant les autres dépenses (hors achats produits)
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Receipt, Fuel, DollarSign } from 'lucide-react';
import { NouvelleAchat } from '@/types/comptabilite';
import { MONTHS } from '@/hooks/useComptabilite';

export interface AutresDepensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  achats: NouvelleAchat[];
  depensesTotal: number;
  selectedMonth: number;
  selectedYear: number;
  formatEuro: (value: number) => string;
}

const AutresDepensesModal: React.FC<AutresDepensesModalProps> = ({
  isOpen,
  onClose,
  achats,
  depensesTotal,
  selectedMonth,
  selectedYear,
  formatEuro
}) => {
  const depenses = achats.filter(a => a.type !== 'achat_produit');

  const getIcon = (type: string) => {
    switch (type) {
      case 'carburant': return <Fuel className="h-4 w-4 text-orange-400" />;
      case 'taxes': return <Receipt className="h-4 w-4 text-red-400" />;
      default: return <DollarSign className="h-4 w-4 text-purple-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'carburant': return 'Carburant';
      case 'taxes': return 'Taxes';
      default: return 'Autre';
    }
  };

  const getColorClasses = (type: string) => {
    switch (type) {
      case 'carburant':
        return { bg: 'bg-orange-500/20', border: 'border-orange-500/20', text: 'text-orange-400' };
      case 'taxes':
        return { bg: 'bg-red-500/20', border: 'border-red-500/20', text: 'text-red-400' };
      default:
        return { bg: 'bg-purple-500/20', border: 'border-purple-500/20', text: 'text-purple-400' };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] shadow-[0_32px_80px_rgba(0,0,0,0.5)] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-orange-400">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20 backdrop-blur-sm">
              <Receipt className="h-6 w-6 text-orange-400" />
            </div>
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent font-black text-xl">
              Autres Dépenses - {MONTHS[selectedMonth - 1]} {selectedYear}
            </span>
          </DialogTitle>
          <DialogDescription className="text-white/50">
            Total: <span className="font-bold text-orange-400">{formatEuro(depensesTotal)}</span> ({depenses.length} dépenses)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {depenses.length > 0 ? (
            depenses.map((depense) => {
              const colors = getColorClasses(depense.type);
              return (
                <div 
                  key={depense.id} 
                  className="flex items-center justify-between p-4 bg-white/[0.04] border border-white/[0.08] rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:border-orange-500/20"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${colors.bg} ${colors.border}`}>
                      {getIcon(depense.type)}
                    </div>
                    <div>
                      <p className="font-semibold text-white/90">
                        {depense.productDescription || depense.description}
                      </p>
                      <p className="text-sm text-white/40 mt-0.5">
                        {new Date(depense.date).toLocaleDateString('fr-FR')}
                        {' • '}
                        <span className="font-medium">{getTypeLabel(depense.type)}</span>
                        {depense.categorie && ` • ${depense.categorie}`}
                      </p>
                    </div>
                  </div>
                  <p className={`text-lg font-black ${colors.text}`}>
                    {formatEuro(depense.totalCost)}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="text-center text-white/40 py-8">Aucune autre dépense ce mois</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AutresDepensesModal;
