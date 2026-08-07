/**
 * SessionShellFooter.tsx — Footer minimal de la page de conflit de session.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const SessionShellFooter: React.FC = () => (
  <footer className="relative mt-auto">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-xl border-t border-white/10" />
    <div className="relative mx-auto max-w-6xl px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs text-white/50">
        <ShieldCheck className="h-4 w-4 text-violet-300" />
        <span>© {new Date().getFullYear()} — Sécurité de session unique</span>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <Link to="/about" className="text-white/50 hover:text-white transition-colors">À propos</Link>
        <Link to="/contact" className="text-white/50 hover:text-white transition-colors">Contact</Link>
        <Link to="/login" className="text-white/50 hover:text-white transition-colors">Connexion</Link>
      </div>
    </div>
  </footer>
);

export default SessionShellFooter;
