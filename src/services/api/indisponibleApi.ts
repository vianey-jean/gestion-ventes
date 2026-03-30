import api from '../../service/api';

export interface Indisponibilite {
  id: string;
  groupId?: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  journeeComplete: boolean;
  motif: string;
  recurrence?: 'once' | 'weekly';
  jourSemaine?: string;
  createdAt: string;
}

export interface DisponibiliteCheck {
  disponible: boolean;
  indisponibilites: Indisponibilite[];
}

/**
 * 🔥 Corrige le problème de décalage (jeudi au lieu de vendredi)
 * Force la date au format local YYYY-MM-DD sans conversion UTC
 */
const formatLocalDate = (date: string | Date): string => {
  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const indisponibleApi = {
  async getAll(): Promise<Indisponibilite[]> {
    const response = await api.get('/api/indisponible');
    return response.data;
  },

  async create(data: {
    date: string;
    heureDebut?: string;
    heureFin?: string;
    motif?: string;
    journeeComplete?: boolean;
    recurrence?: 'once' | 'weekly';
    nombreSemaines?: number;
  }): Promise<Indisponibilite[]> {

    const payload = {
      ...data,
      date: formatLocalDate(data.date), // ✅ correction ici
    };

    const response = await api.post('/api/indisponible', payload);

    return Array.isArray(response.data) ? response.data : [response.data];
  },

  async update(id: string, data: {
    date?: string;
    heureDebut?: string;
    heureFin?: string;
    motif?: string;
    journeeComplete?: boolean;
    selectedDates?: string[];
  }): Promise<Indisponibilite | Indisponibilite[]> {

    const payload = {
      ...data,
      date: data.date ? formatLocalDate(data.date) : undefined,
      selectedDates: data.selectedDates
        ? data.selectedDates.map(d => formatLocalDate(d))
        : undefined,
    };

    const response = await api.put(`/api/indisponible/${id}`, payload);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/indisponible/${id}`);
  },

  async deleteGroup(groupId: string): Promise<void> {
    await api.delete(`/api/indisponible/group/${groupId}`);
  },

  async checkDisponibilite(
    date: string,
    heureDebut?: string,
    heureFin?: string
  ): Promise<DisponibiliteCheck> {

    const payload = {
      date: formatLocalDate(date), // ✅ correction ici aussi
      heureDebut,
      heureFin
    };

    const response = await api.post('/api/indisponible/check', payload);
    return response.data;
  }
};

export default indisponibleApi;