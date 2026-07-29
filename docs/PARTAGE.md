# 🔗 Partage et commentaires visiteurs

## Types de liens
| Source | Modale | Contenu partagé |
|---|---|---|
| Pointage | `ShareLinkModal` / `SelectiveShareModal` | Totaux et lignes de pointage, intégral ou filtré |
| Tâches | `ShareLinkModal` / `SelectiveShareModal` | Tâches sur période |
| Notes | `SelectiveShareModal` | Colonnes entières du Kanban (sélection au niveau colonne uniquement) |

## Pages publiques
- `/shared/:token` → `SharedViewPage`
- `/shared/notes/:token` → `SharedNotesPage`
Ces pages sont en `noindex` et n'exigent aucune authentification, seulement un token valide.

## Commentaires visiteurs
1. Bouton « Ajouter un commentaire » en haut de la vue partagée.
2. Le visiteur désigne l'élément concerné (ligne de tableau, carte) puis saisit son retour dans `SharedCommentForm`.
3. Après envoi, le formulaire se verrouille pour cet élément.
4. Côté administrateur, une pastille apparaît dans `PointageHero`, `TacheHero`, `NotesKanbanView` ; `ShareCommentsViewer` affiche les retours et permet l'export PDF des justificatifs.

## Stockage
`shareTokens.json` (liens), `lienIp.json` (accès), `lienpartagecommente.json` et `comment-share.json` (commentaires). Routes : `shareLinks.js`, `notesShare.js`, `shareComments.js`.

