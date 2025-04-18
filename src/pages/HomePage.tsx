
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  return (
    <Layout>
      <div className="relative">
        {/* Hero section */}
        <div className="bg-gradient-to-b from-white to-gray-100">
          <div className="container mx-auto px-4 py-16 sm:py-24">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Gestion de vente</span>
                <span className="block text-app-red">Simplifiée et efficace</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Une solution complète pour gérer vos ventes, suivre vos produits et maximiser vos bénéfices.
              </p>
              
              {!isAuthenticated && (
                <div className="mt-10 sm:flex sm:justify-center">
                  <div className="rounded-md shadow">
                    <Button 
                      className="w-full px-8 py-6 text-lg font-medium rounded-md bg-app-red hover:bg-opacity-90"
                      onClick={() => navigate('/register')}
                    >
                      S'inscrire
                    </Button>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Button 
                      variant="outline"
                      className="w-full px-8 py-6 text-lg font-medium rounded-md border-app-purple text-app-purple hover:bg-app-purple hover:text-white"
                      onClick={() => navigate('/login')}
                    >
                      Se connecter
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Features section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-app-purple font-semibold tracking-wide uppercase">Fonctionnalités</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Une meilleure façon de gérer vos ventes
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Découvrez comment notre application peut vous aider à organiser et optimiser votre activité commerciale.
              </p>
            </div>
            
            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-app-blue text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg font-medium text-gray-900">Suivi des ventes en temps réel</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Suivez toutes vos transactions en temps réel. Visualisez vos ventes quotidiennes, hebdomadaires et mensuelles.
                    </p>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-app-red text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg font-medium text-gray-900">Gestion d'inventaire</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Gérez facilement votre inventaire de produits. Recevez des alertes lorsque les stocks sont bas.
                    </p>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-app-purple text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg font-medium text-gray-900">Rapports détaillés</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Générez des rapports détaillés sur vos performances commerciales. Exportez-les facilement en PDF.
                    </p>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-app-green text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg font-medium text-gray-900">Analyse des bénéfices</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Analysez vos marges et bénéfices pour chaque produit. Identifiez vos produits les plus rentables.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA section */}
        <div className="bg-app-dark">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Prêt à commencer?</span>
              <span className="block text-app-purple">Inscrivez-vous gratuitement dès aujourd'hui.</span>
            </h2>
            {!isAuthenticated && (
              <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                <div className="inline-flex rounded-md shadow">
                  <Button 
                    className="px-5 py-6 text-lg font-medium rounded-md bg-app-red hover:bg-opacity-90"
                    onClick={() => navigate('/register')}
                  >
                    Commencer maintenant
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
