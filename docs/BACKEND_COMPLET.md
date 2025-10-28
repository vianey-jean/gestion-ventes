# GUIDE BACKEND COMPLET

## 📁 Structure du Backend (server/)

```
server/
├── config/
│   └── passport.js          # Configuration authentification Passport.js
├── db/                       # Base de données JSON
│   ├── users.json           # Utilisateurs de l'application
│   ├── products.json        # Catalogue des produits
│   ├── sales.json           # Historique des ventes
│   ├── clients.json         # Liste des clients
│   ├── pretfamilles.json    # Prêts aux familles
│   ├── pretproduits.json    # Prêts de produits
│   ├── depensedumois.json   # Dépenses mensuelles
│   ├── depensefixe.json     # Dépenses fixes
│   ├── benefice.json        # Historique des bénéfices
│   └── messages.json        # Messages reçus
├── middleware/
│   ├── auth.js              # Middleware d'authentification JWT
│   ├── sync.js              # Middleware de synchronisation temps réel
│   └── upload.js            # Middleware upload de fichiers (Multer)
├── models/
│   ├── User.js              # Modèle Utilisateur
│   ├── Product.js           # Modèle Produit
│   ├── Sale.js              # Modèle Vente
│   ├── Client.js            # Modèle Client
│   ├── PretFamille.js       # Modèle Prêt Famille
│   ├── PretProduit.js       # Modèle Prêt Produit
│   ├── DepenseDuMois.js     # Modèle Dépense Mensuelle
│   ├── Benefice.js          # Modèle Bénéfice
│   └── Message.js           # Modèle Message
├── routes/
│   ├── auth.js              # Routes d'authentification
│   ├── products.js          # Routes produits
│   ├── sales.js             # Routes ventes
│   ├── clients.js           # Routes clients
│   ├── pretfamilles.js      # Routes prêts familles
│   ├── pretproduits.js      # Routes prêts produits
│   ├── depenses.js          # Routes dépenses
│   ├── benefices.js         # Routes bénéfices
│   ├── messages.js          # Routes messages
│   └── sync.js              # Routes synchronisation SSE
├── uploads/                  # Dossier des fichiers uploadés
├── .env                     # Variables d'environnement
├── server.js                # Point d'entrée serveur Express
└── package.json             # Dépendances Node.js
```

---

## 🔧 SERVEUR PRINCIPAL (server.js)

### Configuration
```javascript
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
```

### Middleware utilisés
- **body-parser** : Parse les requêtes JSON et URL-encoded
- **cors** : Autorise les requêtes cross-origin
- **express.static** : Sert les fichiers uploadés depuis `/uploads`

### Routes montées
```javascript
app.use('/api/auth', authRoutes);           // Authentification
app.use('/api/products', productRoutes);    // Gestion produits
app.use('/api/sales', salesRoutes);         // Gestion ventes
app.use('/api/clients', clientRoutes);      // Gestion clients
app.use('/api/pretfamilles', pretFamillesRoutes);
app.use('/api/pretproduits', pretProduitsRoutes);
app.use('/api/depenses', depensesRoutes);
app.use('/api/benefices', beneficesRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/sync', syncRoutes);           // Synchronisation SSE
```

### 📝 Comment modifier le serveur
**Fichier** : `server/server.js`

- **Changer le port** : Modifier `PORT` ligne 15
- **Ajouter une nouvelle route** : 
  1. Créer le fichier route dans `server/routes/`
  2. L'importer ligne ~154-164
  3. Le monter avec `app.use('/api/...', route)` ligne ~166-176
- **Modifier CORS** : Éditer `corsOptions` ligne 18-31

---

## 🔐 AUTHENTIFICATION (auth.js)

### Routes disponibles

#### 1. POST `/api/auth/register` - Inscription
**Fichier** : `server/routes/auth.js` ligne 6-49

**Body requis** :
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Logique** :
1. Vérifie que tous les champs sont remplis
2. Vérifie si l'utilisateur existe déjà (email)
3. Hash le mot de passe avec bcrypt (10 rounds)
4. Crée un nouvel utilisateur avec ID unique (timestamp)
5. Sauvegarde dans `db/users.json`
6. Retourne le nouvel utilisateur (sans le mot de passe)

