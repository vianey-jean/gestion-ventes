
import React from 'react';
import { cn } from '@/lib/utils';

interface ProfessionalLoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  text?: string;
  overlay?: boolean;
  className?: string;
  progress?: number; // 0-100 pour une barre de progression
}

const ProfessionalLoading: React.FC<ProfessionalLoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
  overlay = false,
  className,
  progress
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const renderLoadingElement = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div 
            className={cn(
              'animate-spin rounded-full border-4 border-gray-200 border-t-primary',
              sizeClasses[size]
            )}
            role="status"
            aria-label="Chargement en cours"
          />
        );

      case 'dots':
        return (
          <div className="flex space-x-2" role="status" aria-label="Chargement en cours">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'bg-primary rounded-full animate-pulse',
                  size === 'sm' ? 'w-2 h-2' : 
                  size === 'md' ? 'w-3 h-3' : 
                  size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'
                )}
                style={{ 
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '0.6s'
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div 
            className={cn(
              'bg-primary rounded-full animate-pulse opacity-75',
              sizeClasses[size]
            )}
            role="status"
            aria-label="Chargement en cours"
          />
        );

      case 'skeleton':
        return (
          <div className="space-y-3 w-full max-w-sm" role="status" aria-label="Chargement du contenu">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
          </div>
        );

      default:
        return null;
    }
  };

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-4',
      className
    )}>
      {renderLoadingElement()}
      
      {text && (
        <p className="text-sm text-muted-foreground font-medium" aria-live="polite">
          {text}
        </p>
      )}
      
      {typeof progress === 'number' && (
        <div className="w-full max-w-xs">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progression: ${progress}%`}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-1">
            {progress}%
          </p>
        </div>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-label="Chargement en cours"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default ProfessionalLoading;
