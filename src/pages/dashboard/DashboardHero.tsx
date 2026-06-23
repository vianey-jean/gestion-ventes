/**
 * =============================================================================
 * DashboardHero V2 - Ultra Premium Futuristic Hero
 * =============================================================================
 */

import React from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Sparkles,
  Diamond,
  Gem,
  Star,
  Award,
  Zap,
} from "lucide-react";

const particles = Array.from({ length: 12 });

const DashboardHero: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-black py-16 sm:py-20 md:py-24 text-center shadow-[0_40px_120px_-20px_rgba(139,92,246,0.55)]">

      {/* ========================= */}
      {/* Animated Aurora */}
      {/* ========================= */}

      <div className="absolute inset-0">

        <motion.div
          className="absolute top-[-15%] left-[10%] h-[500px] w-[500px] rounded-full bg-purple-600/25 blur-[140px]"
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -40, 50, 0],
            scale: [1, 1.3, 0.9, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute top-[0%] right-[5%] h-[450px] w-[450px] rounded-full bg-pink-500/20 blur-[140px]"
          animate={{
            x: [0, -80, 50, 0],
            y: [0, 50, -40, 0],
            scale: [1, 1.2, 1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-[-20%] left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[170px]"
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.4, 0.9, 0.4],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
          }}
        />
      </div>

      {/* ========================= */}
      {/* Noise Texture */}
      {/* ========================= */}

      <div
        className="
          absolute inset-0 opacity-[0.035]
          bg-[url('https://grainy-gradients.vercel.app/noise.svg')]
          mix-blend-soft-light
        "
      />

      {/* ========================= */}
      {/* Grid */}
      {/* ========================= */}

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* ========================= */}
      {/* Light Beam */}
      {/* ========================= */}

      <motion.div
        className="absolute left-1/2 top-0 h-full w-[350px] -translate-x-1/2 bg-gradient-to-b from-purple-400/15 via-transparent to-transparent blur-3xl"
        animate={{
          opacity: [0.2, 0.8, 0.2],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
        }}
      />

      {/* ========================= */}
      {/* Floating Particles */}
      {/* ========================= */}

      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-white"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -60, 0],
            opacity: [0, 1, 0],
            scale: [0.5, 1.8, 0.5],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            delay: i * 0.4,
          }}
        />
      ))}

      {/* ========================= */}
      {/* Orbit Rings */}
      {/* ========================= */}

      <motion.div
        className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-400/10"
        animate={{ rotate: 360 }}
        transition={{
          duration: 50,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.div
        className="absolute left-1/2 top-1/2 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-pink-400/10"
        animate={{ rotate: -360 }}
        transition={{
          duration: 70,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* ========================= */}
      {/* Premium Badge */}
      {/* ========================= */}

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-7 py-3 backdrop-blur-3xl"
      >
        <motion.div
          animate={{
            rotate: [0, -15, 15, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
          }}
        >
          <Crown className="h-5 w-5 text-yellow-400" />
        </motion.div>

        <span className="font-bold text-purple-100">
          Dashboard Premium Intelligence
        </span>

        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Sparkles className="h-4 w-4 text-pink-400" />
        </motion.div>
      </motion.div>

      {/* ========================= */}
      {/* HERO TITLE */}
      {/* ========================= */}

      <motion.h1
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="
          relative z-20
          mt-10
          text-5xl
          sm:text-6xl
          md:text-7xl
          lg:text-8xl
          font-black
          tracking-tight
        "
      >
        <div className="flex items-center justify-center gap-4">

          <motion.div
            animate={{
              rotate: [0, 12, -12, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
            }}
          >
            <Diamond className="h-12 w-12 text-purple-300" />
          </motion.div>

          <span
            className="
              bg-gradient-to-r
              from-white
              via-purple-200
              to-pink-200
              bg-clip-text
              text-transparent
              drop-shadow-[0_0_50px_rgba(168,85,247,0.8)]
            "
          >
            Tableau de Bord
          </span>

          <motion.div
            animate={{
              rotate: [0, -12, 12, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
            }}
          >
            <Gem className="h-12 w-12 text-pink-300" />
          </motion.div>

        </div>
      </motion.h1>

      {/* ========================= */}
      {/* Subtitle */}
      {/* ========================= */}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: 0.5,
        }}
        className="
          relative z-20
          mx-auto
          mt-8
          max-w-3xl
          px-6
          text-lg
          md:text-xl
          text-purple-100/70
        "
      >
        Gérez vos ventes, stocks, finances et performances avec une
        expérience de nouvelle génération alimentée par des analyses
        intelligentes en temps réel.
      </motion.p>

      {/* ========================= */}
      {/* Live Indicator */}
      {/* ========================= */}

      <motion.div
        className="
          relative z-20
          mt-10
          inline-flex
          items-center
          gap-3
          rounded-full
          border
          border-emerald-500/20
          bg-emerald-500/10
          px-5
          py-2
          backdrop-blur-xl
        "
        animate={{
          boxShadow: [
            "0 0 10px rgba(16,185,129,.2)",
            "0 0 35px rgba(16,185,129,.8)",
            "0 0 10px rgba(16,185,129,.2)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        <motion.div
          className="h-2 w-2 rounded-full bg-emerald-400"
          animate={{
            scale: [1, 1.8, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        />

        <Zap className="h-4 w-4 text-emerald-300" />

        <span className="text-sm font-semibold text-emerald-200">
          LIVE DATA STREAM
        </span>
      </motion.div>
    </div>
  );
};

export default DashboardHero;