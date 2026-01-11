import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // ✅ On importe le contexte d'authentification

const Footer: React.FC = () => {
  const { user } = useAuth(); // ✅ Récupère l'utilisateur connecté (null si déconnecté)

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white mt-auto overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-32 h-32 sm:w-48 sm:h-48 md:w-72 md:h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        <div className="absolute bottom-0 right-1/4 w-32 h-32 sm:w-48 sm:h-48 md:w-72 md:h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-5"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
          {/* Brand section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-4 sm:mb-6">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 mr-2 shrink-0" />
              <div>
                <span className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Gestion Vente
                </span>
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-4 sm:mb-6">
              Solution révolutionnaire pour la gestion moderne de vos ventes et inventaires. 
              Transformez votre business avec notre technologie de pointe.
            </p>
            <div className="flex items-center text-xs sm:text-sm text-gray-400">
              <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-400 mr-2 shrink-0" />
              Fait avec passion à La Réunion
            </div>
          </div>
          
          {/* Quick links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-purple-300">Navigation</h3>
            <ul className="space-y-3 sm:space-y-4">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-flex items-center group"
                >
                  <span className="w-1 h-1 bg-purple-400 rounded-full mr-3 group-hover:bg-pink-400 transition-colors"></span>
                  <span className="relative after:content-[''] after:absolute after:left-0 after:-bottom-1 
                                  after:w-0 after:h-[3px] after:bg-red-500 after:transition-all after:duration-300 
                                  group-hover:after:w-full">
                    Accueil
                  </span>
                </Link>
              </li>

              <li>
                <Link 
                  to="/about" 
                  className="text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-flex items-center group"
                >
                  <span className="w-1 h-1 bg-purple-400 rounded-full mr-3 group-hover:bg-pink-400 transition-colors"></span>
                  <span className="relative after:content-[''] after:absolute after:left-0 after:-bottom-1 
                                  after:w-0 after:h-[3px] after:bg-red-500 after:transition-all after:duration-300 
                                  group-hover:after:w-full">
                    À propos
                  </span>
                </Link>
              </li>
                 <li>
                <Link 
                  to="/contact" 
                  className="text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-flex items-center group"
                >
                  <span className="w-1 h-1 bg-purple-400 rounded-full mr-3 group-hover:bg-pink-400 transition-colors"></span>
                  <span className="relative after:content-[''] after:absolute after:left-0 after:-bottom-1 
                                  after:w-0 after:h-[3px] after:bg-red-500 after:transition-all after:duration-300 
                                  group-hover:after:w-full">
                    Contact
                  </span>
                </Link>
              </li>

              {/* ✅ Contact → visible uniquement si user est déconnecté */}
              {!user && (
                <li>
                  <Link 
                    to="/contact" 
                    className="text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-flex items-center group"
                  >
                    <span className="w-1 h-1 bg-purple-400 rounded-full mr-3 group-hover:bg-pink-400 transition-colors"></span>
                    <span className="relative after:content-[''] after:absolute after:left-0 after:-bottom-1 
                                    after:w-0 after:h-[3px] after:bg-red-500 after:transition-all after:duration-300 
                                    group-hover:after:w-full">
                      Contact
                    </span>
                  </Link>
                </li>
              )}

              {/* ✅ Connexion → visible uniquement si user est déconnecté */}
              {/* {!user && (
                <li>
                  <Link 
                    to="/login" 
                    className="text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-flex items-center group"
                  >
                    <span className="w-1 h-1 bg-purple-400 rounded-full mr-3 group-hover:bg-pink-400 transition-colors"></span>
                    <span className="relative after:content-[''] after:absolute after:left-0 after:-bottom-1 
                                    after:w-0 after:h-[3px] after:bg-red-500 after:transition-all after:duration-300 
                                    group-hover:after:w-full">
                      Connexion
                    </span>
                  </Link>
                </li>
              )} */}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-purple-300">Nos Services</h3>
            <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-300">
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
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-purple-300">Contactez-nous</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start group">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-200">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm sm:text-base">Notre siège</p>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                    10 Allée des Beryls Bleus<br />
                    Bellepierre<br/>
                    97400, Saint-Denis
                  </p>
                </div>
              </div>
              
              <div className="flex items-start group">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-200">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm sm:text-base">Email</p>
                  <p className="text-gray-300 text-xs sm:text-sm break-all">vianey.jean@ymail.com</p>
                </div>
              </div>
              
              <div className="flex items-start group">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-200">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm sm:text-base">Téléphone</p>
                  <p className="text-gray-300 text-xs sm:text-sm">+262 6 92 84 23 70</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="mt-8 sm:mt-12 md:mt-16 pt-6 sm:pt-8 border-t border-gray-700/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-xs sm:text-sm">
                &copy; {new Date().getFullYear()} Gestion Vente. Tous droits réservés.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 md:gap-6">
              <div className="text-[10px] sm:text-xs text-gray-500">
                Conditions d'utilisation
              </div>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="text-[10px] sm:text-xs text-gray-500">
                Politique de confidentialité
              </div>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="text-[10px] sm:text-xs text-gray-500">
                Mentions légales
              </div>
            </div>
          </div>
          
          {/* Version indicator */}
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <div className="inline-flex items-center px-2 sm:px-3 py-1 bg-white/5 backdrop-blur-sm rounded-full text-[10px] sm:text-xs text-gray-400 border border-white/10">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full mr-1.5 sm:mr-2 animate-pulse shrink-0"></div>
              <span className="whitespace-nowrap">Version 4.0.0 - Système opérationnel</span>
            </div>
            <div className="inline-flex items-center px-2 sm:px-3 py-1 bg-white/5 backdrop-blur-sm rounded-full text-[10px] sm:text-xs text-gray-400 border border-white/10">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full mr-1.5 sm:mr-2 animate-pulse shrink-0"></div>
              <span className="whitespace-nowrap">Créé par Jean Rabemanalina</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
