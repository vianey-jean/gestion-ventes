import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PremiumLoading from '@/components/ui/premium-loading';
import { Users, Target, Lightbulb, Award, ArrowRight } from 'lucide-react';

const AboutPage: React.FC = () => {
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
          text="Découvrez Notre Histoire"
          size="lg"
          overlay={true}
          variant="default"
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative overflow-hidden">
        {/* Hero section */}
        <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-24">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
          </div>
          
          <div className="relative container mx-auto px-4 text-center">
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6 border border-white/20">
              🚀 Notre Histoire
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                À propos de
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Gestion Vente
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Nous révolutionnons la gestion commerciale avec des solutions innovantes, 
              intuitives et puissantes pour les entrepreneurs modernes.
            </p>
          </div>
        </div>

        {/* Mission section */}
        <div className="py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-20">
                <span className="inline-block px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold mb-4">
                  Notre Mission
                </span>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Transformer la gestion commerciale
                </h2>
              </div>

              <div className="bg-white rounded-3xl p-12 shadow-2xl border border-gray-100 mb-16">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-6">
                      Simplifier pour mieux réussir
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed mb-6">
                      Notre mission est de fournir un outil de gestion révolutionnaire qui permet aux entreprises 
                      de toutes tailles de prospérer dans l'économie moderne. Nous croyons que la simplicité 
                      et l'innovation sont les clés du succès commercial.
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      Chaque fonctionnalité est pensée pour vous faire gagner du temps, optimiser vos processus 
                      et maximiser votre rentabilité.
                    </p>
                  </div>
                  <div className="relative">
                    <div className="w-full h-80 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                      <Target className="h-24 w-24 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Values section */}
              <div className="mb-20">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-gray-900 mb-6">Nos valeurs fondamentales</h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Ces principes guident chacune de nos décisions et innovations
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="group text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Lightbulb className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Simplicité</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Interfaces intuitives qui ne nécessitent aucune formation complexe pour être maîtrisées.
                    </p>
                  </div>

                  <div className="group text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <ArrowRight className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Efficacité</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Optimisation de chaque processus pour maximiser votre productivité quotidienne.
                    </p>
                  </div>

                  <div className="group text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Award className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Fiabilité</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Sécurité maximale et disponibilité constante de vos données critiques.
                    </p>
                  </div>

                  <div className="group text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Innovation</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Amélioration continue avec les dernières technologies pour rester à la pointe.
                    </p>
                  </div>
                </div>
              </div>

              {/* Features showcase */}
              <div className="bg-gradient-to-r from-gray-900 to-purple-900 rounded-3xl p-12 text-white">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold mb-6">Fonctionnalités de pointe</h2>
                  <p className="text-xl text-white/80 max-w-3xl mx-auto">
                    Une suite complète d'outils professionnels pour transformer votre activité
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                    'Suivi des ventes en temps réel',
                    'Gestion d\'inventaire intelligente',
                    'Calcul automatique des bénéfices',
                    'Rapports mensuels détaillés',
                    'Exportation de données en PDF',
                    'Interface responsive multi-appareils'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-4"></div>
                      <span className="text-white/90">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team section */}
              <div className="mt-24 text-center">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Notre équipe passionnée</h2>
                <div className="bg-white rounded-3xl p-12 shadow-2xl border border-gray-100">
                  <p className="text-lg text-gray-600 leading-relaxed mb-8">
                    Derrière Gestion Vente se trouve une équipe de visionnaires : développeurs experts, 
                    designers créatifs et spécialistes du commerce qui collaborent pour créer 
                    la solution de gestion la plus avancée du marché.
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Nous sommes constamment à l'écoute de nos utilisateurs pour anticiper leurs besoins 
                    et dépasser leurs attentes avec des innovations qui font la différence.
                  </p>
                </div>
              </div>

              {/* CTA section */}
              <div className="mt-24 text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-white">
                <h2 className="text-4xl font-bold mb-6">Prêt à révolutionner votre gestion?</h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  Que vous dirigiez une startup innovante ou une entreprise établie, 
                  Gestion Vente est l'outil qu'il vous faut pour conquérir de nouveaux marchés.
                </p>
                <div className="inline-block px-8 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white/90 font-semibold border border-white/30">
                  🎯 Démarrez votre transformation dès aujourd'hui
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
