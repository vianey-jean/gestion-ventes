/**
 * CookieConsent — Bannière cookies ultra-luxe avec préférences granulaires
 * 
 * - Stocke le choix complet (essentiels/analytiques/marketing) dans localStorage
 * - Design glassmorphism premium avec gradients animés
 * - Conforme RGPD : consentement explicite par catégorie
 */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Sparkles, Settings2, Cookie, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CONSENT_KEY = 'rgpd_cookie_consent';

interface ConsentPrefs {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  date: string;
  version: number;
}

const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState<{ analytics: boolean; marketing: boolean }>({
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) {
        const t = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(t);
      }
      // Si version obsolète → redemander
      const parsed = JSON.parse(raw);
      if (!parsed?.version || parsed.version < 2) {
        const t = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(t);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const persist = (data: ConsentPrefs) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
    // Émettre un event pour que les scripts d'analytics puissent réagir
    window.dispatchEvent(new CustomEvent('cookie-consent-changed', { detail: data }));
  };

  const acceptAll = () => {
    persist({ essential: true, analytics: true, marketing: true, date: new Date().toISOString(), version: 2 });
    setVisible(false);
  };

  const rejectAll = () => {
    persist({ essential: true, analytics: false, marketing: false, date: new Date().toISOString(), version: 2 });
    setVisible(false);
  };

  const saveCustom = () => {
    persist({ essential: true, analytics: prefs.analytics, marketing: prefs.marketing, date: new Date().toISOString(), version: 2 });
    setVisible(false);
  };

  const Toggle = ({ enabled, onToggle, disabled = false }: { enabled: boolean; onToggle: () => void; disabled?: boolean }) => (
    <button
      type="button"
      onClick={disabled ? undefined : onToggle}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
        disabled
          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 opacity-70 cursor-not-allowed'
          : enabled
            ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/40'
            : 'bg-white/10 border border-white/15'
      }`}
    >
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${enabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </button>
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 22, stiffness: 220 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-2xl"
        >
          <div className="relative overflow-hidden rounded-3xl">
            {/* Glow background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 rounded-3xl opacity-40 blur-xl animate-pulse" />

            <div className="relative rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-slate-950/95 via-violet-950/85 to-indigo-950/95 border border-white/10 shadow-2xl overflow-hidden">
              {/* Top shimmer line */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />

              {/* Floating orbs */}
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-fuchsia-500/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />

              <div className="relative p-6">
                <AnimatePresence mode="wait">
                  {!showSettings ? (
                    <motion.div
                      key="main"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                    >
                      <div className="flex items-start gap-4 mb-5">
                        <div className="relative shrink-0">
                          <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl blur-md opacity-70" />
                          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-xl">
                            <Cookie className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-bold text-white">Vos préférences cookies</h3>
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                          </div>
                          <p className="text-xs text-violet-100/70 leading-relaxed">
                            Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser le contenu. 
                            Vos données sont protégées conformément au <strong className="text-violet-300">RGPD</strong>.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSettings(true)}
                          className="rounded-xl text-violet-200 hover:text-white hover:bg-white/5 text-xs font-medium"
                        >
                          <Settings2 className="w-3.5 h-3.5 mr-1.5" />
                          Personnaliser
                        </Button>
                        <Button
                          size="sm"
                          onClick={rejectAll}
                          className="rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 text-xs font-medium"
                        >
                          Refuser
                        </Button>
                        <Button
                          size="sm"
                          onClick={acceptAll}
                          className="relative rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:scale-105 transition-transform shadow-lg shadow-violet-500/40 text-xs font-bold"
                        >
                          <Check className="w-3.5 h-3.5 mr-1.5" />
                          Tout accepter
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="settings"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-violet-400" />
                          <h3 className="text-sm font-bold text-white">Préférences détaillées</h3>
                        </div>
                        <button
                          onClick={() => setShowSettings(false)}
                          className="p-1 rounded-lg hover:bg-white/10 text-violet-300 hover:text-white transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3 mb-5">
                        {/* Essentiels */}
                        <div className="rounded-xl p-3 bg-white/[0.03] border border-white/5">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">Essentiels</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">Requis</span>
                              </div>
                              <p className="text-[11px] text-violet-200/60 mt-0.5">Nécessaires au fonctionnement (session, sécurité).</p>
                            </div>
                            <Toggle enabled={true} onToggle={() => {}} disabled />
                          </div>
                        </div>

                        {/* Analytiques */}
                        <div className="rounded-xl p-3 bg-white/[0.03] border border-white/5 hover:border-violet-400/20 transition">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-bold text-white">Analytiques</span>
                              <p className="text-[11px] text-violet-200/60 mt-0.5">Mesure d'audience anonyme pour améliorer le site.</p>
                            </div>
                            <Toggle enabled={prefs.analytics} onToggle={() => setPrefs(p => ({ ...p, analytics: !p.analytics }))} />
                          </div>
                        </div>

                        {/* Marketing */}
                        <div className="rounded-xl p-3 bg-white/[0.03] border border-white/5 hover:border-violet-400/20 transition">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-bold text-white">Marketing</span>
                              <p className="text-[11px] text-violet-200/60 mt-0.5">Personnalisation des offres et publicités ciblées.</p>
                            </div>
                            <Toggle enabled={prefs.marketing} onToggle={() => setPrefs(p => ({ ...p, marketing: !p.marketing }))} />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 justify-end">
                        <Button size="sm" onClick={rejectAll} className="rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 text-xs">
                          Tout refuser
                        </Button>
                        <Button size="sm" onClick={saveCustom} className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:scale-105 transition shadow-lg shadow-violet-500/40 text-xs font-bold">
                          <Check className="w-3.5 h-3.5 mr-1.5" /> Enregistrer mes choix
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
