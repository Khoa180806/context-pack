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

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col space-y-1.5 pb-3', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-semibold leading-none tracking-tight text-slate-100', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-xs text-slate-400', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('pt-0', className)} {...props}>
      {children}
    </div>
  );
}
