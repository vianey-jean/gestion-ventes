/**
 * DepensesRepartitionChart - Répartition premium des dépenses
 * Affiche : total, nombre de catégories, plus grosse catégorie, part %, ainsi
 * qu'un pie chart et une légende détaillée avec pourcentages et barres.
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, TrendingDown, Layers, Crown, PieChart as PieIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { StablePieChart } from './StableCharts';
import { MONTHS } from '@/hooks/useComptabilite';

export interface DepensesRepartitionChartProps {
  data: { name: string; value: number }[];
  formatEuro: (value: number) => string;
  selectedMonth: number;
  selectedYear: number;
}

const PALETTE = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const DepensesRepartitionChart: React.FC<DepensesRepartitionChartProps> = ({
  data,
  formatEuro,
  selectedMonth,
  selectedYear,
}) => {
  const { total, top, sorted } = useMemo(() => {
    const filtered = (data || []).filter((d) => (d?.value || 0) > 0);
    const t = filtered.reduce((s, d) => s + (d.value || 0), 0);
    const s = [...filtered].sort((a, b) => b.value - a.value);
    return { total: t, top: s[0], sorted: s };
  }, [data]);

  const hasData = sorted.length > 0;

  return (
    <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.3)]">
      {/* Glow effects */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

      <CardHeader className="relative flex items-center justify-center pb-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/70 dark:bg-white/10 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/30"
        >
          <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
          <CardTitle className="text-xl font-semibold tracking-wide bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-300 dark:to-white bg-clip-text text-transparent text-center">
            Répartition des Dépenses
            <span className="block text-sm text-green-600 font-bold mt-1 opacity-80">
              {MONTHS[selectedMonth - 1]} {selectedYear}
            </span>
          </CardTitle>
        </motion.div>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {hasData ? (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatMini
                icon={<TrendingDown className="h-4 w-4" />}
                label="Total dépenses"
                value={formatEuro(total)}
                gradient="from-rose-500 to-red-600"
              />
              <StatMini
                icon={<Layers className="h-4 w-4" />}
                label="Catégories"
                value={String(sorted.length)}
                gradient="from-blue-500 to-cyan-600"
              />
              <StatMini
                icon={<Crown className="h-4 w-4" />}
                label="Top catégorie"
                value={top?.name || '—'}
                gradient="from-amber-500 to-orange-600"
              />
              <StatMini
                icon={<PieIcon className="h-4 w-4" />}
                label="Part du top"
                value={total > 0 ? `${((top!.value / total) * 100).toFixed(1)}%` : '0%'}
                gradient="from-fuchsia-500 to-purple-600"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
              {/* Chart */}
              <div className="lg:col-span-3">
                <StablePieChart data={data} formatEuro={formatEuro} />
              </div>

              {/* Légende détaillée */}
              <div className="lg:col-span-2 space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {sorted.map((d, i) => {
                  const pct = total > 0 ? (d.value / total) * 100 : 0;
                  const color = PALETTE[i % PALETTE.length];
                  return (
                    <motion.div
                      key={d.name}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-xl border border-white/10 bg-white/60 dark:bg-white/[0.04] p-3 backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="h-3 w-3 rounded-full shrink-0 shadow"
                            style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}80` }}
                          />
                          <span className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate capitalize">
                            {d.name}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-black text-gray-900 dark:text-white">
                            {formatEuro(d.value)}
                          </div>
                          <div className="text-[10px] font-bold text-gray-500">{pct.toFixed(1)}%</div>
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-gray-200/60 dark:bg-white/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: i * 0.05 }}
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                          }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-3">
            <PieIcon className="h-12 w-12 opacity-30" />
            <p>Aucune dépense enregistrée pour cette période</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const StatMini: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
}> = ({ icon, label, value, gradient }) => (
  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/60 dark:bg-white/[0.04] p-3 backdrop-blur-sm">
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gradient-to-r ${gradient} text-white text-[10px] font-black shadow`}>
      {icon}
      <span className="uppercase tracking-wide">{label}</span>
    </div>
    <div className="mt-2 text-base sm:text-lg font-black text-gray-900 dark:text-white truncate">
      {value}
    </div>
  </div>
);

export default DepensesRepartitionChart;
