const fs = require('fs');
const path = require('path');
const Product = require('./Product');

const nouvelleAchatPath = path.join(__dirname, '../db/nouvelle_achat.json');

// Initialiser le fichier s'il n'existe pas
if (!fs.existsSync(nouvelleAchatPath)) {
  fs.writeFileSync(nouvelleAchatPath, JSON.stringify([], null, 2));
}

/**
 * Localise l'index de l'achat dans product.achats correspondant à une entrée nouvelle_achat.
 * Ordre de résolution :
 *  1. achats[i].nouvelleAchatId === achat.id
 *  2. achat.productAchatIndex (si cohérent)
 *  3. correspondance date + quantité + prix d'achat
 * @returns {number} index ou -1
 */
const locateProductAchatIndex = (product, achat) => {
  if (!product || !Array.isArray(product.achats) || !achat) return -1;
  const achats = product.achats;
  let idx = achats.findIndex(a => a && a.nouvelleAchatId && String(a.nouvelleAchatId) === String(achat.id));
  if (idx !== -1) return idx;
  const pIndex = achat.productAchatIndex;
  if (pIndex !== null && pIndex !== undefined && achats[pIndex]) {
    const a = achats[pIndex];
    // On accepte l'index enregistré s'il est plausible (même date OU mêmes quantité+prix)
    if (
      a.date === achat.date ||
      (Number(a.quantity) === Number(achat.quantity) && Number(a.purchasePrice) === Number(achat.purchasePrice))
    ) {
      return Number(pIndex);
    }
  }
  idx = achats.findIndex(a =>
    a &&
    a.date === achat.date &&
    Number(a.quantity) === Number(achat.quantity) &&
    Number(a.purchasePrice) === Number(achat.purchasePrice)
  );
  return idx;
};

