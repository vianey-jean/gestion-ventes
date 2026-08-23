/**
 * AdminPrincipalGate.tsx
 * Verrou d'accès ultra-premium (style page de connexion) :
 * - Réservé à l'administrateur principale (rôle vérifié + mot de passe users.json)
 * - PasswordStrengthChecker pour valider la norme du mot de passe
 * - 3 tentatives maximum, puis verrouillage 15 minutes
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/PasswordInput';
import PasswordStrengthChecker from '@/components/PasswordStrengthChecker';
import { Lock, ShieldCheck, Crown, Sparkles, TimerReset, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { epargneApi } from '@/services/api/epargneApi';

const MAX_ATTEMPTS = 3;
const LOCK_MS = 15 * 60 * 1000;
const LOCK_KEY = 'epargne_gate_lock_until';
const ATTEMPTS_KEY = 'epargne_gate_attempts';

interface AdminPrincipalGateProps {
  /** Titre affiché sur la carte verrouillée */
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

const AdminPrincipalGate: React.FC<AdminPrincipalGateProps> = ({ title, subtitle, children }) => {
  const { toast } = useToast();
  const [unlocked, setUnlocked] = useState(false);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [checking, setChecking] = useState(false);
  const [attempts, setAttempts] = useState(() => Number(localStorage.getItem(ATTEMPTS_KEY) || 0));
  const [lockUntil, setLockUntil] = useState(() => Number(localStorage.getItem(LOCK_KEY) || 0));
  const [now, setNow] = useState(Date.now());

  const user = useMemo(() => readUser(), []);
  const isMainAdmin = String(user?.role || '').toLowerCase().trim() === 'administrateur principale';
  const adminName = useMemo(() => {
    const full = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
    return full || user?.name || user?.email || '';
  }, [user]);

  // Mémorise l'administrateur principale connecté
  useEffect(() => {
    if (isMainAdmin && adminName) {
      localStorage.setItem('admin_principal_name', adminName);
      localStorage.setItem('admin_principal_id', String(user?.id || ''));
    }
  }, [isMainAdmin, adminName, user]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const locked = lockUntil > now;
  const remaining = Math.max(0, lockUntil - now);
  const remainingLabel = `${String(Math.floor(remaining / 60000)).padStart(2, '0')}:${String(
    Math.floor((remaining % 60000) / 1000)
  ).padStart(2, '0')}`;

  const handleOpen = useCallback(() => {
    if (!isMainAdmin) {
      toast({
        title: 'Accès refusé',
        description: "Seul l'administrateur principale peut consulter ce module.",
        variant: 'destructive',
      });
      return;
    }
    setPassword('');
    setOpen(true);
  }, [isMainAdmin, toast]);

  const handleValidate = async () => {
    if (locked || checking) return;
    if (!password) {
      toast({ title: 'Mot de passe requis', variant: 'destructive' });
      return;
    }
    setChecking(true);
    try {
      const res = await epargneApi.verifyAdmin(password);
      if (res.ok) {
        localStorage.removeItem(ATTEMPTS_KEY);
        setAttempts(0);
        setUnlocked(true);
        setOpen(false);
        setPassword('');
        toast({
          title: 'Accès autorisé',
          description: `Bienvenue ${res.name || adminName}`,
          className: 'bg-emerald-600 text-white',
        });
      } else {
        const next = attempts + 1;
        setAttempts(next);
        localStorage.setItem(ATTEMPTS_KEY, String(next));
        if (next >= MAX_ATTEMPTS) {
          const until = Date.now() + LOCK_MS;
          setLockUntil(until);
          localStorage.setItem(LOCK_KEY, String(until));
          localStorage.removeItem(ATTEMPTS_KEY);
          setAttempts(0);
          setOpen(false);
          toast({
            title: 'Module verrouillé',
            description: '3 tentatives incorrectes — accès bloqué pendant 15 minutes.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Mot de passe incorrect',
            description: `Tentative ${next}/${MAX_ATTEMPTS}`,
            variant: 'destructive',
          });
        }
      }
    } finally {
      setChecking(false);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <>
      <motion.button
        type="button"
        onClick={locked ? undefined : handleOpen}
        whileHover={locked ? undefined : { y: -4 }}
        whileTap={locked ? undefined : { scale: 0.99 }}
        className={`group relative w-full h-full text-left overflow-hidden rounded-[2rem] p-6 sm:p-8 border transition-all duration-500
          ${locked
            ? 'cursor-not-allowed border-rose-300/60 dark:border-rose-700/50 bg-gradient-to-br from-rose-50 via-white to-rose-50 dark:from-rose-950/40 dark:via-slate-900 dark:to-rose-950/30'
            : 'border-violet-200/60 dark:border-violet-700/40 bg-gradient-to-br from-white via-violet-50/70 to-fuchsia-50/60 dark:from-slate-900 dark:via-violet-950/40 dark:to-fuchsia-950/30 shadow-[0_30px_80px_rgba(139,92,246,0.18)] hover:shadow-[0_40px_120px_rgba(139,92,246,0.32)]'}
        `}
      >
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-br from-violet-400/20 to-fuchsia-400/10 animate-pulse" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-indigo-400/15 to-transparent" />

        <div className="relative flex items-center gap-4">
          <div className="relative rounded-2xl p-4 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-indigo-600 shadow-[0_15px_40px_rgba(139,92,246,0.5)]">
            {locked ? <TimerReset className="h-7 w-7 text-white" /> : <Lock className="h-7 w-7 text-white" />}
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-fuchsia-200 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-extrabold tracking-wide bg-gradient-to-r from-violet-700 via-fuchsia-600 to-indigo-700 dark:from-violet-300 dark:via-fuchsia-300 dark:to-indigo-300 bg-clip-text text-transparent flex items-center gap-2">
              {title}
              <Crown className="h-5 w-5 text-amber-500 shrink-0" />
            </h3>
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 truncate">
              {locked
                ? `Verrouillé — réessayez dans ${remainingLabel}`
                : subtitle || 'Accès protégé — administrateur principale'}
            </p>
          </div>
        </div>

        <div className="relative mt-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-violet-700/80 dark:text-violet-300/80">
          <ShieldCheck className="h-4 w-4" />
          {isMainAdmin ? 'Cliquez pour déverrouiller' : 'Réservé à l\'administrateur principale'}
        </div>
      </motion.button>

      <Dialog open={open} onOpenChange={(v) => !checking && setOpen(v)}>
        <DialogContent className="max-w-md bg-gradient-to-br from-white via-violet-50/60 to-fuchsia-50/50 dark:from-slate-950 dark:via-violet-950/40 dark:to-fuchsia-950/30 border border-violet-200/60 dark:border-violet-800/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="rounded-xl p-2.5 bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent font-extrabold">
                Vérification administrateur
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-2xl border border-violet-200/60 dark:border-violet-800/50 bg-white/70 dark:bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-wider font-bold text-violet-600 dark:text-violet-300">
                Administrateur principale
              </p>
              <p className="text-base font-extrabold text-slate-900 dark:text-white truncate">{adminName || '—'}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gate-password">Mot de passe</Label>
              <PasswordInput
                id="gate-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter') handleValidate();
                }}
              />
              <PasswordStrengthChecker password={password} />
            </div>

            <AnimatePresence>
              {attempts > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 rounded-xl border border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs font-semibold text-amber-700 dark:text-amber-300"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Tentative {attempts}/{MAX_ATTEMPTS} — après {MAX_ATTEMPTS} échecs, blocage de 15 minutes.
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={checking}>
                Annuler
              </Button>
              <Button
                onClick={handleValidate}
                disabled={checking || locked}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700"
              >
                {checking ? 'Vérification…' : 'Déverrouiller'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminPrincipalGate;
