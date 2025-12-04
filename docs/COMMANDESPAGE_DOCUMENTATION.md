# Documentation - Page CommandesPage

## Vue d'ensemble

La page **CommandesPage** est un composant React premium et moderne permettant de gérer les commandes et réservations de produits pour les clients. Elle offre une interface luxueuse avec des fonctionnalités complètes de gestion de panier, de recherche intelligente, et de suivi de statut.

---

## Caractéristiques principales

### 1. **Gestion des Commandes et Réservations**
- **Deux types d'entrées** :
  - **Commande** : Produits en route avec une date d'arrivage prévue
  - **Réservation** : Produits en attente avec une date d'échéance
- **Statuts disponibles** :
  - `en_route` : La commande est en cours de livraison
  - `arrive` : La commande est arrivée
  - `en_attente` : La réservation est en attente

### 2. **Système de Panier Multi-Produits**
- Ajout de **plusieurs produits** à une seule commande/réservation
- **Édition en ligne** : Possibilité de modifier chaque produit dans le panier
- **Suppression individuelle** : Retirer un produit spécifique du panier
- **Calcul automatique** :
  - Total du panier affiché en temps réel
  - Prix total par commande affiché dans la table (en gras et rouge)

### 3. **Recherche Intelligente avec Autocomplétion**
- **Recherche de clients** : Autocomplétion après 3 caractères minimum
- **Recherche de produits** : Autocomplétion après 3 caractères minimum
- **Exclusivité des produits** : Un produit déjà assigné à une commande/réservation n'apparaît plus dans les suggestions pour d'autres commandes
  - Exception : Lors de l'édition d'une commande existante, les produits de cette commande restent disponibles

### 4. **Création Automatique**
- **Clients** : Si un client n'existe pas, il est automatiquement créé lors de l'enregistrement de la commande
- **Produits** : Si un produit n'existe pas dans la base, il est automatiquement créé avec les informations saisies

### 5. **Notifications Automatiques**
- **Commande arrivée** : Notification lorsqu'une commande passe en statut "arrivé"
- **Réservation échue** : Notification lorsqu'une réservation atteint sa date d'échéance
- **Vérification périodique** : Toutes les 60 secondes, le système vérifie les notifications à envoyer

### 6. **Tri Dynamique par Date**
- **Tri intelligent** : Les commandes/réservations sont triées par date (arrivage ou échéance)
- **Deux modes** :
  - **Date proche vers loin** (par défaut) : Icône flèche vers le bas
  - **Date loin vers proche** : Icône flèche vers le haut
- **Toggle interactif** : Cliquer sur l'en-tête "Date" pour basculer entre les deux modes

### 7. **Design Premium et Luxueux**
- **Gradient colorés** : Utilisation de dégradés purple/pink/indigo
- **Icônes modernes** : 
  - Crown, Star, Sparkles, Diamond, Gift, Award, Zap (Lucide React)
  - Remplacent les icônes standards pour un look premium
- **Effets visuels** :
  - Ombres portées avancées
  - Effets de survol animés
  - Arrière-plans flous (backdrop-blur)
  - Bordures gradient
  - Animations framer-motion

---

## Structure des données

