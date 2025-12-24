import api from './api';

export interface ObjectifData {
  objectif: number;
  totalVentesMois: number;
  mois: number;
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
  }
};

export default objectifApi;
