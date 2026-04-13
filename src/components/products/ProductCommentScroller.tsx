import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Star, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface ScrollComment {
  id: string;
  comment: string;
  rating: number;
  clientName?: string;
}

interface ProductCommentScrollerProps {
  comments: ScrollComment[];
}

const getRatingColor = (rating: number) => {
  if (rating <= 2) return 'text-red-400';
  if (rating === 3) return 'text-amber-400';
  return 'text-emerald-400';
};

const getRatingGradient = (rating: number) => {
  if (rating <= 2) return 'from-red-500/10 via-red-400/5 to-transparent border-red-300/30 dark:border-red-600/30';
  if (rating === 3) return 'from-amber-500/10 via-amber-400/5 to-transparent border-amber-300/30 dark:border-amber-600/30';
  return 'from-emerald-500/10 via-emerald-400/5 to-transparent border-emerald-300/30 dark:border-emerald-600/30';
};

const ProductCommentScroller: React.FC<ProductCommentScrollerProps> = ({ comments }) => {
  const [expanded, setExpanded] = useState(false);

  if (!comments || comments.length === 0) return null;

  const visibleComments = expanded ? comments : comments.slice(0, 2);

  return (
    <div className="w-full space-y-1.5 mb-1">
      <AnimatePresence initial={false}>
        {visibleComments.map((comment, idx) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, delay: idx * 0.05 }}
            className={`relative rounded-xl border bg-gradient-to-r ${getRatingGradient(comment.rating)} p-2.5 backdrop-blur-sm`}
          >
            {/* Luxe shimmer line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            {/* Stars row */}
            <div className="flex items-center gap-1 mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < comment.rating ? `${getRatingColor(comment.rating)} fill-current` : 'text-gray-300 dark:text-gray-600'}`}
                />
              ))}
              {comment.clientName && (
                <span className="ml-1.5 text-[10px] font-semibold text-muted-foreground tracking-wide uppercase">
                  {comment.clientName}
                </span>
              )}
            </div>

            {/* Full comment text — no truncation */}
            <p className="text-[11px] leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
              {comment.comment}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Show more / less */}
      {comments.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary/80 transition-colors mx-auto"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Réduire
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              Voir {comments.length - 2} commentaire{comments.length - 2 > 1 ? 's' : ''} de plus
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ProductCommentScroller;
