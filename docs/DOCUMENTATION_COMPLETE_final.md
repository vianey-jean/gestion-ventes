# DOCUMENTATION COMPLÈTE DU PROJET

## Système de Gestion Commerciale Intégré

**Version**: 2.0.0  
**Dernière mise à jour**: 24 décembre 2025

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Modules Fonctionnels](#modules-fonctionnels)
4. [Notifications](#notifications)
5. [Rendez-vous](#rendez-vous)
6. [Objectifs](#objectifs)
7. [Sécurité](#sécurité)
8. [Déploiement](#déploiement)

---

## Vue d'ensemble

### Description du Projet

Application web moderne de gestion commerciale permettant aux petites et moyennes entreprises de gérer efficacement leurs produits, ventes, prêts, dépenses, rendez-vous et objectifs commerciaux avec une interface intuitive et des fonctionnalités avancées de calcul automatique.

### Objectif Principal

Fournir une solution complète et facile d'utilisation pour la gestion commerciale, avec synchronisation temps réel, analyses détaillées des performances et suivi des objectifs.

### Technologies Utilisées

#### Frontend
- **Framework**: React 18.3.1 avec TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI
- **Build**: Vite
- **State Management**: React Context API
- **Formulaires**: React Hook Form + Zod
- **Graphiques**: Recharts
- **Icons**: Lucide React

#### Backend
- **Runtime**: Node.js avec Express.js
- **Base de données**: Fichiers JSON (développement)
- **Authentification**: JWT (JSON Web Tokens)
- **Temps réel**: Server-Sent Events (SSE)
- **Sécurité**: bcrypt, CORS, Rate Limiting

---

## Architecture

### Diagramme d'Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │  Stockage       │
│   React/TS      │◄──►│  Node.js/Express│◄──►│  Fichiers JSON  │
│                 │    │                 │    │                 │
│ • Components    │    │ • Routes API    │    │ • products.json │
│ • Contexts      │    │ • Middleware    │    │ • sales.json    │
│ • Services      │    │ • Auth JWT      │    │ • objectif.json │
│ • Hooks         │    │ • SSE           │    │ • rdv.json      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Structure des Dossiers

```
src/
├── components/          # Composants React
│   ├── ui/             # Composants UI de base (Shadcn/UI)
│   ├── dashboard/      # Composants du tableau de bord
│   ├── navbar/         # Navigation et objectifs
│   ├── rdv/            # Gestion des rendez-vous
│   └── forms/          # Composants de formulaires
├── contexts/           # Contextes React
├── hooks/              # Hooks personnalisés
├── services/           # Services métier et API
├── pages/              # Pages de l'application
└── types/              # Définitions TypeScript

server/
├── routes/             # Routes de l'API
├── models/             # Modèles de données
├── middleware/         # Middleware personnalisés
└── db/                 # Fichiers de données JSON
```

---

## Modules Fonctionnels

### 1. Authentification

- Connexion/inscription avec validation
- Token JWT sécurisé (8h d'expiration)
- Déconnexion automatique après 10 min d'inactivité
- Réinitialisation de mot de passe
- Hashage bcrypt (salt 10)

### 2. Gestion des Produits

- CRUD complet
- Upload d'images
- Recherche et filtrage
- Gestion des stocks en temps réel

### 3. Gestion des Ventes

- Enregistrement avec calcul automatique des bénéfices
- Filtrage par produits en stock (quantité > 0)
- Historique par mois/année
- Export et archivage

### 4. Calculateur de Bénéfices

- Paramètres configurables (taxe, TVA, frais)
- Calcul automatique du coût total et prix recommandé
- Bénéfice net et taux de marge

### 5. Gestion des Prêts

- **Prêts familiaux**: Suivi des prêts accordés
- **Prêts produits**: Ventes avec avance
- Calcul automatique des soldes
- Notifications de retard

### 6. Gestion des Dépenses

- Dépenses mensuelles (débit/crédit)
- Dépenses fixes (abonnements, assurances)
- Réinitialisation mensuelle automatique

### 7. Analyses et Tendances

- Graphiques d'évolution (Recharts)
- Statistiques détaillées
- Comparaisons mensuelles/annuelles

---

## Notifications

### Types de Notifications

| Type | Déclencheur | Priorité |
|------|-------------|----------|
| `rdv_reminder` | RDV à venir (24h avant) | Medium |
| `rdv_today` | RDV du jour | High |
| `rdv_missed` | RDV manqué | Urgent |
| `payment_due` | Paiement dû | High |
| `payment_late` | Paiement en retard | Urgent |
| `stock_low` | Stock faible | Medium |
| `stock_empty` | Stock épuisé | High |

### Structure des Données

```typescript
interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  createdAt: string;
  data?: {
    rdvId?: string;
    clientId?: string;
    amount?: number;
  };
}
```

### API Endpoints

```
GET    /api/rdv-notifications        # Liste des notifications
POST   /api/rdv-notifications        # Créer une notification
PATCH  /api/rdv-notifications/:id/read   # Marquer comme lue
DELETE /api/rdv-notifications/:id    # Supprimer
```

### Composants React

```tsx
// Centre de notifications
<RdvNotifications
  notifications={notifications}
  onNotificationClick={handleClick}
  onMarkAsRead={markAsRead}
/>

// Badge compteur
<NotificationBadge count={unreadCount} />

// Toast notification
<NotificationToast notification={newNotification} />
```

### Temps Réel (SSE)

Les notifications utilisent Server-Sent Events pour les mises à jour en temps réel :

```typescript
const eventSource = new EventSource('/api/sync/events');
eventSource.addEventListener('notification', (event) => {
  const notification = JSON.parse(event.data);
  handleNewNotification(notification);
});
```

---

## Rendez-vous

### Fonctionnalités

1. **Calendrier Mensuel**
   - Vue mensuelle complète
   - Navigation entre les mois
   - Code couleur selon le statut
   - Glisser-déposer pour déplacer

2. **Statuts des RDV**

| Statut | Couleur | Description |
|--------|---------|-------------|
| `pending` | Jaune | En attente de confirmation |
| `confirmed` | Vert | Confirmé |
| `cancelled` | Rouge | Annulé |
| `completed` | Bleu | Terminé |

### Types TypeScript

```typescript
interface Rdv {
  id: string;
  titre: string;
  date: string;           // Format ISO
  heure?: string;         // Format HH:mm
  clientId?: string;
  clientNom?: string;
  description?: string;
  statut: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt?: string;
}
```

### API Endpoints

```
GET    /api/rdv            # Liste des RDV
POST   /api/rdv            # Créer un RDV
PUT    /api/rdv/:id        # Modifier un RDV
DELETE /api/rdv/:id        # Supprimer un RDV
PATCH  /api/rdv/:id/status # Changer le statut
```

### Composants React

```tsx
// Calendrier principal
<RdvCalendar
  rdvs={listeDesRdv}
  onRdvClick={handleClick}
  onDateSelect={handleNewRdv}
  onRdvDrop={handleMove}
/>

// Carte RDV
<RdvCard
  rdv={rdv}
  onEdit={openEditModal}
  onDelete={confirmDelete}
  onStatusChange={updateStatus}
/>

// Formulaire
<RdvForm
  rdv={rdvToEdit}
  clients={listeClients}
  onSubmit={saveRdv}
  onCancel={closeModal}
/>
```

### Hook useRdv

```typescript
const {
  rdvs,           // Liste des rendez-vous
  isLoading,      // État de chargement
  error,          // Erreur éventuelle
  createRdv,      // Fonction de création
  updateRdv,      // Fonction de mise à jour
  deleteRdv,      // Fonction de suppression
  refetch         // Recharger les données
} = useRdv();
```

---

## Objectifs

### Fonctionnalités

1. **Objectif Mensuel**
   - Valeur par défaut: 2000€
   - Modifiable à tout moment pour le mois en cours
   - Verrouillé pour les mois passés
   - Calcul automatique du pourcentage de réalisation

2. **Statistiques**
   - Modal avec graphiques des performances
   - Évolution des ventes mensuelles
   - Comparaison avec l'objectif

### Structure des Données

```typescript
interface ObjectifData {
  objectif: number;          // Objectif du mois en cours
  totalVentesMois: number;   // Total des ventes du mois
  mois: number;              // Mois actuel (1-12)
  annee: number;             // Année actuelle
  historique: MonthlyData[]; // Historique des mois
}

interface MonthlyData {
  mois: number;
  annee: number;
  totalVentesMois: number;
  objectif: number;
  pourcentage: number;       // (totalVentesMois / objectif) * 100
}
```

### API Endpoints

```
GET  /api/objectif              # Données actuelles + historique
PUT  /api/objectif              # Modifier l'objectif du mois en cours
POST /api/objectif/recalculate  # Recalculer depuis sales.json
GET  /api/objectif/historique   # Historique annuel
```

### Logique de Calcul

```javascript
// Calcul automatique depuis les ventes
const recalculateFromSales = (sales) => {
  // Calcul des totaux mensuels
  sales.forEach(sale => {
    const month = new Date(sale.date).getMonth() + 1;
    monthlyTotals[month] += sale.totalSellingPrice;
  });
  
  // Calcul du pourcentage pour chaque mois
  historique.forEach(month => {
    month.pourcentage = Math.round((month.totalVentesMois / month.objectif) * 100);
  });
};
```

### Règles de Modification

1. **Mois en cours**: Objectif modifiable à tout moment
2. **Mois passés**: Objectifs verrouillés, non modifiables
3. **Nouveau mois**: Réinitialisation à 2000€ par défaut

### Composants

```tsx
// Indicateur dans la navbar
<ObjectifIndicator
  current={totalVentesMois}
  objectif={objectif}
  onObjectifChange={updateObjectif}
/>

// Modal de statistiques
<ObjectifStatsModal />
```

### Hook useObjectif

```typescript
const {
  data,           // ObjectifData | null
  loading,        // boolean
  error,          // string | null
  fetchObjectif,  // () => Promise<void>
  updateObjectif, // (newObjectif: number) => Promise<ObjectifData>
  recalculate     // () => Promise<ObjectifData>
} = useObjectif();
```

---

## Sécurité

### Mesures Backend

1. **Rate Limiting**
   - 100 req/min général
   - 10 req/min authentification
   - 5 req/min opérations sensibles

2. **Validation des Entrées**
   - Schémas de validation stricts
   - Sanitisation XSS, SQL, NoSQL

3. **Headers de Sécurité**
   ```
   X-Content-Type-Options: nosniff
   X-Frame-Options: DENY
   X-XSS-Protection: 1; mode=block
   Content-Security-Policy: default-src 'self'
   ```

4. **Authentification JWT**
   - Expiration 8h
   - Secret complexe via variable d'environnement
   - Validation à chaque requête protégée

### Mesures Frontend

1. **Sanitisation XSS** - Échappement des caractères dangereux
2. **Validation des formulaires** - React Hook Form + Zod
3. **Protection CSRF** - Tokens CSRF
4. **Rate Limiting client** - Limitation des tentatives de connexion

---

## Déploiement

### Variables d'Environnement

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=votre-secret-super-securise
FRONTEND_URL=https://votre-domaine.com
VITE_API_BASE_URL=https://api.votre-domaine.com
```

### Commandes

```bash
# Développement
npm run dev          # Frontend (port 5173)
npm start           # Backend (port 10000)

# Production
npm run build       # Build optimisé
npm run preview     # Preview du build
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Statistiques du Projet

| Métrique | Valeur |
|----------|--------|
| Lignes de code Frontend | ~15,000 |
| Lignes de code Backend | ~3,000 |
| Composants React | 45+ |
| Pages | 8 |
| Hooks personnalisés | 15+ |
| Services API | 10+ |
| Routes Backend | 12 |

---

*Documentation mise à jour le 24 décembre 2025*
