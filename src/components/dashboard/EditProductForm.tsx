
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { productService } from '@/service/api';
import { Product } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import ProductSearchInput from './ProductSearchInput';

interface EditProductFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    id: '',
    description: '',
    purchasePrice: 0,
    quantity: 0,
    additionalQuantity: 0
  });
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        id: selectedProduct.id,
        description: selectedProduct.description,
        purchasePrice: selectedProduct.purchasePrice,
        quantity: selectedProduct.quantity,
        additionalQuantity: 0
      });
    }
  }, [selectedProduct]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'description' ? value : Number(value)
    });
  };
  
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    console.log("Product selected:", product);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.id) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un produit d'abord",
        variant: "destructive",
         className: "notification-erreur",
      });
      return;
    }
    
    // Confirm before updating
    if (!window.confirm("Voulez-vous vraiment modifier ce produit?")) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create updated product with total quantity
      const updatedProduct = {
        id: formData.id,
        description: formData.description,
        purchasePrice: formData.purchasePrice,
        quantity: formData.quantity + formData.additionalQuantity
      };
      
      // Update product
      await productService.updateProduct(updatedProduct);
      
      toast({
        title: "Succès",
        description: "Le produit a été modifié avec succès",
        className: "notification-success"
      });
      
      // Close dialog
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la modification du produit",
        variant: "destructive",
         className: "notification-erreur",
      });
      console.error("Error updating product:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier un produit</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="search">Rechercher un produit</Label>
            <ProductSearchInput
              onProductSelect={handleSelectProduct}
              context="edit"
            />
          </div>
          
          {selectedProduct && (
            <>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Prix d'achat</Label>
                <Input
                  id="purchasePrice"
                  name="purchasePrice"
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantité actuelle</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="additionalQuantity">Ajouter quantité</Label>
                <Input
                  id="additionalQuantity"
                  name="additionalQuantity"
                  type="number"
                  value={formData.additionalQuantity}
                  onChange={handleChange}
                />
                <p className="text-sm text-gray-500">
                  Quantité totale après modification: {formData.quantity + formData.additionalQuantity}
                </p>
              </div>
            </>
          )}
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              className="bg-app-blue hover:bg-opacity-90"
              disabled={!selectedProduct || isLoading}
            >
              {isLoading ? "Modification..." : "Modifier le produit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductForm;
