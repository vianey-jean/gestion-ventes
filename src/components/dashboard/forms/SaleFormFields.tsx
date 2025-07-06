
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Product, Sale } from '@/types';
import ProductSearchInput from '../ProductSearchInput';
import SaleQuantityInput from './SaleQuantityInput';

interface FormData {
  date: string;
  description: string;
  productId: string;
  sellingPriceUnit: string;
  quantitySold: string;
  purchasePriceUnit: string;
  profit: string;
}

interface SaleFormFieldsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  selectedProduct: Product | null;
  editSale?: Sale;
  onProductSelect: (product: Product) => void;
  onSellingPriceChange: (price: string) => void;
  onQuantityChange: (quantity: string) => void;
  maxQuantity: number;
  isSubmitting: boolean;
  isOutOfStock: boolean;
  isAdvanceProduct: boolean;
  isProfitNegative: boolean;
}

const SaleFormFields: React.FC<SaleFormFieldsProps> = ({
  formData,
  setFormData,
  selectedProduct,
  editSale,
  onProductSelect,
  onSellingPriceChange,
  onQuantityChange,
  maxQuantity,
  isSubmitting,
  isOutOfStock,
  isAdvanceProduct,
  isProfitNegative
}) => {
  return (
    <div className="grid gap-4 py-4">
      {/* Date de vente */}
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
      
      {/* Sélection du produit */}
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
          <ProductSearchInput onProductSelect={onProductSelect} />
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Prix d'achat unitaire */}
        <div className="space-y-2">
          <Label htmlFor="purchasePriceUnit">Prix d'achat unitaire (€)</Label>
          <Input
            id="purchasePriceUnit"
            name="purchasePriceUnit"
            type="number"
            step="0.01"
            value={formData.purchasePriceUnit}
            readOnly
            disabled
          />
        </div>
        
        {/* Prix de vente unitaire */}
        <div className="space-y-2">
          <Label htmlFor="sellingPriceUnit">Prix de vente unitaire (€)</Label>
          <Input
            id="sellingPriceUnit"
            name="sellingPriceUnit"
            type="number"
            step="0.01"
            min="0"
            value={formData.sellingPriceUnit}
            onChange={(e) => onSellingPriceChange(e.target.value)}
            disabled={isSubmitting}
            className={isProfitNegative ? "border-red-500" : ""}
          />
          {isProfitNegative && (
            <p className="text-xs text-red-500">
              Le prix de vente est trop bas, vous allez faire une perte !
            </p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Quantité vendue */}
        <SaleQuantityInput
          quantity={formData.quantitySold}
          maxQuantity={maxQuantity}
          onChange={onQuantityChange}
          disabled={isSubmitting || isOutOfStock || isAdvanceProduct}
          showAvailableStock={!!selectedProduct && !isAdvanceProduct}
        />
        
        {/* Bénéfice calculé */}
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
            className={isProfitNegative ? "border-red-500 bg-red-50" : ""}
          />
          {isAdvanceProduct && (
            <p className="text-xs text-amber-600">
              Pour les produits d'avance, le bénéfice est calculé sans tenir compte de la quantité.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaleFormFields;
