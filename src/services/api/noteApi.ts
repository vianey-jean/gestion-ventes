import api from './api';

export interface NoteColumn {
  id: string;
  title: string;
  color: string;
  order: number;
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
  createdAt: string;
  updatedAt: string;
}

const noteApi = {
  // Notes
  getAll: () => api.get<Note[]>('/api/notes'),
  create: (data: Partial<Note>) => api.post<Note>('/api/notes', data),
  update: (id: string, data: Partial<Note>) => api.put<Note>(`/api/notes/${id}`, data),
  delete: (id: string) => api.delete(`/api/notes/${id}`),
  move: (id: string, columnId: string, order: number) => api.put<Note>(`/api/notes/${id}/move`, { columnId, order }),
  reorder: (updates: { id: string; columnId: string; order: number }[]) => api.put('/api/notes/batch/reorder', { updates }),

  // Columns
  getColumns: () => api.get<NoteColumn[]>('/api/notes/columns'),
  createColumn: (data: Partial<NoteColumn>) => api.post<NoteColumn>('/api/notes/columns', data),
  updateColumn: (id: string, data: Partial<NoteColumn>) => api.put<NoteColumn>(`/api/notes/columns/${id}`, data),
  deleteColumn: (id: string) => api.delete(`/api/notes/columns/${id}`),
};

export default noteApi;
