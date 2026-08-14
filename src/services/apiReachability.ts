/**
 * apiReachability.ts — Sonde de disponibilité de l'API.
 *
 * Objectif : ne jamais ouvrir de connexion SSE (EventSource) quand le serveur
 * est injoignable (Render endormi, coupure réseau). Cela évite les erreurs
 * "Blocage d'une requête multiorigine ... Code d'état : (null)" répétées
 * dans la console du navigateur.
 */
import { getBaseURL } from '@/services/api/api';

const CACHE_MS = 30000;

let lastCheck = 0;
let lastResult = false;
let inFlight: Promise<boolean> | null = null;

export const isApiReachable = async (): Promise<boolean> => {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;

  const now = Date.now();
  if (now - lastCheck < CACHE_MS) return lastResult;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`${getBaseURL()}/api/health`, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'omit',
        signal: controller.signal,
      });
      lastResult = res.ok;
    } catch {
      lastResult = false;
    } finally {
      clearTimeout(timer);
      lastCheck = Date.now();
      inFlight = null;
    }
    return lastResult;
  })();

  return inFlight;
};

export const resetApiReachability = () => {
  lastCheck = 0;
  lastResult = false;
};