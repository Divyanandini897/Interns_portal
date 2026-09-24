import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Calendar as CalendarIcon, Plus, Clock, MapPin, Video, Users } from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [interns, setInterns] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEventsData();
  }, []);

  const fetchEventsData = async () => {
    try {
      const [eventsRes, internsRes] = await Promise.all([
        api.get('/events'),
        api.get('/users?role=INTERN')
      ]);
      setEvents(eventsRes.data || []);
      setInterns(internsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/events', {
        title,
        description,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        location,
        meetingLink,
        participantIds: selectedParticipants
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      fetchEventsData();
    } catch (err) {
      alert('Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-brand-400" />
            Calendar & Schedule
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize team standups, project demos, code reviews, and meetings.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} variant="primary" size="md">
          <Plus className="w-4 h-4" /> Schedule Event
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 glass-panel rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card className="text-center py-12 text-slate-400 text-sm">
          No calendar events scheduled yet.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map(event => (
            <Card key={event.id} className="p-5 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-base text-white">{event.title}</h3>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                    {new Date(event.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {event.description && (
                  <p className="text-xs text-slate-300 mt-2">{event.description}</p>
                )}

                <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-brand-400" />
                    <span>
                      {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>{event.location}</span>
                    </div>
                  )}

                  {event.meetingLink && (
                    <div className="flex items-center gap-2">
                      <Video className="w-3.5 h-3.5 text-indigo-400" />
                      <a href={event.meetingLink} target="_blank" rel="noreferrer" className="text-brand-300 hover:underline truncate">
                        {event.meetingLink}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                <span>Organizer: {event.creator?.name || 'Admin'}</span>
                <span>{event.participants?.length || 0} Participants</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Schedule Event Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule New Team Event">
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Event Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Sprint Demo & Code Review"
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Meeting agenda and topics..."
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Start Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">End Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Location / Room</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Conference Room B"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Meeting Link (Google Meet/Zoom)</label>
              <input
                type="text"
                value={meetingLink}
                onChange={e => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-700/60">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} variant="primary">
              Schedule Event
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
