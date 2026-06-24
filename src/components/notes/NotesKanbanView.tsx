import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import noteApi, { Note, NoteColumn } from '@/services/api/noteApi';
import ShareLinkModal from '@/components/shared/ShareLinkModal';
import SelectiveShareModal from '@/components/shared/SelectiveShareModal';
import ShareCommentsViewer from '@/components/shared/ShareCommentsViewer';
import { useRealtimeCommentNotifications } from '@/hooks/useRealtimeCommentNotifications';
import KanbanColumn from './KanbanColumn';
import NoteFormModal from './NoteFormModal';
import ColumnFormModal from './ColumnFormModal';
import ConfirmModal from './ConfirmModal';
import NotesHero from './NotesHero';
import PremiumLoading from '@/components/ui/premium-loading';

const SEPARATOR_COLORS = [
  'from-cyan-400 to-blue-500',
  'from-violet-400 to-purple-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-indigo-400 to-blue-600',
  'from-fuchsia-400 to-purple-600',
];

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
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSelectiveShare, setShowSelectiveShare] = useState(false);
  const [showCommentsViewer, setShowCommentsViewer] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    import('@/services/api/shareCommentsApi').then(mod => {
      mod.default.unread().then(res => setCommentCount(res.data.notes)).catch(() => { });
    });
  }, []);

  // Real-time SSE comment notifications
  useRealtimeCommentNotifications({
    type: 'notes',
    onCountChange: (delta) => setCommentCount(prev => prev + delta),
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [notesRes, colsRes] = await Promise.all([noteApi.getAll(), noteApi.getColumns()]);
      setNotes(Array.isArray(notesRes.data) ? notesRes.data : []);
      setColumns(Array.isArray(colsRes.data) ? colsRes.data : []);
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
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDragOverColId(colId);
  };

  const handleDrop = (e: React.DragEvent, targetColId: string, dropIndex?: number) => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData('noteId');
    setDragOverColId(null);
    if (!noteId) return;
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    // Same column reorder
    if (note.columnId === targetColId) {
      const colNotes = notes.filter(n => n.columnId === targetColId).sort((a, b) => a.order - b.order);
      const oldIndex = colNotes.findIndex(n => n.id === noteId);
      const newIndex = dropIndex !== undefined ? dropIndex : colNotes.length - 1;
      if (oldIndex === newIndex) return;

      // Reorder
      const reordered = [...colNotes];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);
      const updates = reordered.map((n, i) => ({ id: n.id, columnId: targetColId, order: i }));

      // Optimistic update
      setNotes(prev => {
        const other = prev.filter(n => n.columnId !== targetColId);
        const updated = reordered.map((n, i) => ({ ...n, order: i }));
        return [...other, ...updated];
      });

      noteApi.reorder(updates).then(() => fetchData()).catch(() => {
        toast({ title: 'Erreur de réordonnancement', variant: 'destructive' });
        fetchData();
      });
      return;
    }

    // Different column move
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

  const handleShareNotes = () => {
    setShowShareModal(true);
  };

  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <PremiumLoading text="Chargement des notes..." size="lg" overlay={false} variant="default" />
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-2 sm:px-4 pb-12">
      <NotesHero
        notesCount={notes.length}
        columnsCount={columns.length}
        commentCount={commentCount}
        onNewNote={() => { setEditingNote(null); setShowNoteForm(true); }}
        onNewColumn={() => { setEditingCol(null); setShowColForm(true); }}
        onShareNotes={handleShareNotes}
        onSelectiveShare={() => setShowSelectiveShare(true)}
        onViewComments={() => setShowCommentsViewer(true)}
      />

      {/* Kanban Board with vertical separators */}
      <div className="overflow-x-auto pb-4 -mx-2 sm:-mx-4 px-2 sm:px-4">
        <div className="flex min-w-max">
          {sortedColumns.map((col, colIndex) => {
            const colNotes = notes.filter(n => n.columnId === col.id);
            const colorClass = SEPARATOR_COLORS[colIndex % SEPARATOR_COLORS.length];

            return (
              <React.Fragment key={col.id}>
                {/* Left separator for first column, right separator for all */}
                {colIndex === 0 && (
                  <div className="flex-shrink-0 w-1.5 mr-3 self-stretch">
                    <div className={`w-full h-full rounded-full bg-gradient-to-b ${colorClass} opacity-80 shadow-lg`} />
                  </div>
                )}

                <KanbanColumn
                  column={col}
                  notes={colNotes}
                  onAddNote={() => { setEditingNote({ columnId: col.id }); setShowNoteForm(true); }}
                  onEditNote={(note) => { setEditingNote(note); setShowNoteForm(true); }}
                  onDeleteNote={handleDeleteNote}
                  onDragStart={handleDragStart}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDrop={(e, dropIndex) => handleDrop(e, col.id, dropIndex)}
                  onEditColumn={() => { setEditingCol(col); setShowColForm(true); }}
                  onDeleteColumn={() => handleDeleteColumn(col)}
                  isDragOver={dragOverColId === col.id}
                  onNoteUpdated={fetchData}
                />

                {/* Right separator */}
                <div className="flex-shrink-0 w-1.5 mx-3 self-stretch">
                  <div className={`w-full h-full rounded-full bg-gradient-to-b ${SEPARATOR_COLORS[(colIndex + 1) % SEPARATOR_COLORS.length]} opacity-80 shadow-lg`} />
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <NoteFormModal open={showNoteForm} onOpenChange={setShowNoteForm} note={editingNote} columns={columns} onSave={handleSaveNote} />
      <ColumnFormModal open={showColForm} onOpenChange={setShowColForm} column={editingCol} onSave={handleSaveColumn} />
      {confirmAction && (
        <ConfirmModal open={true} message={confirmAction.message} onConfirm={confirmAction.action} onCancel={() => setConfirmAction(null)} />
      )}

      {/* Share Modal */}
      <ShareLinkModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        type="notes"
        typeLabel="Notes"
      />
      <SelectiveShareModal
        open={showSelectiveShare}
        onClose={() => setShowSelectiveShare(false)}
        type="notes"
      />
      <ShareCommentsViewer
        open={showCommentsViewer}
        onClose={() => setShowCommentsViewer(false)}
        type="notes"
        typeLabel="Notes"
        onCountChange={(delta) => setCommentCount(prev => Math.max(0, prev + delta))}
      />
    </div>
  );
};

export default NotesKanbanView;
