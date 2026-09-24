import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [resetToken, setResetToken] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      if (res.data.resetToken) setResetToken(res.data.resetToken);
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl border border-slate-800">
        <h2 className="text-xl font-bold text-white mb-1">Reset Password</h2>
        <p className="text-xs text-slate-400 mb-6">Enter your registered email to receive reset instructions.</p>

        {message ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs space-y-2">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4" /> {message}
            </div>
            {resetToken && (
              <div className="pt-2 border-t border-emerald-500/20 text-[11px] text-slate-300">
                <p>Demo Reset Token:</p>
                <code className="bg-slate-900 p-1 rounded font-mono text-brand-300 break-all">{resetToken}</code>
                <div className="mt-3">
                  <Link to={`/reset-password?token=${encodeURIComponent(resetToken)}`} className="text-brand-400 hover:underline font-semibold">
                    Proceed to Reset Password →
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
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

            <Button type="submit" isLoading={loading} className="w-full py-2.5">
              Send Reset Token
            </Button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
