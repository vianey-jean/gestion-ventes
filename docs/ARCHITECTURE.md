
# 🏗️ Architecture du Système — Documentation Complète

> **Version** : 6.0.0 — Architecture MVC  
> **Dernière mise à jour** : Avril 2026

---

## 📌 1. Vue d'ensemble

Application web **full-stack** de gestion commerciale suivant le pattern **MVC** (Model-View-Controller) :

- **Frontend** : React SPA avec architecture MVC
- **Backend** : Express.js REST API avec controllers séparés
- **Base de données** : Fichiers JSON (stockage fichier plat)
- **State Management** : Zustand (store centralisé)
- **Communication temps réel** : Server-Sent Events (SSE)

---

## 📌 2. Architecture MVC

### Frontend (React)

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React SPA)                  │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  VIEWS   │  │CONTROLLERS│  │  MODELS  │              │
│  │          │  │          │  │          │              │
│  │ pages/   │◄►│ store/   │◄►│ types/   │              │
│  │ compo-   │  │ hooks/   │  │ services/│              │
│  │ nents/   │  │ contexts/│  │ api/     │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

### Backend (Express.js)

```
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (Express.js)                   │
│                                                          │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐          │
│  │  ROUTES  │─►│ CONTROLLERS  │─►│  MODELS  │          │
│  │ routes/  │  │ controllers/ │  │ models/  │          │
│  │          │  │              │  │ db/*.json│          │
│  └──────────┘  └──────────────┘  └──────────┘          │
│        ▲                                                 │
│  ┌─────┴────┐                                           │
│  │MIDDLEWARE │                                           │
│  │ auth,cors │                                           │
│  │ security  │                                           │
│  └──────────┘                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📌 3. Structure des dossiers

### Frontend (`src/`)

```
src/
├── assets/               # Images et ressources statiques
├── components/           # 🖼️ VIEWS — Composants UI réutilisables
│   ├── ui/              #   Composants de base shadcn/ui
│   ├── auth/            #   Authentification
│   ├── dashboard/       #   Tableau de bord
│   ├── clients/         #   Gestion des clients
│   ├── commandes/       #   Commandes
│   ├── pointage/        #   Pointage
│   ├── rdv/             #   Rendez-vous
│   ├── notes/           #   Kanban board
│   ├── tache/           #   Tâches
│   ├── navbar/          #   Navigation
│   ├── common/          #   Composants partagés
│   └── ...
├── pages/               # 🖼️ VIEWS — Pages (une par route)
├── store/               # 🎮 CONTROLLERS — State management (Zustand)
│   ├── index.ts         #   Export centralisé
│   ├── appStore.ts      #   État app (produits, ventes)
│   └── authStore.ts     #   État authentification
├── hooks/               # 🎮 CONTROLLERS — Logique réutilisable
├── contexts/            # 🎮 CONTROLLERS — Contextes React
├── services/            # 📡 MODELS — Appels API centralisés
│   ├── api/             #   Services HTTP (1 par ressource)
│   │   ├── api.ts       #   Instance Axios configurée
│   │   ├── index.ts     #   Export centralisé
│   │   ├── productApi.ts
│   │   ├── saleApi.ts
│   │   └── ...          #   (30+ services)
│   └── realtime/        #   SSE et synchronisation
├── types/               # 📐 MODELS — Interfaces TypeScript
├── utils/               # 🔧 Fonctions utilitaires
│   ├── index.ts         #   Export centralisé
│   ├── helpers.ts       #   Formatage, debounce, etc.
│   └── validators.ts   #   Validation des entrées
├── lib/                 # 🔧 Utilitaires shadcn (cn)
├── styles/              # 🎨 CSS personnalisé
└── tests/               # 🧪 Tests
```

### Backend (`server/`)

```
server/
├── server.js            # Point d'entrée Express
├── controllers/         # 🎮 CONTROLLERS — Logique métier
│   ├── index.js         #   Export centralisé
│   ├── authController.js
│   ├── productController.js
│   ├── saleController.js
│   ├── clientController.js
│   ├── commandeController.js
│   ├── depenseController.js
│   ├── beneficeController.js
│   ├── pointageController.js
│   ├── rdvController.js
│   ├── tacheController.js
│   ├── messageController.js
│   ├── objectifController.js
│   └── crudControllers.js
├── routes/              # 📡 ROUTES — Endpoints API
│   └── (33 fichiers)
├── models/              # 📐 MODELS — Accès données
│   └── (23 fichiers)
├── middleware/           # 🔒 Middleware (auth, cors, sécurité)
├── db/                  # 💾 Base de données JSON
├── config/              # ⚙️ Configuration
├── services/            # 🔧 Services backend
└── uploads/             # 📁 Fichiers uploadés
```

---

## 📌 4. Stack Technologique

### Frontend
| Technologie | Rôle |
|-------------|------|
| React 19 | Framework UI |
| TypeScript | Typage statique |
| Vite | Build tool |
| Tailwind CSS | Styles utilitaires |
| shadcn/ui | Composants UI |
| **Zustand** | **State management global** |
| React Router 7 | Navigation SPA |
| Axios | Requêtes HTTP |
| Recharts | Graphiques |
| Framer Motion | Animations |

### Backend
| Technologie | Rôle |
|-------------|------|
| Node.js 18+ | Runtime |
| Express.js 4 | Framework HTTP |
| JWT | Authentification |
| bcryptjs | Hash mots de passe |

---

## 📌 5. Flux de données MVC

```
Utilisateur → View (Page/Component)
                ↓ action
             Controller (Store/Hook)
                ↓ appel
             Model (Service API → Axios)
                ↓ HTTP
             Backend Route → Controller → Model → DB
                ↓ réponse
             Model (Service) → Controller (Store) → View (mise à jour)
                ↓ SSE
             Synchronisation temps réel vers tous les clients
```

---

## 📌 6. Modules fonctionnels

| Module | Controller Backend | Service Frontend | Store |
|--------|-------------------|-----------------|-------|
| Auth | authController | authApi | authStore |
| Produits | productController | productApi | appStore |
| Ventes | saleController | saleApi | appStore |
| Clients | clientController | clientApi | — |
| Commandes | commandeController | commandeApi | — |
| Dépenses | depenseController | depenseApi | — |
| Bénéfices | beneficeController | beneficeApi | — |
| Pointage | pointageController | pointageApi | — |
| RDV | rdvController | rdvApi | — |
| Tâches | tacheController | tacheApi | — |
| Messages | messageController | — | — |
| Objectifs | objectifController | objectifApi | — |

---

## 📌 7. Sécurité

| Couche | Protection |
|--------|-----------|
| Auth | JWT (8h expiration) |
| Mots de passe | bcrypt (10 rounds) |
| CORS | Origins whitelist |
| Rate Limiting | 100 req/min/IP |
| Sanitization | Inputs nettoyés |
| Headers | CSP, X-Frame-Options |

---

## 📌 8. Déploiement

| Composant | Plateforme |
|-----------|-----------|
| Frontend | Vercel |
| Backend | Render |
| Base de données | JSON sur Render |
