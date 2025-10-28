# GUIDE COMPLET DE MODIFICATION

## 📖 TABLE DES MATIÈRES

1. [Modification de l'inscription](#modification-inscription)
2. [Modification de la connexion](#modification-connexion)
3. [Ajouter un champ à un produit](#ajouter-champ-produit)
4. [Ajouter un champ à une vente](#ajouter-champ-vente)
5. [Ajouter un champ à un client](#ajouter-champ-client)
6. [Créer une nouvelle page](#creer-nouvelle-page)
7. [Modifier le design](#modifier-design)
8. [Ajouter une nouvelle route API](#ajouter-route-api)
9. [Modifier le calcul de profit](#modifier-calcul-profit)
10. [Ajouter une notification](#ajouter-notification)
11. [Modifier la synchro temps réel](#modifier-synchro)
12. [Ajouter un rôle utilisateur](#ajouter-role)
13. [Modifier le thème](#modifier-theme)
14. [Ajouter une statistique](#ajouter-statistique)
15. [Optimiser les performances](#optimiser-performances)

---

## <a name="modification-inscription"></a>1. 🔐 MODIFICATION DE L'INSCRIPTION

### Ajouter un champ lors de l'inscription

#### Exemple : Ajouter un champ "Téléphone"

**Étape 1 : Backend - Route d'inscription**
```javascript
// Fichier : server/routes/auth.js
// Ligne : 6-49

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;  // ← Ajouter phone
    
    if (!username || !email || !password || !phone) {  // ← Ajouter validation
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }
    
    // ... reste du code
    
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      phone  // ← Ajouter dans l'objet
    };
    
    // ... reste du code
  }
});
```

**Étape 2 : Backend - Type User**
```typescript
// Fichier : src/types/index.ts
// Ajouter dans l'interface User

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;  // ← Ajouter
}
```

**Étape 3 : Frontend - Page d'inscription**
```typescript
// Fichier : src/pages/RegisterPage.tsx
// Ajouter un state pour le téléphone

const [phone, setPhone] = useState('');

// Ajouter le champ dans le formulaire JSX
<div>
  <Label htmlFor="phone">Téléphone</Label>
  <Input
    id="phone"
    type="tel"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    placeholder="0692123456"
    required
  />
</div>

// Modifier la fonction handleSubmit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const success = await register({
    username,
    email,
    password,
    phone  // ← Ajouter
  });
  
  if (success) {
    navigate('/dashboard');
  }
};
```

**Étape 4 : Frontend - Context Auth**
```typescript
// Fichier : src/contexts/AuthContext.tsx
// Modifier l'interface RegisterData

interface RegisterData {
  username: string;
  email: string;
  password: string;
  phone: string;  // ← Ajouter
}

// Modifier la fonction register
const register = async (userData: RegisterData) => {
  const response = await api.post('/auth/register', {
    username: userData.username,
    email: userData.email,
    password: userData.password,
    phone: userData.phone  // ← Ajouter
  });
  
  // ... reste du code
};
```

---

## <a name="modification-connexion"></a>2. 🔓 MODIFICATION DE LA CONNEXION

### Changer la durée du token JWT

**Fichier** : `server/routes/auth.js`
**Ligne** : ~77

```javascript
// Actuellement : 24h
const token = jwt.sign(
  { userId: user.id, email: user.email },
  JWT_SECRET,
  { expiresIn: '24h' }  // ← Modifier ici
);

// Pour 7 jours :
{ expiresIn: '7d' }

// Pour 1 heure :
{ expiresIn: '1h' }

// Pour 30 jours :
{ expiresIn: '30d' }
```

### Ajouter un champ "Se souvenir de moi"

**Étape 1 : Frontend - LoginPage**
```typescript
// Fichier : src/pages/LoginPage.tsx

const [rememberMe, setRememberMe] = useState(false);

// Ajouter dans le formulaire
<div className="flex items-center">
  <Checkbox
    id="remember"
    checked={rememberMe}
    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
  />
  <Label htmlFor="remember" className="ml-2">
    Se souvenir de moi
  </Label>
</div>

// Modifier handleSubmit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const success = await login({ 
    email, 
    password,
    rememberMe  // ← Ajouter
  });
};
```

**Étape 2 : Backend - Route login**
```javascript
// Fichier : server/routes/auth.js

router.post('/login', async (req, res) => {
  const { email, password, rememberMe } = req.body;
  
  // Changer la durée du token selon rememberMe
  const expiresIn = rememberMe ? '30d' : '24h';
  
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn }  // ← Utiliser la variable
  );
  
  // ... reste du code
});
```

---

## <a name="ajouter-champ-produit"></a>3. 📦 AJOUTER UN CHAMP À UN PRODUIT

### Exemple : Ajouter un champ "Catégorie"

**Étape 1 : Backend - Structure JSON initiale**
```javascript
// Fichier : server/server.js
// Ligne : 57-79

const productsPath = path.join(dbPath, 'products.json');
if (!fs.existsSync(productsPath)) {
  fs.writeFileSync(productsPath, JSON.stringify([
    {
      id: "1",
      description: "Laptop",
      purchasePrice: 500,
      quantity: 10,
      categorie: "Électronique"  // ← Ajouter
    }
  ], null, 2));
}
```

**Étape 2 : Backend - Modèle Product**
```javascript
// Fichier : server/models/Product.js
// Ligne : 45-51 (fonction create)

const newProduct = {
  id: Date.now().toString(),
  description: productData.description,
  purchasePrice: productData.purchasePrice,
  quantity: productData.quantity,
  categorie: productData.categorie  // ← Ajouter
};
```

**Étape 3 : Backend - Route POST products**
```javascript
// Fichier : server/routes/products.js
// Ligne : 25-27 (validation)

const { description, purchasePrice, quantity, categorie } = req.body;

if (!description || !purchasePrice || !quantity || !categorie) {
  return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
}
```

**Étape 4 : Frontend - Type Product**
```typescript
// Fichier : src/types/index.ts

export interface Product {
  id: string;
  description: string;
  purchasePrice: number;
  quantity: number;
  categorie: string;  // ← Ajouter
}
```

**Étape 5 : Frontend - Formulaire AddProductForm**
```typescript
// Fichier : src/components/dashboard/AddProductForm.tsx

// Ajouter un state
const [categorie, setCategorie] = useState('');

// Ajouter dans le JSX
<div>
  <Label htmlFor="categorie">Catégorie</Label>
  <Select value={categorie} onValueChange={setCategorie}>
    <SelectTrigger>
      <SelectValue placeholder="Sélectionner" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="Électronique">Électronique</SelectItem>
      <SelectItem value="Vêtements">Vêtements</SelectItem>
      <SelectItem value="Alimentation">Alimentation</SelectItem>
      <SelectItem value="Autre">Autre</SelectItem>
    </SelectContent>
  </Select>
</div>

// Modifier handleSubmit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  await addProduct({
    description,
    purchasePrice: parseFloat(purchasePrice),
    quantity: parseInt(quantity),
    categorie  // ← Ajouter
  });
};
```

**Étape 6 : Frontend - Affichage dans Inventaire**
```typescript
// Fichier : src/components/dashboard/Inventaire.tsx

// Ajouter une colonne dans le tableau
<TableHead>Catégorie</TableHead>

// Dans le map des produits
<TableCell>{product.categorie}</TableCell>
```

---

## <a name="ajouter-champ-vente"></a>4. 💰 AJOUTER UN CHAMP À UNE VENTE

### Exemple : Ajouter un champ "Client"

**Étape 1 : Backend - Type Sale**
```typescript
// Fichier : src/types/index.ts

export interface Sale {
  id: string;
  productId: string;
  productDescription: string;
  quantitySold: number;
  sellingPrice: number;
  purchasePrice: number;
  profit: number;
  date: string;
  clientId?: string;      // ← Ajouter
  clientName?: string;    // ← Ajouter
}
```

**Étape 2 : Backend - Route POST sales**
```javascript
// Fichier : server/routes/sales.js
// Ligne : 127-137 (création de la vente)

const newSale = {
  id: Date.now().toString(),
  productId,
  productDescription,
  quantitySold,
  sellingPrice,
  purchasePrice,
  profit,
  date: date || new Date().toISOString(),
  clientId: req.body.clientId,      // ← Ajouter
  clientName: req.body.clientName   // ← Ajouter
};
```

**Étape 3 : Frontend - Formulaire AddSaleForm**
```typescript
// Fichier : src/components/dashboard/AddSaleForm.tsx

import { ClientSearchInput } from './ClientSearchInput';

// Ajouter des states
const [selectedClient, setSelectedClient] = useState<Client | null>(null);

// Ajouter dans le JSX
<div>
  <Label>Client (optionnel)</Label>
  <ClientSearchInput
    onClientSelect={setSelectedClient}
    selectedClient={selectedClient}
  />
</div>

// Modifier handleSubmit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  await addSale({
    productId: selectedProduct.id,
    productDescription: selectedProduct.description,
    quantitySold: parseInt(quantity),
    sellingPrice: parseFloat(sellingPrice),
    purchasePrice: selectedProduct.purchasePrice,
    date: new Date().toISOString(),
    clientId: selectedClient?.id,       // ← Ajouter
    clientName: selectedClient?.nom     // ← Ajouter
  });
};
```

**Étape 4 : Frontend - Affichage dans SalesTable**
```typescript
// Fichier : src/components/dashboard/SalesTable.tsx

// Ajouter une colonne
<TableHead>Client</TableHead>

// Dans le map des ventes
<TableCell>{sale.clientName || 'N/A'}</TableCell>
```

---

## <a name="ajouter-champ-client"></a>5. 👤 AJOUTER UN CHAMP À UN CLIENT

### Exemple : Ajouter un champ "Email"

**Étape 1 : Backend - Modèle Client**
```javascript
// Fichier : server/models/Client.js
// Ligne : 56-62 (fonction create)

const newClient = {
  id: Date.now().toString(),
  nom: clientData.nom,
  phone: clientData.phone,
  adresse: clientData.adresse,
  email: clientData.email,  // ← Ajouter
  dateCreation: new Date().toISOString()
};
```

**Étape 2 : Backend - Route POST clients**
```javascript
// Fichier : server/routes/clients.js
// Ligne : 37-42 (validation)

const { nom, phone, adresse, email } = req.body;

if (!nom || !phone || !adresse || !email) {
  return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
}
```

**Étape 3 : Frontend - Type Client**
```typescript
// Fichier : src/types/index.ts

export interface Client {
  id: string;
  nom: string;
  phone: string;
  adresse: string;
  email: string;        // ← Ajouter
  dateCreation: string;
}
```

**Étape 4 : Frontend - Page ClientsPage (formulaire d'ajout)**
```typescript
// Fichier : src/pages/ClientsPage.tsx

// Ajouter un state
const [email, setEmail] = useState('');

// Ajouter dans le formulaire d'ajout
<div>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="client@example.com"
    required
  />
</div>

// Modifier la fonction handleAddClient
const handleAddClient = async () => {
  await addClient({
    nom,
    phone,
    adresse,
    email  // ← Ajouter
  });
};
```

**Étape 5 : Frontend - Affichage dans le tableau**
```typescript
// Fichier : src/pages/ClientsPage.tsx

// Ajouter une colonne
<TableHead>Email</TableHead>

// Dans le map des clients
<TableCell>{client.email}</TableCell>
```

---

## <a name="creer-nouvelle-page"></a>6. 📄 CRÉER UNE NOUVELLE PAGE

### Exemple : Créer une page "Rapports"

**Étape 1 : Créer le fichier de la page**
```typescript
// Fichier : src/pages/RapportsPage.tsx

import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RapportsPage: React.FC = () => {
  return (
    <Layout requireAuth={true}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Rapports</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Rapport mensuel</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Contenu du rapport...</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RapportsPage;
```

**Étape 2 : Ajouter le lazy loading dans App.tsx**
```typescript
// Fichier : src/App.tsx
// Ligne : 28-38 (avec les autres imports lazy)

const RapportsPage = lazy(() => import('@/pages/RapportsPage'));
```

**Étape 3 : Ajouter la route**
```typescript
// Fichier : src/App.tsx
// Dans <Routes>, ligne ~68-100

<Route
  path="/rapports"
  element={
    <ProtectedRoute>
      <RapportsPage />
    </ProtectedRoute>
  }
/>
```

**Étape 4 : Ajouter le lien dans la navigation**
```typescript
// Fichier : src/components/Navbar.tsx
// Ajouter dans le menu

{isAuthenticated && (
  <NavigationMenuItem>
    <Link to="/rapports">
      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
        Rapports
      </NavigationMenuLink>
    </Link>
  </NavigationMenuItem>
)}
```

---

## <a name="modifier-design"></a>7. 🎨 MODIFIER LE DESIGN

### Changer la couleur primaire

**Fichier** : `src/index.css`
**Ligne** : ~10-50 (variables CSS)

```css
:root {
  /* Couleur primaire actuelle */
  --primary: 221.2 83.2% 53.3%;
  
  /* Pour changer en rouge */
  --primary: 0 84% 60%;
  
  /* Pour changer en vert */
  --primary: 142 76% 36%;
  
  /* Pour changer en orange */
  --primary: 25 95% 53%;
}

/* Mode sombre */
.dark {
  --primary: [même valeur ou différente];
}
```

**⚠️ Toujours utiliser des valeurs HSL (Hue Saturation Lightness)**

### Ajouter une nouvelle couleur

**Étape 1 : Définir la variable CSS**
```css
/* Fichier : src/index.css */

:root {
  --success: 142 76% 36%;      /* Vert pour succès */
  --warning: 38 92% 50%;       /* Orange pour avertissement */
  --info: 199 89% 48%;         /* Bleu pour info */
}

.dark {
  --success: 142 76% 36%;
  --warning: 38 92% 50%;
  --info: 199 89% 48%;
}
```

**Étape 2 : Ajouter dans Tailwind config**
```typescript
// Fichier : tailwind.config.ts

export default {
  theme: {
    extend: {
      colors: {
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        info: 'hsl(var(--info))',
      }
    }
  }
}
```

**Étape 3 : Utiliser dans les composants**
```typescript
<div className="bg-success text-white">Succès !</div>
<Button className="bg-warning">Attention</Button>
<Alert className="border-info">Information</Alert>
```

### Modifier le style d'un composant UI

**Exemple : Personnaliser le Button**

```typescript
// Fichier : src/components/ui/button.tsx

const buttonVariants = cva(
  "inline-flex items-center justify-center...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        
        // Modifier le style "destructive"
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-lg",
        
        // Ajouter un nouveau variant
        success: "bg-green-600 text-white hover:bg-green-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        
        // Ajouter une nouvelle taille
        xl: "h-14 rounded-lg px-10 text-lg",
      }
    }
  }
);
```

**Utilisation** :
```typescript
<Button variant="success" size="xl">
  Enregistrer
</Button>
```

---

## <a name="ajouter-route-api"></a>8. 🌐 AJOUTER UNE NOUVELLE ROUTE API

### Exemple : Créer une API pour les "Fournisseurs"

**Étape 1 : Créer le modèle**
```javascript
// Fichier : server/models/Fournisseur.js

const fs = require('fs');
const path = require('path');

const fournisseursPath = path.join(__dirname, '../db/fournisseurs.json');

const Fournisseur = {
  getAll: () => {
    try {
      const fournisseurs = JSON.parse(fs.readFileSync(fournisseursPath, 'utf8'));
      return fournisseurs;
    } catch (error) {
      console.error("Error reading fournisseurs:", error);
      return [];
    }
  },

  getById: (id) => {
    try {
      const fournisseurs = JSON.parse(fs.readFileSync(fournisseursPath, 'utf8'));
      return fournisseurs.find(f => f.id === id);
    } catch (error) {
      console.error("Error reading fournisseur by ID:", error);
      return null;
    }
  },

  create: (fournisseurData) => {
    try {
      const fournisseurs = JSON.parse(fs.readFileSync(fournisseursPath, 'utf8'));
      
      const newFournisseur = {
        id: Date.now().toString(),
        nom: fournisseurData.nom,
        email: fournisseurData.email,
        phone: fournisseurData.phone,
        adresse: fournisseurData.adresse,
        dateCreation: new Date().toISOString()
      };
      
      fournisseurs.push(newFournisseur);
      fs.writeFileSync(fournisseursPath, JSON.stringify(fournisseurs, null, 2));
      
      return newFournisseur;
    } catch (error) {
      console.error("Error creating fournisseur:", error);
      return null;
    }
  },

  update: (id, fournisseurData) => {
    try {
      let fournisseurs = JSON.parse(fs.readFileSync(fournisseursPath, 'utf8'));
      
      const index = fournisseurs.findIndex(f => f.id === id);
      if (index === -1) return null;
      
      fournisseurs[index] = { 
        ...fournisseurs[index], 
        ...fournisseurData 
      };
      
      fs.writeFileSync(fournisseursPath, JSON.stringify(fournisseurs, null, 2));
      
      return fournisseurs[index];
    } catch (error) {
      console.error("Error updating fournisseur:", error);
      return null;
    }
  },

  delete: (id) => {
    try {
      let fournisseurs = JSON.parse(fs.readFileSync(fournisseursPath, 'utf8'));
      
      const index = fournisseurs.findIndex(f => f.id === id);
      if (index === -1) return false;
      
      fournisseurs.splice(index, 1);
      fs.writeFileSync(fournisseursPath, JSON.stringify(fournisseurs, null, 2));
      
      return true;
    } catch (error) {
      console.error("Error deleting fournisseur:", error);
      return false;
    }
  }
};

module.exports = Fournisseur;
```

**Étape 2 : Créer les routes**
```javascript
// Fichier : server/routes/fournisseurs.js

const express = require('express');
const router = express.Router();
const Fournisseur = require('../models/Fournisseur');
const authMiddleware = require('../middleware/auth');

// GET all fournisseurs
router.get('/', authMiddleware, async (req, res) => {
  try {
    const fournisseurs = Fournisseur.getAll();
    res.json(fournisseurs);
  } catch (error) {
    console.error('Error getting fournisseurs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET fournisseur by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const fournisseur = Fournisseur.getById(req.params.id);
    
    if (!fournisseur) {
      return res.status(404).json({ message: 'Fournisseur not found' });
    }
    
    res.json(fournisseur);
  } catch (error) {
    console.error('Error getting fournisseur:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create fournisseur
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nom, email, phone, adresse } = req.body;
    
    if (!nom || !email || !phone || !adresse) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }
    
    const newFournisseur = Fournisseur.create({ nom, email, phone, adresse });
    
    if (!newFournisseur) {
      return res.status(500).json({ message: 'Error creating fournisseur' });
    }
    
    res.status(201).json(newFournisseur);
  } catch (error) {
    console.error('Error creating fournisseur:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update fournisseur
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { nom, email, phone, adresse } = req.body;
    
    const updatedFournisseur = Fournisseur.update(req.params.id, { nom, email, phone, adresse });
    
    if (!updatedFournisseur) {
      return res.status(404).json({ message: 'Fournisseur not found' });
    }
    
    res.json(updatedFournisseur);
  } catch (error) {
    console.error('Error updating fournisseur:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE fournisseur
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const success = Fournisseur.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({ message: 'Fournisseur not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting fournisseur:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
```

**Étape 3 : Créer le fichier JSON initial**
```javascript
// Fichier : server/server.js
// Ajouter après les autres créations de fichiers (ligne ~105)

const fournisseursPath = path.join(dbPath, 'fournisseurs.json');
if (!fs.existsSync(fournisseursPath)) {
  fs.writeFileSync(fournisseursPath, JSON.stringify([], null, 2));
}
```

**Étape 4 : Monter les routes dans le serveur**
```javascript
// Fichier : server/server.js

// Import (ligne ~154-164)
const fournisseursRoutes = require('./routes/fournisseurs');

// Mount (ligne ~166-176)
app.use('/api/fournisseurs', fournisseursRoutes);
```

**Étape 5 : Créer le service frontend**
```typescript
// Fichier : src/services/fournisseurService.ts

import api from '@/service/api';

export interface Fournisseur {
  id: string;
  nom: string;
  email: string;
  phone: string;
  adresse: string;
  dateCreation: string;
}

export const fournisseurService = {
  getAll: async (): Promise<Fournisseur[]> => {
    const response = await api.get('/fournisseurs');
    return response.data;
  },

  getById: async (id: string): Promise<Fournisseur> => {
    const response = await api.get(`/fournisseurs/${id}`);
    return response.data;
  },

  create: async (data: Omit<Fournisseur, 'id' | 'dateCreation'>): Promise<Fournisseur> => {
    const response = await api.post('/fournisseurs', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Fournisseur>): Promise<Fournisseur> => {
    const response = await api.put(`/fournisseurs/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/fournisseurs/${id}`);
  }
};
```

**Étape 6 : Ajouter au AppContext**
```typescript
// Fichier : src/contexts/AppContext.tsx

// Ajouter dans l'interface
fournisseurs: readonly Fournisseur[];
addFournisseur: (data: Omit<Fournisseur, 'id' | 'dateCreation'>) => Promise<void>;
updateFournisseur: (id: string, data: Partial<Fournisseur>) => Promise<void>;
deleteFournisseur: (id: string) => Promise<void>;

// Implémenter les méthodes
const addFournisseur = async (data: Omit<Fournisseur, 'id' | 'dateCreation'>) => {
  try {
    const newFournisseur = await fournisseurService.create(data);
    dispatch({ type: 'ADD_FOURNISSEUR', payload: newFournisseur });
    toast({ title: "Fournisseur ajouté" });
  } catch (error) {
    toast({ title: "Erreur", variant: "destructive" });
  }
};

// ... autres méthodes similaires
```

---

## <a name="modifier-calcul-profit"></a>9. 💹 MODIFIER LE CALCUL DE PROFIT

**Fichier** : `src/components/dashboard/forms/utils/saleCalculations.ts`

### Calcul actuel
```typescript
export const calculateProfit = (
  sellingPrice: number,
  purchasePrice: number,
  quantity: number
): number => {
  return (sellingPrice - purchasePrice) * quantity;
};
```

### Ajouter une commission de 10%
```typescript
export const calculateProfit = (
  sellingPrice: number,
  purchasePrice: number,
  quantity: number,
  commission: number = 0.10  // 10% par défaut
): number => {
  const grossProfit = (sellingPrice - purchasePrice) * quantity;
  const netProfit = grossProfit * (1 - commission);
  return netProfit;
};
```

### Ajouter des frais fixes
```typescript
export const calculateProfit = (
  sellingPrice: number,
  purchasePrice: number,
  quantity: number,
  fixedCosts: number = 5  // 5€ de frais fixes
): number => {
  const grossProfit = (sellingPrice - purchasePrice) * quantity;
  return grossProfit - fixedCosts;
};
```

### Calcul avec TVA
```typescript
export const calculateProfit = (
  sellingPrice: number,
  purchasePrice: number,
  quantity: number,
  tvaRate: number = 0.20  // 20% de TVA
): number => {
  const sellingPriceHT = sellingPrice / (1 + tvaRate);
  const purchasePriceHT = purchasePrice / (1 + tvaRate);
  return (sellingPriceHT - purchasePriceHT) * quantity;
};
```

**⚠️ Important** : Penser à mettre à jour aussi le calcul backend dans `server/routes/sales.js` ligne 89-90

---

## <a name="ajouter-notification"></a>10. 🔔 AJOUTER UNE NOTIFICATION

### Utiliser le toast existant

```typescript
import { useToast } from '@/hooks/use-toast';

function MonComposant() {
  const { toast } = useToast();
  
  const handleAction = () => {
    // Notification de succès
    toast({
      title: "Succès !",
      description: "L'action a été effectuée.",
      variant: "default",
      className: "notification-success"
    });
    
    // Notification d'erreur
    toast({
      title: "Erreur",
      description: "Une erreur est survenue.",
      variant: "destructive"
    });
    
    // Notification d'info
    toast({
      title: "Information",
      description: "Ceci est une information.",
      duration: 5000  // 5 secondes
    });
  };
}
```

### Créer un système de notifications persistantes

**Étape 1 : Créer le service**
```typescript
// Fichier : src/services/notificationService.ts

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];

  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    this.notifications.unshift(newNotification);
    this.notifyListeners();
  }

  markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }
}

export const notificationService = new NotificationService();
```

**Étape 2 : Créer le composant d'affichage**
```typescript
// Fichier : src/components/NotificationBell.tsx

import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { notificationService, Notification } from '@/services/notificationService';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    return notificationService.subscribe(setNotifications);
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2">
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1" variant="destructive">
              {unreadCount}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h3 className="font-semibold">Notifications</h3>
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune notification</p>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-2 rounded ${notif.read ? 'opacity-50' : ''}`}
                onClick={() => notificationService.markAsRead(notif.id)}
              >
                <p className="font-medium">{notif.title}</p>
                <p className="text-sm text-muted-foreground">{notif.message}</p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

**Étape 3 : Utiliser dans l'application**
```typescript
// Dans Navbar.tsx
import { NotificationBell } from '@/components/NotificationBell';

// Ajouter dans le JSX
<NotificationBell />

// Pour envoyer une notification depuis n'importe où
import { notificationService } from '@/services/notificationService';

notificationService.addNotification({
  title: "Nouvelle vente",
  message: "Une vente de 150€ vient d'être effectuée",
  type: "success"
});
```

---

## <a name="modifier-synchro"></a>11. 🔄 MODIFIER LA SYNCHRONISATION TEMPS RÉEL

### Changer l'intervalle de synchronisation

**Fichier** : `src/hooks/use-realtime-sync.ts`

```typescript
// Actuellement : 30 secondes
const SYNC_INTERVAL = 30000;

// Pour 1 minute :
const SYNC_INTERVAL = 60000;

// Pour 10 secondes :
const SYNC_INTERVAL = 10000;
```

### Désactiver la synchro pour une page spécifique

```typescript
// Dans le composant de la page
import { useRealtimeSync } from '@/hooks/use-realtime-sync';

function MaPage() {
  // Désactiver la synchro
  useRealtimeSync({ enabled: false });
  
  return <div>...</div>;
}
```

### Ajouter un nouveau type d'événement SSE

**Étape 1 : Backend - Ajouter dans SyncManager**
```javascript
// Fichier : server/middleware/sync.js

class SyncManager {
  // ... code existant
  
  notifyNewMessage(message) {
    this.sendToAll({
      type: 'new_message',  // ← Nouveau type
      data: message
    });
  }
}
```

**Étape 2 : Backend - Utiliser dans une route**
```javascript
// Fichier : server/routes/messages.js

router.post('/', async (req, res) => {
  // ... création du message
  
  // Notifier tous les clients connectés
  const { syncManager } = require('../middleware/sync');
  syncManager.notifyNewMessage(newMessage);
  
  res.status(201).json(newMessage);
});
```

**Étape 3 : Frontend - Écouter l'événement**
```typescript
// Fichier : src/services/realtimeService.ts

eventSource.addEventListener('new_message', (event) => {
  const message = JSON.parse(event.data);
  
  // Afficher une notification
  toast({
    title: "Nouveau message",
    description: message.sujet
  });
  
  // Rafraîchir les messages
  refreshMessages();
});
```

---

## <a name="ajouter-role"></a>12. 👔 AJOUTER UN RÔLE UTILISATEUR

### Système de rôles (Admin, Manager, Vendeur)

**Étape 1 : Backend - Ajouter le champ role à User**
```javascript
// Fichier : server/models/User.js

create: (userData) => {
  const newUser = {
    id: Date.now().toString(),
    username: userData.username,
    email: userData.email,
    password: userData.password,
    role: userData.role || 'vendeur'  // ← Rôle par défaut
  };
  
  // ... reste du code
}
```

**Étape 2 : Backend - Route d'inscription**
```javascript
// Fichier : server/routes/auth.js

router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  
  // Seuls les admins peuvent créer des admins
  if (role === 'admin') {
    return res.status(403).json({ message: 'Non autorisé' });
  }
  
  const newUser = User.create({
    username,
    email,
    password: hashedPassword,
    role: role || 'vendeur'
  });
  
  // ... reste du code
});
```

**Étape 3 : Backend - Middleware de vérification de rôle**
```javascript
// Fichier : server/middleware/checkRole.js

const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    
    next();
  };
};

module.exports = checkRole;
```

**Étape 4 : Backend - Utiliser dans les routes**
```javascript
// Fichier : server/routes/products.js

const checkRole = require('../middleware/checkRole');

// Seuls admin et manager peuvent supprimer
router.delete('/:id', authMiddleware, checkRole('admin', 'manager'), async (req, res) => {
  // ... logique de suppression
});
```

**Étape 5 : Frontend - Type User**
```typescript
// Fichier : src/types/index.ts

export type UserRole = 'admin' | 'manager' | 'vendeur';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}
```

**Étape 6 : Frontend - Hook pour vérifier le rôle**
```typescript
// Fichier : src/hooks/useRole.ts

import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

export function useRole() {
  const { user } = useAuth();
  
  const hasRole = (...roles: UserRole[]) => {
    return user && roles.includes(user.role);
  };
  
  const isAdmin = () => hasRole('admin');
  const isManager = () => hasRole('manager', 'admin');
  
  return { hasRole, isAdmin, isManager };
}
```

**Étape 7 : Frontend - Utiliser dans les composants**
```typescript
import { useRole } from '@/hooks/useRole';

function ProductActions() {
  const { isAdmin, hasRole } = useRole();
  
  return (
    <div>
      {/* Tous peuvent voir */}
      <Button>Voir</Button>
      
      {/* Seulement admin et manager peuvent modifier */}
      {hasRole('admin', 'manager') && (
        <Button>Modifier</Button>
      )}
      
      {/* Seulement admin peut supprimer */}
      {isAdmin() && (
        <Button variant="destructive">Supprimer</Button>
      )}
    </div>
  );
}
```

---

## <a name="modifier-theme"></a>13. 🌙 MODIFIER LE THÈME

### Ajouter un thème personnalisé (ex: "sunset")

**Fichier** : `src/index.css`

```css
/* Après les thèmes .dark et :root */
[data-theme="sunset"] {
  --background: 25 20% 95%;      /* Fond crème */
  --foreground: 15 60% 20%;      /* Texte brun foncé */
  --primary: 25 95% 53%;         /* Orange vif */
  --secondary: 340 85% 65%;      /* Rose/corail */
  --accent: 50 100% 70%;         /* Jaune doré */
  --muted: 30 30% 85%;
  --card: 20 25% 98%;
  --border: 30 25% 80%;
  /* ... autres variables */
}
```

**Modifier le ThemeContext**
```typescript
// Fichier : src/contexts/ThemeContext.tsx

type Theme = 'light' | 'dark' | 'sunset';  // ← Ajouter

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  
  useEffect(() => {
    const root = document.documentElement;
    
    // Retirer les anciennes classes
    root.classList.remove('light', 'dark', 'sunset');
    
    // Ajouter la nouvelle
    if (theme === 'sunset') {
      root.setAttribute('data-theme', 'sunset');
    } else {
      root.classList.add(theme);
    }
  }, [theme]);
  
  const cycleTheme = () => {
    setTheme(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'sunset';
      return 'light';
    });
  };
  
  // ... reste du code
};
```

**Ajouter un sélecteur de thème**
```typescript
// Fichier : src/components/ThemeSelector.tsx

import { Sun, Moon, Sunset } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="flex gap-2">
      <Button
        variant={theme === 'light' ? 'default' : 'outline'}
        size="icon"
        onClick={() => setTheme('light')}
      >
        <Sun className="h-4 w-4" />
      </Button>
      
      <Button
        variant={theme === 'dark' ? 'default' : 'outline'}
        size="icon"
        onClick={() => setTheme('dark')}
      >
        <Moon className="h-4 w-4" />
      </Button>
      
      <Button
        variant={theme === 'sunset' ? 'default' : 'outline'}
        size="icon"
        onClick={() => setTheme('sunset')}
      >
        <Sunset className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

---

## <a name="ajouter-statistique"></a>14. 📊 AJOUTER UNE STATISTIQUE

### Exemple : Ajouter "Produit le plus vendu"

**Étape 1 : Créer le calcul dans BusinessCalculationService**
```typescript
// Fichier : src/services/BusinessCalculationService.ts

export const getMostSoldProduct = (sales: Sale[]): {
  productId: string;
  productDescription: string;
  totalQuantity: number;
} | null => {
  if (sales.length === 0) return null;
  
  // Grouper par produit
  const productSales = sales.reduce((acc, sale) => {
    if (!acc[sale.productId]) {
      acc[sale.productId] = {
        productId: sale.productId,
        productDescription: sale.productDescription,
        totalQuantity: 0
      };
    }
    acc[sale.productId].totalQuantity += sale.quantitySold;
    return acc;
  }, {} as Record<string, { productId: string; productDescription: string; totalQuantity: number }>);
  
  // Trouver le max
  const products = Object.values(productSales);
  return products.reduce((max, product) => 
    product.totalQuantity > max.totalQuantity ? product : max
  );
};
```

**Étape 2 : Utiliser dans un composant**
```typescript
// Fichier : src/components/dashboard/MostSoldProduct.tsx

import { useApp } from '@/contexts/AppContext';
import { getMostSoldProduct } from '@/services/BusinessCalculationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export function MostSoldProduct() {
  const { sales } = useApp();
  const mostSold = getMostSoldProduct(sales);
  
  if (!mostSold) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Produit le plus vendu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucune vente</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Produit le plus vendu
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{mostSold.productDescription}</p>
        <p className="text-muted-foreground">
          {mostSold.totalQuantity} unités vendues
        </p>
      </CardContent>
    </Card>
  );
}
```

**Étape 3 : Ajouter dans le dashboard**
```typescript
// Fichier : src/pages/DashboardPage.tsx

import { MostSoldProduct } from '@/components/dashboard/MostSoldProduct';

// Dans le JSX
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <StatCard {...} />
  <StatCard {...} />
  <MostSoldProduct />  {/* ← Ajouter */}
</div>
```

---

## <a name="optimiser-performances"></a>15. ⚡ OPTIMISER LES PERFORMANCES

### Mémoïser un composant lourd

```typescript
// Avant
export function HeavyComponent({ data }: { data: DataType[] }) {
  return (
    <div>
      {data.map(item => <ExpensiveItem key={item.id} item={item} />)}
    </div>
  );
}

// Après
export const HeavyComponent = React.memo(({ data }: { data: DataType[] }) => {
  return (
    <div>
      {data.map(item => <ExpensiveItem key={item.id} item={item} />)}
    </div>
  );
}, (prevProps, nextProps) => {
  // Ne re-render que si data a changé
  return prevProps.data === nextProps.data;
});
```

### Débouncer une recherche

```typescript
// Fichier : src/hooks/useDebounce.ts

import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

**Utilisation**
```typescript
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  useEffect(() => {
    if (debouncedSearchTerm) {
      // Effectuer la recherche seulement après 500ms d'inactivité
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);
  
  return (
    <Input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Rechercher..."
    />
  );
}
```

### Virtualiser une longue liste

```bash
npm install react-window
```

```typescript
import { FixedSizeList as List } from 'react-window';

function VirtualizedList({ items }: { items: Item[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      {items[index].name}
    </div>
  );

  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </List>
  );
}
```

### Lazy load des images

```typescript
import { useState, useEffect, useRef } from 'react';

function LazyImage({ src, alt }: { src: string; alt: string }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      });
    });

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={imageSrc || 'placeholder.jpg'}
      alt={alt}
      loading="lazy"
    />
  );
}
```

---

## ✅ CHECKLIST GÉNÉRALE

### Avant de modifier du code :
- [ ] Comprendre le code existant
- [ ] Identifier les fichiers concernés (backend + frontend)
- [ ] Vérifier les dépendances
- [ ] Sauvegarder ou faire un commit

### Pendant la modification :
- [ ] Suivre les conventions de code
- [ ] Utiliser TypeScript correctement
- [ ] Utiliser les tokens sémantiques (pas de couleurs directes)
- [ ] Commenter le code si complexe

### Après la modification :
- [ ] Tester la fonctionnalité
- [ ] Vérifier la console (erreurs)
- [ ] Tester en mode clair ET sombre
- [ ] Tester sur mobile
- [ ] Mettre à jour la documentation

### Pour les modifications backend :
- [ ] Redémarrer le serveur
- [ ] Tester avec curl ou Postman
- [ ] Vérifier les logs serveur
- [ ] Vérifier la structure JSON

### Pour les modifications frontend :
- [ ] Vérifier le build (`npm run build`)
- [ ] Tester la navigation
- [ ] Vérifier la responsive
- [ ] Vérifier l'accessibilité

---

## 🆘 EN CAS DE PROBLÈME

### Le serveur ne démarre pas
1. Vérifier que le port 10000 est libre
2. Vérifier les dépendances (`npm install`)
3. Vérifier le fichier `.env`
4. Vérifier les logs d'erreur

### Le frontend ne compile pas
1. Vérifier les imports
2. Vérifier les types TypeScript
3. Supprimer `node_modules` et réinstaller
4. Vérifier la syntaxe JSX

### Les données ne se synchronisent pas
1. Vérifier la connexion SSE
2. Vérifier le token JWT
3. Vérifier les logs serveur
4. Vérifier `RealtimeWrapper`

### Les styles ne s'appliquent pas
1. Vérifier les classes Tailwind
2. Vérifier les variables CSS dans `index.css`
3. Vérifier le mode (clair/sombre)
4. Forcer un rebuild

---

## 📞 RESSOURCES

- Documentation backend : `docs/BACKEND_COMPLET.md`
- Documentation frontend : `docs/FRONTEND_COMPLET.md`
- Tests : `docs/TESTS_GUIDE.md`
- API : `docs/API_DOCUMENTATION.md`
