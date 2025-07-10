
# ARCHITECTURE TECHNIQUE

## Vue d'ensemble du système

### Stack technologique
- **Frontend**: React 18.3.1 avec TypeScript
- **Backend**: Node.js avec Express.js
- **Base de données**: Système de fichiers JSON (développement)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Shadcn/UI
- **State Management**: React Context API
- **Authentification**: JWT (JSON Web Tokens)
- **Temps réel**: Server-Sent Events (SSE)

## Architecture Frontend

### Structure des dossiers
```
src/
├── components/           # Composants réutilisables
│   ├── ui/              # Composants Shadcn/UI
│   ├── dashboard/       # Composants spécifiques au dashboard
│   └── common/          # Composants communs
├── contexts/            # Contextes React (État global)
├── hooks/               # Hooks personnalisés
├── pages/               # Pages de l'application
├── services/            # Services d'API
├── types/               # Définitions TypeScript
└── lib/                 # Utilitaires

```

### Patterns architecturaux utilisés

#### 1. Context Provider Pattern
- `AuthContext`: Gestion de l'authentification
- `AppContext`: État global de l'application
- `ThemeContext`: Gestion des thèmes

#### 2. Custom Hooks Pattern
- `useAuth()`: Gestion de l'authentification
- `useApp()`: Accès à l'état global
- `useAutoLogout()`: Déconnexion automatique
- `useRealtimeSync()`: Synchronisation temps réel

#### 3. Service Layer Pattern
- `authService`: Services d'authentification
- `productService`: Gestion des produits
- `salesService`: Gestion des ventes

## Architecture Backend

### Structure des dossiers
```
server/
├── routes/              # Routes API
├── models/              # Modèles de données
├── middleware/          # Middlewares Express
├── db/                  # Base de données JSON
└── uploads/             # Fichiers uploadés
```

### API REST
- **Authentication**: `/api/auth`
- **Products**: `/api/products`
- **Sales**: `/api/sales`
- **Benefits**: `/api/benefices`
- **Family Loans**: `/api/pretfamilles`
- **Product Loans**: `/api/pretproduits`
- **Expenses**: `/api/depenses`
- **Sync**: `/api/sync`

### Modèle de données

#### User
```typescript
interface User {
  id: string;
  email: string;
  password: string; // Hashé avec bcrypt
  firstName: string;
  lastName: string;
  gender: string;
  address: string;
  phone: string;
}
```

#### Product
```typescript
interface Product {
  id: string;
  description: string;
  purchasePrice: number;
  quantity: number;
  imageUrl?: string;
}
```

#### Sale
```typescript
interface Sale {
  id: string;
  date: string;
  productId: string;
  description: string;
  sellingPrice: number;
  quantitySold: number;
  purchasePrice: number;
  profit: number;
}
```

## Sécurité

### Authentification
- JWT avec expiration de 24h
- Middleware d'authentification sur toutes les routes protégées
- Hashage des mots de passe avec bcrypt (salt de 10)

### CORS
- Configuration CORS flexible pour le développement
- Headers personnalisés autorisés pour SSE

### Validation
- Validation côté serveur pour tous les endpoints
- Validation côté client avec les formulaires

## Synchronisation temps réel

### Server-Sent Events (SSE)
- Endpoint: `/api/sync/events`
- Gestion des connexions multiples
- Nettoyage automatique des connexions
- Timeout de sécurité (5 minutes)

### Gestion des événements
- `connected`: Connexion établie
- `data-changed`: Données modifiées
- `force-sync`: Synchronisation forcée

## Performance

### Frontend
- Lazy loading avec React.Suspense
- Mémorisation avec React.memo
- Debouncing pour les recherches
- Tree-shaking avec Vite

### Backend
- Middleware de gestion d'erreurs
- Logging structuré
- Gestion mémoire optimisée pour les fichiers JSON

## Déploiement

### Environnement de développement
- Frontend: `npm run dev` (Vite dev server)
- Backend: `npm start` (Node.js avec nodemon)
- Port par défaut: 10000

### Variables d'environnement
- `JWT_SECRET`: Clé secrète pour JWT
- `PORT`: Port du serveur (défaut: 10000)
- `NODE_ENV`: Environnement d'exécution
