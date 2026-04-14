/**
 * SharedCommentForm.tsx
 * 
 * Formulaire de commentaires pour les visiteurs d'un lien partagé (public, sans authentification).
 * Permet de commenter des éléments spécifiques (pointage, tâches, notes) et d'ajouter un commentaire général.
 * 
 * Fonctionnalités :
 * - Mode commentaire avec sélection d'éléments individuels
 * - Capture des données complètes de chaque élément commenté (label, données contextuelles)
 * - Formulaire d'identification (nom, prénom, téléphone, email)
 * - Validation puis envoi des commentaires au serveur
 * - Génération automatique d'un snapshot HTML côté serveur à l'envoi
 */
import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquarePlus, Send, Check, X, User, Phone, Mail, MessageCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import shareCommentsApi from '@/services/api/shareCommentsApi';

interface SharedCommentFormProps {
  token: string;
  dataType: string;
  itemCount: number;
  items?: any[]; // The actual shared data items
  onCommentModeChange?: (active: boolean) => void;
}

const SharedCommentForm: React.FC<SharedCommentFormProps> = ({ token, dataType, itemCount, items = [], onCommentModeChange }) => {
  const [mode, setMode] = useState<'idle' | 'commenting' | 'validated' | 'sent' | 'already'>('idle');
  const [minimized, setMinimized] = useState(false);
  const [inlineComments, setInlineComments] = useState<{ index: number; text: string; itemData?: any }[]>([]);
  const [generalComment, setGeneralComment] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [commentId, setCommentId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeText, setActiveText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    shareCommentsApi.check(token).then(res => {
      if (res.hasCommented) {
        if (res.status === 'sent') setMode('already');
        else setMode('validated');
      }
    }).catch(() => {});
  }, [token]);

  // Get a human-readable label for the item at given index
  const getItemLabel = (index: number): string => {
    if (!items || !items[index]) return `Élément #${index + 1}`;
    const item = items[index];
    if (dataType === 'pointage') {
      return `${item.date} - ${item.entrepriseNom || ''} - ${item.travailleurNom || ''} - ${item.typePaiement === 'journalier' ? 'Journalier' : `${item.heures}h`} - ${item.montantTotal?.toFixed(2) || 0}€`;
    }
    if (dataType === 'taches') {
      return `${item.date} - ${item.description || ''} - ${item.heureDebut || ''}-${item.heureFin || ''} - ${item.travailleurNom || ''} - ${item.importance === 'pertinent' ? 'Pertinent' : 'Optionnel'}`;
    }
    if (dataType === 'notes') {
      return `${item.title || 'Sans titre'} - ${(item.content || '').substring(0, 50)}${(item.content || '').length > 50 ? '...' : ''}`;
    }
    return `Élément #${index + 1}`;
  };

  // Expose inline comment handler globally for item markers
  const handleAddInlineComment = useCallback((index: number) => {
    setActiveIndex(index);
    const existing = inlineComments.find(c => c.index === index);
    setActiveText(existing?.text || '');
  }, [inlineComments]);

  useEffect(() => {
    if (mode === 'commenting') {
      (window as any).__addInlineComment = handleAddInlineComment;
    } else {
      delete (window as any).__addInlineComment;
    }
    return () => { delete (window as any).__addInlineComment; };
  }, [mode, handleAddInlineComment]);

  // Notify parent about comment mode
  useEffect(() => {
    onCommentModeChange?.(mode === 'commenting');
  }, [mode, onCommentModeChange]);

  const handleSaveInlineComment = () => {
    if (activeIndex === null || !activeText.trim()) {
      setActiveIndex(null);
      setActiveText('');
      return;
    }
    const itemData = items?.[activeIndex] || null;
    setInlineComments(prev => {
      const filtered = prev.filter(c => c.index !== activeIndex);
      return [...filtered, { index: activeIndex, text: activeText.trim(), itemData }].sort((a, b) => a.index - b.index);
    });
    setActiveIndex(null);
    setActiveText('');
  };

  const handleRemoveInlineComment = (index: number) => {
    setInlineComments(prev => prev.filter(c => c.index !== index));
  };

  const handleValidate = async () => {
    if (!nom.trim() || !prenom.trim()) {
      setError('Nom et prénom sont obligatoires');
      return;
    }
    if (inlineComments.length === 0 && !generalComment.trim()) {
      setError('Ajoutez au moins un commentaire');
      return;
    }
    setError('');
    try {
      const result = await shareCommentsApi.submit(token, {
        nom: nom.trim(),
        prenom: prenom.trim(),
        telephone: telephone.trim(),
        email: email.trim(),
        comments: inlineComments.map(c => ({
          index: c.index,
          text: c.text,
          itemData: c.itemData || null,
          itemLabel: getItemLabel(c.index),
        })),
        generalComment: generalComment.trim(),
        allItems: items || [],
      });
      setCommentId(result.id);
      setMode('validated');
    } catch (err: any) {
      setError(err.message || 'Erreur');
    }
  };

  const handleSend = async () => {
    if (!commentId) return;
    setSending(true);
    try {
      await shareCommentsApi.send(commentId);
      setMode('sent');
    } catch (err: any) {
      setError(err.message || 'Erreur');
    } finally {
      setSending(false);
    }
  };

  if (mode === 'already' || mode === 'sent') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
          <Check className="h-4 w-4" />
          Commentaires envoyés
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Floating button */}
      {mode === 'idle' && (
        <button
          onClick={() => setMode('commenting')}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl hover:scale-105 transition-all flex items-center gap-2 font-bold text-sm"
        >
          <MessageSquarePlus className="h-5 w-5" />
          Ajouter des commentaires
        </button>
      )}

      {/* Inline comment popup */}
      {mode === 'commenting' && activeIndex !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => { setActiveIndex(null); setActiveText(''); }}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-5 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
            <h4 className="font-bold text-sm text-gray-800 dark:text-white mb-1 flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-blue-500" />
              Commentaire pour l'élément #{activeIndex + 1}
            </h4>
            {/* Show the element data */}
            <div className="mb-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
              <p className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">
                📌 {getItemLabel(activeIndex)}
              </p>
            </div>
            <textarea
              value={activeText}
              onChange={e => setActiveText(e.target.value)}
              placeholder="Votre commentaire..."
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
              autoFocus
            />
            <div className="flex gap-2 mt-3 justify-end">
              <button onClick={() => { setActiveIndex(null); setActiveText(''); }} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">Annuler</button>
              <button onClick={handleSaveInlineComment} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-500 text-white hover:bg-blue-600">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom panel when commenting */}
      {mode === 'commenting' && (
        <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t-2 border-blue-500 shadow-2xl transition-all duration-300 ease-in-out ${minimized ? 'max-h-[52px]' : 'max-h-[70vh]'} overflow-hidden`}>
          {/* Header bar - always visible */}
          <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 text-sm">
              <MessageSquarePlus className="h-5 w-5 text-blue-500" />
              Mode commentaire / Droit faire seulement une fois des commentaires
              {minimized && inlineComments.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold">
                  {inlineComments.length} commentaire{inlineComments.length > 1 ? 's' : ''}
                </span>
              )}
            </h3>
            
            <div className="flex items-center gap-1.5">
              {/* Minimize / Maximize toggle */}
              {minimized ? (
                <button
                  onClick={() => setMinimized(false)}
                  title="Vers le haut"
                  className="group p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                >
                  <ChevronUp className="h-5 w-5 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
                </button>
              ) : (
                <button
                  onClick={() => setMinimized(true)}
                  title="Vers le bas"
                  className="group p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <ChevronDown className="h-5 w-5 text-red-500 group-hover:text-red-600 transition-colors" />
                </button>
              )}
              {/* Close button */}
              <button onClick={() => { setMode('idle'); setMinimized(false); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Collapsible content */}
          {!minimized && (
            <div className="max-w-3xl mx-auto px-4 pb-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 52px)' }}>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Cliquez sur les boutons <span className="text-blue-500 font-bold">💬</span> à côté de chaque élément pour ajouter un commentaire, ou écrivez un commentaire général ci-dessous.
              </p>

              {/* Inline comments summary */}
              {inlineComments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-300">Commentaires ajoutés ({inlineComments.length}):</p>
                  {inlineComments.map(c => (
                    <div key={c.index} className="flex items-start gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-0.5">
                          📌 {getItemLabel(c.index)}
                        </p>
                        <p className="text-xs text-gray-700 dark:text-gray-300">{c.text}</p>
                      </div>
                      <button onClick={() => handleRemoveInlineComment(c.index)} className="p-0.5 hover:text-red-500 shrink-0">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* General comment */}
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 block">Commentaire général</label>
                <textarea
                  value={generalComment}
                  onChange={e => setGeneralComment(e.target.value)}
                  placeholder="Écrivez vos remarques générales ici..."
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
                />
              </div>

              {/* Contact form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1">
                    <User className="h-3 w-3" /> Prénom *
                  </label>
                  <input value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Prénom"
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1">
                    <User className="h-3 w-3" /> Nom *
                  </label>
                  <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Nom"
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Téléphone
                  </label>
                  <input value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="Numéro de téléphone"
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </label>
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Adresse email" type="email"
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-xs">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {error}
                </div>
              )}

              <button onClick={handleValidate}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-sm hover:shadow-lg transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2">
                <Check className="h-4 w-4" />
                Valider les commentaires
              </button>
            </div>
          )}
        </div>
      )}

      {/* Validated - show Send button */}
      {mode === 'validated' && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-xs">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              Commentaires validés !
            </p>
            <button onClick={handleSend} disabled={sending}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm hover:shadow-lg transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2">
              <Send className="h-4 w-4" />
              {sending ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SharedCommentForm;