### Interface `Commande`
```typescript
interface Commande {
  id: string;
  clientNom: string;
  clientPhone: string;
  clientAddress: string;
  type: 'commande' | 'reservation';
  produits: CommandeProduit[];
  dateCommande: string;
  dateArrivagePrevue?: string;
  dateEcheance?: string;
  statut: 'en_route' | 'arrive' | 'en_attente';
  notificationEnvoyee?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

### Interface `CommandeProduit`
```typescript
interface CommandeProduit {
  nom: string;
  prixUnitaire: number;
  quantite: number;
  prixVente: number;
}
```

---

## Logique métier détaillée

### 1. **Validation du formulaire (`isFormValid`)**
```typescript
const isFormValid = () => {
  return (
    clientNom.trim() !== '' &&
    clientPhone.trim() !== '' &&
    clientAddress.trim() !== '' &&
    produitsListe.length > 0 &&
    (type === 'commande' ? dateArrivagePrevue.trim() !== '' : dateEcheance.trim() !== '')
  );
};
```
**Règles** :
- Informations client obligatoires (nom, téléphone, adresse)
- **Au moins un produit dans le panier** (produitsListe.length > 0)
- Les champs individuels du formulaire "Informations Produit" ne sont PAS obligatoires si le panier contient déjà des produits
- Date obligatoire selon le type (arrivage pour commande, échéance pour réservation)

### 2. **Ajout/Modification de produit dans le panier (avec validation de stock)**
```typescript
const handleAddProduit = () => {
  // Validation des champs produit
  if (!produitNom.trim() || !prixUnitaire.trim() || !quantite.trim() || !prixVente.trim()) {
    // Erreur
    return;
  }

  const quantiteInt = parseInt(quantite);
  
  // Vérifier si le produit existe dans products.json
  const existingProduct = products.find(p => p.description.toLowerCase() === produitNom.toLowerCase());
  
  if (existingProduct) {
    // Vérifier que la quantité en stock est supérieure à 0
    if (existingProduct.quantity <= 0) {
      toast({
        title: 'Stock insuffisant',
        description: `${produitNom} n'a plus de stock disponible`,
        variant: 'destructive',
      });
      return;
    }
    
    // Vérifier que la quantité demandée ne dépasse pas le stock disponible
    if (quantiteInt > existingProduct.quantity) {
      toast({
        title: 'Quantité insuffisante',
        description: `Stock disponible: ${existingProduct.quantity} unités`,
        variant: 'destructive',
      });
      return;
    }
  }

  const nouveauProduit: CommandeProduit = {
    nom: produitNom,
    prixUnitaire: parseFloat(prixUnitaire),
    quantite: quantiteInt,
    prixVente: parseFloat(prixVente),
  };

  if (editingProductIndex !== null) {
    // Mode édition : remplacer le produit existant
    const nouveauxProduits = [...produitsListe];
    nouveauxProduits[editingProductIndex] = nouveauProduit;
    setProduitsListe(nouveauxProduits);
  } else {
    // Mode ajout : ajouter un nouveau produit
    setProduitsListe([...produitsListe, nouveauProduit]);
  }
  
  resetProductFields();
};
```
**Règles de validation du stock** :
- Pour les produits existants dans products.json, la quantité en stock doit être > 0
- La quantité de la commande/réservation ne peut pas dépasser le stock disponible
- Les produits qui n'existent pas encore dans products.json peuvent être ajoutés (ils seront créés lors de la validation)

### 3. **Filtrage des produits disponibles**
```typescript
const filteredProducts = useMemo(() => {
  if (productSearch.length < 3) return [];
  
  // Récupérer tous les noms de produits déjà utilisés
  const usedProductNames = new Set<string>();
  commandes.forEach(commande => {
    // Ignorer la commande en cours d'édition
    if (editingCommande && commande.id === editingCommande.id) return;
    
    commande.produits.forEach(produit => {
      usedProductNames.add(produit.nom.toLowerCase());
    });
  });
  
  // Filtrer les produits non utilisés
  return products.filter(product => {
    const matchesSearch = product.description.toLowerCase().includes(productSearch.toLowerCase());
    const isNotUsed = !usedProductNames.has(product.description.toLowerCase());
    return matchesSearch && isNotUsed;
  });
}, [productSearch, products, commandes, editingCommande]);
```
**Logique** :
- Exclut les produits déjà assignés à d'autres commandes/réservations
- Permet les produits de la commande en cours d'édition (pour modification)

### 4. **Enregistrement de commande**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!isFormValid()) {
    // Erreur de validation
    return;
  }

  const commandeData: Partial<Commande> = {
    clientNom,
    clientPhone,
    clientAddress,
    type,
    produits: produitsListe, // Tous les produits du panier
    dateCommande: new Date().toISOString(),
    statut: type === 'commande' ? 'en_route' : 'en_attente',
  };

  // Ajouter la date selon le type
  if (type === 'commande') {
    commandeData.dateArrivagePrevue = dateArrivagePrevue;
  } else {
    commandeData.dateEcheance = dateEcheance;
  }

  // Créer le client si nécessaire
  const existingClient = clients.find(c => c.nom.toLowerCase() === clientNom.toLowerCase());
  if (!existingClient) {
    await api.post('/api/clients', { nom: clientNom, phone: clientPhone, adresse: clientAddress });
  }

  // Créer les produits si nécessaire
  for (const produit of produitsListe) {
    const existingProduct = products.find(p => p.description.toLowerCase() === produit.nom.toLowerCase());
    if (!existingProduct) {
      await api.post('/api/products', {
        description: produit.nom,
        purchasePrice: produit.prixUnitaire,
        quantity: produit.quantite
      });
    }
  }

  // Sauvegarder la commande
  if (editingCommande) {
    await api.put(`/api/commandes/${editingCommande.id}`, commandeData);
  } else {
    await api.post('/api/commandes', commandeData);
  }
};
```

