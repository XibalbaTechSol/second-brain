'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus,
  X,
  Send,
  Loader2
} from 'lucide-react';
import { formatToMMDDYYYY } from '@/lib/date-utils';

const VIEWS = ['Day', 'Week', 'Month'];

export default function CalendarPage() {
  const [view, setView] = useState('Month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [isModalOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // New Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('TASK');

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/calendar/events');
      if (res.ok) setEvents(await res.json());
    } catch (e) {
      console.error('Failed to load events');
    }
  };

  const handlePrev = () => {
    if (view === 'Month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (view === 'Week') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1));
    }
  };

  const handleNext = () => {
    if (view === 'Month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (view === 'Week') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1));
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsOpen(true);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !selectedDate) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          type: newType,
          scheduledAt: selectedDate.toISOString(),
        })
      });

      if (res.ok) {
        setNewTitle('');
        setNewDesc('');
        setIsOpen(false);
        fetchEvents();
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to get events for a specific date
  const getEventsForDay = (date: Date) => {
    return events.filter(e => {
      const d = new Date(e.scheduledAt);
      return d.getDate() === date.getDate() && 
             d.getMonth() === date.getMonth() && 
             d.getFullYear() === date.getFullYear();
    });
  };

  const getWeekDays = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const getDayLabel = () => {
    if (view === 'Month') {
      return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    } else if (view === 'Week') {
      const week = getWeekDays(currentDate);
      return `${week[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${week[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <div className="h-full flex flex-col bg-background transition-colors duration-300 relative">
      {/* Calendar Header */}
      <header className="px-8 py-6 border-b border-border flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-2.5 rounded-2xl">
            <CalendarIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground italic transition-colors">
              Synaptic <span className="text-primary not-italic font-medium">Schedule</span>
            </h1>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest transition-colors opacity-60">
              Temporal Intelligence Layer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* View Toggles */}
          <div className="bg-muted/30 p-1 rounded-xl border border-border flex">
            {VIEWS.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  view === v 
                    ? 'bg-card text-foreground shadow-sm border border-border' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="h-6 w-[1px] bg-border mx-2" />

          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrev}
              className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-black uppercase tracking-widest text-foreground min-w-[200px] text-center">
              {getDayLabel()}
            </span>
            <button 
              onClick={handleNext}
              className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button 
            onClick={() => { setSelectedDate(new Date()); setIsOpen(true); }}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>
      </header>

      {/* Main Calendar Area */}
      <main className="flex-1 overflow-auto p-8">
        {view === 'Month' && (
          <div className="grid grid-cols-7 border-t border-l border-border rounded-3xl overflow-hidden shadow-2xl shadow-primary/5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="bg-muted/20 border-r border-b border-border p-4 text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{day}</span>
              </div>
            ))}
            {/* Generate 42 squares for a 6-week month view (standard for full coverage) */}
            {Array.from({ length: 42 }).map((_, i) => {
              const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
              const startDay = firstDayOfMonth.getDay();
              const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i - startDay + 1);
              
              const isValidDay = dayDate.getMonth() === currentDate.getMonth();
              const isToday = dayDate.toDateString() === new Date().toDateString();
              
              const dayEvents = isValidDay ? getEventsForDay(dayDate) : [];

              return (
                <div 
                  key={i} 
                  onClick={() => isValidDay && handleDateClick(dayDate)}
                  className={`min-h-[140px] bg-card border-r border-b border-border p-4 transition-colors relative ${
                    isValidDay ? 'hover:bg-muted/10 group cursor-pointer' : 'opacity-20 pointer-events-none'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-black ${isToday ? 'bg-primary text-primary-foreground w-6 h-6 rounded-lg flex items-center justify-center -mt-1 -ml-1 shadow-lg' : 'text-muted-foreground'}`}>
                      {isValidDay ? dayDate.getDate() : ''}
                    </span>
                  </div>
                  
                  {isValidDay && (
                    <div className="space-y-1.5">
                      {dayEvents.map(event => (
                        <div key={event.id} className="bg-background border border-border p-1.5 rounded-lg shadow-sm flex items-center gap-2 group/item hover:border-primary/50 transition-all">
                          <div className={`w-1 h-4 rounded-full ${
                            event.type === 'NUDGE' ? 'bg-aurora-orange' : 
                            event.type === 'NOTIFICATION' ? 'bg-aurora-purple' : 'bg-aurora-green'
                          }`} />
                          <span className="text-[9px] font-bold text-foreground/80 truncate">{event.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {view === 'Week' && (
          <div className="grid grid-cols-7 border-t border-l border-border rounded-3xl overflow-hidden shadow-2xl shadow-primary/5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="bg-muted/20 border-r border-b border-border p-4 text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{day}</span>
              </div>
            ))}
            {getWeekDays(currentDate).map((day, i) => {
              const isToday = day.toDateString() === new Date().toDateString();
              const dayEvents = getEventsForDay(day);

              return (
                <div 
                  key={i} 
                  onClick={() => handleDateClick(day)}
                  className="min-h-[400px] bg-card border-r border-b border-border p-4 hover:bg-muted/10 group cursor-pointer transition-colors relative"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-sm font-black ${isToday ? 'bg-primary text-primary-foreground px-2 py-1 rounded-lg shadow-lg' : 'text-muted-foreground'}`}>
                      {day.getDate()}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {dayEvents.map(event => (
                      <div key={event.id} className="bg-background border border-border p-2 rounded-xl shadow-sm flex items-center gap-3 hover:border-primary/50 transition-all">
                        <div className={`w-1.5 h-6 rounded-full ${
                          event.type === 'NUDGE' ? 'bg-aurora-orange' : 
                          event.type === 'NOTIFICATION' ? 'bg-aurora-purple' : 'bg-aurora-green'
                        }`} />
                        <span className="text-[10px] font-bold text-foreground/80">{event.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === 'Day' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/5">
              <div className="p-8 border-b border-border bg-muted/20 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black italic text-primary">{currentDate.getDate()}</span>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-widest text-foreground">
                      {currentDate.toLocaleString('default', { weekday: 'long' })}
                    </h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDateClick(currentDate)}
                  className="bg-primary/10 text-primary p-3 rounded-2xl hover:bg-primary/20 transition-all"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8">
                <div className="space-y-4">
                  {getEventsForDay(currentDate).length > 0 ? (
                    getEventsForDay(currentDate).map(event => (
                      <div key={event.id} className="bg-background border border-border p-6 rounded-[2rem] shadow-sm flex items-center justify-between hover:border-primary/50 transition-all group">
                        <div className="flex items-center gap-6">
                          <div className={`w-2 h-12 rounded-full ${
                            event.type === 'NUDGE' ? 'bg-aurora-orange' : 
                            event.type === 'NOTIFICATION' ? 'bg-aurora-purple' : 'bg-aurora-green'
                          }`} />
                          <div>
                            <h4 className="text-lg font-black text-foreground mb-1 italic">{event.title}</h4>
                            <p className="text-sm text-muted-foreground font-medium">{event.description || 'No synaptic data added.'}</p>
                          </div>
                        </div>
                        <div className="bg-muted/50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          {event.type}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center flex flex-col items-center">
                      <div className="bg-muted p-6 rounded-3xl mb-6">
                        <Clock className="w-12 h-12 text-muted-foreground opacity-30" />
                      </div>
                      <h3 className="text-xl font-black italic text-foreground mb-2">No Temporal Anomalies</h3>
                      <p className="text-muted-foreground text-sm font-medium">Your schedule is currently a void of potential.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 bg-primary flex items-center justify-between text-primary-foreground">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-widest italic leading-tight text-white">Schedule Intelligence</h3>
                  <p className="text-[10px] font-bold opacity-80 uppercase tracking-tighter text-white">
                    {selectedDate ? formatToMMDDYYYY(selectedDate) : ''}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-all active:scale-90">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Event Essence</label>
                <input 
                  autoFocus
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Task title, goal, or reminder..."
                  className="w-full bg-background border border-border rounded-2xl py-4 px-6 text-foreground font-bold focus:ring-2 focus:ring-primary/50 outline-none shadow-inner"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Synaptic Description</label>
                <textarea 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Add context or notes..."
                  className="w-full h-32 bg-background border border-border rounded-2xl p-6 text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none resize-none shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Logic Type</label>
                  <select 
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl py-3 px-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary appearance-none shadow-inner"
                  >
                    <option value="TASK">Task (Green)</option>
                    <option value="NUDGE">Nudge (Orange)</option>
                    <option value="NOTIFICATION">Alert (Purple)</option>
                  </select>
                </div>
                
                <div className="flex items-end pb-1">
                   <button 
                    type="submit"
                    disabled={isSaving || !newTitle.trim()}
                    className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Inject Event
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}