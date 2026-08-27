/**
 * AboutPage.tsx
 * Version optimisée Performance
 *
 * Objectifs :
 * - Chargement rapide
 * - Très léger sur mobile / tablette
 * - Aucun Framer Motion
 * - Aucun background animé
 * - Aucun particle system
 * - Aucun backdrop-blur lourd
 * - Moins de DOM
 * - Design premium conservé
 * - Responsive
 */

import React from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';

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
      'Une expérience claire, intuitive et agréable, même lorsque votre activité devient complexe.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Zap,
    title: 'Performance',
    description:
      'Des outils rapides et fluides pour travailler efficacement sans perdre de temps.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: ShieldCheck,
    title: 'Sécurité',
    description:
      'Une infrastructure fiable avec une protection pensée dès la conception.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Target,
    title: 'Précision',
    description:
      'Des informations structurées pour prendre de meilleures décisions au quotidien.',
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
    description:
      'Une architecture pensée pour protéger votre environnement.',
  },
  {
    icon: Lock,
    title: 'Confidentialité',
    description:
      'Vos informations restent au cœur de notre conception.',
  },
  {
    icon: Database,
    title: 'Données structurées',
    description:
      'Une organisation claire pour retrouver rapidement l’essentiel.',
  },
];

const dashboardCards = [
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
];

const workspaceItems = [
  'Une vision globale de votre activité',
  'Des outils connectés entre eux',
  'Une interface simple et intuitive',
  'Une expérience pensée pour évoluer avec vous',
];

const approachItems = [
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
];

/* =========================================================
   SMALL COMPONENTS
========================================================= */

