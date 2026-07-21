/**
 * EditProductModal.tsx — Modale d'édition d'un produit (+ ajout de commentaire).
 */
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Package, Star, Hash, Sparkles, Edit, CheckCircle2, XCircle, MessageSquare, User } from 'lucide-react';
import PhotoUploadSection from '@/components/dashboard/PhotoUploadSection';
import FournisseurAutocomplete from '@/components/dashboard/FournisseurAutocomplete';
import { Product } from '@/types';
import { Client } from '@/types/client';

export interface EditForm {
  description: string;
  purchasePrice: number;
  quantity: number;
  additionalQuantity: number;
  fournisseur: string;
  purchaseDate: string;
}

interface EditPhotosState {
  files: File[];
  existingUrls: string[];
  mainIndex: number;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  selectedProduct: Product | null;
  editForm: EditForm;
  setEditForm: React.Dispatch<React.SetStateAction<EditForm>>;
  editPhotos: EditPhotosState;
  setEditPhotos: React.Dispatch<React.SetStateAction<EditPhotosState>>;
  baseUrl: string;
  isSubmitting: boolean;
  onSubmit: () => void;
  // comment section
  clientSearchQuery: string;
  setClientSearchQuery: (v: string) => void;
  setCommentClientName: (v: string) => void;
  clientSearchResults: Client[];
  setClientSearchResults: (v: Client[]) => void;
  showClientDropdown: boolean;
  setShowClientDropdown: (v: boolean) => void;
  onClientQueryChange: (val: string) => Promise<void> | void;
  newComment: string;
  setNewComment: (v: string) => void;
  newRating: number;
  setNewRating: (v: number) => void;
  isSubmittingComment: boolean;
  onSubmitComment: () => void;
}

