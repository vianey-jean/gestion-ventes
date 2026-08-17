import React, { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Calculator,
  BarChart4,
  Crown,
  Gem,
  Star,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Modules
import ProfitLossStatement from "./accounting/ProfitLossStatement";
import ComptabiliteModule from "./comptabilite/ComptabiliteModule";
import SalesReport from "./reports/SalesReport";
import ProfitEvolution from "./reports/ProfitEvolution";
import StockRotation from "./reports/StockRotation";
import YearlyComparison from "./reports/YearlyComparison";

interface AdvancedDashboardProps {
  className?: string;
}

/* =========================================================
   PARTICLES
========================================================= */

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
    duration: 4 + Math.random() * 6,
    delay: Math.random() * 4,
    size: 1.5 + Math.random() * 3,
  }));

/* =========================================================
   TAB CONFIG
========================================================= */

const tabs = [
  {
    value: "inventory",
    label: "Comptabilité",
    mobileLabel: "Compta",
    description: "Gestion comptable",
    icon: Calculator,
    colors: {
      from: "from-blue-500",
      via: "via-indigo-500",
      to: "to-violet-500",
      glow: "rgba(99,102,241,.55)",
      bg: "bg-blue-500/10",
      text: "text-blue-300",
    },
  },
  {
    value: "accounting",
    label: "Finance Pro",
    mobileLabel: "Finance",
    description: "Performance financière",
    icon: TrendingUp,
    colors: {
      from: "from-emerald-400",
      via: "via-teal-500",
      to: "to-cyan-500",
      glow: "rgba(20,184,166,.55)",
      bg: "bg-emerald-500/10",
      text: "text-emerald-300",
    },
  },
  {
    value: "reports",
    label: "Analytics Pro",
    mobileLabel: "Analytics",
    description: "Rapports & indicateurs",
    icon: BarChart4,
    colors: {
      from: "from-orange-400",
      via: "via-pink-500",
      to: "to-red-500",
      glow: "rgba(249,115,22,.55)",
      bg: "bg-orange-500/10",
      text: "text-orange-300",
    },
  },
  {
    value: "yearly",
    label: "Analyse annuelle",
    mobileLabel: "Annuel",
    description: "Comparaison annuelle",
    icon: Calendar,
    colors: {
      from: "from-purple-400",
      via: "via-fuchsia-500",
      to: "to-pink-500",
      glow: "rgba(168,85,247,.55)",
      bg: "bg-purple-500/10",
      text: "text-purple-300",
    },
  },
];

/* =========================================================
   ANIMATION VARIANTS
========================================================= */

