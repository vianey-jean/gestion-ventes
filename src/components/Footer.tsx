import React from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Heart,
  Sparkles,
  ShieldCheck,
  Zap,
  Rocket
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Footer: React.FC = () => {
  const { user } = useAuth();
  const [sidebarWidth, setSidebarWidth] = React.useState(0);

  React.useEffect(() => {
    const updateSidebarWidth = () => {
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        const marginLeft = window.getComputedStyle(mainContent).marginLeft;
        setSidebarWidth(parseInt(marginLeft) || 0);
      }
    };

    updateSidebarWidth();
    const resizeObserver = new ResizeObserver(updateSidebarWidth);
    const mainContent = document.getElementById('main-content');

    if (mainContent) resizeObserver.observe(mainContent);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <footer
      className="relative mt-auto overflow-hidden text-white transition-all duration-500
      bg-[#050012] border-t border-white/[0.06]"
      style={{ marginLeft: `${sidebarWidth}px` }}
    >

      {/* ================= GLOBAL GLOW ================= */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-fuchsia-600/10 blur-[160px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0%,transparent_70%)]" />
      </div>

      {/* ================= TOP LINE ================= */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 py-16">

        {/* ================= GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* ================= BRAND ================= */}
          <div className="lg:col-span-1">

            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
                <div className="absolute inset-0 rounded-2xl bg-white/10 animate-pulse" />
              </div>

              <span className="text-2xl font-extrabold bg-gradient-to-r from-fuchsia-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Gestion Vente
              </span>
            </div>

            <p className="text-white/50 leading-relaxed text-sm mb-6">
              Une plateforme SaaS ultra moderne pour gérer vos ventes,
              stocks et performances avec précision, élégance et puissance.
            </p>

            <div className="flex items-center gap-2 text-xs text-white/40">
              <Heart className="w-4 h-4 text-pink-400 animate-pulse" />
              Designed with precision in Réunion
            </div>
          </div>

          {/* ================= NAVIGATION ================= */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/70 mb-6">
              Navigation
            </h3>

            <ul className="space-y-4">
              {[
                { label: 'Accueil', to: '/' },
                { label: 'À propos', to: '/about' },
                { label: 'Contact', to: '/contact' }
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    to={item.to}
                    className="group flex items-center gap-3 text-white/50 hover:text-white transition"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-400 group-hover:scale-150 transition" />
                    <span className="relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-fuchsia-400 after:to-cyan-400 group-hover:after:w-full transition-all">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ================= SERVICES ================= */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/70 mb-6">
              Services
            </h3>

            <ul className="space-y-4 text-white/50 text-sm">
              {[
                'Gestion intelligente des ventes',
                'Suivi stock en temps réel',
                'Analytics avancés',
                'Support premium 24/7'
              ].map((s, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* ================= CONTACT ================= */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/70 mb-6">
              Contact
            </h3>

            <div className="space-y-5">

              {[
                {
                  icon: MapPin,
                  title: 'Adresse',
                  content: 'Saint-Denis, La Réunion'
                },
                {
                  icon: Mail,
                  title: 'Email',
                  content: 'vianey.jean@ymail.com'
                },
                {
                  icon: Phone,
                  title: 'Téléphone',
                  content: '+262 6 92 84 23 70'
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">

                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-fuchsia-300" />
                  </div>

                  <div>
                    <p className="text-white font-medium text-sm">
                      {item.title}
                    </p>
                    <p className="text-white/50 text-xs">
                      {item.content}
                    </p>
                  </div>

                </div>
              ))}

            </div>
          </div>

        </div>

        {/* ================= BOTTOM ================= */}
        <div className="mt-16 pt-8 border-t border-white/10">

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">

            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} Gestion Vente — Tous droits réservés
            </p>

            <div className="flex items-center gap-3 text-[11px] text-white/40">

              <span>Confidentialité</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>Conditions</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>Support</span>

            </div>

          </div>

          {/* ================= STATUS BADGES ================= */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">

            {[
              'Version 6.0.0 — Ultra Premium Build',
              'Système stable & sécurisé',
              'Architecture SaaS avancée'
            ].map((text, i) => (
              <div
                key={i}
                className="relative px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 flex items-center gap-2 overflow-hidden"
              >

                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-cyan-500/10" />

                <Rocket className="w-3.5 h-3.5 text-cyan-300 relative z-10" />

                <span className="relative z-10">{text}</span>

              </div>
            ))}

          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;