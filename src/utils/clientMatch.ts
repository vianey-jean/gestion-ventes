/**
 * Utilitaires de détection de doublons clients.
 * Compare nom, téléphones et adresses avec la base existante.
 */

export interface ClientLike {
  id?: string;
  nom: string;
  phone?: string;
  phones?: string[];
  adresse?: string;
  addresses?: string[];
  ville?: string;
  villes?: string[];
  photo?: string;
}

export interface TypedClient {
  nom?: string;
  phones?: string[];
  addresses?: string[];
}

const norm = (s?: string) => (s || '').trim().toLowerCase();
const normPhone = (p?: string) => (p || '').replace(/\s+/g, '').replace(/[^\d+]/g, '');

const getPhones = (c: ClientLike) =>
  (c.phones && c.phones.length ? c.phones : c.phone ? [c.phone] : []).map(normPhone).filter(Boolean);

const getAddresses = (c: ClientLike) =>
  (c.addresses && c.addresses.length ? c.addresses : c.adresse ? [c.adresse] : []).map(norm).filter(Boolean);

/** Type de champ qui a matché (utile pour expliquer dans la modale) */
export type MatchField = 'nom' | 'phone' | 'address';

export interface ClientMatch {
  client: ClientLike;
  fields: MatchField[];
}

export function findMatchingClients(
  clients: ClientLike[],
  typed: TypedClient
): ClientMatch[] {
  const tNom = norm(typed.nom);
  const tPhones = (typed.phones || []).map(normPhone).filter(Boolean);
  const tAddrs = (typed.addresses || []).map(norm).filter(Boolean);

  const matches: ClientMatch[] = [];
  for (const c of clients) {
    const fields: MatchField[] = [];
    if (tNom && norm(c.nom) === tNom) fields.push('nom');
    const cPhones = getPhones(c);
    if (tPhones.some((p) => cPhones.includes(p))) fields.push('phone');
    const cAddrs = getAddresses(c);
    if (tAddrs.some((a) => cAddrs.includes(a))) fields.push('address');
    if (fields.length > 0) matches.push({ client: c, fields });
  }
  return matches;
}

/**
 * Renvoie true si au moins un champ saisi diffère du client (=> autorisé à créer un nouveau client).
 */
export function clientHasDifference(client: ClientLike, typed: TypedClient): boolean {
  const tNom = norm(typed.nom);
  const tPhones = (typed.phones || []).map(normPhone).filter(Boolean);
  const tAddrs = (typed.addresses || []).map(norm).filter(Boolean);

  if (tNom && norm(client.nom) !== tNom) return true;
  const cPhones = getPhones(client);
  if (tPhones.some((p) => !cPhones.includes(p))) return true;
  const cAddrs = getAddresses(client);
  if (tAddrs.some((a) => !cAddrs.includes(a))) return true;
  return false;
}

export function canCreateNewDespiteMatches(
  matches: ClientMatch[],
  typed: TypedClient
): boolean {
  if (matches.length === 0) return true;
  return matches.every((m) => clientHasDifference(m.client, typed));
}

export function matchSignature(typed: TypedClient): string {
  return [
    norm(typed.nom),
    (typed.phones || []).map(normPhone).sort().join('|'),
    (typed.addresses || []).map(norm).sort().join('|'),
  ].join('::');
}
