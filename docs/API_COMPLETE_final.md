# DOCUMENTATION API COMPLÈTE

## Système de Gestion Commerciale - API Reference

**Version**: 2.0.0  
**Base URL**: `http://localhost:10000/api`  
**Dernière mise à jour**: 24 décembre 2025

---

## 📋 Table des Matières

1. [Authentification](#authentification)
2. [Produits](#produits)
3. [Ventes](#ventes)
4. [Clients](#clients)
5. [Prêts](#prêts)
6. [Dépenses](#dépenses)
7. [Rendez-vous](#rendez-vous)
8. [Notifications](#notifications)
9. [Objectifs](#objectifs)
10. [Synchronisation](#synchronisation)
11. [Codes d'erreur](#codes-derreur)

---

## Headers Requis

### Authentification Bearer Token
```
Authorization: Bearer <jwt_token>
```

### Content-Type
```
Content-Type: application/json
```

---

## Authentification

### POST /auth/login
Connexion utilisateur

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Jean",
    "lastName": "Dupont"
  }
}
```

### POST /auth/register
Inscription utilisateur

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "Jean",
  "lastName": "Dupont",
  "gender": "male",
  "address": "123 Rue Example",
  "phone": "0692123456"
}
```

### POST /auth/reset-password-request
Demande de réinitialisation

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### POST /auth/reset-password
Réinitialisation du mot de passe

**Request Body:**
```json
{
  "email": "user@example.com",
  "newPassword": "NewPassword123!"
}
```

---

## Produits

### GET /products
🔓 Public - Liste tous les produits

**Response:**
```json
[
  {
    "id": "uuid",
    "description": "Produit A",
    "purchasePrice": 50.00,
    "quantity": 100,
    "imageUrl": "/uploads/product-a.jpg",
    "createdAt": "2025-12-24T10:00:00.000Z"
  }
]
```

### GET /products/:id
🔓 Public - Détail d'un produit

### POST /products
🔒 Auth requise - Créer un produit

**Request Body:**
```json
{
  "description": "Nouveau produit",
  "purchasePrice": 50.00,
  "quantity": 100
}
```

### PUT /products/:id
🔒 Auth requise - Modifier un produit

### DELETE /products/:id
🔒 Auth requise - Supprimer un produit

### POST /products/:id/image
🔒 Auth requise - Upload image produit

**Content-Type:** `multipart/form-data`

---

## Ventes

### GET /sales
🔒 Auth requise - Liste toutes les ventes

### GET /sales/by-month
🔒 Auth requise - Ventes par mois

**Query Parameters:**
- `month`: number (1-12)
- `year`: number

### POST /sales
🔒 Auth requise - Créer une vente

**Request Body:**
```json
{
  "date": "2025-12-24",
  "productId": "uuid",
  "productName": "Produit A",
  "purchasePrice": 50.00,
  "sellingPrice": 80.00,
  "quantitySold": 2,
  "clientName": "Client A",
  "clientPhone": "0692123456",
  "clientAddress": "Adresse client"
}
```

**Note:** La quantité du produit est automatiquement diminuée.

### PUT /sales/:id
🔒 Auth requise - Modifier une vente

### DELETE /sales/:id
🔒 Auth requise - Supprimer une vente

### POST /sales/export-month
🔒 Auth requise - Exporter/Archiver les ventes du mois

---

## Clients

### GET /clients
🔒 Auth requise - Liste tous les clients

### POST /clients
🔒 Auth requise - Créer un client

**Request Body:**
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "0692123456",
  "adresse": "123 Rue Example",
  "email": "jean@example.com"
}
```

### PUT /clients/:id
🔒 Auth requise - Modifier un client

### DELETE /clients/:id
🔒 Auth requise - Supprimer un client

---

## Prêts

### Prêts Familiaux

#### GET /pretfamilles
🔒 Auth requise - Liste des prêts familiaux

#### POST /pretfamilles
🔒 Auth requise - Créer un prêt familial

**Request Body:**
```json
{
  "nom": "Dupont",
  "montant": 500.00,
  "dateDebut": "2025-12-24",
  "dateFin": "2026-01-24",
  "description": "Prêt mensuel"
}
```

#### PUT /pretfamilles/:id
🔒 Auth requise - Modifier un prêt

#### DELETE /pretfamilles/:id
🔒 Auth requise - Supprimer un prêt

### Prêts Produits

#### GET /pretproduits
🔒 Auth requise - Liste des prêts produits

#### POST /pretproduits
🔒 Auth requise - Créer un prêt produit

**Request Body:**
```json
{
  "clientNom": "Client A",
  "produit": "Produit A",
  "montantTotal": 100.00,
  "avance": 30.00,
  "reste": 70.00,
  "dateCreation": "2025-12-24"
}
```

---

## Dépenses

### Mouvements Mensuels

#### GET /depenses/mouvements
🔒 Auth requise - Liste des mouvements

#### POST /depenses/mouvements
🔒 Auth requise - Créer un mouvement

**Request Body:**
```json
{
  "type": "debit",
  "montant": 50.00,
  "description": "Courses",
  "categorie": "alimentation",
  "date": "2025-12-24"
}
```

### Dépenses Fixes

#### GET /depenses/fixe
🔒 Auth requise - Liste des dépenses fixes

#### PUT /depenses/fixe
🔒 Auth requise - Modifier les dépenses fixes

**Request Body:**
```json
{
  "telephoneInternet": 50.00,
  "assuranceVoiture": 80.00,
  "assuranceVie": 30.00,
  "autresCharges": 100.00
}
```

### POST /depenses/reset
🔒 Auth requise - Réinitialisation mensuelle

---

## Rendez-vous

### GET /rdv
🔒 Auth requise - Liste tous les RDV

**Response:**
```json
[
  {
    "id": "uuid",
    "titre": "Consultation client",
    "date": "2025-12-25",
    "heure": "10:00",
    "clientId": "uuid",
    "clientNom": "Dupont Jean",
    "description": "Présentation produits",
    "statut": "confirmed",
    "createdAt": "2025-12-24T10:00:00.000Z"
  }
]
```

### POST /rdv
🔒 Auth requise - Créer un RDV

**Request Body:**
```json
{
  "titre": "Nouveau RDV",
  "date": "2025-12-25",
  "heure": "14:30",
  "clientId": "uuid",
  "clientNom": "Dupont Jean",
  "description": "Notes",
  "statut": "pending"
}
```

### PUT /rdv/:id
🔒 Auth requise - Modifier un RDV

### DELETE /rdv/:id
🔒 Auth requise - Supprimer un RDV

### PATCH /rdv/:id/status
🔒 Auth requise - Changer le statut

**Request Body:**
```json
{
  "statut": "confirmed"
}
```

**Statuts valides:** `pending`, `confirmed`, `cancelled`, `completed`

---

## Notifications

### GET /rdv-notifications
🔒 Auth requise - Liste des notifications

**Query Parameters:**
- `unreadOnly`: boolean
- `type`: string
- `limit`: number (default: 50)

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "rdv_reminder",
      "title": "Rappel RDV",
      "message": "RDV demain à 10h",
      "priority": "medium",
      "read": false,
      "createdAt": "2025-12-24T10:00:00.000Z",
      "data": {
        "rdvId": "uuid"
      }
    }
  ],
  "unreadCount": 5,
  "total": 23
}
```

### POST /rdv-notifications
🔒 Auth requise - Créer une notification

**Request Body:**
```json
{
  "type": "rdv_reminder",
  "title": "Rappel de RDV",
  "message": "Vous avez un RDV demain à 10h",
  "priority": "medium",
  "data": {
    "rdvId": "uuid"
  }
}
```

### PATCH /rdv-notifications/:id/read
🔒 Auth requise - Marquer comme lue

### PATCH /rdv-notifications/read-all
🔒 Auth requise - Marquer tout comme lu

### DELETE /rdv-notifications/:id
🔒 Auth requise - Supprimer une notification

---

## Objectifs

### GET /objectif
🔒 Auth requise - Données actuelles + historique

**Response:**
```json
{
  "objectif": 2000,
  "totalVentesMois": 1500,
  "mois": 12,
  "annee": 2025,
  "historique": [
    {
      "mois": 1,
      "annee": 2025,
      "totalVentesMois": 1800,
      "objectif": 2000,
      "pourcentage": 90
    }
  ]
}
```

### PUT /objectif
🔒 Auth requise - Modifier l'objectif du mois en cours

**Request Body:**
```json
{
  "objectif": 3000,
  "month": 12,
  "year": 2025
}
```

**Note:** Les mois passés sont verrouillés et ne peuvent pas être modifiés.

**Response (403) - Si mois passé:**
```json
{
  "error": "Cannot modify objectif for past months"
}
```

### POST /objectif/recalculate
🔒 Auth requise - Recalculer depuis les ventes

Recalcule tous les totaux mensuels depuis `sales.json` en préservant les objectifs personnalisés.

### GET /objectif/historique
🔒 Auth requise - Historique annuel

**Response:**
```json
{
  "currentData": {
    "objectif": 2000,
    "totalVentesMois": 1500,
    "mois": 12,
    "annee": 2025
  },
  "historique": [...],
  "annee": 2025
}
```

---

## Synchronisation

### GET /sync/events
🔒 Auth requise - Connexion Server-Sent Events

**Headers requis:**
```
Accept: text/event-stream
Cache-Control: no-cache
```

**Events reçus:**

| Événement | Description |
|-----------|-------------|
| `connected` | Connexion établie |
| `data-changed` | Données modifiées |
| `force-sync` | Synchronisation forcée |
| `notification` | Nouvelle notification |

**Exemple de message SSE:**
```
data: {"type": "data-changed", "timestamp": "2025-12-24T10:00:00.000Z"}
```

---

## Codes d'Erreur

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Requête invalide / Données manquantes |
| 401 | Non authentifié / Token manquant |
| 403 | Accès interdit / Token invalide |
| 404 | Ressource non trouvée |
| 429 | Trop de requêtes (Rate limiting) |
| 500 | Erreur serveur interne |

### Format des Erreurs

```json
{
  "error": "Code d'erreur",
  "message": "Description détaillée",
  "details": {}
}
```

---

## Rate Limiting

| Type | Limite |
|------|--------|
| Général | 100 req/min par IP |
| Authentification | 10 req/min par IP |
| Opérations sensibles | 5 req/min par IP |

**Headers de réponse:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640351234
```

---

## Exemples d'Utilisation

### Connexion et utilisation

```javascript
// 1. Connexion
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'user@example.com', 
    password: 'password123' 
  })
});
const { token } = await loginResponse.json();

// 2. Requête authentifiée
const products = await fetch('/api/products', {
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// 3. Connexion SSE
const eventSource = new EventSource(`/api/sync/events?token=${token}`);
eventSource.onmessage = (event) => {
  console.log('Data changed:', JSON.parse(event.data));
};
```

### Modifier l'objectif mensuel

```javascript
const updateObjectif = async (newObjectif) => {
  const response = await fetch('/api/objectif', {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      objectif: newObjectif,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    })
  });
  
  if (response.status === 403) {
    throw new Error('Cannot modify past months');
  }
  
  return response.json();
};
```

---

*Documentation API mise à jour le 24 décembre 2025*
