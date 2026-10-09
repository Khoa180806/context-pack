import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090d16] disabled:pointer-events-none disabled:opacity-50 cursor-pointer rounded-lg';

    const variants = {
      primary:
        'bg-gradient-to-r from-[#00f2fe] to-[#38bdf8] text-[#090d16] font-semibold hover:opacity-95 shadow-lg shadow-cyan-500/20 active:scale-[0.98]',
      secondary:
        'bg-[#1e293b] text-slate-100 hover:bg-[#334155] border border-slate-700 active:scale-[0.98]',
      outline:
        'border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800/60 hover:text-white',
      ghost:
        'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
