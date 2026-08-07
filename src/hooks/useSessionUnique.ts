/**
 * useSessionUnique.ts — CONTROLLER de la session unique par profil.
 *
 * Rôle :
 *  - heartbeat toutes les 2 s vers /api/connecte-profil-unique/poll
 *  - déconnexion immédiate si le serveur l'ordonne (auto / accepté / 5 min)
 *  - remontée d'une demande de déconnexion manuelle (notification toutes les 5 s)
 *  - remontée des notifications de connexion multiple (admin principal)
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import connecteProfilUniqueApi, {
  PendingLogoutRequest,
  SessionNotification,
} from '@/services/api/connecteProfilUniqueApi';

interface Options {
  isAuthenticated: boolean;
  onForceLogout: (reason?: string) => void;
  onNotification?: (notif: SessionNotification) => void;
}

export const useSessionUnique = ({ isAuthenticated, onForceLogout, onNotification }: Options) => {
  const [logoutRequest, setLogoutRequest] = useState<PendingLogoutRequest | null>(null);
  const seenNotifs = useRef<Set<string>>(new Set());
  const stopped = useRef(false);

  const respond = useCallback(async (accept: boolean) => {
    const sessionId = connecteProfilUniqueApi.getSessionId();
    const requestId = logoutRequest?.requestId;
    if (!sessionId && !requestId) return;
    try {
      await connecteProfilUniqueApi.respondLogout({
        sessionId: sessionId || undefined,
        requestId,
        accept,
      });
    } catch { /* ignore */ }
    setLogoutRequest(null);
    if (accept) {
      stopped.current = true;
      onForceLogout('Vous avez confirmé la déconnexion');
    }
  }, [logoutRequest, onForceLogout]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLogoutRequest(null);
      return;
    }
    stopped.current = false;
    let timer: number | undefined;
    let cancelled = false;

    const beat = async () => {
      const sessionId = connecteProfilUniqueApi.getSessionId();
      if (!sessionId || stopped.current) return;
      try {
        const res = await connecteProfilUniqueApi.poll(sessionId);
        if (cancelled) return;

        if (res.known && res.forceLogout) {
          stopped.current = true;
          setLogoutRequest(null);
          connecteProfilUniqueApi.setSessionId(null);
          onForceLogout(res.reason || 'Votre session a été fermée à distance');
          return;
        }

        setLogoutRequest(res.logoutRequest || null);

        (res.notifications || []).forEach((n) => {
          if (seenNotifs.current.has(n.id)) return;
          seenNotifs.current.add(n.id);
          onNotification?.(n);
        });
      } catch { /* réseau : on retente au prochain tick */ }
    };

    beat();
    timer = window.setInterval(beat, 2000);

    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
    };
  }, [isAuthenticated, onForceLogout, onNotification]);

  return { logoutRequest, respond };
};

export default useSessionUnique;
