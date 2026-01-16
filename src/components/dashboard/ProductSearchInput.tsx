
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Product } from '@/types';
import { beneficeService } from '@/service/beneficeService';

interface ProductSearchInputProps {
  onProductSelect: (product: Product) => void;
  selectedProduct?: Product | null;
  context?: 'sale' | 'edit'; // 'sale' pour ajouter une vente, 'edit' pour modifier un produit
}

const ProductSearchInput: React.FC<ProductSearchInputProps> = ({ 
  onProductSelect,
  selectedProduct,
  context = 'sale' // Par défaut pour ajouter une vente
}) => {
  const { products } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [benefices, setBenefices] = useState<any[]>([]);

  // Charger les bénéfices au montage du composant
  useEffect(() => {
    const loadBenefices = async () => {
      try {
        const beneficesData = await beneficeService.getBenefices();
        setBenefices(beneficesData);
        console.log('📊 Bénéfices chargés dans ProductSearchInput:', beneficesData);
      } catch (error) {
        console.error('Erreur lors du chargement des bénéfices:', error);
      }
    };
    loadBenefices();

    // Écouter les suppressions de bénéfices
    const handleBeneficeDeleted = () => {
      loadBenefices();
    };

    window.addEventListener('benefice-deleted', handleBeneficeDeleted);
    
    // Recharger périodiquement pour s'assurer de la synchronisation
    const interval = setInterval(loadBenefices, 3000);

    return () => {
      window.removeEventListener('benefice-deleted', handleBeneficeDeleted);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 3) {
      // Filtrer les produits par terme de recherche
      let filtered = products.filter(product =>
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Exclure les produits qui ont déjà des calculs de bénéfice
      filtered = filtered.filter(product => 
        !benefices.some(benefice => benefice.productId === product.id)
      );
      
      if (context === 'sale') {
        // Pour ajouter une vente : exclure les produits avec stock = 0
        filtered = filtered
          .filter(product => product.quantity > 0)
          .sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
      } else {
        // Pour modifier un produit : montrer tous les produits mais stock > 0 en premier
        filtered = filtered.sort((a, b) => {
          if (a.quantity > 0 && b.quantity === 0) return -1;
          if (a.quantity === 0 && b.quantity > 0) return 1;
          return (b.quantity || 0) - (a.quantity || 0);
        });
      }
      
      setFilteredProducts(filtered);
      setShowDropdown(true);
    } else {
      setFilteredProducts([]);
      setShowDropdown(false);
    }
  }, [searchTerm, products, benefices]);

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
        <div className=" z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
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
      {showDropdown && searchTerm.length >= 3 && filteredProducts.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
          <div className="px-4 py-3 text-sm text-red-600 font-bold">
            Aucun produit trouvé
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSearchInput;
