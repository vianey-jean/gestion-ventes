/**
 * rdvConfirmation.ts
 * Règles de confirmation des RDV (module RDV / Pointage).
 *
 * - Un RDV créé à MOINS de 24h de son heure de début est "auto-confirmé" :
 *   on ne demande pas de confirmation et on n'affiche pas le statut "Confirmé".
 * - Un RDV créé à PLUS de 24h à l'avance doit être confirmé dès qu'il entre
 *   dans la fenêtre des 24h avant son début.
 */
import { RdvTache } from '@/services/api/rdvTachesApi';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Datetime de début du RDV (local) */
export const rdvStartDate = (r: RdvTache): Date | null => {
  if (!r?.date) return null;
  const time = r.heureDebut && /^\d{1,2}:\d{2}/.test(r.heureDebut) ? r.heureDebut : '00:00';
  const d = new Date(`${r.date}T${time.length === 4 ? `0${time}` : time}:00`);
  return isNaN(d.getTime()) ? null : d;
};

/** RDV créé à moins de 24h de son début → pas de confirmation nécessaire */
export const isAutoConfirmed = (r: RdvTache): boolean => {
  const start = rdvStartDate(r);
  if (!start) return false;
  const created = r.createdAt ? new Date(r.createdAt) : null;
  if (!created || isNaN(created.getTime())) return false;
  return start.getTime() - created.getTime() < DAY_MS;
};

/**
 * Le RDV doit-il être confirmé maintenant ?
 * (créé > 24h à l'avance, encore ni confirmé/annulé/terminé, et début dans < 24h)
 */
export const needsConfirmation = (r: RdvTache, now: Date = new Date()): boolean => {
  if (!r) return false;
  if (r.statut === 'confirme' || r.statut === 'annule' || r.statut === 'termine') return false;
  if (isAutoConfirmed(r)) return false;
  const start = rdvStartDate(r);
  if (!start) return false;
  const delta = start.getTime() - now.getTime();
  // fenêtre : jusqu'à 24h avant, et tant que le RDV n'est pas dépassé de plus de 12h
  return delta <= DAY_MS && delta > -12 * 60 * 60 * 1000;
};

/** Liste des RDV en attente de confirmation */
export const getRdvsToConfirm = (rdvs: RdvTache[], now: Date = new Date()): RdvTache[] =>
  (Array.isArray(rdvs) ? rdvs : []).filter(r => needsConfirmation(r, now));

/** Statuts sélectionnables pour un RDV donné */
export const allowedStatuts = (r: RdvTache, now: Date = new Date()): Array<RdvTache['statut']> => {
  const base: Array<RdvTache['statut']> = ['annule', 'termine'];
  if (needsConfirmation(r, now)) return ['confirme', ...base];
  // RDV planifié hors fenêtre 24h et non auto-confirmé : la confirmation reste possible
  if (!isAutoConfirmed(r) && (r.statut === 'planifie' || r.statut === 'reporte')) {
    return ['confirme', ...base];
  }
  return base;
};
