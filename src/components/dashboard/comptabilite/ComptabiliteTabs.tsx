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
        <TabsTrigger value="historique" className="rounded-lg data-[state=active]:bg-white/20">
          📜 Historique
        </TabsTrigger>
        <TabsTrigger value="repartition" className="rounded-lg data-[state=active]:bg-white/20">
          📊 Répartition
        </TabsTrigger>
        <TabsTrigger value="evolution" className="rounded-lg data-[state=active]:bg-white/20">
          <BarChart3 className="h-4 w-4 mr-1" />
          Évolution
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
