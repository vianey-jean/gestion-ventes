/**
 * =============================================================================
 * rdvConfirmationLock - Verrouillage des commandes/tâches liées à un RDV
 * =============================================================================
 *
 * Règle métier (mise à jour) :
 *  - Entre 24h et 1h avant l'heure du RDV : si le RDV n'a PAS été confirmé
 *    comme "maintenu", la commande et la tâche liées deviennent VERROUILLÉES
 *    ('locked') : toujours VISIBLES dans la liste mais non modifiables, non
 *    supprimables, non cliquables (view/edit/delete désactivés).
 *  - À partir de 59 minutes (≤ 1h) avant l'heure du RDV sans confirmation :
 *    la commande / tâche sont MASQUÉES ('hidden') et automatiquement passées
 *    à l'état "annulé" côté serveur (non supprimé, reportable).
 *  - Les états 'maintenu', 'annule' ou 'reporter' ne verrouillent rien.
 */
import type { ConfirmationRdvEntry } from '@/services/api/confirmationRdvApi';
import commandeApi from '@/services/api/commandeApi';
import tacheApi from '@/services/api/tacheApi';

export type RdvLockState = 'normal' | 'locked' | 'hidden';

interface CommandeLike {
  id: string;
  dateEcheance?: string;
  horaire?: string;
  type?: string;
  statut?: string;
}

const ONE_HOUR = 60 * 60 * 1000;
const TWENTY_FOUR_HOURS = 24 * ONE_HOUR;

export function computeLockStateForCommande(
  commande: CommandeLike,
  confirmationEntries: ConfirmationRdvEntry[]
): RdvLockState {
  if (!commande?.id || !commande.dateEcheance || !commande.horaire) return 'normal';
  const entry = confirmationEntries.find(e => e.commandeId === commande.id);
  if (!entry) return 'normal';
  if (entry.confirmationStatut !== 'en_attente') return 'normal';

  const hDebut = (commande.horaire || '').split('-')[0]?.trim() || '00:00';
  const start = new Date(`${commande.dateEcheance}T${hDebut}:00`);
  if (isNaN(start.getTime())) return 'normal';

  const diff = start.getTime() - Date.now();
  // ≤ 1h avant début (jusqu'à après début) : masqué + auto-annulé
  if (diff <= ONE_HOUR) return 'hidden';
  // Entre 24h et 1h avant : visible mais verrouillé
  if (diff <= TWENTY_FOUR_HOURS) return 'locked';
  return 'normal';
}

export function computeLockStateForTache(
  tache: { commandeId?: string; date?: string; heureDebut?: string },
  confirmationEntries: ConfirmationRdvEntry[]
): RdvLockState {
  if (!tache?.commandeId) return 'normal';
  const entry = confirmationEntries.find(e => e.commandeId === tache.commandeId);
  if (!entry) return 'normal';
  if (entry.confirmationStatut !== 'en_attente') return 'normal';

  const date = tache.date || entry.date;
  const hDebut = tache.heureDebut || entry.heureDebut || '00:00';
  const start = new Date(`${date}T${hDebut}:00`);
  if (isNaN(start.getTime())) return 'normal';

  const diff = start.getTime() - Date.now();
  if (diff <= ONE_HOUR) return 'hidden';
  if (diff <= TWENTY_FOUR_HOURS) return 'locked';
  return 'normal';
}

/** Mémorise les ids déjà auto-annulés côté serveur pour éviter les doublons. */
const cancelledCommandeIds = new Set<string>();
const cancelledTacheIds = new Set<string>();

export async function autoCancelCommandeIfNeeded(
  commande: CommandeLike,
  state: RdvLockState
): Promise<void> {
  // Auto-annule dès que la commande est masquée (≤ 1h avant début, non confirmée)
  if (state !== 'hidden') return;
  if (!commande?.id) return;
  if (commande.statut === 'annule' || commande.statut === 'valide') return;
  if (cancelledCommandeIds.has(commande.id)) return;
  cancelledCommandeIds.add(commande.id);
  try {
    await commandeApi.update(commande.id, { statut: 'annule' });
  } catch {
    cancelledCommandeIds.delete(commande.id);
  }
}

export async function autoCancelTacheIfNeeded(
  tache: { id: string; completed?: boolean },
  state: RdvLockState
): Promise<void> {
  if (state !== 'hidden') return;
  if (!tache?.id) return;
  if (tache.completed) return;
  if (cancelledTacheIds.has(tache.id)) return;
  cancelledTacheIds.add(tache.id);
  try {
    await tacheApi.update(tache.id, { completed: true });
  } catch {
    cancelledTacheIds.delete(tache.id);
  }
}
