/**
 * BeneficeReelModal - Modal affichant les détails du bénéfice réel
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Wallet } from 'lucide-react';
import { ComptabiliteData } from '@/types/comptabilite';
import { MONTHS } from '@/hooks/useComptabilite';

export interface BeneficeReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  comptabiliteData: ComptabiliteData;
  selectedMonth: number;
  selectedYear: number;
  formatEuro: (value: number) => string;
}

const BeneficeReelModal: React.FC<BeneficeReelModalProps> = ({
  isOpen,
  onClose,
  comptabiliteData,
  selectedMonth,
  selectedYear,
  formatEuro
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${comptabiliteData.beneficeReel >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            <Wallet className="h-6 w-6" />
            Détails Bénéfice Réel - {MONTHS[selectedMonth - 1]} {selectedYear}
          </DialogTitle>
          <DialogDescription>
            Bénéfice Réel = Bénéfice Ventes - (Achats + Dépenses)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {/* Résumé */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
              <p className="text-sm text-blue-600 font-medium">Bénéfice Ventes</p>
              <p className="text-xl font-bold text-blue-700">{formatEuro(comptabiliteData.salesProfit)}</p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
              <p className="text-sm text-red-600 font-medium">Total Dépenses</p>
              <p className="text-xl font-bold text-red-700">{formatEuro(comptabiliteData.achatsTotal + comptabiliteData.depensesTotal)}</p>
            </div>
            <div className={`p-4 rounded-lg text-center ${comptabiliteData.beneficeReel >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <p className={`text-sm font-medium ${comptabiliteData.beneficeReel >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>Bénéfice Réel</p>
              <p className={`text-xl font-bold ${comptabiliteData.beneficeReel >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{formatEuro(comptabiliteData.beneficeReel)}</p>
            </div>
          </div>

          {/* Détails des dépenses */}
          <div className="border-t pt-4">
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Détail des dépenses</p>
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded">
                <span className="text-indigo-700 dark:text-indigo-300">Achats Produits</span>
                <span className="font-bold text-indigo-800 dark:text-indigo-200">{formatEuro(comptabiliteData.achatsTotal)}</span>
              </div>
              <div className="flex justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                <span className="text-orange-700 dark:text-orange-300">Autres Dépenses</span>
                <span className="font-bold text-orange-800 dark:text-orange-200">{formatEuro(comptabiliteData.depensesTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BeneficeReelModal;
