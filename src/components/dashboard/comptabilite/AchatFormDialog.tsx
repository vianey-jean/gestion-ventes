/**
 * AchatFormDialog - Formulaire modal pour ajouter un nouvel achat
 * 
 * RÔLE :
 * Ce composant affiche une modale permettant d'enregistrer un nouvel achat de produit.
 * Il gère deux cas :
 * 1. Produit EXISTANT sélectionné → mise à jour du stock dans products.json
 * 2. NOUVEAU produit → création dans products.json
 * Dans les deux cas, l'achat est enregistré dans nouvelle_achat.json.
 * 
 * PROPS :
 * - isOpen: boolean - État d'ouverture de la modale
 * - onClose: () => void - Callback à la fermeture
 * - achatForm: NouvelleAchatFormData - Données du formulaire
 * - onFormChange: (field, value) => void - Callback de changement
 * - onSubmit: () => void - Callback de soumission
 * - searchTerm: string - Terme de recherche
 * - onSearchChange: (e) => void - Callback de changement de recherche
 * - filteredProducts: Product[] - Produits filtrés
 * - selectedProduct: Product | null - Produit sélectionné
 * - onSelectProduct: (product) => void - Callback de sélection
 * - showProductList: boolean - Afficher la liste des suggestions
 * - formatEuro: (value) => string - Formatage monétaire
 * 
 * DÉPENDANCES :
 * - @/components/ui/dialog
 * - @/components/ui/input
 * - @/components/ui/button
 * - @/components/ui/card
 * - @/components/ui/textarea
 * - ./ProductSearchInput
 * - @/types/comptabilite (NouvelleAchatFormData)
 * - @/types/product (Product)
 * - lucide-react
 * 
 * UTILISÉ PAR :
 * - ComptabiliteModule.tsx
 */

import React, { useRef } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  ShoppingCart,
  DollarSign,
  Package,
  Receipt,
  Calculator,
  Plus,
  CalendarIcon
} from 'lucide-react';
import { NouvelleAchatFormData } from '@/types/comptabilite';
import { Product } from '@/types/product';
import { Fournisseur } from '@/services/api/fournisseurApi';
import ProductSearchInput from './ProductSearchInput';
import PhotoUploadSection from '../PhotoUploadSection';
import { getBaseURL } from '@/services/api/api';

// ============================================
// INTERFACE DES PROPS
// ============================================
export interface AchatFormDialogProps {
  /** État d'ouverture de la modale */
  isOpen: boolean;
  /** Callback à la fermeture de la modale */
  onClose: () => void;
  /** Données actuelles du formulaire d'achat */
  achatForm: NouvelleAchatFormData;
  /** Callback lors du changement d'un champ */
  onFormChange: (field: keyof NouvelleAchatFormData, value: string | number) => void;
  /** Callback lors de la soumission */
  onSubmit: () => void;
  /** Terme de recherche actuel */
  searchTerm: string;
  /** Callback de changement de recherche */
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Liste des produits filtrés */
  filteredProducts: Product[];
  /** Produit actuellement sélectionné */
  selectedProduct: Product | null;
  /** Callback de sélection d'un produit */
  onSelectProduct: (product: Product) => void;
  /** Afficher la liste des suggestions */
  showProductList: boolean;
  /** Fonction de formatage des montants */
  formatEuro: (value: number) => string;
  /** Liste des fournisseurs filtrés */
  filteredFournisseurs: Fournisseur[];
  /** Afficher la liste des fournisseurs */
  showFournisseurList: boolean;
  /** Callback de sélection d'un fournisseur */
  onSelectFournisseur: (nom: string) => void;
  /** Callback déclenché lorsque les photos du produit changent (facultatif) */
  onPhotosChange?: (newFiles: File[], keptExistingUrls: string[], mainIndex: number) => void;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const AchatFormDialog: React.FC<AchatFormDialogProps> = ({
  isOpen,
  onClose,
  achatForm,
  onFormChange,
  onSubmit,
  searchTerm,
  onSearchChange,
  filteredProducts,
  selectedProduct,
  onSelectProduct,
  showProductList,
  formatEuro,
  filteredFournisseurs,
  showFournisseurList,
  onSelectFournisseur,
  onPhotosChange
}) => {
  const fournisseurRef = useRef<HTMLDivElement>(null);
  const baseUrl = getBaseURL();

  // Clé pour réinitialiser PhotoUploadSection quand on change de produit
  // (existant -> nouveau, ou produit existant A -> produit existant B)
  const photoSectionKey = selectedProduct ? `existing-${selectedProduct.id}` : 'new-product';
  // Calcul du coût total
  const totalCost = (achatForm.purchasePrice > 0 
    ? achatForm.purchasePrice 
    : (selectedProduct?.purchasePrice || 0)) * achatForm.quantity;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
        {/* En-tête de la modale */}
        <DialogHeader>
          <DialogTitle className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            Nouvel Achat Produit
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Enregistrez un nouvel achat de produit
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* ===========================================================
              GESTION DES PHOTOS PRODUIT
              - Si un produit existant est sélectionné : on affiche les
                photos déjà en BDD (modifiables) au-dessus du formulaire.
              - Sinon (nouveau produit) : on affiche un emplacement vide
                pour ajouter de nouvelles photos. (facultatif)
          =========================================================== */}
          <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 p-4">
            <PhotoUploadSection
              key={photoSectionKey}
              existingPhotos={selectedProduct?.photos || []}
              existingMainPhoto={selectedProduct?.mainPhoto}
              baseUrl={baseUrl}
              onPhotosChange={(files, kept, mainIdx) => {
                onPhotosChange?.(files, kept, mainIdx);
              }}
              maxPhotos={6}
            />
          </div>