const EditProductModal: React.FC<Props> = (p) => {
  if (!p.selectedProduct) return null;
  return (
    <Dialog open={p.open} onOpenChange={(open) => { if (!open) { p.onOpenChange(false); p.setEditPhotos({ files: [], existingUrls: [], mainIndex: 0 }); } }}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-slate-900 via-blue-900/40 to-indigo-900/30 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-4 pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
            <Edit className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            ✨ Modifier Produit Premium
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-400" /> Description
            </Label>
            <Input value={p.editForm.description}
              onChange={(e) => p.setEditForm({ ...p.editForm, description: e.target.value })}
              className="bg-white/10 border border-white/20 focus:border-blue-400 rounded-xl text-white placeholder:text-white/40 hover:bg-white/15 transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" /> Prix (€)
            </Label>
            <Input type="number" step="0.01" value={p.editForm.purchasePrice}
              onChange={(e) => p.setEditForm({ ...p.editForm, purchasePrice: parseFloat(e.target.value) || 0 })}
              className="bg-white/10 border border-white/20 focus:border-yellow-400 rounded-xl text-white placeholder:text-white/40 hover:bg-white/15 transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
              <Hash className="h-4 w-4 text-indigo-400" /> Quantité actuelle: {p.editForm.quantity}
            </Label>
            <Input type="number" value={p.editForm.additionalQuantity}
              onChange={(e) => p.setEditForm({ ...p.editForm, additionalQuantity: parseInt(e.target.value) || 0 })}
              placeholder="Ajouter quantité..."
              className="bg-white/10 border border-white/20 focus:border-indigo-400 rounded-xl text-white placeholder:text-white/40 hover:bg-white/15 transition-all"
            />
            <p className="text-sm text-white/50 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-blue-400" /> Quantité finale: <b className="text-white/80">{p.editForm.quantity + p.editForm.additionalQuantity}</b>
            </p>
          </div>
          {p.editForm.additionalQuantity > 0 && (
            <div className="space-y-2 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-400/20">
              <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" /> Date du nouvel achat
              </Label>
              <Input type="date" value={p.editForm.purchaseDate}
                onChange={(e) => p.setEditForm({ ...p.editForm, purchaseDate: e.target.value })}
                className="bg-white/10 border border-white/20 focus:border-emerald-400 rounded-xl text-white placeholder:text-white/40 hover:bg-white/15 transition-all [color-scheme:dark]"
              />
              <p className="text-xs text-white/50">Cet achat de <b className="text-emerald-300">+{p.editForm.additionalQuantity}</b> sera enregistré dans l'historique d'achats du produit.</p>
            </div>
          )}
          <FournisseurAutocomplete
            value={p.editForm.fournisseur}
            onChange={(val) => p.setEditForm({ ...p.editForm, fournisseur: val })}
            variant="dark"
          />
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
            <PhotoUploadSection
              existingPhotos={p.selectedProduct.photos || []}
              existingMainPhoto={p.selectedProduct.mainPhoto}
              baseUrl={p.baseUrl}
              onPhotosChange={(files, existingUrls, mainIndex) => p.setEditPhotos({ files, existingUrls, mainIndex })}
              maxPhotos={6}
            />
          </div>

          {/* Ajouter Commentaire */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
            <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-400" /> Ajouter un commentaire
            </Label>
            <div className="relative">
              <Label className="text-xs font-bold text-white/60 flex items-center gap-1 mb-1">
                <User className="h-3 w-3" /> Nom du client
              </Label>
              <Input
                value={p.clientSearchQuery}
                onChange={(e) => p.onClientQueryChange(e.target.value)}
                onBlur={() => setTimeout(() => p.setShowClientDropdown(false), 200)}
                placeholder="Rechercher un client (3 car. min.)..."
                className="bg-white/10 border border-white/20 focus:border-cyan-400 rounded-xl text-white placeholder:text-white/40"
              />
              {p.showClientDropdown && p.clientSearchResults.length > 0 && (
                <div className="absolute z-50 top-full mt-1 w-full rounded-xl border border-white/20 bg-slate-900/95 backdrop-blur-2xl shadow-2xl max-h-40 overflow-y-auto">
                  {p.clientSearchResults.map(client => (
                    <button key={client.id} type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        p.setCommentClientName(client.nom);
                        p.setClientSearchQuery(client.nom);
                        p.setShowClientDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-white/10 text-white text-sm flex items-center gap-2 transition-colors"
                    >
                      <User className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
                      <span className="truncate">{client.nom}</span>
                      {client.phone && <span className="text-white/30 text-xs ml-auto">{client.phone}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Input value={p.newComment} onChange={(e) => p.setNewComment(e.target.value)}
              placeholder="Votre commentaire sur ce produit..."
              className="bg-white/10 border border-white/20 focus:border-purple-400 rounded-xl text-white placeholder:text-white/40"
            />
            <div className="space-y-1">
              <Label className="text-xs font-bold text-white/60">Notation</Label>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" onClick={() => p.setNewRating(s)} className="transition-transform hover:scale-125">
                    <Star className={cn(
                      "h-6 w-6 transition-colors",
                      s <= p.newRating
                        ? p.newRating <= 2 ? "text-red-500 fill-red-500" : p.newRating <= 3 ? "text-yellow-500 fill-yellow-500" : "text-emerald-500 fill-emerald-500"
                        : "text-white/20"
                    )} />
                  </button>
                ))}
                <span className="text-white/60 text-sm ml-2">{p.newRating}/5</span>
              </div>
            </div>
            <Button onClick={p.onSubmitComment} disabled={p.isSubmittingComment || !p.newComment.trim()}
              className="w-full h-10 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white border-0"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {p.isSubmittingComment ? 'Envoi...' : 'Ajouter commentaire'}
            </Button>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={p.onSubmit} disabled={p.isSubmitting}
              className="flex-1 h-12 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 transition-all duration-300 border-0"
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              {p.isSubmitting ? 'Envoi...' : 'Sauvegarder'}
            </Button>
            <Button variant="outline" onClick={() => { p.onOpenChange(false); p.setEditPhotos({ files: [], existingUrls: [], mainIndex: 0 }); }}
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

export default EditProductModal;
