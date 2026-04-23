// Service API pour les produits
import api from './api';
import { Product, ProductFormData } from '@/types/product';
import { AxiosResponse } from 'axios';

export const productApiService = {
  async getAll(): Promise<Product[]> {
    console.log('📦 Fetching products from API...');
    const response: AxiosResponse<Product[]> = await api.get('/api/products');
    // Guard: ensure we always return an array even if server returns unexpected data
    const products = Array.isArray(response.data) ? response.data : [];
    console.log(`✅ Retrieved ${products.length} products from API`);
    return products;
  },

  async getById(id: string): Promise<Product> {
    const response: AxiosResponse<Product> = await api.get(`/api/products/${id}`);
    return response.data;
  },

  async create(data: ProductFormData): Promise<Product> {
    console.log('📝 Adding new product:', data);
    const response: AxiosResponse<Product> = await api.post('/api/products', data);
    console.log('✅ Product added successfully with code:', response.data.code, response.data);
    return response.data;
  },

  async update(id: string, data: Partial<ProductFormData>): Promise<Product> {
    console.log('📝 Updating product:', id, data);
    const response: AxiosResponse<Product> = await api.put(`/api/products/${id}`, data);
    console.log('✅ Product updated successfully:', response.data);
    return response.data;
  },

  async delete(id: string): Promise<boolean> {
    console.log('🗑️ Deleting product with ID:', id);
    await api.delete(`/api/products/${id}`);
    console.log('✅ Product deleted successfully');
    return true;
  },

  // Générer les codes pour les produits existants qui n'en ont pas
  async generateCodesForExistingProducts(): Promise<{ message: string; updatedCount: number }> {
    console.log('🔧 Generating codes for existing products...');
    const response = await api.post('/api/products/generate-codes');
    console.log('✅ Codes generated:', response.data);
    return response.data;
  },

  // Créer un produit avec photos en une seule requête (multipart/form-data)
  async createWithPhotos(
    data: ProductFormData,
    files: File[],
    mainIndex = 0
  ): Promise<Product> {
    const fd = new FormData();
    fd.append('description', data.description);
    fd.append('purchasePrice', String(data.purchasePrice));
    fd.append('quantity', String(data.quantity));
    if (data.fournisseur) fd.append('fournisseur', data.fournisseur);
    if (data.sellingPrice !== undefined) fd.append('sellingPrice', String(data.sellingPrice));
    fd.append('mainPhotoIndex', String(mainIndex));
    files.forEach(f => fd.append('photos', f));

    const response: AxiosResponse<Product> = await api.post('/api/products/with-photos', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log('✅ Product created with photos:', response.data);
    return response.data;
  },

  // Remplace toutes les photos d'un produit (supprime celles non gardées + ajoute les nouvelles)
  async replacePhotos(
    productId: string,
    newFiles: File[],
    keptExistingUrls: string[],
    mainIndex = 0
  ): Promise<Product> {
    const fd = new FormData();
    fd.append('photosJson', JSON.stringify(keptExistingUrls));
    fd.append('mainPhotoIndex', String(mainIndex));
    newFiles.forEach(f => fd.append('photos', f));

    const response: AxiosResponse<Product> = await api.put(`/api/products/${productId}/photos`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log('✅ Product photos replaced:', response.data);
    return response.data;
  },
};

export default productApiService;
