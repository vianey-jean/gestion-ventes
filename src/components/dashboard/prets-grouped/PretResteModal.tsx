/**
 * Modal Détails - Reste à Payer
 */
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, DollarSign, Users } from 'lucide-react';
import PremiumLoading from '@/components/ui/premium-loading';
import { GroupedPrets, formatCurrency } from './pretUtils';

interface PretResteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalReste: number;
  pendingGroups: GroupedPrets[];
  loading?: boolean;
}

const PretResteModal: React.FC<PretResteModalProps> = ({
  open, onOpenChange, totalReste, pendingGroups, loading = false
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-900 dark:to-orange-950/30">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
            <Clock className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Détails - Reste à Payer
          </span>
        </DialogTitle>
      </DialogHeader>
      {loading ? (
        <PremiumLoading text="Chargement des impayés…" size="md" variant="default" />
      ) : (
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border border-orange-200/50 dark:border-orange-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  <span className="text-xs text-orange-700 dark:text-orange-400">Montant Restant</span>
                </div>
                <p className="text-2xl font-bold text-orange-800 dark:text-orange-300">{formatCurrency(totalReste)}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border border-amber-200/50 dark:border-amber-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-amber-600" />
                  <span className="text-xs text-amber-700 dark:text-amber-400">Clients en Attente</span>
                </div>
                <p className="text-2xl font-bold text-amber-800 dark:text-amber-300">{pendingGroups.length}</p>
              </div>
            </div>

            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mt-4 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Montants en Attente par Client
            </h3>
            <div className="space-y-2">
              {pendingGroups.map(group => (
                <div
                  key={group.nom}
                  className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-orange-50/80 to-red-50/80 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-100 dark:border-orange-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                      {group.nom.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{group.nom}</span>
                      <p className="text-xs text-gray-500">{group.prets.filter(p => !p.estPaye).length} prêt(s) en attente</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-700 dark:text-orange-400 font-bold">{formatCurrency(group.totalReste)}</p>
                    <p className="text-xs text-gray-500">sur {formatCurrency(group.totalPrixVente)}</p>
                  </div>
                </div>
              ))}
              {pendingGroups.length === 0 && (
                <p className="text-center text-gray-500 py-4">Aucun paiement en attente 🎉</p>
              )}
            </div>
          </div>
        </ScrollArea>
      )}
    </DialogContent>
  </Dialog>
);

export default PretResteModal;
