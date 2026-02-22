/**
 * BeneficeReelModal - Modal affichant les détails du bénéfice réel
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Wallet, TrendingUp, TrendingDown, Package, Receipt } from 'lucide-react';
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
  const isPositive = comptabiliteData.beneficeReel >= 0;

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
          <DialogTitle className={`flex items-center gap-3`}>
            <div className={`relative p-3 rounded-2xl border shadow-[0_10px_40px_rgba(0,0,0,0.1)] ${isPositive
              ? 'bg-gradient-to-br from-emerald-100 via-green-100 to-emerald-50 dark:from-emerald-500/20 dark:via-green-500/20 dark:to-emerald-500/10 border-emerald-200/60 dark:border-emerald-500/20'
              : 'bg-gradient-to-br from-red-100 via-rose-100 to-red-50 dark:from-red-500/20 dark:via-rose-500/20 dark:to-red-500/10 border-red-200/60 dark:border-red-500/20'
            }`}>
              <Wallet className={`h-6 w-6 drop-shadow-lg ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
            </div>
            <span className={`bg-gradient-to-r ${isPositive ? 'from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400' : 'from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400'} bg-clip-text text-transparent font-black text-xl sm:text-2xl`}>
              Détails Bénéfice Réel - {MONTHS[selectedMonth - 1]} {selectedYear}
            </span>
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-white/50 text-sm sm:text-base">
            Bénéfice Réel = Bénéfice Ventes - (Achats + Dépenses)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Résumé */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-blue-50/80 dark:bg-blue-500/[0.08] border border-blue-200/60 dark:border-blue-500/20 rounded-xl backdrop-blur-sm text-center shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">Bénéfice Ventes</p>
              </div>
              <p className="text-xl font-black text-blue-700 dark:text-blue-400">{formatEuro(comptabiliteData.salesProfit)}</p>
            </div>
            <div className="p-4 bg-red-50/80 dark:bg-red-500/[0.08] border border-red-200/60 dark:border-red-500/20 rounded-xl backdrop-blur-sm text-center shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">Total Dépenses</p>
              </div>
              <p className="text-xl font-black text-red-700 dark:text-red-400">{formatEuro(comptabiliteData.achatsTotal + comptabiliteData.depensesTotal)}</p>
            </div>
            <div className={`p-4 rounded-xl backdrop-blur-sm text-center border shadow-sm ${isPositive
              ? 'bg-emerald-50/80 dark:bg-emerald-500/[0.08] border-emerald-200/60 dark:border-emerald-500/20'
              : 'bg-red-50/80 dark:bg-red-500/[0.08] border-red-200/60 dark:border-red-500/20'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Wallet className={`h-4 w-4 ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
                <p className={`text-sm font-medium ${isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>Bénéfice Réel</p>
              </div>
              <p className={`text-xl font-black ${isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>{formatEuro(comptabiliteData.beneficeReel)}</p>
            </div>
          </div>

          {/* Détails des dépenses */}
          <div className="border-t border-gray-200/60 dark:border-white/[0.06] pt-4">
            <p className="font-semibold text-gray-700 dark:text-white/70 mb-3">Détail des dépenses</p>
            <div className="space-y-2">
              <div className="flex justify-between p-3 bg-indigo-50/80 dark:bg-indigo-500/[0.06] border border-indigo-200/50 dark:border-indigo-500/15 rounded-xl backdrop-blur-sm shadow-sm">
                <span className="text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                  <Package className="h-4 w-4" /> Achats Produits
                </span>
                <span className="font-black text-indigo-700 dark:text-indigo-400">{formatEuro(comptabiliteData.achatsTotal)}</span>
              </div>
              <div className="flex justify-between p-3 bg-orange-50/80 dark:bg-orange-500/[0.06] border border-orange-200/50 dark:border-orange-500/15 rounded-xl backdrop-blur-sm shadow-sm">
                <span className="text-orange-700 dark:text-orange-300 flex items-center gap-2">
                  <Receipt className="h-4 w-4" /> Autres Dépenses
                </span>
                <span className="font-black text-orange-700 dark:text-orange-400">{formatEuro(comptabiliteData.depensesTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BeneficeReelModal;
