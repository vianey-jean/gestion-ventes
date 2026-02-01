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
        return { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-600' };
      case 'taxes':
        return { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-600' };
      default:
        return { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-600' };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <Receipt className="h-6 w-6" />
            Autres Dépenses - {MONTHS[selectedMonth - 1]} {selectedYear}
          </DialogTitle>
          <DialogDescription>
            Total: {formatEuro(depensesTotal)} ({depenses.length} dépenses)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {depenses.length > 0 ? (
            depenses.map((depense) => {
              const colors = getColorClasses(depense.type);
              return (
                <div 
                  key={depense.id} 
                  className={`flex items-center justify-between p-3 ${colors.bg} rounded-lg border ${colors.border}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colors.bg}`}>
                      {getIcon(depense.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {depense.productDescription || depense.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(depense.date).toLocaleDateString('fr-FR')}
                        {' • '}
                        <span className="font-medium">{getTypeLabel(depense.type)}</span>
                        {depense.categorie && ` • ${depense.categorie}`}
                      </p>
                    </div>
                  </div>
                  <p className={`text-lg font-bold ${colors.text}`}>
                    {formatEuro(depense.totalCost)}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 py-8">Aucune autre dépense ce mois</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AutresDepensesModal;
