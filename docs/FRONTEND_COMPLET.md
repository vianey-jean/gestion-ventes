# GUIDE FRONTEND COMPLET

## 📁 Structure du Frontend (src/)

```
src/
├── assets/                   # Images et ressources statiques
│   └── logo.png
├── components/               # Composants React
│   ├── accessibility/        # Accessibilité
│   │   ├── AccessibilityProvider.tsx
│   │   ├── AccessibleButton.tsx
│   │   └── AccessibleInput.tsx
│   ├── auth/                 # Authentification
│   │   └── ProtectedRoute.tsx
│   ├── business/             # Logique métier
│   │   └── PureSalesTable.tsx
│   ├── common/               # Composants communs
│   │   ├── ErrorBoundary.tsx
│   │   ├── RealtimeStatus.tsx
│   │   └── RealtimeWrapper.tsx
│   ├── dashboard/            # Tableau de bord
│   │   ├── ActionButton.tsx
│   │   ├── AddProductForm.tsx
│   │   ├── AddSaleForm.tsx
│   │   ├── AdvancedDashboard.tsx
│   │   ├── ClientSearchInput.tsx
│   │   ├── DepenseDuMois.tsx
│   │   ├── EditProductForm.tsx
│   │   ├── ExportSalesDialog.tsx
│   │   ├── Inventaire.tsx
│   │   ├── InvoiceGenerator.tsx
│   │   ├── MonthlyResetHandler.tsx
│   │   ├── PretFamilles.tsx
│   │   ├── PretProduits.tsx
│   │   ├── PretProduitsGrouped.tsx
│   │   ├── PretRetardNotification.tsx
│   │   ├── ProductSearchInput.tsx
│   │   ├── ProfitCalculator.tsx
│   │   ├── SalesTable.tsx
│   │   ├── StatCard.tsx
│   │   ├── VentesProduits.tsx
│   │   ├── accounting/
│   │   │   └── ProfitLossStatement.tsx
│   │   ├── ai/
│   │   │   ├── AISalesPredictor.tsx
│   │   │   └── AIStockManager.tsx
│   │   ├── forms/
│   │   │   ├── ConfirmDeleteDialog.tsx
│   │   │   ├── ModernActionButton.tsx
│   │   │   ├── ModernButton.tsx
│   │   │   ├── ModernButtonGrid.tsx
│   │   │   ├── ModernCard.tsx
│   │   │   ├── ModernContainer.tsx
│   │   │   ├── ModernTable.tsx
│   │   │   ├── MultiProductSaleForm.tsx
│   │   │   ├── SaleFormFields.tsx
│   │   │   ├── SalePriceInput.tsx
│   │   │   ├── SaleQuantityInput.tsx
│   │   │   └── hooks/
│   │   │       └── useSaleForm.ts
│   │   ├── inventory/
│   │   │   └── InventoryAnalyzer.tsx
│   │   ├── reports/
│   │   │   ├── ProfitEvolution.tsx
│   │   │   ├── SalesReport.tsx
│   │   │   └── StockRotation.tsx
│   │   └── sections/
│   │       ├── AdvancedDashboardSection.tsx
│   │       ├── SalesManagementSection.tsx
│   │       └── SalesOverviewSection.tsx
│   ├── navigation/
│   │   └── AccessibleNavigation.tsx
│   ├── ui/                   # Composants UI (Shadcn)
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── alert.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   └── ... (40+ composants)
│   ├── Footer.tsx
│   ├── Layout.tsx
│   ├── Navbar.tsx
│   ├── PasswordInput.tsx
│   ├── PasswordStrengthChecker.tsx
│   └── ScrollToTop.tsx
├── contexts/                 # Contexts React
│   ├── AppContext.tsx        # État global application
│   ├── AuthContext.tsx       # Authentification
│   └── ThemeContext.tsx      # Thème clair/sombre
├── hooks/                    # Hooks personnalisés
│   ├── use-auto-logout.tsx
│   ├── use-currency-formatter.ts
│   ├── use-error-boundary.tsx
│   ├── use-messages.ts
│   ├── use-mobile.tsx
│   ├── use-professional-data.tsx
│   ├── use-realtime-sync.ts
│   ├── use-sse.ts
│   ├── use-toast.ts
│   ├── useBusinessCalculations.ts
│   └── useClientSync.ts
├── pages/                    # Pages de l'application
│   ├── AboutPage.tsx
│   ├── ClientsPage.tsx
│   ├── Comptabilite.tsx
│   ├── ContactPage.tsx
│   ├── DashboardPage.tsx
│   ├── Depenses.tsx
│   ├── HomePage.tsx
│   ├── Index.tsx
│   ├── LoginPage.tsx
│   ├── MessagesPage.tsx
│   ├── NotFound.tsx
│   ├── PretFamilles.tsx
│   ├── PretProduits.tsx
│   ├── Produits.tsx
│   ├── RegisterPage.tsx
│   ├── ResetPasswordPage.tsx
│   ├── Tendances.tsx
│   ├── TendancesPage.tsx
│   └── Ventes.tsx
├── services/                 # Services API
│   ├── api.ts
│   ├── beneficeService.ts
│   ├── BusinessCalculationService.ts
│   ├── dataOptimizationService.ts
│   ├── FormatService.ts
│   ├── optimizedRealtimeService.ts
│   ├── realtimeService.ts
│   ├── syncService.ts
│   └── realtime/
│       ├── DataCacheManager.ts
│       ├── EventSourceManager.ts
│       ├── RealtimeService.ts
│       └── types.ts
├── styles/                   # Styles CSS
│   ├── accessibility.css
│   ├── base/
│   │   ├── contrast.css
│   │   ├── motion.css
│   │   └── typography.css
│   ├── components/
│   │   ├── forms.css
│   │   └── navigation.css
│   └── utilities/
│       └── screen-reader.css
├── tests/                    # Tests
│   ├── backend/
│   ├── components/
│   ├── e2e/
│   ├── hooks/
│   ├── integration/
│   ├── performance/
│   └── services/
├── types/                    # Types TypeScript
│   └── index.ts
├── App.css
├── App.tsx                   # Composant racine
├── index.css                 # Styles globaux
├── main.tsx                  # Point d'entrée
└── window.d.ts
```

