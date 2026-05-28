/**
 * useVisitLogger.ts — Enregistre la visite initiale puis chaque changement
 * de route (page consultée) dans l'historique des connexions.
 * - Une session navigateur reçoit un sessionId stable.
 * - Chaque chemin n'est enregistré qu'une seule fois par session pour éviter le spam.
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import historiqueConnexionApi from '@/services/api/historiqueConnexionApi';

const SESSION_KEY = 'visit_logged';
const SESSION_ID_KEY = 'visit_session_id';
const PAGES_KEY = 'visit_pages_logged';

const getSessionId = () => {
  try {
    let sid = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sid) {
      sid = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      sessionStorage.setItem(SESSION_ID_KEY, sid);
    }
    return sid;
  } catch { return ''; }
};

const getLoggedPages = (): Set<string> => {
  try {
    const raw = sessionStorage.getItem(PAGES_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
};
const saveLoggedPages = (set: Set<string>) => {
  try { sessionStorage.setItem(PAGES_KEY, JSON.stringify([...set])); } catch {}
};

type LightUser = { id?: string; email?: string; firstName?: string; lastName?: string; role?: string } | null | undefined;

export const useVisitLogger = (user?: LightUser) => {
  const location = useLocation();
  const initialDone = useRef(false);

  // Construit le payload utilisateur
  const buildUserPayload = () => (user?.id ? {
    userId: user.id,
    userEmail: user.email,
    userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    userRole: user.role || 'utilisateur',
  } : {});

  // Visite initiale (1 fois par session)
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) { initialDone.current = true; return; }
      const sessionId = getSessionId();
      historiqueConnexionApi.logVisit({
        ...buildUserPayload(),
        message: user?.id ? 'Ouverture de session (visite)' : 'Visite anonyme du site',
        page: location.pathname,
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        sessionId,
      }).then(() => {
        sessionStorage.setItem(SESSION_KEY, '1');
        const pages = getLoggedPages();
        pages.add(location.pathname);
        saveLoggedPages(pages);
        initialDone.current = true;
      }).catch(() => {});
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Log chaque nouvelle page visitée (une seule fois par session)
  useEffect(() => {
    if (!initialDone.current) return;
    try {
      const pages = getLoggedPages();
      if (pages.has(location.pathname)) return;
      const sessionId = getSessionId();
      historiqueConnexionApi.logVisit({
        ...buildUserPayload(),
        type: 'visit',
        message: `Consultation: ${location.pathname}`,
        page: location.pathname,
        sessionId,
      }).then(() => {
        pages.add(location.pathname);
        saveLoggedPages(pages);
      }).catch(() => {});
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
};

export default useVisitLogger;
