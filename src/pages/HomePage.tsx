import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, BarChart3, Shield, Zap, TrendingUp, Crown, Sparkles, Star } from 'lucide-react';
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
      <div className="min-h-screen relative bg-gradient-to-br from-slate-900 via-purple-950/60 to-indigo-950 overflow-hidden">
        {/* Animated orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 -left-32 w-[520px] h-[520px] bg-purple-500/25 rounded-full blur-[150px]"
          />
          <motion.div
            animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/3 -right-32 w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-[160px]"
          />
          <motion.div
            animate={{ y: [0, 60, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-r from-violet-500/15 to-fuchsia-500/15 rounded-full blur-[140px]"
          />
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -100, 0], opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 6 + i * 1.2, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
              className="absolute w-1.5 h-1.5 bg-purple-300/50 rounded-full"
              style={{ left: `${8 + i * 9}%`, top: `${10 + i * 7}%` }}
            />
          ))}
        </div>

        {/* Grid */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

        <div className="relative z-10">
          {/* HERO */}
          <section className="container mx-auto px-4 sm:px-6 min-h-screen flex items-center py-20">
            <div className="w-full text-center">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-5 py-2 mb-8 bg-white/[0.05] backdrop-blur-xl rounded-full border border-white/[0.08] shadow-lg"
              >
                <Crown className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium text-purple-300/80">Solution premium de gestion commerciale</span>
                <Sparkles className="h-4 w-4 text-purple-400" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 leading-tight drop-shadow-[0_4px_30px_rgba(139,92,246,0.4)]"
              >
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Gestion de vente
                </span>
                <span className="block mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  Simplifiée. Puissante. Élégante.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-3xl mx-auto text-lg sm:text-xl text-purple-200/60 leading-relaxed mb-12"
              >
                Une plateforme moderne pensée pour les entrepreneurs exigeants.
                Pilotez vos ventes, stocks et profits avec précision et élégance.
              </motion.p>

              {!isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row justify-center gap-4"
                >
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                    <button
                      onClick={() => navigate('/register')}
                      className="relative px-10 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 text-white text-lg font-semibold rounded-2xl border border-white/20 shadow-[0_20px_40px_rgba(168,85,247,0.4)] hover:scale-105 transition-transform duration-300 flex items-center gap-3"
                    >
                      <Sparkles className="h-5 w-5" />
                      Commencer gratuitement
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="px-10 py-4 h-auto text-lg rounded-2xl font-semibold border-white/20 text-white bg-white/[0.04] backdrop-blur-xl hover:bg-white/[0.08] hover:scale-105 transition-all duration-300"
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
                className="flex flex-wrap items-center justify-center gap-6 mt-14 text-xs sm:text-sm text-purple-300/50"
              >
                <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-400" /> Sécurisé</div>
                <div className="w-1 h-1 bg-purple-400/30 rounded-full" />
                <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-amber-400" /> Ultra rapide</div>
                <div className="w-1 h-1 bg-purple-400/30 rounded-full" />
                <div className="flex items-center gap-2"><Star className="h-4 w-4 text-purple-400" /> Premium</div>
              </motion.div>
            </div>
          </section>

          {/* FEATURES */}
          <section className="container mx-auto px-4 sm:px-6 py-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-5 bg-white/[0.05] backdrop-blur-xl rounded-full border border-white/[0.08]">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300/80">Fonctionnalités premium</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Pensé pour la performance</h2>
              <p className="text-lg text-purple-200/50 max-w-2xl mx-auto">
                Des outils puissants, une interface raffinée, une expérience fluide.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {[
                { icon: BarChart3, title: 'Suivi en temps réel', desc: 'Tableau de bord vivant avec mises à jour instantanées de vos métriques.', gradient: 'from-blue-500 to-indigo-500' },
                { icon: Shield, title: 'Gestion intelligente', desc: 'Inventaire, clients et commandes orchestrés avec précision.', gradient: 'from-purple-500 to-fuchsia-500' },
                { icon: Zap, title: 'Rapports avancés', desc: 'Analyses détaillées et exportation PDF en un clic.', gradient: 'from-amber-500 to-orange-500' },
                { icon: TrendingUp, title: 'Analyse des profits', desc: 'Visualisez vos bénéfices et optimisez votre rentabilité.', gradient: 'from-emerald-500 to-teal-500' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group relative"
                >
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-30 rounded-3xl blur-xl transition-opacity duration-500`} />
                  <div className="relative h-full bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="h-8 w-8 text-white drop-shadow" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-purple-200/55 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="container mx-auto px-4 sm:px-6 py-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative max-w-5xl mx-auto"
            >
              <div className="absolute -inset-6 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-fuchsia-600/30 rounded-[2.5rem] blur-3xl" />
              <div className="relative bg-gradient-to-br from-purple-600/30 via-pink-600/20 to-fuchsia-600/30 backdrop-blur-2xl border border-white/[0.12] rounded-[2rem] p-10 sm:p-16 text-center shadow-[0_32px_64px_rgba(168,85,247,0.3)] overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 drop-shadow-lg">
                  Passez au niveau supérieur
                </h2>
                <p className="text-lg sm:text-xl text-purple-100/70 mb-10 max-w-2xl mx-auto">
                  Rejoignez une nouvelle génération de gestion commerciale premium.
                </p>

                {!isAuthenticated && (
                  <div className="relative inline-block group">
                    <div className="absolute -inset-1 bg-white/30 rounded-2xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
                    <button
                      onClick={() => navigate('/register')}
                      className="relative px-12 py-4 bg-white text-purple-900 text-lg font-bold rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-300 flex items-center gap-3"
                    >
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      Démarrer maintenant
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
