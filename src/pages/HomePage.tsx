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
  
  // Simulate initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <PremiumLoading 
          text="Bienvenue sur Gestion Ventes"
          size="xl"
          overlay={true}
          variant="default"
        />
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="relative overflow-hidden">
        {/* Hero section with modern gradient */}
        <div className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen flex items-center">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-40 left-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
          </div>
          
          <div className="container mx-auto px-3 sm:px-4 md:px-6 py-12 sm:py-16 md:py-24 relative z-10">
            <div className="text-center">
              <div className="mb-6 sm:mb-8 animate-in fade-in-50 duration-1000">
                <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-xs sm:text-sm font-medium mb-4 sm:mb-6 border border-white/20">
                  ✨ Solution complète de gestion
                </span>
              </div>
              
              <motion.h1
                                initial={{ opacity: 0, y: 60, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.9, ease: "easeOut" }}
                                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold 
                                          bg-gradient-to-r from-purple-600 via-red-600 to-indigo-600 
                                          bg-[length:200%_200%] animate-gradient 
                                          bg-clip-text text-transparent mb-4 sm:mb-6 text-center text-3d px-4"
                              >
                  Gestion de vente
                <span className="block bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mt-2">
                  Simplifiée et efficace
                </span>
              </motion.h1>
              
              <p className="mt-4 sm:mt-6 max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-white/80 leading-relaxed animate-in fade-in-50 duration-1000 delay-400 px-4">
                Transformez votre façon de gérer les ventes avec notre plateforme moderne. 
                Suivez vos produits, maximisez vos bénéfices et développez votre business.
              </p>
              
              {!isAuthenticated && (
                <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-in fade-in-50 duration-1000 delay-600 px-4">
                  <Button 
                    className="group px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                    onClick={() => navigate('/register')}
                  >
                    Commencer gratuitement
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    variant="outline"
                    className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl sm:rounded-2xl border-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                    onClick={() => navigate('/login')}
                  >
                    Se connecter
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Features section with modern cards */}
        <div className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white relative">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16 md:mb-20">
              <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-100 text-purple-800 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
                Fonctionnalités
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
                Une meilleure façon de gérer vos ventes
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Découvrez comment notre application peut révolutionner votre activité commerciale
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
              <div className="group relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Suivi en temps réel</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Visualisez toutes vos transactions instantanément. Tableaux de bord interactifs pour 
                    un suivi précis de vos ventes quotidiennes, hebdomadaires et mensuelles.
                  </p>
                </div>
              </div>
              
              <div className="group relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Gestion intelligente</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Gérez votre inventaire avec des alertes automatiques. Notifications intelligentes 
                    pour optimiser vos stocks et éviter les ruptures.
                  </p>
                </div>
              </div>
              
              <div className="group relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-blue-500/5 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Rapports avancés</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Générez des rapports détaillés avec analyse prédictive. Exportation facilitée 
                    et insights personnalisés pour booster vos performances.
                  </p>
                </div>
              </div>
              
              <div className="group relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Analyse des profits</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Maximisez vos marges avec des analyses approfondies. Identifiez rapidement 
                    vos produits stars et optimisez votre rentabilité.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA section with modern gradient */}
        <div className="relative bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto py-12 sm:py-16 md:py-24 px-3 sm:px-4 md:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 px-4">
              <span className="block">Prêt à transformer votre business?</span>
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mt-2">
                Rejoignez des milliers d'entrepreneurs satisfaits
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/80 mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
              Commencez dès aujourd'hui et découvrez pourquoi notre solution est adoptée par les leaders du marché
            </p>
            
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                <Button 
                  className="group px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                  onClick={() => navigate('/register')}
                >
                  Démarrer maintenant
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
