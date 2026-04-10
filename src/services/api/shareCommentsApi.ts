import api from './api';
import { getBaseURL } from './api';

export interface ShareComment {
  id: string;
  token: string;
  tokenId: string;
  type: 'notes' | 'pointage' | 'taches';
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  comments: { index: number; text: string }[];
  generalComment: string;
  status: 'validated' | 'sent';
  createdAt: string;
  sentAt?: string;
  read: boolean;
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
    comments: { index: number; text: string }[];
    generalComment: string;
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
};

export default shareCommentsApi;
