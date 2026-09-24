import React from 'react';
import { Card } from '../../components/ui/Card';
import { Settings, Shield, Bell, Lock } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-400" />
          System Settings & Security
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure security settings, API integration tokens, and notification preferences.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-700/60 pb-3">
          <Shield className="w-4 h-4 text-brand-400" />
          Authentication & Role Security
        </h3>
        <p className="text-xs text-slate-300">
          Role-Based Access Control (RBAC) is enforced at the Express API layer. JWT tokens are set with standard 7-day expiration.
        </p>
      </Card>
    </div>
  );
};
