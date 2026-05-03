# PRD COMPLET — RIZIKY-STUDIO

> Product Requirements Document exhaustif destiné à une IA de reconstruction.
> Si le projet est entièrement supprimé, ce document permet de le régénérer
> intégralement (frontend + backend + bases JSON + logiques métier).
>
> Version : 1.0 — 29 avril 2026
> Stack : React 18 + Vite 5 + TypeScript 5 + Tailwind v3 (front) — Node.js + Express + JSON files chiffrés (back)

---

## 1. Vue d'ensemble

**Riziky-Studio** est une plateforme web full-stack de gestion d'entreprise (ERP léger)
combinant : gestion produits/stocks, ventes, achats, clients, prêts, comptabilité,
dépenses, rendez-vous, pointage des travailleurs (manuel + automatique), tâches,
notes, messagerie temps réel multi-rôle, partage commenté, et synchronisation
serveur 72h.

### Objectifs métier
- Centraliser toute l'activité commerciale d'un entrepreneur indépendant ou TPE.
- Fonctionner sans base SQL : tout est stocké dans des fichiers JSON chiffrés
  côté serveur (`server/db/*.json`) avec patch I/O transparent.
- Synchronisation temps réel via SSE entre tous les onglets/admins.
- Sécurité : auth JWT, rôles, RLS applicative, blocage IP, chiffrement disque.

### Rôles
- `administrateur principale` (super-admin unique : RABEMANALINA Jean Marie Vianey)
- `administrateur` (admin secondaire)
- `visiteur` (anonyme, peut consulter et messagerie live)

---

## 2. Stack technique

### Frontend
- **Framework** : React 18 + Vite 5 + TypeScript 5
- **Styles** : Tailwind CSS v3 + design tokens HSL (index.css + tailwind.config.ts)
- **UI Kit** : shadcn/ui (radix-ui sous-jacent)
- **Routing** : React Router v6
- **State** : Zustand (`src/store/`) + Context API (`src/contexts/`)
- **Animations** : framer-motion
- **Icônes** : lucide-react
- **HTTP** : axios (`src/services/api/api.ts`)
- **Temps réel** : EventSource (SSE)
- **Tests** : Vitest + Testing Library

### Backend
- **Runtime** : Node.js + Express
- **Auth** : JWT + bcrypt + passport (Google OAuth optionnel)
- **Stockage** : fichiers JSON chiffrés (AES) dans `server/db/`
- **Chiffrement** : `server/middleware/encryption.js` + `patchDbIO.js`
- **Uploads** : multer (`server/middleware/upload.js`, `uploadDepense.js`)
- **Sync temps réel** : SSE dans `server/middleware/sync.js` (sleep/wake 72h)
- **Sécurité** : helmet, rate-limit, blocage IP par tentatives échouées

### Variables d'environnement
- Frontend (`.env`) : `VITE_API_URL=http://localhost:10000`
- Backend (`server/.env`) : `PORT=10000`, `JWT_SECRET`, `ENCRYPTION_KEY`, `GOOGLE_CLIENT_ID/SECRET`, `EMAIL_USER/PASS`

---

## 3. Architecture frontend — Pages

