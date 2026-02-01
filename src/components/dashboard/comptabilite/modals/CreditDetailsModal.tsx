/**
 * CreditDetailsModal - Modal affichant les détails du crédit (ventes)
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowUpCircle } from 'lucide-react';
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <ArrowUpCircle className="h-6 w-6" />
            Détails Crédit - {MONTHS[selectedMonth - 1]} {selectedYear}
          </DialogTitle>
          <DialogDescription>
            Total: {formatEuro(totalCredit)} ({monthlySales.length} ventes)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {monthlySales.length > 0 ? (
            monthlySales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
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
                <p className="text-lg font-bold text-green-600">
                  {formatEuro(sale.products && Array.isArray(sale.products) 
                    ? (sale.totalSellingPrice || 0) 
                    : sale.sellingPrice * sale.quantitySold)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">Aucune vente ce mois</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreditDetailsModal;
