import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';

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
  if (rating <= 2)
    return 'from-red-500/10 via-red-400/5 to-transparent border-red-300/30 dark:border-red-600/30';
  if (rating === 3)
    return 'from-amber-500/10 via-amber-400/5 to-transparent border-amber-300/30 dark:border-amber-600/30';
  return 'from-emerald-500/10 via-emerald-400/5 to-transparent border-emerald-300/30 dark:border-emerald-600/30';
};

const ProductCommentScroller: React.FC<ProductCommentScrollerProps> = ({ comments }) => {
  const [index, setIndex] = useState(0);

  // Reset index when comments array changes
  useEffect(() => {
    setIndex(prev => (comments && comments.length > 0 ? Math.min(prev, comments.length - 1) : 0));
  }, [comments]);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (!comments || comments.length <= 1) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % comments.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [comments?.length]);

  if (!comments || comments.length === 0) return null;

  const safeIndex = Math.min(index, comments.length - 1);
  const comment = comments[safeIndex];
  if (!comment) return null;

  return (
    <div className="w-full space-y-1.5 mb-1 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={comment.id}
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 80, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className={`relative rounded-xl border bg-gradient-to-r ${getRatingGradient(
            comment.rating
          )} p-2.5 backdrop-blur-sm`}
        >
          {/* shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          {/* stars */}
          <div className="flex items-center gap-1 mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < comment.rating
                    ? `${getRatingColor(comment.rating)} fill-current`
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}

            {comment.clientName && (
              <span className="ml-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                {comment.clientName}
              </span>
            )}
          </div>

          {/* comment */}
          <p className="text-[11px] leading-relaxed text-blue-500 whitespace-pre-wrap break-words">
            {comment.comment}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* indicator */}
      {comments.length > 1 && (
        <div className="flex justify-center gap-1 pt-1">
          {comments.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-all ${
                i === safeIndex ? 'bg-primary w-3' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductCommentScroller;