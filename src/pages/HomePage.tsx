import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import SEOHead from '@/components/SEOHead';

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

const features = [
  {
    icon: BarChart3,
    title: 'Suivi des ventes',
    description:
      'Visualisez vos ventes, votre chiffre d’affaires, vos performances et leur évolution en temps réel.',
    gradient: 'from-violet-500 to-indigo-500',
  },
  {
    icon: Calculator,
    title: 'Comptabilité',
    description:
      'Gardez une vision claire de vos revenus, dépenses, bénéfices et mouvements financiers.',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: CalendarDays,
    title: 'Rendez-vous',
    description:
      'Organisez vos rendez-vous et ne manquez plus aucune opportunité commerciale.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: CheckSquare,
    title: 'Tâches',
    description:
      'Planifiez vos tâches, vos priorités et vos actions pour garder votre activité sous contrôle.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Package,
    title: 'Gestion des stocks',
    description:
      'Suivez vos produits et vos stocks pour éviter les ruptures et mieux anticiper.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Users,
    title: 'Gestion des clients',
    description:
      'Centralisez vos clients et développez une relation commerciale plus efficace.',
    gradient: 'from-blue-500 to-violet-500',
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

      <main className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-[#05030d] dark:text-white">

        {/* =========================================================
            LIGHTWEIGHT BACKGROUND
        ========================================================= */}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {/* Violet glow */}
          <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl dark:bg-violet-700/10" />

          {/* Pink glow */}
          <div className="absolute -right-32 top-[25%] h-72 w-72 rounded-full bg-fuchsia-400/10 blur-3xl dark:bg-fuchsia-700/10" />

          {/* Bottom glow */}
          <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-400/5 blur-3xl dark:bg-indigo-700/10" />

          {/* Very subtle grid */}
          <div
            className="
              absolute inset-0
              opacity-[0.025]
              dark:opacity-[0.018]
              bg-[linear-gradient(rgba(120,100,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(120,100,255,1)_1px,transparent_1px)]
              bg-[size:64px_64px]
            "
          />
        </div>

        <div className="relative z-10">

          {/* =========================================================
              HERO
          ========================================================= */}

          <section className="container mx-auto px-4 pb-14 pt-16 sm:px-6 sm:pb-20 sm:pt-24 lg:pt-28">
            <div className="mx-auto max-w-6xl">

              <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">

                {/* HERO TEXT */}

                <div className="text-center lg:text-left">

                  {/* Badge */}

                  <div
                    className="
                      mb-6
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-purple-100
                      bg-white/80
                      px-4
                      py-2
                      shadow-sm
                      dark:border-white/10
                      dark:bg-white/[0.04]
                    "
                  >
                    <Crown className="h-3.5 w-3.5 text-amber-400" />

                    <span className="text-[11px] font-semibold tracking-wide text-purple-700 dark:text-purple-200">
                      LA NOUVELLE GÉNÉRATION DE GESTION
                    </span>

                    <Sparkles className="h-3.5 w-3.5 text-fuchsia-400" />
                  </div>

                  {/* Title */}

                  <h1
                    className="
                      text-4xl
                      font-black
                      leading-[0.98]
                      tracking-tight
                      sm:text-5xl
                      lg:text-6xl
                      xl:text-7xl
                    "
                  >
                    Gérez votre activité.

                    <span className="mt-3 block bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                      Développez votre avenir.
                    </span>
                  </h1>

                  {/* Description */}

                  <p
                    className="
                      mx-auto
                      mt-6
                      max-w-2xl
                      text-base
                      leading-relaxed
                      text-slate-600
                      dark:text-purple-100/55
                      sm:mt-7
                      sm:text-lg
                      lg:mx-0
                    "
                  >
                    Une plateforme tout-en-un pour piloter vos{' '}
                    <strong className="text-slate-900 dark:text-white">
                      ventes, votre comptabilité, vos rendez-vous, vos
                      tâches, vos stocks et vos clients.
                    </strong>
                  </p>

                  {/* Buttons */}

                  {!isAuthenticated && (
                    <div
                      className="
                        mt-8
                        flex
                        flex-col
                        justify-center
                        gap-3
                        sm:flex-row
                        lg:justify-start
                      "
                    >
                      <button
                        type="button"
                        onClick={() => navigate('/register')}
                        className="
                          group
                          relative
                          inline-flex
                          min-h-12
                          items-center
                          justify-center
                          gap-2
                          rounded-2xl
                          bg-gradient-to-r
                          from-violet-600
                          via-fuchsia-600
                          to-pink-600
                          px-7
                          py-3.5
                          text-sm
                          font-bold
                          text-white
                          shadow-lg
                          shadow-violet-600/20
                          transition-transform
                          duration-200
                          hover:scale-[1.02]
                          active:scale-[0.98]
                        "
                      >
                        <Sparkles className="h-4 w-4" />

                        Commencer gratuitement

                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </button>

                      <Button
                        variant="outline"
                        onClick={() => navigate('/login')}
                        className="
                          min-h-12
                          rounded-2xl
                          border-slate-200
                          bg-white
                          px-7
                          py-3.5
                          text-sm
                          font-semibold
                          text-slate-800
                          shadow-sm
                          hover:bg-slate-100
                          dark:border-white/10
                          dark:bg-white/[0.04]
                          dark:text-white
                          dark:hover:bg-white/[0.08]
                        "
                      >
                        Se connecter
                      </Button>
                    </div>
                  )}

                  {/* Trust */}

                  <div
                    className="
                      mt-7
                      flex
                      flex-wrap
                      justify-center
                      gap-x-5
                      gap-y-2
                      text-xs
                      text-slate-400
                      dark:text-purple-200/40
                      lg:justify-start
                    "
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
                  </div>
                </div>

                {/* DASHBOARD */}

                <DashboardPreview />
              </div>
            </div>
          </section>

          {/* =========================================================
              STATS
          ========================================================= */}

          <section className="container mx-auto px-4 pb-14 sm:px-6 sm:pb-20">
            <div className="mx-auto grid max-w-5xl grid-cols-3 gap-2.5 sm:gap-5">

              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      p-3
                      text-center
                      shadow-sm
                      dark:border-white/[0.08]
                      dark:bg-white/[0.035]
                      sm:p-6
                    "
                  >
                    <Icon className="mx-auto mb-2 h-5 w-5 text-violet-600 dark:text-violet-400" />

                    <div className="text-xl font-black sm:text-3xl">
                      {stat.value}
                    </div>

                    <div className="mt-1 text-[10px] text-slate-400 dark:text-purple-200/40 sm:text-xs">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* =========================================================
              FEATURES
          ========================================================= */}

          <section className="container mx-auto px-4 py-16 sm:px-6 sm:py-20">
            <div className="mx-auto max-w-6xl">

              <div className="mb-10 text-center sm:mb-12">

                <div
                  className="
                    mb-4
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-slate-200
                    bg-white
                    px-3
                    py-1.5
                    dark:border-white/10
                    dark:bg-white/[0.04]
                  "
                >
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

                <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base dark:text-purple-100/45">
                  Finissez avec les outils dispersés. Gestion Vente
                  rassemble les éléments essentiels de votre activité
                  dans une expérience simple, moderne et élégante.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">

                {features.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="
                        group
                        relative
                        overflow-hidden
                        rounded-[1.4rem]
                        border
                        border-slate-200
                        bg-white
                        p-5
                        shadow-sm
                        transition
                        duration-200
                        hover:-translate-y-1
                        hover:border-violet-200
                        hover:shadow-md
                        dark:border-white/[0.08]
                        dark:bg-white/[0.035]
                        dark:shadow-none
                        dark:hover:border-white/[0.16]
                        sm:p-6
                      "
                    >
                      {/* Top line */}

                      <div
                        aria-hidden="true"
                        className="
                          absolute
                          left-0
                          right-0
                          top-0
                          h-px
                          bg-gradient-to-r
                          from-transparent
                          via-violet-500/40
                          to-transparent
                        "
                      />

                      {/* Icon */}

                      <div
                        className={`
                          mb-5
                          flex
                          h-12
                          w-12
                          items-center
                          justify-center
                          rounded-2xl
                          bg-gradient-to-br
                          ${item.gradient}
                          shadow-lg
                        `}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>

                      <h3 className="mb-2 text-lg font-bold">
                        {item.title}
                      </h3>

                      <p className="text-sm leading-relaxed text-slate-500 dark:text-purple-100/45">
                        {item.description}
                      </p>

                      <div
                        className="
                          mt-5
                          flex
                          items-center
                          gap-1
                          text-xs
                          font-semibold
                          text-violet-600
                          dark:text-violet-400
                        "
                      >
                        Découvrir

                        <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* =========================================================
              VISION 360
          ========================================================= */}

          <section className="container mx-auto px-4 py-16 sm:px-6 sm:py-20">
            <div className="mx-auto max-w-6xl">

              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">

                {/* TEXT */}

                <div>

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

                  <p className="mt-5 text-sm leading-relaxed text-slate-500 sm:text-base dark:text-purple-100/45">
                    Suivez votre activité depuis un tableau de bord
                    intelligent. Identifiez rapidement ce qui fonctionne,
                    ce qui doit être amélioré et où se trouvent vos
                    prochaines opportunités.
                  </p>

                  <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4">

                    {managementItems.map((item) => {
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.title}
                          className="
                            flex
                            items-center
                            gap-3
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            p-3
                            shadow-sm
                            dark:border-white/[0.06]
                            dark:bg-white/[0.03]
                            dark:shadow-none
                          "
                        >
                          <Icon className="h-4 w-4 shrink-0 text-violet-500" />

                          <span className="text-xs font-semibold sm:text-sm">
                            {item.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ANALYTICS */}

                <AnalyticsPreview />
              </div>
            </div>
          </section>

          {/* =========================================================
              CTA
          ========================================================= */}

          {!isAuthenticated && (
            <section className="container mx-auto px-4 py-16 pb-24 sm:px-6 sm:py-20 sm:pb-28">

              <div className="relative mx-auto max-w-5xl">

                {/* Lightweight glow */}

                <div
                  aria-hidden="true"
                  className="
                    absolute
                    -inset-2
                    rounded-[2rem]
                    bg-gradient-to-r
                    from-violet-600/10
                    via-fuchsia-600/10
                    to-pink-600/10
                    blur-xl
                  "
                />

                <div
                  className="
                    relative
                    overflow-hidden
                    rounded-[2rem]
                    border
                    border-violet-100
                    bg-gradient-to-br
                    from-violet-50
                    via-fuchsia-50
                    to-pink-50
                    p-7
                    text-center
                    dark:border-white/10
                    dark:from-violet-900/30
                    dark:via-fuchsia-900/20
                    dark:to-pink-900/20
                    sm:p-14
                  "
                >

                  {/* Static decorative circles */}

                  <div
                    aria-hidden="true"
                    className="
                      absolute
                      -right-20
                      -top-20
                      h-48
                      w-48
                      rounded-full
                      border
                      border-violet-400/10
                    "
                  />

                  <div
                    aria-hidden="true"
                    className="
                      absolute
                      -bottom-24
                      -left-10
                      h-56
                      w-56
                      rounded-full
                      border
                      border-fuchsia-400/10
                    "
                  />

                  <div className="relative z-10">

                    <div className="mb-5 flex justify-center">
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
                          to-fuchsia-600
                          shadow-lg
                          shadow-violet-600/20
                        "
                      >
                        <Crown className="h-6 w-6 text-white" />
                      </div>
                    </div>

                    <h2 className="text-3xl font-black sm:text-4xl">
                      Prêt à passer au niveau supérieur ?
                    </h2>

                    <p className="mx-auto mb-8 mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-purple-100/50">
                      Centralisez votre activité, gagnez du temps
                      et concentrez-vous sur ce qui compte vraiment :
                      développer votre entreprise.
                    </p>

                    <button
                      type="button"
                      onClick={() => navigate('/register')}
                      className="
                        inline-flex
                        min-h-12
                        items-center
                        gap-2
                        rounded-2xl
                        bg-gradient-to-r
                        from-violet-600
                        via-fuchsia-600
                        to-pink-600
                        px-8
                        py-4
                        font-bold
                        text-white
                        shadow-lg
                        shadow-violet-600/20
                        transition
                        duration-200
                        hover:scale-[1.02]
                        active:scale-[0.98]
                      "
                    >
                      <Sparkles className="h-4 w-4" />

                      Démarrer gratuitement

                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
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
    <div className="relative mx-auto w-full max-w-xl">

      {/* Glow léger */}

      <div
        aria-hidden="true"
        className="
          absolute
          -inset-3
          rounded-[2.5rem]
          bg-gradient-to-r
          from-violet-600/10
          via-fuchsia-600/10
          to-pink-600/10
          blur-2xl
        "
      />

      <div
        className="
          relative
          rounded-[1.7rem]
          border
          border-slate-200
          bg-white
          p-4
          shadow-xl
          dark:border-white/10
          dark:bg-[#0d0919]
          sm:p-5
        "
      >

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

          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-xl
              bg-gradient-to-br
              from-violet-500
              to-fuchsia-500
            "
          >
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
        </div>

        {/* Stats */}

        <div className="mb-3 grid grid-cols-3 gap-2">

          {[
            ['24 850 €', 'Ventes'],
            ['8 420 €', 'Bénéfices'],
            ['+24.8%', 'Croissance'],
          ].map(([value, label], index) => (
            <div
              key={label}
              className="
                rounded-xl
                border
                border-slate-100
                bg-slate-50
                p-3
                dark:border-white/[0.06]
                dark:bg-white/[0.035]
              "
            >
              <div className="text-[8px] text-slate-400">
                {label}
              </div>

              <div className="mt-1 text-xs font-black">
                {value}
              </div>

              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-500/10">
                <div
                  className={`
                    h-full
                    rounded-full
                    ${
                      index === 0
                        ? 'bg-violet-500'
                        : index === 1
                          ? 'bg-emerald-500'
                          : 'bg-pink-500'
                    }
                  `}
                  style={{
                    width: `${45 + index * 20}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}

        <div
          className="
            rounded-xl
            border
            border-slate-100
            bg-slate-50
            p-3
            dark:border-white/[0.06]
            dark:bg-white/[0.025]
          "
        >
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
              <div
                key={index}
                className={`
                  flex-1
                  rounded-t-sm
                  ${
                    index === chartValues.length - 1
                      ? 'bg-gradient-to-t from-fuchsia-600 to-violet-400'
                      : 'bg-gradient-to-t from-violet-600/30 to-violet-400/70'
                  }
                `}
                style={{
                  height: `${height}%`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Notification */}

        <div
          className="
            absolute
            -right-5
            top-24
            hidden
            items-center
            gap-2
            rounded-xl
            border
            border-slate-200
            bg-white
            px-3
            py-2
            shadow-lg
            dark:border-white/10
            dark:bg-[#171126]
            sm:flex
          "
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
        </div>
      </div>
    </div>
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
    <div
      className="
        relative
        overflow-hidden
        rounded-[1.7rem]
        border
        border-slate-200
        bg-white
        p-5
        shadow-lg
        dark:border-white/[0.08]
        dark:bg-white/[0.035]
        dark:shadow-none
        sm:p-7
      "
    >
      <div
        aria-hidden="true"
        className="
          absolute
          left-0
          right-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-violet-500/50
          to-transparent
        "
      />

      {/* Header */}

      <div className="mb-7 flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-400 dark:text-white/30">
            Résumé financier
          </div>

          <div className="mt-1 text-2xl font-black">
            42 580 €
          </div>
        </div>

        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-gradient-to-br
            from-emerald-500
            to-teal-500
          "
        >
          <WalletCards className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Chart */}

      <div className="flex h-36 items-end gap-2">
        {values.map((height, index) => (
          <div
            key={index}
            className="
              flex-1
              rounded-t-lg
              bg-gradient-to-t
              from-violet-600/30
              to-fuchsia-500
            "
            style={{
              height: `${height}%`,
            }}
          />
        ))}
      </div>

      {/* Months */}

      <div className="mt-3 flex justify-between text-[9px] text-slate-400 dark:text-white/20">
        <span>Jan</span>
        <span>Fév</span>
        <span>Mar</span>
        <span>Avr</span>
        <span>Mai</span>
        <span>Juin</span>
      </div>

      {/* Financial stats */}

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
    </div>
  );
};

export default HomePage;