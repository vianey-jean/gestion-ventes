/**
 * ProduitsPage.tsx - Page de gestion des produits
 * 
 * CRUD complet avec gestion du stock, recherche, filtrage, commentaires et upload d'images.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
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
        <div className="relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 pt-8 pb-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
              <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 flex items-center justify-center shadow-2xl shadow-violet-500/30">
                <Package className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                ✨ Gestion des Produits
              </h1>
              <p className="text-muted-foreground font-medium">Gérez votre inventaire premium avec élégance</p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-12 space-y-6">
          {/* Search + Add */}
          <motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
  className="flex flex-col xl:flex-row gap-4 xl:items-center w-full"
>
  {/* ================= SEARCH ================= */}
  <div className="relative flex-1 w-full">
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-violet-400" />

      <Input
        placeholder="Rechercher un produit (3 caractères min.)..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setShowSearchResults(e.target.value.length >= 3);
        }}
        onFocus={() => {
          if (searchQuery.length >= 3) setShowSearchResults(true);
        }}
        onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
        className="
          pl-11 sm:pl-12
          h-12 sm:h-14
          rounded-2xl
          border-2
          border-violet-200/50
          dark:border-violet-800/30
          bg-white/80
          dark:bg-white/5
          backdrop-blur-xl
          focus:border-violet-500
          shadow-lg
          shadow-violet-500/5
          text-sm sm:text-base
          font-medium
          transition-all
          duration-300
          w-full
        "
      />
    </div>

    {/* ================= SEARCH RESULTS ================= */}
    {/* 
    <AnimatePresence>
      {showSearchResults && searchResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="
            absolute
            z-50
            top-full
            mt-2
            w-full
            rounded-2xl
            border
            border-violet-200/30
            dark:border-violet-800/30
            bg-white/95
            dark:bg-[#0a0020]/95
            backdrop-blur-2xl
            shadow-2xl
            shadow-violet-500/10
            overflow-hidden
          "
        >
          {searchResults.map((p) => (
            <button
              key={p.id}
              onMouseDown={(e) => {
                e.preventDefault();
                openView(p);
                setShowSearchResults(false);
              }}
              className="
                w-full
                flex
                items-center
                gap-3
                px-4
                py-3
                hover:bg-violet-500/10
                transition-all
                duration-200
                text-left
                border-b
                border-violet-100/20
                dark:border-violet-800/20
                last:border-0
              "
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-violet-100 dark:bg-violet-900/30 flex-shrink-0">
                {p.mainPhoto || (p.photos && p.photos.length > 0) ? (
                  <img
                    src={getPhotoUrl(p.mainPhoto || p.photos![0])}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageOff className="h-4 w-4 text-violet-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate text-foreground">
                  {p.description}
                </p>

                <p className="text-xs text-muted-foreground">
                  {p.code} · {p.quantity} en stock · {p.purchasePrice}€
                </p>
              </div>

              <Eye className="h-4 w-4 text-violet-400 flex-shrink-0" />
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
    */}
  </div>

  {/* ================= ACTION BUTTONS ================= */}
  <div
    className="
      grid
      grid-cols-1
      sm:grid-cols-2
      xl:flex
      gap-3
      w-full
      xl:w-auto
    "
  >
    {/* ================= ADD BUTTON ================= */}
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="w-full"
    >
      <Button
        onClick={() => setIsAddOpen(true)}
        className="
          w-full
          xl:w-auto
          h-12
          sm:h-14
          px-4
          sm:px-6
          rounded-2xl
          font-bold
          text-sm
          sm:text-base
          bg-gradient-to-r
          from-emerald-500
          via-green-600
          to-teal-600
          hover:from-emerald-600
          hover:via-green-700
          hover:to-teal-700
          text-white
          shadow-lg
          sm:shadow-xl
          shadow-green-500/25
          hover:shadow-2xl
          hover:shadow-green-500/40
          transition-all
          duration-300
          border-0
        "
      >
        <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
        Ajouter Produit
      </Button>
    </motion.div>

    {/* ================= EDIT BUTTON ================= */}
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="w-full"
    >
      <Button
        onClick={() => setIsEditProductOpen(true)}
        className="
          w-full
          xl:w-auto
          h-12
          sm:h-14
          px-4
          sm:px-6
          rounded-2xl
          font-bold
          text-sm
          sm:text-base
          bg-gradient-to-r
          from-blue-500
          via-blue-600
          to-indigo-600
          hover:from-blue-600
          hover:via-blue-700
          hover:to-indigo-700
          text-white
          shadow-lg
          sm:shadow-xl
          shadow-blue-500/25
          hover:shadow-2xl
          hover:shadow-blue-500/40
          transition-all
          duration-300
          border-0
        "
      >
        <Pencil className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
        Modifier Produit
      </Button>
    </motion.div>

    {/* ================= BEST SELLER BUTTON ================= */}
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="w-full"
    >
      <Button
        onClick={() => setIsVenduOpen(true)}
        className="
          w-full
          xl:w-auto
          h-12
          sm:h-14
          px-4
          sm:px-6
          rounded-2xl
          font-bold
          text-sm
          sm:text-base
          bg-gradient-to-r
          from-amber-500
          via-yellow-500
          to-orange-500
          hover:from-amber-600
          hover:via-yellow-600
          hover:to-orange-600
          text-white
          shadow-lg
          sm:shadow-xl
          shadow-amber-500/30
          hover:shadow-2xl
          hover:shadow-amber-500/50
          transition-all
          duration-300
          border-0
        "
      >
        <Star className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
        Voir plus vendu
      </Button>
    </motion.div>

    {/* ================= MERGE BUTTON ================= */}
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="w-full"
    >
      <Button
        onClick={() => setIsMergeOpen(true)}
        className="
          w-full
          xl:w-auto
          h-12
          sm:h-14
          px-4
          sm:px-6
          rounded-2xl
          font-bold
          text-sm
          sm:text-base
          bg-gradient-to-r
          from-orange-500
          via-amber-500
          to-red-500
          hover:from-orange-600
          hover:via-amber-600
          hover:to-red-600
          text-white
          shadow-lg
          sm:shadow-xl
          shadow-orange-500/25
          hover:shadow-2xl
          hover:shadow-orange-500/40
          transition-all
          duration-300
          border-0
        "
      >
        <Merge className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
        Fusionner Produit
      </Button>
    </motion.div>
  </div>
