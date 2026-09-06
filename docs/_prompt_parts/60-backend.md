## 17bis. LOGIQUE DÉTAILLÉE DU BACKEND

Cette section décrit exhaustivement le backend Express (`server/`) : point d'entrée, middlewares de sécurité, chiffrement transparent, synchronisation temps réel, session unique, sauvegarde/restauration, maintenance, liens de partage, modèles et endpoints. Base de données = fichiers JSON dans `server/db/`, chiffrés au repos en AES‑256‑CBC de façon transparente.

### 17bis.1 Point d'entrée — `server/server.js`

Ordre d'initialisation critique :

1. `require('./middleware/patchDbIO')` — **DOIT** être le tout premier require, avant tout modèle, car il monkey-patche `fs.readFileSync` / `fs.writeFileSync` / `fs.promises.readFile` / `fs.promises.writeFile` pour chiffrer/déchiffrer de façon transparente tous les fichiers `.json` de `server/db/`.
2. Chargement d'Express, body-parser, cors, compression, bcryptjs, dotenv.
3. Pile de middlewares globale, dans cet ordre exact :
   - `compression()` — désactivée sur `/api/sync/events` et `/api/messagerie/events` (flux SSE longs).
   - `securityHeadersMiddleware` (headers de sécurité).
   - CORS (`cors(corsOptions)`) — doit être avant le rate limit.
   - `GET /api/health` — sonde de disponibilité publique (retourne `{ ok:true, timestamp }`).
   - Rate limit général (`rateLimitMiddleware('general')`), exempté sur `/api/sync/events`, `/api/messagerie/events`, `/api/connecte-profil-unique/*`.
   - `suspiciousActivityLogger` (logging simple, non bloquant).
   - `threatShield()` — bouclier anti-intrusion (voir 17bis.4).
   - `ipBlocklistMiddleware` — blocage IP globale (voir 17bis.5).
   - `bodyParser.json({limit:'10mb'})` et `urlencoded`.
   - `sanitizeMiddleware` — exempté sur `/api/notes/upload-drawing` et `/api/settings/restore` (payloads volumineux/chiffrés).
4. Création des dossiers `server/db` et `server/uploads` s'ils n'existent pas.
5. Seed automatique de plusieurs fichiers JSON à la première exécution s'ils sont absents (`products.json`, `sales.json`, `clients.json`, `pretfamilles.json`, `pretproduits.json`, `depensedumois.json`, `depensefixe.json`, `benefice.json`, `commandes.json`, `remboursement.json`, `pointageauto.json`) avec des données d'exemple pour certains.
6. Migration automatique des produits : si un produit n'a pas de `code` ou de `caracteristique` (objet), appel de `Product.generateCodesForExistingProducts()`. Couvre première installation, restauration de vieille sauvegarde, ou reset après delete-all.
7. Reconstruction de `fidelite.json` depuis `sales.json` au démarrage (`Fidelite.rebuild()`).
8. Montage de toutes les routes sous `/api/...` (liste complète en 17bis.9).
9. Deux endpoints de supervision sécurité protégés par `authMiddleware` déclarés directement dans `server.js` :
   - `GET /api/security/shield-stats` → statistiques du threat shield.
   - `GET /api/security/intrusions` → journal des intrusions filtrable (`limit`,`severity`,`mode`,`ip`,`since`).
   - `DELETE /api/security/intrusions` → purge du journal, réservé à `administrateur principale`.
10. Service statique `/uploads` avec headers CORS dédiés (permet cross-origin sur les fichiers uploadés).
11. Handler 404 générique JSON, puis handler d'erreurs globales (masque la stack trace en production).
12. Gestion des signaux : `SIGTERM` → arrêt propre ; `uncaughtException` → arrêt (exit 1) ; `unhandledRejection` → log seul.
13. Démarrage de `services/reservationCleanupService` (purge des réservations > 10 jours).
14. `app.listen(PORT)`, `PORT = process.env.PORT || 10000`.

CORS : liste blanche fixe (`localhost:3000/8080/8081`, domaines Render/Vercel/Lovable connus) + toute origine contenant `lovable.app` ou `lovableproject.com` autorisée automatiquement. En production, toute origine hors liste est refusée ; en développement, tout est autorisé par défaut. `credentials:true`.

### 17bis.2 Authentification JWT — `middleware/auth.js` + `controllers/authController.js`

- JWT signé avec un secret obtenu via `config/jwtSecret.js` (`getJwtSecret()`), expiration **8 heures** (`expiresIn: '8h'`).
- Le middleware `authMiddleware` lit `Authorization: Bearer <token>`, vérifie le JWT, recharge l'utilisateur complet depuis `models/User` par `decoded.id`, l'attache à `req.user`. Retourne 401 si token absent/invalide/utilisateur introuvable.
- `POST /api/auth/login` : recherche par email (insensible à la casse). Vérifie que le profil est complet (id/email/firstName/lastName), sinon 401. Anti-brute-force par compte :
  - `maxAttempts = user.nombreConnexion || 5`, `lockoutMinutes = user.tempsBlocage || 15`.
  - Si `lockedUntil` dans le futur → 423 avec `remainingSeconds`.
  - Si le verrou est expiré, réinitialisation silencieuse (`failedAttempts:0, lockedUntil:null`).
  - Mot de passe faux → incrémente `failedAttempts` ; si atteint `maxAttempts`, fixe `lockedUntil = now + lockoutMinutes` et retourne 423 ; sinon 401 avec compteur restant.
  - Succès → reset des compteurs, émission JWT `{id,email}`, exécution best-effort de `Fidelite.rebuild()`.
- `POST /api/auth/register` : vérifie confirmation de mot de passe, `acceptTerms`, longueur mdp ≥ 6, unicité de l'email. Crée l'utilisateur (mot de passe haché bcrypt, salt 10), retourne JWT immédiatement.
- `POST /api/auth/check-email` : retourne existence + état de verrouillage sans authentifier.
- `POST /api/auth/reset-password-request` : vérifie juste l'existence de l'email.
- `POST /api/auth/reset-password` : exige mdp fort (min/maj/chiffre/spécial, ≥6 caractères) et différent de l'ancien (`User.updatePassword` refuse si identique après hash).
- `GET /api/auth/verify` : vérifie un token et renvoie l'utilisateur (sans mot de passe).

