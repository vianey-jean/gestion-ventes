# 🏗️ Architecture du Projet — Riziky Gestion

> Ce document décrit la structure complète du projet : chaque dossier, chaque fichier, et comment tout est connecté.

---

## 📁 Structure générale

```
gestion-ventes/
├── docs/                    ← 📚 Documentation (tu es ici)
├── public/                  ← 📂 Fichiers statiques (favicon, images)
├── server/                  ← 🖥️ Backend Node.js/Express
│   ├── config/              ← Configuration serveur
│   ├── controllers/         ← Logique métier des routes
│   ├── db/                  ← Base de données JSON
│   │   └── upload/          ← Fichiers uploadés (photos, snapshots)
│   │       └── lienPartage/ ← Snapshots HTML des liens partagés
│   ├── middleware/           ← Middlewares Express (auth, sécurité, etc.)
│   ├── models/              ← Modèles de données (CRUD sur fichiers JSON)
│   ├── routes/              ← Définition des routes API
│   ├── services/            ← Services utilitaires
│   ├── uploads/             ← Stockage des uploads Multer
│   ├── server.js            ← Point d'entrée du serveur
│   └── package.json         ← Dépendances backend
├── src/                     ← ⚛️ Frontend React
│   ├── assets/              ← Images et ressources
│   ├── components/          ← Composants React réutilisables
│   │   ├── accessibility/   ← Accessibilité (navigation, contrastes)
│   │   ├── auth/            ← Authentification (ProtectedRoute)
│   │   ├── business/        ← Calculs métier
│   │   ├── clients/         ← Composants page Clients
│   │   ├── commandes/       ← Composants page Commandes
│   │   ├── common/          ← Composants génériques (ErrorBoundary)
│   │   ├── dashboard/       ← Composants Dashboard
│   │   │   ├── accounting/  ← Comptabilité widgets
│   │   │   ├── comptabilite/← Module comptabilité complet
│   │   │   ├── forms/       ← Formulaires Dashboard
│   │   │   ├── inventory/   ← Inventaire widgets
│   │   │   ├── prets/       ← Prêts widgets
│   │   │   ├── reports/     ← Rapports
│   │   │   └── sections/    ← Sections Dashboard
│   │   ├── forms/           ← Composants formulaires génériques
│   │   ├── livechat/        ← Chat en direct
│   │   ├── navbar/          ← Barre de navigation
│   │   ├── navigation/      ← Navigation accessible
│   │   ├── notes/           ← Composants page Notes (Kanban)
│   │   ├── pointage/        ← Composants page Pointage
│   │   ├── products/        ← Composants page Produits
│   │   ├── profile/         ← Composants page Profil
│   │   ├── rdv/             ← Composants page Rendez-vous
│   │   ├── security/        ← Page de vérification de sécurité
│   │   ├── shared/          ← Composants partagés (modales, partage liens)
│   │   ├── tache/           ← Composants page Tâches
│   │   ├── tendances/       ← Composants tendances
│   │   └── ui/              ← Composants UI de base (shadcn)
│   ├── contexts/            ← Contexts React (état global)
│   ├── hooks/               ← Hooks personnalisés
│   ├── lib/                 ← Utilitaires
│   ├── pages/               ← Pages de l'application
│   ├── services/            ← Services API et temps réel
│   │   ├── api/             ← Appels API Axios
│   │   └── realtime/        ← Synchronisation SSE
│   └── types/               ← Types TypeScript
├── index.html               ← Page HTML de base
├── package.json             ← Dépendances frontend
├── tailwind.config.ts       ← Configuration Tailwind CSS
├── tsconfig.json            ← Configuration TypeScript
└── vite.config.ts           ← Configuration Vite
```

---

## 🔄 Comment tout est connecté

```
┌─────────────────┐         ┌──────────────────┐
│   NAVIGATEUR    │ ◄─────► │   SERVEUR API    │
│   (React)       │  HTTP   │   (Express)      │
│                 │  +SSE   │                  │
│  Pages          │         │  Routes          │
│  ↓              │         │  ↓               │
│  Composants     │         │  Controllers     │
│  ↓              │         │  ↓               │
│  Hooks          │         │  Models          │
│  ↓              │         │  ↓               │
│  Services API ──┼────────►│  Fichiers JSON   │
│  (Axios)        │         │  (server/db/)    │
└─────────────────┘         └──────────────────┘
```

### Flux d'une action utilisateur (exemple : ajouter un produit)

1. L'utilisateur remplit le formulaire dans `AddProductForm.tsx`
2. Le composant appelle `productApi.create(data)` depuis `src/services/api/productApi.ts`
3. Axios envoie un `POST /api/products` au serveur
4. Le serveur passe par le middleware `auth.js` (vérifie le token JWT)
5. La route `server/routes/products.js` appelle `productController.create()`
6. Le contrôleur utilise `Product.create()` depuis `server/models/Product.js`
7. Le modèle lit/écrit le fichier `server/db/products.json`
8. Le serveur émet un événement SSE pour notifier les autres clients
9. La réponse JSON est renvoyée au frontend
10. L'interface se met à jour avec le nouveau produit

---

## 🔐 Couche de sécurité

```
Requête HTTP entrante
  ↓
[1] CORS (vérifie l'origine)
  ↓
[2] Rate Limiting (limite les requêtes)
  ↓
[3] Sanitization (nettoie les entrées)
  ↓
[4] Security Headers (en-têtes HTTP sécurisés)
  ↓
[5] Auth Middleware (vérifie le token JWT)
  ↓
[6] Route → Controller → Model → DB
```

---

## 💾 Base de données

La base de données utilise des **fichiers JSON** dans `server/db/`. Chaque fichier correspond à une entité :

| Fichier | Contenu |
|---------|---------|
| `users.json` | Comptes utilisateurs (email, mot de passe hashé, paramètres) |
| `products.json` | Catalogue produits (description, prix, stock, photos) |
| `sales.json` | Historique des ventes |
| `clients.json` | Fiches clients |
| `commandes.json` | Commandes et réservations |
| `notes.json` | Notes (Kanban) |
| `noteColumns.json` | Colonnes du Kanban |
| `pointage.json` | Pointage des heures |
| `taches.json` | Tâches planifiées |
| `rdv.json` | Rendez-vous |
| `depenses.json` | Dépenses du mois |
| `achats.json` | Achats comptabilité |
| `messages.json` | Messages internes |
| `objectifs.json` | Objectifs commerciaux |
| `avances.json` | Avances sur salaire |
| `pretfamilles.json` | Prêts familles |
| `pretproduits.json` | Prêts produits |
| `remboursements.json` | Remboursements |
| `benefices.json` | Bénéfices calculés |
| `fournisseurs.json` | Fournisseurs |
| `entreprises.json` | Entreprises (pointage) |
| `travailleurs.json` | Travailleurs (pointage) |
| `comment-share.json` | Commentaires des liens partagés |
| `lienpartagecommente.json` | Données détaillées des commentaires partagés |

### Chiffrement

Tous les fichiers JSON sont **chiffrés de manière transparente** grâce au middleware `patchDbIO.js`. Quand l'application lit un fichier, il est automatiquement déchiffré. Quand elle écrit, il est chiffré. La clé est définie dans `ENCRYPTION_KEY` (min 10 caractères).
