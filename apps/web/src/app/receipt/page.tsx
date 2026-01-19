'use client';

import { useState, useEffect } from 'react';
import { Receipt, History, Cpu, User, Zap, Clock, Info, ArrowRight, Inbox, Database, PlayCircle, List, Network } from 'lucide-react';

export default function ReceiptPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'visual'>('visual');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/audit');
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Group logs by Entity for Visual Flow
  const groupedLogs = logs.reduce((acc: any, log: any) => {
    const eid = log.entityId || 'system';
    if (!acc[eid]) acc[eid] = [];
    acc[eid].push(log);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <Receipt className="w-8 h-8 text-indigo-600" />
              The Receipt
            </h1>
            <p className="text-slate-500 mt-2 text-lg">Visual audit of AI execution and behavior loops.</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <button 
              onClick={() => setViewMode('visual')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'visual' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Network className="w-4 h-4" /> Visual Flow
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <List className="w-4 h-4" /> List View
            </button>
          </div>
        </div>

        {viewMode === 'visual' ? (
          /* VISUAL FLOW VIEW */
          <div className="space-y-12">
            {Object.keys(groupedLogs).map((entityId) => {
              const entityLogs = groupedLogs[entityId];
              return (
                <div key={entityId} className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Logic Trace: {entityId.slice(0,8)}</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>

                  <div className="flex items-start gap-0 overflow-x-auto pb-4">
                    {/* 1. INPUT NODE */}
                    <div className="flex flex-col items-center">
                      <div className="w-40 bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                          <Inbox className="w-3 h-3" />
                          <span className="text-[10px] font-bold uppercase">Input</span>
                        </div>
                        <div className="text-xs text-slate-600 font-medium truncate italic">Raw Capture...</div>
                      </div>
                    </div>

                    <div className="mt-8 flex items-center"><ArrowRight className="w-8 h-8 text-slate-200 -mx-2" /></div>

                    {/* 2. SORTER NODE */}
                    <div className="flex flex-col items-center">
                      <div className="w-48 bg-indigo-50 border-2 border-indigo-200 p-4 rounded-2xl shadow-sm ring-4 ring-indigo-500/5">
                        <div className="flex items-center gap-2 mb-2 text-indigo-600">
                          <Cpu className="w-3 h-3" />
                          <span className="text-[10px] font-bold uppercase">AI Sorter</span>
                        </div>
                        <div className="text-xs font-bold text-slate-800">Classification</div>
                        <div className="mt-2 text-[10px] text-indigo-600 bg-white px-2 py-1 rounded-md border border-indigo-100 inline-block font-mono">
                          Gemini 2.0
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex items-center"><ArrowRight className="w-8 h-8 text-slate-200 -mx-2" /></div>

                    {/* 3. ENTITY NODE */}
                    <div className="flex flex-col items-center">
                      <div className="w-48 bg-white border-2 border-slate-800 p-4 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-slate-800">
                          <Database className="w-3 h-3" />
                          <span className="text-[10px] font-bold uppercase">Brain Storage</span>
                        </div>
                        <div className="text-xs font-black text-slate-900 uppercase tracking-tighter">Memory Created</div>
                      </div>
                    </div>

                    {/* 4. WORKFLOW NODES (Optional) */}
                    {entityLogs.some((l:any) => l.workflowId) && (
                      <>
                        <div className="mt-8 flex items-center"><ArrowRight className="w-8 h-8 text-slate-200 -mx-2" /></div>
                        <div className="flex flex-col items-center">
                          <div className="w-56 bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl shadow-sm animate-pulse">
                            <div className="flex items-center gap-2 mb-2 text-amber-600">
                              <Zap className="w-3 h-3 fill-amber-600" />
                              <span className="text-[10px] font-bold uppercase">Behavior Engine</span>
                            </div>
                            <div className="text-xs font-bold text-slate-800 italic">Workflow Triggered</div>
                            {entityLogs.filter((l:any) => l.workflow).map((l:any) => (
                              <div key={l.id} className="mt-2 text-[9px] font-bold text-amber-700 uppercase">{l.workflow.name}</div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW (Original) */
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between font-bold text-xs uppercase tracking-widest text-slate-400">
              <span>Action & Details</span>
              <span>Origin</span>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-20 text-center text-slate-400 italic">Reading the records...</div>
              ) : logs.length === 0 ? (
                <div className="p-20 text-center text-slate-400 italic">No history found. Let the AI do some work!</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-6 hover:bg-slate-50 transition-colors flex items-start gap-6">
                    <div className={`p-3 rounded-2xl shadow-sm ${
                      log.action.includes('USER') ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                      log.action.includes('WORKFLOW') ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {log.action.includes('USER') ? <User className="w-5 h-5" /> : 
                       log.action.includes('WORKFLOW') ? <Zap className="w-5 h-5" /> : 
                       <Cpu className="w-5 h-5" />}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 text-lg">{log.action.replace(/_/g, ' ')}</h3>
                        <span className="text-xs text-slate-400 font-medium">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{log.details}</p>
                      {log.workflow && (
                        <div className="mt-3 inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                          <Zap className="w-3 h-3" />
                          Triggered by: {log.workflow.name}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      {log.confidence !== null && (
                        <div className="space-y-1">
                          <div className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Confidence</div>
                          <div className={`text-xl font-black ${
                            log.confidence > 0.8 ? 'text-green-500' : 'text-amber-500'
                          }`}>
                            {(log.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-indigo-900 rounded-2xl p-6 text-white flex items-start gap-4 shadow-lg">
          <Info className="w-6 h-6 text-indigo-300 mt-1 shrink-0" />
          <div>
            <h4 className="font-bold text-lg italic">Trust but Verify</h4>
            <p className="text-indigo-200 mt-1 leading-relaxed">
              Every action taken by CognitoFlow is recorded here. If you see a misclassification, 
              use the "Fix AI" button on the dashboard to train the system on your preferences.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