---

## 🎯 ARCHITECTURE GÉNÉRALE

### Hiérarchie des composants
```
App.tsx (root)
├── ThemeProvider          # Thème clair/sombre
│   └── AccessibilityProvider  # Accessibilité
│       └── AuthProvider       # Authentification
│           └── AppProvider    # État global
│               └── Router     # Navigation
│                   ├── Layout     # Structure commune
│                   │   ├── Navbar
│                   │   ├── Main (pages)
│                   │   └── Footer
│                   └── Routes
│                       ├── HomePage
│                       ├── LoginPage
│                       ├── DashboardPage (protégée)
│                       └── ...
```

---

## 📄 POINT D'ENTRÉE (main.tsx)

**Fichier** : `src/main.tsx` ligne 1-5

```typescript
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
```

**📝 Comment modifier** :
- **Ajouter un provider global** : Envelopper `<App />` ligne 5
- **Changer le point de montage** : Modifier `"root"` ligne 5

---

## 🏗️ COMPOSANT RACINE (App.tsx)

**Fichier** : `src/App.tsx` ligne 1-116

### Structure
1. **ErrorBoundary** : Capture les erreurs React
2. **ThemeProvider** : Gestion thème clair/sombre
3. **AccessibilityProvider** : Fonctionnalités d'accessibilité
4. **AuthProvider** : Gestion authentification
5. **AppProvider** : État global (produits, ventes, clients)
6. **Router** : Navigation entre pages
7. **Suspense** : Chargement lazy des pages

### Lazy Loading
```typescript
const HomePage = lazy(() => import('@/pages/HomePage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
// ...
```

**📝 Comment ajouter une page** :
1. Créer le fichier dans `src/pages/`
2. Importer en lazy ligne 28-38
3. Ajouter la route dans `<Routes>` ligne 59-104

**📝 Comment protéger une route** :
```typescript
<Route
  path="/nouvelle-page"
  element={
    <ProtectedRoute>
      <NouvellePage />
    </ProtectedRoute>
  }
/>
```

---

