'use client';

import { useState, useEffect } from 'react';
import { 
  Database, 
  Inbox, 
  Briefcase, 
  Lightbulb, 
  Link as LinkIcon, 
  Users, 
  ChevronRight, 
  Clock, 
  Zap, 
  Cpu,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

type TabType = 'inbox' | 'projects' | 'ideas' | 'resources' | 'people';

export default function DatabasesPage() {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  const [loading, setLoading] = useState(true);
  const [expandedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/databases');
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-slate-400 animate-pulse">Scanning the databases...</div>;

  const currentList = data?.[activeTab] || [];
  const logsByEntity = data?.logsByEntity || {};

  const tabs = [
    { id: 'inbox', label: 'SB Inbox', icon: Inbox, color: 'text-slate-600' },
    { id: 'projects', label: 'Projects', icon: Briefcase, color: 'text-blue-600' },
    { id: 'ideas', label: 'Ideas', icon: Lightbulb, color: 'text-yellow-600' },
    { id: 'resources', label: 'Resources', icon: LinkIcon, color: 'text-green-600' },
    { id: 'people', label: 'People', icon: Users, color: 'text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <Database className="w-6 h-6 text-indigo-600" />
          The Databases
        </h1>
        <p className="text-slate-500 text-sm mt-1">Audit the integrity and AI processing of your Second Brain nodes.</p>
        
        {/* TAB BAR */}
        <div className="flex gap-4 mt-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as TabType); setSelectedId(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                activeTab === tab.id 
                  ? 'bg-white border-indigo-600 text-indigo-600 shadow-sm' 
                  : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : 'text-slate-400'}`} />
              {tab.label}
              <span className="ml-1 bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md text-[10px] font-black">
                {data?.[tab.id]?.length || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-4">
          {currentList.length === 0 ? (
            <div className="bg-white rounded-2xl p-20 text-center border-2 border-dashed border-slate-200 text-slate-400">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">This database is currently empty.</p>
            </div>
          ) : (
            currentList.map((item: any) => {
              const entityId = item.processedEntityId || item.id;
              const logs = logsByEntity[entityId] || [];
              const isExpanded = expandedId === item.id;

              return (
                <div key={item.id} className={`bg-white rounded-2xl border transition-all overflow-hidden ${isExpanded ? 'border-indigo-300 ring-4 ring-indigo-500/5 shadow-xl' : 'border-slate-200 hover:border-slate-300 shadow-sm'}`}>
                  {/* ITEM ROW */}
                  <div className="p-6 flex items-center justify-between cursor-pointer" onClick={() => setSelectedId(isExpanded ? null : item.id)}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${activeTab === 'inbox' ? 'bg-slate-100' : 'bg-indigo-50'}`}>
                        {tabs.find(t => t.id === activeTab)?.icon({ className: "w-5 h-5 " + tabs.find(t => t.id === activeTab)?.color })}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{item.title || item.content}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tighter">
                            <Clock className="w-3 h-3" /> {new Date(item.createdAt || item.updatedAt).toLocaleString()}
                          </span>
                          {item.status && (
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                              item.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                              item.status === 'NEEDS_USER_REVIEW' ? 'bg-amber-100 text-amber-700' : 
                              'bg-slate-100 text-slate-500'
                            }`}>
                              {item.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      {item.confidence && (
                        <div className="text-right">
                          <div className="text-[9px] font-black text-slate-300 uppercase">AI Confidence</div>
                          <div className={`text-lg font-black ${(item.confidence || 0) > 0.8 ? 'text-green-500' : 'text-amber-500'}`}>
                            {(item.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                      )}
                      <ChevronRight className={`w-5 h-5 text-slate-300 transition-transform ${isExpanded ? 'rotate-90 text-indigo-500' : ''}`} />
                    </div>
                  </div>

                  {/* RECEIPT / AUDIT DETAIL */}
                  {isExpanded && (
                    <div className="bg-slate-50 border-t border-indigo-100 p-8">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">AI Logic Trace (Receipt)</span>
                        <div className="h-px flex-1 bg-slate-200" />
                      </div>

                      {/* VISUAL FLOW RE-IMPLEMENTED FOR DATABASE CONTEXT */}
                      <div className="flex items-start gap-4 overflow-x-auto pb-4">
                        <div className="bg-white border p-4 rounded-xl shadow-sm w-44">
                          <Inbox className="w-4 h-4 text-slate-400 mb-2"/>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Input Node</div>
                          <div className="text-xs italic text-slate-600 truncate">{item.source || 'Manual'}</div>
                        </div>
                        
                        <ArrowRight className="mt-8 text-slate-300 shrink-0" />
                        
                        <div className="bg-indigo-50 border-2 border-indigo-100 p-4 rounded-xl shadow-sm w-52">
                          <Cpu className="w-4 h-4 text-indigo-600 mb-2"/>
                          <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">AI Sorter (Processing)</div>
                          <div className="text-xs font-bold text-slate-800">Classified as {activeTab.toUpperCase()}</div>
                          <div className="mt-2 text-[9px] text-white bg-indigo-600 px-2 py-0.5 rounded inline-block font-black uppercase">Gemini 2.0</div>
                        </div>

                        <ArrowRight className="mt-8 text-slate-300 shrink-0" />

                        <div className="bg-white border-2 border-slate-800 p-4 rounded-xl shadow-sm w-52">
                          <Database className="w-4 h-4 text-slate-800 mb-2"/>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Brain Storage</div>
                          <div className="text-xs font-black text-slate-900 uppercase">Entity Created</div>
                          <div className="text-[10px] text-slate-400 mt-1 truncate">ID: {entityId.slice(0,12)}</div>
                        </div>

                        {logs.some(l => l.workflowId) && (
                          <>
                            <ArrowRight className="mt-8 text-slate-300 shrink-0" />
                            <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-xl shadow-sm w-64 ring-4 ring-amber-500/5 animate-pulse">
                              <Zap className="w-4 h-4 text-amber-600 mb-2 fill-amber-600"/>
                              <div className="text-[10px] font-bold text-amber-400 uppercase">Behavior Engine</div>
                              {logs.filter(l => l.workflow).map((l:any) => (
                                <div key={l.id} className="mt-2 flex items-center gap-2 bg-white/80 p-2 rounded-lg border border-amber-100 shadow-sm">
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  <div className="text-[10px] font-black text-amber-800 uppercase leading-none">{l.workflow.name}</div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* LOG LIST */}
                      <div className="mt-8 space-y-2">
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Audit Logs</div>
                        {logs.length === 0 ? (
                          <div className="text-xs text-slate-400 italic">No detailed logs found for this item.</div>
                        ) : (
                          logs.map((log: any) => (
                            <div key={log.id} className="bg-white/50 border border-slate-200 px-4 py-2 rounded-lg flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <ShieldCheck className="w-3 h-3 text-green-500" />
                                <span className="text-xs font-bold text-slate-700">{log.action.replace(/_/g, ' ')}</span>
                                <span className="text-xs text-slate-500">— {log.details}</span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
