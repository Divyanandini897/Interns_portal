import React, { useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Bot, Send, Sparkles, Shield, Code, Cpu } from 'lucide-react';

export const AiAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<'GENERAL' | 'TEAM'>('TEAM');
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'ASSISTANT',
      content: `Hello ${user?.name}! I am your AI Assistant. In **Team AI** mode, I can answer authorized questions about your active tasks, project timelines, team progress, and upcoming deadlines.`
    }
  ]);
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const handleSendPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userMessage = { role: 'USER', content: prompt };
    setMessages(prev => [...prev, userMessage]);
    const currentPrompt = prompt;
    setPrompt('');
    setLoading(true);

    try {
      const res = await api.post('/ai/ask', {
        prompt: currentPrompt,
        mode,
        conversationId
      });

      if (res.data.conversationId) setConversationId(res.data.conversationId);
      if (res.data.message) {
        setMessages(prev => [...prev, res.data.message]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ASSISTANT',
        content: '⚠️ Failed to connect to AI Assistant endpoint. Please check your backend connection.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = mode === 'TEAM' ? [
    'What are my active tasks and upcoming deadlines?',
    'Summarize my recent progress submissions and review status.',
    'Who are the members of my assigned team?'
  ] : [
    'How do I write a custom React hook for local storage?',
    'Explain Framer Motion page transitions and keyframe animations.',
    'What are best practices for Node.js REST API security?'
  ];

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-4 max-w-5xl mx-auto">
      {/* Mode Selector Header */}
      <div className="glass-panel p-4 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-brand-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">AI Assistant Hub</h1>
            <p className="text-xs text-slate-400">Dual-mode intelligence assistant powered by Gemini API</p>
          </div>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="bg-slate-900/80 p-1 rounded-2xl border border-slate-700/60 flex items-center gap-1">
          <button
            onClick={() => setMode('TEAM')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              mode === 'TEAM'
                ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Team AI (Context Aware)
          </button>
          <button
            onClick={() => setMode('GENERAL')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              mode === 'GENERAL'
                ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> General AI (Coding & Advice)
          </button>
        </div>
      </div>

      {/* Main Chat Stream Area */}
      <Card className="flex-1 overflow-y-auto p-6 space-y-4 glass-panel border border-slate-800">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'USER';
          return (
            <div key={idx} className={`flex gap-3.5 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${
                isUser ? 'bg-brand-600' : 'bg-gradient-to-tr from-indigo-600 to-brand-500'
              }`}>
                {isUser ? <Cpu className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div>
                <div className={`flex items-center gap-2 text-[10px] text-slate-400 mb-1 ${isUser ? 'justify-end' : ''}`}>
                  <span className="font-semibold">{isUser ? user?.name : `${mode === 'TEAM' ? 'Team AI' : 'General AI'}`}</span>
                </div>
                <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  isUser
                    ? 'bg-brand-600 text-white rounded-tr-none'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-700/80 rounded-tl-none space-y-2 whitespace-pre-wrap'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
      </Card>

      {/* Suggested Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium whitespace-nowrap">
          <Sparkles className="w-3 h-3 text-brand-400" /> Suggestions:
        </span>
        {samplePrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => setPrompt(p)}
            className="px-3 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs text-slate-300 hover:text-white whitespace-nowrap transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendPrompt} className="flex items-center gap-2 glass-panel p-2 rounded-2xl border border-slate-700/80">
        <input
          type="text"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder={`Ask ${mode === 'TEAM' ? 'Team AI about your tasks, project, deadlines...' : 'General AI about programming, React, Express...'}`}
          className="flex-1 bg-transparent px-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
        />
        <Button type="submit" isLoading={loading} variant="primary" size="md" className="px-5 py-2">
          <Send className="w-4 h-4" /> Ask AI
        </Button>
      </form>
    </div>
  );
};
