
import React from 'react';
import Layout from '../components/Layout';
import SalesReport from '../components/dashboard/reports/SalesReport';
import ProfitEvolution from '../components/dashboard/reports/ProfitEvolution';
import AISalesPredictor from '../components/dashboard/ai/AISalesPredictor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const Tendances: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Tendances et Analyses</h1>
        </div>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reports">Rapports de Ventes</TabsTrigger>
            <TabsTrigger value="profit">Évolution des Profits</TabsTrigger>
            <TabsTrigger value="predictions">Prédictions IA</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            <SalesReport />
          </TabsContent>

          <TabsContent value="profit" className="space-y-6">
            <ProfitEvolution />
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <AISalesPredictor />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Tendances;