Modèle `User` (`models/User.js`, fichier `users.json`) : `_getUsers()` lit toujours un tableau (sécurisé contre blobs chiffrés non déchiffrés). Champs attendus par utilisateur : `id, email, password (hash bcrypt), firstName, lastName, gender, address, phone, role?, specification?, failedAttempts?, lockedUntil?, nombreConnexion?, tempsBlocage?, profilePhoto?`. Rôles connus : absent (utilisateur simple), `administrateur`, `administrateur principale` (accès total, seul à pouvoir gérer maintenance/rôles/suppression totale).

### 17bis.3 Chiffrement transparent des fichiers DB

Deux couches complémentaires :

**a) `middleware/encryption.js`** — logique de chiffrement AES‑256‑CBC :
- Algorithme `aes-256-cbc`, clé dérivée par `crypto.scryptSync(keyString, 'riziky-encryption-salt-2024', 32)`, mise en cache (`derivedKeyCache`).
- Format chiffré sur disque : `{ "__encrypted": true, "iv": "<hex>", "data": "<hex>" }`.
- Fichiers **jamais chiffrés** (`EXCLUDED_FILES`) : `encryption.json`, `auto-sauvegarde.json`, `settings.json`, `moduleSettings.json`.
- Config stockée dans `db/encryption.json` : `{ enabled, activatedAt, keySealed, keyHint, keyFingerprint, keyProtected }` — **la clé en clair n'est jamais persistée** ; elle est scellée via `security/keyVault.js` (AES‑256‑GCM avec une clé maître locale) puis reconstituée en mémoire à la lecture (`getEncryptionConfig()`), avec cache invalidé sur changement de `mtimeMs` du fichier.
- Fonctions exposées : `readJsonDecrypted`, `writeJsonEncrypted`, `encryptAllData(key)`, `decryptAllData(key)`, `reEncryptAllData(oldKey,newKey)`, `isEncrypted`, `shouldEncryptFile`.

**b) `middleware/patchDbIO.js`** — patch global de bas niveau :
- Remplace `fs.readFileSync`/`fs.writeFileSync` (sync) et `fs.promises.readFile`/`writeFile` (async) : si le chemin résolu est dans `server/db/` et que le fichier n'est pas exclu, déchiffre automatiquement à la lecture (si le contenu est `__encrypted` et que la config est active) et chiffre automatiquement à l'écriture (si la config est active et que la donnée n'est pas déjà chiffrée). Garantit que **tous les modèles**, même ceux utilisant directement `fs.*`, bénéficient du chiffrement sans modification.
- Doit être chargé une seule fois, en tout premier, avant tout modèle.

**c) `middleware/dbHelper.js`** — API canonique recommandée pour les modèles : `readDb(fileNameOrPath)` / `writeDb(fileNameOrPath, data)`, qui délèguent à `readJsonDecrypted` / `writeJsonEncrypted`.

**d) `security/keyVault.js`** — coffre-fort de la clé de chiffrement :
- Clé maître 512 bits : priorité à `process.env.MASTER_ENCRYPTION_KEY`, sinon générée aléatoirement et stockée dans `server/security/master.key` (chmod 600, hors de `db/`, jamais sauvegardée/exposée).
- `sealKey(plainKey)` → scelle en AES‑256‑GCM `{v,iv,tag,data}` ; `openKey(sealed)` → déscelle.
- `fingerprint(plainKey)` → empreinte SHA‑256 tronquée (contrôle d'intégrité sans exposer la clé).
- `hint(plainKey)` → indice masqué (1er caractère + points).

**e) Routes `/api/encryption`** (réservées à `administrateur principale`) :
- `GET /status` → `{enabled, hasKey, keyHint, keyFingerprint, keyProtected, activatedAt}`.
- `POST /activate {encryptionKey}` (≥10 caractères) → chiffre tous les fichiers existants puis sauvegarde la config scellée.
- `POST /deactivate {encryptionKey}` → vérifie la clé, désactive la config (pour que les prochaines écritures soient en clair), puis déchiffre tous les fichiers.
- `POST /change-key {currentKey newKey}` (≥10) → `reEncryptAllData` puis sauvegarde nouvelle config.

### 17bis.4 Bouclier anti-intrusion — `middleware/threatShield.js`

Moteur heuristique + comportemental additif (n'altère aucune route). Composants :

- **Signatures d'attaque** (regex pondérées) : SQLi, SQLi tautologie, SQLi DDL, SQLi temporisé, NoSQLi, XSS, path traversal, LFI, RCE shell, SSTI, pollution de prototype, CRLF, désérialisation, SQLi file, XXE. Chaque signature ajoute un poids `w` au score du profil si elle matche l'URL+body+query+params.
- **Honeypots** : liste de chemins de scan connus (`/wp-login.php`, `/.env`, `/.git`, `/phpmyadmin`, etc.) → score +100 si détecté.
- **UA scanners** (`sqlmap`, `nikto`, `nmap`, etc.) → +100 ; UA vide → +12 ; UA headless (`puppeteer`, `curl/`, etc.) sur route `/api/*` → +6.
- **En-têtes anormaux** : `x-forwarded-host` avec valeurs multiples/caractères invalides (hors dev) → +10 ; `transfer-encoding` + `content-length` simultanés (request smuggling) → +60 ; corps > 12 Mo → +25.
- **Extensions suspectes** (`.php`,`.asp`,`.sql`,`.env`, etc.) → +45.
- **Moteur comportemental en ligne** par empreinte (`fingerprint = sha256(ip|ua|accept-language)`, tronqué 24 car.) : apprentissage EWMA du taux de requêtes (`ewmaRate`, `ewmaVar`), calcul d'un z-score. Détecte : rafale anormale (`burst-anomaly`, z>6 et rate>8 après 30 hits) → +18 ; scan de surface (>60 chemins distincts, >40/min) → +35 ; énumération (>25 404) → +30 ; brute-force (≥8 échecs d'auth) → +40.
- **Réponse graduée** : bannissement progressif selon `BAN_LADDER = [1min, 5min, 30min, 6h, 24h]`, incrémenté par profil (`banLevel`). Un ban s'applique à la fois sur le fingerprint et sur l'IP brute (`ip:<ip>`). Retour HTTP 403 avec header `Retry-After` pendant le bannissement.
- **Décroissance périodique** (toutes les 60 s) : le score de chaque profil diminue de 25 ; les profils inactifs > 30 min sont supprimés ; le journal est flush.
- **Mode observation** : en développement (`NODE_ENV !== 'production'`) et IP loopback, jamais de blocage réel (observation seule).
- **Chemins exemptés** du moteur comportemental : `/api/sync/events`, `/api/messagerie/events` (flux longs).
- **Persistance** : état des bans dans `server/security/threat-shield.json` (hors `db/`, non affecté par "supprimer tout"). Journal rotatif (500 dernières entrées) dans `server/security/threat-log.json`.
- **Base de données des intrusions** (`security/intrusionStore.js`, fichier `db/intrusions.json`, donc chiffré/sauvegardé comme les autres données) : chaque incident est enregistré avec IP, UA parsé (navigateur/OS/appareil), méthode, chemin, query, body (redacté sur les clés sensibles), en-têtes filtrés, tags, score, sévérité (`critique/eleve/moyen/faible`), action, durée de ban. Écriture tamponnée (flush tous les 20 événements ou 5 s). `query()` permet filtrage par sévérité/mode/ip/date ; `stats()` calcule les agrégats (top IP, top chemins, top navigateurs, répartition par sévérité, 24h glissantes).
- Supervision exposée via `GET/DELETE /api/security/intrusions` et `GET /api/security/shield-stats` (voir 17bis.1).

