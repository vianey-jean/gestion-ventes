import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowRight,
  BarChart3,
  Shield,
  Zap,
  TrendingUp,
  Crown,
  Sparkles,
  Star,
  CalendarDays,
  CheckSquare,
  Calculator,
  Package,
  Users,
  WalletCards,
  Receipt,
  ChevronRight,
  CircleDollarSign,
  Activity,
  Clock3,
  Target,
  Layers3,
} from 'lucide-react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import SEOHead from '@/components/SEOHead';

const features = [
  {
    icon: BarChart3,
    title: 'Suivi des ventes',
    description:
      'Visualisez vos ventes, votre chiffre d’affaires, vos performances et leur évolution en temps réel.',
    gradient: 'from-violet-500 to-indigo-500',
    glow: 'rgba(139, 92, 246, 0.35)',
  },
  {
    icon: Calculator,
    title: 'Comptabilité',
    description:
      'Gardez une vision claire de vos revenus, dépenses, bénéfices et mouvements financiers.',
    gradient: 'from-cyan-500 to-blue-500',
    glow: 'rgba(6, 182, 212, 0.35)',
  },
  {
    icon: CalendarDays,
    title: 'Rendez-vous',
    description:
      'Organisez vos rendez-vous et ne manquez plus aucune opportunité commerciale.',
    gradient: 'from-pink-500 to-rose-500',
    glow: 'rgba(236, 72, 153, 0.35)',
  },
  {
    icon: CheckSquare,
    title: 'Tâches',
    description:
      'Planifiez vos tâches, vos priorités et vos actions pour garder votre activité sous contrôle.',
    gradient: 'from-amber-500 to-orange-500',
    glow: 'rgba(245, 158, 11, 0.35)',
  },
  {
    icon: Package,
    title: 'Gestion des stocks',
    description:
      'Suivez vos produits et vos stocks pour éviter les ruptures et mieux anticiper.',
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'rgba(16, 185, 129, 0.35)',
  },
  {
    icon: Users,
    title: 'Gestion des clients',
    description:
      'Centralisez vos clients et développez une relation commerciale plus efficace.',
    gradient: 'from-blue-500 to-violet-500',
    glow: 'rgba(59, 130, 246, 0.35)',
  },
];

const stats = [
  {
    value: '100%',
    label: 'Centralisé',
    icon: Layers3,
  },
  {
    value: '24/7',
    label: 'Accessible',
    icon: Clock3,
  },
  {
    value: '+∞',
    label: 'Possibilités',
    icon: TrendingUp,
  },
];

