import api from './api';

export interface BusySlot { start: string; end: string; source: 'commande' | 'rdv' | 'tache'; label?: string; }
export interface FreeSlot { start: string; end: string; }

const availabilityApi = {
  getSlots: (date: string, excludeCommandeId?: string) =>
    api.get<{ busy: BusySlot[]; freeSlots: FreeSlot[] }>(
      `/api/availability/slots?date=${encodeURIComponent(date)}${excludeCommandeId ? `&excludeCommandeId=${encodeURIComponent(excludeCommandeId)}` : ''}`
    ),
  check: (date: string, heureDebut: string, heureFin: string, excludeCommandeId?: string) =>
    api.get<{ available: boolean; conflicts: BusySlot[] }>(
      `/api/availability/check?date=${encodeURIComponent(date)}&heureDebut=${encodeURIComponent(heureDebut)}&heureFin=${encodeURIComponent(heureFin)}${excludeCommandeId ? `&excludeCommandeId=${encodeURIComponent(excludeCommandeId)}` : ''}`
    ),
};

export default availabilityApi;
