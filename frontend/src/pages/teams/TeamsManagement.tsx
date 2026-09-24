import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { Users, Plus, Shield, FolderKanban, UserPlus } from 'lucide-react';

export const TeamsManagement: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [teams, setTeams] = useState<any[]>([]);
  const [internsList, setInternsList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTeamsData();
  }, []);

  const fetchTeamsData = async () => {
    try {
      const [teamsRes, internsRes] = await Promise.all([
        api.get('/teams'),
        api.get('/users?role=INTERN')
      ]);
      setTeams(teamsRes.data || []);
      setInternsList(internsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/teams', {
        name,
        description,
        memberIds: selectedMembers
      });
      setIsCreateModalOpen(false);
      setName('');
      setDescription('');
      setSelectedMembers([]);
      fetchTeamsData();
    } catch (err) {
      alert('Failed to create team');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMemberSelection = (userId: string) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-400" />
            Engineering Teams
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize interns into guilds, assign team leaders, and manage project collaboration.
          </p>
        </div>

        {isAdmin && (
          <Button onClick={() => setIsCreateModalOpen(true)} variant="primary" size="md">
            <Plus className="w-4 h-4" /> Create Team
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-56 glass-panel rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <Card className="text-center py-12 text-slate-400 text-sm">
          No engineering teams configured yet.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map(team => (
            <Card key={team.id} className="space-y-4">
              <div className="flex items-start justify-between border-b border-slate-700/60 pb-3">
                <div>
                  <h3 className="font-bold text-lg text-white">{team.name}</h3>
                  <p className="text-xs text-slate-300 mt-0.5">{team.description}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/30">
                  {team._count?.members || team.members?.length || 0} Members
                </span>
              </div>

              {/* Team Manager */}
              {team.manager && (
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Shield className="w-4 h-4 text-brand-400" />
                  <span>Team Leader: <strong className="text-white">{team.manager.name}</strong></span>
                </div>
              )}

              {/* Team Members List */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Assigned Members</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {team.members?.map((m: any) => (
                    <div key={m.id} className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-700/50">
                      <Avatar name={m.user?.name || 'Member'} src={m.user?.avatarUrl} size="sm" onlineStatus={m.user?.onlineStatus} />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-white truncate">{m.user?.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{m.user?.jobTitle || m.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects linked */}
              {team.projects && team.projects.length > 0 && (
                <div className="pt-3 border-t border-slate-700/60 flex items-center gap-2 text-xs text-slate-300">
                  <FolderKanban className="w-4 h-4 text-indigo-400" />
                  <span>Active Projects: <strong className="text-brand-300">{team.projects.map((p: any) => p.name).join(', ')}</strong></span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Engineering Team">
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Team Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Frontend Guild, AI Research Team"
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the team responsibilities..."
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Assign Intern Members</label>
            <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-900/60 border border-slate-700/60">
              {internsList.map(intern => {
                const isSelected = selectedMembers.includes(intern.id);
                return (
                  <div
                    key={intern.id}
                    onClick={() => toggleMemberSelection(intern.id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-brand-600/30 border border-brand-500/50' : 'hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar name={intern.name} src={intern.avatarUrl} size="sm" />
                      <div>
                        <p className="text-xs font-semibold text-white">{intern.name}</p>
                        <p className="text-[10px] text-slate-400">{intern.email}</p>
                      </div>
                    </div>
                    {isSelected && <span className="text-xs text-brand-400 font-bold">Selected</span>}
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
              Create Team
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
