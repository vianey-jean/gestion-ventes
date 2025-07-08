
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Product } from '@/types';

interface ProductSearchInputProps {
  onProductSelect: (product: Product) => void;
  selectedProduct?: Product | null;
}

const ProductSearchInput: React.FC<ProductSearchInputProps> = ({ 
  onProductSelect,
  selectedProduct 
}) => {
  const { products } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filtered = products.filter(product =>
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
      setShowDropdown(true);
    } else {
      setFilteredProducts([]);
      setShowDropdown(false);
    }
  }, [searchTerm, products]);

  const handleProductSelect = (product: Product) => {
    console.log('🚀 DEBUT - ProductSearchInput handleProductSelect');
    console.log('🎯 Produit sélectionné dans ProductSearchInput:', {
      id: product.id,
      description: product.description,
      purchasePrice: product.purchasePrice,
      quantity: product.quantity
    });
    
    setSearchTerm(product.description);
    setShowDropdown(false);
    
    console.log('📡 Calling onProductSelect callback');
    onProductSelect(product);
    console.log('✅ FIN - ProductSearchInput handleProductSelect');
  };

  const handleClear = () => {
    setSearchTerm('');
    setShowDropdown(false);
    setFilteredProducts([]);
  };

  // Si un produit est déjà sélectionné, afficher son nom
  useEffect(() => {
    if (selectedProduct) {
      setSearchTerm(selectedProduct.description);
    }
  }, [selectedProduct]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {/* Dropdown des résultats */}
      {showDropdown && filteredProducts.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
              onClick={() => handleProductSelect(product)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{product.description}</p>
                  <p className="text-xs text-gray-500">
                    Prix d'achat: {product.purchasePrice}€ | Stock: {product.quantity}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {/* Message si aucun résultat */}
      {showDropdown && searchTerm.length >= 2 && filteredProducts.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
          <div className="px-4 py-3 text-sm text-gray-500">
            Aucun produit trouvé
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSearchInput;
