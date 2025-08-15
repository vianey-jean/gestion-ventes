
# Documentation API

## Base URL
```
http://localhost:3000/api
```

## Authentification

Toutes les routes protégées nécessitent un header Authorization :
```
Authorization: Bearer <jwt_token>
```

## Endpoints d'authentification

### POST /auth/login
Connexion utilisateur

**Request Body :**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200) :**
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

### POST /auth/register
Inscription utilisateur

**Request Body :**
```json
{
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "gender": "male|female|other",
  "address": "string",
  "phone": "string"
}
```

### POST /auth/reset-password-request
Demande de réinitialisation de mot de passe

**Request Body :**
```json
{
  "email": "string"
}
```

### POST /auth/reset-password
Réinitialisation de mot de passe

**Request Body :**
```json
{
  "email": "string",
  "newPassword": "string"
}
```

## Endpoints Produits

### GET /products
🔓 **Public** - Récupère tous les produits

**Response :**
```json
[
  {
    "id": "string",
    "description": "string",
    "purchasePrice": "number",
    "quantity": "number",
    "imageUrl": "string|null"
  }
]
```

### POST /products
🔒 **Authentification requise** - Crée un nouveau produit

**Request Body :**
```json
{
  "description": "string",
  "purchasePrice": "number",
  "quantity": "number"
}
```

### PUT /products/:id
🔒 **Authentification requise** - Met à jour un produit

### DELETE /products/:id
🔒 **Authentification requise** - Supprime un produit

## Endpoints Ventes

### GET /sales
🔒 **Authentification requise** - Récupère toutes les ventes

### GET /sales/by-month
🔒 **Authentification requise** - Récupère les ventes par mois

**Query Parameters :**
- `month`: number (1-12)
- `year`: number

### POST /sales
🔒 **Authentification requise** - Crée une nouvelle vente

**Request Body :**
```json
{
  "date": "string",
  "productId": "string",
  "sellingPrice": "number",
  "quantitySold": "number",
  "clientName": "string",
  "clientPhone": "string",
  "clientAddress": "string"
}
```

## Endpoints Clients

### GET /clients
🔒 **Authentification requise** - Récupère tous les clients

### POST /clients
🔒 **Authentification requise** - Crée un nouveau client

### PUT /clients/:id
🔒 **Authentification requise** - Met à jour un client

### DELETE /clients/:id
🔒 **Authentification requise** - Supprime un client

## Synchronisation temps réel

### GET /sync/events
🔒 **Authentification requise** - Connexion Server-Sent Events

**Headers requis :**
```
Accept: text/event-stream
Cache-Control: no-cache
```

**Events reçus :**
- `connected` : Connexion établie
- `data-changed` : Données modifiées
- `force-sync` : Synchronisation forcée

## Codes d'erreur

| Code | Description |
|------|-------------|
| 200  | Succès |
| 201  | Créé avec succès |
| 400  | Requête invalide |
| 401  | Non authentifié |
| 403  | Accès interdit |
| 404  | Ressource non trouvée |
| 500  | Erreur serveur |

## Format des erreurs

```json
{
  "error": "string",
  "message": "string",
  "details": "any"
}
```

## Rate Limiting

- 100 requêtes par minute par IP
- 1000 requêtes par heure par utilisateur authentifié

## Exemple d'utilisation

```javascript
// Connexion
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'password' })
});

const { token } = await response.json();

// Utilisation avec token
const products = await fetch('/api/products', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```
