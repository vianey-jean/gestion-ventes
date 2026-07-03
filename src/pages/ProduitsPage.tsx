/**
 * ProduitsPage.tsx - Page de gestion des produits
 * 
 * CRUD complet avec gestion du stock, recherche, filtrage, commentaires et upload d'images.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import ProduitsHero from '@/pages/produits/ProduitsHero';
import { useApp } from '@/contexts/AppContext';
import { productService } from '@/service/api';
import { productApiService } from '@/services/api/productApi';
import { Product } from '@/types';
import { fournisseurApiService } from '@/services/api/fournisseurApi';
import FournisseurAutocomplete from '@/components/dashboard/FournisseurAutocomplete';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Package, Plus, Search, Filter, Eye, Edit, Trash2, CheckCircle2, XCircle,
  AlertTriangle, Camera, Star, Euro, Hash, Sparkles, ChevronLeft, ChevronRight,
  X, PackagePlus, Pencil, ImageOff, ShoppingBag, MessageSquare, ChevronDown, ChevronUp,
  ArrowUp, ArrowDown, Merge, LineChart as LineChartIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import SharedPagination from '@/components/shared/Pagination';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import PhotoUploadSection from '@/components/dashboard/PhotoUploadSection';
import EditProductForm from '@/components/dashboard/EditProductForm';
import SEOHead from '@/components/SEOHead';
import ProductCommentScroller from '@/components/products/ProductCommentScroller';
import { productCommentsApi, ProductComment, ProductRatingInfo } from '@/services/api/productCommentsApi';
import { clientApiService } from '@/services/api/clientApi';
import { Client } from '@/types/client';
import { User } from 'lucide-react';
import ProductCharacteristicCard from '@/components/products/ProductCharacteristicCard';
import CaracteristiqueModal from '@/components/products/CaracteristiqueModal';
import ProductMergeModal from '@/components/products/ProductMergeModal';
import ProductsVenduModal from '@/components/products/ProductsVenduModal';
import PrixHistoryModal from '@/components/products/PrixHistoryModal';
import ProduitsToolbar from '@/pages/produits/ProduitsToolbar';
import ProduitsFiltersStats from '@/pages/produits/ProduitsFiltersStats';
import AchatVenteSubModals from '@/pages/produits/AchatVenteSubModals';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';

type FilterType = 'tous' | 'perruque' | 'tissage' | 'extension' | 'autres';

const ProduitsPage: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { products, fetchProducts } = useApp();
  const { toast } = useToast();

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('tous');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isAddConfirmOpen, setIsAddConfirmOpen] = useState(false);
  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false);
  const [isCaracteristiqueOpen, setIsCaracteristiqueOpen] = useState(false);
  const [caracteristiqueProduct, setCaracteristiqueProduct] = useState<Product | null>(null);
  const [isMergeOpen, setIsMergeOpen] = useState(false);
  const [isVenduOpen, setIsVenduOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFournHistoryOpen, setIsFournHistoryOpen] = useState(false);
  const [isPrixHistoryOpen, setIsPrixHistoryOpen] = useState(false);

  // Selected product
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // 🆕 État local pour éviter les doubles clics sur le toggle de disponibilité d'achat
  const [togglingAchatIndex, setTogglingAchatIndex] = useState<number | null>(null);

  // 🆕 Sous-modales pour voir/modifier/supprimer un achat ou une vente précis
  const [achatViewIndex, setAchatViewIndex] = useState<number | null>(null);
  const [achatEditIndex, setAchatEditIndex] = useState<number | null>(null);
  const [achatDeleteIndex, setAchatDeleteIndex] = useState<number | null>(null);
  const [achatEditForm, setAchatEditForm] = useState<{ date: string; quantity: string; purchasePrice: string; fournisseur: string; disponible: boolean }>({ date: '', quantity: '', purchasePrice: '', fournisseur: '', disponible: true });
  const [achatSaving, setAchatSaving] = useState(false);
  const [achatDeleting, setAchatDeleting] = useState(false);

  const [venteViewIndex, setVenteViewIndex] = useState<number | null>(null);
  const [venteEditIndex, setVenteEditIndex] = useState<number | null>(null);
  const [venteDeleteIndex, setVenteDeleteIndex] = useState<number | null>(null);
  const [venteEditForm, setVenteEditForm] = useState<{ date: string; quantity: string; sellingPrice: string }>({ date: '', quantity: '', sellingPrice: '' });
  const [venteSaving, setVenteSaving] = useState(false);
  const [venteDeleting, setVenteDeleting] = useState(false);

  const openAchatEdit = useCallback((i: number) => {
    if (!selectedProduct?.achats?.[i]) return;
    const a = selectedProduct.achats[i];
    setAchatEditForm({
      date: (a.date || '').slice(0, 10),
      quantity: String(a.quantity ?? ''),
      purchasePrice: String(a.purchasePrice ?? ''),
      fournisseur: a.fournisseur || '',
      disponible: a.disponible !== false,
    });
    setAchatEditIndex(i);
  }, [selectedProduct]);

  const openVenteEdit = useCallback((i: number) => {
    if (!selectedProduct?.ventes?.[i]) return;
    const v = selectedProduct.ventes[i];
    setVenteEditForm({
      date: (v.date || '').slice(0, 10),
      quantity: String(v.quantity ?? ''),
      sellingPrice: String(v.sellingPrice ?? ''),
    });
    setVenteEditIndex(i);
  }, [selectedProduct]);

  const handleSaveAchat = useCallback(async () => {
    if (!selectedProduct || achatEditIndex === null) return;
    try {
      setAchatSaving(true);
      // Auto-create fournisseur si nouveau
      if (achatEditForm.fournisseur.trim()) {
        try { await fournisseurApiService.create(achatEditForm.fournisseur.trim()); } catch (e) { console.error('Fournisseur create error:', e); }
      }
      const updated = await productApiService.updateAchat(selectedProduct.id, achatEditIndex, {
        date: achatEditForm.date,
        quantity: Number(achatEditForm.quantity) || 0,
        purchasePrice: Number(achatEditForm.purchasePrice) || 0,
        fournisseur: achatEditForm.fournisseur.trim(),
        disponible: achatEditForm.disponible,
      });
      setSelectedProduct(updated);
      await fetchProducts();
      toast({ title: 'Achat modifié', description: 'Les changements sont enregistrés.' });
      setAchatEditIndex(null);
    } catch (e) {
      console.error(e);
      toast({ title: 'Erreur', description: "Impossible de modifier l'achat.", variant: 'destructive' });
    } finally {
      setAchatSaving(false);
    }
  }, [selectedProduct, achatEditIndex, achatEditForm, fetchProducts, toast]);

  const handleDeleteAchat = useCallback(async () => {
    if (!selectedProduct || achatDeleteIndex === null) return;
    try {
      setAchatDeleting(true);
      const updated = await productApiService.deleteAchat(selectedProduct.id, achatDeleteIndex);
      setSelectedProduct(updated);
      await fetchProducts();
      toast({ title: 'Achat supprimé' });
      setAchatDeleteIndex(null);
    } catch (e) {
      console.error(e);
      toast({ title: 'Erreur', description: "Impossible de supprimer l'achat.", variant: 'destructive' });
    } finally {
      setAchatDeleting(false);
    }
  }, [selectedProduct, achatDeleteIndex, fetchProducts, toast]);

  const handleSaveVente = useCallback(async () => {
    if (!selectedProduct || venteEditIndex === null) return;
    try {
      setVenteSaving(true);
      const updated = await productApiService.updateVente(selectedProduct.id, venteEditIndex, {
        date: venteEditForm.date,
        quantity: Number(venteEditForm.quantity) || 0,
        sellingPrice: Number(venteEditForm.sellingPrice) || 0,
      });
      setSelectedProduct(updated);
      await fetchProducts();
      toast({ title: 'Vente modifiée' });
      setVenteEditIndex(null);
    } catch (e) {
      console.error(e);
      toast({ title: 'Erreur', description: 'Impossible de modifier la vente.', variant: 'destructive' });
    } finally {
      setVenteSaving(false);
    }
  }, [selectedProduct, venteEditIndex, venteEditForm, fetchProducts, toast]);

  const handleDeleteVente = useCallback(async () => {
    if (!selectedProduct || venteDeleteIndex === null) return;
    try {
      setVenteDeleting(true);
      const updated = await productApiService.deleteVente(selectedProduct.id, venteDeleteIndex);
      setSelectedProduct(updated);
      await fetchProducts();
      toast({ title: 'Vente supprimée' });
      setVenteDeleteIndex(null);
    } catch (e) {
      console.error(e);
      toast({ title: 'Erreur', description: 'Impossible de supprimer la vente.', variant: 'destructive' });
    } finally {
      setVenteDeleting(false);
    }
  }, [selectedProduct, venteDeleteIndex, fetchProducts, toast]);

  // 🆕 Toggle la disponibilité d'un achat. Met à jour products.json côté serveur
  // puis rafraîchit le selectedProduct localement pour un retour visuel immédiat.
  const handleToggleAchatDispo = useCallback(async (achatIndex: number, nextDispo: boolean) => {
    if (!selectedProduct) return;
    try {
      setTogglingAchatIndex(achatIndex);
      const updated = await productApiService.setAchatDisponibilite(selectedProduct.id, achatIndex, nextDispo);
      setSelectedProduct(updated);
      await fetchProducts();
      toast({
        title: nextDispo ? 'Achat marqué disponible' : 'Achat marqué indisponible',
        description: nextDispo
          ? `+${updated.achats?.[achatIndex]?.quantity || 0} unités ajoutées au stock vendable.`
          : `Quantité retirée du stock vendable.`,
      });
    } catch (e) {
      console.error('Erreur toggle disponibilité achat:', e);
      toast({
        title: 'Erreur',
        description: "Impossible de modifier la disponibilité de cet achat.",
        variant: 'destructive',
      });
    } finally {
      setTogglingAchatIndex(null);
    }
  }, [selectedProduct, fetchProducts, toast]);


  // Helper: aujourd'hui au format YYYY-MM-DD pour <input type="date">
  const todayISO = () => new Date().toISOString().slice(0, 10);

  // Add form
  const [addForm, setAddForm] = useState({ description: '', purchasePrice: '', quantity: '', fournisseur: '', dateAchat: todayISO() });
  const [addPhotos, setAddPhotos] = useState<{ files: File[]; existingUrls: string[]; mainIndex: number }>({ files: [], existingUrls: [], mainIndex: 0 });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  // Edit form
  const [editForm, setEditForm] = useState({ description: '', purchasePrice: 0, quantity: 0, additionalQuantity: 0, fournisseur: '', purchaseDate: todayISO() });
  const [editPhotos, setEditPhotos] = useState<{ files: File[]; existingUrls: string[]; mainIndex: number }>({ files: [], existingUrls: [], mainIndex: 0 });

  // Loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Slideshow
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Tri (sorting)
  type SortField = 'description' | 'purchasePrice' | 'quantity' | 'notation';
  type SortDir = 'asc' | 'desc';
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  // Comments & Ratings
  const [allRatings, setAllRatings] = useState<Record<string, ProductRatingInfo>>({});
  const [viewComments, setViewComments] = useState<ProductComment[]>([]);
  const [showCommentsList, setShowCommentsList] = useState(false);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentClientName, setCommentClientName] = useState('');
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [clientSearchResults, setClientSearchResults] = useState<Client[]>([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [selectedCommentIds, setSelectedCommentIds] = useState<string[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [editingCommentRating, setEditingCommentRating] = useState(5);
  const [editingCommentClientName, setEditingCommentClientName] = useState('');
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);
  const [isDeletingComments, setIsDeletingComments] = useState(false);

  // Fetch all ratings
  const fetchRatings = useCallback(async () => {
    try {
      const data = await productCommentsApi.getAllRatings();
      setAllRatings(data && typeof data === 'object' && !Array.isArray(data) ? data : {});
    } catch (e) {
      console.error('Error fetching ratings:', e);
    }
  }, []);

  const resetCommentEditor = useCallback(() => {
    setEditingCommentId(null);
    setEditingCommentText('');
    setEditingCommentRating(5);
    setEditingCommentClientName('');
  }, []);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (activeFilter !== 'tous') {
      filtered = filtered.filter(p => {
        const desc = p.description.toLowerCase();
        switch (activeFilter) {
          case 'perruque': return desc.includes('perruque');
          case 'tissage': return desc.includes('tissage');
          case 'extension': return desc.includes('extension');
          case 'autres': return !desc.includes('perruque') && !desc.includes('tissage') && !desc.includes('extension');
          default: return true;
        }
      });
    }

    if (searchQuery.length >= 3) {
      filtered = filtered.filter(p =>
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.code && p.code.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Tri
    if (sortField) {
      filtered.sort((a, b) => {
        let cmp = 0;
        switch (sortField) {
          case 'description':
            cmp = a.description.localeCompare(b.description, 'fr');
            break;
          case 'purchasePrice':
            cmp = (a.purchasePrice || 0) - (b.purchasePrice || 0);
            break;
          case 'quantity':
            cmp = (a.quantity || 0) - (b.quantity || 0);
            break;
          case 'notation': {
            const avgA = allRatings[a.id]?.average || 0;
            const avgB = allRatings[b.id]?.average || 0;
            cmp = avgA - avgB;
            break;
          }
        }
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return filtered;
  }, [products, activeFilter, searchQuery, sortField, sortDir, allRatings]);

  // Reset page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Search results for quick search
  const searchResults = useMemo(() => {
    if (searchQuery.length < 3) return [];
    return products.filter(p =>
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.code && p.code.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 8);
  }, [products, searchQuery]);

  // Photo URL helper
  const getPhotoUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob') || url.startsWith('data:')) return url;
    return `${BASE_URL}${url}`;
  };

  // Slideshow auto-advance
  useEffect(() => {
    if (!isViewOpen || !selectedProduct) return;
    const photos = selectedProduct.photos || [];
    if (photos.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentPhotoIndex(prev => (prev + 1) % photos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isViewOpen, selectedProduct]);

  // ===== ADD =====
  const handleAddSubmit = () => {
    const errors: Record<string, string> = {};
    if (!addForm.description) errors.description = 'Description requise';
    if (!addForm.purchasePrice || Number(addForm.purchasePrice) <= 0) errors.purchasePrice = 'Prix valide requis';
    if (!addForm.quantity || Number(addForm.quantity) < 0) errors.quantity = 'Quantité valide requise';
    if (Object.keys(errors).length > 0) { setAddErrors(errors); return; }
    setAddErrors({});
    setIsAddConfirmOpen(true);
  };

  const confirmAdd = async () => {
    setIsSubmitting(true);
    try {
      // Auto-create fournisseur if new
      if (addForm.fournisseur.trim()) {
        try { await fournisseurApiService.create(addForm.fournisseur.trim()); } catch (e) { console.error('Fournisseur create error:', e); }
      }

      const newProduct = await productService.addProduct({
        description: addForm.description,
        purchasePrice: Number(addForm.purchasePrice),
        quantity: Number(addForm.quantity),
        fournisseur: addForm.fournisseur.trim() || undefined,
        dateAchat: addForm.dateAchat || todayISO(),
      });

      if (newProduct && addPhotos.files.length > 0) {
        await productService.uploadProductPhotos(newProduct.id, addPhotos.files, addPhotos.mainIndex);
      }

      toast({ title: 'Succès', description: 'Produit ajouté avec succès', className: 'notification-success' });
      setIsAddConfirmOpen(false);
      setIsAddOpen(false);
      setAddForm({ description: '', purchasePrice: '', quantity: '', fournisseur: '', dateAchat: todayISO() });
      setAddPhotos({ files: [], existingUrls: [], mainIndex: 0 });
      if (fetchProducts) await fetchProducts();
    } catch {
      toast({ title: 'Erreur', description: "Erreur lors de l'ajout", variant: 'destructive', className: 'notification-erreur' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== EDIT =====
  const openEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditForm({
      description: product.description,
      purchasePrice: product.purchasePrice,
      quantity: product.quantity,
      additionalQuantity: 0,
      fournisseur: product.fournisseur || '',
      purchaseDate: todayISO(),
    });
    setEditPhotos({ files: [], existingUrls: product.photos || [], mainIndex: 0 });
    setIsEditOpen(true);
  };

  const handleEditSubmit = () => {
    if (!selectedProduct) return;
    setIsEditConfirmOpen(true);
  };

  const confirmEdit = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      // Auto-create fournisseur if new
      if (editForm.fournisseur.trim()) {
        try { await fournisseurApiService.create(editForm.fournisseur.trim()); } catch (e) { console.error('Fournisseur create error:', e); }
      }

      const addQty = Number(editForm.additionalQuantity) || 0;
      const updatePayload: any = {
        ...selectedProduct,
        description: editForm.description,
        purchasePrice: editForm.purchasePrice,
        quantity: editForm.quantity + addQty,
        fournisseur: editForm.fournisseur.trim() || undefined,
      };
      if (addQty > 0) {
        updatePayload.newPurchase = {
          date: editForm.purchaseDate || todayISO(),
          quantity: addQty,
          purchasePrice: editForm.purchasePrice,
        };
      }
      await productService.updateProduct(updatePayload);

      const hasNewPhotos = editPhotos.files.length > 0;
      const existingPhotosChanged = JSON.stringify(editPhotos.existingUrls) !== JSON.stringify(selectedProduct.photos || []);
      if (hasNewPhotos || existingPhotosChanged) {
        await productService.replaceProductPhotos(selectedProduct.id, editPhotos.files, editPhotos.existingUrls, editPhotos.mainIndex);
      }

      toast({ title: 'Succès', description: 'Produit modifié avec succès', className: 'notification-success' });
      setIsEditConfirmOpen(false);
      setIsEditOpen(false);
      if (fetchProducts) await fetchProducts();
    } catch {
      toast({ title: 'Erreur', description: 'Erreur lors de la modification', variant: 'destructive', className: 'notification-erreur' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== DELETE =====
  const openDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      // Delete all comments for this product first
      try {
        await productCommentsApi.deleteByProductId(selectedProduct.id);
      } catch (e) {
        console.error('Error deleting product comments:', e);
      }
      await productService.deleteProduct(selectedProduct.id);
      toast({ title: 'Succès', description: `"${selectedProduct.description}" supprimé avec tous ses commentaires`, className: 'notification-success' });
      setIsDeleteConfirmOpen(false);
      setSelectedProduct(null);
      if (fetchProducts) await fetchProducts();
      await fetchRatings();
    } catch {
      toast({ title: 'Erreur', description: 'Erreur lors de la suppression', variant: 'destructive', className: 'notification-erreur' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== VIEW =====
  const openView = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPhotoIndex(0);
    setShowCommentsList(false);
    setSelectedCommentIds([]);
    resetCommentEditor();
    setIsViewOpen(true);
  };

  const startEditingComment = (comment: ProductComment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.comment);
    setEditingCommentRating(comment.rating);
    setEditingCommentClientName(comment.clientName || '');
  };

  const toggleCommentSelection = (commentId: string, checked: boolean) => {
    setSelectedCommentIds(prev => checked ? [...prev, commentId] : prev.filter(id => id !== commentId));
  };

  const handleSaveCommentEdit = async () => {
    if (!editingCommentId || !editingCommentText.trim()) return;

    setIsUpdatingComment(true);
    try {
      await productCommentsApi.update(editingCommentId, {
        comment: editingCommentText.trim(),
        rating: editingCommentRating,
        clientName: editingCommentClientName.trim(),
      });
      await fetchRatings();
      resetCommentEditor();
      toast({ title: 'Succès', description: 'Commentaire modifié', className: 'notification-success' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de modifier ce commentaire', variant: 'destructive', className: 'notification-erreur' });
    } finally {
      setIsUpdatingComment(false);
    }
  };

  const handleDeleteComments = async (ids: string[]) => {
    if (ids.length === 0) return;
    const confirmed = window.confirm(ids.length === 1 ? 'Supprimer ce commentaire ?' : `Supprimer ${ids.length} commentaires ?`);
    if (!confirmed) return;

    setIsDeletingComments(true);
    try {
      if (ids.length === 1) {
        await productCommentsApi.delete(ids[0]);
      } else {
        await productCommentsApi.deleteMany(ids);
      }

      await fetchRatings();
      setSelectedCommentIds(prev => prev.filter(id => !ids.includes(id)));
      if (editingCommentId && ids.includes(editingCommentId)) {
        resetCommentEditor();
      }

      toast({ title: 'Succès', description: ids.length === 1 ? 'Commentaire supprimé' : `${ids.length} commentaires supprimés`, className: 'notification-success' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de supprimer le(s) commentaire(s)', variant: 'destructive', className: 'notification-erreur' });
    } finally {
      setIsDeletingComments(false);
    }
  };

  const filters: { key: FilterType; label: string; icon: React.ReactNode }[] = [
    { key: 'tous', label: 'Tous', icon: <Package className="h-3.5 w-3.5" /> },
    { key: 'perruque', label: 'Perruques', icon: <Sparkles className="h-3.5 w-3.5" /> },
    { key: 'tissage', label: 'Tissages', icon: <Star className="h-3.5 w-3.5" /> },
    { key: 'extension', label: 'Extensions', icon: <ShoppingBag className="h-3.5 w-3.5" /> },
    { key: 'autres', label: 'Autres', icon: <Filter className="h-3.5 w-3.5" /> },
  ];

  const content = (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/20 dark:from-[#030014] dark:via-[#0a0025] dark:to-[#0e0030]">
      <SEOHead title="Produits" description="Gestion des produits - Inventaire et catalogue" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/20 dark:from-[#030014] dark:via-[#0a0025] dark:to-[#0e0030]">
        {/* Hero */}
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 pt-4 md:pt-6">
          <ProduitsHero onAdd={() => setIsAddOpen(true)} />
        </div>

        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 pb-12 space-y-6">
          {/* Search + Action buttons */}
          <ProduitsToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setShowSearchResults={setShowSearchResults}
            onAdd={() => setIsAddOpen(true)}
            onEdit={() => setIsEditProductOpen(true)}
            onVendu={() => setIsVenduOpen(true)}
            onMerge={() => setIsMergeOpen(true)}
          />

          {/* Filters + Stats */}
          <ProduitsFiltersStats
            products={products}
            filters={filters}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />

          {/* Products Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-3xl border border-violet-200/20 dark:border-violet-800/20 overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-white/5 shadow-2xl shadow-violet-500/5"
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 border-b border-violet-200/20 dark:border-violet-800/20">
                    <TableHead className="font-black text-violet-700 dark:text-violet-300">Photo</TableHead>
                    <TableHead className="font-black text-violet-700 dark:text-violet-300">Code</TableHead>
                    <TableHead className="font-black text-violet-700 dark:text-violet-300">
                      <button onClick={() => handleSort('description')} className="flex items-center gap-1 hover:opacity-70 transition-opacity">
                        Description
                        <span className="flex flex-col">
                          <ArrowUp className={cn("h-3 w-3", sortField === 'description' && sortDir === 'asc' ? 'text-violet-500' : 'text-violet-300/40')} />
                          <ArrowDown className={cn("h-3 w-3 -mt-1", sortField === 'description' && sortDir === 'desc' ? 'text-violet-500' : 'text-violet-300/40')} />
                        </span>
                      </button>
                    </TableHead>
                    <TableHead className="font-black text-violet-700 dark:text-violet-300">
                      <button onClick={() => handleSort('purchasePrice')} className="flex items-center gap-1 hover:opacity-70 transition-opacity">
                        Prix
                        <span className="flex flex-col">
                          <ArrowUp className={cn("h-3 w-3", sortField === 'purchasePrice' && sortDir === 'asc' ? 'text-violet-500' : 'text-violet-300/40')} />
                          <ArrowDown className={cn("h-3 w-3 -mt-1", sortField === 'purchasePrice' && sortDir === 'desc' ? 'text-violet-500' : 'text-violet-300/40')} />
                        </span>
                      </button>
                    </TableHead>
                    <TableHead className="font-black text-violet-700 dark:text-violet-300">
                      <button onClick={() => handleSort('quantity')} className="flex items-center gap-1 hover:opacity-70 transition-opacity">
                        Qté
                        <span className="flex flex-col">
                          <ArrowUp className={cn("h-3 w-3", sortField === 'quantity' && sortDir === 'asc' ? 'text-violet-500' : 'text-violet-300/40')} />
                          <ArrowDown className={cn("h-3 w-3 -mt-1", sortField === 'quantity' && sortDir === 'desc' ? 'text-violet-500' : 'text-violet-300/40')} />
                        </span>
                      </button>
                    </TableHead>
                    <TableHead className="font-black text-violet-700 dark:text-violet-300">
                      <button onClick={() => handleSort('notation')} className="flex items-center gap-1 hover:opacity-70 transition-opacity">
                        Notation
                        <span className="flex flex-col">
                          <ArrowUp className={cn("h-3 w-3", sortField === 'notation' && sortDir === 'asc' ? 'text-violet-500' : 'text-violet-300/40')} />
                          <ArrowDown className={cn("h-3 w-3 -mt-1", sortField === 'notation' && sortDir === 'desc' ? 'text-violet-500' : 'text-violet-300/40')} />
                        </span>
                      </button>
                    </TableHead>
                    <TableHead className="font-black text-violet-700 dark:text-violet-300 text-center">Actions</TableHead>
                    <TableHead className="font-black text-violet-700 dark:text-violet-300 text-center">Caractéristique</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                            <Package className="h-8 w-8 text-violet-400" />
                          </div>
                          <p className="font-bold text-muted-foreground">Aucun produit trouvé</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedProducts.map((product, index) => (
                      <TableRow key={product.id}
                        className="hover:bg-gradient-to-r hover:from-violet-50 hover:to-fuchsia-50 dark:hover:from-violet-900/10 dark:hover:to-fuchsia-900/10 transition-all duration-200 border-b border-violet-100/20 dark:border-violet-800/10"
                      >
                        {/* Photo with eye icon */}
                        <TableCell className="py-1">
                          <div className="relative group cursor-pointer h-full" onClick={() => openView(product)}>
                            <div className={cn("rounded-xl overflow-hidden border-2 border-violet-200/30 dark:border-violet-800/30 shadow-md", allRatings[product.id]?.comments?.length > 0 ? "h-20 min-h-[3rem]" : "h-12")} >
                              {product.mainPhoto || (product.photos && product.photos.length > 0) ? (
                                <img src={getPhotoUrl(product.mainPhoto || product.photos![0])} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                  <ImageOff className="h-5 w-5 text-violet-400" />
                                </div>
                              )}
                            </div>
                            {/* Eye overlay */}
                            <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                              <Eye className="h-5 w-5 text-white drop-shadow-lg" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono text-xs bg-violet-100/80 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                            {product.code || '—'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-foreground min-w-[220px] max-w-[350px]">
                          <div className="flex flex-col gap-1">
                            {allRatings[product.id]?.comments?.length > 0 && (
                              <ProductCommentScroller comments={allRatings[product.id].comments} />
                            )}
                            <span className="break-words whitespace-pre-wrap">{product.description}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-amber-600 dark:text-amber-400">{product.purchasePrice}€</span>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const qty = product.quantity;
                            if (qty === 0) {
                              return (
                                <div className="flex flex-col items-start gap-1">
                                  <Badge
                                    className="font-black border-0 bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/40 px-3 py-1 text-base animate-[stockBlink_5s_ease-in-out_infinite]"
                                  >
                                    <AlertTriangle className="h-3.5 w-3.5 mr-1 animate-[stockBlink_5s_ease-in-out_infinite]" />
                                    0
                                  </Badge>
                                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-red-600 dark:text-red-400 animate-[stockPulse_5s_ease-in-out_infinite]">
                                    <XCircle className="h-3 w-3" />
                                    Stock épuisé
                                  </span>
                                </div>
                              );
                            }
                            if (qty === 1 || qty === 2) {
                              return (
                                <div className="flex flex-col items-start gap-1">
                                  <Badge className="font-bold border-0 bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-md shadow-amber-500/40 px-3 py-1">
                                    {qty}
                                  </Badge>
                                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 animate-[stockPulse_5s_ease-in-out_infinite]">
                                    <AlertTriangle className="h-3 w-3 animate-[stockPulse_5s_ease-in-out_infinite]" />
                                    Stock très bas
                                  </span>
                                </div>
                              );
                            }
                            return (
                              <div className="flex flex-col items-start gap-1">
                                <Badge className="font-bold border-0 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1">
                                  {qty}
                                </Badge>
                                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Stock bon
                                </span>
                              </div>
                            );
                          })()}
                        </TableCell>

                        {/* Notation */}
                        <TableCell>
                          {(() => {
                            const info = allRatings[product.id];
                            if (!info || info.count === 0) return <span className="text-muted-foreground text-xs">—</span>;
                            const avg = info.average;
                            const fullStars = Math.floor(avg);
                            const hasHalf = avg - fullStars >= 0.3;
                            const starColor = avg <= 2 ? 'text-red-500' : avg <= 3 ? 'text-yellow-500' : 'text-emerald-500';
                            return (
                              <div className="flex flex-col items-center gap-0.5">
                                <div className={`flex items-center ${starColor}`}>
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={cn("h-3 w-3", i < fullStars ? "fill-current" : (i === fullStars && hasHalf) ? "fill-current opacity-50" : "opacity-20")} />
                                  ))}
                                </div>
                                <span className="text-[10px] text-muted-foreground font-medium">{avg} ({info.count})</span>
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View */}
                            <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                              onClick={() => openView(product)}
                              className="p-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 transition-all duration-200 backdrop-blur-xl border border-violet-200/20 dark:border-violet-800/20"
                              title="Voir"
                            >
                              <Eye className="h-4 w-4" />
                            </motion.button>
                            {/* Edit */}
                            <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                              onClick={() => openEdit(product)}
                              className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-all duration-200 backdrop-blur-xl border border-blue-200/20 dark:border-blue-800/20"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </motion.button>
                            {/* Delete */}
                            <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                              onClick={() => openDelete(product)}
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all duration-200 backdrop-blur-xl border border-red-200/20 dark:border-red-800/20"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </TableCell>
                        {/* Caractéristique */}
                        <TableCell className="py-2">
                          <div className="flex items-center justify-center gap-2">
                            <ProductCharacteristicCard product={product} variant="compact" />
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => { setCaracteristiqueProduct(product); setIsCaracteristiqueOpen(true); }}
                              className="p-2 rounded-xl bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-400 transition-all duration-200 backdrop-blur-xl border border-fuchsia-200/30 dark:border-fuchsia-800/30"
                              title="Voir caractéristique"
                              type="button"
                            >
                              <Eye className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </motion.div>

          {/* Pagination */}
          <SharedPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredProducts.length}
            itemsPerPage={ITEMS_PER_PAGE}
            showFirstLast={true}
            showItemCount={true}
            siblingCount={1}
          />
        </div>

        {/* ========== ADD MODAL ========== */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
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
              <div className="space-y-2">
                <Label htmlFor="add-desc" className="text-sm font-bold text-white/80 flex items-center gap-2">
                  <Package className="h-4 w-4 text-green-400" /> Description du produit
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
                <Button onClick={handleAddSubmit} disabled={isSubmitting}
                  className="flex-1 h-12 rounded-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 transition-all duration-300 border-0"
                >
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Ajouter au Stock
                </Button>
                <Button variant="outline" onClick={() => { setIsAddOpen(false); setAddPhotos({ files: [], existingUrls: [], mainIndex: 0 }); }}
                  className="flex-1 h-12 rounded-xl font-bold border-2 border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <XCircle className="h-5 w-5 mr-2" /> Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ========== ADD CONFIRM ========== */}
        <AlertDialog open={isAddConfirmOpen} onOpenChange={setIsAddConfirmOpen}>
          <AlertDialogContent className="bg-gradient-to-br from-white via-emerald-50/30 to-green-50/50 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
            <AlertDialogHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30">
                <PackagePlus className="h-8 w-8 text-white" />
              </div>
              <AlertDialogTitle className="text-xl font-black bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                ✨ Confirmer l'ajout
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground font-medium">
                Voulez-vous vraiment ajouter ce produit ?
              </AlertDialogDescription>
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl border-2 border-emerald-100 dark:border-emerald-800/30 text-left space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground text-sm">Produit:</span><span className="font-bold">{addForm.description}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground text-sm">Prix:</span><span className="font-bold text-amber-600">{addForm.purchasePrice}€</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground text-sm">Quantité:</span><span className="font-bold text-blue-600">{addForm.quantity}</span></div>
                {addForm.fournisseur && <div className="flex justify-between"><span className="text-muted-foreground text-sm">Fournisseur:</span><span className="font-bold text-orange-600">{addForm.fournisseur}</span></div>}
                {addPhotos.files.length > 0 && <div className="flex justify-between"><span className="text-muted-foreground text-sm">Photos:</span><span className="font-bold text-purple-600">{addPhotos.files.length}</span></div>}
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-3 pt-4">
              <AlertDialogCancel className="flex-1 rounded-xl border-2 font-bold"><XCircle className="h-5 w-5 mr-2" />Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={confirmAdd} disabled={isSubmitting}
                className="flex-1 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25 border-0"
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />{isSubmitting ? 'Ajout...' : 'Confirmer'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ========== EDIT MODAL ========== */}
        {selectedProduct && (
          <Dialog open={isEditOpen} onOpenChange={(open) => { if (!open) { setIsEditOpen(false); setEditPhotos({ files: [], existingUrls: [], mainIndex: 0 }); } }}>
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
                  <Input value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="bg-white/10 border border-white/20 focus:border-blue-400 rounded-xl text-white placeholder:text-white/40 hover:bg-white/15 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400" /> Prix (€)
                  </Label>
                  <Input type="number" step="0.01" value={editForm.purchasePrice}
                    onChange={(e) => setEditForm({ ...editForm, purchasePrice: parseFloat(e.target.value) || 0 })}
                    className="bg-white/10 border border-white/20 focus:border-yellow-400 rounded-xl text-white placeholder:text-white/40 hover:bg-white/15 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
                    <Hash className="h-4 w-4 text-indigo-400" /> Quantité actuelle: {editForm.quantity}
                  </Label>
                  <Input type="number" value={editForm.additionalQuantity}
                    onChange={(e) => setEditForm({ ...editForm, additionalQuantity: parseInt(e.target.value) || 0 })}
                    placeholder="Ajouter quantité..."
                    className="bg-white/10 border border-white/20 focus:border-indigo-400 rounded-xl text-white placeholder:text-white/40 hover:bg-white/15 transition-all"
                  />
                  <p className="text-sm text-white/50 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-blue-400" /> Quantité finale: <b className="text-white/80">{editForm.quantity + editForm.additionalQuantity}</b>
                  </p>
                </div>
                {editForm.additionalQuantity > 0 && (
                  <div className="space-y-2 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-400/20">
                    <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-400" /> Date du nouvel achat
                    </Label>
                    <Input type="date" value={editForm.purchaseDate}
                      onChange={(e) => setEditForm({ ...editForm, purchaseDate: e.target.value })}
                      className="bg-white/10 border border-white/20 focus:border-emerald-400 rounded-xl text-white placeholder:text-white/40 hover:bg-white/15 transition-all [color-scheme:dark]"
                    />
                    <p className="text-xs text-white/50">Cet achat de <b className="text-emerald-300">+{editForm.additionalQuantity}</b> sera enregistré dans l'historique d'achats du produit.</p>
                  </div>
                )}
                <FournisseurAutocomplete
                  value={editForm.fournisseur}
                  onChange={(val) => setEditForm({ ...editForm, fournisseur: val })}
                  variant="dark"
                />
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <PhotoUploadSection
                    existingPhotos={selectedProduct.photos || []}
                    existingMainPhoto={selectedProduct.mainPhoto}
                    baseUrl={BASE_URL}
                    onPhotosChange={(files, existingUrls, mainIndex) => setEditPhotos({ files, existingUrls, mainIndex })}
                    maxPhotos={6}
                  />
                </div>

                {/* Ajouter Commentaire */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                  <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-purple-400" /> Ajouter un commentaire
                  </Label>

                  {/* Client search */}
                  <div className="relative">
                    <Label className="text-xs font-bold text-white/60 flex items-center gap-1 mb-1">
                      <User className="h-3 w-3" /> Nom du client
                    </Label>
                    <Input
                      value={clientSearchQuery}
                      onChange={async (e) => {
                        const val = e.target.value;
                        setClientSearchQuery(val);
                        setCommentClientName(val);
                        if (val.length >= 3) {
                          try {
                            const clients = await clientApiService.getAll();
                            const filtered = clients.filter(c => c.nom.toLowerCase().includes(val.toLowerCase()));
                            setClientSearchResults(filtered);
                            setShowClientDropdown(true);
                          } catch { setClientSearchResults([]); }
                        } else {
                          setClientSearchResults([]);
                          setShowClientDropdown(false);
                        }
                      }}
                      onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                      placeholder="Rechercher un client (3 car. min.)..."
                      className="bg-white/10 border border-white/20 focus:border-cyan-400 rounded-xl text-white placeholder:text-white/40"
                    />
                    {showClientDropdown && clientSearchResults.length > 0 && (
                      <div className="absolute z-50 top-full mt-1 w-full rounded-xl border border-white/20 bg-slate-900/95 backdrop-blur-2xl shadow-2xl max-h-40 overflow-y-auto">
                        {clientSearchResults.map(client => (
                          <button
                            key={client.id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setCommentClientName(client.nom);
                              setClientSearchQuery(client.nom);
                              setShowClientDropdown(false);
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

                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Votre commentaire sur ce produit..."
                    className="bg-white/10 border border-white/20 focus:border-purple-400 rounded-xl text-white placeholder:text-white/40"
                  />
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-white/60">Notation</Label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button key={s} type="button" onClick={() => setNewRating(s)}
                          className="transition-transform hover:scale-125"
                        >
                          <Star className={cn(
                            "h-6 w-6 transition-colors",
                            s <= newRating
                              ? newRating <= 2 ? "text-red-500 fill-red-500" : newRating <= 3 ? "text-yellow-500 fill-yellow-500" : "text-emerald-500 fill-emerald-500"
                              : "text-white/20"
                          )} />
                        </button>
                      ))}
                      <span className="text-white/60 text-sm ml-2">{newRating}/5</span>
                    </div>
                  </div>
                  <Button
                    onClick={async () => {
                      if (!newComment.trim() || !selectedProduct) return;
                      setIsSubmittingComment(true);
                      try {
                        await productCommentsApi.create({
                          productId: selectedProduct.id,
                          comment: newComment.trim(),
                          rating: newRating,
                          clientName: commentClientName.trim(),
                        });
                        setNewComment('');
                        setNewRating(5);
                        setCommentClientName('');
                        setClientSearchQuery('');
                        await fetchRatings();
                        toast({ title: 'Succès', description: 'Commentaire ajouté', className: 'notification-success' });
                      } catch {
                        toast({ title: 'Erreur', description: "Erreur lors de l'ajout du commentaire", variant: 'destructive', className: 'notification-erreur' });
                      } finally {
                        setIsSubmittingComment(false);
                      }
                    }}
                    disabled={isSubmittingComment || !newComment.trim()}
                    className="w-full h-10 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white border-0"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {isSubmittingComment ? 'Envoi...' : 'Ajouter commentaire'}
                  </Button>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button onClick={handleEditSubmit} disabled={isSubmitting}
                    className="flex-1 h-12 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 transition-all duration-300 border-0"
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    {isSubmitting ? 'Envoi...' : 'Sauvegarder'}
                  </Button>
                  <Button variant="outline" onClick={() => { setIsEditOpen(false); setEditPhotos({ files: [], existingUrls: [], mainIndex: 0 }); }}
                    className="flex-1 h-12 rounded-xl font-bold border-2 border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <XCircle className="h-5 w-5 mr-2" /> Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* ========== EDIT CONFIRM ========== */}
        <AlertDialog open={isEditConfirmOpen} onOpenChange={setIsEditConfirmOpen}>
          <AlertDialogContent className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
            <AlertDialogHeader className="text-center space-y-4">
              <div className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <AlertDialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                Confirmer la modification
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Voulez-vous vraiment modifier ce produit ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-3 pt-4">
              <AlertDialogCancel className="rounded-xl border-2 font-bold">Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={confirmEdit} disabled={isSubmitting}
                className="rounded-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-0"
              >
                {isSubmitting ? 'Modification...' : 'Confirmer'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ========== DELETE CONFIRM ========== */}
        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <AlertDialogContent className="bg-gradient-to-br from-white via-red-50/30 to-rose-50/50 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
            <AlertDialogHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 via-red-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/30 animate-pulse">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <AlertDialogTitle className="text-2xl font-black bg-gradient-to-r from-red-600 via-red-700 to-rose-700 bg-clip-text text-transparent">
                ⚠️ Supprimer ce produit ?
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-2">
                  <p className="font-semibold text-red-600">Vous êtes sur le point de supprimer définitivement :</p>
                  <p className="text-lg font-bold bg-red-100/50 dark:bg-red-900/20 px-4 py-2 rounded-xl">"{selectedProduct?.description}"</p>
                  <p className="text-sm text-red-500 mt-4">⚠️ Cette action est <span className="font-bold">irréversible</span>. Toutes les données et photos seront perdues.</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-3 pt-6">
              <AlertDialogCancel className="flex-1 rounded-xl border-2 font-semibold"><XCircle className="mr-2 h-5 w-5" />Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} disabled={isSubmitting}
                className="flex-1 rounded-xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-rose-600 hover:from-red-600 hover:via-red-700 hover:to-rose-700 text-white border-0 shadow-lg shadow-red-500/30"
              >
                <Trash2 className="mr-2 h-5 w-5" />
                {isSubmitting ? 'Suppression...' : 'Confirmer la suppression'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ========== VIEW MODAL (Photo Slideshow) ========== */}
        {selectedProduct && (
          <Dialog open={isViewOpen} onOpenChange={(open) => {
            setIsViewOpen(open);
            if (!open) {
              setSelectedCommentIds([]);
              resetCommentEditor();
            }
          }}>
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

              {/* Photo slideshow */}
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
                    {/* Navigation arrows */}
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
                    {/* Dots */}
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
                    {/* Counter */}
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur-xl text-white text-xs font-bold border border-white/10">
                      {currentPhotoIndex + 1}/{selectedProduct.photos.length}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Product details */}
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
                      <button
                        type="button"
                        onClick={() => setIsPrixHistoryOpen(true)}
                        title="Voir l'historique des prix"
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
                      <button
                        type="button"
                        onClick={() => setIsHistoryOpen(true)}
                        title="Historique achats/ventes"
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

                {/* Fournisseur */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-white/50 text-xs font-medium">Fournisseur</p>
                      <p className="text-cyan-400 font-bold text-lg">{selectedProduct.fournisseur || '—'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsFournHistoryOpen(true)}
                      title="Historique fournisseurs"
                      className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/20 text-cyan-300 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>



                {/* Commentaires & Notation */}
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
                          <button
                            type="button"
                            onClick={() => setIsCommentsModalOpen(true)}
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


                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <Button onClick={() => { setIsViewOpen(false); openEdit(selectedProduct); }}
                    className="flex-1 h-12 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-0"
                  >
                    <Edit className="h-5 w-5 mr-2" /> Modifier
                  </Button>
                  <Button onClick={() => { setIsViewOpen(false); openDelete(selectedProduct); }}
                    className="flex-1 h-12 rounded-xl font-bold bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25 border-0"
                  >
                    <Trash2 className="h-5 w-5 mr-2" /> Supprimer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* ========== MODALE COMMENTAIRES PRODUIT ========== */}
      <Dialog open={isCommentsModalOpen} onOpenChange={setIsCommentsModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-xl bg-gradient-to-br from-slate-900 via-purple-900/30 to-indigo-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-400" /> Commentaires{selectedProduct ? ` — ${selectedProduct.description}` : ''}
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (() => {
            const info = allRatings[selectedProduct.id];
            const comments = info?.comments || [];
            if (comments.length === 0) {
              return <p className="text-white/60 text-sm p-4 text-center">Aucun commentaire pour ce produit.</p>;
            }
            return (
              <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                {selectedCommentIds.length > 0 && (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                    <span className="text-xs font-bold text-red-200">
                      {selectedCommentIds.length} commentaire{selectedCommentIds.length > 1 ? 's' : ''} sélectionné{selectedCommentIds.length > 1 ? 's' : ''}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" onClick={() => setSelectedCommentIds([])} className="h-8 border-white/20 bg-white/5 text-white/80 hover:bg-white/10">Annuler</Button>
                      <Button type="button" onClick={() => handleDeleteComments(selectedCommentIds)} disabled={isDeletingComments} className="h-8 bg-gradient-to-r from-red-500 to-rose-600 text-white border-0">
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Supprimer
                      </Button>
                    </div>
                  </div>
                )}
                {comments.map(c => {
                  const cColor = c.rating <= 2 ? 'border-red-500/30 bg-red-500/5' : c.rating === 3 ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-emerald-500/30 bg-emerald-500/5';
                  const cStarColor = c.rating <= 2 ? 'text-red-500' : c.rating === 3 ? 'text-yellow-500' : 'text-emerald-500';
                  const isEditing = editingCommentId === c.id;
                  return (
                    <div key={c.id} className={`p-3 rounded-xl border ${cColor}`}>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedCommentIds.includes(c.id)}
                          onCheckedChange={(checked) => toggleCommentSelection(c.id, checked === true)}
                          className="mt-1 border-white/30 data-[state=checked]:bg-red-500 data-[state=checked]:text-white"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <div>
                              <div className={`flex items-center gap-1 ${isEditing ? (editingCommentRating <= 2 ? 'text-red-500' : editingCommentRating === 3 ? 'text-yellow-500' : 'text-emerald-500') : cStarColor}`}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <button key={i} type="button" onClick={() => isEditing && setEditingCommentRating(i + 1)} className={isEditing ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}>
                                    <Star className={cn('h-3 w-3', i < (isEditing ? editingCommentRating : c.rating) ? 'fill-current' : 'opacity-20')} />
                                  </button>
                                ))}
                              </div>
                              {(isEditing ? editingCommentClientName : c.clientName) && (
                                <span className="text-cyan-400 text-xs font-bold flex items-center gap-1 mt-1">
                                  <User className="h-3 w-3" /> {isEditing ? editingCommentClientName : c.clientName}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button type="button" onClick={() => startEditingComment(c)} className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-1.5 text-blue-300 transition-colors hover:bg-blue-500/20" title="Modifier le commentaire">
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button type="button" onClick={() => handleDeleteComments([c.id])} className="rounded-lg border border-red-500/20 bg-red-500/10 p-1.5 text-red-300 transition-colors hover:bg-red-500/20" title="Supprimer le commentaire">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          {isEditing ? (
                            <div className="space-y-2">
                              <Input value={editingCommentClientName} onChange={(e) => setEditingCommentClientName(e.target.value)} placeholder="Nom du client" className="bg-white/10 border border-white/20 focus:border-cyan-400 rounded-xl text-white placeholder:text-white/40" />
                              <Textarea value={editingCommentText} onChange={(e) => setEditingCommentText(e.target.value)} placeholder="Modifier le commentaire..." className="min-h-[96px] bg-white/10 border border-white/20 focus:border-purple-400 rounded-xl text-white placeholder:text-white/40" />
                              <div className="flex gap-2">
                                <Button type="button" onClick={handleSaveCommentEdit} disabled={isUpdatingComment || !editingCommentText.trim()} className="h-9 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0">
                                  {isUpdatingComment ? 'Validation...' : 'Valider'}
                                </Button>
                                <Button type="button" variant="outline" onClick={resetCommentEditor} className="h-9 border-white/20 bg-white/5 text-white/80 hover:bg-white/10">Annuler</Button>
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


      {/* Edit Product Modal */}
      <EditProductForm
        isOpen={isEditProductOpen}
        onClose={() => setIsEditProductOpen(false)}
      />

      {/* ========== CARACTÉRISTIQUE MODAL (avec impression PDF) ========== */}
      <CaracteristiqueModal
        open={isCaracteristiqueOpen}
        onOpenChange={setIsCaracteristiqueOpen}
        product={caracteristiqueProduct}
      />

      {/* ========== MODALE FUSION DE PRODUITS ========== */}
      <ProductMergeModal
        open={isMergeOpen}
        onClose={() => setIsMergeOpen(false)}
        products={products}
        onMerged={async () => {
          if (fetchProducts) await fetchProducts();
          await fetchRatings();
        }}
      />

      {/* ========== MODALE PRODUITS LES PLUS VENDUS ========== */}
      <ProductsVenduModal
        open={isVenduOpen}
        onClose={() => setIsVenduOpen(false)}
      />

      {/* ========== MODALE HISTORIQUE PRIX D'ACHAT ========== */}
      <PrixHistoryModal
        isOpen={isPrixHistoryOpen}
        onClose={() => setIsPrixHistoryOpen(false)}
        product={selectedProduct}
      />


      {/* ========== MODALE HISTORIQUE ACHATS / VENTES ========== */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-xl bg-gradient-to-br from-slate-900 via-emerald-900/30 to-teal-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent flex items-center gap-2">
              <Eye className="h-5 w-5 text-emerald-400" />
              Historique stock — {selectedProduct?.description}
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30">
                <p className="text-white/70 text-xs font-semibold">Reste en stock</p>
                <p className={cn("text-3xl font-black", selectedProduct.quantity > 0 ? "text-emerald-300" : "text-red-400")}>
                  {selectedProduct.quantity} unité{selectedProduct.quantity > 1 ? 's' : ''}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-emerald-300 mb-2 flex items-center gap-2">
                  <PackagePlus className="h-4 w-4" /> Achats ({selectedProduct.achats?.length || 0})
                </h4>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {(selectedProduct.achats || [])
                    .map((a, originalIndex) => ({ a, originalIndex }))
                    .slice()
                    .sort((x, y) => new Date(x.a.date).getTime() - new Date(y.a.date).getTime())
                    .map(({ a, originalIndex }) => {
                      const isDispo = a.disponible !== false; // legacy = true
                      const isToggling = togglingAchatIndex === originalIndex;
                      return (
                        <div
                          key={originalIndex}
                          className={cn(
                            "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-xl border transition-all",
                            isDispo
                              ? "bg-white/5 border-white/10"
                              : "bg-rose-500/10 border-rose-400/30"
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-white/90 text-sm font-semibold">
                                +{a.quantity} unité{a.quantity > 1 ? 's' : ''}
                              </p>
                              <Badge
                                className={cn(
                                  "text-[10px] font-bold border-0",
                                  isDispo
                                    ? "bg-emerald-500/20 text-emerald-200"
                                    : "bg-rose-500/20 text-rose-200"
                                )}
                              >
                                {isDispo ? '✓ Disponible' : '✕ Indisponible'}
                              </Badge>
                            </div>
                            <p className="text-white/50 text-xs mt-1">
                              {new Date(a.date).toLocaleDateString('fr-FR')}{a.fournisseur ? ` • ${a.fournisseur}` : ''}
                            </p>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                            <span className="text-amber-300 font-bold whitespace-nowrap">{a.purchasePrice}€</span>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isToggling}
                              onClick={() => handleToggleAchatDispo(originalIndex, !isDispo)}
                              className={cn(
                                "h-8 px-3 text-[11px] sm:text-xs rounded-lg border-0 font-bold transition-all whitespace-nowrap",
                                isDispo
                                  ? "bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white"
                                  : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                              )}
                            >
                              {isToggling
                                ? '…'
                                : isDispo
                                  ? '→ Indisponible'
                                  : '→ Disponible'}
                            </Button>
                            <div className="flex items-center gap-1">
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10" onClick={() => setAchatViewIndex(originalIndex)} title="Voir">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-300 hover:text-amber-200 hover:bg-amber-500/10" onClick={() => openAchatEdit(originalIndex)} title="Modifier">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-300 hover:text-rose-200 hover:bg-rose-500/10" onClick={() => setAchatDeleteIndex(originalIndex)} title="Supprimer">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  {(!selectedProduct.achats || selectedProduct.achats.length === 0) && (
                    <p className="text-white/40 text-sm italic">Aucun achat enregistré</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-rose-300 mb-2 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" /> Ventes ({selectedProduct.ventes?.length || 0})
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {(selectedProduct.ventes || [])
                    .map((v, originalIndex) => ({ v, originalIndex }))
                    .slice()
                    .sort((x, y) => new Date(x.v.date).getTime() - new Date(y.v.date).getTime())
                    .map(({ v, originalIndex }) => (
                      <div key={originalIndex} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex-1 min-w-0">
                          <p className="text-white/90 text-sm font-semibold">-{v.quantity} unité{v.quantity > 1 ? 's' : ''}</p>
                          <p className="text-white/50 text-xs">{new Date(v.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                          <span className="text-emerald-300 font-bold whitespace-nowrap">{v.sellingPrice}€</span>
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10" onClick={() => setVenteViewIndex(originalIndex)} title="Voir">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-300 hover:text-amber-200 hover:bg-amber-500/10" onClick={() => openVenteEdit(originalIndex)} title="Modifier">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-300 hover:text-rose-200 hover:bg-rose-500/10" onClick={() => setVenteDeleteIndex(originalIndex)} title="Supprimer">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  {(!selectedProduct.ventes || selectedProduct.ventes.length === 0) && (
                    <p className="text-white/40 text-sm italic">Aucune vente enregistrée</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== Sous-modales Achat/Vente + Historique fournisseurs ===== */}
      <AchatVenteSubModals
        selectedProduct={selectedProduct}
        achatViewIndex={achatViewIndex}
        setAchatViewIndex={setAchatViewIndex}
        achatEditIndex={achatEditIndex}
        setAchatEditIndex={setAchatEditIndex}
        achatDeleteIndex={achatDeleteIndex}
        setAchatDeleteIndex={setAchatDeleteIndex}
        achatEditForm={achatEditForm}
        setAchatEditForm={setAchatEditForm}
        achatSaving={achatSaving}
        achatDeleting={achatDeleting}
        handleSaveAchat={handleSaveAchat}
        handleDeleteAchat={handleDeleteAchat}
        venteViewIndex={venteViewIndex}
        setVenteViewIndex={setVenteViewIndex}
        venteEditIndex={venteEditIndex}
        setVenteEditIndex={setVenteEditIndex}
        venteDeleteIndex={venteDeleteIndex}
        setVenteDeleteIndex={setVenteDeleteIndex}
        venteEditForm={venteEditForm}
        setVenteEditForm={setVenteEditForm}
        venteSaving={venteSaving}
        venteDeleting={venteDeleting}
        handleSaveVente={handleSaveVente}
        handleDeleteVente={handleDeleteVente}
        isFournHistoryOpen={isFournHistoryOpen}
        setIsFournHistoryOpen={setIsFournHistoryOpen}
      />

    </div>
  );

  if (embedded) return content;
  return <Layout>{content}</Layout>;
};

export default ProduitsPage;
