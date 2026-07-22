/**
 * =============================================================================
 * CLIENT HERO ULTRA PREMIUM
 * =============================================================================
 */

import { motion } from "framer-motion";
import { Activity, Award, Crown, Diamond, MapPin, Merge, Plus, ShieldCheck, Sparkles, Star, Users } from "lucide-react";
import { useMemo } from "react";
import { Button } from "react-day-picker";

interface ClientHeroProps {
  clientCount: number;
  onAddClient: () => void;
  onMergeClient?: () => void;
  onShowVilles?: () => void;
  onShowFidelites?: () => void;
}


type Particle = {
  left: string;
  top: string;
  duration: number;
  delay: number;
};

const generateParticles = (count: number): Particle[] =>
  Array.from({ length: count }).map((_, i) => ({
    left: `${10 + i * 5}%`,
    top: `${15 + (i % 5) * 15}%`,
    duration: 4 + Math.random() * 6,
    delay: Math.random() * 2,
  }));

const ClientHero: React.FC<ClientHeroProps> = ({
  clientCount,
  onAddClient,
  onMergeClient,
  onShowVilles,
  onShowFidelites,
}) => {

  const particles = useMemo(() => generateParticles(20), []);

  return (
    <section
      className="
      relative
      overflow-hidden
      rounded-[36px]
      border
      border-white/10
      bg-black
      py-14
      md:py-20
      shadow-[0_40px_120px_-20px_rgba(168,85,247,.45)]
    "
    >
      {/* ================================================= */}
      {/* AURORA BACKGROUND */}
      {/* ================================================= */}

      <div className="absolute inset-0 overflow-hidden">

        <motion.div
          className="
          absolute
          top-[-10%]
          left-[10%]
          h-[420px]
          w-[420px]
          rounded-full
          bg-purple-600/25
          blur-[140px]
        "
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -40, 30, 0],
            scale: [1, 1.25, 0.95, 1],
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
          top-[0%]
          right-[5%]
          h-[380px]
          w-[380px]
          rounded-full
          bg-pink-500/20
          blur-[140px]
        "
          animate={{
            x: [0, -70, 40, 0],
            y: [0, 50, -40, 0],
            scale: [1, 1.2, 1, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="
          absolute
          bottom-[-25%]
          left-1/2
          h-[650px]
          w-[650px]
          -translate-x-1/2
          rounded-full
          bg-indigo-600/15
          blur-[180px]
        "
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
          }}
        />
      </div>

      {/* ================================================= */}
      {/* GRID */}
      {/* ================================================= */}

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* ================================================= */}
      {/* SCAN EFFECT */}
      {/* ================================================= */}

      <motion.div
        className="
        absolute
        inset-x-0
        h-[2px]
        bg-gradient-to-r
        from-transparent
        via-purple-400
        to-transparent
        blur-sm
      "
        animate={{
          top: ["0%", "100%", "0%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* ================================================= */}
      {/* ORBIT RINGS */}
      {/* ================================================= */}

      <motion.div
        className="
        absolute
        left-1/2
        top-1/2
        h-[500px]
        w-[500px]
        -translate-x-1/2
        -translate-y-1/2
        rounded-full
        border
        border-purple-500/10
      "
        animate={{ rotate: 360 }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.div
        className="
        absolute
        left-1/2
        top-1/2
        h-[650px]
        w-[650px]
        -translate-x-1/2
        -translate-y-1/2
        rounded-full
        border
        border-pink-500/10
      "
        animate={{ rotate: -360 }}
        transition={{
          duration: 80,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* ================================================= */}
      {/* PARTICLES */}
      {/* ================================================= */}

      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-white"
          style={{
            left: p.left,
            top: p.top,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0, 1, 0],
            scale: [0.5, 1.6, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
          }}
        />
      ))}

      {/* TOP BORDER */}

      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />

      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <div className="relative z-20 text-center px-6">

        {/* PREMIUM BADGE */}

        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{
            scale: 1.04,
            y: -2,
          }}
          className="
          inline-flex
          items-center
          gap-3
          rounded-full
          border
          border-white/10
          bg-white/5
          px-6
          py-3
          backdrop-blur-3xl
          shadow-[0_0_30px_rgba(168,85,247,.25)]
        "
        >
          <motion.div
            animate={{
              rotate: [0, -10, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <Crown className="h-5 w-5 text-yellow-400" />
          </motion.div>

          <span className="font-semibold text-purple-100">
            Gestion Premium Clients
          </span>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Sparkles className="h-4 w-4 text-pink-400" />
          </motion.div>
        </motion.div>

        {/* TITLE */}

        <motion.h1
          initial={{
            opacity: 0,
            y: 80,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{ duration: 1 }}
          className="
          mt-8
          text-4xl
          sm:text-5xl
          md:text-6xl
          lg:text-7xl
          font-black
          tracking-tight
        "
        >
          <div className="flex flex-wrap justify-center items-center gap-3">

            <motion.div
              animate={{
                rotate: [0, 15, -15, 0],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
            >
              <Diamond className="h-10 w-10 md:h-14 md:w-14 text-purple-300" />
            </motion.div>

            <span
              className="
              bg-gradient-to-r
              from-white
              via-purple-200
              to-pink-200
              bg-clip-text
              text-transparent
              drop-shadow-[0_0_50px_rgba(168,85,247,.8)]
            "
            >
              Clients Élite
            </span>

            <motion.div
              animate={{
                rotate: [0, -15, 15, 0],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
            >
              <Star className="h-10 w-10 md:h-14 md:w-14 text-pink-300" />
            </motion.div>
          </div>
        </motion.h1>

        {/* SUBTITLE */}

        <p
          className="
          mx-auto
          mt-6
          max-w-3xl
          text-base
          md:text-xl
          text-purple-100/70
        "
        >
          Centralisez et gérez votre portefeuille client dans
          une expérience premium conçue pour la performance,
          la fidélisation et le suivi en temps réel.
        </p>

        {/* LIVE STATUS */}

        <motion.div
          className="
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
              "0 0 30px rgba(16,185,129,.8)",
              "0 0 10px rgba(16,185,129,.2)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <motion.div
            className="h-2.5 w-2.5 rounded-full bg-emerald-400"
            animate={{
              scale: [1, 1.8, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          />

          <Activity className="h-4 w-4 text-emerald-300" />

          <span className="text-xs sm:text-sm font-bold text-emerald-200 tracking-wider">
            CLIENT SYSTEM ONLINE
          </span>

          <ShieldCheck className="h-4 w-4 text-emerald-300" />
        </motion.div>

        {/* ACTIONS */}

        <div className="mt-12 flex flex-wrap justify-center gap-5">

          <div className="bg-white/5 backdrop-blur-2xl rounded-2xl px-6 py-4 border border-white/10">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-emerald-400" />
              <span className="text-white font-bold text-lg">
                {clientCount} Client{clientCount > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <Button
            onClick={onAddClient}
            className="
            h-14
            px-8
            rounded-2xl
            font-bold
            text-white
            bg-gradient-to-r
            from-purple-500
            via-pink-500
            to-blue-500
            shadow-[0_25px_80px_rgba(139,92,246,.4)]
          "
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau Client
            <Sparkles className="w-5 h-5 ml-2" />
          </Button>

          {onMergeClient && (
            <Button
              onClick={onMergeClient}
              className="
              h-14
              px-8
              rounded-2xl
              font-bold
              text-white
              bg-gradient-to-r
              from-orange-500
              via-amber-500
              to-red-500
              shadow-[0_25px_80px_rgba(249,115,22,.3)]
            "
            >
              <Merge className="w-5 h-5 mr-2" />
              Fusionner Clients
            </Button>
          )}

          {onShowVilles && (
            <Button
              onClick={onShowVilles}
              className="h-14 px-8 rounded-2xl font-bold text-white bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 shadow-[0_25px_80px_rgba(59,130,246,.4)]"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Voir les villes
            </Button>
          )}

          {onShowFidelites && (
            <Button
              onClick={onShowFidelites}
              className="h-14 px-8 rounded-2xl font-bold text-white bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 shadow-[0_25px_80px_rgba(245,158,11,.4)]"
            >
              <Award className="w-5 h-5 mr-2" />
              Listes Fidélité
            </Button>
          )}

        </div>
      </div>

      {/* BOTTOM BORDER */}

      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-400/50 to-transparent" />
    </section>
  );
};

export default ClientHero;