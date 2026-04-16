# 🔐 Documentation Sécurité — Riziky Gestion

> Ce document détaille tous les mécanismes de sécurité de l'application.

---

## 1. Authentification JWT

### Fonctionnement

1. L'utilisateur se connecte avec email + mot de passe
2. Le serveur génère un **token JWT** signé avec `JWT_SECRET`
3. Le token est valide **8 heures**
4. Le frontend stocke le token dans `localStorage`
5. Chaque requête API envoie le token dans le header : `Authorization: Bearer <token>`
6. Le middleware `auth.js` vérifie le token à chaque requête protégée

### Structure du token

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234596690
}
```

### Vérification automatique

Au démarrage de l'application, `AuthContext` appelle `GET /api/auth/verify` pour vérifier que le token est encore valide et que l'utilisateur existe toujours.

---

## 2. Protection anti-brute-force

### Paramètres configurables (par utilisateur)

| Paramètre | Champ dans `users.json` | Défaut | Configurable dans |
|-----------|------------------------|--------|-------------------|
| Tentatives max | `nombreConnexion` | 5 | `SecuriteSection.tsx` (Profil) |
| Durée blocage | `tempsBlocage` | 15 min | `SecuriteSection.tsx` (Profil) |

### Mécanisme

```
Tentative 1 : échec → failedAttempts = 1
Tentative 2 : échec → failedAttempts = 2
...
Tentative 5 : échec → COMPTE BLOQUÉ pendant 15 minutes
                       lockedUntil = maintenant + 15 min
```

Après le délai : les tentatives sont réinitialisées à 0.

### Affichage côté client

- La page de login affiche : "Il vous reste X tentatives"
- Quand bloqué : "Compte bloqué, réessayez dans XX:XX"
- Un compte à rebours s'affiche en temps réel

---

## 3. Chiffrement de la base de données

### Comment ça marche

Le fichier `patchDbIO.js` **intercepte** les fonctions native de Node.js :
- `fs.readFileSync` → si le fichier est dans `db/`, le déchiffre automatiquement
- `fs.writeFileSync` → si le fichier est dans `db/`, le chiffre automatiquement

### Clé de chiffrement

- Stockée dans la variable d'environnement `ENCRYPTION_KEY`
- **Minimum 10 caractères** obligatoire
- Si la clé change, toutes les données sont perdues (fichiers illisibles)

### Algorithme

Chiffrement AES symétrique via les fonctions dans `encryption.js`.

---

## 4. Middlewares de sécurité

### Rate Limiting (`security.js`)

Limite le nombre de requêtes par IP par minute pour prévenir les attaques DDoS.

### Sanitization (`security.js`)

Nettoie toutes les entrées utilisateur pour prévenir :
- **XSS** (Cross-Site Scripting) : supprime les balises `<script>`
- **Injection** : échappe les caractères spéciaux

### Headers sécurisés (`security.js`)

Ajoute des headers HTTP de sécurité :
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HSTS)

### Log activité suspecte

Les requêtes suspectes (patterns d'attaque, tentatives d'injection) sont loguées avec l'IP source.

---

## 5. Page de vérification de sécurité

**Composant :** `SecurityCheckPage.tsx`

Au premier accès à l'application, une page de vérification s'affiche. L'utilisateur doit répondre correctement pour accéder au site.

- Valide pendant **24 heures** (stocké dans `sessionStorage`)
- Empêche l'accès non autorisé même si quelqu'un a l'URL

---

## 6. Protection des formulaires

**Context :** `FormProtectionContext.tsx`

Empêche la perte de données si l'utilisateur quitte accidentellement un formulaire non sauvegardé :
- Détecte si un formulaire a été modifié
- Affiche un avertissement avant de quitter la page

---

## 7. Déconnexion automatique

**Hook :** `use-auto-logout.tsx`

Déconnecte automatiquement l'utilisateur après une période d'inactivité pour protéger les données en cas d'oubli.

---

## 8. CORS

Le serveur n'accepte les requêtes que depuis les origines autorisées :
- `https://riziky-gestion-ventes.vercel.app` (production)
- `http://localhost:5173` (développement)

Configuré dans `server.js`.

---

## 9. Hashage des mots de passe

Les mots de passe sont **hashés** avec `bcryptjs` avant stockage. Le mot de passe en clair n'est **jamais** stocké dans la base de données.

### Validation du mot de passe (réinitialisation)

- Minimum 6 caractères
- Au moins 1 majuscule
- Au moins 1 minuscule
- Au moins 1 chiffre
- Au moins 1 caractère spécial (`!@#$%^&*()...`)