## 🔐 CONTEXTE D'AUTHENTIFICATION (AuthContext.tsx)

**Fichier** : `src/contexts/AuthContext.tsx`

### Interface
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
}
```

### Fonctionnalités
- **Persistance** : Stocke le token dans `localStorage`
- **Auto-restauration** : Vérifie le token au chargement
- **Redirection** : Navigue vers login si token invalide

**📝 Comment utiliser** :
```typescript
import { useAuth } from '@/contexts/AuthContext';

function MonComposant() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  const handleLogin = async () => {
    const success = await login({ email, password });
    if (success) {
      // Rediriger vers dashboard
    }
  };
  
  return <div>{user?.username}</div>;
}
```

**📝 Comment modifier** :
- **Ajouter des champs user** : Éditer l'interface `User` dans `src/types/index.ts`
- **Changer la durée de session** : Modifier la logique dans `login()`
- **Ajouter des rôles** : Ajouter un champ `role` dans `User` et vérifier dans `ProtectedRoute`

---

## 📊 CONTEXTE APPLICATION (AppContext.tsx)

**Fichier** : `src/contexts/AppContext.tsx`

### Interface
```typescript
interface AppContextType {
  products: readonly Product[];
  sales: readonly Sale[];
  clients: readonly Client[];
  pretFamilles: readonly PretFamille[];
  pretProduits: readonly PretProduit[];
  depensesDuMois: readonly DepenseDuMois[];
  depensesFixe: DepenseFixe | null;
  benefices: readonly Benefice[];
  messages: readonly Message[];
  
  isLoading: boolean;
  
  // Méthodes CRUD
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  addSale: (sale: Omit<Sale, 'id' | 'profit'>) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  
  // ... autres méthodes CRUD
  
  refreshData: () => Promise<void>;
}
```

### Fonctionnalités
- **État immuable** : Utilise `useImmerReducer`
- **Synchronisation temps réel** : Via `useRealtimeSync`
- **Cache local** : Optimise les performances

**📝 Comment ajouter une nouvelle entité** :
1. Ajouter le type dans `src/types/index.ts`
2. Ajouter l'état dans `AppState` ligne ~50
3. Créer les actions dans `AppAction` ligne ~70
4. Implémenter le reducer ligne ~100
5. Créer les méthodes CRUD ligne ~200
6. Exposer dans le context ligne ~400

**📝 Comment utiliser** :
```typescript
import { useApp } from '@/contexts/AppContext';

function MonComposant() {
  const { products, addProduct, isLoading } = useApp();
  
  const handleAdd = async () => {
    await addProduct({
      description: "Nouveau produit",
      purchasePrice: 100,
      quantity: 10
    });
  };
  
  return (
    <div>
      {products.map(p => <div key={p.id}>{p.description}</div>)}
    </div>
  );
}
```

---

## 🎨 CONTEXTE THÈME (ThemeContext.tsx)

**Fichier** : `src/contexts/ThemeContext.tsx`

### Interface
```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
```

**📝 Comment utiliser** :
```typescript
import { useTheme } from '@/contexts/ThemeContext';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
```

---

## 🧩 COMPOSANT LAYOUT (Layout.tsx)

**Fichier** : `src/components/Layout.tsx` ligne 1-63

### Structure
```typescript
<Layout requireAuth={true}>
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main>{children || <Outlet />}</main>
    <Footer />
    <ScrollToTop />
  </div>
  {isAuthenticated && <RealtimeWrapper />}
