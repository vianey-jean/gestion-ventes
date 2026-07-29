# ⚡ Synchronisation temps réel (SSE)

## Principe
Le serveur surveille les fichiers de `server/db` (`server/middleware/sync.js`, `patchDbIO.js`) et pousse un événement `data-changed` sur `GET /api/sync/events`. Aucun polling périodique n'est utilisé.

## Côté client
| Fichier | Rôle |
|---|---|
| `src/services/realtime/EventSourceManager.ts` | Connexion EventSource, reconnexion, `Last-Event-ID` |
| `src/services/realtime/DataCacheManager.ts` | Cache mémoire et invalidation ciblée |
| `src/services/realtime/RealtimeService.ts` | Orchestration, abonnements par type de donnée |
| `src/services/optimizedRealtimeService.ts` | Débit limité et regroupement des rafraîchissements |
| `src/hooks/use-sse.ts`, `use-realtime-sync.ts`, `useClientSync.ts` | Abonnement depuis les composants |
| `src/components/common/RealtimeStatus.tsx`, `RealtimeWrapper.tsx` | Indicateur d'état de connexion |

## Ajouter un fichier au temps réel
1. Créer `server/db/<fichier>.json`.
2. L'ajouter à la liste surveillée de `server/middleware/sync.js`.
3. S'abonner côté front via `useRealtimeSync` / `realtimeService` et recharger uniquement à réception de l'événement.

