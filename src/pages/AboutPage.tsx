
import React from 'react';
import Layout from '@/components/Layout';

const AboutPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-app-dark">À propos de Gestion Vente</h1>
          
          <div className="prose prose-lg max-w-none">
            <p>
              Bienvenue sur Gestion Vente, votre solution complète pour la gestion de vos ventes et de votre inventaire.
              Notre application a été conçue pour simplifier la vie des commerçants, des entrepreneurs et des gestionnaires de stocks.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-app-red">Notre mission</h2>
            <p>
              Notre mission est de fournir un outil de gestion simple mais puissant qui permet aux entreprises de toutes tailles
              de suivre efficacement leurs ventes, de gérer leur inventaire et d'analyser leurs performances commerciales.
              Nous croyons que la simplicité et l'efficacité sont la clé d'une bonne gestion.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-app-red">Nos valeurs</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-app-purple">Simplicité</strong> - Nous concevons des interfaces intuitives qui ne nécessitent pas de formation extensive.
              </li>
              <li>
                <strong className="text-app-purple">Efficacité</strong> - Nous optimisons chaque fonctionnalité pour vous faire gagner du temps.
              </li>
              <li>
                <strong className="text-app-purple">Fiabilité</strong> - Nous assurons que vos données sont toujours sécurisées et accessibles.
              </li>
              <li>
                <strong className="text-app-purple">Innovation</strong> - Nous améliorons constamment notre plateforme pour répondre à vos besoins.
              </li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-app-red">Fonctionnalités principales</h2>
            <p>
              Notre application offre une gamme complète de fonctionnalités pour vous aider à gérer votre activité commerciale:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>Suivi des ventes en temps réel</li>
              <li>Gestion d'inventaire</li>
              <li>Calcul automatique des bénéfices</li>
              <li>Rapports mensuels détaillés</li>
              <li>Exportation de données en PDF</li>
              <li>Interface responsive pour une utilisation sur tous les appareils</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-app-red">Notre équipe</h2>
            <p>
              Derrière Gestion Vente se trouve une équipe passionnée de développeurs, de designers et d'experts en commerce
              qui travaillent ensemble pour créer la meilleure solution de gestion de vente possible.
              Nous sommes constamment à l'écoute de vos retours pour améliorer notre service.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-app-red">Commencez dès aujourd'hui</h2>
            <p>
              Que vous gériez une petite boutique ou une entreprise plus importante, Gestion Vente est l'outil qu'il vous faut
              pour optimiser votre gestion des ventes et augmenter votre rentabilité.
              Inscrivez-vous dès aujourd'hui et découvrez comment notre application peut transformer votre façon de gérer votre activité.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
