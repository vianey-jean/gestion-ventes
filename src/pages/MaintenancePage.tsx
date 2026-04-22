/**
 * MaintenancePage — Page affichée quand le site est en maintenance.
 * 
 * Style ultra-luxe (cohérent avec la page Comptabilité / Login).
 * Permet à un administrateur principal de se connecter via un formulaire dédié
 * (réutilise la logique login mais sans Footer ni Navbar, et seul un admin
 * principal peut compléter la connexion).
 */
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench, Shield, Crown, Lock, Mail, ArrowRight, Sparkles,
  Fingerprint, KeyRound, AlertTriangle, Timer, ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PasswordInput from '@/components/PasswordInput';
import PremiumLoading from '@/components/ui/premium-loading';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AUTH_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';

interface MaintenancePageProps {
  message?: string;
  onAuthenticated?: () => void;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ message, onAuthenticated }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Login attempt tracking (reuse login pattern)
  const [maxAttempts, setMaxAttempts] = useState(5);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isLocked && lockCountdown > 0) {
      countdownRef.current = setInterval(() => {
        setLockCountdown(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setFailedAttempts(0);
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (countdownRef.current) clearInterval(countdownRef.current);
      };
    }
  }, [isLocked, lockCountdown]);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEmailCheck = async () => {
    if (!email) {
      setErrors({ email: 'Veuillez entrer votre email' });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Veuillez entrer un email valide' });
      return;
    }
    setIsCheckingEmail(true);
    try {
      // Vérifier d'abord si c'est un admin principal
      const adminCheck = await axios.post(`${AUTH_BASE_URL}/api/maintenance/check-admin`, { email });
      if (!adminCheck.data?.isAdminPrincipal) {
        setIsCheckingEmail(false);
        setShowPasswordField(false);
        setErrors({ email: 'Seul un administrateur principal peut se connecter pendant la maintenance' });
        return;
      }
      // Récupérer ensuite la config tentatives via /check-email
      const response = await axios.post(`${AUTH_BASE_URL}/api/auth/check-email`, { email });
      setIsCheckingEmail(false);
      if (response.data?.exists) {
        setShowPasswordField(true);
        setAdminName(`${response.data.user.firstName} ${response.data.user.lastName}`);
        setMaxAttempts(response.data.maxAttempts || 5);
        setFailedAttempts(response.data.failedAttempts || 0);
        if (response.data.locked) {
          setIsLocked(true);
          setLockCountdown(response.data.remainingSeconds || 0);
        }
      } else {
        setErrors({ email: 'Ce profil n\'existe pas' });
      }
    } catch (e) {
      setIsCheckingEmail(false);
      setErrors({ email: 'Une erreur s\'est produite' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!email) return setErrors({ email: 'Veuillez entrer votre email' });
    if (!showPasswordField) {
      await handleEmailCheck();
      return;
    }
    if (!password) return setErrors({ password: 'Veuillez entrer votre mot de passe' });
    if (isLocked) return;

    setIsLoggingIn(true);
    try {
      const response = await axios.post(`${AUTH_BASE_URL}/api/auth/login`, { email, password });
      if (response.data && response.data.token && response.data.user) {
        // Vérification finale : doit être admin principal
        if (response.data.user.role !== 'administrateur principale') {
          toast({ title: 'Accès refusé', description: 'Seul un administrateur principal peut se connecter.', variant: 'destructive' });
          setIsLoggingIn(false);
          return;
        }
        const success = await login({ email, password });
        if (success) {
          onAuthenticated?.();
          navigate('/profile');
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
      } else if (status === 401 && data?.failedAttempts !== undefined) {
        setFailedAttempts(data.failedAttempts);
        setMaxAttempts(data.maxAttempts || maxAttempts);
        setErrors({ password: `Mot de passe incorrect (${data.failedAttempts}/${data.maxAttempts})` });
      } else {
        setErrors({ password: data?.message || 'Identifiants invalides' });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const remainingAttempts = maxAttempts - failedAttempts;

  if (isLoggingIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950">
        <PremiumLoading text="Connexion en cours..." size="lg" overlay={true} variant="default" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Ultra-luxe animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950" />
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-500/10 to-amber-500/10 rounded-full blur-[100px]"
        />
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -60, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 6 + i * 2, repeat: Infinity, delay: i * 0.8, ease: 'easeInOut' }}
            className="absolute w-1.5 h-1.5 bg-amber-300/40 rounded-full"
            style={{ left: `${10 + i * 11}%`, top: `${15 + i * 9}%` }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <AnimatePresence mode="wait">
        {!showLogin ? (
          /* ===== ÉCRAN MESSAGE MAINTENANCE ===== */
          <motion.div
            key="message"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative w-full max-w-2xl z-10"
          >
            <div className="absolute -inset-6 bg-gradient-to-r from-amber-600/20 via-orange-600/20 to-yellow-600/20 rounded-[2.5rem] blur-2xl" />
            <Card className="relative bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] shadow-[0_32px_64px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
              <CardHeader className="text-center pt-12 pb-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
                  className="flex justify-center mb-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl blur-2xl opacity-60" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
                      <Wrench className="h-12 w-12 text-white drop-shadow-lg" />
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Crown className="h-4 w-4 text-white" />
                    </motion.div>
                  </div>
                </motion.div>

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 mb-4 mx-auto">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-[11px] font-bold text-amber-200 uppercase tracking-widest">Maintenance en cours</span>
                  <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                </div>

                <CardTitle className="text-4xl md:text-5xl font-black text-white drop-shadow-lg mb-3">
                  Site en <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-300 bg-clip-text text-transparent">Maintenance</span>
                </CardTitle>
                <CardDescription className="text-amber-100/70 text-base md:text-lg mt-4 px-6 leading-relaxed">
                  {message || 'Le site est temporairement indisponible. Nous travaillons à améliorer votre expérience.'}
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-2">
                <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/20 p-5 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
                      <Crown className="w-5 h-5 text-amber-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-amber-100 mb-1">Accès restreint</p>
                      <p className="text-xs text-amber-200/70 leading-relaxed">
                        Seul un <strong className="text-amber-200">administrateur principal</strong> peut se connecter pendant la période de maintenance pour effectuer les opérations critiques.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 px-8 pt-6 pb-10">
                <Button
                  onClick={() => setShowLogin(true)}
                  className="w-full h-14 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:via-orange-400 hover:to-yellow-400 text-white font-bold text-base rounded-2xl shadow-[0_20px_40px_rgba(245,158,11,0.4)] hover:shadow-[0_25px_50px_rgba(245,158,11,0.5)] transform hover:scale-[1.02] transition-all duration-300 border border-white/10"
                >
                  <Lock className="h-5 w-5 mr-2" />
                  Se connecter (Admin principal)
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <p className="text-[11px] text-center text-amber-200/40 mt-2">
                  Cette action est journalisée et sécurisée
                </p>
              </CardFooter>
              <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
            </Card>
          </motion.div>
        ) : (
          /* ===== FORMULAIRE LOGIN MAINTENANCE ===== */
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative w-full max-w-md z-10"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-600/20 via-orange-600/20 to-purple-600/20 rounded-[2rem] blur-2xl" />
            <Card className="relative bg-white/[0.08] backdrop-blur-2xl border border-white/[0.12] shadow-[0_32px_64px_rgba(0,0,0,0.4)] rounded-3xl overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

              <CardHeader className="text-center pb-6 pt-10">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
                  className="flex justify-center mb-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur-xl opacity-50" />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl border border-white/20">
                      <Fingerprint className="h-10 w-10 text-white drop-shadow-lg" />
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Crown className="h-3 w-3 text-white" />
                    </motion.div>
                  </div>
                </motion.div>

                <CardTitle className="text-3xl font-bold text-white drop-shadow-lg">
                  Connexion Admin
                </CardTitle>
                <CardDescription className="text-amber-200/70 text-base mt-2">
                  Maintenance — Accès administrateur principal
                </CardDescription>

                <div className="flex items-center justify-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5 text-xs text-amber-300/60">
                    <Shield className="h-3 w-3" /><span>Sécurisé</span>
                  </div>
                  <div className="w-1 h-1 bg-amber-400/30 rounded-full" />
                  <div className="flex items-center gap-1.5 text-xs text-amber-300/60">
                    <KeyRound className="h-3 w-3" /><span>Chiffré</span>
                  </div>
                </div>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-5 px-8">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-semibold text-amber-200/80 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-amber-400" /> Adresse email
                    </Label>
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setShowPasswordField(false);
                          setFailedAttempts(0);
                          setIsLocked(false);
                          setLockCountdown(0);
                          if (errors.email) setErrors({});
                        }}
                        onBlur={handleEmailCheck}
                        disabled={isCheckingEmail || showPasswordField}
                        className={`relative h-14 bg-white/[0.06] border-white/[0.1] text-white placeholder:text-amber-300/30 rounded-xl transition-all duration-300 focus:bg-white/[0.1] focus:border-amber-400/50 ${errors.email ? 'border-red-400/50' : ''}`}
                      />
                    </div>
                    {errors.email && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertTriangle className="w-4 h-4" /> {errors.email}
                      </motion.div>
                    )}
                    {showPasswordField && adminName && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-amber-300 text-sm">
                        <Crown className="h-4 w-4" /> Bienvenue {adminName}
                      </motion.div>
                    )}
                  </div>

                  {showPasswordField && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm font-semibold text-amber-200/80">
                          Mot de passe
                        </Label>
                        {failedAttempts > 0 && (
                          <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border backdrop-blur-sm ${
                            isLocked ? 'bg-red-500/20 border-red-400/30 text-red-300'
                              : remainingAttempts <= 2 ? 'bg-orange-500/20 border-orange-400/30 text-orange-300'
                              : 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300'
                          }`}>
                            <Shield className="w-3 h-3" /> {failedAttempts}/{maxAttempts}
                          </div>
                        )}
                      </div>

                      {isLocked && lockCountdown > 0 && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                          className="relative rounded-xl overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-red-600/30 via-rose-600/30 to-red-600/30 backdrop-blur-xl" />
                          <div className="relative p-4 border border-red-400/30 rounded-xl">
                            <div className="flex items-center gap-3 mb-3">
                              <Lock className="w-5 h-5 text-red-300" />
                              <p className="text-sm font-bold text-red-200">Compte bloqué temporairement</p>
                            </div>
                            <div className="flex items-center justify-center gap-3">
                              <Timer className="w-5 h-5 text-red-300" />
                              <div className="text-3xl font-mono font-black text-red-300 tracking-widest">
                                {formatCountdown(lockCountdown)}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <PasswordInput
                        id="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={errors.password}
                        disabled={isLocked}
                        className={`h-14 bg-white/[0.06] border-white/[0.1] text-white rounded-xl ${isLocked ? 'opacity-50' : ''}`}
                      />
                    </motion.div>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col gap-3 px-8 pb-10 pt-4">
                  <Button
                    type="submit"
                    disabled={isCheckingEmail || isLocked}
                    className="w-full h-14 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:via-orange-400 hover:to-yellow-400 text-white font-bold text-base rounded-xl shadow-[0_20px_40px_rgba(245,158,11,0.3)] hover:shadow-[0_25px_50px_rgba(245,158,11,0.4)] transform hover:scale-[1.02] transition-all duration-300 border border-white/10"
                  >
                    {isCheckingEmail ? (
                      <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Vérification...</>
                    ) : showPasswordField ? (
                      <><Lock className="h-5 w-5 mr-2" /> Se connecter</>
                    ) : (
                      <><ArrowRight className="h-5 w-5 mr-2" /> Continuer</>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => { setShowLogin(false); setShowPasswordField(false); setEmail(''); setPassword(''); setErrors({}); }}
                    className="w-full h-12 bg-white/[0.05] hover:bg-white/[0.1] text-amber-200/80 rounded-xl border border-white/[0.1] backdrop-blur-sm"
                  >
                    Retour
                  </Button>
                </CardFooter>
              </form>
              <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-400/30 to-transparent" />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MaintenancePage;
