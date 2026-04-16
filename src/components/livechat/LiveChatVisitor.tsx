/**
 * =============================================================================
 * LiveChatVisitor — Chat en direct pour visiteurs
 * =============================================================================
 * 
 * Vue (MVC) : Interface visiteur pour :
 *   1. Chat privé avec un admin
 *   2. Chat de groupe (si le visiteur a été ajouté à un groupe par l'admin)
 * 
 * Fonctionnalités :
 *   - Messagerie en temps réel via SSE
 *   - Notification sonore + bannière pour nouveaux messages
 *   - Édition, suppression, likes sur les messages
 *   - Emojis
 *   - Indicateur de saisie (typing)
 *   - Onglet "Groupes" avec badge de messages non lus
 * 
 * @module components/livechat/LiveChatVisitor
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minimize2, Loader2, User, Smile, Heart, Pencil, Trash2, Check, XCircle, UsersRound, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { playNotificationSound } from '@/hooks/use-chat-notification';
import ChatNotificationBanner, { ChatNotifItem } from '@/components/livechat/ChatNotificationBanner';

// ─── API Base URL ───────────────────────────────────────────────────────────
const getLiveChatApiBase = () => {
  const configuredBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
  if (configuredBase) return configuredBase;

  if (typeof window === 'undefined') {
    return 'https://server-gestion-ventes.onrender.com';
  }

  const hostname = window.location.hostname;
  const usesLocalProxy = hostname === 'localhost' || hostname === '127.0.0.1';
  const usesPreviewProxy = hostname.includes('lovableproject.com') || hostname.includes('lovable.app');
  const usesVercelRewrite = hostname.includes('vercel.app');

  if (usesLocalProxy || usesPreviewProxy || usesVercelRewrite) {
    return '';
  }

  return 'https://server-gestion-ventes.onrender.com';
};

const API_BASE = getLiveChatApiBase();

// ─── Constants ──────────────────────────────────────────────────────────────
const EMOJI_LIST = ['😀','😂','😍','🥰','😎','🤔','👍','👏','❤️','🔥','🎉','😢','😮','🙏','💪','✨','😊','🤗','😘','👌'];

// ─── Interfaces ─────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  visitorId: string;
  visitorNom: string;
  adminId: string;
  contenu: string;
  from: 'visitor' | 'admin';
  date: string;
  lu: boolean;
  edited?: boolean;
  deleted?: boolean;
  likes?: string[];
}

interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  contenu: string;
  date: string;
  readBy: string[];
}

interface GroupMember {
  id: string;
  name: string;
  role: string;
  isVisitor?: boolean;
}

interface GroupChat {
  id: string;
  name: string;
  createdBy: string;
  members: GroupMember[];
  createdAt: string;
  lastMessage?: GroupMessage | null;
  unreadCount?: number;
}

interface LiveChatVisitorProps {
  visitorNom: string;
  adminId: string;
  onClose: () => void;
}

type ViewMode = 'chat' | 'groups' | 'group-chat';

// ─── Composant Principal ────────────────────────────────────────────────────
const LiveChatVisitor: React.FC<LiveChatVisitorProps> = ({ visitorNom, adminId, onClose }) => {
  // ── Chat privé ──
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<ChatNotifItem[]>([]);

  // ── Groupes ──
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [groups, setGroups] = useState<GroupChat[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [groupUnread, setGroupUnread] = useState(0);
  const [groupTyping, setGroupTyping] = useState<Record<string, { senderId: string; senderName: string }>>({});

  // ── Refs ──
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const groupTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const isMinimizedRef = useRef(false);
  const selectedGroupRef = useRef<string | null>(null);
  const viewModeRef = useRef<ViewMode>('chat');

  useEffect(() => { isMinimizedRef.current = isMinimized; }, [isMinimized]);
  useEffect(() => { selectedGroupRef.current = selectedGroup; }, [selectedGroup]);
  useEffect(() => { viewModeRef.current = viewMode; }, [viewMode]);

  const pseudo = useRef(localStorage.getItem('livechat_pseudo') || visitorNom);
  const visitorId = useRef(
    localStorage.getItem('livechat_visitor_id') || 
    `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  useEffect(() => {
    localStorage.setItem('livechat_visitor_id', visitorId.current);
    localStorage.setItem('livechat_pseudo', visitorNom);
    pseudo.current = visitorNom;
  }, [visitorNom]);

  // ─── Chargement des messages privés ───────────────────────────────────────
  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/messagerie/messages/${visitorId.current}/${adminId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error('Error loading messages:', e);
    }
  }, [adminId]);

  // ─── Chargement des groupes ───────────────────────────────────────────────
  const loadGroups = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/messagerie/visitor-groups/${visitorId.current}`);
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
        setGroupUnread(data.reduce((sum: number, g: GroupChat) => sum + (g.unreadCount || 0), 0));
      }
    } catch (e) {
      console.error('Error loading groups:', e);
    }
  }, []);

  // ─── Chargement des messages du groupe ────────────────────────────────────
  const loadGroupMessages = useCallback(async (groupId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/messagerie/visitor-group-messages/${groupId}/${visitorId.current}`);
      if (res.ok) {
        const data = await res.json();
        setGroupMessages(data);
        // Marquer comme lu
        fetch(`${API_BASE}/api/messagerie/visitor-group-mark-read/${groupId}/${visitorId.current}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }
        }).then(() => loadGroups()).catch(() => {});
      }
    } catch (e) {
      console.error('Error loading group messages:', e);
    }
  }, [loadGroups]);

  // ─── SSE : connexion temps réel ───────────────────────────────────────────
  useEffect(() => {
    loadMessages();
    loadGroups();

    let es: EventSource | null = null;
    let sseTimeout: ReturnType<typeof setTimeout> | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    const connectSSE = () => {
      try {
        es = new EventSource(`${API_BASE}/api/messagerie/events?visitorId=${visitorId.current}`);
      } catch {
        console.warn('SSE messagerie visitor: failed to connect');
        return;
      }
      eventSourceRef.current = es;

      es.onerror = () => {};

      // Messages privés
      es.addEventListener('new_message', (e) => {
        try {
          const msg: ChatMessage = JSON.parse(e.data);
          setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
        } catch {}
      });

      es.addEventListener('new_conversation_message', (e) => {
        try {
          const msg: ChatMessage = JSON.parse(e.data);
          setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
        } catch {}
      });

      es.addEventListener('message_edited', (e) => {
        try {
          const msg: ChatMessage = JSON.parse(e.data);
          setMessages(prev => prev.map(m => m.id === msg.id ? msg : m));
        } catch {}
      });

      es.addEventListener('message_deleted', (e) => {
        try {
          const msg: ChatMessage = JSON.parse(e.data);
          setMessages(prev => prev.map(m => m.id === msg.id ? msg : m));
        } catch {}
      });

      es.addEventListener('message_liked', (e) => {
        try {
          const msg: ChatMessage = JSON.parse(e.data);
          setMessages(prev => prev.map(m => m.id === msg.id ? msg : m));
        } catch {}
      });

      es.addEventListener('typing', (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.from === 'admin') {
            setAdminTyping(data.isTyping);
          }
        } catch {}
      });

      // Messages de groupe
      es.addEventListener('group_message', (e) => {
        try {
          const msg: GroupMessage = JSON.parse(e.data);
          if (selectedGroupRef.current === msg.groupId) {
            setGroupMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
          }
        } catch {}
      });

      es.addEventListener('group_message_edited', (e) => {
        try {
          const msg: GroupMessage = JSON.parse(e.data);
          setGroupMessages(prev => prev.map(m => m.id === msg.id ? msg : m));
        } catch {}
      });

      es.addEventListener('group_message_deleted', (e) => {
        try {
          const msg: GroupMessage = JSON.parse(e.data);
          setGroupMessages(prev => prev.map(m => m.id === msg.id ? msg : m));
        } catch {}
      });

      es.addEventListener('group_typing', (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.senderId !== visitorId.current) {
            setGroupTyping(prev => ({
              ...prev,
              [data.groupId]: data.isTyping ? { senderId: data.senderId, senderName: data.senderName } : undefined as any
            }));
            if (!data.isTyping) {
              setGroupTyping(prev => { const n = { ...prev }; delete n[data.groupId]; return n; });
            }
          }
        } catch {}
      });

      es.addEventListener('admin_status', () => {});

      pollInterval = setInterval(() => { loadMessages(); loadGroups(); }, 2000);
    };

    // Connect after page is fully loaded
    if (document.readyState === 'complete') {
      sseTimeout = setTimeout(connectSSE, 500);
    } else {
      const onLoad = () => { sseTimeout = setTimeout(connectSSE, 500); };
      window.addEventListener('load', onLoad, { once: true });
    }

    return () => {
      if (sseTimeout) clearTimeout(sseTimeout);
      if (es) es.close();
      eventSourceRef.current = null;
      if (pollInterval) clearInterval(pollInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, adminTyping, groupMessages, groupTyping]);

  // ─── Envoi de message (privé ou groupe) ───────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    setIsSending(true);

    if (viewMode === 'group-chat' && selectedGroup) {
      // Envoi message groupe
      try {
        const res = await fetch(`${API_BASE}/api/messagerie/visitor-group-send`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ groupId: selectedGroup, visitorId: visitorId.current, visitorNom: pseudo.current, contenu: input.trim() })
        });
        if (res.ok) {
          const msg = await res.json();
          setGroupMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
          setInput('');
          setShowEmojis(false);
          sendGroupTypingIndicator(false);
          loadGroups();
        }
      } catch (e) { console.error('Error sending group message:', e); }
      finally { setIsSending(false); }
    } else {
      // Envoi message privé
      try {
        const res = await fetch(`${API_BASE}/api/messagerie/send`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorId: visitorId.current, visitorNom: pseudo.current, adminId, contenu: input.trim(), from: 'visitor' })
        });
        if (res.ok) {
          const msg = await res.json();
          setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
          setInput('');
          setShowEmojis(false);
          sendTypingIndicator(false);
        }
      } catch (e) { console.error('Error sending:', e); }
      finally { setIsSending(false); }
    }
  };

  // ─── Actions sur messages privés ──────────────────────────────────────────
  const handleLike = async (msgId: string) => {
    try {
      await fetch(`${API_BASE}/api/messagerie/like/${msgId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'visitor' })
      });
    } catch {}
    setContextMenuId(null);
  };

  const handleEdit = async (msgId: string) => {
    if (!editText.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/messagerie/edit/${msgId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenu: editText.trim(), from: 'visitor' })
      });
      if (res.ok) {
        const updated = await res.json();
        setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
      }
    } catch {}
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = async (msgId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/messagerie/delete/${msgId}`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'visitor' })
      });
      if (res.ok) {
        const updated = await res.json();
        setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
      }
    } catch {}
    setContextMenuId(null);
  };

  // ─── Typing indicators ───────────────────────────────────────────────────
  const sendTypingIndicator = (isTyping: boolean) => {
    fetch(`${API_BASE}/api/messagerie/typing`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: visitorId.current, adminId, from: 'visitor', isTyping })
    }).catch(() => {});
  };

  const sendGroupTypingIndicator = (isTyping: boolean) => {
    if (!selectedGroup) return;
    fetch(`${API_BASE}/api/messagerie/visitor-group-typing`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId: selectedGroup, visitorId: visitorId.current, visitorNom: pseudo.current, isTyping })
    }).catch(() => {});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (viewMode === 'group-chat') {
      sendGroupTypingIndicator(true);
      if (groupTypingTimeoutRef.current) clearTimeout(groupTypingTimeoutRef.current);
      groupTypingTimeoutRef.current = setTimeout(() => sendGroupTypingIndicator(false), 2000);
    } else {
      sendTypingIndicator(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => sendTypingIndicator(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // ─── Navigation groupes ───────────────────────────────────────────────────
  const openGroupChat = (groupId: string) => {
    setSelectedGroup(groupId);
    setViewMode('group-chat');
    loadGroupMessages(groupId);
  };

  const backToGroupList = () => {
    setSelectedGroup(null);
    setViewMode('groups');
    setGroupMessages([]);
  };

  const backToChat = () => {
    setSelectedGroup(null);
    setViewMode('chat');
    setGroupMessages([]);
  };

  // Nombre total d'unreads
  const totalGroupUnread = groupUnread;
  const totalPrivateUnread = messages.filter(m => m.from === 'admin' && !m.lu).length;

  // ─── Vue minimisée ───────────────────────────────────────────────────────
  if (isMinimized) {
    const totalBadge = totalPrivateUnread + totalGroupUnread;
    return (
      <>
        <ChatNotificationBanner
          notifications={notifications}
          onDismiss={dismissNotification}
          onClick={() => { setIsMinimized(false); setNotifications([]); }}
        />
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="fixed bottom-6 right-6 z-[9999]">
          <button onClick={() => { setIsMinimized(false); setNotifications([]); }} className="relative p-4 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-full shadow-[0_8px_30px_rgba(139,92,246,0.5)] hover:scale-110 transition-transform">
            <MessageCircle className="h-6 w-6 text-white" />
            {totalBadge > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center animate-pulse">
                {totalBadge}
              </span>
            )}
          </button>
        </motion.div>
      </>
    );
  }

  // ─── Groupe sélectionné (détails) ─────────────────────────────────────────
  const selectedGroupData = groups.find(g => g.id === selectedGroup);

  // ─── Rendu principal ──────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 100, scale: 0.8 }}
      className="fixed bottom-6 right-6 z-[9999] w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-6rem)] flex flex-col rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.5)] border border-white/[0.1]"
      onClick={() => { setContextMenuId(null); setShowEmojis(false); }}
    >
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {viewMode === 'group-chat' && (
            <button onClick={backToGroupList} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronLeft className="h-4 w-4 text-white" />
            </button>
          )}
          {viewMode === 'groups' && (
            <button onClick={backToChat} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronLeft className="h-4 w-4 text-white" />
            </button>
          )}
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              {viewMode === 'group-chat' ? <UsersRound className="h-4 w-4 text-white" /> : <User className="h-4 w-4 text-white" />}
            </div>
            {viewMode === 'chat' && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-purple-600" />}
          </div>
          <div>
            <div className="text-white font-bold text-sm truncate max-w-[160px]">
              {viewMode === 'group-chat' ? selectedGroupData?.name : viewMode === 'groups' ? 'Mes Groupes' : pseudo.current}
            </div>
            <div className="text-purple-200/70 text-xs">
              {viewMode === 'group-chat'
                ? (groupTyping[selectedGroup || '']
                    ? `${groupTyping[selectedGroup || ''].senderName} écrit...`
                    : `${selectedGroupData?.members.length || 0} membres`)
                : viewMode === 'groups'
                  ? `${groups.length} groupe${groups.length > 1 ? 's' : ''}`
                  : 'Chat en direct'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Bouton Groupes (depuis chat privé) */}
          {viewMode === 'chat' && groups.length > 0 && (
            <button onClick={() => setViewMode('groups')} className="relative p-2 hover:bg-white/10 rounded-lg transition-colors" title="Mes groupes">
              <UsersRound className="h-4 w-4 text-white" />
              {totalGroupUnread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center animate-pulse">
                  {totalGroupUnread}
                </span>
              )}
            </button>
          )}
          <button onClick={() => setIsMinimized(true)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Minimize2 className="h-4 w-4 text-white" />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* ── Contenu ── */}
      {viewMode === 'groups' ? (
        /* ── Liste des groupes ── */
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950">
          {groups.length === 0 ? (
            <div className="text-center text-purple-300/40 text-sm mt-12">
              <UsersRound className="h-12 w-12 mx-auto mb-3 opacity-30" />
              Aucun groupe pour le moment
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {groups.map(group => (
                <button
                  key={group.id}
                  onClick={() => openGroupChat(group.id)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.06] transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <UsersRound className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-semibold truncate">{group.name}</span>
                      {group.lastMessage && (
                        <span className="text-purple-300/30 text-[10px] shrink-0 ml-2">
                          {new Date(group.lastMessage.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-purple-300/50 text-xs truncate">
                        {group.lastMessage
                          ? `${group.lastMessage.senderName}: ${group.lastMessage.contenu}`
                          : `${group.members.length} membres`}
                      </span>
                      {(group.unreadCount || 0) > 0 && (
                        <span className="min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center px-1 shrink-0 ml-2 animate-pulse">
                          {group.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : viewMode === 'group-chat' && selectedGroup ? (
        /* ── Messages du groupe ── */
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950">
            {groupMessages.length === 0 && (
              <div className="text-center text-purple-300/40 text-sm mt-8">
                <UsersRound className="h-12 w-12 mx-auto mb-3 opacity-30" />
                Aucun message dans ce groupe
              </div>
            )}
            {groupMessages.map((msg) => {
              const isOwn = msg.senderId === visitorId.current;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[80%]">
                    {!isOwn && (
                      <div className="text-[10px] text-amber-400 font-semibold mb-1 ml-1">
                        {msg.senderName}
                      </div>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isOwn
                        ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-br-md'
                        : 'bg-white/[0.08] text-purple-100 border border-white/[0.06] rounded-bl-md'
                    }`}>
                      {msg.contenu}
                      <div className={`text-[10px] mt-1 ${isOwn ? 'text-purple-200/50' : 'text-purple-300/30'}`}>
                        {new Date(msg.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            <AnimatePresence>
              {selectedGroup && groupTyping[selectedGroup] && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start">
                  <div>
                    <div className="text-[10px] text-amber-400 font-semibold mb-1 ml-1">{groupTyping[selectedGroup].senderName}</div>
                    <div className="bg-white/[0.08] border border-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                      <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Emoji picker (groupe) */}
          <AnimatePresence>
            {showEmojis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="bg-slate-800/95 backdrop-blur border-t border-white/[0.06] px-3 py-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-wrap gap-1">
                  {EMOJI_LIST.map((emoji) => (
                    <button key={emoji} onClick={() => { setInput(prev => prev + emoji); setShowEmojis(false); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-lg transition-colors">{emoji}</button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input (groupe) */}
          <div className="p-3 bg-slate-900/90 backdrop-blur border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); setShowEmojis(!showEmojis); }}
                className="h-11 w-11 shrink-0 flex items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-colors">
                <Smile className="h-5 w-5 text-purple-300/60" />
              </button>
              <Input value={input} onChange={handleInputChange} onKeyDown={handleKeyDown}
                placeholder="Message au groupe..." className="flex-1 h-11 bg-white/[0.05] border-white/[0.08] text-white placeholder:text-purple-300/30 rounded-xl focus:bg-white/[0.08] focus:border-purple-400/30" />
              <Button onClick={handleSend} disabled={!input.trim() || isSending}
                className="h-11 w-11 p-0 bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-xl shadow-lg border border-white/10">
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </>
      ) : (
        /* ── Chat privé (existant) ── */
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950">
            {messages.length === 0 && (
              <div className="text-center text-purple-300/40 text-sm mt-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                Envoyez votre premier message !
              </div>
            )}
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.from === 'visitor' ? 'justify-end' : 'justify-start'} group relative`}
              >
                <div className="relative max-w-[80%]">
                  {msg.deleted ? (
                    <div className={`px-4 py-2.5 rounded-2xl text-sm italic ${
                      msg.from === 'visitor' 
                        ? 'bg-white/[0.04] text-purple-300/40 rounded-br-md' 
                        : 'bg-white/[0.04] text-purple-300/40 rounded-bl-md'
                    }`}>
                      🚫 Ce message a été supprimé
                      <div className="text-[10px] mt-1 text-purple-300/20">
                        {new Date(msg.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ) : editingId === msg.id ? (
                    <div className="flex items-center gap-1">
                      <Input value={editText} onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(msg.id); if (e.key === 'Escape') { setEditingId(null); setEditText(''); } }}
                        className="h-9 text-sm bg-white/[0.08] border-purple-400/30 text-white rounded-lg" autoFocus />
                      <button onClick={() => handleEdit(msg.id)} className="p-1.5 text-emerald-400 hover:bg-white/10 rounded-lg"><Check className="h-4 w-4" /></button>
                      <button onClick={() => { setEditingId(null); setEditText(''); }} className="p-1.5 text-red-400 hover:bg-white/10 rounded-lg"><XCircle className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed cursor-pointer ${
                          msg.from === 'visitor'
                            ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-br-md'
                            : 'bg-white/[0.08] text-purple-100 border border-white/[0.06] rounded-bl-md'
                        }`}
                        onClick={(e) => { e.stopPropagation(); setContextMenuId(contextMenuId === msg.id ? null : msg.id); }}
                      >
                        {msg.contenu}
                        <div className={`text-[10px] mt-1 flex items-center gap-1 ${msg.from === 'visitor' ? 'text-purple-200/50' : 'text-purple-300/30'}`}>
                          {new Date(msg.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          {msg.edited && <span className="italic">(modifié)</span>}
                        </div>
                      </div>

                      {msg.likes && msg.likes.length > 0 && (
                        <div className={`flex ${msg.from === 'visitor' ? 'justify-end' : 'justify-start'} mt-0.5`}>
                          <span className="text-xs bg-white/[0.08] rounded-full px-2 py-0.5 flex items-center gap-0.5">
                            ❤️ {msg.likes.length}
                          </span>
                        </div>
                      )}

                      <AnimatePresence>
                        {contextMenuId === msg.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className={`absolute z-50 ${msg.from === 'visitor' ? 'right-0' : 'left-0'} top-full mt-1 bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[140px]`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button onClick={() => handleLike(msg.id)} className="w-full px-3 py-2 text-left text-xs text-purple-200 hover:bg-white/[0.06] flex items-center gap-2">
                              <Heart className="h-3.5 w-3.5 text-red-400" /> {msg.likes?.includes('visitor') ? 'Retirer ❤️' : 'Aimer ❤️'}
                            </button>
                            {msg.from === 'visitor' && (
                              <>
                                <button onClick={() => { setEditingId(msg.id); setEditText(msg.contenu); setContextMenuId(null); }} className="w-full px-3 py-2 text-left text-xs text-purple-200 hover:bg-white/[0.06] flex items-center gap-2">
                                  <Pencil className="h-3.5 w-3.5 text-blue-400" /> Modifier
                                </button>
                                <button onClick={() => handleDelete(msg.id)} className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-white/[0.06] flex items-center gap-2">
                                  <Trash2 className="h-3.5 w-3.5" /> Supprimer
                                </button>
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              </motion.div>
            ))}

            <AnimatePresence>
              {adminTyping && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start">
                  <div className="bg-white/[0.08] border border-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Emoji picker (privé) */}
          <AnimatePresence>
            {showEmojis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="bg-slate-800/95 backdrop-blur border-t border-white/[0.06] px-3 py-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-wrap gap-1">
                  {EMOJI_LIST.map((emoji) => (
                    <button key={emoji} onClick={() => { setInput(prev => prev + emoji); setShowEmojis(false); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-lg transition-colors">{emoji}</button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input (privé) */}
          <div className="p-3 bg-slate-900/90 backdrop-blur border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); setShowEmojis(!showEmojis); }}
                className="h-11 w-11 shrink-0 flex items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-colors">
                <Smile className="h-5 w-5 text-purple-300/60" />
              </button>
              <Input value={input} onChange={handleInputChange} onKeyDown={handleKeyDown}
                placeholder="Écrivez votre message..." className="flex-1 h-11 bg-white/[0.05] border-white/[0.08] text-white placeholder:text-purple-300/30 rounded-xl focus:bg-white/[0.08] focus:border-purple-400/30" />
              <Button onClick={handleSend} disabled={!input.trim() || isSending}
                className="h-11 w-11 p-0 bg-gradient-to-br from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-xl shadow-lg border border-white/10">
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default LiveChatVisitor;
