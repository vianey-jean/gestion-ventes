import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Footer: React.FC = () => {
  const { user } = useAuth();

  return (
    <footer className="relative bg-gradient-to-br from-[#0b0b12] via-[#1a0f2e] to-[#0e153a] text-white mt-auto overflow-hidden">
      {/* Luxury background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-fuchsia-600/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-600/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-[160px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Gestion Vente
              </span>
            </div>

            <p className="text-gray-300 leading-relaxed mb-6">
              Solution révolutionnaire pour la gestion moderne de vos ventes et inventaires.
              Transformez votre business avec une technologie élégante et performante.
            </p>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Heart className="w-4 h-4 text-rose-400 animate-pulse" />
              Fait avec passion à La Réunion
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-purple-300 tracking-wide">
              Navigation
            </h3>
            <ul className="space-y-4">
              {[
                { label: 'Accueil', to: '/' },
                { label: 'À propos', to: '/about' },
                { label: 'Contact', to: '/contact' },
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    to={item.to}
                    className="group flex items-center gap-3 text-gray-300 hover:text-white transition-all"
                  >
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 group-hover:scale-150 transition-transform" />
                    <span className="relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-purple-400 after:to-pink-400 after:transition-all group-hover:after:w-full">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}

          
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-purple-300 tracking-wide">
              Nos Services
            </h3>
            <ul className="space-y-4 text-gray-300">
              {[
                'Gestion des ventes',
                "Suivi d'inventaire",
                'Rapports analytiques',
                'Support',
              ].map((service, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400" />
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-purple-300 tracking-wide">
              Contactez-nous
            </h3>
            <div className="space-y-5">
              {[
                {
                  icon: MapPin,
                  title: 'Notre siège',
                  content: (
                    <>
                      10 Allée des Beryls Bleus<br />
                      Bellepierre<br />
                      97400, Saint-Denis
                    </>
                  ),
                  gradient: 'from-purple-500 to-pink-500',
                },
                {
                  icon: Mail,
                  title: 'Email',
                  content: 'vianey.jean@ymail.com',
                  gradient: 'from-blue-500 to-indigo-500',
                },
                {
                  icon: Phone,
                  title: 'Téléphone',
                  content: '+262 6 92 84 23 70',
                  gradient: 'from-green-500 to-emerald-500',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg`}
                  >
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Gestion Vente. Tous droits réservés.
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Conditions</span>
              <span className="w-1 h-1 bg-gray-600 rounded-full" />
              <span>Confidentialité</span>
              <span className="w-1 h-1 bg-gray-600 rounded-full" />
              <span>Mentions légales</span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {[
              'Version 4.0.0 - Système opérationnel',
              'Créé par Jean Rabemanalina',
            ].map((text, i) => (
              <div
                key={i}
                className="px-4 py-1.5 rounded-full bg-white/5 backdrop-blur border border-white/10 text-xs text-gray-400 flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
