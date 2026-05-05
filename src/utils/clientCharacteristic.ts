/**
 * Caractéristique client calculée à partir des bases clients/sales/commandes.
 */
import type { Sale } from '@/types/sale';
import type { Commande } from '@/types/commande';

export type ClientCaracteristiqueType =
  | 'nouveau'
  | 'deja'
  | 'fidele'
  | 'annule';

export interface ClientCaracteristique {
  type: ClientCaracteristiqueType;
  label: string;
  /** Tailwind classes pour le badge à côté du label */
  badgeClass: string;
  /** Tailwind classes pour le marquee dans le tableau */
  marqueeClass: string;
}

interface ClientLite { id?: string; nom: string }

const CHAR_NEW: ClientCaracteristique = {
  type: 'nouveau',
  label: 'Nouveau client',
  badgeClass:
    'bg-gradient-to-r from-yellow-400 to-amber-300 text-yellow-900 border border-yellow-500/60 shadow-[0_0_15px_rgba(250,204,21,0.6)]',
  marqueeClass: 'text-yellow-700 dark:text-yellow-300 font-semibold',
};
const CHAR_DEJA: ClientCaracteristique = {
  type: 'deja',
  label: 'Déjà client',
  badgeClass:
    'bg-gradient-to-r from-orange-500 to-orange-400 text-white border border-orange-600/60 shadow-[0_0_15px_rgba(249,115,22,0.5)]',
  marqueeClass: 'text-orange-600 dark:text-orange-400 font-semibold',
};
const CHAR_FIDELE: ClientCaracteristique = {
  type: 'fidele',
  label: 'Client fidèle',
  badgeClass:
    'bg-gradient-to-r from-emerald-500 to-green-500 text-white border border-emerald-600/60 shadow-[0_0_15px_rgba(16,185,129,0.6)]',
  marqueeClass: 'text-emerald-600 dark:text-emerald-400 font-semibold',
};
const CHAR_ANNULE: ClientCaracteristique = {
  type: 'annule',
  label: 'Attention, Client qui annule',
  badgeClass:
    'bg-red-600 text-white border border-red-700 shadow-[0_0_15px_rgba(220,38,38,0.7)] animate-pulse',
  marqueeClass:
    'text-red-600 dark:text-red-400 font-bold animate-pulse',
};

const norm = (s: string) => (s || '').trim().toLowerCase();

export const computeClientCaracteristique = (
  clientNom: string,
  clients: ClientLite[],
  sales: Sale[],
  commandes: Commande[]
): ClientCaracteristique | null => {
  const name = norm(clientNom);
  if (!name) return null;

  const exists = clients.some((c) => norm(c.nom) === name);
  if (!exists) return CHAR_NEW;

  // Compter les produits achetés par ce client
  const totalProductsBought = sales
    .filter((s) => norm(s.clientName || '') === name)
    .reduce((acc, s) => acc + (s.products?.reduce((a, p: any) => a + (Number(p.quantitySold ?? p.quantity ?? 0) || 0), 0) || 0), 0);

  if (totalProductsBought > 2) return CHAR_FIDELE;

  const clientCommandes = commandes.filter((c) => norm(c.clientNom) === name);
  const hasValide = clientCommandes.some((c) => c.statut === 'valide');
  const hasAnnule = clientCommandes.some((c) => c.statut === 'annule');

  if (totalProductsBought === 0 && hasAnnule && !hasValide) return CHAR_ANNULE;

  return CHAR_DEJA;
};

export const CARACTERISTIQUES = {
  CHAR_NEW,
  CHAR_DEJA,
  CHAR_FIDELE,
  CHAR_ANNULE,
};

/** Retrouver les classes d'affichage à partir d'un libellé persisté. */
export const getCaracteristiqueByLabel = (label?: string): ClientCaracteristique | null => {
  if (!label) return null;
  switch (label) {
    case CHAR_NEW.label: return CHAR_NEW;
    case CHAR_DEJA.label: return CHAR_DEJA;
    case CHAR_FIDELE.label: return CHAR_FIDELE;
    case CHAR_ANNULE.label: return CHAR_ANNULE;
    default: return null;
  }
};
