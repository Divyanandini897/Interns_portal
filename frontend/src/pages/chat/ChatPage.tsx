import React, { useEffect, useState, useRef } from 'react';
import { api, uploadFiles } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { MessageSquare, Send, Paperclip, Users, User, Circle } from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!activeConversation || !socket) return;

    socket.emit('join_conversation', activeConversation.id);

    const handleNewMessage = (msg: any) => {
      if (msg.conversationId === activeConversation.id) {
        setMessages(prev => [...prev, msg]);
        scrollToBottom();
      }
    };

    const handleTyping = (data: any) => {
      if (data.conversationId === activeConversation.id && data.userId !== user?.id) {
        setTypingUser(data.userName);
      }
    };

    const handleStopTyping = (data: any) => {
      if (data.conversationId === activeConversation.id) {
        setTypingUser(null);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);

    return () => {
      socket.emit('leave_conversation', activeConversation.id);
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
    };
  }, [activeConversation?.id, socket, user?.id]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      const convs = res.data || [];
      setConversations(convs);
      if (convs.length > 0) {
        selectConversation(convs[0]);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conv: any) => {
    setActiveConversation(conv);
    try {
      const res = await api.get(`/chat/messages/${conv.id}`);
      setMessages(res.data || []);
      scrollToBottom();
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && selectedFiles.length === 0) return;
    if (!activeConversation) return;

    setSending(true);
    try {
      let uploadedFileObjects: any[] = [];
      if (selectedFiles.length > 0) {
        const uploadRes = await uploadFiles(selectedFiles);
        uploadedFileObjects = uploadRes.files || [];
      }

      if (socket) {
        socket.emit('send_message', {
          conversationId: activeConversation.id,
          content,
          files: uploadedFileObjects
        });
      } else {
        const res = await api.post('/chat/messages', {
          conversationId: activeConversation.id,
          content,
          files: uploadedFileObjects
        });
        setMessages(prev => [...prev, res.data]);
      }

      setContent('');
      setSelectedFiles([]);
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const getConvTitle = (conv: any) => {
    if (conv.type === 'TEAM') return conv.title || conv.team?.name || 'Team Channel';
    const otherUser = conv.participant1Id === user?.id ? conv.participant2 : conv.participant1;
    return otherUser?.name || 'Direct Message';
  };

  return (
    <div className="h-[calc(100vh-100px)] glass-panel rounded-3xl overflow-hidden flex border border-slate-800 shadow-2xl">
      {/* Channels & Conversations Sidebar (1/3) */}
      <div className="w-80 border-r border-slate-800 bg-slate-900/60 flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-base text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-400" /> Channels & DMs
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
          {loading ? (
            <div className="p-4 text-xs text-slate-400 animate-pulse text-center">Loading chats...</div>
          ) : (
            conversations.map(conv => {
              const isActive = activeConversation?.id === conv.id;
              const title = getConvTitle(conv);
              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full text-left p-3.5 flex items-center gap-3 transition-colors ${
                    isActive ? 'bg-brand-600/20 border-l-4 border-l-brand-500' : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400 flex-shrink-0">
                    {conv.type === 'TEAM' ? <Users className="w-4 h-4 text-indigo-400" /> : <User className="w-4 h-4 text-brand-400" />}
                  </div>
                  <div className="truncate flex-1">
                    <p className="font-semibold text-xs text-white truncate">{title}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {conv.messages?.[0]?.content || 'Start conversation...'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Active Conversation Chat Window (2/3) */}
      <div className="flex-1 flex flex-col bg-slate-950/40">
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">{getConvTitle(activeConversation)}</h3>
                {typingUser && (
                  <p className="text-[10px] text-brand-400 animate-pulse font-medium">
                    {typingUser} is typing...
                  </p>
                )}
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map(msg => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex gap-3 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                    <Avatar name={msg.sender?.name || 'User'} src={msg.sender?.avatarUrl} size="sm" />
                    <div>
                      <div className={`flex items-center gap-2 text-[10px] text-slate-400 mb-1 ${isMe ? 'justify-end' : ''}`}>
                        <span className="font-semibold text-slate-300">{msg.sender?.name}</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isMe ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-tl-none'
                      }`}>
                        <p>{msg.content}</p>
                        {msg.files?.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/20 space-y-1">
                            {msg.files.map((f: any) => (
                              <a key={f.id} href={f.fileUrl} target="_blank" rel="noreferrer" className="block text-[11px] underline opacity-90 truncate">
                                📎 {f.originalName || f.filename}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Send Message Form Footer */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/80 space-y-2">
              {selectedFiles.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-brand-300 px-2">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>{selectedFiles.length} file(s) attached</span>
                  <button type="button" onClick={() => setSelectedFiles([])} className="text-rose-400 text-[10px] underline ml-2">Clear</button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <label className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors">
                  <Paperclip className="w-4 h-4" />
                  <input
                    type="file"
                    multiple
                    onChange={e => setSelectedFiles(Array.from(e.target.files || []))}
                    className="hidden"
                  />
                </label>

                <input
                  type="text"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
                />

                <Button type="submit" isLoading={sending} variant="primary" size="sm" className="px-4 py-2">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
            Select a channel or direct message to start chatting.
          </div>
        )}
      </div>
    </div>
  );
};
