/**
 * SoldeNetModal - Modal affichant les détails du solde net
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PiggyBank, ArrowUpCircle, ArrowDownCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { ComptabiliteData } from '@/types/comptabilite';
import { MONTHS } from '@/hooks/useComptabilite';

export interface SoldeNetModalProps {
  isOpen: boolean;
  onClose: () => void;
  comptabiliteData: ComptabiliteData;
  selectedMonth: number;
  selectedYear: number;
  formatEuro: (value: number) => string;
}

const SoldeNetModal: React.FC<SoldeNetModalProps> = ({
  isOpen,
  onClose,
  comptabiliteData,
  selectedMonth,
  selectedYear,
  formatEuro
}) => {
  const ratio = comptabiliteData.totalCredit > 0 
    ? (comptabiliteData.totalDebit / comptabiliteData.totalCredit) * 100 
    : 0;
  const healthyRatio = ratio <= 70;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${comptabiliteData.soldeNet >= 0 ? 'text-cyan-600' : 'text-red-600'}`}>
            <PiggyBank className="h-6 w-6" />
            Solde Net - {MONTHS[selectedMonth - 1]} {selectedYear}
          </DialogTitle>
          <DialogDescription>
            Solde Net = Total Crédit - Total Débit
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {/* Comparaison visuelle Crédit vs Débit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <ArrowUpCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">Total Crédit</p>
                    <p className="text-2xl font-bold text-green-700">{formatEuro(comptabiliteData.totalCredit)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <ArrowDownCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-red-600 font-medium">Total Débit</p>
                    <p className="text-2xl font-bold text-red-700">{formatEuro(comptabiliteData.totalDebit)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Solde final */}
          <Card className={`${comptabiliteData.soldeNet >= 0 ? 'bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-cyan-200 dark:border-cyan-800' : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800'}`}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${comptabiliteData.soldeNet >= 0 ? 'bg-cyan-500/20' : 'bg-red-500/20'}`}>
                    <PiggyBank className={`h-6 w-6 ${comptabiliteData.soldeNet >= 0 ? 'text-cyan-600' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${comptabiliteData.soldeNet >= 0 ? 'text-cyan-600' : 'text-red-600'}`}>Solde Net</p>
                    <p className={`text-3xl font-bold ${comptabiliteData.soldeNet >= 0 ? 'text-cyan-700' : 'text-red-700'}`}>{formatEuro(comptabiliteData.soldeNet)}</p>
                  </div>
                </div>
                {comptabiliteData.soldeNet >= 0 ? (
                  <div className="text-right">
                    <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" /> Positif
                    </span>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="text-red-600 text-sm font-medium flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> Négatif
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ratio dépenses/revenus */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-gray-700 dark:text-gray-300">Ratio Dépenses/Revenus</p>
              <span className={`text-sm font-bold ${healthyRatio ? 'text-green-600' : 'text-red-600'}`}>
                {ratio.toFixed(1)}%
              </span>
            </div>
            <Progress value={Math.min(ratio, 100)} className="h-3" />
            <p className="text-xs text-gray-500 mt-2">
              {healthyRatio 
                ? '✅ Ratio sain (moins de 70% des revenus dépensés)' 
                : '⚠️ Attention: plus de 70% des revenus sont dépensés'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SoldeNetModal;