### 5. **Calcul du prix total**
```typescript
// Dans le panier (bas du formulaire)
{produitsListe.reduce((sum, p) => sum + (p.prixVente * p.quantite), 0).toFixed(2)}€

// Dans la table (colonne Prix)
{commande.produits.reduce((sum, p) => sum + (p.prixVente * p.quantite), 0).toFixed(2)}€
```
**Formule** : `Σ(prixVente × quantite)` pour chaque produit

### 6. **Tri par date**
```typescript
const sortedCommandes = useMemo(() => {
  return [...commandes].sort((a, b) => {
    const dateA = new Date(a.type === 'commande' ? a.dateArrivagePrevue || '' : a.dateEcheance || '');
    const dateB = new Date(b.type === 'commande' ? b.dateArrivagePrevue || '' : b.dateEcheance || '');
    
    if (sortDateAsc) {
      // Du plus proche au plus loin
      return dateA.getTime() - dateB.getTime();
    } else {
      // Du plus loin au plus proche
      return dateB.getTime() - dateA.getTime();
    }
  });
}, [commandes, sortDateAsc]);
```
**Tri dynamique** :
- Compare `dateArrivagePrevue` pour les commandes
- Compare `dateEcheance` pour les réservations
- Tri ascendant (proche→loin) ou descendant (loin→proche)

### 7. **Synchronisation Validation/Ventes (confirmValidation)**
Lors de la validation d'une commande/réservation :
```typescript
const confirmValidation = async () => {
  // 1. Vérifier le stock disponible pour chaque produit
  for (const p of commandeToValidate.produits) {
    const existingProduct = products.find(prod => prod.description.toLowerCase() === p.nom.toLowerCase());
    if (existingProduct && existingProduct.quantity < p.quantite) {
      // Erreur : stock insuffisant
      return;
    }
  }
  
  // 2. Créer les produits qui n'existent pas (avec la quantité nécessaire)
  // 3. Enregistrer la vente dans sales.json
  const saleData = {
    date: today,
    products: saleProducts,
    totalPurchasePrice,
    totalSellingPrice,
    totalProfit,
    clientName, clientAddress, clientPhone
  };
  
  const saleResponse = await api.post('/api/sales', saleData);
  
  // 4. Mettre à jour la commande avec statut 'valide' et saleId
  await api.put(`/api/commandes/${validatingId}`, { 
    statut: 'valide',
    saleId: createdSale.id
  });
};
```

### 8. **Annulation/Changement de statut (handleStatusChange)**
Lorsqu'une commande validée change de statut :
```typescript
const handleStatusChange = async (id, newStatus) => {
  const commande = commandes.find(c => c.id === id);
  
  // Si la commande était "valide" et on change vers un autre statut
  if (commande.statut === 'valide' && commande.saleId) {
    // Supprimer la vente (le backend restaure automatiquement la quantité)
    await api.delete(`/api/sales/${commande.saleId}`);
    
    // Mettre à jour le statut et supprimer le saleId
    await api.put(`/api/commandes/${id}`, { statut: newStatus, saleId: null });
  }
};
```
**Comportement** :
- Une commande validée crée une vente dans `sales.json` et stocke le `saleId`
- Si le statut change de "validé" vers autre chose, la vente est supprimée et les quantités sont restaurées
- Le champ `saleId` maintient la relation entre commande et vente

