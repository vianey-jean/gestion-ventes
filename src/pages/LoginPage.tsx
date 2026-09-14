/**
 * LoginPage.tsx
 * Premium / ultra-performant / responsive
 *
 * Logique conservée à 100% :
 * - Vérification email
 * - Connexion
 * - Tentatives / verrouillage
 * - Session unique
 * - AuthContext
 * - PasswordStrengthChecker
 * - Redirections existantes
 *
 * Optimisations apportées :
 * - Sections statiques extraites + React.memo (zéro re-render inutile
 *   pendant la frappe email/mot de passe)
 * - Lazy-load des composants lourds non critiques au premier rendu
 *   (PremiumLoading, PasswordStrengthChecker)
 * - Animations "entrée" migrées de Framer Motion (JS, coûteux à chaque
 *   re-render) vers des keyframes CSS pures (compositor-only, GPU)
 * - Flous décoratifs allégés sur mobile (blur-3xl coûte cher sur GPU
 *   bas de gamme) + transform-gpu / will-change ciblés
 * - Annulation des requêtes de vérification email en doublon (AbortController)
 * - Préconnexion réseau anticipée vers l'API (DNS + TLS avant le 1er call)
 * - useCallback sur les handlers, constantes hors-composant (pas de
 *   recréation d'objets/array à chaque render)
 *
 * Correction apportée (2FA) :
 * - Le PremiumLoading plein écran s'affiche désormais aussi pendant la
 *   vérification du code OTP (isVerifyingLoginOtp), pas uniquement lors
 *   du login initial (isLoggingIn).
 * - Si le code est correct → on passe à l'étape "appareil de confiance"
 *   (voir ci-dessous) avant de terminer la connexion.
 * - Si le code est incorrect → une fois le loading terminé, on revient
 *   automatiquement sur l'écran "Vérification en 2 étapes / Entrez le
 *   code à 6 chiffres reçu pour terminer votre connexion." avec le
 *   message d'erreur (comportement déjà géré par loginOtpError, inchangé).
 *
 * Nouveauté (Appareil de confiance / "rester connecté") :
 * - Un identifiant d'appareil (deviceId) unique est généré et stocké en
 *   localStorage pour CE navigateur (jamais partagé entre navigateurs
 *   ou appareils différents).
 * - Ce deviceId est envoyé au serveur à chaque tentative de connexion
 *   (`/api/auth/login`). C'est le SERVEUR qui décide si ce deviceId est
 *   déjà reconnu comme "de confiance" pour ce compte : si oui, il répond
 *   sans `requires2FA`, et on saute directement l'étape du code à 6
 *   chiffres. Si non (nouveau navigateur, appareil non reconnu, ou
 *   utilisateur ayant refusé la confiance précédemment), `requires2FA`
 *   reste à true comme avant.
 * - Une fois le code OTP validé avec succès, on demande à l'utilisateur
 *   "Rester connecté sur ce navigateur ?" :
 *     - Oui  → on appelle `/api/auth/trust-device` avec ce deviceId pour
 *              que le serveur mémorise cet appareil comme fiable pour ce
 *              compte. Les prochaines connexions depuis ce même
 *              navigateur ne redemanderont plus le code.
 *     - Non  → on supprime le deviceId stocké localement. Le prochain
 *              login régénérera un nouvel identifiant "anonyme", donc ce
 *              navigateur redemandera systématiquement le code à 6
 *              chiffres.
 * - Sécurité : le localStorage ne sert qu'à IDENTIFIER l'appareil (un
 *   identifiant aléatoire, pas un secret). La décision de confiance
 *   ("ce device peut sauter la 2FA") est toujours prise et stockée côté
 *   serveur, associée au compte utilisateur — un utilisateur malveillant
 *   qui modifierait la valeur en localStorage n'obtient donc rien : le
 *   serveur ne connaîtra simplement pas ce nouvel identifiant et
 *   redemandera la 2FA.
 * - NB : ceci suppose que le backend expose bien :
 *     - `/api/auth/login` acceptant un champ `deviceId` dans le body et
 *       omettant `requires2FA` quand ce deviceId est déjà de confiance ;
 *     - `/api/auth/trust-device` acceptant `{ deviceId }` pour associer
 *       l'appareil au compte connecté.
 *   Si vos endpoints portent un autre nom, il suffit d'ajuster les deux
 *   appels axios correspondants ci-dessous (clairement identifiés).
 */

import React, {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, useReducedMotion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import PasswordInput from '@/components/PasswordInput';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';

import { useAuth } from '@/contexts/AuthContext';
import { authService, api } from '@/service/api';
import OtpVerificationForm from '@/components/auth/OtpVerificationForm';
import connecteProfilUniqueApi from '@/services/api/connecteProfilUniqueApi';
import { savePendingLogin } from '@/pages/SessionConflictPage';

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Crown,
  Fingerprint,
  Gem,
  Globe,
  KeyRound,
  Lock,
  Mail,
  Rocket,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  Zap,
} from 'lucide-react';

// =============================================================
// LAZY (hors du chemin critique du 1er rendu)
// =============================================================

const PremiumLoading = lazy(
  () => import('@/components/ui/premium-loading')
);
const PasswordStrengthChecker = lazy(
  () => import('@/components/PasswordStrengthChecker')
);

// =============================================================
// CONSTANTES (hors composant → jamais recréées au re-render)
// =============================================================

