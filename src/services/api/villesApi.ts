// Service API pour les villes (clients + livraison)
import api from './api';

export interface LivraisonVille { ville: string; fee: number }

export const clientsVillesApi = {
  async getAll(): Promise<string[]> {
    const res = await api.get('/api/clients-villes');
    return Array.isArray(res.data) ? res.data : [];
  },
  async add(ville: string): Promise<string[]> {
    const res = await api.post('/api/clients-villes', { ville });
    return res.data?.villes || [];
  },
  async update(original: string, ville: string): Promise<string[]> {
    const res = await api.put(`/api/clients-villes/${encodeURIComponent(original)}`, { ville });
    return res.data?.villes || [];
  },
  async remove(ville: string): Promise<string[]> {
    const res = await api.delete(`/api/clients-villes/${encodeURIComponent(ville)}`);
    return res.data?.villes || [];
  },
};

export const livraisonVilleApi = {
  async getAll(): Promise<LivraisonVille[]> {
    const res = await api.get('/api/livraison-villes');
    return Array.isArray(res.data) ? res.data : [];
  },
  async add(ville: string, fee: number): Promise<LivraisonVille[]> {
    const res = await api.post('/api/livraison-villes', { ville, fee });
    return res.data?.villes || [];
  },
  async update(originalVille: string, ville: string, fee: number): Promise<LivraisonVille[]> {
    const res = await api.put(`/api/livraison-villes/${encodeURIComponent(originalVille)}`, { ville, fee });
    return res.data?.villes || [];
  },
  async remove(ville: string): Promise<LivraisonVille[]> {
    const res = await api.delete(`/api/livraison-villes/${encodeURIComponent(ville)}`);
    return res.data?.villes || [];
  },
};
