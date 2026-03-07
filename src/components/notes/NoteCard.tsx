import React, { useState, useRef, useEffect } from 'react';
import { GripVertical, Edit3, Trash2, MoreVertical, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Note } from '@/services/api/noteApi';

interface NoteCardProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete, onDragStart }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="group relative rounded-2xl border border-white/30 dark:border-white/10 backdrop-blur-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-grab active:cursor-grabbing hover:scale-[1.02]"
      style={{ backgroundColor: note.color === '#ffffff' ? 'rgba(255,255,255,0.9)' : note.color + 'e6' }}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 opacity-70" />

      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />

            <h4 className={cn("text-sm font-bold text-gray-900 dark:text-white truncate", note.bold && "text-base")}>
              {note.title || 'Sans titre'}
            </h4>
          </div>

          {/* Actions directes */}
          <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">

            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1.5 rounded-xl hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-all active:scale-90"
            >
              <Edit3 className="h-4 w-4 text-cyan-500" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all active:scale-90"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </button>

          </div>
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

        {note.drawing && (
          <div className="mt-2 rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-600/50">
            <img src={note.drawing} alt="Dessin" className="w-full h-16 object-contain bg-white" />
          </div>
        )}

        <div className="mt-2 text-[10px] text-gray-400 font-medium">
          {new Date(note.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
