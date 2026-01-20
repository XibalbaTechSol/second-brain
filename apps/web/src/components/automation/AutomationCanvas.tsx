'use client';

import React, { useCallback, useState } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { TriggerNode, AIRouterNode, ActionNode, WebhookNode, ScheduleNode, ConditionNode, CodeNode, CalendarNode, GeminiReasoningNode } from './CustomNodes';
import { Save, Settings, X, Cpu, Zap, Database, Slack, Mail, Globe, Calendar, Split, Code, Info, Play, Clock, Sparkles, Send, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen, BrainCircuit } from 'lucide-react';

const INITIAL_NODES = [
    {
        id: '1',
        type: 'trigger',
        position: { x: 50, y: 300 },
        data: { label: 'Inbox Capture' },
    },
    {
        id: '2',
        type: 'aiRouter',
        position: { x: 250, y: 300 },
        data: { label: 'AI Classifier' },
    },
    // Project Path
    {
        id: 'p1',
        type: 'reasoning',
        position: { x: 500, y: 100 },
        data: { 
            label: 'Actionability Analysis', 
            promptTemplate: 'Analyze for "Bias towards Action". Find the smallest 10-minute step.' 
        },
    },
    {
        id: 'p2',
        type: 'action',
        position: { x: 750, y: 100 },
        data: { 
            label: 'Behavioral Nudge', 
            actionType: 'ai_nudge',
            messageTemplate: '{{reasoning}} What is your first move?' 
        },
    },
    // Idea Path
    {
        id: 'i1',
        type: 'reasoning',
        position: { x: 500, y: 300 },
        data: { 
            label: '10x Scope Analysis', 
            promptTemplate: 'If this idea were 10x more ambitious, what would it look like?' 
        },
    },
    {
        id: 'i2',
        type: 'action',
        position: { x: 750, y: 300 },
        data: { 
            label: 'Growth Nudge', 
            actionType: 'ai_nudge',
            messageTemplate: '10x Vision: {{reasoning}}' 
        },
    },
    // Admin Path
    {
        id: 'a1',
        type: 'reasoning',
        position: { x: 500, y: 500 },
        data: { 
            label: 'Automation Scout', 
            promptTemplate: 'Suggest how to automate this recurring task.' 
        },
    },
    {
        id: 'a2',
        type: 'action',
        position: { x: 750, y: 500 },
        data: { 
            label: 'Efficiency Alert', 
            actionType: 'notify',
            messageTemplate: 'Efficiency: {{reasoning}}' 
        },
    },
];

const INITIAL_EDGES = [
    { id: 'e1-2', source: '1', target: '2', animated: true },
    // Project
    { id: 'e2-p1', source: '2', target: 'p1', sourceHandle: 'PROJECT', animated: true, label: 'Project' },
    { id: 'ep1-p2', source: 'p1', target: 'p2', animated: true },
    // Idea
    { id: 'e2-i1', source: '2', target: 'i1', sourceHandle: 'IDEA', animated: true, label: 'Idea' },
    { id: 'ei1-i2', source: 'i1', target: 'i2', animated: true },
    // Admin
    { id: 'e2-a1', source: '2', target: 'a1', sourceHandle: 'ADMIN', animated: true, label: 'Admin' },
    { id: 'ea1-a2', source: 'a1', target: 'a2', animated: true },
];

