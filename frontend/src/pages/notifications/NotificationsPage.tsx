import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Bell, CheckCheck, CheckSquare, TrendingUp, Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGN':
      case 'TASK_DEADLINE':
        return <CheckSquare className="w-5 h-5 text-brand-400" />;
      case 'PROGRESS_SUBMIT':
      case 'WORK_REVIEW':
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'EVENT':
        return <Calendar className="w-5 h-5 text-indigo-400" />;
      case 'MESSAGE':
        return <MessageSquare className="w-5 h-5 text-amber-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-brand-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-400" />
            Notifications Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System updates, task assignments, progress review decisions, and event alerts.
          </p>
        </div>

        <Button onClick={handleMarkAllRead} variant="outline" size="sm">
          <CheckCheck className="w-4 h-4" /> Mark All as Read
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 glass-panel rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card className="text-center py-12 text-slate-400 text-sm">
          No notifications in your inbox.
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <Card
              key={n.id}
              onClick={() => !n.isRead && handleMarkRead(n.id)}
              className={`p-4 flex items-start justify-between gap-4 transition-all ${
                !n.isRead ? 'border-l-4 border-l-brand-500 bg-slate-800/80' : 'opacity-80'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/60 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white">{n.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(n.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {n.linkUrl && (
                <Link to={n.linkUrl} className="text-xs text-brand-400 hover:underline font-medium flex-shrink-0">
                  Open →
                </Link>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
