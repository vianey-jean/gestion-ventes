/**
 * AddProductModal.tsx — Modale d'ajout d'un nouveau produit.
 * Extrait de ProduitsPage pour réutilisabilité.
 */
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Package, Plus, Star, Hash, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import PhotoUploadSection from '@/components/dashboard/PhotoUploadSection';
import FournisseurAutocomplete from '@/components/dashboard/FournisseurAutocomplete';
import ProductClassificationSelector, {
  ClassificationValue,
  buildProductName,
} from '@/components/products/attributes/ProductClassificationSelector';

export interface AddProductForm {
  description: string;
  purchasePrice: string;
  quantity: string;
  fournisseur: string;
  dateAchat: string;
}

interface AddPhotosState {
  files: File[];
  existingUrls: string[];
  mainIndex: number;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  addForm: AddProductForm;
  setAddForm: React.Dispatch<React.SetStateAction<AddProductForm>>;
  addErrors: Record<string, string>;
  setAddErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  addPhotos: AddPhotosState;
  setAddPhotos: React.Dispatch<React.SetStateAction<AddPhotosState>>;
  addClassification: ClassificationValue;
  setAddClassification: React.Dispatch<React.SetStateAction<ClassificationValue>>;
  isSubmitting: boolean;
  onSubmit: () => void;
}

const AddProductModal: React.FC<Props> = ({
  open, onOpenChange, addForm, setAddForm, addErrors, setAddErrors,
  addPhotos, setAddPhotos, addClassification, setAddClassification,
  isSubmitting, onSubmit,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-slate-900 via-green-900/30 to-emerald-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-4 pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-green-500/30">
            <Plus className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            ✨ Nouveau Produit Premium
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <ProductClassificationSelector
              value={addClassification}
              onChange={(v) => {
                setAddClassification(v);
                const name = buildProductName(v);
                if (name) {
                  setAddForm(prev => ({ ...prev, description: name }));
                  if (addErrors.description) setAddErrors(prev => ({ ...prev, description: '' }));
                }
              }}
              variant="dark"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-desc" className="text-sm font-bold text-white/80 flex items-center gap-2">
              <Package className="h-4 w-4 text-green-400" /> Description du produit (auto-générée, éditable)
            </Label>
            <Input id="add-desc" value={addForm.description}
              onChange={(e) => { setAddForm({ ...addForm, description: e.target.value }); if (addErrors.description) setAddErrors({ ...addErrors, description: '' }); }}
              placeholder="Entrez une description premium..."
              className="bg-white/10 border border-white/20 focus:border-green-400 rounded-xl text-white placeholder:text-white/40 hover:bg-white/15 transition-all"
            />
            {addErrors.description && <p className="text-sm text-red-400">{addErrors.description}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-price" className="text-sm font-bold text-white/80 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" /> Prix (€)
            </Label>
            <Input id="add-price" type="number" step="0.01" value={addForm.purchasePrice}
              onChange={(e) => { setAddForm({ ...addForm, purchasePrice: e.target.value }); if (addErrors.purchasePrice) setAddErrors({ ...addErrors, purchasePrice: '' }); }}
              className="bg-white/10 border border-white/20 focus:border-yellow-400 rounded-xl text-white placeholder:text-white/40 hover:bg-white/15 transition-all"
            />
            {addErrors.purchasePrice && <p className="text-sm text-red-400">{addErrors.purchasePrice}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-qty" className="text-sm font-bold text-white/80 flex items-center gap-2">
              <Hash className="h-4 w-4 text-blue-400" /> Quantité en stock
            </Label>
            <Input id="add-qty" type="number" value={addForm.quantity}
              onChange={(e) => { setAddForm({ ...addForm, quantity: e.target.value }); if (addErrors.quantity) setAddErrors({ ...addErrors, quantity: '' }); }}
              className="bg-white/10 border border-white/20 focus:border-blue-400 rounded-xl text-white placeholder:text-white/40 hover:bg-white/15 transition-all"
            />
            {addErrors.quantity && <p className="text-sm text-red-400">{addErrors.quantity}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-date" className="text-sm font-bold text-white/80 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-fuchsia-400" /> Date d'achat
            </Label>
            <Input id="add-date" type="date" value={addForm.dateAchat}
              onChange={(e) => setAddForm({ ...addForm, dateAchat: e.target.value })}
              className="bg-white/10 border border-white/20 focus:border-fuchsia-400 rounded-xl text-white placeholder:text-white/40 hover:bg-white/15 transition-all [color-scheme:dark]"
            />
          </div>
          <FournisseurAutocomplete
            value={addForm.fournisseur}
            onChange={(val) => setAddForm({ ...addForm, fournisseur: val })}
            variant="dark"
          />
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
            <PhotoUploadSection
              onPhotosChange={(files, existingUrls, mainIndex) => setAddPhotos({ files, existingUrls, mainIndex })}
              maxPhotos={6}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={onSubmit} disabled={isSubmitting}
              className="flex-1 h-12 rounded-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 transition-all duration-300 border-0"
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Ajouter au Stock
            </Button>
            <Button variant="outline" onClick={() => { onOpenChange(false); setAddPhotos({ files: [], existingUrls: [], mainIndex: 0 }); }}
              className="flex-1 h-12 rounded-xl font-bold border-2 border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
            >
              <XCircle className="h-5 w-5 mr-2" /> Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