</Layout>
```

**Fonctionnalités** :
- Redirection si non authentifié (`requireAuth`)
- Annonce les changements de page (accessibilité)
- Active la synchro temps réel si authentifié

**📝 Comment modifier** :
- **Ajouter un sidebar** : Insérer avant `<main>` ligne 36-44
- **Changer la structure** : Éditer le JSX ligne 32-49

---

## 🏠 PAGES PRINCIPALES

### HomePage (src/pages/HomePage.tsx)
**Page d'accueil publique**
- Hero section
- Présentation des fonctionnalités
- Call-to-action vers inscription

**📝 Comment modifier le contenu** :
- Éditer le JSX principal
- Changer les textes
- Modifier les images dans `src/assets/`

---

### LoginPage (src/pages/LoginPage.tsx)
**Page de connexion**
- Formulaire email + mot de passe
- Lien vers inscription
- Lien vers réinitialisation

**📝 Comment modifier** :
- **Ajouter un champ** : Ajouter un input dans le formulaire
- **Changer la validation** : Éditer `handleSubmit`
- **Ajouter SSO (Google, etc.)** : Implémenter les boutons et logique OAuth

---

### RegisterPage (src/pages/RegisterPage.tsx)
**Page d'inscription**
- Formulaire complet
- Vérification force mot de passe
- Lien vers connexion

**📝 Comment ajouter un champ** :
1. Ajouter l'input dans le JSX
2. Ajouter l'état avec `useState`
3. Valider dans `handleSubmit`
4. Envoyer dans `register()` du context
5. Mettre à jour le backend `server/routes/auth.js`

---

### DashboardPage (src/pages/DashboardPage.tsx)
**Tableau de bord principal** (protégé)
- Vue d'ensemble des statistiques
- Gestion des produits
- Gestion des ventes
- Graphiques et rapports

**Structure** :
```typescript
<DashboardPage>
  <SalesOverviewSection />      {/* Stats générales */}
  <SalesManagementSection />    {/* Gestion ventes */}
  <AdvancedDashboardSection />  {/* Graphiques avancés */}
</DashboardPage>
```

**📝 Comment ajouter une section** :
1. Créer le composant dans `src/components/dashboard/sections/`
2. Importer dans `DashboardPage`
3. Ajouter dans le JSX

---

### ClientsPage (src/pages/ClientsPage.tsx)
**Gestion des clients** (protégé)
- Liste des clients
- Ajout / Modification / Suppression
- Recherche
- Historique des achats par client

**📝 Comment modifier** :
- **Ajouter un filtre** : Créer un state + input + logique de filtrage
- **Ajouter une colonne** : Éditer le tableau ligne ~150

---

### TendancesPage (src/pages/TendancesPage.tsx)
**Analyse des tendances** (protégé)
- Graphiques d'évolution
- Prédictions IA
- Rapports personnalisés

**📝 Comment ajouter un graphique** :
1. Utiliser `recharts` (déjà installé)
2. Créer un composant dans `src/components/dashboard/reports/`
3. Importer et utiliser dans `TendancesPage`

---

### MessagesPage (src/pages/MessagesPage.tsx)
**Messagerie** (protégé)
- Liste des messages reçus
- Badge compteur non lus
- Marquer lu/non lu
- Supprimer

**📝 Comment modifier** :
- **Ajouter réponse** : Créer un formulaire + route backend
- **Ajouter pièces jointes** : Utiliser upload + affichage

---

## 🧩 COMPOSANTS DASHBOARD

### StatCard (src/components/dashboard/StatCard.tsx)
**Carte de statistique réutilisable**

**Props** :
```typescript
interface StatCardProps {
  readonly title: string;
  readonly description: string;
  readonly value: React.ReactNode;
  readonly valueClassName?: string;
}
```

**Utilisation** :
```typescript
<StatCard
  title="Revenus totaux"
  description="Ce mois"
  value={formatCurrency(12500)}
  valueClassName="text-green-600"
/>
```

---

### AddProductForm (src/components/dashboard/AddProductForm.tsx)
**Formulaire d'ajout de produit**

**Champs** :
- Description
- Prix d'achat
- Quantité

**📝 Comment ajouter un champ** :
1. Ajouter l'input dans le JSX
2. Ajouter le state
3. Inclure dans `handleSubmit`
4. Mettre à jour le backend

---

### AddSaleForm (src/components/dashboard/AddSaleForm.tsx)
**Formulaire d'ajout de vente**

**Fonctionnalités** :
- Recherche produit
- Saisie quantité
- Calcul automatique profit
- Vérification stock

**📝 Comment modifier le calcul** :
- Éditer `calculateProfit()` dans `src/components/dashboard/forms/utils/saleCalculations.ts`

---

### SalesTable (src/components/dashboard/SalesTable.tsx)
**Tableau des ventes**

**Colonnes** :
- Date
- Produit
- Quantité
- Prix de vente
- Prix d'achat
- Profit
- Actions

**📝 Comment ajouter une colonne** :
1. Ajouter `<TableHead>` ligne ~50
2. Ajouter `<TableCell>` dans le map ligne ~70
3. Calculer/formater la valeur

---

### Inventaire (src/components/dashboard/Inventaire.tsx)
**Gestion de l'inventaire**

**Fonctionnalités** :
- Liste des produits
- Stock disponible
- Valeur totale
- Alertes stock bas

**📝 Comment ajouter une alerte** :
```typescript
const lowStockProducts = products.filter(p => p.quantity < 10);

