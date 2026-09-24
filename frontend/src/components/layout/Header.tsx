import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../services/api';
import { Avatar } from '../ui/Avatar';
import { Bell, Search, LogOut, CheckCircle2, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, logout, updateOnlineStatus } = useAuth();
  const { unreadNotifications, resetUnreadCount } = useSocket();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showStatusMenu, setShowStatusMenu] = useState<boolean>(false);

  useEffect(() => {
    fetchUnreadNotifications();
  }, []);

  const fetchUnreadNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    }
  };

  const handleStatusChange = async (status: 'ONLINE' | 'AWAY' | 'OFFLINE') => {
    try {
      updateOnlineStatus(status);
      setShowStatusMenu(false);
      await api.put(`/users/${user?.id}`, { onlineStatus: status });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md fixed top-0 right-0 left-64 z-20 flex items-center justify-between px-6">
      {/* Global Search Bar */}
      <div className="relative w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search interns, projects, tasks..."
          className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 transition-colors"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Status Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            <span className={`w-2 h-2 rounded-full ${user?.onlineStatus === 'ONLINE' ? 'bg-emerald-500' : user?.onlineStatus === 'AWAY' ? 'bg-amber-500' : 'bg-slate-500'}`} />
            <span className="capitalize">{user?.onlineStatus?.toLowerCase() || 'online'}</span>
          </button>

          {showStatusMenu && (
            <div className="absolute right-0 mt-2 w-36 glass-panel rounded-xl py-1 shadow-2xl z-50 border border-slate-700/80 text-xs">
              <button
                onClick={() => handleStatusChange('ONLINE')}
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-700/50 text-emerald-400 font-medium"
              >
                <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" /> Online
              </button>
              <button
                onClick={() => handleStatusChange('AWAY')}
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-700/50 text-amber-400 font-medium"
              >
                <Circle className="w-2 h-2 fill-amber-500 text-amber-500" /> Away
              </button>
              <button
                onClick={() => handleStatusChange('OFFLINE')}
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-700/50 text-slate-400 font-medium"
              >
                <Circle className="w-2 h-2 fill-slate-500 text-slate-500" /> Offline
              </button>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              resetUnreadCount();
            }}
            className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            )}
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl py-3 shadow-2xl z-50 border border-slate-700/80">
              <div className="px-4 pb-2 border-b border-slate-700/60 flex items-center justify-between">
                <h4 className="font-semibold text-xs text-white">Notifications</h4>
                <Link to="/notifications" className="text-[10px] text-brand-400 hover:underline">
                  View All
                </Link>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-800">
                {notifications.length === 0 ? (
                  <p className="p-4 text-xs text-slate-400 text-center">No notifications</p>
                ) : (
                  notifications.slice(0, 5).map(n => (
                    <div key={n.id} className="p-3 hover:bg-slate-800/50 transition-colors">
                      <p className="text-xs font-medium text-slate-200">{n.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Details & Logout */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <Avatar name={user?.name || 'User'} src={user?.avatarUrl} size="md" onlineStatus={user?.onlineStatus} />
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-white leading-tight">{user?.name}</p>
            <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{user?.jobTitle || user?.email}</p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
