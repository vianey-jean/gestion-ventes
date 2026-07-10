/**
 * productAttributesApi.ts — API générique pour attributs produits
 * (modèle / taille / couleur / devant). Un seul service, param `kind`.
 */
import api from './api';

export type AttributeKind = 'modele' | 'taille' | 'couleur' | 'devant';

export interface ProductAttribute {
  id: string;
  nom: string;
  description?: string;
  dateCreation?: string;
}

const ENDPOINTS: Record<AttributeKind, string> = {
  modele: '/api/modele-produits',
  taille: '/api/taille-produits',
  couleur: '/api/couleur-produits',
  devant: '/api/devant-produits',
};

export const productAttributesApi = {
  async getAll(kind: AttributeKind): Promise<ProductAttribute[]> {
    const res = await api.get(ENDPOINTS[kind]);
    return Array.isArray(res.data) ? res.data : [];
  },
  async create(kind: AttributeKind, nom: string, description?: string): Promise<ProductAttribute> {
    const res = await api.post(ENDPOINTS[kind], { nom, description });
    return res.data;
  },
  async update(kind: AttributeKind, id: string, patch: Partial<ProductAttribute>): Promise<ProductAttribute> {
    const res = await api.put(`${ENDPOINTS[kind]}/${id}`, patch);
    return res.data;
  },
  async delete(kind: AttributeKind, id: string): Promise<boolean> {
    await api.delete(`${ENDPOINTS[kind]}/${id}`);
    return true;
  },
};

export default productAttributesApi;