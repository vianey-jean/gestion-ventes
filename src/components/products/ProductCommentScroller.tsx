import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

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
  if (rating <= 2) return 'text-red-500';
  if (rating === 3) return 'text-yellow-500';
  return 'text-emerald-500';
};

const getRatingBg = (rating: number) => {
  if (rating <= 2) return 'bg-red-500/10 border-red-500/20';
  if (rating === 3) return 'bg-yellow-500/10 border-yellow-500/20';
  return 'bg-emerald-500/10 border-emerald-500/20';
};

const ProductCommentScroller: React.FC<ProductCommentScrollerProps> = ({ comments }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (comments.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % comments.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [comments.length]);

  if (!comments || comments.length === 0) return null;

  const current = comments[currentIndex];

  return (
    <div className="w-full overflow-hidden h-5 relative mb-0.5">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id + '-' + currentIndex}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className={`absolute inset-0 flex items-center justify-center px-1`}
        >
          <span className={`text-[10px] font-semibold truncate max-w-full px-1.5 py-0.5 rounded border ${getRatingBg(current.rating)} ${getRatingColor(current.rating)}`}>
            {'★'.repeat(current.rating)}{'☆'.repeat(5 - current.rating)} / {current.clientName ? `${current.clientName}: ` : ''} / {current.comment}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ProductCommentScroller;
