import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Edit3, Camera } from 'lucide-react';
import { Product } from '@/types';
import ProductSearchInput from '../../ProductSearchInput';
import SaleQuantityInput from '../SaleQuantityInput';
import { FormProduct, ReductionType, computeReductionAmount } from '../types/saleFormTypes';
import { livraisonVilleApi, LivraisonVille } from '@/services/api/villesApi';

interface SaleProductCardProps {
  product: FormProduct;
  index: number;
  canDelete: boolean;
  isSubmitting: boolean;
  onProductSelect: (product: Product, index: number) => void;
  onSellingPriceChange: (value: string, index: number) => void;
  onQuantityChange: (value: string, index: number) => void;
  onDeleteProduct: (index: number) => void;
  onAvanceChange: (value: string, index: number) => void;
  onDeliveryChange: (location: string, fee: string, index: number) => void;
  onShowSlideshow: (product: FormProduct) => void;
  onReductionChange: (value: string, type: ReductionType, index: number) => void;
  clientVille?: string;
}

const SaleProductCard: React.FC<SaleProductCardProps> = ({
  product,
  index,
  canDelete,
  isSubmitting,
  onProductSelect,
  onSellingPriceChange,
  onQuantityChange,
  onDeleteProduct,
  onAvanceChange,
  onDeliveryChange,
  onShowSlideshow,
  onReductionChange,
  clientVille,
}) => {
  const [villes, setVilles] = useState<LivraisonVille[]>([]);
  useEffect(() => {
    livraisonVilleApi.getAll().then(setVilles).catch(() => setVilles([]));
  }, []);
  const knownVilleNames = villes.map(v => v.ville);
  const isCustomLoc = !!product.deliveryLocation && !knownVilleNames.some(v => v.toLowerCase() === product.deliveryLocation.toLowerCase());

  // Auto-préremplissage: dès qu'un produit est sélectionné, comparer la ville du client
  // avec la base livraison-ville et appliquer le frais correspondant (ou ajouter la nouvelle ville).
  const lastAutoFillRef = useRef<string | null>(null);
  useEffect(() => {
    if (!product.selectedProduct) return;
    if (!villes.length) return;
    const key = `${product.selectedProduct.id}__${(clientVille || '').toLowerCase()}`;
    if (lastAutoFillRef.current === key) return;
    const cv = (clientVille || '').trim();
    if (!cv) return;
    lastAutoFillRef.current = key;
    const found = villes.find(v => v.ville.toLowerCase() === cv.toLowerCase());
    if (found) {
      onDeliveryChange(found.ville, String(found.fee), index);
    } else {
      // Ville inconnue: on l'enregistre avec frais 0 par défaut (l'utilisateur peut ajuster)
      onDeliveryChange(cv, '0', index);
      livraisonVilleApi.add(cv, 0).then(list => Array.isArray(list) && setVilles(list)).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.selectedProduct?.id, villes.length, clientVille]);

  const handleVilleSelect = (val: string) => {
    if (val === '__custom__') {
      onDeliveryChange('', '0', index);
      return;
    }
    if (val === 'Exonération') {
      onDeliveryChange('Exonération', '0', index);
      return;
    }
    const found = villes.find(v => v.ville === val);
    const fee = found ? String(found.fee) : '0';
    onDeliveryChange(val, fee, index);
  };

  const handleCustomVilleBlur = async () => {
    const v = (product.deliveryLocation || '').trim();
    const f = Number(product.deliveryFee || 0);
    if (!v) return;
    if (!knownVilleNames.some(x => x.toLowerCase() === v.toLowerCase())) {
      try {
        const list = await livraisonVilleApi.add(v, f);
        if (Array.isArray(list)) setVilles(list);
      } catch {}
    }
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-fuchsia-50/50 to-pink-50/30 dark:from-purple-900/30 dark:via-fuchsia-900/20 dark:to-pink-900/10 border-0 shadow-xl shadow-purple-500/10 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/15">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-fuchsia-300/20 rounded-full blur-2xl" />
      </div>
      <CardHeader className="relative flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-bold bg-gradient-to-r from-purple-600 to-fuchsia-700 bg-clip-text text-transparent flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-lg flex items-center justify-center shadow-lg text-white text-xs font-bold">
            {index + 1}
          </div>
          Produit #{index + 1}
        </CardTitle>
        <div className="flex items-center gap-2">
          {product.selectedProduct && (
            <span className="text-xs bg-gradient-to-r from-purple-100 to-fuchsia-100 text-purple-700 px-3 py-1 rounded-full font-semibold shadow-sm">
              {product.selectedProduct.description}
            </span>
          )}
          {canDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDeleteProduct(index)}
              className="rounded-full w-8 h-8 p-0 hover:bg-red-100 hover:text-red-600 transition-all duration-200"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Photo principale du produit */}
      {product.selectedProduct?.mainPhoto && (
        <div className="flex justify-center mb-3 px-4">
          <button
            type="button"
            onClick={() => onShowSlideshow(product)}
            className="relative group cursor-pointer"
          >
            <img
              src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000'}${product.selectedProduct.mainPhoto}`}
              alt={product.selectedProduct.description}
              className="w-20 h-20 object-cover rounded-xl border-2 border-purple-200 shadow-lg group-hover:border-purple-500 group-hover:scale-110 transition-all duration-200"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-all duration-200 flex items-center justify-center">
              <Edit3 className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        </div>
      )}
      {product.selectedProduct && !product.selectedProduct.mainPhoto && product.selectedProduct.photos && product.selectedProduct.photos.length > 0 && (
        <div className="flex justify-center mt-3">
          <button
            type="button"
            onClick={() => onShowSlideshow(product)}
            className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-300 hover:border-purple-500 hover:scale-110 transition-all duration-200 shadow-lg cursor-pointer"
          >
            <Camera className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      )}
      {product.isAdvanceProduct && (
        <span className="text-xs bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-3 py-1 rounded-full font-semibold shadow-sm flex justify-center">
          ⭐ Avance
        </span>
      )}

      <CardContent className="space-y-4">
        {/* Sélection produit */}
        <div className="space-y-2">
          <Label>Produit</Label>
          <ProductSearchInput
            onProductSelect={(prod) => onProductSelect(prod, index)}
            selectedProduct={product.selectedProduct}
          />
        </div>

        {product.selectedProduct && (
          <div className="grid grid-cols-2 gap-4">
            {/* Prix d'achat unitaire */}
            <div className="space-y-2">
              <Label>Prix d'achat unitaire (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={product.purchasePriceUnit}
                readOnly
                disabled
              />
            </div>

            {/* Prix de vente unitaire */}
            <div className="space-y-2">
              <Label>Prix de vente unitaire (€)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={product.sellingPriceUnit}
                onChange={(e) => onSellingPriceChange(e.target.value, index)}
                disabled={isSubmitting}
                className={Number(product.profit) < 0 ? 'border-red-500' : ''}
              />
            </div>

            {/* Quantité */}
            <SaleQuantityInput
              quantity={product.quantitySold}
              maxQuantity={product.maxQuantity}
              onChange={(value) => onQuantityChange(value, index)}
              disabled={isSubmitting || product.isAdvanceProduct}
              showAvailableStock={!product.isAdvanceProduct}
            />

            {/* Réduction (par unité ou %) */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Réduction
                <span className="text-[10px] text-muted-foreground font-normal">
                  (facultatif)
                </span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={product.reduction}
                  onChange={(e) => onReductionChange(
                    e.target.value,
                    (e.target.value && !product.reductionType ? 'amount' : product.reductionType) as ReductionType,
                    index
                  )}
                  placeholder="0"
                  disabled={isSubmitting || product.isAdvanceProduct}
                  className="flex-1"
                />
                <select
                  value={product.reductionType || ''}
                  onChange={(e) => onReductionChange(product.reduction, e.target.value as ReductionType, index)}
                  className="px-2 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-sm"
                  disabled={isSubmitting || product.isAdvanceProduct}
                >
                  <option value="">—</option>
                  <option value="amount">€ / unité</option>
                  <option value="percent">% du PU</option>
                </select>
              </div>
              {product.reduction && product.reductionType && (
                <p className="text-xs text-emerald-600">
                  -{computeReductionAmount(
                    Number(product.sellingPriceUnit || 0),
                    Number(product.quantitySold || 0),
                    Number(product.reduction || 0),
                    product.reductionType
                  ).toFixed(2)} € appliqués
                </p>
              )}
            </div>


            {/* Avance (visible uniquement pour les prêts produits) */}
            {product.isPretProduit && (
              <div className="space-y-2">
                <Label>Avance (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={product.avancePretProduit}
                  onChange={(e) => onAvanceChange(e.target.value, index)}
                  placeholder="Montant de l'avance"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500">
                  Facultatif - Si vide, le prix de vente sera 0
                </p>
              </div>
            )}

            {/* Frais de livraison */}
            <div className="space-y-2 col-span-2">
              <Label>Ville de livraison & Frais</Label>
              <select
                value={isCustomLoc ? '__custom__' : (product.deliveryLocation || '')}
                onChange={(e) => handleVilleSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
                disabled={isSubmitting}
              >
                <option value="">— Choisir une ville —</option>
                {villes.map(v => (
                  <option key={v.ville} value={v.ville}>
                    {v.ville}{v.ville === 'Exonération' ? ' (0 €)' : `: ${v.fee === 0 ? 'gratuit' : `${v.fee} €`}`}
                  </option>
                ))}
                <option value="__custom__">+ Nouvelle ville…</option>
              </select>

              {isCustomLoc && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input
                    type="text"
                    value={product.deliveryLocation}
                    onChange={(e) => onDeliveryChange(e.target.value, product.deliveryFee, index)}
                    onBlur={handleCustomVilleBlur}
                    placeholder="Nom de la ville"
                    disabled={isSubmitting}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={product.deliveryFee}
                    onChange={(e) => onDeliveryChange(product.deliveryLocation, e.target.value, index)}
                    onBlur={handleCustomVilleBlur}
                    placeholder="Frais (€)"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              <p className="text-sm text-gray-500">
                Frais: {Number(product.deliveryFee || 0).toFixed(2)} €
              </p>
            </div>


            {/* Bénéfice */}
            <div className="space-y-2 col-span-2">
              <Label>Bénéfice (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={product.profit}
                readOnly
                disabled
                className={Number(product.profit) < 0 ? 'border-red-500 bg-red-50' : ''}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SaleProductCard;
