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
        color: e.id === linkSourceId ? '#d08770' : (e.type === 'PERSON' ? '#bf616a' : e.type === 'PROJECT' ? '#5e81ac' : e.type === 'IDEA' ? '#ebcb8b' : '#4c566a')
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
    <div className="h-screen w-full flex bg-background overflow-hidden text-foreground">

      {/* SIDEBAR: NAV & LIST */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Network className="w-5 h-5 text-primary" />
            The Brain
          </h1>
          <div className="flex bg-muted p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('graph')}
              className={`p-1.5 rounded-md ${activeTab === 'graph' ? 'bg-background shadow-sm' : ''}`}
            >
              <Network className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`p-1.5 rounded-md ${activeTab === 'list' ? 'bg-background shadow-sm' : ''}`}
            >
              <FileText className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <input
              placeholder="Search thoughts..."
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {displayedEntities.map(ent => (
            <button
              key={ent.id}
              onClick={() => setSelectedEntityId(ent.id)}
              className={`w-full text-left p-3 rounded-lg flex items-center justify-between group transition-colors ${selectedEntityId === ent.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${ent.type === 'TASK' ? 'bg-aurora-purple' : ent.type === 'PROJECT' ? 'bg-primary' : 'bg-muted-foreground'
                  }`} />
                <span className="text-sm font-medium text-foreground truncate w-40">{ent.title}</span>
              </div>
              {ent.score && <span className="text-xs text-aurora-green font-mono">{(ent.score * 100).toFixed(0)}%</span>}
              <ChevronRight className={`w-4 h-4 text-muted-foreground group-hover:text-foreground ${selectedEntityId === ent.id ? 'text-primary' : ''}`} />
            </button>
          ))}
        </div>
      </div>

      {/* MAIN VIEW: GRAPH OR EDITOR */}
      <div className="flex-1 flex flex-col relative">
        {activeTab === 'graph' ? (
          <div className="flex-1 bg-background relative">
            {/* Re-enabled ForceGraph2D as per user feedback that issue was extension related */}
            <ForceGraph2D
              graphData={graphData}
              nodeLabel="name"
              nodeColor={node => (node as any).color}
              nodeRelSize={6}
              linkColor={() => 'var(--border)'}
              onNodeClick={handleNodeClick}
            />

            <div className="absolute top-6 right-6 flex gap-2">
              <button
                onClick={() => {
                  setIsLinkMode(!isLinkMode);
                  setLinkSourceId(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm border transition-all ${isLinkMode ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border hover:bg-muted'
                  }`}
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm font-medium">{isLinkMode ? 'Click target node...' : 'Link Nodes'}</span>
              </button>
            </div>

            <div className="absolute bottom-6 left-6 bg-card/80 backdrop-blur p-4 rounded-xl border border-border text-[10px] font-black uppercase tracking-widest space-y-2">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /> Projects</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-aurora-red" /> People</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-aurora-yellow" /> Ideas</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-muted-foreground" /> Admin</div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto bg-background p-12">
            {selectedEntity ? (
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${selectedEntity.type === 'PERSON' ? 'text-aurora-red' :
                      selectedEntity.type === 'PROJECT' ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                      {selectedEntity.type}
                    </span>
                    <h2 className="text-4xl font-extrabold text-foreground mt-2">{selectedEntity.title}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      {saveStatus === 'saving' && <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-widest"><SaveIcon className="w-3 h-3 animate-spin" /> Saving...</span>}
                      {saveStatus === 'saved' && <span className="text-[10px] font-bold text-aurora-green flex items-center gap-1 uppercase tracking-widest"><CheckCircle className="w-3 h-3" /> Saved</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"><Share2 className="w-5 h-5" /></button>
                    <button onClick={handleDelete} className="p-2 text-muted-foreground hover:text-aurora-red rounded-lg hover:bg-aurora-red/10 transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                  <Editor
                    key={selectedEntity.id}
                    content={selectedEntity.content || ''}
                    onChange={(val) => handleSave(selectedEntity.id, val)}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <FileText className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest">Select a node in the graph or list</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
