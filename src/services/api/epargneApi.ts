/**
 * epargneApi.ts - Service API pour les comptes d'épargne (accès admin principale)
 */
import api from './api';

export interface EpargneOperation {
  id: string;
  type: 'versement' | 'retrait';
  montant: number;
  date: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EpargneCompte {
  id: string;
  accountName: string;
  description?: string;
  createdAt?: string;
  operations?: EpargneOperation[];
  solde: number;
  operationsCount: number;
}

export interface EpargneOwner {
  id: string;
  personName: string;
  address?: string;
  description?: string;
  fileName?: string;
  createdAt?: string;
  comptes: EpargneCompte[];
  soldeTotal: number;
}

export const epargneApi = {
  async verifyAdmin(password: string): Promise<{ ok: boolean; name?: string; message?: string }> {
    try {
      const res = await api.post('/api/epargne/verify-admin', { password });
      return res.data;
    } catch (e: any) {
      return { ok: false, message: e?.response?.data?.message || 'Mot de passe incorrect' };
    }
  },

  async getAll(): Promise<EpargneOwner[]> {
    const res = await api.get('/api/epargne');
    return Array.isArray(res.data) ? res.data : [];
  },

  async createOwner(data: {
    personName: string;
    accountName: string;
    address?: string;
    description?: string;
  }): Promise<EpargneOwner> {
    const res = await api.post('/api/epargne', data);
    return res.data;
  },

  async updateOwner(ownerId: string, data: Partial<{ personName: string; address: string; description: string }>) {
    const res = await api.put(`/api/epargne/${ownerId}`, data);
    return res.data as EpargneOwner;
  },

  async deleteOwner(ownerId: string) {
    await api.delete(`/api/epargne/${ownerId}`);
    return true;
  },

  async addCompte(ownerId: string, data: { accountName: string; description?: string }) {
    const res = await api.post(`/api/epargne/${ownerId}/comptes`, data);
    return res.data as EpargneOwner;
  },

  async updateCompte(ownerId: string, compteId: string, data: Partial<{ accountName: string; description: string }>) {
    const res = await api.put(`/api/epargne/${ownerId}/comptes/${compteId}`, data);
    return res.data as EpargneOwner;
  },

  async deleteCompte(ownerId: string, compteId: string) {
    const res = await api.delete(`/api/epargne/${ownerId}/comptes/${compteId}`);
    return res.data as EpargneOwner;
  },

  async addOperation(
    ownerId: string,
    compteId: string,
    data: { type: 'versement' | 'retrait'; montant: number; date: string; description?: string }
  ) {
    const res = await api.post(`/api/epargne/${ownerId}/comptes/${compteId}/operations`, data);
    return res.data as { operation: EpargneOperation; owner: EpargneOwner };
  },

  async updateOperation(
    ownerId: string,
    compteId: string,
    opId: string,
    data: Partial<{ type: 'versement' | 'retrait'; montant: number; date: string; description: string }>
  ) {
    const res = await api.put(`/api/epargne/${ownerId}/comptes/${compteId}/operations/${opId}`, data);
    return res.data as { operation: EpargneOperation; owner: EpargneOwner };
  },

  async deleteOperation(ownerId: string, compteId: string, opId: string) {
    const res = await api.delete(`/api/epargne/${ownerId}/comptes/${compteId}/operations/${opId}`);
    return res.data as { owner: EpargneOwner };
  },
};

/** Conversion Ariary -> Franc malgache (1 Ar = 5 Fmg) */
export const arToFmg = (ar: number) => (Number(ar) || 0) * 5;

export const formatAr = (value: number) =>
  `${new Intl.NumberFormat('fr-FR').format(Math.round(Number(value) || 0))} Ar`;

export const formatFmg = (valueAr: number) =>
  `${new Intl.NumberFormat('fr-FR').format(Math.round(arToFmg(valueAr)))} Fmg`;

export default epargneApi;