---

## États React (useState)

### États principaux
```typescript
const [commandes, setCommandes] = useState<Commande[]>([]);
const [clients, setClients] = useState<Client[]>([]);
const [products, setProducts] = useState<Product[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [editingCommande, setEditingCommande] = useState<Commande | null>(null);
const [deleteId, setDeleteId] = useState<string | null>(null);
```

### États du formulaire
```typescript
const [clientNom, setClientNom] = useState('');
const [clientPhone, setClientPhone] = useState('');
const [clientAddress, setClientAddress] = useState('');
const [type, setType] = useState<'commande' | 'reservation'>('commande');
const [produitNom, setProduitNom] = useState('');
const [prixUnitaire, setPrixUnitaire] = useState('');
const [quantite, setQuantite] = useState('1');
const [prixVente, setPrixVente] = useState('');
const [dateArrivagePrevue, setDateArrivagePrevue] = useState('');
const [dateEcheance, setDateEcheance] = useState('');
```

### États du panier
```typescript
const [produitsListe, setProduitsListe] = useState<CommandeProduit[]>([]);
const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
```

### États de recherche
```typescript
const [clientSearch, setClientSearch] = useState('');
const [productSearch, setProductSearch] = useState('');
const [showClientSuggestions, setShowClientSuggestions] = useState(false);
const [showProductSuggestions, setShowProductSuggestions] = useState(false);
```

### État de tri
```typescript
const [sortDateAsc, setSortDateAsc] = useState(true);
```

---

## Fonctions principales

### Fonctions de chargement des données
- `fetchCommandes()` : Récupère toutes les commandes depuis l'API
- `fetchClients()` : Récupère tous les clients depuis l'API
- `fetchProducts()` : Récupère tous les produits depuis l'API

### Fonctions de gestion du formulaire
- `resetForm()` : Réinitialise tous les champs du formulaire et le panier
- `resetProductFields()` : Réinitialise uniquement les champs produit
- `isFormValid()` : Valide que le formulaire est prêt à être soumis
- `handleSubmit()` : Soumet le formulaire (création ou modification)

### Fonctions de gestion du panier
- `handleAddProduit()` : Ajoute ou modifie un produit dans le panier
- `handleEditProduit(index)` : Charge un produit du panier dans le formulaire pour édition
- `handleRemoveProduit(index)` : Retire un produit du panier

### Fonctions de gestion des commandes
- `handleEdit(commande)` : Charge une commande existante dans le formulaire pour édition
- `handleDelete(id)` : Supprime une commande
- `handleStatusChange(id, newStatus)` : Met à jour le statut d'une commande

### Fonctions de sélection
- `handleClientSelect(client)` : Sélectionne un client depuis l'autocomplétion
- `handleProductSelect(product)` : Sélectionne un produit depuis l'autocomplétion

### Fonctions utilitaires
- `checkNotifications()` : Vérifie et envoie les notifications (appelée toutes les 60s)
- `updateNotificationStatus(id)` : Marque une notification comme envoyée
- `getStatusBadge(statut)` : Retourne un badge stylisé selon le statut

---

## API Endpoints utilisés

### Commandes
- `GET /api/commandes` : Récupérer toutes les commandes
- `POST /api/commandes` : Créer une nouvelle commande
- `PUT /api/commandes/:id` : Mettre à jour une commande existante
- `DELETE /api/commandes/:id` : Supprimer une commande

### Clients
- `GET /api/clients` : Récupérer tous les clients
- `POST /api/clients` : Créer un nouveau client

### Produits
- `GET /api/products` : Récupérer tous les produits
- `POST /api/products` : Créer un nouveau produit

---

## Stockage des données

Toutes les données sont stockées dans des **fichiers JSON** sur le serveur backend :
- **Commandes** : `server/db/commandes.json`
- **Clients** : `server/db/clients.json`
- **Produits** : `server/db/products.json`

**Important** : Ce projet **n'utilise PAS Supabase**. Toute la persistance est gérée via des fichiers JSON.

---

## Composants UI utilisés

