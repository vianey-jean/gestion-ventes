/**
 * LoginPage.tsx
 * Ultra Premium Luxury Authentication Experience
 *
 * - Design luxe / SaaS premium
 * - Mode clair + sombre via le thème global
 * - Animations Framer Motion
 * - Aurora animée
 * - Particules flottantes
 * - Glassmorphism
 * - Vérification email
 * - Sécurité / tentatives
 * - Verrouillage avec compte à rebours
 * - Session unique
 * - Responsive
 */

import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

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
import { useLightMotion } from '@/hooks/useLightMotion';

import { useAuth } from '@/contexts/AuthContext';

import connecteProfilUniqueApi from '@/services/api/connecteProfilUniqueApi';
import { savePendingLogin } from '@/pages/SessionConflictPage';

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Crown,
  Fingerprint,
  Gem,
  Globe,
  KeyRound,
  Layers3,
  Lock,
  Mail,
  Package,
  Rocket,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

const AUTH_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://server-gestion-ventes.onrender.com';

const features = [
  {
    icon: BarChart3,
    title: 'Ventes',
    description: 'Suivez votre activité commerciale en temps réel.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: TrendingUp,
    title: 'Comptabilité',
    description: 'Gardez une vision claire de vos finances.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Users,
    title: 'Clients',
    description: 'Centralisez vos clients et vos relations.',
    color: 'from-fuchsia-500 to-pink-500',
  },
  {
    icon: Package,
    title: 'Stock',
    description: 'Contrôlez vos produits et votre inventaire.',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: Activity,
    title: 'Rendez-vous',
    description: 'Organisez votre agenda et vos rendez-vous.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Layers3,
    title: 'Tâches',
    description: 'Structurez vos priorités et votre travail.',
    color: 'from-indigo-500 to-violet-500',
  },
];

