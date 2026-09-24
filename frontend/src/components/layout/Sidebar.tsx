import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderKanban,
  CheckSquare,
  TrendingUp,
  Calendar as CalendarIcon,
  Clock,
  MessageSquare,
  Bot,
  BarChart3,
  Bell,
  User,
  Settings,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Intern Management', path: '/interns', icon: GraduationCap },
    { name: 'Teams', path: '/teams', icon: Users },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Progress Tracking', path: '/progress', icon: TrendingUp },
    { name: 'Calendar & Events', path: '/calendar', icon: CalendarIcon },
    { name: 'Attendance', path: '/attendance', icon: Clock },
    { name: 'Internal Chat', path: '/chat', icon: MessageSquare },
    { name: 'AI Assistant', path: '/ai', icon: Bot },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  const internLinks = [
    { name: 'Dashboard', path: '/intern/dashboard', icon: LayoutDashboard },
    { name: 'My Work', path: '/my-work', icon: Briefcase },
    { name: 'My Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Progress Updates', path: '/progress', icon: TrendingUp },
    { name: 'Calendar & Events', path: '/calendar', icon: CalendarIcon },
    { name: 'Attendance', path: '/attendance', icon: Clock },
    { name: 'My Team', path: '/teams', icon: Users },
    { name: 'Team Chat', path: '/chat', icon: MessageSquare },
    { name: 'AI Assistant', path: '/ai', icon: Bot },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'My Profile', path: '/profile', icon: User }
  ];

  const links = isAdmin ? adminLinks : internLinks;

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-30 transition-all duration-300">
      {/* App Logo */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white font-bold">
          {isAdmin ? <ShieldCheck className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
        </div>
        <div>
          <h1 className="font-bold text-white text-base tracking-wide leading-tight">InternPulse</h1>
          <p className="text-xs text-brand-400 font-medium">Management Hub</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(link => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600/90 to-brand-500/80 text-white shadow-md shadow-brand-500/10 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Role Tag & Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Current Role</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
            {user?.role}
          </span>
        </div>
      </div>
    </aside>
  );
};
