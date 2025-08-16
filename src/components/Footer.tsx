
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart, Sparkles } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white mt-auto overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-5"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand section */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-6">
              <Sparkles className="h-8 w-8 text-purple-400 mr-2" />
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Gestion Vente
                </span>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed mb-6">
              Solution révolutionnaire pour la gestion moderne de vos ventes et inventaires. 
              Transformez votre business avec notre technologie de pointe.
            </p>
            <div className="flex items-center text-sm text-gray-400">
              <Heart className="h-4 w-4 text-red-400 mr-2" />
              Fait avec passion à La Réunion
            </div>
          </div>
          
          {/* Quick links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-purple-300">Navigation</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-flex items-center group">
                  <span className="w-1 h-1 bg-purple-400 rounded-full mr-3 group-hover:bg-pink-400 transition-colors"></span>
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-flex items-center group">
                  <span className="w-1 h-1 bg-purple-400 rounded-full mr-3 group-hover:bg-pink-400 transition-colors"></span>
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-flex items-center group">
                  <span className="w-1 h-1 bg-purple-400 rounded-full mr-3 group-hover:bg-pink-400 transition-colors"></span>
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-flex items-center group">
                  <span className="w-1 h-1 bg-purple-400 rounded-full mr-3 group-hover:bg-pink-400 transition-colors"></span>
                  Connexion
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-purple-300">Nos Services</h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-center">
                <span className="w-1 h-1 bg-blue-400 rounded-full mr-3"></span>
                Gestion des ventes
              </li>
              <li className="flex items-center">
                <span className="w-1 h-1 bg-green-400 rounded-full mr-3"></span>
                Suivi d'inventaire
              </li>
              <li className="flex items-center">
                <span className="w-1 h-1 bg-yellow-400 rounded-full mr-3"></span>
                Rapports analytiques
              </li>
              <li className="flex items-center">
                <span className="w-1 h-1 bg-red-400 rounded-full mr-3"></span>
                Support
              </li>
            </ul>
          </div>
          
          {/* Contact info */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-purple-300">Contactez-nous</h3>
            <div className="space-y-4">
              <div className="flex items-start group">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Notre siège</p>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    10 Allée des Beryls Bleus<br />
                    Bellepierre<br/>
                    97400, Saint-Denis
                  </p>
                </div>
              </div>
              
              <div className="flex items-start group">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Email</p>
                  <p className="text-gray-300 text-sm">contact@gestion-vente.com</p>
                </div>
              </div>
              
              <div className="flex items-start group">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Téléphone</p>
                  <p className="text-gray-300 text-sm">+262 6 92 84 23 70</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="mt-16 pt-8 border-t border-gray-700/50">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Gestion Vente. Tous droits réservés.
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-xs text-gray-500">
                Conditions d'utilisation
              </div>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="text-xs text-gray-500">
                Politique de confidentialité
              </div>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="text-xs text-gray-500">
                Mentions légales
              </div>
            </div>
          </div>
          
          {/* Version indicator */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center px-3 py-1 bg-white/5 backdrop-blur-sm rounded-full text-xs text-gray-400 border border-white/10">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Version 3.2.0 - Système opérationnel
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
