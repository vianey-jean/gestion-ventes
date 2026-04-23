// Types pour les produits

/**
 * Code-barre obfusqué tel que stocké dans products.json.
 * Le frontend (page Produits) sait le décoder pour afficher un vrai code-barre.
 */
export interface EncodedBarcode {
  v: number;       // version du format
  s: string;       // sel
  p: string[];     // segments encodés
  c: number;       // checksum
}

/**
 * Caractéristique persistée d'un produit.
 * - nom : description du produit
 * - numero : taille extraite (ex: "26")
 * - codeBarre : valeur réelle du code-barre OU forme obfusquée (objet)
 * - code : code produit lisible (ex: P-26-TKEAPJ)
 */
export interface ProductCaracteristique {
  nom: string;
  numero: string;
  codeBarre: string | EncodedBarcode;
  code: string;
}

export interface Product {
  id: string;
  code?: string; // Code unique du produit (7 caractères: P/T + chiffres + lettres)
  description: string;
  purchasePrice: number;
  quantity: number;
  sellingPrice?: number;
  profit?: number;
  reserver?: string; // "oui" si le produit est réservé
  photos?: string[]; // URLs des photos du produit (stockées dans /uploads)
  mainPhoto?: string; // URL de la photo principale
  fournisseur?: string; // Nom du fournisseur
  caracteristique?: ProductCaracteristique; // Caractéristique imprimable (nom, numero, codeBarre, code)
}

export interface ProductFormData {
  description: string;
  purchasePrice: number;
  quantity: number;
  sellingPrice?: number;
  fournisseur?: string;
}
