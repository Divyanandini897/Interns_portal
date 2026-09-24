import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  CheckSquare,
  Clock,
  TrendingUp,
  FolderKanban,
  Calendar as CalendarIcon,
  Play,
  Square,
  Plus,
  ArrowRight,
  Bot
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const InternDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [attendanceToday, setAttendanceToday] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [checking, setChecking] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchInternData();
  }, []);

  const fetchInternData = async () => {
    try {
      const [tasksRes, attendanceRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/attendance')
      ]);

      setTasks(tasksRes.data || []);
      if (attendanceRes.data && attendanceRes.data.length > 0) {
        // check if latest record is today
        const latest = attendanceRes.data[0];
        const recordDate = new Date(latest.date).toDateString();
        const todayDate = new Date().toDateString();
        if (recordDate === todayDate) {
          setAttendanceToday(latest);
        }
      }
    } catch (err) {
      console.error('Failed to load intern dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setChecking(true);
    try {
      const res = await api.post('/attendance/check-in');
      setAttendanceToday(res.data);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Check-in failed');
    } finally {
      setChecking(false);
    }
  };

  const handleCheckOut = async () => {
    setChecking(true);
    try {
      const res = await api.post('/attendance/check-out');
      setAttendanceToday(res.data);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Check-out failed');
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-800 rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 glass-panel rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'NOT_STARTED');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-brand-500/20 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950/40">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
            Intern Workspace
          </span>
          <h1 className="text-2xl font-bold text-white tracking-wide mt-1">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track assigned tasks, log daily progress, and collaborate with your team.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button onClick={() => navigate('/progress')} variant="primary" size="sm">
            <Plus className="w-4 h-4" /> Submit Progress
          </Button>
        </div>
      </div>

      {/* Overview Row: Check-in Widget & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Attendance Check-in Widget */}
        <Card className="flex flex-col justify-between border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Daily Attendance</p>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {attendanceToday
                  ? attendanceToday.checkOutTime
                    ? 'Logged Out'
                    : 'Checked In'
                  : 'Not Checked In'}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            {!attendanceToday ? (
              <Button onClick={handleCheckIn} isLoading={checking} variant="primary" size="sm" className="w-full">
                <Play className="w-3.5 h-3.5" /> Check In Now
              </Button>
            ) : !attendanceToday.checkOutTime ? (
              <Button onClick={handleCheckOut} isLoading={checking} variant="danger" size="sm" className="w-full">
                <Square className="w-3.5 h-3.5" /> Check Out Today
              </Button>
            ) : (
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center text-xs text-emerald-400">
                Completed ({attendanceToday.totalHours} hrs logged)
              </div>
            )}
          </div>
        </Card>

        {/* Assigned Tasks Summary */}
        <Card className="flex items-center justify-between border-l-4 border-l-brand-500">
          <div>
            <p className="text-xs text-slate-400 font-medium">My Active Tasks</p>
            <h3 className="text-2xl font-bold text-white mt-1">{inProgressTasks.length}</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Total {tasks.length} tasks assigned
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <CheckSquare className="w-6 h-6" />
          </div>
        </Card>

        {/* AI Assistant Quick Access */}
        <Card className="flex items-center justify-between border-l-4 border-l-indigo-500">
          <div>
            <p className="text-xs text-slate-400 font-medium">Team AI Context</p>
            <h3 className="text-sm font-bold text-white mt-1">Smart Assistance</h3>
            <p className="text-[11px] text-brand-300 mt-1">
              Ask about your tasks & deadlines
            </p>
          </div>
          <Button onClick={() => navigate('/ai')} variant="outline" size="sm">
            <Bot className="w-4 h-4" /> Ask AI
          </Button>
        </Card>
      </div>

      {/* Main Grid: My Active Tasks & Progress Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tasks List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-brand-400" />
              My Current Tasks
            </h3>
            <Link to="/tasks" className="text-xs text-brand-400 hover:underline flex items-center gap-1 font-medium">
              View All Tasks <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <Card className="text-center py-8 text-slate-400 text-xs">
                No tasks assigned to you currently.
              </Card>
            ) : (
              tasks.slice(0, 5).map(task => (
                <Card key={task.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{task.title}</span>
                      <Badge variant={task.status === 'COMPLETED' ? 'completed' : task.status === 'SUBMITTED' ? 'pending' : 'active'}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant={task.priority.toLowerCase() as any}>
                        {task.priority}
                      </Badge>
                    </div>
                    {task.description && <p className="text-xs text-slate-300 line-clamp-1">{task.description}</p>}
                    {task.dueDate && (
                      <p className="text-[11px] text-slate-400">
                        Due Date: <span className="text-brand-300">{new Date(task.dueDate).toLocaleDateString()}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button onClick={() => navigate('/progress')} variant="secondary" size="sm">
                      Log Progress
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Quick Links & Team Info */}
        <div className="space-y-6">
          <Card className="space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-700/60 pb-2">
              <FolderKanban className="w-4 h-4 text-brand-400" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button onClick={() => navigate('/progress')} variant="primary" size="sm" className="w-full justify-start">
                <TrendingUp className="w-4 h-4" /> Submit Daily Work Progress
              </Button>
              <Button onClick={() => navigate('/chat')} variant="secondary" size="sm" className="w-full justify-start">
                <Bot className="w-4 h-4" /> Open Team Chat
              </Button>
              <Button onClick={() => navigate('/calendar')} variant="outline" size="sm" className="w-full justify-start">
                <CalendarIcon className="w-4 h-4" /> View Team Events
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
