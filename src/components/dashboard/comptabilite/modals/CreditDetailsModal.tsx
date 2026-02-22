/**
 * CreditDetailsModal - Modal affichant les détails du crédit (ventes)
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowUpCircle, AlertTriangle } from 'lucide-react';
import { Sale } from '@/types/sale';
import { MONTHS } from '@/hooks/useComptabilite';

export interface CreditDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlySales: Sale[];
  totalCredit: number;
  selectedMonth: number;
  selectedYear: number;
  formatEuro: (value: number) => string;
}

const CreditDetailsModal: React.FC<CreditDetailsModalProps> = ({
  isOpen,
  onClose,
  monthlySales,
  totalCredit,
  selectedMonth,
  selectedYear,
  formatEuro
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white/10 backdrop-blur border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.3)] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-green-400">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 backdrop-blur-sm">
              <ArrowUpCircle className="h-6 w-6 text-green-400" />
            </div>
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent font-black text-xl">
              Détails Crédit - {MONTHS[selectedMonth - 1]} {selectedYear}
            </span>
          </DialogTitle>
          <DialogDescription className="text-white/50">
            Total: <span className="font-bold text-green-400">{formatEuro(totalCredit)}</span> ({monthlySales.length} ventes)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {monthlySales.length > 0 ? (
            monthlySales.map((sale) => {
              const saleTotal = sale.products && Array.isArray(sale.products)
                ? (sale.totalSellingPrice || 0)
                : sale.sellingPrice * sale.quantitySold;
              const isNegative = saleTotal < 0;
              const isRefund = sale.isRefund || isNegative;

              return (
                <div key={sale.id} className={`relative p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] ${isRefund
                  ? 'bg-red-500/[0.06] border-red-500/20 hover:border-red-500/30'
                  : 'bg-white/[0.04] border-white/[0.08] hover:border-green-500/20'
                  }`}>
                  {isRefund && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                      <span className="text-xs font-black text-red-400 uppercase tracking-wider">Remboursement</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-semibold ${isRefund ? 'text-red-300' : 'text-white/90'}`}>
                        {sale.products && Array.isArray(sale.products)
                          ? sale.products.map((p: any) => p.description).join(', ')
                          : sale.description}
                      </p>
                      <p className="text-sm text-white/40 mt-1">
                        {new Date(sale.date).toLocaleDateString('fr-FR')}
                        {sale.clientName && ` - ${sale.clientName}`}
                      </p>
                    </div>
                    <p className={`text-lg font-black ${isRefund || isNegative ? 'text-red-400' : 'text-green-400'}`}>
                      {formatEuro(saleTotal)}
                    </p>
                  </div>
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

export default CreditDetailsModal;