const AUTH_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://server-gestion-ventes.onrender.com';

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const formatCountdown = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${remaining
    .toString()
    .padStart(2, '0')}`;
};

const FEATURE_HIGHLIGHTS = [
  { Icon: ShieldCheck, value: '100%', label: 'Sécurisé' },
  { Icon: Zap, value: 'Rapide', label: 'Expérience fluide' },
  { Icon: Cloud, value: 'Cloud', label: 'Accessible partout' },
] as const;

const SECURITY_BADGES = [
  { Icon: ShieldCheck, label: 'Sécurisé' },
  { Icon: Zap, label: 'Rapide' },
  { Icon: KeyRound, label: 'Protégé' },
] as const;

const AVATAR_LETTERS = ['V', 'C', 'S'] as const;
const STAR_INDICES = [1, 2, 3, 4, 5] as const;

// =============================================================
// APPAREIL DE CONFIANCE ("rester connecté sur ce navigateur")
// =============================================================

const DEVICE_ID_STORAGE_KEY = 'gv_trusted_device_id';

/**
 * Récupère l'identifiant d'appareil déjà stocké pour ce navigateur,
 * ou en génère un nouveau si absent (nouveau navigateur / stockage vidé).
 * Cet identifiant est un simple "nom" pour l'appareil, pas un secret :
 * la confiance réelle est décidée et stockée côté serveur.
 */
const getOrCreateDeviceId = () => {
  try {
    const existing = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    if (existing) return existing;

    const generated =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, generated);
    return generated;
  } catch {
    // localStorage indisponible (navigation privée stricte, etc.) :
    // on retombe sur un identifiant volatile, valable pour cette session
    // uniquement (le comportement redevient alors "toujours redemander").
    return `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
};

/**
 * Supprime l'identifiant d'appareil stocké : ce navigateur redeviendra
 * "inconnu" du serveur à la prochaine connexion, et la 2FA sera donc
 * redemandée systématiquement.
 */
const clearTrustedDeviceId = () => {
  try {
    window.localStorage.removeItem(DEVICE_ID_STORAGE_KEY);
  } catch {
    // ignore
  }
};

// =============================================================
// SOUS-COMPOSANTS STATIQUES MÉMOÏSÉS
// (ne se re-rendent jamais pendant la frappe email/password)
// =============================================================

const BackgroundDecor = React.memo(function BackgroundDecor() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className="
          absolute -left-32 -top-32 h-56 w-56 rounded-full
          bg-violet-500/15 blur-xl transform-gpu will-change-transform
          sm:h-96 sm:w-96 sm:blur-3xl
          dark:bg-violet-600/20
        "
      />
      <div
        className="
          absolute -bottom-32 -right-32 h-64 w-64 rounded-full
          bg-cyan-400/15 blur-xl transform-gpu will-change-transform
          sm:h-[28rem] sm:w-[28rem] sm:blur-3xl
          dark:bg-cyan-600/15
        "
      />
      <div
        className="
          absolute inset-0 opacity-40 dark:opacity-60
          [background-image:linear-gradient(rgba(15,23,42,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,.035)_1px,transparent_1px)]
          [background-size:56px_56px]
          dark:[background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)]
        "
      />
      <div
        className="
          hidden sm:block absolute left-1/2 top-1/2 h-72 w-72
          -translate-x-1/2 -translate-y-1/2 rounded-full
          bg-fuchsia-500/5 blur-3xl transform-gpu
        "
      />
    </div>
  );
});

