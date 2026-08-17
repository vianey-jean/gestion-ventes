import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TrendingUp,
  TrendingDown,
  Calculator,
  Eye,
  EyeOff,
  DollarSign,
  ShoppingCart,
  Target,
  ArrowUpRight,
  Receipt,
  BarChart3,
  ShoppingBag,
  Gem,
  Crown,
  Sparkles,
  Zap,
  Trophy,
  Star,
  Wallet,
  PiggyBank,
  Activity,
  ShieldCheck,
  LineChart,
  Percent,
  Layers3,
  CircleDollarSign,
  Gauge,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import { useApp } from "@/contexts/AppContext";
import useCurrencyFormatter from "@/hooks/use-currency-formatter";
import { Button } from "@/components/ui/button";
import { Sale } from "@/types";

/* =========================================================
   TYPES
========================================================= */

interface PeriodData {
  revenue: number;
  cost: number;
  profit: number;
  salesCount: number;
  totalProductsSold: number;
  avgOrderValue: number;
}

type ModalType =
  | "revenue"
  | "cost"
  | "profit"
  | "avgOrder"
  | "margin"
  | "salesCount"
  | "profitPerSale"
  | null;

/* =========================================================
   PARTICLES
========================================================= */

type Particle = {
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
};

const generateParticles = (count: number): Particle[] =>
  Array.from({ length: count }).map(() => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: 1.5 + Math.random() * 3,
    duration: 4 + Math.random() * 5,
    delay: Math.random() * 4,
  }));

/* =========================================================
   ANIMATION VARIANTS
========================================================= */

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const modalVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* =========================================================
   COMPONENT
========================================================= */

