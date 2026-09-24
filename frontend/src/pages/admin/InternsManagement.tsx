import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Briefcase,
  Github,
  Linkedin,
  Filter,
  UserCheck,
  UserX
} from 'lucide-react';

export const InternsManagement: React.FC = () => {
  const [interns, setInterns] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    jobTitle: 'Frontend Developer Intern',
    department: 'Frontend Guild',
    bio: '',
    phone: '',
    skills: 'React, TypeScript, Tailwind CSS',
    githubUrl: '',
    linkedinUrl: ''
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    fetchInterns();
  }, [statusFilter]);

  const fetchInterns = async () => {
    try {
      let url = '/users?role=INTERN';
      if (statusFilter !== 'ALL') url += `&status=${statusFilter}`;
      const res = await api.get(url);
      setInterns(res.data || []);
    } catch (err) {
      console.error('Failed to fetch interns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIntern = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await api.post('/users/interns', formData);
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        jobTitle: 'Frontend Developer Intern',
        department: 'Frontend Guild',
        bio: '',
        phone: '',
        skills: 'React, TypeScript, Tailwind CSS',
        githubUrl: '',
        linkedinUrl: ''
      });
      fetchInterns();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to create intern.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await api.patch(`/users/${userId}/status`, { status: newStatus });
      fetchInterns();
    } catch (err) {
      alert('Failed to update intern status.');
    }
  };

  const filteredInterns = interns.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.email.toLowerCase().includes(search.toLowerCase()) ||
    (i.jobTitle && i.jobTitle.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-400" />
            Intern Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Add, update, deactivate, and track enrolled intern engineers.
          </p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)} variant="primary" size="md">
          <Plus className="w-4 h-4" /> Add New Intern
        </Button>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">Status:</span>
          {['ALL', 'ACTIVE', 'INACTIVE', 'ON_LEAVE', 'COMPLETED'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Interns Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 glass-panel rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredInterns.length === 0 ? (
        <Card className="text-center py-12 text-slate-400 text-sm">
          No interns match your current search and filter criteria.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInterns.map(intern => (
            <Card key={intern.id} className="flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={intern.name} src={intern.avatarUrl} size="lg" onlineStatus={intern.onlineStatus} />
                    <div>
                      <h3 className="font-bold text-base text-white">{intern.name}</h3>
                      <p className="text-xs text-brand-300 font-medium">{intern.jobTitle || 'Intern'}</p>
                    </div>
                  </div>
                  <Badge variant={intern.status.toLowerCase() as any}>
                    {intern.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{intern.email}</span>
                  </div>
                  {intern.profile?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{intern.profile.phone}</span>
                    </div>
                  )}
                  {intern.profile?.department && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>{intern.profile.department}</span>
                    </div>
                  )}
                </div>

                {intern.profile?.skills && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {intern.profile.skills.split(',').map((skill: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-slate-700/60 text-slate-300">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {intern.profile?.githubUrl && (
                    <a href={intern.profile.githubUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {intern.profile?.linkedinUrl && (
                    <a href={intern.profile.linkedinUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {intern.status === 'ACTIVE' ? (
                    <button
                      onClick={() => handleStatusChange(intern.id, 'INACTIVE')}
                      className="px-2.5 py-1 rounded-lg text-xs bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 flex items-center gap-1"
                    >
                      <UserX className="w-3 h-3" /> Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(intern.id, 'ACTIVE')}
                      className="px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-1"
                    >
                      <UserCheck className="w-3 h-3" /> Activate
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Intern Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Intern Account">
        <form onSubmit={handleCreateIntern} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Jordan Lee"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="jordan@company.com"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Temporary Password *</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Job Title</label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Technical Skills (comma separated)</label>
            <input
              type="text"
              value={formData.skills}
              onChange={e => setFormData({ ...formData, skills: e.target.value })}
              placeholder="React, TypeScript, Node.js"
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-700/60">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} variant="primary">
              Create Intern Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
