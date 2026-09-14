/**
 * ResetPasswordPage.tsx
 * Premium / ultra-performant / responsive
 * — Même identité visuelle que LoginPage.tsx —
 *
 * Logique conservée à 100% :
 * - Étape 1 : saisie de l'email → resetPasswordRequest
 * - Étape 2 : vérification du code OTP → verifyResetOtp / resendResetOtp
 * - Étape 3 : nouveau mot de passe → resetPassword
 * - PasswordStrengthChecker (ouverture/fermeture automatique)
 * - Redirection vers /login après succès
 *
 * Alignement de style avec LoginPage.tsx :
 * - Fond clair + dégradé violet/fuchsia/cyan (au lieu du thème sombre
 *   bleu/violet précédent)
 * - Carte blanche premium (rounded-[26px], halo, liseré dégradé en haut)
 * - Sections statiques mémoïsées (BackgroundDecor, BrandPanel,
 *   MobileBrandFooter, SecurityBadgesRow, CardHeaderBlock)
 * - Animations "entrée" en keyframes CSS pures (plus de Framer Motion)
 * - PremiumLoading chargé en lazy + Suspense, affiché en plein écran
 *   pendant l'envoi du code (isLoading) ET pendant la vérification du
 *   code OTP (verifyingOtp) — comme sur LoginPage.
 */

