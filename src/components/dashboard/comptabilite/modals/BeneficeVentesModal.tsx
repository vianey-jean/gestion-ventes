/**
 * BeneficeVentesModal - Modal affichant les détails du bénéfice des ventes
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TrendingUp } from 'lucide-react';
import { Sale } from '@/types/sale';
import { MONTHS } from '@/hooks/useComptabilite';

export interface BeneficeVentesModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlySales: Sale[];
  salesProfit: number;
  salesCount: number;
  selectedMonth: number;
  selectedYear: number;
  formatEuro: (value: number) => string;
}

const BeneficeVentesModal: React.FC<BeneficeVentesModalProps> = ({
  isOpen,
  onClose,
  monthlySales,
  salesProfit,
  salesCount,
  selectedMonth,
  selectedYear,
  formatEuro
}) => {
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
              bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-50
              dark:from-blue-500/20 dark:via-indigo-500/20 dark:to-blue-500/10
              border border-blue-200/60 dark:border-blue-500/20
              shadow-[0_10px_40px_rgba(59,130,246,0.2)]">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400 drop-shadow-lg" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent font-black text-xl sm:text-2xl">
              Détails Bénéfice Ventes - {MONTHS[selectedMonth - 1]} {selectedYear}
            </span>
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-white/50 text-sm sm:text-base">
            Total: <span className="font-bold text-blue-600 dark:text-blue-400">{formatEuro(salesProfit)}</span> ({salesCount} ventes)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {monthlySales.length > 0 ? (
            monthlySales.map((sale) => {
              const profit = sale.products && Array.isArray(sale.products)
                ? (sale.totalProfit || 0)
                : sale.profit;
              return (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-4
                    bg-gray-50/80 dark:bg-white/[0.04]
                    border border-gray-200/60 dark:border-white/[0.08]
                    rounded-xl backdrop-blur-sm transition-all duration-300
                    hover:scale-[1.01] hover:border-blue-300 dark:hover:border-blue-500/20
                    shadow-sm hover:shadow-md"
                >
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white/90">
                      {sale.products && Array.isArray(sale.products)
                        ? sale.products.map((p: any) => p.description).join(', ')
                        : sale.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-white/40 mt-0.5">
                      {new Date(sale.date).toLocaleDateString('fr-FR')}
                      {sale.clientName && ` - ${sale.clientName}`}
                    </p>
                  </div>
                  <p className={`text-lg font-black ${profit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatEuro(profit)}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-400 dark:text-white/40 py-8">Aucune vente ce mois</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BeneficeVentesModal;
