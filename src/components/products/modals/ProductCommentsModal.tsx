/**
 * ProductCommentsModal.tsx — Liste + édition + suppression de commentaires produit.
 */
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { MessageSquare, Star, Pencil, Trash2, User } from 'lucide-react';
import { Product } from '@/types';
import { ProductRatingInfo, ProductComment } from '@/services/api/productCommentsApi';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  selectedProduct: Product | null;
  allRatings: Record<string, ProductRatingInfo>;
  selectedCommentIds: string[];
  setSelectedCommentIds: React.Dispatch<React.SetStateAction<string[]>>;
  toggleCommentSelection: (id: string, checked: boolean) => void;
  editingCommentId: string | null;
  editingCommentText: string;
  setEditingCommentText: (v: string) => void;
  editingCommentRating: number;
  setEditingCommentRating: (v: number) => void;
  editingCommentClientName: string;
  setEditingCommentClientName: (v: string) => void;
  startEditingComment: (c: ProductComment) => void;
  resetCommentEditor: () => void;
  handleSaveCommentEdit: () => void;
  isUpdatingComment: boolean;
  handleDeleteComments: (ids: string[]) => void;
  isDeletingComments: boolean;
}

const ProductCommentsModal: React.FC<Props> = (p) => (
  <Dialog open={p.open} onOpenChange={p.onOpenChange}>
    <DialogContent className="w-[95vw] sm:max-w-xl bg-gradient-to-br from-slate-900 via-purple-900/30 to-indigo-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-purple-400" /> Commentaires{p.selectedProduct ? ` — ${p.selectedProduct.description}` : ''}
        </DialogTitle>
      </DialogHeader>
      {p.selectedProduct && (() => {
        const info = p.allRatings[p.selectedProduct.id];
        const comments = info?.comments || [];
        if (comments.length === 0) {
          return <p className="text-white/60 text-sm p-4 text-center">Aucun commentaire pour ce produit.</p>;
        }
        return (
          <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
            {p.selectedCommentIds.length > 0 && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                <span className="text-xs font-bold text-red-200">
                  {p.selectedCommentIds.length} commentaire{p.selectedCommentIds.length > 1 ? 's' : ''} sélectionné{p.selectedCommentIds.length > 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={() => p.setSelectedCommentIds([])} className="h-8 border-white/20 bg-white/5 text-white/80 hover:bg-white/10">Annuler</Button>
                  <Button type="button" onClick={() => p.handleDeleteComments(p.selectedCommentIds)} disabled={p.isDeletingComments} className="h-8 bg-gradient-to-r from-red-500 to-rose-600 text-white border-0">
                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Supprimer
                  </Button>
                </div>
              </div>
            )}
            {comments.map(c => {
              const cColor = c.rating <= 2 ? 'border-red-500/30 bg-red-500/5' : c.rating === 3 ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-emerald-500/30 bg-emerald-500/5';
              const cStarColor = c.rating <= 2 ? 'text-red-500' : c.rating === 3 ? 'text-yellow-500' : 'text-emerald-500';
              const isEditing = p.editingCommentId === c.id;
              return (
                <div key={c.id} className={`p-3 rounded-xl border ${cColor}`}>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={p.selectedCommentIds.includes(c.id)}
                      onCheckedChange={(checked) => p.toggleCommentSelection(c.id, checked === true)}
                      className="mt-1 border-white/30 data-[state=checked]:bg-red-500 data-[state=checked]:text-white"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div>
                          <div className={`flex items-center gap-1 ${isEditing ? (p.editingCommentRating <= 2 ? 'text-red-500' : p.editingCommentRating === 3 ? 'text-yellow-500' : 'text-emerald-500') : cStarColor}`}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <button key={i} type="button" onClick={() => isEditing && p.setEditingCommentRating(i + 1)} className={isEditing ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}>
                                <Star className={cn('h-3 w-3', i < (isEditing ? p.editingCommentRating : c.rating) ? 'fill-current' : 'opacity-20')} />
                              </button>
                            ))}
                          </div>
                          {(isEditing ? p.editingCommentClientName : c.clientName) && (
                            <span className="text-cyan-400 text-xs font-bold flex items-center gap-1 mt-1">
                              <User className="h-3 w-3" /> {isEditing ? p.editingCommentClientName : c.clientName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => p.startEditingComment(c)} className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-1.5 text-blue-300 transition-colors hover:bg-blue-500/20" title="Modifier le commentaire">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" onClick={() => p.handleDeleteComments([c.id])} className="rounded-lg border border-red-500/20 bg-red-500/10 p-1.5 text-red-300 transition-colors hover:bg-red-500/20" title="Supprimer le commentaire">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input value={p.editingCommentClientName} onChange={(e) => p.setEditingCommentClientName(e.target.value)} placeholder="Nom du client" className="bg-white/10 border border-white/20 focus:border-cyan-400 rounded-xl text-white placeholder:text-white/40" />
                          <Textarea value={p.editingCommentText} onChange={(e) => p.setEditingCommentText(e.target.value)} placeholder="Modifier le commentaire..." className="min-h-[96px] bg-white/10 border border-white/20 focus:border-purple-400 rounded-xl text-white placeholder:text-white/40" />
                          <div className="flex gap-2">
                            <Button type="button" onClick={p.handleSaveCommentEdit} disabled={p.isUpdatingComment || !p.editingCommentText.trim()} className="h-9 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0">
                              {p.isUpdatingComment ? 'Validation...' : 'Valider'}
                            </Button>
                            <Button type="button" variant="outline" onClick={p.resetCommentEditor} className="h-9 border-white/20 bg-white/5 text-white/80 hover:bg-white/10">Annuler</Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-white/80 text-sm">{c.comment}</p>
                          <p className="text-white/30 text-[10px] mt-1">{new Date(c.createdAt).toLocaleDateString('fr-FR')}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}
    </DialogContent>
  </Dialog>
);

export default ProductCommentsModal;