{lowStockProducts.length > 0 && (
  <Alert variant="destructive">
    {lowStockProducts.length} produits en rupture de stock
  </Alert>
)}
```

---

### PretFamilles (src/components/dashboard/PretFamilles.tsx)
**Gestion des prêts familles**

**Fonctionnalités** :
- Liste des prêts
- Ajout remboursement
- Historique
- Calcul solde restant
- Suppression avec confirmation

**Structure d'un prêt** :
```typescript
interface PretFamille {
  id: string;
  nom: string;
  pretTotal: number;
  soldeRestant: number;
  remboursements?: Array<{
    montant: number;
    date: string;
  }>;
}
```

**📝 Comment modifier** :
- **Changer le calcul** : Éditer `handleAddRemboursement` ligne ~200
- **Ajouter un champ** : Suivre les étapes d'ajout de champ entité

---

### PretProduits (src/components/dashboard/PretProduits.tsx)
**Gestion des prêts de produits**

**Fonctionnalités similaires à PretFamilles**

---

### DepenseDuMois (src/components/dashboard/DepenseDuMois.tsx)
**Gestion des dépenses mensuelles**

**Fonctionnalités** :
- Liste des dépenses
- Ajout débit/crédit
- Calcul solde
- Catégories

**📝 Comment ajouter une catégorie** :
1. Ajouter dans le select ligne ~100
2. Éventuellement ajouter un style spécifique

---

## 🪝 HOOKS PERSONNALISÉS

### useBusinessCalculations
**Fichier** : `src/hooks/useBusinessCalculations.ts`

**Calcule les statistiques commerciales**

```typescript
const stats = useBusinessCalculations(sales);
// stats.totalRevenue
// stats.totalProfit
// stats.averageMargin
// ...
```

**📝 Comment ajouter un calcul** :
1. Ajouter dans le `useMemo` ligne ~10
2. Retourner dans l'objet ligne ~20
3. Typer dans l'interface

---

### useRealtimeSync
**Fichier** : `src/hooks/use-realtime-sync.ts`

**Synchronisation temps réel avec SSE**

**Options** :
```typescript
interface RealtimeSyncOptions {
  enabled?: boolean;      // Activer/désactiver
  interval?: number;      // Intervalle de polling (ms)
}
```

**Utilisation** :
```typescript
useRealtimeSync({ 
  enabled: isAuthenticated,
  interval: 30000  // 30 secondes
});
```

**📝 Comment modifier** :
- **Changer l'intervalle** : Passer `interval` dans les options
- **Désactiver** : Passer `enabled: false`

---

### useAutoLogout
**Fichier** : `src/hooks/use-auto-logout.tsx`

**Déconnexion automatique après inactivité**

**Délai par défaut** : 30 minutes

**📝 Comment modifier le délai** :
- Éditer `INACTIVITY_TIMEOUT` ligne ~5
- Valeur en millisecondes

---

### useCurrencyFormatter
**Fichier** : `src/hooks/use-currency-formatter.ts`

**Formatage des montants**

**Utilisation** :
```typescript
const formatCurrency = useCurrencyFormatter();

