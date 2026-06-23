import React, { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  Calculator,
  BarChart4,
  FileSpreadsheet,
  Zap,
  Crown,
  Gem,
  Star,
  Calendar,
} from "lucide-react";

import { motion } from "framer-motion";

// Import modules
import ProfitLossStatement from "./accounting/ProfitLossStatement";
import ComptabiliteModule from "./comptabilite/ComptabiliteModule";
import SalesReport from "./reports/SalesReport";
import ProfitEvolution from "./reports/ProfitEvolution";
import StockRotation from "./reports/StockRotation";
import YearlyComparison from "./reports/YearlyComparison";

interface AdvancedDashboardProps {
  className?: string;
}

/* ================= PARTICLES ================= */
type Particle = {
  left: string;
  top: string;
  duration: number;
  delay: number;
  size: number;
};

const generateParticles = (count: number): Particle[] =>
  Array.from({ length: count }).map(() => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    duration: 3 + Math.random() * 4,
    delay: Math.random() * 2,
    size: 2 + Math.random() * 2,
  }));

const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState("inventory");
  const particles = useMemo(() => generateParticles(18), []);

  return (
    <div className={`space-y-6 md:space-y-10 ${className}`}>

      {/* ================= HERO HEADER STYLE RDV HERO ================= */}
      <motion.section
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="
          relative overflow-hidden rounded-[36px]
          border border-white/10 bg-black
          px-6 py-10 md:px-10 md:py-14
          shadow-[0_40px_140px_-30px_rgba(168,85,247,.5)]
        "
      >
        {/* BACKGROUND GLOWS */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">

          <motion.div
            className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-purple-600/20 blur-[140px]"
            animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
          />

          <motion.div
            className="absolute -bottom-40 -left-24 h-[480px] w-[480px] rounded-full bg-indigo-500/20 blur-[160px]"
            animate={{ x: [0, -30, 40, 0], y: [0, 40, -20, 0] }}
            transition={{ duration: 24, repeat: Infinity }}
          />
        </div>

        {/* GRID */}
        <div className="absolute inset-0 opacity-[0.25] bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* SCAN LINE */}
        <motion.div
          className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent blur-sm"
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />

        {/* PARTICLES */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((p, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-white/70"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
                scale: [0.5, 1.4, 0.5],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
              }}
            />
          ))}
        </div>

        {/* CONTENT HEADER */}
        <div className="relative z-10 text-center">

          {/* BADGE */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2 mb-6 backdrop-blur-xl"
          >
            <Crown className="h-5 w-5 text-purple-300" />
            <span className="font-semibold text-purple-100">
              Finance & Accounting Intelligence
            </span>
            <Star className="h-4 w-4 text-pink-300 animate-pulse" />
          </motion.div>

          {/* TITLE */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Comptabilité & Finances
            </span>
          </h1>

          {/* SUBTITLE */}
          <p className="mt-5 text-purple-100/70 max-w-3xl mx-auto">
            Analyse avancée, reporting intelligent et visualisation business en temps réel.
          </p>

          {/* LIVE STATUS */}
          <motion.div
            className="mt-6 inline-flex items-center gap-3 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-2"
            animate={{
              boxShadow: [
                "0 0 10px rgba(16,185,129,.2)",
                "0 0 25px rgba(16,185,129,.5)",
                "0 0 10px rgba(16,185,129,.2)",
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <motion.span
              className="h-2.5 w-2.5 rounded-full bg-emerald-400"
              animate={{ scale: [1, 1.6, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-sm font-bold text-emerald-200">
              DASHBOARD LIVE
            </span>
          </motion.div>
        </div>

        {/* BORDER EFFECT */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
      </motion.section>

      {/* ================= TABS ================= */}
     <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  {/* Navigation ultra-moderne */}
  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 h-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl rounded-xl sm:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-1.5 sm:p-2">
    
    <TabsTrigger
      value="inventory"
      className="group relative flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 md:gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:via-indigo-600 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-500 hover:shadow-xl rounded-lg sm:rounded-xl overflow-hidden w-full h-14 sm:h-16 md:h-16 py-2 px-2"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
        <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 group-data-[state=active]:bg-white/20 shrink-0">
          <Calculator className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
        </div>
        <span className="font-bold text-[10px] xs:text-xs sm:text-sm text-center leading-tight">
          Compta<span className="hidden md:inline">bilité</span>
        </span>
      </div>
    </TabsTrigger>

    <TabsTrigger
      value="accounting"
      className="group relative flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 md:gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:via-teal-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white transition-all duration-500 hover:shadow-xl rounded-lg sm:rounded-xl overflow-hidden w-full h-14 sm:h-16 md:h-16 py-2 px-2"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
        <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 group-data-[state=active]:bg-white/20 shrink-0">
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
        </div>
        <span className="font-bold text-[10px] xs:text-xs sm:text-sm text-center leading-tight">
          Finance<span className="hidden md:inline"> Pro</span>
        </span>
      </div>
    </TabsTrigger>

    <TabsTrigger
      value="reports"
      className="group relative flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 md:gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:via-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white transition-all duration-500 hover:shadow-xl rounded-lg sm:rounded-xl overflow-hidden w-full h-14 sm:h-16 md:h-16 py-2 px-2"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
        <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-br from-orange-500 to-red-500 group-data-[state=active]:bg-white/20 shrink-0">
          <BarChart4 className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
        </div>
        <span className="font-bold text-[10px] xs:text-xs sm:text-sm text-center leading-tight">
          Analytics<span className="hidden md:inline"> Pro</span>
        </span>
      </div>
    </TabsTrigger>

    <TabsTrigger
      value="yearly"
      className="group relative flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 md:gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:via-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-500 hover:shadow-xl rounded-lg sm:rounded-xl overflow-hidden w-full h-14 sm:h-16 md:h-16 py-2 px-2"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
        <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 group-data-[state=active]:bg-white/20 shrink-0">
          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
        </div>
        <span className="font-bold text-[10px] xs:text-xs sm:text-sm text-center leading-tight">
          Annuel<span className="hidden md:inline">le</span>
        </span>
      </div>
    </TabsTrigger>

  </TabsList>

  {/* ================= CONTENT ================= */}

  <TabsContent value="inventory" className="space-y-8 mt-10">
    <ComptabiliteModule />
  </TabsContent>

  <TabsContent value="accounting" className="space-y-8 mt-10">
    <ProfitLossStatement />
  </TabsContent>

  <TabsContent value="reports" className="space-y-8 mt-10">
    <SalesReport />
    <ProfitEvolution />
    <StockRotation />
  </TabsContent>

  <TabsContent value="yearly" className="space-y-8 mt-10">
    <YearlyComparison />
  </TabsContent>
</Tabs>
    </div>
  );
};

export default AdvancedDashboard;