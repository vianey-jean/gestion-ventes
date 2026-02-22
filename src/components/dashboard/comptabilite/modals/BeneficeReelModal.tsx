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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white/30 backdrop-blur border border-white/30 shadow-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-3 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            <div className={`p-2.5 rounded-xl border backdrop-blur-sm ${isPositive ? 'bg-gradient-to-br from-emerald-500/20 to-green-500/20 border-emerald-500/20' : 'bg-gradient-to-br from-red-500/20 to-rose-500/20 border-red-500/20'}`}>
              <Wallet className="h-6 w-6" />
            </div>
            <span className={`bg-gradient-to-r ${isPositive ? 'from-emerald-400 to-green-400' : 'from-red-400 to-rose-400'} bg-clip-text text-transparent font-black text-xl`}>
              Détails Bénéfice Réel - {MONTHS[selectedMonth - 1]} {selectedYear}
            </span>
          </DialogTitle>
          <DialogDescription className="text-white/50">
            Bénéfice Réel = Bénéfice Ventes - (Achats + Dépenses)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {/* Résumé */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-blue-500/[0.08] border border-blue-500/20 rounded-xl backdrop-blur-sm text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <p className="text-sm text-blue-400 font-medium">Bénéfice Ventes</p>
              </div>
              <p className="text-xl font-black text-blue-400">{formatEuro(comptabiliteData.salesProfit)}</p>
            </div>
            <div className="p-4 bg-red-500/[0.08] border border-red-500/20 rounded-xl backdrop-blur-sm text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-red-400" />
                <p className="text-sm text-red-400 font-medium">Total Dépenses</p>
              </div>
              <p className="text-xl font-black text-red-400">{formatEuro(comptabiliteData.achatsTotal + comptabiliteData.depensesTotal)}</p>
            </div>
            <div className={`p-4 rounded-xl backdrop-blur-sm text-center border ${isPositive ? 'bg-emerald-500/[0.08] border-emerald-500/20' : 'bg-red-500/[0.08] border-red-500/20'}`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Wallet className={`h-4 w-4 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`} />
                <p className={`text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>Bénéfice Réel</p>
              </div>
              <p className={`text-xl font-black ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>{formatEuro(comptabiliteData.beneficeReel)}</p>
            </div>
          </div>

          {/* Détails des dépenses */}
          <div className="border-t border-white/[0.06] pt-4">
            <p className="font-semibold text-white/70 mb-3">Détail des dépenses</p>
            <div className="space-y-2">
              <div className="flex justify-between p-3 bg-indigo-500/[0.06] border border-indigo-500/15 rounded-xl backdrop-blur-sm">
                <span className="text-indigo-300 flex items-center gap-2">
                  <Package className="h-4 w-4" /> Achats Produits
                </span>
                <span className="font-black text-indigo-400">{formatEuro(comptabiliteData.achatsTotal)}</span>
              </div>
              <div className="flex justify-between p-3 bg-orange-500/[0.06] border border-orange-500/15 rounded-xl backdrop-blur-sm">
                <span className="text-orange-300 flex items-center gap-2">
                  <Receipt className="h-4 w-4" /> Autres Dépenses
                </span>
                <span className="font-black text-orange-400">{formatEuro(comptabiliteData.depensesTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BeneficeReelModal;
