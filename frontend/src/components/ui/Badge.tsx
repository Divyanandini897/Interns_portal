import React from 'react';

export interface BadgeProps {
  variant?: 'active' | 'inactive' | 'pending' | 'completed' | 'urgent' | 'high' | 'medium' | 'low' | 'info' | 'role';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'info',
  children,
  className = ''
}) => {
  const styles: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    inactive: 'bg-slate-700/50 text-slate-400 border-slate-600/50',
    urgent: 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse-subtle',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    medium: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    low: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
    role: 'bg-brand-500/10 text-brand-300 border-brand-500/30',
    info: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant] || styles.info} ${className}`}>
      {children}
    </span>
  );
};
