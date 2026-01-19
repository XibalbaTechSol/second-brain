'use client';

import { useState, useEffect } from 'react';
import { Check, X, Bell, AlertTriangle } from 'lucide-react';

// Define types locally for now, or import from @second-brain/database if we export types properly
type InboxItem = {
  id: string;
  content: string;
  source: string;
  status: string;
  createdAt: string;
  confidence?: number;
  processingError?: string;
};

type Entity = {
  id: string;
  title: string;
  type: string;
  summary?: string;
  createdAt: string;
  task?: { isDone: boolean; priority?: string };
  project?: { status: string };
};

export default function Home() {
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(false);

  // Poll for updates to see backend working in real-time
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
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
    } catch (error) {
      console.error('Failed to load data', error);
    }
  };

  const handleCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newItem, source: 'web-dashboard' }),
      });

      if (res.ok) {
        setNewItem('');
        fetchData(); // Immediate refresh
      }
    } catch (error) {
      console.error('Failed to capture item', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCorrect = async (entityId: string) => {
    const newType = prompt('What is the correct type? (TASK, PROJECT, NOTE, CONTACT, RESOURCE)');
    if (!newType) return;

    try {
      const res = await fetch('/api/corrections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId, correctType: newType.toUpperCase() })
      });
      if (res.ok) {
        fetchData(); // Refresh to see changes
      }
    } catch (err) {
      console.error('Correction failed', err);
    }
  };

  // Group Items
  const nudges = inboxItems.filter(i => i.source === 'SYSTEM_NUDGE' && i.status !== 'COMPLETED');
  const needsReview = inboxItems.filter(i => i.status === 'NEEDS_USER_REVIEW');
  const pending = inboxItems.filter(i => i.status === 'PENDING' || i.status === 'PROCESSING');
  const recentCompleted = inboxItems.filter(i => i.status === 'COMPLETED').slice(0, 5);

  return (
    <main className="min-h-screen p-8 bg-gray-50 font-sans flex gap-8">
      
      {/* LEFT COLUMN: CAPTURE & INBOX */}
      <div className="flex-1 max-w-xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Inbox (The Drop Box)</h1>
          <p className="text-gray-600">Capture raw thoughts here. The Backend AI will sort them.</p>
        </div>

        {/* NUDGES */}
        {nudges.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-3">
             <h3 className="text-sm font-bold text-yellow-800 flex items-center gap-2">
               <Bell className="w-4 h-4 fill-yellow-600" />
               Tap on the Shoulder (Nudges)
             </h3>
             {nudges.map(item => (
               <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm flex gap-3 items-start">
                  <div className="flex-1 text-sm text-gray-800">{item.content}</div>
                  <div className="flex gap-1">
                     <button onClick={() => fetch(`/api/inbox/${item.id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({status:'COMPLETED'}) }).then(() => fetchData())} className="p-1 hover:bg-green-100 rounded text-green-600"><Check className="w-4 h-4"/></button>
                     <button onClick={() => fetch(`/api/inbox/${item.id}`, { method: 'DELETE' }).then(() => fetchData())} className="p-1 hover:bg-gray-100 rounded text-gray-400"><X className="w-4 h-4"/></button>
                  </div>
               </div>
             ))}
          </div>
        )}

        {/* NEEDS REVIEW ("The Bouncer") */}
        {needsReview.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
             <h3 className="text-sm font-bold text-red-800 flex items-center gap-2">
               <AlertTriangle className="w-4 h-4" />
               The Bouncer: Low Confidence Items
             </h3>
             {needsReview.map(item => (
               <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm space-y-2">
                  <div className="text-sm text-gray-800 font-medium">{item.content}</div>
                  <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
                    {item.processingError || `Confidence: ${item.confidence}`}
                  </div>
                  <div className="flex gap-2 justify-end">
                     <button onClick={() => fetch(`/api/inbox/${item.id}`, { method: 'DELETE' }).then(() => fetchData())} className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">Dismiss</button>
                     <button onClick={() => fetch(`/api/inbox/${item.id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({status:'COMPLETED'}) }).then(() => fetchData())} className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">Force Approve</button>
                  </div>
               </div>
             ))}
          </div>
        )}

        {/* Capture Input */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleCapture} className="flex gap-4">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="E.g., 'Buy milk', 'Plan Q3 roadmap', 'Idea for app...'"
              className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Capture
            </button>
          </form>
        </div>

        {/* Inbox List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Processing</h2>
          <div className="grid gap-3">
            {[...pending, ...recentCompleted].map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-gray-800">{item.content}</p>
                  <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className={`text-xs font-mono px-2 py-1 rounded ${
                  item.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                  item.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {item.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: THE BRAIN (PROCESSED ENTITIES) */}
      <div className="flex-1 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">The Brain (Sorted)</h1>
          <p className="text-gray-600">Items processed and categorized by the "Sorter".</p>
        </div>

        <div className="grid gap-4">
          {entities.map((entity) => (
            <div key={entity.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900">{entity.title}</h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleCorrect(entity.id)}
                    className="text-[10px] text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity uppercase font-bold tracking-tighter"
                  >
                    Fix AI
                  </button>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    entity.type === 'TASK' ? 'bg-purple-100 text-purple-700' :
                    entity.type === 'PROJECT' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {entity.type}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3">{entity.summary}</p>
              
              {/* Type Specific Metadata */}
              {entity.type === 'TASK' && entity.task && (
                <div className="flex gap-2 text-xs">
                  <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100">
                    Priority: {entity.task.priority}
                  </span>
                  <span className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded border border-gray-100">
                    Status: {entity.task.isDone ? 'Done' : 'To Do'}
                  </span>
                </div>
              )}
              
              {entity.type === 'PROJECT' && entity.project && (
                <div className="flex gap-2 text-xs">
                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">
                    Status: {entity.project.status}
                  </span>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
                Created: {new Date(entity.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
          {entities.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
              No entities yet. Capture something in the Inbox to see the AI work!
            </div>
          )}
        </div>
      </div>

    </main>
  );
}