| Route | Fichier | Rôles autorisés | Description |
|---|---|---|---|
| `/` | `pages/Index.tsx` → `HomePage.tsx` | public | Landing photographe (Hero, Gallery, About, Contact) |
| `/login` | `pages/LoginPage.tsx` | public | Connexion JWT + Google OAuth |
| `/register` | `pages/RegisterPage.tsx` | public | Création de compte (admin secondaire) |
| `/reset-password` | `pages/ResetPasswordPage.tsx` | public | Mot de passe oublié (email token) |
| `/dashboard` | `pages/DashboardPage.tsx` | admin | Tableau de bord global (stats, charts) |
| `/produits` | `pages/ProduitsPage.tsx` (et `Produits.tsx`) | admin | CRUD produits avec photos, codes-barres |
| `/ventes` | `pages/Ventes.tsx` (+ `VentesEmbedded.tsx`) | admin | Enregistrement ventes, table, export PDF |
| `/clients` | `pages/ClientsPage.tsx` (+ `clients/`) | admin | CRUD clients, recherche, fiche détaillée |
| `/commandes` | `pages/CommandesPage.tsx` | admin | Suivi commandes (statuts, livraison) |
| `/pret-familles` | `pages/PretFamilles.tsx` | admin | Prêts à la famille (date, montant, retard) |
| `/pret-produits` | `pages/PretProduits.tsx` | admin | Prêts produits (groupés, retard) |
| `/depenses` | `pages/Depenses.tsx` | admin | Dépenses du mois + dépenses fixes |
| `/comptabilite` | `pages/Comptabilite.tsx` | admin | Module compta complet (achats, dépenses, charts) |
| `/tendances` | `pages/Tendances.tsx`/`TendancesPage.tsx` | admin | Analytics (clients, produits, stock, recommandations) |
| `/rdv` | `pages/RdvPage.tsx` | admin | Calendrier rendez-vous + notifications |
| `/pointage` | `pages/PointagePage.tsx` | admin | Pointage travailleurs (manuel + automatique + sessions) |
| `/messages` | `pages/MessagesPage.tsx` | admin | Messagerie admin↔admin / admin↔visiteur / groupes |
| `/profile` | `pages/ProfilePage.tsx` | admin | Profil + paramètres (incl. règles pointage auto) |
| `/about` | `pages/AboutPage.tsx` | public | À propos |
| `/contact` | `pages/ContactPage.tsx` | public | Contact |
| `/maintenance` | `pages/MaintenancePage.tsx` | public | Page maintenance (bascule via `moduleSettings`) |
| `/shared/notes/:token` | `pages/SharedNotesPage.tsx` | public lien | Notes partagées |
| `/shared/:token` | `pages/SharedViewPage.tsx` | public lien | Vue partagée commentée |
| `*` | `pages/NotFound.tsx` | public | 404 |

---

## 4. Composants frontend (par dossier)

### `src/components/`
- `CookieConsent.tsx` — bannière RGPD
- `Footer.tsx`, `Navbar.tsx`, `Layout.tsx` — chrome global
- `PasswordInput.tsx`, `PasswordStrengthChecker.tsx` — UX mot de passe
- `SEOHead.tsx` — meta tags dynamiques (title <60, desc <160, JSON-LD)
- `ScrollToTop.tsx`

### Sections landing photographe
- `HeroSection.tsx`, `AboutSection.tsx`, `GallerySection.tsx`, `ContactSection.tsx`

### `src/components/dashboard/`
- `AdvancedDashboard.tsx` — vue agrégée (stats, charts)
- `AddProductForm.tsx`, `EditProductForm.tsx`, `AddSaleForm.tsx`, `RefundForm.tsx`
- `Inventaire.tsx`, `SalesTable.tsx`, `VentesProduits.tsx`, `VentesParClientsModal.tsx`
- `ProductSearchInput.tsx`, `ClientSearchInput.tsx`, `FournisseurAutocomplete.tsx`
- `ProductPhotoSlideshow.tsx`, `PhotoUploadSection.tsx`
- `InvoiceGenerator.tsx` (PDF), `ExportSalesDialog.tsx`
- `MonthlyResetHandler.tsx` (reset auto fin de mois)
- `PretFamilles.tsx`, `PretProduits.tsx`, `PretProduitsGrouped.tsx`, `PretRetardNotification.tsx`
- `DepenseDuMois.tsx`, `ProfitCalculator.tsx`, `StatCard.tsx`, `ActionButton.tsx`
- `ViewRefundsModal.tsx`
- Sous-dossiers : `accounting/`, `comptabilite/`, `forms/`, `inventory/`, `prets/`, `reports/`, `sections/`

### `src/components/dashboard/comptabilite/`
- `ComptabiliteModule.tsx` — point d'entrée
- `ComptabiliteHeader.tsx`, `ComptabiliteStatsCards.tsx`, `SecondaryStatsCards.tsx`
- `ComptabiliteTabs.tsx` — onglets (Achats / Dépenses / Charts)
- `AchatFormDialog.tsx` — formulaire achat avec recherche produit + galerie photos éditable (ajout/suppression, sync DB à la validation)
- `AchatsHistoriqueList.tsx` — liste avec modal détail
- `DepenseFormDialog.tsx` — formulaire dépense avec upload photo/PDF du reçu (ouverture `_blank` en lecture, téléchargement optionnel)
- `DepensesRepartitionChart.tsx`, `EvolutionMensuelleChart.tsx`, `StableCharts.tsx`
- `ProductSearchInput.tsx`
- `details/`, `modals/AchatDetailModal.tsx`, `shared/`