**📝 Comment modifier l'inscription** :
- **Ajouter un champ** : Ajouter la validation ligne 10-14, puis l'inclure dans `newUser` ligne 27-32
- **Changer la validation email** : Modifier la regex ou logique ligne 21-23
- **Modifier le hash** : Changer `10` (rounds) dans `bcrypt.genSaltSync(10)` ligne 26

---

#### 2. POST `/api/auth/login` - Connexion
**Fichier** : `server/routes/auth.js` ligne 51-98

**Body requis** :
```json
{
  "email": "string",
  "password": "string"
}
```

**Logique** :
1. Vérifie que email et password sont fournis
2. Trouve l'utilisateur par email
3. Compare le mot de passe avec bcrypt
4. Génère un token JWT valide 24h
5. Retourne le token + infos utilisateur

**📝 Comment modifier la connexion** :
- **Changer durée du token** : Modifier `expiresIn: '24h'` ligne 77
- **Ajouter des infos au token** : Éditer le payload ligne 73-76
- **Changer la clé secrète** : Modifier `JWT_SECRET` dans `.env`

---

#### 3. POST `/api/auth/reset-password` - Réinitialisation mot de passe
**Fichier** : `server/routes/auth.js` ligne 100-147

**Logique** :
1. Trouve l'utilisateur par email
2. Hash le nouveau mot de passe
3. Met à jour dans la base de données

**📝 Comment modifier** :
- **Ajouter vérification email** : Implémenter l'envoi d'email ligne 110-115
- **Ajouter code de vérification** : Créer un système de tokens temporaires

---

## 📦 PRODUITS (products.js)

### Routes disponibles

#### GET `/api/products` - Liste tous les produits
**Fichier** : `server/routes/products.js` ligne 8-20
- Nécessite authentification (`authMiddleware`)
- Retourne tous les produits depuis `Product.getAll()`

#### POST `/api/products` - Créer un produit
**Fichier** : `server/routes/products.js` ligne 22-51

**Body requis** :
```json
{
  "description": "string",
  "purchasePrice": number,
  "quantity": number
}
```

**📝 Comment ajouter un champ produit** :
1. Ajouter la validation ligne 25-27
2. Inclure dans `newProduct` dans `server/models/Product.js` ligne 45-51
3. Mettre à jour le fichier JSON initial dans `server.js` ligne 59-79

#### PUT `/api/products/:id` - Modifier un produit
**Fichier** : `server/routes/products.js` ligne 53-82

#### DELETE `/api/products/:id` - Supprimer un produit
**Fichier** : `server/routes/products.js` ligne 84-100

---

## 💰 VENTES (sales.js)

### Routes disponibles

#### GET `/api/sales` - Liste toutes les ventes
**Fichier** : `server/routes/sales.js` ligne 9-21

#### GET `/api/sales/:year/:month` - Ventes par mois
**Fichier** : `server/routes/sales.js` ligne 23-38

#### POST `/api/sales` - Créer une vente
**Fichier** : `server/routes/sales.js` ligne 40-197

**Body requis** :
```json
{
  "productId": "string",
  "productDescription": "string",
  "quantitySold": number,
  "sellingPrice": number,
  "purchasePrice": number,
  "date": "ISO string"
}
```

**Logique complexe** :
1. Valide les données ligne 43-51
2. Calcule le profit : `(sellingPrice - purchasePrice) * quantitySold`
3. Vérifie le stock disponible ligne 95-99
4. Réduit la quantité du produit ligne 106-122
5. Crée la vente avec ID unique ligne 127-137
6. Sauvegarde dans `db/sales.json` ligne 140
7. Notifie les clients SSE ligne 147-182

**📝 Comment modifier une vente** :
1. **Changer le calcul de profit** : Éditer ligne 89-90
2. **Ajouter un champ** : Inclure dans `newSale` ligne 127-137
3. **Modifier la gestion du stock** : Éditer `Product.updateQuantity()` ligne 106-122

#### DELETE `/api/sales/:id` - Supprimer une vente
**Fichier** : `server/routes/sales.js` ligne 199-284

**Logique** :
1. Trouve la vente par ID
2. Restaure la quantité du produit
3. Supprime la vente
4. Notifie les clients SSE

---

## 👥 CLIENTS (clients.js)

### Routes disponibles

#### GET `/api/clients` - Liste tous les clients
**Fichier** : `server/routes/clients.js` ligne 8-16

