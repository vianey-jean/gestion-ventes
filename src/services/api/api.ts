/**
 * api.ts — Instance Axios centralisée pour toutes les requêtes HTTP
 * 
 * Configuration :
 * - baseURL : VITE_API_BASE_URL ou https://server-gestion-ventes.onrender.com
 * - timeout : 30 secondes
 * - Content-Type : application/json
 * - withCredentials : false (pas de cookies cross-origin)
 * 
 * Intercepteurs :
 * - Requête : ajoute automatiquement le token JWT depuis localStorage
 * - Réponse : redirige vers /login en cas de 401 (token expiré)
 * 
 * Retry : 2 tentatives avec backoff exponentiel (2s, 4s) pour erreurs réseau ou 503
 */
import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import {
  ensureSession,
  resetSession,
  encryptPayload,
  decryptEnvelope,
  isEnvelope,
  isExemptUrl,
} from '@/lib/secureTransport';

// Configuration de l'URL de base - sans préfixe /api pour éviter le doublement
const getBaseURL = () => {
  return import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';
};

// Create axios instance with base configuration
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: getBaseURL(),
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: false,
  });

  // Configure retry logic
  axiosRetry(instance, {
    retries: 2,
    retryDelay: (retryCount) => Math.pow(2, retryCount) * 1000,
    retryCondition: (error) => {
      return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
             (error.response?.status === 503);
    },
  });

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Intercepteur : chiffrement de transport (handshake ECDH → AES-256-GCM)
  instance.interceptors.request.use(async (config) => {
    try {
      const url = `${config.url || ''}`;
      const isMultipart =
        typeof FormData !== 'undefined' && (config.data as any) instanceof FormData;
      if (isExemptUrl(url, config.headers as any, isMultipart)) return config;

      const session = await ensureSession();
      if (!session) return config;

      config.headers.set?.('x-session-id', session.sessionId);
      config.headers.set?.('x-app-id', 'web');

      const method = String(config.method || 'get').toUpperCase();
      if (config.data !== undefined && method !== 'GET' && method !== 'HEAD' && !isMultipart) {
        const plain = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
        const envelope = await encryptPayload(plain);
        if (envelope) {
          config.data = envelope;
          config.headers.set?.('Content-Type', 'application/json');
          config.headers.set?.('x-encrypted', '1');
        }
      }
    } catch {
      /* mode dégradé : envoi en clair */
    }
    return config;
  });

  // Response interceptor for error handling
  instance.interceptors.response.use(
    async (response) => {
      if (isEnvelope(response.data)) {
        try {
          response.data = await decryptEnvelope(response.data);
        } catch {
          /* laisse la charge utile telle quelle */
        }
      }
      return response;
    },
    async (error) => {
      // Session de chiffrement expirée → renégociation + rejeu unique
      const status = error.response?.status;
      const needsHandshake =
        (status === 409 || status === 400) &&
        (error.response?.data?.renegotiate === true ||
          error.response?.headers?.['x-handshake-required'] === '1');
      if (needsHandshake && error.config && !(error.config as any).__handshakeRetried) {
        (error.config as any).__handshakeRetried = true;
        resetSession();
        await ensureSession();
        return instance.request(error.config);
      }

      if (isEnvelope(error.response?.data)) {
        try {
          error.response.data = await decryptEnvelope(error.response.data);
        } catch {
          /* ignore */
        }
      }

      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Dispatch a custom event so AuthContext can handle navigation via React Router
        window.dispatchEvent(new CustomEvent('auth:logout'));
      } else if (error.code !== 'ERR_NETWORK') {
        console.error('API Error:', error);
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

const api = createApiInstance();

export { api, getBaseURL };
export default api;
