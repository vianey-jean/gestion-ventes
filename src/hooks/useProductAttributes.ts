/**
 * useProductAttributes — Charge et met en cache les attributs produits
 * (modele/taille/couleur/devant). Fournit CRUD et refetch.
 */
import { useCallback, useEffect, useState } from 'react';
import { productAttributesApi, AttributeKind, ProductAttribute } from '@/services/api/productAttributesApi';

export function useProductAttributes(kind: AttributeKind) {
  const [items, setItems] = useState<ProductAttribute[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productAttributesApi.getAll(kind);
      setItems(data);
    } catch (e) {
      console.error(`Error fetching ${kind}:`, e);
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = useCallback(async (nom: string, description?: string) => {
    const item = await productAttributesApi.create(kind, nom, description);
    await fetchAll();
    return item;
  }, [kind, fetchAll]);

  const remove = useCallback(async (id: string) => {
    await productAttributesApi.delete(kind, id);
    await fetchAll();
  }, [kind, fetchAll]);

  return { items, loading, refetch: fetchAll, create, remove };
}

export default useProductAttributes;