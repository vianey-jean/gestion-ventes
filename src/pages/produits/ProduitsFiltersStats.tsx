/**
 * ProduitsFiltersStats.tsx
 * Pills de filtres + 4 cartes statistiques pour la page Produits.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';

export type FilterType = 'tous' | 'perruque' | 'tissage' | 'extension' | 'autres' | 'indisponible';

interface FilterItem {
  key: FilterType;
  label: string;
  icon: React.ReactNode;
}

interface Props {
  products: Product[];
  filters: FilterItem[];
  activeFilter: FilterType;
  setActiveFilter: (f: FilterType) => void;
}

const countByFilter = (products: Product[], key: FilterType): number => {
  if (key === 'tous') return products.length;
  if (key === 'indisponible') {
    return products.filter(p =>
      (p.achats || []).some(a => a && a.disponible === false && (Number(a.quantity) || 0) > 0)
    ).length;
  }
  return products.filter(p => {
    const d = p.description.toLowerCase();
    if (key === 'perruque') return d.includes('perruque');
    if (key === 'tissage') return d.includes('tissage');
    if (key === 'extension') return d.includes('extension');
    if (key === 'autres') return !d.includes('perruque') && !d.includes('tissage') && !d.includes('extension');
    return false;
  }).length;
};

const ProduitsFiltersStats: React.FC<Props> = ({ products, filters, activeFilter, setActiveFilter }) => {
  const stats = [
    { label: 'Total Produits', value: products.length, gradient: 'from-violet-500 to-purple-600', shadow: 'violet' },
    { label: 'En Stock', value: products.filter(p => p.quantity > 0).length, gradient: 'from-emerald-500 to-teal-600', shadow: 'emerald' },
    { label: 'Rupture', value: products.filter(p => p.quantity === 0).length, gradient: 'from-red-500 to-rose-600', shadow: 'red' },
    { label: 'Valeur Stock', value: `${products.reduce((acc, p) => acc + p.purchasePrice * p.quantity, 0).toFixed(0)}€`, gradient: 'from-amber-500 to-orange-600', shadow: 'amber' },
  ];

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-wrap gap-2">
        {filters.map(f => (
          <Button
            key={f.key}
            variant="outline"
            onClick={() => setActiveFilter(f.key)}
            className={cn(
              'rounded-2xl font-bold transition-all duration-300 border-2 backdrop-blur-xl',
              activeFilter === f.key
                ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-transparent shadow-lg shadow-violet-500/25'
                : 'border-violet-200/30 dark:border-violet-800/30 hover:border-violet-400 bg-white/50 dark:bg-white/5'
            )}
          >
            {f.icon}
            <span className="ml-1.5">{f.label}</span>
            <Badge variant="secondary" className={cn(
              'ml-2 text-xs',
              activeFilter === f.key ? 'bg-white/20 text-white' : 'bg-violet-100 dark:bg-violet-900/30'
            )}>
              {countByFilter(products, f.key)}
            </Badge>
          </Button>
        ))}
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className={cn(
              'relative rounded-2xl p-4 overflow-hidden backdrop-blur-xl border border-white/10',
              'bg-gradient-to-br', stat.gradient,
              `shadow-xl shadow-${stat.shadow}-500/20`
            )}
          >
            <div className="absolute inset-0 bg-white/5" />
            <div className="relative">
              <p className="text-white/70 text-xs font-medium">{stat.label}</p>
              <p className="text-white text-2xl font-black mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default ProduitsFiltersStats;
