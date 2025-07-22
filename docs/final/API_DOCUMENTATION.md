
# DOCUMENTATION API

## Vue d'ensemble

API REST sécurisée pour le système de gestion commerciale.

## Authentification

### JWT Token
Toutes les routes protégées nécessitent un header Authorization :
```
Authorization: Bearer <token>
```

### Endpoints d'authentification

#### POST /api/auth/login
Connexion utilisateur

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string"
  }
}
```

#### POST /api/auth/register
Inscription utilisateur

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "gender": "string",
  "address": "string",
  "phone": "string"
}
```

## Endpoints Produits

### GET /api/products
Récupère tous les produits

**Response:**
```json
[
  {
    "id": "string",
    "description": "string",
    "purchasePrice": "number",
    "quantity": "number",
    "imageUrl": "string?"
  }
]
```

### POST /api/products
🔒 **Authentification requise**

Crée un nouveau produit

**Request Body:**
```json
{
  "description": "string",
  "purchasePrice": "number",
  "quantity": "number"
}
```

### PUT /api/products/:id
🔒 **Authentification requise**

Met à jour un produit

**Request Body:**
```json
{
  "description": "string?",
  "purchasePrice": "number?",
  "quantity": "number?"
}
```

### DELETE /api/products/:id
🔒 **Authentification requise**

Supprime un produit

## Endpoints Ventes

### GET /api/sales/by-month
🔒 **Authentification requise**

Récupère les ventes par mois

**Query Parameters:**
- `month`: number (1-12)
- `year`: number

**Response:**
```json
[
  {
    "id": "string",
    "date": "string",
    "productId": "string",
    "description": "string",
    "sellingPrice": "number",
    "quantitySold": "number",
    "purchasePrice": "number",
    "profit": "number"
  }
]
```

### POST /api/sales
🔒 **Authentification requise**

Crée une nouvelle vente

**Request Body:**
```json
{
  "date": "string",
  "productId": "string",
  "sellingPrice": "number",
  "quantitySold": "number"
}
```

## Endpoints Synchronisation

### GET /api/sync/events
🔒 **Authentification requise**

Connexion Server-Sent Events pour la synchronisation temps réel

**Headers:**
```
Accept: text/event-stream
Cache-Control: no-cache
```

**Events reçus:**
- `connected`: Connexion établie
- `data-changed`: Données modifiées
- `force-sync`: Synchronisation forcée

## Gestion d'Erreurs

### Codes d'État HTTP
- `200`: Succès
- `201`: Créé avec succès
- `400`: Requête invalide
- `401`: Non authentifié
- `403`: Accès interdit
- `404`: Ressource non trouvée
- `500`: Erreur serveur

### Format des Erreurs
```json
{
  "error": "string",
  "message": "string",
  "details": "any?"
}
```

## Limites et Quotas

### Rate Limiting
- 100 requêtes par minute par IP
- 1000 requêtes par heure par utilisateur authentifié

### Taille des Requêtes
- Body JSON : 10MB maximum
- Upload d'images : 5MB maximum

## Exemples d'Utilisation

### Authentification et utilisation
```javascript
// Connexion
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'password' })
});

const { token } = await loginResponse.json();

// Utilisation du token
const productsResponse = await fetch('/api/products', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const products = await productsResponse.json();
```

### Synchronisation temps réel
```javascript
const eventSource = new EventSource(`/api/sync/events?token=${token}`);

eventSource.addEventListener('data-changed', (event) => {
  const data = JSON.parse(event.data);
  // Mettre à jour l'interface
});
```

