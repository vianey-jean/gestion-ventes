# 🔐 Sécurité

| Couche | Mesure |
|---|---|
| Vérification navigateur | `SecurityCheckPage` : captcha maison (glisser-déposer d'étoiles). Succès mémorisé via `security_browser_trusted` (localStorage) et `security_verified` (sessionStorage, 24 h) |
| Authentification | JWT signé, expiration 8 h, en-tête `Authorization: Bearer` |
| Mots de passe | bcrypt 10 rounds, `PasswordStrengthChecker` côté saisie |
| Session | `use-auto-logout` (inactivité), purge du stockage et événement `auth:logout` sur 401 |
| Routes protégées | `ProtectedRoute` côté front, `middleware/auth.js` côté serveur |
| Transport | CORS whitelist, HTTPS en production, `withCredentials: false` |
| Abus | Rate limiting 100 req/min/IP, journal des tentatives (`tentativeblocage.json`) |
| Données | Chiffrement des champs sensibles (`middleware/encryption.js`, `encryption.json`, `rsa.json`), clés mises en cache |
| En-têtes | CSP, X-Frame-Options, X-Content-Type-Options |
| Traçabilité | `historique-connexion.json`, `lienIp.json` pour les accès aux liens partagés |
| RGPD | `CookieConsent`, pages partagées en `noindex` |

## Bonnes pratiques imposées
- Jamais de secret dans le code front.
- Jamais de rôle stocké sur le profil utilisateur côté client pour décider d'un accès : la vérification est serveur.
- Toute nouvelle route métier doit inclure `authMiddleware`.

