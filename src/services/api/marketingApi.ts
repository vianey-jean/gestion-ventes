// Service API pour le marketing
import api from './api';
import { AxiosResponse } from 'axios';

export interface MarketingGenerationRequest {
  productDescription: string;
  purchasePrice?: number;
  sellingPrice?: number;
  quantity?: number;
}

export interface MarketingGenerationResponse {
  success: boolean;
  description?: string;
  error?: string;
}

export const marketingApiService = {
  async generateDescription(data: MarketingGenerationRequest): Promise<MarketingGenerationResponse> {
    const response: AxiosResponse<MarketingGenerationResponse> = await api.post('/api/marketing/generate-description', data);
    return response.data;
  },
};

export default marketingApiService;