#### GET `/api/clients/:id` - Obtenir un client
**Fichier** : `server/routes/clients.js` ligne 18-32

#### POST `/api/clients` - Créer un client
**Fichier** : `server/routes/clients.js` ligne 34-59

**Body requis** :
```json
{
  "nom": "string",
  "phone": "string",
  "adresse": "string"
}
```

**📝 Comment ajouter un champ client** :
1. Valider ligne 40-42
2. Ajouter dans `Client.create()` dans `server/models/Client.js` ligne 56-62
3. Retourner dans la réponse

#### PUT `/api/clients/:id` - Modifier un client
**Fichier** : `server/routes/clients.js` ligne 61-85

#### DELETE `/api/clients/:id` - Supprimer un client
**Fichier** : `server/routes/clients.js` ligne 87-101

---

## 💳 PRÊTS FAMILLES (pretfamilles.js)

### Routes disponibles

#### GET `/api/pretfamilles` - Liste tous les prêts
**Fichier** : `server/routes/pretfamilles.js` ligne 8-16

#### GET `/api/pretfamilles/:id` - Obtenir un prêt
**Fichier** : `server/routes/pretfamilles.js` ligne 18-32

#### POST `/api/pretfamilles` - Créer un prêt famille
**Fichier** : `server/routes/pretfamilles.js` ligne 34-47

**Body requis** :
```json
{
  "nom": "string",
  "pretTotal": number,
  "soldeRestant": number,
  "dernierRemboursement": number,
  "dateRemboursement": "string"
}
```

#### PUT `/api/pretfamilles/:id` - Modifier un prêt
**Fichier** : `server/routes/pretfamilles.js` ligne 49-63

**📝 Comment ajouter un remboursement** :
- Le système d'historique de remboursements est géré dans le modèle
- Voir `server/models/PretFamille.js` pour la logique métier

#### DELETE `/api/pretfamilles/:id` - Supprimer un prêt
**Fichier** : `server/routes/pretfamilles.js` ligne 65-84

#### GET `/api/pretfamilles/search/nom?q=terme` - Rechercher
**Fichier** : `server/routes/pretfamilles.js` ligne 86-101

**📝 Comment modifier la recherche** :
- Changer la longueur minimale ligne 91
- Modifier l'algorithme de recherche dans `server/models/PretFamille.js`

---

## 📦 PRÊTS PRODUITS (pretproduits.js)

### Routes disponibles

#### GET `/api/pretproduits` - Liste tous les prêts produits
**Fichier** : `server/routes/pretproduits.js` ligne 7-24

#### POST `/api/pretproduits` - Créer un prêt produit
**Fichier** : `server/routes/pretproduits.js` ligne 26-68

**Body requis** :
```json
{
  "date": "string",
  "description": "string",
  "prixVente": number,
  "avanceRecue": number,
  "reste": number,
  "estPaye": boolean
}
```

#### PUT `/api/pretproduits/:id` - Modifier un prêt produit
**Fichier** : `server/routes/pretproduits.js` ligne 70-104

#### DELETE `/api/pretproduits/:id` - Supprimer un prêt produit
**Fichier** : `server/routes/pretproduits.js` ligne 106-127

---

## 💸 DÉPENSES (depenses.js)

### Routes disponibles

#### GET `/api/depenses/mois` - Dépenses mensuelles
**Fichier** : `server/routes/depenses.js` ligne 7-24

#### POST `/api/depenses/mois` - Ajouter dépense mensuelle
**Fichier** : `server/routes/depenses.js` ligne 26-76

**Body requis** :
```json
{
  "date": "string",
  "description": "string",
  "categorie": "string",
  "debit": number,
  "credit": number,
  "solde": number
}
```

#### PUT `/api/depenses/mois/:id` - Modifier dépense
**Fichier** : `server/routes/depenses.js` ligne 78-125

#### DELETE `/api/depenses/mois/:id` - Supprimer dépense
**Fichier** : `server/routes/depenses.js` ligne 127-155

#### GET `/api/depenses/fixes` - Dépenses fixes
**Fichier** : `server/routes/depenses.js` ligne 157-174

#### PUT `/api/depenses/fixes` - Modifier dépenses fixes
**Fichier** : `server/routes/depenses.js` ligne 176-212

