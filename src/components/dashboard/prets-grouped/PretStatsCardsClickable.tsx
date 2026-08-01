/**
 * Stats Cards cliquables des Prêts Produits
 */
import React from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { TrendingUp, Wallet, Clock, CheckCircle, Eye } from 'lucide-react';
import PremiumLoading from '@/components/ui/premium-loading';
import { formatCurrency, StatModalType } from './pretUtils';

interface PretStatsCardsClickableProps {
  totalVentes: number;
  totalAvances: number;
  totalReste: number;
  pretsPayes: number;
  totalPrets: number;
  loading?: boolean;
  onOpenStat: (type: Exclude<StatModalType, null>) => void;
}

const PretStatsCardsClickable: React.FC<PretStatsCardsClickableProps> = ({
  totalVentes, totalAvances, totalReste, pretsPayes, totalPrets, loading = false, onOpenStat
}) => {
  if (loading) {
    return (
      <div className="mb-12">
        <PremiumLoading text="Chargement des statistiques…" size="md" variant="dashboard" />
      </div>
    );
  }

  const cards = [
    {
      key: 'totalVentes' as const,
      label: 'Total Ventes',
      value: formatCurrency(totalVentes),
      Icon: TrendingUp,
      card: 'from-emerald-500 to-emerald-600 group-hover:shadow-emerald-500/30',
      label_cls: 'text-emerald-100',
      hint_cls: 'text-emerald-200',
      delay: 0.1,
    },
    {
      key: 'avances' as const,
      label: 'Avances Reçues',
      value: formatCurrency(totalAvances),
      Icon: Wallet,
      card: 'from-blue-500 to-blue-600 group-hover:shadow-blue-500/30',
      label_cls: 'text-blue-100',
      hint_cls: 'text-blue-200',
      delay: 0.2,
    },
    {
      key: 'reste' as const,
      label: 'Reste à Payer',
      value: formatCurrency(totalReste),
      Icon: Clock,
      card: 'from-orange-500 to-red-500 group-hover:shadow-orange-500/30',
      label_cls: 'text-orange-100',
      hint_cls: 'text-orange-200',
      delay: 0.3,
    },
    {
      key: 'pretsPayes' as const,
      label: 'Prêts Payés',
      value: `${pretsPayes}/${totalPrets}`,
      Icon: CheckCircle,
      card: 'from-purple-500 to-purple-600 group-hover:shadow-purple-500/30',
      label_cls: 'text-purple-100',
      hint_cls: 'text-purple-200',
      delay: 0.4,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {cards.map(({ key, label, value, Icon, card, label_cls, hint_cls, delay }) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay, duration: 0.5 }}
          onClick={() => onOpenStat(key)}
          className="cursor-pointer group"
        >
          <Card className={`bg-gradient-to-br ${card} text-white border-none shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <p className={`${label_cls} text-sm`}>{label}</p>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
              </div>
              <div className={`flex items-center justify-center gap-1 text-xs ${hint_cls} opacity-0 group-hover:opacity-100 transition-opacity`}>
                <Eye className="h-3 w-3" />
                <span>Voir les détails</span>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default PretStatsCardsClickable;
