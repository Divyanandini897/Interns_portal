import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { CheckSquare, Plus, LayoutGrid, List, Clock, Calendar, CheckCircle2 } from 'lucide-react';

export const TasksManagement: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [tasks, setTasks] = useState<any[]>([]);
  const [interns, setInterns] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTasksData();
  }, []);

  const fetchTasksData = async () => {
    try {
      const [tasksRes, internsRes, projRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/users?role=INTERN'),
        api.get('/projects')
      ]);
      setTasks(tasksRes.data || []);
      setInterns(internsRes.data || []);
      setProjects(projRes.data || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/tasks', {
        title,
        description,
        priority,
        dueDate: dueDate || undefined,
        projectId: projectId || undefined,
        assigneeIds: selectedAssignees
      });
      setIsCreateModalOpen(false);
      setTitle('');
      setDescription('');
      setSelectedAssignees([]);
      fetchTasksData();
    } catch (err) {
      alert('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchTasksData();
    } catch (err) {
      alert('Failed to update task status.');
    }
  };

  const kanbanColumns = [
    { id: 'NOT_STARTED', title: 'Not Started', color: 'border-slate-600' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-brand-500' },
    { id: 'SUBMITTED', title: 'Submitted', color: 'border-amber-500' },
    { id: 'UNDER_REVIEW', title: 'Under Review', color: 'border-indigo-500' },
    { id: 'COMPLETED', title: 'Completed', color: 'border-emerald-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-brand-400" />
            Task Management & Workflow
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track workflow statuses from creation to review and completion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700/60">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                viewMode === 'kanban' ? 'bg-brand-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                viewMode === 'list' ? 'bg-brand-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
          </div>

          {isAdmin && (
            <Button onClick={() => setIsCreateModalOpen(true)} variant="primary" size="md">
              <Plus className="w-4 h-4" /> Create Task
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-64 glass-panel rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
          {kanbanColumns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className="space-y-3">
                <div className={`p-3 rounded-xl glass-panel border-t-2 ${col.color} flex items-center justify-between`}>
                  <h3 className="font-semibold text-xs text-white">{col.title}</h3>
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center justify-center">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 min-h-[350px]">
                  {colTasks.map(task => (
                    <Card key={task.id} className="p-3.5 space-y-2 hover:border-brand-500/50">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-semibold text-xs text-white leading-tight">{task.title}</h4>
                        <Badge variant={task.priority.toLowerCase() as any}>
                          {task.priority}
                        </Badge>
                      </div>

                      {task.description && (
                        <p className="text-[11px] text-slate-300 line-clamp-2">{task.description}</p>
                      )}

                      <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                        {task.dueDate && (
                          <span className="flex items-center gap-1 text-brand-300 font-medium">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        )}

                        <div className="flex items-center gap-1 ml-auto">
                          {task.assignments?.map((a: any) => (
                            <Avatar key={a.id} name={a.user?.name || 'User'} src={a.user?.avatarUrl} size="sm" />
                          ))}
                        </div>
                      </div>

                      {/* Quick Status Advance Button */}
                      <div className="pt-2 flex items-center justify-end gap-1">
                        {col.id === 'NOT_STARTED' && (
                          <button
                            onClick={() => handleStatusUpdate(task.id, 'IN_PROGRESS')}
                            className="text-[10px] px-2 py-0.5 rounded bg-brand-600/30 text-brand-300 hover:bg-brand-600/50"
                          >
                            Start Work →
                          </button>
                        )}
                        {col.id === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleStatusUpdate(task.id, 'SUBMITTED')}
                            className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                          >
                            Submit Work →
                          </button>
                        )}
                        {col.id === 'SUBMITTED' && isAdmin && (
                          <button
                            onClick={() => handleStatusUpdate(task.id, 'COMPLETED')}
                            className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                          >
                            Approve Task ✓
                          </button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {tasks.map(task => (
            <Card key={task.id} className="p-4 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-white">{task.title}</h4>
                  <Badge variant={task.status === 'COMPLETED' ? 'completed' : 'active'}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant={task.priority.toLowerCase() as any}>
                    {task.priority}
                  </Badge>
                </div>
                {task.description && <p className="text-xs text-slate-300">{task.description}</p>}
              </div>

              <div className="flex items-center gap-3">
                {task.assignments?.map((a: any) => (
                  <Avatar key={a.id} name={a.user?.name || 'User'} src={a.user?.avatarUrl} size="md" />
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create & Assign New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Build Socket.IO Live Typing Handler"
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detailed instructions and requirements..."
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Project</label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="">Select Project...</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Assign Interns</label>
            <div className="max-h-36 overflow-y-auto space-y-1 p-2 rounded-xl bg-slate-900/60 border border-slate-700/60">
              {interns.map(intern => {
                const isSelected = selectedAssignees.includes(intern.id);
                return (
                  <div
                    key={intern.id}
                    onClick={() => {
                      if (isSelected) setSelectedAssignees(selectedAssignees.filter(id => id !== intern.id));
                      else setSelectedAssignees([...selectedAssignees, intern.id]);
                    }}
                    className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer text-xs ${
                      isSelected ? 'bg-brand-600/30 text-white font-semibold' : 'hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <span>{intern.name} ({intern.email})</span>
                    {isSelected && <span className="text-brand-400">Selected</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-700/60">
            <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} variant="primary">
              Assign Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