const NouvelleAchat = {
  // Récupérer tous les achats
  getAll: () => {
    try {
      const data = fs.readFileSync(nouvelleAchatPath, 'utf8');
      const achats = JSON.parse(data);
      console.log(`📦 Retrieved ${achats.length} achats from database`);
      return achats;
    } catch (error) {
      console.error("❌ Error reading achats:", error);
      return [];
    }
  },

  // Récupérer un achat par ID
  getById: (id) => {
    try {
      const data = fs.readFileSync(nouvelleAchatPath, 'utf8');
      const achats = JSON.parse(data);
      return achats.find(achat => achat.id === id) || null;
    } catch (error) {
      console.error("❌ Error finding achat by id:", error);
      return null;
    }
  },

  // Récupérer les achats par mois et année
  getByMonthYear: (month, year) => {
    try {
      const data = fs.readFileSync(nouvelleAchatPath, 'utf8');
      const achats = JSON.parse(data);
      
      return achats.filter(achat => {
        const date = new Date(achat.date);
        return date.getMonth() + 1 === month && date.getFullYear() === year;
      });
    } catch (error) {
      console.error("❌ Error filtering achats by month/year:", error);
      return [];
    }
  },

  // Récupérer les achats par année
  getByYear: (year) => {
    try {
      const data = fs.readFileSync(nouvelleAchatPath, 'utf8');
      const achats = JSON.parse(data);
      
      return achats.filter(achat => {
        const date = new Date(achat.date);
        return date.getFullYear() === year;
      });
    } catch (error) {
      console.error("❌ Error filtering achats by year:", error);
      return [];
    }
  },

  /**
   * Créer un nouvel achat et gérer le produit associé
   * 
   * LOGIQUE DE FONCTIONNEMENT :
   * 1. Si productId est fourni et le produit existe → mise à jour du stock
   * 2. Si productId est fourni mais le produit n'existe pas → création du produit
   * 3. Si productId n'est pas fourni → création d'un nouveau produit
   * 4. Dans tous les cas → enregistrement de l'achat dans nouvelle_achat.json
   * 
   * @param {Object} achatData - Données de l'achat
   * @param {string} achatData.productId - ID du produit (optionnel)
   * @param {string} achatData.productDescription - Description du produit (obligatoire)
   * @param {number} achatData.purchasePrice - Prix d'achat unitaire (obligatoire)
   * @param {number} achatData.quantity - Quantité achetée (obligatoire)
   * @param {string} achatData.fournisseur - Nom du fournisseur (optionnel)
   * @param {string} achatData.caracteristiques - Caractéristiques du produit (optionnel)
   * @param {string} achatData.date - Date de l'achat (optionnel, défaut: maintenant)
   * @returns {Object|null} L'achat créé ou null en cas d'erreur
   */
  /**
   * Créer un nouvel achat et gérer le produit associé
   * 
   * LOGIQUE CENTRALISÉE (corrige le bug de double quantité) :
   * Le backend gère TOUTE la logique de création/mise à jour du produit.
   * Le frontend n'envoie que les données de l'achat.
   * 
   * CAS :
   * 1. productId fourni et produit existe → mise à jour du stock (quantité EXACTE du formulaire)
   * 2. productId fourni mais produit n'existe pas → création du produit
   * 3. Pas de productId → recherche par description, sinon création
   */
  create: (achatData) => {
    try {
      console.log('📝 Creating new achat:', achatData);
      
      // Lire les achats existants
      const data = fs.readFileSync(nouvelleAchatPath, 'utf8');
      const achats = JSON.parse(data);
      
      // Variable pour stocker l'ID du produit final
      let finalProductId = achatData.productId;
      const quantityToAdd = Number(achatData.quantity);
      // 🆕 Disponibilité de cet achat (défaut: true)
      const disponible = achatData.disponible !== false;
      // Quantité réellement ajoutée au stock vendable (0 si indisponible)
      const sellableDelta = disponible ? quantityToAdd : 0;
      // ID provisoire de l'achat (utilisé pour lier l'entrée nouvelle_achat <-> product.achats)
      const nouvelleAchatId = Date.now().toString();
      // Index attendu de l'achat dans product.achats (rempli plus bas)
      let productAchatIndex = null;

      // ========================================
      // GESTION DU PRODUIT
      // ========================================
      const achatDate = achatData.date || new Date().toISOString();
      if (achatData.productId) {
        // CAS 1: Un productId est fourni
        const existingProduct = Product.getById(achatData.productId);
        
        if (existingProduct) {
          // CAS 1A: Le produit existe → mise à jour du stock + historique
          console.log('📦 Updating existing product stock...');
          console.log(`   Current quantity: ${existingProduct.quantity}, Adding (sellable): ${sellableDelta}, disponible=${disponible}`);
          
          const newPurchasePrice = Number(achatData.purchasePrice) || existingProduct.purchasePrice;
          const updatedProductData = {
            description: achatData.productDescription || existingProduct.description,
            purchasePrice: newPurchasePrice,
            quantity: existingProduct.quantity + sellableDelta,
            fournisseur: achatData.fournisseur || existingProduct.fournisseur || '',
            newPurchase: {
              date: achatDate,
              quantity: quantityToAdd,
              purchasePrice: newPurchasePrice,
              fournisseur: achatData.fournisseur || existingProduct.fournisseur || '',
              disponible,
              nouvelleAchatId
            }
          };
          
          const updated = Product.update(achatData.productId, updatedProductData);
          if (updated && Array.isArray(updated.achats)) productAchatIndex = updated.achats.length - 1;
          console.log(`✅ Product updated - New sellable quantity: ${updatedProductData.quantity}`);
        } else {
          // CAS 1B: Le productId est fourni mais le produit n'existe pas → création
          console.log('🆕 Product ID provided but product not found, creating new product...');
          const newProduct = Product.create({
            description: achatData.productDescription,
            purchasePrice: Number(achatData.purchasePrice),
            quantity: quantityToAdd,
            sellingPrice: 0,
            fournisseur: achatData.fournisseur || '',
            dateAchat: achatDate,
            disponible,
            nouvelleAchatId
          });
          
          if (newProduct) {
            finalProductId = newProduct.id;
            productAchatIndex = 0;
            console.log(`✅ New product created with quantity: ${quantityToAdd} (disponible=${disponible})`);
          }
        }
      } else {
        // CAS 2: Pas de productId fourni → vérifier si le produit existe par description
        console.log('🔍 No productId provided, checking if product exists by description...');
        
        const allProducts = Product.getAll();
        const existingProductByDescription = allProducts.find(
          p => p.description.toLowerCase().trim() === achatData.productDescription.toLowerCase().trim()
        );
        
        if (existingProductByDescription) {
          // CAS 2A: Un produit avec la même description existe → mise à jour
          console.log('📦 Found existing product by description, updating stock...');
          
          finalProductId = existingProductByDescription.id;
          
          const newPurchasePrice = Number(achatData.purchasePrice) || existingProductByDescription.purchasePrice;
          const updatedProductData = {
            purchasePrice: newPurchasePrice,
            quantity: existingProductByDescription.quantity + sellableDelta,
            fournisseur: achatData.fournisseur || existingProductByDescription.fournisseur || '',
            newPurchase: {
              date: achatDate,
              quantity: quantityToAdd,
              purchasePrice: newPurchasePrice,
              fournisseur: achatData.fournisseur || existingProductByDescription.fournisseur || '',
              disponible,
              nouvelleAchatId
            }
          };
          
          const updated = Product.update(existingProductByDescription.id, updatedProductData);
          if (updated && Array.isArray(updated.achats)) productAchatIndex = updated.achats.length - 1;
          console.log(`✅ Existing product updated - New sellable quantity: ${updatedProductData.quantity}`);
        } else {
          // CAS 2B: Aucun produit correspondant → création d'un nouveau produit
          console.log('🆕 No matching product found, creating new product...');
          const newProduct = Product.create({
            description: achatData.productDescription,
            purchasePrice: Number(achatData.purchasePrice),
            quantity: quantityToAdd,
            sellingPrice: 0,
            fournisseur: achatData.fournisseur || '',
            dateAchat: achatDate,
            disponible,
            nouvelleAchatId
          });
          
          if (newProduct) {
            finalProductId = newProduct.id;
            productAchatIndex = 0;
            console.log(`✅ New product created with quantity: ${quantityToAdd} (disponible=${disponible})`);
          } else {
            console.error('❌ Failed to create new product');
          }
        }
      }

      
      // ========================================
      // CRÉATION DE L'ENREGISTREMENT D'ACHAT
      // ========================================
      const newAchat = {
        id: nouvelleAchatId,
        date: achatData.date || new Date().toISOString(),
        productId: finalProductId,
        productDescription: achatData.productDescription,
        purchasePrice: Number(achatData.purchasePrice),
        quantity: quantityToAdd,
        fournisseur: achatData.fournisseur || '',
        caracteristiques: achatData.caracteristiques || '',
        totalCost: Number(achatData.purchasePrice) * quantityToAdd,
        type: 'achat_produit',
        disponible,
        productAchatIndex,
        // 🆕 URL de la facture d'achat (facultatif)
        receiptUrl: achatData.receiptUrl || null
      };
      
      achats.push(newAchat);
      fs.writeFileSync(nouvelleAchatPath, JSON.stringify(achats, null, 2));
      
      console.log('✅ Achat created successfully:', newAchat);
      return newAchat;
    } catch (error) {
      console.error("❌ Error creating achat:", error);
      return null;
    }
  },

  // Mettre à jour un achat
  update: (id, achatData) => {
    try {
      console.log(`📝 Updating achat ${id}:`, achatData);
      
      const data = fs.readFileSync(nouvelleAchatPath, 'utf8');
      let achats = JSON.parse(data);
      
      const achatIndex = achats.findIndex(achat => achat.id === id);
      if (achatIndex === -1) {
        console.log(`❌ Achat not found for update: ${id}`);
        return null;
      }
      
      const existing = achats[achatIndex];
      const nextType = achatData.type ?? existing.type;
      const isAchatProduit = nextType === 'achat_produit';

      // Calculer le nouveau totalCost
      // - Achat produit: totalCost = purchasePrice * quantity
      // - Dépense: totalCost = montant saisi (pas de quantity)
      const totalCost = isAchatProduit
        ? (Number(achatData.purchasePrice ?? existing.purchasePrice ?? 0) *
           Number(achatData.quantity ?? existing.quantity ?? 0))
        : Number(achatData.totalCost ?? achatData.montant ?? achatData.purchasePrice ?? existing.totalCost ?? 0);

      const updatedData = {
        ...existing,
        ...achatData,
        totalCost
      };

      // 🆕 Synchroniser l'achat correspondant dans products.json (quantité, prix, date, fournisseur, dispo)
      if (isAchatProduit && existing.productId) {
        try {
          const product = Product.getById(existing.productId);
          const pIndex = locateProductAchatIndex(product, existing);

          if (product && pIndex !== -1) {
            // 1) Patch de l'entrée product.achats[pIndex] (ajuste product.quantity via delta)
            const patch = {};
            if (achatData.date !== undefined) patch.date = achatData.date;
            if (achatData.quantity !== undefined) patch.quantity = Number(achatData.quantity);
            if (achatData.purchasePrice !== undefined) patch.purchasePrice = Number(achatData.purchasePrice);
            if (achatData.fournisseur !== undefined) patch.fournisseur = achatData.fournisseur;
            if (achatData.disponible !== undefined) patch.disponible = achatData.disponible !== false;
            if (Object.keys(patch).length > 0) {
              Product.updateAchat(existing.productId, pIndex, patch);
            }
            updatedData.productAchatIndex = pIndex;

            // 2) Champs de tête du produit (description, prix d'achat courant, fournisseur)
            const isLatestAchat = pIndex === (product.achats.length - 1);
            const headPatch = {};
            if (
              achatData.productDescription !== undefined &&
              String(achatData.productDescription).trim() &&
              achatData.productDescription !== product.description
            ) {
              headPatch.description = achatData.productDescription;
            }
            if (isLatestAchat && achatData.purchasePrice !== undefined && Number(achatData.purchasePrice) > 0) {
              headPatch.purchasePrice = Number(achatData.purchasePrice);
            }
            if (isLatestAchat && achatData.fournisseur !== undefined && String(achatData.fournisseur).trim()) {
              headPatch.fournisseur = String(achatData.fournisseur).trim();
            }
            if (Object.keys(headPatch).length > 0) {
              Product.update(existing.productId, headPatch);
            }
          } else if (
            product &&
            achatData.disponible !== undefined &&
            (existing.disponible !== false) !== (achatData.disponible !== false)
          ) {
            console.warn('⚠️ Achat produit introuvable dans product.achats — synchronisation stock ignorée');
          }
        } catch (e) {
          console.warn('⚠️ Impossible de synchroniser le produit après modification de l\'achat:', e.message);
        }
      }

      achats[achatIndex] = updatedData;
      fs.writeFileSync(nouvelleAchatPath, JSON.stringify(achats, null, 2));

      console.log('✅ Achat updated successfully:', updatedData);
      return updatedData;
    } catch (error) {
      console.error("❌ Error updating achat:", error);
      return null;
    }
  },

  // Supprimer un achat
  delete: (id) => {
    try {
      console.log(`🗑️ Deleting achat ${id}`);

      const data = fs.readFileSync(nouvelleAchatPath, 'utf8');
      let achats = JSON.parse(data);

      const achatIndex = achats.findIndex(achat => achat.id === id);
      if (achatIndex === -1) {
        console.log(`❌ Achat not found for deletion: ${id}`);
        return false;
      }

      // Supprimer le fichier reçu associé si présent
      const target = achats[achatIndex];
      if (target && target.receiptUrl) {
        try {
          const rel = target.receiptUrl.replace(/^\/+/, ''); // 'uploads/depense/...' ou 'uploads/achat/...'
          const filePath = path.join(__dirname, '..', rel);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Deleted receipt file: ${filePath}`);
          }
        } catch (e) {
          console.warn('⚠️ Could not delete receipt file:', e.message);
        }
      }

      // 🆕 Retour arrière côté produit : on restaure l'état d'AVANT cet achat
      //  - la quantité de l'achat est retirée du stock (Product.deleteAchat)
      //  - le prix d'achat / fournisseur reviennent à ceux de l'achat précédent
      //  - si le produit a été créé par cet achat (aucun autre achat, aucune vente) → produit supprimé
      if (target && target.type === 'achat_produit' && target.productId) {
        try {
          const product = Product.getById(target.productId);
          const pIndex = locateProductAchatIndex(product, target);
          if (product && pIndex !== -1) {
            const removed = product.achats[pIndex];
            const afterDelete = Product.deleteAchat(target.productId, pIndex);
            const remaining = (afterDelete && Array.isArray(afterDelete.achats)) ? afterDelete.achats : [];
            const ventes = Array.isArray(product.ventes) ? product.ventes : [];

            if (remaining.length === 0 && ventes.length === 0) {
              // Le produit n'existait pas avant cet achat → on le supprime
              Product.delete(target.productId);
              console.log(`🗑️ Produit ${target.productId} supprimé (créé uniquement par l'achat ${id})`);
            } else if (afterDelete && !afterDelete.error) {
              const rollback = {};
              // Achat "précédent" = le dernier des achats restants situés avant l'achat supprimé,
              // sinon le dernier achat restant
              const previous = remaining[Math.min(pIndex, remaining.length) - 1] || remaining[remaining.length - 1];
              const removedPrice = Number(removed && removed.purchasePrice) || Number(target.purchasePrice) || 0;
              if (previous && Number(product.purchasePrice) === removedPrice && Number(previous.purchasePrice) > 0) {
                rollback.purchasePrice = Number(previous.purchasePrice);
              }
              const removedFournisseur = String((removed && removed.fournisseur) || target.fournisseur || '').trim().toLowerCase();
              const currentFournisseur = String(product.fournisseur || '').trim().toLowerCase();
              if (previous && removedFournisseur && currentFournisseur === removedFournisseur && previous.fournisseur) {
                rollback.fournisseur = String(previous.fournisseur).trim();
                const history = Array.isArray(product.fournisseursHistory) ? [...product.fournisseursHistory] : [];
                const last = history[history.length - 1];
                if (last && String(last.nom || '').trim().toLowerCase() === removedFournisseur && history.length > 1) {
                  history.pop();
                  rollback.fournisseursHistory = history;
                }
              }
              if (Object.keys(rollback).length > 0) {
                Product.update(target.productId, rollback);
                console.log(`↩️ Produit ${target.productId} restauré à l'état précédent:`, rollback);
              }
            }
          }
        } catch (e) {
          console.warn('⚠️ Impossible de restaurer le produit après suppression de l\'achat:', e.message);
        }
      }

      achats.splice(achatIndex, 1);
      fs.writeFileSync(nouvelleAchatPath, JSON.stringify(achats, null, 2));

      console.log('✅ Achat deleted successfully');
      return true;
    } catch (error) {
      console.error("❌ Error deleting achat:", error);
      return false;
    }
  },

  // Ajouter une dépense (taxes, carburant, autres)
  addDepense: (depenseData) => {
    try {
      console.log('📝 Adding depense:', depenseData);

      const data = fs.readFileSync(nouvelleAchatPath, 'utf8');
      const achats = JSON.parse(data);

      const newDepense = {
        id: Date.now().toString(),
        date: depenseData.date || new Date().toISOString(),
        description: depenseData.description,
        totalCost: Number(depenseData.montant),
        type: depenseData.type || 'autre_depense', // taxes, carburant, autre_depense
        categorie: depenseData.categorie || 'divers',
        // URL du reçu (image ou PDF) — facultatif
        receiptUrl: depenseData.receiptUrl || null
      };

      achats.push(newDepense);
      fs.writeFileSync(nouvelleAchatPath, JSON.stringify(achats, null, 2));

      console.log('✅ Depense added successfully:', newDepense);
      return newDepense;
    } catch (error) {
      console.error("❌ Error adding depense:", error);
      return null;
    }
  },

  // Calculer les statistiques mensuelles
  getMonthlyStats: (month, year) => {
    try {
      const achats = NouvelleAchat.getByMonthYear(month, year);
      
      const stats = {
        totalAchats: 0,
        totalDepenses: 0,
        achatsCount: 0,
        depensesCount: 0,
        byType: {}
      };
      
      achats.forEach(item => {
        if (item.type === 'achat_produit') {
          stats.totalAchats += item.totalCost;
          stats.achatsCount++;
        } else {
          stats.totalDepenses += item.totalCost;
          stats.depensesCount++;
        }
        
        // Regrouper par type
        if (!stats.byType[item.type]) {
          stats.byType[item.type] = { total: 0, count: 0 };
        }
        stats.byType[item.type].total += item.totalCost;
        stats.byType[item.type].count++;
      });
      
      stats.totalGeneral = stats.totalAchats + stats.totalDepenses;
      
      return stats;
    } catch (error) {
      console.error("❌ Error calculating monthly stats:", error);
      return null;
    }
  },

  // Calculer les statistiques annuelles
  getYearlyStats: (year) => {
    try {
      const achats = NouvelleAchat.getByYear(year);
      
      const stats = {
        totalAchats: 0,
        totalDepenses: 0,
        achatsCount: 0,
        depensesCount: 0,
        byMonth: {},
        byType: {}
      };
      
      achats.forEach(item => {
        const date = new Date(item.date);
        const month = date.getMonth() + 1;
        
        // Statistiques par mois
        if (!stats.byMonth[month]) {
          stats.byMonth[month] = { achats: 0, depenses: 0 };
        }
        
        if (item.type === 'achat_produit') {
          stats.totalAchats += item.totalCost;
          stats.achatsCount++;
          stats.byMonth[month].achats += item.totalCost;
        } else {
          stats.totalDepenses += item.totalCost;
          stats.depensesCount++;
          stats.byMonth[month].depenses += item.totalCost;
        }
        
        // Regrouper par type
        if (!stats.byType[item.type]) {
          stats.byType[item.type] = { total: 0, count: 0 };
        }
        stats.byType[item.type].total += item.totalCost;
        stats.byType[item.type].count++;
      });
      
      stats.totalGeneral = stats.totalAchats + stats.totalDepenses;
      
      return stats;
    } catch (error) {
      console.error("❌ Error calculating yearly stats:", error);
      return null;
    }
  }
};

module.exports = NouvelleAchat;