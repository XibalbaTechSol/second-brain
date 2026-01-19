'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Connection,
  addEdge,
  Handle,
  Position,
  ReactFlowProvider,
  useReactFlow,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, Save, Play, Zap, ArrowRight, Settings, Trash, Edit3, X, History, Network, Inbox, Database, Cpu } from 'lucide-react';

// --- DESIGNER COMPONENTS ---

const NodeWrapper = ({ children, colorClass, onDelete, onEdit, label, selected }: any) => (
  <div className={`px-4 py-3 shadow-lg rounded-md bg-white border-2 w-64 group relative transition-all ${colorClass} ${selected ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}>
    {children}
    <div className="absolute -top-3 -right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button onClick={onEdit} className="p-1 bg-white rounded-full shadow border border-gray-200 hover:text-blue-600"><Edit3 className="w-3 h-3" /></button>
      <button onClick={onDelete} className="p-1 bg-white rounded-full shadow border border-gray-200 hover:text-red-600"><Trash className="w-3 h-3" /></button>
    </div>
  </div>
);

const TriggerNode = ({ data, selected }: any) => (
  <NodeWrapper colorClass="border-yellow-400" {...data} selected={selected}>
    <div className="flex items-center gap-2 mb-2 text-yellow-600">
      <Zap className="w-4 h-4 fill-yellow-500" />
      <span className="font-bold text-xs uppercase tracking-wide">Trigger</span>
    </div>
    <div className="font-bold text-gray-800">{data.label}</div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-yellow-400" />
  </NodeWrapper>
);

const ConditionNode = ({ data, selected }: any) => (
  <NodeWrapper colorClass="border-blue-400" {...data} selected={selected}>
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-400" />
    <div className="flex items-center gap-2 mb-2 text-blue-600">
      <Settings className="w-4 h-4" />
      <span className="font-bold text-xs uppercase tracking-wide">Condition</span>
    </div>
    <div className="font-medium text-gray-800 text-sm">{data.label}</div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-400" />
  </NodeWrapper>
);

const ActionNode = ({ data, selected }: any) => (
  <NodeWrapper colorClass="border-green-400" {...data} selected={selected}>
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-green-400" />
    <div className="flex items-center gap-2 mb-2 text-green-600">
      <Play className="w-4 h-4 fill-green-500" />
      <span className="font-bold text-xs uppercase tracking-wide">Action</span>
    </div>
    <div className="font-bold text-gray-800">{data.label}</div>
  </NodeWrapper>
);

const nodeTypes = { trigger: TriggerNode, condition: ConditionNode, action: ActionNode };

// --- DESIGNER CANVAS ---

function FlowDesigner({ workflow, onSave }: { workflow: any, onSave: (nodes: Node[], edges: Edge[]) => void }) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    if (!workflow) return;
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    let yPos = 50;
    const xPos = 250;

    const triggerId = 'trigger';
    newNodes.push({
      id: triggerId,
      type: 'trigger',
      position: { x: xPos, y: yPos },
      data: { label: `When ${workflow.trigger}...`, onDelete: () => removeNode(triggerId) },
    });
    yPos += 150;

    let parentId = triggerId;
    const conditions = JSON.parse(workflow.conditions || '{}');
    if (Object.keys(conditions).length > 0) {
      const condId = 'condition';
      const label = conditions.contains_keyword ? `Contains "${conditions.contains_keyword}"` : 'Custom';
      newNodes.push({
        id: condId,
        type: 'condition',
        position: { x: xPos, y: yPos },
        data: { label, onDelete: () => removeNode(condId) },
      });
      newEdges.push({ id: `e-${parentId}-${condId}`, source: parentId, target: condId });
      parentId = condId;
      yPos += 150;
    }

    const actions = JSON.parse(workflow.actions || '[]');
    actions.forEach((action: any, index: number) => {
      const actId = `action-${index}`;
      const label = action.params?.title || action.params?.message ? `${action.type}: ${action.params.title || action.params.message}` : action.type;
      newNodes.push({
        id: actId,
        type: 'action',
        position: { x: xPos, y: yPos },
        data: { label, onDelete: () => removeNode(actId) },
      });
      newEdges.push({ id: `e-${parentId}-${actId}`, source: parentId, target: actId });
      parentId = actId;
      yPos += 150;
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [workflow]);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), []);

  const removeNode = (id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  };

  const addNode = (type: string) => {
    const id = `${type}-${Date.now()}`;
    const newNode: Node = {
      id,
      type,
      position: { x: 250, y: nodes.length * 150 + 50 },
      data: { 
        label: `New ${type}`, 
        onDelete: () => removeNode(id),
        onEdit: () => {
          const newLabel = prompt('Enter new label/param:', 'New Value');
          if (newLabel) {
            setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, label: newLabel } } : n));
          }
        }
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#E5E7EB" gap={20} />
        <Controls />
        <Panel position="top-right" className="flex gap-2">
          <button onClick={() => addNode('condition')} className="bg-white px-3 py-2 rounded shadow text-sm font-medium hover:bg-blue-50 text-blue-600 flex items-center gap-1"><Plus className="w-3 h-3"/> Condition</button>
          <button onClick={() => addNode('action')} className="bg-white px-3 py-2 rounded shadow text-sm font-medium hover:bg-green-50 text-green-600 flex items-center gap-1"><Plus className="w-3 h-3"/> Action</button>
          <button onClick={() => onSave(nodes, edges)} className="bg-indigo-600 text-white px-4 py-2 rounded shadow text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 ml-4">
            <Save className="w-4 h-4" /> Save
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}

// --- HISTORY VIEW ---

function FlowHistory() {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/audit').then(res => res.json()).then(data => setLogs(data));
  }, []);

  const groupedLogs = logs.reduce((acc: any, log: any) => {
    const eid = log.entityId || 'system';
    if (!acc[eid]) acc[eid] = [];
    acc[eid].push(log);
    return acc;
  }, {});

  return (
    <div className="h-full overflow-y-auto p-8 space-y-12 bg-slate-50">
      {Object.keys(groupedLogs).map((entityId) => (
        <div key={entityId} className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Trace: {entityId.slice(0,8)}</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-white border p-4 rounded-xl shadow-sm w-40"><Inbox className="w-4 h-4 text-slate-400 mb-2"/><div className="text-[10px] font-bold text-slate-400 uppercase">Input</div><div className="text-xs italic text-slate-600 truncate">Captured...</div></div>
            <ArrowRight className="mt-8 text-slate-300" />
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl shadow-sm w-48"><Cpu className="w-4 h-4 text-indigo-600 mb-2"/><div className="text-[10px] font-bold text-indigo-400 uppercase">AI Sorter</div><div className="text-xs font-bold text-slate-800">Gemini 2.0</div></div>
            <ArrowRight className="mt-8 text-slate-300" />
            <div className="bg-white border border-slate-800 p-4 rounded-xl shadow-sm w-48"><Database className="w-4 h-4 text-slate-800 mb-2"/><div className="text-[10px] font-bold text-slate-400 uppercase">Storage</div><div className="text-xs font-black uppercase text-slate-900">Memory Sync</div></div>
            {groupedLogs[entityId].some((l:any) => l.workflowId) && (
              <>
                <ArrowRight className="mt-8 text-slate-300" />
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm w-56 animate-pulse"><Zap className="w-4 h-4 text-amber-600 mb-2"/><div className="text-[10px] font-bold text-amber-400 uppercase">Behavior</div><div className="text-xs font-bold text-amber-800 italic">Workflow Run</div></div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- MAIN PAGE ---

export default function AutomationPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any | null>(null);
  const [view, setView] = useState<'designer' | 'history'>('designer');

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    const res = await fetch('/api/workflows');
    if (res.ok) setWorkflows(await res.json());
  };

  const handleSave = async (nodes: Node[], edges: Edge[]) => {
    if (!selectedWorkflow) return;
    const conditionNode = nodes.find(n => n.type === 'condition');
    const conditions = conditionNode ? { contains_keyword: conditionNode.data.label.replace('Contains "', '').replace('"', '') } : {};
    const actionNodes = nodes.filter(n => n.type === 'action').sort((a, b) => a.position.y - b.position.y);
    const actions = actionNodes.map(n => {
      const label = n.data.label;
      if (label.includes('Task')) return { type: 'create_task', params: { title: label.split(': ')[1] || 'New Task' } };
      if (label.includes('Note')) return { type: 'create_note', params: { title: label.split(': ')[1] || 'New Note' } };
      if (label.includes('Notify')) return { type: 'notify', params: { message: label.split(': ')[1] || 'Alert' } };
      return { type: 'create_note', params: { title: label } };
    });

    try {
      const res = await fetch('/api/workflows', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedWorkflow.id, name: selectedWorkflow.name, trigger: selectedWorkflow.trigger, conditions, actions, isActive: true })
      });
      if (res.ok) { alert('Saved!'); fetchWorkflows(); }
    } catch (err) { console.error(err); }
  };

  return (
    <ReactFlowProvider>
      <div className="h-screen w-full flex bg-gray-50">
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col z-20 shadow-xl">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 italic"><Zap className="w-5 h-5 text-indigo-600 fill-indigo-600" /> Automation</h1>
            <div className="flex bg-slate-100 p-1 rounded-lg mt-4">
              <button onClick={() => setView('designer')} className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-bold transition-all ${view === 'designer' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}><Settings className="w-3.5 h-3.5"/> Designer</button>
              <button onClick={() => setView('history')} className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-bold transition-all ${view === 'history' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}><History className="w-3.5 h-3.5"/> Activity</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {workflows.map((wf) => (
              <button key={wf.id} onClick={() => { setSelectedWorkflow(wf); setView('designer'); }} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedWorkflow?.id === wf.id ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-100' : 'bg-white border-gray-200 hover:border-indigo-300'}`}>
                <div className="font-semibold text-gray-800">{wf.name}</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mt-2">{wf.trigger}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 relative">
          {view === 'designer' ? (
            selectedWorkflow ? <FlowDesigner key={selectedWorkflow.id} workflow={selectedWorkflow} onSave={handleSave} /> : <div className="h-full flex flex-col items-center justify-center text-gray-400 italic">Select a workflow to edit</div>
          ) : <FlowHistory />}
        </div>
      </div>
    </ReactFlowProvider>
  );
}
