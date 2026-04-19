// Service API pour les ventes
import api from './api';
import { Sale } from '@/types/sale';
import { AxiosResponse } from 'axios';

export const saleApiService = {
  async getAll(): Promise<Sale[]> {
    const response: AxiosResponse<Sale[]> = await api.get('/api/sales');
    return Array.isArray(response.data) ? response.data : [];
  },

  async getByMonth(month: number, year: number): Promise<Sale[]> {
    const response: AxiosResponse<Sale[]> = await api.get(`/api/sales/by-month?month=${month}&year=${year}`);
    return Array.isArray(response.data) ? response.data : [];
  },

  async getById(id: string): Promise<Sale> {
    const response: AxiosResponse<Sale> = await api.get(`/api/sales/${id}`);
    return response.data;
  },

  async create(data: Omit<Sale, 'id'>): Promise<Sale> {
    const response: AxiosResponse<Sale> = await api.post('/api/sales', data);
    // Notifie les composants (ex: ObjectifStatsModal) qu'il faut recalculer les bénéfices annuels
    try { window.dispatchEvent(new CustomEvent('sales-updated', { detail: { type: 'create' } })); } catch {}
    return response.data;
  },

  async update(id: string, data: Partial<Sale>): Promise<Sale> {
    const response: AxiosResponse<Sale> = await api.put(`/api/sales/${id}`, data);
    try { window.dispatchEvent(new CustomEvent('sales-updated', { detail: { type: 'update', id } })); } catch {}
    return response.data;
  },

  async delete(id: string): Promise<boolean> {
    await api.delete(`/api/sales/${id}`);
    try { window.dispatchEvent(new CustomEvent('sales-updated', { detail: { type: 'delete', id } })); } catch {}
    return true;
  },

  async exportMonth(month: number, year: number): Promise<boolean> {
    await api.post('/api/sales/export-month', { month, year });
    return true;
  },
};

export default saleApiService;
