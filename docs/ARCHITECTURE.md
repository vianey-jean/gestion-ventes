# 🏗️ Architecture

## 1. Vue d'ensemble

VentePro est une application **full-stack MVC** :

| Couche | Technologie | Emplacement |
|---|---|---|
| Vue | React 18 + TypeScript + Tailwind + shadcn/ui | `src/pages`, `src/components` |
| Contrôleur front | Contextes React, stores Zustand, hooks | `src/contexts`, `src/store`, `src/hooks` |
| Modèle front | Services API Axios, types | `src/services`, `src/types` |
| Routes back | Express Router | `server/routes` (56 fichiers) |
| Contrôleurs back | Logique métier | `server/controllers` (18 fichiers) |
| Modèles back | Accès fichiers JSON | `server/models` (27 fichiers) |
| Base de données | Fichiers JSON | `server/db` (66 fichiers) |

## 2. Schéma de flux

```text
Utilisateur
   │  interaction
   ▼
Page (src/pages/XxxPage.tsx)
   │  props / callbacks
   ▼
Composants (src/components/xxx/*)
   │  appel
   ▼
Hook métier (src/hooks/useXxx.ts)
   │  appel
   ▼
Service API (src/services/api/xxxApi.ts)  ──HTTP──►  server/routes/xxx.js
                                                        │
                                                        ▼
                                                  controllers/xxxController.js
                                                        │
                                                        ▼
                                                  models/Xxx.js  ──►  server/db/xxx.json
                                                        │
                                       broadcast SSE ◄──┘ (middleware/sync.js)
   ◄────────────────────── EventSource /api/sync/events ──────────────────────
```

## 3. Arborescence réelle

```text
src/
├── pages/            55 fichiers — écrans routés + sous-vues
├── components/       342 fichiers — briques UI et métier
├── contexts/         4 contextes globaux
├── store/            stores Zustand (appStore, authStore)
├── hooks/            28 hooks
├── services/         services API (48 fichiers) + temps réel
├── types/            contrats TypeScript
├── utils/ lib/       helpers, validation, sécurité, codec code-barres
└── styles/           surcouches CSS accessibilité / typographie

server/
├── server.js         point d'entrée Express, montage de 60 préfixes /api
├── routes/           56 routeurs
├── controllers/      18 contrôleurs
├── models/           27 modèles d'accès JSON
├── middleware/       auth.js, dbHelper.js, encryption.js, patchDbIO.js, security.js, sync.js, upload.js, uploadAchat.js, uploadDepense.js, validation.js
├── services/         availabilityService.js, fileService.js, reservationCleanupService.js
├── db/               66 fichiers JSON
└── uploads/          fichiers déposés (photos clients/produits, justificatifs)
```

## 4. Routage applicatif (`src/App.tsx`)

| Route | Page | Accès |
|---|---|---|
| `/` | `HomePage` | public |
| `/about` | `AboutPage` | public |
| `/contact` | `ContactPage` | public |
| `/login` | `LoginPage` | public |
| `/register` | `RegisterPage` | public |
| `/reset-password` | `ResetPasswordPage` | public |
| `/shared/notes/:token` | `SharedNotesPage` | public via token |
| `/shared/:token` | `SharedViewPage` | public via token |
| `/dashboard` | `DashboardPage` | protégé |
| `/clients` | `ClientsPage` | protégé |
| `/messages` | `MessagesPage` | protégé |
| `/commandes` | `CommandesPage` | protégé |
| `/rdv` | `RdvPage` | protégé |
| `/produits` | `ProduitsPage` | protégé |
| `/pointage` | `PointagePage` | protégé |
| `/profile` | `ProfilePage` | protégé |
| `*` | `NotFound` | — |

Enveloppes globales : `ErrorBoundary` → `ThemeProvider` → `AccessibilityProvider` → `AuthProvider` → `AppProvider` → `Router` → `MaintenanceGate` → `Suspense`.
Watchers globaux montés hors des routes : `VisitTracker`, `PointageAutoWatcher`, `AutoInjectWatcher`, `GlobalRdvTodayNotifier`, `Toaster`, `CookieConsent`.
Avant tout rendu, `SecurityCheckPage` verrouille l'accès tant que le navigateur n'est pas vérifié.

## 5. Principes non négociables

1. Un composant ne fait **jamais** d'appel HTTP direct : il passe par un service `src/services/api`.
2. Une route Express ne lit **jamais** un fichier directement : elle passe par un modèle `server/models`.
3. Toute écriture serveur déclenche un événement SSE pour la synchronisation temps réel.
4. Les couleurs et styles viennent des tokens du design system (`index.css` / `tailwind.config.ts`).