const managementItems = [
  {
    icon: CircleDollarSign,
    title: 'Chiffre d’affaires',
  },
  {
    icon: TrendingUp,
    title: 'Bénéfices',
  },
  {
    icon: Target,
    title: 'Objectifs',
  },
  {
    icon: Receipt,
    title: 'Dépenses',
  },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      <SEOHead
        title="Gestion Vente — La gestion commerciale réinventée"
        description="Gestion Vente : ventes, comptabilité, stocks, clients, rendez-vous et tâches dans une seule plateforme moderne, élégante et puissante."
        canonical="https://riziky-ventes.vercel.app/"
      />

      <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-700 dark:bg-[#05030d] dark:text-white">

        {/* =========================================================
            BACKGROUND
        ========================================================= */}

        <div className="fixed inset-0 pointer-events-none overflow-hidden">

          <motion.div
            animate={{
              x: [0, 80, -30, 0],
              y: [0, -50, 40, 0],
              scale: [1, 1.15, 0.95, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-purple-400/15 blur-[120px] dark:bg-purple-700/20"
          />

          <motion.div
            animate={{
              x: [0, -80, 30, 0],
              y: [0, 60, -30, 0],
              scale: [1, 1.2, 0.9, 1],
            }}
            transition={{
              duration: 24,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-[20%] -right-48 h-[550px] w-[550px] rounded-full bg-pink-400/10 blur-[130px] dark:bg-fuchsia-700/15"
          />

          <motion.div
            animate={{
              y: [0, -80, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute bottom-[-250px] left-1/2 h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-blue-400/10 blur-[140px] dark:bg-indigo-700/15"
          />

          <div className="absolute inset-0 bg-[linear-gradient(rgba(120,100,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(120,100,255,1)_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.04] dark:opacity-[0.035]" />

          {[...Array(18)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -120, 0],
                x: [0, i % 2 === 0 ? 25 : -25, 0],
                opacity: [0.1, 0.6, 0.1],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 5 + (i % 6),
                repeat: Infinity,
                delay: i * 0.35,
                ease: 'easeInOut',
              }}
              className="absolute h-1 w-1 rounded-full bg-purple-500 dark:bg-purple-300"
              style={{
                left: `${5 + ((i * 17) % 90)}%`,
                top: `${8 + ((i * 13) % 80)}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10">

          {/* =========================================================
              HERO
          ========================================================= */}

          <section className="container mx-auto px-4 pb-16 pt-20 sm:px-6 sm:pt-28">
            <div className="mx-auto max-w-6xl">

              <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">

                {/* HERO TEXT */}

                <div className="text-center lg:text-left">

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -30,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.7,
                    }}
                    className="mb-7 inline-flex items-center gap-2 rounded-full border border-purple-100 bg-white/70 px-4 py-2 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] dark:shadow-none"
                  >
                    <Crown className="h-3.5 w-3.5 text-amber-400" />

                    <span className="text-xs font-semibold tracking-wide text-purple-700 dark:text-purple-200">
                      LA NOUVELLE GÉNÉRATION DE GESTION
                    </span>

                    <Sparkles className="h-3.5 w-3.5 text-fuchsia-400" />
                  </motion.div>

                  <motion.h1
                    initial={{
                      opacity: 0,
                      y: 50,
                      scale: 0.9,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    transition={{
                      duration: 1,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="text-4xl font-black leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl"
                  >
                    Gérez votre activité.

                    <span className="mt-3 block bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                      Développez votre avenir.
                    </span>
                  </motion.h1>

                  <motion.p
                    initial={{
                      opacity: 0,
                      y: 25,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.3,
                      duration: 0.7,
                    }}
                    className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-purple-100/55 sm:text-lg lg:mx-0"
                  >
                    Une plateforme tout-en-un pour piloter vos{' '}
                    <strong className="text-slate-900 dark:text-white">
                      ventes, votre comptabilité, vos rendez-vous, vos
                      tâches, vos stocks et vos clients.
                    </strong>
                  </motion.p>

                  {!isAuthenticated && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 25,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: 0.5,
                      }}
                      className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
                    >
                      <motion.div
                        whileHover={{
                          scale: 1.04,
                        }}
                        whileTap={{
                          scale: 0.98,
                        }}
                        className="relative group"
                      >
                        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 opacity-60 blur-lg transition-opacity group-hover:opacity-100" />

                        <button
                          type="button"
                          onClick={() => navigate('/register')}
                          className="relative flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 px-7 py-3.5 text-sm font-bold text-white shadow-2xl"
                        >
                          <Sparkles className="h-4 w-4" />

                          Commencer gratuitement

                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </button>
                      </motion.div>

                      <Button
                        variant="outline"
                        onClick={() => navigate('/login')}
                        className="h-auto rounded-2xl border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.09]"
                      >
                        Se connecter
                      </Button>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    transition={{
                      delay: 0.8,
                    }}
                    className="mt-8 flex flex-wrap justify-center gap-5 text-xs text-slate-400 dark:text-purple-200/40 lg:justify-start"
                  >
                    <span className="flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-emerald-500" />
                      Sécurisé
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      Rapide
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-violet-500" />
                      Premium
                    </span>
                  </motion.div>
                </div>

                {/* DASHBOARD */}

                <DashboardPreview />
              </div>
            </div>
          </section>

          {/* =========================================================
              STATS
          ========================================================= */}

          <section className="container mx-auto px-4 pb-16 sm:px-6">
            <div className="mx-auto grid max-w-5xl grid-cols-3 gap-3 sm:gap-5">
              {stats.map((stat, index) => {
                const Icon = stat.icon;

                return (
                  <motion.div
                    key={stat.label}
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
                    }}
                    transition={{
                      delay: index * 0.12,
                    }}
                    whileHover={{
                      y: -5,
                    }}
                    className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.035] dark:shadow-none sm:p-6"
                  >
                    <Icon className="mx-auto mb-2 h-5 w-5 text-violet-600 dark:text-violet-400" />

                    <div className="text-xl font-black sm:text-3xl">
                      {stat.value}
                    </div>

                    <div className="mt-1 text-[10px] text-slate-400 dark:text-purple-200/40 sm:text-xs">
                      {stat.label}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* =========================================================
              FEATURES
          ========================================================= */}

          <section className="container mx-auto px-4 py-20 sm:px-6">
            <div className="mx-auto max-w-6xl">

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
                }}
                className="mb-12 text-center"
              >
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-white/[0.04]">
                  <Sparkles className="h-3 w-3 text-violet-500" />

                  <span className="text-[10px] font-bold uppercase tracking-widest text-violet-500">
                    Un seul espace
                  </span>
                </div>

                <h2 className="text-3xl font-black sm:text-4xl lg:text-5xl">
                  Toute votre entreprise.

                  <span className="block bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                    Un seul endroit.
                  </span>
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-slate-500 dark:text-purple-100/45">
                  Finissez avec les outils dispersés. Gestion Vente
                  rassemble les éléments essentiels de votre activité
                  dans une expérience simple, moderne et élégante.
                </p>
              </motion.div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.title}
                      initial={{
                        opacity: 0,
                        y: 40,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{
                        once: true,
                        margin: '-50px',
                      }}
                      transition={{
                        delay: index * 0.08,
                        duration: 0.6,
                      }}
                      whileHover={{
                        y: -8,
                      }}
                      className="group relative"
                    >
                      <div
                        className="absolute -inset-1 rounded-[1.4rem] opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-30"
                        style={{
                          background: item.glow,
                        }}
                      />

                      <div className="relative h-full min-h-[230px] overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white p-6 shadow-sm backdrop-blur-xl transition-colors duration-300 group-hover:border-violet-200 dark:border-white/[0.08] dark:bg-white/[0.035] dark:shadow-none dark:group-hover:border-white/[0.16]">
                        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent dark:via-white/30" />

                        <motion.div
                          whileHover={{
                            rotate: 8,
                            scale: 1.1,
                          }}
                          className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} shadow-xl`}
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </motion.div>

                        <h3 className="mb-2 text-lg font-bold">
                          {item.title}
                        </h3>

                        <p className="text-sm leading-relaxed text-slate-500 dark:text-purple-100/45">
                          {item.description}
                        </p>

                        <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400">
                          Découvrir
                          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* =========================================================
              VISION 360
          ========================================================= */}

          <section className="container mx-auto px-4 py-20 sm:px-6">
            <div className="mx-auto max-w-6xl">

              <div className="grid items-center gap-12 lg:grid-cols-2">

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
                  }}
                >
                  <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-500">
                    <Activity className="h-4 w-4" />
                    Vision globale
                  </div>

                  <h2 className="text-3xl font-black leading-tight sm:text-4xl">
                    Prenez de meilleures décisions avec

                    <span className="block bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                      une vision à 360°.
                    </span>
                  </h2>

                  <p className="mt-5 leading-relaxed text-slate-500 dark:text-purple-100/45">
                    Suivez votre activité depuis un tableau de bord
                    intelligent. Identifiez rapidement ce qui fonctionne,
                    ce qui doit être amélioré et où se trouvent vos
                    prochaines opportunités.
                  </p>

                  <div className="mt-8 grid grid-cols-2 gap-4">
                    {managementItems.map((item) => {
                      const Icon = item.icon;

                      return (
                        <motion.div
                          key={item.title}
                          whileHover={{
                            x: 5,
                          }}
                          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-white/[0.06] dark:bg-white/[0.03]"
                        >
                          <Icon className="h-4 w-4 text-violet-500" />

                          <span className="text-xs font-semibold sm:text-sm">
                            {item.title}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>

                <AnalyticsPreview />
              </div>
            </div>
          </section>

          {/* =========================================================
              CTA
          ========================================================= */}

          {!isAuthenticated && (
            <section className="container mx-auto px-4 py-20 pb-28 sm:px-6">

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                }}
                viewport={{
                  once: true,
                }}
                className="relative mx-auto max-w-5xl"
              >
                <div className="absolute -inset-5 rounded-[3rem] bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-pink-600/20 blur-2xl" />

                <div className="relative overflow-hidden rounded-[2rem] border border-violet-100 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 p-8 text-center dark:border-white/10 dark:from-violet-900/30 dark:via-fuchsia-900/20 dark:to-pink-900/20 sm:p-14">

                  <motion.div
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 25,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="absolute -right-32 -top-32 h-72 w-72 rounded-full border border-violet-400/10"
                  />

                  <motion.div
                    animate={{
                      rotate: [360, 0],
                    }}
                    transition={{
                      duration: 30,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="absolute -bottom-40 -left-20 h-80 w-80 rounded-full border border-fuchsia-400/10"
                  />

                  <div className="relative z-10">

                    <div className="mb-5 flex justify-center">
                      <motion.div
                        animate={{
                          y: [0, -5, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-xl shadow-violet-600/30"
                      >
                        <Crown className="h-6 w-6 text-white" />
                      </motion.div>
                    </div>

                    <h2 className="text-3xl font-black sm:text-4xl">
                      Prêt à passer au niveau supérieur ?
                    </h2>

                    <p className="mx-auto mb-8 mt-4 max-w-xl text-slate-600 dark:text-purple-100/50">
                      Centralisez votre activité, gagnez du temps
                      et concentrez-vous sur ce qui compte vraiment :
                      développer votre entreprise.
                    </p>

                    <motion.button
                      type="button"
                      whileHover={{
                        scale: 1.05,
                        boxShadow:
                          '0 20px 60px rgba(139, 92, 246, 0.35)',
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      onClick={() => navigate('/register')}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 px-8 py-4 font-bold text-white shadow-2xl"
                    >
                      <Sparkles className="h-4 w-4" />

                      Démarrer gratuitement

                      <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </section>
          )}
        </div>
      </main>
    </Layout>
  );
};

/* ===============================================================
   DASHBOARD PREVIEW
=============================================================== */

const DashboardPreview: React.FC = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(
    useTransform(mouseY, [-200, 200], [8, -8]),
    {
      stiffness: 150,
      damping: 20,
    }
  );

  const rotateY = useSpring(
    useTransform(mouseX, [-200, 200], [-8, 8]),
    {
      stiffness: 150,
      damping: 20,
    }
  );

  const handleMouseMove = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();

    mouseX.set(
      event.clientX - rect.left - rect.width / 2
    );

    mouseY.set(
      event.clientY - rect.top - rect.height / 2
    );
  };

  const resetPosition = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const chartValues = [
    30,
    42,
    35,
    58,
    48,
    70,
    62,
    82,
    74,
    92,
    80,
    100,
  ];

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 50,
        scale: 0.9,
      }}
      animate={{
        opacity: 1,
        x: 0,
        scale: 1,
      }}
      transition={{
        delay: 0.4,
        duration: 1,
      }}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1200,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetPosition}
      className="relative mx-auto w-full max-w-xl"
    >
      <div className="absolute -inset-5 rounded-[3rem] bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-pink-600/20 blur-3xl" />

      <div className="relative rounded-[1.7rem] border border-slate-200 bg-white/90 p-4 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#0d0919]/90 sm:p-5">

        {/* Browser header */}

        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>

          <div className="text-[9px] font-semibold text-slate-300 dark:text-white/20">
            GESTION VENTE
          </div>

          <div className="h-2 w-8 rounded-full bg-violet-500/20" />
        </div>

        {/* Dashboard header */}

        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-[9px] text-slate-400 dark:text-white/30">
              Tableau de bord
            </div>

            <div className="mt-1 text-sm font-bold">
              Bonjour 👋
            </div>
          </div>

          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500"
          >
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </motion.div>
        </div>

        {/* Stats */}

        <div className="mb-3 grid grid-cols-3 gap-2">
          {[
            ['24 850 €', 'Ventes'],
            ['8 420 €', 'Bénéfices'],
            ['+24.8%', 'Croissance'],
          ].map(([value, label], index) => (
            <motion.div
              key={label}
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 1 + index * 0.15,
              }}
              className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-white/[0.06] dark:bg-white/[0.035]"
            >
              <div className="text-[8px] text-slate-400">
                {label}
              </div>

              <div className="mt-1 text-xs font-black">
                {value}
              </div>

              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-500/10">
                <motion.div
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${45 + index * 20}%`,
                  }}
                  transition={{
                    delay: 1.2 + index * 0.15,
                    duration: 1,
                  }}
                  className={
                    index === 0
                      ? 'h-full rounded-full bg-violet-500'
                      : index === 1
                        ? 'h-full rounded-full bg-emerald-500'
                        : 'h-full rounded-full bg-pink-500'
                  }
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chart */}

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-white/[0.06] dark:bg-white/[0.025]">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[9px] font-bold">
              Performance des ventes
            </span>

            <span className="text-[8px] font-bold text-emerald-500">
              +18.4%
            </span>
          </div>

          <div className="flex h-28 items-end gap-1.5">
            {chartValues.map((height, index) => (
              <motion.div
                key={index}
                initial={{
                  height: 0,
                }}
                animate={{
                  height: `${height}%`,
                }}
                transition={{
                  delay: 1 + index * 0.05,
                  duration: 0.7,
                  ease: 'easeOut',
                }}
                className={
                  index === chartValues.length - 1
                    ? 'flex-1 rounded-t-sm bg-gradient-to-t from-fuchsia-600 to-violet-400'
                    : 'flex-1 rounded-t-sm bg-gradient-to-t from-violet-600/30 to-violet-400/70'
                }
              />
            ))}
          </div>
        </div>

        {/* Notification */}

        <motion.div
          initial={{
            opacity: 0,
            x: 30,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: 1.8,
          }}
          className="absolute -right-5 top-24 hidden items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#171126]/90 sm:flex"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/15">
            <TrendingUp className="h-3 w-3 text-emerald-500" />
          </div>

          <div>
            <div className="text-[8px] font-bold">
              Nouvelle vente
            </div>

            <div className="text-[7px] text-emerald-500">
              + 450 €
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

/* ===============================================================
   ANALYTICS PREVIEW
=============================================================== */

const AnalyticsPreview: React.FC = () => {
  const values = [
    40,
    48,
    45,
    60,
    55,
    72,
    68,
    82,
    76,
    94,
    86,
    100,
  ];

  return (
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
      }}
      className="relative overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-lg dark:border-white/[0.08] dark:bg-white/[0.035] dark:shadow-none sm:p-7"
    >
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      <div className="mb-7 flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-400 dark:text-white/30">
            Résumé financier
          </div>

          <div className="mt-1 text-2xl font-black">
            42 580 €
          </div>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
          <WalletCards className="h-5 w-5 text-white" />
        </div>
      </div>

      <div className="flex h-36 items-end gap-2">
        {values.map((height, index) => (
          <motion.div
            key={index}
            initial={{
              height: 0,
            }}
            whileInView={{
              height: `${height}%`,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              delay: index * 0.05,
              duration: 0.7,
            }}
            className="flex-1 rounded-t-lg bg-gradient-to-t from-violet-600/30 to-fuchsia-500"
          />
        ))}
      </div>

      <div className="mt-3 flex justify-between text-[9px] text-slate-400 dark:text-white/20">
        <span>Jan</span>
        <span>Fév</span>
        <span>Mar</span>
        <span>Avr</span>
        <span>Mai</span>
        <span>Juin</span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-500/[0.06]">
          <div className="text-[9px] text-emerald-500">
            Bénéfice
          </div>

          <div className="mt-1 text-sm font-black">
            + 12 840 €
          </div>
        </div>

        <div className="rounded-xl bg-violet-50 p-3 dark:bg-violet-500/[0.06]">
          <div className="text-[9px] text-violet-500">
            Objectif
          </div>

          <div className="mt-1 text-sm font-black">
            78%
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HomePage;