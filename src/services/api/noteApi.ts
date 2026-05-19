import api, { getBaseURL } from './api';

export interface NoteColumn {
  id: string;
  title: string;
  color: string;
  order: number;
}

export interface NoteHistoryEntry {
  columnId: string;
  columnTitle: string;
  movedAt: string;
}

export interface NoteFichier {
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  columnId: string;
  order: number;
  color: string;
  bold: boolean;
  boldLines: number[];
  underlineLines: number[];
  drawing: string | null;
  voiceText: string;
  fichier?: NoteFichier | null; // legacy single field
  fichiers?: NoteFichier[];
  history: NoteHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

// Helper to build full URL for drawing images stored on server
export const getDrawingUrl = (drawingPath: string | null): string | null => {
  if (!drawingPath) return null;
  // If it's already a full URL or data URL, return as-is
  if (drawingPath.startsWith('http') || drawingPath.startsWith('data:')) return drawingPath;
  // Build full URL from server base
  const base = getBaseURL();
  return `${base}${drawingPath}`;
};

// Helper to build full URL for note attachment files
export const getFichierUrl = (fichierPath: string | null | undefined): string | null => {
  if (!fichierPath) return null;
  if (fichierPath.startsWith('http') || fichierPath.startsWith('data:')) return fichierPath;
  const base = getBaseURL();
  return `${base}${fichierPath}`;
};

const noteApi = {
  // Notes
  getAll: () => api.get<Note[]>('/api/notes'),
  create: (data: Partial<Note>) => api.post<Note>('/api/notes', data),
  update: (id: string, data: Partial<Note>) => api.put<Note>(`/api/notes/${id}`, data),
  delete: (id: string) => api.delete(`/api/notes/${id}`),
  move: (id: string, columnId: string, order: number) => api.put<Note>(`/api/notes/${id}/move`, { columnId, order }),
  reorder: (updates: { id: string; columnId: string; order: number }[]) => api.put('/api/notes/batch/reorder', { updates }),

  // Upload drawing - returns server URL path
  uploadDrawing: (dataUrl: string) => api.post<{ url: string; filename: string }>('/api/notes/upload-drawing', { drawing: dataUrl }),

  // Upload single attachment file (legacy)
  uploadFichier: (file: File) => {
    const fd = new FormData();
    fd.append('fichier', file);
    return api.post<NoteFichier>('/api/notes/upload-fichier', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Upload multiple attachment files
  uploadFichiers: (files: File[]) => {
    const fd = new FormData();
    files.forEach(f => fd.append('fichiers', f));
    return api.post<NoteFichier[]>('/api/notes/upload-fichiers', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Physically delete an uploaded fichier from disk
  deleteFichier: (url: string) => api.delete('/api/notes/fichier', { data: { url } }),

  // Columns
  getColumns: () => api.get<NoteColumn[]>('/api/notes/columns'),
  createColumn: (data: Partial<NoteColumn>) => api.post<NoteColumn>('/api/notes/columns', data),
  updateColumn: (id: string, data: Partial<NoteColumn>) => api.put<NoteColumn>(`/api/notes/columns/${id}`, data),
  deleteColumn: (id: string) => api.delete(`/api/notes/columns/${id}`),
};

export default noteApi;
