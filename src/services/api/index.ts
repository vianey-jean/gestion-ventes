/**
 * index.ts — Export centralisé de tous les services API
 * 
 * Architecture MVC : cette couche "Services" gère tous les appels HTTP.
 * Chaque fichier correspond à une ressource backend.
 * 
 * Usage : import { productApiService, saleApiService } from '@/services/api';
 */

// Instance Axios centralisée
export { default as api, getBaseURL } from './api';

// Services API par module
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
export { default as comptaApiService } from './comptaApi';
export { default as pointageApiService } from './pointageApi';
export { default as travailleurApiService } from './travailleurApi';
export { default as entrepriseApiService } from './entrepriseApi';
export { default as avanceApiService } from './avanceApi';
export { default as tacheApiService } from './tacheApi';
export { default as noteApiService } from './noteApi';
export { default as noteShareApiService } from './noteShareApi';
export { default as objectifApiService } from './objectifApi';
export { default as rdvApiService } from './rdvApi';
export { default as fournisseurApiService } from './fournisseurApi';
export { default as settingsApiService } from './settingsApi';
export { default as parametresApiService } from './parametresApi';
export { default as moduleSettingsApiService } from './moduleSettingsApi';
export { default as profileApiService } from './profileApi';
export { default as indisponibleApiService } from './indisponibleApi';
export { default as shareLinksApiService } from './shareLinksApi';
export { default as rdvNotificationsApiService } from './rdvNotificationsApi';
export { default as nouvelleAchatApiService } from './nouvelleAchatApi';