**Body requis** :
```json
{
  "free": number,
  "internetZeop": number,
  "assuranceVoiture": number,
  "autreDepense": number,
  "assuranceVie": number
}
```

**📝 Comment ajouter une dépense fixe** :
1. Ajouter le champ dans le body ligne 179-183
2. Inclure dans le calcul du total ligne 186
3. Inclure dans l'objet sauvegardé ligne 189-196
4. Mettre à jour la structure initiale dans `server.js` ligne 136-146

---

## 📊 BÉNÉFICES (benefices.js)

### Routes disponibles

#### GET `/api/benefices` - Liste tous les bénéfices
**Fichier** : `server/routes/benefices.js` ligne 7-19

#### POST `/api/benefices` - Ajouter un bénéfice
**Fichier** : `server/routes/benefices.js` ligne 21-60

**Body requis** :
```json
{
  "mois": "string",
  "montant": number
}
```

#### PUT `/api/benefices/:id` - Modifier un bénéfice
**Fichier** : `server/routes/benefices.js` ligne 62-96

#### DELETE `/api/benefices/:id` - Supprimer un bénéfice
**Fichier** : `server/routes/benefices.js` ligne 98-122

---

## 📧 MESSAGES (messages.js)

### Routes disponibles

#### POST `/api/messages` - Créer un message (PUBLIC)
**Fichier** : `server/routes/messages.js` ligne 8-30

**⚠️ IMPORTANT** : Cette route est publique (pas de auth)

**Body requis** :
```json
{
  "expediteurNom": "string",
  "expediteurEmail": "string",
  "expediteurTelephone": "string",
  "sujet": "string",
  "contenu": "string",
  "destinataireId": "string"
}
```

#### GET `/api/messages` - Messages de l'utilisateur
**Fichier** : `server/routes/messages.js` ligne 32-41

#### GET `/api/messages/unread-count` - Compteur non lus
**Fichier** : `server/routes/messages.js` ligne 43-52

#### PUT `/api/messages/:id/read` - Marquer comme lu
**Fichier** : `server/routes/messages.js` ligne 54-67

#### PUT `/api/messages/:id/unread` - Marquer comme non lu
**Fichier** : `server/routes/messages.js` ligne 69-82

#### DELETE `/api/messages/:id` - Supprimer un message
**Fichier** : `server/routes/messages.js` ligne 84-97

**📝 Comment modifier le système de messages** :
- **Ajouter notifications email** : Implémenter dans `Message.create()` dans `server/models/Message.js`
- **Ajouter pièces jointes** : Utiliser le middleware `upload.js` et ajouter un champ `attachments`

---

## 🔄 SYNCHRONISATION TEMPS RÉEL (sync.js)

### Route SSE

#### GET `/api/sync/events` - Server-Sent Events
**Fichier** : `server/routes/sync.js` ligne 40-123

**Headers requis** :
```
Authorization: Bearer <JWT_TOKEN>
```

**Événements envoyés** :
- `connected` : Connexion établie
- `sync` : Données à synchroniser
- `heartbeat` : Keep-alive (30s)

**Logique** :
1. Vérifie l'authentification JWT
2. Configure la connexion SSE
3. Enregistre le client dans `SyncManager`
4. Envoie un heartbeat toutes les 30s
5. Nettoie à la déconnexion

**📝 Comment modifier la synchro** :
- **Changer l'intervalle heartbeat** : Modifier `30000` ligne 76
- **Ajouter un type d'événement** : Créer une nouvelle méthode dans `server/middleware/sync.js`

---

## 🔐 MIDDLEWARE D'AUTHENTIFICATION (auth.js)

**Fichier** : `server/middleware/auth.js`

### Fonctionnement
1. Récupère le token depuis le header `Authorization: Bearer <token>`
2. Vérifie et décode le token JWT
3. Attache les infos utilisateur à `req.user`
4. Bloque si token invalide ou expiré

**📝 Comment modifier** :
- **Changer le message d'erreur** : Éditer ligne 14, 21, 26
- **Ajouter des vérifications** : Insérer après ligne 17
- **Changer la clé secrète** : Modifier dans `.env`

---

## 📤 MIDDLEWARE D'UPLOAD (upload.js)

**Fichier** : `server/middleware/upload.js`

### Configuration Multer
```javascript
storage: diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
})
```

