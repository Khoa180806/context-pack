import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'cyan' | 'indigo' | 'none';
}

export function Card({ className, glow = 'none', children, ...props }: CardProps) {
  const glowStyles = {
    cyan: 'border-cyan-500/30 hover:border-cyan-500/50 glow-cyan',
    indigo: 'border-indigo-500/30 hover:border-indigo-500/50 glow-indigo',
    none: 'border-slate-800/80 hover:border-slate-700/80',
  };

  return (
    <div
      className={cn(
        'rounded-xl bg-[#141c2e]/90 backdrop-blur-md border p-6 transition-all duration-200',
        glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
