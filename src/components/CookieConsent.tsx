/**
 * CookieConsent Premium RGPD — Ultra Luxe 2026 Edition
 *
 * ✅ Conforme RGPD / ePrivacy
 * ✅ Consentement granulaire
 * ✅ Refus aussi simple qu’acceptation
 * ✅ Aucun cookie non essentiel avant consentement
 * ✅ Gestion des versions
 * ✅ Accessibilité améliorée
 * ✅ Glassmorphism premium + animations luxe
 * ✅ Responsive mobile / desktop
 * ✅ Event global "cookie-consent-updated"
 * ✅ Support Google Consent Mode prêt
 *
 * Stack:
 * - React
 * - TailwindCSS
 * - Framer Motion
 * - Lucide Icons
 */

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Sparkles,
  Cookie,
  Settings2,
  Check,
  X,
  ChevronRight,
  Lock,
  BarChart3,
  Megaphone,
} from 'lucide-react';

const CONSENT_VERSION = 3;
const STORAGE_KEY = 'luxury_rgpd_consent_v3';

type ConsentData = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: number;
};

const DEFAULT_PREFS = {
  analytics: false,
  marketing: false,
};

const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [prefs, setPrefs] = useState(DEFAULT_PREFS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        const timer = setTimeout(() => {
          setVisible(true);
        }, 1200);

        return () => clearTimeout(timer);
      }

      const parsed: ConsentData = JSON.parse(saved);

      if (!parsed.version || parsed.version < CONSENT_VERSION) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const persistConsent = (data: ConsentData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    /**
     * EVENT GLOBAL
     * Utilisable pour:
     * - Google Analytics
     * - Meta Pixel
     * - GTM
     * - Scripts tiers
     */
    window.dispatchEvent(
      new CustomEvent('cookie-consent-updated', {
        detail: data,
      }),
    );

    /**
     * GOOGLE CONSENT MODE (OPTIONNEL)
     */
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: data.analytics ? 'granted' : 'denied',
        ad_storage: data.marketing ? 'granted' : 'denied',
        ad_user_data: data.marketing ? 'granted' : 'denied',
        ad_personalization: data.marketing ? 'granted' : 'denied',
      });
    }
  };

  const saveConsent = (analytics: boolean, marketing: boolean) => {
    const payload: ConsentData = {
      essential: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };

    persistConsent(payload);

    setVisible(false);
  };

  const acceptAll = () => {
    saveConsent(true, true);
  };

  const rejectAll = () => {
    saveConsent(false, false);
  };

  const saveCustom = () => {
    saveConsent(prefs.analytics, prefs.marketing);
  };

  const Toggle = ({
    enabled,
    onClick,
    disabled = false,
  }: {
    enabled: boolean;
    onClick?: () => void;
    disabled?: boolean;
  }) => {
    return (
      <button
        type="button"
        aria-pressed={enabled}
        disabled={disabled}
        onClick={onClick}
        className={`
          relative
          w-[54px]
          h-[30px]
          rounded-full
          transition-all
          duration-300
          border
          ${
            enabled
              ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 border-violet-300/40 shadow-[0_0_25px_rgba(168,85,247,0.45)]'
              : 'bg-white/[0.06] border-white/10'
          }
          ${disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <motion.div
          layout
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
          className={`
            absolute
            top-[3px]
            ${
              enabled ? 'left-[27px]' : 'left-[3px]'
            }
            w-6
            h-6
            rounded-full
            bg-white
            shadow-xl
          `}
        />
      </button>
    );
  };

  const categories = useMemo(
    () => [
      {
        icon: Lock,
        title: 'Cookies essentiels',
        description:
          'Indispensables au fonctionnement sécurisé du site et à la gestion de votre session.',
        required: true,
        enabled: true,
      },
      {
        icon: BarChart3,
        title: 'Mesure d’audience',
        description:
          'Nous aide à comprendre les performances et améliorer votre expérience.',
        enabled: prefs.analytics,
        onToggle: () =>
          setPrefs((prev) => ({
            ...prev,
            analytics: !prev.analytics,
          })),
      },
      {
        icon: Megaphone,
        title: 'Marketing personnalisé',
        description:
          'Permet d’afficher des contenus et offres adaptés à vos intérêts.',
        enabled: prefs.marketing,
        onToggle: () =>
          setPrefs((prev) => ({
            ...prev,
            marketing: !prev.marketing,
          })),
      },
    ],
    [prefs],
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{
            opacity: 0,
            y: 60,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: 60,
            scale: 0.96,
          }}
          transition={{
            type: 'spring',
            damping: 22,
            stiffness: 220,
          }}
          className="
            fixed
            bottom-4
            left-4
            right-4
            md:left-6
            md:right-auto
            z-[99999]
            md:max-w-[680px]
          "
        >
          {/* GLOW */}
          <div className="absolute -inset-[1px] rounded-[32px] bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-400 opacity-40 blur-2xl animate-pulse" />

          {/* CARD */}
          <div
            className="
              relative
              overflow-hidden
              rounded-[32px]
              border
              border-white/10
              bg-[rgba(9,9,15,0.75)]
              backdrop-blur-3xl
              shadow-[0_25px_80px_rgba(0,0,0,0.65)]
            "
          >
            {/* BACKGROUND FX */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.22),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(217,70,239,0.18),transparent_35%)]" />

            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <div className="relative p-6 md:p-7">
              <AnimatePresence mode="wait">
                {!settingsOpen ? (
                  <motion.div
                    key="main"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                  >
                    {/* HEADER */}
                    <div className="flex gap-4">
                      <div className="relative shrink-0">
                        <div className="absolute inset-0 rounded-2xl bg-violet-500 blur-xl opacity-60" />

                        <div
                          className="
                            relative
                            flex
                            items-center
                            justify-center
                            w-14
                            h-14
                            rounded-2xl
                            bg-gradient-to-br
                            from-violet-500
                            to-fuchsia-500
                            shadow-2xl
                          "
                        >
                          <Cookie className="w-7 h-7 text-white" />
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h2 className="text-white font-semibold text-lg tracking-tight">
                            Votre confidentialité
                          </h2>

                          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                        </div>

                        <p className="text-sm leading-relaxed text-zinc-300">
                          Nous utilisons des cookies pour sécuriser le site,
                          analyser les performances et personnaliser certains
                          contenus.
                        </p>

                        <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                          Vous pouvez accepter, refuser ou personnaliser vos
                          choix conformément au RGPD et à la directive ePrivacy.
                        </p>
                      </div>
                    </div>

                    {/* BADGES */}
                    <div className="flex flex-wrap gap-2 mt-5">
                      <div className="px-3 py-1 rounded-full border border-emerald-400/20 bg-emerald-500/10 text-emerald-300 text-[11px] font-medium">
                        RGPD Conforme
                      </div>

                      <div className="px-3 py-1 rounded-full border border-violet-400/20 bg-violet-500/10 text-violet-300 text-[11px] font-medium">
                        Consentement explicite
                      </div>

                      <div className="px-3 py-1 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-300 text-[11px] font-medium">
                        Données protégées
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-7">
                      <button
                        onClick={() => setSettingsOpen(true)}
                        className="
                          group
                          inline-flex
                          items-center
                          gap-2
                          text-sm
                          text-zinc-300
                          hover:text-white
                          transition
                        "
                      >
                        <Settings2 className="w-4 h-4" />

                        Personnaliser

                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </button>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={rejectAll}
                          className="
                            h-11
                            px-5
                            rounded-2xl
                            border
                            border-white/10
                            bg-white/[0.04]
                            hover:bg-white/[0.08]
                            text-white
                            text-sm
                            font-medium
                            transition-all
                          "
                        >
                          Tout refuser
                        </button>

                        <button
                          onClick={acceptAll}
                          className="
                            h-11
                            px-5
                            rounded-2xl
                            bg-gradient-to-r
                            from-violet-500
                            to-fuchsia-500
                            hover:scale-[1.03]
                            active:scale-[0.98]
                            text-white
                            text-sm
                            font-semibold
                            transition-all
                            shadow-[0_12px_30px_rgba(168,85,247,0.45)]
                          "
                        >
                          <span className="flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            Tout accepter
                          </span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                  >
                    {/* HEADER SETTINGS */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-400/20 flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5 text-violet-300" />
                        </div>

                        <div>
                          <h3 className="text-white font-semibold">
                            Préférences de confidentialité
                          </h3>

                          <p className="text-xs text-zinc-500 mt-0.5">
                            Activez uniquement les catégories souhaitées.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSettingsOpen(false)}
                        className="
                          w-10
                          h-10
                          rounded-xl
                          border
                          border-white/10
                          bg-white/[0.04]
                          hover:bg-white/[0.08]
                          flex
                          items-center
                          justify-center
                          text-zinc-300
                          hover:text-white
                          transition
                        "
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* CATEGORIES */}
                    <div className="space-y-3">
                      {categories.map((item, index) => {
                        const Icon = item.icon;

                        return (
                          <div
                            key={index}
                            className="
                              rounded-2xl
                              border
                              border-white/8
                              bg-white/[0.03]
                              p-4
                              hover:border-violet-400/20
                              transition-all
                            "
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex gap-3">
                                <div className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
                                  <Icon className="w-5 h-5 text-violet-300" />
                                </div>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-semibold text-white">
                                      {item.title}
                                    </h4>

                                    {item.required && (
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/20 text-[10px] text-emerald-300 font-semibold uppercase tracking-wide">
                                        Obligatoire
                                      </span>
                                    )}
                                  </div>

                                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                                    {item.description}
                                  </p>
                                </div>
                              </div>

                              <Toggle
                                enabled={item.enabled}
                                onClick={item.onToggle}
                                disabled={item.required}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* FOOTER */}
                    <div className="flex flex-wrap justify-end gap-2 mt-6">
                      <button
                        onClick={rejectAll}
                        className="
                          h-11
                          px-5
                          rounded-2xl
                          border
                          border-white/10
                          bg-white/[0.04]
                          hover:bg-white/[0.08]
                          text-white
                          text-sm
                          font-medium
                          transition-all
                        "
                      >
                        Refuser
                      </button>

                      <button
                        onClick={saveCustom}
                        className="
                          h-11
                          px-5
                          rounded-2xl
                          bg-gradient-to-r
                          from-violet-500
                          via-fuchsia-500
                          to-pink-500
                          hover:scale-[1.03]
                          active:scale-[0.98]
                          text-white
                          text-sm
                          font-semibold
                          transition-all
                          shadow-[0_12px_30px_rgba(192,38,211,0.45)]
                        "
                      >
                        <span className="flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          Enregistrer mes choix
                        </span>
                      </button>
                    </div>

                    {/* LEGAL */}
                    <p className="mt-5 text-[11px] leading-relaxed text-zinc-500">
                      Vous pouvez modifier vos préférences à tout moment depuis
                      les paramètres de confidentialité du site.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;