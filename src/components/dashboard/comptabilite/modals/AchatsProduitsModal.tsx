/**
 * AchatsProduitsModal - Modal affichant les détails des achats produits
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Package } from 'lucide-react';
import { NouvelleAchat } from '@/types/comptabilite';
import { MONTHS } from '@/hooks/useComptabilite';

export interface AchatsProduitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achats: NouvelleAchat[];
  achatsTotal: number;
  selectedMonth: number;
  selectedYear: number;
  formatEuro: (value: number) => string;
}

const AchatsProduitsModal: React.FC<AchatsProduitsModalProps> = ({
  isOpen,
  onClose,
  achats,
  achatsTotal,
  selectedMonth,
  selectedYear,
  formatEuro
}) => {
  const achatsProducts = achats.filter(a => a.type === 'achat_produit');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-indigo-600">
            <Package className="h-6 w-6" />
            Achats Produits - {MONTHS[selectedMonth - 1]} {selectedYear}
          </DialogTitle>
          <DialogDescription>
            Total: {formatEuro(achatsTotal)} ({achatsProducts.length} achats)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {achatsProducts.length > 0 ? (
            achatsProducts.map((achat) => (
              <div 
                key={achat.id} 
                className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/20">
                    <Package className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {achat.productDescription}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(achat.date).toLocaleDateString('fr-FR')}
                      {achat.fournisseur && ` • ${achat.fournisseur}`}
                      {achat.quantity && ` • Qté: ${achat.quantity}`}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-bold text-indigo-600">
                  {formatEuro(achat.totalCost)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">Aucun achat de produit ce mois</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AchatsProduitsModal;
