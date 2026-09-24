import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { GraduationCap, Lock, Mail, Shield, User } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('admin@company.com');
  const [password, setPassword] = useState<string>('Admin@123');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      const saved = localStorage.getItem('user');
      const user = saved ? JSON.parse(saved) : null;
      if (user?.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/intern/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl animate-pulse-subtle pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse-subtle pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl border border-slate-800 relative z-10"
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/30 text-white">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">InternPulse Portal</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in to your team management account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-brand-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <Button type="submit" isLoading={loading} className="w-full py-2.5 mt-2">
            Sign In to Dashboard
          </Button>
        </form>

        {/* Quick Demo Login Credentials */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2.5">
            Quick Demo Logins
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoSelect('admin@company.com', 'Admin@123')}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs text-left transition-colors flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-white">Admin</p>
                <p className="text-[10px] text-slate-400 truncate">admin@company.com</p>
              </div>
            </button>
            <button
              onClick={() => handleDemoSelect('intern1@company.com', 'Intern@123')}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs text-left transition-colors flex items-center gap-2"
            >
              <User className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-white">Intern</p>
                <p className="text-[10px] text-slate-400 truncate">intern1@company.com</p>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-400 font-semibold hover:underline">
              Create an Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
