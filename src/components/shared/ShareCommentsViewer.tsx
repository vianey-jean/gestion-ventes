import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MessageCircle, Eye, Clock, Download } from 'lucide-react';
import shareCommentsApi, { ShareComment } from '@/services/api/shareCommentsApi';

interface ShareCommentsViewerProps {
  open: boolean;
  onClose: () => void;
  type: 'notes' | 'pointage' | 'taches';
  typeLabel: string;
  onCountChange?: (count: number) => void;
}

const ShareCommentsViewer: React.FC<ShareCommentsViewerProps> = ({ open, onClose, type, typeLabel, onCountChange }) => {
  const [comments, setComments] = useState<ShareComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedComment, setSelectedComment] = useState<ShareComment | null>(null);

  useEffect(() => {
    if (open) fetchComments();
  }, [open]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await shareCommentsApi.list(type);
      setComments(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (comment: ShareComment) => {
    setSelectedComment(comment);
    if (!comment.read) {
      try {
        await shareCommentsApi.markRead(comment.id);
        setComments(prev => prev.map(c => c.id === comment.id ? { ...c, read: true } : c));
        onCountChange?.(-1);
      } catch {}
    }
  };

  const handleDownloadPDF = (comment: ShareComment) => {
    // Generate a simple text-based PDF-like download
    const content = [
      `COMMENTAIRES - ${typeLabel.toUpperCase()}`,
      `Date: ${new Date(comment.createdAt).toLocaleString('fr-FR')}`,
      `Envoyé: ${comment.sentAt ? new Date(comment.sentAt).toLocaleString('fr-FR') : 'N/A'}`,
      '',
      '--- INFORMATIONS ---',
      `Prénom: ${comment.prenom}`,
      `Nom: ${comment.nom}`,
      `Téléphone: ${comment.telephone || 'N/A'}`,
      `Email: ${comment.email || 'N/A'}`,
      '',
      '--- COMMENTAIRES SPÉCIFIQUES ---',
      ...comment.comments.map(c => `  Élément #${c.index + 1}: ${c.text}`),
      '',
      '--- COMMENTAIRE GÉNÉRAL ---',
      comment.generalComment || '(aucun)',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commentaires_${type}_${comment.prenom}_${comment.nom}_${comment.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-2xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            <h3 className="font-bold text-gray-800 dark:text-white">Commentaires reçus - {typeLabel}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {selectedComment ? (
          <div className="flex-1 overflow-y-auto">
            <button onClick={() => setSelectedComment(null)} className="text-xs text-blue-500 hover:underline mb-3 flex items-center gap-1">
              ← Retour à la liste
            </button>
            <div className="space-y-4">
              {/* Contact info */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                <h4 className="font-bold text-sm text-gray-800 dark:text-white mb-2">Informations de contact</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                    <User className="h-3 w-3" /> {selectedComment.prenom} {selectedComment.nom}
                  </div>
                  {selectedComment.telephone && (
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                      <Phone className="h-3 w-3" /> {selectedComment.telephone}
                    </div>
                  )}
                  {selectedComment.email && (
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                      <Mail className="h-3 w-3" /> {selectedComment.email}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Clock className="h-3 w-3" /> {new Date(selectedComment.sentAt || selectedComment.createdAt).toLocaleString('fr-FR')}
                  </div>
                </div>
              </div>

              {/* Inline comments */}
              {selectedComment.comments.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm text-gray-800 dark:text-white mb-2">Commentaires spécifiques</h4>
                  <div className="space-y-2">
                    {selectedComment.comments.map((c, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5 shrink-0">#{c.index + 1}</span>
                        <p className="text-xs text-gray-700 dark:text-gray-300">{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* General comment */}
              {selectedComment.generalComment && (
                <div>
                  <h4 className="font-bold text-sm text-gray-800 dark:text-white mb-2">Commentaire général</h4>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedComment.generalComment}</p>
                  </div>
                </div>
              )}

              {/* Download */}
              <button onClick={() => handleDownloadPDF(selectedComment)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <Download className="h-4 w-4" />
                Télécharger en fichier
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">Aucun commentaire reçu</p>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className={`p-3 rounded-xl border cursor-pointer hover:shadow-md transition-all ${
                  comment.read
                    ? 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                }`} onClick={() => handleView(comment)}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-sm font-bold text-gray-800 dark:text-white">
                        {comment.prenom} {comment.nom}
                      </span>
                      {!comment.read && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">Nouveau</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400">
                        {new Date(comment.sentAt || comment.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      <Eye className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {comment.comments.length} commentaire{comment.comments.length > 1 ? 's' : ''} spécifique{comment.comments.length > 1 ? 's' : ''}
                    {comment.generalComment ? ' + commentaire général' : ''}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareCommentsViewer;