const BrandPanel = React.memo(function BrandPanel() {
  return (
    <section className="hidden lg:block animate-[fade-slide-in_0.5s_ease-out_both]">
      <div
        className="
          inline-flex items-center gap-2 rounded-full
          border border-slate-900/10 bg-white/70 px-3 py-2
          text-xs font-semibold text-slate-600 shadow-sm
          dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70
        "
      >
        <span
          className="
            flex h-7 w-7 items-center justify-center rounded-full
            bg-gradient-to-br from-violet-600 to-fuchsia-500
          "
        >
          <Gem className="h-3.5 w-3.5 text-white" />
        </span>
        Premium Business Suite
        <Sparkles className="h-3.5 w-3.5 text-fuchsia-500" />
      </div>

      <h1
        className="
          mt-7 max-w-2xl text-5xl font-black leading-[.95]
          tracking-[-0.045em] text-slate-950
          xl:text-7xl dark:text-white
        "
      >
        Gérez votre
        <span
          className="
            block mt-2 bg-gradient-to-r
            from-violet-600 via-fuchsia-500 to-cyan-500
            bg-clip-text text-transparent
            dark:from-fuchsia-400 dark:via-violet-400 dark:to-cyan-300
          "
        >
          Business.
        </span>
        <span className="block mt-2">Avec élégance.</span>
      </h1>

      <p
        className="
          mt-7 max-w-xl text-base leading-relaxed text-slate-600
          xl:text-lg dark:text-white/50
        "
      >
        Une plateforme moderne pour centraliser vos ventes, vos
        clients, votre comptabilité, votre stock et votre activité
        commerciale.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        {FEATURE_HIGHLIGHTS.map(({ Icon, value, label }) => (
          <div
            key={label}
            className="
              rounded-2xl border border-slate-900/10 bg-white/65
              px-4 py-3 shadow-sm
              dark:border-white/[0.07] dark:bg-white/[0.035]
            "
          >
            <div className="flex items-center gap-2.5">
              <Icon className="h-4 w-4 text-violet-600 dark:text-fuchsia-400" />
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {value}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-white/40">
                  {label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-4">
        <div className="flex -space-x-2">
          {AVATAR_LETTERS.map((letter) => (
            <div
              key={letter}
              className="
                flex h-9 w-9 items-center justify-center rounded-full
                border-2 border-slate-50 bg-gradient-to-br
                from-violet-500 to-fuchsia-500
                text-xs font-bold text-white
                dark:border-[#03030a]
              "
            >
              {letter}
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center gap-1">
            {STAR_INDICES.map((item) => (
              <Star
                key={item}
                className="h-3 w-3 fill-amber-400 text-amber-400"
              />
            ))}
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-white/40">
            Une expérience pensée pour votre entreprise
          </p>
        </div>
      </div>
    </section>
  );
});

const MobileBrandFooter = React.memo(function MobileBrandFooter() {
  return (
    <div
      className="
        absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center
        gap-1.5 whitespace-nowrap text-[9px] font-medium text-slate-400
        lg:hidden dark:text-white/25
      "
    >
      <Sparkles className="h-3 w-3 text-violet-500" />
      Gestion Vente Premium
      <span>•</span>
      <Globe className="h-3 w-3" />
      Cloud
    </div>
  );
});

const SecurityBadgesRow = React.memo(function SecurityBadgesRow() {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {SECURITY_BADGES.map(({ Icon, label }) => (
        <div
          key={label}
          className="
            flex items-center gap-1.5 rounded-full
            border border-slate-900/10 bg-slate-100/60 px-2.5 py-1.5
            dark:border-white/[0.07] dark:bg-white/[0.035]
          "
        >
          <Icon className="h-3 w-3 text-violet-600 dark:text-fuchsia-400" />
          <span className="text-[9px] font-semibold text-slate-500 dark:text-white/50">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
});

const CardHeaderBlock = React.memo(function CardHeaderBlock() {
  return (
    <CardHeader className="px-6 pb-5 pt-7 sm:px-8 sm:pt-8">
      <div className="flex items-start justify-between gap-4">
        <div className="relative animate-[pop-in_0.35s_ease-out_both]">
          <div
            className="
              flex h-14 w-14 items-center justify-center rounded-[18px]
              bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-500
              shadow-lg shadow-violet-500/20
              sm:h-16 sm:w-16
            "
          >
            <Fingerprint className="h-7 w-7 text-white sm:h-8 sm:w-8" />
          </div>

          <div
            className="
              absolute -right-2 -top-2 flex h-6 w-6 items-center
              justify-center rounded-full bg-gradient-to-br
              from-amber-400 to-orange-500 shadow-md
            "
          >
            <Crown className="h-3 w-3 text-white" />
          </div>
        </div>

        <div
          className="
            flex shrink-0 items-center gap-1.5 rounded-full
            border border-slate-900/10 bg-slate-100/70 px-2.5 py-1.5
            dark:border-white/[0.08] dark:bg-white/[0.04]
          "
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-semibold text-slate-500 dark:text-white/50">
            Système sécurisé
          </span>
        </div>
      </div>

      <CardTitle
        className="
          mt-6 text-3xl font-black tracking-tight text-slate-950
          dark:text-white sm:text-4xl
        "
      >
        Connexion
      </CardTitle>

      <CardDescription
        className="
          mt-2 text-sm text-slate-500 dark:text-white/45 sm:text-base
        "
      >
        Accédez à votre espace de gestion premium.
      </CardDescription>

      <SecurityBadgesRow />
    </CardHeader>
  );
});

/**
 * Étape "appareil de confiance" affichée juste après une validation
 * réussie du code OTP. Ne modifie aucune logique existante : elle
 * s'intercale simplement entre "code validé" et "navigation finale".
 */
const TrustDevicePrompt = React.memo(function TrustDevicePrompt({
  isSaving,
  onChoice,
}: {
  isSaving: boolean;
  onChoice: (trust: boolean) => void;
}) {
  return (
    <div className="space-y-5 animate-[fade-slide-in_0.3s_ease-out_both]">
      <div
        className="
          flex flex-col items-center gap-3 rounded-2xl
          border border-slate-900/10 bg-slate-100/60 px-5 py-6 text-center
          dark:border-white/[0.07] dark:bg-white/[0.035]
        "
      >
        <div
          className="
            flex h-12 w-12 items-center justify-center rounded-full
            bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-500
          "
        >
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Rester connecté sur ce navigateur ?
        </h3>

        <p className="text-xs leading-relaxed text-slate-500 dark:text-white/50">
          Si vous faites confiance à cet appareil, nous ne vous
          redemanderons plus le code de vérification à 6 chiffres lors
          de vos prochaines connexions depuis ce navigateur.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          disabled={isSaving}
          onClick={() => onChoice(true)}
          className="
            h-12 flex-1 rounded-2xl border-0 bg-gradient-to-r
            from-violet-600 via-fuchsia-600 to-cyan-500 text-sm
            font-bold text-white disabled:pointer-events-none
            disabled:opacity-70
          "
        >
          {isSaving ? (
            <span
              className="
                h-4 w-4 rounded-full border-2 border-white/30
                border-t-white animate-spin transform-gpu
              "
            />
          ) : (
            'Oui, faire confiance'
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={isSaving}
          onClick={() => onChoice(false)}
          className="
            h-12 flex-1 rounded-2xl border-slate-900/10 bg-transparent
            text-sm font-semibold text-slate-600
            disabled:pointer-events-none disabled:opacity-70
            dark:border-white/[0.08] dark:text-white/60
          "
        >
          Non, redemander à chaque fois
        </Button>
      </div>
    </div>
  );
});

// =============================================================
// COMPOSANT PRINCIPAL
// =============================================================

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { hydrateAuthenticatedSession, loginChallenge, hydrateLoginChallenge, verifyLoginOtp, resendLoginOtp, cancelLoginChallenge } = useAuth();
  const reducedMotion = useReducedMotion();

  // =========================================================
  // FORM
  // =========================================================

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [showPasswordField, setShowPasswordField] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [userName, setUserName] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // =========================================================
  // SECURITY
  // =========================================================

  const [maxAttempts, setMaxAttempts] = useState(5);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const emailCheckAbortRef = useRef<AbortController | null>(null);

  // =========================================================
  // APPAREIL DE CONFIANCE (nouveau)
  // =========================================================

  const [showTrustDevicePrompt, setShowTrustDevicePrompt] = useState(false);
  const [isSavingTrustChoice, setIsSavingTrustChoice] = useState(false);
  const pendingLoggedUserRef = useRef<any>(null);

  // =========================================================
  // PRÉCONNEXION RÉSEAU (DNS + TLS avant le 1er appel API)
  // → gagne un aller-retour complet, particulièrement sensible
  //   sur les réseaux mobiles à latence élevée
  // =========================================================

  useEffect(() => {
    const links: HTMLLinkElement[] = [];

    [
      { rel: 'preconnect', href: AUTH_BASE_URL },
      { rel: 'dns-prefetch', href: AUTH_BASE_URL },
    ].forEach(({ rel, href }) => {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      link.crossOrigin = '';
      document.head.appendChild(link);
      links.push(link);
    });

    return () => {
      links.forEach((link) => document.head.removeChild(link));
    };
  }, []);

  // =========================================================
  // LOCK COUNTDOWN
  // =========================================================

  useEffect(() => {
    if (!isLocked || lockCountdown <= 0) return;

    countdownRef.current = setInterval(() => {
      setLockCountdown((previous) => {
        if (previous <= 1) {
          setIsLocked(false);
          setFailedAttempts(0);

          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [isLocked, lockCountdown]);

  // =========================================================
  // EMAIL CHECK
  // =========================================================

  const handleEmailCheck = useCallback(async () => {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setErrors((previous) => ({
        ...previous,
        email: 'Veuillez entrer votre adresse email.',
      }));
      return false;
    }

    if (!isValidEmail(cleanEmail)) {
      setErrors((previous) => ({
        ...previous,
        email: 'Veuillez entrer une adresse email valide.',
      }));
      return false;
    }

    // Annule une éventuelle vérification précédente encore en vol
    // (évite les réponses obsolètes qui écrasent l'état courant)
    emailCheckAbortRef.current?.abort();
    const controller = new AbortController();
    emailCheckAbortRef.current = controller;

    setIsCheckingEmail(true);

    try {
      const response = await axios.post(
        `${AUTH_BASE_URL}/api/auth/check-email`,
        { email: cleanEmail },
        { signal: controller.signal }
      );

      if (response.data?.exists) {
        const user = response.data.user || {};

        setEmailExists(true);
        setShowPasswordField(true);

        setUserName(
          `${user.firstName || ''} ${user.lastName || ''}`.trim()
        );

        setMaxAttempts(response.data.maxAttempts || 5);
        setFailedAttempts(response.data.failedAttempts || 0);

        if (response.data.locked) {
          setIsLocked(true);
          setLockCountdown(response.data.remainingSeconds || 0);
          setFailedAttempts(response.data.maxAttempts || 5);
        }

        setErrors((previous) => ({
          ...previous,
          email: undefined,
        }));

        return true;
      }

      setEmailExists(false);
      setShowPasswordField(false);

      setErrors((previous) => ({
        ...previous,
        email: "Ce profil n'existe pas.",
      }));

      return false;
    } catch (error) {
      if (axios.isCancel(error)) return false;

      console.error('Erreur lors de la vérification de l’email:', error);

      setEmailExists(false);
      setShowPasswordField(false);

      setErrors((previous) => ({
        ...previous,
        email: "Une erreur s'est produite. Veuillez réessayer.",
      }));

      return false;
    } finally {
      if (emailCheckAbortRef.current === controller) {
        setIsCheckingEmail(false);
      }
    }
  }, [email]);

  // =========================================================
  // FINALISATION DE LA CONNEXION
  // (session unique + navigation) — factorisée pour être appelée
  // soit directement (login sans 2FA / appareil déjà de confiance),
  // soit après le choix "rester connecté ?" qui suit une 2FA validée.
  // =========================================================

  const finalizeLogin = useCallback(
    async (loggedUser: any) => {
      try {
        const check = await connecteProfilUniqueApi.check({
          userId: String(loggedUser?.id || ''),
          role: loggedUser?.role,
        });

        if (!check.allowed && check.conflict) {
          savePendingLogin({
            email,
            userId: String(loggedUser?.id || ''),
            role: loggedUser?.role,
            nom: `${loggedUser?.firstName || ''} ${loggedUser?.lastName || ''}`.trim(),
            conflict: check.conflict,
          });
          navigate('/session-conflict');
          return;
        }

        const registration = await connecteProfilUniqueApi.registerLogin({
          userId: String(loggedUser?.id || ''),
          email,
          nom: `${loggedUser?.firstName || ''} ${loggedUser?.lastName || ''}`.trim(),
          role: loggedUser?.role,
        });
        connecteProfilUniqueApi.setSessionId(registration.sessionId);
      } catch {
        // Service de session unique non bloquant.
      }

      navigate('/dashboard');
    },
    [email, navigate]
  );

  // =========================================================
  // LOGIN
  // =========================================================

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setErrors({});

      const cleanEmail = email.trim();

      if (!cleanEmail) {
        setErrors({
          email: 'Veuillez entrer votre adresse email.',
        });
        return;
      }

      if (!isValidEmail(cleanEmail)) {
        setErrors({
          email: 'Veuillez entrer une adresse email valide.',
        });
        return;
      }

      if (!showPasswordField) {
        await handleEmailCheck();
        return;
      }

      if (!password) {
        setErrors({
          password: 'Veuillez entrer votre mot de passe.',
        });
        return;
      }

      if (isLocked) return;

      setIsLoggingIn(true);

      try {
        const response = await axios.post(
          `${AUTH_BASE_URL}/api/auth/login`,
          {
            email: cleanEmail,
            password,
            // Identifiant de CE navigateur : permet au serveur de
            // reconnaître un appareil déjà marqué "de confiance" et de
            // sauter la demande du code à 6 chiffres.
            deviceId: getOrCreateDeviceId(),
          }
        );

        if (response.data?.requires2FA && response.data?.challengeId) {
          setFailedAttempts(0);
          // Enregistre le challenge OTP dans le contexte (sans nouvel appel réseau)
          hydrateLoginChallenge(
            {
              challengeId: response.data.challengeId,
              method: response.data.method,
              maskedDestination: response.data.maskedDestination,
              expiresAt: response.data.expiresAt,
            },
            password
          );
        } else {
          // Pas de 2FA à faire : soit le compte ne l'exige pas, soit ce
          // navigateur est déjà reconnu comme appareil de confiance par
          // le serveur. La réponse contient directement { user, token },
          // exactement comme /login/verify-otp — on enregistre donc cette
          // session avec hydrateAuthenticatedSession() (pas d'appel réseau
          // supplémentaire, contrairement à login() qui attend des
          // identifiants email/password).
          setFailedAttempts(0);

          const loggedUser = response.data?.user;
          const sessionToken = response.data?.token;

          if (loggedUser && sessionToken) {
            hydrateAuthenticatedSession(loggedUser, sessionToken);
          }

          await finalizeLogin(
            loggedUser || authService.getCurrentUser() || {}
          );
        }
      } catch (error: any) {
        const status = error?.response?.status;
        const data = error?.response?.data;

        if (status === 423) {
          setIsLocked(true);
          setLockCountdown(data?.remainingSeconds || 0);
          setFailedAttempts(data?.maxAttempts || maxAttempts);
          setMaxAttempts(data?.maxAttempts || maxAttempts);
        } else if (
          status === 401 &&
          data?.failedAttempts !== undefined
        ) {
          setFailedAttempts(data.failedAttempts);
          setMaxAttempts(data.maxAttempts || maxAttempts);

          setErrors({
            password: `Mot de passe incorrect (${data.failedAttempts}/${data.maxAttempts})`,
          });
        } else {
          setErrors({
            password: data?.message || 'Identifiants invalides.',
          });
        }
      } finally {
        setIsLoggingIn(false);
      }
    },
    [
      email,
      password,
      showPasswordField,
      isLocked,
      maxAttempts,
      hydrateLoginChallenge,
      handleEmailCheck,
      hydrateAuthenticatedSession,
      finalizeLogin,
    ]
  );

  // =========================================================
  // 2FA — VALIDATION DU CODE DE CONNEXION
  // =========================================================

  const [isVerifyingLoginOtp, setIsVerifyingLoginOtp] = useState(false);
  const [isResendingLoginOtp, setIsResendingLoginOtp] = useState(false);
  const [loginOtpError, setLoginOtpError] = useState<string | null>(null);

  const handleLoginOtpVerify = useCallback(
    async (code: string) => {
      setIsVerifyingLoginOtp(true);
      setLoginOtpError(null);
      try {
        const success = await verifyLoginOtp(code);
        if (!success) {
          setLoginOtpError('Code incorrect ou expiré');
          return;
        }

        // Code correct : on ne finalise pas tout de suite. On demande
        // d'abord à l'utilisateur s'il souhaite que ce navigateur soit
        // reconnu comme appareil de confiance pour la prochaine fois.
        pendingLoggedUserRef.current = authService.getCurrentUser() || {};
        setShowTrustDevicePrompt(true);
      } finally {
        setIsVerifyingLoginOtp(false);
      }
    },
    [verifyLoginOtp]
  );

  const handleLoginOtpResend = useCallback(async () => {
    setIsResendingLoginOtp(true);
    try {
      await resendLoginOtp();
    } finally {
      setIsResendingLoginOtp(false);
    }
  }, [resendLoginOtp]);

  // =========================================================
  // CHOIX "RESTER CONNECTÉ SUR CE NAVIGATEUR ?" (nouveau)
  // =========================================================

  const handleTrustDeviceChoice = useCallback(
    async (trust: boolean) => {
      setIsSavingTrustChoice(true);

      try {
        if (trust) {
          try {
            // Demande au serveur de mémoriser cet appareil comme fiable
            // pour ce compte : les prochaines connexions depuis ce même
            // navigateur n'auront plus besoin du code à 6 chiffres.
            // NB : on utilise ici l'instance `api` (et non `axios` brut)
            // car la route /trust-device est protégée par authMiddleware
            // et exige un header "Authorization: Bearer <token>". C'est
            // l'intercepteur de requête de `api` (service/api.ts) qui
            // ajoute automatiquement ce token depuis le localStorage.
            await api.post('/api/auth/trust-device', {
              deviceId: getOrCreateDeviceId(),
            });
          } catch {
            // Non bloquant : si l'appel échoue, l'utilisateur se verra
            // simplement redemander le code lors de sa prochaine connexion.
          }
        } else {
          // L'utilisateur ne veut pas être reconnu : on oublie
          // l'identifiant local. Ce navigateur redemandera donc
          // systématiquement le code à 6 chiffres.
          clearTrustedDeviceId();
        }

        setShowTrustDevicePrompt(false);
        await finalizeLogin(pendingLoggedUserRef.current);
        pendingLoggedUserRef.current = null;
      } finally {
        setIsSavingTrustChoice(false);
      }
    },
    [finalizeLogin]
  );

  // =========================================================
  // EMAIL CHANGE
  // =========================================================

  const handleEmailChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      setEmail(value);
      setShowPasswordField(false);
      setEmailExists(false);
      setPassword('');
      setFailedAttempts(0);
      setIsLocked(false);
      setLockCountdown(0);
      setIsPasswordValid(false);

      setErrors((previous) =>
        previous.email ? { ...previous, email: undefined } : previous
      );
    },
    []
  );

  const handlePasswordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(event.target.value);

      setErrors((previous) =>
        previous.password
          ? { ...previous, password: undefined }
          : previous
      );
    },
    []
  );

  const handleEmailBlur = useCallback(() => {
    if (email && !showPasswordField) {
      void handleEmailCheck();
    }
  }, [email, showPasswordField, handleEmailCheck]);

  // =========================================================
  // DÉRIVÉS
  // =========================================================

  const remainingAttempts = useMemo(
    () => Math.max(maxAttempts - failedAttempts, 0),
    [maxAttempts, failedAttempts]
  );

  const attemptDots = useMemo(
    () => Array.from({ length: maxAttempts }),
    [maxAttempts]
  );

  // =========================================================
  // LOADING
  // Affiché pendant le login initial ET pendant la vérification
  // du code OTP (2FA). En cas de code correct, on affiche ensuite
  // l'étape "appareil de confiance" (voir showTrustDevicePrompt),
  // gérée directement dans la carte ci-dessous. En cas de code
  // incorrect, isVerifyingLoginOtp repasse à false et on retombe
  // naturellement sur l'écran "Vérification en 2 étapes" avec
  // l'erreur affichée.
  // =========================================================

  if (isLoggingIn || isVerifyingLoginOtp) {
    return (
      <Layout>
        <div className="flex min-h-[300px] items-center justify-center">
          <Suspense fallback={null}>
            <PremiumLoading
              text={isVerifyingLoginOtp ? 'Vérification du code ...' : 'Bienvenue ...'}
              size="lg"
              overlay={false}
              variant="default"
            />
          </Suspense>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title="Connexion Premium"
        description="Connexion sécurisée à votre plateforme de gestion commerciale."
        canonical="https://riziky-ventes.vercel.app/login"
      />

      <main
        className="
          relative flex min-h-[calc(100vh-64px)] items-center
          justify-center overflow-hidden px-4 py-8
          sm:px-6 sm:py-10
          lg:px-8
          bg-slate-50 dark:bg-[#03030a]
        "
      >
        <BackgroundDecor />

        {/* ===================================================
            MAIN
        ==================================================== */}

        <div
          className="
            relative z-10 w-full max-w-6xl
            lg:grid lg:grid-cols-[1fr_500px]
            lg:items-center lg:gap-12
            xl:gap-20
            animate-[fade-slide-in_0.45s_ease-out_both]
          "
        >
          <BrandPanel />

          {/* =================================================
              LOGIN CARD
          ================================================== */}

          <div
            className="
              relative mx-auto w-full max-w-[500px]
              animate-[pop-in_0.5s_ease-out_both]
            "
            style={{ animationDelay: '50ms' }}
          >
            {/* Halo (léger sur mobile, complet dès sm) */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none absolute -inset-2 rounded-[30px]
                bg-gradient-to-r from-violet-500/15 via-fuchsia-500/15
                to-cyan-500/15 blur-lg transform-gpu
                sm:-inset-3 sm:blur-xl
              "
            />

            <Card
              className="
                relative overflow-hidden rounded-[26px]
                border border-slate-900/10 bg-white/95
                shadow-[0_10px_35px_rgba(15,23,42,.10)]
                dark:border-white/[0.08] dark:bg-[#0a0a12]/95
                dark:shadow-[0_10px_35px_rgba(0,0,0,.45)]
                sm:rounded-[30px] sm:bg-white/90
                sm:shadow-[0_20px_70px_rgba(15,23,42,.12)]
                sm:backdrop-blur-xl
                dark:sm:bg-[#0a0a12]/90
                dark:sm:shadow-[0_20px_70px_rgba(0,0,0,.5)]
              "
            >
              <div
                className="
                  absolute inset-x-0 top-0 h-[2px]
                  bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400
                "
              />

              <CardHeaderBlock />

              {/* =================================================
                  FORM
              ================================================== */}

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-5 px-6 sm:px-8">
                  {showTrustDevicePrompt ? (
                    <TrustDevicePrompt
                      isSaving={isSavingTrustChoice}
                      onChoice={handleTrustDeviceChoice}
                    />
                  ) : loginChallenge ? (
                    <OtpVerificationForm
                      maskedDestination={loginChallenge.maskedDestination}
                      method={loginChallenge.method}
                      onVerify={handleLoginOtpVerify}
                      onResend={handleLoginOtpResend}
                      error={loginOtpError}
                      isVerifying={isVerifyingLoginOtp}
                      isResending={isResendingLoginOtp}
                      title="Vérification en 2 étapes"
                      description="Entrez le code à 6 chiffres reçu pour terminer votre connexion."
                    />
                  ) : (
                  <>
                  {/* EMAIL */}

                  <div className="space-y-2.5">
                    <Label
                      htmlFor="email"
                      className="
                        flex items-center gap-2 text-sm font-semibold
                        text-slate-700 dark:text-white/75
                      "
                    >
                      <Mail className="h-4 w-4 text-violet-600 dark:text-fuchsia-400" />
                      Adresse email
                    </Label>

                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        placeholder="exemple@email.com"
                        value={email}
                        disabled={isCheckingEmail || showPasswordField}
                        onBlur={handleEmailBlur}
                        onChange={handleEmailChange}
                        className={`
                          h-14 rounded-2xl border-slate-900/10
                          bg-slate-100/70 text-slate-900
                          transition-colors
                          dark:border-white/[0.08] dark:bg-white/[0.045]
                          dark:text-white
                          ${
                            errors.email
                              ? 'border-red-400/60'
                              : 'focus:border-violet-500/50'
                          }
                        `}
                      />

                      {isCheckingEmail && (
                        <span
                          className="
                            absolute right-4 top-1/2 h-5 w-5
                            -translate-y-1/2 rounded-full border-2
                            border-violet-500/20 border-t-violet-500
                            animate-spin transform-gpu
                            dark:border-white/20 dark:border-t-white
                          "
                        />
                      )}
                    </div>

                    {errors.email && (
                      <div
                        className="
                          flex items-center gap-2 text-xs font-medium
                          text-red-500 dark:text-red-400
                          animate-[fade-slide-in_0.2s_ease-out_both]
                        "
                      >
                        <AlertTriangle className="h-4 w-4" />
                        {errors.email}
                      </div>
                    )}

                    {emailExists && (
                      <div
                        className="
                          flex items-center gap-2 text-xs font-medium
                          text-emerald-600 dark:text-emerald-400
                          animate-[fade-slide-in_0.2s_ease-out_both]
                        "
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Bienvenue {userName}
                      </div>
                    )}
                  </div>

                  {/* PASSWORD */}

                  {showPasswordField && (
                    <div className="space-y-5 animate-[fade-slide-in_0.3s_ease-out_both]">
                      {/* ATTEMPTS */}

                      {failedAttempts > 0 && !isLocked && (
                        <div
                          className="
                            flex items-center justify-between gap-3
                            rounded-2xl border border-orange-400/20
                            bg-orange-500/5 px-4 py-3
                          "
                        >
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-orange-500" />
                            <span
                              className="
                                text-xs font-medium text-orange-700
                                dark:text-orange-200
                              "
                            >
                              Tentatives restantes : {remainingAttempts}
                            </span>
                          </div>

                          <div className="flex gap-1">
                            {attemptDots.map((_, index) => (
                              <span
                                key={index}
                                className={`
                                  h-1.5 w-1.5 rounded-full
                                  ${
                                    index < failedAttempts
                                      ? 'bg-red-500'
                                      : 'bg-slate-300 dark:bg-white/15'
                                  }
                                `}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* LOCK */}

                      {isLocked && lockCountdown > 0 && (
                        <div
                          className="
                            rounded-2xl border border-red-400/30
                            bg-red-500/5 p-4
                            dark:bg-red-500/10
                            animate-[pop-in_0.25s_ease-out_both]
                          "
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="
                                flex h-11 w-11 shrink-0 items-center
                                justify-center rounded-xl bg-red-500/10
                                dark:bg-red-500/20
                              "
                            >
                              <Lock className="h-5 w-5 text-red-500" />
                            </div>

                            <div>
                              <h3
                                className="
                                  text-sm font-bold text-red-700
                                  dark:text-red-200
                                "
                              >
                                Compte temporairement bloqué
                              </h3>
                              <p
                                className="
                                  mt-0.5 text-[11px] text-red-500/70
                                  dark:text-red-300/60
                                "
                              >
                                Trop de tentatives échouées
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-center gap-3">
                            <Timer className="h-5 w-5 text-red-500" />
                            <span
                              className="
                                font-mono text-2xl font-black
                                tracking-widest text-red-600
                                dark:text-red-200 tabular-nums
                              "
                            >
                              {formatCountdown(lockCountdown)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* PASSWORD FIELD */}

                      <div className="space-y-2.5">
                        <Label
                          htmlFor="password"
                          className="
                            flex items-center gap-2 text-sm font-semibold
                            text-slate-700 dark:text-white/75
                          "
                        >
                          <Lock className="h-4 w-4 text-violet-600 dark:text-fuchsia-400" />
                          Mot de passe
                        </Label>

                        <PasswordInput
                          id="password"
                          placeholder="••••••••"
                          value={password}
                          disabled={isLocked}
                          error={errors.password}
                          onChange={handlePasswordChange}
                          className="
                            h-14 rounded-2xl border-slate-900/10
                            bg-slate-100/70
                            dark:border-white/[0.08] dark:bg-white/[0.045]
                            dark:text-white
                          "
                        />

                        {!isLocked && (
                          <Suspense fallback={null}>
                            <PasswordStrengthChecker
                              password={password}
                              onValidityChange={setIsPasswordValid}
                            />
                          </Suspense>
                        )}
                      </div>

                      {/* FORGOT PASSWORD */}

                      <div className="flex justify-end">
                        <Link
                          to="/reset-password"
                          className="
                            group inline-flex items-center gap-1
                            text-xs font-semibold text-violet-600
                            transition-colors hover:text-violet-500
                            dark:text-fuchsia-400 dark:hover:text-fuchsia-300
                          "
                        >
                          Mot de passe oublié ?
                          <ChevronRight
                            className="
                              h-3.5 w-3.5 transition-transform
                              group-hover:translate-x-0.5
                            "
                          />
                        </Link>
                      </div>
                    </div>
                  )}
                  </>
                  )}
                </CardContent>

                {/* =================================================
                    FOOTER
                ================================================== */}

                <CardFooter className="flex flex-col gap-3 px-6 pb-7 pt-6 sm:px-8">
                  {!loginChallenge && !showTrustDevicePrompt && (
                  <Button
                    type="submit"
                    disabled={
                      isCheckingEmail ||
                      (showPasswordField &&
                        (!isPasswordValid || isLocked)) ||
                      isLocked
                    }
                    className="
                      group relative h-14 w-full overflow-hidden
                      rounded-2xl border-0 bg-gradient-to-r
                      from-violet-600 via-fuchsia-600 to-cyan-500
                      text-base font-bold text-white
                      shadow-lg shadow-violet-500/20
                      transition-transform hover:scale-[1.01]
                      active:scale-[.99] disabled:pointer-events-none
                    "
                  >
                    {!reducedMotion && (
                      <span
                        className="
                          pointer-events-none absolute inset-y-0 -left-1/3
                          w-1/3 skew-x-[-20deg] bg-white/15 blur-sm
                          transform-gpu will-change-transform
                          animate-[login-shine_3.5s_ease-in-out_infinite]
                        "
                      />
                    )}

                    <span className="relative flex items-center justify-center">
                      {isCheckingEmail ? (
                        <>
                          <span
                            className="
                              mr-3 h-5 w-5 rounded-full border-2
                              border-white/30 border-t-white animate-spin
                              transform-gpu
                            "
                          />
                          Vérification...
                        </>
                      ) : showPasswordField ? (
                        <>
                          <Lock className="mr-2 h-5 w-5" />
                          Se connecter
                          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </>
                      ) : (
                        <>
                          Continuer
                          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </span>
                  </Button>
                  )}

                  {!showTrustDevicePrompt && (
                  <Link to="/register" className="w-full">
                    <Button
                      type="button"
                      variant="outline"
                      className="
                        h-14 w-full rounded-2xl border-slate-900/10
                        bg-slate-100/70 text-slate-800
                        transition-colors hover:bg-slate-200/70
                        dark:border-white/[0.08] dark:bg-white/[0.035]
                        dark:text-white dark:hover:bg-white/[0.07]
                      "
                    >
                      <Rocket className="mr-2.5 h-5 w-5 text-cyan-600 dark:text-cyan-300" />
                      Créer un compte
                      <ArrowRight className="ml-auto h-4 w-4 text-slate-400 dark:text-white/40" />
                    </Button>
                  </Link>
                  )}

                  <div
                    className="
                      mt-2 flex items-center justify-center gap-2
                      text-center text-[9px] text-slate-400
                      dark:text-white/30
                    "
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    Vos données sont protégées.
                    <Star className="h-3 w-3 text-amber-500" />
                  </div>
                </CardFooter>
              </form>

              <div
                className="
                  absolute bottom-0 left-0 right-0 h-px
                  bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent
                "
              />
            </Card>
          </div>
        </div>

        <MobileBrandFooter />
      </main>

      {/* Animations CSS pures : rendues par le compositor, sans coût JS
          récurrent — bien plus légères que des motion.div sur mobile */}
      <style>{`
        @keyframes login-shine {
          0%, 55% { transform: translateX(-120%) skewX(-20deg); }
          80%, 100% { transform: translateX(420%) skewX(-20deg); }
        }

        @keyframes fade-slide-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pop-in {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </Layout>
  );
};

export default LoginPage;
