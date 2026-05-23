import api from './api';

export interface TacheRdvCatalog {
  id: string;
  nom: string;
  description?: string;
  createdAt?: string;
}

const tachesRdvApi = {
  getAll: () => api.get<TacheRdvCatalog[]>('/api/taches-rdv'),
  create: (data: { nom: string; description?: string }) =>
    api.post<TacheRdvCatalog>('/api/taches-rdv', data),
  update: (id: string, data: Partial<TacheRdvCatalog>) =>
    api.put<TacheRdvCatalog>(`/api/taches-rdv/${id}`, data),
  delete: (id: string) => api.delete(`/api/taches-rdv/${id}`),
};

export default tachesRdvApi;
