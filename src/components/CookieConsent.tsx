/**
 * CookieConsent — Bannière cookies ultra-luxe avec préférences granulaires
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
  const [prefs, setPrefs] = useState({
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
    persist({
      essential: true,
      analytics: prefs.analytics,
      marketing: prefs.marketing,
      date: new Date().toISOString(),
      version: 2,
    });
    setVisible(false);
  };

  const Toggle = ({ enabled, onToggle, disabled = false }: any) => (
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
      <div
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
          enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
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
          className="fixed bottom-4 left-0 right-0 z-[9999] px-4 sm:px-6 lg:px-8"
        >
          {/* Wrapper responsive */}
          <div className="flex justify-center lg:justify-start">
            <div className="w-full max-w-md lg:ml-8 xl:ml-16">
              <div className="relative overflow-hidden rounded-3xl">

                {/* Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 rounded-3xl opacity-40 blur-xl animate-pulse" />

                <div className="relative rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-slate-950/95 via-violet-950/85 to-indigo-950/95 border border-white/10 shadow-2xl overflow-hidden">

                  {/* Ligne shimmer */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />

                  {/* Orbes */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-fuchsia-500/20 blur-3xl" />
                  <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-violet-500/20 blur-3xl" />

                  <div className="relative p-5 sm:p-6">

                    <AnimatePresence mode="wait">
                      {!showSettings ? (
                        <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                          {/* Header */}
                          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
                            <div className="relative shrink-0">
                              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl blur-md opacity-70" />
                              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-xl">
                                <Cookie className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                              </div>
                            </div>

                            <div className="flex-1">
                              <h3 className="text-sm sm:text-base font-bold text-white">
                                Vos préférences cookies
                              </h3>
                              <p className="text-xs text-violet-100/70 mt-1">
                                Nous utilisons des cookies pour améliorer votre expérience.
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowSettings(true)}
                              className="text-xs"
                            >
                              <Settings2 className="w-3.5 h-3.5 mr-1.5" />
                              Personnaliser
                            </Button>

                            <Button size="sm" onClick={rejectAll} className="text-xs">
                              Refuser
                            </Button>

                            <Button size="sm" onClick={acceptAll} className="text-xs font-bold">
                              <Check className="w-3.5 h-3.5 mr-1.5" />
                              Tout accepter
                            </Button>
                          </div>

                        </motion.div>
                      ) : (
                        <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                          <div className="flex justify-between mb-4">
                            <h3 className="text-sm font-bold text-white">Préférences</h3>
                            <button onClick={() => setShowSettings(false)}>
                              <X className="w-4 h-4 text-white" />
                            </button>
                          </div>

                          <div className="space-y-3 mb-4">

                            <div className="flex justify-between">
                              <span className="text-xs text-white">Analytiques</span>
                              <Toggle enabled={prefs.analytics} onToggle={() => setPrefs(p => ({ ...p, analytics: !p.analytics }))} />
                            </div>

                            <div className="flex justify-between">
                              <span className="text-xs text-white">Marketing</span>
                              <Toggle enabled={prefs.marketing} onToggle={() => setPrefs(p => ({ ...p, marketing: !p.marketing }))} />
                            </div>

                          </div>

                          <div className="flex justify-end gap-2">
                            <Button size="sm" onClick={rejectAll}>Refuser</Button>
                            <Button size="sm" onClick={saveCustom}>Enregistrer</Button>
                          </div>

                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;