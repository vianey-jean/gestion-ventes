# GUIDE DE SÉCURITÉ ET TESTS

## Système de Gestion Commerciale

**Version**: 2.0.0  
**Dernière mise à jour**: 24 décembre 2025

---

## 📋 Table des Matières

1. [Sécurité Backend](#sécurité-backend)
2. [Sécurité Frontend](#sécurité-frontend)
3. [Authentification JWT](#authentification-jwt)
4. [Protection des Données](#protection-des-données)
5. [Tests Unitaires](#tests-unitaires)
6. [Tests d'Intégration](#tests-dintégration)
7. [Tests E2E](#tests-e2e)
8. [Checklist de Sécurité](#checklist-de-sécurité)

---

## Sécurité Backend

### 1. Rate Limiting

Protection contre les attaques par force brute et DDoS.

```javascript
// Configuration des limiteurs
const generalLimiter = new RateLimiter(60000, 100);  // 100 req/min
const authLimiter = new RateLimiter(60000, 10);      // 10 req/min auth
const strictLimiter = new RateLimiter(60000, 5);     // 5 req/min sensible
```

### 2. Validation des Entrées

```javascript
const loginSchema = {
  email: { required: true, type: 'email', maxLength: 255 },
  password: { required: true, type: 'password', minLength: 6 }
};

// Types de validation
// - email: Format email valide
// - phone: Format téléphone (6-20 caractères)
// - password: 6-128 caractères
// - text: Longueur maximale configurable
// - number: Min/max optionnels
// - date: Format date valide
```

### 3. Sanitisation

```javascript
// Caractères supprimés/échappés
const dangerousPatterns = [
  /</g, />/g, /"/g, /'/g, /`/g,
  /javascript:/gi, /data:/gi, /on\w+=/gi
];

// Protection contre:
// - Injection XSS
// - Injection SQL
// - Injection NoSQL
// - Path traversal
```

### 4. Headers de Sécurité

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### 5. Détection d'Intrusions

```javascript
const suspiciousPatterns = [
  /(\.\.)\//, // Path traversal
  /<script/i, // XSS
  /union.*select/i, // SQL injection
  /\$where/i, // NoSQL injection
];

// Logging des activités suspectes
logger.warn('Suspicious activity', { ip, pattern, path });
```

---

## Sécurité Frontend

### 1. Sanitisation XSS

```typescript
import { sanitizeString } from '@/lib/security';

// Échappe les caractères dangereux
const safeInput = sanitizeString(userInput);
```

### 2. Validation des Formulaires

```typescript
import { validateForm, validators } from '@/lib/security';

const result = validateForm(formData, {
  email: { required: true, type: 'email' },
  password: { required: true, type: 'password' },
  name: { required: true, type: 'text', maxLength: 100 }
});

if (!result.isValid) {
  showErrors(result.errors);
}
```

### 3. Protection CSRF

```typescript
import { generateCSRFToken, validateCSRFToken } from '@/lib/security';

const token = generateCSRFToken();
storeCSRFToken(token);

// Avant opération sensible
if (!validateCSRFToken(receivedToken)) {
  throw new Error('Token CSRF invalide');
}
```

### 4. Rate Limiting Client

```typescript
import { authRateLimiter } from '@/lib/security';

const handleLogin = async () => {
  if (!authRateLimiter.isAllowed('login')) {
    const retryAfter = authRateLimiter.getRetryAfter('login');
    toast.error(`Réessayez dans ${retryAfter}s`);
    return;
  }
  // Procéder...
};
```

### 5. Validation d'URLs

```typescript
import { isSafeUrl } from '@/lib/security';

const handleLink = (url: string) => {
  if (!isSafeUrl(url)) {
    console.warn('URL dangereuse bloquée');
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
};
```

---

## Authentification JWT

### Configuration

```javascript
const jwtConfig = {
  algorithm: 'HS256',
  expiresIn: '8h',
  issuer: 'gestion-commerciale'
};
```

### Génération de Token

```javascript
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
};
```

### Middleware de Validation

```javascript
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token requis' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    req.user = user;
    next();
  });
};
```

### Hashage des Mots de Passe

```javascript
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Hashage
const hash = await bcrypt.hash(password, saltRounds);

// Vérification
const isValid = await bcrypt.compare(password, hash);
```

---

## Protection des Données

### Objectifs Mensuels

Les objectifs des mois passés sont verrouillés :

```javascript
// server/models/Objectif.js
updateObjectif: (newObjectif, targetMonth, targetYear) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  // Vérification: mois passés verrouillés
  if (targetYear < currentYear || 
      (targetYear === currentYear && targetMonth < currentMonth)) {
    throw new Error('Cannot modify objectif for past months');
  }
  
  // Mise à jour autorisée
  data.objectif = Number(newObjectif);
  writeData(data);
}
```

### Notifications

Accès contrôlé aux notifications utilisateur :

```javascript
// Seules les notifications de l'utilisateur connecté
router.get('/', authenticateToken, (req, res) => {
  const notifications = Notification.getByUser(req.user.id);
  res.json(notifications);
});
```

### Rendez-vous

Protection des données RDV :

```javascript
// Validation avant création/modification
const validateRdv = (rdv) => {
  if (!rdv.titre || rdv.titre.length > 200) {
    throw new Error('Titre invalide');
  }
  if (!isValidDate(rdv.date)) {
    throw new Error('Date invalide');
  }
  // Sanitisation
  rdv.titre = sanitizeString(rdv.titre);
  rdv.description = sanitizeString(rdv.description);
};
```

---

## Tests Unitaires

### Configuration Vitest

```typescript
// vitest.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80
        }
      }
    }
  }
});
```

### Tests de Composants

```typescript
// StatCard.test.tsx
describe('StatCard', () => {
  it('affiche le titre et la valeur', () => {
    render(<StatCard title="Test" value={123} />);
    
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('est un composant pur', () => {
    const { rerender } = render(<StatCard title="Test" value={123} />);
    const first = screen.getByRole('article').innerHTML;
    
    rerender(<StatCard title="Test" value={123} />);
    const second = screen.getByRole('article').innerHTML;
    
    expect(first).toBe(second);
  });
});
```

### Tests de Hooks

```typescript
// useObjectif.test.tsx
describe('useObjectif', () => {
  it('charge les données', async () => {
    const { result } = renderHook(() => useObjectif());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeDefined();
    });
  });

  it('met à jour l\'objectif', async () => {
    const { result } = renderHook(() => useObjectif());
    
    await act(async () => {
      await result.current.updateObjectif(3000);
    });
    
    expect(result.current.data?.objectif).toBe(3000);
  });
});
```

### Tests de Services

```typescript
// FormatService.test.ts
describe('FormatService', () => {
  describe('formatCurrency', () => {
    it('formate en euros', () => {
      expect(FormatService.formatCurrency(1234.56)).toBe('1 234,56 €');
    });

    it('gère les valeurs invalides', () => {
      expect(FormatService.formatCurrency(NaN)).toBe('0,00 €');
    });
  });
});
```

---

## Tests d'Intégration

### Tests de Contextes

```typescript
// AuthContext.test.tsx
const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext', () => {
  it('connecte un utilisateur', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const success = await result.current.login({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(success).toBe(true);
    });

    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

### Tests de Workflow

```typescript
// SalesWorkflow.test.tsx
describe('Workflow de vente', () => {
  it('crée une vente complète', async () => {
    renderWithProviders(<VentesProduits />);

    // Ouvrir formulaire
    fireEvent.click(screen.getByRole('button', { name: /ajouter/i }));

    // Remplir
    fireEvent.change(screen.getByLabelText(/produit/i), { 
      target: { value: 'Product 1' } 
    });
    fireEvent.change(screen.getByLabelText(/prix/i), { 
      target: { value: '100' } 
    });

    // Soumettre
    fireEvent.click(screen.getByRole('button', { name: /ajouter/i }));

    await waitFor(() => {
      expect(mockApiService.addSale).toHaveBeenCalled();
    });
  });
});
```

### Tests d'Objectifs

```typescript
// ObjectifWorkflow.test.tsx
describe('Workflow objectifs', () => {
  it('ne modifie pas les mois passés', async () => {
    const pastMonth = new Date().getMonth(); // Mois précédent
    
    await expect(
      objectifApi.updateObjectif(3000, pastMonth, 2025)
    ).rejects.toThrow('Cannot modify objectif for past months');
  });

  it('modifie le mois en cours', async () => {
    const currentMonth = new Date().getMonth() + 1;
    const result = await objectifApi.updateObjectif(3000, currentMonth, 2025);
    
    expect(result.objectif).toBe(3000);
  });
});
```

---

## Tests E2E

### Configuration Playwright

```typescript
// playwright.config.ts
export default {
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry'
  }
};
```

### Tests de Parcours Utilisateur

```typescript
// userJourney.test.ts
test('parcours complet utilisateur', async ({ page }) => {
  // Connexion
  await page.goto('/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Vérification dashboard
  await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();

  // Navigation vers RDV
  await page.click('a[href="/rdv"]');
  await expect(page.locator('.calendar-grid')).toBeVisible();

  // Création RDV
  await page.click('[data-testid="new-rdv"]');
  await page.fill('[name="titre"]', 'Test RDV');
  await page.click('button[type="submit"]');

  await expect(page.locator('text=Test RDV')).toBeVisible();
});
```

---

## Checklist de Sécurité

### Avant Déploiement

- [ ] Variables d'environnement configurées
- [ ] JWT_SECRET complexe (min 32 caractères)
- [ ] HTTPS activé
- [ ] CORS configuré avec origines spécifiques
- [ ] Rate limiting testé
- [ ] Headers de sécurité vérifiés
- [ ] Logs sans données sensibles
- [ ] Dépendances à jour (`npm audit`)

### Maintenance Continue

- [ ] Audit régulier des dépendances
- [ ] Rotation des secrets JWT
- [ ] Revue des logs d'activités suspectes
- [ ] Tests de pénétration périodiques
- [ ] Mise à jour des certificats SSL
- [ ] Backup des données

### Réponse aux Incidents

1. **Immédiat:**
   - Révoquer tous les tokens JWT
   - Bloquer les IPs suspectes
   - Activer le mode maintenance

2. **Investigation:**
   - Analyser les logs
   - Identifier les données affectées
   - Déterminer le vecteur d'attaque

3. **Correction:**
   - Corriger la vulnérabilité
   - Mettre à jour les mots de passe
   - Notifier les utilisateurs

4. **Prévention:**
   - Documenter l'incident
   - Renforcer les contrôles
   - Former l'équipe

---

## Mocking et Utilitaires de Test

### Mocks API

```typescript
const mockApiService = {
  getProducts: vi.fn().mockResolvedValue([]),
  addProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn()
};

vi.mock('@/services/api', () => ({
  productApi: mockApiService
}));
```

### Provider de Test

```typescript
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      <AppProvider>
        {component}
      </AppProvider>
    </AuthProvider>
  );
};
```

### Assertions Accessibilité

```typescript
it('respecte les standards d\'accessibilité', () => {
  render(<Component />);
  
  expect(screen.getByRole('button')).toHaveAttribute('aria-label');
  expect(screen.getByLabelText('Input')).toBeInTheDocument();
});
```

---

*Guide Sécurité et Tests mis à jour le 24 décembre 2025*
