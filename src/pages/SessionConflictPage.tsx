/**
 * SessionConflictPage.tsx — VUE : profil déjà connecté ailleurs.
 *
 * Affichée quand un profil (non administrateur principal) est déjà connecté
 * sur une autre IP / un autre navigateur. Deux choix :
 *  - Déconnecter automatiquement : le poste distant est fermé immédiatement.
 *  - Déconnecter manuellement : le poste distant reçoit une demande toutes les
 *    5 s ; s'il accepte → connexion immédiate ; s'il refuse → retour au login ;
 *    sans réponse pendant 5 minutes → déconnexion forcée puis connexion.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import connecteProfilUniqueApi, { SessionConflict } from '@/services/api/connecteProfilUniqueApi';
import { ShieldAlert, Monitor, Globe, Clock, Zap, Hand, Loader2 } from 'lucide-react';
import SessionShellNavbar from '@/components/session/SessionShellNavbar';
import SessionShellHero from '@/components/session/SessionShellHero';
import SessionShellFooter from '@/components/session/SessionShellFooter';

const PENDING_KEY = 'session_conflict_pending';

interface PendingLogin {
  email: string;
  password: string;
  userId: string;
  role?: string;
  nom?: string;
  conflict: SessionConflict;
}

export const savePendingLogin = (data: PendingLogin) => {
  try { sessionStorage.setItem(PENDING_KEY, JSON.stringify({ ...data, password: btoa(data.password) })); } catch { /* ignore */ }
};

const readPendingLogin = (): PendingLogin | null => {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...parsed, password: atob(parsed.password) };
  } catch {
    return null;
  }
};

const clearPendingLogin = () => {
  try { sessionStorage.removeItem(PENDING_KEY); } catch { /* ignore */ }
};

const SessionConflictPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [pending] = useState<PendingLogin | null>(() => readPendingLogin());
  const [mode, setMode] = useState<'auto' | 'manuel' | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const requestIdRef = useRef<string | null>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (!pending) navigate('/login', { replace: true });
  }, [pending, navigate]);

  /** Connexion réelle une fois le créneau libéré */
  const finishLogin = useCallback(async () => {
    if (!pending || finishedRef.current) return;
    finishedRef.current = true;
    const ok = await login({ email: pending.email, password: pending.password });
    if (ok) {
      try {
        const reg = await connecteProfilUniqueApi.registerLogin({
          userId: pending.userId,
          email: pending.email,
          nom: pending.nom,
          role: pending.role,
        });
        connecteProfilUniqueApi.setSessionId(reg.sessionId);
      } catch { /* ignore */ }
      clearPendingLogin();
      navigate('/dashboard', { replace: true });
    } else {
      finishedRef.current = false;
      clearPendingLogin();
      navigate('/login', { replace: true });
    }
  }, [pending, login, navigate]);

  const handleAuto = async () => {
    if (!pending) return;
    setMode('auto');
    setWaiting(true);
    try {
      const res = await connecteProfilUniqueApi.requestLogout(pending.conflict.entryId, 'auto');
      if (res.status === 'granted') {
        toast({
          title: 'Session distante déconnectée',
          description: 'Connexion en cours…',
          className: 'bg-green-600 text-white border-green-600',
        });
        await finishLogin();
        return;
      }
      setWaiting(false);
    } catch {
      setWaiting(false);
      toast({ title: 'Erreur', description: 'Déconnexion automatique impossible', variant: 'destructive' });
    }
  };

  const handleManuel = async () => {
    if (!pending) return;
    setMode('manuel');
    setWaiting(true);
    try {
      const res = await connecteProfilUniqueApi.requestLogout(pending.conflict.entryId, 'manuel');
      requestIdRef.current = res.requestId;
      if (res.status === 'granted') {
        await finishLogin();
        return;
      }
      if (res.expiresAt) {
        setRemaining(Math.max(0, Math.round((new Date(res.expiresAt).getTime() - Date.now()) / 1000)));
      }
      toast({
        title: 'Demande envoyée',
        description: 'Le poste distant reçoit une demande de déconnexion toutes les 5 secondes.',
      });
    } catch {
      setWaiting(false);
      toast({ title: 'Erreur', description: 'Envoi de la demande impossible', variant: 'destructive' });
    }
  };

  // Suivi de la demande manuelle (statut + compte à rebours)
  useEffect(() => {
    if (mode !== 'manuel' || !waiting) return;
    let cancelled = false;

    const tick = async () => {
      const requestId = requestIdRef.current;
      if (!requestId) return;
      try {
        const res = await connecteProfilUniqueApi.requestStatus(requestId);
        if (cancelled) return;
        if (res.expiresAt) {
          setRemaining(Math.max(0, Math.round((new Date(res.expiresAt).getTime() - Date.now()) / 1000)));
        }
        if (res.status === 'granted' || res.status === 'granted_timeout') {
          setWaiting(false);
          toast({
            title: 'Déconnexion effectuée',
            description: res.status === 'granted_timeout'
              ? 'Aucune réponse après 5 minutes : déconnexion automatique.'
              : 'La déconnexion a été confirmée.',
            className: 'bg-green-600 text-white border-green-600',
          });
          await finishLogin();
        } else if (res.status === 'refused') {
          setWaiting(false);
          clearPendingLogin();
          toast({
            title: 'Demande refusée',
            description: 'La demande de déconnexion a été refusée.',
            variant: 'destructive',
          });
          navigate('/login', { replace: true });
        }
      } catch { /* retente */ }
    };

    tick();
    const id = window.setInterval(tick, 1500);
    return () => { cancelled = true; window.clearInterval(id); };
  }, [mode, waiting, finishLogin, navigate, toast]);

  if (!pending) return null;

  const c = pending.conflict;
  const mmss = remaining !== null
    ? `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#020207] text-white relative overflow-hidden">
      {/* Fond luxe */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 -left-20 h-96 w-96 rounded-full bg-violet-700/20 " />
        <div className="absolute bottom-0 -right-20 h-96 w-96 rounded-full bg-fuchsia-700/20 " />
        <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:28px_28px]" />
      </div>

      <SessionShellNavbar />
      <SessionShellHero />

      <main className="relative flex-1 flex items-start justify-center px-4 pb-14">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
          <div className="relative">
            <div className="absolute -inset-[1px] rounded-[32px] bg-gradient-to-br from-white/20 via-violet-500/25 to-fuchsia-500/25" />
            <div className="relative rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-white/[0.02]  p-6 sm:p-8 space-y-6 shadow-[0_40px_120px_-30px_rgba(139,92,246,0.45)]">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-rose-500 to-fuchsia-500 opacity-70 " />
                  <div className="relative h-14 w-14 rounded-3xl bg-gradient-to-br from-rose-500 via-fuchsia-500 to-violet-500 flex items-center justify-center shadow-lg">
                    <ShieldAlert className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-white to-violet-200 bg-clip-text text-transparent">
                    Profil déjà connecté ailleurs
                  </h2>
                  <p className="text-sm text-white/55">
                    Un seul appareil à la fois est autorisé pour ce profil.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { icon: Monitor, label: 'Appareil', value: `${c.browser}`, sub: `${c.os} · ${c.device}`, tone: 'from-violet-500 to-purple-500' },
                  { icon: Globe, label: 'Adresse IP', value: c.ip, sub: c.timezone || '—', tone: 'from-cyan-500 to-blue-500' },
                  { icon: Clock, label: 'Connecté depuis', value: c.heureConnexion, sub: c.dateConnexion, tone: 'from-amber-400 to-rose-500' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.06] transition-colors">
                    <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${item.tone} flex items-center justify-center mb-3 shadow-md`}>
                      <item.icon className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">{item.label}</p>
                    <p className="text-sm font-bold text-white truncate">{item.value}</p>
                    <p className="text-[11px] text-white/45 truncate">{item.sub}</p>
                  </div>
                ))}
              </div>

              {waiting && mode === 'manuel' ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-violet-950/50 via-black/40 to-black/50 p-5 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-violet-300" /> Demande de déconnexion envoyée
                  </div>
                  <p className="text-sm text-white/55">
                    En attente de la confirmation sur l'autre appareil.
                    {mmss ? ` Déconnexion automatique dans ${mmss}.` : ''}
                  </p>
                  {mmss && (
                    <div className="text-3xl font-black tracking-widest bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                      {mmss}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleAuto}
                    disabled={waiting}
                    className="group relative overflow-hidden rounded-2xl p-[1.5px] disabled:opacity-50 transition-transform active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-amber-500 via-fuchsia-600 to-violet-600" />
                    <div className="relative rounded-[14px] bg-[#0a0713]/85 px-5 py-4 text-left">
                      <span className="flex items-center gap-2 font-bold text-sm text-white">
                        <Zap className="h-4 w-4 text-amber-300" /> Déconnecter automatiquement
                      </span>
                      <span className="block mt-1 text-xs text-white/50">Fermeture immédiate de l'autre session</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleManuel}
                    disabled={waiting}
                    className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] px-5 py-4 text-left disabled:opacity-50 transition-all active:scale-[0.98]"
                  >
                    <span className="flex items-center gap-2 font-bold text-sm text-white">
                      <Hand className="h-4 w-4 text-violet-300" /> Déconnecter manuellement
                    </span>
                    <span className="block mt-1 text-xs text-white/50">Demander la confirmation (5 min max)</span>
                  </button>
                </div>
              )}

              <button
                type="button"
                className="w-full rounded-xl py-3 text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => { clearPendingLogin(); navigate('/login', { replace: true }); }}
              >
                Annuler et revenir à la connexion
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      <SessionShellFooter />
    </div>
  );
};

export default SessionConflictPage;
