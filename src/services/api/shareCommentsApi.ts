/**
 * shareCommentsApi.ts
 * 
 * Service API pour la gestion des commentaires sur les liens partagés.
 * 
 * Routes publiques (sans auth) :
 * - submit : Soumettre des commentaires pour un lien partagé
 * - send : Finaliser et envoyer les commentaires (déclenche la génération du snapshot HTML)
 * - check : Vérifier si un lien a déjà été commenté
 * 
 * Routes authentifiées (admin) :
 * - list : Lister les commentaires par type (notes/pointage/taches)
 * - unread : Compteur de commentaires non lus par type
 * - markRead : Marquer un commentaire comme lu
 * - detail : Détail d'un commentaire spécifique
 * - delete : Supprimer un commentaire (doit être lu)
 * - syncHtml : Régénérer les fichiers HTML manquants depuis le JSON
 * - exportJson / importJson : Sauvegarde et restauration des commentaires
 * - snapshotUrl : URL du fichier snapshot HTML
 */
import api from './api';
import { getBaseURL } from './api';

export interface CommentItemData {
  index: number;
  text: string;
  itemData?: any;
  itemLabel?: string;
}

export interface ShareComment {
  id: string;
  token: string;
  tokenId: string;
  type: 'notes' | 'pointage' | 'taches';
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  comments: CommentItemData[];
  generalComment: string;
  status: 'validated' | 'sent';
  createdAt: string;
  sentAt?: string;
  read: boolean;
  allItems?: any[];
  snapshotFile?: string;
}

export interface UnreadCounts {
  notes: number;
  pointage: number;
  taches: number;
  total: number;
}

const shareCommentsApi = {
  // Public - no auth
  submit: async (token: string, data: {
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
    comments: CommentItemData[];
    generalComment: string;
    allItems?: any[];
  }) => {
    const base = getBaseURL();
    const res = await fetch(`${base}/api/share-comments/submit/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error || 'Erreur');
    }
    return res.json();
  },

  // Public - no auth
  send: async (id: string) => {
    const base = getBaseURL();
    const res = await fetch(`${base}/api/share-comments/send/${id}`, {
      method: 'POST',
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error || 'Erreur');
    }
    return res.json();
  },

  // Public - no auth
  check: async (token: string) => {
    const base = getBaseURL();
    const res = await fetch(`${base}/api/share-comments/check/${token}`);
    if (!res.ok) throw new Error('Erreur');
    return res.json() as Promise<{ hasCommented: boolean; status: string | null }>;
  },

  // Authenticated
  list: (type?: string) =>
    api.get<ShareComment[]>(`/api/share-comments/list${type ? `?type=${type}` : ''}`),

  unread: () =>
    api.get<UnreadCounts>('/api/share-comments/unread'),

  markRead: (id: string) =>
    api.patch(`/api/share-comments/read/${id}`),

  detail: (id: string) =>
    api.get<ShareComment>(`/api/share-comments/detail/${id}`),

  // Sync: regenerate missing HTML from JSON backup
  syncHtml: () =>
    api.post('/api/share-comments/sync-html'),

  // Export all comments as JSON
  exportJson: () =>
    api.get<{ comments: ShareComment[]; total: number }>('/api/share-comments/export-json'),

  // Import comments from JSON
  importJson: (comments: ShareComment[]) =>
    api.post('/api/share-comments/import-json', { comments }),

  // Authenticated: Delete a comment (must be read first)
  delete: (id: string) =>
    api.delete(`/api/share-comments/delete/${id}`),

  // Get snapshot file URL
  snapshotUrl: (filename: string) => {
    const base = getBaseURL();
    return `${base}/api/share-comments/snapshot/${filename}`;
  },
};

export default shareCommentsApi;
