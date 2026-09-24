import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { FolderKanban, Plus, Calendar, CheckSquare, Users } from 'lucide-react';

export const ProjectsManagement: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [projects, setProjects] = useState<any[]>([]);
  const [teamsList, setTeamsList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [dueDate, setDueDate] = useState('');
  const [teamId, setTeamId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const [projRes, teamRes] = await Promise.all([
        api.get('/projects'),
        api.get('/teams')
      ]);
      setProjects(projRes.data || []);
      setTeamsList(teamRes.data || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/projects', {
        name,
        description,
        status,
        dueDate,
        teamId: teamId || undefined
      });
      setIsModalOpen(false);
      setName('');
      setDescription('');
      fetchProjects();
    } catch (err) {
      alert('Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-brand-400" />
            Projects & Roadmaps
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Oversee active software engineering initiatives, milestones, and deliverables.
          </p>
        </div>

        {isAdmin && (
          <Button onClick={() => setIsModalOpen(true)} variant="primary" size="md">
            <Plus className="w-4 h-4" /> Create New Project
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-48 glass-panel rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="text-center py-12 text-slate-400 text-sm">
          No active projects found.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map(proj => (
            <Card key={proj.id} className="space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-white">{proj.name}</h3>
                    {proj.team && (
                      <span className="text-xs text-brand-300 font-medium">
                        Team: {proj.team.name}
                      </span>
                    )}
                  </div>
                  <Badge variant={proj.status === 'COMPLETED' ? 'completed' : 'active'}>
                    {proj.status}
                  </Badge>
                </div>

                <p className="text-xs text-slate-300 mt-2 line-clamp-2">{proj.description}</p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-brand-400" />
                    <span>Tasks: {proj._count?.tasks || proj.tasks?.length || 0}</span>
                  </div>
                  {proj.dueDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Due: {new Date(proj.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Members Avatars Footer */}
              <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {proj.members?.slice(0, 4).map((m: any) => (
                    <Avatar key={m.id} name={m.user?.name || 'User'} src={m.user?.avatarUrl} size="sm" />
                  ))}
                  {proj.members?.length > 4 && (
                    <span className="text-[10px] text-slate-400 font-semibold pl-1">
                      +{proj.members.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Project Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Mobile App Redesign"
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Project goals and technical specifications..."
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Team</label>
              <select
                value={teamId}
                onChange={e => setTeamId(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="">Select Team...</option>
                {teamsList.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
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

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-700/60">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} variant="primary">
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
