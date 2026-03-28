/**
 * index.ts — Export centralisé de tous les services API
 * 
 * Permet d'importer n'importe quel service API depuis un seul point d'entrée :
 * import { clientApiService, saleApiService } from '@/services/api';
 */
export { default as api, getBaseURL } from './api';
export { default as authApiService } from './authApi';
export { default as clientApiService } from './clientApi';
export { default as productApiService } from './productApi';
export { default as saleApiService } from './saleApi';
export { default as commandeApiService } from './commandeApi';
export { default as pretFamilleApiService } from './pretFamilleApi';
export { default as pretProduitApiService } from './pretProduitApi';
export { default as depenseApiService } from './depenseApi';
export { default as beneficeApiService } from './beneficeApi';
export { default as remboursementApiService } from './remboursementApi';

