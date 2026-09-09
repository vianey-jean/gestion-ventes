
import React from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading';

interface PremiumLoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  overlay?: boolean;
  showText?: boolean;
  variant?: 'default' | 'dashboard' | 'tendances' | 'ventes';
}

const PremiumLoading = ({
  text = 'Gestion Ventes',
  size = 'md',
  className = '',
  overlay = false,
  showText = true,
  variant = 'default',
}: PremiumLoadingProps) => {
  const spinnerSize = size === 'xl' ? 'lg' : size;

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const containerSizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28',
    lg: 'w-36 h-36',
    xl: 'w-44 h-44',
  };

  const innerSizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
  };

  const variantColors = {
    default: {
      gradient: 'from-violet-500 via-fuchsia-500 to-cyan-400',
      glow: 'bg-violet-500',
      accent: 'text-violet-400',
    },
    dashboard: {
      gradient: 'from-violet-500 via-pink-500 to-blue-500',
      glow: 'bg-violet-500',
      accent: 'text-violet-400',
    },
    tendances: {
      gradient: 'from-emerald-400 via-cyan-400 to-violet-500',
      glow: 'bg-emerald-500',
      accent: 'text-emerald-400',
    },
    ventes: {
      gradient: 'from-emerald-400 via-teal-400 to-cyan-500',
      glow: 'bg-emerald-500',
      accent: 'text-emerald-400',
    },
  };

  const colors = variantColors[variant];

  const LoadingCore = () => (
    <div
      className={cn(
        'relative flex items-center justify-center',
        containerSizeClasses[size]
      )}
    >
      {/* Outer ambient glow */}
      <div
        className={cn(
          'absolute inset-[-35%] rounded-full blur-3xl opacity-20',
          colors.glow,
          'animate-[pulse_3s_ease-in-out_infinite]'
        )}
      />

      {/* Large soft glow */}
      <div
        className={cn(
          'absolute inset-0 rounded-full blur-xl opacity-20',
          `bg-gradient-to-r ${colors.gradient}`,
          'animate-pulse'
        )}
      />

      {/* Outer orbit */}
      <div
        className={cn(
          'absolute inset-0 rounded-full',
          'border border-white/10',
          'animate-[spin_8s_linear_infinite]'
        )}
      >
        <span
          className={cn(
            'absolute -top-1.5 left-1/2 -translate-x-1/2',
            'w-3 h-3 rounded-full',
            `bg-gradient-to-r ${colors.gradient}`,
            'shadow-[0_0_18px_rgba(139,92,246,0.9)]'
          )}
        />
      </div>

      {/* Middle orbit */}
      <div
        className={cn(
          'absolute inset-[10%] rounded-full',
          'border border-white/15',
          'animate-[spin_5s_linear_infinite_reverse]'
        )}
      >
        <span
          className={cn(
            'absolute top-1/2 -right-1.5 -translate-y-1/2',
            'w-2.5 h-2.5 rounded-full',
            `bg-gradient-to-r ${colors.gradient}`,
            'shadow-[0_0_14px_rgba(34,211,238,0.9)]'
          )}
        />
      </div>

      {/* Inner orbit */}
      <div
        className={cn(
          'absolute inset-[22%] rounded-full',
          'border border-white/10',
          'animate-[spin_3s_linear_infinite]'
        )}
      >
        <span
          className={cn(
            'absolute -bottom-1 left-1/2 -translate-x-1/2',
            'w-2 h-2 rounded-full',
            colors.glow,
            'shadow-[0_0_12px_rgba(16,185,129,0.9)]'
          )}
        />
      </div>

      {/* Luxury glass sphere */}
      <div
        className={cn(
          'relative flex items-center justify-center',
          innerSizeClasses[size],
          'rounded-full',
          'bg-white/[0.04]',
          'border border-white/20',
          'backdrop-blur-xl',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_0_40px_rgba(0,0,0,0.25)]'
        )}
      >
        {/* Animated gradient border */}
        <div
          className={cn(
            'absolute inset-[-2px] rounded-full',
            `bg-gradient-to-r ${colors.gradient}`,
            'opacity-70',
            'animate-[spin_2.5s_linear_infinite]',
            '-z-10'
          )}
        />

        {/* Inner shine */}
        <div
          className={cn(
            'absolute inset-1 rounded-full',
            'bg-gradient-to-br from-white/10 via-transparent to-transparent',
            'pointer-events-none'
          )}
        />

        {/* Spinner */}
        <div className="relative z-10">
          <LoadingSpinner size={spinnerSize} />
        </div>
      </div>

      {/* Floating particles */}
      <span
        className={cn(
          'absolute top-[5%] right-[10%]',
          'w-1.5 h-1.5 rounded-full',
          `bg-gradient-to-r ${colors.gradient}`,
          'animate-[ping_2.5s_ease-in-out_infinite]'
        )}
      />

      <span
        className={cn(
          'absolute bottom-[12%] left-[8%]',
          'w-1 h-1 rounded-full',
          colors.glow,
          'animate-[ping_3s_ease-in-out_infinite]'
        )}
        style={{ animationDelay: '800ms' }}
      />

      <span
        className={cn(
          'absolute top-[28%] left-[2%]',
          'w-1 h-1 rounded-full',
          'bg-white/70',
          'animate-[pulse_2s_ease-in-out_infinite]'
        )}
        style={{ animationDelay: '400ms' }}
      />
    </div>
  );

  const LoadingText = () => {
    if (!showText) return null;

    return (
      <div className="relative mt-7 text-center">
        {/* Main text */}
        <div
          className={cn(
            'font-semibold tracking-wide',
            'bg-gradient-to-r bg-clip-text text-transparent',
            colors.gradient,
            textSizeClasses[size],
            'animate-[pulse_2.2s_ease-in-out_infinite]'
          )}
        >
          {text}
        </div>

        {/* Elegant progress line */}
        <div className="relative mx-auto mt-4 h-[2px] w-24 overflow-hidden rounded-full bg-white/10">
          <div
            className={cn(
              'absolute inset-y-0 -left-full w-full',
              `bg-gradient-to-r ${colors.gradient}`,
              'animate-[loadingLine_1.8s_ease-in-out_infinite]'
            )}
          />
        </div>

        {/* Animated dots */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                `bg-gradient-to-r ${colors.gradient}`,
                'animate-[luxuryDot_1.4s_ease-in-out_infinite]'
              )}
              style={{
                animationDelay: `${index * 180}ms`,
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  /*
   * OVERLAY
   */
  if (overlay) {
    return (
      <div
        className={cn(
          'fixed inset-0 z-50',
          'flex items-center justify-center',
          'overflow-hidden',

          // Fond légèrement transparent
          'bg-[#050509]/65',

          // Flou modéré pour voir le contenu derrière
          'backdrop-blur-md',

          className
        )}
      >
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large gradient orb 1 */}
          <div
            className={cn(
              'absolute -top-40 -right-40',
              'h-[500px] w-[500px]',
              'rounded-full blur-[120px]',
              'opacity-20',
              colors.glow,
              'animate-[ambientFloat_8s_ease-in-out_infinite]'
            )}
          />

          {/* Large gradient orb 2 */}
          <div
            className={cn(
              'absolute -bottom-52 -left-40',
              'h-[550px] w-[550px]',
              'rounded-full blur-[140px]',
              'opacity-15',
              colors.glow,
              'animate-[ambientFloat_10s_ease-in-out_infinite_reverse]'
            )}
          />

          {/* Center radial glow */}
          <div
            className={cn(
              'absolute left-1/2 top-1/2',
              '-translate-x-1/2 -translate-y-1/2',
              'w-[450px] h-[450px]',
              'rounded-full blur-[100px]',
              'opacity-10',
              `bg-gradient-to-r ${colors.gradient}`
            )}
          />

          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />

          {/* Floating particles */}
          {Array.from({ length: 12 }).map((_, index) => (
            <span
              key={index}
              className={cn(
                'absolute rounded-full',
                index % 3 === 0
                  ? 'w-1.5 h-1.5'
                  : 'w-1 h-1',
                index % 2 === 0
                  ? 'bg-white/30'
                  : colors.glow,
                'animate-[particleFloat_5s_ease-in-out_infinite]'
              )}
              style={{
                left: `${8 + ((index * 17) % 84)}%`,
                top: `${10 + ((index * 23) % 78)}%`,
                animationDelay: `${index * 350}ms`,
                animationDuration: `${4 + (index % 4)}s`,
              }}
            />
          ))}
        </div>

        {/* Main glass card */}
        <div
          className={cn(
            'relative z-10',
            'flex flex-col items-center',
            'px-12 py-10',
            'rounded-3xl',
            'bg-white/[0.035]',
            'border border-white/10',
            'backdrop-blur-2xl',
            'shadow-[0_25px_100px_rgba(0,0,0,0.45)]',
            'animate-[cardEnter_0.7s_cubic-bezier(0.16,1,0.3,1)]'
          )}
        >
          {/* Card top shine */}
          <div
            className={cn(
              'absolute top-0 left-1/2',
              '-translate-x-1/2',
              'w-32 h-px',
              `bg-gradient-to-r ${colors.gradient}`,
              'opacity-70'
            )}
          />

          <LoadingCore />
          <LoadingText />
        </div>
      </div>
    );
  }

  /*
   * INLINE VERSION
   */
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        'p-8',
        className
      )}
    >
      <div
        className={cn(
          'flex flex-col items-center',
          'animate-[cardEnter_0.6s_cubic-bezier(0.16,1,0.3,1)]'
        )}
      >
        <LoadingCore />
        <LoadingText />
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes loadingLine {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(200%);
          }
        }

        @keyframes luxuryDot {
          0%, 100% {
            transform: translateY(0) scale(0.75);
            opacity: 0.35;
          }
          50% {
            transform: translateY(-4px) scale(1);
            opacity: 1;
          }
        }

        @keyframes ambientFloat {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-30px, 25px) scale(1.08);
          }
        }

        @keyframes particleFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0);
            opacity: 0.15;
          }

          25% {
            transform: translate3d(10px, -15px, 0);
            opacity: 0.7;
          }

          50% {
            transform: translate3d(-5px, -30px, 0);
            opacity: 0.3;
          }

          75% {
            transform: translate3d(-15px, -10px, 0);
            opacity: 0.6;
          }
        }

        @keyframes cardEnter {
          0% {
            opacity: 0;
            transform: translateY(15px) scale(0.96);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default PremiumLoading;

