/**
 * LoginPage.tsx
 * Premium / performant / responsive
 *
 * Logique conservée :
 * - Vérification email
 * - Connexion
 * - Tentatives / verrouillage
 * - Session unique
 * - AuthContext
 * - PasswordStrengthChecker
 * - Redirections existantes
 */

import React, { useEffect, useRef, useState } from 'react';
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
import PasswordStrengthChecker from '@/components/PasswordStrengthChecker';
import Layout from '@/components/Layout';
import PremiumLoading from '@/components/ui/premium-loading';
import SEOHead from '@/components/SEOHead';

import { useAuth } from '@/contexts/AuthContext';
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

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
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

  const handleEmailCheck = async () => {
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

    setIsCheckingEmail(true);

    try {
      const response = await axios.post(
        `${AUTH_BASE_URL}/api/auth/check-email`,
        { email: cleanEmail }
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
      console.error('Erreur lors de la vérification de l’email:', error);

      setEmailExists(false);
      setShowPasswordField(false);

      setErrors((previous) => ({
        ...previous,
        email: "Une erreur s'est produite. Veuillez réessayer.",
      }));

      return false;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // =========================================================
  // LOGIN
  // =========================================================

  const handleSubmit = async (event: React.FormEvent) => {
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
        }
      );

      if (response.data?.token) {
        setFailedAttempts(0);

        const loggedUser = response.data.user || {};

        // =====================================================
        // SESSION UNIQUE
        // =====================================================

        try {
          const check = await connecteProfilUniqueApi.check({
            userId: String(loggedUser.id || ''),
            role: loggedUser.role,
          });

          if (!check.allowed && check.conflict) {
            savePendingLogin({
              email: cleanEmail,
              password,
              userId: String(loggedUser.id || ''),
              role: loggedUser.role,
              nom: `${loggedUser.firstName || ''} ${
                loggedUser.lastName || ''
              }`.trim(),
              conflict: check.conflict,
            });

            setIsLoggingIn(false);
            navigate('/session-conflict');
            return;
          }
        } catch {
          // Service de session unique non bloquant.
        }

        // =====================================================
        // AUTH CONTEXT
        // =====================================================

        const success = await login({
          email: cleanEmail,
          password,
        });

        if (success) {
          try {
            const registration =
              await connecteProfilUniqueApi.registerLogin({
                userId: String(loggedUser.id || ''),
                email: cleanEmail,
                nom: `${loggedUser.firstName || ''} ${
                  loggedUser.lastName || ''
                }`.trim(),
                role: loggedUser.role,
              });

            connecteProfilUniqueApi.setSessionId(
              registration.sessionId
            );
          } catch {
            // Non bloquant.
          }

          navigate('/dashboard');
        }
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
          password:
            data?.message || 'Identifiants invalides.',
        });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // =========================================================
  // EMAIL CHANGE
  // =========================================================

  const handleEmailChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    setEmail(value);
    setShowPasswordField(false);
    setEmailExists(false);
    setPassword('');
    setFailedAttempts(0);
    setIsLocked(false);
    setLockCountdown(0);
    setIsPasswordValid(false);

    if (errors.email) {
      setErrors((previous) => ({
        ...previous,
        email: undefined,
      }));
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoggingIn) {
    return (
      <Layout>
        <div className="flex min-h-[300px] items-center justify-center">
      <PremiumLoading
        text="Bienvenue ..."
        size="lg"
        overlay={false}
        variant="default"
      />
    </div>
      </Layout>
    );
  }

  const remainingAttempts = Math.max(
    maxAttempts - failedAttempts,
    0
  );

  const entrance = (reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        transition: {
          duration: 0.45,
          ease: 'easeOut',
        },
      }) as React.ComponentProps<typeof motion.div>;


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
        {/* ===================================================
            LIGHTWEIGHT BACKGROUND
        ==================================================== */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute inset-0 overflow-hidden
          "
        >
          {/* Gradient glow — CSS only */}
          <div
            className="
              absolute -left-32 -top-32
              h-72 w-72 rounded-full
              bg-violet-500/15
              blur-3xl
              sm:h-96 sm:w-96
              dark:bg-violet-600/20
            "
          />

          <div
            className="
              absolute -bottom-32 -right-32
              h-80 w-80 rounded-full
              bg-cyan-400/15
              blur-3xl
              sm:h-[28rem] sm:w-[28rem]
              dark:bg-cyan-600/15
            "
          />

          {/* Fine grid */}
          <div
            className="
              absolute inset-0 opacity-40 dark:opacity-60
              [background-image:linear-gradient(rgba(15,23,42,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,.035)_1px,transparent_1px)]
              [background-size:56px_56px]
              dark:[background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)]
            "
          />

          {/* Small ambient light */}
          <div
            className="
              absolute left-1/2 top-1/2
              h-72 w-72 -translate-x-1/2 -translate-y-1/2
              rounded-full
              bg-fuchsia-500/5
              blur-3xl
            "
          />
        </div>

        {/* ===================================================
            MAIN
        ==================================================== */}

        <motion.div
          {...entrance}
          className="
            relative z-10 w-full max-w-6xl
            lg:grid lg:grid-cols-[1fr_500px]
            lg:items-center lg:gap-12
            xl:gap-20
          "
        >
          {/* =================================================
              DESKTOP PRESENTATION
          ================================================== */}

          <section className="hidden lg:block">
            <div
              className="
                inline-flex items-center gap-2
                rounded-full border border-slate-900/10
                bg-white/70 px-3 py-2
                text-xs font-semibold text-slate-600
                shadow-sm
                dark:border-white/10
                dark:bg-white/[0.04]
                dark:text-white/70
              "
            >
              <span
                className="
                  flex h-7 w-7 items-center justify-center
                  rounded-full
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
                mt-7 max-w-2xl
                text-5xl font-black leading-[.95]
                tracking-[-0.045em]
                text-slate-950
                xl:text-7xl
                dark:text-white
              "
            >
              Gérez votre
              <span
                className="
                  block mt-2
                  bg-gradient-to-r
                  from-violet-600 via-fuchsia-500 to-cyan-500
                  bg-clip-text text-transparent
                  dark:from-fuchsia-400
                  dark:via-violet-400
                  dark:to-cyan-300
                "
              >
                Business.
              </span>
              <span className="block mt-2">
                Avec élégance.
              </span>
            </h1>

            <p
              className="
                mt-7 max-w-xl
                text-base leading-relaxed
                text-slate-600
                xl:text-lg
                dark:text-white/50
              "
            >
              Une plateforme moderne pour centraliser vos
              ventes, vos clients, votre comptabilité, votre
              stock et votre activité commerciale.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {[
                [ShieldCheck, '100%', 'Sécurisé'],
                [Zap, 'Rapide', 'Expérience fluide'],
                [Cloud, 'Cloud', 'Accessible partout'],
              ].map(([Icon, value, label]) => {
                const IconComponent = Icon as React.ElementType;

                return (
                  <div
                    key={String(label)}
                    className="
                      rounded-2xl
                      border border-slate-900/10
                      bg-white/65 px-4 py-3
                      shadow-sm
                      dark:border-white/[0.07]
                      dark:bg-white/[0.035]
                    "
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComponent
                        className="
                          h-4 w-4
                          text-violet-600
                          dark:text-fuchsia-400
                        "
                      />

                      <div>
                        <div
                          className="
                            text-sm font-bold
                            text-slate-900 dark:text-white
                          "
                        >
                          {String(value)}
                        </div>

                        <div
                          className="
                            text-[10px]
                            text-slate-500
                            dark:text-white/40
                          "
                        >
                          {String(label)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                {['V', 'C', 'S'].map((letter) => (
                  <div
                    key={letter}
                    className="
                      flex h-9 w-9 items-center justify-center
                      rounded-full border-2
                      border-slate-50
                      bg-gradient-to-br
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
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Star
                      key={item}
                      className="
                        h-3 w-3 fill-amber-400
                        text-amber-400
                      "
                    />
                  ))}
                </div>

                <p className="mt-1 text-[11px] text-slate-500 dark:text-white/40">
                  Une expérience pensée pour votre entreprise
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              LOGIN CARD
          ================================================== */}

          <motion.div
            initial={
              reducedMotion
                ? undefined
                : { opacity: 0, y: 22, scale: 0.985 }
            }
            animate={
              reducedMotion
                ? undefined
                : { opacity: 1, y: 0, scale: 1 }
            }
            transition={
              reducedMotion
                ? undefined
                : {
                    duration: 0.5,
                    delay: 0.05,
                    ease: 'easeOut',
                  }
            }
            className="relative mx-auto w-full max-w-[500px]"
          >
            {/* Subtle glow */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none absolute -inset-2
                rounded-[30px]
                bg-gradient-to-r
                from-violet-500/15
                via-fuchsia-500/15
                to-cyan-500/15
                blur-xl
                sm:-inset-3
              "
            />

            <Card
              className="
                relative overflow-hidden
                rounded-[26px]
                border border-slate-900/10
                bg-white/90
                shadow-[0_20px_70px_rgba(15,23,42,.12)]
                dark:border-white/[0.08]
                dark:bg-[#0a0a12]/90
                dark:shadow-[0_20px_70px_rgba(0,0,0,.5)]
                sm:rounded-[30px]
                sm:backdrop-blur-xl
              "
            >
              {/* Top accent */}
              <div
                className="
                  absolute inset-x-0 top-0 h-[2px]
                  bg-gradient-to-r
                  from-violet-500
                  via-fuchsia-500
                  to-cyan-400
                "
              />

              {/* =================================================
                  HEADER
              ================================================== */}

              <CardHeader className="px-6 pb-5 pt-7 sm:px-8 sm:pt-8">
                <div className="flex items-start justify-between gap-4">
                  <motion.div
                    initial={
                      reducedMotion
                        ? undefined
                        : { scale: 0.8, opacity: 0 }
                    }
                    animate={
                      reducedMotion
                        ? undefined
                        : { scale: 1, opacity: 1 }
                    }
                    transition={{
                      duration: 0.35,
                      ease: 'easeOut',
                    }}
                    className="relative"
                  >
                    <div
                      className="
                        flex h-14 w-14 items-center justify-center
                        rounded-[18px]
                        bg-gradient-to-br
                        from-violet-600
                        via-fuchsia-500
                        to-cyan-500
                        shadow-lg shadow-violet-500/20
                        sm:h-16 sm:w-16
                      "
                    >
                      <Fingerprint className="h-7 w-7 text-white sm:h-8 sm:w-8" />
                    </div>

                    <div
                      className="
                        absolute -right-2 -top-2
                        flex h-6 w-6 items-center justify-center
                        rounded-full
                        bg-gradient-to-br from-amber-400 to-orange-500
                        shadow-md
                      "
                    >
                      <Crown className="h-3 w-3 text-white" />
                    </div>
                  </motion.div>

                  <div
                    className="
                      flex shrink-0 items-center gap-1.5
                      rounded-full
                      border border-slate-900/10
                      bg-slate-100/70 px-2.5 py-1.5
                      dark:border-white/[0.08]
                      dark:bg-white/[0.04]
                    "
                  >
                    <span
                      className="
                        h-1.5 w-1.5 rounded-full
                        bg-emerald-500
                        animate-pulse
                      "
                    />

                    <span
                      className="
                        text-[9px] font-semibold
                        text-slate-500
                        dark:text-white/50
                      "
                    >
                      Système sécurisé
                    </span>
                  </div>
                </div>

                <CardTitle
                  className="
                    mt-6 text-3xl font-black
                    tracking-tight
                    text-slate-950
                    dark:text-white
                    sm:text-4xl
                  "
                >
                  Connexion
                </CardTitle>

                <CardDescription
                  className="
                    mt-2 text-sm
                    text-slate-500
                    dark:text-white/45
                    sm:text-base
                  "
                >
                  Accédez à votre espace de gestion premium.
                </CardDescription>

                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    [ShieldCheck, 'Sécurisé'],
                    [Zap, 'Rapide'],
                    [KeyRound, 'Protégé'],
                  ].map(([Icon, label]) => {
                    const IconComponent = Icon as React.ElementType;

                    return (
                      <div
                        key={String(label)}
                        className="
                          flex items-center gap-1.5
                          rounded-full
                          border border-slate-900/10
                          bg-slate-100/60
                          px-2.5 py-1.5
                          dark:border-white/[0.07]
                          dark:bg-white/[0.035]
                        "
                      >
                        <IconComponent
                          className="
                            h-3 w-3
                            text-violet-600
                            dark:text-fuchsia-400
                          "
                        />

                        <span
                          className="
                            text-[9px] font-semibold
                            text-slate-500
                            dark:text-white/50
                          "
                        >
                          {String(label)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardHeader>

              {/* =================================================
                  FORM
              ================================================== */}

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-5 px-6 sm:px-8">
                  {/* EMAIL */}

                  <div className="space-y-2.5">
                    <Label
                      htmlFor="email"
                      className="
                        flex items-center gap-2
                        text-sm font-semibold
                        text-slate-700
                        dark:text-white/75
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
                        disabled={
                          isCheckingEmail ||
                          showPasswordField
                        }
                        onBlur={() => {
                          if (
                            email &&
                            !showPasswordField
                          ) {
                            void handleEmailCheck();
                          }
                        }}
                        onChange={handleEmailChange}
                        className={`
                          h-14 rounded-2xl
                          border-slate-900/10
                          bg-slate-100/70
                          text-slate-900
                          transition-colors
                          dark:border-white/[0.08]
                          dark:bg-white/[0.045]
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
                            absolute right-4 top-1/2
                            h-5 w-5
                            -translate-y-1/2
                            rounded-full
                            border-2
                            border-violet-500/20
                            border-t-violet-500
                            animate-spin
                            dark:border-white/20
                            dark:border-t-white
                          "
                        />
                      )}
                    </div>

                    {errors.email && (
                      <motion.div
                        initial={
                          reducedMotion
                            ? undefined
                            : { opacity: 0, y: -4 }
                        }
                        animate={
                          reducedMotion
                            ? undefined
                            : { opacity: 1, y: 0 }
                        }
                        className="
                          flex items-center gap-2
                          text-xs font-medium
                          text-red-500
                          dark:text-red-400
                        "
                      >
                        <AlertTriangle className="h-4 w-4" />
                        {errors.email}
                      </motion.div>
                    )}

                    {emailExists && (
                      <motion.div
                        initial={
                          reducedMotion
                            ? undefined
                            : { opacity: 0, y: -4 }
                        }
                        animate={
                          reducedMotion
                            ? undefined
                            : { opacity: 1, y: 0 }
                        }
                        className="
                          flex items-center gap-2
                          text-xs font-medium
                          text-emerald-600
                          dark:text-emerald-400
                        "
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Bienvenue {userName}
                      </motion.div>
                    )}
                  </div>

                  {/* PASSWORD */}

                  {showPasswordField && (
                    <motion.div
                      initial={
                        reducedMotion
                          ? undefined
                          : { opacity: 0, height: 0 }
                      }
                      animate={
                        reducedMotion
                          ? undefined
                          : { opacity: 1, height: 'auto' }
                      }
                      transition={{
                        duration: reducedMotion ? 0 : 0.25,
                      }}
                      className="space-y-5 overflow-hidden"
                    >
                      {/* ATTEMPTS */}

                      {failedAttempts > 0 &&
                        !isLocked && (
                          <div
                            className="
                              flex items-center justify-between
                              gap-3 rounded-2xl
                              border border-orange-400/20
                              bg-orange-500/5
                              px-4 py-3
                            "
                          >
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-orange-500" />

                              <span
                                className="
                                  text-xs font-medium
                                  text-orange-700
                                  dark:text-orange-200
                                "
                              >
                                Tentatives restantes :{' '}
                                {remainingAttempts}
                              </span>
                            </div>

                            <div className="flex gap-1">
                              {Array.from({
                                length: maxAttempts,
                              }).map((_, index) => (
                                <span
                                  key={index}
                                  className={`
                                    h-1.5 w-1.5 rounded-full
                                    ${
                                      index <
                                      failedAttempts
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

                      {isLocked &&
                        lockCountdown > 0 && (
                          <motion.div
                            initial={
                              reducedMotion
                                ? undefined
                                : {
                                    opacity: 0,
                                    scale: 0.98,
                                  }
                            }
                            animate={
                              reducedMotion
                                ? undefined
                                : {
                                    opacity: 1,
                                    scale: 1,
                                  }
                            }
                            className="
                              rounded-2xl
                              border border-red-400/30
                              bg-red-500/5
                              p-4
                              dark:bg-red-500/10
                            "
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="
                                  flex h-11 w-11 shrink-0
                                  items-center justify-center
                                  rounded-xl
                                  bg-red-500/10
                                  dark:bg-red-500/20
                                "
                              >
                                <Lock className="h-5 w-5 text-red-500" />
                              </div>

                              <div>
                                <h3
                                  className="
                                    text-sm font-bold
                                    text-red-700
                                    dark:text-red-200
                                  "
                                >
                                  Compte temporairement bloqué
                                </h3>

                                <p
                                  className="
                                    mt-0.5 text-[11px]
                                    text-red-500/70
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
                                  font-mono text-2xl
                                  font-black tracking-widest
                                  text-red-600
                                  dark:text-red-200
                                "
                              >
                                {formatCountdown(
                                  lockCountdown
                                )}
                              </span>
                            </div>
                          </motion.div>
                        )}

                      {/* PASSWORD */}

                      <div className="space-y-2.5">
                        <Label
                          htmlFor="password"
                          className="
                            flex items-center gap-2
                            text-sm font-semibold
                            text-slate-700
                            dark:text-white/75
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
                          onChange={(event) => {
                            setPassword(event.target.value);

                            if (errors.password) {
                              setErrors((previous) => ({
                                ...previous,
                                password: undefined,
                              }));
                            }
                          }}
                          className="
                            h-14 rounded-2xl
                            border-slate-900/10
                            bg-slate-100/70
                            dark:border-white/[0.08]
                            dark:bg-white/[0.045]
                            dark:text-white
                          "
                        />

                        {!isLocked && (
                          <PasswordStrengthChecker
                            password={password}
                            onValidityChange={
                              setIsPasswordValid
                            }
                          />
                        )}
                      </div>

                      {/* FORGOT PASSWORD */}

                      <div className="flex justify-end">
                        <Link
                          to="/reset-password"
                          className="
                            group inline-flex items-center gap-1
                            text-xs font-semibold
                            text-violet-600
                            transition-colors
                            hover:text-violet-500
                            dark:text-fuchsia-400
                            dark:hover:text-fuchsia-300
                          "
                        >
                          Mot de passe oublié ?
                          <ChevronRight
                            className="
                              h-3.5 w-3.5
                              transition-transform
                              group-hover:translate-x-0.5
                            "
                          />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </CardContent>

                {/* =================================================
                    FOOTER
                ================================================== */}

                <CardFooter
                  className="
                    flex flex-col gap-3
                    px-6 pb-7 pt-6
                    sm:px-8
                  "
                >
                  <Button
                    type="submit"
                    disabled={
                      isCheckingEmail ||
                      (showPasswordField &&
                        (!isPasswordValid || isLocked)) ||
                      isLocked
                    }
                    className="
                      group relative h-14 w-full
                      overflow-hidden rounded-2xl
                      border-0
                      bg-gradient-to-r
                      from-violet-600
                      via-fuchsia-600
                      to-cyan-500
                      text-base font-bold text-white
                      shadow-lg shadow-violet-500/20
                      transition-transform
                      hover:scale-[1.01]
                      active:scale-[.99]
                      disabled:pointer-events-none
                    "
                  >
                    {/* Lightweight shine */}
                    {!reducedMotion && (
                      <span
                        className="
                          pointer-events-none absolute inset-y-0
                          -left-1/3 w-1/3
                          skew-x-[-20deg]
                          bg-white/15
                          blur-sm
                          animate-[login-shine_3.5s_ease-in-out_infinite]
                        "
                      />
                    )}

                    <span className="relative flex items-center justify-center">
                      {isCheckingEmail ? (
                        <>
                          <span
                            className="
                              mr-3 h-5 w-5
                              rounded-full
                              border-2
                              border-white/30
                              border-t-white
                              animate-spin
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

                  <Link
                    to="/register"
                    className="w-full"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="
                        h-14 w-full rounded-2xl
                        border-slate-900/10
                        bg-slate-100/70
                        text-slate-800
                        transition-colors
                        hover:bg-slate-200/70
                        dark:border-white/[0.08]
                        dark:bg-white/[0.035]
                        dark:text-white
                        dark:hover:bg-white/[0.07]
                      "
                    >
                      <Rocket
                        className="
                          mr-2.5 h-5 w-5
                          text-cyan-600
                          dark:text-cyan-300
                        "
                      />

                      Créer un compte

                      <ArrowRight
                        className="
                          ml-auto h-4 w-4
                          text-slate-400
                          dark:text-white/40
                        "
                      />
                    </Button>
                  </Link>

                  <div
                    className="
                      mt-2 flex items-center justify-center
                      gap-2 text-center
                      text-[9px]
                      text-slate-400
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
                  bg-gradient-to-r
                  from-transparent
                  via-cyan-500/40
                  to-transparent
                "
              />
            </Card>
          </motion.div>
        </motion.div>

        {/* ===================================================
            MOBILE BRAND
        ==================================================== */}

        <div
          className="
            absolute bottom-3 left-1/2
            flex -translate-x-1/2 items-center
            gap-1.5 whitespace-nowrap
            text-[9px] font-medium
            text-slate-400
            lg:hidden
            dark:text-white/25
          "
        >
          <Sparkles className="h-3 w-3 text-violet-500" />
          Gestion Vente Premium
          <span>•</span>
          <Globe className="h-3 w-3" />
          Cloud
        </div>
      </main>

      {/* Petit effet CSS : beaucoup moins coûteux que motion.div en boucle */}
      <style>{`
        @keyframes login-shine {
          0%, 55% {
            transform: translateX(-120%) skewX(-20deg);
          }
          80%, 100% {
            transform: translateX(420%) skewX(-20deg);
          }
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