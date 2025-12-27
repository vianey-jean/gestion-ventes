import React, { useEffect, useState } from 'react';
import { Eye, TrendingUp, Target, Sparkles, BarChart3, Calendar, Coins } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { objectifApi, ObjectifData, ObjectifChange, BeneficeMensuel, MonthlyData } from '@/services/api/objectifApi';
import { cn } from '@/lib/utils';
import BeneficesHistoriqueModal from './modals/BeneficesHistoriqueModal';
import VentesHistoriqueModal from './modals/VentesHistoriqueModal';
import ObjectifChangesModal from './modals/ObjectifChangesModal';

interface ObjectifHistorique {
  currentData: ObjectifData;
  historique: MonthlyData[];
  objectifChanges: ObjectifChange[];
  beneficesHistorique: BeneficeMensuel[];
  annee: number;
}

const MOIS_NOMS = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Aout', 'Sep', 'Oct', 'Nov', 'Déc'
];

const ObjectifStatsModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<ObjectifHistorique | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showBeneficesModal, setShowBeneficesModal] = useState(false);
  const [showVentesModal, setShowVentesModal] = useState(false);
  const [showObjectifChangesModal, setShowObjectifChangesModal] = useState(false);

  const fetchHistorique = async () => {
    setLoading(true);
    try {
      const response = await objectifApi.getHistorique();
      setData(response as ObjectifHistorique);
    } catch (error) {
      console.error('Error fetching historique:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistorique();
    }
  }, [isOpen]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const chartData = data?.historique?.map((item) => ({
    name: MOIS_NOMS[item.mois - 1],
    ventes: item.totalVentesMois,
    objectif: item.objectif,
    pourcentage: item.pourcentage,
  })) || [];

  // Fill missing months with 0
  const fullYearData = MOIS_NOMS.map((nom, index) => {
    const existing = chartData.find((d) => d.name === nom);
    return existing || {
      name: nom,
      ventes: 0,
      objectif: data?.currentData?.objectif || 0,
      pourcentage: 0,
    };
  });

  const currentPercentage = data?.currentData 
    ? Math.round((data.currentData.totalVentesMois / data.currentData.objectif) * 100)
    : 0;

  const totalAnnuel = data?.historique?.reduce((sum, item) => sum + item.totalVentesMois, 0) || 0;
  const moyenneMensuelle = data?.historique?.length 
    ? Math.round(totalAnnuel / data.historique.length)
    : 0;
  
  // Calculate total benefices for the year
  const totalBeneficesAnnuel = data?.beneficesHistorique?.reduce((sum, b) => sum + b.totalBenefice, 0) || 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 hover:from-violet-500/30 hover:to-fuchsia-500/30 border border-violet-500/30 shadow-lg shadow-violet-500/10 transition-all duration-300 hover:scale-110"
          >
            <Eye className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950 border-violet-200/50 dark:border-violet-800/50">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Statistiques des Objectifs
              </span>
              <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-violet-200 dark:border-violet-800" />
                <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
              </div>
            </div>
          ) : data ? (
            <div className="space-y-6 pt-4">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  icon={<TrendingUp className="h-5 w-5" />}
                  label="Ventes du mois"
                  value={formatCurrency(data.currentData.totalVentesMois)}
                  gradient="from-emerald-500 to-teal-500"
                  shadowColor="emerald"
                />
                <StatCard
                  icon={<Target className="h-5 w-5" />}
                  label="Objectif du Mois encours"
                  value={formatCurrency(data.currentData.objectif)}
                  gradient="from-violet-500 to-purple-500"
                  shadowColor="violet"
                  onClick={() => setShowObjectifChangesModal(true)}
                  clickable
                />
                <StatCard
                  icon={<Sparkles className="h-5 w-5" />}
                  label="Performance"
                  value={`${currentPercentage}%`}
                  gradient={currentPercentage >= 100 ? "from-amber-500 to-orange-500" : "from-blue-500 to-cyan-500"}
                  shadowColor={currentPercentage >= 100 ? "amber" : "blue"}
                />
                <StatCard
                  icon={<Calendar className="h-5 w-5" />}
                  label="Total annuel"
                  value={formatCurrency(totalAnnuel)}
                  gradient="from-rose-500 to-pink-500"
                  shadowColor="rose"
                  onClick={() => setShowVentesModal(true)}
                  clickable
                />
              </div>

              {/* Progress Bar */}
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Progression du mois
                  </span>
                  <span className={cn(
                    "text-lg font-bold",
                    currentPercentage >= 100 ? "text-emerald-500" : currentPercentage >= 50 ? "text-amber-500" : "text-rose-500"
                  )}>
                    {currentPercentage}%
                  </span>
                </div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 ease-out",
                      currentPercentage >= 100 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500" 
                        : currentPercentage >= 50 
                          ? "bg-gradient-to-r from-amber-500 to-orange-500"
                          : "bg-gradient-to-r from-rose-500 to-pink-500"
                    )}
                    style={{ width: `${Math.min(currentPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Ventes par mois */}
                <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                    <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      Ventes Mensuelles {data.annee}
                    </span>
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={fullYearData}>
                        <defs>
                          <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#dc2626', fontWeight: 'bold', fontSize: 12 }}
                          stroke="#94a3b8"
                        />
                        <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                          }}
                          formatter={(value: number) => [formatCurrency(value), 'Ventes']}
                        />
                        <Area
                          type="monotone"
                          dataKey="ventes"
                          stroke="#10b981"
                          strokeWidth={3}
                          fill="url(#colorVentes)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pourcentage par mois */}
                <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-violet-500" />
                    <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                      Performance vs Objectif {data.annee}
                    </span>
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={fullYearData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#dc2626', fontWeight: 'bold', fontSize: 12 }}
                          stroke="#94a3b8"
                        />
                        <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v}%`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                          }}
                          formatter={(value: number) => [`${value}%`, 'Performance']}
                        />
                        <Line
                          type="monotone"
                          dataKey="pourcentage"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: '#8b5cf6' }}
                        />
                        {/* Ligne de référence 100% */}
                        <Line
                          type="monotone"
                          dataKey={() => 100}
                          stroke="#f59e0b"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    La ligne dorée représente l'objectif de 100%
                  </p>
                </div>
              </div>

              {/* Summary with Benefices */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-pink-500/10 border border-violet-200/50 dark:border-violet-800/50">
                <div className="flex flex-wrap justify-center gap-8 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Moyenne mensuelle</p>
                    <p className="text-xl font-bold text-violet-600 dark:text-violet-400">
                      {formatCurrency(moyenneMensuelle)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mois en cours</p>
                    <p className="text-xl font-bold text-fuchsia-600 dark:text-fuchsia-400">
                      {MOIS_NOMS[data.currentData.mois - 1]} {data.annee}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mois enregistrés</p>
                    <p className="text-xl font-bold text-pink-600 dark:text-pink-400">
                      {data.historique?.length || 0}
                    </p>
                  </div>
                  {/* New: Total des bénéfices de l'année - Cliquable */}
                  <div 
                    className="cursor-pointer group transition-all duration-300 hover:scale-105"
                    onClick={() => setShowBeneficesModal(true)}
                  >
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Coins className="h-3.5 w-3.5" />
                      Total bénéfices annuels
                    </p>
                    <p className={cn(
                      "text-xl font-bold flex items-center justify-center gap-1",
                      totalBeneficesAnnuel >= 0 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : "text-rose-600 dark:text-rose-400"
                    )}>
                      {formatCurrency(totalBeneficesAnnuel)}
                      <span className="text-xs text-muted-foreground group-hover:text-violet-500 transition-colors">
                        (voir détails)
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Aucune donnée disponible
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sub-modals */}
      {data && (
        <>
          <BeneficesHistoriqueModal
            isOpen={showBeneficesModal}
            onClose={() => setShowBeneficesModal(false)}
            beneficesHistorique={data.beneficesHistorique || []}
            annee={data.annee}
          />
          <VentesHistoriqueModal
            isOpen={showVentesModal}
            onClose={() => setShowVentesModal(false)}
            historique={data.historique || []}
            annee={data.annee}
          />
          <ObjectifChangesModal
            isOpen={showObjectifChangesModal}
            onClose={() => setShowObjectifChangesModal(false)}
            objectifChanges={data.objectifChanges || []}
            currentObjectif={data.currentData.objectif}
            annee={data.annee}
          />
        </>
      )}
    </>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
  shadowColor: string;
  onClick?: () => void;
  clickable?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  label, 
  value, 
  gradient, 
  shadowColor, 
  onClick,
  clickable = false 
}) => (
  <div 
    className={cn(
      "p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-xl transition-all duration-300",
      clickable && "cursor-pointer hover:scale-105 hover:shadow-2xl",
      `hover:shadow-${shadowColor}-500/20`
    )}
    onClick={clickable ? onClick : undefined}
  >
    <div className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br text-white",
      gradient
    )}>
      {icon}
    </div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <div className="flex items-center gap-1">
      <p className="text-lg font-bold mt-1">{value}</p>
      {clickable && (
        <span className="text-[10px] text-muted-foreground mt-1">→</span>
      )}
    </div>
  </div>
);

export default ObjectifStatsModal;