</motion.div>

          {/* Filters */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2"
          >
            {filters.map(f => (
              <Button
                key={f.key}
                variant="outline"
                onClick={() => setActiveFilter(f.key)}
                className={cn(
                  "rounded-2xl font-bold transition-all duration-300 border-2 backdrop-blur-xl",
                  activeFilter === f.key
                    ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-transparent shadow-lg shadow-violet-500/25"
                    : "border-violet-200/30 dark:border-violet-800/30 hover:border-violet-400 bg-white/50 dark:bg-white/5"
                )}
              >
                {f.icon}
                <span className="ml-1.5">{f.label}</span>
                <Badge variant="secondary" className={cn(
                  "ml-2 text-xs",
                  activeFilter === f.key ? "bg-white/20 text-white" : "bg-violet-100 dark:bg-violet-900/30"
                )}>
                  {f.key === 'tous' ? products.length : products.filter(p => {
                    const d = p.description.toLowerCase();
                    if (f.key === 'perruque') return d.includes('perruque');
                    if (f.key === 'tissage') return d.includes('tissage');
                    if (f.key === 'extension') return d.includes('extension');
                    if (f.key === 'autres') return !d.includes('perruque') && !d.includes('tissage') && !d.includes('extension');
                    return false;
                  }).length}
                </Badge>
              </Button>
            ))}
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Produits', value: products.length, gradient: 'from-violet-500 to-purple-600', shadow: 'violet' },
              { label: 'En Stock', value: products.filter(p => p.quantity > 0).length, gradient: 'from-emerald-500 to-teal-600', shadow: 'emerald' },
              { label: 'Rupture', value: products.filter(p => p.quantity === 0).length, gradient: 'from-red-500 to-rose-600', shadow: 'red' },
              { label: 'Valeur Stock', value: `${products.reduce((acc, p) => acc + p.purchasePrice * p.quantity, 0).toFixed(0)}€`, gradient: 'from-amber-500 to-orange-600', shadow: 'amber' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
                className={cn(
                  "relative rounded-2xl p-4 overflow-hidden backdrop-blur-xl border border-white/10",
                  "bg-gradient-to-br", stat.gradient,
                  `shadow-xl shadow-${stat.shadow}-500/20`
                )}
              >
                <div className="absolute inset-0 bg-white/5" />
                <div className="relative">
                  <p className="text-white/70 text-xs font-medium">{stat.label}</p>
                  <p className="text-white text-2xl font-black mt-1">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

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
                          <Badge className={cn(
                            "font-bold border-0",
                            product.quantity > 0
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                          )}>
                            {product.quantity}
                          </Badge>
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
                  const comments = info?.comments || [];
                  const fullStars = Math.floor(avg);
                  const hasHalf = avg - fullStars >= 0.3;
                  const starColor = avg <= 2 ? 'text-red-500' : avg <= 3 ? 'text-yellow-500' : 'text-emerald-500';
                  return (
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <p className="text-white/50 text-xs font-medium">Notation moyenne</p>
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

                      {comments.length > 0 && (
                        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                          <button
                            onClick={() => setShowCommentsList(!showCommentsList)}
                            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                          >
                            <span className="text-white/80 font-bold text-sm flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" /> Commentaires ({comments.length})
                            </span>
                            {showCommentsList ? <ChevronUp className="h-4 w-4 text-white/50" /> : <ChevronDown className="h-4 w-4 text-white/50" />}
                          </button>
                          <AnimatePresence>
                            {showCommentsList && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
                                  {selectedCommentIds.length > 0 && (
                                    <div className="flex items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                                      <span className="text-xs font-bold text-red-200">
                                        {selectedCommentIds.length} commentaire{selectedCommentIds.length > 1 ? 's' : ''} sélectionné{selectedCommentIds.length > 1 ? 's' : ''}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          onClick={() => setSelectedCommentIds([])}
                                          className="h-8 border-white/20 bg-white/5 text-white/80 hover:bg-white/10"
                                        >
                                          Annuler
                                        </Button>
                                        <Button
                                          type="button"
                                          onClick={() => handleDeleteComments(selectedCommentIds)}
                                          disabled={isDeletingComments}
                                          className="h-8 bg-gradient-to-r from-red-500 to-rose-600 text-white border-0"
                                        >
                                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                                          Supprimer
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
                                                    <button
                                                      key={i}
                                                      type="button"
                                                      onClick={() => isEditing && setEditingCommentRating(i + 1)}
                                                      className={isEditing ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
                                                    >
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
                                                <button
                                                  type="button"
                                                  onClick={() => startEditingComment(c)}
                                                  className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-1.5 text-blue-300 transition-colors hover:bg-blue-500/20"
                                                  title="Modifier le commentaire"
                                                >
                                                  <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => handleDeleteComments([c.id])}
                                                  className="rounded-lg border border-red-500/20 bg-red-500/10 p-1.5 text-red-300 transition-colors hover:bg-red-500/20"
                                                  title="Supprimer le commentaire"
                                                >
                                                  <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                              </div>
                                            </div>

                                            {isEditing ? (
                                              <div className="space-y-2">
                                                <Input
                                                  value={editingCommentClientName}
                                                  onChange={(e) => setEditingCommentClientName(e.target.value)}
                                                  placeholder="Nom du client"
                                                  className="bg-white/10 border border-white/20 focus:border-cyan-400 rounded-xl text-white placeholder:text-white/40"
                                                />
                                                <Textarea
                                                  value={editingCommentText}
                                                  onChange={(e) => setEditingCommentText(e.target.value)}
                                                  placeholder="Modifier le commentaire..."
                                                  className="min-h-[96px] bg-white/10 border border-white/20 focus:border-purple-400 rounded-xl text-white placeholder:text-white/40"
                                                />
                                                <div className="flex gap-2">
                                                  <Button
                                                    type="button"
                                                    onClick={handleSaveCommentEdit}
                                                    disabled={isUpdatingComment || !editingCommentText.trim()}
                                                    className="h-9 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0"
                                                  >
                                                    {isUpdatingComment ? 'Validation...' : 'Valider'}
                                                  </Button>
                                                  <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={resetCommentEditor}
                                                    className="h-9 border-white/20 bg-white/5 text-white/80 hover:bg-white/10"
                                                  >
                                                    Annuler
                                                  </Button>
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
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
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
                        <p className="text-white/90 text-sm font-semibold">-{v.quantity} unité{v.quantity>1?'s':''}</p>
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

      {/* ===== Sous-modales Achat (Voir / Modifier / Supprimer) ===== */}
      <Dialog open={achatViewIndex !== null} onOpenChange={(o) => !o && setAchatViewIndex(null)}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-emerald-900/30 to-teal-900/20 border border-white/10 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent flex items-center gap-2">
              <Eye className="h-5 w-5" /> Détails de l'achat
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && achatViewIndex !== null && selectedProduct.achats?.[achatViewIndex] && (() => {
            const a = selectedProduct.achats[achatViewIndex];
            const isDispo = a.disponible !== false;
            return (
              <div className="space-y-2 text-sm">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><span className="text-white/60">Date :</span> <span className="text-white font-semibold">{new Date(a.date).toLocaleDateString('fr-FR')}</span></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><span className="text-white/60">Quantité :</span> <span className="text-white font-semibold">+{a.quantity}</span></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><span className="text-white/60">Prix d'achat :</span> <span className="text-amber-300 font-bold">{a.purchasePrice}€</span></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><span className="text-white/60">Fournisseur :</span> <span className="text-cyan-300 font-semibold">{a.fournisseur || '—'}</span></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><span className="text-white/60">Disponibilité :</span> <Badge className={cn('ml-2 border-0', isDispo ? 'bg-emerald-500/20 text-emerald-200' : 'bg-rose-500/20 text-rose-200')}>{isDispo ? '✓ Disponible' : '✕ Indisponible'}</Badge></div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button onClick={() => setAchatViewIndex(null)} variant="outline">Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={achatEditIndex !== null} onOpenChange={(o) => !o && setAchatEditIndex(null)}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-amber-900/30 to-orange-900/20 border border-white/10 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-2">
              <Edit className="h-5 w-5" /> Modifier l'achat
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-white/80 text-xs">Date</Label>
              <Input type="date" value={achatEditForm.date} onChange={(e) => setAchatEditForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/80 text-xs">Quantité</Label>
              <Input type="number" min="0" value={achatEditForm.quantity} onChange={(e) => setAchatEditForm(f => ({ ...f, quantity: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/80 text-xs">Prix d'achat (€)</Label>
              <Input type="number" step="0.01" min="0" value={achatEditForm.purchasePrice} onChange={(e) => setAchatEditForm(f => ({ ...f, purchasePrice: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <FournisseurAutocomplete
                value={achatEditForm.fournisseur}
                onChange={(val) => setAchatEditForm(f => ({ ...f, fournisseur: val }))}
                variant="dark"
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2 p-2 rounded-lg bg-white/5">
              <Checkbox id="achat-dispo-edit" checked={achatEditForm.disponible} onCheckedChange={(c) => setAchatEditForm(f => ({ ...f, disponible: !!c }))} />
              <Label htmlFor="achat-dispo-edit" className="text-white/80 text-sm cursor-pointer">Disponible (compte dans le stock vendable)</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAchatEditIndex(null)} disabled={achatSaving}>Annuler</Button>
            <Button onClick={handleSaveAchat} disabled={achatSaving} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              {achatSaving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={achatDeleteIndex !== null} onOpenChange={(o) => !o && setAchatDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet achat ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Si l'achat était disponible, sa quantité sera retirée du stock vendable.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={achatDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAchat} disabled={achatDeleting} className="bg-red-600 hover:bg-red-700">
              {achatDeleting ? 'Suppression…' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ===== Sous-modales Vente (Voir / Modifier / Supprimer) ===== */}
      <Dialog open={venteViewIndex !== null} onOpenChange={(o) => !o && setVenteViewIndex(null)}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-rose-900/30 to-pink-900/20 border border-white/10 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
              <Eye className="h-5 w-5" /> Détails de la vente
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && venteViewIndex !== null && selectedProduct.ventes?.[venteViewIndex] && (() => {
            const v = selectedProduct.ventes[venteViewIndex];
            return (
              <div className="space-y-2 text-sm">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><span className="text-white/60">Date :</span> <span className="text-white font-semibold">{new Date(v.date).toLocaleDateString('fr-FR')}</span></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><span className="text-white/60">Quantité :</span> <span className="text-white font-semibold">-{v.quantity}</span></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><span className="text-white/60">Prix de vente :</span> <span className="text-emerald-300 font-bold">{v.sellingPrice}€</span></div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button onClick={() => setVenteViewIndex(null)} variant="outline">Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={venteEditIndex !== null} onOpenChange={(o) => !o && setVenteEditIndex(null)}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-amber-900/30 to-orange-900/20 border border-white/10 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-2">
              <Edit className="h-5 w-5" /> Modifier la vente
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-white/80 text-xs">Date</Label>
              <Input type="date" value={venteEditForm.date} onChange={(e) => setVenteEditForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/80 text-xs">Quantité</Label>
              <Input type="number" min="0" value={venteEditForm.quantity} onChange={(e) => setVenteEditForm(f => ({ ...f, quantity: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/80 text-xs">Prix de vente (€)</Label>
              <Input type="number" step="0.01" min="0" value={venteEditForm.sellingPrice} onChange={(e) => setVenteEditForm(f => ({ ...f, sellingPrice: e.target.value }))} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setVenteEditIndex(null)} disabled={venteSaving}>Annuler</Button>
            <Button onClick={handleSaveVente} disabled={venteSaving} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              {venteSaving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={venteDeleteIndex !== null} onOpenChange={(o) => !o && setVenteDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette vente ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La quantité vendue sera rendue au stock du produit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={venteDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVente} disabled={venteDeleting} className="bg-red-600 hover:bg-red-700">
              {venteDeleting ? 'Suppression…' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {/* ========== MODALE HISTORIQUE FOURNISSEURS ========== */}
      <Dialog open={isFournHistoryOpen} onOpenChange={setIsFournHistoryOpen}>
        <DialogContent className="sm:max-w-lg bg-gradient-to-br from-slate-900 via-cyan-900/30 to-blue-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
              <Eye className="h-5 w-5 text-cyan-400" />
              Historique fournisseurs
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (() => {
            const hist = (selectedProduct.fournisseursHistory || []).slice().sort((a,b)=> new Date(a.dateDebut).getTime()-new Date(b.dateDebut).getTime());
            return (
              <div className="space-y-2">
                {hist.length === 0 && (
                  <p className="text-white/40 text-sm italic">Aucun fournisseur enregistré</p>
                )}
                {hist.map((f, i) => {
                  const dateFin = i < hist.length - 1 ? hist[i+1].dateDebut : null;
                  return (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-cyan-300 font-bold text-base">{f.nom}</p>
                      <p className="text-white/50 text-xs mt-1">
                        Du {new Date(f.dateDebut).toLocaleDateString('fr-FR')}
                        {dateFin
                          ? ` au ${new Date(dateFin).toLocaleDateString('fr-FR')}`
                          : ' — En cours'}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

    </div>
  );

  if (embedded) return content;
  return <Layout>{content}</Layout>;
};

export default ProduitsPage;
