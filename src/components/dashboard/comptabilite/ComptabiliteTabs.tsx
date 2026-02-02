/**
 * ComptabiliteTabs - Onglets du module comptabilité
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3 } from 'lucide-react';
import AchatsHistoriqueList from './AchatsHistoriqueList';
import DepensesRepartitionChart from './DepensesRepartitionChart';
import EvolutionMensuelleChart from './EvolutionMensuelleChart';
import { NouvelleAchat } from '@/types/comptabilite';
import { MONTHS } from '@/hooks/useComptabilite';

export interface BarChartData {
  name: string;
  beneficeVentes: number;
  depenses: number;
  beneficeReel: number;
}

export interface PieChartData {
  name: string;
  value: number;
}

export interface ComptabiliteTabsProps {
  achats: NouvelleAchat[];
  monthlyChartData: BarChartData[];
  depensesRepartition: PieChartData[];
  selectedMonth: number;
  selectedYear: number;
  formatEuro: (value: number) => string;
}

const ComptabiliteTabs: React.FC<ComptabiliteTabsProps> = ({
  achats,
  monthlyChartData,
  depensesRepartition,
  selectedMonth,
  selectedYear,
  formatEuro
}) => {
  return (
    <Tabs defaultValue="historique" className="w-full">
<TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm rounded-xl p-1">
  {/* Historique */}
  <TabsTrigger
    value="historique"
    className="relative group flex items-center justify-center gap-2 rounded-lg data-[state=active]:bg-white/20"
  >
    <span>📜</span>
    <span className="hidden sm:inline">Historique</span>

    {/* Tooltip */}
    <span
      className="
        pointer-events-none
        absolute -top-9 left-1/2 -translate-x-1/2
        rounded-md bg-red-600 px-2 py-1
        text-xs text-white
        opacity-0 scale-95
        transition
        group-hover:opacity-100 group-hover:scale-100
        group-focus:opacity-100 group-focus:scale-100
        sm:hidden
      "
    >
      Historique
    </span>
  </TabsTrigger>

  {/* Répartition */}
  <TabsTrigger
    value="repartition"
    className="relative group flex items-center justify-center gap-2 rounded-lg data-[state=active]:bg-white/20"
  >
    <span>📊</span>
    <span className="hidden sm:inline">Répartition</span>

    <span
      className="
        pointer-events-none
        absolute -top-9 left-1/2 -translate-x-1/2
        rounded-md bg-red-600 px-2 py-1
        text-xs text-white
        opacity-0 scale-95
        transition
        group-hover:opacity-100 group-hover:scale-100
        group-focus:opacity-100 group-focus:scale-100
        sm:hidden
      "
    >
      Répartition
    </span>
  </TabsTrigger>

  {/* Évolution */}
  <TabsTrigger
    value="evolution"
    className="relative group flex items-center justify-center gap-2 rounded-lg data-[state=active]:bg-white/20"
  >
    <BarChart3 className="h-4 w-4" />
    <span className="hidden sm:inline">Évolution</span>

    <span
      className="
        pointer-events-none
        absolute -top-9 left-1/2 -translate-x-1/2
        rounded-md bg-red-600 px-2 py-1
        text-xs text-white
        opacity-0 scale-95
        transition
        group-hover:opacity-100 group-hover:scale-100
        group-focus:opacity-100 group-focus:scale-100
        sm:hidden
      "
    >
      Évolution
    </span>
  </TabsTrigger>
</TabsList>


      <TabsContent value="historique" className="mt-6">
        <AchatsHistoriqueList
          achats={achats}
          formatEuro={formatEuro}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          months={MONTHS}
        />
      </TabsContent>

      <TabsContent value="repartition" className="mt-6">
        <DepensesRepartitionChart
          data={depensesRepartition}
          formatEuro={formatEuro}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      </TabsContent>

      <TabsContent value="evolution" className="mt-6">
        <EvolutionMensuelleChart
          data={monthlyChartData}
          formatEuro={formatEuro}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ComptabiliteTabs;
