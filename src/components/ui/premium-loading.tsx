
import React from 'react';
import { cn } from '@/lib/utils';

interface PremiumLoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  overlay?: boolean;
  showText?: boolean;
  variant?: 'default' | 'dashboard' | 'tendances' | 'ventes';
}

const PremiumLoading = ({ 
  text = "Gestion Ventes", 
  size = 'md', 
  className = '', 
  overlay = false,
  showText = true,
  variant = 'default'
}: PremiumLoadingProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const variantGradients = {
    default: 'from-purple-600 via-blue-600 to-emerald-600',
    dashboard: 'from-purple-600 via-pink-600 to-blue-600',
    tendances: 'from-emerald-600 via-blue-600 to-purple-600',
    ventes: 'from-green-600 via-emerald-600 to-teal-600'
  };

  const variantTextColors = {
    default: 'text-purple-600',
    dashboard: 'text-purple-600',
    tendances: 'text-emerald-600',
    ventes: 'text-green-600'
  };

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-center items-center">
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        {/* Main Loading Container */}
        <div className="relative z-10 flex flex-col items-center space-y-8">
          {/* Premium Spinner */}
          <div className="relative">
            {/* Outer Ring */}
            <div className={cn(
              "border-4 border-transparent rounded-full animate-spin",
              `bg-gradient-to-r ${variantGradients[variant]} bg-clip-border`,
              sizeClasses[size]
            )}>
              <div className="w-full h-full bg-black/60 backdrop-blur-sm rounded-full border-4 border-transparent"></div>
            </div>
            
            {/* Inner Ring */}
            <div className={cn(
              "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
              "border-4 border-transparent rounded-full animate-spin",
              `bg-gradient-to-l ${variantGradients[variant]} bg-clip-border`,
              size === 'xl' ? 'w-12 h-12' : size === 'lg' ? 'w-10 h-10' : size === 'md' ? 'w-8 h-8' : 'w-6 h-6'
            )} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}>
              <div className="w-full h-full bg-black/60 backdrop-blur-sm rounded-full border-4 border-transparent"></div>
            </div>
            
            {/* Center Dot */}
            <div className={cn(
              "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
              `bg-gradient-to-r ${variantGradients[variant]} rounded-full animate-pulse`,
              size === 'xl' ? 'w-4 h-4' : size === 'lg' ? 'w-3 h-3' : 'w-2 h-2'
            )}></div>
          </div>
          
          {/* Loading Text */}
          {showText && (
            <div className="text-center space-y-2">
              <h3 className={cn(
                "font-bold bg-gradient-to-r bg-clip-text text-transparent animate-pulse",
                textSizeClasses[size],
                variantGradients[variant]
              )}>
                {text}
              </h3>
              <div className="flex space-x-1 justify-center">
                <div className={cn("w-2 h-2 rounded-full animate-bounce", `bg-gradient-to-r ${variantGradients[variant]}`)}></div>
                <div className={cn("w-2 h-2 rounded-full animate-bounce", `bg-gradient-to-r ${variantGradients[variant]}`)} style={{ animationDelay: '0.1s' }}></div>
                <div className={cn("w-2 h-2 rounded-full animate-bounce", `bg-gradient-to-r ${variantGradients[variant]}`)} style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col justify-center items-center p-8", className)}>
      {/* Inline Loading Container */}
      <div className="relative flex flex-col items-center space-y-6">
        {/* Premium Spinner */}
        <div className="relative">
          {/* Outer Ring */}
          <div className={cn(
            "border-4 border-transparent rounded-full animate-spin",
            `bg-gradient-to-r ${variantGradients[variant]} bg-clip-border`,
            sizeClasses[size]
          )}>
            <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full border-4 border-transparent"></div>
          </div>
          
          {/* Inner Ring */}
          <div className={cn(
            "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
            "border-4 border-transparent rounded-full animate-spin",
            `bg-gradient-to-l ${variantGradients[variant]} bg-clip-border`,
            size === 'xl' ? 'w-12 h-12' : size === 'lg' ? 'w-10 h-10' : size === 'md' ? 'w-8 h-8' : 'w-6 h-6'
          )} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}>
            <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full border-4 border-transparent"></div>
          </div>
          
          {/* Center Dot */}
          <div className={cn(
            "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
            `bg-gradient-to-r ${variantGradients[variant]} rounded-full animate-pulse`,
            size === 'xl' ? 'w-4 h-4' : size === 'lg' ? 'w-3 h-3' : 'w-2 h-2'
          )}></div>
        </div>
        
        {/* Loading Text */}
        {showText && (
          <div className="text-center space-y-2">
            <h3 className={cn(
              "font-bold bg-gradient-to-r bg-clip-text text-transparent animate-pulse",
              textSizeClasses[size],
              variantGradients[variant]
            )}>
              {text}
            </h3>
            <div className="flex space-x-1 justify-center">
              <div className={cn("w-2 h-2 rounded-full animate-bounce", `bg-gradient-to-r ${variantGradients[variant]}`)}></div>
              <div className={cn("w-2 h-2 rounded-full animate-bounce", `bg-gradient-to-r ${variantGradients[variant]}`)} style={{ animationDelay: '0.1s' }}></div>
              <div className={cn("w-2 h-2 rounded-full animate-bounce", `bg-gradient-to-r ${variantGradients[variant]}`)} style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumLoading;
