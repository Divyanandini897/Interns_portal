import React, { useEffect, useState } from 'react';
import { api, uploadFiles } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, Plus, CheckCircle2, XCircle, Clock, Paperclip, Filter, FileText } from 'lucide-react';

export const ProgressTracking: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [updates, setUpdates] = useState<any[]>([]);
  const [tasksList, setTasksList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [reviewModalUpdate, setReviewModalUpdate] = useState<any>(null);

  // Submit Form
  const [taskId, setTaskId] = useState('');
  const [hoursWorked, setHoursWorked] = useState('8');
  const [progressPct, setProgressPct] = useState('75');
  const [workCompleted, setWorkCompleted] = useState('');
  const [currentWork, setCurrentWork] = useState('');
  const [challenges, setChallenges] = useState('');
  const [nextPlan, setNextPlan] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Review Form
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const [progRes, tasksRes] = await Promise.all([
        api.get('/progress'),
        api.get('/tasks')
      ]);
      setUpdates(progRes.data || []);
      setTasksList(tasksRes.data || []);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let uploadedFileObjects: any[] = [];
      if (selectedFiles.length > 0) {
        const uploadRes = await uploadFiles(selectedFiles);
        uploadedFileObjects = uploadRes.files || [];
      }

      await api.post('/progress', {
        taskId: taskId || undefined,
        hoursWorked: parseFloat(hoursWorked),
        progressPct: parseInt(progressPct, 10),
        workCompleted,
        currentWork,
        challenges,
        nextPlan,
        files: uploadedFileObjects
      });

      setIsSubmitModalOpen(false);
      setWorkCompleted('');
      setCurrentWork('');
      setChallenges('');
      setNextPlan('');
      setSelectedFiles([]);
      fetchProgressData();
    } catch (err) {
      alert('Failed to submit progress update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmission = async (isApproved: boolean) => {
    if (!reviewModalUpdate) return;
    setReviewing(true);
    try {
      await api.patch(`/progress/${reviewModalUpdate.id}/review`, {
        isApproved,
        reviewNotes
      });
      setReviewModalUpdate(null);
      setReviewNotes('');
      fetchProgressData();
    } catch (err) {
      alert('Failed to review submission.');
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-brand-400" />
            Daily & Weekly Progress Tracking
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Submit daily work logs, hours worked, completed features, challenges, and attachments.
          </p>
        </div>

        <Button onClick={() => setIsSubmitModalOpen(true)} variant="primary" size="md">
          <Plus className="w-4 h-4" /> Submit Daily Progress
        </Button>
      </div>

      {/* Progress Timeline Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 glass-panel rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : updates.length === 0 ? (
        <Card className="text-center py-12 text-slate-400 text-sm">
          No progress updates recorded yet. Click "Submit Daily Progress" to log your work.
        </Card>
      ) : (
        <div className="space-y-4">
          {updates.map(up => (
            <Card key={up.id} className="p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
                <div className="flex items-center gap-3">
                  <Avatar name={up.user?.name || 'Intern'} src={up.user?.avatarUrl} size="md" />
                  <div>
                    <h3 className="font-bold text-sm text-white">{up.user?.name}</h3>
                    <p className="text-[11px] text-slate-400">
                      {new Date(up.date).toLocaleDateString()} • Logged: <strong className="text-brand-300">{up.hoursWorked} hrs</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 font-semibold">{up.progressPct}% Complete</span>
                  <Badge variant={up.isApproved ? 'completed' : 'pending'}>
                    {up.isApproved ? 'Approved ✓' : 'Under Admin Review'}
                  </Badge>
                  {isAdmin && (
                    <Button onClick={() => setReviewModalUpdate(up)} variant="outline" size="sm">
                      Review Work
                    </Button>
                  )}
                </div>
              </div>

              {/* Work Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 space-y-1">
                  <p className="font-semibold text-brand-300">Completed Work</p>
                  <p className="text-slate-200">{up.workCompleted}</p>
                </div>

                {up.currentWork && (
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 space-y-1">
                    <p className="font-semibold text-indigo-300">Current Work in Progress</p>
                    <p className="text-slate-200">{up.currentWork}</p>
                  </div>
                )}
              </div>

              {(up.challenges || up.nextPlan) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {up.challenges && (
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 space-y-1">
                      <p className="font-semibold text-amber-300">Challenges / Blockers</p>
                      <p className="text-slate-300">{up.challenges}</p>
                    </div>
                  )}
                  {up.nextPlan && (
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 space-y-1">
                      <p className="font-semibold text-emerald-300">Next Planned Tasks</p>
                      <p className="text-slate-300">{up.nextPlan}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Attachments & Admin Review Notes */}
              {up.files && up.files.length > 0 && (
                <div className="flex items-center gap-2 pt-2 text-xs text-slate-300">
                  <Paperclip className="w-3.5 h-3.5 text-brand-400" />
                  <span>Attachments:</span>
                  {up.files.map((f: any) => (
                    <a key={f.id} href={f.fileUrl} target="_blank" rel="noreferrer" className="px-2 py-0.5 rounded bg-slate-700/60 text-brand-300 hover:underline">
                      {f.originalName || f.filename}
                    </a>
                  ))}
                </div>
              )}

              {up.reviewNotes && (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    Admin Review Note ({up.reviewer?.name || 'Reviewer'}):
                  </p>
                  <p className="text-slate-200">{up.reviewNotes}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Submit Progress Modal */}
      <Modal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} title="Submit Daily Progress Update">
        <form onSubmit={handleSubmitProgress} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Associated Task (Optional)</label>
            <select
              value={taskId}
              onChange={e => setTaskId(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="">Select Task...</option>
              {tasksList.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Hours Logged Today *</label>
              <input
                type="number"
                step="0.5"
                required
                value={hoursWorked}
                onChange={e => setHoursWorked(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Task Progress % *</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={progressPct}
                onChange={e => setProgressPct(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Work Completed Today *</label>
            <textarea
              rows={2}
              required
              value={workCompleted}
              onChange={e => setWorkCompleted(e.target.value)}
              placeholder="Describe features finished, commits pushed, or bugs fixed..."
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Current Work & Challenges</label>
            <textarea
              rows={2}
              value={challenges}
              onChange={e => setChallenges(e.target.value)}
              placeholder="Any roadblocks, questions, or bugs encountered..."
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Next Planned Steps</label>
            <textarea
              rows={2}
              value={nextPlan}
              onChange={e => setNextPlan(e.target.value)}
              placeholder="What you plan to work on tomorrow..."
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Attachments (Screenshots/Docs)</label>
            <input
              type="file"
              multiple
              onChange={e => setSelectedFiles(Array.from(e.target.files || []))}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-slate-800 file:text-brand-300"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-700/60">
            <Button type="button" variant="ghost" onClick={() => setIsSubmitModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} variant="primary">
              Submit Daily Log
            </Button>
          </div>
        </form>
      </Modal>

      {/* Admin Review Modal */}
      <Modal isOpen={!!reviewModalUpdate} onClose={() => setReviewModalUpdate(null)} title="Admin Review Submission">
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Review progress update from <strong className="text-white">{reviewModalUpdate?.user?.name}</strong>.
          </p>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Review Feedback Notes</label>
            <textarea
              rows={3}
              value={reviewNotes}
              onChange={e => setReviewNotes(e.target.value)}
              placeholder="Provide constructive feedback or changes requested..."
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-700/60">
            <Button onClick={() => handleReviewSubmission(false)} isLoading={reviewing} variant="danger">
              <XCircle className="w-4 h-4" /> Request Changes
            </Button>
            <Button onClick={() => handleReviewSubmission(true)} isLoading={reviewing} variant="primary">
              <CheckCircle2 className="w-4 h-4" /> Approve Work
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
