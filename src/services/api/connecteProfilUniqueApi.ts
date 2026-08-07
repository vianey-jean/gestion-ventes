/**
 * connecteProfilUniqueApi.ts — Service API (MODEL) pour la session unique.
 *
 * Toutes les requêtes vers /api/connecte-profil-unique sont centralisées ici.
 */
import api from './api';

export interface DeviceContext {
  browser: string;
  os: string;
  device: string;
  timezone: string;
  clientKey: string;
}

export interface SessionConflict {
  entryId: string;
  ip: string;
  browser: string;
  os: string;
  device: string;
  timezone: string;
  dateConnexion: string;
  heureConnexion: string;
}

export interface PendingLogoutRequest {
  requestId: string;
  fromIp: string;
  fromBrowser: string;
  requestedAt: string;
  expiresAt: string;
}

export interface SessionNotification {
  id: string;
  type: string;
  message: string;
  details?: Record<string, string>;
  createdAt: string;
}

export interface PollResult {
  known: boolean;
  forceLogout?: boolean;
  reason?: string;
  logoutRequest?: PendingLogoutRequest | null;
  notifications?: SessionNotification[];
}

/** Clé stable par navigateur (persistée dans localStorage) */
export const getClientKey = (): string => {
  try {
    let key = localStorage.getItem('device_client_key');
    if (!key) {
      key = `dev_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
      localStorage.setItem('device_client_key', key);
    }
    return key;
  } catch {
    return 'dev_unknown';
  }
};

/** Détection navigateur / OS / appareil côté client */
export const getDeviceContext = (): DeviceContext => {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  let browser = 'Inconnu';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/OPR\/|Opera/i.test(ua)) browser = 'Opera';
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = 'Chrome';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Safari\//i.test(ua)) browser = 'Safari';

  let os = 'Inconnu';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iOS/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let device = 'Desktop';
  if (/Mobile|Android|iPhone/i.test(ua)) device = 'Mobile';
  else if (/Tablet|iPad/i.test(ua)) device = 'Tablet';

  let timezone = '';
  try { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { timezone = ''; }

  return { browser, os, device, timezone, clientKey: getClientKey() };
};

const BASE = '/api/connecte-profil-unique';

export const SESSION_ID_KEY = 'session_unique_id';

export const connecteProfilUniqueApi = {
  getSessionId: (): string | null => {
    try { return localStorage.getItem(SESSION_ID_KEY); } catch { return null; }
  },
  setSessionId: (id: string | null) => {
    try {
      if (id) localStorage.setItem(SESSION_ID_KEY, id);
      else localStorage.removeItem(SESSION_ID_KEY);
    } catch { /* ignore */ }
  },

  check: async (payload: { userId: string; role?: string }) => {
    const res = await api.post<{ allowed: boolean; principal: boolean; conflict?: SessionConflict }>(
      `${BASE}/check`,
      { ...payload, ...getDeviceContext() }
    );
    return res.data;
  },

  registerLogin: async (payload: { userId: string; email?: string; nom?: string; role?: string }) => {
    const res = await api.post<{ success: boolean; sessionId: string; entryId: string; principal: boolean }>(
      `${BASE}/register-login`,
      { ...payload, ...getDeviceContext() }
    );
    return res.data;
  },

  logout: async (sessionId: string, motif?: string) => {
    const res = await api.post(`${BASE}/logout`, { sessionId, motif });
    return res.data;
  },

  requestLogout: async (targetEntryId: string, mode: 'auto' | 'manuel') => {
    const res = await api.post<{ requestId: string; status: string; expiresAt?: string }>(
      `${BASE}/request-logout`,
      { targetEntryId, mode, ...getDeviceContext() }
    );
    return res.data;
  },

  requestStatus: async (requestId: string) => {
    const res = await api.get<{ status: string; mode?: string; expiresAt?: string | null }>(
      `${BASE}/request-status/${requestId}`
    );
    return res.data;
  },

  respondLogout: async (payload: { sessionId?: string; requestId?: string; accept: boolean }) => {
    const res = await api.post<{ success: boolean; status: string }>(`${BASE}/respond-logout`, payload);
    return res.data;
  },

  poll: async (sessionId: string) => {
    const res = await api.post<PollResult>(`${BASE}/poll`, { sessionId });
    return res.data;
  },

  actives: async () => {
    const res = await api.get(`${BASE}/actives`);
    return res.data;
  },
};

export default connecteProfilUniqueApi;
