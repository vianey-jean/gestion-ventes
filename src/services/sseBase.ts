/**
 * sseBase.ts — Détermine la base d'URL à utiliser pour les connexions SSE
 * (et la sonde /api/health).
 *
 * Objectif : éviter les erreurs CORS en passant par le proxy same-origin
 * (Vite en local, rewrites Vercel / preview Lovable) quand il est disponible.
 * On retourne alors une chaîne vide => URL relative => aucune requête
 * multiorigine, donc aucun blocage CORS.
 */
import { getBaseURL } from '@/services/api/api';

const hasSameOriginProxy = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.includes('lovableproject.com') ||
    hostname.includes('lovable.app') ||
    hostname.includes('vercel.app')
  );
};

/** Base d'URL pour SSE / health : '' (relative) si un proxy same-origin existe. */
export const getSseBaseURL = (): string => {
  if (hasSameOriginProxy()) return '';
  return getBaseURL();
};

export { hasSameOriginProxy };