const ProfitLossStatement: React.FC = () => {
  const { allSales } = useApp();
  const { formatEuro } = useCurrencyFormatter();

  const [selectedPeriod, setSelectedPeriod] =
    useState<string>("current-month");

  const [showDetails, setShowDetails] = useState(false);

  const [activeModal, setActiveModal] =
    useState<ModalType>(null);

  const particles = useMemo(
    () => generateParticles(24),
    []
  );

  /* =========================================================
     SALE VALUES
  ========================================================= */

  const getSaleValues = (sale: Sale) => {
    if (
      sale.products &&
      Array.isArray(sale.products) &&
      sale.products.length > 0
    ) {
      const revenue =
        sale.totalSellingPrice ??
        sale.products.reduce(
          (sum, p) =>
            sum +
            (p.sellingPrice || 0) *
              (p.quantitySold || 0),
          0
        );

      const cost =
        sale.totalPurchasePrice ??
        sale.products.reduce(
          (sum, p) =>
            sum +
            (p.purchasePrice || 0) *
              (p.quantitySold || 0),
          0
        );

      const profit =
        sale.totalProfit ??
        sale.products.reduce(
          (sum, p) => sum + (p.profit || 0),
          0
        );

      const totalProductsSold =
        sale.products.reduce(
          (sum, p) =>
            sum + (p.quantitySold || 0),
          0
        );

      return {
        revenue,
        cost,
        profit,
        totalProductsSold,
      };
    }

    if (sale.sellingPrice !== undefined) {
      const revenue = sale.sellingPrice || 0;
      const cost = sale.purchasePrice || 0;

      const profit =
        sale.profit ??
        (revenue - cost);

      const totalProductsSold =
        sale.quantitySold || 0;

      return {
        revenue,
        cost,
        profit,
        totalProductsSold,
      };
    }

    return {
      revenue: 0,
      cost: 0,
      profit: 0,
      totalProductsSold: 0,
    };
  };

  /* =========================================================
     PERIOD CALCULATOR
  ========================================================= */

  const getPeriodDates = (period: string) => {
    const now = new Date();

    let startDate: Date;
    let endDate = new Date();

    switch (period) {
      case "current-month":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );
        break;

      case "last-month":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );

        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          0
        );
        break;

      case "current-quarter":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 2,
          1
        );
        break;

      case "current-year":
        startDate = new Date(
          now.getFullYear(),
          0,
          1
        );
        break;

      default:
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );
    }

    return {
      startDate,
      endDate,
    };
  };

  /* =========================================================
     PERIOD DATA
  ========================================================= */

  const calculatePeriodData = (
    period: string
  ): PeriodData => {
    const { startDate, endDate } =
      getPeriodDates(period);

    const periodSales = allSales.filter((sale) => {
      const saleDate = new Date(sale.date);

      return (
        saleDate >= startDate &&
        saleDate <= endDate
      );
    });

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalProductsSold = 0;

    periodSales.forEach((sale) => {
      const values = getSaleValues(sale);

      totalRevenue += values.revenue;
      totalCost += values.cost;
      totalProfit += values.profit;
      totalProductsSold +=
        values.totalProductsSold;
    });

    const salesCount =
      periodSales.length;

    const avgOrderValue =
      salesCount > 0
        ? totalRevenue / salesCount
        : 0;

    return {
      revenue: totalRevenue,
      cost: totalCost,
      profit: totalProfit,
      salesCount,
      totalProductsSold,
      avgOrderValue,
    };
  };

  /* =========================================================
     PERIOD SALES
  ========================================================= */

  const getPeriodSales = (period: string) => {
    const { startDate, endDate } =
      getPeriodDates(period);

    return allSales
      .filter((sale) => {
        const saleDate = new Date(sale.date);

        return (
          saleDate >= startDate &&
          saleDate <= endDate
        );
      })
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      );
  };

  /* =========================================================
     DATA
  ========================================================= */

  const currentData =
    calculatePeriodData(selectedPeriod);

  const previousPeriodData =
    selectedPeriod === "current-month"
      ? calculatePeriodData("last-month")
      : calculatePeriodData("current-month");

  const periodSales =
    getPeriodSales(selectedPeriod);

  /* =========================================================
     CALCULATIONS
  ========================================================= */

  const calculateChange = (
    current: number,
    previous: number
  ) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }

    return (
      ((current - previous) / previous) *
      100
    );
  };

  const profitMargin =
    currentData.revenue > 0
      ? (currentData.profit /
          currentData.revenue) *
        100
      : 0;

  const costPercentage =
    currentData.revenue > 0
      ? (currentData.cost /
          currentData.revenue) *
        100
      : 0;

  const revenueChange =
    calculateChange(
      currentData.revenue,
      previousPeriodData.revenue
    );

  const profitChange =
    calculateChange(
      currentData.profit,
      previousPeriodData.profit
    );

  const averageProfitPerSale =
    currentData.salesCount > 0
      ? currentData.profit /
        currentData.salesCount
      : 0;

  const productsPerSale =
    currentData.salesCount > 0
      ? currentData.totalProductsSold /
        currentData.salesCount
      : 0;

  /* =========================================================
     LABEL
  ========================================================= */

  const getPeriodLabel = (
    period: string
  ) => {
    switch (period) {
      case "current-month":
        return "Mois en cours";

      case "last-month":
        return "Mois dernier";

      case "current-quarter":
        return "Trimestre en cours";

      case "current-year":
        return "Année en cours";

      default:
        return "Période sélectionnée";
    }
  };

  /* =========================================================
     CHANGE COMPONENT
  ========================================================= */

  const formatChange = (
    change: number
  ) => {
    const isPositive = change >= 0;

    return (
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.7,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        className={`
          flex items-center gap-1
          rounded-full
          px-2 py-1
          ${
            isPositive
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-red-500/10 text-red-500"
          }
        `}
      >
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}

        <span className="text-[11px] font-black">
          {isPositive ? "+" : ""}
          {change.toFixed(1)}%
        </span>
      </motion.div>
    );
  };

  /* =========================================================
     METRIC CARD
  ========================================================= */

  const MetricCard = ({
    type,
    title,
    value,
    subtitle,
    icon: Icon,
    gradient,
    glow,
    change,
  }: {
    type: ModalType;
    title: string;
    value: string;
    subtitle: string;
    icon: React.ElementType;
    gradient: string;
    glow: string;
    change?: number;
  }) => (
    <motion.button
      type="button"
      variants={itemVariants}
      whileHover={{
        y: -8,
        scale: 1.015,
      }}
      whileTap={{
        scale: 0.98,
      }}
      onClick={() => setActiveModal(type)}
      className="
        group relative
        overflow-hidden
        rounded-[26px]
        border border-black/[0.06]
        bg-white/80
        p-5
        text-left
        shadow-[0_15px_45px_-20px_rgba(0,0,0,.25)]
        backdrop-blur-xl
        transition-all duration-500

        dark:border-white/[0.08]
        dark:bg-white/[0.035]
        dark:shadow-[0_20px_60px_-25px_rgba(0,0,0,.8)]
      "
    >
      {/* Ambient glow */}

      <motion.div
        className={`
          absolute -right-16 -top-16
          h-40 w-40
          rounded-full
          blur-3xl
          ${glow}
        `}
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Shimmer */}

      <motion.div
        className="
          absolute inset-y-0 -left-full
          w-1/3
          skew-x-[-20deg]
          bg-gradient-to-r
          from-transparent
          via-white/30
          to-transparent
        "
        animate={{
          left: [
            "-100%",
            "180%",
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatDelay: 4,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10">
        <div className="mb-5 flex items-start justify-between">
          <motion.div
            whileHover={{
              rotate: 8,
              scale: 1.1,
            }}
            className={`
              flex h-12 w-12
              items-center justify-center
              rounded-2xl
              bg-gradient-to-br
              ${gradient}
              text-white
              shadow-lg
            `}
          >
            <Icon className="h-5 w-5" />
          </motion.div>

          {change !== undefined &&
            formatChange(change)}
        </div>

        <p className="
          text-[11px]
          font-black
          uppercase
          tracking-[0.16em]
          text-gray-500
          dark:text-white/40
        ">
          {title}
        </p>

        <motion.p
          key={value}
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className={`
            mt-2
            text-2xl
            font-black
            tracking-tight
            bg-gradient-to-r
            ${gradient}
            bg-clip-text
            text-transparent
            sm:text-3xl
          `}
        >
          {value}
        </motion.p>

        <p className="
          mt-2
          text-xs
          font-medium
          text-gray-500
          dark:text-white/40
        ">
          {subtitle}
        </p>

        <div className="
          mt-5
          flex items-center justify-between
          border-t
          border-black/[0.06]
          pt-3
          dark:border-white/[0.06]
        ">
          <span className="
            text-[10px]
            font-bold
            uppercase
            tracking-wider
            text-gray-400
            transition-colors
            group-hover:text-gray-600
            dark:text-white/25
            dark:group-hover:text-white/60
          ">
            Explorer
          </span>

          <motion.div
            whileHover={{
              x: 4,
              y: -4,
            }}
          >
            <ArrowUpRight className="
              h-4 w-4
              text-gray-400
              transition-colors
              group-hover:text-gray-700
              dark:text-white/30
              dark:group-hover:text-white
            " />
          </motion.div>
        </div>
      </div>
    </motion.button>
  );

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="w-full"
    >
      <Card
        className="
          relative
          overflow-hidden
          border-0
          bg-white/90
          shadow-[0_30px_100px_-35px_rgba(0,0,0,.3)]
          backdrop-blur-2xl

          dark:bg-[#08080d]/90
          dark:shadow-[0_30px_100px_-35px_rgba(0,0,0,.8)]
        "
      >
        {/* =====================================================
            GLOBAL AMBIENT BACKGROUND
        ===================================================== */}

        <div className="
          pointer-events-none
          absolute inset-0
          overflow-hidden
        ">
          <motion.div
            className="
              absolute
              -right-32
              -top-32
              h-[450px]
              w-[450px]
              rounded-full
              bg-violet-500/10
              blur-[110px]
            "
            animate={{
              x: [0, 40, -20, 0],
              y: [0, -20, 30, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="
              absolute
              -bottom-40
              -left-32
              h-[400px]
              w-[400px]
              rounded-full
              bg-blue-500/10
              blur-[110px]
            "
            animate={{
              x: [0, -30, 40, 0],
              y: [0, 30, -20, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* GRID */}

          <div
            className="
              absolute inset-0
              opacity-[0.18]
              bg-[linear-gradient(rgba(0,0,0,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.04)_1px,transparent_1px)]
              bg-[size:50px_50px]
              dark:opacity-[0.12]
              dark:bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)]
            "
          />

          {/* PARTICLES */}

          {particles.map(
            (particle, index) => (
              <motion.span
                key={index}
                className="
                  absolute
                  rounded-full
                  bg-violet-400
                  shadow-[0_0_8px_rgba(139,92,246,.8)]
                "
                style={{
                  left: particle.left,
                  top: particle.top,
                  width: particle.size,
                  height: particle.size,
                }}
                animate={{
                  y: [0, -25, 0],
                  opacity: [0, 0.7, 0],
                  scale: [0.5, 1.4, 0.5],
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )
          )}
        </div>

        {/* =====================================================
            HEADER
        ===================================================== */}

        <CardHeader
          className="
            relative z-10
            border-b
            border-black/[0.06]
            px-5 py-6
            dark:border-white/[0.07]
            sm:px-8
            sm:py-8
          "
        >
          <div className="
            flex
            flex-col
            gap-6
            lg:flex-row
            lg:items-center
            lg:justify-between
          ">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{
                  rotate: 8,
                  scale: 1.08,
                }}
                className="
                  relative
                  flex h-14 w-14
                  shrink-0
                  items-center justify-center
                  rounded-2xl
                  bg-gradient-to-br
                  from-emerald-400
                  via-green-500
                  to-teal-600
                  text-white
                  shadow-[0_12px_30px_-8px_rgba(16,185,129,.7)]
                "
              >
                <Calculator className="h-6 w-6" />

                <motion.div
                  className="
                    absolute
                    inset-0
                    rounded-2xl
                    border
                    border-white/40
                  "
                  animate={{
                    opacity: [0.2, 0.8, 0.2],
                    scale: [1, 1.08, 1],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                  }}
                />
              </motion.div>

              <div>
                <div className="
                  mb-1
                  flex items-center gap-2
                ">
                  <Badge
                    className="
                      rounded-full
                      border-0
                      bg-emerald-500/10
                      px-2.5 py-1
                      text-[9px]
                      font-black
                      uppercase
                      tracking-[0.15em]
                      text-emerald-600
                      dark:text-emerald-300
                    "
                  >
                    <Activity className="mr-1 h-3 w-3" />
                    Finance Live
                  </Badge>

                  <motion.span
                    animate={{
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                    }}
                    className="
                      h-1.5 w-1.5
                      rounded-full
                      bg-emerald-400
                      shadow-[0_0_8px_rgba(52,211,153,.9)]
                    "
                  />
                </div>

                <CardTitle className="
                  text-2xl
                  font-black
                  tracking-tight
                  text-gray-900
                  dark:text-white
                  sm:text-3xl
                ">
                  Compte de Résultat
                </CardTitle>

                <CardDescription className="
                  mt-1
                  text-sm
                  text-gray-500
                  dark:text-white/40
                ">
                  Pilotage intelligent de vos revenus,
                  coûts et performances.
                </CardDescription>
              </div>
            </div>

            {/* HEADER STATUS */}

            <div className="
              flex
              flex-wrap
              items-center
              gap-2
            ">
              <div className="
                flex items-center gap-2
                rounded-full
                border
                border-black/[0.06]
                bg-black/[0.025]
                px-3 py-2
                dark:border-white/[0.07]
                dark:bg-white/[0.03]
              ">
                <ShieldCheck className="
                  h-4 w-4
                  text-blue-500
                " />

                <span className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-gray-500
                  dark:text-white/40
                ">
                  Données sécurisées
                </span>
              </div>

              <div className="
                flex items-center gap-2
                rounded-full
                border
                border-violet-500/10
                bg-violet-500/5
                px-3 py-2
              ">
                <Sparkles className="
                  h-4 w-4
                  text-violet-500
                " />

                <span className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-violet-600
                  dark:text-violet-300
                ">
                  Intelligence Pro
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <CardContent
          className="
            relative z-10
            space-y-8
            px-5
            py-7
            sm:px-8
            sm:py-9
          "
        >
          {/* ===================================================
              CONTROL BAR
          =================================================== */}

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="
              flex
              flex-col
              gap-4
              rounded-[24px]
              border
              border-black/[0.06]
              bg-white/70
              p-4
              shadow-sm
              backdrop-blur-xl
              dark:border-white/[0.07]
              dark:bg-white/[0.025]
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <motion.div variants={itemVariants}>
              <p className="
                mb-1
                text-[10px]
                font-black
                uppercase
                tracking-[0.18em]
                text-gray-400
                dark:text-white/30
              ">
                Période d'analyse
              </p>

              <Select
                value={selectedPeriod}
                onValueChange={setSelectedPeriod}
              >
                <SelectTrigger
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border-black/[0.07]
                    bg-white
                    font-bold
                    shadow-sm
                    dark:border-white/[0.08]
                    dark:bg-white/[0.04]
                    sm:w-56
                  "
                >
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="current-month">
                    Mois en cours
                  </SelectItem>

                  <SelectItem value="last-month">
                    Mois dernier
                  </SelectItem>

                  <SelectItem value="current-quarter">
                    Trimestre en cours
                  </SelectItem>

                  <SelectItem value="current-year">
                    Année en cours
                  </SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="
                flex
                items-center
                gap-3
              "
            >
              <div className="
                hidden
                items-center
                gap-2
                rounded-full
                border
                border-emerald-500/10
                bg-emerald-500/5
                px-3 py-2
                sm:flex
              ">
                <Gauge className="
                  h-4 w-4
                  text-emerald-500
                " />

                <span className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-emerald-600
                  dark:text-emerald-300
                ">
                  Analyse active
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setShowDetails(!showDetails)
                }
                className="
                  h-11
                  rounded-xl
                  border-black/[0.07]
                  bg-white
                  px-4
                  font-bold
                  shadow-sm
                  transition-all
                  hover:-translate-y-0.5
                  hover:shadow-lg
                  dark:border-white/[0.08]
                  dark:bg-white/[0.04]
                "
              >
                <AnimatePresence
                  mode="wait"
                  initial={false}
                >
                  {showDetails ? (
                    <motion.span
                      key="hide"
                      initial={{
                        opacity: 0,
                        x: -5,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: 5,
                      }}
                      className="flex items-center"
                    >
                      <EyeOff className="
                        mr-2 h-4 w-4
                      " />
                      Masquer détails
                    </motion.span>
                  ) : (
                    <motion.span
                      key="show"
                      initial={{
                        opacity: 0,
                        x: -5,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: 5,
                      }}
                      className="flex items-center"
                    >
                      <Eye className="
                        mr-2 h-4 w-4
                      " />
                      Voir détails
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </motion.div>

          {/* ===================================================
              PERIOD BADGE
          =================================================== */}

          <div className="
            flex
            items-center
            justify-center
          ">
            <motion.div
              key={selectedPeriod}
              initial={{
                opacity: 0,
                y: -8,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              className="
                relative
                overflow-hidden
                rounded-full
                border
                border-violet-500/15
                bg-gradient-to-r
                from-violet-500/10
                via-fuchsia-500/10
                to-pink-500/10
                px-5 py-2.5
                shadow-[0_8px_25px_-10px_rgba(139,92,246,.4)]
              "
            >
              <motion.div
                className="
                  absolute
                  inset-y-0
                  -left-full
                  w-1/3
                  skew-x-[-20deg]
                  bg-gradient-to-r
                  from-transparent
                  via-white/40
                  to-transparent
                "
                animate={{
                  left: [
                    "-100%",
                    "200%",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              />

              <div className="
                relative z-10
                flex items-center gap-2
              ">
                <CalendarIcon />

                <span className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.12em]
                  text-violet-600
                  dark:text-violet-300
                ">
                  {getPeriodLabel(
                    selectedPeriod
                  )}
                </span>
              </div>
            </motion.div>
          </div>

          {/* ===================================================
              MAIN METRICS
          =================================================== */}

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-3
            "
          >
            <MetricCard
              type="revenue"
              title="Chiffre d'affaires"
              value={formatEuro(
                currentData.revenue
              )}
              subtitle={`${currentData.totalProductsSold} produits vendus`}
              icon={DollarSign}
              gradient="from-blue-500 via-indigo-500 to-violet-600"
              glow="bg-blue-500/20"
              change={revenueChange}
            />

            <MetricCard
              type="cost"
              title="Coûts d'achat"
              value={formatEuro(
                currentData.cost
              )}
              subtitle={`${costPercentage.toFixed(
                1
              )}% du chiffre d'affaires`}
              icon={Receipt}
              gradient="from-red-500 via-orange-500 to-amber-500"
              glow="bg-orange-500/20"
            />

            <MetricCard
              type="profit"
              title="Bénéfice net"
              value={formatEuro(
                currentData.profit
              )}
              subtitle={`Marge ${profitMargin.toFixed(
                1
              )}%`}
              icon={Target}
              gradient="from-emerald-400 via-green-500 to-teal-600"
              glow="bg-emerald-500/20"
              change={profitChange}
            />
          </motion.div>

          {/* ===================================================
              PROFITABILITY BAR
          =================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.35,
              duration: 0.6,
            }}
            className="
              relative
              overflow-hidden
              rounded-[26px]
              border
              border-black/[0.06]
              bg-gradient-to-r
              from-slate-50
              via-white
              to-emerald-50
              p-5
              dark:border-white/[0.07]
              dark:from-white/[0.025]
              dark:via-white/[0.02]
              dark:to-emerald-500/[0.04]
            "
          >
            <div className="
              relative z-10
              flex
              flex-col
              gap-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            ">
              <div>
                <div className="
                  mb-2
                  flex items-center gap-2
                ">
                  <div className="
                    flex h-8 w-8
                    items-center justify-center
                    rounded-lg
                    bg-emerald-500/10
                  ">
                    <Percent className="
                      h-4 w-4
                      text-emerald-500
                    " />
                  </div>

                  <span className="
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.15em]
                    text-gray-500
                    dark:text-white/40
                  ">
                    Rentabilité
                  </span>
                </div>

                <p className="
                  text-2xl
                  font-black
                  text-gray-900
                  dark:text-white
                ">
                  {profitMargin.toFixed(1)}%
                </p>
              </div>

              <div className="
                flex-1
                sm:max-w-xl
              ">
                <div className="
                  mb-2
                  flex
                  items-center
                  justify-between
                ">
                  <span className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-gray-400
                  ">
                    Performance
                  </span>

                  <span className="
                    text-[10px]
                    font-black
                    text-emerald-500
                  ">
                    {profitMargin > 20
                      ? "EXCELLENTE"
                      : profitMargin > 10
                      ? "BONNE"
                      : "À AMÉLIORER"}
                  </span>
                </div>

                <div className="
                  h-3
                  overflow-hidden
                  rounded-full
                  bg-black/[0.06]
                  dark:bg-white/[0.07]
                ">
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${Math.min(
                        Math.max(
                          profitMargin,
                          0
                        ),
                        100
                      )}%`,
                    }}
                    transition={{
                      duration: 1.4,
                      delay: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="
                      relative
                      h-full
                      overflow-hidden
                      rounded-full
                      bg-gradient-to-r
                      from-emerald-400
                      via-green-500
                      to-teal-500
                      shadow-[0_0_15px_rgba(16,185,129,.45)]
                    "
                  >
                    <motion.div
                      className="
                        absolute
                        inset-y-0
                        left-0
                        w-1/3
                        bg-white/30
                        blur-sm
                      "
                      animate={{
                        x: [
                          "-100%",
                          "400%",
                        ],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ===================================================
              DETAILED METRICS
          =================================================== */}

          <AnimatePresence initial={false}>
            {showDetails && (
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0,
                  y: -15,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  y: -15,
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="overflow-hidden"
              >
                <div className="
                  space-y-8
                  border-t
                  border-black/[0.06]
                  pt-7
                  dark:border-white/[0.07]
                ">
                  {/* TITLE */}

                  <div className="
                    flex
                    items-center
                    justify-between
                  ">
                    <div className="
                      flex items-center gap-3
                    ">
                      <div className="
                        flex h-10 w-10
                        items-center justify-center
                        rounded-xl
                        bg-gradient-to-br
                        from-violet-500
                        to-fuchsia-600
                        text-white
                        shadow-lg
                      ">
                        <BarChart3 className="
                          h-5 w-5
                        " />
                      </div>

                      <div>
                        <h4 className="
                          text-sm
                          font-black
                          text-gray-800
                          dark:text-white
                        ">
                          Métriques détaillées
                        </h4>

                        <p className="
                          text-[10px]
                          text-gray-400
                          dark:text-white/30
                        ">
                          Vue avancée de votre activité
                        </p>
                      </div>
                    </div>

                    <Layers3 className="
                      h-5 w-5
                      text-violet-400
                    " />
                  </div>

                  {/* DETAIL CARDS */}

                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="
                      grid
                      grid-cols-2
                      gap-3
                      md:grid-cols-4
                    "
                  >
                    {/* PANIER */}

                    <DetailMetric
                      type="avgOrder"
                      icon={ShoppingBag}
                      title="Panier moyen"
                      value={formatEuro(
                        currentData.avgOrderValue
                      )}
                      gradient="from-purple-500 via-fuchsia-500 to-pink-500"
                      glow="bg-purple-500/20"
                    />

                    {/* MARGE */}

                    <DetailMetric
                      type="margin"
                      icon={Crown}
                      title="Marge brute"
                      value={`${profitMargin.toFixed(
                        1
                      )}%`}
                      gradient="from-amber-400 via-yellow-500 to-orange-500"
                      glow="bg-amber-500/20"
                    />

                    {/* VENTES */}

                    <DetailMetric
                      type="salesCount"
                      icon={Zap}
                      title="Nombre de ventes"
                      value={`${currentData.salesCount}`}
                      gradient="from-cyan-400 via-sky-500 to-teal-500"
                      glow="bg-cyan-500/20"
                    />

                    {/* PROFIT/VENTE */}

                    <DetailMetric
                      type="profitPerSale"
                      icon={Star}
                      title="Profit / vente"
                      value={formatEuro(
                        averageProfitPerSale
                      )}
                      gradient="from-rose-500 via-pink-500 to-red-500"
                      glow="bg-rose-500/20"
                    />
                  </motion.div>

                  {/* PERFORMANCE */}

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.3,
                    }}
                    className="
                      rounded-[26px]
                      border
                      border-black/[0.06]
                      bg-white/70
                      p-5
                      backdrop-blur-xl
                      dark:border-white/[0.07]
                      dark:bg-white/[0.025]
                    "
                  >
                    <div className="
                      mb-5
                      flex items-center gap-3
                    ">
                      <div className="
                        flex h-10 w-10
                        items-center justify-center
                        rounded-xl
                        bg-gradient-to-br
                        from-emerald-400
                        to-teal-600
                        text-white
                        shadow-lg
                      ">
                        <LineChart className="
                          h-5 w-5
                        " />
                      </div>

                      <div>
                        <h4 className="
                          text-sm
                          font-black
                          text-gray-800
                          dark:text-white
                        ">
                          Analyse de performance
                        </h4>

                        <p className="
                          text-[10px]
                          text-gray-400
                        ">
                          Indicateurs intelligents
                        </p>
                      </div>
                    </div>

                    <div className="
                      grid
                      grid-cols-1
                      gap-3
                      md:grid-cols-3
                    ">
                      <PerformanceRow
                        label="Rentabilité"
                        value={
                          profitMargin > 20
                            ? "Excellente"
                            : profitMargin > 10
                            ? "Bonne"
                            : "À améliorer"
                        }
                        color={
                          profitMargin > 20
                            ? "emerald"
                            : profitMargin > 10
                            ? "amber"
                            : "red"
                        }
                        percentage={Math.min(
                          Math.max(
                            profitMargin,
                            0
                          ),
                          100
                        )}
                      />

                      <PerformanceRow
                        label="Évolution du CA"
                        value={
                          revenueChange > 10
                            ? "Forte croissance"
                            : revenueChange > 0
                            ? "Croissance modérée"
                            : "En baisse"
                        }
                        color={
                          revenueChange > 10
                            ? "emerald"
                            : revenueChange > 0
                            ? "amber"
                            : "red"
                        }
                        percentage={Math.min(
                          Math.max(
                            Math.abs(
                              revenueChange
                            ),
                            0
                          ),
                          100
                        )}
                      />

                      <PerformanceRow
                        label="Volume de ventes"
                        value={
                          currentData.salesCount >
                          20
                            ? "Élevé"
                            : currentData.salesCount >
                              10
                            ? "Modéré"
                            : "Faible"
                        }
                        color={
                          currentData.salesCount >
                          20
                            ? "emerald"
                            : currentData.salesCount >
                              10
                            ? "amber"
                            : "red"
                        }
                        percentage={Math.min(
                          currentData.salesCount *
                            3,
                          100
                        )}
                      />
                    </div>

                    {/* EXTRA STATS */}

                    <div className="
                      mt-4
                      grid
                      grid-cols-2
                      gap-3
                      md:grid-cols-4
                    ">
                      <MiniStat
                        icon={Wallet}
                        label="CA"
                        value={formatEuro(
                          currentData.revenue
                        )}
                      />

                      <MiniStat
                        icon={Receipt}
                        label="Coûts"
                        value={formatEuro(
                          currentData.cost
                        )}
                      />

                      <MiniStat
                        icon={PiggyBank}
                        label="Profit"
                        value={formatEuro(
                          currentData.profit
                        )}
                      />

                      <MiniStat
                        icon={ShoppingCart}
                        label="Produits / vente"
                        value={productsPerSale.toFixed(
                          1
                        )}
                      />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* =====================================================
          MODALS
      ===================================================== */}

      <AnimatePresence>
        {activeModal && (
          <Dialog
            open={true}
            onOpenChange={(open) => {
              if (!open) {
                setActiveModal(null);
              }
            }}
          >
            <DialogContent
              className="
                max-h-[90vh]
                overflow-hidden
                rounded-[30px]
                border
                border-black/[0.08]
                bg-white/95
                p-0
                shadow-[0_40px_120px_-30px_rgba(0,0,0,.45)]
                backdrop-blur-2xl
                dark:border-white/[0.08]
                dark:bg-[#0b0b10]/95
                sm:max-w-2xl
              "
            >
              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
              >
                {activeModal ===
                  "revenue" && (
                  <RevenueModal
                    currentData={currentData}
                    periodSales={periodSales}
                    formatEuro={formatEuro}
                    getSaleValues={getSaleValues}
                    periodLabel={getPeriodLabel(
                      selectedPeriod
                    )}
                  />
                )}

                {activeModal === "cost" && (
                  <CostModal
                    currentData={currentData}
                    periodSales={periodSales}
                    formatEuro={formatEuro}
                    getSaleValues={getSaleValues}
                    periodLabel={getPeriodLabel(
                      selectedPeriod
                    )}
                  />
                )}

                {activeModal ===
                  "profit" && (
                  <ProfitModal
                    currentData={currentData}
                    periodSales={periodSales}
                    formatEuro={formatEuro}
                    getSaleValues={getSaleValues}
                    profitMargin={profitMargin}
                    periodLabel={getPeriodLabel(
                      selectedPeriod
                    )}
                  />
                )}

                {activeModal ===
                  "avgOrder" && (
                  <AverageOrderModal
                    currentData={currentData}
                    formatEuro={formatEuro}
                    periodLabel={getPeriodLabel(
                      selectedPeriod
                    )}
                  />
                )}

                {activeModal ===
                  "margin" && (
                  <MarginModal
                    currentData={currentData}
                    formatEuro={formatEuro}
                    profitMargin={profitMargin}
                    periodLabel={getPeriodLabel(
                      selectedPeriod
                    )}
                  />
                )}

                {activeModal ===
                  "salesCount" && (
                  <SalesCountModal
                    currentData={currentData}
                    periodLabel={getPeriodLabel(
                      selectedPeriod
                    )}
                  />
                )}

                {activeModal ===
                  "profitPerSale" && (
                  <ProfitPerSaleModal
                    currentData={currentData}
                    periodSales={periodSales}
                    formatEuro={formatEuro}
                    getSaleValues={getSaleValues}
                    periodLabel={getPeriodLabel(
                      selectedPeriod
                    )}
                  />
                )}
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* =========================================================
   CALENDAR ICON
========================================================= */

const CalendarIcon = () => (
  <motion.div
    animate={{
      rotate: [0, 5, -5, 0],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
    }}
  >
    <Activity className="
      h-4 w-4
      text-violet-500
    " />
  </motion.div>
);

/* =========================================================
   DETAIL METRIC
========================================================= */

const DetailMetric = ({
  type,
  icon: Icon,
  title,
  value,
  gradient,
  glow,
}: {
  type: ModalType;
  icon: React.ElementType;
  title: string;
  value: string;
  gradient: string;
  glow: string;
}) => {
  const [active, setActive] =
    useState(false);

  return (
    <motion.button
      type="button"
      variants={itemVariants}
      whileHover={{
        y: -6,
        scale: 1.025,
      }}
      whileTap={{
        scale: 0.97,
      }}
      onClick={() => setActive(true)}
      className="
        group
        relative
        overflow-hidden
        rounded-[22px]
        border
        border-black/[0.06]
        bg-white/70
        p-4
        text-center
        shadow-sm
        backdrop-blur-xl
        dark:border-white/[0.07]
        dark:bg-white/[0.025]
      "
    >
      <motion.div
        className={`
          absolute
          -right-8
          -top-8
          h-20
          w-20
          rounded-full
          blur-2xl
          ${glow}
        `}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.25, 0.5, 0.25],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
      />

      <div className="relative z-10">
        <motion.div
          whileHover={{
            rotate: 8,
            scale: 1.1,
          }}
          className={`
            mx-auto
            mb-3
            flex h-10 w-10
            items-center justify-center
            rounded-xl
            bg-gradient-to-br
            ${gradient}
            text-white
            shadow-lg
          `}
        >
          <Icon className="h-4 w-4" />
        </motion.div>

        <p className="
          text-[9px]
          font-black
          uppercase
          tracking-[0.12em]
          text-gray-400
          dark:text-white/35
        ">
          {title}
        </p>

        <p className={`
          mt-1
          text-lg
          font-black
          bg-gradient-to-r
          ${gradient}
          bg-clip-text
          text-transparent
        `}>
          {value}
        </p>

        <div className="
          mt-2
          text-[9px]
          font-bold
          text-gray-400
          opacity-0
          transition-opacity
          group-hover:opacity-100
          dark:text-white/30
        ">
          Voir détails →
        </div>
      </div>
    </motion.button>
  );
};

/* =========================================================
   PERFORMANCE ROW
========================================================= */

const PerformanceRow = ({
  label,
  value,
  color,
  percentage,
}: {
  label: string;
  value: string;
  color: "emerald" | "amber" | "red";
  percentage: number;
}) => {
  const colors = {
    emerald: {
      text: "text-emerald-500",
      bg: "bg-emerald-500",
      soft: "bg-emerald-500/10",
    },
    amber: {
      text: "text-amber-500",
      bg: "bg-amber-500",
      soft: "bg-amber-500/10",
    },
    red: {
      text: "text-red-500",
      bg: "bg-red-500",
      soft: "bg-red-500/10",
    },
  };

  const current = colors[color];

  return (
    <div className="
      rounded-2xl
      border
      border-black/[0.05]
      bg-gray-50/70
      p-4
      dark:border-white/[0.06]
      dark:bg-white/[0.025]
    ">
      <div className="
        mb-3
        flex
        items-center
        justify-between
      ">
        <span className="
          text-xs
          font-bold
          text-gray-600
          dark:text-white/50
        ">
          {label}
        </span>

        <span className={`
          rounded-full
          px-2 py-1
          text-[9px]
          font-black
          uppercase
          ${current.soft}
          ${current.text}
        `}>
          {value}
        </span>
      </div>

      <div className="
        h-2
        overflow-hidden
        rounded-full
        bg-black/[0.05]
        dark:bg-white/[0.06]
      ">
        <motion.div
          initial={{
            width: 0,
          }}
          animate={{
            width: `${percentage}%`,
          }}
          transition={{
            duration: 1,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={`
            h-full
            rounded-full
            ${current.bg}
          `}
        />
      </div>
    </div>
  );
};

/* =========================================================
   MINI STAT
========================================================= */

const MiniStat = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <motion.div
    whileHover={{
      y: -3,
    }}
    className="
      flex
      items-center
      gap-3
      rounded-xl
      border
      border-black/[0.05]
      bg-white/60
      p-3
      dark:border-white/[0.06]
      dark:bg-white/[0.025]
    "
  >
    <Icon className="
      h-4 w-4
      shrink-0
      text-violet-500
    " />

    <div className="min-w-0">
      <p className="
        text-[9px]
        font-bold
        uppercase
        tracking-wider
        text-gray-400
      ">
        {label}
      </p>

      <p className="
        truncate
        text-xs
        font-black
        text-gray-800
        dark:text-white
      ">
        {value}
      </p>
    </div>
  </motion.div>
);

/* =========================================================
   MODAL HEADER
========================================================= */

const PremiumModalHeader = ({
  icon: Icon,
  title,
  subtitle,
  gradient,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  gradient: string;
}) => (
  <DialogHeader
    className="
      relative
      overflow-hidden
      border-b
      border-black/[0.06]
      p-6
      dark:border-white/[0.07]
    "
  >
    <div className="
      absolute
      -right-20
      -top-20
      h-48
      w-48
      rounded-full
      bg-violet-500/10
      blur-3xl
    " />

    <div className="
      relative z-10
      flex items-center gap-4
    ">
      <motion.div
        initial={{
          scale: 0.7,
          rotate: -10,
        }}
        animate={{
          scale: 1,
          rotate: 0,
        }}
        className={`
          flex h-12 w-12
          items-center justify-center
          rounded-2xl
          bg-gradient-to-br
          ${gradient}
          text-white
          shadow-lg
        `}
      >
        <Icon className="h-5 w-5" />
      </motion.div>

      <div>
        <DialogTitle className="
          text-xl
          font-black
          text-gray-900
          dark:text-white
        ">
          {title}
        </DialogTitle>

        <p className="
          mt-1
          text-xs
          font-medium
          text-gray-400
        ">
          {subtitle}
        </p>
      </div>
    </div>
  </DialogHeader>
);

/* =========================================================
   SALES ITEM
========================================================= */

const SaleItem = ({
  sale,
  values,
  formatEuro,
  gradient,
  secondary,
}: {
  sale: Sale;
  values: ReturnType<
    (sale: Sale) => {
      revenue: number;
      cost: number;
      profit: number;
      totalProductsSold: number;
    }
  >;
  formatEuro: (value: number) => string;
  gradient: string;
  secondary: string;
}) => {
  const date = new Date(sale.date);

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -15,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      whileHover={{
        x: 4,
        scale: 1.01,
      }}
      className="
        group
        flex
        items-center
        justify-between
        gap-4
        rounded-2xl
        border
        border-black/[0.05]
        bg-white/70
        p-4
        dark:border-white/[0.06]
        dark:bg-white/[0.025]
      "
    >
      <div className="
        flex
        min-w-0
        items-center
        gap-3
      ">
        <div className={`
          flex h-10 w-10
          shrink-0
          items-center justify-center
          rounded-xl
          bg-gradient-to-br
          ${gradient}
          text-[10px]
          font-black
          text-white
          shadow-md
        `}>
          {date.getDate()}/
          {date.getMonth() + 1}
        </div>

        <div className="min-w-0">
          <p className="
            truncate
            text-sm
            font-bold
            text-gray-800
            dark:text-white
          ">
            {sale.clientName ||
              "Client anonyme"}
          </p>

          <p className="
            text-[10px]
            font-medium
            text-gray-400
          ">
            {values.totalProductsSold} produit
            {values.totalProductsSold > 1
              ? "s"
              : ""}
          </p>
        </div>
      </div>

      <p className={`
        shrink-0
        text-base
        font-black
        bg-gradient-to-r
        ${secondary}
        bg-clip-text
        text-transparent
      `}>
        {formatEuro(values.revenue)}
      </p>
    </motion.div>
  );
};

/* =========================================================
   REVENUE MODAL
========================================================= */

const RevenueModal = ({
  currentData,
  periodSales,
  formatEuro,
  getSaleValues,
  periodLabel,
}: any) => (
  <>
    <PremiumModalHeader
      icon={DollarSign}
      title="Chiffre d'affaires"
      subtitle={periodLabel}
      gradient="from-blue-500 via-indigo-500 to-violet-600"
    />

    <div className="p-6">
      <ScrollArea className="h-[45vh] pr-4">
        <div className="space-y-3">
          {periodSales
            .slice(0, 20)
            .map(
              (
                sale: Sale,
                index: number
              ) => (
                <SaleItem
                  key={sale.id || index}
                  sale={sale}
                  values={getSaleValues(
                    sale
                  )}
                  formatEuro={formatEuro}
                  gradient="from-blue-500 to-indigo-600"
                  secondary="from-blue-600 to-indigo-600"
                />
              )
            )}
        </div>
      </ScrollArea>

      <SummaryBox
        label="Total CA"
        value={formatEuro(
          currentData.revenue
        )}
        subtitle={`${currentData.salesCount} transactions`}
        gradient="from-blue-500 via-indigo-500 to-violet-600"
        icon={CircleDollarSign}
      />
    </div>
  </>
);

/* =========================================================
   COST MODAL
========================================================= */

const CostModal = ({
  currentData,
  periodSales,
  formatEuro,
  getSaleValues,
  periodLabel,
}: any) => (
  <>
    <PremiumModalHeader
      icon={Receipt}
      title="Coûts d'achat"
      subtitle={periodLabel}
      gradient="from-red-500 via-orange-500 to-amber-500"
    />

    <div className="p-6">
      <ScrollArea className="h-[45vh] pr-4">
        <div className="space-y-3">
          {periodSales
            .slice(0, 20)
            .map(
              (
                sale: Sale,
                index: number
              ) => {
                const values =
                  getSaleValues(sale);

                return (
                  <motion.div
                    key={
                      sale.id || index
                    }
                    initial={{
                      opacity: 0,
                      x: -15,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    whileHover={{
                      x: 4,
                    }}
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                      rounded-2xl
                      border
                      border-black/[0.05]
                      bg-white/70
                      p-4
                      dark:border-white/[0.06]
                      dark:bg-white/[0.025]
                    "
                  >
                    <div className="
                      flex
                      min-w-0
                      items-center
                      gap-3
                    ">
                      <div className="
                        flex h-10 w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-gradient-to-br
                        from-red-500
                        to-orange-600
                        text-[10px]
                        font-black
                        text-white
                      ">
                        {new Date(
                          sale.date
                        ).getDate()}
                        /
                        {new Date(
                          sale.date
                        ).getMonth() + 1}
                      </div>

                      <div>
                        <p className="
                          text-sm
                          font-bold
                          text-gray-800
                          dark:text-white
                        ">
                          {sale.clientName ||
                            "Client anonyme"}
                        </p>

                        <p className="
                          text-[10px]
                          text-gray-400
                        ">
                          {currentData.revenue >
                          0
                            ? (
                                (values.cost /
                                  values.revenue) *
                                100
                              ).toFixed(1)
                            : "0"}
                          % du CA
                        </p>
                      </div>
                    </div>

                    <span className="
                      text-base
                      font-black
                      bg-gradient-to-r
                      from-red-500
                      to-orange-600
                      bg-clip-text
                      text-transparent
                    ">
                      {formatEuro(
                        values.cost
                      )}
                    </span>
                  </motion.div>
                );
              }
            )}
        </div>
      </ScrollArea>

      <SummaryBox
        label="Total coûts"
        value={formatEuro(
          currentData.cost
        )}
        subtitle={`${
          currentData.revenue > 0
            ? (
                (currentData.cost /
                  currentData.revenue) *
                100
              ).toFixed(1)
            : 0
        }% du CA`}
        gradient="from-red-500 via-orange-500 to-amber-500"
        icon={Receipt}
      />
    </div>
  </>
);

/* =========================================================
   PROFIT MODAL
========================================================= */

const ProfitModal = ({
  currentData,
  periodSales,
  formatEuro,
  getSaleValues,
  profitMargin,
  periodLabel,
}: any) => (
  <>
    <PremiumModalHeader
      icon={Target}
      title="Bénéfice net"
      subtitle={periodLabel}
      gradient="from-emerald-400 via-green-500 to-teal-600"
    />

    <div className="p-6">
      <ScrollArea className="h-[45vh] pr-4">
        <div className="space-y-3">
          {periodSales
            .slice(0, 20)
            .map(
              (
                sale: Sale,
                index: number
              ) => {
                const values =
                  getSaleValues(sale);

                const margin =
                  values.revenue > 0
                    ? (values.profit /
                        values.revenue) *
                      100
                    : 0;

                return (
                  <motion.div
                    key={
                      sale.id || index
                    }
                    initial={{
                      opacity: 0,
                      x: -15,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    whileHover={{
                      x: 4,
                    }}
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                      rounded-2xl
                      border
                      border-emerald-500/10
                      bg-emerald-500/[0.025]
                      p-4
                    "
                  >
                    <div className="
                      flex
                      min-w-0
                      items-center
                      gap-3
                    ">
                      <div className="
                        flex h-10 w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-gradient-to-br
                        from-emerald-400
                        to-green-600
                        text-[10px]
                        font-black
                        text-white
                      ">
                        {new Date(
                          sale.date
                        ).getDate()}
                        /
                        {new Date(
                          sale.date
                        ).getMonth() + 1}
                      </div>

                      <div>
                        <p className="
                          text-sm
                          font-bold
                          text-gray-800
                          dark:text-white
                        ">
                          {sale.clientName ||
                            "Client anonyme"}
                        </p>

                        <p className="
                          text-[10px]
                          text-emerald-500
                        ">
                          Marge {margin.toFixed(
                            1
                          )}%
                        </p>
                      </div>
                    </div>

                    <span className="
                      text-base
                      font-black
                      bg-gradient-to-r
                      from-emerald-500
                      to-green-600
                      bg-clip-text
                      text-transparent
                    ">
                      {formatEuro(
                        values.profit
                      )}
                    </span>
                  </motion.div>
                );
              }
            )}
        </div>
      </ScrollArea>

      <SummaryBox
        label="Total bénéfice"
        value={formatEuro(
          currentData.profit
        )}
        subtitle={`Marge ${profitMargin.toFixed(
          1
        )}%`}
        gradient="from-emerald-400 via-green-500 to-teal-600"
        icon={PiggyBank}
      />
    </div>
  </>
);

/* =========================================================
   AVERAGE ORDER MODAL
========================================================= */

const AverageOrderModal = ({
  currentData,
  formatEuro,
  periodLabel,
}: any) => (
  <>
    <PremiumModalHeader
      icon={ShoppingBag}
      title="Panier moyen"
      subtitle={periodLabel}
      gradient="from-purple-500 via-fuchsia-500 to-pink-500"
    />

    <div className="space-y-4 p-6">
      <div className="
        grid
        grid-cols-1
        gap-4
        sm:grid-cols-2
      ">
        <BigModalStat
          icon={ShoppingBag}
          label="Panier actuel"
          value={formatEuro(
            currentData.avgOrderValue
          )}
          gradient="from-purple-500 to-fuchsia-600"
        />

        <BigModalStat
          icon={DollarSign}
          label="CA total"
          value={formatEuro(
            currentData.revenue
          )}
          gradient="from-indigo-500 to-purple-600"
        />
      </div>

      <SummaryBox
        label="Nombre de transactions"
        value={`${currentData.salesCount}`}
        subtitle="Sur cette période"
        gradient="from-purple-500 via-fuchsia-500 to-pink-500"
        icon={Sparkles}
      />
    </div>
  </>
);

/* =========================================================
   MARGIN MODAL
========================================================= */

const MarginModal = ({
  currentData,
  formatEuro,
  profitMargin,
  periodLabel,
}: any) => (
  <>
    <PremiumModalHeader
      icon={Crown}
      title="Marge brute"
      subtitle={periodLabel}
      gradient="from-amber-400 via-yellow-500 to-orange-500"
    />

    <div className="space-y-4 p-6">
      <div className="
        grid
        grid-cols-1
        gap-3
        sm:grid-cols-3
      ">
        <BigModalStat
          icon={DollarSign}
          label="CA"
          value={formatEuro(
            currentData.revenue
          )}
          gradient="from-blue-500 to-indigo-600"
        />

        <BigModalStat
          icon={Receipt}
          label="Coûts"
          value={formatEuro(
            currentData.cost
          )}
          gradient="from-red-500 to-orange-600"
        />

        <BigModalStat
          icon={Target}
          label="Profit"
          value={formatEuro(
            currentData.profit
          )}
          gradient="from-emerald-400 to-green-600"
        />
      </div>

      <SummaryBox
        label="Marge de profit"
        value={`${profitMargin.toFixed(
          1
        )}%`}
        subtitle="Pourcentage du chiffre d'affaires"
        gradient="from-amber-400 via-yellow-500 to-orange-500"
        icon={Gem}
      />
    </div>
  </>
);

/* =========================================================
   SALES COUNT MODAL
========================================================= */

const SalesCountModal = ({
  currentData,
  periodLabel,
}: any) => (
  <>
    <PremiumModalHeader
      icon={Zap}
      title="Nombre de ventes"
      subtitle={periodLabel}
      gradient="from-cyan-400 via-sky-500 to-teal-500"
    />

    <div className="space-y-4 p-6">
      <div className="
        grid
        grid-cols-1
        gap-4
        sm:grid-cols-2
      ">
        <BigModalStat
          icon={ShoppingCart}
          label="Transactions"
          value={`${currentData.salesCount}`}
          gradient="from-cyan-400 to-sky-600"
        />

        <BigModalStat
          icon={ShoppingBag}
          label="Produits vendus"
          value={`${currentData.totalProductsSold}`}
          gradient="from-teal-400 to-emerald-600"
        />
      </div>

      <SummaryBox
        label="Produits / transaction"
        value={currentData.salesCount > 0
          ? currentData.totalProductsSold /
              currentData.salesCount
              .toFixed(1)
          : "0"}
        subtitle="Moyenne"
        gradient="from-cyan-400 via-sky-500 to-teal-500"
        icon={Trophy}
      />
    </div>
  </>
);

/* =========================================================
   PROFIT PER SALE MODAL
========================================================= */

const ProfitPerSaleModal = ({
  currentData,
  periodSales,
  formatEuro,
  getSaleValues,
  periodLabel,
}: any) => (
  <>
    <PremiumModalHeader
      icon={Star}
      title="Profit par vente"
      subtitle={periodLabel}
      gradient="from-rose-500 via-pink-500 to-red-500"
    />

    <div className="p-6">
      <ScrollArea className="h-[38vh] pr-4">
        <div className="space-y-2">
          {periodSales
            .slice(0, 15)
            .map(
              (
                sale: Sale,
                index: number
              ) => {
                const values =
                  getSaleValues(sale);

                return (
                  <motion.div
                    key={
                      sale.id || index
                    }
                    initial={{
                      opacity: 0,
                      x: -15,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay:
                        index * 0.03,
                    }}
                    className="
                      flex
                      items-center
                      justify-between
                      rounded-xl
                      border
                      border-rose-500/10
                      bg-rose-500/[0.025]
                      p-3
                    "
                  >
                    <div className="
                      flex items-center gap-3
                    ">
                      <div className="
                        flex h-8 w-8
                        items-center
                        justify-center
                        rounded-lg
                        bg-gradient-to-br
                        from-rose-500
                        to-pink-600
                        text-[9px]
                        font-black
                        text-white
                      ">
                        {new Date(
                          sale.date
                        ).getDate()}
                        /
                        {new Date(
                          sale.date
                        ).getMonth() + 1}
                      </div>

                      <span className="
                        text-xs
                        font-bold
                        text-gray-700
                        dark:text-white
                      ">
                        {sale.clientName ||
                          "Client"}
                      </span>
                    </div>

                    <span className="
                      font-black
                      bg-gradient-to-r
                      from-rose-500
                      to-pink-600
                      bg-clip-text
                      text-transparent
                    ">
                      {formatEuro(
                        values.profit
                      )}
                    </span>
                  </motion.div>
                );
              }
            )}
        </div>
      </ScrollArea>

      <SummaryBox
        label="Profit moyen / vente"
        value={formatEuro(
          currentData.salesCount > 0
            ? currentData.profit /
                currentData.salesCount
            : 0
        )}
        subtitle={`Sur ${currentData.salesCount} ventes`}
        gradient="from-rose-500 via-pink-500 to-red-500"
        icon={PiggyBank}
      />
    </div>
  </>
);

/* =========================================================
   BIG MODAL STAT
========================================================= */

const BigModalStat = ({
  icon: Icon,
  label,
  value,
  gradient,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  gradient: string;
}) => (
  <motion.div
    whileHover={{
      y: -4,
      scale: 1.02,
    }}
    className="
      rounded-2xl
      border
      border-black/[0.05]
      bg-black/[0.02]
      p-5
      dark:border-white/[0.06]
      dark:bg-white/[0.025]
    "
  >
    <div className={`
      mb-3
      flex h-10 w-10
      items-center justify-center
      rounded-xl
      bg-gradient-to-br
      ${gradient}
      text-white
      shadow-lg
    `}>
      <Icon className="h-4 w-4" />
    </div>

    <p className="
      text-[10px]
      font-black
      uppercase
      tracking-wider
      text-gray-400
    ">
      {label}
    </p>

    <p className="
      mt-1
      text-xl
      font-black
      text-gray-900
      dark:text-white
    ">
      {value}
    </p>
  </motion.div>
);

/* =========================================================
   SUMMARY BOX
========================================================= */

const SummaryBox = ({
  label,
  value,
  subtitle,
  gradient,
  icon: Icon,
}: {
  label: string;
  value: string;
  subtitle: string;
  gradient: string;
  icon: React.ElementType;
}) => (
  <motion.div
    initial={{
      opacity: 0,
      y: 15,
    }}
    animate={{
      opacity: 1,
      y: 0,
    }}
    className={`
      relative
      mt-5
      overflow-hidden
      rounded-[22px]
      bg-gradient-to-r
      ${gradient}
      p-5
      text-white
      shadow-xl
    `}
  >
    <motion.div
      className="
        absolute
        -right-16
        -top-16
        h-40
        w-40
        rounded-full
        bg-white/15
        blur-2xl
      "
      animate={{
        scale: [1, 1.25, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
      }}
    />

    <div className="
      relative z-10
      flex
      items-center
      justify-between
      gap-4
    ">
      <div className="
        flex items-center gap-3
      ">
        <div className="
          flex h-11 w-11
          items-center justify-center
          rounded-xl
          bg-white/15
          backdrop-blur-xl
        ">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="
            text-sm
            font-black
          ">
            {label}
          </p>

          <p className="
            text-[10px]
            font-medium
            text-white/70
          ">
            {subtitle}
          </p>
        </div>
      </div>

      <motion.span
        key={value}
        initial={{
          opacity: 0,
          scale: 0.7,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        className="
          text-2xl
          font-black
          tracking-tight
          sm:text-3xl
        "
      >
        {value}
      </motion.span>
    </div>
  </motion.div>
);

export default ProfitLossStatement;