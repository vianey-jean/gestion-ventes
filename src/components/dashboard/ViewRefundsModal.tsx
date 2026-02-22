import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RotateCcw, Euro, Package, Calendar } from 'lucide-react';
import remboursementApiService from '@/services/api/remboursementApi';
import PremiumLoading from '@/components/ui/premium-loading';

interface ViewRefundsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ViewRefundsModal: React.FC<ViewRefundsModalProps> = ({ isOpen, onClose }) => {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRefunds();
    }
  }, [isOpen]);

  const loadRefunds = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const data = await remboursementApiService.getByMonth(now.getMonth() + 1, now.getFullYear());
      setRefunds(data);
    } catch (error) {
      console.error('Erreur chargement remboursements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('fr-FR');

  const totalRefunds = refunds.reduce((sum, r) => sum + (r.totalRefundPrice || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto bg-white/10 backdrop-blur border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.3)] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 backdrop-blur-sm">
              <RotateCcw className="h-5 w-5 text-amber-400" />
            </div>
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent font-black">
              Remboursements du mois
            </span>
          </DialogTitle>
          <DialogDescription className="text-white/50">
            Liste des remboursements effectués ce mois-ci
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <PremiumLoading text="Chargement..." size="sm" variant="ventes" />
        ) : refunds.length === 0 ? (
          <div className="text-center py-8">
            <RotateCcw className="h-12 w-12 mx-auto text-white/20 mb-3" />
            <p className="text-white/40">Aucun remboursement ce mois-ci</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Total */}
            <div className="p-4 bg-amber-500/[0.06] border border-amber-500/20 rounded-xl backdrop-blur-sm flex justify-between items-center">
              <span className="font-bold text-amber-400">
                Total: {refunds.length} remboursement(s)
              </span>
              <span className="font-black text-lg text-amber-400">
                {formatCurrency(totalRefunds)}
              </span>
            </div>

            {refunds.map((refund) => (
              <div key={refund.id} className="p-4 bg-white/[0.04] border border-white/[0.08] rounded-xl backdrop-blur-sm space-y-2 transition-all duration-300 hover:border-amber-500/20">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-white/90">{refund.clientName || 'Client inconnu'}</span>
                  <div className="flex items-center gap-1 text-xs text-white/40">
                    <Calendar className="h-3 w-3" />
                    {formatDate(refund.date)}
                  </div>
                </div>
                {refund.products?.map((p: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-white/[0.03] border border-white/[0.06] rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5">
                      <Package className="h-3 w-3 text-blue-400" />
                      <span className="text-white/70">{p.description}</span>
                      <span className="text-white/40">x{p.quantityRefunded}</span>
                    </div>
                    <span className="font-black text-amber-400">{formatCurrency(p.totalRefundPrice)}</span>
                  </div>
                ))}
                <div className="flex justify-end">
                  <span className="font-black text-amber-400">
                    {formatCurrency(refund.totalRefundPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewRefundsModal;
