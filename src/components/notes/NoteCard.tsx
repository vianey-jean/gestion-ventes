import React, { useState } from 'react';
import { GripVertical, Edit3, Trash2, Mic, X, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Note, getDrawingUrl } from '@/services/api/noteApi';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface NoteCardProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete, onDragStart }) => {
  const [showDetail, setShowDetail] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'edit' | 'delete' | null>(null);

  const drawingUrl = getDrawingUrl(note.drawing);

  const handleConfirm = () => {
    if (confirmAction === 'edit') {
      onEdit();
    } else if (confirmAction === 'delete') {
      onDelete();
    }
    setConfirmAction(null);
    setShowDetail(false);
  };

  return (
    <>
      <div
        draggable
        onDragStart={onDragStart}
        onClick={() => setShowDetail(true)}
        className="group relative rounded-2xl border border-white/30 dark:border-white/10 backdrop-blur-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-[1.02]"
        style={{ backgroundColor: note.color === '#ffffff' ? 'rgba(255,255,255,0.9)' : note.color + 'e6' }}
      >
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 opacity-70" />

        <div className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
              <h4 className={cn("text-sm font-bold text-gray-900 dark:text-white truncate", note.bold && "text-base")}>
                {note.title || 'Sans titre'}
              </h4>
            </div>
            <Eye className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>

          {note.content && (
            <div className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap line-clamp-4 leading-relaxed">
              {note.content.split('\n').map((line, i) => (
                <span key={i} className={cn(
                  note.boldLines?.includes(i) && 'font-bold',
                  note.underlineLines?.includes(i) && 'underline'
                )}>
                  {line}{i < note.content.split('\n').length - 1 && '\n'}
                </span>
              ))}
            </div>
          )}

          {note.voiceText && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-900/10 px-2 py-1 rounded-lg">
              <Mic className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{note.voiceText.substring(0, 60)}...</span>
            </div>
          )}

          {drawingUrl && (
            <div className="mt-2 rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-600/50">
              <img src={drawingUrl} alt="Dessin" className="w-full h-16 object-contain bg-white" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}

          <div className="mt-2 text-[10px] text-gray-400 font-medium">
            {new Date(note.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-white/20 dark:border-white/10 rounded-3xl">
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between">
              <h3 className={cn("text-lg font-bold text-gray-900 dark:text-white", note.bold && "text-xl font-black")}>
                {note.title || 'Sans titre'}
              </h3>
              <button onClick={() => setShowDetail(false)} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {note.content && (
              <div className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/50">
                {note.content.split('\n').map((line, i) => (
                  <span key={i} className={cn(
                    note.boldLines?.includes(i) && 'font-bold',
                    note.underlineLines?.includes(i) && 'underline'
                  )}>
                    {line}{i < note.content.split('\n').length - 1 && '\n'}
                  </span>
                ))}
              </div>
            )}

            {note.voiceText && (
              <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
                <div className="flex items-center gap-2 mb-1">
                  <Mic className="h-3.5 w-3.5 text-violet-500" />
                  <span className="text-xs font-bold text-violet-600 dark:text-violet-400">Texte vocal</span>
                </div>
                <p className="text-sm text-violet-700 dark:text-violet-300">{note.voiceText}</p>
              </div>
            )}

            {drawingUrl && (
              <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <img src={drawingUrl} alt="Dessin" className="w-full h-48 object-contain bg-white" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}

            <div className="text-xs text-gray-400">
              Créé le {new Date(note.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              {note.updatedAt !== note.createdAt && (
                <> · Modifié le {new Date(note.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</>
              )}
            </div>

            {/* Confirm action overlay */}
            {confirmAction && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-3">
                  {confirmAction === 'delete' ? '⚠️ Confirmer la suppression de cette note ?' : '✏️ Confirmer la modification de cette note ?'}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setConfirmAction(null)} className="flex-1 rounded-xl">Annuler</Button>
                  <Button size="sm" onClick={handleConfirm}
                    className={cn("flex-1 rounded-xl text-white", confirmAction === 'delete' ? "bg-red-500 hover:bg-red-600" : "bg-cyan-500 hover:bg-cyan-600")}>
                    Confirmer
                  </Button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {!confirmAction && (
              <div className="flex gap-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                <Button
                  variant="outline"
                  onClick={() => setConfirmAction('edit')}
                  className="flex-1 rounded-xl text-cyan-600 border-cyan-200 hover:bg-cyan-50 dark:border-cyan-800 dark:hover:bg-cyan-900/20"
                >
                  <Edit3 className="h-4 w-4 mr-2" /> Modifier
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setConfirmAction('delete')}
                  className="flex-1 rounded-xl text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NoteCard;
