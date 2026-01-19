'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Network, FileText, ChevronRight, Share2, Search, Trash2, CheckCircle, Save as SaveIcon } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import Editor from './components/Editor';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function BrainPage() {
  const [entities, setEntities] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'graph' | 'list'>('graph');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLinkMode, setIsLinkMode] = useState(false);
  const [linkSourceId, setLinkSourceId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [entRes, linkRes] = await Promise.all([
      fetch('/api/entities'),
      fetch('/api/links')
    ]);
    if (entRes.ok) setEntities(await entRes.json());
    if (linkRes.ok) setLinks(await linkRes.json());
  };

  const selectedEntity = useMemo(() => 
    entities.find(e => e.id === selectedEntityId), 
    [entities, selectedEntityId]
  );

  const handleNodeClick = async (node: any) => {
    if (isLinkMode) {
      if (!linkSourceId) {
        setLinkSourceId(node.id);
      } else {
        if (linkSourceId === node.id) {
          setLinkSourceId(null);
          return;
        }
        // Create Link
        try {
          const res = await fetch('/api/links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sourceId: linkSourceId, targetId: node.id })
          });
          if (res.ok) {
            fetchData(); // Refresh graph
            setLinkSourceId(null);
            setIsLinkMode(false);
          }
        } catch (err) {
          console.error('Linking failed', err);
        }
      }
    } else {
      setSelectedEntityId(node.id as string);
      setActiveTab('list');
    }
  };

  const graphData = useMemo(() => {
    return {
      nodes: entities.map(e => ({ 
        id: e.id, 
        name: e.title, 
        val: e.type === 'PROJECT' ? 10 : 5,
        color: e.id === linkSourceId ? '#F59E0B' : (e.type === 'TASK' ? '#A855F7' : e.type === 'PROJECT' ? '#3B82F6' : '#94A3B8')
      })),
      links: links.map(l => ({ source: l.sourceId, target: l.targetId }))
    };
  }, [entities, links, linkSourceId]);

  // Autosave Logic
  const handleSave = useDebouncedCallback(async (id: string, content: string) => {
    setSaveStatus('saving');
    try {
      await fetch(`/api/entities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      
      // Update local state
      setEntities(prev => prev.map(e => e.id === id ? { ...e, content } : e));
    } catch (error) {
      console.error('Save failed', error);
      setSaveStatus('idle'); // TODO: Error state
    }
  }, 1000);

  const handleDelete = async () => {
    if (!selectedEntityId || !confirm('Are you sure you want to delete this memory?')) return;
    
    try {
      await fetch(`/api/entities/${selectedEntityId}`, { method: 'DELETE' });
      setSelectedEntityId(null);
      fetchData(); // Refresh graph
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  // Search Logic
  const handleSearch = useDebouncedCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        setSearchResults(await res.json());
      }
    } catch (error) {
      console.error('Search failed', error);
    }
  }, 500);

  const displayedEntities = searchQuery ? searchResults : entities;

  return (
    <div className="h-screen w-full flex bg-gray-50 overflow-hidden">
      
      {/* SIDEBAR: NAV & LIST */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-600" />
            The Brain
          </h1>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('graph')}
              className={`p-1.5 rounded-md ${activeTab === 'graph' ? 'bg-white shadow-sm' : ''}`}
            >
              <Network className="w-4 h-4 text-gray-600" />
            </button>
            <button 
              onClick={() => setActiveTab('list')}
              className={`p-1.5 rounded-md ${activeTab === 'list' ? 'bg-white shadow-sm' : ''}`}
            >
              <FileText className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input 
              placeholder="Search thoughts..." 
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {displayedEntities.map(ent => (
            <button
              key={ent.id}
              onClick={() => setSelectedEntityId(ent.id)}
              className={`w-full text-left p-3 rounded-lg flex items-center justify-between group transition-colors ${
                selectedEntityId === ent.id ? 'bg-indigo-50 border-indigo-100' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  ent.type === 'TASK' ? 'bg-purple-500' : ent.type === 'PROJECT' ? 'bg-blue-500' : 'bg-gray-400'
                }`} />
                <span className="text-sm font-medium text-gray-700 truncate w-40">{ent.title}</span>
              </div>
              {ent.score && <span className="text-xs text-green-600 font-mono">{(ent.score * 100).toFixed(0)}%</span>}
              <ChevronRight className={`w-4 h-4 text-gray-300 group-hover:text-gray-400 ${selectedEntityId === ent.id ? 'text-indigo-400' : ''}`} />
            </button>
          ))}
        </div>
      </div>

      {/* MAIN VIEW: GRAPH OR EDITOR */}
      <div className="flex-1 flex flex-col relative">
        {activeTab === 'graph' ? (
          <div className="flex-1 bg-white relative">
            <ForceGraph2D
              graphData={graphData}
              nodeLabel="name"
              nodeColor={node => (node as any).color}
              nodeRelSize={6}
              linkColor={() => '#E2E8F0'}
              onNodeClick={handleNodeClick}
            />
            
            <div className="absolute top-6 right-6 flex gap-2">
               <button 
                onClick={() => {
                  setIsLinkMode(!isLinkMode);
                  setLinkSourceId(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm border transition-all ${
                  isLinkMode ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
               >
                 <Share2 className="w-4 h-4" />
                 <span className="text-sm font-medium">{isLinkMode ? 'Click target node...' : 'Link Nodes'}</span>
               </button>
            </div>

            <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur p-4 rounded-xl border border-gray-200 text-xs space-y-2">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Projects</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500" /> Tasks</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-400" /> Notes</div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto bg-white p-12">
            {selectedEntity ? (
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-xs font-bold uppercase tracking-widest ${
                       selectedEntity.type === 'TASK' ? 'text-purple-600' : 
                       selectedEntity.type === 'PROJECT' ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {selectedEntity.type}
                    </span>
                    <h2 className="text-4xl font-extrabold text-gray-900 mt-2">{selectedEntity.title}</h2>
                    <div className="flex items-center gap-2 mt-2">
                       {saveStatus === 'saving' && <span className="text-xs text-gray-400 flex items-center gap-1"><SaveIcon className="w-3 h-3 animate-spin"/> Saving...</span>}
                       {saveStatus === 'saved' && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Saved</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><Share2 className="w-5 h-5" /></button>
                    <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
                
                <Editor 
                  key={selectedEntity.id}
                  content={selectedEntity.content || ''} 
                  onChange={(val) => handleSave(selectedEntity.id, val)} 
                />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <FileText className="w-16 h-16 mb-4 text-gray-200" />
                <p>Select a node in the graph or list to view details</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
