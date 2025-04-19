import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Product } from '@/types';
import { useApp } from '@/contexts/AppContext';

interface ProductSearchInputProps {
  onProductSelect: (product: Product) => void;
  placeholder?: string;
}

const ProductSearchInput: React.FC<ProductSearchInputProps> = ({ 
  onProductSelect,
  placeholder = "Rechercher un produit..."
}) => {
  const { searchProducts } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const handleSearch = async () => {
      if (query.length < 3) {
        setResults([]);
        setIsOpen(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const searchResults = await searchProducts(query);
        setResults(searchResults);
        setIsOpen(searchResults.length > 0);
      } catch (error) {
        console.error("Error searching products:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(handleSearch, 100);
    
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query, searchProducts]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSelect = (product: Product) => {
    if (onProductSelect) {
      onProductSelect(product);
      setQuery(product.description);
      setIsOpen(false);
    } else {
      console.error("onProductSelect function not provided to ProductSearchInput");
    }
  };
  
  return (
    <div className="relative" ref={containerRef}>
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 3 && results.length > 0 && setIsOpen(true)}
        className="w-full"
      />
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-3 text-sm text-gray-500">Chargement...</div>
          ) : results.length > 0 ? (
            <ul className="py-1">
              {results.map((product) => (
                <li
                  key={product.id}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                  onClick={() => handleSelect(product)}
                >
                  <div className="font-medium">{product.description}</div>
                  <div className="text-xs text-gray-500">
                    Prix: {product.purchasePrice} € | Stock: {product.quantity}
                  </div>
                </li>
              ))}
            </ul>
          ) : query.length >= 3 ? (
            <div className="p-3 text-sm text-gray-500">Aucun produit trouvé</div>
          ) : (
            <div className="p-3 text-sm text-gray-500">Saisissez au moins 3 caractères</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearchInput;
