# Synchronisation Temps Réel (SSE) — Documentation Complète

## Vue d'ensemble

Le projet utilise un système de **Server-Sent Events (SSE)** pour pousser
les changements de données du serveur vers tous les clients connectés
**sans aucun polling périodique**. Dès qu'un fichier JSON change sur le
disque, le serveur notifie immédiatement tous les clients SSE actifs.

## Architecture

```text
┌────────────────────┐    fs.watch     ┌──────────────────┐
│  server/db/*.json  │ ───────────────▶│   SyncManager    │
└────────────────────┘                 │ (sync.js)        │
                                       └────────┬─────────┘
                                                │ SSE push
                                                ▼
┌──────────────────────────────────────────────────────────┐
│  GET /api/sync/events  (server/routes/sync.js)           │
└────────┬─────────────────────────────────────────────────┘
         │ EventSource
         ▼
┌──────────────────────────────────────────────────────────┐
│  EventSourceManager → RealtimeService → DataCacheManager │
└────────┬─────────────────────────────────────────────────┘
         │ addDataListener()
         ▼
┌──────────────────────────────────────────────────────────┐
│  RealtimeWrapper, PointagePage, LiveChat, etc.           │
└──────────────────────────────────────────────────────────┘
```

## Logique du chronomètre 72 h (sleep / awake)

Implémenté dans `server/middleware/sync.js` :

- `idleTimeoutMs = 72 * 60 * 60 * 1000` (72 heures).
- À chaque changement de fichier de données, `registerDataChange()` est
  appelé, qui appelle `wakeUp('data-change')`.
- `wakeUp()` :
  1. Met `isSleeping = false`.
  2. Met `lastDataReceivedAt = new Date()`.
  3. Appelle `_startIdleTimer()` qui **annule l'ancien timer** et
     **redémarre un nouveau compte à rebours de 72 h**.
- Si **aucune donnée n'arrive pendant 72 h consécutives**,
  `_enterSleep()` est appelé et émet l'événement SSE `server-sleep`.
- Une nouvelle donnée OU une nouvelle connexion client réveille le
  serveur (`server-awake`) et **réinitialise le chrono à 0**.

> Exemple : donnée reçue à T0 → chrono = 72 h. Nouvelle donnée à T0+24 h
> → chrono **remis à 0**, redémarre 72 h depuis T0+24 h.

## Fichiers surveillés (push SSE)

`server/middleware/sync.js` surveille via `fs.watch` :

```
products.json, sales.json, pretfamilles.json, pretproduits.json,
depensedumois.json, depensefixe.json, nouvelle_achat.json, clients.json,
messages.json, rdv.json, rdvNotifications.json, remboursement.json,
pointage.json, notes.json, tache.json, travailleur.json, entreprise.json
```

Tous les autres `.json` (sauf `settings.json`) sont surveillés
uniquement pour la logique d'auto-backup, pas pour le push de données.

## Mapping côté client

`src/services/realtime/RealtimeService.ts` mappe le `type` SSE vers
les clés de `SyncData` :

| Type SSE        | Clé `SyncData`  |
|-----------------|-----------------|
| products        | products        |
| sales           | sales (mois en cours uniquement) |
| pretfamilles    | pretFamilles    |
| pretproduits    | pretProduits    |
| depensedumois   | depenses        |
| nouvelle_achat  | achats          |
| clients         | clients         |
| messages        | messages        |
| pointage        | pointages       |
| notes           | notes           |
| tache           | taches          |
| travailleur     | travailleurs    |
| entreprise      | entreprises     |

## Composants principaux

### Backend
- `server/middleware/sync.js` — `SyncManager`, watchers, sleep/awake.
- `server/routes/sync.js` — endpoints `/api/sync/events`,
  `/api/sync/force-sync`, `/api/sync/status`, `/api/sync/test`.

### Frontend
- `src/services/realtime/RealtimeService.ts` — orchestrateur.
- `src/services/realtime/EventSourceManager.ts` — gestion EventSource +
  reconnexion automatique.
- `src/services/realtime/DataCacheManager.ts` — déduplication des
  payloads identiques.
- `src/services/realtime/types.ts` — types `SyncData`, `SyncEvent`.
- `src/services/realtimeService.ts` — réexport pour rétrocompatibilité.
- `src/components/common/RealtimeWrapper.tsx` — wrapper qui injecte la
  sync dans toutes les pages authentifiées via `Layout`.
- `src/hooks/use-realtime-sync.ts` — escape-hatch `forceSync` + sync
  unique au retour de visibilité de l'onglet (PAS de polling).
- `src/hooks/use-sse.ts` — hook bas niveau réutilisable.

## Pages branchées au SSE

- **Dashboard, Ventes, Comptabilité, Clients, RDV, Messages** — via
  `RealtimeWrapper` dans `Layout`.
- **PointagePage** (`src/pages/PointagePage.tsx`) — souscrit
  directement à `realtimeService.addDataListener` pour
  `pointages`, `entreprises`, `travailleurs`. Les onglets **Notes** et
  **Tâches** profitent du même flux (les fichiers `notes.json` /
  `tache.json` sont surveillés et pushés).
- **LiveChatAdmin / LiveChatVisitor** — utilisent leur propre canal SSE
  `/api/messagerie/events` pour les messages temps réel.

## Garanties

1. **Pas de polling** côté frontend. Les données ne sont rafraîchies
   qu'à la réception d'un événement SSE.
2. **Push instantané** : `fs.watch` + debounce 100 ms + comparaison de
   contenu (JSON.stringify) évite les notifications inutiles.
3. **Heartbeat 30 s** pour maintenir la connexion EventSource ouverte
   à travers proxies / load balancers.
4. **Reconnexion automatique** côté `EventSourceManager` en cas de
   coupure réseau.
5. **Chrono 72 h auto-reset** : tant que des données arrivent
   régulièrement, le serveur reste éveillé indéfiniment.
