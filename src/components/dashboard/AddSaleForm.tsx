
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { Product, Sale } from '@/types';
import ProductSearchInput from './ProductSearchInput';
import { Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddSaleFormProps {
  isOpen: boolean;
  onClose: () => void;
  editSale?: Sale;
}

const AddSaleForm: React.FC<AddSaleFormProps> = ({ isOpen, onClose, editSale }) => {
  const { addSale, updateSale, products } = useApp();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    productId: '',
    sellingPrice: '',
    quantitySold: '1',
    purchasePrice: '',
    profit: '',
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [maxQuantity, setMaxQuantity] = useState(0);

  useEffect(() => {
    if (editSale) {
      const product = products.find(p => p.id === editSale.productId);
      setFormData({
        date: new Date(editSale.date).toISOString().split('T')[0],
        description: editSale.description,
        productId: editSale.productId,
        sellingPrice: editSale.sellingPrice.toString(),
        quantitySold: editSale.quantitySold.toString(),
        purchasePrice: editSale.purchasePrice.toString(),
        profit: editSale.profit.toString(),
      });
      if (product) {
        setSelectedProduct(product);
        setMaxQuantity(product.quantity + (editSale ? editSale.quantitySold : 0));
      }
    }
  }, [editSale, products]);

  const updateProfit = (price: string, quantity: string) => {
    if (formData.purchasePrice && price && quantity) {
      const profit = (Number(price) - Number(formData.purchasePrice)) * Number(quantity);
      setFormData(prev => ({
        ...prev,
        profit: profit.toFixed(2),
      }));
    }
  };

  const handleQuantityChange = (increment: boolean) => {
    const currentQty = Number(formData.quantitySold);
    let newQty = increment ? currentQty + 1 : currentQty - 1;

    if (newQty < 1) newQty = 1;
    
    if (increment && newQty > maxQuantity) {
      toast({
        title: "Quantité insuffisante",
        description: `Stock disponible: ${maxQuantity} unités`,
        variant: "destructive",
      });
      return;
    }

    setFormData(prev => {
      const newQuantity = newQty.toString();
      updateProfit(prev.sellingPrice, newQuantity);
      return {
        ...prev,
        quantitySold: newQuantity,
      };
    });
  };

  const handlePriceChange = (increment: boolean) => {
    const currentPrice = Number(formData.sellingPrice);
    const step = 0.5; // Incrément de 0.50€
    const newPrice = increment ? currentPrice + step : currentPrice - step;
    
    if (newPrice < 0) return;

    setFormData(prev => {
      const priceString = newPrice.toFixed(2);
      updateProfit(priceString, prev.quantitySold);
      return {
        ...prev,
        sellingPrice: priceString,
      };
    });
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setMaxQuantity(product.quantity + (editSale ? editSale.quantitySold : 0));
    setFormData(prev => {
      const newData = {
        ...prev,
        description: product.description,
        productId: product.id,
        purchasePrice: product.purchasePrice.toString(),
        sellingPrice: (product.purchasePrice * 1.2).toFixed(2), // Prix de vente suggéré: +20%
        quantitySold: '1',
      };
      updateProfit(newData.sellingPrice, newData.quantitySold);
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const saleData = {
        date: formData.date,
        productId: formData.productId,
        description: formData.description,
        sellingPrice: Number(formData.sellingPrice),
        quantitySold: Number(formData.quantitySold),
        purchasePrice: Number(formData.purchasePrice),
        profit: Number(formData.profit),
      };

      if (editSale) {
        await updateSale({ ...saleData, id: editSale.id });
      } else {
        await addSale(saleData);
      }

      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editSale ? 'Modifier la vente' : 'Ajouter une vente'}</DialogTitle>
          <DialogDescription>
            {editSale ? 'Modifiez les détails de la vente.' : 'Enregistrez une nouvelle vente.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date de vente</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Produit</Label>
              {editSale ? (
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  readOnly
                  disabled
                />
              ) : (
                <ProductSearchInput onProductSelect={handleProductSelect} />
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Prix d'achat (€)</Label>
                <Input
                  id="purchasePrice"
                  name="purchasePrice"
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  readOnly
                  disabled
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Prix de vente (€)</Label>
                <div className="flex items-center space-x-2">
                  <Button 
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handlePriceChange(false)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="sellingPrice"
                    name="sellingPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.sellingPrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => {
                        updateProfit(value, prev.quantitySold);
                        return {
                          ...prev,
                          sellingPrice: value,
                        };
                      });
                    }}
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handlePriceChange(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantitySold">Quantité vendue</Label>
                <div className="flex items-center space-x-2">
                  <Button 
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(false)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="quantitySold"
                    name="quantitySold"
                    type="number"
                    min="1"
                    value={formData.quantitySold}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = Number(value);
                      
                      if (numValue > maxQuantity) {
                        toast({
                          title: "Quantité insuffisante",
                          description: `Stock disponible: ${maxQuantity} unités`,
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      setFormData(prev => {
                        updateProfit(prev.sellingPrice, value);
                        return {
                          ...prev,
                          quantitySold: value,
                        };
                      });
                    }}
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {selectedProduct && (
                  <p className="text-xs text-gray-500">
                    Stock disponible: {maxQuantity} unités
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="profit">Bénéfice (€)</Label>
                <Input
                  id="profit"
                  name="profit"
                  type="number"
                  step="0.01"
                  value={formData.profit}
                  readOnly
                  disabled
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-app-green hover:bg-opacity-90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enregistrement..." : editSale ? "Mettre à jour" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSaleForm;
