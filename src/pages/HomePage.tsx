import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import PremiumLoading from '@/components/ui/premium-loading';
import { ArrowRight, BarChart3, Shield, Zap, TrendingUp } from 'lucide-react';
import { motion } from "framer-motion";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <PremiumLoading
          text="Bienvenue sur Gestion Ventes"
          size="xl"
          overlay
          variant="default"
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative overflow-hidden">

        {/* ================= HERO ================= */}
        <div className="relative min-h-screen flex items-center bg-gradient-to-br from-[#0b0b12] via-[#1a0f2e] to-[#0e153a]">

          {/* LUXURY GLOW */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-fuchsia-600/30 rounded-full blur-[140px]" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/30 rounded-full blur-[140px]" />
            <div className="absolute top-40 left-1/2 w-[30rem] h-[30rem] bg-purple-500/20 rounded-full blur-[160px] -translate-x-1/2" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 text-center">

            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-sm text-white shadow-lg mb-8">
              ✨ Solution premium de gestion commerciale
            </span>

            <motion.h1
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent"
            >
              Gestion de vente
              <span className="block mt-3 text-transparent bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text">
                Simplifiée. Puissante. Élégante.
              </span>
            </motion.h1>

            <p className="mt-8 max-w-3xl mx-auto text-lg sm:text-xl text-white/80 leading-relaxed">
              Une plateforme moderne pensée pour les entrepreneurs exigeants.
              Pilotez vos ventes, stocks et profits avec précision et élégance.
            </p>

            {!isAuthenticated && (
              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  className="group px-10 py-4 text-lg rounded-2xl font-semibold
                  bg-gradient-to-r from-fuchsia-500 to-indigo-500
                  hover:from-fuchsia-600 hover:to-indigo-600
                  shadow-[0_20px_60px_-10px_rgba(168,85,247,0.6)]
                  transition-all hover:scale-105"
                  onClick={() => navigate('/register')}
                >
                  Commencer gratuitement
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button
                  variant="outline"
                  className="px-10 py-4 text-lg rounded-2xl font-semibold
                  border-white/30 text-white bg-white/5 backdrop-blur-xl
                  hover:bg-white/10 hover:shadow-xl transition-all hover:scale-105"
                  onClick={() => navigate('/login')}
                >
                  Se connecter
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ================= FEATURES ================= */}
        <div className="py-24 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-7xl mx-auto px-4">

            <div className="text-center mb-20">
              <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold mb-4">
                Fonctionnalités premium
              </span>
              <h2 className="text-4xl font-bold text-gray-900">
                Pensé pour la performance
              </h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Des outils puissants, une interface raffinée, une expérience fluide.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

              {[
                { icon: BarChart3, title: "Suivi en temps réel", color: "from-blue-500 to-indigo-500" },
                { icon: Shield, title: "Gestion intelligente", color: "from-purple-500 to-fuchsia-500" },
                { icon: Zap, title: "Rapports avancés", color: "from-indigo-500 to-blue-500" },
                { icon: TrendingUp, title: "Analyse des profits", color: "from-emerald-500 to-green-500" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="group relative bg-white rounded-3xl p-8
                  border border-gray-100
                  shadow-[0_30px_80px_-20px_rgba(0,0,0,0.15)]
                  hover:-translate-y-2 transition-all duration-500"
                >
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 from-purple-500/5 to-indigo-500/5" />
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color}
                      flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                      <item.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Une expérience optimisée pour une gestion fluide,
                      précise et orientée croissance.
                    </p>
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>

        {/* ================= CTA ================= */}
        <div className="relative py-24 bg-gradient-to-r from-[#0b0b12] via-[#1a0f2e] to-[#0e153a] text-center overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-80 h-80 bg-purple-600/30 rounded-full blur-[140px]" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/30 rounded-full blur-[140px]" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-white mb-6">
              Passez au niveau supérieur
            </h2>
            <p className="text-xl text-white/80 mb-12">
              Rejoignez une nouvelle génération de gestion commerciale premium.
            </p>

            {!isAuthenticated && (
              <Button
                className="group px-12 py-4 text-lg rounded-2xl font-semibold
                bg-gradient-to-r from-fuchsia-500 to-indigo-500
                shadow-[0_20px_60px_-10px_rgba(168,85,247,0.6)]
                hover:scale-105 transition-all"
                onClick={() => navigate('/register')}
              >
                Démarrer maintenant
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
