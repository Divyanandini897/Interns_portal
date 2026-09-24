import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Clock, Play, Square, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [checking, setChecking] = useState<boolean>(false);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/attendance');
      setRecords(res.data || []);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setChecking(true);
    try {
      await api.post('/attendance/check-in');
      fetchAttendance();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Check-in failed');
    } finally {
      setChecking(false);
    }
  };

  const handleCheckOut = async () => {
    setChecking(true);
    try {
      await api.post('/attendance/check-out');
      fetchAttendance();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Check-out failed');
    } finally {
      setChecking(false);
    }
  };

  const todayRecord = records.find(r => {
    const recordDate = new Date(r.date).toDateString();
    const todayDate = new Date().toDateString();
    return recordDate === todayDate && r.userId === user?.id;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Clock className="w-6 h-6 text-brand-400" />
            Attendance & Time Logging
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track check-in times, check-outs, daily total hours, and work attendance.
          </p>
        </div>

        {!isAdmin && (
          <div className="flex items-center gap-2">
            {!todayRecord ? (
              <Button onClick={handleCheckIn} isLoading={checking} variant="primary">
                <Play className="w-4 h-4" /> Check In Today
              </Button>
            ) : !todayRecord.checkOutTime ? (
              <Button onClick={handleCheckOut} isLoading={checking} variant="danger">
                <Square className="w-4 h-4" /> Check Out Today
              </Button>
            ) : (
              <Badge variant="completed" className="px-4 py-2 text-xs font-semibold">
                Checked Out Today ({todayRecord.totalHours} hrs)
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Attendance History Table */}
      <Card className="overflow-hidden p-0">
        <div className="p-4 border-b border-slate-700/60 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-400" />
            Attendance History Log
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 animate-pulse text-xs">Loading logs...</div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No attendance logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700/60">
                <tr>
                  <th className="py-3 px-4">Intern Name</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check-In</th>
                  <th className="py-3 px-4">Check-Out</th>
                  <th className="py-3 px-4">Total Hours</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-2.5 font-medium text-white">
                      <Avatar name={r.user?.name || 'User'} src={r.user?.avatarUrl} size="sm" />
                      <span>{r.user?.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-mono">
                      {new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-amber-400 font-mono">
                      {r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-brand-300">
                      {r.totalHours ? `${r.totalHours} hrs` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={r.status === 'PRESENT' ? 'completed' : 'pending'}>
                        {r.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
