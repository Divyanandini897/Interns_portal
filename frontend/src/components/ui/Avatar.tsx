import React from 'react';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onlineStatus?: 'ONLINE' | 'AWAY' | 'OFFLINE';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  onlineStatus,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-16 h-16 text-xl'
  };

  const statusDotSize = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  };

  const statusColors = {
    ONLINE: 'bg-emerald-500 shadow-emerald-500/50',
    AWAY: 'bg-amber-500 shadow-amber-500/50',
    OFFLINE: 'bg-slate-500 shadow-slate-500/50'
  };

  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className={`relative inline-block ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover border border-slate-700/80 shadow-sm`}
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr from-brand-700 to-indigo-500 text-white font-semibold flex items-center justify-center border border-indigo-400/30 shadow-sm`}>
          {initials}
        </div>
      )}

      {onlineStatus && (
        <span
          className={`absolute bottom-0 right-0 ${statusDotSize[size]} rounded-full ${statusColors[onlineStatus]} border-2 border-slate-900 shadow-sm`}
          title={`Status: ${onlineStatus}`}
        />
      )}
    </div>
  );
};
