# 🛠️ Guide des Fonctionnalités — Riziky Gestion

> Ce document explique **chaque fonctionnalité** de l'application en détail : à quoi ça sert, comment ça marche, et où trouver le code.

---

## 📑 Table des matières

1. [Authentification et Sécurité](#1-authentification-et-sécurité)
2. [Dashboard (Tableau de bord)](#2-dashboard)
3. [Produits](#3-produits)
4. [Ventes](#4-ventes)
5. [Clients](#5-clients)
6. [Commandes](#6-commandes)
7. [Rendez-vous](#7-rendez-vous)
8. [Pointage](#8-pointage)
9. [Notes (Kanban)](#9-notes-kanban)
10. [Tâches](#10-tâches)
11. [Comptabilité](#11-comptabilité)
12. [Dépenses](#12-dépenses)
13. [Prêts (Familles et Produits)](#13-prêts)
14. [Messagerie](#14-messagerie)
15. [Partage de liens et Commentaires](#15-partage-de-liens-et-commentaires)
16. [Profil et Paramètres](#16-profil-et-paramètres)
17. [Synchronisation temps réel](#17-synchronisation-temps-réel)

---

## 1. Authentification et Sécurité

### Connexion (Login)

**Comment ça marche :**
1. L'utilisateur entre son email et mot de passe sur `/login`
2. Le frontend appelle `POST /api/auth/login`
3. Le serveur vérifie l'email dans `users.json`
4. Si le compte est **bloqué** (trop de tentatives), retourne une erreur 423 avec le temps restant
5. Si le mot de passe est **incorrect**, incrémente `failedAttempts`. Après X tentatives (configurable), bloque le compte pendant Y minutes
6. Si le mot de passe est **correct**, génère un token JWT valide 8h et le retourne

**Fichiers concernés :**
- Frontend : `LoginPage.tsx`, `AuthContext.tsx`, `authApi.ts`
- Backend : `authController.js`, `User.js`, `auth.js` (routes)

### Inscription (Register)

**Comment ça marche :**
1. L'utilisateur remplit : email, mot de passe, confirmation, nom, prénom, genre, adresse, téléphone
2. Validation : email unique, mot de passe ≥6 caractères, mots de passe identiques
3. Le mot de passe est hashé avec `bcryptjs` avant stockage
4. Un token JWT est généré immédiatement

**Fichiers :** `RegisterPage.tsx`, `authController.js`

### Réinitialisation du mot de passe

**Étape 1 :** Vérification de l'email (`POST /api/auth/reset-password-request`)  
**Étape 2 :** Nouveau mot de passe avec validation stricte : ≥6 chars, majuscule, minuscule, chiffre, caractère spécial (`POST /api/auth/reset-password`)

**Fichiers :** `ResetPasswordPage.tsx`, `authController.js`

### Protection anti-brute-force

- Configurable par utilisateur via le profil (`SecuriteSection.tsx`)
- `nombreConnexion` : nombre max de tentatives (par défaut 5)
- `tempsBlocage` : durée du blocage en minutes (par défaut 15)
- Les tentatives échouées sont comptées dans `failedAttempts`
- Le verrouillage s'active dans `lockedUntil`

### Vérification de sécurité

Au premier accès, une **page de vérification** s'affiche (`SecurityCheckPage.tsx`). L'utilisateur doit répondre correctement pour accéder à l'application. Valide pendant 24h en `sessionStorage`.

### Chiffrement de la base de données

Tous les fichiers JSON dans `server/db/` sont chiffrés de manière transparente :
- `patchDbIO.js` intercepte `fs.readFileSync` et `fs.writeFileSync`
- Si le fichier est dans le dossier `db/`, il est automatiquement déchiffré à la lecture et chiffré à l'écriture
- La clé est dans `ENCRYPTION_KEY` (minimum 10 caractères)

---

## 2. Dashboard

Le tableau de bord est la page principale après connexion. Il regroupe plusieurs modules.

**Page :** `DashboardPage.tsx`  
**Composant principal :** `AdvancedDashboard.tsx`

### Modules du Dashboard

| Module | Description | Composant |
|--------|-------------|-----------|
| Ajout de produit | Formulaire rapide pour ajouter un produit | `AddProductForm.tsx` |
| Ajout de vente | Formulaire pour enregistrer une vente | `AddSaleForm.tsx` |
| Tableau des ventes | Historique des ventes avec recherche | `SalesTable.tsx` |
| Inventaire | Liste des produits en stock | `Inventaire.tsx` |
| Comptabilité | Module complet de comptabilité | `ComptabiliteModule.tsx` |
| Dépenses du mois | Gestion des dépenses mensuelles | `DepenseDuMois.tsx` |
| Prêts familles | Gestion des prêts aux familles | `PretFamilles.tsx` |
| Prêts produits | Gestion des prêts de produits | `PretProduits.tsx` |
| Objectifs | Définir et suivre des objectifs de vente | Via `useObjectif` |
| Remboursements | Gestion des remboursements | `RefundForm.tsx`, `ViewRefundsModal.tsx` |
| Factures | Génération de factures PDF | `InvoiceGenerator.tsx` |
| Export ventes | Export des ventes en PDF | `ExportSalesDialog.tsx` |

### Modules activables

L'utilisateur peut activer/désactiver certains modules depuis son profil (`ModuleSettingsSection.tsx`). Les modules désactivés sont masqués du Dashboard.

---

## 3. Produits

**Page :** `ProduitsPage.tsx`  
**Route :** `/produits`

### Fonctionnalités

- **Tableau** avec colonnes : Description, Prix d'achat, Quantité, Notation
- **Tri** par colonne (↑ croissant, ↓ décroissant) sur chaque colonne
- **Recherche** par description
- **Pagination** (nombre d'éléments par page configurable)
- **Photos** : chaque produit peut avoir plusieurs photos avec diaporama
- **Code produit** : généré automatiquement (7 caractères : P/T + chiffres + lettres)
- **Fournisseur** : association optionnelle
- **Commentaires** : système de commentaires par produit (`ProductCommentScroller.tsx`)
- **Réservation** : un produit peut être marqué "réservé"

### Données d'un produit

```typescript
{
  id: string,
  code: string,        // Ex: "P4A2B3C"
  description: string,
  purchasePrice: number,
  quantity: number,
  sellingPrice: number,
  profit: number,      // Calculé : sellingPrice - purchasePrice
  photos: string[],    // URLs des photos
  mainPhoto: string,
  fournisseur: string,
  reserver: "oui" | undefined
}
```

---

## 4. Ventes

**Gestion dans :** Dashboard (`AddSaleForm.tsx`, `SalesTable.tsx`)

### Processus de vente

1. Sélectionner un produit (recherche par nom)
2. Choisir le client (recherche par nom)
3. Définir la quantité et le prix de vente
4. Le profit est calculé automatiquement
5. Le stock du produit est **décrémenté automatiquement**
6. La vente apparaît dans le tableau et la comptabilité

---

## 5. Clients

**Page :** `ClientsPage.tsx`  
**Route :** `/clients`

### Fonctionnalités

- **Grille de cartes** avec photo, nom, téléphone(s), adresse
- **Tri alphabétique** : A→Z ou Z→A (bouton dédié)
- **Recherche** par nom ou téléphone
- **Multi-téléphones** : un client peut avoir plusieurs numéros
- **Photo** : photo optionnelle avec zoom
- **Actions téléphone** : appeler, WhatsApp, copier le numéro
- **Adresse** : cliquer pour ouvrir dans Google Maps

### Données d'un client

```typescript
{
  id: string,
  nom: string,
  phone: string,      // Premier numéro (rétrocompatibilité)
  phones: string[],   // Tous les numéros
  adresse: string,
  dateCreation: string,
  photo: string       // URL de la photo (optionnel)
}
```

---

## 6. Commandes

**Page :** `CommandesPage.tsx`  
**Route :** `/commandes`

### Fonctionnalités

- **Tableau des commandes** avec tri et pagination
- **Statistiques** : total, en cours, terminées, en retard
- **Réservation** → **Commande** → **Livraison**
- **Reporter** une commande à une nouvelle date
- **Créer un RDV** depuis une commande
- **Alertes** pour les réservations en retard
- **Conflit de tâches** : avertissement si conflit avec une tâche existante

---

## 7. Rendez-vous

**Page :** `RdvPage.tsx`  
**Route :** `/rdv`

### Fonctionnalités

- **Calendrier** visuel des rendez-vous
- **Formulaire** de création avec date, heure, client, description, lieu
- **Statistiques** : RDV aujourd'hui, cette semaine, ce mois
- **Notifications** : rappels de RDV à venir
- **Vérification de disponibilité** : empêche les conflits de RDV
- **Création depuis commande** : un RDV peut être créé directement depuis une commande

---

## 8. Pointage

**Page :** `PointagePage.tsx`  
**Route :** `/pointage`

### Onglets

1. **Calendrier** : vue mensuelle des pointages
2. **Entreprises** : liste CRUD des entreprises
3. **Travailleurs** : liste CRUD des travailleurs
4. **Notes** : système Kanban (voir section 9)
5. **Tâches** : calendrier de tâches (voir section 10)

### Données d'un pointage

```
{
  id, travailleur, entreprise, date, heureDebut, heureFin,
  heuresTravaillees, tauxHoraire, montantTotal, commentaire
}
```

### Partage

On peut **partager** les pointages via un lien unique (voir section 15).

---

## 9. Notes (Kanban)

**Composant :** `NotesKanbanView.tsx`  
**Accessible depuis :** `PointagePage.tsx` (onglet Notes)

### Fonctionnalités

- **Colonnes** : créer, renommer, supprimer, réordonner
- **Notes** : créer, modifier, supprimer, déplacer entre colonnes
- **Couleurs** : chaque note a une couleur personnalisable
- **Dessin** : canvas de dessin intégré dans chaque note
- **Drag & Drop** : réordonner les notes par glisser-déposer
- **Partage** : partager les notes via lien (voir section 15)

---

## 10. Tâches

**Composant :** `TacheView.tsx`  
**Accessible depuis :** `PointagePage.tsx` (onglet Tâches)

### Fonctionnalités

- **Calendrier** : vue mensuelle avec tâches colorées
- **Création** : titre, description, date début, date fin, priorité, catégorie
- **Vue jour** : détail des tâches d'une journée
- **Vue semaine** : vue hebdomadaire
- **Notifications** : tâches du jour, tâches en retard
- **Ticker** : bande défilante des tâches à venir
- **Validation** : marquer une tâche comme terminée
- **Partage** : partager les tâches via lien (voir section 15)

---

## 11. Comptabilité

**Composant principal :** `ComptabiliteModule.tsx`  
**Hook :** `useComptabilite.ts`

### Indicateurs

| Indicateur | Formule | Composant |
|------------|---------|-----------|
| **Crédit** | Total des ventes du mois | `CreditDetailsModal` |
| **Débit** | Total des achats + dépenses | `DebitDetailsModal` |
| **Bénéfice Ventes** | Somme des profits sur ventes | `BeneficeVentesModal` |
| **Bénéfice Réel** | Crédit - Débit | `BeneficeReelModal` |
| **Achats Produits** | Total des achats de marchandise | `AchatsProduitsModal` |
| **Autres Dépenses** | Dépenses non liées aux achats | `AutresDepensesModal` |
| **Solde Net** | Bénéfice final après tout | `SoldeNetModal` |

### Graphiques

- **Évolution mensuelle** : courbe crédit/débit sur l'année
- **Répartition des dépenses** : camembert par catégorie

### Export PDF

Export mensuel de la comptabilité en PDF.

---

## 12. Dépenses

**Composant :** `DepenseDuMois.tsx`

### Catégories

Les dépenses sont organisées par catégorie (loyer, transport, fournitures, etc.) avec un suivi mensuel.

---

## 13. Prêts

### Prêts Familles (`PretFamilles.tsx`)

Prêts d'argent aux familles avec suivi des montants et remboursements.

### Prêts Produits (`PretProduits.tsx`)

Prêts de produits avec suivi et notification de retard (`PretRetardNotification.tsx`).

---

## 14. Messagerie

**Page :** `MessagesPage.tsx`  
**Route :** `/messages`

Système de messagerie interne avec :
- Liste des conversations
- Envoi/réception de messages
- Notifications de nouveaux messages

---

## 15. Partage de liens et Commentaires

### Comment ça marche

1. **Créer un lien** : depuis la page Pointage, on clique "Partager" → `ShareLinkModal.tsx`
2. Un token unique est généré et stocké dans `share-links.json`
3. Le lien est de la forme : `https://site.com/shared/<token>` (ou `/shared/notes/<token>` pour les notes)
4. **La personne qui reçoit le lien** ouvre la page `SharedViewPage.tsx` ou `SharedNotesPage.tsx`
5. Elle voit les données partagées et peut **ajouter un commentaire** via `SharedCommentForm.tsx`

### Le commentaire contient

- Le **texte** du commentaire
- La **référence à l'élément** commenté (ex: "#4 — Pointage de Mme Ahmadi, 04/04/2026, Entreprise Caudan, 4h, 40€")
- Un **snapshot HTML** de la page au moment du commentaire (stocké dans `db/upload/lienPartage/`)
- Les données sont sauvegardées en **JSON** dans `comment-share.json` ET `lienpartagecommente.json`

### Voir les commentaires reçus

Dans `ShareCommentsViewer.tsx` :
- **Icône 👁️** : lire le commentaire et voir le snapshot HTML
- **Icône 🗑️** (si déjà lu) : supprimer le commentaire
  - Supprime de `comment-share.json`
  - Supprime de `lienpartagecommente.json`
  - Supprime le fichier HTML dans `db/upload/lienPartage/`

### Suppression

Un commentaire ne peut être supprimé que s'il a été **lu** (`read: true`). Double-clic requis pour confirmer (timeout 3 secondes).

---

## 16. Profil et Paramètres

**Page :** `ProfilePage.tsx`  
**Route :** `/profile`

### Sections

| Section | Composant | Description |
|---------|-----------|-------------|
| Avatar | `ProfileAvatar.tsx` | Photo de profil avec upload |
| Informations | `ProfileInfoCard.tsx` | Nom, prénom, email, téléphone, adresse, genre |
| Mot de passe | `PasswordSection.tsx` | Changer le mot de passe |
| Sécurité | `SecuriteSection.tsx` | Nombre de tentatives de connexion, durée de blocage |
| Paramètres | `ParametresSection.tsx` | Paramètres généraux |
| Modules | `ModuleSettingsSection.tsx` | Activer/désactiver les modules du Dashboard |
| Indisponibilités | `IndisponibiliteSection.tsx` | Définir des périodes d'absence (bloque les RDV) |
| Suppression | `BulkDeleteModal.tsx` | Supprimer des données en masse |

---

## 17. Synchronisation temps réel

### SSE (Server-Sent Events)

L'application utilise SSE pour synchroniser les données en temps réel entre plusieurs navigateurs/onglets.

**Comment ça marche :**

1. Le frontend ouvre une connexion SSE vers `GET /api/sync/events`
2. La connexion reste ouverte indéfiniment
3. Quand une donnée change sur le serveur (via une route API), le serveur émet un événement SSE
4. Le frontend reçoit l'événement et recharge les données concernées
5. L'interface se met à jour **sans rafraîchir la page**

**Types d'événements :**
- `products-updated` : un produit a été ajouté/modifié/supprimé
- `sales-updated` : une vente a été enregistrée
- `clients-updated` : un client a changé
- etc.

**Fichiers :**
- Frontend : `use-sse.ts`, `use-realtime-sync.ts`, `realtimeService.ts`
- Backend : `middleware/sync.js`, `routes/sync.js`
