
import React from 'react';
import { cn } from '@/lib/utils';

interface ModernButtonGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

const ModernButtonGrid: React.FC<ModernButtonGridProps> = ({ 
  children, 
  columns = 3,
  className 
}) => {
  const gridClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn(
      'grid gap-4 mb-6',
      gridClasses[columns],
      className
    )}>
      {children}
    </div>
  );
};

export default ModernButtonGrid;