interface SectionTitleProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  center?: boolean;
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  eyebrow,
  title,
  description,
  center = false,
}) => {
  return (
    <div
      className={
        center
          ? 'mx-auto max-w-3xl text-center'
          : 'max-w-2xl'
      }
    >
      {eyebrow && (
        <div
          className={`flex items-center gap-2 ${
            center ? 'justify-center' : ''
          }`}
        >
          <Sparkles className="h-4 w-4 text-violet-600 dark:text-fuchsia-400" />

          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet-600 dark:text-fuchsia-400">
            {eyebrow}
          </span>
        </div>
      )}

      <h2
        className="
          mt-4
          text-3xl
          font-black
          leading-tight
          tracking-tight
          text-slate-900
          dark:text-white
          sm:text-4xl
          lg:text-5xl
        "
      >
        {title}
      </h2>

      {description && (
        <p
          className="
            mt-5
            text-base
            leading-relaxed
            text-slate-600
            dark:text-white/45
            sm:text-lg
          "
        >
          {description}
        </p>
      )}
    </div>
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const AboutPage: React.FC = () => {
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
          text-slate-900
          dark:bg-[#03040a]
          dark:text-white
        "
      >
        {/* =====================================================
            LIGHT BACKGROUND
        ====================================================== */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            overflow-hidden
          "
        >
          <div
            className="
              absolute
              -left-32
              -top-32
              h-72
              w-72
              rounded-full
              bg-violet-400/10
              blur-3xl
              dark:bg-violet-600/10
            "
          />

          <div
            className="
              absolute
              -right-32
              top-[35%]
              h-72
              w-72
              rounded-full
              bg-cyan-400/10
              blur-3xl
              dark:bg-cyan-600/10
            "
          />
        </div>

        {/* =====================================================
            HERO
        ====================================================== */}

        <section
          className="
            relative
            z-10
            px-4
            pb-16
            pt-12
            sm:px-6
            sm:pb-20
            sm:pt-16
            lg:px-8
            lg:pb-28
            lg:pt-24
          "
        >
          <div className="mx-auto max-w-7xl">
            <div
              className="
                grid
                items-center
                gap-10
                lg:grid-cols-[1.05fr_0.95fr]
                lg:gap-16
              "
            >
              {/* HERO TEXT */}

              <div>
                {/* Badge */}

                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-slate-900/10
                    bg-white
                    px-3
                    py-2
                    shadow-sm
                    dark:border-white/10
                    dark:bg-white/[0.04]
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
                    "
                  >
                    <Gem className="h-3.5 w-3.5 text-white" />
                  </span>

                  <span className="text-xs font-bold text-slate-700 dark:text-white/80 sm:text-sm">
                    Premium Business Suite
                  </span>

                  <Sparkles className="h-4 w-4 text-fuchsia-500" />
                </div>

                {/* Heading */}

                <h1
                  className="
                    mt-7
                    max-w-4xl
                    text-[2.75rem]
                    font-black
                    leading-[0.98]
                    tracking-[-0.045em]
                    text-slate-900
                    dark:text-white
                    sm:text-6xl
                    lg:text-7xl
                    xl:text-[78px]
                  "
                >
                  Une nouvelle façon de gérer votre

                  <span
                    className="
                      mt-2
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
                    mt-6
                    max-w-2xl
                    text-base
                    leading-relaxed
                    text-slate-600
                    dark:text-white/50
                    sm:mt-7
                    sm:text-lg
                  "
                >
                  Nous imaginons une expérience de gestion
                  commerciale plus simple, plus élégante et plus
                  intelligente — pour vous permettre de consacrer
                  votre énergie à votre activité.
                </p>

                {/* CTA */}

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button
                      className="
                        h-13
                        w-full
                        rounded-2xl
                        border-0
                        bg-gradient-to-r
                        from-violet-600
                        via-fuchsia-600
                        to-cyan-500
                        px-6
                        text-sm
                        font-bold
                        text-white
                        shadow-lg
                        shadow-violet-500/20
                        sm:h-14
                        sm:px-7
                        sm:text-base
                      "
                    >
                      <Rocket className="mr-2 h-5 w-5" />

                      Commencer maintenant

                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>

                  <Link to="/login" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="
                        h-13
                        w-full
                        rounded-2xl
                        border-slate-900/10
                        bg-white
                        px-6
                        text-sm
                        font-semibold
                        text-slate-800
                        sm:h-14
                        sm:px-7
                        sm:text-base
                        dark:border-white/[0.08]
                        dark:bg-white/[0.035]
                        dark:text-white
                      "
                    >
                      Découvrir la plateforme

                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                {/* Stats */}

                <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                  {stats.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="
                          rounded-2xl
                          border
                          border-slate-900/10
                          bg-white
                          px-3
                          py-3
                          dark:border-white/[0.08]
                          dark:bg-white/[0.035]
                        "
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 shrink-0 text-violet-600 dark:text-fuchsia-400" />

                          <div className="min-w-0">
                            <div className="text-sm font-black text-slate-900 dark:text-white">
                              {item.value}
                            </div>

                            <div className="truncate text-[10px] text-slate-500 dark:text-white/40">
                              {item.label}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* HERO DASHBOARD */}

              <div className="relative mx-auto w-full max-w-xl">
                <div
                  className="
                    absolute
                    -inset-3
                    rounded-[32px]
                    bg-gradient-to-r
                    from-violet-500/10
                    via-fuchsia-500/10
                    to-cyan-500/10
                    blur-2xl
                  "
                  aria-hidden="true"
                />

                <div
                  className="
                    relative
                    overflow-hidden
                    rounded-[28px]
                    border
                    border-slate-900/10
                    bg-white
                    p-4
                    shadow-xl
                    shadow-slate-900/5
                    dark:border-white/[0.08]
                    dark:bg-[#0b0b14]
                    dark:shadow-black/30
                    sm:rounded-[32px]
                    sm:p-6
                  "
                >
                  {/* Header */}

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold tracking-wide text-slate-400 dark:text-white/35">
                        BUSINESS OVERVIEW
                      </div>

                      <div className="mt-1 text-lg font-black text-slate-900 dark:text-white sm:text-xl">
                        Votre activité
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
                        from-violet-600
                        via-fuchsia-500
                        to-cyan-500
                        sm:h-11
                        sm:w-11
                        sm:rounded-2xl
                      "
                    >
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  {/* Performance */}

                  <div
                    className="
                      mt-5
                      rounded-2xl
                      border
                      border-slate-900/10
                      bg-slate-50
                      p-4
                      dark:border-white/[0.07]
                      dark:bg-white/[0.035]
                      sm:mt-6
                      sm:rounded-3xl
                      sm:p-5
                    "
                  >
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <div className="text-xs text-slate-500 dark:text-white/35">
                          Performance
                        </div>

                        <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
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

                    {/* Static graph */}

                    <div className="mt-5 flex h-28 items-end gap-1.5 sm:h-36 sm:gap-2">
                      {[28, 42, 35, 58, 49, 70, 63, 84, 76, 96].map(
                        (height, index) => (
                          <div
                            key={index}
                            className="
                              flex-1
                              rounded-t-md
                              bg-gradient-to-t
                              from-violet-600
                              via-fuchsia-500
                              to-cyan-400
                              opacity-80
                            "
                            style={{ height: `${height}%` }}
                          />
                        )
                      )}
                    </div>
                  </div>

                  {/* Cards */}

                  <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3">
                    {dashboardCards.map((item) => {
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.title}
                          className="
                            rounded-xl
                            border
                            border-slate-900/10
                            bg-white
                            p-3
                            dark:border-white/[0.07]
                            dark:bg-white/[0.035]
                            sm:rounded-2xl
                            sm:p-4
                          "
                        >
                          <div
                            className={`
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-lg
                              bg-gradient-to-br
                              ${item.color}
                              sm:h-9
                              sm:w-9
                              sm:rounded-xl
                            `}
                          >
                            <Icon className="h-4 w-4 text-white" />
                          </div>

                          <div className="mt-2 text-xs font-bold text-slate-900 dark:text-white sm:mt-3">
                            {item.title}
                          </div>

                          <div className="mt-1 text-[10px] text-slate-500 dark:text-white/35">
                            {item.value}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
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
            py-16
            sm:px-6
            sm:py-20
            lg:px-8
            lg:py-24
          "
        >
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Notre vision"
              center
              title={
                <>
                  Une plateforme conçue autour de{' '}
                  <span
                    className="
                      bg-gradient-to-r
                      from-violet-600
                      via-fuchsia-500
                      to-cyan-500
                      bg-clip-text
                      text-transparent
                    "
                  >
                    vous.
                  </span>
                </>
              }
              description="Notre objectif est simple : réunir les outils essentiels de votre activité dans une expérience cohérente, moderne et agréable à utiliser."
            />

            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
              {values.map((value) => {
                const Icon = value.icon;

                return (
                  <div
                    key={value.title}
                    className="
                      rounded-3xl
                      border
                      border-slate-900/10
                      bg-white
                      p-5
                      shadow-sm
                      dark:border-white/[0.07]
                      dark:bg-white/[0.035]
                      dark:shadow-none
                      sm:p-6
                    "
                  >
                    <div
                      className={`
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        bg-gradient-to-br
                        ${value.color}
                        shadow-md
                      `}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>

                    <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">
                      {value.title}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-white/40">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================
            STORY
        ====================================================== */}

        <section
          className="
            relative
            z-10
            px-4
            py-16
            sm:px-6
            sm:py-20
            lg:px-8
            lg:py-24
          "
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              {/* Workspace */}

              <div>
                <div
                  className="
                    rounded-[28px]
                    border
                    border-slate-900/10
                    bg-white
                    p-5
                    shadow-lg
                    shadow-slate-900/5
                    dark:border-white/[0.08]
                    dark:bg-[#0b0b14]
                    dark:shadow-black/20
                    sm:rounded-[32px]
                    sm:p-7
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        bg-gradient-to-br
                        from-violet-600
                        via-fuchsia-500
                        to-cyan-500
                      "
                    >
                      <Settings2 className="h-5 w-5 text-white" />
                    </div>

                    <div>
                      <div className="text-[10px] font-bold tracking-wide text-slate-400 dark:text-white/35">
                        SMART WORKSPACE
                      </div>

                      <div className="text-base font-black text-slate-900 dark:text-white sm:text-lg">
                        Tout au même endroit
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2.5">
                    {workspaceItems.map((text) => (
                      <div
                        key={text}
                        className="
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          border
                          border-slate-900/10
                          bg-slate-50
                          px-3
                          py-3
                          dark:border-white/[0.07]
                          dark:bg-white/[0.035]
                          sm:rounded-2xl
                          sm:px-4
                          sm:py-4
                        "
                      >
                        <div
                          className="
                            flex
                            h-7
                            w-7
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-emerald-500/10
                            dark:bg-emerald-500/15
                          "
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>

                        <span className="text-xs font-medium text-slate-700 dark:text-white/65 sm:text-sm">
                          {text}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div
                    className="
                      mt-5
                      rounded-xl
                      border
                      border-violet-500/10
                      bg-violet-500/5
                      p-4
                      sm:rounded-2xl
                      sm:p-5
                    "
                  >
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 shrink-0 fill-amber-400 text-amber-400" />

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
              </div>

              {/* Text */}

              <div>
                <div className="flex items-center gap-2">
                  <span className="h-px w-8 bg-gradient-to-r from-violet-500 to-fuchsia-500" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600 dark:text-fuchsia-400">
                    Notre approche
                  </span>
                </div>

                <h2
                  className="
                    mt-4
                    text-3xl
                    font-black
                    leading-tight
                    tracking-tight
                    text-slate-900
                    dark:text-white
                    sm:text-4xl
                    lg:text-5xl
                  "
                >
                  La puissance sans la complexité.
                </h2>

                <p className="mt-5 text-base leading-relaxed text-slate-600 dark:text-white/45 sm:text-lg">
                  Une bonne solution de gestion ne devrait pas
                  vous demander de devenir expert de l'outil.
                  Elle doit simplement vous aider à travailler
                  mieux.
                </p>

                <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-white/45 sm:text-lg">
                  Nous privilégions une interface claire, des
                  informations bien organisées et une expérience
                  fluide, tout en conservant la puissance
                  nécessaire pour accompagner une activité
                  professionnelle.
                </p>

                <div className="mt-7 grid gap-2 sm:grid-cols-2 sm:gap-3">
                  {approachItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.text}
                        className="
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          border
                          border-slate-900/10
                          bg-white
                          px-3
                          py-3
                          dark:border-white/[0.07]
                          dark:bg-white/[0.035]
                        "
                      >
                        <Icon className="h-4 w-4 shrink-0 text-violet-600 dark:text-fuchsia-400" />

                        <span className="text-xs font-semibold text-slate-700 dark:text-white/60">
                          {item.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
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
            py-16
            sm:px-6
            sm:py-20
            lg:px-8
            lg:py-24
          "
        >
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <SectionTitle
                eyebrow="Un écosystème complet"
                title="Tout ce dont votre activité a besoin."
              />

              <p className="max-w-md text-sm leading-relaxed text-slate-500 dark:text-white/40 lg:text-right">
                Une suite d'outils réunis dans une seule
                expérience pour simplifier votre quotidien.
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="
                      rounded-3xl
                      border
                      border-slate-900/10
                      bg-white
                      p-5
                      shadow-sm
                      dark:border-white/[0.07]
                      dark:bg-white/[0.035]
                      dark:shadow-none
                    "
                  >
                    <div
                      className={`
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        bg-gradient-to-br
                        ${feature.color}
                      `}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>

                    <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">
                      {feature.title}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-white/35">
                      {feature.description}
                    </p>

                    <div className="mt-4 flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-fuchsia-400">
                      Découvrir
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
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
            py-16
            sm:px-6
            sm:py-20
            lg:px-8
            lg:py-24
          "
        >
          <div className="mx-auto max-w-7xl">
            <div
              className="
                overflow-hidden
                rounded-[28px]
                border
                border-slate-900/10
                bg-white
                p-5
                shadow-lg
                shadow-slate-900/5
                dark:border-white/[0.08]
                dark:bg-white/[0.035]
                dark:shadow-black/20
                sm:rounded-[32px]
                sm:p-8
                lg:p-12
              "
            >
              <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-12">
                <div>
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-xl
                      bg-gradient-to-br
                      from-violet-600
                      via-fuchsia-500
                      to-cyan-500
                    "
                  >
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>

                  <h2
                    className="
                      mt-5
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

                  <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 dark:text-white/45">
                    Parce que votre activité et vos données sont
                    essentielles, nous intégrons la sécurité
                    directement dans l'expérience produit.
                  </p>
                </div>

                <div className="grid gap-2.5">
                  {securityItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="
                          flex
                          gap-3
                          rounded-xl
                          border
                          border-slate-900/10
                          bg-slate-50
                          p-3
                          dark:border-white/[0.07]
                          dark:bg-white/[0.035]
                          sm:gap-4
                          sm:rounded-2xl
                          sm:p-4
                        "
                      >
                        <div
                          className="
                            flex
                            h-10
                            w-10
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
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
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
            pb-16
            pt-12
            sm:px-6
            sm:pb-20
            sm:pt-16
            lg:px-8
            lg:pb-24
          "
        >
          <div className="mx-auto max-w-5xl">
            <div
              className="
                relative
                overflow-hidden
                rounded-[30px]
                border
                border-slate-900/10
                bg-white
                px-5
                py-12
                text-center
                shadow-xl
                shadow-slate-900/5
                dark:border-white/[0.09]
                dark:bg-[#0b0b14]
                dark:shadow-black/30
                sm:rounded-[36px]
                sm:px-10
                sm:py-14
              "
            >
              {/* Static glow */}

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-1/2
                  h-64
                  w-64
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                  bg-violet-500/10
                  blur-3xl
                "
              />

              <div className="relative">
                <div
                  className="
                    mx-auto
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    bg-gradient-to-br
                    from-violet-600
                    via-fuchsia-500
                    to-cyan-500
                  "
                >
                  <Rocket className="h-6 w-6 text-white" />
                </div>

                <h2
                  className="
                    mx-auto
                    mt-6
                    max-w-3xl
                    text-3xl
                    font-black
                    leading-tight
                    tracking-tight
                    text-slate-900
                    dark:text-white
                    sm:text-4xl
                    lg:text-5xl
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

                <p
                  className="
                    mx-auto
                    mt-4
                    max-w-2xl
                    text-sm
                    leading-relaxed
                    text-slate-500
                    dark:text-white/40
                    sm:text-base
                  "
                >
                  Découvrez une nouvelle expérience de gestion
                  pensée pour vous faire gagner du temps et garder
                  le contrôle de votre activité.
                </p>

                <div className="mt-7 flex justify-center">
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button
                      className="
                        h-13
                        w-full
                        rounded-2xl
                        border-0
                        bg-gradient-to-r
                        from-violet-600
                        via-fuchsia-600
                        to-cyan-500
                        px-7
                        text-sm
                        font-bold
                        text-white
                        shadow-lg
                        shadow-violet-500/20
                        sm:h-14
                        sm:w-auto
                        sm:px-8
                        sm:text-base
                      "
                    >
                      Créer mon compte

                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>

                <div
                  className="
                    mt-6
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

                  <span>
                    Une expérience moderne, sécurisée et accessible.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            BRANDING
        ====================================================== */}

        <div
          className="
            relative
            z-10
            flex
            flex-wrap
            items-center
            justify-center
            gap-2
            px-4
            pb-7
            text-center
            text-[10px]
            font-medium
            text-slate-400
            dark:text-white/25
          "
        >
          <Sparkles className="h-3 w-3 text-violet-500 dark:text-fuchsia-400" />

          <span>Gestion Vente Premium</span>

          <span>•</span>

          <Globe className="h-3 w-3" />

          <span>Cloud Business Suite</span>
        </div>
      </main>
    </Layout>
  );
};

export default AboutPage;