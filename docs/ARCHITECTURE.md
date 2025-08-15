
# Architecture du Système

## Vue d'ensemble architecturale

Le système suit une architecture moderne basée sur les principes suivants :
- Séparation claire frontend/backend
- Immutabilité des données
- Composants purs et fonctions sans effets de bord
- Synchronisation temps réel via Server-Sent Events

## Diagramme d'architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │  Stockage       │
│   React/TS      │◄──►│  Node.js/Express│◄──►│  Fichiers JSON  │
│                 │    │                 │    │                 │
│ • Components    │    │ • Routes API    │    │ • products.json │
│ • Contexts      │    │ • Middleware    │    │ • sales.json    │
│ • Services      │    │ • Auth JWT      │    │ • users.json    │
│ • Hooks         │    │ • SSE           │    │ • clients.json  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Stack Technologique

### Frontend (React/TypeScript)
- **Framework** : React 18.3.1 avec TypeScript strict
- **Build Tool** : Vite pour des performances optimales
- **Styling** : Tailwind CSS avec Shadcn/UI
- **État** : React Context API avec immutabilité
- **Routage** : React Router DOM v6
- **Animations** : Framer Motion
- **Tests** : Vitest + React Testing Library

### Backend (Node.js/Express)
- **Runtime** : Node.js avec Express.js
- **Authentification** : JWT avec bcrypt
- **Base de données** : Fichiers JSON (développement)
- **Middleware** : CORS, compression, validation
- **Temps réel** : Server-Sent Events (SSE)
- **Upload** : Multer pour les fichiers

## Principes de conception

### 1. Immutabilité
Tous les états sont traités comme immuables :
```typescript
// Utilisation d'Immer pour les mises à jour
const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
  dispatch(draft => {
    const product = draft.products.find(p => p.id === id);
    if (product) {
      Object.assign(product, updates);
    }
  });
}, [dispatch]);
```

### 2. Composants purs
Les composants sont conçus comme des fonctions pures :
```typescript
const StatCard: React.FC<StatCardProps> = React.memo(({ title, value }) => {
  return (
    <Card>
      <CardHeader>{title}</CardHeader>
      <CardContent>{value}</CardContent>
    </Card>
  );
});
```

### 3. Séparation des responsabilités
- **Composants** : Uniquement l'affichage
- **Hooks** : Logique métier et état
- **Services** : Calculs et appels API
- **Contextes** : État global partagé

## Gestion d'état

### Contextes spécialisés
- `AuthContext` : Authentification utilisateur
- `AppContext` : Données de l'application (produits, ventes)
- `UIContext` : État de l'interface utilisateur

### Pattern de mise à jour
```typescript
// Reducer immuable avec Immer
const appReducer = (draft: AppState, action: AppAction) => {
  switch (action.type) {
    case 'ADD_PRODUCT':
      draft.products.push(action.payload);
      break;
    case 'UPDATE_PRODUCT':
      const index = draft.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        Object.assign(draft.products[index], action.payload.updates);
      }
      break;
  }
};
```

## Sécurité

### Authentification JWT
- Tokens sécurisés avec expiration
- Refresh tokens pour la persistance
- Middleware de validation sur toutes les routes protégées

### Validation des données
- Validation côté client avec Zod
- Validation côté serveur avec express-validator
- Sanitisation des entrées utilisateur

### CORS et sécurité
- Configuration CORS restrictive
- Headers de sécurité
- Rate limiting sur les API