### `src/components/pointage/`
- `PointageHero.tsx` — header
- `PointageTabNav.tsx` — onglets (Travailleurs / Entreprises / Calendrier)
- `PointageTravailleursList.tsx`, `PointageEntreprisesList.tsx`
- `PointageCalendar.tsx` — vue calendrier avec montants journaliers
- `TravailleurSearchInput.tsx`
- `PointageAutoWatcher.tsx` ★ — watcher global multi-admin :
  - scan règles `pointageauto.json` toutes les 60s
  - préavis 10 min pour aujourd'hui, rattrapage immédiat pour jours passés
  - persistance du chrono dans `pointageautodeclanche.json` (NOUVEAU)
  - sessions partagées via `pointageAutoSessions.json` (sync 10s)
  - validation/annulation propagée à tous les admins en temps réel
  - blocage permanent via `pointageDeleted.json` après annulation
- `modals/` — confirmations diverses

### `src/components/livechat/`
- `LiveChatAdmin.tsx` ★ — panneau admin :
  - Onglets Visiteurs / Admins / Groupes
  - Compteurs notifs : total + par onglet + par conversation
  - SSE `/api/messagerie/events?adminId=X` pour réception temps réel
  - Mark-read au clic d'une conversation
- `LiveChatVisitor.tsx` — bulle visiteur

### `src/components/notes/`
- CRUD notes, colonnes personnalisables (`noteColumns.json`)
- Partage par lien token avec commentaires (`notesShare`)

### `src/components/tache/`
- CRUD tâches avec paramètres (`parametretache.json`)

### `src/components/profile/`
- Onglets : Infos / Sécurité / Paramètres / Pointage automatique / Modules
- Configuration des règles `pointageauto.json`

### `src/components/maintenance/`
- Bascule maintenance globale (`maintenance.json`)

### `src/components/security/`, `src/components/auth/`, `src/components/forms/`,
`src/components/business/`, `src/components/clients/`, `src/components/commandes/`,
`src/components/products/`, `src/components/rdv/`, `src/components/tendances/`,
`src/components/common/`, `src/components/navbar/`, `src/components/navigation/`,
`src/components/shared/`, `src/components/accessibility/`, `src/components/ui/`
— composants spécialisés et primitives shadcn.

---

## 5. Hooks frontend (`src/hooks/`)

- `use-auto-logout.tsx` — déconnexion sur inactivité (config dans `timeoutinactive.json`)
- `use-chat-notification.ts` — agrégation compteurs messagerie
- `use-currency-formatter.ts`
- `use-error-boundary.tsx`
- `use-messages.ts`
- `use-mobile.tsx`, `use-toast.ts`
- `use-professional-data.tsx`
- `use-realtime-sync.ts`, `use-sse.ts` — wrappers SSE
- `useBusinessCalculations.ts`, `useClientSync.ts`, `useClients.ts`
- `useCommandes.ts`, `useCommandesLogic.ts`
- `useComptabilite.ts` — agrégation achats + dépenses + photos
- `useObjectif.ts`, `useOptimization.ts`, `usePhoneActions.ts`
- `useProducts.ts`, `useRdv.ts`, `useRealtimeCommentNotifications.ts`
- `useSales.ts`, `useYearlyData.ts`

---

## 6. Services API frontend (`src/services/api/`)

Un client par ressource, tous basés sur `api.ts` (axios + intercepteur JWT) :

`authApi`, `avanceApi`, `beneficeApi`, `clientApi`, `commandeApi`, `comptaApi`,
`depenseApi`, `entrepriseApi`, `fournisseurApi`, `indisponibleApi`,
`moduleSettingsApi`, `noteApi`, `noteShareApi`, `nouvelleAchatApi`, `objectifApi`,
`parametresApi`, `pointageApi`, `pointageAutoApi`, `pointageAutoSessionsApi`,
`pointageAutoDeclancheApi` (★ NOUVEAU), `pointageDeletedApi`, `pretFamilleApi`,
`pretProduitApi`, `productApi`, `productCommentsApi`, `profileApi`, `rdvApi`,
`rdvNotificationsApi`, `remboursementApi`, `saleApi`, `settingsApi`,
`shareCommentsApi`, `shareLinksApi`, `tacheApi`, `travailleurApi`.

