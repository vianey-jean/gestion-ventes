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
} from 'lucide-react';
import { motion } from 'framer-motion';
import SEOHead from '@/components/SEOHead';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      <SEOHead
        title="Accueil"
        description="Gestion Vente : solution premium de gestion commerciale. Pilotez vos ventes, stocks et profits avec précision et élégance."
        canonical="https://riziky-boutic.vercel.app/"
      />

      <div className="min-h-[50vh] relative bg-gradient-to-br from-slate-900 via-purple-950/60 to-indigo-950 overflow-hidden">

        {/* Animated orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">

          <motion.div
            animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 -left-32 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[120px]"
          />

          <motion.div
            animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/3 -right-32 w-[350px] h-[350px] bg-pink-500/15 rounded-full blur-[120px]"
          />

          <motion.div
            animate={{ y: [0, 60, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-full blur-[120px]"
          />

          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -100, 0], opacity: [0.2, 0.6, 0.2] }}
              transition={{
                duration: 6 + i * 1.2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeInOut',
              }}
              className="absolute w-1 h-1 bg-purple-300/40 rounded-full"
              style={{
                left: `${8 + i * 9}%`,
                top: `${10 + i * 7}%`,
              }}
            />
          ))}
        </div>

        {/* Grid */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

        <div className="relative z-10">

          {/* HERO */}
          <section className="container mx-auto px-4 sm:px-6 min-h-[50vh] flex items-center py-10">

            <div className="w-full text-center">

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 bg-white/[0.05] backdrop-blur-xl rounded-full border border-white/[0.08] shadow-lg"
              >
                <Crown className="h-3 w-3 text-amber-400" />

                <span className="text-xs font-medium text-purple-300/80">
                  Solution premium de gestion commerciale
                </span>

                <Sparkles className="h-3 w-3 text-purple-400" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 40, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 leading-tight drop-shadow-[0_4px_20px_rgba(139,92,246,0.35)]"
              >
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Gestion de vente
                </span>

                <span className="block mt-2 text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  Simplifiée. Puissante. Élégante.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-2xl mx-auto text-sm sm:text-base text-purple-200/60 leading-relaxed mb-7"
              >
                Une plateforme moderne pensée pour les entrepreneurs exigeants.
                Pilotez vos ventes, stocks et profits avec précision et élégance.
              </motion.p>

              {!isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row justify-center gap-3"
                >
                  <div className="relative group">

                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 rounded-xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

                    <button
                      onClick={() => navigate('/register')}
                      className="relative px-6 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 text-white text-sm font-semibold rounded-xl border border-white/20 shadow-[0_15px_30px_rgba(168,85,247,0.35)] hover:scale-105 transition-transform duration-300 flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Commencer gratuitement
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="px-6 py-2.5 h-auto text-sm rounded-xl font-semibold border-white/20 text-white bg-white/[0.04] backdrop-blur-xl hover:bg-white/[0.08] hover:scale-105 transition-all duration-300"
                  >
                    Se connecter
                  </Button>
                </motion.div>
              )}

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap items-center justify-center gap-4 mt-8 text-xs text-purple-300/50"
              >
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-emerald-400" />
                  Sécurisé
                </div>

                <div className="w-1 h-1 bg-purple-400/30 rounded-full" />

                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-amber-400" />
                  Ultra rapide
                </div>

                <div className="w-1 h-1 bg-purple-400/30 rounded-full" />

                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-purple-400" />
                  Premium
                </div>
              </motion.div>
            </div>
          </section>

          {/* FEATURES */}
          <section className="container mx-auto px-4 sm:px-6 py-12">

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 bg-white/[0.05] backdrop-blur-xl rounded-full border border-white/[0.08]">
                <Sparkles className="h-3 w-3 text-purple-400" />

                <span className="text-xs font-medium text-purple-300/80">
                  FonctionNALITÉS premium
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Pensé pour la performance
              </h2>

              <p className="text-sm sm:text-base text-purple-200/50 max-w-xl mx-auto">
                Des outils puissants, une interface raffinée et une expérience fluide.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">

              {[
                {
                  icon: BarChart3,
                  title: 'Suivi en temps réel',
                  desc: 'Tableau de bord vivant avec mises à jour instantanées.',
                  gradient: 'from-blue-500 to-indigo-500',
                },
                {
                  icon: Shield,
                  title: 'Gestion intelligente',
                  desc: 'Inventaire, clients et commandes optimisés.',
                  gradient: 'from-purple-500 to-fuchsia-500',
                },
                {
                  icon: Zap,
                  title: 'Rapports avancés',
                  desc: 'Analyses détaillées et export PDF rapide.',
                  gradient: 'from-amber-500 to-orange-500',
                },
                {
                  icon: TrendingUp,
                  title: 'Analyse des profits',
                  desc: 'Visualisez vos bénéfices facilement.',
                  gradient: 'from-emerald-500 to-teal-500',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group relative"
                >
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-25 rounded-2xl blur-xl transition-opacity duration-500`} />

                  <div className="relative h-full bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-[0_15px_40px_rgba(0,0,0,0.25)] overflow-hidden">

                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="h-5 w-5 text-white drop-shadow" />
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">
                      {item.title}
                    </h3>

                    <p className="text-sm text-purple-200/55 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="container mx-auto px-4 sm:px-6 py-12">

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative max-w-3xl mx-auto"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/25 via-pink-600/25 to-fuchsia-600/25 rounded-[2rem] blur-3xl" />

              <div className="relative bg-gradient-to-br from-purple-600/25 via-pink-600/15 to-fuchsia-600/25 backdrop-blur-2xl border border-white/[0.12] rounded-[1.5rem] p-6 sm:p-10 text-center shadow-[0_25px_50px_rgba(168,85,247,0.25)] overflow-hidden">

                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 drop-shadow-lg">
                  Passez au niveau supérieur
                </h2>

                <p className="text-sm sm:text-base text-purple-100/70 mb-6 max-w-xl mx-auto">
                  Rejoignez une nouvelle génération de gestion commerciale premium.
                </p>

                {!isAuthenticated && (
                  <div className="relative inline-block group">

                    <div className="absolute -inset-1 bg-white/30 rounded-xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity duration-500" />

                    <button
                      onClick={() => navigate('/register')}
                      className="relative px-7 py-3 bg-white text-purple-900 text-sm font-bold rounded-xl shadow-2xl hover:scale-105 transition-transform duration-300 flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      Démarrer maintenant
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;