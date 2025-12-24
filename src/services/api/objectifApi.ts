import api from './api';

export interface ObjectifData {
  objectif: number;
  totalVentesMois: number;
  mois: number;
  annee: number;
}

export interface MonthlyData {
  mois: number;
  annee: number;
  totalVentesMois: number;
  objectif: number;
  pourcentage: number;
}

export interface ObjectifHistorique {
  currentData: ObjectifData;
  historique: MonthlyData[];
  annee: number;
}

export const objectifApi = {
  get: async (): Promise<ObjectifData> => {
    const response = await api.get('/objectif');
    return response.data;
  },
  
  updateObjectif: async (objectif: number): Promise<ObjectifData> => {
    const response = await api.put('/objectif/objectif', { objectif });
    return response.data;
  },
  
  recalculate: async (): Promise<ObjectifData> => {
    const response = await api.post('/objectif/recalculate');
    return response.data;
  },

  getHistorique: async (): Promise<ObjectifHistorique> => {
    const response = await api.get('/objectif/historique');
    return response.data;
  },

  saveMonthlyData: async (): Promise<ObjectifHistorique> => {
    const response = await api.post('/objectif/save-monthly');
    return response.data;
  }
};

export default objectifApi;
