
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { Product, Sale } from '@/types';
import ProductSearchInput from './ProductSearchInput';

interface AddSaleFormProps {
  isOpen: boolean;
  onClose: () => void;
  editSale?: Sale;
}

const AddSaleForm: React.FC<AddSaleFormProps> = ({ isOpen, onClose, editSale }) => {
  const { addSale, updateSale, products } = useApp();
  const [formData, setFormData] = useState({
    date: '',
    description: '',
    productId: '',
    sellingPrice: '',
    quantitySold: '',
    purchasePrice: '',
    profit: '',
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with today's date
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    setFormData(prevData => ({
      ...prevData,
      date: formattedDate,
    }));
  }, []);
  
  // If editing a sale, populate the form with sale data
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
      }
    }
  }, [editSale, products]);
  
  useEffect(() => {
    // Calculate profit when selling price or quantity changes
    if (formData.sellingPrice && formData.purchasePrice && formData.quantitySold) {
      const sellingPrice = Number(formData.sellingPrice);
      const purchasePrice = Number(formData.purchasePrice);
      const quantitySold = Number(formData.quantitySold);
      
      if (!isNaN(sellingPrice) && !isNaN(purchasePrice) && !isNaN(quantitySold)) {
        const profit = (sellingPrice - purchasePrice) * quantitySold;
        setFormData(prevData => ({
          ...prevData,
          profit: profit.toFixed(2),
        }));
      }
    }
  }, [formData.sellingPrice, formData.purchasePrice, formData.quantitySold]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };
  
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      ...formData,
      description: product.description,
      productId: product.id,
      purchasePrice: product.purchasePrice.toString(),
    });
    
    // Clear errors
    setErrors({
      ...errors,
      description: '',
      productId: '',
      purchasePrice: '',
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.date) {
      newErrors.date = 'La date est requise';
    }
    
    if (!formData.productId) {
      newErrors.description = 'Le produit est requis';
    }
    
    if (!formData.sellingPrice) {
      newErrors.sellingPrice = 'Le prix de vente est requis';
    } else if (isNaN(Number(formData.sellingPrice)) || Number(formData.sellingPrice) <= 0) {
      newErrors.sellingPrice = 'Le prix de vente doit être un nombre positif';
    }
    
    if (!formData.quantitySold) {
      newErrors.quantitySold = 'La quantité vendue est requise';
    } else if (isNaN(Number(formData.quantitySold)) || !Number.isInteger(Number(formData.quantitySold)) || Number(formData.quantitySold) <= 0) {
      newErrors.quantitySold = 'La quantité vendue doit être un nombre entier positif';
    } else if (selectedProduct && Number(formData.quantitySold) > selectedProduct.quantity && !editSale) {
      newErrors.quantitySold = `Quantité disponible insuffisante (${selectedProduct.quantity})`;
    } else if (editSale && selectedProduct) {
      const additionalQuantity = Number(formData.quantitySold) - editSale.quantitySold;
      if (additionalQuantity > selectedProduct.quantity) {
        newErrors.quantitySold = `Quantité disponible insuffisante (${selectedProduct.quantity + editSale.quantitySold})`;
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
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
        await updateSale({
          ...saleData,
          id: editSale.id,
        });
      } else {
        await addSale(saleData);
      }
      
      // Reset form and close dialog
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        productId: '',
        sellingPrice: '',
        quantitySold: '',
        purchasePrice: '',
        profit: '',
      });
      setSelectedProduct(null);
      
      onClose();
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
                onChange={handleChange}
                className={errors.date ? "border-red-500" : ""}
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date}</p>
              )}
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
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
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
                  min="0"
                  placeholder="0.00"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  readOnly
                  disabled
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Prix de vente (€)</Label>
                <Input
                  id="sellingPrice"
                  name="sellingPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  className={errors.sellingPrice ? "border-red-500" : ""}
                />
                {errors.sellingPrice && (
                  <p className="text-sm text-red-500">{errors.sellingPrice}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantitySold">Quantité vendue</Label>
                <Input
                  id="quantitySold"
                  name="quantitySold"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="1"
                  value={formData.quantitySold}
                  onChange={handleChange}
                  className={errors.quantitySold ? "border-red-500" : ""}
                />
                {errors.quantitySold && (
                  <p className="text-sm text-red-500">{errors.quantitySold}</p>
                )}
                {selectedProduct && !errors.quantitySold && (
                  <p className="text-xs text-gray-500">
                    {editSale 
                      ? `Stock disponible: ${selectedProduct.quantity + editSale.quantitySold}`
                      : `Stock disponible: ${selectedProduct.quantity}`}
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
                  placeholder="0.00"
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