### 17bis.5 Blocage IP global — `middleware/ipBlocklist.js` + `models/BlockageIp.js`

- Fichier `db/blockage-ip.json` : `{ "ips": [ { id, ip, reason, active, createdAt, createdBy, updatedAt } ] }`.
- `normalizeIp` : trim, minuscule, retire le préfixe IPv4-mapped `::ffff:`.
- Un blocage est actif par défaut (`entry.active !== false` → compat. anciennes entrées).
- Middleware global `ipBlocklistMiddleware` (monté juste après `threatShield`) : laisse toujours passer OPTIONS et `/api/blockage-ip/check` ; sinon, si l'IP appelante correspond à une entrée **active**, renvoie 403 `{error, blocked:true, ip, reason, message}`.
- Routes `/api/blockage-ip` :
  - `GET /check` (public) → statut de l'IP appelante.
  - `GET /` (auth) → liste + IP courante.
  - `POST /` (auth) → ajoute un blocage (`ip`,`reason`) ; refuse de bloquer sa propre IP ; refuse les doublons.
  - `PUT /:id` (auth) → modifie IP/motif (mêmes contraintes anti-auto-blocage/doublon).
  - `PATCH /:id/active` (auth) → active/désactive un blocage sans le supprimer (`{active:boolean}`).
  - `DELETE /:id` (auth) → supprime par id ou par IP normalisée.

### 17bis.6 Middleware de sécurité générique — `middleware/security.js`

