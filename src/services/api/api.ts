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

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
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
