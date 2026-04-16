# 🔗 Documentation Partage et Commentaires — Riziky Gestion

> Ce document explique en détail le système de partage de liens et de commentaires pour le Pointage, les Tâches et les Notes.

---

## 1. Vue d'ensemble

Le système permet de :
1. **Partager** des données (pointage, tâches ou notes) via un lien unique
2. **Commenter** les données partagées
3. **Sauvegarder** un snapshot HTML de la page commentée
4. **Lire** et **supprimer** les commentaires reçus

---

## 2. Créer un lien de partage

### Depuis la page Pointage (`PointagePage.tsx`)

1. Cliquer sur le bouton **"Partager"**
2. Le composant `ShareLinkModal.tsx` s'ouvre
3. Choisir le type de partage : Pointage, Tâches ou Notes
4. (Optionnel) Utiliser `SelectiveShareModal.tsx` pour choisir quels éléments partager
5. Un **token unique** est généré (UUID)
6. Les données et le token sont envoyés au serveur via `POST /api/share-links`
7. Le lien est copié dans le presse-papier

### Structure du lien

```
https://riziky-gestion-ventes.vercel.app/shared/<token>        ← Pointage ou Tâches
https://riziky-gestion-ventes.vercel.app/shared/notes/<token>  ← Notes
```

### Données stockées (`share-links.json`)

```json
{
  "id": "uuid",
  "token": "abc123...",
  "type": "pointage" | "taches" | "notes",
  "data": [...],         // Les données partagées
  "createdAt": "2026-04-15T...",
  "createdBy": "user-id"
}
```

---

## 3. Voir un lien partagé

### Pour le Pointage et les Tâches

**Page :** `SharedViewPage.tsx`  
**Route :** `/shared/:token`

1. La page récupère le token depuis l'URL
2. Appelle `GET /api/share-links/token/:token`
3. Affiche les données dans un tableau
4. En bas, le formulaire de commentaire (`SharedCommentForm.tsx`)

### Pour les Notes

**Page :** `SharedNotesPage.tsx`  
**Route :** `/shared/notes/:token`

Même principe mais avec un affichage en colonnes Kanban.

---

## 4. Ajouter un commentaire

### Composant : `SharedCommentForm.tsx`

1. L'utilisateur sélectionne un **élément spécifique** (ex: ligne #4 du tableau)
2. Le formulaire récupère **toutes les informations** de cet élément  
   Exemple : "#4 — Pointage de Mme Ahmadi, 04/04/2026, Entreprise Caudan, 4h, 40€"
3. L'utilisateur écrit son commentaire
4. Au moment de l'envoi :

### Ce qui est envoyé au serveur (`POST /api/share-comments`)

```json
{
  "linkId": "id-du-lien",
  "author": "Nom de l'auteur",
  "comment": "Texte du commentaire",
  "elementRef": "#4 — Pointage de Mme Ahmadi, 04/04/2026...",
  "elementIndex": 4,
  "snapshotHtml": "<html>...</html>"
}
```

### Ce que fait le serveur

1. **Sauvegarde le commentaire en JSON** dans `comment-share.json` ET `lienpartagecommente.json`
2. **Crée un fichier HTML** dans `db/upload/lienPartage/snapshot_<id>.html`
3. Le fichier HTML est un **snapshot complet** de la page au moment du commentaire
4. Retourne le commentaire avec le chemin du fichier HTML (`snapshotFile`)

### Conversion automatique

Si des commentaires existent dans la base de données **sans fichier HTML correspondant**, le serveur les convertit automatiquement au prochain accès. Cela garantit qu'on a **toujours un document à lire**.

---

## 5. Voir les commentaires reçus

### Composant : `ShareCommentsViewer.tsx`

Affiché dans la page Pointage (`PointagePage.tsx`), ce composant montre :
- La liste des commentaires reçus sur les liens partagés
- Pour chaque commentaire :
  - Le **nom de l'auteur**
  - La **date**
  - Le **texte du commentaire**
  - La **référence à l'élément** commenté
  - Badge **"Nouveau"** si non lu

