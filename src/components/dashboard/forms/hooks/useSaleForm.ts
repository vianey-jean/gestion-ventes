
import { useState, useEffect } from 'react';
import { Product, Sale } from '@/types';

interface FormData {
  date: string;
  description: string;
  productId: string;
  sellingPriceUnit: string;
  quantitySold: string;
  purchasePriceUnit: string;
  profit: string;
}

export const useSaleForm = (editSale: Sale | undefined, products: Product[], isOpen: boolean) => {
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    productId: '',
    sellingPriceUnit: '',
    quantitySold: '1',
    purchasePriceUnit: '',
    profit: '',
  });
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [maxQuantity, setMaxQuantity] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAdvanceProduct, setIsAdvanceProduct] = useState(false);

  const isOutOfStock = selectedProduct && !isAdvanceProduct && (selectedProduct.quantity === 0 || selectedProduct.quantity === undefined);

  const initializeForm = () => {
    if (editSale) {
      const product = products.find(p => p.id === editSale.productId);
      const isAdvance = editSale.description.toLowerCase().includes('avance');
      setIsAdvanceProduct(isAdvance);
      
      const purchasePriceUnit = isAdvance ? editSale.purchasePrice : (editSale.purchasePrice / editSale.quantitySold);
      const sellingPriceUnit = isAdvance ? editSale.sellingPrice : (editSale.sellingPrice / editSale.quantitySold);
      
      setFormData({
        date: new Date(editSale.date).toISOString().split('T')[0],
        description: editSale.description,
        productId: String(editSale.productId),
        sellingPriceUnit: sellingPriceUnit.toString(),
        quantitySold: editSale.quantitySold.toString(),
        purchasePriceUnit: purchasePriceUnit.toString(),
        profit: editSale.profit.toString(),
      });
      
      if (product) {
        setSelectedProduct(product);
        const editQuantity = editSale ? Number(editSale.quantitySold) : 0;
        const productQuantity = product.quantity !== undefined ? product.quantity : 0;
        setMaxQuantity(productQuantity + editQuantity);
      }
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        productId: '',
        sellingPriceUnit: '',
        quantitySold: '1',
        purchasePriceUnit: '',
        profit: '',
      });
      setSelectedProduct(null);
      setMaxQuantity(0);
      setIsAdvanceProduct(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    console.log('🎯 Produit sélectionné dans useSaleForm:', product);
    console.log('🎯 Données complètes du produit:', {
      id: product.id,
      description: product.description,
      purchasePrice: product.purchasePrice,
      quantity: product.quantity
    });
    
    setSelectedProduct(product);
    
    const isAdvance = product.description.toLowerCase().includes('avance');
    setIsAdvanceProduct(isAdvance);
    
    const productQuantity = product.quantity !== undefined ? product.quantity : 0;
    setMaxQuantity(productQuantity);
    
    // Calculer un prix de vente suggéré (prix d'achat + 20% de marge)
    const suggestedSellingPrice = (product.purchasePrice * 1.2).toFixed(2);
    
    console.log('💰 Calculs initiaux:', {
      purchasePrice: product.purchasePrice,
      suggestedSellingPrice: suggestedSellingPrice,
      isAdvance: isAdvance,
      quantity: isAdvance ? '0' : '1'
    });
    
    setFormData(prev => {
      const purchasePriceUnit = product.purchasePrice.toString();
      const sellingPriceUnit = suggestedSellingPrice;
      const quantity = isAdvance ? '0' : '1';
      
      // Calculer le profit selon le type de produit
      let profit;
      if (isAdvance) {
        // Pour les produits "avance", profit = prix de vente - prix d'achat (sans quantité)
        profit = Number(sellingPriceUnit) - Number(purchasePriceUnit);
      } else {
        // Pour les autres produits, profit normal
        const A = Number(purchasePriceUnit) * Number(quantity);
        const V = Number(sellingPriceUnit) * Number(quantity);
        profit = V - A;
      }
      
      console.log('💰 Calcul final du profit:', { 
        isAdvance, 
        purchasePriceUnit, 
        sellingPriceUnit, 
        quantity, 
        profit: profit.toFixed(2),
        productPurchasePrice: product.purchasePrice
      });
      
      const newFormData = {
        ...prev,
        description: product.description,
        productId: String(product.id),
        purchasePriceUnit: purchasePriceUnit,
        sellingPriceUnit: sellingPriceUnit,
        quantitySold: quantity,
        profit: profit.toFixed(2),
      };
      
      console.log('📝 FormData mis à jour:', newFormData);
      return newFormData;
    });
  };

  useEffect(() => {
    initializeForm();
  }, [editSale, products, isOpen]);

  return {
    formData,
    setFormData,
    selectedProduct,
    setSelectedProduct,
    isSubmitting,
    setIsSubmitting,
    maxQuantity,
    setMaxQuantity,
    showDeleteConfirm,
    setShowDeleteConfirm,
    isAdvanceProduct,
    setIsAdvanceProduct,
    isOutOfStock,
    handleProductSelect,
    initializeForm
  };
};