### Shadcn/UI Components
- `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription`
- `Button`
- `Input`, `Label`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `Badge`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogTrigger`
- `AlertDialog` et composants associés

### Composants personnalisés
- `Layout` : Wrapper de page
- `PremiumLoading` : Écran de chargement stylisé
- `ModernTable`, `ModernTableHeader`, `ModernTableRow`, `ModernTableHead`, `ModernTableCell` : Composants de table premium
- `SaleQuantityInput` : Input spécialisé pour les quantités

### Icônes (Lucide React)
- `Package`, `Plus`, `Trash2`, `Edit`, `ShoppingCart`, `TrendingUp`
- `Sparkles`, `Crown`, `Star`, `Gift`, `Award`, `Zap`, `Diamond`
- `ArrowUp`, `ArrowDown`

---

## Animations et effets visuels

### Framer Motion
- Animations d'apparition pour les composants
- Transitions fluides

### Effets CSS
- **Gradients** : `from-purple-600 via-pink-600 to-indigo-600`
- **Shadows** : `shadow-[0_20px_70px_rgba(168,85,247,0.3)]`
- **Backdrop blur** : `backdrop-blur-xl`
- **Transforms** : `hover:-translate-y-2 hover:scale-105`
- **Transitions** : `transition-all duration-500`
- **Borders** : `border-2 border-purple-300/50`

### Design Premium
- Arrière-plans avec effets de flou colorés (purple, pink)
- Boutons avec effets de hover animés
- Badges colorés selon le statut
- Table avec lignes alternées et effets de survol

---

## Gestion des erreurs et notifications

### Toast notifications
Utilise le hook `useToast` pour afficher des messages :
- **Succès** : `bg-app-green text-white`
- **Erreur** : `bg-app-red text-white`
- **Info** : Style par défaut

### Types de notifications
1. **Validation** : Formulaire invalide
2. **Opération réussie** : Création/modification/suppression
3. **Erreur réseau** : Impossible de charger/sauvegarder
4. **Notifications métier** : Commande arrivée, réservation échue

---

## Hooks et optimisations

### useMemo
- `filteredClients` : Optimise le filtrage des clients
- `filteredProducts` : Optimise le filtrage des produits (avec exclusion)
- `sortedCommandes` : Optimise le tri des commandes par date

### useEffect
- Chargement initial des données (commandes, clients, produits)
- Mise en place d'un intervalle pour les notifications (60s)
- Nettoyage de l'intervalle au démontage du composant

---

## Points d'attention et bonnes pratiques

### 1. **Exclusivité des produits**
Un produit ne peut être assigné qu'à une seule commande/réservation. Le système empêche automatiquement la sélection de produits déjà utilisés.

### 2. **Création automatique**
Les clients et produits sont créés automatiquement s'ils n'existent pas, facilitant le workflow.

### 3. **Validation flexible**
Si le panier contient déjà des produits, les champs individuels du formulaire "Informations Produit" ne sont pas obligatoires.

### 4. **Notifications périodiques**
Le système vérifie automatiquement les notifications toutes les 60 secondes, sans action manuelle.

### 5. **Calcul automatique du total**
Le prix total est calculé automatiquement dans le panier ET dans la table pour chaque commande.

### 6. **Responsive design**
Tous les composants s'adaptent aux différentes tailles d'écran (mobile, tablette, desktop).

---

## Améliorations futures possibles

1. **Export PDF** : Générer des factures ou bons de commande
2. **Filtres avancés** : Filtrer par client, statut, date, etc.
3. **Recherche globale** : Rechercher dans toutes les commandes
4. **Historique** : Voir l'historique des modifications d'une commande
5. **Paiements** : Gérer les paiements et les relances
6. **Stock** : Intégration avec un système de gestion de stock
7. **Multi-utilisateur** : Gestion des rôles et permissions

---

## Conclusion

La page **CommandesPage** est un composant complet et moderne offrant une gestion complète des commandes et réservations avec une interface utilisateur premium. Elle combine fonctionnalités avancées (panier multi-produits, recherche intelligente, notifications) avec un design luxueux et des performances optimisées.

Le code est bien structuré, documenté, et suit les meilleures pratiques React avec TypeScript.
