
# GUIDE DES TESTS

## Vue d'ensemble

Ce guide présente la stratégie de tests complète mise en place pour assurer la qualité et la fiabilité du système de gestion commerciale.

## Pyramide de Tests

### 1. Tests Unitaires (70%)
- **Composants purs** : Tests isolés des fonctions de présentation
- **Hooks personnalisés** : Validation de la logique métier
- **Services** : Tests des fonctions pures de calcul
- **Utilitaires** : Validation des fonctions helper

### 2. Tests d'Intégration (20%)
- **Workflows complets** : Tests des interactions entre composants
- **Contextes** : Validation de la gestion d'état
- **API** : Tests des endpoints avec base de données
- **Synchronisation** : Tests des mises à jour temps réel

### 3. Tests End-to-End (10%)
- **Parcours utilisateur** : Validation des scénarios complets
- **Performance** : Tests de charge et temps de réponse
- **Accessibilité** : Conformité aux standards WCAG
- **Compatibilité** : Tests multi-navigateurs

## Configuration des Tests

### Frontend (Vitest)
```typescript
// vitest.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

### Backend (Jest)
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### E2E (Playwright)
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './src/tests/e2e',
  timeout: 30000,
  retries: 2,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry'
  }
});
```

## Tests par Catégorie

### Tests de Composants
```typescript
describe('StatCard', () => {
  it('affiche les données correctement', () => {
    render(<StatCard title="Test" value={100} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('est mémoïsé pour éviter les re-renders', () => {
    const { rerender } = render(<StatCard title="Test" value={100} />);
    const firstRender = screen.getByRole('article');
    rerender(<StatCard title="Test" value={100} />);
    expect(screen.getByRole('article')).toBe(firstRender);
  });
});
```

### Tests de Hooks
```typescript
describe('useBusinessCalculations', () => {
  it('calcule les statistiques correctement', () => {
    const { result } = renderHook(() => 
      useBusinessCalculations(mockSales)
    );
    
    expect(result.current.totalRevenue).toBe(400);
    expect(result.current.totalProfit).toBe(160);
  });

  it('recalcule uniquement lors de changements', () => {
    const { result, rerender } = renderHook(
      ({ sales }) => useBusinessCalculations(sales),
      { initialProps: { sales: mockSales } }
    );

    const firstResult = result.current;
    rerender({ sales: mockSales }); // Même référence
    expect(result.current).toBe(firstResult);
  });
});
```

### Tests de Services
```typescript
describe('BusinessCalculationService', () => {
  describe('calculateProfit', () => {
    it('calcule le bénéfice simple', () => {
      const profit = BusinessCalculationService.calculateProfit({
        sellingPrice: 150,
        purchasePrice: 100,
        quantity: 1
      });
      expect(profit).toBe(50);
    });

    it('gère les quantités multiples', () => {
      const profit = BusinessCalculationService.calculateProfit({
        sellingPrice: 150,
        purchasePrice: 100,
        quantity: 3
      });
      expect(profit).toBe(150);
    });
  });
});
```

### Tests d'Intégration
```typescript
describe('Workflow de Vente', () => {
  it('effectue un workflow complet', async () => {
    render(
      <TestWrapper>
        <VentesProduits />
      </TestWrapper>
    );

    // Ajouter une vente
    fireEvent.click(screen.getByRole('button', { name: /nouvelle vente/i }));
    
    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText(/produit/i), 
      { target: { value: 'prod1' } });
    fireEvent.change(screen.getByLabelText(/prix/i), 
      { target: { value: '150' } });
    
    // Soumettre
    fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));

    // Vérifier les appels API
    await waitFor(() => {
      expect(mockApiService.addSale).toHaveBeenCalled();
      expect(mockApiService.addClient).toHaveBeenCalled();
    });

    // Vérifier l'interface
    expect(screen.getByText('150 €')).toBeInTheDocument();
  });
});
```

### Tests E2E
```typescript
test('Parcours utilisateur complet', async ({ page }) => {
  // Inscription
  await page.click('text=S\'inscrire');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button:has-text("Créer mon compte")');

  // Ajouter un produit
  await page.click('text=Ajouter Produit');
  await page.fill('[name="description"]', 'Test Product');
  await page.fill('[name="purchasePrice"]', '75');
  await page.click('button:has-text("Ajouter")');

  // Vérifier l'ajout
  await expect(page.locator('text=Test Product')).toBeVisible();
});
```

