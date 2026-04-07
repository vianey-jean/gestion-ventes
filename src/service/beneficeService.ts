/**
 * COUCHE DE COMPATIBILITÉ — Redirige vers src/services/api/beneficeApi
 * avec les anciens noms de méthodes pour rétrocompatibilité
 */
import { beneficeApiService } from '@/services/api/beneficeApi';

export const beneficeService = {
  getBenefices: () => beneficeApiService.getAll(),
  getBeneficeByProductId: (productId: string) => beneficeApiService.getByProductId(productId),
  createBenefice: (data: any) => beneficeApiService.create(data),
  updateBenefice: (id: string, data: any) => beneficeApiService.update(id, data),
  deleteBenefice: (id: string) => beneficeApiService.delete(id),
};
