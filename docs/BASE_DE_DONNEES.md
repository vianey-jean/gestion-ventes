# 💾 Base de données (fichiers JSON)

Stockage plat dans `server/db`. Chaque fichier est manipulé exclusivement par un modèle de `server/models`, avec écriture atomique et diffusion SSE après modification.

| Fichier | Entrées | Champs principaux (échantillon) |
|---|---|---|
| `admin-messages.json` | 0 | — |
| `attribut_kinds.json` | 5 | `id`, `nom`, `slug`, `fileName`, `protected`, `legacy`, `color`, `dateCreation` |
| `auto-injecter.json` | 1 | `autoInjecter` |
| `auto-sauvegarde.json` | 0 | — |
| `autresproduits.json` | 0 | — |
| `avance.json` | 0 | — |
| `benefice.json` | 0 | — |
| `clients-villes.json` | 13 | `0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11`, `12` |
| `clients.json` | 0 | — |
| `commandes.json` | 0 | — |
| `comment-share.json` | 0 | — |
| `compta.json` | 0 | — |
| `confirmation-rdv.json` | 0 | — |
| `couleurproduits.json` | 0 | — |
| `depensedumois.json` | 0 | — |
| `depensefixe.json` | 0 | — |
| `devantproduits.json` | 0 | — |
| `encryption.json` | 0 | — |
| `entreprise.json` | 0 | — |
| `fidelite.json` | 0 | — |
| `fournisseurs.json` | 0 | — |
| `group-chats.json` | 0 | — |
| `group-messages.json` | 0 | — |
| `historique-connexion.json` | 0 | — |
| `indisponible.json` | 0 | — |
| `lienIp.json` | 0 | — |
| `lienpartagecommente.json` | 0 | — |
| `listes-fidelite.json` | 5 | `id`, `label`, `min`, `max`, `order`, `grad` |
| `livraison-ville.json` | 14 | `ville`, `fee` |
| `maintenance.json` | 4 | `maintenant`, `activatedAt`, `activatedBy`, `message` |
| `messagerie.json` | 0 | — |
| `messages.json` | 0 | — |
| `modeleproduit.json` | 0 | — |
| `moduleSettings.json` | 0 | — |
| `montant-verser.json` | 2 | `maxMonthly`, `versements` |
| `noteColumns.json` | 0 | — |
| `notes.json` | 0 | — |
| `nouvelle_achat.json` | 0 | — |
| `objectif.json` | 0 | — |
| `parametretache.json` | 0 | — |
| `pointage.json` | 0 | — |
| `pointageAutoSessions.json` | 0 | — |
| `pointageDeleted.json` | 0 | — |
| `pointageauto.json` | 0 | — |
| `prepa-livraison.json` | 0 | — |
| `pretfamilles.json` | 0 | — |
| `pretproduits.json` | 0 | — |
| `prixpointage.json` | 0 | — |
| `prixproducts.json` | 1 | `entries` |
| `productComments.json` | 0 | — |
| `products.json` | 0 | — |
| `rdv-taches.json` | 0 | — |
| `rdv.json` | 0 | — |
| `rdvNotifications.json` | 0 | — |
| `remboursement.json` | 0 | — |
| `rsa.json` | 0 | — |
| `sales.json` | 0 | — |
| `settings.json` | 0 | — |
| `shareTokens.json` | 0 | — |
| `tache.json` | 0 | — |
| `taches-rdv.json` | 0 | — |
| `tailleproduits.json` | 0 | — |
| `tentativeblocage.json` | 0 | — |
| `timeoutinactive.json` | 0 | — |
| `travailleur.json` | 0 | — |
| `users.json` | 1 | `id`, `email`, `password`, `firstName`, `lastName`, `gender`, `address`, `phone`, `role`, `nombreConnexion`, `tempsBlocage`, `failedAttempts`, `lockedUntil`, `profilePhoto` |

## Sauvegarde et restauration

- Sauvegarder = archiver le dossier `server/db` et `server/uploads`.
- Restauration : arrêter le serveur, remplacer les fichiers, redémarrer (le watcher SSE republie l'état).
- `auto-sauvegarde.json` pilote les sauvegardes automatiques, `encryption.json` et `rsa.json` portent les éléments de chiffrement.

