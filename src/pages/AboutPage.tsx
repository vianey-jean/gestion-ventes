/**
 * AboutPage.tsx
 * Ultra Premium Luxury About Experience
 *
 * - Design luxe / SaaS premium
 * - Mode clair + sombre via le thème global
 * - Animations Framer Motion
 * - Aurora animée
 * - Particules flottantes
 * - Glassmorphism
 * - Grid / rings décoratifs
 * - Sections storytelling
 * - Responsive
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { useLightMotion } from '@/hooks/useLightMotion';

import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Crown,
  Database,
  Gem,
  Globe,
  Layers3,
  Lock,
  Package,
  Rocket,
  Settings2,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

/* =========================================================
   DATA
========================================================= */

const values = [
  {
    icon: Gem,
    title: 'Simplicité',
    description:
      'Une expérience pensée pour rester claire, intuitive et agréable, même lorsque votre activité devient complexe.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Zap,
    title: 'Performance',
    description:
      'Des outils rapides et fluides pour vous permettre de travailler efficacement sans perdre de temps.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: ShieldCheck,
    title: 'Sécurité',
    description:
      'Vos données et votre activité méritent une infrastructure fiable et une protection pensée dès la conception.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Target,
    title: 'Précision',
    description:
      'Des informations structurées pour vous aider à prendre de meilleures décisions au quotidien.',
    color: 'from-fuchsia-500 to-pink-500',
  },
];

const features = [
  {
    icon: BarChart3,
    title: 'Ventes',
    description:
      'Pilotez votre activité commerciale et gardez une vision claire de vos performances.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: TrendingUp,
    title: 'Comptabilité',
    description:
      'Centralisez les informations essentielles et gardez le contrôle de vos finances.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Users,
    title: 'Clients',
    description:
      'Organisez vos relations clients dans un espace unique et facilement accessible.',
    color: 'from-fuchsia-500 to-pink-500',
  },
  {
    icon: Package,
    title: 'Stock',
    description:
      'Suivez vos produits, vos quantités et votre inventaire en toute simplicité.',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: Activity,
    title: 'Rendez-vous',
    description:
      'Structurez votre agenda et gardez une meilleure visibilité sur vos rendez-vous.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Layers3,
    title: 'Tâches',
    description:
      'Organisez votre travail, vos priorités et vos actions depuis un espace centralisé.',
    color: 'from-indigo-500 to-violet-500',
  },
];

const stats = [
  {
    value: '100%',
    label: 'Expérience cloud',
    icon: Cloud,
  },
  {
    value: '24/7',
    label: 'Accessible partout',
    icon: Globe,
  },
  {
    value: '1',
    label: 'Espace centralisé',
    icon: Layers3,
  },
  {
    value: '∞',
    label: 'Possibilités',
    icon: Rocket,
  },
];

const securityItems = [
  {
    icon: ShieldCheck,
    title: 'Protection',
    description: 'Une architecture pensée pour protéger votre environnement.',
  },
  {
    icon: Lock,
    title: 'Confidentialité',
    description: 'Vos informations restent au cœur de notre conception.',
  },
  {
    icon: Database,
    title: 'Données structurées',
    description: 'Une organisation claire pour retrouver rapidement l’essentiel.',
  },
];

/* =========================================================
   COMPONENT
========================================================= */

