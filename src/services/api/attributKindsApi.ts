/**
 * attributKindsApi.ts — API pour la gestion dynamique des types d'attributs produits
 * (kinds) et de leurs valeurs. Chaque kind possède son propre fichier
 * `<slug>_attribut.json` côté serveur.
 */
import api from './api';

export interface AttributeKindDef {
  id: string;
  nom: string;
  slug: string;
  fileName: string;
  protected?: boolean;
  legacy?: string;
  color?: string; // gradient tailwind "from-xxx to-yyy"
  dateCreation?: string;
}

export interface AttributeValue {
  id: string;
  nom: string;
  description?: string;
  dateCreation?: string;
}

export const attributKindsApi = {
  async listKinds(): Promise<AttributeKindDef[]> {
    const res = await api.get('/api/attribut-kinds');
    return Array.isArray(res.data) ? res.data : [];
  },
  async createKind(nom: string, color?: string): Promise<AttributeKindDef> {
    const res = await api.post('/api/attribut-kinds', { nom, color });
    return res.data;
  },
  async renameKind(id: string, nom: string): Promise<AttributeKindDef> {
    const res = await api.put(`/api/attribut-kinds/${id}`, { nom });
    return res.data;
  },
  async updateKind(id: string, patch: Partial<AttributeKindDef>): Promise<AttributeKindDef> {
    const res = await api.put(`/api/attribut-kinds/${id}`, patch);
    return res.data;
  },
  async deleteKind(id: string): Promise<boolean> {
    await api.delete(`/api/attribut-kinds/${id}`);
    return true;
  },
  async listValues(kindId: string): Promise<AttributeValue[]> {
    const res = await api.get(`/api/attribut-kinds/${kindId}/values`);
    return Array.isArray(res.data) ? res.data : [];
  },
  async addValue(kindId: string, nom: string, description?: string): Promise<AttributeValue> {
    const res = await api.post(`/api/attribut-kinds/${kindId}/values`, { nom, description });
    return res.data;
  },
  async updateValue(kindId: string, vid: string, patch: Partial<AttributeValue>): Promise<AttributeValue> {
    const res = await api.put(`/api/attribut-kinds/${kindId}/values/${vid}`, patch);
    return res.data;
  },
  async deleteValue(kindId: string, vid: string): Promise<boolean> {
    await api.delete(`/api/attribut-kinds/${kindId}/values/${vid}`);
    return true;
  },
};

export default attributKindsApi;
