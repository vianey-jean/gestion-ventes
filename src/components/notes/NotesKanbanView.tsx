import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import noteApi, { Note, NoteColumn } from '@/services/api/noteApi';
import { Plus, StickyNote, Columns3, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import KanbanColumn from './KanbanColumn';
import NoteFormModal from './NoteFormModal';
import ColumnFormModal from './ColumnFormModal';
import ConfirmModal from './ConfirmModal';

const NotesKanbanView: React.FC = () => {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [columns, setColumns] = useState<NoteColumn[]>([]);
  const [loading, setLoading] = useState(true);

  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Partial<Note> | null>(null);
  const [showColForm, setShowColForm] = useState(false);
  const [editingCol, setEditingCol] = useState<NoteColumn | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ message: string; action: () => void } | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [notesRes, colsRes] = await Promise.all([noteApi.getAll(), noteApi.getColumns()]);
      setNotes(notesRes.data);
      setColumns(colsRes.data);
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaveNote = async (data: Partial<Note>) => {
    setConfirmAction({
      message: data.id ? 'Confirmer la modification de cette note ?' : 'Confirmer la création de cette note ?',
      action: async () => {
        try {
          if (data.id) {
            await noteApi.update(data.id, data);
            toast({ title: '✅ Note modifiée' });
          } else {
            await noteApi.create(data);
            toast({ title: '✅ Note créée' });
          }
          setShowNoteForm(false);
          setEditingNote(null);
          fetchData();
        } catch {
          toast({ title: 'Erreur', variant: 'destructive' });
        }
        setConfirmAction(null);
      }
    });
  };

  const handleDeleteNote = (id: string) => {
    setConfirmAction({
      message: 'Confirmer la suppression de cette note ?',
      action: async () => {
        try {
          await noteApi.delete(id);
          toast({ title: '✅ Note supprimée' });
          fetchData();
        } catch {
          toast({ title: 'Erreur', variant: 'destructive' });
        }
        setConfirmAction(null);
      }
    });
  };

  const handleSaveColumn = async (data: Partial<NoteColumn>) => {
    setConfirmAction({
      message: editingCol ? 'Confirmer la modification de cette colonne ?' : 'Confirmer la création de cette colonne ?',
      action: async () => {
        try {
          if (editingCol) {
            await noteApi.updateColumn(editingCol.id, data);
            toast({ title: '✅ Colonne modifiée' });
          } else {
            await noteApi.createColumn(data);
            toast({ title: '✅ Colonne créée' });
          }
          setShowColForm(false);
          setEditingCol(null);
          fetchData();
        } catch {
          toast({ title: 'Erreur', variant: 'destructive' });
        }
        setConfirmAction(null);
      }
    });
  };

  const handleDeleteColumn = (col: NoteColumn) => {
    setConfirmAction({
      message: `Supprimer la colonne "${col.title}" ? Les notes seront déplacées.`,
      action: async () => {
        try {
          await noteApi.deleteColumn(col.id);
          toast({ title: '✅ Colonne supprimée' });
          fetchData();
        } catch {
          toast({ title: 'Erreur', variant: 'destructive' });
        }
        setConfirmAction(null);
      }
    });
  };

  const handleDragStart = (e: React.DragEvent, noteId: string) => {
    e.dataTransfer.setData('noteId', noteId);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDragOverColId(colId);
  };

  const handleDrop = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData('noteId');
    setDragOverColId(null);
    if (!noteId) return;
    const note = notes.find(n => n.id === noteId);
    if (!note || note.columnId === targetColId) return;
    const targetCol = columns.find(c => c.id === targetColId);
    setConfirmAction({
      message: `Déplacer cette note vers "${targetCol?.title}" ?`,
      action: async () => {
        try {
          const order = notes.filter(n => n.columnId === targetColId).length;
          await noteApi.move(noteId, targetColId, order);
          toast({ title: '✅ Note déplacée' });
          fetchData();
        } catch {
          toast({ title: 'Erreur', variant: 'destructive' });
        }
        setConfirmAction(null);
      }
    });
  };

  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-2 sm:px-4 pb-12">
      {/* Hero */}
      <div className="relative overflow-hidden py-6 sm:py-8">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-rose-500/5" />
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-xl mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <StickyNote className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                Prise de Notes
                <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{notes.length} notes · {columns.length} colonnes</p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 rounded-2xl sm:rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.3)] p-5 sm:p-6 border border-white/25 max-w-xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
            <div className="relative flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => { setEditingNote(null); setShowNoteForm(true); }}
                className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-700 border border-cyan-300/40 text-white shadow-[0_20px_70px_rgba(6,182,212,0.5)] hover:shadow-[0_35px_100px_rgba(6,182,212,0.7)] rounded-2xl px-5 py-2.5 font-bold text-sm transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="h-4 w-4 mr-2" /> Nouvelle note
              </Button>
              <Button
                onClick={() => { setEditingCol(null); setShowColForm(true); }}
                className="relative overflow-hidden bg-gradient-to-br from-violet-500 via-violet-600 to-purple-700 border border-violet-300/40 text-white shadow-[0_20px_70px_rgba(139,92,246,0.5)] hover:shadow-[0_35px_100px_rgba(139,92,246,0.7)] rounded-2xl px-5 py-2.5 font-bold text-sm transition-all hover:scale-105 active:scale-95"
              >
                <Columns3 className="h-4 w-4 mr-2" /> Ajouter colonne
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4 -mx-2 sm:-mx-4 px-2 sm:px-4">
        <div className="flex gap-3 sm:gap-4 min-w-max">
          {sortedColumns.map(col => (
            <KanbanColumn
              key={col.id}
              column={col}
              notes={notes.filter(n => n.columnId === col.id)}
              onAddNote={() => { setEditingNote({ columnId: col.id }); setShowNoteForm(true); }}
              onEditNote={(note) => { setEditingNote(note); setShowNoteForm(true); }}
              onDeleteNote={handleDeleteNote}
              onDragStart={handleDragStart}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              onEditColumn={() => { setEditingCol(col); setShowColForm(true); }}
              onDeleteColumn={() => handleDeleteColumn(col)}
              isDragOver={dragOverColId === col.id}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <NoteFormModal open={showNoteForm} onOpenChange={setShowNoteForm} note={editingNote} columns={columns} onSave={handleSaveNote} />
      <ColumnFormModal open={showColForm} onOpenChange={setShowColForm} column={editingCol} onSave={handleSaveColumn} />
      {confirmAction && (
        <ConfirmModal open={true} message={confirmAction.message} onConfirm={confirmAction.action} onCancel={() => setConfirmAction(null)} />
      )}
    </div>
  );
};

export default NotesKanbanView;
