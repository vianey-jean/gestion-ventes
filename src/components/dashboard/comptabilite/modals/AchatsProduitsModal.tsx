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
              bg-gradient-to-br from-indigo-100 via-purple-100 to-indigo-50
              dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-indigo-500/10
              border border-indigo-200/60 dark:border-indigo-500/20
              shadow-[0_10px_40px_rgba(99,102,241,0.2)]">
              <Package className="h-6 w-6 text-indigo-600 dark:text-indigo-400 drop-shadow-lg" />
            </div>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent font-black text-xl sm:text-2xl">
              Achats Produits - {MONTHS[selectedMonth - 1]} {selectedYear}
            </span>
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-white/50 text-sm sm:text-base">
            Total: <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatEuro(achatsTotal)}</span> ({achatsProducts.length} achats)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {achatsProducts.length > 0 ? (
            achatsProducts.map((achat) => (
              <div
                key={achat.id}
                className="flex items-center justify-between p-4
                  bg-gray-50/80 dark:bg-white/[0.04]
                  border border-gray-200/60 dark:border-white/[0.08]
                  rounded-xl backdrop-blur-sm transition-all duration-300
                  hover:scale-[1.01] hover:border-indigo-300 dark:hover:border-indigo-500/20
                  shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/20">
                    <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white/90">
                      {achat.productDescription}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-white/40 mt-0.5">
                      {new Date(achat.date).toLocaleDateString('fr-FR')}
                      {achat.fournisseur && ` • ${achat.fournisseur}`}
                      {achat.quantity && ` • Qté: ${achat.quantity}`}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                  {formatEuro(achat.totalCost)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 dark:text-white/40 py-8">Aucun achat de produit ce mois</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AchatsProduitsModal;
