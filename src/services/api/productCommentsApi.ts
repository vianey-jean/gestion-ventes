import api from './api';

export interface ProductComment {
  id: string;
  productId: string;
  comment: string;
  rating: number;
  clientName?: string;
  createdAt: string;
}

export interface ProductRatingInfo {
  average: number;
  count: number;
  comments: ProductComment[];
}

export const productCommentsApi = {
  async getAllRatings(): Promise<Record<string, ProductRatingInfo>> {
    const response = await api.get('/api/product-comments/ratings');
    return response.data;
  },

  async getByProductId(productId: string): Promise<ProductComment[]> {
    const response = await api.get(`/api/product-comments/product/${productId}`);
    return response.data;
  },

  async create(data: { productId: string; comment: string; rating: number; clientName?: string }): Promise<ProductComment> {
    const response = await api.post('/api/product-comments', data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/product-comments/${id}`);
  },

  async deleteByProductId(productId: string): Promise<void> {
    await api.delete(`/api/product-comments/product/${productId}`);
  },
};