formatCurrency(1234.56);  // "1 234,56 €"
```

**📝 Comment changer la devise** :
- Éditer le paramètre `currency` ligne ~8
- Changer le locale ligne ~7

---

## 🎨 COMPOSANTS UI (Shadcn)

**Dossier** : `src/components/ui/`

### Composants disponibles
- `<Button>` : Boutons avec variants
- `<Card>` : Cartes conteneur
- `<Dialog>` : Modales
- `<Input>` : Champs de saisie
- `<Select>` : Menus déroulants
- `<Table>` : Tableaux
- `<Toast>` : Notifications
- `<Alert>` : Alertes
- `<Badge>` : Badges
- `<Tabs>` : Onglets
- ... 40+ composants

**📝 Comment personnaliser un composant** :
1. Éditer le fichier dans `src/components/ui/`
2. Modifier les variants dans `cva()`
3. Ou changer les styles Tailwind

**Exemple - Ajouter un variant au Button** :
```typescript
// src/components/ui/button.tsx
const buttonVariants = cva(
  "...",
  {
    variants: {
      variant: {
        default: "...",
        destructive: "...",
        // Ajouter un nouveau variant
        success: "bg-green-600 text-white hover:bg-green-700",
      }
    }
  }
)
```

---

## 🌐 SERVICES API

### api.ts
**Fichier** : `src/service/api.ts`

**Client Axios configuré**

**Configuration** :
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:10000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Intercepteurs** :
- Ajoute automatiquement le token JWT
- Gère les erreurs 401 (déconnexion)
- Retry automatique

**📝 Comment ajouter une méthode** :
```typescript
export const monService = {
  getItems: () => api.get('/items'),
  createItem: (data) => api.post('/items', data),
};
```

---

### FormatService
**Fichier** : `src/services/FormatService.ts`

**Formatage des données**

**Méthodes** :
- `formatCurrency(amount)` : Formate un montant
- `formatDate(date, format)` : Formate une date
- `formatNumber(number)` : Formate un nombre

**Utilisation** :
```typescript
import { FormatService } from '@/services/FormatService';

FormatService.formatCurrency(1234.56);  // "1 234,56 €"
FormatService.formatDate(new Date(), 'long');  // "15 janvier 2024"
```

---

### BusinessCalculationService
**Fichier** : `src/services/BusinessCalculationService.ts`

**Calculs métier purs**

**Fonctions** :
- `calculateProfit()` : Calcule le bénéfice
- `calculateMargin()` : Calcule la marge
- `calculateTotalRevenue()` : Calcule le CA
- `calculateROI()` : Calcule le ROI

**Utilisation** :
```typescript
import { businessCalculations } from '@/services/BusinessCalculationService';

const profit = businessCalculations.calculateProfit(
  sellingPrice,
  purchasePrice,
  quantity
);
```

**📝 Comment ajouter un calcul** :
1. Créer une fonction pure (pas d'effets de bord)
2. Tester avec des valeurs
3. Exporter

---

## 🎨 DESIGN SYSTEM

### index.css
**Fichier** : `src/index.css`

**Variables CSS (HSL uniquement)** :
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

**📝 Comment changer une couleur** :
1. Éditer la variable HSL dans `index.css`
2. Les changements s'appliquent partout automatiquement

**⚠️ IMPORTANT** :
- **TOUJOURS utiliser des couleurs HSL**
- **NE JAMAIS** utiliser `text-white`, `bg-black`, etc. directement
- **TOUJOURS** utiliser les tokens sémantiques

---

### tailwind.config.ts
**Fichier** : `tailwind.config.ts`

**Configuration Tailwind**

**📝 Comment ajouter une couleur** :
```typescript
theme: {
  extend: {
    colors: {
      'ma-couleur': 'hsl(var(--ma-couleur))',
    }
  }
}
```

---

## 🧪 TESTS

### Structure
```
src/tests/
├── backend/              # Tests backend
├── components/           # Tests composants
├── e2e/                  # Tests end-to-end
├── hooks/                # Tests hooks
├── integration/          # Tests d'intégration
├── performance/          # Tests de performance
└── services/             # Tests services
```

### Exemple de test composant
```typescript
import { render, screen } from '@testing-library/react';
import StatCard from '@/components/dashboard/StatCard';

