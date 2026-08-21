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


---

## Couches ajoutées (v5 — durcissement complet)

### 1. Bouclier adaptatif serveur — `server/middleware/threatShield.js`
Activé dans `server/server.js` juste après `suspiciousActivityLogger`.

| Défense | Détail |
|---|---|
| Signatures d'attaque | SQLi, NoSQLi, XSS, path traversal, LFI/RFI, RCE shell, SSTI, désérialisation, CRLF, prototype pollution, injection d'en-têtes |
| Honeypots | chemins de scan (`/wp-login.php`, `/.env`, `/.git`, phpMyAdmin…) → bannissement immédiat |
| Moteur comportemental | apprentissage en ligne (EWMA + z-score) du rythme par empreinte ; détection de scan, brute force, fuzzing, énumération d'IDs, scraping |
| Réponse graduée | score → tarpit (700 ms) → 400 → 403 → bannissement 1 min → 5 min → 30 min → 6 h → 24 h |
| Mémoire | `server/security/threat-shield.json` + journal rotatif `threat-log.json` (hors `server/db/`, donc épargnés par « supprimer toutes les données ») |
| Dev local | mode observation seule sur loopback : jamais de blocage en développement |

Supervision : `GET /api/security/shield-stats` (protégé par `authMiddleware`) renvoie
le nombre de profils suivis, les bannissements actifs et les 50 derniers incidents.

### 2. Secret JWT fort — `server/config/jwtSecret.js`
Le repli codé en dur `'defaultsecretkey'` est supprimé des 5 emplacements
(`middleware/auth.js`, `routes/auth.js`, `controllers/authController.js`).
Résolution : `process.env.JWT_SECRET` → `server/security/jwt.json` → génération
d'un secret aléatoire de 512 bits persisté en `chmod 600`. Les valeurs faibles
connues (`defaultsecretkey`, `gestion_vente_secret_key`, `secret`, `changeme`)
sont refusées et remplacées automatiquement.

### 3. CORS strict en production — `server/server.js`
En `NODE_ENV=production`, toute origine absente de la whitelist est rejetée
(`Origine non autorisée par la politique CORS`). Le comportement permissif est
conservé uniquement en développement/preview.

### 4. En-têtes durcis — `server/middleware/security.js`
- CSP API : `default-src 'none'`, `script-src 'none'`, `frame-ancestors 'none'`, `base-uri 'none'`, `form-action 'none'`, `upgrade-insecure-requests`
- CSP adaptée pour les documents servis (`/uploads`, pages de partage) afin de ne rien casser au rendu
- `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-site`
- `Referrer-Policy: no-referrer`, `X-Permitted-Cross-Domain-Policies: none`, `X-DNS-Prefetch-Control: off`, suppression de `X-Powered-By`
- `Permissions-Policy` étendue (géoloc, micro, caméra, USB, série, Bluetooth, paiement, presse-papier, capture d'écran…)
- HSTS production : `max-age=63072000; includeSubDomains; preload`

### 5. Front — `src/lib/antiTamper.ts` (installé depuis `src/main.tsx`)
| Couche | Effet |
|---|---|
| Framebusting | refus d'exécution dans une iframe d'origine étrangère (clickjacking, proxy de clonage) |
| Vérification d'origine | l'app ne démarre que sur un hôte officiel (localhost, `*.lovable.app`, `*.vercel.app`, `*.onrender.com`) ; sinon écran « Copie non autorisée » |
| Anti-exfiltration | blocage `copy`/`cut`/`dragstart`/`contextmenu` sur tout bloc marqué `data-sensitive="true"` |
| Intégrité runtime | contrôle périodique de `fetch` et `XMLHttpRequest.prototype.open` ; restauration native et interruption de session en production si un script injecté les remplace |

Ce module s'ajoute à `src/lib/runtimeSecurity.ts` (anti prototype-pollution sur
`JSON.parse`, `window.open` sans opener, blocage des schémas `javascript:` /
`data:text/html`).

### 6. Preuve de travail — `src/lib/proofOfWork.ts`
La page `SecurityCheckPage` lance, pendant la phase `checking`, une preuve de
travail SHA-256 (18 bits nuls, itérations bornées, thread principal libéré tous
les 500 essais). Le résultat est stocké dans `sessionStorage` sous
`security_pow_v1`. Coût humain : quelques centaines de millisecondes ; coût pour
une automatisation massive : prohibitif.

### Limites assumées
Aucun site web ne peut être rendu littéralement « inviolable » ou impossible à
copier : le HTML/JS envoyé au navigateur est toujours lisible. Ce qui est
réellement obtenu ici : blocage automatique et gradué des attaques, chiffrement
des données au repos, secrets non devinables, isolation d'origine, et détection
anti-clone qui rend une copie déployée ailleurs inutilisable contre ce serveur.
