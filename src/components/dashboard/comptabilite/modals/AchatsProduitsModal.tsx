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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white/10 backdrop-blur border border-white/40 shadow-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-indigo-400">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 backdrop-blur-sm">
              <Package className="h-6 w-6 text-indigo-400" />
            </div>
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-black text-xl">
              Achats Produits - {MONTHS[selectedMonth - 1]} {selectedYear}
            </span>
          </DialogTitle>
          <DialogDescription className="text-white/50">
            Total: <span className="font-bold text-indigo-400">{formatEuro(achatsTotal)}</span> ({achatsProducts.length} achats)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {achatsProducts.length > 0 ? (
            achatsProducts.map((achat) => (
              <div
                key={achat.id}
                className="flex items-center justify-between p-4 bg-white/[0.04] border border-white/[0.08] rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:border-indigo-500/20"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/20">
                    <Package className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white/90">
                      {achat.productDescription}
                    </p>
                    <p className="text-sm text-white/40 mt-0.5">
                      {new Date(achat.date).toLocaleDateString('fr-FR')}
                      {achat.fournisseur && ` • ${achat.fournisseur}`}
                      {achat.quantity && ` • Qté: ${achat.quantity}`}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-black text-indigo-400">
                  {formatEuro(achat.totalCost)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-white/40 py-8">Aucun achat de produit ce mois</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AchatsProduitsModal;
