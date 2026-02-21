/**
 * =============================================================================
 * TendancesClientsTab - Onglet Analyse Clients
 * =============================================================================
 * 
 * Affiche les statistiques clients : top acheteurs, fréquence d'achat,
 * répartition du CA par client.
 * 
 * @module TendancesClientsTab
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ChartTooltip } from '@/components/ui/chart';
import { Users, Crown, TrendingUp, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

const clientColors = ['#8B5CF6', '#06D6A0', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#10B981', '#F97316', '#6366F1', '#14B8A6'];

interface ClientData {
  name: string;
  totalSpent: number;
  totalProfit: number;
  purchaseCount: number;
  avgBasket: number;
  lastPurchase: string;
}

interface TendancesClientsTabProps {
  clientsData: ClientData[];
}

const TendancesClientsTab: React.FC<TendancesClientsTabProps> = ({ clientsData }) => {
  const top10Clients = clientsData.slice(0, 10);
  const top5Pie = clientsData.slice(0, 5);
  const othersTotal = clientsData.slice(5).reduce((sum, c) => sum + c.totalSpent, 0);
  const pieData = othersTotal > 0 
    ? [...top5Pie.map(c => ({ name: c.name, value: c.totalSpent })), { name: 'Autres', value: othersTotal }]
    : top5Pie.map(c => ({ name: c.name, value: c.totalSpent }));

  return (
    <div className="space-y-6">
      {/* Top clients KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-none shadow-xl rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-violet-100 font-medium">Clients actifs</p>
                  <p className="text-3xl font-extrabold mt-1">{clientsData.length}</p>
                </div>
                <Users className="h-10 w-10 text-violet-200/60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-none shadow-xl rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-100 font-medium">Meilleur client</p>
                  <p className="text-lg font-extrabold mt-1 truncate max-w-[180px]">{top10Clients[0]?.name || 'N/A'}</p>
                  <p className="text-sm text-amber-100/80">{top10Clients[0]?.totalSpent.toLocaleString('fr-FR')} €</p>
                </div>
                <Crown className="h-10 w-10 text-amber-200/60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none shadow-xl rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-100 font-medium">Panier moyen global</p>
                  <p className="text-3xl font-extrabold mt-1">
                    {clientsData.length > 0
                      ? (clientsData.reduce((s, c) => s + c.avgBasket, 0) / clientsData.length).toFixed(0)
                      : 0} €
                  </p>
                </div>
                <ShoppingBag className="h-10 w-10 text-emerald-200/60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 clients - Bar chart */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Top 10 Clients par CA
            </CardTitle>
            <CardDescription>Les clients qui génèrent le plus de chiffre d'affaires</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full bg-white/50 dark:bg-gray-900/30 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10Clients} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} stroke="#64748b" />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-xl">
                            <p className="font-bold text-sm mb-2">{data.name}</p>
                            <p className="text-purple-600 text-sm">CA: {data.totalSpent.toLocaleString('fr-FR')} €</p>
                            <p className="text-emerald-600 text-sm">Bénéfice: {data.totalProfit.toLocaleString('fr-FR')} €</p>
                            <p className="text-blue-600 text-sm">Achats: {data.purchaseCount}x</p>
                            <p className="text-orange-600 text-sm">Panier moy: {data.avgBasket.toFixed(0)} €</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="totalSpent" fill="url(#clientGradient)" radius={[0, 6, 6, 0]} name="CA (€)" />
                  <defs>
                    <linearGradient id="clientGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Répartition CA par client - Pie chart */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Répartition du CA par Client
            </CardTitle>
            <CardDescription>Part de chaque client dans le chiffre d'affaires total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full bg-white/50 dark:bg-gray-900/30 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={120} paddingAngle={3} dataKey="value">
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={clientColors[idx % clientColors.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
                            <p className="font-bold text-sm">{payload[0].name}</p>
                            <p style={{ color: payload[0].color }} className="text-sm">
                              CA: {Number(payload[0].value).toLocaleString('fr-FR')} €
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau détaillé des clients */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Classement Complet des Clients
          </CardTitle>
          <CardDescription>Tous les clients classés par chiffre d'affaires</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2 font-bold text-gray-600 dark:text-gray-300">#</th>
                  <th className="text-left py-3 px-2 font-bold text-gray-600 dark:text-gray-300">Client</th>
                  <th className="text-right py-3 px-2 font-bold text-gray-600 dark:text-gray-300">CA Total</th>
                  <th className="text-right py-3 px-2 font-bold text-gray-600 dark:text-gray-300">Bénéfice</th>
                  <th className="text-right py-3 px-2 font-bold text-gray-600 dark:text-gray-300">Achats</th>
                  <th className="text-right py-3 px-2 font-bold text-gray-600 dark:text-gray-300">Panier Moy.</th>
                  <th className="text-right py-3 px-2 font-bold text-gray-600 dark:text-gray-300">Dernier Achat</th>
                </tr>
              </thead>
              <tbody>
                {clientsData.slice(0, 20).map((client, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-2.5 px-2">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        idx === 0 ? 'bg-amber-100 text-amber-700' :
                        idx === 1 ? 'bg-gray-100 text-gray-600' :
                        idx === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-50 text-gray-500'
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 font-semibold text-gray-900 dark:text-gray-100">{client.name}</td>
                    <td className="py-2.5 px-2 text-right font-bold text-purple-600">{client.totalSpent.toLocaleString('fr-FR')} €</td>
                    <td className="py-2.5 px-2 text-right font-semibold text-emerald-600">{client.totalProfit.toLocaleString('fr-FR')} €</td>
                    <td className="py-2.5 px-2 text-right text-blue-600 font-semibold">{client.purchaseCount}</td>
                    <td className="py-2.5 px-2 text-right text-orange-600 font-semibold">{client.avgBasket.toFixed(0)} €</td>
                    <td className="py-2.5 px-2 text-right text-gray-500 text-xs">{client.lastPurchase}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TendancesClientsTab;
