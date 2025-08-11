import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { productService } from '@/service/api';
import { Product } from '@/types';
import { Search, Plus, Edit, Trash2, Package, Filter, ArrowUpDown, AlertTriangle, ShoppingBag, Star, TrendingUp, Eye, CheckCircle, XCircle, Clock, Sparkles, Crown, Diamond } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import ModernActionButton from '@/components/dashboard/forms/ModernActionButton';
import ModernContainer from '@/components/dashboard/forms/ModernContainer';
import PremiumLoading from '@/components/ui/premium-loading';

type CategoryType = 'all' | 'perruque' | 'tissage' | 'autre';
type SortOrder = 'asc' | 'desc';

const Inventaire = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<CategoryType>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [showStockAlert, setShowStockAlert] = useState(false);
  const [loading, setLoading] = useState(true);

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
      setProducts(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits.",
        variant: "destructive",
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
      filtered = filtered.filter(product => product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (category !== 'all') {
      filtered = filtered.filter(product => categorizeProduct(product.description) === category);
    }
    filtered.sort((a, b) => {
      const aValue = a.description.toLowerCase();
      const bValue = b.description.toLowerCase();
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchTerm, category, sortOrder]);

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
      });
      return;
    }
    try {
      await productService.addProduct(newProduct);
      await loadProducts();
      setNewProduct({ description: '', purchasePrice: 0, quantity: 0 });
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
      });
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct) return;
    try {
      await productService.updateProduct(editingProduct);
      await loadProducts();
      setEditingProduct(null);
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
                placeholder="🔍 Recherche premium... (min. 3 caractères)"
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
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-xl"
            >
              {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
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
            <DialogContent className="bg-gradient-to-br from-white via-green-50 to-emerald-50 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
              <DialogHeader className="text-center space-y-4 pb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <DialogTitle className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  ✨ Nouveau Produit Premium
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Package className="h-4 w-4 text-green-600" />
                    Description du produit
                  </Label>
                  <Input
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Entrez une description premium..."
                    className="bg-white/80 border-2 border-green-200 focus:border-green-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Prix (€)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newProduct.purchasePrice}
                    onChange={(e) => setNewProduct({ ...newProduct, purchasePrice: parseFloat(e.target.value) || 0 })}
                    className="bg-white/80 border-2 border-green-200 focus:border-green-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    Quantité en stock
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 0 })}
                    className="bg-white/80 border-2 border-green-200 focus:border-green-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  />
                </div>
                <div className="flex gap-3 pt-6">
                  <ModernActionButton
                    onClick={handleAddProduct}
                    gradient="green"
                    buttonSize="lg"
                    className="flex-1 btn-3d"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Ajouter au Stock
                  </ModernActionButton>
                  <ModernActionButton
                    variant="outline"
                    gradient="red"
                    onClick={() => setIsAddDialogOpen(false)}
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

      {/* Tableau des produits Premium */}
      <ModernContainer gradient="neutral" className="card-3d overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 border-b-2 border-gray-200">
                <th className="p-6 text-left font-black  uppercase tracking-wide">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    Description
                  </div>
                </th>
                <th className="p-6 text-left font-black uppercase tracking-wide">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Prix (€)
                  </div>
                </th>
                <th className="p-6 text-left font-black  uppercase tracking-wide">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Quantité
                  </div>
                </th>
                <th className="p-6 text-left font-black  uppercase tracking-wide">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Priorité
                  </div>
                </th>
                <th className="p-6 text-left font-black  uppercase tracking-wide">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product, index) => {
                const priority = getPriority(product.quantity);
                const PriorityIcon = priority.icon;
                return (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:via-purple-50 hover:to-pink-50 transition-all duration-300 group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-lg group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-300">
                          <span className="font-bold text-gray-600 text-sm">{index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}</span>
                        </div>
                        <div>
                          <div className="font-bold  text-lg group-hover:text-blue-900 transition-colors">{product.description}</div>
                          <Badge variant="outline" className="mt-2 bg-gradient-to-r from-gray-100 to-gray-200 border-0 text-gray-700 font-semibold">
                            <div className="flex items-center gap-1">
                              {categorizeProduct(product.description) === 'perruque' && <Crown className="h-3 w-3" />}
                              {categorizeProduct(product.description) === 'tissage' && <Diamond className="h-3 w-3" />}
                              {categorizeProduct(product.description) === 'autre' && <ShoppingBag className="h-3 w-3" />}
                              {categorizeProduct(product.description)}
                            </div>
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-black  bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                          {product.purchasePrice.toFixed(2)}
                        </div>
                        <span className="text-xl font-black  bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">€</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-lg",
                          product.quantity === 0 ? "bg-gradient-to-br from-red-500 to-red-600 text-white" :
                          product.quantity <= 2 ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white" :
                          "bg-gradient-to-br from-green-500 to-green-600 text-white"
                        )}>
                          {product.quantity}
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <Badge className={cn("font-bold text-sm px-4 py-2 rounded-xl shadow-lg flex items-center gap-2", priority.color)}>
                        <PriorityIcon className="h-4 w-4" />
                        {priority.label}
                      </Badge>
                    </td>
                    <td className="p-6">
                      <div className="flex gap-3">
                        <ModernActionButton
                          buttonSize="sm"
                          variant="outline"
                          gradient="blue"
                          icon={Edit}
                          onClick={() => setEditingProduct(product)}
                          className="btn-3d hover:scale-110"
                        />
                        <ModernActionButton
                          buttonSize="sm"
                          variant="outline"
                          gradient="red"
                          icon={Trash2}
                          onClick={() => setDeletingProduct(product)}
                          className="btn-3d hover:scale-110"
                        />
                        <ModernActionButton
                          buttonSize="sm"
                          variant="outline"
                          gradient="purple"
                          icon={Eye}
                          onClick={() => setViewingProduct(product)}
                          className="btn-3d hover:scale-110"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Premium */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 p-6 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 via-white to-gray-50">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <ModernActionButton
                key={page}
                buttonSize="sm"
                variant={currentPage === page ? "solid" : "outline"}
                gradient={currentPage === page ? "green" : "indigo"}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "btn-3d w-12 h-12 rounded-xl font-black text-lg",
                  currentPage === page ? "shadow-xl shadow-green-500/30" : "hover:scale-110"
                )}
              >
                {page}
              </ModernActionButton>
            ))}
          </div>
        )}
      </ModernContainer>

      {/* Dialog de modification Premium */}
      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
            <DialogHeader className="text-center space-y-4 pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Edit className="h-8 w-8 text-white" />
              </div>
              <DialogTitle className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ✨ Modifier Produit Premium
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  Description du produit
                </Label>
                <Input
                  id="edit-description"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="bg-white/80 border-2 border-blue-200 focus:border-blue-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Prix (€)
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editingProduct.purchasePrice}
                  onChange={(e) => setEditingProduct({ ...editingProduct, purchasePrice: parseFloat(e.target.value) || 0 })}
                  className="bg-white/80 border-2 border-blue-200 focus:border-blue-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-quantity" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                  Quantité en stock
                </Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={editingProduct.quantity}
                  onChange={(e) => setEditingProduct({ ...editingProduct, quantity: parseInt(e.target.value) || 0 })}
                  className="bg-white/80 border-2 border-blue-200 focus:border-blue-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                />
              </div>
              <div className="flex gap-3 pt-6">
                <ModernActionButton
                  onClick={handleEditProduct}
                  gradient="blue"
                  buttonSize="lg"
                  className="flex-1 btn-3d"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Sauvegarder
                </ModernActionButton>
                <ModernActionButton
                  variant="outline"
                  gradient="red"
                  onClick={() => setEditingProduct(null)}
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
          <DialogContent className="bg-gradient-to-br from-white via-purple-50 to-indigo-50 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
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
                <div className="p-4 bg-white/80 rounded-xl border-2 border-indigo-200">
                  <Label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-indigo-500" />
                    Statut
                  </Label>
                  {(() => {
                    const priority = getPriority(viewingProduct.quantity);
                    const PriorityIcon = priority.icon;
                    return (
                      <Badge className={cn("font-bold text-sm px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 w-fit", priority.color)}>
                        <PriorityIcon className="h-4 w-4" />
                        {priority.label}
                      </Badge>
                    );
                  })()}
                </div>
              </div>
              <div className="flex justify-center pt-6">
                <ModernActionButton
                  variant="outline"
                  gradient="purple"
                  onClick={() => setViewingProduct(null)}
                  buttonSize="lg"
                  className="px-8"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Fermer
                </ModernActionButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

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
    </div>
  );
};

export default Inventaire;
