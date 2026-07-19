
# Cycle de vie synchronisé Commande / RDV / Tâche

Objectif : quand une commande de type **commande classique** (non-RDV créée à l'origine) passe à **"arrivé"**, ouvrir une modale de planification qui vérifie la disponibilité (commandes + RDV + tâches en même temps), puis crée automatiquement un RDV et une tâche liés. Ensuite, statut, visibilité et fin de vie sont synchronisés entre les trois entités.

## 1. Modale "Planifier l'arrivée" (frontend)

Nouveau composant `src/components/commandes/CommandeArriveePlanifDialog.tsx` :
- S'ouvre depuis `CommandesTable` quand l'utilisateur change le statut d'une commande à **"arrivé"**.
- Affiche toutes les infos de la commande (produit, client, quantité, prix).
- Champs modifiables : `date`, `heureDebut`, `heureFin`.
- Panneau "Créneaux disponibles ce jour-là" : liste les plages libres (croisement commandes ↔ RDV ↔ tâches).
- Bouton **Confirmer** actif seulement si le créneau est libre dans les 3 sources.

Nouveau endpoint `GET /api/availability/slots?date=YYYY-MM-DD` (dans `server/services/availabilityService.js`) qui retourne :
- `busy: [{ start, end, source }]` en fusionnant `commandes.json` (arrivé/planifié), `rdv-taches.json`, `tache.json`.
- `freeSlots: [{ start, end }]` sur une plage jour (08:00–20:00 par défaut).

## 2. Enregistrement synchronisé

À la confirmation de la modale (frontend `useCommandesLogic`) :
1. `PATCH /api/commandes/:id` → statut = `arrivé`, `date`, `heureDebut`, `heureFin`, `linkedRdvId`, `linkedTacheId`.
2. `POST /api/rdv-taches` → crée un RDV `statut='planifie'`, `sourceCommandeId=<id>`, `locked=true`.
3. `POST /api/tache` → crée une tâche `importance='pertinente'`, `statut='planifie'`, `sourceCommandeId=<id>`, `locked=true`.

Les 3 opérations sont enveloppées côté serveur dans un nouvel endpoint atomique `POST /api/commandes/:id/planifier-arrivee` (dans `commandeController.js`) pour éviter les états incohérents.

## 3. Visibilité / activation basée sur le temps

Nouveau hook `src/hooks/useCommandeVisibility.ts` qui, pour chaque commande liée à un RDV :
- Si `now` < `rdv.dateHeureDebut - 24h` → **visible + active**.
- Entre `-24h` et `-1h` → **visible mais désactivée** (grisée, boutons off).
- ≥ `-1h` et RDV non confirmé "maintenu" → **invisible**.
- RDV confirmé "maintenu" → **visible + active** peu importe l'heure.

Appliqué dans `CommandesTable.tsx` (classes `opacity-50 pointer-events-none` + filtrage) et symétriquement pour les tâches liées dans `TacheView.tsx`.

## 4. Fin de cycle : commande "validé"

Dans `useCommandesLogic.updateCommande`, si statut passe à **`validé`** ET `linkedRdvId` existe :
- `PATCH rdv-taches` → `statut='termine'`.
- `PATCH tache` → `completed=true`, `statut='termine'`.
- `POST /api/sales` → nouvelle vente avec produit, client, prix, date.
- `POST /api/fidelite` → incrément fidélité (produit + client).

## 5. Propagation modification / annulation / report

Dans `useCommandesLogic` :
- **Update** date/heure sur commande liée → PATCH RDV + tâche avec mêmes valeurs.
- **Delete** commande → delete RDV + tâche liés (via `/by-commande/:id`, déjà existant).
- **Statut `annulé`** → RDV `statut='annule'`, tâche supprimée.
- **Statut `reporté`** → réouvre la modale de planification pour choisir un nouveau créneau, puis propage.

## 6. Verrouillage côté RDV / Tâches

Déjà partiellement fait pour les RDV (`sourceCommandeId` + guard 403 dans `rdvTaches.js`). Étendre le même verrou aux tâches :
- Ajouter `sourceCommandeId` + `locked` dans `Tache.js`.
- Guards 403 dans `tacheController.update/delete` si `locked=true` (sauf appel interne `?fromCommande=1`).
- Badge cadenas dans `TacheView.tsx` pour ces tâches.

## Détails techniques

**Fichiers créés**
- `src/components/commandes/CommandeArriveePlanifDialog.tsx`
- `src/hooks/useCommandeVisibility.ts`
- `server/routes/availability.js` (endpoint slots) + montage dans `server.js`

**Fichiers modifiés**
- `server/services/availabilityService.js` : ajouter `getBusySlots(date)` et `getFreeSlots(date)`.
- `server/controllers/commandeController.js` : endpoint `planifier-arrivee`, propagation validé→sale+fidelite.
- `server/routes/commandes.js` : monter le nouveau endpoint.
- `server/models/Tache.js` : champs `sourceCommandeId`, `locked`, `statut`.
- `server/controllers/tacheController.js` : guards 403.
- `src/hooks/useCommandesLogic.ts` : brancher modale, propagation update/delete/statut.
- `src/components/commandes/CommandesTable.tsx` : trigger statut "arrivé" → modale, appliquer visibilité.
- `src/components/rdvtache/RdvTacheView.tsx` + `TacheView.tsx` : lecture `sourceCommandeId` pour affichage cadenas.

**Format de données ajouté**
```text
commande = {
  ...existing,
  statut: 'en_attente' | 'arrivé' | 'validé' | 'annulé' | 'reporté',
  linkedRdvId?: string,
  linkedTacheId?: string
}
rdv-tache = { ...existing, sourceCommandeId?, locked?, statut }
tache     = { ...existing, sourceCommandeId?, locked?, statut }
```

## Ordre d'implémentation

1. Backend : `Tache` (champs + guards), `availabilityService.getFreeSlots`, endpoint `planifier-arrivee`, endpoint `slots`, propagation validé.
2. Frontend : `CommandeArriveePlanifDialog`, branchement dans `CommandesTable` + `useCommandesLogic`.
3. Visibilité : hook `useCommandeVisibility` + intégration.
4. Propagation update/annule/reporte + verrous UI tâches.

Je ne toucherai pas au reste du code existant hors des fichiers listés ci-dessus.
