import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { User, Mail, Phone, Briefcase, Github, Linkedin, Save, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [phone, setPhone] = useState(user?.profile?.phone || '');
  const [department, setDepartment] = useState(user?.profile?.department || '');
  const [skills, setSkills] = useState(user?.profile?.skills || '');
  const [githubUrl, setGithubUrl] = useState(user?.profile?.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.profile?.linkedinUrl || '');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      await api.put(`/users/${user?.id}`, {
        name,
        jobTitle,
        bio,
        phone,
        department,
        skills,
        githubUrl,
        linkedinUrl
      });
      await refreshUser();
      setSuccess(true);
    } catch (err) {
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <Avatar name={user?.name || 'User'} src={user?.avatarUrl} size="xl" onlineStatus={user?.onlineStatus} />
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">{user?.name}</h1>
          <p className="text-xs text-brand-300 font-medium">{user?.jobTitle || 'Intern Engineer'}</p>
          <p className="text-xs text-slate-400 mt-1">{user?.email} • Role: {user?.role}</p>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2 border-b border-slate-700/60 pb-3">
          <User className="w-5 h-5 text-brand-400" />
          Edit Personal & Engineering Profile
        </h3>

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Department / Guild</label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Bio & Short Summary</label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Technical Skills</label>
            <input
              type="text"
              value={skills}
              onChange={e => setSkills(e.target.value)}
              placeholder="React, Node.js, TypeScript..."
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">GitHub Profile URL</label>
              <input
                type="text"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">LinkedIn Profile URL</label>
              <input
                type="text"
                value={linkedinUrl}
                onChange={e => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-700/60 flex justify-end">
            <Button type="submit" isLoading={saving} variant="primary">
              <Save className="w-4 h-4" /> Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
