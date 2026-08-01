/**
 * Modal Détails - Total Ventes
 */
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Package, Users } from 'lucide-react';
import PremiumLoading from '@/components/ui/premium-loading';
import { GroupedPrets, formatCurrency } from './pretUtils';

interface PretTotalVentesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalVentes: number;
  totalPrets: number;
  groupedPrets: GroupedPrets[];
  loading?: boolean;
}

const PretTotalVentesModal: React.FC<PretTotalVentesModalProps> = ({
  open, onOpenChange, totalVentes, totalPrets, groupedPrets, loading = false
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white to-emerald-50/50 dark:from-gray-900 dark:to-emerald-950/30">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Détails - Total Ventes
          </span>
        </DialogTitle>
      </DialogHeader>
      {loading ? (
        <PremiumLoading text="Chargement des ventes…" size="md" variant="ventes" />
      ) : (
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-200/50 dark:border-emerald-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs text-emerald-700 dark:text-emerald-400">Montant Total</span>
                </div>
                <p className="text-xl font-bold text-emerald-800 dark:text-emerald-300">{formatCurrency(totalVentes)}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-blue-700 dark:text-blue-400">Nombre de Prêts</span>
                </div>
                <p className="text-xl font-bold text-blue-800 dark:text-blue-300">{totalPrets}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200/50 dark:border-purple-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-purple-700 dark:text-purple-400">Clients</span>
                </div>
                <p className="text-xl font-bold text-purple-800 dark:text-purple-300">{groupedPrets.length}</p>
              </div>
            </div>

            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mt-4 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Répartition par Client
            </h3>
            <div className="space-y-2">
              {groupedPrets.map(group => (
                <div
                  key={group.nom}
                  className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                      {group.nom.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{group.nom}</span>
                      <p className="text-xs text-gray-500">{group.prets.length} prêt{group.prets.length > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-700 dark:text-emerald-400 font-bold">{formatCurrency(group.totalPrixVente)}</p>
                    {group.allPaid && (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 text-xs">
                        Soldé
                      </Badge>
                    )}
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

export default PretTotalVentesModal;
