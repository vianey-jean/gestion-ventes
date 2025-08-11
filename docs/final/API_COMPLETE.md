
# DOCUMENTATION API COMPLÈTE

## Vue d'ensemble

API REST complète pour le système de gestion commerciale avec authentification JWT et synchronisation temps réel.

**Base URL**: `http://localhost:10000/api`

## Authentification

### JWT Token
Toutes les routes protégées nécessitent un header Authorization :
```
Authorization: Bearer <token>
```

### Endpoints d'authentification

#### POST /auth/login
Connexion utilisateur

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Response 401:**
```json
{
  "message": "Email ou mot de passe incorrect"
}
```

#### POST /auth/register
Inscription utilisateur

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "gender": "Homme",
  "address": "123 Rue Example",
  "phone": "+33123456789"
}
```

**Response 201:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### POST /auth/reset-password-request
Demande de réinitialisation mot de passe

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response 200:**
```json
{
  "message": "Email de réinitialisation envoyé"
}
```

## Gestion des produits

### GET /products
🔓 **Public** - Récupère tous les produits

**Response 200:**
```json
[
  {
    "id": "prod123",
    "description": "Perruque Lisse 20 pouces",
    "purchasePrice": 50.00,
    "quantity": 25,
    "imageUrl": "/uploads/products/prod123.jpg"
  }
]
```

### GET /products/search
🔓 **Public** - Recherche de produits

**Query Parameters:**
- `query` (string) - Terme de recherche

**Response 200:**
```json
[
  {
    "id": "prod123",
    "description": "Perruque Lisse 20 pouces",
    "purchasePrice": 50.00,
    "quantity": 25,
    "imageUrl": "/uploads/products/prod123.jpg"
  }
]
```

### POST /products
🔒 **Authentification requise** - Crée un nouveau produit

**Request:**
```json
{
  "description": "Tissage Bouclé 18 pouces",
  "purchasePrice": 75.00,
  "quantity": 15
}
```

**Response 201:**
```json
{
  "id": "prod124",
  "description": "Tissage Bouclé 18 pouces",
  "purchasePrice": 75.00,
  "quantity": 15,
  "imageUrl": null
}
```

### PUT /products/:id
🔒 **Authentification requise** - Met à jour un produit

**Request:**
```json
{
  "description": "Tissage Bouclé 18 pouces - Premium",
  "purchasePrice": 80.00,
  "quantity": 20
}
```

**Response 200:**
```json
{
  "id": "prod124",
  "description": "Tissage Bouclé 18 pouces - Premium",
  "purchasePrice": 80.00,
  "quantity": 20,
  "imageUrl": null
}
```

### DELETE /products/:id
🔒 **Authentification requise** - Supprime un produit

**Response 200:**
```json
{
  "message": "Produit supprimé avec succès"
}
```

### POST /products/:id/image
🔒 **Authentification requise** - Upload image produit

**Request:** Multipart form-data avec fichier image

**Response 200:**
```json
{
  "imageUrl": "/uploads/products/prod124.jpg"
}
```

## Gestion des ventes

### GET /sales/by-month
🔒 **Authentification requise** - Ventes par mois

**Query Parameters:**
- `month` (number) - Mois (1-12)
- `year` (number) - Année

**Response 200:**
```json
[
  {
    "id": "sale123",
    "date": "2024-01-15",
    "productId": "prod123",
    "description": "Perruque Lisse 20 pouces",
    "sellingPrice": 100.00,
    "quantitySold": 1,
    "purchasePrice": 50.00,
    "profit": 50.00,
    "clientFirstName": "Marie",
    "clientLastName": "Dubois",
    "clientPhone": "+33123456789",
    "clientAddress": "456 Rue Client"
  }
]
```

### POST /sales
🔒 **Authentification requise** - Enregistre une vente

**Request:**
```json
{
  "date": "2024-01-20",
  "productId": "prod123",
  "sellingPrice": 120.00,
  "quantitySold": 2,
  "clientFirstName": "Sophie",
  "clientLastName": "Martin",
  "clientPhone": "+33987654321",
  "clientAddress": "789 Avenue Client"
}
```

**Response 201:**
```json
{
  "id": "sale124",
  "date": "2024-01-20",
  "productId": "prod123",
  "description": "Perruque Lisse 20 pouces",
  "sellingPrice": 120.00,
  "quantitySold": 2,
  "purchasePrice": 50.00,
  "profit": 140.00,
  "clientFirstName": "Sophie",
  "clientLastName": "Martin",
  "clientPhone": "+33987654321",
  "clientAddress": "789 Avenue Client"
}
```

### PUT /sales/:id
🔒 **Authentification requise** - Met à jour une vente

**Request:**
```json
{
  "sellingPrice": 130.00,
  "quantitySold": 1,
  "clientFirstName": "Sophie",
  "clientLastName": "Martin-Dupont",
  "clientPhone": "+33987654321",
  "clientAddress": "789 Avenue Client Nouveau"
}
```

### DELETE /sales/:id
🔒 **Authentification requise** - Supprime une vente

**Response 200:**
```json
{
  "message": "Vente supprimée avec succès"
}
```

### POST /sales/export-month
🔒 **Authentification requise** - Exporte les ventes du mois

**Request:**
```json
{
  "month": 1,
  "year": 2024
}
```

**Response 200:**
```json
{
  "message": "Ventes du mois exportées et archivées",
  "exportedCount": 25
}
```

## Gestion des clients

### GET /clients
🔒 **Authentification requise** - Récupère tous les clients

**Response 200:**
```json
[
  {
    "id": "client123",
    "firstName": "Marie",
    "lastName": "Dubois",
    "phone": "+33123456789",
    "address": "456 Rue Client",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### POST /clients
🔒 **Authentification requise** - Crée un nouveau client

**Request:**
```json
{
  "firstName": "Pierre",
  "lastName": "Dupont",
  "phone": "+33555666777",
  "address": "123 Boulevard Nouveau"
}
```

**Response 201:**
```json
{
  "id": "client124",
  "firstName": "Pierre",
  "lastName": "Dupont",
  "phone": "+33555666777",
  "address": "123 Boulevard Nouveau",
  "createdAt": "2024-01-20T14:15:00Z"
}
```

### PUT /clients/:id
🔒 **Authentification requise** - Met à jour un client

**Request:**
```json
{
  "firstName": "Pierre",
  "lastName": "Dupont-Martin",
  "phone": "+33555666888",
  "address": "456 Boulevard Modifié"
}
```

### DELETE /clients/:id
🔒 **Authentification requise** - Supprime un client

**Response 200:**
```json
{
  "message": "Client supprimé avec succès"
}
```

## Calculs de bénéfices

### GET /benefices
🔒 **Authentification requise** - Récupère les calculs

**Response 200:**
```json
[
  {
    "id": "calc123",
    "purchasePrice": 50.00,
    "customsTax": 5.00,
    "vat": 20.00,
    "otherFees": 2.00,
    "desiredMargin": 50.00,
    "totalCost": 67.00,
    "recommendedPrice": 100.50,
    "profit": 33.50,
    "marginRate": 50.00,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### POST /benefices
🔒 **Authentification requise** - Sauvegarde un calcul

**Request:**
```json
{
  "purchasePrice": 80.00,
  "customsTax": 8.00,
  "vat": 20.00,
  "otherFees": 3.00,
  "desiredMargin": 40.00
}
```

**Response 201:**
```json
{
  "id": "calc124",
  "purchasePrice": 80.00,
  "customsTax": 8.00,
  "vat": 20.00,
  "otherFees": 3.00,
  "desiredMargin": 40.00,
  "totalCost": 107.00,
  "recommendedPrice": 149.80,
  "profit": 42.80,
  "marginRate": 40.00,
  "createdAt": "2024-01-20T14:15:00Z"
}
```

## Gestion des prêts

### Prêts familiaux

#### GET /pretfamilles
🔒 **Authentification requise** - Récupère les prêts familiaux

#### POST /pretfamilles
🔒 **Authentification requise** - Crée un prêt familial

**Request:**
```json
{
  "familyName": "Famille Martin",
  "amount": 500.00,
  "date": "2024-01-15",
  "reason": "Aide urgente"
}
```

### Prêts produits

#### GET /pretproduits
🔒 **Authentification requise** - Récupère les prêts produits

#### POST /pretproduits
🔒 **Authentification requise** - Crée un prêt produit

**Request:**
```json
{
  "clientName": "Sophie Martin",
  "productDescription": "Perruque Lisse",
  "totalAmount": 120.00,
  "advanceAmount": 50.00,
  "remainingAmount": 70.00,
  "date": "2024-01-20"
}
```

## Gestion des dépenses

### Dépenses mensuelles

#### GET /depenses/mouvements
🔒 **Authentification requise** - Récupère les mouvements

#### POST /depenses/mouvements
🔒 **Authentification requise** - Ajoute un mouvement

**Request:**
```json
{
  "type": "debit",
  "category": "courses",
  "amount": 85.50,
  "description": "Courses hebdomadaires",
  "date": "2024-01-20"
}
```

### Dépenses fixes

#### GET /depenses/fixe
🔒 **Authentification requise** - Récupère les dépenses fixes

#### POST /depenses/fixe
🔒 **Authentification requise** - Ajoute une dépense fixe

**Request:**
```json
{
  "category": "abonnement",
  "amount": 29.99,
  "description": "Abonnement téléphone"
}
```

## Synchronisation temps réel

### GET /sync/events
🔒 **Authentification requise** - Connexion Server-Sent Events

**Headers:**
```
Accept: text/event-stream
Cache-Control: no-cache
Authorization: Bearer <token>
```

**Événements reçus:**
```
event: connected
data: {"message": "Connexion établie"}

event: data-changed
data: {"products": [...], "sales": [...], "clients": [...]}

event: force-sync
data: {"message": "Synchronisation forcée"}
```

## Codes d'erreur

### Codes HTTP
- `200` - Succès
- `201` - Créé avec succès
- `400` - Requête invalide
- `401` - Non authentifié
- `403` - Accès interdit
- `404` - Ressource non trouvée
- `422` - Données invalides
- `500` - Erreur serveur

### Format des erreurs
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Les données fournies sont invalides",
  "details": {
    "field": "email",
    "reason": "Format email invalide"
  }
}
```

## Limitations

### Rate Limiting
- 100 requêtes par minute par IP
- 1000 requêtes par heure par utilisateur authentifié

### Taille des requêtes
- Body JSON : 10MB maximum
- Upload d'images : 5MB maximum par fichier

### Formats supportés
- Images : JPG, PNG, GIF, WebP
- Encodage : UTF-8 uniquement

Cette API complète permet une gestion efficace de tous les aspects du système commercial avec une sécurité et des performances optimales.
