/**
 * SessionShellNavbar.tsx — Navbar minimale (logo, A propos, Contact, thème)
 * utilisée par la page de conflit de session.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, Sun, ShieldCheck } from 'lucide-react';

const SessionShellNavbar: React.FC = () => {
  const [dark, setDark] = useState<boolean>(() => {
    try {
      return (localStorage.getItem('app-theme') || 'light') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try { localStorage.setItem('app-theme', dark ? 'dark' : 'light'); } catch { /* ignore */ }
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const toggle = useCallback(() => setDark((d) => !d), []);

  return (
    <header className="sticky top-0 z-50">
      <div className="absolute inset-0  bg-black/40 border-b border-white/10" />
      <nav className="relative mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 opacity-60  group-hover:opacity-90 transition-opacity" />
            <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center overflow-hidden shadow-lg">
              <img
                src="/images/logo.ico"
                alt="Logo"
                className="h-6 w-6 object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
              <ShieldCheck className="absolute h-5 w-5 text-white/80 opacity-0" />
            </div>
          </div>
          <span className="text-sm font-black tracking-[0.25em] uppercase bg-gradient-to-r from-white via-violet-200 to-fuchsia-300 bg-clip-text text-transparent">
            Session
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/about"
            className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            À propos
          </Link>
          <Link
            to="/contact"
            className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            Contact
          </Link>
          <motion.button
            type="button"
            onClick={toggle}
            whileTap={{ scale: 0.9 }}
            aria-label={dark ? 'Activer le mode clair' : 'Activer le mode sombre'}
            className="relative ml-1 h-10 w-10 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            {dark ? (
              <Sun className="h-[18px] w-[18px] text-amber-300" />
            ) : (
              <Moon className="h-[18px] w-[18px] text-violet-200" />
            )}
          </motion.button>
        </div>
      </nav>
    </header>
  );
};

export default SessionShellNavbar;
