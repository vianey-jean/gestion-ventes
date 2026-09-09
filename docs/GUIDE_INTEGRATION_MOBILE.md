# Guide d'intégration — Applications mobiles (iOS / Android)

Ce guide décrit **comment une application mobile se connecte à l'API Riziky** et
utilise la couche de chiffrement de transport (ECDH P-256 → AES-256-GCM),
identique à celle utilisée par le site web (`src/lib/secureTransport.ts`).

---

## 1. Points d'entrée

| Élément | Valeur |
| --- | --- |
| Base URL production | `https://server-gestion-ventes.onrender.com` |
| Préfixe versionné | `/api/v1` (recommandé pour le mobile) |
| Préfixe historique | `/api` (rétrocompatible, même routeur) |
| Handshake | `POST /api/v1/handshake` |
| Applications enregistrées | `GET /api/v1/handshake/apps` |
| Révocation de session | `DELETE /api/v1/handshake/:sessionId` |

En-têtes attendus sur chaque appel API :

```
x-app-id: ios | android
x-session-id: <sessionId du handshake>     (si chiffrement actif)
x-encrypted: 1                              (si le corps est chiffré)
Authorization: Bearer <JWT>                 (routes protégées)
Content-Type: application/json
```

Le registre des applications se trouve dans `server/security/appRegistry.js` :
TTL de session mobile = **60 minutes**, épinglage de clé publique possible via
les variables d'environnement `APP_IOS_PUBLIC_KEY` / `APP_ANDROID_PUBLIC_KEY`.

---

## 2. Handshake cryptographique

1. L'application génère une paire **ECDH P-256** et exporte sa clé publique au
   format **raw** (point non compressé, 65 octets commençant par `0x04`),
   encodée en **base64**.
2. Elle appelle :

```http
POST /api/v1/handshake
Content-Type: application/json

{ "appId": "ios", "publicKey": "BASE64_RAW_P256" }
```

3. Réponse :

```json
{
  "ok": true,
  "sessionId": "…",
  "serverPublicKey": "BASE64_RAW_P256",
  "expiresAt": 1739999999999,
  "algorithm": "AES-256-GCM",
  "kdf": "HKDF-SHA256",
  "curve": "P-256"
}
```

4. Dérivation de la clé de session, **exactement** :

```
shared = ECDH(privéClient, serverPublicKey)
key    = HKDF-SHA256(shared, salt = UTF8(sessionId),
                     info = UTF8("riziky-secure-transport:" + appId), 32 octets)
```

> `appId` doit être celui utilisé au handshake (`ios` ou `android`).

La clé ne doit **jamais** être écrite sur disque : elle vit en mémoire et meurt
avec la session (ou l'application).

---

## 3. Format d'enveloppe chiffrée

Les corps de requête et de réponse chiffrés utilisent ce JSON :

```json
{
  "__enc": 1,
  "v": 1,
  "iv":   "base64 (12 octets aléatoires)",
  "data": "base64 (ciphertext sans le tag)",
  "tag":  "base64 (tag GCM 16 octets)"
}
```

Attention : les API natives (CryptoKit, WebCrypto, Android `Cipher`)
concatènent souvent `ciphertext || tag`. Il faut **séparer les 16 derniers
octets** pour remplir `tag`, et les **re-concaténer** au déchiffrement.

- iOS : `AES.GCM.seal(...)` → `sealed.ciphertext` et `sealed.tag`.
- Android : `Cipher.getInstance("AES/GCM/NoPadding")` avec `GCMParameterSpec(128, iv)`,
  puis découpe manuelle des 16 derniers octets.

La réponse est chiffrée quand l'en-tête `x-encrypted: 1` est présent.

---

## 4. Cycle de vie de la session

- **Démarrage** : handshake avant le premier appel métier (ou paresseusement au
  premier appel).
- **Renouvellement anticipé** : renégocier ~60 secondes avant `expiresAt`.
- **Expiration** : le serveur répond `409` avec l'en-tête `x-handshake-required: 1`
  et le corps `{ ok: false, renegotiate: true }`.
  → Refaire un handshake puis **rejouer la requête une seule fois**.
- **Déconnexion** : appeler `DELETE /api/v1/handshake/:sessionId`.

Un seul handshake doit être en vol à la fois (déduplication), sinon plusieurs
sessions inutiles s'accumulent côté serveur (limite : 5000, purge FIFO).

---

## 5. Exemptions — jamais chiffré

| Cas | Raison |
| --- | --- |
| `/api/v1/handshake*` | établit la clé |
| `/uploads/*` | fichiers statiques |
| `/api/sync/events`, `/api/messagerie/events`, toute route `/events` ou `/stream` | flux SSE temps réel |
| Requêtes `multipart/form-data` | upload de photos, reçus de dépense, documents |
| `Accept: text/event-stream` | flux SSE |

Pour ces appels : pas d'enveloppe, pas d'en-tête `x-encrypted`. Le `Bearer` JWT
reste obligatoire sur les routes protégées.

Référence serveur : `server/middleware/payloadCrypto.js`.

---

## 6. Rétrocompatibilité

Un client qui n'envoie pas `x-session-id` reçoit du JSON en clair : le
chiffrement est **opt-in**. En cas d'échec du handshake (réseau, ancienne
version du serveur), l'application doit basculer en mode clair plutôt que de
bloquer l'utilisateur — c'est le comportement du client web.

---

## 7. Authentification et temps réel

- **Login** : `POST /api/v1/auth/login` → `{ token, user }`. Le JWT est stocké
  dans le trousseau sécurisé (Keychain iOS / EncryptedSharedPreferences Android),
  jamais en clair.
- **401** : purger le token et rediriger vers l'écran de connexion.
- **SSE** : `GET /api/sync/events` et `/api/messagerie/events` en clair ; sur
  mobile, utiliser une bibliothèque SSE ou un long-polling de repli, avec
  reconnexion exponentielle.

---

## 8. Checklist d'intégration

- [ ] `appId` enregistré dans `server/security/appRegistry.js`
- [ ] Origines CORS mobiles configurées si nécessaire (`APP_IOS_ORIGINS`, `APP_ANDROID_ORIGINS`)
- [ ] Épinglage optionnel de la clé publique (`APP_*_PUBLIC_KEY`)
- [ ] Handshake au démarrage + renouvellement avant expiration
- [ ] Enveloppe `{ __enc, v, iv, data, tag }` en envoi et réception
- [ ] Gestion du `409 renegotiate` avec rejeu unique
- [ ] Exemptions respectées (SSE, uploads, multipart, handshake)
- [ ] JWT en stockage sécurisé, purge au `401`
- [ ] Mode dégradé en clair si le chiffrement est indisponible

---

## 9. Implémentation de référence

Le client web `src/lib/secureTransport.ts` est la référence fonctionnelle :
handshake, dérivation HKDF, enveloppe, renégociation automatique, exemptions.
Toute application mobile peut être portée ligne à ligne depuis ce fichier.
