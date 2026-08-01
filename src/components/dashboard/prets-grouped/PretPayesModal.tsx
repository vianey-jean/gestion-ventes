/**
 * Modal Détails - Prêts Payés (soldés)
 */
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Percent } from 'lucide-react';
import PremiumLoading from '@/components/ui/premium-loading';
import { GroupedPrets, formatCurrency } from './pretUtils';

interface PretPayesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pretsPayes: number;
  totalPrets: number;
  paidGroups: GroupedPrets[];
  loading?: boolean;
}

const PretPayesModal: React.FC<PretPayesModalProps> = ({
  open, onOpenChange, pretsPayes, totalPrets, paidGroups, loading = false
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-900 dark:to-purple-950/30">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg">
            <CheckCircle className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Détails - Prêts Soldés
          </span>
        </DialogTitle>
      </DialogHeader>
      {loading ? (
        <PremiumLoading text="Chargement des prêts soldés…" size="md" variant="dashboard" />
      ) : (
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200/50 dark:border-purple-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-purple-700 dark:text-purple-400">Prêts Soldés</span>
                </div>
                <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">{pretsPayes}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border border-orange-200/50 dark:border-orange-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-xs text-orange-700 dark:text-orange-400">En Attente</span>
                </div>
                <p className="text-2xl font-bold text-orange-800 dark:text-orange-300">{totalPrets - pretsPayes}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 border border-emerald-200/50 dark:border-emerald-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs text-emerald-700 dark:text-emerald-400">Taux</span>
                </div>
                <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                  {totalPrets > 0 ? ((pretsPayes / totalPrets) * 100).toFixed(0) : 0}%
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Progression</span>
                <span className="text-lg font-bold text-purple-600">{pretsPayes}/{totalPrets}</span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${totalPrets > 0 ? (pretsPayes / totalPrets) * 100 : 0}%` }}
                />
              </div>
            </div>

            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mt-4 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Clients Entièrement Soldés
            </h3>
            <div className="space-y-2">
              {paidGroups.map(group => (
                <div
                  key={group.nom}
                  className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{group.nom}</span>
                      <p className="text-xs text-gray-500">
                        {group.prets.length} prêt{group.prets.length > 1 ? 's' : ''} soldé{group.prets.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-700 dark:text-purple-400 font-bold">{formatCurrency(group.totalPrixVente)}</p>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 text-xs">
                      100% payé
                    </Badge>
                  </div>
                </div>
              ))}
              {paidGroups.length === 0 && (
                <p className="text-center text-gray-500 py-4">Aucun client entièrement soldé</p>
              )}
            </div>
          </div>
        </ScrollArea>
      )}
    </DialogContent>
  </Dialog>
);

export default PretPayesModal;
