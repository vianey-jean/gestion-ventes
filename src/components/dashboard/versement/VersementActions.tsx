/**
 * Actions principales de la modale Versement espèce
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings2, ShieldCheck, TrendingUp, Plus } from 'lucide-react';
import { formatAmount } from './versementUtils';

interface VersementActionsProps {
  maxMonthly: number;
  reste: number;
  totalWindow: number;
  count: number;
  onOpenPlafond: () => void;
  onOpenForecast: () => void;
  onOpenAdd: () => void;
}

const VersementActions: React.FC<VersementActionsProps> = ({
  maxMonthly, reste, totalWindow, count, onOpenPlafond, onOpenForecast, onOpenAdd
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
    <Button
      onClick={onOpenPlafond}
      className="group h-auto py-4 bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-[0_15px_40px_rgba(139,92,246,0.4)] rounded-2xl border border-violet-300/30"
    >
      <Settings2 className="h-5 w-5 mr-2" />
      <div className="text-left">
        <div className="text-xs opacity-90 font-medium">Plafond mensuel</div>
        <div className="font-extrabold">{formatAmount(maxMonthly)}</div>
      </div>
    </Button>

    <Button
      onClick={onOpenForecast}
      className="group h-auto py-4 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-[0_15px_40px_rgba(16,185,129,0.4)] rounded-2xl border border-emerald-300/30"
    >
      <ShieldCheck className="h-5 w-5 mr-2" />
      <div className="text-left">
        <div className="text-xs opacity-90 font-medium">Reste de droit</div>
        <div className="font-extrabold">{formatAmount(reste)}</div>
      </div>
    </Button>

    <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border border-amber-200 dark:border-amber-700/40 shadow-inner">
      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
        <TrendingUp className="h-4 w-4" />
        Total fenêtre
      </div>
      <div className="text-xl font-extrabold text-amber-800 dark:text-amber-200 mt-1">
        {formatAmount(totalWindow)}
      </div>
      <div className="text-[10px] text-amber-600 dark:text-amber-300/80">{count} versement(s)</div>
    </div>

    <Button
      onClick={onOpenAdd}
      className="group h-auto py-4 bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-[0_15px_40px_rgba(244,63,94,0.4)] rounded-2xl border border-rose-300/30"
    >
      <Plus className="h-5 w-5 mr-2" />
      <span className="font-extrabold">Nouveau versement</span>
    </Button>
  </div>
);

export default VersementActions;
