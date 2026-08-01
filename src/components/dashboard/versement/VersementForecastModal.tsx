/**
 * Modale Prévision 30 jours (reste de droit)
 */
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ShieldCheck } from 'lucide-react';
import PremiumLoading from '@/components/ui/premium-loading';
import { ForecastRow, formatAmount, formatDateFR } from './versementUtils';

interface VersementForecastModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forecast: ForecastRow[];
  reste: number;
  maxMonthly: number;
  loading?: boolean;
}

const VersementForecastModal: React.FC<VersementForecastModalProps> = ({
  open, onOpenChange, forecast, reste, maxMonthly, loading = false
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          Reste de droit sur les 30 prochains jours
        </DialogTitle>
      </DialogHeader>
      {loading ? (
        <PremiumLoading text="Calcul de la prévision…" size="md" variant="tendances" />
      ) : (
        <>
          <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-200/50 mb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="text-xs uppercase font-bold text-emerald-700 dark:text-emerald-300 tracking-wider">Disponible aujourd'hui</div>
                <div className="text-3xl font-extrabold text-emerald-800 dark:text-emerald-200">{formatAmount(reste)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase font-bold text-emerald-700 dark:text-emerald-300 tracking-wider">Plafond mensuel</div>
                <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{formatAmount(maxMonthly)}</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-emerald-200/50">
            <Table>
              <TableHeader>
                <TableRow className="bg-emerald-50 dark:bg-emerald-900/20">
                  <TableHead className="font-bold text-emerald-700 dark:text-emerald-300">Date</TableHead>
                  <TableHead className="text-right font-bold text-emerald-700 dark:text-emerald-300">Libéré ce jour</TableHead>
                  <TableHead className="text-right font-bold text-emerald-700 dark:text-emerald-300">Disponible total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forecast.map((row, i) => (
                  <TableRow key={i} className={row.libere > 0 ? 'bg-emerald-50/40 dark:bg-emerald-900/10' : ''}>
                    <TableCell className="font-medium">{formatDateFR(row.date.toISOString())}</TableCell>
                    <TableCell className="text-right font-bold text-emerald-700 dark:text-emerald-300">
                      {row.libere > 0 ? `+${formatAmount(row.libere)}` : '—'}
                    </TableCell>
                    <TableCell className="text-right font-extrabold">{formatAmount(row.disponible)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </DialogContent>
  </Dialog>
);

export default VersementForecastModal;
