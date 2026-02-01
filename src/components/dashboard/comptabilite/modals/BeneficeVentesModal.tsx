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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-600">
            <TrendingUp className="h-6 w-6" />
            Détails Bénéfice Ventes - {MONTHS[selectedMonth - 1]} {selectedYear}
          </DialogTitle>
          <DialogDescription>
            Total: {formatEuro(salesProfit)} ({salesCount} ventes)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {monthlySales.length > 0 ? (
            monthlySales.map((sale) => {
              const profit = sale.products && Array.isArray(sale.products) 
                ? (sale.totalProfit || 0) 
                : sale.profit;
              return (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {sale.products && Array.isArray(sale.products) 
                        ? sale.products.map((p: any) => p.description).join(', ')
                        : sale.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(sale.date).toLocaleDateString('fr-FR')}
                      {sale.clientName && ` - ${sale.clientName}`}
                    </p>
                  </div>
                  <p className={`text-lg font-bold ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatEuro(profit)}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 py-8">Aucune vente ce mois</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BeneficeVentesModal;
