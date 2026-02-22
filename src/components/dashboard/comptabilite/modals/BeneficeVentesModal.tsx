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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white/30 backdrop-blur border border-white/25 shadow-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-blue-400">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 backdrop-blur-sm">
              <TrendingUp className="h-6 w-6 text-blue-400" />
            </div>
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent font-black text-xl">
              Détails Bénéfice Ventes - {MONTHS[selectedMonth - 1]} {selectedYear}
            </span>
          </DialogTitle>
          <DialogDescription className="text-white/50">
            Total: <span className="font-bold text-blue-400">{formatEuro(salesProfit)}</span> ({salesCount} ventes)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {monthlySales.length > 0 ? (
            monthlySales.map((sale) => {
              const profit = sale.products && Array.isArray(sale.products)
                ? (sale.totalProfit || 0)
                : sale.profit;
              return (
                <div key={sale.id} className="flex items-center justify-between p-4 bg-white/[0.04] border border-white/[0.08] rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:border-blue-500/20">
                  <div>
                    <p className="font-semibold text-white/90">
                      {sale.products && Array.isArray(sale.products)
                        ? sale.products.map((p: any) => p.description).join(', ')
                        : sale.description}
                    </p>
                    <p className="text-sm text-white/40 mt-0.5">
                      {new Date(sale.date).toLocaleDateString('fr-FR')}
                      {sale.clientName && ` - ${sale.clientName}`}
                    </p>
                  </div>
                  <p className={`text-lg font-black ${profit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                    {formatEuro(profit)}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="text-center text-white/40 py-8">Aucune vente ce mois</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BeneficeVentesModal;
