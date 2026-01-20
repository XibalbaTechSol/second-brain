'use client';

import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus,
  LayoutGrid,
  List as ListIcon,
  Columns as ColumnsIcon
} from 'lucide-react';

const VIEWS = ['Day', 'Week', 'Month'];

export default function CalendarPage() {
  const [view, setView] = useState('Month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Mock events for the Nord theme visualization
  const mockEvents = [
    { id: 1, title: 'Project Momentum Check', time: '10:00 AM', type: 'Nudge', color: 'aurora-orange' },
    { id: 2, title: 'Idea Scaling Insight', time: '02:30 PM', type: 'Logic', color: 'primary' },
    { id: 3, title: 'Admin Efficiency Audit', time: 'Tomorrow', type: 'Automation', color: 'aurora-purple' },
  ];

  return (
    <div className="h-full flex flex-col bg-background transition-colors duration-300">
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
            <button className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-black uppercase tracking-widest text-foreground min-w-[120px] text-center">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2 active:scale-95">
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
            {/* Generate 35 squares for a 5-week month view */}
            {Array.from({ length: 35 }).map((_, i) => {
              const dayNum = i - 2; // Offset to match a real month start
              const isToday = dayNum === 20; // Mocking Jan 20th
              return (
                <div 
                  key={i} 
                  className={`min-h-[140px] bg-card border-r border-b border-border p-4 transition-colors hover:bg-muted/10 group ${
                    dayNum <= 0 ? 'opacity-20' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-black ${isToday ? 'bg-primary text-primary-foreground w-6 h-6 rounded-lg flex items-center justify-center -mt-1 -ml-1' : 'text-muted-foreground'}`}>
                      {dayNum > 0 ? dayNum : ''}
                    </span>
                  </div>
                  
                  {isToday && (
                    <div className="space-y-1.5">
                      {mockEvents.map(event => (
                        <div key={event.id} className="bg-background border border-border p-1.5 rounded-lg shadow-sm flex items-center gap-2 group/item hover:border-primary/50 transition-all cursor-pointer">
                          <div className={`w-1 h-4 rounded-full ${event.color === 'aurora-orange' ? 'bg-aurora-orange' : event.color === 'aurora-purple' ? 'bg-aurora-purple' : 'bg-primary'}`} />
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

        {(view === 'Week' || view === 'Day') && (
          <div className="bg-card border border-border rounded-[2.5rem] p-12 text-center flex flex-col items-center justify-center min-h-[400px] transition-colors shadow-sm">
            <div className="bg-muted p-6 rounded-3xl mb-6">
              <Clock className="w-12 h-12 text-muted-foreground opacity-40" />
            </div>
            <h3 className="text-2xl font-black italic tracking-tight text-foreground mb-2">{view} View Optimizing...</h3>
            <p className="text-muted-foreground max-w-md font-medium">The temporal reasoning engine is currently structuring your {view.toLowerCase()}ly synaptic connections.</p>
          </div>
        )}
      </main>
    </div>
  );
}
