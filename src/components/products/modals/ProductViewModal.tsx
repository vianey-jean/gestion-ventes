/**
 * ProductViewModal.tsx — Slideshow photo + détails produit + accès historiques.
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, Star, LineChart as LineChartIcon, MessageSquare } from 'lucide-react';
import { Product } from '@/types';
import { ProductRatingInfo } from '@/services/api/productCommentsApi';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  selectedProduct: Product | null;
  currentPhotoIndex: number;
  setCurrentPhotoIndex: React.Dispatch<React.SetStateAction<number>>;
  getPhotoUrl: (url: string) => string;
  allRatings: Record<string, ProductRatingInfo>;
  onOpenPrixHistory: () => void;
  onOpenHistory: () => void;
  onOpenFournHistory: () => void;
  onOpenComments: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ProductViewModal: React.FC<Props> = ({
  open, onOpenChange, selectedProduct, currentPhotoIndex, setCurrentPhotoIndex,
  getPhotoUrl, allRatings, onOpenPrixHistory, onOpenHistory, onOpenFournHistory,
  onOpenComments, onEdit, onDelete,
}) => {
  if (!selectedProduct) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-slate-900 via-violet-900/30 to-purple-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-xl shadow-violet-500/30">
            <Eye className="h-8 w-8 text-white" />
            <span className="text-white font-bold text-lg">Voir Produit</span>
          </div>
          <DialogTitle className="text-2xl font-black bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            {selectedProduct.description}
          </DialogTitle>
        </DialogHeader>

        {(selectedProduct.photos && selectedProduct.photos.length > 0) ? (
          <div className="relative rounded-2xl overflow-hidden border border-white/10">
            <div className="aspect-[4/3] relative">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentPhotoIndex}
                  src={getPhotoUrl(selectedProduct.photos[currentPhotoIndex])}
                  alt={`Photo ${currentPhotoIndex + 1}`}
                  className="w-full h-full object-contain bg-black/20"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
              {selectedProduct.photos.length > 1 && (
                <>
                  <button onClick={() => setCurrentPhotoIndex(prev => prev === 0 ? selectedProduct.photos!.length - 1 : prev - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-xl border border-white/10 transition-all"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button onClick={() => setCurrentPhotoIndex(prev => (prev + 1) % selectedProduct.photos!.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-xl border border-white/10 transition-all"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
              {selectedProduct.photos.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {selectedProduct.photos.map((_, i) => (
                    <button key={i} onClick={() => setCurrentPhotoIndex(i)}
                      className={cn(
                        "w-2.5 h-2.5 rounded-full transition-all duration-300",
                        i === currentPhotoIndex ? "bg-white scale-125 shadow-lg" : "bg-white/40 hover:bg-white/60"
                      )}
                    />
                  ))}
                </div>
              )}
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur-xl text-white text-xs font-bold border border-white/10">
                {currentPhotoIndex + 1}/{selectedProduct.photos.length}
              </div>
            </div>
          </div>
        ) : null}

        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-white/50 text-xs font-medium">Code</p>
              <p className="text-white font-bold text-lg">{selectedProduct.code || '—'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/50 text-xs font-medium">Prix d'achat</p>
                  <p className="text-amber-400 font-bold text-lg">{selectedProduct.purchasePrice}€</p>
                </div>
                <button type="button" onClick={onOpenPrixHistory} title="Voir l'historique des prix"
                  className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/20 text-amber-300 transition-colors"
                >
                  <LineChartIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/50 text-xs font-medium">Quantité</p>
                  <p className={cn("font-bold text-lg", selectedProduct.quantity > 0 ? "text-emerald-400" : "text-red-400")}>{selectedProduct.quantity}</p>
                </div>
                <button type="button" onClick={onOpenHistory} title="Historique achats/ventes"
                  className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/20 text-emerald-300 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-white/50 text-xs font-medium">Photos</p>
              <p className="text-purple-400 font-bold text-lg">{selectedProduct.photos?.length || 0}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-white/50 text-xs font-medium">Fournisseur</p>
                <p className="text-cyan-400 font-bold text-lg">{selectedProduct.fournisseur || '—'}</p>
              </div>
              <button type="button" onClick={onOpenFournHistory} title="Historique fournisseurs"
                className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/20 text-cyan-300 transition-colors"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>

          {(() => {
            const info = allRatings[selectedProduct.id];
            const avg = info?.average || 0;
            const count = info?.count || 0;
            const fullStars = Math.floor(avg);
            const hasHalf = avg - fullStars >= 0.3;
            const starColor = avg <= 2 ? 'text-red-500' : avg <= 3 ? 'text-yellow-500' : 'text-emerald-500';
            return (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white/50 text-xs font-medium">Notation moyenne</p>
                    <button type="button" onClick={onOpenComments}
                      className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors text-purple-300 flex items-center gap-1.5"
                      title="Voir les commentaires"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-xs font-bold">{count}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`flex items-center ${starColor}`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn("h-5 w-5", i < fullStars ? "fill-current" : (i === fullStars && hasHalf) ? "fill-current opacity-50" : "opacity-20")} />
                      ))}
                    </div>
                    <span className="text-white font-bold text-lg">{avg > 0 ? avg : '—'}</span>
                    <span className="text-white/40 text-sm">({count} commentaire{count !== 1 ? 's' : ''})</span>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="flex gap-3 pt-2">
            <Button onClick={onEdit}
              className="flex-1 h-12 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-0"
            >
              <Edit className="h-5 w-5 mr-2" /> Modifier
            </Button>
            <Button onClick={onDelete}
              className="flex-1 h-12 rounded-xl font-bold bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25 border-0"
            >
              <Trash2 className="h-5 w-5 mr-2" /> Supprimer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductViewModal;
