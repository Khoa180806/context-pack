import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <div className={cn('w-full', className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return React.cloneElement(child as any, { activeValue: value, onValueChange });
        }
        return child;
      })}
    </div>
  );
}

export interface TabListProps {
  children: React.ReactNode;
  className?: string;
  activeValue?: string;
  onValueChange?: (value: string) => void;
}

export function TabList({ children, className, activeValue, onValueChange }: TabListProps) {
  return (
    <div className={cn('inline-flex items-center gap-1 rounded-lg bg-slate-900/80 p-1 border border-slate-800', className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return React.cloneElement(child as any, { activeValue, onValueChange });
        }
        return child;
      })}
    </div>
  );
}

export interface TabTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  activeValue?: string;
  onValueChange?: (value: string) => void;
}

export function TabTrigger({
  value,
  children,
  className,
  activeValue,
  onValueChange,
}: TabTriggerProps) {
  const isActive = activeValue === value;

  return (
    <button
      type="button"
      onClick={() => onValueChange?.(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50',
        isActive
          ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60 font-semibold'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40',
        className,
      )}
    >
      {children}
    </button>
  );
}