---

## 7. Services temps réel (`src/services/realtime/`)

- `RealtimeService.ts` — singleton, gère les listeners par type de donnée
- `EventSourceManager.ts` — connexion SSE avec backoff, reconnect auto, attente `load`+500ms
- `DataCacheManager.ts` — cache local des dernières données
- `types.ts` — `SyncData` (products, sales, pretFamilles, pretProduits, depenses,
  achats, clients, messages, **pointages, notes, taches, travailleurs, entreprises**)
- `syncService.ts`, `optimizedRealtimeService.ts`, `dataOptimizationService.ts`,
  `reservationRdvSyncService.ts`, `rdvFromReservationService.ts`

---

## 8. Contextes & Stores

### Contexts (`src/contexts/`)
- `AppContext.tsx` — état global app
- `AuthContext.tsx` — utilisateur courant, login/logout, refresh JWT
- `ThemeContext.tsx` — light/dark
- `FormProtectionContext.tsx` — anti-perte saisie

### Stores Zustand (`src/store/`)
- `authStore.ts`, `appStore.ts`, `index.ts`

---

## 9. Architecture backend — Routes

Toutes sous `/api/*`, authentifiées via `middleware/auth.js` (sauf auth/maintenance/share).

| Route | Fichier | Description |
|---|---|---|
| `/api/auth` | `auth.js` | login, register, logout, refresh, OAuth Google, reset password |
| `/api/products` | `products.js` | CRUD produits + photos (multer) |
| `/api/sales` | `sales.js` | CRUD ventes + remboursements |
| `/api/clients` | `clients.js` | CRUD clients |
| `/api/pretfamilles` | `pretfamilles.js` | CRUD prêts famille |
| `/api/pretproduits` | `pretproduits.js` | CRUD prêts produits |
| `/api/depenses` | `depenses.js` | CRUD dépenses (du mois + fixes) avec photos/PDF |
| `/api/sync` | `sync.js` | SSE `/events` + endpoints sync (chrono 72h) |
| `/api/benefices` | `benefices.js` | Calcul bénéfices |
| `/api/messages` | `messages.js` | Messages internes |
| `/api/messagerie` | `messagerie.js` | Live chat (visiteur, admin, groupes) + SSE |
| `/api/commandes` | `commandes.js` | CRUD commandes |
| `/api/rdv` | `rdv.js` | CRUD rendez-vous |
| `/api/rdv-notifications` | `rdvNotifications.js` | Notifications RDV |
| `/api/objectif` | `objectif.js` | Objectifs mensuels |
| `/api/nouvelle-achat` | `nouvelleAchat.js` | Achats fournisseurs (lié products) |
| `/api/compta` | `compta.js` | Vue comptable agrégée |
| `/api/remboursements` | `remboursements.js` | Remboursements ventes |
| `/api/fournisseurs` | `fournisseurs.js` | CRUD fournisseurs |
| `/api/entreprises` | `entreprise.js` | CRUD entreprises (clients pointage) |
| `/api/pointages` | `pointage.js` | CRUD pointages manuels + auto |
| `/api/pointages-auto` | `pointageAuto.js` | Règles de pointage auto |
| `/api/pointages-deleted` | `pointageDeleted.js` | Empreintes pointages supprimés |
| `/api/pointages-auto-sessions` | `pointageAutoSessions.js` | Sessions modales partagées multi-admin |
| `/api/pointages-auto-declanche` | `pointageAutoDeclanche.js` ★ | **Persistance du chrono déclenché** |
| `/api/travailleurs` | `travailleur.js` | CRUD travailleurs |
| `/api/taches` | `tache.js` | CRUD tâches |
| `/api/notes` | `notes.js` | CRUD notes + colonnes |
| `/api/notes-share` | `notesShare.js` | Partage notes par token |
| `/api/share-links` | `shareLinks.js` | Liens partage généraux |
| `/api/share-comments` | `shareComments.js` | Commentaires sur partage |
| `/api/product-comments` | `productComments.js` | Commentaires produits |
| `/api/avance` | `avance.js` | Avances clients |
| `/api/profile` | `profile.js` | Profil utilisateur + photo |
| `/api/settings` | `settings.js` | Paramètres globaux |
| `/api/parametres` | `parametres.js` | Paramètres divers (prix pointage, etc.) |
| `/api/indisponible` | `indisponible.js` | Périodes indisponibles |
| `/api/module-settings` | `moduleSettings.js` | Activation modules |
| `/api/encryption` | `encryption.js` | Gestion clé chiffrement |
| `/api/maintenance` | `maintenance.js` | Bascule maintenance |

