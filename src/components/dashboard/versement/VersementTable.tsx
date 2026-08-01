/**
 * Tableau des versements de la fenêtre glissante de 30 jours
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { CalendarClock, Calendar, Coins, Pencil, Trash2 } from 'lucide-react';
import PremiumLoading from '@/components/ui/premium-loading';
import { Versement, formatAmount, formatDateFR } from './versementUtils';

interface VersementTableProps {
  versements: Versement[];
  loading: boolean;
  periodStart: string;
  periodEnd: string;
  total: number;
  onEdit: (v: Versement) => void;
  onDelete: (id: string) => void;
}

const VersementTable: React.FC<VersementTableProps> = ({
  versements, loading, periodStart, periodEnd, total, onEdit, onDelete
}) => (
  <div className="mt-6 rounded-2xl overflow-hidden border border-amber-200/50 dark:border-amber-700/30 bg-white/70 dark:bg-gray-900/40">
    <div className="px-5 py-3 bg-gradient-to-r from-amber-100/80 to-yellow-100/80 dark:from-amber-900/30 dark:to-yellow-900/30 border-b border-amber-200/50 flex items-center gap-2">
      <CalendarClock className="h-5 w-5 text-amber-600" />
      <span className="font-bold text-amber-800 dark:text-amber-200">
        Du {formatDateFR(periodStart)} au {formatDateFR(periodEnd)}
      </span>
    </div>
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-amber-50/50 dark:bg-amber-900/20">
            <TableHead className="font-bold text-amber-700 dark:text-amber-300">Date</TableHead>
            <TableHead className="font-bold text-amber-700 dark:text-amber-300">Description</TableHead>
            <TableHead className="text-right font-bold text-amber-700 dark:text-amber-300">Montant</TableHead>
            <TableHead className="text-right font-bold text-amber-700 dark:text-amber-300">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="py-8">
                <PremiumLoading text="Chargement des versements…" size="md" variant="ventes" />
              </TableCell>
            </TableRow>
          ) : versements.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-full p-5 bg-gradient-to-br from-amber-200/60 to-yellow-200/60">
                    <Coins className="h-10 w-10 text-amber-600" />
                  </div>
                  <p className="text-amber-700 dark:text-amber-300 font-medium">
                    Aucun versement sur cette période
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            versements.map(v => (
              <TableRow key={v.id} className="hover:bg-amber-50/40 dark:hover:bg-amber-900/10 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-amber-500" />
                    {formatDateFR(v.date)}
                  </div>
                </TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">{v.description || '—'}</TableCell>
                <TableCell className="text-right font-extrabold text-amber-700 dark:text-amber-300">
                  {formatAmount(v.montant)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(v)}
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 mr-1"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(v.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
    <div className="px-5 py-4 bg-gradient-to-r from-amber-100/80 to-orange-100/80 dark:from-amber-900/30 dark:to-orange-900/30 border-t border-amber-200/50 flex justify-between items-center flex-wrap gap-2">
      <span className="text-sm font-bold text-amber-800 dark:text-amber-200">
        Nombre : {versements.length}
      </span>
      <span className="text-lg font-extrabold text-amber-800 dark:text-amber-200">
        Total : {formatAmount(total)}
      </span>
    </div>
  </div>
);

export default VersementTable;