- `RateLimiter` (fenêtre glissante en mémoire) : général 500 req/min, `auth` 10 req/min, `strict` 5 req/min. Nettoyage périodique toutes les 60 s. `rateLimitMiddleware(type)` ajoute `X-RateLimit-Remaining`, renvoie 429 + `Retry-After` si dépassé ; jamais appliqué aux requêtes `OPTIONS`.
- `sanitizeMiddleware` : nettoie récursivement `req.body/query/params` — supprime `<`,`>`, `javascript:`, gestionnaires `on...=`, `data:`, tronque chaînes à 10000 caractères, tableaux à 1000 éléments, objets à 100 clés, profondeur max 5.
- `securityHeadersMiddleware` : `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, retire `X-Powered-By`, `Referrer-Policy: no-referrer`, `Permissions-Policy` étendue (désactive geoloc/caméra/micro/etc.), `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-site`. CSP stricte (`default-src 'none'`) sauf pour les routes servant du contenu (`/uploads`, `/share`, `/comment`) où une CSP plus permissive est appliquée (styles/scripts inline autorisés). `Strict-Transport-Security` uniquement en production.
- `validateRequest(schema)` : middleware factory utilisant `validators` (email, phone, password, id, text, number, date, boolean) et les schémas de `middleware/validation.js` (login, register, resetPassword, product, sale, client, message, rdv, commande, depense, pretFamille, pretProduit). Utilisé notamment sur `/api/auth/login` et `/api/auth/register`.
- `suspiciousActivityLogger` : détection légère (path traversal, XSS, SQLi, opérateurs Mongo) → log console uniquement, ne bloque jamais.

### 17bis.7 Synchronisation temps réel (SSE) — `middleware/sync.js` + `routes/sync.js`

Singleton `SyncManager` :

- **Surveillance de fichiers** (`fs.watch`) sur une liste fixe de fichiers `db/*.json` incluant `products.json, sales.json, pretfamilles.json, pretproduits.json, depensedumois.json, depensefixe.json, nouvelle_achat.json, clients.json, messages.json, rdv.json, rdv-taches.json, rdvNotifications.json, remboursement.json, commandes.json, historique-connexion.json`. À chaque changement réel (comparaison de hash JSON, pas juste mtime), notifie tous les clients SSE via l'événement `data-changed` avec `{type, data, timestamp, file}`. Les ventes (`sales`) sont filtrées sur le mois courant avant envoi (`filterCurrentMonthSales`).
- **Endpoint SSE** `GET /api/sync/events` (public, pas d'auth) : headers SSE stricts (`text/event-stream`, `no-cache`, `Connection: keep-alive`, `X-Accel-Buffering: no`), heartbeat toutes les 30 s, timeout de sécurité à 5 minutes, cleanup sur `close/end/error`. À la connexion, envoie immédiatement l'état courant de tous les fichiers surveillés.
- **`POST /api/sync/force-sync`** (auth) : diffuse un événement `force-sync` à tous les clients connectés.
- **`GET /api/sync/status`** (public) : calcule un hash SHA‑256 du contenu JSON normalisé de chaque fichier `db/*.json` (sauf `settings.json`), combine en `dataChangeToken` global ; renvoie aussi `autoBackupState` et `sleepState`.
- **`GET /api/sync/test`** (public) : ping simple utilisé pour le self-keep-alive.
- **Veille (sleep) 72h / idle 96h** : `idleTimeoutMs` interne fixé à **96 heures** (le texte du code mentionne "72h" dans les commentaires mais la constante réelle est `96 * 60 * 60 * 1000`). Si aucune donnée n'a changé et aucun client ne s'est reconnecté pendant cette durée, le serveur entre en "sommeil" (`isSleeping=true`), stoppe le self-ping, et diffuse l'événement `server-sleep` aux clients. Le minuteur est réarmé (`wakeUp(reason)`) à chaque : (a) nouvelle connexion client SSE (`client-connected`), (b) changement réel de données autre que `settings` (`data-change`). Le réveil diffuse `server-awake { timestamp, reason }`.
- **Self-ping keep-alive** (anti spin-down Render free-tier) : toutes les 10 minutes, ping HTTP/HTTPS de son propre `/api/sync/test` (URL déduite de `RENDER_EXTERNAL_URL` ou `SELF_PING_URL` ou `localhost:PORT`), désactivé pendant le sommeil.
- **État de sauvegarde automatique** (`autoBackupState`) : à chaque changement de données (hors `settings.json`), on programme un signal de sauvegarde automatique après une fenêtre de stabilité de **5 minutes** sans nouveau changement (`autoBackupStableWindowMs`). Si le signal se déclenche (`autoBackupState.signal=true`, `activationId` unique), un événement `auto-backup-state` est diffusé — le frontend peut alors lancer une sauvegarde automatique. `markBackupCompleted(mode)` réinitialise l'état après une sauvegarde manuelle ou auto.

### 17bis.8 Sauvegarde / restauration / maintenance des données — `routes/settings.js`

Toutes les routes sont sous `/api/settings`, protégées `authMiddleware`, avec contrôle de rôle (`isAdmin` = `administrateur` ou `administrateur principale`, `isAdminPrincipale` = uniquement `administrateur principale`).

**Gestion des utilisateurs** (admin principale) :
- `GET /users` : liste sans mots de passe.
- `PUT /user-role {userId,newRole}` : `newRole` doit être `''` ou `'administrateur'` ; impossible de modifier l'admin principale.
- `DELETE /user/:id` : supprime le compte (sauf admin principale), supprime sa photo de profil, nettoie ses références dans `pointage.json/rdv.json/taches.json`.
- `PUT /user-specification {userId,specification}` : seul un `administrateur` peut recevoir `specification:'live'`.

**Paramètres généraux** : `GET/PUT /` — fusionne avec `DEFAULT_SETTINGS` (siteName, language, timezone, currency, dateFormat, notifications{...}, display{...}, security{...}, backup{lastBackupDate,autoBackup,autoBackupIntervalDays}).

**Sauvegarde (`POST /backup`, admin)** :
1. Exige `encryptionCode` (≥6 caractères).
2. Collecte **dynamiquement tous** les fichiers `.json` de `db/` (`getDbFiles()`), déchiffrés (`readJson`), dans un objet `backupData[filename] = data`.
3. Ajoute `_metadata: {backupDate, version:'1.0', filesCount}`.
4. Chiffre l'ensemble en AES‑256‑CBC avec `crypto.scryptSync(encryptionCode,'riziky-salt-2024',32)`, IV aléatoire.
5. Calcule un `checksum` SHA‑256 du JSON en clair, et un `codeHash` bcrypt du code de chiffrement (pour vérification ultérieure sans stocker le code en clair).
6. Renvoie `{success, backup:{iv,data,checksum,codeHash}, filename}` ; met à jour `settings.backup.lastBackupDate` ; appelle `syncManager.markBackupCompleted('manual')`.

**Sauvegarde automatique (`POST /auto-backup`, admin)** : identique mais utilise le mot de passe réel de l'utilisateur connecté comme code de chiffrement (vérifié par bcrypt contre `users.json`), nomme le fichier avec le nom de l'utilisateur, marque `markBackupCompleted('auto')`.

**Restauration (`POST /restore`, admin)** :
1. Exige `{encryptedData, decryptionCode}`. Si `encryptedData.codeHash` présent, vérifie `bcrypt.compareSync`.
2. Déchiffre avec le même algorithme/sel ; vérifie le `checksum` SHA‑256 (fichier corrompu sinon).
3. Fusionne intelligemment (`mergeRestoreData`) chaque fichier de la sauvegarde avec le fichier local existant, **sauf** pour la liste `REPLACE_ON_RESTORE` (remplacement intégral, pas de fusion) :
   ```
   REPLACE_ON_RESTORE = [
     'objectif.json', 'products.json', 'nouvelle_achat.json',
     'pretproduits.json', 'pretfamilles.json', 'avance.json',
     'sales.json', 'remboursement.json', 'compta.json', 'benefice.json',
     'depensedumois.json', 'depensefixe.json', 'pointage.json',
     'pointageauto.json', 'pointageDeleted.json', 'pointageAutoSessions.json'
   ]
   ```
   Raison : ces fichiers contiennent des états numériques (stocks, soldes, objectifs) où une fusion par id perdrait les valeurs mises à jour.
   De même, tout fichier d'épargne (`comptes-epargne.json` ou `compte-*.json`) est toujours remplacé intégralement (jamais fusionné).
4. Pour les autres fichiers, `mergeRestoreData` fusionne récursivement tableaux/objets : les éléments sont identifiés par une clé d'identité stable (`mois+annee`, `year+month`, ou en priorité `id,_id,email,code,reference,numero,phone,nom,name`), les éléments identiques (stringification triée) sont ignorés, les nouveaux sont ajoutés, les éléments modifiés sont fusionnés récursivement. Un changement de type de conteneur (array↔objet) ou un remplacement d'un conteneur vide entraîne un remplacement direct.
5. Après restauration : régénère les codes/caractéristiques produits manquants, reconstruit `fidelite.json`.
6. Retourne `{success, status:'unchanged'|'updated', message, metadata, updatedFilesCount, unchangedFilesCount, totalAddedEntries}`.

**Suppression totale (`POST /delete-all`, admin principale uniquement)** :
- Exige le mot de passe de l'admin principale connecté (vérifié bcrypt).
- Préserve les comptes `administrateur principale` (reset des compteurs de sécurité), tout le reste des utilisateurs est supprimé.
- Parcourt **dynamiquement tous** les fichiers `.json` de `db/` :
  - `users.json` → remplacé par la liste des admins principaux préservés.
  - `comptes-epargne.json` → vidé en `[]`.
  - `compte-*.json` (épargne individuelle) → fichier supprimé du disque.
  - Fichiers listés dans `ARRAY_FILES` (grande liste : ventes, produits, clients, notes, pointages, messages, etc.) → vidés en `[]`.
  - `auto-injecter.json` et `auto-sauvegarde.json` → préservés puis explicitement réinitialisés (`autoInjecter:true`, `autoSauvegarde:false`) pour redéclencher une demande d'injection de données sur une base vide.
  - Tous les autres fichiers → vidés en `[]` ou `{}` selon leur forme actuelle (heuristique).
  - `timeoutinactive.json` et `tentativeblocage.json` → réinitialisés à `{}`.

**Suppression sélective (`POST /bulk-delete`, admin principale)** : `type ∈ {sales,products,clients,notes}`, soit par `ids[]`, soit `deleteAll` (avec filtre optionnel mois/année pour les ventes). `GET /bulk-data` fournit un aperçu léger paginable pour la modale de sélection.

**Flags d'automatisation** :
- `GET/PUT /auto-sauvegarde` — active/désactive la sauvegarde automatique (fichier `auto-sauvegarde.json`, exclu du chiffrement).
- `GET/PUT /auto-injecter` — active/désactive la proposition d'injection automatique de données de démo (fichier `auto-injecter.json`).
- `GET /needs-injection` — vrai si `autoInjecter` actif ET qu'au moins un fichier métier critique (`products, sales, clients, rdv, tache, notes, pointage`) est vide ET que `users.json` ne contient que des admins principaux.
- `POST /verify-password` — vérifie le mot de passe admin courant (utilisé avant actions sensibles côté front).

### 17bis.9 Mode maintenance — `routes/maintenance.js`

Fichier `db/maintenance.json` : `{ maintenant, activatedAt, activatedBy, message, scheduled:[], autoActiveId }`.

- `GET /api/maintenance/status` (public) : renvoie `{maintenant, message, activatedAt}` après avoir "tické" le scheduler.
- `POST /api/maintenance/check-admin {email}` (public) : indique si l'email correspond à un `administrateur principale` (permet au frontend de laisser passer cet admin même en maintenance).
- `PUT /api/maintenance/toggle` (admin principale) : active/désactive manuellement, fixe message personnalisé.
- CRUD `/scheduled` (admin principale) : programme une maintenance future avec `startAt + days/hours` de durée. Un scheduler interne (`setInterval` 30 s) active automatiquement la maintenance programmée dès que `now ∈ [startAt, endAt)` (`triggered=true`, `autoActiveId=id`), puis la désactive automatiquement à `endAt`.

### 17bis.10 Session unique par profil — `routes/connecteProfilUnique.js` + `controllers/connecteProfilUniqueController.js` + `models/ConnecteProfilUnique.js`

Fichier `db/connecte-profil-unique.json` : tableau d'entrées `{ id, userId, email, nom, role, ip, browser, os, device, timezone, userAgent, deviceKey, firstSeenAt, active, currentSessionId, historique:[{sessionId,dateConnexion,heureConnexion,connecteAt,ip,browser,os,device,timezone,dateDeconnexion,heureDeconnexion,deconnecteAt,motif}], logoutRequest, notifications:[], forceLogout, forceLogoutReason, lastSeenAt }`.

Règles métier :
- Une entrée est identifiée par `userId + deviceKey` (empreinte poste/navigateur).
- **Utilisateur non admin principal** : ne peut être connecté qu'à un seul endroit à la fois. `POST /check {userId,role}` détecte un conflit (autre `deviceKey` actif pour le même `userId`) et renvoie les détails de la session concurrente (IP, navigateur, date/heure).
- **Résolution du conflit** via `POST /request-logout {targetEntryId, mode}` :
  - `mode='auto'` : déconnexion immédiate et forcée du poste distant (`forceLogout=true`), notification "verte/rouge" à tous les admins principaux actifs.
  - `mode='manuel'` : crée une demande `pending` avec expiration à **+5 minutes** (`MANUAL_REQUEST_TIMEOUT_MS`). Le poste distant est notifié en polling et répond via `POST /respond-logout {accept}` (accepté → déconnexion ; refusé → statut `refused`). Sans réponse après 5 minutes, `processExpirations()` force la déconnexion (`granted_timeout`).
- `GET /request-status/:requestId` : suivi côté demandeur du statut (`pending/granted/refused/granted_timeout/unknown`).
- `POST /poll {sessionId}` : heartbeat appelé périodiquement par le frontend ; détecte une déconnexion forcée à distance (`forceLogout`) ou une session remplacée (`isCurrent=false`), met à jour `lastSeenAt`, retourne les demandes de déconnexion en attente et les notifications.
- **Administrateur principal** : connexions multiples autorisées sans restriction ; chaque nouvelle connexion notifie toutes ses autres sessions actives (`principal_login`), et à la connexion il reçoit un résumé quotidien des connexions/déconnexions survenues avant son arrivée (`daily_summary`).
- Toute connexion/déconnexion (tous profils) génère une notification "verte" (`user_login`) ou "rouge" (`user_logout`) envoyée à toutes les sessions actives d'administrateurs principaux.
- `GET /actives`, `GET /` (liste complète), `DELETE /` (reset) — endpoints d'administration/diagnostic.
- Une session est considérée active tant que le heartbeat (`poll`) est reçu régulièrement ; sinon `processExpirations()` la ferme comme "session inactive (navigateur fermé)".
- Cette route est explicitement exemptée du rate-limit général et du threat shield comportemental strict, car le heartbeat est fréquent (`app.use` dans `server.js`).

### 17bis.11 Liens de partage

**a) `routes/shareLinks.js`** (données internes : notes / pointage / tâches) — fichiers `db/shareTokens.json`, `db/lienIp.json` :
- `POST /generate` (auth) `{type: 'notes'|'pointage'|'taches', filters}` : génère un `token` (32 bytes hex) et un `accessCode` (4 bytes hex majuscule). Stocke `{id, token, accessCode, type, filters, active, createdAt}`.
- `GET /list` (auth) : liste des liens actifs, filtrable par type.
- `DELETE /revoke/:id` (auth) : désactive le lien et supprime les verrouillages IP associés.
- `POST /verify/:token` (public) `{accessCode}` : si code correct, **verrouille le lien sur la première IP appelante** (`lienIp.json`) ; les connexions suivantes doivent provenir de cette même IP, sinon 403 "Accès refusé... déjà associé à un autre appareil".
- `GET /view/:token` (public, IP-locked) : sert les données filtrées selon le `type` et les `filters` stockés (filtre par date — jours/mois/semaines/années —, par personne, par colonnes/notes sélectionnées, par entreprise, par importance). Ne fonctionne que si l'IP appelante correspond à celle enregistrée lors de la vérification.

**b) `routes/notesShare.js`** : mécanisme équivalent simplifié dédié aux notes (`generate`, `revoke`, `view/:token`).

**c) `routes/shareComments.js`** : liens de partage "commentés" (captures/snapshots avec retour asynchrone) — soumission publique de commentaires sur un token (`submit/:token`), envoi (`send/:id`), vérification (`check/:token`), liste/lecture authentifiées, export/import JSON, suppression.

### 17bis.12 Modèles de données principaux (`server/models/`)

Tous les modèles lisent/écrivent via `dbHelper` (`readDb`/`writeDb`) ou directement `fs.*` (patché de façon transparente par `patchDbIO`). Schémas des fichiers JSON les plus structurants :

| Fichier | Forme | Champs clés |
|---|---|---|
| `users.json` | array | `id, email, password(hash), firstName, lastName, gender, address, phone, role?, specification?, failedAttempts, lockedUntil, nombreConnexion, tempsBlocage, profilePhoto?` |
| `products.json` | array | `id, description, purchasePrice, sellingPrice?, quantity, code, caracteristique:{nom,numero,codeBarre,code}, photos?[]` |
| `sales.json` | array | `id, date, products:[{productId,quantity,salePrice,...}], clientId?, clientName?, totalSellingPrice, ...` |
| `clients.json` | array | `id, nom, phone, adresse, dateCreation, photo?` |
| `pretfamilles.json` | array | `id, nom, pretTotal, soldeRestant, dernierRemboursement, dateRemboursement` |
| `pretproduits.json` | array | `id, nom, phone, date, description, prixVente, avanceRecue, reste, estPaye, dateProchaineVente` |
| `depensedumois.json` | array | `id, date, description, categorie, debit, credit, solde` |
| `depensefixe.json` | object | `free, internetZeop, assuranceVoiture, autreDepense, assuranceVie, total` |
| `benefice.json` | array | bénéfices calculés par période/produit |
| `commandes.json` | array | commandes clients |
| `remboursement.json` | array | remboursements liés aux ventes |
| `pointageauto.json` | array | pointages automatiques |
| `blockage-ip.json` | object | `{ips:[{id,ip,reason,active,createdAt,createdBy,updatedAt}]}` |
| `encryption.json` | object (non chiffré) | `{enabled, activatedAt, keySealed{v,iv,tag,data}, keyHint, keyFingerprint, keyProtected}` |
| `maintenance.json` | object | `{maintenant, activatedAt, activatedBy, message, scheduled:[{id,startAt,endAt,days,hours,message,createdAt,createdBy,triggered}], autoActiveId}` |
| `connecte-profil-unique.json` | array | voir 17bis.10 |
| `intrusions.json` | array | voir 17bis.4 (structure `record()`) |
| `settings.json` | object (non chiffré) | voir `DEFAULT_SETTINGS` en 17bis.8 |
| `auto-sauvegarde.json` | object (non chiffré) | `{autoSauvegarde:boolean}` |
| `auto-injecter.json` | object | `{autoInjecter:boolean}` |
| `shareTokens.json` | array | voir 17bis.11 |
| `lienIp.json` | array | `{id, tokenId, token, ip, type, registeredAt}` |
| `moduleSettings.json` | object (non chiffré) | configuration d'activation de modules |

Les fichiers non listés (attributs produits, fidélité, épargne, messagerie, RDV, tâches, notes, historique de connexion, etc.) suivent le même principe : un tableau ou objet simple par domaine, chiffré transparent, avec un modèle dédié dans `server/models/` exposant des méthodes CRUD (`getAll/getById/create/update/remove`) et parfois des méthodes métiers spécifiques (ex. `Product.generateCodesForExistingProducts()`, `Fidelite.rebuild()`).

### 17bis.13 Tableau complet des endpoints par fichier de routes

Toutes les routes sont préfixées par `/api/<segment>` monté dans `server.js` (segment indiqué entre parenthèses). Auth : `authMiddleware` (JWT) sauf mention "public". `auth` = alias local du même middleware dans certains fichiers.

**auth.js** (`/api/auth`) — public sauf verify
- GET `/verify` (JWT requis) — vérifie le token
- GET `/health` — health check
- POST `/login` (validation schema `login`)
- POST `/check-email`
- POST `/register` (validation schema `register`)
- POST `/reset-password-request`
- POST `/reset-password`

**attributKinds.js** (`/api/attribut-kinds`, auth) — CRUD des types d'attributs dynamiques + leurs valeurs
- GET `/`, POST `/`, PUT `/:id`, DELETE `/:id`
- GET `/:id/values`, POST `/:id/values`, PUT `/:id/values/:vid`, DELETE `/:id/values/:vid`

**availability.js** (`/api/availability`, auth)
- GET `/slots`, GET `/check`

**avance.js** (`/api/avances`, auth)
- GET `/`, POST `/`, DELETE `/:id`

**banks.js** (`/api/banks`, auth)
- GET `/`, POST `/`, DELETE `/:id`

**benefices.js** (`/api/benefices`, auth)
- GET `/`, GET `/product/:productId`, POST `/`, PUT `/:id`, DELETE `/:id`

**blockageIp.js** (`/api/blockage-ip`) — voir 17bis.5
- GET `/check` (public), GET `/` (auth), POST `/` (auth), PUT `/:id` (auth), PATCH `/:id/active` (auth), DELETE `/:id` (auth)

**clients.js** (`/api/clients`, auth)
- GET `/`, GET `/:id`, POST `/` (upload photo), PUT `/:id` (upload photo), DELETE `/:id`, POST `/merge` (upload photo)

**clientsVilles.js** (`/api/clients-villes`, auth)
- GET `/`, POST `/`, PUT `/:original`, DELETE `/:ville`

**commandes.js** (`/api/commandes`, auth)
- GET `/`, GET `/expiring-soon`, GET `/:id`, POST `/`, PUT `/:id`, DELETE `/:id`

**compta.js** (`/api/compta`, pas d'auth explicite dans ce fichier)
- GET `/`, GET `/monthly/:year/:month`, GET `/yearly/:year`, GET `/summary/:year`, POST `/calculate/:year/:month`, POST `/recalculate/:year`

**confirmationRdv.js** (`/api/confirmation-rdv`, auth)
- GET `/`, POST `/sync`, PATCH `/:id`

**connecteProfilUnique.js** (`/api/connecte-profil-unique`, public — voir 17bis.10)
- POST `/check`, POST `/register-login`, POST `/logout`, POST `/request-logout`, GET `/request-status/:requestId`, POST `/respond-logout`, POST `/poll`, GET `/actives`, GET `/`, DELETE `/`

**depenses.js** (`/api/depenses`, auth)
- GET `/mouvements`, GET `/mouvements/:id`, POST `/mouvements`, PUT `/mouvements/:id`, DELETE `/mouvements/:id`
- GET `/fixe`, PUT `/fixe`, POST `/reset`, GET `/check-month`
- GET `/rsa`, PUT `/rsa`, POST `/auto-entries`

**encryption.js** (`/api/encryption`, auth, admin principale) — voir 17bis.3
- GET `/status`, POST `/activate`, POST `/deactivate`, POST `/change-key`

**entreprise.js** (`/api/entreprises`, auth)
- GET `/`, GET `/:id`, POST `/`, PUT `/:id`, DELETE `/:id`

**epargne.js** (`/api/epargne`, auth, admin principale uniquement pour la plupart)
- POST `/verify-admin`, GET `/` , POST `/`, PUT `/:ownerId`, DELETE `/:ownerId`
- POST `/:ownerId/comptes`, PUT `/:ownerId/comptes/:compteId`, DELETE `/:ownerId/comptes/:compteId`
- POST `/:ownerId/comptes/:compteId/operations`, PUT `/:ownerId/comptes/:compteId/operations/:opId`, DELETE `/:ownerId/comptes/:compteId/operations/:opId`

**fidelite.js** (`/api/fidelite`, public)
- GET `/`, GET `/:name`, POST `/rebuild`

**fournisseurs.js** (`/api/fournisseurs`, auth)
- GET `/`, GET `/search`, POST `/`, DELETE `/:id`

**historiqueConnexion.js** (`/api/historique-connexion`, public)
- GET `/`, POST `/visit`, DELETE `/`
- Expose `logEntry` sur `app.locals.logHistorique` pour être appelé depuis d'autres routes (ex. login).

**indisponible.js** (`/api/indisponible`, auth)
- GET `/`, POST `/`, PUT `/:id`, DELETE `/:id`, DELETE `/group/:groupId`, POST `/check`

**listesFidelite.js** (`/api/listes-fidelite`, public)
- GET `/`, PUT `/`, POST `/`, PUT `/:id`, DELETE `/:id`

**livraisonVille.js** (`/api/livraison-villes`, auth)
- GET `/`, POST `/`, PUT `/:ville`, DELETE `/:ville`

**maintenance.js** (`/api/maintenance`) — voir 17bis.9
- GET `/status` (public), POST `/check-admin` (public), PUT `/toggle` (admin principale)
- GET/POST `/scheduled`, PUT/DELETE `/scheduled/:id` (admin principale)

**messagerie.js** (`/api/messagerie`, mixte public/auth) — chat visiteur↔admin + chat inter-admins + groupes
- GET `/events` (SSE public), GET `/admin-status` (public)
- GET `/admin-users`, `/admin-conversations`, `/admin-messages/:otherAdminId`, POST `/admin-send`, PUT `/admin-mark-read/:otherAdminId`, GET `/admin-unread-count` (auth)
- GET `/conversations` (auth), GET `/messages/:visitorId/:adminId` (public), POST `/send` (public), POST `/typing`/`admin-typing` (public)
- PUT `/mark-read/:visitorId/:adminId` (public), GET `/unread-count/:adminId` (public)
- PUT `/edit/:messageId` (public), DELETE `/delete/:messageId` (public), DELETE `/admin-delete-own/:messageId` (auth), DELETE `/admin-hide/:messageId` (auth)
- POST `/like/:messageId` (public)
- Groupes admin : POST `/group/create`, GET `/groups`, GET `/group-messages/:groupId`, POST `/group-send`, PUT `/group-mark-read/:groupId`, PUT `/group/rename/:groupId`, POST `/group-typing` (auth)
- Groupes visiteur : GET `/visitor-groups/:visitorId`, GET `/visitor-group-messages/:groupId/:visitorId`, POST `/visitor-group-send`, PUT `/visitor-group-mark-read/:groupId/:visitorId`, POST `/visitor-group-typing` (public)

**messages.js** (`/api/messages`)
- POST `/` (public), GET `/` (auth), GET `/unread-count` (auth), PUT `/:id/read` (auth), PUT `/:id/unread` (auth), DELETE `/:id` (auth)

**moduleSettings.js** (`/api/module-settings`, auth)
- GET `/`, GET `/:module`, PUT `/:module`

**notes.js** (`/api/notes`, auth)
- POST `/upload-fichier`, POST `/upload-fichiers` (multi), DELETE `/fichier`, POST `/upload-drawing`
- GET `/`, POST `/`, PUT `/:id`, DELETE `/:id`, PUT `/:id/move`, PUT `/batch/reorder`
- GET/POST `/columns`, PUT/DELETE `/columns/:id`

**notesShare.js** (`/api/notes-share`)
- POST `/generate` (auth), DELETE `/revoke` (auth), GET `/view/:token` (public)

**nouvelleAchat.js** (`/api/nouvelle-achat`, auth)
- POST `/depense/upload-receipt`, POST `/achat/upload-receipt`
- GET `/`, GET `/monthly/:year/:month`, GET `/yearly/:year`, GET `/stats/monthly/:year/:month`, GET `/stats/yearly/:year`, GET `/:id`
- POST `/`, POST `/depense`, PUT `/:id`, DELETE `/:id`

**objectif.js** (`/api/objectif`, auth)
- GET `/`, GET `/historique`, PUT `/objectif`, POST `/recalculate`, POST `/save-monthly`, POST `/reset`

**parametres.js** (`/api/parametres`, auth)
- GET/PUT `/prixpointage`, GET/PUT `/parametretache`

**pointage.js** (`/api/pointages`, auth) — CRUD standard : GET `/`, GET `/:id`, POST `/`, PUT `/:id`, DELETE `/:id`

**pointageAuto.js** (`/api/pointages-auto`, auth) — CRUD standard identique

**pointageAutoDeclanche.js** (`/api/pointages-auto-declanche`, auth)
- GET `/`, POST `/`, PATCH `/:id`, DELETE `/cleanup`

**pointageAutoSessions.js** (`/api/pointages-auto-sessions`, auth)
- GET `/`, POST `/`, PATCH `/:id`, DELETE `/cleanup`

**pointageDeleted.js** (`/api/pointages-deleted`, auth)
- GET `/`, POST `/`, DELETE `/`

**prepaLivraison.js** (`/api/prepa-livraison`, auth)
- GET `/`, POST `/sync`, PATCH `/:id`

**pretfamilles.js** (`/api/pretfamilles`, auth)
- GET `/`, GET `/:id`, POST `/`, PUT `/:id`, DELETE `/:id`, GET `/search/nom`

**pretproduits.js** (`/api/pretproduits`, auth)
- GET `/`, GET `/search`, GET `/:id`, POST `/`, PUT `/:id`, DELETE `/:id`, POST `/transfer`

**prixproducts.js** (`/api/prix-products`, auth)
- GET `/`, GET `/product/:productId`, POST `/`, DELETE `/:id`

**productAttributes.js** (monté 5 fois : `/api/modele-produits`, `/api/taille-produits`, `/api/couleur-produits`, `/api/devant-produits`, `/api/autres-produits`, auth)
- GET `/`, POST `/`, PUT `/:id`, DELETE `/:id` (routeur factory générique)

**productComments.js** (`/api/product-comments`)
- GET `/ratings` (public), GET `/product/:productId` (public), POST `/` (auth), PUT `/:id` (auth), DELETE `/bulk` (auth), DELETE `/:id` (auth), DELETE `/product/:productId` (auth)

**products.js** (`/api/products`)
- GET `/` (public), POST `/generate-codes` (auth), GET `/search` (public), GET `/:id` (public)
- POST `/` (auth), POST `/with-photos` (auth, upload multi 6), PUT `/:id` (auth), DELETE `/:id` (auth, suite tronquée mais standard)

**productsVendu.js** (`/api/products-vendu`) — non détaillé ligne par ligne, expose la consultation des produits vendus (agrégats de ventes)

**profile.js** (`/api/profile`, auth)
- GET `/`, PUT `/`, POST `/photo` (upload), PUT `/password`
- GET/PUT `/security-settings`, GET/PUT `/timeout-settings`

**rdv.js** (`/api/rdv`, auth)
- GET `/`, GET `/search`, GET `/search-clients`, GET `/week`, GET `/conflicts`, GET `/:id`
- POST `/`, PUT `/:id`, PUT `/by-commande/:commandeId`, DELETE `/:id`, DELETE `/by-commande/:commandeId`

**rdvNotifications.js** (`/api/rdv-notifications`, auth)
- GET `/`, GET `/unread`, GET `/count`, POST `/check`, PUT `/:id/read`, DELETE `/:id`
- GET `/by-rdv/:rdvId`, PUT `/status/:rdvId`, PUT `/by-rdv/:rdvId`, DELETE `/by-rdv/:rdvId`

**rdvTaches.js** (`/api/rdv-taches`, public dans ce fichier)
- GET `/`, GET `/free-slots`, POST `/`, PUT `/by-commande/:commandeId`, DELETE `/by-commande/:commandeId`, PUT `/:id`, DELETE `/:id`

**remboursements.js** (`/api/remboursements`, auth)
- GET `/`, GET `/by-month`, GET `/search-sales`, POST `/`, DELETE `/:id`

**sales.js** (`/api/sales`, auth)
- GET `/`, GET `/by-month`, GET `/by-year`, GET `/yearly-stats`, POST `/`, PUT `/:id`, DELETE `/:id`, POST `/export-month`

**settings.js** (`/api/settings`) — voir 17bis.8 pour le détail complet des règles métier
- GET `/`, GET `/users`, PUT `/user-role`, DELETE `/user/:id`, PUT `/user-specification`, PUT `/`
- POST `/backup`, POST `/restore`, POST `/delete-all`, POST `/bulk-delete`, GET `/bulk-data`, POST `/auto-backup`, POST `/verify-password`
- GET/PUT `/auto-sauvegarde`, GET/PUT `/auto-injecter`, GET `/needs-injection`

**shareComments.js** (`/api/share-comments`) — mixte public/auth, voir 17bis.11
- POST `/submit/:token`, POST `/send/:id`, GET `/check/:token` (public)
- GET `/list`, GET `/unread`, PATCH `/read/:id`, GET `/detail/:id`, GET `/snapshot/:filename`, POST `/sync-html`, POST `/import-json`, DELETE `/delete/:id`, GET `/export-json` (auth)

**shareLinks.js** (`/api/share-links`) — voir 17bis.11
- POST `/generate` (auth), GET `/list` (auth), DELETE `/revoke/:id` (auth), POST `/verify/:token` (public), GET `/view/:token` (public)

**sync.js** (`/api/sync`) — voir 17bis.7
- GET `/events` (public, SSE), POST `/force-sync` (auth), GET `/status` (public), GET `/test` (public)

**tache.js** (`/api/taches`, public dans ce fichier)
- GET `/`, GET `/:id`, POST `/`, PUT `/:id`, PUT `/by-commande/:commandeId`, DELETE `/:id`, DELETE `/by-commande/:commandeId`

**tachesRdv.js** (`/api/taches-rdv`, public dans ce fichier)
- GET `/`, POST `/`, PUT `/:id`, DELETE `/:id`

**travailleur.js** (`/api/travailleurs`, auth)
- GET `/`, GET `/:id`, POST `/`, PUT `/:id`, DELETE `/:id`

**versement.js** (`/api/versements`, auth)
- GET `/`, PUT `/max`, POST `/`, PUT `/:id`, DELETE `/:id`

Routes additionnelles montées directement dans `server.js` sans fichier dédié listé ci-dessus : `/api/health` (santé), `/api/security/shield-stats`, `/api/security/intrusions` (GET/DELETE).

### 17bis.14 Services (`server/services/`)

- **`availabilityService.js`** : calcule les créneaux disponibles/occupés pour la prise de RDV (utilisé par `routes/availability.js`).
- **`fileService.js`** : utilitaires génériques de lecture/écriture/suppression de fichiers uploadés.
- **`reservationCleanupService.js`** : démarré au boot du serveur (`start()`), purge périodiquement les réservations/indisponibilités dont la date est dépassée de plus de 10 jours.

### 17bis.15 Upload de fichiers (`middleware/upload.js`, `uploadAchat.js`, `uploadDepense.js`)

Trois instances Multer distinctes, chacune ciblant un sous-dossier de `server/uploads/` (photos clients/produits, justificatifs d'achats, justificatifs de dépenses), avec restrictions de type MIME et de taille. Les fichiers sont servis statiquement via `/uploads` avec CORS et cache appropriés (voir 17bis.1, point 10).
