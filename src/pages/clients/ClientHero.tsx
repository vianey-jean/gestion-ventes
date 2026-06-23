/**
 * =============================================================================
 * ClientHero - Section héroïque de la page Clients (version améliorée)
 * =============================================================================
 */

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Users,
  Crown,
  Star,
  Diamond,
  Sparkles,
  Merge,
} from "lucide-react";

import { motion } from "framer-motion";

interface ClientHeroProps {
  clientCount: number;
  onAddClient: () => void;
  onMergeClient?: () => void;
}

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

const ClientHero: React.FC<ClientHeroProps> = ({
  clientCount,
  onAddClient,
  onMergeClient,
}) => {
  const particles = useMemo(() => generateParticles(16), []);

  return (
    <motion.section
      initial={{ opacity: 0, y: -20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950"
    >
      {/* ================= BACKGROUND GLOWS ================= */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 left-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px]"
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/15 rounded-full blur-[120px]"
          animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* ================= GRID ================= */}
      <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* ================= SCAN LINE ================= */}
      <motion.div
        className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent blur-sm"
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      {/* ================= PARTICLES ================= */}
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

      {/* ================= TOP SHIMMER ================= */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />

      {/* ================= CONTENT ================= */}
      <div className="relative container mx-auto px-3 sm:px-4 md:px-6 py-10 sm:py-14 md:py-20">
        <div className="text-center">

          {/* ICON HEADER */}
          <div className="inline-flex items-center gap-4 mb-8">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="relative"
            >
              <Crown className="w-14 h-14 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.4)]" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                <Star className="w-2.5 h-2.5 text-white" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white drop-shadow-[0_4px_20px_rgba(139,92,246,0.3)]"
            >
              Liste Clients{" "}
              <span className="bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-300 bg-clip-text text-transparent">
                Élite
              </span>
            </motion.h1>

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <Diamond className="w-14 h-14 text-purple-300/60" />
            </motion.div>
          </div>

          {/* DESCRIPTION */}
          <p className="text-base sm:text-lg md:text-xl text-purple-200/60 mb-10 max-w-3xl mx-auto">
            Gérez vos clients VIP avec une sophistication et une élégance incomparables
          </p>

          {/* STATS */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">

            <div className="bg-white/5 backdrop-blur-2xl rounded-2xl px-6 py-4 border border-white/10">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-emerald-400" />
                <span className="text-white font-bold text-lg">
                  {clientCount} Client{clientCount > 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* ADD BUTTON */}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={onAddClient}
                className="h-14 px-8 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 shadow-[0_25px_80px_rgba(139,92,246,.4)]"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouveau Client
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            {/* MERGE BUTTON */}
            {onMergeClient && (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={onMergeClient}
                  className="h-14 px-8 rounded-2xl font-bold text-white bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 shadow-[0_25px_80px_rgba(249,115,22,.3)]"
                >
                  <Merge className="w-5 h-5 mr-2" />
                  Fusionner Clients
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ================= BOTTOM SHIMMER ================= */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
    </motion.section>
  );
};

export default ClientHero;