### Actions sur un commentaire

| Icône | Action | Condition |
|-------|--------|-----------|
| 👁️ Eye (bleu) | **Lire** le commentaire + voir le snapshot HTML | Toujours visible |
| 🗑️ Trash (rouge) | **Supprimer** le commentaire | Seulement si `read: true` |

### Lire un commentaire

1. Cliquer sur l'icône 👁️
2. Le commentaire est marqué comme lu (`PUT /api/share-comments/:id/read`)
3. Le snapshot HTML s'affiche dans un modal (comme un document PDF)

### Supprimer un commentaire

1. Le commentaire **doit avoir été lu** (`read: true`)
2. Cliquer sur l'icône 🗑️
3. **Premier clic** : l'icône passe en rouge avec confirmation
4. **Deuxième clic dans 3 secondes** : suppression confirmée
5. Si pas de deuxième clic dans 3 secondes : annulé

### Ce que fait la suppression (`DELETE /api/share-comments/delete/:id`)

1. Vérifie que le commentaire est marqué comme lu
2. Supprime de `lienpartagecommente.json`
3. Supprime de `comment-share.json`
4. Supprime le fichier HTML dans `db/upload/lienPartage/`

---

## 6. Fichiers concernés

### Frontend

| Fichier | Rôle |
|---------|------|
| `src/components/shared/ShareLinkModal.tsx` | Modal de création de lien |
| `src/components/shared/SelectiveShareModal.tsx` | Partage sélectif |
| `src/components/shared/SharedCommentForm.tsx` | Formulaire de commentaire |
| `src/components/shared/ShareCommentsViewer.tsx` | Affichage des commentaires reçus |
| `src/pages/SharedViewPage.tsx` | Page vue partagée (pointage/tâches) |
| `src/pages/SharedNotesPage.tsx` | Page notes partagées |
| `src/services/api/shareLinksApi.ts` | API liens de partage |
| `src/services/api/shareCommentsApi.ts` | API commentaires partagés |
| `src/services/api/noteShareApi.ts` | API partage de notes |

### Backend

| Fichier | Rôle |
|---------|------|
| `server/routes/shareLinks.js` | Routes API liens de partage |
| `server/routes/shareComments.js` | Routes API commentaires (CRUD + delete + snapshot HTML) |
| `server/routes/notesShare.js` | Routes API partage de notes |

### Stockage

| Fichier/Dossier | Contenu |
|-----------------|---------|
| `server/db/comment-share.json` | Backup JSON de tous les commentaires |
| `server/db/lienpartagecommente.json` | Données complètes des commentaires |
| `server/db/upload/lienPartage/` | Fichiers HTML des snapshots |

---

## 7. Schéma du flux complet

```
CRÉATEUR                          DESTINATAIRE
   │                                   │
   ├── Clique "Partager" ──────────►   │
   │   (ShareLinkModal)                │
   │                                   │
   │   Token généré                    │
   │   Lien copié                      │
   │   Données → share-links.json      │
   │                                   │
   │   Envoie le lien ─────────────►   │
   │                                   │
   │                                   ├── Ouvre le lien
   │                                   │   (SharedViewPage)
   │                                   │
   │                                   ├── Sélectionne élément #4
   │                                   │
   │                                   ├── Écrit un commentaire
   │                                   │   (SharedCommentForm)
   │                                   │
   │                                   ├── Envoie
   │                                   │   → comment-share.json
   │                                   │   → lienpartagecommente.json
   │                                   │   → snapshot HTML créé
   │                                   │
   ├── Voit "Nouveau commentaire" ◄──  │
   │   (ShareCommentsViewer)           │
   │                                   │
   ├── 👁️ Lit le commentaire           │
   │   (marque read: true)             │
   │   (affiche snapshot HTML)         │
   │                                   │
   ├── 🗑️ Supprime (si lu)            │
   │   → supprime JSON                 │
   │   → supprime fichier HTML         │
   │                                   │
```
