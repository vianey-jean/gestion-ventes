
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus } from 'lucide-react';

interface SalePriceInputProps {
  price: string;
  onChange: (price: string) => void;
  disabled?: boolean;
}

/**
 * Composant pour gérer la saisie du prix de vente avec des boutons + et -
 */
const SalePriceInput: React.FC<SalePriceInputProps> = ({ 
  price, 
  onChange, 
  disabled = false 
}) => {
  // Fonction pour changer le prix
  const handlePriceChange = (increment: boolean) => {
    // Convertir le prix en nombre
    const currentPrice = Number(price);
    const step = 0.5; // Incrément de 0.50€
    // Calculer le nouveau prix
    const newPrice = increment ? currentPrice + step : currentPrice - step;
    
    // Ne pas permettre de prix négatif
    if (newPrice < 0) return;

    // Mettre à jour le prix avec 2 décimales
    onChange(newPrice.toFixed(2));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="sellingPrice">Prix de vente (€)</Label>
      <div className="flex items-center space-x-2">
        {/* Bouton pour diminuer le prix */}
        <Button 
          type="button"
          variant="outline"
          size="icon"
          onClick={() => handlePriceChange(false)}
          disabled={disabled}
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        {/* Champ de saisie du prix */}
        <Input
          id="sellingPrice"
          name="sellingPrice"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        
        {/* Bouton pour augmenter le prix */}
        <Button 
          type="button"
          variant="outline"
          size="icon"
          onClick={() => handlePriceChange(true)}
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SalePriceInput;
