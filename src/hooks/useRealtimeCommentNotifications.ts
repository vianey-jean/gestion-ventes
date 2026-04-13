import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

type CommentType = 'notes' | 'pointage' | 'taches';

interface UseRealtimeCommentNotificationsOptions {
  type: CommentType;
  onNewComment?: () => void;
  onCountChange?: (delta: number) => void;
}

/**
 * Hook that listens to SSE `share-comment-received` events in real-time.
 * Shows a toast notification instantly when a new comment arrives,
 * WITHOUT requiring page refresh or navigation.
 */
export const useRealtimeCommentNotifications = ({
  type,
  onNewComment,
  onCountChange,
}: UseRealtimeCommentNotificationsOptions) => {
  const onNewCommentRef = useRef(onNewComment);
  const onCountChangeRef = useRef(onCountChange);

  useEffect(() => {
    onNewCommentRef.current = onNewComment;
    onCountChangeRef.current = onCountChange;
  }, [onNewComment, onCountChange]);

  const handleSSE = useCallback((event: Event) => {
    const customEvent = event as CustomEvent;
    const detail = customEvent.detail;
    
    if (detail?.type !== type) return;

    // Show toast notification
    const typeLabels: Record<CommentType, string> = {
      notes: 'Notes',
      pointage: 'Pointage',
      taches: 'Tâches',
    };

    const senderName = detail.prenom && detail.nom
      ? `${detail.prenom} ${detail.nom}`
      : 'Quelqu\'un';

    toast.info(`💬 Nouveau commentaire - ${typeLabels[type]}`, {
      description: `${senderName} a laissé un commentaire`,
      duration: 6000,
      position: 'top-right',
    });

    // Increment unread count
    onCountChangeRef.current?.(1);

    // Trigger refresh callback
    onNewCommentRef.current?.();
  }, [type]);

  useEffect(() => {
    window.addEventListener('share-comment-received', handleSSE);
    return () => window.removeEventListener('share-comment-received', handleSSE);
  }, [handleSSE]);
};
