import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
      <style>{`
        @keyframes footerOrbit {
          0% { transform: translate(0,0) scale(1); }
          50% { transform: translate(20px,-15px) scale(1.1); }
          100% { transform: translate(0,0) scale(1); }
        }
        @keyframes footerShine {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .footer-shine {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          background-size: 200% 100%;
          animation: footerShine 4s linear infinite;
        }
      `}</style>

      {/* ================= GLOBAL GLOW ================= */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-fuchsia-600/10 blur-[160px] rounded-full" style={{ animation: 'footerOrbit 12s ease-in-out infinite' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 blur-[160px] rounded-full" style={{ animation: 'footerOrbit 14s ease-in-out infinite reverse' }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0%,transparent_70%)]" />
      </div>

      {/* ================= TOP LINE ================= */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-fuchsia-400/60 to-transparent" />
      <div className="absolute top-0 inset-x-0 h-[2px] footer-shine" />

      <div className="relative max-w-7xl mx-auto px-6 py-16">

        {/* ================= GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* ================= BRAND ================= */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >

            <div className="flex items-center gap-3 mb-6">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.8 }}
                className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/40"
              >
                <Sparkles className="w-5 h-5 text-white" />
                <div className="absolute inset-0 rounded-2xl bg-white/10 animate-pulse" />
              </motion.div>

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
          </motion.div>

          {/* ================= NAVIGATION ================= */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/70 mb-6">
              Navigation
            </h3>

            <ul className="space-y-4">
              {[
                { label: 'Accueil', to: '/' },
                { label: 'À propos', to: '/about' },
                { label: 'Contact', to: '/contact' }
              ].map((item, i) => (
                <motion.li key={i} whileHover={{ x: 6 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <Link
                    to={item.to}
                    className="group flex items-center gap-3 text-white/50 hover:text-white transition"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-400 group-hover:scale-150 transition" />
                    <span className="relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-fuchsia-400 after:to-cyan-400 group-hover:after:w-full transition-all">
                      {item.label}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* ================= SERVICES ================= */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
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
                <motion.li key={i} whileHover={{ x: 6, color: '#fff' }} className="flex items-center gap-2 cursor-default">
                  <Zap className="w-3.5 h-3.5 text-cyan-400 hover:scale-125 transition-transform" />
                  {s}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* ================= CONTACT ================= */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
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
                <motion.div key={i} whileHover={{ x: 4, scale: 1.02 }} className="flex gap-4 group">

                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-fuchsia-500/20 group-hover:to-cyan-500/20 group-hover:border-fuchsia-400/40 transition-all">
                    <item.icon className="w-4 h-4 text-fuchsia-300 group-hover:scale-125 group-hover:rotate-12 transition-transform" />
                  </div>

                  <div>
                    <p className="text-white font-medium text-sm">
                      {item.title}
                    </p>
                    <p className="text-white/50 text-xs">
                      {item.content}
                    </p>
                  </div>

                </motion.div>
              ))}

            </div>
          </motion.div>

        </div>

        {/* ================= BOTTOM ================= */}
        <div className="mt-16 pt-8 border-t border-white/10">

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">

            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} Gestion Vente — Tous droits réservés
            </p>

            <div className="flex items-center gap-3 text-[11px] text-white/40">

              <motion.span whileHover={{ scale: 1.1, color: '#fff' }} className="cursor-pointer">Confidentialité</motion.span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <motion.span whileHover={{ scale: 1.1, color: '#fff' }} className="cursor-pointer">Conditions</motion.span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <motion.span whileHover={{ scale: 1.1, color: '#fff' }} className="cursor-pointer">Support</motion.span>

            </div>

          </div>

          {/* ================= STATUS BADGES ================= */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">

            {[
              'Version 6.0.0 — Ultra Premium Build',
              'Système stable & sécurisé',
              'Architecture SaaS avancée'
            ].map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -3, scale: 1.05 }}
                className="relative px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 flex items-center gap-2 overflow-hidden"
              >

                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-cyan-500/10" />

                <Rocket className="w-3.5 h-3.5 text-cyan-300 relative z-10 animate-pulse" />

                <span className="relative z-10">{text}</span>

              </motion.div>
            ))}

          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;