describe('StatCard', () => {
  it('affiche le titre et la valeur', () => {
    render(
      <StatCard 
        title="Test" 
        description="Description"
        value="123"
      />
    );
    
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });
});
```

**📝 Comment ajouter un test** :
1. Créer un fichier `.test.tsx` à côté du composant
2. Importer `render`, `screen` de `@testing-library/react`
3. Écrire les tests avec `describe` et `it`
4. Lancer avec `npm test`

---

## 🔄 SYNCHRONISATION TEMPS RÉEL

### RealtimeWrapper
**Fichier** : `src/components/common/RealtimeWrapper.tsx`

**Enveloppe les composants authentifiés**

**Fonctionnalités** :
- Connexion SSE au serveur
- Écoute des événements de mise à jour
- Rafraîchit automatiquement les données
- Affiche un indicateur de connexion

**📝 Comment désactiver** :
- Retirer le wrapper dans `Layout.tsx` ligne 52-57

---

### realtimeService
**Fichier** : `src/services/realtimeService.ts`

**Service de gestion SSE**

**Méthodes** :
- `connect()` : Établit la connexion SSE
- `disconnect()` : Ferme la connexion
- `onUpdate(callback)` : Écoute les mises à jour

**📝 Comment modifier** :
- **Changer l'URL SSE** : Éditer ligne ~15
- **Ajouter un type d'événement** : Ajouter un listener ligne ~30

---

## ✅ CHECKLIST MODIFICATION FRONTEND

### Pour ajouter une nouvelle page :
1. [ ] Créer le fichier dans `src/pages/`
2. [ ] Importer en lazy dans `App.tsx`
3. [ ] Ajouter la route dans `<Routes>`
4. [ ] Protéger si nécessaire avec `<ProtectedRoute>`
5. [ ] Ajouter le lien dans la navigation
6. [ ] Tester la navigation

### Pour ajouter un nouveau composant :
1. [ ] Créer dans le bon dossier (`components/`)
2. [ ] Définir les props avec TypeScript
3. [ ] Utiliser les composants UI de Shadcn
4. [ ] Utiliser les tokens sémantiques (pas de couleurs directes)
5. [ ] Mémoïser si nécessaire (`React.memo`)
6. [ ] Tester le composant

### Pour modifier un formulaire :
1. [ ] Identifier le composant formulaire
2. [ ] Ajouter/modifier les champs
3. [ ] Mettre à jour la validation
4. [ ] Tester la soumission
5. [ ] Vérifier l'API backend correspondante

### Pour ajouter une fonctionnalité temps réel :
1. [ ] Ajouter l'événement SSE dans le backend
2. [ ] Écouter dans `realtimeService`
3. [ ] Mettre à jour le state dans `AppContext`
4. [ ] Vérifier l'affichage temps réel

### Pour modifier le design :
1. [ ] Éditer `index.css` pour les variables CSS
2. [ ] Utiliser UNIQUEMENT des couleurs HSL
3. [ ] Tester en mode clair ET sombre
4. [ ] Vérifier le contraste (accessibilité)
5. [ ] Tester sur mobile

### Pour optimiser les performances :
1. [ ] Mémoïser les composants lourds (`React.memo`)
2. [ ] Mémoïser les calculs (`useMemo`)
3. [ ] Mémoïser les callbacks (`useCallback`)
4. [ ] Lazy load les pages
5. [ ] Optimiser les images
6. [ ] Débouncer les recherches

---

## 🚀 COMMANDES UTILES

```bash
# Démarrer le dev
npm run dev

# Build production
npm run build

# Tester
npm test

# Linter
npm run lint

# Preview production
npm run preview
```

---

## 🐛 DÉBOGAGE

### Erreurs courantes

#### "Module not found"
- Vérifier le chemin d'import
- Vérifier l'alias `@/` dans `vite.config.ts`

#### "Cannot read property of undefined"
- Vérifier que les données sont chargées (`isLoading`)
- Ajouter des guards (`data?.property`)

#### "Too many re-renders"
- Vérifier les dépendances de `useEffect`
- Mémoïser les fonctions avec `useCallback`

#### Styles ne s'appliquent pas
- Vérifier que les classes Tailwind sont correctes
- Vérifier les variables CSS dans `index.css`
- Vérifier la configuration Tailwind

### DevTools
- React DevTools : Inspecter les composants
- Redux DevTools : Inspecter le state (si utilisé)
- Network tab : Vérifier les requêtes API

---

## 📚 RESSOURCES

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/UI](https://ui.shadcn.com/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/docs/intro)
