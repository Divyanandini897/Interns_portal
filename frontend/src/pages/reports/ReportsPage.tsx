import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { BarChart3, TrendingUp, Users, FolderKanban, CheckSquare, Clock } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get('/reports/dashboard');
      setReport(res.data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
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

  const taskTotal = report?.tasks?.total || 1;
  const taskCompletedPct = Math.round(((report?.tasks?.completed || 0) / taskTotal) * 100);
  const taskInProgressPct = Math.round(((report?.tasks?.inProgress || 0) / taskTotal) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-400" />
            Program Reports & Performance Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated analytics on intern productivity, task execution metrics, and team progress.
          </p>
        </div>
      </div>

      {/* Analytical Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="space-y-2 border-l-4 border-l-brand-500">
          <p className="text-xs text-slate-400 font-medium">Intern Cohort Size</p>
          <h3 className="text-2xl font-bold text-white">{report?.interns?.total || 0}</h3>
          <p className="text-[11px] text-emerald-400 font-medium">
            {report?.interns?.active || 0} Active Enrolled
          </p>
        </Card>

        <Card className="space-y-2 border-l-4 border-l-indigo-500">
          <p className="text-xs text-slate-400 font-medium">Task Completion Rate</p>
          <h3 className="text-2xl font-bold text-white">{taskCompletedPct}%</h3>
          <p className="text-[11px] text-slate-400">
            {report?.tasks?.completed || 0} of {report?.tasks?.total || 0} Tasks Finished
          </p>
        </Card>

        <Card className="space-y-2 border-l-4 border-l-amber-500">
          <p className="text-xs text-slate-400 font-medium">Tasks Under Review</p>
          <h3 className="text-2xl font-bold text-white">{report?.tasks?.pendingReview || 0}</h3>
          <p className="text-[11px] text-amber-300">
            Awaiting Admin Sign-off
          </p>
        </Card>

        <Card className="space-y-2 border-l-4 border-l-emerald-500">
          <p className="text-xs text-slate-400 font-medium">Today Attendance</p>
          <h3 className="text-2xl font-bold text-white">{report?.todayAttendanceCount || 0}</h3>
          <p className="text-[11px] text-slate-400">
            Interns Checked-In Today
          </p>
        </Card>
      </div>

      {/* Visual Completion Breakdown Card */}
      <Card className="p-6 space-y-4">
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-400" />
          Task Status Distribution
        </h3>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-emerald-400">Completed Tasks ({report?.tasks?.completed || 0})</span>
              <span className="text-slate-300">{taskCompletedPct}%</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${taskCompletedPct}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-brand-400">In Progress Tasks ({report?.tasks?.inProgress || 0})</span>
              <span className="text-slate-300">{taskInProgressPct}%</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${taskInProgressPct}%` }} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
