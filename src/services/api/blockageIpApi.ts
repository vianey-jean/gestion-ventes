/**
 * blockageIpApi — Gestion des adresses IP bloquées
 *
 * Endpoints serveur :
 *  - GET    /api/blockage-ip/check  (public)
 *  - GET    /api/blockage-ip        (protégé)
 *  - POST   /api/blockage-ip        (protégé)
 *  - DELETE /api/blockage-ip/:id    (protégé)
 */
import api, { getBaseURL } from './api';

export interface BlockedIp {
  id: string;
  ip: string;
  reason: string | null;
  createdAt: string;
  createdBy: string | null;
  /** true = blocage actif (accès refusé) ; false = blocage en pause */
  active?: boolean;
  updatedAt?: string;
}

export interface IpCheckResult {
  ip: string;
  blocked: boolean;
  reason: string | null;
  blockedAt: string | null;
}

const blockageIpApi = {
  /** Vérification publique de l'IP appelante (sans token) */
  check: async (): Promise<IpCheckResult> => {
    const res = await fetch(`${getBaseURL()}/api/blockage-ip/check`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.status === 403) {
      const data = await res.json().catch(() => ({}));
      return { ip: data.ip || '', blocked: true, reason: data.reason || null, blockedAt: null };
    }
    if (!res.ok) throw new Error('check failed');
    return res.json();
  },

  getAll: async (): Promise<{ ips: BlockedIp[]; currentIp: string }> => {
    const { data } = await api.get('/api/blockage-ip');
    return { ips: data?.ips || [], currentIp: data?.currentIp || '' };
  },

  add: async (ip: string, reason?: string): Promise<BlockedIp> => {
    const { data } = await api.post('/api/blockage-ip', { ip, reason });
    return data.entry;
  },

  /** Modifie l'adresse IP et/ou le motif d'un blocage existant */
  update: async (id: string, payload: { ip?: string; reason?: string | null }): Promise<BlockedIp> => {
    const { data } = await api.put(`/api/blockage-ip/${encodeURIComponent(id)}`, payload);
    return data.entry;
  },

  /** Active (play) ou met en pause le blocage sans le supprimer */
  setActive: async (id: string, active: boolean): Promise<BlockedIp> => {
    const { data } = await api.patch(`/api/blockage-ip/${encodeURIComponent(id)}/active`, { active });
    return data.entry;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/api/blockage-ip/${encodeURIComponent(id)}`);
  },
};

export default blockageIpApi;
