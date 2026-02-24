# Guide de Modification - Logique de Remboursement

## ⚠️ Important

Ce document décrit la logique complète du système de remboursement. Si vous devez modifier des fonctionnalités liées aux remboursements, consultez d'abord les fichiers et flux décrits ci-dessous.

## Fichiers à connaître

### Frontend

| Fichier | Responsabilité |
|---------|----------------|
| `src/components/dashboard/RefundForm.tsx` | Formulaire principal de remboursement |
| `src/components/dashboard/ViewRefundsModal.tsx` | Modal de consultation des remboursements du mois |
| `src/components/dashboard/AddSaleForm.tsx` | Bouton "Rembourser" sur les ventes + logique suppression remboursement |
| `src/components/dashboard/forms/MultiProductSaleForm.tsx` | Bouton "Rembourser" en mode édition |
| `src/components/dashboard/SalesTable.tsx` | Affichage des remboursements en rouge |
| `src/components/dashboard/sections/SalesManagementSection.tsx` | Boutons "Remboursement" et "Voir Remboursements" |
| `src/services/api/remboursementApi.ts` | Service API client |

### Backend

| Fichier | Responsabilité |
|---------|----------------|
| `server/routes/remboursements.js` | Routes API (GET, POST, DELETE) |
| `server/models/Remboursement.js` | Modèle CRUD pour remboursement.json |
| `server/models/Product.js` | `updateQuantity()` pour ajuster le stock |
| `server/models/Sale.js` | `create()` et `delete()` pour les ventes négatives |
| `server/db/remboursement.json` | Base de données des remboursements |
| `server/db/sales.json` | Contient les ventes normales ET les remboursements (isRefund: true) |
| `server/db/products.json` | Stock des produits |

## Flux détaillé

### Création d'un remboursement

```
RefundForm.handlePreSubmit()
  │
  ├── Vérifie si des produits ont prix = prix original
  │   ├── OUI → Affiche modal "Remettre en stock ?"
  │   │         ├── Oui → handleSubmit(restoreStock=true)
  │   │         └── Non → handleSubmit(restoreStock=false)
  │   └── NON (tous partiels) → handleSubmit(restoreStock=false)
  │
  └── handleSubmit(restoreStock)
      │
      ├── handlePretOnRefund() (si prêts liés)
      │
      └── remboursementApiService.create({
            products, restoreStock, productsToRestore, ...
          })
          │
          └── POST /api/remboursements
              │
              ├── Si restoreStock && productsToRestore:
              │   └── Product.updateQuantity(id, +quantitySold)
              │
              ├── Sale.create({ ...negativeSaleData, isRefund: true })
              │
              └── Remboursement.create({ ...data, stockRestored, productsRestored })
```

### Suppression d'un remboursement

```
AddSaleForm.handleDelete() [quand isRefund]
  │
  ├── remboursementApiService.getAll()
  │   └── Trouver le remboursement lié (negativeSaleId === editSale.id)
  │
  └── remboursementApiService.delete(remboursement.id)
      │
      └── DELETE /api/remboursements/:id
          │
          ├── Si stockRestored && productsRestored:
          │   └── Product.updateQuantity(id, -quantityRefunded)
          │
          ├── Sale.delete(negativeSaleId)
          │
          └── Remboursement.delete(id)
```

## Calculs importants

### Bénéfice d'un remboursement
```
profit = (quantité × prix_remboursement_unitaire) - (quantité × prix_achat_unitaire)
```
Stocké en **négatif** dans sales.json.

### Détermination "remboursement total vs partiel"
```javascript
// Total si le prix de remboursement unitaire ≈ prix de vente original unitaire
const isFullRefund = Math.abs(refundPriceUnit - originalSellingPriceUnit) < 0.01;
```

## Règles métier

1. On doit toujours garder au moins 1 produit dans un remboursement
2. La quantité remboursée ne peut pas dépasser la quantité vendue
3. Le stock n'est restauré QUE si le prix est intégral ET que l'utilisateur confirme
4. La suppression d'un remboursement inverse la restauration de stock si elle avait eu lieu
5. Les remboursements apparaissent en rouge dans la table des ventes
6. Les valeurs dans sales.json sont TOUJOURS négatives pour un remboursement

## Points d'attention pour les modifications

- **Modifier le calcul du bénéfice** → `RefundForm.tsx` (lignes updateRefundPrice/updateQuantity) + `server/routes/remboursements.js` (POST)
- **Changer la logique de stock** → `RefundForm.tsx` (getFullRefundProducts/handlePreSubmit) + `server/routes/remboursements.js` (POST et DELETE)
- **Modifier l'affichage** → `SalesTable.tsx` (isRefund detection) + `ViewRefundsModal.tsx`
- **Ajouter des champs** → `RefundForm.tsx` (state + UI) + `server/routes/remboursements.js` (body parsing) + `server/models/Remboursement.js`
