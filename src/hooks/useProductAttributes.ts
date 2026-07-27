/**
 * useProductAttributes — Charge et met en cache les valeurs d'un type d'attribut.
 * Le `kind` passé peut être :
 *   - un id de kind (`k_xxx`) provenant de useAttributeKinds
 *   - une clé legacy ('modele' | 'taille' | 'couleur' | 'devant' | 'autres')
 *     résolue vers le kind correspondant via son champ `legacy`.
 * Tout passe désormais par l'API dynamique `/api/attribut-kinds`.
 */
import { useCallback, useEffect, useState } from 'react';
import { attributKindsApi, AttributeValue, AttributeKindDef } from '@/services/api/attributKindsApi';

const VALUES_EVENT = 'attribut-values-changed';
const KINDS_EVENT = 'attribut-kinds-changed';

export function notifyValuesChanged(kindKey?: string) {
  try { window.dispatchEvent(new CustomEvent(VALUES_EVENT, { detail: { kindKey } })); } catch { /* noop */ }
}

async function resolveKindId(key: string): Promise<string | null> {
  if (!key) return null;
  if (key.startsWith('k_')) return key;
  try {
    const list = await attributKindsApi.listKinds();
    const found = list.find((k: AttributeKindDef) => k.legacy === key || k.slug === key || k.id === key);
    return found ? found.id : null;
  } catch { return null; }
}

export function useProductAttributes(kind: string) {
  const [items, setItems] = useState<AttributeValue[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!kind) { setItems([]); return; }
    setLoading(true);
    try {
      const kid = await resolveKindId(kind);
      if (!kid) { setItems([]); return; }
      const data = await attributKindsApi.listValues(kid);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(`Error fetching attributes ${kind}:`, e);
      setItems([]);
    } finally { setLoading(false); }
  }, [kind]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const onChanged = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || !detail.kindKey || detail.kindKey === kind) fetchAll();
    };
    const onKinds = () => { fetchAll(); };
    window.addEventListener(VALUES_EVENT, onChanged);
    window.addEventListener(KINDS_EVENT, onKinds);
    return () => {
      window.removeEventListener(VALUES_EVENT, onChanged);
      window.removeEventListener(KINDS_EVENT, onKinds);
    };
  }, [fetchAll, kind]);

  const create = useCallback(async (nom: string, description?: string) => {
    const kid = await resolveKindId(kind);
    if (!kid) throw new Error('Type inconnu');
    const item = await attributKindsApi.addValue(kid, nom, description);
    notifyValuesChanged(kind);
    return item;
  }, [kind]);

  const update = useCallback(async (id: string, patch: Partial<AttributeValue>) => {
    const kid = await resolveKindId(kind);
    if (!kid) throw new Error('Type inconnu');
    const item = await attributKindsApi.updateValue(kid, id, patch);
    notifyValuesChanged(kind);
    return item;
  }, [kind]);

  const remove = useCallback(async (id: string) => {
    const kid = await resolveKindId(kind);
    if (!kid) throw new Error('Type inconnu');
    await attributKindsApi.deleteValue(kid, id);
    notifyValuesChanged(kind);
  }, [kind]);

  return { items, loading, refetch: fetchAll, create, update, remove };
}

export default useProductAttributes;