---

## 10. Modèles backend (`server/models/`)

Chaque modèle expose `getAll/getById/create/update/delete` + filtres spécifiques,
lit/écrit via `dbHelper.js` (chiffrement transparent) :

`Avance`, `Benefice`, `Client`, `Commande`, `Compta`, `DepenseDuMois`, `Entreprise`,
`Fournisseur`, `Message`, `Note`, `NouvelleAchat`, `Objectif`, `Pointage` ★ (avec
**idempotence date+travailleurId+entrepriseId** ajoutée), `PretFamille`, `PretProduit`,
`Product`, `ProductComment`, `Rdv`, `RdvNotification`, `Remboursement`, `Sale`,
`Tache`, `Travailleur`, `User`.

---

## 11. Bases de données JSON (`server/db/`)

`admin-messages.json`, `auto-sauvegarde.json`, `avance.json`, `benefice.json`,
`clients.json`, `commandes.json`, `comment-share.json`, `compta.json`,
`depensedumois.json`, `depensefixe.json`, `encryption.json`, `entreprise.json`,
`fournisseurs.json`, `group-chats.json`, `group-messages.json`, `indisponible.json`,
`lienIp.json`, `lienpartagecommente.json`, `maintenance.json`, `messagerie.json`,
`messages.json`, `moduleSettings.json`, `noteColumns.json`, `notes.json`,
`nouvelle_achat.json`, `objectif.json`, `parametretache.json`, `pointage.json`,
`pointageauto.json`, `pointageautodeclanche.json` ★, `pointageAutoSessions.json`,
`pointageDeleted.json`, `pretfamilles.json`, `pretproduits.json`, `prixpointage.json`,
`productComments.json`, `products.json`, `rdv.json`, `rdvNotifications.json`,
`remboursement.json`, `rsa.json`, `sales.json`, `settings.json`, `shareTokens.json`,
`tache.json`, `tentativeblocage.json`, `timeoutinactive.json`, `travailleur.json`,
`upload/` (fichiers uploadés), `users.json`.

---

## 12. Logiques métier critiques

### 12.1 Authentification & sécurité
- JWT signé `JWT_SECRET`, durée 24h, refresh transparent
- Hash bcrypt (10 rounds) pour `password`
- Blocage IP après `nombreConnexion` échecs (15 min `tempsBlocage`)
- Google OAuth via `passport.js`
- Reset password : email avec token expirant 1h
- Auto-logout après inactivité (config `timeoutinactive.json`)
- Toutes les bases JSON chiffrées par AES (clé `ENCRYPTION_KEY`)
- `patchDbIO.js` intercepte fs.readFileSync/writeFileSync pour chiffrer/déchiffrer transparent

### 12.2 Synchronisation 72h
- `server/middleware/sync.js` :
  - SSE endpoint `/api/sync/events`
  - Surveille tous les fichiers `db/*.json` listés (clients, products, sales,
    pretfamilles, pretproduits, depenses, achats, messages, **pointage, notes,
    taches, travailleur, entreprise**)
  - Émet `data-changed` à chaque modification détectée
  - Chrono 72h : si aucune activité pendant 72h, sleep ; tout ajout réveille
    et **remet le chrono à 72h** (`wakeUp()`)
  - Reconnect côté front avec backoff (`EventSourceManager`)

### 12.3 Pointage automatique (★ logique mise à jour)