const securityFeatures = [
  {
    icon: ShieldCheck,
    label: 'Sécurisé',
  },
  {
    icon: Zap,
    label: 'Rapide',
  },
  {
    icon: KeyRound,
    label: 'Protégé',
  },
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { light, particleCount } = useLightMotion();
  const { login } = useAuth();

  // =========================================================
  // FORM STATES
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
  // COUNTDOWN
  // =========================================================

  useEffect(() => {
    if (!isLocked || lockCountdown <= 0) {
      return;
    }

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
  // FORMAT COUNTDOWN
  // =========================================================

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  // =========================================================
  // EMAIL VALIDATION
  // =========================================================

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

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
        {
          email: cleanEmail,
        }
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

    if (isLocked) {
      return;
    }

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
          // Le service de session unique ne doit pas bloquer
          // une connexion normale s'il est temporairement indisponible.
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
            // Non bloquant
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
  // PASSWORD VALIDITY
  // =========================================================

  const handlePasswordValidityChange = (isValid: boolean) => {
    setIsPasswordValid(isValid);
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
        <PremiumLoading
          text="Connexion sécurisée..."
          size="lg"
          overlay={true}
          variant="default"
        />
      </Layout>
    );
  }

  const remainingAttempts = Math.max(
    maxAttempts - failedAttempts,
    0
  );

  return (
    <Layout>
      <SEOHead
        title="Connexion Premium"
        description="Connexion sécurisée à votre plateforme de gestion commerciale."
        canonical="https://riziky-ventes.vercel.app/login"
      />

      <main
        className="
          relative
          min-h-[calc(100vh-64px)]
          overflow-hidden
          flex
          items-center
          justify-center
          px-4
          py-12
          sm:px-6
          lg:px-8
          bg-slate-50
          dark:bg-[#02030a]
          transition-colors
          duration-500
        "
      >
        {/* =====================================================
            BACKGROUND
        ====================================================== */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Aurora 1 */}
          <motion.div
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -70, 50, 0],
              scale: [1, 1.15, 0.95, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="
              absolute
              -left-48
              -top-48
              h-[650px]
              w-[650px]
              rounded-full
              bg-violet-400/20
              blur-[100px]
              dark:bg-fuchsia-600/20
            "
          />

          {/* Aurora 2 */}
          <motion.div
            animate={{
              x: [0, -100, 60, 0],
              y: [0, 70, -40, 0],
              scale: [1, 1.2, 0.9, 1],
            }}
            transition={{
              duration: 24,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="
              absolute
              -bottom-64
              -right-48
              h-[750px]
              w-[750px]
              rounded-full
              bg-cyan-300/20
              blur-[110px]
              dark:bg-cyan-600/15
            "
          />

          {/* Aurora 3 */}
          <motion.div
            animate={light ? undefined : {
              x: [0, 50, -60, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="
              absolute
              left-1/2
              top-1/2
              h-[500px]
              w-[500px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-pink-300/10
              blur-[120px]
              dark:bg-violet-600/10
            "
          />

          {/* Grid */}
          <div
            className="
              absolute
              inset-0
              opacity-30
              dark:opacity-100
              bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)]
              dark:bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)]
              bg-[size:70px_70px]
            "
          />

          {/* Decorative rings */}
          <motion.div
            animate={light ? undefined : {
              rotate: 360,
            }}
            transition={{
              duration: 70,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="
              absolute
              left-1/2
              top-1/2
              h-[850px]
              w-[850px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              border
              border-slate-900/5
              dark:border-white/[0.035]
            "
          />

          <motion.div
            animate={light ? undefined : {
              rotate: -360,
            }}
            transition={{
              duration: 55,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="
              absolute
              left-1/2
              top-1/2
              h-[600px]
              w-[600px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              border
              border-violet-500/10
              dark:border-fuchsia-500/10
            "
          />

          {/* Floating particles */}
          {[...Array(particleCount)].map((_, index) => (
            <motion.span
              key={index}
              animate={light ? undefined : {
                y: [0, -80, 0],
                x: [0, index % 2 === 0 ? 25 : -25, 0],
                opacity: [0.15, 0.7, 0.15],
                scale: [0.8, 1.4, 0.8],
              }}
              transition={{
                duration: 5 + index * 0.6,
                repeat: Infinity,
                delay: index * 0.35,
                ease: 'easeInOut',
              }}
              className="
                absolute
                h-1
                w-1
                rounded-full
                bg-violet-500/40
                dark:bg-white/40
              "
              style={{
                left: `${5 + ((index * 17) % 90)}%`,
                top: `${8 + ((index * 23) % 85)}%`,
              }}
            />
          ))}
        </div>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            ease: 'easeOut',
          }}
          className="
            relative
            z-10
            w-full
            max-w-7xl
            grid
            lg:grid-cols-[1fr_520px]
            gap-10
            xl:gap-20
            items-center
          "
        >
          {/* ===================================================
              LEFT
          ==================================================== */}

          <motion.section
            initial={{
              opacity: 0,
              x: -40,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.8,
              delay: 0.15,
            }}
            className="hidden lg:block"
          >
            {/* Badge */}
            <motion.div
              whileHover={{
                scale: 1.03,
                y: -2,
              }}
              className="
                inline-flex
                items-center
                gap-2.5
                rounded-full
                border
                border-slate-900/10
                dark:border-white/10
                bg-white/70
                dark:bg-white/[0.045]
                backdrop-blur-xl
                px-4
                py-2
                shadow-lg
                dark:shadow-none
              "
            >
              <span
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-full
                  bg-gradient-to-br
                  from-violet-500
                  to-fuchsia-500
                  shadow-lg
                  shadow-violet-500/25
                "
              >
                <Gem className="h-3.5 w-3.5 text-white" />
              </span>

              <span className="text-sm font-semibold text-slate-700 dark:text-white/80">
                Premium Business Suite
              </span>

              <Sparkles className="h-4 w-4 text-fuchsia-500 dark:text-fuchsia-400" />
            </motion.div>

            {/* Heading */}
            <h1
              className="
                mt-8
                text-5xl
                xl:text-7xl
                font-black
                leading-[0.95]
                tracking-[-0.04em]
                text-slate-900
                dark:text-white
              "
            >
              Gérez votre
              <span
                className="
                  block
                  mt-3
                  bg-gradient-to-r
                  from-violet-600
                  via-fuchsia-500
                  to-cyan-500
                  dark:from-fuchsia-400
                  dark:via-violet-400
                  dark:to-cyan-300
                  bg-clip-text
                  text-transparent
                "
              >
                Business.
              </span>

              <span className="block mt-3">
                Avec élégance.
              </span>
            </h1>

            {/* Description */}
            <p
              className="
                mt-8
                max-w-2xl
                text-lg
                xl:text-xl
                leading-relaxed
                text-slate-600
                dark:text-white/50
              "
            >
              Une plateforme moderne pour centraliser vos
              ventes, votre comptabilité, vos clients, vos
              rendez-vous, vos tâches et votre activité
              commerciale.
            </p>

            {/* Mini stats */}
            <div className="mt-10 flex flex-wrap gap-4">
              {[
                {
                  icon: ShieldCheck,
                  value: '100%',
                  label: 'Sécurisé',
                },
                {
                  icon: Zap,
                  value: 'Rapide',
                  label: 'Expérience fluide',
                },
                {
                  icon: Cloud,
                  value: 'Cloud',
                  label: 'Accessible partout',
                },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.label}
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.7 + index * 0.1,
                    }}
                    whileHover={{
                      y: -4,
                    }}
                    className="
                      rounded-2xl
                      border
                      border-slate-900/10
                      dark:border-white/[0.08]
                      bg-white/60
                      dark:bg-white/[0.035]
                      backdrop-blur-xl
                      px-4
                      py-3
                    "
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-violet-600 dark:text-fuchsia-400" />

                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.value}
                        </div>

                        <div className="text-[11px] text-slate-500 dark:text-white/40">
                          {item.label}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Features */}
            <div className="mt-10 grid grid-cols-2 xl:grid-cols-3 gap-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <motion.div
                    key={feature.title}
                    initial={{
                      opacity: 0,
                      y: 25,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.45 + index * 0.08,
                    }}
                    whileHover={{
                      y: -5,
                      scale: 1.02,
                    }}
                    className="
                      group
                      relative
                      overflow-hidden
                      rounded-2xl
                      border
                      border-slate-900/10
                      dark:border-white/[0.07]
                      bg-white/65
                      dark:bg-white/[0.035]
                      backdrop-blur-xl
                      p-4
                      shadow-sm
                      dark:shadow-none
                    "
                  >
                    <div
                      className={`
                        absolute
                        inset-0
                        bg-gradient-to-br
                        ${feature.color}
                        opacity-0
                        group-hover:opacity-[0.08]
                        transition-opacity
                        duration-500
                      `}
                    />

                    <div className="relative">
                      <div
                        className={`
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-xl
                          bg-gradient-to-br
                          ${feature.color}
                          shadow-lg
                        `}
                      >
                        <Icon className="h-4 w-4 text-white" />
                      </div>

                      <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                        {feature.title}
                      </h3>

                      <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-white/35">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* ===================================================
              LOGIN CARD
          ==================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              x: 40,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.85,
              delay: 0.2,
              ease: 'easeOut',
            }}
            className="relative w-full max-w-xl mx-auto"
          >
            {/* Outer glow */}
            <motion.div
              animate={{
                opacity: [0.35, 0.65, 0.35],
                scale: [1, 1.03, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="
                absolute
                -inset-5
                rounded-[42px]
                bg-gradient-to-r
                from-violet-500/20
                via-fuchsia-500/20
                to-cyan-500/20
                blur-2xl
              "
            />

            <Card
              className="
                relative
                overflow-hidden
                rounded-[32px]
                border
                border-slate-900/10
                dark:border-white/[0.09]
                bg-white/80
                dark:bg-[#0b0b14]/80
                backdrop-blur-2xl
                shadow-[0_30px_100px_rgba(15,23,42,0.15)]
                dark:shadow-[0_30px_100px_rgba(0,0,0,0.65)]
              "
            >
              {/* Top shine */}
              <div
                className="
                  absolute
                  left-0
                  right-0
                  top-0
                  h-px
                  bg-gradient-to-r
                  from-transparent
                  via-violet-500/60
                  dark:via-white/40
                  to-transparent
                "
              />

              {/* =================================================
                  CARD HEADER
              ================================================== */}

              <CardHeader className="px-7 pt-8 pb-6 sm:px-9">
                <div className="flex items-start justify-between">
                  <div>
                    <motion.div
                      initial={{
                        scale: 0,
                        rotate: -90,
                      }}
                      animate={{
                        scale: 1,
                        rotate: 0,
                      }}
                      transition={{
                        type: 'spring',
                        bounce: 0.4,
                        duration: 0.9,
                      }}
                      className="relative inline-flex"
                    >
                      <div
                        className="
                          absolute
                          -inset-2
                          rounded-[25px]
                          bg-gradient-to-r
                          from-violet-500
                          via-fuchsia-500
                          to-cyan-500
                          opacity-20
                          blur-lg
                        "
                      />

                      <div
                        className="
                          relative
                          flex
                          h-16
                          w-16
                          items-center
                          justify-center
                          rounded-[20px]
                          bg-gradient-to-br
                          from-violet-600
                          via-fuchsia-500
                          to-cyan-500
                          shadow-xl
                          shadow-violet-500/25
                        "
                      >
                        <Fingerprint className="h-8 w-8 text-white" />
                      </div>

                      <motion.div
                        animate={{
                          rotate: 360,
                        }}
                        transition={{
                          duration: 10,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        className="
                          absolute
                          -right-2
                          -top-2
                          flex
                          h-7
                          w-7
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-white/30
                          bg-gradient-to-br
                          from-amber-400
                          to-orange-500
                          shadow-lg
                        "
                      >
                        <Crown className="h-3.5 w-3.5 text-white" />
                      </motion.div>
                    </motion.div>
                  </div>

                  <div
                    className="
                      flex
                      items-center
                      gap-1.5
                      rounded-full
                      border
                      border-slate-900/10
                      dark:border-white/[0.08]
                      bg-slate-100/70
                      dark:bg-white/[0.04]
                      px-3
                      py-1.5
                    "
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />

                    <span className="text-[10px] font-semibold text-slate-500 dark:text-white/50">
                      Système sécurisé
                    </span>
                  </div>
                </div>

                <CardTitle
                  className="
                    mt-6
                    text-3xl
                    sm:text-4xl
                    font-black
                    tracking-tight
                    text-slate-900
                    dark:text-white
                  "
                >
                  Connexion
                </CardTitle>

                <CardDescription
                  className="
                    mt-2
                    text-sm
                    sm:text-base
                    text-slate-500
                    dark:text-white/45
                  "
                >
                  Accédez à votre espace de gestion premium.
                </CardDescription>

                {/* Security badges */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {securityFeatures.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="
                          flex
                          items-center
                          gap-1.5
                          rounded-full
                          border
                          border-slate-900/10
                          dark:border-white/[0.07]
                          bg-slate-100/60
                          dark:bg-white/[0.035]
                          px-2.5
                          py-1.5
                        "
                      >
                        <Icon className="h-3 w-3 text-violet-600 dark:text-fuchsia-400" />

                        <span className="text-[10px] font-semibold text-slate-500 dark:text-white/50">
                          {item.label}
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
                <CardContent className="space-y-6 px-7 sm:px-9">
                  {/* EMAIL */}

                  <motion.div
                    layout
                    className="space-y-2.5"
                  >
                    <Label
                      htmlFor="email"
                      className="
                        flex
                        items-center
                        gap-2
                        text-sm
                        font-semibold
                        text-slate-700
                        dark:text-white/75
                      "
                    >
                      <Mail className="h-4 w-4 text-violet-600 dark:text-fuchsia-400" />

                      Adresse email
                    </Label>

                    <div className="group relative">
                      <div
                        className="
                          absolute
                          -inset-[1px]
                          rounded-2xl
                          bg-gradient-to-r
                          from-violet-500
                          via-fuchsia-500
                          to-cyan-500
                          opacity-0
                          blur-[2px]
                          transition
                          duration-500
                          group-focus-within:opacity-60
                        "
                      />

                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          autoComplete="email"
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
                            h-14
                            rounded-2xl
                            border
                            border-slate-900/10
                            dark:border-white/[0.08]
                            bg-slate-100/70
                            dark:bg-white/[0.045]
                            text-slate-900
                            dark:text-white
                            placeholder:text-slate-400
                            dark:placeholder:text-white/20
                            focus:border-violet-500/50
                            dark:focus:border-fuchsia-400/50
                            focus:bg-white
                            dark:focus:bg-white/[0.07]
                            transition-all
                            duration-300
                            ${
                              errors.email
                                ? 'border-red-400/60'
                                : ''
                            }
                          `}
                        />

                        {isCheckingEmail && (
                          <div
                            className="
                              absolute
                              right-4
                              top-1/2
                              -translate-y-1/2
                              h-5
                              w-5
                              rounded-full
                              border-2
                              border-violet-500/20
                              border-t-violet-500
                              dark:border-white/20
                              dark:border-t-white
                              animate-spin
                            "
                          />
                        )}
                      </div>
                    </div>

                    {/* Email error */}
                    {errors.email && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: -5,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        className="flex items-center gap-2 text-xs font-medium text-red-500 dark:text-red-400"
                      >
                        <AlertTriangle className="h-4 w-4" />

                        {errors.email}
                      </motion.div>
                    )}

                    {/* Email success */}
                    {emailExists && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: -5,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        className="
                          flex
                          items-center
                          gap-2
                          text-xs
                          font-medium
                          text-emerald-600
                          dark:text-emerald-400
                        "
                      >
                        <CheckCircle2 className="h-4 w-4" />

                        Bienvenue {userName}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* PASSWORD */}

                  {showPasswordField && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        height: 0,
                      }}
                      animate={{
                        opacity: 1,
                        height: 'auto',
                      }}
                      transition={{
                        duration: 0.45,
                      }}
                      className="space-y-5 overflow-hidden"
                    >
                      {/* ATTEMPTS */}

                      {failedAttempts > 0 && !isLocked && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: -5,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          className="
                            flex
                            items-center
                            justify-between
                            gap-4
                            rounded-2xl
                            border
                            border-orange-400/20
                            bg-orange-500/5
                            px-4
                            py-3
                          "
                        >
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-orange-500 dark:text-orange-300" />

                            <span className="text-xs font-medium text-orange-700 dark:text-orange-200">
                              Tentatives restantes :{' '}
                              {remainingAttempts}
                            </span>
                          </div>

                          <div className="flex gap-1">
                            {Array.from({
                              length: maxAttempts,
                            }).map((_, index) => (
                              <motion.div
                                key={index}
                                initial={{
                                  scale: 0,
                                }}
                                animate={{
                                  scale: 1,
                                }}
                                className={`
                                  h-2
                                  w-2
                                  rounded-full
                                  ${
                                    index <
                                    failedAttempts
                                      ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]'
                                      : 'bg-slate-300 dark:bg-white/15'
                                  }
                                `}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* LOCKED */}

                      {isLocked &&
                        lockCountdown > 0 && (
                          <motion.div
                            initial={{
                              opacity: 0,
                              scale: 0.95,
                            }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                            }}
                            className="
                              relative
                              overflow-hidden
                              rounded-3xl
                              border
                              border-red-400/30
                              bg-red-500/5
                              dark:bg-red-500/10
                              p-5
                            "
                          >
                            <motion.div
                              animate={{
                                opacity: [0.2, 0.5, 0.2],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                              }}
                              className="
                                absolute
                                inset-0
                                bg-gradient-to-r
                                from-red-500/10
                                to-rose-500/10
                              "
                            />

                            <div className="relative">
                              <div className="flex items-center gap-4">
                                <div
                                  className="
                                    flex
                                    h-12
                                    w-12
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-red-500/10
                                    dark:bg-red-500/20
                                    border
                                    border-red-400/20
                                  "
                                >
                                  <Lock className="h-5 w-5 text-red-500 dark:text-red-300" />
                                </div>

                                <div>
                                  <h3 className="font-bold text-red-700 dark:text-red-200">
                                    Compte temporairement bloqué
                                  </h3>

                                  <p className="mt-0.5 text-xs text-red-500/70 dark:text-red-300/60">
                                    Trop de tentatives
                                    échouées
                                  </p>
                                </div>
                              </div>

                              <div className="mt-5 flex items-center justify-center gap-3">
                                <Timer className="h-5 w-5 text-red-500 dark:text-red-300" />

                                <motion.div
                                  animate={{
                                    opacity: [0.7, 1, 0.7],
                                  }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                  }}
                                  className="
                                    font-mono
                                    text-3xl
                                    font-black
                                    tracking-widest
                                    text-red-600
                                    dark:text-red-200
                                  "
                                >
                                  {formatCountdown(
                                    lockCountdown
                                  )}
                                </motion.div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                      {/* PASSWORD */}

                      <div className="space-y-3">
                        <Label
                          htmlFor="password"
                          className="
                            flex
                            items-center
                            gap-2
                            text-sm
                            font-semibold
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
                            setPassword(
                              event.target.value
                            );

                            if (errors.password) {
                              setErrors((previous) => ({
                                ...previous,
                                password: undefined,
                              }));
                            }
                          }}
                          className="
                            h-14
                            rounded-2xl
                            border
                            border-slate-900/10
                            dark:border-white/[0.08]
                            bg-slate-100/70
                            dark:bg-white/[0.045]
                            text-slate-900
                            dark:text-white
                          "
                        />

                        {!isLocked && (
                          <PasswordStrengthChecker
                            password={password}
                            onValidityChange={
                              handlePasswordValidityChange
                            }
                          />
                        )}
                      </div>

                      {/* Forgot */}

                      <div className="flex justify-end">
                        <Link
                          to="/reset-password"
                          className="
                            group
                            inline-flex
                            items-center
                            gap-1
                            text-xs
                            font-semibold
                            text-violet-600
                            dark:text-fuchsia-400
                            hover:text-violet-500
                            dark:hover:text-fuchsia-300
                            transition
                          "
                        >
                          Mot de passe oublié ?

                          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </CardContent>

                {/* =================================================
                    FOOTER
                ================================================== */}

                <CardFooter className="flex flex-col gap-3 px-7 pb-8 pt-7 sm:px-9">
                  {/* LOGIN */}

                  <Button
                    type="submit"
                    disabled={
                      isCheckingEmail ||
                      (showPasswordField &&
                        (!isPasswordValid ||
                          isLocked)) ||
                      isLocked
                    }
                    className="
                      group
                      relative
                      h-14
                      w-full
                      overflow-hidden
                      rounded-2xl
                      border-0
                      bg-gradient-to-r
                      from-violet-600
                      via-fuchsia-600
                      to-cyan-500
                      text-base
                      font-bold
                      text-white
                      shadow-[0_15px_45px_rgba(124,58,237,0.3)]
                      dark:shadow-[0_15px_45px_rgba(168,85,247,0.3)]
                      hover:scale-[1.015]
                      active:scale-[0.99]
                      transition-all
                      duration-300
                    "
                  >
                    {/* Shine */}
                    <motion.div
                      animate={{
                        x: ['-120%', '120%'],
                      }}
                      transition={{
                        duration: 2.8,
                        repeat: Infinity,
                        repeatDelay: 2,
                        ease: 'easeInOut',
                      }}
                      className="
                        absolute
                        inset-y-0
                        w-1/3
                        skew-x-[-20deg]
                        bg-white/20
                        blur-sm
                      "
                    />

                    <span className="relative flex items-center justify-center">
                      {isCheckingEmail ? (
                        <>
                          <span
                            className="
                              mr-3
                              h-5
                              w-5
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

                  {/* REGISTER */}

                  <Link
                    to="/register"
                    className="w-full"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="
                        h-14
                        w-full
                        rounded-2xl
                        border
                        border-slate-900/10
                        dark:border-white/[0.08]
                        bg-slate-100/70
                        dark:bg-white/[0.035]
                        text-slate-800
                        dark:text-white
                        hover:bg-slate-200/70
                        dark:hover:bg-white/[0.07]
                        hover:border-violet-500/20
                        dark:hover:border-white/15
                        hover:scale-[1.01]
                        transition-all
                        duration-300
                      "
                    >
                      <Rocket className="mr-2.5 h-5 w-5 text-cyan-600 dark:text-cyan-300" />

                      Créer un compte

                      <ArrowRight className="ml-auto h-4 w-4 text-slate-400 dark:text-white/40" />
                    </Button>
                  </Link>

                  {/* Footer security */}

                  <div
                    className="
                      mt-3
                      flex
                      items-center
                      justify-center
                      gap-2
                      text-[10px]
                      text-slate-400
                      dark:text-white/30
                    "
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />

                    Vos données sont protégées par notre système
                    de sécurité.

                    <Star className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                  </div>
                </CardFooter>
              </form>

              {/* Bottom line */}

              <div
                className="
                  absolute
                  bottom-0
                  left-0
                  right-0
                  h-px
                  bg-gradient-to-r
                  from-transparent
                  via-cyan-500/40
                  to-transparent
                "
              />
            </Card>
          </motion.div>
        </motion.div>

        {/* =====================================================
            MOBILE BRANDING
        ====================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.8,
          }}
          className="
            absolute
            bottom-3
            left-1/2
            -translate-x-1/2
            lg:hidden
            flex
            items-center
            gap-2
            text-[10px]
            font-medium
            text-slate-400
            dark:text-white/25
          "
        >
          <Sparkles className="h-3 w-3 text-violet-500 dark:text-fuchsia-400" />

          Gestion Vente Premium

          <span>•</span>

          <Globe className="h-3 w-3" />

          Cloud
        </motion.div>
      </main>
    </Layout>
  );
};

export default LoginPage;