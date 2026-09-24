import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import {
  Users,
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Calendar as CalendarIcon,
  Plus,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/reports/dashboard');
      setReport(res.data);
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-800 rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 glass-panel rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-brand-500/20 bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Admin Portal
            </span>
            <span className="text-xs text-slate-400">System Overview</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide mt-1">Internship Program Control Panel</h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor real-time progress, manage assigned tasks, and oversee team performance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button onClick={() => navigate('/interns')} variant="secondary" size="sm">
            <Users className="w-4 h-4" /> Interns
          </Button>
          <Button onClick={() => navigate('/tasks')} variant="primary" size="sm">
            <Plus className="w-4 h-4" /> Create Task
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center justify-between border-l-4 border-l-brand-500">
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Interns</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {report?.interns?.total || 0}
            </h3>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {report?.interns?.active || 0} Active Status
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <Users className="w-6 h-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between border-l-4 border-l-indigo-500">
          <div>
            <p className="text-xs text-slate-400 font-medium">Active Projects</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {report?.projects?.active || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Total {report?.projects?.total || 0} Projects Managed
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <FolderKanban className="w-6 h-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <p className="text-xs text-slate-400 font-medium">Task Completion</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {report?.tasks?.completed || 0} / {report?.tasks?.total || 0}
            </h3>
            <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {report?.tasks?.pendingReview || 0} Pending Review
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between border-l-4 border-l-rose-500">
          <div>
            <p className="text-xs text-slate-400 font-medium">Overdue Alert</p>
            <h3 className="text-2xl font-bold text-rose-400 mt-1">
              {report?.tasks?.overdue || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Requires Admin Review
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Main Grid: Activity Feed & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Progress Submissions Feed (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-400" />
              Recent Progress Submissions
            </h3>
            <Link to="/progress" className="text-xs text-brand-400 hover:underline flex items-center gap-1 font-medium">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {report?.recentProgress?.length === 0 ? (
              <Card className="text-center py-8 text-slate-400 text-xs">
                No recent progress submissions recorded yet.
              </Card>
            ) : (
              report?.recentProgress?.map((p: any) => (
                <Card key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={p.user?.name || 'Intern'} src={p.user?.avatarUrl} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{p.user?.name}</span>
                        <Badge variant={p.isApproved ? 'completed' : 'pending'}>
                          {p.isApproved ? 'Approved' : 'Pending Review'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2">{p.workCompleted}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Task: <span className="text-brand-300">{p.task?.title || 'General Activity'}</span> • {p.hoursWorked} hrs • {p.progressPct}% complete
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button onClick={() => navigate('/progress')} variant="outline" size="sm">
                      Review Work
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar: Upcoming Events & Quick Links */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-brand-400" />
                Upcoming Events
              </h3>
              <Link to="/calendar" className="text-xs text-brand-400 hover:underline">
                Calendar
              </Link>
            </div>

            <div className="space-y-3">
              {report?.upcomingEvents?.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No events scheduled.</p>
              ) : (
                report?.upcomingEvents?.map((ev: any) => (
                  <div key={ev.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 space-y-1">
                    <p className="text-xs font-semibold text-white">{ev.title}</p>
                    <p className="text-[11px] text-brand-300">
                      {new Date(ev.startDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {ev.location && <p className="text-[10px] text-slate-400">📍 {ev.location}</p>}
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-brand-900/40 to-indigo-900/40 border border-brand-500/30 p-5 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-white">Ask Team AI Assistant</h4>
            <p className="text-xs text-slate-300">
              Query aggregate project status, team allocations, and intern tasks instantly.
            </p>
            <Button onClick={() => navigate('/ai')} variant="primary" size="sm" className="w-full">
              Open AI Assistant
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
