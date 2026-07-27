/**
 * useAttributeKinds — Hook central pour la gestion des TYPES d'attributs produits.
 * Fournit CRUD sur les kinds + événement de synchronisation entre composants
 * (ProductAttributesToolbar, ProductAttributeManagerButton, ClassificationSearchPopover,
 * ProductClassificationSelector) via un event bus `window`.
 */
import { useCallback, useEffect, useState } from 'react';
import { attributKindsApi, AttributeKindDef } from '@/services/api/attributKindsApi';

const EVENT_NAME = 'attribut-kinds-changed';

export function notifyKindsChanged() {
  try { window.dispatchEvent(new CustomEvent(EVENT_NAME)); } catch { /* noop */ }
}

export function useAttributeKinds() {
  const [kinds, setKinds] = useState<AttributeKindDef[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await attributKindsApi.listKinds();
      setKinds(data);
    } catch (e) {
      console.error('Error fetching attribute kinds:', e);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const onChanged = () => { fetchAll(); };
    window.addEventListener(EVENT_NAME, onChanged);
    return () => window.removeEventListener(EVENT_NAME, onChanged);
  }, [fetchAll]);

  const createKind = useCallback(async (nom: string, color?: string) => {
    const k = await attributKindsApi.createKind(nom, color);
    notifyKindsChanged();
    return k;
  }, []);

  const renameKind = useCallback(async (id: string, nom: string) => {
    const k = await attributKindsApi.renameKind(id, nom);
    notifyKindsChanged();
    return k;
  }, []);

  const updateKind = useCallback(async (id: string, patch: Partial<AttributeKindDef>) => {
    const k = await attributKindsApi.updateKind(id, patch);
    notifyKindsChanged();
    return k;
  }, []);

  const deleteKind = useCallback(async (id: string) => {
    await attributKindsApi.deleteKind(id);
    notifyKindsChanged();
  }, []);

  return { kinds, loading, refetch: fetchAll, createKind, renameKind, updateKind, deleteKind };
}

export default useAttributeKinds;
