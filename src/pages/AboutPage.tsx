import React from 'react';
import Layout from '@/components/Layout';
import { Users, Target, Lightbulb, Award, ArrowRight, Crown, Sparkles, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import SEOHead from '@/components/SEOHead';

const AboutPage: React.FC = () => {
  return (
    <Layout>
      <SEOHead
        title="À propos"
        description="Découvrez l'histoire de Gestion Vente, notre mission de transformer la gestion commerciale avec des solutions innovantes et intuitives."
        canonical="https://riziky-boutic.vercel.app/about"
      />
      <div className="min-h-screen relative bg-gradient-to-br from-slate-900 via-purple-950/60 to-indigo-950 overflow-hidden">
        {/* Animated orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 -left-32 w-[480px] h-[480px] bg-purple-500/20 rounded-full blur-[140px]"
          />
          <motion.div
            animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-0 -right-32 w-[560px] h-[560px] bg-pink-500/15 rounded-full blur-[140px]"
          />
          <motion.div
            animate={{ y: [0, 50, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-full blur-[120px]"
          />
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -80, 0], opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 7 + i * 1.5, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }}
              className="absolute w-1.5 h-1.5 bg-purple-300/40 rounded-full"
              style={{ left: `${10 + i * 11}%`, top: `${15 + i * 9}%` }}
            />
          ))}
        </div>

        {/* Grid overlay */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

        <div className="relative z-10">
          {/* HERO */}
          <section className="container mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-5 py-2 mb-8 bg-white/[0.05] backdrop-blur-xl rounded-full border border-white/[0.08]"
            >
              <Crown className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-purple-300/80">Notre Histoire</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight drop-shadow-[0_4px_20px_rgba(139,92,246,0.3)]"
            >
              À propos de{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-fuchsia-400 bg-clip-text text-transparent">
                Gestion Vente
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-3xl mx-auto text-lg sm:text-xl text-purple-200/60 leading-relaxed"
            >
              Nous révolutionnons la gestion commerciale avec des solutions innovantes,
              intuitives et puissantes pour les entrepreneurs modernes.
            </motion.p>
          </section>

          {/* MISSION */}
          <section className="container mx-auto px-4 sm:px-6 pb-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative max-w-6xl mx-auto"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 rounded-[2rem] blur-2xl" />
              <div className="relative bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 sm:p-12 shadow-[0_32px_64px_rgba(0,0,0,0.4)] overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />

                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-purple-500/10 border border-purple-400/20 rounded-full">
                      <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                      <span className="text-xs font-semibold text-purple-300">Notre Mission</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
                      Simplifier pour <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">mieux réussir</span>
                    </h2>
                    <p className="text-base sm:text-lg text-purple-200/60 leading-relaxed mb-4">
                      Notre mission est de fournir un outil de gestion révolutionnaire qui permet aux entreprises
                      de toutes tailles de prospérer dans l'économie moderne.
                    </p>
                    <p className="text-base sm:text-lg text-purple-200/60 leading-relaxed">
                      Chaque fonctionnalité est pensée pour vous faire gagner du temps, optimiser vos processus
                      et maximiser votre rentabilité.
                    </p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-3xl blur-2xl" />
                    <div className="relative aspect-square w-full max-w-sm mx-auto bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
                      <Target className="h-32 w-32 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* VALUES */}
          <section className="container mx-auto px-4 sm:px-6 pb-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Nos valeurs fondamentales</h2>
              <p className="text-lg text-purple-200/50 max-w-2xl mx-auto">
                Ces principes guident chacune de nos décisions et innovations
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {[
                { icon: Lightbulb, title: 'Simplicité', desc: 'Interfaces intuitives sans formation complexe.', gradient: 'from-blue-500 to-indigo-500' },
                { icon: Zap, title: 'Efficacité', desc: 'Optimisation pour maximiser votre productivité.', gradient: 'from-purple-500 to-fuchsia-500' },
                { icon: Shield, title: 'Fiabilité', desc: 'Sécurité maximale et disponibilité constante.', gradient: 'from-emerald-500 to-teal-500' },
                { icon: Award, title: 'Innovation', desc: 'Amélioration continue avec les dernières technologies.', gradient: 'from-pink-500 to-rose-500' },
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
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-30 rounded-3xl blur transition-opacity duration-500`} />
                  <div className="relative h-full bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="h-7 w-7 text-white drop-shadow" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-purple-200/50 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* FEATURES SHOWCASE */}
          <section className="container mx-auto px-4 sm:px-6 pb-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative max-w-6xl mx-auto"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 rounded-[2rem] blur-2xl" />
              <div className="relative bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 sm:p-12 shadow-[0_32px_64px_rgba(0,0,0,0.4)] overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-400/50 to-transparent" />
                <div className="text-center mb-10">
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Fonctionnalités de pointe</h2>
                  <p className="text-purple-200/50 max-w-2xl mx-auto">
                    Une suite complète d'outils professionnels pour transformer votre activité
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    'Suivi des ventes en temps réel',
                    'Gestion d\'inventaire intelligente',
                    'Calcul automatique des bénéfices',
                    'Rapports mensuels détaillés',
                    'Exportation de données en PDF',
                    'Interface responsive multi-appareils',
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:bg-white/[0.06] hover:border-purple-400/30 transition-all duration-300"
                    >
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 shadow-[0_0_10px_rgba(168,85,247,0.6)] flex-shrink-0" />
                      <span className="text-sm sm:text-base text-purple-100/80">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </section>

          {/* TEAM */}
          <section className="container mx-auto px-4 sm:px-6 pb-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/[0.05] backdrop-blur-xl rounded-full border border-white/[0.08]">
                <Users className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300/80">L'équipe</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">Notre équipe passionnée</h2>
              <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] space-y-5">
                <p className="text-base sm:text-lg text-purple-200/60 leading-relaxed">
                  Derrière Gestion Vente se trouve une équipe de visionnaires : développeurs experts,
                  designers créatifs et spécialistes du commerce qui collaborent pour créer
                  la solution de gestion la plus avancée du marché.
                </p>
                <p className="text-base sm:text-lg text-purple-200/60 leading-relaxed">
                  Nous sommes constamment à l'écoute de nos utilisateurs pour anticiper leurs besoins
                  et dépasser leurs attentes avec des innovations qui font la différence.
                </p>
              </div>
            </motion.div>
          </section>

          {/* CTA */}
          <section className="container mx-auto px-4 sm:px-6 pb-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative max-w-5xl mx-auto"
            >
              <div className="absolute -inset-6 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-fuchsia-600/30 rounded-[2.5rem] blur-3xl" />
              <div className="relative bg-gradient-to-br from-purple-600/30 via-pink-600/20 to-fuchsia-600/30 backdrop-blur-2xl border border-white/[0.12] rounded-[2rem] p-10 sm:p-14 text-center shadow-[0_32px_64px_rgba(168,85,247,0.3)] overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
                  Prêt à révolutionner votre gestion ?
                </h2>
                <p className="text-base sm:text-lg text-purple-100/70 mb-8 max-w-2xl mx-auto">
                  Que vous dirigiez une startup innovante ou une entreprise établie,
                  Gestion Vente est l'outil qu'il vous faut pour conquérir de nouveaux marchés.
                </p>
                <div className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white font-semibold shadow-lg hover:bg-white/15 hover:scale-105 transition-all duration-300 cursor-default">
                  <Sparkles className="h-5 w-5 text-amber-300" />
                  Démarrez votre transformation dès aujourd'hui
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