          {/* Composant de recherche de produit */}
          <ProductSearchInput
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            filteredProducts={filteredProducts}
            selectedProduct={selectedProduct}
            onSelectProduct={onSelectProduct}
            showProductList={showProductList}
            formatEuro={formatEuro}
          />

          {/* Description produit - modifiable même si produit sélectionné */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {selectedProduct ? '✏️ Modifier le nom du produit (sera mis à jour dans products.json)' : 'Ou créer un nouveau produit'}
            </Label>
            <Input
              value={achatForm.productDescription}
              onChange={(e) => onFormChange('productDescription', e.target.value)}
              placeholder="Description du produit"
              className="bg-white/80 dark:bg-gray-800/80"
            />
            {selectedProduct && achatForm.productDescription !== selectedProduct.description && (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                ⚠️ Le nom sera modifié de "{selectedProduct.description}" à "{achatForm.productDescription}"
              </p>
          )}
          </div>

          {/* Grille Prix / Quantité */}
          <div className="grid grid-cols-2 gap-6">
            {/* Prix d'achat */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  Prix d'achat (€)
                </Label>
                {selectedProduct && (
                  <span className="text-sm font-bold text-red-600 bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full border border-red-200 dark:border-red-700 flex items-center gap-1">
                    Actuel: {formatEuro(selectedProduct.purchasePrice)}
                  </span>
                )}
              </div>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={achatForm.purchasePrice || ''}
                onChange={(e) => onFormChange('purchasePrice', parseFloat(e.target.value) || 0)}
                placeholder={selectedProduct ? "Nouveau prix (optionnel)" : "Prix d'achat"}
                className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl text-lg font-medium shadow-sm transition-all duration-200"
              />
              {selectedProduct && (
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                  💡 Laissez vide pour garder le prix actuel
                </p>
              )}
            </div>
            
            {/* Quantité */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-500" />
                  Quantité à ajouter *
                </Label>
                {selectedProduct && (
                  <span className="text-sm font-bold text-red-600 bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full border border-red-200 dark:border-red-700 flex items-center gap-1">
                    Stock: {selectedProduct.quantity}
                  </span>
                )}
              </div>
              <Input
                type="number"
                min="1"
                value={achatForm.quantity || ''}
                onChange={(e) => onFormChange('quantity', parseInt(e.target.value) || 0)}
                placeholder="Quantité à ajouter"
                className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl text-lg font-medium shadow-sm transition-all duration-200"
              />
              {selectedProduct && achatForm.quantity > 0 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✓ Nouveau stock: {selectedProduct.quantity + achatForm.quantity} unités
                </p>
              )}
            </div>
          </div>

          {/* Grille Fournisseur / Caractéristiques */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3 relative" ref={fournisseurRef}>
              <Label className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-purple-500" />
                Fournisseur
              </Label>
              <Input
                value={achatForm.fournisseur || ''}
                onChange={(e) => onFormChange('fournisseur', e.target.value)}
                placeholder="Rechercher ou saisir un fournisseur"
                className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl font-medium shadow-sm transition-all duration-200"
                autoComplete="off"
              />
              {/* Liste déroulante des fournisseurs */}
              {showFournisseurList && filteredFournisseurs.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-600 rounded-xl shadow-xl max-h-40 overflow-y-auto">
                  {filteredFournisseurs.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onSelectFournisseur(f.nom)}
                      className="w-full text-left px-4 py-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-sm font-medium text-gray-800 dark:text-gray-200 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      {f.nom}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-indigo-500" />
                Caractéristiques
              </Label>
              <Textarea
                value={achatForm.caracteristiques || ''}
                onChange={(e) => onFormChange('caracteristiques', e.target.value)}
                placeholder="Caractéristiques du produit..."
                className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl font-medium shadow-sm transition-all duration-200 resize-none"
                rows={2}
              />
            </div>
          </div>

          {/* Date d'achat */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-indigo-500" />
            Date d'achat *
          </Label>

          <div className="relative">
            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500" />

            <Input
              type="date"
              value={achatForm.date ? achatForm.date.slice(0, 10) : ""}
              onChange={(e) =>
                onFormChange(
                  "date",
                  e.target.value ? new Date(e.target.value).toISOString() : ""
                )
              }
              className={cn(
                "h-12 w-full pl-11 pr-4 rounded-2xl",
                "bg-white/80 dark:bg-gray-900/70 backdrop-blur-md",
                "border border-gray-200/60 dark:border-gray-700/60",
                "text-gray-900 dark:text-gray-100 font-medium",
                "shadow-sm hover:shadow-md transition-all duration-200",
                "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                "appearance-none"
              )}
            />
          </div>
        </div>

          {/* Résumé du coût */}
          {achatForm.quantity > 0 && (
            <Card className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-emerald-500/30 shadow-lg">
              <CardContent className="pt-5 pb-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-emerald-600" />
                    <span className="font-bold text-gray-800 dark:text-gray-100">Coût total de cet achat:</span>
                  </div>
                  <span className="text-2xl font-black text-emerald-800 dark:text-emerald-400">
                    {formatEuro(totalCost)}
                  </span>
                </div>
                {selectedProduct && achatForm.purchasePrice === 0 && (
                  <p className="text-sm text-gray-500 mt-2 italic">
                    * Calculé avec le prix actuel du produit
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Boutons d'action */}
        <DialogFooter className="gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="h-12 px-6 rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
          >
            Annuler
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!achatForm.productDescription || achatForm.quantity <= 0 || !achatForm.date}
            className="h-12 px-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white shadow-xl rounded-xl font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Enregistrer l'achat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AchatFormDialog;