**Règles** (`pointageauto.json`) :
- Configurées dans Profil → Paramètres → Pointage automatique
- Champs : `travailleurId/Nom`, `jours` (`['lundi',...]` ou `'toute'`),
  `entrepriseId/Nom`, `typePaiement`, `heures`, `prix*`, `montantTotal`,
  `active`, `permanentlyDisabled`, `reactivationStartDate`

**Flux multi-admin (mise à jour)** :
1. À la connexion d'un admin, `PointageAutoWatcher` :
   - charge toutes les règles `active`
   - calcule les dates attendues du mois (depuis `reactivationStartDate` ou début mois, max 60j)
   - filtre celles déjà pointées (`pointage.json`) ou bloquées (`pointageDeleted.json`)
   - alimente une queue locale (préavis 10 min pour aujourd'hui, immédiat pour passés)

2. **Quand le préavis est écoulé**, AVANT de créer la session UI, le watcher :
   - **POST `/api/pointages-auto-declanche`** (idempotent sur `ruleId+date`)
   - Si une entrée pending existe déjà → renvoie le `startedAt` initial
   - Sinon → crée l'entrée avec `startedAt=now`, `expiresAt=now+5min`,
     `active=true`, `chronoDeclanche=true`, `status='pending'`
   - **Le `startedAt` n'est jamais réinitialisé** — un admin qui se connecte
     plus tard reprend exactement le même chrono.

3. Création de la session modal (`pointageAutoSessions.json`) avec
   `durationMs = expiresAt(declanche) - now` → l'`expiresAt` de la session
   reste aligné avec le déclenchement persistant.

4. Tous les admins voient le même modal (sync 10s sur `/pointages-auto-sessions?status=pending`)
   avec le même countdown.

5. Validation par n'importe quel admin :
   - PATCH session → `validated`
   - PATCH déclenchement → `validated`
   - POST `/api/pointages` (création réelle, **idempotent côté serveur** sur
     `date+travailleurId+entrepriseId` → JAMAIS de doublon)

6. Annulation par n'importe quel admin :
   - PATCH session → `cancelled`
   - PATCH déclenchement → `cancelled`
   - Empreinte ajoutée dans `pointageDeleted.json` → bloque tout futur déclenchement
     pour ce `(date+travailleur+entreprise)`. Seul un pointage manuel reste possible.

7. **Résilience aux suppressions** :
   - Si toutes les bases sont supprimées et réinjectées (sauvegarde) :
     - À la reconnexion, le watcher relance le scan
     - Si aucune entrée n'existe dans `pointage.json` ni `pointageDeleted.json`
       pour la date du jour → nouveau déclenchement créé
     - L'idempotence du modèle `Pointage.create` empêche le double-enregistrement
       si plusieurs admins valident en parallèle

### 12.4 Messagerie temps réel
- 3 canaux : visiteur ↔ admin, admin ↔ admin, groupes
- Stockage : `messagerie.json`, `admin-messages.json`, `group-chats.json`,
  `group-messages.json`
- SSE `/api/messagerie/events?adminId=X` pour push instantané
- **Compteurs notifs** :
  - icône messagerie : somme totale (visiteurs + admins + groupes) en badge rouge
  - par onglet : badge sur Visiteurs / Admins / Groupes
  - par conversation : badge sur chaque visiteur/admin/groupe
  - décrémentation uniquement quand la conversation est ouverte (mark-read)

### 12.5 Comptabilité
- **Achats** (`AchatFormDialog`) :
  - Recherche produit dans la base
  - À la sélection : photo principale affichée au-dessus du formulaire
  - Galerie éditable : suppression de chaque photo + ajout de nouvelles
  - À la validation : suppression des anciennes photos en base + ajout des nouvelles
  - Photos sauvées dans `uploads/products/`
- **Dépenses** (`DepenseFormDialog`) :
  - Upload reçu (image ou PDF) au-dessus de "date de dépense"
  - Stockage dans `uploads/depense/`
  - Affichage en lecture : ouverture nouvel onglet `_blank`, téléchargement à la demande

### 12.6 Partage commenté
- Génération de tokens (`shareTokens.json`)
- Page publique `/shared/:token` avec commentaires (`comment-share.json`,
  `lienpartagecommente.json`)
- Notifications temps réel sur nouveau commentaire

### 12.7 Maintenance
- Bascule globale (`maintenance.json`)
- Quand activée, redirection vers `/maintenance` sauf admin principal

### 12.8 Reset mensuel
- `MonthlyResetHandler` : à chaque changement de mois, archivage des dépenses
  du mois et reset du compteur `objectif`

---

## 13. Middlewares backend (`server/middleware/`)

- `auth.js` — vérif JWT, injection `req.user`
- `dbHelper.js` — `readDb/writeDb` avec chiffrement
- `encryption.js` — primitives AES + `readJsonDecrypted/writeJsonEncrypted`
- `patchDbIO.js` — patch global fs pour chiffrement transparent
- `security.js` — helmet, rate-limit, sanitization
- `sync.js` — SSE + chrono 72h + watcher fichiers
- `upload.js` — multer général (photos produits, profil)
- `uploadDepense.js` — multer dépenses (photos + PDF)
- `validation.js` — schemas joi/zod

---

## 14. Documentation existante (`docs/`)

`API_DOCUMENTATION.md`, `ARCHITECTURE.md`, `BACKEND.md`, `BACKEND_GUIDE.md`,
`CAHIER_DE_CHARGE.md`, `COMPTABILITE_COMPONENTS.md`, `COMPTABILITE_MODULE.md`,
`DEPLOYMENT.md`, `DOCUMENTATION_COMPLETE.md`, `DOCUMENTATION_PROJET.md`,
`FONCTIONNALITES.md`, `FRONTEND.md`, `FRONTEND_GUIDE.md`, `GUIDE_DEMARRAGE.md`,
`MAINTENANCE_GUIDE.md`, `PARTAGE_COMMENTAIRES.md`, `PERFORMANCE_SUMMARY.md`,
`PROJET-COMPLET_GUIDE.md`, `REALTIME_SYNC.md`, `RESUME_COMPLET_PROJET.md`,
`SECURITE.md`, `SECURITY.md`, `TESTS_GUIDE.md`.

---

## 15. Tests (`src/tests/`)

- `backend/middleware/auth.test.js`
- `backend/routes/auth.test.js`, `products.test.js`
- `backend/services/dataService.test.js`
- `e2e/complete-user-journey.test.ts`, `userJourney.test.ts`
- `hooks/*.test.tsx` (useAuth, useBusinessCalculations, useClientSync, useRealtimeSync)
- `integration/SalesWorkflow.test.tsx`
- `performance/performance.test.ts`
- `services/BusinessCalculationService.test.ts`, `ClientService.test.ts`, `FormatService.test.ts`

---

## 16. Design system

- Tokens HSL dans `src/index.css` (`--background`, `--primary`, `--accent`, etc.)
- `tailwind.config.ts` étend les couleurs sémantiques
- Pas de classes brutes (`bg-white`, `text-black`) → toujours via tokens
- Variantes shadcn (CVA) pour boutons/cards/dialogs
- Mode dark/light via `ThemeContext`

---

## 17. Déploiement

- **Frontend** : Vercel (`vercel.json`)
- **Backend** : Render / VPS (port 10000)
- **CORS** : whitelist origin front
- **Variables d'env** à configurer côté hébergeur

---

## 18. Reconstruction depuis zéro — checklist

1. `npm create vite@latest` (React + TS) puis `bun install`
2. Tailwind v3 + shadcn/ui (`npx shadcn-ui@latest init`)
3. Créer la structure `src/{components,pages,hooks,services,contexts,store,lib,types,utils}`
4. Copier la liste des routes (§3) et créer chaque page
5. Copier la liste des composants (§4) avec leurs responsabilités
6. Implémenter les hooks (§5) et services API (§6)
7. Configurer SSE (§7) et le 72h sleep/wake
8. Backend : `npm init`, installer express/jsonwebtoken/bcrypt/multer/passport/helmet
9. Créer chaque route (§9) avec son contrôleur et son modèle (§10)
10. Initialiser tous les fichiers JSON vides (§11)
11. Activer le chiffrement (`patchDbIO.js`)
12. Implémenter le pointage auto avec les 3 fichiers de coordination (§12.3)
13. Implémenter la messagerie 3-canaux avec SSE (§12.4)
14. Tests Vitest pour les flux critiques (§15)
15. Déployer (§17)

---

**Fin du PRD.**