export default function AutomationCanvas() {
    const [isMounted, setIsMounted] = useState(false);
    const nodeTypes = React.useMemo(() => ({
        trigger: TriggerNode,
        aiRouter: AIRouterNode,
        action: ActionNode,
        webhook: WebhookNode,
        schedule: ScheduleNode,
        condition: ConditionNode,
        code: CodeNode,
        calendar: CalendarNode,
        reasoning: GeminiReasoningNode,
    }), []);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES as any);
    const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES as any);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [isLibraryCollapsed, setIsLibraryCollapsed] = useState(false);
    const [editData, setEditData] = useState<any>({});
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

    const onDragStart = (event: React.DragEvent, nodeType: string, actionType?: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        if (actionType) {
            event.dataTransfer.setData('application/actiontype', actionType);
        }
        event.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            const actionType = event.dataTransfer.getData('application/actiontype');

            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = {
                id: `node_${Date.now()}`,
                type,
                position,
                data: { 
                    label: actionType ? actionType.replace('_', ' ').toUpperCase() : `${type.charAt(0).toUpperCase() + type.slice(1)}`,
                    actionType: actionType || undefined,
                    model: 'gemini-2.0-flash',
                    code: type === 'code' ? '// write logic\nconsole.log(data);' : undefined,
                    condition: type === 'condition' ? 'data.type === "TASK"' : undefined,
                    timeMode: type === 'calendar' ? 'auto-detect' : undefined,
                    eventTitle: type === 'calendar' ? '{{title}}' : undefined,
                    promptTemplate: type === 'reasoning' ? 'Analyze this input and extract key insights...' : undefined,
                    events: []
                },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes]
    );

    // Update edit fields when selection changes
    React.useEffect(() => {
        if (selectedNode) {
            setEditData({
                label: selectedNode.data.label || '',
                model: selectedNode.data.model || 'gemini-2.0-flash',
                systemPrompt: selectedNode.data.systemPrompt || '',
                actionType: selectedNode.data.actionType || 'create_task',
                messageTemplate: selectedNode.data.messageTemplate || '',
                code: selectedNode.data.code || '',
                condition: selectedNode.data.condition || '',
                interval: selectedNode.data.interval || 'day',
                timeMode: selectedNode.data.timeMode || 'auto-detect',
                eventTitle: selectedNode.data.eventTitle || '',
                promptTemplate: selectedNode.data.promptTemplate || '',
            });
        }
    }, [selectedNode]);

    const handleApplyChanges = () => {
        if (!selectedNode) return;

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === selectedNode.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            ...editData,
                        },
                    };
                }
                return node;
            })
        );
        
        // Update the selected node reference so the UI reflects changes
        setSelectedNode(prev => prev ? ({
            ...prev,
            data: { ...prev.data, ...editData }
        }) : null);
        
        // alert('Changes applied to node!');
    };

    // Real-time Audit Log Polling
    React.useEffect(() => {
        if (!isMounted) return;

        const fetchLogs = async () => {
            try {
                const res = await fetch('/api/audit');
                if (!res.ok) return;
                const logs = await res.json();

                setNodes((nds) =>
                    nds.map((node) => {
                        const nodeData = node.data as any;
                        // Filter logs relevant to this node
                        let relevantLogs = [];
                        
                        if (node.type === 'trigger') {
                            relevantLogs = logs
                                .filter((l: any) => l.action === 'INBOX_CAPTURE')
                                .map((l: any) => ({
                                    label: 'CAPTURED',
                                    time: new Date(l.timestamp).toLocaleTimeString(),
                                    detail: l.details
                                }));
                        } else if (node.type === 'aiRouter') {
                            relevantLogs = logs
                                .filter((l: any) => l.action === 'AI_CLASSIFIED')
                                .map((l: any) => ({
                                    label: 'CLASSIFIED',
                                    time: new Date(l.timestamp).toLocaleTimeString(),
                                    detail: `${l.details} (P=${l.confidence?.toFixed(2)})`
                                }));
                        } else if (node.type === 'action') {
                            // Match by type like PROJECT, PERSON, IDEA, ADMIN in details
                            const targetType = nodeData.actionType?.replace('create_', '').toUpperCase();
                            const isAiNudge = nodeData.actionType === 'ai_nudge';
                            
                            relevantLogs = logs
                                .filter((l: any) => {
                                    if (isAiNudge) return l.action === 'AI_NUDGE_GENERATED';
                                    return l.action === 'WORKFLOW_EXECUTED' && l.details.toUpperCase().includes(targetType || 'UNKNOWN');
                                })
                                .map((l: any) => ({
                                    label: isAiNudge ? 'NUDGED' : 'EXECUTED',
                                    time: new Date(l.timestamp).toLocaleTimeString(),
                                    detail: l.details
                                }));
                        }

                        if (relevantLogs.length === 0) return node;

                        return {
                            ...node,
                            data: {
                                ...nodeData,
                                events: relevantLogs.slice(0, 10)
                            },
                        };
                    })
                );
            } catch (err) {
                console.error('Audit poll failed', err);
            }
        };

        const interval = setInterval(fetchLogs, 5000);
        fetchLogs(); // Initial fetch
        return () => clearInterval(interval);
    }, [isMounted, setNodes]);

    const onConnect = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    const handleSave = async () => {
        const { saveWorkflow } = await import('@/app/actions/save-workflow');
        try {
            await saveWorkflow(nodes, edges);
            alert('Workflow Saved Successfully!');
        } catch (e) {
            console.error(e);
            alert('Error saving workflow');
        }
    };

    return (
        <div className="w-full h-full flex bg-background overflow-hidden relative transition-colors duration-300">
            {/* Left Sidebar - Node Library */}
            <div 
                className={`border-r border-border bg-card flex flex-col transition-all duration-300 ease-in-out relative ${isLibraryCollapsed ? 'w-0 opacity-0 -translate-x-full' : 'w-64 opacity-100 translate-x-0'}`}
            >
                <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Node Library</h3>
                    <button 
                        onClick={() => setIsLibraryCollapsed(true)}
                        className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <PanelLeftClose className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-4 space-y-8 overflow-y-auto custom-scrollbar">
                    <div className="space-y-3">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Triggers</p>
                        {[
                            { id: 'trigger', label: 'On Classify', icon: Zap, color: 'text-aurora-yellow' },
                            { id: 'webhook', label: 'Webhook', icon: Globe, color: 'text-aurora-orange' },
                            { id: 'schedule', label: 'Schedule', icon: Calendar, color: 'text-aurora-blue' },
                        ].map(trigger => (
                            <div 
                                key={trigger.id}
                                className="p-3 bg-background border border-border rounded-2xl cursor-grab hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all flex items-center gap-3 group"
                                onDragStart={(e) => onDragStart(e, trigger.id)}
                                draggable
                            >
                                <div className={`p-2 rounded-xl bg-muted/30 group-hover:scale-110 transition-transform ${trigger.color}`}>
                                    <trigger.icon className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-foreground/80 group-hover:text-foreground">{trigger.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Logic & AI</p>
                        <div 
                            className="p-3 bg-background border border-border rounded-2xl cursor-grab hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all flex items-center gap-3 group"
                            onDragStart={(e) => onDragStart(e, 'aiRouter')}
                            draggable
                        >
                            <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                <Cpu className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-foreground/80 group-hover:text-foreground">AI Classifier</span>
                        </div>
                        <div 
                            className="p-3 bg-background border border-border rounded-2xl cursor-grab hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all flex items-center gap-3 group"
                            onDragStart={(e) => onDragStart(e, 'reasoning')}
                            draggable
                        >
                            <div className="p-2 rounded-xl bg-accent/10 text-accent group-hover:scale-110 transition-transform">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-foreground/80 group-hover:text-foreground">Gemini Reason</span>
                        </div>
                        <div 
                            className="p-3 bg-background border border-border rounded-2xl cursor-grab hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all flex items-center gap-3 group"
                            onDragStart={(e) => onDragStart(e, 'condition')}
                            draggable
                        >
                            <div className="p-2 rounded-xl bg-muted text-muted-foreground group-hover:scale-110 transition-transform">
                                <Split className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-foreground/80 group-hover:text-foreground">Logical Split</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Actions</p>
                        <div 
                            className="p-3 bg-background border border-border rounded-2xl cursor-grab hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all flex items-center gap-3 group"
                            onDragStart={(e) => onDragStart(e, 'action', 'notify')}
                            draggable
                        >
                            <div className="p-2 rounded-xl bg-aurora-orange/10 text-aurora-orange group-hover:scale-110 transition-transform">
                                <Send className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-foreground/80 group-hover:text-foreground">Standard Nudge</span>
                        </div>
                        <div 
                            className="p-3 bg-background border border-border rounded-2xl cursor-grab hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all flex items-center gap-3 group"
                            onDragStart={(e) => onDragStart(e, 'action', 'ai_nudge')}
                            draggable
                        >
                            <div className="p-2 rounded-xl bg-aurora-purple/10 text-aurora-purple group-hover:scale-110 transition-transform">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-foreground/80 group-hover:text-foreground">AI Strategy</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 relative h-full">
                {isLibraryCollapsed && (
                    <div className="absolute top-6 left-6 z-20">
                        <button
                            onClick={() => setIsLibraryCollapsed(false)}
                            className="p-3 bg-card border border-border rounded-2xl shadow-2xl text-muted-foreground hover:text-primary transition-all group flex items-center gap-3 scale-in-center"
                        >
                            <PanelLeftOpen className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Open Library</span>
                        </button>
                    </div>
                )}
                {isMounted && (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        onPaneClick={onPaneClick}
                        nodeTypes={nodeTypes}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        fitView
                        className="bg-background transition-colors duration-300"
                    >
                        <Background gap={20} size={1} color="var(--border)" />
                        <Controls className="fill-foreground bg-card border-border border rounded-xl overflow-hidden shadow-lg" />
                        <MiniMap 
                            zoomable 
                            pannable 
                            className="!bg-card !border-border rounded-2xl shadow-2xl" 
                            maskColor="rgba(var(--background), 0.7)"
                            nodeColor={(n) => {
                                if (n.type === 'trigger') return '#ebcb8b';
                                if (n.type === 'aiRouter') return '#5e81ac';
                                if (n.type === 'reasoning') return '#88c0d0';
                                return '#d8dee9';
                            }}
                        />
                    </ReactFlow>
                )}

                {/* Save Button Overlay */}
                <div className="absolute top-6 right-6 z-10 flex gap-3">
                    <div className="bg-card/80 backdrop-blur-md border border-border px-4 py-2 rounded-2xl flex items-center gap-3 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-aurora-green animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Engine Online</span>
                    </div>
                    <button
                        onClick={handleSave}
                        className="bg-primary hover:opacity-90 text-primary-foreground px-6 py-3 rounded-2xl text-sm font-black shadow-xl shadow-primary/20 transition-all flex items-center gap-2 group active:scale-95"
                    >
                        <Save className="w-4 h-4 group-hover:rotate-12 transition-transform" /> Save Workflow
                    </button>
                </div>
            </div>

            {/* Right Sidebar - Node Details */}
            <div
                className={`w-96 border-l border-border bg-card transition-all transform duration-500 ease-in-out absolute right-0 top-0 bottom-0 z-20 shadow-[-20px_0_50px_rgba(0,0,0,0.1)] ${selectedNode ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {selectedNode ? (
                    <div className="h-full flex flex-col">
                        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-muted rounded-xl">
                                    <Settings className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <h3 className="font-black text-xs uppercase tracking-[0.2em]">Configuration</h3>
                            </div>
                            <button onClick={() => setSelectedNode(null)} className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 p-8 overflow-y-auto space-y-8 custom-scrollbar">
                            {/* Header */}
                            <div className="flex items-center gap-5">
                                <div className={`p-4 rounded-2xl shadow-inner ${selectedNode.type === 'trigger' ? 'bg-aurora-yellow/10 text-aurora-yellow' :
                                    selectedNode.type === 'aiRouter' ? 'bg-primary/10 text-primary' :
                                        'bg-accent/10 text-accent'
                                    }`}>
                                    {selectedNode.type === 'trigger' && <Zap className="w-8 h-8" />}
                                    {selectedNode.type === 'aiRouter' && <Cpu className="w-8 h-8" />}
                                    {selectedNode.type === 'action' && <Database className="w-8 h-8" />}
                                    {selectedNode.type === 'reasoning' && <Sparkles className="w-8 h-8" />}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black tracking-tight text-foreground">
                                        {selectedNode.data.label}
                                    </h2>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{selectedNode.type}</p>
                                </div>
                            </div>

                            {/* Properties Form */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Node Label</label>
                                    <input
                                        type="text"
                                        value={editData.label || ''}
                                        onChange={(e) => setEditData({ ...editData, label: e.target.value })}
                                        className="w-full px-4 py-3 bg-background border border-border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary outline-none shadow-inner transition-all"
                                    />
                                </div>

                                {selectedNode.type === 'aiRouter' && (
                                    <div className="space-y-6 p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                                        <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">AI Core Config</h4>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Language Model</label>
                                            <select 
                                                value={editData.model || 'gemini-2.0-flash'}
                                                onChange={(e) => setEditData({ ...editData, model: e.target.value })}
                                                className="w-full text-sm font-bold rounded-xl border border-border bg-background p-3 shadow-inner outline-none focus:ring-2 focus:ring-primary appearance-none"
                                            >
                                                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                                                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                                <option value="ollama-llama3">Ollama (Llama 3)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Strategy Override</label>
                                            <textarea
                                                className="w-full text-xs font-medium rounded-xl border border-border bg-background p-4 h-28 shadow-inner outline-none focus:ring-2 focus:ring-primary placeholder:opacity-30 transition-all"
                                                value={editData.systemPrompt || ''}
                                                onChange={(e) => setEditData({ ...editData, systemPrompt: e.target.value })}
                                                placeholder="Define specialized routing logic..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {selectedNode.type === 'reasoning' && (
                                    <div className="space-y-6 p-6 bg-accent/5 rounded-[2rem] border border-accent/10">
                                        <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-4">Reasoning Engine</h4>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Analysis Model</label>
                                            <select 
                                                value={editData.model || 'gemini-2.0-flash'}
                                                onChange={(e) => setEditData({ ...editData, model: e.target.value })}
                                                className="w-full text-sm font-bold rounded-xl border border-border bg-background p-3 shadow-inner appearance-none"
                                            >
                                                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                                                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Reasoning Prompt</label>
                                            <textarea
                                                className="w-full text-xs font-medium rounded-xl border border-border bg-background p-4 h-40 shadow-inner outline-none focus:ring-2 focus:ring-accent transition-all"
                                                value={editData.promptTemplate || ''}
                                                onChange={(e) => setEditData({ ...editData, promptTemplate: e.target.value })}
                                                placeholder="Instruct Gemini on how to transform the data..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {selectedNode.type === 'action' && (
                                    <div className="space-y-6 p-6 bg-muted/30 rounded-[2rem] border border-border">
                                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Action Config</h4>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Action Type</label>
                                            <select 
                                                value={editData.actionType || 'create_project'}
                                                onChange={(e) => setEditData({ ...editData, actionType: e.target.value })}
                                                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-bold shadow-inner appearance-none"
                                            >
                                                <option value="create_project">Create Project</option>
                                                <option value="create_person">Create Person</option>
                                                <option value="create_resource">Create Resource</option>
                                                <option value="notify">Send Notification (Nudge)</option>
                                                <option value="ai_nudge">AI Coach Strategy (Reasoning)</option>
                                            </select>
                                        </div>
                                        
                                        {editData.actionType === 'ai_nudge' ? (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Coach Strategy</label>
                                                <select 
                                                    value={editData.messageTemplate || ''}
                                                    onChange={(e) => setEditData({ ...editData, messageTemplate: e.target.value })}
                                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-bold shadow-inner appearance-none"
                                                >
                                                    <option value="">Default Strategic Nudge</option>
                                                    <option value="Be extremely provocative and challenge the user's assumptions about this.">Provocative/Challenger</option>
                                                    <option value="Focus on immediate practical next steps and low-hanging fruit.">Practical/Action-Oriented</option>
                                                    <option value="Connect this to broader long-term vision and potential impact.">Visionary/Big Picture</option>
                                                    <option value="Identify potential risks or hidden complexities in this idea.">Critical/Risk Analyst</option>
                                                </select>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Detail Template</label>
                                                <input
                                                    type="text"
                                                    value={editData.messageTemplate || ''}
                                                    onChange={(e) => setEditData({ ...editData, messageTemplate: e.target.value })}
                                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-bold shadow-inner"
                                                    placeholder="e.g. New task: {{title}}"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-8 border-t border-border bg-muted/10">
                            <button 
                                onClick={handleApplyChanges}
                                className="w-full py-4 bg-foreground text-background dark:bg-white dark:text-black rounded-2xl text-sm font-black hover:opacity-90 transition-all shadow-xl active:scale-95"
                            >
                                Apply Changes
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-12 text-center space-y-4 opacity-40">
                        <BrainCircuit className="w-12 h-12" />
                        <p className="text-xs font-black uppercase tracking-widest leading-relaxed">Select a node to <br/>access synaptic settings</p>
                    </div>
                )}
            </div>
        </div>
    );
}
