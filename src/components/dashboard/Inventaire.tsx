import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { productService } from '@/service/api';
import { productApiService } from '@/services/api';
import { Product } from '@/types';
import { Search, Plus, Edit, Trash2, Package, PackageX, Filter, ArrowUpDown, AlertTriangle, ShoppingBag, Star, TrendingUp, Eye, CheckCircle, XCircle, Clock, Sparkles, Crown, Diamond, FileDown, Gem, Award, Zap, Flame, Printer, Settings, Ban, Camera, ImageOff, ChevronLeft, ChevronRight, Upload, X, Image } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import ModernActionButton from '@/components/dashboard/forms/ModernActionButton';
import ModernContainer from '@/components/dashboard/forms/ModernContainer';
import PremiumLoading from '@/components/ui/premium-loading';
import jsPDF from 'jspdf';
import ProductPhotoSlideshow from './ProductPhotoSlideshow';
import PhotoUploadSection from './PhotoUploadSection';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';

const getPhotoUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob') || url.startsWith('data:')) return url;
  return `${BASE_URL}${url}`;
};

type CategoryType = 'all' | 'perruque' | 'tissage' | 'autre';
type SortOrder = 'asc' | 'desc';

const Inventaire = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<CategoryType>('all');
  const [nameSortOrder, setNameSortOrder] = useState<SortOrder>('asc');
  const [quantitySortOrder, setQuantitySortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [showStockAlert, setShowStockAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  // États pour les confirmations depuis la modale de détail
  const [showEditConfirmFromDetail, setShowEditConfirmFromDetail] = useState(false);
  const [showDeleteConfirmFromDetail, setShowDeleteConfirmFromDetail] = useState(false);
  // Photo states
  const [slideshowProduct, setSlideshowProduct] = useState<Product | null>(null);
  // Photo upload states for add form
  const [addPhotos, setAddPhotos] = useState<{ files: File[]; existingUrls: string[]; mainIndex: number }>({ files: [], existingUrls: [], mainIndex: 0 });
  // Photo upload states for edit form
  const [editPhotos, setEditPhotos] = useState<{ files: File[]; existingUrls: string[]; mainIndex: number }>({ files: [], existingUrls: [], mainIndex: 0 });
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  // 🆕 Confirmation de mise à disponible des achats indisponibles
  const [indispoTarget, setIndispoTarget] = useState<Product | null>(null);
  const [indispoProcessing, setIndispoProcessing] = useState(false);


  const [newProduct, setNewProduct] = useState({
    description: '',
    purchasePrice: 0,
    quantity: 0
  });

  const ITEMS_PER_PAGE = 10;

  const categorizeProduct = (description: string): CategoryType => {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('perruque')) return 'perruque';
    if (lowerDesc.includes('tissage')) return 'tissage';
    return 'autre';
  };

  const getPriority = (quantity: number) => {
    if (quantity === 0) return { label: 'URGENT', color: 'text-red-100 bg-gradient-to-r from-red-500 to-red-600 border-0 shadow-lg shadow-red-500/30', icon: AlertTriangle };
    if (quantity >= 1 && quantity <= 2) return { label: 'ATTENTION', color: 'text-orange-100 bg-gradient-to-r from-orange-500 to-orange-600 border-0 shadow-lg shadow-orange-500/30', icon: Clock };
    return { label: 'NORMALE', color: 'text-green-100 bg-gradient-to-r from-green-500 to-green-600 border-0 shadow-lg shadow-green-500/30', icon: CheckCircle };
  };

  const getQuantityColor = (quantity: number) => {
    if (quantity === 0) return 'text-red-600 font-bold';
    if (quantity >= 1 && quantity <= 2) return 'text-orange-600 font-bold';
    return 'text-green-600 font-bold';
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      
      // Vérifier si certains produits n'ont pas de code, si oui générer les codes
      const productsWithoutCode = data.filter(p => !p.code);
      if (productsWithoutCode.length > 0) {
        console.log(`🔧 ${productsWithoutCode.length} produits sans code détectés, génération en cours...`);
        try {
          await productService.generateCodesForExistingProducts();
          // Recharger les produits après génération des codes
          const updatedData = await productService.getProducts();
          setProducts(updatedData);
        } catch (codeError) {
          console.error('⚠️ Erreur lors de la génération des codes:', codeError);
          // Continuer avec les produits existants même si la génération de codes échoue
          setProducts(data);
        }
      } else {
        setProducts(data);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits.",
        variant: "destructive",
         className: "notification-erreur",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];
    if (searchTerm.length >= 3) {
      // Recherche par description OU par code unique
      filtered = filtered.filter(product => 
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.code && product.code.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (category !== 'all') {
      filtered = filtered.filter(product => categorizeProduct(product.description) === category);
    }
    // Appliquer les deux tris simultanément: d'abord par quantité, puis par nom
    filtered.sort((a, b) => {
      // Tri principal par quantité
      const quantityDiff = quantitySortOrder === 'asc' 
        ? a.quantity - b.quantity 
        : b.quantity - a.quantity;
      
      // Si les quantités sont égales, trier par nom
      if (quantityDiff === 0) {
        const aValue = a.description.toLowerCase();
        const bValue = b.description.toLowerCase();
        return nameSortOrder === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return quantityDiff;
    });
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchTerm, category, nameSortOrder, quantitySortOrder]);

  const getStats = () => {
    const perruques = products.filter(p => categorizeProduct(p.description) === 'perruque').length;
    const tissages = products.filter(p => categorizeProduct(p.description) === 'tissage').length;
    const autres = products.filter(p => categorizeProduct(p.description) === 'autre').length;
    return { perruques, tissages, autres };
  };

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleAddProduct = async () => {
    if (!newProduct.description.trim()) {
      toast({
        title: "Erreur",
        description: "La description est requise.",
        variant: "destructive",
         className: "notification-erreur",
      });
      return;
    }
    try {
      const created = await productService.addProduct(newProduct);
      // Upload photos if any
      if (addPhotos.files.length > 0 && created?.id) {
        setIsUploadingPhotos(true);
        try {
          await productService.uploadProductPhotos(created.id, addPhotos.files, addPhotos.mainIndex);
        } catch (photoErr) {
          console.warn('Photo upload warning:', photoErr);
        } finally {
          setIsUploadingPhotos(false);
        }
      }
      await loadProducts();
      setNewProduct({ description: '', purchasePrice: 0, quantity: 0 });
      setAddPhotos({ files: [], existingUrls: [], mainIndex: 0 });
      setIsAddDialogOpen(false);
      toast({
        title: "🎉 Produit Premium Ajouté !",
        description: "✨ Votre nouveau produit de luxe a été ajouté avec succès au catalogue premium.",
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 text-green-900 shadow-xl rounded-xl font-semibold",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le produit.",
        variant: "destructive",
         className: "notification-erreur",
      });
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct) return;
    try {
      await productService.updateProduct(editingProduct);
      // Handle photo changes: always use replaceProductPhotos to sync photos
      if (editingProduct.id) {
        const hasNewFiles = editPhotos.files.length > 0;
        const existingPhotos = editingProduct.photos || [];
        const keptChanged = editPhotos.existingUrls.length !== existingPhotos.length || 
          editPhotos.existingUrls.some((url, i) => url !== existingPhotos[i]);
        
        if (hasNewFiles || keptChanged) {
          setIsUploadingPhotos(true);
          try {
            await productService.replaceProductPhotos(
              editingProduct.id, 
              editPhotos.files, 
              editPhotos.existingUrls, 
              editPhotos.mainIndex
            );
          } catch (photoErr) {
            console.warn('Photo upload warning:', photoErr);
          } finally {
            setIsUploadingPhotos(false);
          }
        }
      }
      await loadProducts();
      setEditingProduct(null);
      setEditPhotos({ files: [], existingUrls: [], mainIndex: 0 });
      toast({
        title: "🎨 Produit Premium Modifié !",
        description: "✨ Les modifications de votre produit de luxe ont été enregistrées avec élégance.",
        className: "bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 text-blue-900 shadow-xl rounded-xl font-semibold",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le produit.",
        variant: "destructive",
         className: "notification-erreur",
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      await productService.deleteProduct(deletingProduct.id);
      await loadProducts();
      setDeletingProduct(null);
      toast({
        title: "🗑️ Produit Premium Supprimé !",
        description: "💔 Le produit de luxe a été retiré définitivement du catalogue premium.",
        className: "bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 text-red-900 shadow-xl rounded-xl font-semibold",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit.",
        variant: "destructive",
         className: "notification-erreur",
      });
    }
  };

  /**
   * Génère et télécharge directement un PDF de l'étiquette produit
   * Utilise jsPDF pour créer un PDF premium sans ouvrir de fenêtre d'impression
   */
  const handleDownloadProductPDF = (product: Product) => {
    try {
      const productCode = (product.code || 'SANS-CODE').toUpperCase();
      const productDescription = product.description.toUpperCase();
      
      // Créer un nouveau document PDF (format étiquette 50x30mm)
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [50, 30]
      });
      
      // Header avec fond dégradé simulé (couleur sombre)
      doc.setFillColor(26, 26, 46); // Couleur #1a1a2e
      doc.rect(0, 0, 50, 10, 'F');
      
      // Code produit en blanc sur fond sombre
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(productCode, 25, 7, { align: 'center' });
      
      // Bordure élégante autour de tout le document
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.3);
      doc.rect(0.5, 0.5, 49, 29);
      
      // Section description avec fond blanc
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 10, 50, 20, 'F');
      
      // Description du produit en noir
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      
      // Découper la description si elle est trop longue
      const maxWidth = 45;
      const lines = doc.splitTextToSize(productDescription, maxWidth);
      const startY = lines.length > 2 ? 16 : 18;
      
      lines.slice(0, 3).forEach((line: string, index: number) => {
        doc.text(line, 25, startY + (index * 4), { align: 'center' });
      });
      
      // Ligne décorative entre le code et la description
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(2, 10, 48, 10);
      
      // Télécharger le PDF directement
      const fileName = `etiquette-${productCode.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "✨ PDF Téléchargé !",
        description: `L'étiquette "${productCode}" a été sauvegardée avec succès.`,
        className: "bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 text-emerald-900 shadow-xl rounded-xl font-semibold",
      });
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF. Veuillez réessayer.",
        variant: "destructive",
        className: "notification-erreur",
      });
    }
  };

  const stats = getStats();

  if (loading) {
    return (
      <PremiumLoading
        text="Chargement de l'Inventaire"
        size="md"
        variant="dashboard"
        showText={true}
      />
    );
  }

  return (
     <div className="space-y-8">
      {/* Statistiques par catégorie avec design premium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModernContainer gradient="purple" className="card-3d transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="relative p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl">
              <Crown className="h-8 w-8 text-white" />
              <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <p className="text-sm font-bold text-purple-700 uppercase tracking-wide">Perruques Premium</p>
              </div>
              <p className="text-3xl font-black text-purple-900 bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
                {stats.perruques}
              </p>
            </div>
          </div>
        </ModernContainer>

        <ModernContainer gradient="blue" className="card-3d transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="relative p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl">
              <Diamond className="h-8 w-8 text-white" />
              <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-bold text-blue-700 uppercase tracking-wide">Tissages Luxe</p>
              </div>
              <p className="text-3xl font-black text-blue-900 bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
                {stats.tissages}
              </p>
            </div>
          </div>
        </ModernContainer>

        <ModernContainer gradient="green" className="card-3d transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="relative p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl">
              <ShoppingBag className="h-8 w-8 text-white" />
              <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-sm font-bold text-green-700 uppercase tracking-wide">Autres Produits</p>
              </div>
              <p className="text-3xl font-black text-green-900 bg-gradient-to-r from-green-700 to-green-900 bg-clip-text text-transparent">
                {stats.autres}
              </p>
            </div>
          </div>
        </ModernContainer>
      </div>

      {/* Contrôles Premium */}
      <ModernContainer gradient="neutral" className="card-3d">
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Recherche Premium */}
            <div className="relative flex-1 max-w-md group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <Search className="h-5 w-5" />
              </div>
              <Input
                placeholder="🔍 Recherche par nom ou code... (min. 3 caractères)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 focus:border-blue-500 focus:from-blue-50 focus:to-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300  placeholder:text-gray-500"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Sparkles className="h-4 w-4 text-blue-400" />
              </div>
            </div>

            {/* Filtre par catégorie Premium */}
            <Select value={category} onValueChange={(value: CategoryType) => setCategory(value)}>
              <SelectTrigger className="w-[220px] bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:border-purple-500 focus:from-purple-50 focus:to-white">
                <div className="flex items-center gap-3">
                  <Filter className="h-5 w-5 text-purple-500" />
                  <SelectValue placeholder="Catégorie" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-xl">
                <SelectItem value="all" className="hover:bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    Toutes catégories
                  </div>
                </SelectItem>
                <SelectItem value="perruque" className="hover:bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-purple-500" />
                    Perruques Premium
                  </div>
                </SelectItem>
                <SelectItem value="tissage" className="hover:bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Diamond className="h-4 w-4 text-blue-500" />
                    Tissages Luxe
                  </div>
                </SelectItem>
                <SelectItem value="autre" className="hover:bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-green-500" />
                    Autres Produits
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Tri Premium */}
            <ModernActionButton
              variant="outline"
              gradient="indigo"
              icon={ArrowUpDown}
              onClick={() => setNameSortOrder(nameSortOrder === 'asc' ? 'desc' : 'asc')}
              className="bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-xl"
            >
              {nameSortOrder === 'asc' ? 'A-Z' : 'Z-A'}
            </ModernActionButton>

            {/* Tri par Quantité */}
            <ModernActionButton
              variant="outline"
              gradient="blue"
              icon={TrendingUp}
              onClick={() => setQuantitySortOrder(quantitySortOrder === 'asc' ? 'desc' : 'asc')}
              className="bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-xl"
            >
              {quantitySortOrder === 'asc' ? '0→9' : '9→0'}
            </ModernActionButton>
          </div>

          {/* Bouton ajouter Premium */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <ModernActionButton
                gradient="green"
                icon={Plus}
                buttonSize="lg"
                className="btn-3d shadow-xl shadow-green-500/25 hover:shadow-2xl hover:shadow-green-500/40"
              >
                ✨ Ajouter Produit Premium
              </ModernActionButton>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-slate-900 via-green-900/30 to-emerald-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
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
                  <Label htmlFor="description" className="text-sm font-bold text-white/80 flex items-center gap-2">
                    <Package className="h-4 w-4 text-green-400" />
                    Description du produit
                  </Label>
                  <Input
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Entrez une description premium..."
                    className="bg-white/10 border border-white/20 focus:border-green-400 rounded-xl text-white placeholder:text-white/40 hover:bg-white/15 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-bold text-white/80 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    Prix (€)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newProduct.purchasePrice}
                    onChange={(e) => setNewProduct({ ...newProduct, purchasePrice: parseFloat(e.target.value) || 0 })}
                    className="bg-white/10 border border-white/20 focus:border-yellow-400 rounded-xl text-white placeholder:text-white/40 hover:bg-white/15 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-sm font-bold text-white/80 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-400" />
                    Quantité en stock
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 0 })}
                    className="bg-white/10 border border-white/20 focus:border-blue-400 rounded-xl text-white placeholder:text-white/40 hover:bg-white/15 transition-all"
                  />
                </div>
                {/* Photo Upload for new product */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <PhotoUploadSection
                    onPhotosChange={(files, existingUrls, mainIndex) => {
                      setAddPhotos({ files, existingUrls, mainIndex });
                    }}
                    maxPhotos={6}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <ModernActionButton
                    onClick={handleAddProduct}
                    gradient="green"
                    buttonSize="lg"
                    className="flex-1 btn-3d"
                    disabled={isUploadingPhotos}
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {isUploadingPhotos ? 'Envoi photos...' : 'Ajouter au Stock'}
                  </ModernActionButton>
                  <ModernActionButton
                    variant="outline"
                    gradient="red"
                    onClick={() => { setIsAddDialogOpen(false); setAddPhotos({ files: [], existingUrls: [], mainIndex: 0 }); }}
                    buttonSize="lg"
                    className="flex-1"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Annuler
                  </ModernActionButton>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </ModernContainer>

      {/* Tableau des produits Premium - Ultra Moderne et Luxueux */}
      <ModernContainer gradient="neutral" className="card-3d overflow-hidden -mx-3 sm:mx-0">
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="w-full text-xs sm:text-sm md:text-base">
            <thead>
              <tr className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b-2 border-purple-500/30">
                <th className="p-3 sm:p-4 md:p-6 text-left font-black uppercase tracking-wider">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
                      <Package className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <span className="text-red-600 hidden sm:inline text-sm">Description</span>
                    <span className="text-red-600 sm:hidden text-xs">Prod.</span>
                  </div>
                </th>
                <th className="p-3 sm:p-4 md:p-6 text-left font-black uppercase tracking-wider">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <span className="text-yellow-600 hidden xs:inline text-sm">Prix</span>
                  </div>
                </th>
                <th className="p-3 sm:p-4 md:p-6 text-left font-black uppercase tracking-wider">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <span className="text-Blue-600 hidden xs:inline text-sm">Qté</span>
                  </div>
                </th>
                <th className="p-3 sm:p-4 md:p-6 text-left font-black uppercase tracking-wider hidden md:table-cell">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg shadow-pink-500/30">
                      <Camera className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <span className="text-pink-400 text-sm">Photo</span>
                  </div>
                </th>
                <th className="p-3 sm:p-4 md:p-6 text-center font-black uppercase tracking-wider">
                  <div className="flex items-center justify-center gap-2">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30">
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <span className="text-purple-600 hidden sm:inline text-sm">Actions</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {currentProducts.map((product, index) => {
                return (
                  <tr 
                    key={product.id} 
                    className="group cursor-pointer bg-white dark:bg-gray-900 hover:bg-gradient-to-r hover:from-purple-50 hover:via-pink-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:via-pink-900/20 dark:hover:to-blue-900/20 transition-all duration-500"
                    onClick={() => setViewingProduct(product)}
                  >
                    <td className="p-3 sm:p-4 md:p-6">
                      <div className="flex items-center gap-2 sm:gap-4">
                        {/* Numéro avec design luxe */}
                        <div className="relative flex-shrink-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-500">
                            <span className="font-black text-white text-xs sm:text-sm md:text-base">{index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}</span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                            <Gem className="h-1.5 w-1.5 sm:h-2 sm:w-2 text-white" />
                          </div>
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-sm sm:text-base md:text-lg text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors truncate">
                            {product.description}
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 flex-wrap">
                            {/* Code unique avec style premium */}
                            {product.code && (
                              <Badge className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-0 font-mono text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-105 transition-all">
                                <Crown className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                {product.code}
                              </Badge>
                            )}
                            {/* Catégorie badge */}
                            <Badge className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 border-0 text-gray-700 dark:text-gray-200 font-semibold text-[10px] sm:text-xs hidden sm:inline-flex px-2 py-0.5 rounded-lg">
                              {categorizeProduct(product.description) === 'perruque' && <Crown className="h-2.5 w-2.5 mr-1 text-purple-500" />}
                              {categorizeProduct(product.description) === 'tissage' && <Diamond className="h-2.5 w-2.5 mr-1 text-blue-500" />}
                              {categorizeProduct(product.description) === 'autre' && <ShoppingBag className="h-2.5 w-2.5 mr-1 text-green-500" />}
                              {categorizeProduct(product.description)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 md:p-6">
                      <div className="relative inline-flex items-baseline gap-0.5">
                        <span className="text-base sm:text-xl md:text-2xl font-black bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
                          {product.purchasePrice.toFixed(2)}
                        </span>
                        <span className="text-sm sm:text-lg md:text-xl font-black bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">€</span>
                        <Award className="absolute -top-1 -right-3 h-3 w-3 sm:h-4 sm:w-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 md:p-6">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={cn(
                          "relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl md:text-2xl shadow-xl transition-all duration-300 group-hover:scale-110",
                          product.quantity === 0 ? "bg-gradient-to-br from-red-500 to-red-700 text-white shadow-red-500/40" :
                          product.quantity <= 2 ? "bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-orange-500/40" :
                          "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-emerald-500/40"
                        )}>
                          {product.quantity}
                          <Flame className={cn(
                            "absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5",
                            product.quantity === 0 ? "text-red-300 animate-pulse" : 
                            product.quantity <= 2 ? "text-orange-300 animate-pulse" : "text-emerald-300 opacity-0"
                          )} />
                        </div>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 md:p-6 hidden md:table-cell" onClick={(e) => e.stopPropagation()}>
                      {/* Photo principale ou placeholder */}
                      {(product.mainPhoto || (product.photos && product.photos.length > 0)) ? (
                        <button
                          onClick={() => setSlideshowProduct(product)}
                          className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-purple-400/50 hover:border-purple-400 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 group/photo"
                          title="Voir toutes les photos"
                        >
                          <img
                            src={getPhotoUrl(product.mainPhoto || (product.photos && product.photos[0]) || '')}
                            alt={product.description}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          {/* Photo count badge */}
                          {product.photos && product.photos.length > 1 && (
                            <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-tl-lg">
                              +{product.photos.length - 1}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="h-4 w-4 text-white" />
                          </div>
                        </button>
                      ) : (
                        <div className="w-14 h-14 rounded-xl border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center">
                          <ImageOff className="h-5 w-5 text-white/20" />
                        </div>
                      )}
                    </td>
                    <td className="p-2 sm:p-4 md:p-6" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                        {/* 🆕 Bouton Achats Indisponibles */}
                        {(() => {
                          const indispoQty = (product.achats || [])
                            .filter(a => a && a.disponible === false)
                            .reduce((s, a) => s + (Number(a.quantity) || 0), 0);
                          if (indispoQty <= 0) return null;
                          return (
                            <button
                              onClick={() => setIndispoTarget(product)}
                              className="group/btn relative p-2 sm:p-2.5 md:p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/50 hover:scale-110 active:scale-95 transition-all duration-300"
                              title={`${indispoQty} unité(s) indisponible(s) — cliquez pour rendre disponible`}
                            >
                              <PackageX className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow">
                                {indispoQty}
                              </span>
                            </button>
                          );
                        })()}

                        {/* Bouton Modifier - Design Luxe */}
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="group/btn relative p-2 sm:p-2.5 md:p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-110 active:scale-95 transition-all duration-300"
                          title="Modifier"
                        >
                          <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                          <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        </button>

                        
                        {/* Bouton Supprimer - Design Luxe */}
                        <button
                          onClick={() => setDeletingProduct(product)}
                          className="group/btn relative p-2 sm:p-2.5 md:p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/50 hover:scale-110 active:scale-95 transition-all duration-300"
                          title="Supprimer"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                          <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        </button>
                        
                        {/* Bouton Voir - Design Luxe */}
                        <button
                          onClick={() => setViewingProduct(product)}
                          className="group/btn relative p-2 sm:p-2.5 md:p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/50 hover:scale-110 active:scale-95 transition-all duration-300"
                          title="Voir détails"
                        >
                          <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                          <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        </button>
                        
                        {/* Bouton Télécharger PDF - Design Luxe */}
                        <button
                          onClick={() => handleDownloadProductPDF(product)}
                          className="group/btn relative p-2 sm:p-2.5 md:p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/50 hover:scale-110 active:scale-95 transition-all duration-300"
                          title="Télécharger PDF"
                        >
                          <FileDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                          <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Premium Responsive */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 p-4 sm:p-6 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 via-white to-gray-50">
            {/* Mobile: Select dropdown pour les pages */}
            <div className="flex sm:hidden items-center gap-3 w-full justify-center">
              <ModernActionButton
                buttonSize="sm"
                variant="outline"
                gradient="indigo"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-3d w-10 h-10 rounded-xl font-black"
              >
                ←
              </ModernActionButton>
              
              <Select 
                value={currentPage.toString()} 
                onValueChange={(value) => setCurrentPage(parseInt(value))}
              >
                <SelectTrigger className="w-32 h-10 bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 rounded-xl shadow-lg font-bold">
                  <div className="flex items-center gap-2">
                    <Gem className="h-4 w-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border-2 border-emerald-200 shadow-2xl rounded-xl">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <SelectItem 
                      key={page} 
                      value={page.toString()}
                      className="hover:bg-emerald-50 rounded-lg font-semibold"
                    >
                      <div className="flex items-center gap-2">
                        <span>Page {page}</span>
                        {currentPage === page && <Crown className="h-3 w-3 text-emerald-600" />}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <ModernActionButton
                buttonSize="sm"
                variant="outline"
                gradient="indigo"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="btn-3d w-10 h-10 rounded-xl font-black"
              >
                →
              </ModernActionButton>
              
              <span className="text-xs text-gray-500 font-medium">
                {currentPage}/{totalPages}
              </span>
            </div>

            {/* Desktop/Tablet: Boutons de pagination */}
            <div className="hidden sm:flex items-center gap-2 md:gap-3 flex-wrap justify-center">
              {/* Bouton précédent */}
              <ModernActionButton
                buttonSize="sm"
                variant="outline"
                gradient="purple"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-3d w-10 h-10 md:w-12 md:h-12 rounded-xl font-black text-sm md:text-lg"
              >
                ←
              </ModernActionButton>

              {/* Pages avec ellipsis pour grand nombre */}
              {totalPages <= 7 ? (
                Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <ModernActionButton
                    key={page}
                    buttonSize="sm"
                    variant={currentPage === page ? "solid" : "outline"}
                    gradient={currentPage === page ? "green" : "indigo"}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "btn-3d w-10 h-10 md:w-12 md:h-12 rounded-xl font-black text-sm md:text-lg",
                      currentPage === page ? "shadow-xl shadow-green-500/30" : "hover:scale-110"
                    )}
                  >
                    {page}
                  </ModernActionButton>
                ))
              ) : (
                <>
                  {/* Première page */}
                  <ModernActionButton
                    buttonSize="sm"
                    variant={currentPage === 1 ? "solid" : "outline"}
                    gradient={currentPage === 1 ? "green" : "indigo"}
                    onClick={() => setCurrentPage(1)}
                    className={cn(
                      "btn-3d w-10 h-10 md:w-12 md:h-12 rounded-xl font-black text-sm md:text-lg",
                      currentPage === 1 ? "shadow-xl shadow-green-500/30" : "hover:scale-110"
                    )}
                  >
                    1
                  </ModernActionButton>

                  {currentPage > 3 && (
                    <span className="px-2 text-gray-400 font-bold">...</span>
                  )}

                  {/* Pages autour de la page courante */}
                  {Array.from({ length: 3 }, (_, i) => currentPage - 1 + i)
                    .filter(page => page > 1 && page < totalPages)
                    .map((page) => (
                      <ModernActionButton
                        key={page}
                        buttonSize="sm"
                        variant={currentPage === page ? "solid" : "outline"}
                        gradient={currentPage === page ? "green" : "indigo"}
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "btn-3d w-10 h-10 md:w-12 md:h-12 rounded-xl font-black text-sm md:text-lg",
                          currentPage === page ? "shadow-xl shadow-green-500/30" : "hover:scale-110"
                        )}
                      >
                        {page}
                      </ModernActionButton>
                    ))}

                  {currentPage < totalPages - 2 && (
                    <span className="px-2 text-gray-400 font-bold">...</span>
                  )}

                  {/* Dernière page */}
                  <ModernActionButton
                    buttonSize="sm"
                    variant={currentPage === totalPages ? "solid" : "outline"}
                    gradient={currentPage === totalPages ? "green" : "indigo"}
                    onClick={() => setCurrentPage(totalPages)}
                    className={cn(
                      "btn-3d w-10 h-10 md:w-12 md:h-12 rounded-xl font-black text-sm md:text-lg",
                      currentPage === totalPages ? "shadow-xl shadow-green-500/30" : "hover:scale-110"
                    )}
                  >
                    {totalPages}
                  </ModernActionButton>
                </>
              )}

              {/* Bouton suivant */}
              <ModernActionButton
                buttonSize="sm"
                variant="outline"
                gradient="purple"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="btn-3d w-10 h-10 md:w-12 md:h-12 rounded-xl font-black text-sm md:text-lg"
              >
                →
              </ModernActionButton>
            </div>
          </div>
        )}
      </ModernContainer>

      {/* Dialog de modification Premium */}
      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => { setEditingProduct(null); setEditPhotos({ files: [], existingUrls: [], mainIndex: 0 }); }}>
          <DialogContent className="bg-gradient-to-br from-slate-900 via-blue-900/40 to-indigo-900/30 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
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
                <Label htmlFor="edit-description" className="text-sm font-bold text-white/80 flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-400" />
                  Description du produit
                </Label>
                <Input
                  id="edit-description"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="bg-white/10 border border-white/20 focus:border-blue-400 rounded-xl text-white placeholder:text-white/40 hover:bg-white/15 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price" className="text-sm font-bold text-white/80 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  Prix (€)
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editingProduct.purchasePrice}
                  onChange={(e) => setEditingProduct({ ...editingProduct, purchasePrice: parseFloat(e.target.value) || 0 })}
                  className="bg-white/10 border border-white/20 focus:border-yellow-400 rounded-xl text-white placeholder:text-white/40 hover:bg-white/15 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-quantity" className="text-sm font-bold text-white/80 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-400" />
                  Quantité en stock
                </Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={editingProduct.quantity}
                  onChange={(e) => setEditingProduct({ ...editingProduct, quantity: parseInt(e.target.value) || 0 })}
                  className="bg-white/10 border border-white/20 focus:border-indigo-400 rounded-xl text-white placeholder:text-white/40 hover:bg-white/15 transition-all"
                />
              </div>

              {/* Photo Upload Section */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <PhotoUploadSection
                  existingPhotos={editingProduct.photos || []}
                  existingMainPhoto={editingProduct.mainPhoto}
                  baseUrl={BASE_URL}
                  onPhotosChange={(files, existingUrls, mainIndex) => {
                    setEditPhotos({ files, existingUrls, mainIndex });
                  }}
                  maxPhotos={6}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <ModernActionButton
                  onClick={handleEditProduct}
                  gradient="blue"
                  buttonSize="lg"
                  className="flex-1 btn-3d"
                  disabled={isUploadingPhotos}
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {isUploadingPhotos ? 'Envoi photos...' : 'Sauvegarder'}
                </ModernActionButton>
                <ModernActionButton
                  variant="outline"
                  gradient="red"
                  onClick={() => { setEditingProduct(null); setEditPhotos({ files: [], existingUrls: [], mainIndex: 0 }); }}
                  buttonSize="lg"
                  className="flex-1"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Annuler
                </ModernActionButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog de visualisation Premium */}
      {viewingProduct && (
        <Dialog open={!!viewingProduct} onOpenChange={() => setViewingProduct(null)}>
          <DialogContent className="bg-gradient-to-br from-white via-purple-50 to-indigo-50 backdrop-blur-xl border-0 shadow-2xl rounded-3xl max-w-lg">
            <DialogHeader className="text-center space-y-4 pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <DialogTitle className="text-2xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                ✨ Détails Produit Premium
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-4">
                {/* Code unique du produit */}
                {viewingProduct.code && (
                  <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl border-2 border-indigo-300">
                    <Label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-indigo-600" />
                      Code Unique
                    </Label>
                    <p className="text-2xl font-black font-mono bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-widest">{viewingProduct.code}</p>
                  </div>
                )}
                <div className="p-4 bg-white/80 rounded-xl border-2 border-purple-200">
                  <Label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4 text-purple-600" />
                    Description
                  </Label>
                  <p className="text-lg font-semibold text-gray-900">{viewingProduct.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/80 rounded-xl border-2 border-yellow-200">
                    <Label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Prix d'achat
                    </Label>
                    <p className="text-2xl font-black text-yellow-600">{viewingProduct.purchasePrice.toFixed(2)} €</p>
                  </div>
                  <div className="p-4 bg-white/80 rounded-xl border-2 border-blue-200">
                    <Label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      Quantité
                    </Label>
                    <p className={cn("text-2xl font-black", getQuantityColor(viewingProduct.quantity))}>
                      {viewingProduct.quantity}
                    </p>
                  </div>
                </div>
                {/* Photo principale */}
                <div className="p-4 bg-white/80 rounded-xl border-2 border-pink-200">
                  <Label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                    <Camera className="h-4 w-4 text-pink-500" />
                    Photo principale
                    {viewingProduct.photos && viewingProduct.photos.length > 0 && (
                      <span className="text-xs text-gray-400 font-normal">({viewingProduct.photos.length} photo{viewingProduct.photos.length > 1 ? 's' : ''})</span>
                    )}
                  </Label>
                  {(viewingProduct.mainPhoto || (viewingProduct.photos && viewingProduct.photos.length > 0)) ? (
                    <button
                      onClick={() => { setViewingProduct(null); setSlideshowProduct(viewingProduct); }}
                      className="relative w-full h-40 rounded-xl overflow-hidden border-2 border-pink-200 hover:border-pink-400 transition-all hover:shadow-lg group/photo"
                      title="Voir toutes les photos"
                    >
                      <img
                        src={getPhotoUrl(viewingProduct.mainPhoto || (viewingProduct.photos?.[0] ?? ''))}
                        alt={viewingProduct.description}
                        className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Eye className="h-6 w-6 text-white" />
                        <span className="text-white font-bold text-sm">Voir toutes les photos</span>
                      </div>
                      {viewingProduct.photos && viewingProduct.photos.length > 1 && (
                        <div className="absolute bottom-2 right-2 flex gap-1">
                          {viewingProduct.photos.slice(0, 4).map((_, i) => (
                            <div key={i} className={cn("w-2 h-2 rounded-full", i === 0 ? "bg-white" : "bg-white/50")} />
                          ))}
                        </div>
                      )}
                    </button>
                  ) : (
                    <div className="w-full h-28 rounded-xl border-2 border-dashed border-pink-200 bg-pink-50/50 flex flex-col items-center justify-center gap-2">
                      <ImageOff className="h-8 w-8 text-pink-300" />
                      <p className="text-xs text-pink-400 font-medium">Aucune photo</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Premium Icons */}
              <div className="p-5 bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 rounded-2xl shadow-2xl">
                <p className="text-center text-white/80 text-sm font-semibold mb-4 flex items-center justify-center gap-2">
                  <Settings className="h-4 w-4" />
                  Actions Rapides
                </p>
                <div className="flex justify-center gap-4">
                  {/* Icône Modifier Luxe */}
                  <button
                    onClick={() => setShowEditConfirmFromDetail(true)}
                    className="group relative p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/60 transform hover:scale-110 hover:-translate-y-1 transition-all duration-300"
                    title="Modifier ce produit"
                  >
                    <Edit className="h-6 w-6 text-white group-hover:animate-pulse" />
                    <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-300 rounded-full opacity-0 group-hover:opacity-100 blur-sm transition-opacity" />
                  </button>

                  {/* Icône Supprimer Luxe */}
                  <button
                    onClick={() => setShowDeleteConfirmFromDetail(true)}
                    className="group relative p-4 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-xl shadow-red-500/40 hover:shadow-2xl hover:shadow-red-500/60 transform hover:scale-110 hover:-translate-y-1 transition-all duration-300"
                    title="Supprimer ce produit"
                  >
                    <Trash2 className="h-6 w-6 text-white group-hover:animate-pulse" />
                    <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-red-300 rounded-full opacity-0 group-hover:opacity-100 blur-sm transition-opacity" />
                  </button>

                  {/* Icône Imprimer Luxe */}
                  <button
                    onClick={() => {
                      handleDownloadProductPDF(viewingProduct);
                    }}
                    className="group relative p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-xl shadow-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/60 transform hover:scale-110 hover:-translate-y-1 transition-all duration-300"
                    title="Imprimer étiquette PDF"
                  >
                    <Printer className="h-6 w-6 text-white group-hover:animate-pulse" />
                    <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-300 rounded-full opacity-0 group-hover:opacity-100 blur-sm transition-opacity" />
                  </button>
                </div>
                <div className="flex justify-center gap-6 mt-3">
                  <span className="text-xs text-blue-300 font-medium">Modifier</span>
                  <span className="text-xs text-red-300 font-medium">Supprimer</span>
                  <span className="text-xs text-emerald-300 font-medium">Imprimer</span>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <ModernActionButton
                  variant="outline"
                  gradient="purple"
                  onClick={() => setViewingProduct(null)}
                  buttonSize="lg"
                  className="px-8"
                >
                  <Ban className="h-5 w-5 mr-2" />
                  Fermer
                </ModernActionButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog de confirmation pour modifier depuis détail */}
      <AlertDialog open={showEditConfirmFromDetail} onOpenChange={setShowEditConfirmFromDetail}>
        <AlertDialogContent className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
          <AlertDialogHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Edit className="h-8 w-8 text-white" />
            </div>
            <AlertDialogTitle className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ✏️ Modifier ce Produit ?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-gray-700 text-center font-medium space-y-4">
                <div>Voulez-vous vraiment modifier les informations de ce produit premium ?</div>
                {viewingProduct && (
                  <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                    <div className="flex items-center gap-3 justify-center">
                      <Package className="h-5 w-5 text-blue-600" />
                      <span className="text-blue-800 font-bold">{viewingProduct.description}</span>
                    </div>
                    {viewingProduct.code && (
                      <Badge className="mt-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-mono font-bold">
                        {viewingProduct.code}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 pt-6">
            <AlertDialogCancel asChild>
              <ModernActionButton
                variant="outline"
                gradient="red"
                buttonSize="lg"
                className="flex-1"
              >
                <XCircle className="h-5 w-5 mr-2" />
                Non, Annuler
              </ModernActionButton>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <ModernActionButton
                gradient="blue"
                buttonSize="lg"
                className="flex-1 btn-3d"
                onClick={() => {
                  if (viewingProduct) {
                    setEditingProduct(viewingProduct);
                    setViewingProduct(null);
                    setShowEditConfirmFromDetail(false);
                  }
                }}
              >
                <Edit className="h-5 w-5 mr-2" />
                Oui, Modifier
              </ModernActionButton>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmation pour supprimer depuis détail */}
      <AlertDialog open={showDeleteConfirmFromDetail} onOpenChange={setShowDeleteConfirmFromDetail}>
        <AlertDialogContent className="bg-gradient-to-br from-white via-red-50 to-pink-50 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
          <AlertDialogHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
              <Trash2 className="h-8 w-8 text-white" />
            </div>
            <AlertDialogTitle className="text-2xl font-black bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              🗑️ Supprimer ce Produit ?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-gray-700 text-center font-medium space-y-4">
                <div>Êtes-vous absolument certain de vouloir supprimer ce produit premium ?</div>
                {viewingProduct && (
                  <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
                    <div className="flex items-center gap-3 justify-center">
                      <Package className="h-5 w-5 text-red-600" />
                      <span className="text-red-800 font-bold">{viewingProduct.description}</span>
                    </div>
                    {viewingProduct.code && (
                      <Badge className="mt-2 bg-gradient-to-r from-red-500 to-rose-500 text-white font-mono font-bold">
                        {viewingProduct.code}
                      </Badge>
                    )}
                  </div>
                )}
                <div className="text-sm text-red-600 font-semibold">
                  ⚡ Cette action est irréversible et définitive !
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 pt-6">
            <AlertDialogCancel asChild>
              <ModernActionButton
                variant="outline"
                gradient="green"
                buttonSize="lg"
                className="flex-1"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Non, Conserver
              </ModernActionButton>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <ModernActionButton
                gradient="red"
                buttonSize="lg"
                className="flex-1 btn-3d"
                onClick={async () => {
                  if (viewingProduct) {
                    try {
                      await productService.deleteProduct(viewingProduct.id);
                      await loadProducts();
                      setViewingProduct(null);
                      setShowDeleteConfirmFromDetail(false);
                      toast({
                        title: "🗑️ Produit Premium Supprimé !",
                        description: "💔 Le produit de luxe a été retiré définitivement du catalogue premium.",
                        className: "bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 text-red-900 shadow-xl rounded-xl font-semibold",
                      });
                    } catch (error) {
                      toast({
                        title: "Erreur",
                        description: "Impossible de supprimer le produit.",
                        variant: "destructive",
                        className: "notification-erreur",
                      });
                    }
                  }
                }}
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Oui, Supprimer
              </ModernActionButton>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de suppression Premium */}
      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent className="bg-gradient-to-br from-white via-red-50 to-pink-50 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
          <AlertDialogHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <AlertDialogTitle className="text-2xl font-black bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              ⚠️ Suppression Produit
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-gray-700 text-center font-medium space-y-4">
                <div>Êtes-vous absolument certain de vouloir supprimer ce produit premium ?</div>
                <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
                  <div className="flex items-center gap-3 justify-center">
                    <Package className="h-5 w-5 text-red-600" />
                    <span className="text-red-800 font-bold">{deletingProduct?.description}</span>
                  </div>
                </div>
                <div className="text-sm text-red-600 font-semibold">
                  ⚡ Cette action est irréversible et définitive !
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 pt-6">
            <AlertDialogCancel asChild>
              <ModernActionButton
                variant="outline"
                gradient="green"
                buttonSize="lg"
                className="flex-1"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Conserver
              </ModernActionButton>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <ModernActionButton
                gradient="red"
                buttonSize="lg"
                className="flex-1 btn-3d"
                onClick={handleDeleteProduct}
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Supprimer Définitivement
              </ModernActionButton>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Product Photo Slideshow Modal */}
      {slideshowProduct && (
        <ProductPhotoSlideshow
          photos={slideshowProduct.photos || []}
          mainPhoto={slideshowProduct.mainPhoto}
          productName={slideshowProduct.description}
          isOpen={!!slideshowProduct}
          onClose={() => setSlideshowProduct(null)}
          baseUrl={BASE_URL}
        />
      )}

      {/* 🆕 Confirmation : rendre disponibles tous les achats indisponibles */}
      <AlertDialog open={!!indispoTarget} onOpenChange={(open) => { if (!open && !indispoProcessing) setIndispoTarget(null); }}>
        <AlertDialogContent className="bg-white dark:bg-gray-900 border-2 border-amber-300 shadow-2xl rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3 text-xl font-black">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                <PackageX className="h-6 w-6 text-white" />
              </div>
              Rendre disponible ?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 pt-2 text-sm">
                {indispoTarget && (() => {
                  const qty = (indispoTarget.achats || []).filter(a => a && a.disponible === false).reduce((s, a) => s + (Number(a.quantity) || 0), 0);
                  return (
                    <>
                      <div className="text-gray-700 dark:text-gray-200">
                        Confirmez-vous que <span className="font-bold text-amber-700">{qty}</span> unité(s) de <span className="font-bold">« {indispoTarget.description} »</span> sont vraiment disponibles ?
                      </div>
                      <div className="text-xs text-gray-500 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-lg p-3">
                        Ces quantités seront ajoutées au stock vendable et les achats correspondants passeront à « Disponible » dans l'historique.
                      </div>
                    </>
                  );
                })()}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 pt-4">
            <AlertDialogCancel asChild>
              <ModernActionButton variant="outline" gradient="indigo" buttonSize="lg" className="flex-1" disabled={indispoProcessing}>
                Annuler
              </ModernActionButton>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <ModernActionButton
                gradient="green"
                buttonSize="lg"
                className="flex-1 btn-3d"
                disabled={indispoProcessing}
                onClick={async (e: any) => {
                  e?.preventDefault?.();
                  if (!indispoTarget) return;
                  setIndispoProcessing(true);
                  try {
                    const achats = indispoTarget.achats || [];
                    const indexes = achats
                      .map((a, i) => (a && a.disponible === false ? i : -1))
                      .filter(i => i >= 0)
                      .sort((a, b) => b - a); // ordre décroissant pour préserver les index
                    for (const idx of indexes) {
                      // eslint-disable-next-line no-await-in-loop
                      await productApiService.setAchatDisponibilite(indispoTarget.id, idx, true);
                    }
                    toast({
                      title: 'Stock mis à jour',
                      description: `${indexes.length} achat(s) marqué(s) disponible(s).`,
                      className: 'notification-success',
                    });
                    setIndispoTarget(null);
                    await loadProducts();
                  } catch (err) {
                    console.error('Erreur mise à disponibilité:', err);
                    toast({
                      title: 'Erreur',
                      description: "Impossible de mettre à jour la disponibilité.",
                      variant: 'destructive',
                      className: 'notification-erreur',
                    });
                  } finally {
                    setIndispoProcessing(false);
                  }
                }}
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Oui, disponible
              </ModernActionButton>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>

  );
};

export default Inventaire;
