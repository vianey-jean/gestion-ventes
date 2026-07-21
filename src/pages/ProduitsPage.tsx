/**
 * ProduitsPage.tsx - Page de gestion des produits
 *
 * Version décomposée : la page orchestre uniquement l'état et délègue le rendu
 * aux composants extraits dans `src/components/products/*` et
 * `src/components/products/modals/*`.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Layout from '@/components/Layout';
import ProduitsHero from '@/pages/produits/ProduitsHero';
import { useApp } from '@/contexts/AppContext';
import { productService } from '@/service/api';
import { productApiService } from '@/services/api/productApi';
import { Product } from '@/types';
import { fournisseurApiService } from '@/services/api/fournisseurApi';
import { useToast } from '@/hooks/use-toast';
import { Package, Filter, Sparkles, Star, ShoppingBag } from 'lucide-react';
import SharedPagination from '@/components/shared/Pagination';
import SEOHead from '@/components/SEOHead';
import { productCommentsApi, ProductComment, ProductRatingInfo } from '@/services/api/productCommentsApi';
import { clientApiService } from '@/services/api/clientApi';
import { Client } from '@/types/client';
import CaracteristiqueModal from '@/components/products/CaracteristiqueModal';
import ProductMergeModal from '@/components/products/ProductMergeModal';
import ProductsVenduModal from '@/components/products/ProductsVenduModal';
import PrixHistoryModal from '@/components/products/PrixHistoryModal';
import StockListModal from '@/components/products/StockListModal';
import EditProductForm from '@/components/dashboard/EditProductForm';
import ProduitsToolbar from '@/pages/produits/ProduitsToolbar';
import ProduitsFiltersStats from '@/pages/produits/ProduitsFiltersStats';
import AchatVenteSubModals from '@/pages/produits/AchatVenteSubModals';
import ProductAttributesToolbar from '@/components/products/attributes/ProductAttributesToolbar';
import {
  ClassificationValue, ProductCategory,
} from '@/components/products/attributes/ProductClassificationSelector';
import ProductClassificationFilterModal from '@/components/products/attributes/ProductClassificationFilterModal';
import ProductsTable, { SortField, SortDir } from '@/components/products/ProductsTable';
import {
  AddProductModal, AddConfirmDialog,
  EditProductModal, EditConfirmDialog,
  DeleteConfirmDialog, ProductViewModal,
  ProductCommentsModal, AchatVenteHistoryModal,
  IndispoConfirmDialog,
  AddProductForm, EditForm,
} from '@/components/products/modals';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';

type FilterType = 'tous' | 'perruque' | 'tissage' | 'extension' | 'autres' | 'indisponible';

const todayISO = () => new Date().toISOString().slice(0, 10);

const ProduitsPage: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { products, fetchProducts } = useApp();
  const { toast } = useToast();

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('tous');
  const [, setShowSearchResults] = useState(false);

  // Classification
  const [classification, setClassification] = useState<ClassificationValue>({});
  const [classificationModalOpen, setClassificationModalOpen] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<ProductCategory | null>(null);
  const [addClassification, setAddClassification] = useState<ClassificationValue>({});

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
  const [isStockListOpen, setIsStockListOpen] = useState(false);

  // Selected product
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [togglingAchatIndex, setTogglingAchatIndex] = useState<number | null>(null);
  const [indispoTarget, setIndispoTarget] = useState<Product | null>(null);
  const [indispoProcessing, setIndispoProcessing] = useState(false);

  // Sous-modales achat/vente
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
      if (achatEditForm.fournisseur.trim()) {
        try { await fournisseurApiService.create(achatEditForm.fournisseur.trim()); } catch (e) { console.error(e); }
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
    } finally { setAchatSaving(false); }
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
    } finally { setAchatDeleting(false); }
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
    } finally { setVenteSaving(false); }
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
    } finally { setVenteDeleting(false); }
  }, [selectedProduct, venteDeleteIndex, fetchProducts, toast]);

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
      console.error(e);
      toast({ title: 'Erreur', description: "Impossible de modifier la disponibilité de cet achat.", variant: 'destructive' });
    } finally { setTogglingAchatIndex(null); }
  }, [selectedProduct, fetchProducts, toast]);

  // Add form
  const [addForm, setAddForm] = useState<AddProductForm>({ description: '', purchasePrice: '', quantity: '', fournisseur: '', dateAchat: todayISO() });
  const [addPhotos, setAddPhotos] = useState<{ files: File[]; existingUrls: string[]; mainIndex: number }>({ files: [], existingUrls: [], mainIndex: 0 });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  // Edit form
  const [editForm, setEditForm] = useState<EditForm>({ description: '', purchasePrice: 0, quantity: 0, additionalQuantity: 0, fournisseur: '', purchaseDate: todayISO() });
  const [editPhotos, setEditPhotos] = useState<{ files: File[]; existingUrls: string[]; mainIndex: number }>({ files: [], existingUrls: [], mainIndex: 0 });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 10;

  // Tri
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
    setCurrentPage(1);
  };

  // Comments & Ratings
  const [allRatings, setAllRatings] = useState<Record<string, ProductRatingInfo>>({});
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

  const fetchRatings = useCallback(async () => {
    try {
      const data = await productCommentsApi.getAllRatings();
      setAllRatings(data && typeof data === 'object' && !Array.isArray(data) ? data : {});
    } catch (e) { console.error(e); }
  }, []);

  const resetCommentEditor = useCallback(() => {
    setEditingCommentId(null);
    setEditingCommentText('');
    setEditingCommentRating(5);
    setEditingCommentClientName('');
  }, []);

  useEffect(() => { fetchRatings(); }, [fetchRatings]);

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
          case 'indisponible':
            return (p.achats || []).some(a => a && a.disponible === false && (Number(a.quantity) || 0) > 0);
          default: return true;
        }
      });
    }
    const cf = classification;
    if (cf.modele || cf.couleur || cf.taille || cf.devant) {
      filtered = filtered.filter(p => {
        const d = p.description.toLowerCase();
        if (cf.modele && !d.includes(cf.modele.toLowerCase())) return false;
        if (cf.couleur && !d.includes(cf.couleur.toLowerCase())) return false;
        if (cf.taille && !d.includes(cf.taille.toLowerCase())) return false;
        if (cf.devant && !d.includes(cf.devant.toLowerCase())) return false;
        return true;
      });
    }
    if (searchQuery.length >= 3) {
      filtered = filtered.filter(p =>
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.code && p.code.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (sortField) {
      filtered.sort((a, b) => {
        let cmp = 0;
        switch (sortField) {
          case 'description': cmp = a.description.localeCompare(b.description, 'fr'); break;
          case 'purchasePrice': cmp = (a.purchasePrice || 0) - (b.purchasePrice || 0); break;
          case 'quantity': cmp = (a.quantity || 0) - (b.quantity || 0); break;
          case 'notation': {
            const avgA = allRatings[a.id]?.average || 0;
            const avgB = allRatings[b.id]?.average || 0;
            cmp = avgA - avgB; break;
          }
        }
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return filtered;
  }, [products, activeFilter, searchQuery, sortField, sortDir, allRatings, classification]);

  useEffect(() => { setCurrentPage(1); }, [activeFilter, searchQuery]);

  const handleFilterChange = useCallback((f: FilterType) => {
    setActiveFilter(f);
    if (f === 'tous' || f === 'autres' || f === 'indisponible') { setClassification({}); return; }
    setPendingCategory(f as ProductCategory);
    setClassification({ categorie: f as ProductCategory });
    setClassificationModalOpen(true);
  }, []);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

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
      if (addForm.fournisseur.trim()) {
        try { await fournisseurApiService.create(addForm.fournisseur.trim()); } catch (e) { console.error(e); }
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
      setAddClassification({});
      if (fetchProducts) await fetchProducts();
    } catch {
      toast({ title: 'Erreur', description: "Erreur lors de l'ajout", variant: 'destructive', className: 'notification-erreur' });
    } finally { setIsSubmitting(false); }
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

  const handleEditSubmit = () => { if (selectedProduct) setIsEditConfirmOpen(true); };

  const confirmEdit = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      if (editForm.fournisseur.trim()) {
        try { await fournisseurApiService.create(editForm.fournisseur.trim()); } catch (e) { console.error(e); }
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
    } finally { setIsSubmitting(false); }
  };

  // ===== DELETE =====
  const openDelete = (product: Product) => { setSelectedProduct(product); setIsDeleteConfirmOpen(true); };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      try { await productCommentsApi.deleteByProductId(selectedProduct.id); } catch (e) { console.error(e); }
      await productService.deleteProduct(selectedProduct.id);
      toast({ title: 'Succès', description: `"${selectedProduct.description}" supprimé avec tous ses commentaires`, className: 'notification-success' });
      setIsDeleteConfirmOpen(false);
      setSelectedProduct(null);
      if (fetchProducts) await fetchProducts();
      await fetchRatings();
    } catch {
      toast({ title: 'Erreur', description: 'Erreur lors de la suppression', variant: 'destructive', className: 'notification-erreur' });
    } finally { setIsSubmitting(false); }
  };

  // ===== VIEW =====
  const openView = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPhotoIndex(0);
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
    } finally { setIsUpdatingComment(false); }
  };

  const handleDeleteComments = async (ids: string[]) => {
    if (ids.length === 0) return;
    const confirmed = window.confirm(ids.length === 1 ? 'Supprimer ce commentaire ?' : `Supprimer ${ids.length} commentaires ?`);
    if (!confirmed) return;
    setIsDeletingComments(true);
    try {
      if (ids.length === 1) await productCommentsApi.delete(ids[0]);
      else await productCommentsApi.deleteMany(ids);
      await fetchRatings();
      setSelectedCommentIds(prev => prev.filter(id => !ids.includes(id)));
      if (editingCommentId && ids.includes(editingCommentId)) resetCommentEditor();
      toast({ title: 'Succès', description: ids.length === 1 ? 'Commentaire supprimé' : `${ids.length} commentaires supprimés`, className: 'notification-success' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de supprimer le(s) commentaire(s)', variant: 'destructive', className: 'notification-erreur' });
    } finally { setIsDeletingComments(false); }
  };

  const onClientQueryChange = async (val: string) => {
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
  };

  const submitNewComment = async () => {
    if (!newComment.trim() || !selectedProduct) return;
    setIsSubmittingComment(true);
    try {
      await productCommentsApi.create({
        productId: selectedProduct.id,
        comment: newComment.trim(),
        rating: newRating,
        clientName: commentClientName.trim(),
      });
      setNewComment(''); setNewRating(5); setCommentClientName(''); setClientSearchQuery('');
      await fetchRatings();
      toast({ title: 'Succès', description: 'Commentaire ajouté', className: 'notification-success' });
    } catch {
      toast({ title: 'Erreur', description: "Erreur lors de l'ajout du commentaire", variant: 'destructive', className: 'notification-erreur' });
    } finally { setIsSubmittingComment(false); }
  };

  const handleIndispoConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!indispoTarget) return;
    setIndispoProcessing(true);
    try {
      const achats = indispoTarget.achats || [];
      const indexes = achats.map((a, i) => (a && a.disponible === false ? i : -1)).filter(i => i >= 0).sort((a, b) => b - a);
      for (const idx of indexes) {
        // eslint-disable-next-line no-await-in-loop
        await productApiService.setAchatDisponibilite(indispoTarget.id, idx, true);
      }
      toast({ title: 'Stock mis à jour', description: `${indexes.length} achat(s) marqué(s) disponible(s).`, className: 'notification-success' });
      setIndispoTarget(null);
      await fetchProducts();
    } catch (err) {
      console.error(err);
      toast({ title: 'Erreur', description: "Impossible de mettre à jour la disponibilité.", variant: 'destructive', className: 'notification-erreur' });
    } finally { setIndispoProcessing(false); }
  };

  const filters: { key: FilterType; label: string; icon: React.ReactNode }[] = [
    { key: 'tous', label: 'Tous', icon: <Package className="h-3.5 w-3.5" /> },
    { key: 'perruque', label: 'Perruques', icon: <Sparkles className="h-3.5 w-3.5" /> },
    { key: 'tissage', label: 'Tissages', icon: <Star className="h-3.5 w-3.5" /> },
    { key: 'extension', label: 'Extensions', icon: <ShoppingBag className="h-3.5 w-3.5" /> },
    { key: 'autres', label: 'Autres', icon: <Filter className="h-3.5 w-3.5" /> },
    { key: 'indisponible', label: 'Indisponibles', icon: <Filter className="h-3.5 w-3.5" /> },
  ];

  const content = (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/20 dark:from-[#030014] dark:via-[#0a0025] dark:to-[#0e0030]">
      <SEOHead title="Produits" description="Gestion des produits - Inventaire et catalogue" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/20 dark:from-[#030014] dark:via-[#0a0025] dark:to-[#0e0030]">
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 pt-4 md:pt-6">
          <ProduitsHero onAdd={() => setIsAddOpen(true)} />
        </div>

        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 pb-12 space-y-6">
          <ProduitsToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setShowSearchResults={setShowSearchResults}
            onAdd={() => setIsAddOpen(true)}
            onStock={() => setIsStockListOpen(true)}
            onVendu={() => setIsVenduOpen(true)}
            onMerge={() => setIsMergeOpen(true)}
          />

          <ProduitsFiltersStats
            products={products}
            filters={filters}
            activeFilter={activeFilter}
            setActiveFilter={handleFilterChange}
          />

          <ProductAttributesToolbar />

          {/* Products Table */}
          <ProductsTable
            tableContainerRef={tableContainerRef}
            paginatedProducts={paginatedProducts}
            allRatings={allRatings}
            sortField={sortField}
            sortDir={sortDir}
            onSort={handleSort}
            getPhotoUrl={getPhotoUrl}
            onView={openView}
            onEdit={openEdit}
            onDelete={openDelete}
            onIndispoTarget={setIndispoTarget}
            onOpenCaracteristique={(p) => { setCaracteristiqueProduct(p); setIsCaracteristiqueOpen(true); }}
          />

          <SharedPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredProducts.length}
            itemsPerPage={ITEMS_PER_PAGE}
            showFirstLast={true}
            showItemCount={true}
            siblingCount={1}
            scrollTargetRef={tableContainerRef}
          />
        </div>

        {/* ========== ADD MODAL ========== */}
        <AddProductModal
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          addForm={addForm}
          setAddForm={setAddForm}
          addErrors={addErrors}
          setAddErrors={setAddErrors}
          addPhotos={addPhotos}
          setAddPhotos={setAddPhotos}
          addClassification={addClassification}
          setAddClassification={setAddClassification}
          isSubmitting={isSubmitting}
          onSubmit={handleAddSubmit}
        />

        {/* ========== ADD CONFIRM ========== */}
        <AddConfirmDialog
          open={isAddConfirmOpen}
          onOpenChange={setIsAddConfirmOpen}
          addForm={addForm}
          photoCount={addPhotos.files.length}
          isSubmitting={isSubmitting}
          onConfirm={confirmAdd}
        />

        {/* ========== EDIT MODAL ========== */}
        <EditProductModal
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          selectedProduct={selectedProduct}
          editForm={editForm}
          setEditForm={setEditForm}
          editPhotos={editPhotos}
          setEditPhotos={setEditPhotos}
          baseUrl={BASE_URL}
          isSubmitting={isSubmitting}
          onSubmit={handleEditSubmit}
          clientSearchQuery={clientSearchQuery}
          setClientSearchQuery={setClientSearchQuery}
          setCommentClientName={setCommentClientName}
          clientSearchResults={clientSearchResults}
          setClientSearchResults={setClientSearchResults}
          showClientDropdown={showClientDropdown}
          setShowClientDropdown={setShowClientDropdown}
          onClientQueryChange={onClientQueryChange}
          newComment={newComment}
          setNewComment={setNewComment}
          newRating={newRating}
          setNewRating={setNewRating}
          isSubmittingComment={isSubmittingComment}
          onSubmitComment={submitNewComment}
        />

        {/* ========== EDIT CONFIRM ========== */}
        <EditConfirmDialog
          open={isEditConfirmOpen}
          onOpenChange={setIsEditConfirmOpen}
          isSubmitting={isSubmitting}
          onConfirm={confirmEdit}
        />

        {/* ========== DELETE CONFIRM ========== */}
        <DeleteConfirmDialog
          open={isDeleteConfirmOpen}
          onOpenChange={setIsDeleteConfirmOpen}
          selectedProduct={selectedProduct}
          isSubmitting={isSubmitting}
          onConfirm={confirmDelete}
        />

        {/* ========== VIEW MODAL (Photo Slideshow) ========== */}
        <ProductViewModal
          open={isViewOpen}
          onOpenChange={(open) => {
            setIsViewOpen(open);
            if (!open) { setSelectedCommentIds([]); resetCommentEditor(); }
          }}
          selectedProduct={selectedProduct}
          currentPhotoIndex={currentPhotoIndex}
          setCurrentPhotoIndex={setCurrentPhotoIndex}
          getPhotoUrl={getPhotoUrl}
          allRatings={allRatings}
          onOpenPrixHistory={() => setIsPrixHistoryOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenFournHistory={() => setIsFournHistoryOpen(true)}
          onOpenComments={() => setIsCommentsModalOpen(true)}
          onEdit={() => { if (selectedProduct) { setIsViewOpen(false); openEdit(selectedProduct); } }}
          onDelete={() => { if (selectedProduct) { setIsViewOpen(false); openDelete(selectedProduct); } }}
        />
      </div>

      {/* ========== MODALE COMMENTAIRES PRODUIT ========== */}
      <ProductCommentsModal
        open={isCommentsModalOpen}
        onOpenChange={setIsCommentsModalOpen}
        selectedProduct={selectedProduct}
        allRatings={allRatings}
        selectedCommentIds={selectedCommentIds}
        setSelectedCommentIds={setSelectedCommentIds}
        toggleCommentSelection={toggleCommentSelection}
        editingCommentId={editingCommentId}
        editingCommentText={editingCommentText}
        setEditingCommentText={setEditingCommentText}
        editingCommentRating={editingCommentRating}
        setEditingCommentRating={setEditingCommentRating}
        editingCommentClientName={editingCommentClientName}
        setEditingCommentClientName={setEditingCommentClientName}
        startEditingComment={startEditingComment}
        resetCommentEditor={resetCommentEditor}
        handleSaveCommentEdit={handleSaveCommentEdit}
        isUpdatingComment={isUpdatingComment}
        handleDeleteComments={handleDeleteComments}
        isDeletingComments={isDeletingComments}
      />

      {/* Edit Product Modal (legacy) */}
      <EditProductForm isOpen={isEditProductOpen} onClose={() => setIsEditProductOpen(false)} />

      {/* Caractéristique */}
      <CaracteristiqueModal
        open={isCaracteristiqueOpen}
        onOpenChange={setIsCaracteristiqueOpen}
        product={caracteristiqueProduct}
      />

      {/* Fusion */}
      <ProductMergeModal
        open={isMergeOpen}
        onClose={() => setIsMergeOpen(false)}
        products={products}
        onMerged={async () => {
          if (fetchProducts) await fetchProducts();
          await fetchRatings();
        }}
      />

      <ProductsVenduModal open={isVenduOpen} onClose={() => setIsVenduOpen(false)} />

      <PrixHistoryModal
        isOpen={isPrixHistoryOpen}
        onClose={() => setIsPrixHistoryOpen(false)}
        product={selectedProduct}
      />

      <StockListModal
        open={isStockListOpen}
        onClose={() => setIsStockListOpen(false)}
        products={products}
      />

      {/* ========== MODALE HISTORIQUE ACHATS / VENTES ========== */}
      <AchatVenteHistoryModal
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        selectedProduct={selectedProduct}
        togglingAchatIndex={togglingAchatIndex}
        onToggleAchatDispo={handleToggleAchatDispo}
        onViewAchat={setAchatViewIndex}
        onEditAchat={openAchatEdit}
        onDeleteAchat={setAchatDeleteIndex}
        onViewVente={setVenteViewIndex}
        onEditVente={openVenteEdit}
        onDeleteVente={setVenteDeleteIndex}
      />

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

      {/* Modale filtrage par classification */}
      {pendingCategory && (
        <ProductClassificationFilterModal
          open={classificationModalOpen}
          onOpenChange={setClassificationModalOpen}
          categorie={pendingCategory}
          initial={classification}
          onApply={(v) => setClassification(v)}
        />
      )}

      {/* Confirmation : rendre disponibles tous les achats indisponibles */}
      <IndispoConfirmDialog
        target={indispoTarget}
        processing={indispoProcessing}
        onOpenChange={(open) => { if (!open) setIndispoTarget(null); }}
        onConfirm={handleIndispoConfirm}
      />
    </div>
  );

  if (embedded) return content;
  return <Layout>{content}</Layout>;
};

export default ProduitsPage;
