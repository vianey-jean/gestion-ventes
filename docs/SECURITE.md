# Documentation - Sécurité

## Vue d'ensemble

Ce document détaille toutes les mesures de sécurité implémentées dans l'application, côté frontend et backend.

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

**Réponse en cas de dépassement:**
```json
{
  "error": "Trop de requêtes",
  "message": "Veuillez réessayer dans X secondes",
  "retryAfter": 30
}
```

### 2. Validation des Entrées

Tous les inputs sont validés avant traitement.

```javascript
// Schéma de validation exemple
const loginSchema = {
  email: { required: true, type: 'email' },
  password: { required: true, type: 'password' }
};
```

**Types de validation:**
- `email`: Format email valide, max 255 caractères
- `phone`: Format téléphone, 6-20 caractères
- `password`: 6-128 caractères
- `text`: Texte avec longueur maximale configurable
- `number`: Nombre avec min/max optionnels
- `date`: Format date valide

### 3. Sanitization

Nettoyage automatique de tous les inputs.

```javascript
// Caractères supprimés/échappés
< > " ' / ` javascript: data: on*=
```

**Protection contre:**
- Injection XSS
- Injection SQL
- Injection NoSQL
- Path traversal

### 4. Headers de Sécurité

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Content-Security-Policy: default-src 'self'; frame-ancestors 'none'
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### 5. Authentification JWT

```javascript
// Configuration
{
  algorithm: 'HS256',
  expiresIn: '8h',        // Token expire après 8 heures
  issuer: 'gestion-ventes'
}
```

**Bonnes pratiques implémentées:**
- Expiration courte (8h au lieu de 24h)
- Secret complexe via variable d'environnement
- Pas de données sensibles dans le payload
- Validation du token à chaque requête protégée

### 6. Hachage des Mots de Passe

```javascript
// Utilisation de bcrypt
const saltRounds = 10;
const hashedPassword = bcrypt.hashSync(password, saltRounds);
```

### 7. Gestion des Erreurs Sécurisée

```javascript
// En production: messages génériques
res.status(500).json({ 
  error: 'Une erreur est survenue',
  message: 'Erreur serveur interne'
  // Pas de stack trace
});

// Messages d'auth génériques pour éviter l'énumération
res.status(401).json({ message: 'Identifiants invalides' });
```

### 8. Détection d'Intrusions

Monitoring des patterns suspects:

```javascript
const suspiciousPatterns = [
  /(\.\.)\//, // Path traversal
  /<script/i, // XSS
  /union.*select/i, // SQL injection
  /javascript:/i,
  /\$where/i, // NoSQL injection
];
```

Logging des activités suspectes avec IP, timestamp, et détails.

---

## Sécurité Frontend

### 1. Sanitization XSS

```typescript
import { sanitizeString } from '@/lib/security';

// Échappe les caractères dangereux
const safeInput = sanitizeString(userInput);
// < > " ' / ` sont échappés
// javascript: data: on*= sont supprimés
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
import { generateCSRFToken, storeCSRFToken, validateCSRFToken } from '@/lib/security';

// Générer et stocker un token
const token = generateCSRFToken();
storeCSRFToken(token);

// Valider avant opération sensible
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
    toast.error(`Trop de tentatives. Réessayez dans ${retryAfter}s`);
    return;
  }
  
  // Procéder à la connexion
};
```

### 5. Validation d'URLs

```typescript
import { isSafeUrl } from '@/lib/security';

const handleLink = (url: string) => {
  if (!isSafeUrl(url)) {
    console.warn('URL dangereuse bloquée:', url);
    return;
  }
  window.open(url, '_blank');
};
```

### 6. Stockage Sécurisé

```typescript
import { secureStorage } from '@/lib/security';

// Stockage avec sanitization automatique
secureStorage.set('userData', userData);

// Récupération typée
const data = secureStorage.get<UserData>('userData');
```

### 7. Masquage des Données Sensibles

```typescript
import { maskEmail, maskSensitiveData } from '@/lib/security';

// Affichage sécurisé
const displayEmail = maskEmail('user@example.com');
// u****r@example.com

const displayPhone = maskSensitiveData('0692123456', 4);
// ******3456
```

---

## Vérification de la Force du Mot de Passe

```typescript
import { checkPasswordStrength } from '@/lib/security';

const { score, label, suggestions } = checkPasswordStrength(password);

// score: 0-6
// label: 'faible' | 'moyen' | 'fort' | 'très fort'
// suggestions: ['Ajouter des majuscules', ...]
```

**Critères évalués:**
- Longueur >= 8 caractères
- Longueur >= 12 caractères
- Contient des minuscules
- Contient des majuscules
- Contient des chiffres
- Contient des caractères spéciaux

---

## Checklist Sécurité

### Avant Déploiement

- [ ] Variables d'environnement configurées
- [ ] JWT_SECRET complexe (min 32 caractères)
- [ ] HTTPS activé
- [ ] CORS configuré avec origines spécifiques
- [ ] Rate limiting testé
- [ ] Headers de sécurité vérifiés
- [ ] Logs de production sans données sensibles
- [ ] Dépendances à jour

### Maintenance Continue

- [ ] Audit régulier des dépendances (`npm audit`)
- [ ] Rotation des secrets JWT
- [ ] Revue des logs d'activités suspectes
- [ ] Tests de pénétration périodiques
- [ ] Mise à jour des certificats SSL

---

## Réponse aux Incidents

### En cas de Compromission

1. **Immédiat:**
   - Révoquer tous les tokens JWT en changeant le secret
   - Bloquer les IPs suspectes
   - Activer le mode maintenance

2. **Investigation:**
   - Analyser les logs d'accès
   - Identifier les données affectées
   - Déterminer le vecteur d'attaque

3. **Correction:**
   - Corriger la vulnérabilité
   - Mettre à jour les mots de passe si nécessaire
   - Notifier les utilisateurs affectés

4. **Prévention:**
   - Documenter l'incident
   - Renforcer les contrôles
   - Former l'équipe

---

## Configuration CORS

```javascript
const corsOptions = {
  origin: [
    'https://votre-domaine.com',
    'https://app.votre-domaine.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};
```

**En développement:** Toutes les origines autorisées
**En production:** Liste blanche stricte

---

*Documentation mise à jour le 22 décembre 2025*