**Limites** :
- Taille max : 5 MB
- Types acceptés : images (jpg, jpeg, png, gif)

**📝 Comment modifier** :
- **Changer la taille max** : Éditer `limits: { fileSize: 5 * 1024 * 1024 }` ligne 24
- **Ajouter des types de fichiers** : Modifier la regex ligne 16
- **Changer le dossier** : Modifier `destination` ligne 9

---

## 🗂️ MODÈLES DE DONNÉES

### User.js
**Fichier** : `server/models/User.js`

**Structure** :
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "password": "string (hashed)"
}
```

**Méthodes** :
- `getAll()` : Tous les utilisateurs
- `getById(id)` : Par ID
- `getByEmail(email)` : Par email
- `create(userData)` : Créer
- `update(id, userData)` : Modifier
- `delete(id)` : Supprimer

---

### Product.js
**Fichier** : `server/models/Product.js`

**Structure** :
```json
{
  "id": "string",
  "description": "string",
  "purchasePrice": number,
  "quantity": number
}
```

**Méthodes** :
- `getAll()` : Tous les produits
- `getById(id)` : Par ID
- `create(productData)` : Créer
- `update(id, updates)` : Modifier
- `updateQuantity(id, newQuantity)` : Modifier stock
- `delete(id)` : Supprimer

---

### Sale.js
**Fichier** : `server/models/Sale.js`

**Structure** :
```json
{
  "id": "string",
  "productId": "string",
  "productDescription": "string",
  "quantitySold": number,
  "sellingPrice": number,
  "purchasePrice": number,
  "profit": number,
  "date": "ISO string"
}
```

**Méthodes** :
- `getAll()` : Toutes les ventes
- `getById(id)` : Par ID
- `getByMonth(year, month)` : Par mois
- `create(saleData)` : Créer
- `delete(id)` : Supprimer

---

### Client.js
**Fichier** : `server/models/Client.js`

**Structure** :
```json
{
  "id": "string",
  "nom": "string",
  "phone": "string",
  "adresse": "string",
  "dateCreation": "ISO string"
}
```

**Méthodes** :
- `getAll()` : Tous les clients
- `getById(id)` : Par ID
- `getByName(nom)` : Par nom
- `create(clientData)` : Créer
- `update(id, clientData)` : Modifier
- `delete(id)` : Supprimer

---

## 🛠️ VARIABLES D'ENVIRONNEMENT (.env)

**Fichier** : `server/.env`

```env
PORT=10000
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

**📝 Comment modifier** :
1. Éditer le fichier `server/.env`
2. Redémarrer le serveur
3. **⚠️ NE JAMAIS COMMITER le .env**

---

## 🚀 DÉMARRAGE DU SERVEUR

```bash
cd server
npm install
npm start
```

Le serveur démarre sur `http://localhost:10000`

---

## 🔍 DÉBOGAGE

### Logs du serveur
- Tous les logs sont dans la console
- Chaque requête est loggée
- Les erreurs sont loggées avec le stack trace

### Tester les routes
```bash
# Inscription
curl -X POST http://localhost:10000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'

# Connexion
curl -X POST http://localhost:10000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Obtenir les produits (avec token)
curl -X GET http://localhost:10000/api/products \
  -H "Authorization: Bearer <TOKEN>"
```

---

## ✅ CHECKLIST MODIFICATION BACKEND

### Pour ajouter une nouvelle route :
1. [ ] Créer le modèle dans `server/models/`
2. [ ] Créer le fichier route dans `server/routes/`
3. [ ] Importer dans `server.js`
4. [ ] Monter avec `app.use()`
5. [ ] Tester avec curl ou Postman
6. [ ] Mettre à jour cette documentation

### Pour modifier une route existante :
1. [ ] Identifier le fichier dans `server/routes/`
2. [ ] Modifier la logique
3. [ ] Tester avec curl
4. [ ] Vérifier les impacts sur le frontend
5. [ ] Mettre à jour la documentation

### Pour ajouter un champ à un modèle :
1. [ ] Modifier le modèle dans `server/models/`
2. [ ] Mettre à jour les routes concernées
3. [ ] Mettre à jour la structure JSON initiale dans `server.js`
4. [ ] Tester la création/modification
5. [ ] Mettre à jour le frontend si nécessaire
