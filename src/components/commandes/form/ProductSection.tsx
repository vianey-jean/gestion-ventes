/**
 * Section Produit Premium — extraite de CommandeFormDialog
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit, ShoppingCart, Sparkles, X } from 'lucide-react';
import ClassificationSearchPopover from '@/components/products/attributes/ClassificationSearchPopover';
import SaleQuantityInput from '@/components/dashboard/forms/SaleQuantityInput';
import type { CommandeProduit } from '@/types/commande';

export type ProductCategory = 'all' | 'perruque' | 'tissage' | 'extension' | 'autres';

export interface ProductLite {
  id: string;
  description: string;
  purchasePrice: number;
  quantity: number;
  mainPhoto?: string;
  photos?: string[];
}

export interface ProductSectionProps {
  productPhotoUrl: string | null;
  selectedProduct: ProductLite | null;

  productCategoryFilter: ProductCategory;
  setProductCategoryFilter: (v: ProductCategory) => void;

  productSearch: string;
  setProductSearch: (v: string) => void;
  produitNom: string;
  setProduitNom: (v: string) => void;
  showProductSuggestions: boolean;
  setShowProductSuggestions: (v: boolean) => void;
  categoryFilteredProducts: ProductLite[];
  handleProductSelect: (p: ProductLite) => void;

  prixUnitaire: string;
  setPrixUnitaire: (v: string) => void;
  quantite: string;
  setQuantite: (v: string) => void;
  prixVente: string;
  setPrixVente: (v: string) => void;
  availableQuantityForSelected?: number | null;

  productReduction: string;
  setProductReduction?: (v: string) => void;
  productReductionType: '' | 'amount' | 'percent';
  setProductReductionType?: (v: '' | 'amount' | 'percent') => void;

  productDeliveryLocation: string;
  setProductDeliveryLocation?: (v: string) => void;
  productDeliveryFee: string;
  setProductDeliveryFee?: (v: string) => void;
  productBaseDeliveryFee: number | null;
  setProductBaseDeliveryFee?: (v: number | null) => void;

  livraisonVilles: Array<{ ville: string; fee: number }>;
  showFeeOverride: boolean;
  setShowFeeOverride: React.Dispatch<React.SetStateAction<boolean>>;
  showFeeIncrease: boolean;
  setShowFeeIncrease: React.Dispatch<React.SetStateAction<boolean>>;
  feeIncreaseAmount: string;
  setFeeIncreaseAmount: (v: string) => void;

  produitsListe: CommandeProduit[];
  editingProductIndex: number | null;
  handleAddProduit: () => void;
  handleEditProduit: (i: number) => void;
  handleRemoveProduit: (i: number) => void;
}

const ProductSection: React.FC<ProductSectionProps> = (props) => {
  const {
    productPhotoUrl, selectedProduct, productCategoryFilter, setProductCategoryFilter,
    productSearch, setProductSearch, setProduitNom, showProductSuggestions, setShowProductSuggestions,
    categoryFilteredProducts, handleProductSelect,
    prixUnitaire, setPrixUnitaire, quantite, setQuantite, prixVente, setPrixVente,
    availableQuantityForSelected,
    productReduction, setProductReduction, productReductionType, setProductReductionType,
    productDeliveryLocation, setProductDeliveryLocation, productDeliveryFee, setProductDeliveryFee,
    productBaseDeliveryFee, setProductBaseDeliveryFee,
    livraisonVilles, showFeeOverride, setShowFeeOverride, showFeeIncrease, setShowFeeIncrease,
    feeIncreaseAmount, setFeeIncreaseAmount,
    produitsListe, editingProductIndex, handleAddProduit, handleEditProduit, handleRemoveProduit,
  } = props;

  return (
    <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-rose-900/30 border-2 border-purple-300 dark:border-purple-700 shadow-[0_8px_30px_rgba(168,85,247,0.3)]">
      <h3 className="font-black text-xl flex items-center gap-3 text-purple-700 dark:text-purple-300">
        <span className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm shadow-lg">
          <ShoppingCart className="h-5 w-5" />
        </span>
        <span className="flex items-center gap-2">
          Produits Elite
          <Sparkles className="h-5 w-5 text-pink-500" />
        </span>
      </h3>

      <div className="mb-3">
        <ClassificationSearchPopover
          currentCategory={productCategoryFilter}
          onApply={({ name, category }) => {
            setProductCategoryFilter(category);
            if (name) {
              setProductSearch(name);
              setProduitNom(name);
              setShowProductSuggestions(name.length >= 3);
            }
          }}
        />
      </div>

      {productPhotoUrl && (
        <div className="flex justify-center">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-br from-purple-400 via-pink-500 to-rose-500 rounded-2xl blur-md opacity-70" />
            <img
              src={productPhotoUrl}
              alt={selectedProduct?.description || 'Produit'}
              className="relative w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-gray-800 shadow-2xl"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        </div>
      )}

      <div className="relative">
        <Label htmlFor="produitNom" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
          📦 Nom du Produit
        </Label>
        <Input
          id="produitNom"
          value={productSearch}
          onChange={(e) => {
            setProductSearch(e.target.value);
            setProduitNom(e.target.value);
            setShowProductSuggestions(e.target.value.length >= 3);
          }}
          placeholder="Saisir au moins 3 caractères..."
          className="border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white dark:bg-gray-900 shadow-sm"
        />
        {showProductSuggestions && categoryFilteredProducts.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
            {categoryFilteredProducts.map((product) => (
              <div
                key={product.id}
                className="p-3 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 cursor-pointer transition-all duration-200 border-b border-gray-100 dark:border-gray-700 last:border-0"
                onClick={() => handleProductSelect(product)}
              >
                <div className="font-semibold text-gray-900 dark:text-white">{product.description}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                  <span>💰 {product.purchasePrice}€</span>
                  <span>📊 Stock: {product.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="prixUnitaire" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
            💵 Prix Unitaire (€)
          </Label>
          <Input id="prixUnitaire" type="number" step="0.01" value={prixUnitaire}
            onChange={(e) => setPrixUnitaire(e.target.value)}
            placeholder="Prix d'achat"
            className="border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white dark:bg-gray-900 shadow-sm" />
        </div>

        <div>
          <Label htmlFor="quantite" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
            📊 Quantité {selectedProduct && `(dispo immédiat: ${selectedProduct.quantity}${availableQuantityForSelected !== null && availableQuantityForSelected !== undefined && availableQuantityForSelected > selectedProduct.quantity ? ` · +${availableQuantityForSelected - selectedProduct.quantity} en attente d'arrivage` : ''})`}
          </Label>
          <SaleQuantityInput
            quantity={quantite}
            onChange={setQuantite}
            maxQuantity={availableQuantityForSelected !== null && availableQuantityForSelected !== undefined ? availableQuantityForSelected : selectedProduct?.quantity}
            showAvailableStock={false}
          />
        </div>

        <div>
          <Label htmlFor="prixVente" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
            💎 Prix de Vente (€)
          </Label>
          <Input id="prixVente" type="number" step="0.01" value={prixVente}
            onChange={(e) => setPrixVente(e.target.value)}
            placeholder="Prix de vente"
            className="border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white dark:bg-gray-900 shadow-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            🎁 Réduction
            <span className="text-[10px] text-muted-foreground font-normal">(facultatif)</span>
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number" step="0.01" min="0"
              value={productReduction}
              onChange={(e) => {
                const v = e.target.value;
                setProductReduction?.(v);
                if (v && !productReductionType) setProductReductionType?.('amount');
              }}
              placeholder="0"
              className="flex-1 border-2 border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-900"
            />
            <select
              value={productReductionType || ''}
              onChange={(e) => setProductReductionType?.(e.target.value as any)}
              className="px-2 py-2 border-2 border-purple-300 dark:border-purple-700 rounded-md bg-white dark:bg-gray-900 text-sm"
            >
              <option value="">—</option>
              <option value="amount">€ / unité</option>
              <option value="percent">% du PU</option>
            </select>
          </div>
          {productReduction && productReductionType && (() => {
            const pv = parseFloat(prixVente || '0') || 0;
            const qte = parseFloat(quantite || '0') || 0;
            const r = parseFloat(productReduction) || 0;
            const amt = productReductionType === 'percent' ? (pv * r / 100) * qte : r * qte;
            const total = Math.max(0, pv * qte - amt);
            return (
              <p className="text-xs text-emerald-600">
                -{amt.toFixed(2)} € appliqués · Total après réduction: {total.toFixed(2)} €
              </p>
            );
          })()}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            🚚 Ville de livraison & Frais
          </Label>
          <select
            value={productDeliveryLocation || ''}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '__custom__') {
                setProductDeliveryLocation?.('');
                setProductDeliveryFee?.('0');
                setProductBaseDeliveryFee?.(null);
                return;
              }
              if (val === 'Exonération') {
                setProductDeliveryLocation?.('Exonération');
                setProductDeliveryFee?.('0');
                setProductBaseDeliveryFee?.(0);
                return;
              }
              const found = livraisonVilles.find(v => v.ville === val);
              setProductDeliveryLocation?.(val);
              setProductDeliveryFee?.(found ? String(found.fee) : '0');
              setProductBaseDeliveryFee?.(found ? found.fee : null);
            }}
            className="w-full px-3 py-2 border-2 border-purple-300 dark:border-purple-700 rounded-md bg-white dark:bg-gray-900"
          >
            <option value="">— Choisir une ville —</option>
            {livraisonVilles.map(v => (
              <option key={v.ville} value={v.ville}>
                {v.ville}{v.ville === 'Exonération' ? ' (0 €)' : `: ${v.fee === 0 ? 'gratuit' : `${v.fee} €`}`}
              </option>
            ))}
            <option value="__custom__">+ Nouvelle ville…</option>
          </select>

          <div className="grid grid-cols-2 gap-2">
            <Input type="text" value={productDeliveryLocation}
              onChange={(e) => setProductDeliveryLocation?.(e.target.value)}
              placeholder="Ville"
              className="border-2 border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-900" />
            <Input type="number" step="0.01" min="0" value={productDeliveryFee}
              onChange={(e) => setProductDeliveryFee?.(e.target.value)}
              placeholder="Frais (€)"
              className="border-2 border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-900" />
          </div>
          {productBaseDeliveryFee !== null && Number(productDeliveryFee || 0) !== Number(productBaseDeliveryFee) && (
            Number(productDeliveryFee || 0) < Number(productBaseDeliveryFee) ? (
              <p className="text-[11px] text-emerald-600 font-semibold">
                Réduit de {(Number(productBaseDeliveryFee) - Number(productDeliveryFee || 0)).toFixed(2)} € (base: {productBaseDeliveryFee} €)
              </p>
            ) : (
              <p className="text-[11px] text-orange-600 font-semibold">
                Augmenté de {(Number(productDeliveryFee || 0) - Number(productBaseDeliveryFee)).toFixed(2)} € (base: {productBaseDeliveryFee} €)
              </p>
            )
          )}

          {(() => {
            const knownVilleNames = livraisonVilles.map(v => v.ville);
            const isCustomLoc = !!productDeliveryLocation && !knownVilleNames.some(v => v.toLowerCase() === productDeliveryLocation.toLowerCase());
            const baseVilleFee = productBaseDeliveryFee;
            const canAdjust = !!productDeliveryLocation && productDeliveryLocation !== 'Exonération' && !isCustomLoc;
            if (!canAdjust) return null;
            return (
              <>
                <div className="flex items-center gap-1 flex-wrap">
                  <Button type="button" variant="ghost" size="sm"
                    onClick={() => { setShowFeeOverride(s => !s); if (!showFeeOverride) setShowFeeIncrease(false); }}
                    className="h-7 px-2 text-xs gap-1 text-blue-600 hover:bg-blue-50"
                  >
                    {showFeeOverride ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                    Réduction frais
                  </Button>
                  <Button type="button" variant="ghost" size="sm"
                    onClick={() => { setShowFeeIncrease(s => !s); if (!showFeeIncrease) setShowFeeOverride(false); }}
                    className="h-7 px-2 text-xs gap-1 text-orange-600 hover:bg-orange-50"
                  >
                    {showFeeIncrease ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                    Augmentation frais
                  </Button>
                </div>

                {showFeeOverride && (
                  <div className="mt-2 p-3 rounded-lg bg-blue-50/60 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 space-y-2">
                    <Label className="text-xs">Nouveau frais pour {productDeliveryLocation} (€)</Label>
                    <Input type="number" step="0.01" min="0" value={productDeliveryFee}
                      onChange={(e) => setProductDeliveryFee?.(e.target.value)}
                      placeholder={baseVilleFee !== null && baseVilleFee !== undefined ? `Frais standard: ${baseVilleFee} €` : 'Frais (€)'} />
                    {baseVilleFee !== null && baseVilleFee !== undefined && (
                      <button type="button"
                        className="text-[11px] text-gray-500 hover:text-gray-700 underline"
                        onClick={() => setProductDeliveryFee?.(String(baseVilleFee))}
                      >
                        Rétablir le frais standard ({baseVilleFee} €)
                      </button>
                    )}
                  </div>
                )}

                {showFeeIncrease && (
                  <div className="mt-2 p-3 rounded-lg bg-orange-50/60 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 space-y-2">
                    <Label className="text-xs">
                      Montant à ajouter au frais standard
                      {baseVilleFee !== null && baseVilleFee !== undefined && ` (${baseVilleFee} €)`} pour {productDeliveryLocation}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" step="0.01" min="0" value={feeIncreaseAmount}
                        onChange={(e) => {
                          const add = e.target.value;
                          setFeeIncreaseAmount(add);
                          const base = baseVilleFee !== null && baseVilleFee !== undefined ? Number(baseVilleFee) : Number(productDeliveryFee || 0);
                          const total = base + Number(add || 0);
                          setProductDeliveryFee?.(String(total));
                        }}
                        placeholder="Ex: 10"
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-600 whitespace-nowrap">
                        = {Number(productDeliveryFee || 0).toFixed(2)} € total
                      </span>
                    </div>
                    {baseVilleFee !== null && baseVilleFee !== undefined && (
                      <button type="button"
                        className="text-[11px] text-gray-500 hover:text-gray-700 underline"
                        onClick={() => {
                          setFeeIncreaseAmount('');
                          setProductDeliveryFee?.(String(baseVilleFee));
                        }}
                      >
                        Rétablir le frais standard ({baseVilleFee} €)
                      </button>
                    )}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>

      <Button type="button" onClick={handleAddProduit}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
      >
        <Plus className="mr-2 h-4 w-4" />
        {editingProductIndex !== null ? 'Modifier ce produit' : 'Ajouter ce produit au panier'}
      </Button>

      {produitsListe.length > 0 && (
        <div className="space-y-2 mt-4">
          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            🛒 Panier ({produitsListe.length} produit{produitsListe.length > 1 ? 's' : ''})
          </Label>
          <div className="space-y-2">
            {produitsListe.map((produit, index) => (
              <div key={index}
                className={`flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border-2 shadow-sm transition-all ${editingProductIndex === index
                    ? 'border-purple-500 dark:border-purple-400 ring-2 ring-purple-200 dark:ring-purple-800'
                    : 'border-purple-200 dark:border-purple-700'
                  }`}
              >
                <div className="flex-1">
                  <div className="font-semibold text-sm">
                    {produit.nom}
                    {editingProductIndex === index && (
                      <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
                        En édition
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="text-red-600 font-bold">Qté: {produit.quantite}</span>
                    {' | '}
                    <span className="text-green-600 font-bold">Prix unitaire: {produit.prixUnitaire}€</span>
                    {' | '}
                    <span className="text-blue-600 font-bold">Prix vente: {produit.prixVente}€</span>
                    {(produit.reduction || 0) > 0 && produit.reductionType && (
                      <>
                        {' | '}
                        <span className="text-emerald-600 font-bold">
                          Réduction: {produit.reduction}{produit.reductionType === 'percent' ? '%' : '€/u'}
                        </span>
                      </>
                    )}
                    {(produit.deliveryLocation || (produit.deliveryFee || 0) > 0) && (
                      <>
                        {' | '}
                        <span className="text-orange-600 font-bold">
                          🚚 {produit.deliveryLocation || ''} {(produit.deliveryFee || 0).toFixed(2)}€
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="sm"
                    onClick={() => handleEditProduit(index)}
                    className="hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 rounded-xl transition-all duration-300"
                    title="Modifier ce produit"
                  >
                    <Edit className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm"
                    onClick={() => handleRemoveProduit(index)}
                    className="hover:bg-gradient-to-r hover:from-red-100 hover:to-rose-100 dark:hover:from-red-900/30 dark:hover:to-rose-900/30 rounded-xl transition-all duration-300"
                    title="Retirer ce produit"
                  >
                    <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSection;