const AboutPage: React.FC = () => {
  const { light, particleCount } = useLightMotion();

  return (
    <Layout>
      <SEOHead
        title="À propos — Gestion Vente Premium"
        description="Découvrez notre vision d'une plateforme moderne, élégante et performante pour gérer votre activité commerciale."
        canonical="https://riziky-ventes.vercel.app/about"
      />

      <main
        className="
          relative
          min-h-screen
          overflow-hidden
          bg-slate-50
          dark:bg-[#02030a]
          text-slate-900
          dark:text-white
          transition-colors
          duration-500
        "
      >
        {/* =====================================================
            GLOBAL BACKGROUND
        ====================================================== */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Aurora 1 */}
          <motion.div
            animate={
              light
                ? undefined
                : {
                    x: [0, 100, -50, 0],
                    y: [0, -70, 50, 0],
                    scale: [1, 1.15, 0.95, 1],
                  }
            }
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="
              absolute
              -left-56
              -top-56
              h-[700px]
              w-[700px]
              rounded-full
              bg-violet-400/20
              blur-[110px]
              dark:bg-fuchsia-600/20
            "
          />

          {/* Aurora 2 */}
          <motion.div
            animate={
              light
                ? undefined
                : {
                    x: [0, -100, 60, 0],
                    y: [0, 70, -40, 0],
                    scale: [1, 1.2, 0.9, 1],
                  }
            }
            transition={{
              duration: 24,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="
              absolute
              -bottom-72
              -right-56
              h-[800px]
              w-[800px]
              rounded-full
              bg-cyan-300/20
              blur-[120px]
              dark:bg-cyan-600/15
            "
          />

          {/* Aurora 3 */}
          <motion.div
            animate={
              light
                ? undefined
                : {
                    x: [0, 50, -60, 0],
                    y: [0, -40, 40, 0],
                    scale: [1, 1.1, 0.95, 1],
                  }
            }
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="
              absolute
              left-1/2
              top-[35%]
              h-[550px]
              w-[550px]
              -translate-x-1/2
              rounded-full
              bg-pink-300/10
              blur-[130px]
              dark:bg-violet-600/10
            "
          />

          {/* Grid */}
          <div
            className="
              absolute
              inset-0
              opacity-30
              dark:opacity-100
              bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)]
              dark:bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)]
              bg-[size:70px_70px]
            "
          />

          {/* Large ring */}
          <motion.div
            animate={
              light
                ? undefined
                : {
                    rotate: 360,
                  }
            }
            transition={{
              duration: 80,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="
              absolute
              left-1/2
              top-[28%]
              h-[900px]
              w-[900px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              border
              border-slate-900/5
              dark:border-white/[0.035]
            "
          />

          {/* Small ring */}
          <motion.div
            animate={
              light
                ? undefined
                : {
                    rotate: -360,
                  }
            }
            transition={{
              duration: 55,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="
              absolute
              left-1/2
              top-[28%]
              h-[620px]
              w-[620px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              border
              border-violet-500/10
              dark:border-fuchsia-500/10
            "
          />

          {/* Floating particles */}
          {[...Array(particleCount)].map((_, index) => (
            <motion.span
              key={index}
              animate={
                light
                  ? undefined
                  : {
                      y: [0, -80, 0],
                      x: [
                        0,
                        index % 2 === 0 ? 25 : -25,
                        0,
                      ],
                      opacity: [0.15, 0.7, 0.15],
                      scale: [0.8, 1.4, 0.8],
                    }
              }
              transition={{
                duration: 5 + index * 0.6,
                repeat: Infinity,
                delay: index * 0.35,
                ease: 'easeInOut',
              }}
              className="
                absolute
                h-1
                w-1
                rounded-full
                bg-violet-500/40
                dark:bg-white/40
              "
              style={{
                left: `${5 + ((index * 17) % 90)}%`,
                top: `${5 + ((index * 23) % 90)}%`,
              }}
            />
          ))}
        </div>

        {/* =====================================================
            HERO
        ====================================================== */}

        <section
          className="
            relative
            z-10
            px-4
            pb-24
            pt-20
            sm:px-6
            lg:px-8
            lg:pb-32
            lg:pt-28
          "
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
              {/* HERO LEFT */}

              <motion.div
                initial={{
                  opacity: 0,
                  x: -40,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.8,
                  ease: 'easeOut',
                }}
              >
                {/* Badge */}

                <motion.div
                  whileHover={{
                    scale: 1.03,
                    y: -2,
                  }}
                  className="
                    inline-flex
                    items-center
                    gap-2.5
                    rounded-full
                    border
                    border-slate-900/10
                    dark:border-white/10
                    bg-white/70
                    dark:bg-white/[0.045]
                    backdrop-blur-xl
                    px-4
                    py-2
                    shadow-lg
                    dark:shadow-none
                  "
                >
                  <span
                    className="
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-full
                      bg-gradient-to-br
                      from-violet-500
                      to-fuchsia-500
                      shadow-lg
                      shadow-violet-500/25
                    "
                  >
                    <Gem className="h-3.5 w-3.5 text-white" />
                  </span>

                  <span className="text-sm font-semibold text-slate-700 dark:text-white/80">
                    Premium Business Suite
                  </span>

                  <Sparkles className="h-4 w-4 text-fuchsia-500 dark:text-fuchsia-400" />
                </motion.div>

                {/* Heading */}

                <h1
                  className="
                    mt-8
                    max-w-4xl
                    text-5xl
                    font-black
                    leading-[0.95]
                    tracking-[-0.05em]
                    text-slate-900
                    dark:text-white
                    sm:text-6xl
                    lg:text-7xl
                    xl:text-[84px]
                  "
                >
                  Une nouvelle façon de gérer votre

                  <span
                    className="
                      mt-3
                      block
                      bg-gradient-to-r
                      from-violet-600
                      via-fuchsia-500
                      to-cyan-500
                      bg-clip-text
                      text-transparent
                      dark:from-fuchsia-400
                      dark:via-violet-400
                      dark:to-cyan-300
                    "
                  >
                    Business.
                  </span>
                </h1>

                <p
                  className="
                    mt-8
                    max-w-2xl
                    text-lg
                    leading-relaxed
                    text-slate-600
                    dark:text-white/50
                    sm:text-xl
                  "
                >
                  Nous imaginons une expérience de gestion
                  commerciale plus simple, plus élégante et
                  plus intelligente — pour vous permettre de
                  consacrer votre énergie à votre activité.
                </p>

                {/* CTA */}

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link to="/register">
                    <Button
                      className="
                        group
                        h-14
                        w-full
                        rounded-2xl
                        border-0
                        bg-gradient-to-r
                        from-violet-600
                        via-fuchsia-600
                        to-cyan-500
                        px-7
                        text-base
                        font-bold
                        text-white
                        shadow-[0_15px_45px_rgba(124,58,237,0.3)]
                        transition-all
                        duration-300
                        hover:scale-[1.02]
                        sm:w-auto
                      "
                    >
                      <Rocket className="mr-2.5 h-5 w-5" />

                      Commencer maintenant

                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>

                  <Link to="/login">
                    <Button
                      variant="outline"
                      className="
                        h-14
                        w-full
                        rounded-2xl
                        border
                        border-slate-900/10
                        dark:border-white/[0.08]
                        bg-white/60
                        dark:bg-white/[0.035]
                        px-7
                        text-base
                        font-semibold
                        text-slate-800
                        dark:text-white
                        backdrop-blur-xl
                        transition-all
                        duration-300
                        hover:scale-[1.02]
                        hover:bg-white
                        dark:hover:bg-white/[0.07]
                        sm:w-auto
                      "
                    >
                      Découvrir la plateforme
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                {/* Mini stats */}

                <div className="mt-10 flex flex-wrap gap-3">
                  {stats.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <motion.div
                        key={item.label}
                        initial={{
                          opacity: 0,
                          y: 15,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay: 0.6 + index * 0.1,
                        }}
                        whileHover={{
                          y: -4,
                        }}
                        className="
                          rounded-2xl
                          border
                          border-slate-900/10
                          dark:border-white/[0.08]
                          bg-white/60
                          dark:bg-white/[0.035]
                          px-4
                          py-3
                          backdrop-blur-xl
                        "
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-violet-600 dark:text-fuchsia-400" />

                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">
                              {item.value}
                            </div>

                            <div className="text-[11px] text-slate-500 dark:text-white/40">
                              {item.label}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* HERO RIGHT — PREMIUM VISUAL */}

              <motion.div
                initial={{
                  opacity: 0,
                  x: 40,
                  scale: 0.96,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                }}
                transition={{
                  duration: 0.9,
                  delay: 0.2,
                  ease: 'easeOut',
                }}
                className="relative mx-auto w-full max-w-xl"
              >
                {/* Glow */}

                <motion.div
                  animate={{
                    opacity: [0.35, 0.65, 0.35],
                    scale: [1, 1.04, 1],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="
                    absolute
                    -inset-8
                    rounded-[50px]
                    bg-gradient-to-r
                    from-violet-500/20
                    via-fuchsia-500/20
                    to-cyan-500/20
                    blur-3xl
                  "
                />

                <div
                  className="
                    relative
                    overflow-hidden
                    rounded-[36px]
                    border
                    border-slate-900/10
                    dark:border-white/[0.09]
                    bg-white/75
                    dark:bg-[#0b0b14]/75
                    p-5
                    shadow-[0_30px_100px_rgba(15,23,42,0.15)]
                    backdrop-blur-2xl
                    dark:shadow-[0_30px_100px_rgba(0,0,0,0.65)]
                    sm:p-7
                  "
                >
                  {/* Shine */}

                  <div
                    className="
                      absolute
                      left-0
                      right-0
                      top-0
                      h-px
                      bg-gradient-to-r
                      from-transparent
                      via-violet-500/70
                      to-transparent
                      dark:via-white/40
                    "
                  />

                  {/* Dashboard header */}

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-400 dark:text-white/35">
                        BUSINESS OVERVIEW
                      </div>

                      <div className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                        Votre activité
                      </div>
                    </div>

                    <div
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-2xl
                        bg-gradient-to-br
                        from-violet-600
                        via-fuchsia-500
                        to-cyan-500
                        shadow-lg
                        shadow-violet-500/25
                      "
                    >
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  {/* Fake graph */}

                  <div
                    className="
                      mt-7
                      rounded-3xl
                      border
                      border-slate-900/10
                      dark:border-white/[0.07]
                      bg-slate-100/60
                      dark:bg-white/[0.035]
                      p-5
                    "
                  >
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-xs text-slate-500 dark:text-white/35">
                          Performance
                        </div>

                        <div className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
                          +38.4%
                        </div>
                      </div>

                      <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1">
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          Excellent
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex h-36 items-end gap-2">
                      {[28, 42, 35, 58, 49, 70, 63, 84, 76, 96].map(
                        (height, index) => (
                          <motion.div
                            key={index}
                            initial={{
                              height: 0,
                            }}
                            animate={{
                              height: `${height}%`,
                            }}
                            transition={{
                              duration: 0.7,
                              delay: 0.5 + index * 0.06,
                            }}
                            className="
                              flex-1
                              rounded-t-lg
                              bg-gradient-to-t
                              from-violet-600
                              via-fuchsia-500
                              to-cyan-400
                              opacity-80
                            "
                          />
                        )
                      )}
                    </div>
                  </div>

                  {/* Dashboard cards */}

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {[
                      {
                        icon: Users,
                        title: 'Clients',
                        value: 'Centralisés',
                        color: 'from-fuchsia-500 to-pink-500',
                      },
                      {
                        icon: Package,
                        title: 'Stock',
                        value: 'Contrôlé',
                        color: 'from-orange-500 to-amber-500',
                      },
                      {
                        icon: Activity,
                        title: 'Agenda',
                        value: 'Organisé',
                        color: 'from-emerald-500 to-teal-500',
                      },
                      {
                        icon: ShieldCheck,
                        title: 'Sécurité',
                        value: 'Protégée',
                        color: 'from-cyan-500 to-blue-500',
                      },
                    ].map((item, index) => {
                      const Icon = item.icon;

                      return (
                        <motion.div
                          key={item.title}
                          initial={{
                            opacity: 0,
                            y: 15,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            delay: 0.9 + index * 0.08,
                          }}
                          whileHover={{
                            y: -4,
                          }}
                          className="
                            rounded-2xl
                            border
                            border-slate-900/10
                            dark:border-white/[0.07]
                            bg-white/70
                            dark:bg-white/[0.035]
                            p-4
                            backdrop-blur-xl
                          "
                        >
                          <div
                            className={`
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-xl
                              bg-gradient-to-br
                              ${item.color}
                            `}
                          >
                            <Icon className="h-4 w-4 text-white" />
                          </div>

                          <div className="mt-3 text-xs font-bold text-slate-900 dark:text-white">
                            {item.title}
                          </div>

                          <div className="mt-1 text-[10px] text-slate-500 dark:text-white/35">
                            {item.value}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* =====================================================
            VALUES
        ====================================================== */}

        <section
          className="
            relative
            z-10
            px-4
            py-20
            sm:px-6
            lg:px-8
            lg:py-28
          "
        >
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{
                opacity: 0,
                y: 30,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                margin: '-100px',
              }}
              transition={{
                duration: 0.7,
              }}
              className="mx-auto max-w-3xl text-center"
            >
              <div
                className="
                  mx-auto
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-violet-500/10
                  bg-violet-500/5
                  px-3
                  py-1.5
                "
              >
                <Sparkles className="h-3.5 w-3.5 text-violet-500 dark:text-fuchsia-400" />

                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-violet-600 dark:text-fuchsia-400">
                  Notre vision
                </span>
              </div>

              <h2
                className="
                  mt-5
                  text-4xl
                  font-black
                  tracking-tight
                  text-slate-900
                  dark:text-white
                  sm:text-5xl
                "
              >
                Une plateforme conçue autour de{' '}
                <span
                  className="
                    bg-gradient-to-r
                    from-violet-600
                    via-fuchsia-500
                    to-cyan-500
                    bg-clip-text
                    text-transparent
                    dark:from-fuchsia-400
                    dark:via-violet-400
                    dark:to-cyan-300
                  "
                >
                  vous.
                </span>
              </h2>

              <p className="mt-5 text-base leading-relaxed text-slate-600 dark:text-white/45 sm:text-lg">
                Notre objectif est simple : réunir les outils
                essentiels de votre activité dans une expérience
                cohérente, moderne et agréable à utiliser.
              </p>
            </motion.div>

            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => {
                const Icon = value.icon;

                return (
                  <motion.div
                    key={value.title}
                    initial={{
                      opacity: 0,
                      y: 30,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                      margin: '-70px',
                    }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.08,
                    }}
                    whileHover={{
                      y: -7,
                      scale: 1.015,
                    }}
                    className="
                      group
                      relative
                      overflow-hidden
                      rounded-[28px]
                      border
                      border-slate-900/10
                      dark:border-white/[0.07]
                      bg-white/65
                      dark:bg-white/[0.035]
                      p-6
                      shadow-sm
                      backdrop-blur-xl
                      dark:shadow-none
                    "
                  >
                    <div
                      className={`
                        absolute
                        inset-0
                        bg-gradient-to-br
                        ${value.color}
                        opacity-0
                        transition-opacity
                        duration-500
                        group-hover:opacity-[0.07]
                      `}
                    />

                    <div className="relative">
                      <div
                        className={`
                          flex
                          h-12
                          w-12
                          items-center
                          justify-center
                          rounded-2xl
                          bg-gradient-to-br
                          ${value.color}
                          shadow-lg
                        `}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>

                      <h3 className="mt-5 text-lg font-black text-slate-900 dark:text-white">
                        {value.title}
                      </h3>

                      <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-white/40">
                        {value.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================
            STORY SECTION
        ====================================================== */}

        <section
          className="
            relative
            z-10
            px-4
            py-20
            sm:px-6
            lg:px-8
            lg:py-32
          "
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-14 lg:grid-cols-2">
              {/* Visual */}

              <motion.div
                initial={{
                  opacity: 0,
                  x: -40,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{
                  once: true,
                  margin: '-100px',
                }}
                transition={{
                  duration: 0.8,
                }}
                className="relative"
              >
                <div
                  className="
                    absolute
                    -inset-5
                    rounded-[40px]
                    bg-gradient-to-r
                    from-violet-500/10
                    via-fuchsia-500/10
                    to-cyan-500/10
                    blur-2xl
                  "
                />

                <div
                  className="
                    relative
                    overflow-hidden
                    rounded-[32px]
                    border
                    border-slate-900/10
                    dark:border-white/[0.08]
                    bg-white/70
                    dark:bg-[#0b0b14]/70
                    p-7
                    backdrop-blur-2xl
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-2xl
                        bg-gradient-to-br
                        from-violet-600
                        via-fuchsia-500
                        to-cyan-500
                      "
                    >
                      <Settings2 className="h-5 w-5 text-white" />
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-slate-400 dark:text-white/35">
                        SMART WORKSPACE
                      </div>

                      <div className="text-lg font-black text-slate-900 dark:text-white">
                        Tout au même endroit
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 space-y-3">
                    {[
                      'Une vision globale de votre activité',
                      'Des outils connectés entre eux',
                      'Une interface simple et intuitive',
                      'Une expérience pensée pour évoluer avec vous',
                    ].map((text, index) => (
                      <motion.div
                        key={text}
                        initial={{
                          opacity: 0,
                          x: -15,
                        }}
                        whileInView={{
                          opacity: 1,
                          x: 0,
                        }}
                        viewport={{
                          once: true,
                        }}
                        transition={{
                          delay: 0.2 + index * 0.1,
                        }}
                        className="
                          flex
                          items-center
                          gap-3
                          rounded-2xl
                          border
                          border-slate-900/10
                          dark:border-white/[0.07]
                          bg-slate-100/60
                          dark:bg-white/[0.035]
                          px-4
                          py-4
                        "
                      >
                        <div
                          className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-emerald-500/10
                            dark:bg-emerald-500/15
                          "
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>

                        <span className="text-sm font-medium text-slate-700 dark:text-white/65">
                          {text}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  <div
                    className="
                      mt-7
                      rounded-2xl
                      border
                      border-violet-500/10
                      bg-gradient-to-r
                      from-violet-500/5
                      via-fuchsia-500/5
                      to-cyan-500/5
                      p-5
                    "
                  >
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 fill-amber-400 text-amber-400" />

                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          Pensé pour durer
                        </div>

                        <div className="mt-1 text-xs text-slate-500 dark:text-white/35">
                          Une expérience qui évolue avec votre entreprise.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Text */}

              <motion.div
                initial={{
                  opacity: 0,
                  x: 40,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{
                  once: true,
                  margin: '-100px',
                }}
                transition={{
                  duration: 0.8,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="h-px w-10 bg-gradient-to-r from-violet-500 to-fuchsia-500" />

                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600 dark:text-fuchsia-400">
                    Notre approche
                  </span>
                </div>

                <h2
                  className="
                    mt-5
                    text-4xl
                    font-black
                    leading-tight
                    tracking-tight
                    text-slate-900
                    dark:text-white
                    sm:text-5xl
                  "
                >
                  La puissance sans la complexité.
                </h2>

                <p className="mt-6 text-base leading-relaxed text-slate-600 dark:text-white/45 sm:text-lg">
                  Une bonne solution de gestion ne devrait pas
                  vous demander de devenir expert de l'outil.
                  Elle doit simplement vous aider à travailler
                  mieux.
                </p>

                <p className="mt-5 text-base leading-relaxed text-slate-600 dark:text-white/45 sm:text-lg">
                  C'est pourquoi nous privilégions une interface
                  claire, des informations bien organisées et
                  une expérience fluide, tout en conservant la
                  puissance nécessaire pour accompagner une
                  activité professionnelle.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      icon: Zap,
                      text: 'Rapide à prendre en main',
                    },
                    {
                      icon: Layers3,
                      text: 'Centralisé et structuré',
                    },
                    {
                      icon: Shield,
                      text: 'Pensé pour la sécurité',
                    },
                    {
                      icon: Globe,
                      text: 'Accessible partout',
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.text}
                        className="
                          flex
                          items-center
                          gap-3
                          rounded-2xl
                          border
                          border-slate-900/10
                          dark:border-white/[0.07]
                          bg-white/60
                          dark:bg-white/[0.035]
                          px-4
                          py-3
                          backdrop-blur-xl
                        "
                      >
                        <Icon className="h-4 w-4 text-violet-600 dark:text-fuchsia-400" />

                        <span className="text-xs font-semibold text-slate-700 dark:text-white/60">
                          {item.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FEATURES
        ====================================================== */}

        <section
          className="
            relative
            z-10
            px-4
            py-20
            sm:px-6
            lg:px-8
            lg:py-32
          "
        >
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{
                opacity: 0,
                y: 30,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                margin: '-100px',
              }}
              transition={{
                duration: 0.7,
              }}
              className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"
            >
              <div className="max-w-2xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-600 dark:text-fuchsia-400" />

                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600 dark:text-fuchsia-400">
                    Un écosystème complet
                  </span>
                </div>

                <h2
                  className="
                    mt-4
                    text-4xl
                    font-black
                    tracking-tight
                    text-slate-900
                    dark:text-white
                    sm:text-5xl
                  "
                >
                  Tout ce dont votre activité a besoin.
                </h2>
              </div>

              <p className="max-w-md text-sm leading-relaxed text-slate-500 dark:text-white/40 lg:text-right">
                Une suite d'outils réunis dans une seule
                expérience pour simplifier votre quotidien.
              </p>
            </motion.div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <motion.div
                    key={feature.title}
                    initial={{
                      opacity: 0,
                      y: 25,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                      margin: '-60px',
                    }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.06,
                    }}
                    whileHover={{
                      y: -6,
                      scale: 1.015,
                    }}
                    className="
                      group
                      relative
                      overflow-hidden
                      rounded-[26px]
                      border
                      border-slate-900/10
                      dark:border-white/[0.07]
                      bg-white/65
                      dark:bg-white/[0.035]
                      p-5
                      backdrop-blur-xl
                    "
                  >
                    <div
                      className={`
                        absolute
                        inset-0
                        bg-gradient-to-br
                        ${feature.color}
                        opacity-0
                        transition-opacity
                        duration-500
                        group-hover:opacity-[0.08]
                      `}
                    />

                    <div className="relative">
                      <div
                        className={`
                          flex
                          h-11
                          w-11
                          items-center
                          justify-center
                          rounded-2xl
                          bg-gradient-to-br
                          ${feature.color}
                          shadow-lg
                        `}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>

                      <h3 className="mt-5 text-base font-black text-slate-900 dark:text-white">
                        {feature.title}
                      </h3>

                      <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-white/35">
                        {feature.description}
                      </p>

                      <div className="mt-5 flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-fuchsia-400">
                        Découvrir
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================
            SECURITY
        ====================================================== */}

        <section
          className="
            relative
            z-10
            px-4
            py-20
            sm:px-6
            lg:px-8
            lg:py-28
          "
        >
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.97,
              }}
              whileInView={{
                opacity: 1,
                scale: 1,
              }}
              viewport={{
                once: true,
                margin: '-100px',
              }}
              transition={{
                duration: 0.8,
              }}
              className="
                relative
                overflow-hidden
                rounded-[36px]
                border
                border-slate-900/10
                dark:border-white/[0.08]
                bg-white/70
                dark:bg-white/[0.035]
                p-7
                backdrop-blur-2xl
                sm:p-10
                lg:p-14
              "
            >
              <div
                className="
                  absolute
                  -right-40
                  -top-40
                  h-[450px]
                  w-[450px]
                  rounded-full
                  bg-cyan-400/10
                  blur-[100px]
                  dark:bg-cyan-500/10
                "
              />

              <div
                className="
                  absolute
                  -bottom-40
                  -left-40
                  h-[450px]
                  w-[450px]
                  rounded-full
                  bg-violet-500/10
                  blur-[100px]
                  dark:bg-violet-500/10
                "
              />

              <div className="relative">
                <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                  <div>
                    <div
                      className="
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                        bg-gradient-to-br
                        from-violet-600
                        via-fuchsia-500
                        to-cyan-500
                        shadow-xl
                        shadow-violet-500/20
                      "
                    >
                      <ShieldCheck className="h-7 w-7 text-white" />
                    </div>

                    <h2
                      className="
                        mt-6
                        text-3xl
                        font-black
                        tracking-tight
                        text-slate-900
                        dark:text-white
                        sm:text-4xl
                      "
                    >
                      La sécurité au cœur de l'expérience.
                    </h2>

                    <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 dark:text-white/45">
                      Parce que votre activité et vos données
                      sont essentielles, nous intégrons la
                      sécurité directement dans l'expérience
                      produit.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {securityItems.map((item, index) => {
                      const Icon = item.icon;

                      return (
                        <motion.div
                          key={item.title}
                          initial={{
                            opacity: 0,
                            x: 20,
                          }}
                          whileInView={{
                            opacity: 1,
                            x: 0,
                          }}
                          viewport={{
                            once: true,
                          }}
                          transition={{
                            delay: index * 0.1,
                          }}
                          className="
                            flex
                            gap-4
                            rounded-2xl
                            border
                            border-slate-900/10
                            dark:border-white/[0.07]
                            bg-white/60
                            dark:bg-white/[0.035]
                            p-4
                            backdrop-blur-xl
                          "
                        >
                          <div
                            className="
                              flex
                              h-11
                              w-11
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              bg-emerald-500/10
                              dark:bg-emerald-500/15
                            "
                          >
                            <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          </div>

                          <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                              {item.title}
                            </h3>

                            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-white/35">
                              {item.description}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* =====================================================
            CTA
        ====================================================== */}

        <section
          className="
            relative
            z-10
            px-4
            pb-24
            pt-20
            sm:px-6
            lg:px-8
            lg:pb-32
          "
        >
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{
                opacity: 0,
                y: 30,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                margin: '-100px',
              }}
              transition={{
                duration: 0.8,
              }}
              className="
                relative
                overflow-hidden
                rounded-[40px]
                border
                border-slate-900/10
                dark:border-white/[0.09]
                bg-white/75
                dark:bg-[#0b0b14]/80
                px-6
                py-14
                text-center
                shadow-[0_30px_100px_rgba(15,23,42,0.12)]
                backdrop-blur-2xl
                dark:shadow-[0_30px_100px_rgba(0,0,0,0.55)]
                sm:px-10
                sm:py-16
              "
            >
              {/* CTA glow */}

              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                  opacity: [0.25, 0.45, 0.25],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="
                  absolute
                  left-1/2
                  top-1/2
                  h-[350px]
                  w-[350px]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                  bg-gradient-to-r
                  from-violet-500/20
                  via-fuchsia-500/20
                  to-cyan-500/20
                  blur-[90px]
                "
              />

              <div className="relative">
                <div
                  className="
                    mx-auto
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-gradient-to-br
                    from-violet-600
                    via-fuchsia-500
                    to-cyan-500
                    shadow-xl
                    shadow-violet-500/25
                  "
                >
                  <Rocket className="h-6 w-6 text-white" />
                </div>

                <h2
                  className="
                    mx-auto
                    mt-7
                    max-w-3xl
                    text-4xl
                    font-black
                    tracking-tight
                    text-slate-900
                    dark:text-white
                    sm:text-5xl
                  "
                >
                  Prêt à gérer votre activité avec plus de{' '}
                  <span
                    className="
                      bg-gradient-to-r
                      from-violet-600
                      via-fuchsia-500
                      to-cyan-500
                      bg-clip-text
                      text-transparent
                      dark:from-fuchsia-400
                      dark:via-violet-400
                      dark:to-cyan-300
                    "
                  >
                    simplicité ?
                  </span>
                </h2>

                <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-500 dark:text-white/40 sm:text-lg">
                  Découvrez une nouvelle expérience de gestion
                  pensée pour vous faire gagner du temps et garder
                  le contrôle de votre activité.
                </p>

                <div className="mt-8 flex justify-center">
                  <Link to="/register">
                    <Button
                      className="
                        group
                        relative
                        h-14
                        overflow-hidden
                        rounded-2xl
                        border-0
                        bg-gradient-to-r
                        from-violet-600
                        via-fuchsia-600
                        to-cyan-500
                        px-8
                        text-base
                        font-bold
                        text-white
                        shadow-[0_15px_45px_rgba(124,58,237,0.3)]
                        transition-all
                        duration-300
                        hover:scale-[1.02]
                      "
                    >
                      {/* Shine */}

                      <motion.div
                        animate={{
                          x: ['-120%', '120%'],
                        }}
                        transition={{
                          duration: 2.8,
                          repeat: Infinity,
                          repeatDelay: 2,
                          ease: 'easeInOut',
                        }}
                        className="
                          absolute
                          inset-y-0
                          w-1/3
                          skew-x-[-20deg]
                          bg-white/20
                          blur-sm
                        "
                      />

                      <span className="relative flex items-center">
                        Créer mon compte

                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Button>
                  </Link>
                </div>

                <div
                  className="
                    mt-7
                    flex
                    items-center
                    justify-center
                    gap-2
                    text-[10px]
                    text-slate-400
                    dark:text-white/25
                  "
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />

                  Une expérience moderne, sécurisée et accessible.

                  <Star className="h-3 w-3 text-amber-500" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* =====================================================
            BOTTOM BRANDING
        ====================================================== */}

        <motion.div
          initial={{
            opacity: 0,
          }}
          whileInView={{
            opacity: 1,
          }}
          viewport={{
            once: true,
          }}
          className="
            relative
            z-10
            flex
            items-center
            justify-center
            gap-2
            pb-8
            text-[10px]
            font-medium
            text-slate-400
            dark:text-white/25
          "
        >
          <Sparkles className="h-3 w-3 text-violet-500 dark:text-fuchsia-400" />

          Gestion Vente Premium

          <span>•</span>

          <Globe className="h-3 w-3" />

          Cloud Business Suite
        </motion.div>
      </main>
    </Layout>
  );
};

export default AboutPage;