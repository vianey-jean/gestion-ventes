// Service API pour les nouveaux achats et dépenses
import api from './api';
import { NouvelleAchat, NouvelleAchatFormData, DepenseFormData, MonthlyStats, YearlyStats } from '@/types/comptabilite';
import { AxiosResponse } from 'axios';

export const nouvelleAchatApiService = {
  // Récupérer tous les achats
  async getAll(): Promise<NouvelleAchat[]> {
    console.log('📦 Fetching all achats from API...');
    const response: AxiosResponse<NouvelleAchat[]> = await api.get('/api/nouvelle-achat');
    console.log(`✅ Retrieved ${response.data.length} achats from API`);
    return response.data;
  },

  // Récupérer les achats par mois et année
  async getByMonthYear(year: number, month: number): Promise<NouvelleAchat[]> {
    console.log(`📦 Fetching achats for ${month}/${year}...`);
    const response: AxiosResponse<NouvelleAchat[]> = await api.get(`/api/nouvelle-achat/monthly/${year}/${month}`);
    console.log(`✅ Retrieved ${response.data.length} achats for ${month}/${year}`);
    return response.data;
  },

  // Récupérer les achats par année
  async getByYear(year: number): Promise<NouvelleAchat[]> {
    console.log(`📦 Fetching achats for year ${year}...`);
    const response: AxiosResponse<NouvelleAchat[]> = await api.get(`/api/nouvelle-achat/yearly/${year}`);
    console.log(`✅ Retrieved ${response.data.length} achats for year ${year}`);
    return response.data;
  },

  // Récupérer les statistiques mensuelles
  async getMonthlyStats(year: number, month: number): Promise<MonthlyStats> {
    console.log(`📊 Fetching monthly stats for ${month}/${year}...`);
    const response: AxiosResponse<MonthlyStats> = await api.get(`/api/nouvelle-achat/stats/monthly/${year}/${month}`);
    return response.data;
  },

  // Récupérer les statistiques annuelles
  async getYearlyStats(year: number): Promise<YearlyStats> {
    console.log(`📊 Fetching yearly stats for ${year}...`);
    const response: AxiosResponse<YearlyStats> = await api.get(`/api/nouvelle-achat/stats/yearly/${year}`);
    return response.data;
  },

  // Récupérer un achat par ID
  async getById(id: string): Promise<NouvelleAchat> {
    const response: AxiosResponse<NouvelleAchat> = await api.get(`/api/nouvelle-achat/${id}`);
    return response.data;
  },

  // Créer un nouvel achat
  async create(data: NouvelleAchatFormData): Promise<NouvelleAchat> {
    console.log('📝 Creating new achat:', data);
    const response: AxiosResponse<NouvelleAchat> = await api.post('/api/nouvelle-achat', data);
    console.log('✅ Achat created successfully:', response.data);
    return response.data;
  },

  // Ajouter une dépense
  async addDepense(data: DepenseFormData): Promise<NouvelleAchat> {
    console.log('📝 Adding depense:', data);
    const response: AxiosResponse<NouvelleAchat> = await api.post('/api/nouvelle-achat/depense', data);
    console.log('✅ Depense added successfully:', response.data);
    return response.data;
  },

  // Mettre à jour un achat
  async update(id: string, data: Partial<NouvelleAchatFormData>): Promise<NouvelleAchat> {
    console.log('📝 Updating achat:', data);
    const response: AxiosResponse<NouvelleAchat> = await api.put(`/api/nouvelle-achat/${id}`, data);
    console.log('✅ Achat updated successfully:', response.data);
    return response.data;
  },

  // Supprimer un achat
  async delete(id: string): Promise<boolean> {
    console.log('🗑️ Deleting achat with ID:', id);
    await api.delete(`/api/nouvelle-achat/${id}`);
    console.log('✅ Achat deleted successfully');
    return true;
  },

  // Uploader un reçu (image/PDF) pour une dépense — renvoie l'URL relative
  async uploadReceipt(file: File): Promise<string> {
    const fd = new FormData();
    fd.append('receipt', file);
    const response = await api.post<{ receiptUrl: string }>(
      '/api/nouvelle-achat/depense/upload-receipt',
      fd,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    console.log('✅ Receipt uploaded:', response.data.receiptUrl);
    return response.data.receiptUrl;
  },
};

export default nouvelleAchatApiService;
