/**
 * LoginPage.tsx - Ultra Premium Luxury Auth Experience
 *
 * ✨ Improvements:
 * - Ultra modern glassmorphism
 * - Aurora animated background
 * - Neon gradients & luxury shadows
 * - Advanced lock system UI
 * - Smooth Framer Motion transitions
 * - Floating particles
 * - Premium CTA buttons
 * - Interactive focus states
 * - Dynamic progress indicators
 * - Premium typography
 * - Responsive luxury layout
 */

import React, { useState, useEffect, useRef } from 'react';
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
  CardTitle
} from '@/components/ui/card';

import PasswordInput from '@/components/PasswordInput';
import PasswordStrengthChecker from '@/components/PasswordStrengthChecker';
import Layout from '@/components/Layout';
import PremiumLoading from '@/components/ui/premium-loading';

import {
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Shield,
  Fingerprint,
  KeyRound,
  Crown,
  BarChart3,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  Timer,
  CheckCircle2,
  Star,
  Gem,
  Zap,
  Rocket,
  Activity,
  Globe,
  Layers3,
  ShieldCheck
} from 'lucide-react';

import { motion } from 'framer-motion';

import axios from 'axios';
import SEOHead from '@/components/SEOHead';

const AUTH_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://server-gestion-ventes.onrender.com';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const { login } = useAuth();

  // =========================
  // STATES
  // =========================

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

  // =========================
  // SECURITY STATES
  // =========================

  const [maxAttempts, setMaxAttempts] = useState(5);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const [isLocked, setIsLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // =========================
  // COUNTDOWN
  // =========================

  useEffect(() => {
    if (isLocked && lockCountdown > 0) {
      countdownRef.current = setInterval(() => {
        setLockCountdown((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setFailedAttempts(0);

            if (countdownRef.current) {
              clearInterval(countdownRef.current);
            }

            return 0;
          }

          return prev - 1;
        });
      }, 1000);

      return () => {
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
        }
      };
    }
  }, [isLocked, lockCountdown]);

  // =========================
  // FORMAT TIME
  // =========================

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    return `${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  };

  // =========================
  // EMAIL CHECK
  // =========================

  const handleEmailCheck = async () => {
    if (!email) {
      setErrors({
        ...errors,
        email: 'Veuillez entrer votre email'
      });

      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({
        ...errors,
        email: 'Veuillez entrer un email valide'
      });

      return;
    }

    setIsCheckingEmail(true);

    try {
      const response = await axios.post(
        `${AUTH_BASE_URL}/api/auth/check-email`,
        { email }
      );

      setIsCheckingEmail(false);

      if (response.data.exists) {
        setEmailExists(true);
        setShowPasswordField(true);

        setUserName(
          `${response.data.user.firstName} ${response.data.user.lastName}`
        );

        setMaxAttempts(response.data.maxAttempts || 5);

        setFailedAttempts(response.data.failedAttempts || 0);

        if (response.data.locked) {
          setIsLocked(true);

          setLockCountdown(response.data.remainingSeconds || 0);

          setFailedAttempts(response.data.maxAttempts || 5);
        }
      } else {
        setEmailExists(false);
        setShowPasswordField(false);

        setErrors({
          ...errors,
          email: "Ce profil n'existe pas"
        });
      }
    } catch (error) {
      setIsCheckingEmail(false);

      setEmailExists(false);

      setShowPasswordField(false);

      setErrors({
        ...errors,
        email: "Une erreur s'est produite"
      });
    }
  };

  // =========================
  // LOGIN SUBMIT
  // =========================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});

    if (!email) {
      setErrors((prev) => ({
        ...prev,
        email: 'Veuillez entrer votre email'
      }));

      return;
    }

    if (showPasswordField && !password) {
      setErrors((prev) => ({
        ...prev,
        password: 'Veuillez entrer votre mot de passe'
      }));

      return;
    }

    if (!showPasswordField) {
      await handleEmailCheck();

      return;
    }

    if (isLocked) return;

    setIsLoggingIn(true);

    try {
      const response = await axios.post(
        `${AUTH_BASE_URL}/api/auth/login`,
        {
          email,
          password
        }
      );

      if (response.data && response.data.token) {
        setFailedAttempts(0);

        const success = await login({
          email,
          password
        });

        if (success) {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      const status = error?.response?.status;
      const data = error?.response?.data;

      if (status === 423) {
        setIsLocked(true);

        setLockCountdown(data.remainingSeconds || 0);

        setFailedAttempts(data.maxAttempts || maxAttempts);

        setMaxAttempts(data.maxAttempts || maxAttempts);
      } else if (
        status === 401 &&
        data?.failedAttempts !== undefined
      ) {
        setFailedAttempts(data.failedAttempts);

        setMaxAttempts(data.maxAttempts || maxAttempts);

        setErrors({
          password: `Mot de passe incorrect (${data.failedAttempts}/${data.maxAttempts})`
        });
      } else {
        setErrors({
          password: data?.message || 'Identifiants invalides'
        });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // =========================
  // PASSWORD VALIDITY
  // =========================

  const handlePasswordValidityChange = (isValid: boolean) => {
    setIsPasswordValid(isValid);
  };

  // =========================
  // LOADING
  // =========================

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

  const remainingAttempts = maxAttempts - failedAttempts;

  return (
    <Layout>
      <SEOHead
        title="Connexion Premium"
        description="Connexion sécurisée à votre plateforme de gestion."
        canonical="https://riziky-boutic.vercel.app/login"
      />

      {/* ================================================= */}
      {/* MAIN CONTAINER */}
      {/* ================================================= */}

      <div className="relative min-h-screen overflow-hidden bg-[#030014] flex items-center justify-center px-4 py-10">

        {/* ================================================= */}
        {/* AURORA BACKGROUND */}
        {/* ================================================= */}

        <div className="absolute inset-0">

          <motion.div
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -50, 50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute top-0 left-0 w-[700px] h-[700px] rounded-full bg-fuchsia-500/20 blur-[160px]"
          />

          <motion.div
            animate={{
              x: [0, -120, 50, 0],
              y: [0, 60, -30, 0],
              scale: [1, 1.3, 1]
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full bg-cyan-500/20 blur-[180px]"
          />

          <motion.div
            animate={{
              rotate: [0, 360]
            }}
            transition={{
              duration: 60,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute top-1/2 left-1/2 w-[900px] h-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.03]"
          />

        </div>

        {/* ================================================= */}
        {/* GRID OVERLAY */}
        {/* ================================================= */}

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:80px_80px]" />

        {/* ================================================= */}
        {/* FLOATING PARTICLES */}
        {/* ================================================= */}

        <div className="absolute inset-0 overflow-hidden">

          {[...Array(14)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -60, 0],
                opacity: [0.2, 0.7, 0.2]
              }}
              transition={{
                duration: 6 + i,
                repeat: Infinity,
                delay: i * 0.5
              }}
              className="absolute w-1.5 h-1.5 rounded-full bg-white/40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
            />
          ))}

        </div>

        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 40
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.8
          }}
          className="relative z-10 w-full max-w-7xl flex flex-col lg:flex-row gap-16 items-center"
        >

          {/* ================================================= */}
          {/* LEFT SIDE */}
          {/* ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              x: -40
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            transition={{
              duration: 0.8,
              delay: 0.2
            }}
            className="flex-1"
          >

            {/* PREMIUM BADGE */}

            <motion.div
              whileHover={{
                scale: 1.04
              }}
              className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-white/10 bg-white/[0.05] backdrop-blur-xl mb-8"
            >
              <Gem className="w-4 h-4 text-fuchsia-400" />

              <span className="text-sm font-semibold text-white/80">
                Premium Business Suite
              </span>
            </motion.div>

            {/* TITLE */}

            <h1 className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight text-white">

              Gérez votre

              <span className="block mt-2 bg-gradient-to-r from-fuchsia-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Business
              </span>

              <span className="block mt-2">
                avec élégance
              </span>

            </h1>

            {/* DESCRIPTION */}

            <p className="mt-8 text-lg md:text-xl leading-relaxed text-white/55 max-w-2xl">
              Une expérience premium de gestion moderne :
              ventes, produits, clients, comptabilité,
              statistiques intelligentes et sécurité avancée.
            </p>

            {/* FEATURES */}

            <div className="grid grid-cols-2 gap-5 mt-12">

              {[
                {
                  icon: BarChart3,
                  title: 'Analytics',
                  desc: 'Tableaux intelligents'
                },
                {
                  icon: Users,
                  title: 'Clients',
                  desc: 'Gestion moderne'
                },
                {
                  icon: Package,
                  title: 'Produits',
                  desc: 'Stock en temps réel'
                },
                {
                  icon: TrendingUp,
                  title: 'Finance',
                  desc: 'Comptabilité avancée'
                },
                {
                  icon: ShieldCheck,
                  title: 'Sécurité',
                  desc: 'Protection premium'
                },
                {
                  icon: Globe,
                  title: 'Cloud',
                  desc: 'Accessible partout'
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{
                    y: -6,
                    scale: 1.02
                  }}
                  className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-xl"
                >

                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-fuchsia-500/10 to-cyan-500/10" />

                  <div className="relative">

                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="text-white font-bold text-lg">
                      {item.title}
                    </h3>

                    <p className="text-white/45 text-sm mt-1">
                      {item.desc}
                    </p>

                  </div>

                </motion.div>
              ))}

            </div>

          </motion.div>

          {/* ================================================= */}
          {/* RIGHT SIDE LOGIN CARD */}
          {/* ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              x: 40
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            transition={{
              duration: 0.8,
              delay: 0.3
            }}
            className="w-full max-w-lg relative"
          >

            {/* OUTER GLOW */}

            <div className="absolute -inset-6 rounded-[40px] bg-gradient-to-r from-fuchsia-500/20 via-cyan-500/20 to-blue-500/20 blur-3xl" />

            <Card className="relative overflow-hidden rounded-[36px] border border-white/[0.08] bg-white/[0.06] backdrop-blur-[40px] shadow-[0_20px_80px_rgba(0,0,0,0.65)]">

              {/* TOP BORDER */}

              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

              {/* ================================================= */}
              {/* HEADER */}
              {/* ================================================= */}

              <CardHeader className="pt-10 pb-8 text-center">

                {/* ICON */}

                <motion.div
                  initial={{
                    scale: 0,
                    rotate: -180
                  }}
                  animate={{
                    scale: 1,
                    rotate: 0
                  }}
                  transition={{
                    type: 'spring',
                    bounce: 0.4,
                    duration: 0.8
                  }}
                  className="flex justify-center mb-6"
                >

                  <div className="relative">

                    <div className="absolute inset-0 rounded-[30px] bg-gradient-to-r from-fuchsia-500 to-cyan-500 blur-2xl opacity-50" />

                    <div className="relative w-24 h-24 rounded-[28px] bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-500 flex items-center justify-center border border-white/20 shadow-[0_10px_40px_rgba(217,70,239,0.5)]">

                      <Fingerprint className="w-11 h-11 text-white" />

                    </div>

                    <motion.div
                      animate={{
                        rotate: 360
                      }}
                      transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center"
                    >
                      <Crown className="w-4 h-4 text-white" />
                    </motion.div>

                  </div>

                </motion.div>

                <CardTitle className="text-4xl font-black text-white tracking-tight">
                  Connexion
                </CardTitle>

                <CardDescription className="mt-3 text-base text-white/55">
                  Authentification sécurisée premium
                </CardDescription>

                {/* SECURITY BADGES */}

                <div className="flex items-center justify-center gap-4 mt-6">

                  {[
                    {
                      icon: Shield,
                      text: 'Sécurisé'
                    },
                    {
                      icon: Zap,
                      text: 'Ultra rapide'
                    },
                    {
                      icon: KeyRound,
                      text: 'Chiffré'
                    }
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08]"
                    >
                      <item.icon className="w-3.5 h-3.5 text-fuchsia-400" />

                      <span className="text-xs text-white/70 font-medium">
                        {item.text}
                      </span>
                    </div>
                  ))}

                </div>

              </CardHeader>

              {/* ================================================= */}
              {/* FORM */}
              {/* ================================================= */}

              <form onSubmit={handleSubmit}>

                <CardContent className="space-y-7 px-8">

                  {/* EMAIL */}

                  <div className="space-y-3">

                    <Label className="text-sm font-semibold text-white/75 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-fuchsia-400" />
                      Adresse email
                    </Label>

                    <div className="relative group">

                      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-fuchsia-500/40 to-cyan-500/40 opacity-0 blur transition duration-500 group-focus-within:opacity-100" />

                      <Input
                        id="email"
                        type="email"
                        placeholder="exemple@email.com"
                        value={email}
                        disabled={
                          isCheckingEmail || showPasswordField
                        }
                        onBlur={handleEmailCheck}
                        onChange={(e) => {
                          setEmail(e.target.value);

                          setShowPasswordField(false);

                          setEmailExists(false);

                          setFailedAttempts(0);

                          setIsLocked(false);

                          setLockCountdown(0);

                          if (errors.email) {
                            setErrors({
                              ...errors,
                              email: undefined
                            });
                          }
                        }}
                        className={`relative h-16 rounded-2xl border border-white/[0.08] bg-white/[0.05] text-white placeholder:text-white/25 backdrop-blur-xl focus:border-fuchsia-400/50 focus:bg-white/[0.08] transition-all duration-300 ${
                          errors.email
                            ? 'border-red-400/50'
                            : ''
                        }`}
                      />

                    </div>

                    {errors.email && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: -5
                        }}
                        animate={{
                          opacity: 1,
                          y: 0
                        }}
                        className="flex items-center gap-2 text-sm text-red-400"
                      >
                        <AlertTriangle className="w-4 h-4" />

                        {errors.email}
                      </motion.div>
                    )}

                    {emailExists && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: -5
                        }}
                        animate={{
                          opacity: 1,
                          y: 0
                        }}
                        className="flex items-center gap-2 text-sm text-emerald-400"
                      >
                        <CheckCircle2 className="w-4 h-4" />

                        Bienvenue {userName}
                      </motion.div>
                    )}

                  </div>

                  {/* ================================================= */}
                  {/* PASSWORD */}
                  {/* ================================================= */}

                  {showPasswordField && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        height: 0
                      }}
                      animate={{
                        opacity: 1,
                        height: 'auto'
                      }}
                      transition={{
                        duration: 0.4
                      }}
                      className="space-y-4"
                    >

                      {/* ATTEMPTS */}

                      {failedAttempts > 0 && !isLocked && (
                        <div className="flex items-center justify-between">

                          <div className="flex items-center gap-2 text-sm text-orange-300">
                            <Shield className="w-4 h-4" />

                            Tentatives :
                            {failedAttempts}/{maxAttempts}
                          </div>

                          <div className="flex gap-1.5">

                            {Array.from({
                              length: maxAttempts
                            }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-2.5 h-2.5 rounded-full ${
                                  i < failedAttempts
                                    ? 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]'
                                    : 'bg-white/15'
                                }`}
                              />
                            ))}

                          </div>

                        </div>
                      )}

                      {/* LOCK BANNER */}

                      {isLocked && lockCountdown > 0 && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            scale: 0.95
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1
                          }}
                          className="relative overflow-hidden rounded-3xl border border-red-400/25 bg-red-500/10 p-5 backdrop-blur-2xl"
                        >

                          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-rose-500/10" />

                          <div className="relative">

                            <div className="flex items-center gap-4 mb-4">

                              <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-400/20 flex items-center justify-center">
                                <Lock className="w-6 h-6 text-red-300" />
                              </div>

                              <div>

                                <h3 className="text-red-200 font-bold text-lg">
                                  Compte bloqué
                                </h3>

                                <p className="text-red-300/70 text-sm">
                                  Trop de tentatives échouées
                                </p>

                              </div>

                            </div>

                            <div className="flex items-center justify-center gap-3">

                              <Timer className="w-6 h-6 text-red-300" />

                              <div className="text-4xl font-black font-mono tracking-widest bg-gradient-to-r from-red-200 via-white to-red-200 bg-clip-text text-transparent">
                                {formatCountdown(lockCountdown)}
                              </div>

                            </div>

                          </div>

                        </motion.div>
                      )}

                      {/* PASSWORD INPUT */}

                      <PasswordInput
                        id="password"
                        placeholder="••••••••"
                        value={password}
                        disabled={isLocked}
                        error={errors.password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        className="h-16 rounded-2xl border border-white/[0.08] bg-white/[0.05] text-white backdrop-blur-xl"
                      />

                      {/* PASSWORD CHECKER */}

                      {!isLocked && (
                        <PasswordStrengthChecker
                          password={password}
                          onValidityChange={
                            handlePasswordValidityChange
                          }
                        />
                      )}

                      {/* FORGOT */}

                      <div className="text-right">

                        <Link
                          to="/reset-password"
                          className="text-sm font-medium text-fuchsia-400 hover:text-fuchsia-300 transition"
                        >
                          Mot de passe oublié ?
                        </Link>

                      </div>

                    </motion.div>
                  )}

                </CardContent>

                {/* ================================================= */}
                {/* FOOTER */}
                {/* ================================================= */}

                <CardFooter className="flex flex-col gap-4 px-8 pb-10 pt-2">

                  {/* LOGIN BUTTON */}

                  <Button
                    type="submit"
                    disabled={
                      isCheckingEmail ||
                      (showPasswordField &&
                        !isPasswordValid) ||
                      isLocked
                    }
                    className="group relative w-full overflow-hidden h-16 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-violet-600 to-cyan-600 text-white font-bold text-lg shadow-[0_15px_50px_rgba(168,85,247,0.45)] hover:scale-[1.02] transition-all duration-300"
                  >

                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.25),transparent)] translate-x-[-200%] group-hover:translate-x-[200%]" />

                    {isCheckingEmail ? (
                      <>
                        <div className="w-5 h-5 mr-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Vérification...
                      </>
                    ) : showPasswordField ? (
                      <>
                        <Lock className="w-5 h-5 mr-3" />
                        Se connecter
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-5 h-5 mr-3" />
                        Continuer
                      </>
                    )}

                  </Button>

                  {/* REGISTER BUTTON */}

                  <Link
                    to="/register"
                    className="w-full"
                  >

                    <Button
                      type="button"
                      className="w-full h-16 rounded-2xl border border-white/[0.08] bg-white/[0.05] text-white hover:bg-white/[0.08] backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]"
                    >

                      <Rocket className="w-5 h-5 mr-3 text-cyan-300" />

                      Créer un compte

                    </Button>

                  </Link>

                </CardFooter>

              </form>

              {/* BOTTOM GLOW */}

              <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

            </Card>

          </motion.div>

        </motion.div>

      </div>
    </Layout>
  );
};

export default LoginPage;