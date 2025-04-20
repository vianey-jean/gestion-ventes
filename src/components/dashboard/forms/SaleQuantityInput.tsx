
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SaleQuantityInputProps {
  quantity: string;
  maxQuantity: number;
  onChange: (quantity: string) => void;
  disabled?: boolean;
  showAvailableStock?: boolean;
}

/**
 * Composant pour gérer la saisie de la quantité vendue avec des boutons + et -
 */
const SaleQuantityInput: React.FC<SaleQuantityInputProps> = ({ 
  quantity, 
  maxQuantity, 
  onChange, 
  disabled = false,
  showAvailableStock = true
}) => {
  const { toast } = useToast();

  // Fonction pour changer la quantité
  const handleQuantityChange = (increment: boolean) => {
    // Convertir la quantité en nombre
    const currentQty = Number(quantity);
    // Calculer la nouvelle quantité
    let newQty = increment ? currentQty + 1 : currentQty - 1;

    // Ne pas permettre de quantité inférieure à 1
    if (newQty < 1) newQty = 1;
    
    // Vérifier si la quantité demandée ne dépasse pas le stock disponible
    if (increment && newQty > maxQuantity) {
      toast({
        title: "Quantité insuffisante",
        description: `Stock disponible: ${maxQuantity} unités`,
        variant: "destructive",
      });
      return;
    }

    // Mettre à jour la quantité
    onChange(newQty.toString());
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="quantitySold">Quantité vendue</Label>
      <div className="flex items-center space-x-2">
        {/* Bouton pour diminuer la quantité */}
        <Button 
          type="button"
          variant="outline"
          size="icon"
          onClick={() => handleQuantityChange(false)}
          disabled={disabled}
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        {/* Champ de saisie de la quantité */}
        <Input
          id="quantitySold"
          name="quantitySold"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => {
            const numValue = Number(e.target.value);
            
            // Vérifier si la quantité ne dépasse pas le stock disponible
            if (numValue > maxQuantity) {
              toast({
                title: "Quantité insuffisante",
                description: `Stock disponible: ${maxQuantity} unités`,
                variant: "destructive",
              });
              return;
            }
            
            onChange(e.target.value);
          }}
          disabled={disabled}
        />
        
        {/* Bouton pour augmenter la quantité */}
        <Button 
          type="button"
          variant="outline"
          size="icon"
          onClick={() => handleQuantityChange(true)}
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Afficher le stock disponible */}
      {showAvailableStock && (
        <p className="text-xs text-gray-500">
          Stock disponible: {maxQuantity} unités
        </p>
      )}
    </div>
  );
};

export default SaleQuantityInput;
