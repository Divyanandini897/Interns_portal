import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Briefcase, CheckSquare, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MyWork: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/tasks').then(res => {
      setTasks(res.data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-brand-400" />
            My Work Workspace
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Overview of all your active engineering tasks and deliverables.
          </p>
        </div>

        <Button onClick={() => navigate('/progress')} variant="primary" size="md">
          <TrendingUp className="w-4 h-4" /> Submit Progress Log
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-32 glass-panel rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <Card key={task.id} className="p-5 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white">{task.title}</h3>
                  <Badge variant={task.status === 'COMPLETED' ? 'completed' : 'active'}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
                {task.description && <p className="text-xs text-slate-300">{task.description}</p>}
              </div>

              <Button onClick={() => navigate('/progress')} variant="outline" size="sm">
                Log Progress
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
