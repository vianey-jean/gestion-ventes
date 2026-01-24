/**
 * ProductSearchInput - Composant de recherche de produit
 * 
 * RÔLE :
 * Ce composant permet de rechercher un produit existant dans l'inventaire.
 * Il affiche une liste déroulante de suggestions lorsque l'utilisateur tape
 * au moins 3 caractères.
 * 
 * PROPS :
 * - searchTerm: string - Terme de recherche actuel
 * - onSearchChange: (value: string) => void - Callback lors du changement de recherche
 * - filteredProducts: Product[] - Liste des produits filtrés
 * - selectedProduct: Product | null - Produit sélectionné
 * - onSelectProduct: (product: Product) => void - Callback lors de la sélection d'un produit
 * - showProductList: boolean - Afficher ou non la liste des suggestions
 * - formatEuro: (value: number) => string - Fonction de formatage monétaire
 * 
 * DÉPENDANCES :
 * - @/components/ui/input
 * - @/components/ui/badge
 * - @/types/product
 * - lucide-react (Search, CheckCircle)
 * 
 * UTILISÉ PAR :
 * - AchatFormDialog.tsx
 * - ComptabiliteModule.tsx
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Search, CheckCircle } from 'lucide-react';
import { Product } from '@/types/product';

// ============================================
// INTERFACE DES PROPS
// ============================================
export interface ProductSearchInputProps {
  /** Terme de recherche actuel */
  searchTerm: string;
  /** Callback lors du changement de recherche */
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Liste des produits filtrés selon le terme de recherche */
  filteredProducts: Product[];
  /** Produit actuellement sélectionné (null si aucun) */
  selectedProduct: Product | null;
  /** Callback lors de la sélection d'un produit dans la liste */
  onSelectProduct: (product: Product) => void;
  /** Afficher ou non la liste déroulante des suggestions */
  showProductList: boolean;
  /** Fonction de formatage des montants en euros */
  formatEuro: (value: number) => string;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const ProductSearchInput: React.FC<ProductSearchInputProps> = ({
  searchTerm,
  onSearchChange,
  filteredProducts,
  selectedProduct,
  onSelectProduct,
  showProductList,
  formatEuro
}) => {
  return (
    <div className="space-y-2">
      {/* Label du champ de recherche */}
      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
        <Search className="h-4 w-4 inline mr-2" />
        Rechercher un produit
      </Label>
      
      {/* Champ de recherche avec liste déroulante */}
      <div className="relative">
        <Input
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Tapez au moins 3 caractères..."
          className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-600"
        />
        
        {/* Liste déroulante des produits filtrés */}
        {filteredProducts.length > 0 && showProductList && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-between"
              >
                <span className="font-medium">{product.description}</span>
                <Badge variant="outline">{formatEuro(product.purchasePrice)}</Badge>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Badge de produit sélectionné */}
      {selectedProduct && (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          {selectedProduct.description} sélectionné
        </Badge>
      )}
    </div>
  );
};

export default ProductSearchInput;
