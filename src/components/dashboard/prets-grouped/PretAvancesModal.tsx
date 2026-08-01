/**
 * Modal Détails - Avances Reçues
 */
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Wallet, DollarSign, Percent, Users } from 'lucide-react';
import PremiumLoading from '@/components/ui/premium-loading';
import { GroupedPrets, formatCurrency } from './pretUtils';

interface PretAvancesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAvances: number;
  totalVentes: number;
  groupedPrets: GroupedPrets[];
  loading?: boolean;
}

const PretAvancesModal: React.FC<PretAvancesModalProps> = ({
  open, onOpenChange, totalAvances, totalVentes, groupedPrets, loading = false
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/30">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Détails - Avances Reçues
          </span>
        </DialogTitle>
      </DialogHeader>
      {loading ? (
        <PremiumLoading text="Chargement des avances…" size="md" variant="default" />
      ) : (
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-blue-700 dark:text-blue-400">Total Avances</span>
                </div>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{formatCurrency(totalAvances)}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 border border-emerald-200/50 dark:border-emerald-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs text-emerald-700 dark:text-emerald-400">Taux de Paiement</span>
                </div>
                <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                  {totalVentes > 0 ? ((totalAvances / totalVentes) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>

            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mt-4 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Avances par Client
            </h3>
            <div className="space-y-2">
              {groupedPrets.map(group => (
                <div
                  key={group.nom}
                  className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                      {group.nom.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{group.nom}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-700 dark:text-blue-400 font-bold">{formatCurrency(group.totalAvance)}</p>
                    <p className="text-xs text-gray-500">
                      {group.totalPrixVente > 0 ? ((group.totalAvance / group.totalPrixVente) * 100).toFixed(0) : 0}% payé
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      )}
    </DialogContent>
  </Dialog>
);

export default PretAvancesModal;