import React, { Suspense, lazy, useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
import OtpVerificationForm from '@/components/auth/OtpVerificationForm';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { useReducedMotion } from 'framer-motion';

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Cloud,
  Crown,
  Fingerprint,
  Gem,
  Globe,
  KeyRound,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
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

const FEATURE_HIGHLIGHTS = [
  { Icon: ShieldCheck, value: '100%', label: 'Sécurisé' },
  { Icon: Zap, value: 'Rapide', label: 'Code à 6 chiffres' },
  { Icon: Cloud, value: 'Cloud', label: 'Accessible partout' },
] as const;

const SECURITY_BADGES = [
  { Icon: ShieldCheck, label: 'Sécurisé' },
  { Icon: Zap, label: 'Rapide' },
  { Icon: KeyRound, label: 'Protégé' },
] as const;

// =============================================================
// SOUS-COMPOSANTS STATIQUES MÉMOÏSÉS
// (identiques à LoginPage.tsx pour garder la même identité visuelle)
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
        Récupérez votre
        <span
          className="
            block mt-2 bg-gradient-to-r
            from-violet-600 via-fuchsia-500 to-cyan-500
            bg-clip-text text-transparent
            dark:from-fuchsia-400 dark:via-violet-400 dark:to-cyan-300
          "
        >
          Compte.
        </span>
        <span className="block mt-2">En toute sécurité.</span>
      </h1>

      <p
        className="
          mt-7 max-w-xl text-base leading-relaxed text-slate-600
          xl:text-lg dark:text-white/50
        "
      >
        Réinitialisez votre mot de passe en quelques étapes et
        retrouvez l'accès à votre espace de gestion premium.
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

// Icône + titre + description du header, dépendant de l'étape.
// (memoïsé sur ses props pour éviter les re-renders pendant la frappe)
const CardHeaderBlock = React.memo(function CardHeaderBlock({
  emailVerified,
}: {
  emailVerified: boolean;
}) {
  return (
    <CardHeader className="px-6 pb-5 pt-7 sm:px-8 sm:pt-8">
      <div className="flex items-start justify-between gap-4">
        <div className="relative animate-[pop-in_0.35s_ease-out_both]">
          <div
            className={`
              flex h-14 w-14 items-center justify-center rounded-[18px]
              shadow-lg sm:h-16 sm:w-16
              ${
                emailVerified
                  ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 shadow-emerald-500/20'
                  : 'bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-500 shadow-violet-500/20'
              }
            `}
          >
            {emailVerified ? (
              <CheckCircle2 className="h-7 w-7 text-white sm:h-8 sm:w-8" />
            ) : (
              <Fingerprint className="h-7 w-7 text-white sm:h-8 sm:w-8" />
            )}
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
        {emailVerified ? 'Nouveau mot de passe' : 'Récupération'}
      </CardTitle>

      <CardDescription
        className="
          mt-2 text-sm text-slate-500 dark:text-white/45 sm:text-base
        "
      >
        {emailVerified
          ? 'Créez un mot de passe sécurisé pour votre compte.'
          : 'Saisissez votre email pour réinitialiser votre mot de passe.'}
      </CardDescription>

      <SecurityBadgesRow />
    </CardHeader>
  );
});

// =============================================================
// COMPOSANT PRINCIPAL
// =============================================================

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { resetPasswordRequest, resetChallenge, verifyResetOtp, resendResetOtp, resetPassword } = useAuth();
  const reducedMotion = useReducedMotion();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; newPassword?: string; confirmPassword?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [showPasswordChecker, setShowPasswordChecker] = useState(true); // Pour fermer le checker automatiquement

  // On est à l'étape "mot de passe" une fois le code OTP validé
  const emailVerified = otpVerified;

  const validatePassword = () => {
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
    const hasMinLength = newPassword.length >= 8;

    return hasLowerCase && hasUpperCase && hasNumber && hasSpecialChar && hasMinLength;
  };

  const handleEmailSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrors({});
      if (!email) { setErrors({ email: 'Veuillez entrer votre email' }); return; }
      if (!/\S+@\S+\.\S+/.test(email)) { setErrors({ email: 'Veuillez entrer un email valide' }); return; }
      setIsLoading(true);
      await resetPasswordRequest({ email });
      setIsLoading(false);
    },
    [email, resetPasswordRequest]
  );

  const handleOtpVerify = useCallback(
    async (code: string) => {
      setVerifyingOtp(true);
      setOtpError(null);
      const success = await verifyResetOtp(code);
      setVerifyingOtp(false);
      if (success) {
        setOtpVerified(true);
      } else {
        setOtpError('Code incorrect ou expiré');
      }
    },
    [verifyResetOtp]
  );

  const handleOtpResend = useCallback(async () => {
    setResendingOtp(true);
    await resendResetOtp();
    setResendingOtp(false);
  }, [resendResetOtp]);

  const handlePasswordSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrors({});
      const newErrors: { newPassword?: string; confirmPassword?: string } = {};
      if (!newPassword) { newErrors.newPassword = 'Veuillez entrer un nouveau mot de passe'; }
      else if (!validatePassword()) { newErrors.newPassword = 'Le mot de passe ne répond pas aux exigences de sécurité'; }
      if (!confirmPassword) { newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe'; }
      else if (newPassword !== confirmPassword) { newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'; }
      if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
      setIsLoading(true);
      const success = await resetPassword(newPassword, confirmPassword);
      setIsLoading(false);
      if (success) navigate('/login');
    },
    [newPassword, confirmPassword, resetPassword, navigate]
  );

  const handlePasswordValidityChange = useCallback((isValid: boolean) => {
    setIsPasswordValid(isValid);
    if (isValid) setShowPasswordChecker(false); // Fermer automatiquement le checker
    else setShowPasswordChecker(true);           // Réouvrir si invalide
  }, []);

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
      setErrors((previous) =>
        previous.email ? { ...previous, email: undefined } : previous
      );
    },
    []
  );

  const handleNewPasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewPassword(e.target.value);
      setErrors((previous) =>
        previous.newPassword ? { ...previous, newPassword: undefined } : previous
      );
    },
    []
  );

  const handleConfirmPasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setConfirmPassword(e.target.value);
      setErrors((previous) =>
        previous.confirmPassword ? { ...previous, confirmPassword: undefined } : previous
      );
    },
    []
  );

  // =========================================================
  // LOADING
  // Plein écran pendant l'envoi du code (isLoading) ET pendant
  // la vérification du code OTP (verifyingOtp), même comportement
  // que sur LoginPage.
  // =========================================================

  if (isLoading || verifyingOtp) {
    return (
      <Layout>
        <div className="flex min-h-[300px] items-center justify-center">
          <Suspense fallback={null}>
            <PremiumLoading
              text={verifyingOtp ? 'Vérification du code ...' : 'Traitement en cours ...'}
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
        title="Réinitialiser le mot de passe"
        description="Réinitialisation sécurisée du mot de passe de votre plateforme de gestion commerciale."
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
              RESET CARD
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

              <CardHeaderBlock emailVerified={emailVerified} />

              {/* =================================================
                  ÉTAPE 1 — EMAIL ou OTP
              ================================================== */}

              {!emailVerified ? (
                resetChallenge ? (
                  <CardContent className="px-6 pb-8 sm:px-8">
                    <OtpVerificationForm
                      maskedDestination={resetChallenge.maskedDestination}
                      method={resetChallenge.method}
                      onVerify={handleOtpVerify}
                      onResend={handleOtpResend}
                      error={otpError}
                      isVerifying={verifyingOtp}
                      isResending={resendingOtp}
                      title="Vérifiez votre identité"
                      description="Saisissez le code à 6 chiffres reçu pour continuer la réinitialisation."
                    />
                  </CardContent>
                ) : (
                  <form onSubmit={handleEmailSubmit}>
                    <CardContent className="space-y-2.5 px-6 sm:px-8">
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

                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        placeholder="exemple@email.com"
                        value={email}
                        onChange={handleEmailChange}
                        disabled={isLoading}
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
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3 px-6 pb-7 pt-6 sm:px-8">
                      <Button
                        type="submit"
                        disabled={isLoading}
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
                          <KeyRound className="mr-2 h-5 w-5" />
                          Envoyer le code
                          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </Button>

                      <Link to="/login" className="w-full">
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
                          <ArrowLeft className="mr-2.5 h-5 w-5 text-slate-500 dark:text-white/50" />
                          Retour à la connexion
                        </Button>
                      </Link>
                    </CardFooter>
                  </form>
                )
              ) : (
                /* =================================================
                    ÉTAPE 2 — NOUVEAU MOT DE PASSE
                ================================================== */
                <form onSubmit={handlePasswordSubmit}>
                  <CardContent className="space-y-5 px-6 sm:px-8">
                    <div className="space-y-2.5">
                      <Label
                        htmlFor="newPassword"
                        className="
                          flex items-center gap-2 text-sm font-semibold
                          text-slate-700 dark:text-white/75
                        "
                      >
                        <Shield className="h-4 w-4 text-violet-600 dark:text-fuchsia-400" />
                        Nouveau mot de passe
                      </Label>

                      <PasswordInput
                        id="newPassword"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={handleNewPasswordChange}
                        error={errors.newPassword}
                        disabled={isLoading}
                        className="
                          h-14 rounded-2xl border-slate-900/10
                          bg-slate-100/70
                          dark:border-white/[0.08] dark:bg-white/[0.045]
                          dark:text-white
                        "
                      />

                      <Suspense fallback={null}>
                        <PasswordStrengthChecker
                          password={newPassword}
                          onValidityChange={handlePasswordValidityChange}
                        />
                      </Suspense>
                    </div>

                    <div className="space-y-2.5">
                      <Label
                        htmlFor="confirmPassword"
                        className="
                          flex items-center gap-2 text-sm font-semibold
                          text-slate-700 dark:text-white/75
                        "
                      >
                        <Lock className="h-4 w-4 text-violet-600 dark:text-fuchsia-400" />
                        Confirmer le mot de passe
                      </Label>

                      <PasswordInput
                        id="confirmPassword"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        error={errors.confirmPassword}
                        disabled={isLoading}
                        className="
                          h-14 rounded-2xl border-slate-900/10
                          bg-slate-100/70
                          dark:border-white/[0.08] dark:bg-white/[0.045]
                          dark:text-white
                        "
                      />
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-3 px-6 pb-7 pt-6 sm:px-8">
                    <Button
                      type="submit"
                      disabled={isLoading || !isPasswordValid || !confirmPassword}
                      className="
                        group relative h-14 w-full overflow-hidden
                        rounded-2xl border-0 bg-gradient-to-r
                        from-emerald-600 via-teal-600 to-cyan-500
                        text-base font-bold text-white
                        shadow-lg shadow-emerald-500/20
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
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Réinitialiser le mot de passe
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Button>

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
              )}

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
          récurrent — identiques à LoginPage.tsx */}
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

export default ResetPasswordPage;