## Mocks et Fixtures

### Données de Test
```typescript
export const mockProducts: Product[] = [
  {
    id: '1',
    description: 'Perruque Lisse',
    purchasePrice: 50,
    quantity: 10,
    imageUrl: null
  }
];

export const mockSales: Sale[] = [
  {
    id: '1',
    date: '2024-01-15',
    productId: '1',
    description: 'Perruque Lisse',
    sellingPrice: 100,
    quantitySold: 1,
    purchasePrice: 50,
    profit: 50
  }
];
```

### Mocks de Services
```typescript
export const mockApiService = {
  getProducts: vi.fn().mockResolvedValue(mockProducts),
  addProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn()
};

vi.mock('@/service/api', () => ({
  productService: mockApiService
}));
```

### Helpers de Test
```typescript
export const testUtils = {
  renderWithProviders: (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={testQueryClient}>
        <AuthProvider>
          <AppProvider>
            {component}
          </AppProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  },

  waitForElement: async (selector: string) => {
    return await waitFor(() => {
      const element = screen.getByTestId(selector);
      expect(element).toBeInTheDocument();
      return element;
    });
  }
};
```

## Couverture de Tests

### Objectifs de Couverture
- **Lignes** : >80%
- **Fonctions** : >80%
- **Branches** : >80%
- **Statements** : >80%

### Composants Critiques (100%)
- Authentification
- Gestion des ventes
- Calculs de bénéfices
- Synchronisation temps réel

### Génération des Rapports
```bash
# Frontend
npm run test:coverage

# Backend
npm run test:coverage

# E2E
npm run test:e2e:report
```

## Stratégies de Test

### Tests de Régression
- Snapshot testing pour les composants UI
- Tests de non-régression pour les calculs
- Validation des workflows critiques

### Tests de Performance
- Temps de rendu des composants
- Vitesse des calculs métier
- Performance des requêtes API

### Tests d'Accessibilité
- Navigation au clavier
- Lecteurs d'écran
- Contraste et couleurs

### Tests de Sécurité
- Validation des entrées
- Protection XSS/CSRF
- Gestion des sessions

## Automatisation CI/CD

### Pipeline de Tests
```yaml
# .github/workflows/tests.yml
name: Tests
on: [push, pull_request]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:e2e

  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:backend
```

### Quality Gates
- Couverture minimale : 80%
- Pas de tests en échec
- Performance acceptable
- Accessibilité conforme

## Outils de Test

### Frontend
- **Vitest** : Runner de tests rapide
- **React Testing Library** : Tests orientés utilisateur
- **MSW** : Mock Service Worker pour API
- **Playwright** : Tests E2E cross-browser

### Backend
- **Jest** : Framework de tests complet
- **Supertest** : Tests d'API HTTP
- **Nock** : Mock des requêtes HTTP
- **Factory-bot** : Génération de données test

### Monitoring
- **Coverage.js** : Rapports de couverture
- **Lighthouse CI** : Tests de performance
- **Pa11y** : Tests d'accessibilité automatisés

## Bonnes Pratiques

### 1. Organisation des Tests
```
src/tests/
├── components/        # Tests de composants
├── hooks/            # Tests de hooks
├── services/         # Tests de services
├── integration/      # Tests d'intégration
├── e2e/             # Tests end-to-end
├── fixtures/        # Données de test
└── utils/           # Utilitaires de test
```

### 2. Nommage des Tests
- **Describe** : Nom du composant/fonction
- **It** : Comportement attendu en français
- **Given/When/Then** : Structure claire

### 3. Isolation des Tests
- Chaque test est indépendant
- Nettoyage après chaque test
- Pas d'effets de bord

### 4. Tests Lisibles
- Noms descriptifs
- AAA Pattern (Arrange, Act, Assert)
- Comments explicatifs si nécessaire

### 5. Maintenance des Tests
- Refactoring régulier
- Suppression des tests obsolètes
- Mise à jour des mocks

## Commandes Utiles

```bash
# Lancer tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Couverture complète
npm run test:coverage

# Tests d'un fichier spécifique
npm test ProductStats

# Tests E2E
npm run test:e2e

# Tests avec interface graphique
npm run test:ui

# Débug des tests
npm run test:debug
```

Cette stratégie de tests complète garantit la qualité, la fiabilité et la maintenabilité du système de gestion commerciale.