const contentVariants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.985,
    filter: "blur(8px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.985,
    filter: "blur(8px)",
  },
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const staggerItem = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState("inventory");

  const particles = useMemo(() => generateParticles(28), []);

  const activeConfig =
    tabs.find((tab) => tab.value === activeTab) ?? tabs[0];

  return (
    <div
      className={`
        relative min-h-full overflow-hidden
        space-y-7 md:space-y-10
        ${className}
      `}
    >
      {/* =====================================================
          GLOBAL AMBIENT BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
        <motion.div
          className="
            absolute left-[10%] top-[5%]
            h-[500px] w-[500px]
            rounded-full
            bg-indigo-600/10
            blur-[140px]
          "
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -50, 40, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="
            absolute right-[5%] top-[25%]
            h-[450px] w-[450px]
            rounded-full
            bg-fuchsia-600/10
            blur-[150px]
          "
          animate={{
            x: [0, -60, 30, 0],
            y: [0, 60, -30, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="
            absolute bottom-[-100px] left-[35%]
            h-[400px] w-[400px]
            rounded-full
            bg-cyan-500/5
            blur-[130px]
          "
          animate={{
            x: [0, 50, -50, 0],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* =====================================================
          HERO
      ===================================================== */}

      <motion.section
        initial={{
          opacity: 0,
          y: -30,
          scale: 0.97,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.9,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="
          group relative overflow-hidden
          rounded-[32px] md:rounded-[42px]
          border border-white/[0.10]
          bg-[#050509]
          shadow-[0_40px_120px_-30px_rgba(99,102,241,.35)]
        "
      >
        {/* =================================================
            HERO LIGHT ORBS
        ================================================= */}

        <motion.div
          className="
            absolute -right-40 -top-40
            h-[520px] w-[520px]
            rounded-full
            bg-violet-600/20
            blur-[100px]
          "
          animate={{
            x: [0, 50, -20, 0],
            y: [0, -30, 30, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="
            absolute -bottom-48 -left-32
            h-[500px] w-[500px]
            rounded-full
            bg-blue-600/20
            blur-[110px]
          "
          animate={{
            x: [0, -30, 40, 0],
            y: [0, 40, -20, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* =================================================
            GRID
        ================================================= */}

        <div
          className="
            absolute inset-0
            opacity-[0.22]
            bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)]
            bg-[size:55px_55px]
          "
        />

        {/* =================================================
            RADIAL LIGHT
        ================================================= */}

        <div
          className="
            absolute inset-0
            bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,.16),transparent_45%)]
          "
        />

        {/* =================================================
            ANIMATED SCAN LINE
        ================================================= */}

        <motion.div
          className="
            absolute left-0 right-0
            h-[1px]
            bg-gradient-to-r
            from-transparent
            via-violet-400/80
            to-transparent
            shadow-[0_0_20px_rgba(139,92,246,.8)]
          "
          animate={{
            top: ["0%", "100%", "0%"],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* =================================================
            PARTICLES
        ================================================= */}

        <div className="pointer-events-none absolute inset-0">
          {particles.map((particle, index) => (
            <motion.span
              key={index}
              className="
                absolute rounded-full
                bg-white
                shadow-[0_0_8px_rgba(255,255,255,.8)]
              "
              style={{
                left: particle.left,
                top: particle.top,
                width: particle.size,
                height: particle.size,
              }}
              animate={{
                y: [0, -35, 0],
                x: [0, index % 2 === 0 ? 12 : -12, 0],
                opacity: [0, 0.9, 0],
                scale: [0.4, 1.4, 0.4],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* =================================================
            TOP LIGHT BORDER
        ================================================= */}

        <motion.div
          className="
            absolute left-1/4 right-1/4 top-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-violet-300
            to-transparent
          "
          animate={{
            opacity: [0.2, 1, 0.2],
            scaleX: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* =================================================
            HERO CONTENT
        ================================================= */}

        <div className="relative z-10 px-6 py-12 md:px-12 md:py-16 lg:py-20">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="mx-auto max-w-5xl text-center"
          >
            {/* PREMIUM BADGE */}

            <motion.div
              variants={staggerItem}
              whileHover={{
                scale: 1.05,
                y: -2,
              }}
              className="
                mx-auto mb-7
                inline-flex items-center gap-3
                rounded-full
                border border-violet-300/20
                bg-white/[0.05]
                px-5 py-2.5
                shadow-[0_0_30px_rgba(139,92,246,.15)]
                backdrop-blur-xl
              "
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              >
                <Crown className="h-5 w-5 text-amber-300" />
              </motion.div>

              <span className="text-sm font-bold tracking-wide text-violet-100">
                FINANCE INTELLIGENCE
              </span>

              <Sparkles className="h-4 w-4 text-pink-300" />
            </motion.div>

            {/* TITLE */}

            <motion.h1
              variants={staggerItem}
              className="
                text-4xl font-black
                tracking-[-0.04em]
                sm:text-5xl
                md:text-6xl
                lg:text-7xl
              "
            >
              <span
                className="
                  bg-gradient-to-r
                  from-white
                  via-violet-200
                  to-fuchsia-200
                  bg-clip-text
                  text-transparent
                "
              >
                Comptabilité
              </span>

              <br />

              <span
                className="
                  bg-gradient-to-r
                  from-violet-300
                  via-fuchsia-300
                  to-pink-300
                  bg-clip-text
                  text-transparent
                "
              >
                & Finances
              </span>
            </motion.h1>

            {/* SUBTITLE */}

            <motion.p
              variants={staggerItem}
              className="
                mx-auto mt-6
                max-w-2xl
                text-base
                leading-7
                text-white/55
                md:text-lg
              "
            >
              Une nouvelle génération de pilotage financier.
              Analysez, anticipez et optimisez vos performances
              avec une interface pensée pour les décisions stratégiques.
            </motion.p>

            {/* STATUS ROW */}

            <motion.div
              variants={staggerItem}
              className="
                mt-8
                flex flex-wrap
                items-center justify-center
                gap-3
              "
            >
              {/* LIVE */}

              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0 rgba(16,185,129,0)",
                    "0 0 25px rgba(16,185,129,.25)",
                    "0 0 0 rgba(16,185,129,0)",
                  ],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                }}
                className="
                  inline-flex items-center gap-2.5
                  rounded-full
                  border border-emerald-400/20
                  bg-emerald-400/[0.08]
                  px-4 py-2
                  backdrop-blur-xl
                "
              >
                <motion.span
                  className="
                    h-2.5 w-2.5 rounded-full
                    bg-emerald-400
                    shadow-[0_0_12px_rgba(52,211,153,.9)]
                  "
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.6, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                />

                <span className="text-xs font-black tracking-widest text-emerald-300">
                  LIVE
                </span>
              </motion.div>

              {/* SECURITY */}

              <div
                className="
                  inline-flex items-center gap-2
                  rounded-full
                  border border-white/10
                  bg-white/[0.04]
                  px-4 py-2
                  backdrop-blur-xl
                "
              >
                <ShieldCheck className="h-4 w-4 text-blue-300" />

                <span className="text-xs font-semibold text-white/60">
                  Données sécurisées
                </span>
              </div>

              {/* AI */}

              <div
                className="
                  inline-flex items-center gap-2
                  rounded-full
                  border border-white/10
                  bg-white/[0.04]
                  px-4 py-2
                  backdrop-blur-xl
                "
              >
                <Gem className="h-4 w-4 text-fuchsia-300" />

                <span className="text-xs font-semibold text-white/60">
                  Intelligence avancée
                </span>
              </div>
            </motion.div>

            {/* BOTTOM METRICS */}

            <motion.div
              variants={staggerItem}
              className="
                mx-auto mt-10
                grid max-w-2xl
                grid-cols-3
                overflow-hidden
                rounded-2xl
                border border-white/[0.08]
                bg-white/[0.025]
                backdrop-blur-xl
              "
            >
              <div className="border-r border-white/[0.08] px-3 py-4">
                <div className="flex items-center justify-center gap-1.5">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-black text-white">
                    99.9%
                  </span>
                </div>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-white/35">
                  Disponibilité
                </p>
              </div>

              <div className="border-r border-white/[0.08] px-3 py-4">
                <div className="flex items-center justify-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-violet-400" />
                  <span className="text-sm font-black text-white">
                    LIVE
                  </span>
                </div>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-white/35">
                  Analytics
                </p>
              </div>

              <div className="px-3 py-4">
                <div className="flex items-center justify-center gap-1.5">
                  <Star className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-black text-white">
                    PRO
                  </span>
                </div>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-white/35">
                  Experience
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* =================================================
            BOTTOM GLOW
        ================================================= */}

        <div
          className="
            absolute bottom-0 left-0 right-0
            h-24
            bg-gradient-to-t
            from-violet-600/10
            to-transparent
          "
        />

        <motion.div
          className="
            absolute bottom-0 left-1/4 right-1/4
            h-px
            bg-gradient-to-r
            from-transparent
            via-indigo-400/70
            to-transparent
          "
          animate={{
            opacity: [0.2, 1, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        />
      </motion.section>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="relative">
          {/* Ambient glow */}

          <motion.div
            className="pointer-events-none absolute inset-0 -z-10 rounded-[30px] blur-3xl"
            animate={{
              background: [
                "radial-gradient(circle at 10% 50%, rgba(59,130,246,.12), transparent 35%)",
                "radial-gradient(circle at 90% 50%, rgba(168,85,247,.12), transparent 35%)",
                "radial-gradient(circle at 50% 50%, rgba(20,184,166,.10), transparent 35%)",
                "radial-gradient(circle at 10% 50%, rgba(59,130,246,.12), transparent 35%)",
              ],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
            }}
          />

          <TabsList
            className="
              grid h-auto w-full
              grid-cols-2
              gap-2
              rounded-[26px]
              border border-black/5
              bg-white/80
              p-2
              shadow-[0_20px_70px_-20px_rgba(0,0,0,.25)]
              backdrop-blur-2xl

              dark:border-white/[0.08]
              dark:bg-white/[0.035]
              dark:shadow-[0_25px_80px_-25px_rgba(0,0,0,.7)]

              sm:grid-cols-4
            "
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;

              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="
                    group relative
                    h-[78px]
                    overflow-hidden
                    rounded-2xl
                    border border-transparent
                    px-2
                    py-2
                    transition-all
                    duration-500

                    data-[state=active]:text-white

                    hover:bg-black/[0.025]
                    dark:hover:bg-white/[0.035]
                  "
                >
                  {/* ACTIVE BACKGROUND */}

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabBackground"
                        initial={{
                          opacity: 0,
                          scale: 0.95,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.95,
                        }}
                        transition={{
                          duration: 0.4,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className={`
                          absolute inset-0
                          bg-gradient-to-r
                          ${tab.colors.from}
                          ${tab.colors.via}
                          ${tab.colors.to}
                          opacity-95
                        `}
                      />
                    )}
                  </AnimatePresence>

                  {/* HOVER GLOW */}

                  <div
                    className={`
                      absolute inset-0
                      opacity-0
                      transition-opacity duration-500
                      group-hover:opacity-100
                      bg-gradient-to-r
                      ${tab.colors.from}/10
                      ${tab.colors.to}/10
                    `}
                  />

                  {/* SHIMMER */}

                  <motion.div
                    className="
                      absolute inset-y-0 -left-[100%]
                      w-[50%]
                      skew-x-[-20deg]
                      bg-gradient-to-r
                      from-transparent
                      via-white/20
                      to-transparent
                    "
                    animate={
                      isActive
                        ? {
                            left: ["-100%", "200%"],
                          }
                        : undefined
                    }
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "easeInOut",
                    }}
                  />

                  {/* CONTENT */}

                  <div className="relative z-10 flex h-full items-center justify-center gap-2.5">
                    <motion.div
                      animate={
                        isActive
                          ? {
                              scale: [1, 1.08, 1],
                              rotate: [0, -3, 3, 0],
                            }
                          : {
                              scale: 1,
                              rotate: 0,
                            }
                      }
                      transition={{
                        duration: 2.5,
                        repeat: isActive ? Infinity : 0,
                      }}
                      className={`
                        flex h-11 w-11
                        shrink-0 items-center justify-center
                        rounded-xl
                        bg-gradient-to-br
                        ${tab.colors.from}
                        ${tab.colors.via}
                        ${tab.colors.to}
                        shadow-lg
                        transition-all duration-500
                        ${
                          isActive
                            ? "shadow-white/20"
                            : "group-hover:scale-105"
                        }
                      `}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </motion.div>

                    <div className="min-w-0 text-left">
                      <div
                        className={`
                          hidden truncate text-sm font-black
                          sm:block
                          ${
                            isActive
                              ? "text-white"
                              : "text-gray-800 dark:text-white/90"
                          }
                        `}
                      >
                        {tab.label}
                      </div>

                      <div
                        className={`
                          block truncate text-[11px] font-black
                          sm:hidden
                          ${
                            isActive
                              ? "text-white"
                              : "text-gray-800 dark:text-white/90"
                          }
                        `}
                      >
                        {tab.mobileLabel}
                      </div>

                      <div
                        className={`
                          mt-0.5 hidden truncate text-[10px]
                          sm:block
                          ${
                            isActive
                              ? "text-white/65"
                              : "text-gray-500 dark:text-white/35"
                          }
                        `}
                      >
                        {tab.description}
                      </div>
                    </div>

                    {isActive && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          x: 8,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        className="hidden sm:block"
                      >
                        <ArrowUpRight className="h-4 w-4 text-white/60" />
                      </motion.div>
                    )}
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* =====================================================
            ACTIVE SECTION INDICATOR
        ===================================================== */}

        <motion.div
          key={activeTab}
          initial={{
            opacity: 0,
            width: 0,
          }}
          animate={{
            opacity: 1,
            width: "100%",
          }}
          transition={{
            duration: 0.5,
          }}
          className="mx-auto mt-3 h-px max-w-xs bg-gradient-to-r from-transparent via-violet-400/50 to-transparent"
        />

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <TabsContent
          value="inventory"
          className="mt-8 space-y-8 outline-none md:mt-10"
        >
          <motion.div
            variants={contentVariants}
            initial="initial"
            animate="animate"
            transition={{
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <ComptabiliteModule />
          </motion.div>
        </TabsContent>

        <TabsContent
          value="accounting"
          className="mt-8 space-y-8 outline-none md:mt-10"
        >
          <motion.div
            variants={contentVariants}
            initial="initial"
            animate="animate"
            transition={{
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <ProfitLossStatement />
          </motion.div>
        </TabsContent>

        <TabsContent
          value="reports"
          className="mt-8 space-y-8 outline-none md:mt-10"
        >
          <motion.div
            variants={contentVariants}
            initial="initial"
            animate="animate"
            transition={{
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="space-y-8"
          >
            <SalesReport />
            <ProfitEvolution />
            <StockRotation />
          </motion.div>
        </TabsContent>

        <TabsContent
          value="yearly"
          className="mt-8 space-y-8 outline-none md:mt-10"
        >
          <motion.div
            variants={contentVariants}
            initial="initial"
            animate="animate"
            transition={{
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <YearlyComparison />
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* =====================================================
          ACTIVE MODULE FOOTER
      ===================================================== */}

      <motion.div
        key={`footer-${activeTab}`}
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="
          flex items-center justify-center
          gap-2
          text-center
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.2em]
          text-gray-400
          dark:text-white/25
        "
      >
        <motion.span
          animate={{
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="
            h-1.5 w-1.5
            rounded-full
            bg-violet-400
            shadow-[0_0_8px_rgba(167,139,250,.8)]
          "
        />

        Module actif — {activeConfig.label}

        <motion.span
          animate={{
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.5,
          }}
          className="
            h-1.5 w-1.5
            rounded-full
            bg-fuchsia-400
            shadow-[0_0_8px_rgba(232,121,249,.8)]
          "
        />
      </motion.div>
    </div>
  );
};

export default AdvancedDashboard;