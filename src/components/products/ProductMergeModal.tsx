/**
 * ProductMergeModal - Modale de fusion de plusieurs produits en un seul.
 *
 * Flux:
 *  1. L'utilisateur sélectionne 2 produits ou plus.
 *  2. Pour chaque champ (description, prix, quantité, fournisseur, photos), il
 *     choisit parmi les valeurs existantes ou saisit/upload de nouvelles.
 *     - La quantité par défaut = somme des quantités sélectionnées.
 *  3. À l'enregistrement, un nouveau produit est créé et tous les produits
 *     sources sont supprimés via POST /api/products/merge.
 */

import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Merge, Search, X, Star, ImageOff } from 'lucide-react';
import { Product } from '@/types';

interface ProductMergeModalProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  onMerged: () => void;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

const getPhotoUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob') || url.startsWith('data:')) return url;
  return `${BASE_URL}${url}`;
};

const ProductMergeModal: React.FC<ProductMergeModalProps> = ({ open, onClose, products, onMerged }) => {
  const { toast } = useToast();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [description, setDescription] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [fournisseur, setFournisseur] = useState('');
  const [keptPhotos, setKeptPhotos] = useState<string[]>([]); // URLs existantes conservées
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedIds([]);
      setSearch('');
      setDescription('');
      setPurchasePrice('');
      setQuantity('');
      setFournisseur('');
      setKeptPhotos([]);
      setNewFiles([]);
      setMainPhotoIndex(0);
    }
  }, [open]);

  const selectedProducts = useMemo(
    () => products.filter(p => selectedIds.includes(p.id)),
    [products, selectedIds]
  );

  // Pré-remplir avec valeurs du premier sélectionné + somme quantités
  useEffect(() => {
    if (selectedProducts.length > 0 && !description) {
      const first = selectedProducts[0];
      setDescription(first.description);
      setPurchasePrice(String(first.purchasePrice));
      setFournisseur(first.fournisseur || '');
      const sumQty = selectedProducts.reduce((acc, p) => acc + (p.quantity || 0), 0);
      setQuantity(String(sumQty));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds.length]);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(p =>
      p.description.toLowerCase().includes(q) ||
      (p.code && p.code.toLowerCase().includes(q))
    );
  }, [products, search]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const candidateDescriptions = useMemo(
    () => Array.from(new Set(selectedProducts.map(p => p.description).filter(Boolean))),
    [selectedProducts]
  );

  const candidatePrices = useMemo(
    () => Array.from(new Set(selectedProducts.map(p => p.purchasePrice).filter(v => v !== undefined))),
    [selectedProducts]
  );

  const candidateFournisseurs = useMemo(
    () => Array.from(new Set(selectedProducts.map(p => p.fournisseur).filter(Boolean) as string[])),
    [selectedProducts]
  );

  const candidatePhotos = useMemo(() => {
    const set = new Set<string>();
    selectedProducts.forEach(p => {
      (p.photos || []).forEach(ph => set.add(ph));
      if (p.mainPhoto) set.add(p.mainPhoto);
    });
    return Array.from(set);
  }, [selectedProducts]);

  const togglePhoto = (url: string) => {
    setKeptPhotos(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewFiles(prev => [...prev, ...files].slice(0, 6));
    e.target.value = '';
  };

  const removeNewFile = (i: number) => {
    setNewFiles(prev => prev.filter((_, idx) => idx !== i));
  };

  const allPhotoCount = keptPhotos.length + newFiles.length;

  const handleMerge = async () => {
    if (selectedIds.length < 2) {
      toast({ title: 'Erreur', description: 'Sélectionnez au moins 2 produits', variant: 'destructive' });
      return;
    }
    if (!description.trim() || !purchasePrice || Number(purchasePrice) <= 0 || quantity === '' || Number(quantity) < 0) {
      toast({ title: 'Erreur', description: 'Description, prix et quantité requis', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('sourceIds', JSON.stringify(selectedIds));
      fd.append('description', description.trim());
      fd.append('purchasePrice', String(Number(purchasePrice)));
      fd.append('quantity', String(Number(quantity)));
      if (fournisseur.trim()) fd.append('fournisseur', fournisseur.trim());
      fd.append('keptPhotos', JSON.stringify(keptPhotos));
      fd.append('mainPhotoIndex', String(Math.min(mainPhotoIndex, Math.max(0, allPhotoCount - 1))));
      newFiles.forEach(f => fd.append('photos', f));

      await axios.post(`${BASE_URL}/api/products/merge`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });

      toast({ title: 'Succès', description: `${selectedIds.length} produits fusionnés en 1`, className: 'notification-success' });
      onMerged();
      onClose();
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.response?.data?.message || 'Erreur lors de la fusion', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            <Merge className="w-6 h-6 text-orange-500" />
            Fusionner des produits
          </DialogTitle>
          <DialogDescription>
            Sélectionnez 2 produits ou plus à fusionner. Les produits sélectionnés seront remplacés par un seul nouveau produit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* 1. Sélection */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">1. Produits à fusionner ({selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''})</Label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
              {filteredProducts.length === 0 && (
                <div className="p-3 text-sm text-muted-foreground text-center">Aucun produit</div>
              )}
              {filteredProducts.map(p => (
                <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 cursor-pointer">
                  <Checkbox checked={selectedIds.includes(p.id)} onCheckedChange={() => toggleSelect(p.id)} />
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {p.mainPhoto || p.photos?.[0] ? (
                      <img src={getPhotoUrl(p.mainPhoto || p.photos![0])} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><ImageOff className="w-4 h-4 text-muted-foreground" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{p.description}</div>
                    <div className="text-xs text-muted-foreground">{p.code} · {p.purchasePrice}€ · Qté: {p.quantity}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {selectedIds.length >= 2 && (
            <>
              {/* 2. Description */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">2. Description</Label>
                <div className="flex flex-wrap gap-2">
                  {candidateDescriptions.map(d => (
                    <Button key={d} type="button" variant={description === d ? 'default' : 'outline'} size="sm" onClick={() => setDescription(d)}>
                      {d}
                    </Button>
                  ))}
                </div>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Ou saisir une nouvelle description" rows={2} />
              </div>

              {/* 3. Prix + Quantité */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">3. Prix d'achat (€)</Label>
                  <div className="flex flex-wrap gap-1">
                    {candidatePrices.map(pr => (
                      <Button key={pr} type="button" variant={Number(purchasePrice) === pr ? 'default' : 'outline'} size="sm" onClick={() => setPurchasePrice(String(pr))}>
                        {pr}€
                      </Button>
                    ))}
                  </div>
                  <Input type="number" min={0} step="0.01" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">4. Quantité (somme par défaut)</Label>
                  <Input type="number" min={0} value={quantity} onChange={e => setQuantity(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Total: {selectedProducts.reduce((a, p) => a + (p.quantity || 0), 0)}</p>
                </div>
              </div>

              {/* 5. Fournisseur */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">5. Fournisseur</Label>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant={fournisseur === '' ? 'default' : 'outline'} size="sm" onClick={() => setFournisseur('')}>Aucun</Button>
                  {candidateFournisseurs.map(f => (
                    <Button key={f} type="button" variant={fournisseur === f ? 'default' : 'outline'} size="sm" onClick={() => setFournisseur(f)}>
                      {f}
                    </Button>
                  ))}
                </div>
                <Input value={fournisseur} onChange={e => setFournisseur(e.target.value)} placeholder="Ou saisir un nouveau fournisseur" />
              </div>

              {/* 6. Photos */}
              {(candidatePhotos.length > 0 || true) && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">6. Photos (cliquer pour conserver, étoile = principale)</Label>
                  {candidatePhotos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {candidatePhotos.map((url, idx) => {
                        const kept = keptPhotos.includes(url);
                        const isMain = kept && keptPhotos.indexOf(url) === mainPhotoIndex;
                        return (
                          <div key={url} className="relative">
                            <button
                              type="button"
                              onClick={() => togglePhoto(url)}
                              className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition ${kept ? 'border-orange-500 ring-2 ring-orange-300' : 'border-muted opacity-50 hover:opacity-100'}`}
                            >
                              <img src={getPhotoUrl(url)} alt="" className="w-full h-full object-cover" />
                            </button>
                            {kept && (
                              <button
                                type="button"
                                onClick={() => setMainPhotoIndex(keptPhotos.indexOf(url))}
                                className={`absolute top-1 right-1 p-1 rounded-full ${isMain ? 'bg-yellow-400' : 'bg-white/80'}`}
                              >
                                <Star className={`w-3 h-3 ${isMain ? 'text-white fill-white' : 'text-gray-600'}`} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
                      <span className="inline-flex items-center px-3 py-1.5 rounded-md border text-xs font-medium hover:bg-muted">+ Nouvelles photos</span>
                    </label>
                    {newFiles.map((f, i) => (
                      <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border">
                        <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeNewFile(i)} className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Annuler</Button>
          <Button
            onClick={handleMerge}
            disabled={isSubmitting || selectedIds.length < 2}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
          >
            <Merge className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Fusion...' : `Fusionner ${selectedIds.length} produits`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductMergeModal;
