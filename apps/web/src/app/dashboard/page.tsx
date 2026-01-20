'use client';

import { useState, useEffect } from 'react';
import { 
  Check, X, Bell, AlertTriangle, MessageSquare, 
  Target, Sparkles, TrendingUp, Inbox, 
  BrainCircuit, ArrowRight, Clock, Plus, Zap
} from 'lucide-react';
import Link from 'next/link';

// Nord Aurora Colors for Charts/Progress
const AURORA = {
  red: '#bf616a',
  orange: '#d08770',
  yellow: '#ebcb8b',
  green: '#a3be8c',
  purple: '#b48ead',
};

type InboxItem = {
  id: string;
  content: string;
  source: string;
  status: string;
  createdAt: string;
  confidence?: number;
};

type Entity = {
  id: string;
  title: string;
  type: string;
  summary?: string;
  createdAt: string;
  status?: string;
  confidence?: number;
  project?: { 
    progress: number;
    priority: string;
    nextAction: string;
  };
};

export default function ReimaginedDashboard() {
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [inboxRes, entitiesRes] = await Promise.all([
        fetch('/api/inbox'),
        fetch('/api/entities')
      ]);
      if (inboxRes.ok) setInboxItems(await inboxRes.json());
      if (entitiesRes.ok) setEntities(await entitiesRes.json());
    } catch (err) {
      console.error('Fetch failed', err);
    }
  };

  const handleQuickCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setLoading(true);
    try {
      await fetch('/api/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newItem, source: 'quick-capture' }),
      });
      setNewItem('');
      fetchData();
    } finally {
      setLoading(false);
    }
  };

  const projects = entities.filter(e => e.type === 'PROJECT');
  const aiCoachItems = inboxItems.filter(i => i.source === 'AI_COACH' || i.source === 'AI_REASONING');
  const pendingInbox = inboxItems.filter(i => i.status === 'PENDING' || i.status === 'PROCESSING');

  // Stats for the snapshot
  const activeProjectCount = projects.filter(p => p.status === 'Active').length;
  const avgProgress = projects.length > 0 
    ? Math.round(projects.reduce((acc, p) => acc + (p.project?.progress || 0), 0) / projects.length) 
    : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* Header & Quick Snapshot */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground italic flex items-center gap-3 transition-colors">
            Intelligence <span className="text-primary not-italic tracking-normal font-medium">Snapshot</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-medium transition-colors">
            Analyze your progress and behavioral alignment.
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-card border border-border p-4 rounded-3xl shadow-sm flex items-center gap-4 transition-colors">
            <div className="p-3 bg-aurora-green/10 rounded-2xl">
              <Target className="w-6 h-6 text-aurora-green" />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground">{activeProjectCount}</div>
              <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest transition-colors">Active Projects</div>
            </div>
          </div>
          
          <div className="bg-card border border-border p-4 rounded-3xl shadow-sm flex items-center gap-4 transition-colors">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground">{avgProgress}%</div>
              <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest transition-colors">Overall Momentum</div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Quick Capture & Coach */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Quick Capture Card */}
          <section className="bg-primary p-8 rounded-[2.5rem] shadow-xl shadow-primary/20 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
              <BrainCircuit className="w-40 h-40" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2 italic tracking-tight">
                <Sparkles className="w-6 h-6 text-accent" /> Frictionless Capture
              </h2>
              <form onSubmit={handleQuickCapture} className="relative">
                <input 
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Tell your brain something new..."
                  className="w-full bg-white/10 border border-white/20 rounded-2xl py-5 pl-6 pr-32 text-xl placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-white backdrop-blur-sm"
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-2 bottom-2 bg-white text-primary px-6 rounded-xl font-black text-sm hover:bg-muted transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? 'Thinking...' : 'Capture'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
              <div className="mt-4 flex gap-4 text-[10px] font-bold uppercase tracking-widest text-white/60">
                <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> Auto-Routing active</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Processing: {pendingInbox.length} items</span>
              </div>
            </div>
          </section>

          {/* AI Coach Feed */}
          <section className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground ml-2 flex items-center gap-2 transition-colors">
              <Bell className="w-4 h-4" /> Intelligence Notifications
            </h3>
            <div className="space-y-3">
              {aiCoachItems.length === 0 ? (
                <div className="bg-card/50 border-2 border-dashed border-border rounded-[2rem] p-12 text-center text-muted-foreground transition-colors">
                  Your AI Coach is currently observing. Capture more data to trigger insights.
                </div>
              ) : (
                aiCoachItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="bg-card border border-border p-6 rounded-[2rem] flex gap-4 items-start hover:border-primary/30 transition-all group shadow-sm transition-colors">
                    <div className={`p-3 rounded-2xl shrink-0 ${item.source === 'AI_COACH' ? 'bg-aurora-purple/10 text-aurora-purple' : 'bg-primary/10 text-primary'}`}>
                      {item.source === 'AI_COACH' ? <BrainCircuit className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground font-medium leading-relaxed transition-colors">
                        {item.content.replace('🧠 AI COACH: ', '').replace('🧠 AI REASONING: ', '')}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-[10px] font-black uppercase text-muted-foreground tracking-widest transition-colors">
                        <span>{item.source === 'AI_COACH' ? 'Strategic Nudge' : 'Deep Reasoning'}</span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-muted rounded-xl transition-all">
                      <Check className="w-4 h-4 text-aurora-green" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Goal Snapshot & Stats */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Active Goals / Projects List */}
          <section className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm transition-colors">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black italic tracking-tight text-foreground transition-colors">Active Goals</h3>
              <Link href="/databases/projects" className="p-2 hover:bg-muted rounded-xl transition-colors">
                <Plus className="w-5 h-5 text-muted-foreground" />
              </Link>
            </div>
            
            <div className="space-y-6">
              {projects.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm font-medium transition-colors">No active projects yet.</div>
              ) : (
                projects.slice(0, 4).map((proj) => (
                  <div key={proj.id} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="font-bold text-sm text-foreground truncate max-w-[180px] transition-colors">{proj.title}</span>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest transition-colors">{proj.project?.progress || 0}%</span>
                    </div>
                    {/* Minimal SVG Progress Bar */}
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden transition-colors">
                      <div 
                        className="h-full bg-primary transition-all duration-1000"
                        style={{ width: `${proj.project?.progress || 0}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary transition-colors">
                      <ArrowRight className="w-3 h-3" /> Next: {proj.project?.nextAction || 'Define next step...'}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {projects.length > 4 && (
              <Link 
                href="/databases/projects"
                className="mt-8 block text-center py-3 border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all"
              >
                View all {projects.length} projects
              </Link>
            )}
          </section>

          {/* Quick Metrics / Visual Info */}
          <section className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm transition-colors">
             <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 transition-colors font-medium transition-colors">Knowledge Composition</h3>
             {/* Circular Composition Placeholder using SVG */}
             <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="var(--muted)" strokeWidth="12" fill="transparent" className="transition-colors" />
                  <circle 
                    cx="80" cy="80" r="70" 
                    stroke="var(--primary)" strokeWidth="12" fill="transparent" 
                    strokeDasharray="440" 
                    strokeDashoffset={440 - (440 * (avgProgress/100))}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-foreground transition-colors">{entities.length}</span>
                  <span className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter transition-colors">Entities</span>
                </div>
             </div>
             
             <div className="mt-8 space-y-3">
                {[
                  { label: 'Projects', value: projects.length, color: 'bg-primary' },
                  { label: 'Ideas', value: entities.filter(e => e.type === 'IDEA' || e.type === 'NOTE').length, color: 'bg-aurora-yellow' },
                  { label: 'People', value: entities.filter(e => e.type === 'PERSON' || e.type === 'CONTACT').length, color: 'bg-aurora-blue' },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${stat.color.replace('aurora-', '')}`} />
                      <span className="text-xs font-bold text-muted-foreground transition-colors">{stat.label}</span>
                    </div>
                    <span className="text-xs font-black text-foreground transition-colors">{stat.value}</span>
                  </div>
                ))}
             </div>
          </section>

        </div>
      </div>
    </div>
  );
}