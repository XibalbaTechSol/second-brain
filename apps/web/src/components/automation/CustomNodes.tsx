import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Play, GitBranch, Zap, MessageSquare, ChevronDown, ChevronUp, Clock, Mail, Slack, Globe, Database, Cpu, Calendar, Code, Split, Info, Send, AlertTriangle, Sparkles } from 'lucide-react';

const NodeWrapper = memo(({ children, title, icon: Icon, colorClass, isProcessing, data }: any) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const events = data?.events || [];

    return (
        <div className={`min-w-[220px] rounded-2xl border-2 bg-card text-card-foreground shadow-xl transition-all relative overflow-hidden
            ${isProcessing ? 'animate-border-glow ring-4 ring-primary/20 scale-[1.02]' : 'hover:border-primary/50'} 
            ${colorClass}`}>
            
            {isProcessing && <div className="processing-scanline" />}
            
            <div className="flex items-center gap-2.5 p-3 border-b border-border bg-muted/30 rounded-t-2xl relative">
                <div className={`p-2 rounded-xl bg-background border border-border text-foreground shadow-sm`}>
                    <Icon className={`w-4 h-4 ${isProcessing ? 'animate-pulse text-primary' : ''}`} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest opacity-80">{title}</span>
                {isProcessing && (
                    <div className="absolute right-3 flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-[sparkle_1s_infinite]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-[sparkle_1s_infinite_200ms]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/30 animate-[sparkle_1s_infinite_400ms]" />
                    </div>
                )}
            </div>
            
            <div className="p-4 relative z-10">
                {children}
            </div>

            {/* Events Log */}
            {events.length > 0 && (
                <div className="border-t border-border bg-muted/20">
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full px-4 py-2 flex items-center justify-between text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] hover:bg-muted/40 transition-colors"
                    >
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> Logs ({events.length})
                        </span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    
                    {isExpanded && (
                        <div className="p-3 space-y-3 max-h-[200px] overflow-y-auto">
                            {events.map((event: any, idx: number) => (
                                <div key={idx} className="flex flex-col gap-1 border-l-2 border-primary/30 pl-3 py-1 bg-background/40 rounded-r-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-primary uppercase tracking-tighter">{event.label}</span>
                                        <span className="text-[8px] text-muted-foreground font-mono">{event.time}</span>
                                    </div>
                                    <span className="text-[10px] text-foreground/80 leading-tight font-medium">{event.detail}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});
NodeWrapper.displayName = 'NodeWrapper';

export const TriggerNode = memo(({ data = {} }: any) => {
    return (
        <NodeWrapper title={data?.label || "Trigger"} icon={Zap} colorClass="border-border" isProcessing={data?.isProcessing} data={data}>
            <div className="text-[11px] font-bold text-muted-foreground italic bg-muted/50 p-2 rounded-xl border border-border/50">
                Active on new capture
            </div>
            <Handle type="source" position={Position.Right} className="!bg-primary w-3 h-3 border-2 border-background" />
        </NodeWrapper>
    );
});
TriggerNode.displayName = 'TriggerNode';

export const WebhookNode = memo(({ data = {} }: any) => {
    return (
        <NodeWrapper title={data?.label || "Webhook"} icon={Globe} colorClass="border-border" isProcessing={data?.isProcessing} data={data}>
            <div className="text-[10px] bg-background border border-border text-primary p-2 rounded-xl font-mono truncate shadow-inner">
                POST /api/webhooks/{data?.webhookId || 'new'}
            </div>
            <Handle type="source" position={Position.Right} className="!bg-aurora-orange w-3 h-3 border-2 border-background" />
        </NodeWrapper>
    );
});
WebhookNode.displayName = 'WebhookNode';

export const ScheduleNode = memo(({ data = {} }: any) => {
    return (
        <NodeWrapper title={data?.label || "Schedule"} icon={Calendar} colorClass="border-border" isProcessing={data?.isProcessing} data={data}>
            <div className="text-[11px] font-bold text-muted-foreground bg-muted/50 p-2 rounded-xl flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Every {data?.interval || 'day'} at {data?.time || '09:00'}
            </div>
            <Handle type="source" position={Position.Right} className="!bg-primary w-3 h-3 border-2 border-background" />
        </NodeWrapper>
    );
});
ScheduleNode.displayName = 'ScheduleNode';

export const AIRouterNode = memo(({ data = {} }: any) => {
    return (
        <NodeWrapper title={data?.label || "AI Router"} icon={GitBranch} colorClass="border-primary/30 shadow-primary/5" isProcessing={data?.isProcessing} data={data}>
            <div className="text-[9px] text-primary font-black uppercase tracking-widest mb-3 px-2 py-1 bg-primary/10 rounded-lg w-fit">
                {data?.model || 'gemini-2.0-flash'}
            </div>
            <div className="text-[11px] text-muted-foreground font-medium italic border-l-2 border-muted pl-2">
                {data?.systemPrompt ? 'Custom Strategy' : 'Intelligent Routing...'}
            </div>
            <Handle type="target" position={Position.Left} className="!bg-primary w-3 h-3 border-2 border-background" />

            <div className="mt-6 flex flex-col gap-3">
                {['PROJECT', 'PERSON', 'IDEA', 'ADMIN'].map(type => (
                    <div key={type} className="relative flex items-center justify-end group">
                        <span className="text-[9px] font-black mr-3 text-muted-foreground lowercase tracking-widest group-hover:text-primary transition-colors">{type}</span>
                        <Handle type="source" position={Position.Right} id={type} className="w-2.5 h-2.5 !right-[-12px] bg-muted border-2 border-background hover:bg-primary transition-colors" />
                    </div>
                ))}
            </div>
        </NodeWrapper>
    );
});
AIRouterNode.displayName = 'AIRouterNode';

export const ConditionNode = memo(({ data = {} }: any) => {
    return (
        <NodeWrapper title={data?.label || "Logical Split"} icon={Split} colorClass="border-border" isProcessing={data?.isProcessing} data={data}>
            <div className="text-[10px] p-2.5 bg-background rounded-xl border border-border text-foreground font-mono shadow-inner mb-4">
                {data?.condition || 'Check data...'}
            </div>
            <Handle type="target" position={Position.Left} className="!bg-accent w-3 h-3 border-2 border-background" />
            
            <div className="space-y-4">
                <div className="relative flex justify-end items-center group">
                    <span className="text-[10px] font-black mr-3 text-aurora-green uppercase tracking-widest opacity-70 group-hover:opacity-100">True</span>
                    <Handle type="source" position={Position.Right} id="true" className="!bg-aurora-green w-2.5 h-2.5 !right-[-12px] border-2 border-background" />
                </div>
                <div className="relative flex justify-end items-center group">
                    <span className="text-[10px] font-black mr-3 text-aurora-red uppercase tracking-widest opacity-70 group-hover:opacity-100">False</span>
                    <Handle type="source" position={Position.Right} id="false" className="!bg-aurora-red w-2.5 h-2.5 !right-[-12px] border-2 border-background" />
                </div>
            </div>
        </NodeWrapper>
    );
});
ConditionNode.displayName = 'ConditionNode';

export const CodeNode = memo(({ data = {} }: any) => {
    return (
        <NodeWrapper title={data?.label || "JS Script"} icon={Code} colorClass="border-border" isProcessing={data?.isProcessing} data={data}>
            <div className="text-[10px] font-mono bg-[#2e3440] text-[#d8dee9] p-3 rounded-xl overflow-hidden h-16 shadow-inner border border-black/20">
                {data?.code || '// Write logic...'}
            </div>
            <Handle type="target" position={Position.Left} className="!bg-muted-foreground w-3 h-3 border-2 border-background" />
            <Handle type="source" position={Position.Right} className="!bg-muted-foreground w-3 h-3 border-2 border-background" />
        </NodeWrapper>
    );
});
CodeNode.displayName = 'CodeNode';

export const CalendarNode = memo(({ data = {} }: any) => {
    return (
        <NodeWrapper title={data?.label || "Calendar"} icon={Calendar} colorClass="border-border" isProcessing={data?.isProcessing} data={data}>
            <div className="space-y-2 bg-muted/30 p-2 rounded-xl border border-border/50">
                <div className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> {data?.timeMode || 'Auto-Detect'}
                </div>
                <div className="text-[11px] text-muted-foreground italic font-medium">
                    {data?.eventTitle || 'Extracting...'}
                </div>
            </div>
            <Handle type="target" position={Position.Left} className="!bg-aurora-green w-3 h-3 border-2 border-background" />
            <Handle type="source" position={Position.Right} className="!bg-aurora-green w-3 h-3 border-2 border-background" />
        </NodeWrapper>
    );
});
CalendarNode.displayName = 'CalendarNode';

export const ActionNode = memo(({ data = {} }: any) => {
    const type = data?.actionType || 'create_task';
    let Icon = Play;
    let iconColor = "text-primary";
    
    if (type.includes('slack')) Icon = Slack;
    if (type.includes('email')) Icon = Mail;
    if (type.includes('webhook')) Icon = Globe;
    if (type.includes('create_')) { Icon = Database; iconColor = "text-aurora-green"; }
    if (type.includes('notify')) { Icon = Send; iconColor = "text-aurora-orange"; }
    if (type.includes('ai_nudge')) { Icon = Sparkles; iconColor = "text-aurora-purple"; }
    if (type.includes('github')) Icon = Code;

    return (
        <NodeWrapper title={data?.label || "Action"} icon={Icon} colorClass="border-border shadow-sm" isProcessing={data?.isProcessing} data={data}>
            <div className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-2 px-2 py-1 bg-muted/50 rounded-lg w-fit">
                {type.replace('_', ' ')}
            </div>
            <div className="text-[11px] font-medium text-foreground/80 line-clamp-2">
                {data?.messageTemplate ? data.messageTemplate : (data?.label || 'Execute Task')}
            </div>
            <Handle type="target" position={Position.Left} className="!bg-foreground w-3 h-3 border-2 border-background" />
            <Handle type="source" position={Position.Right} className="!bg-foreground w-3 h-3 border-2 border-background" />
        </NodeWrapper>
    );
});
ActionNode.displayName = 'ActionNode';

export const GeminiReasoningNode = memo(({ data = {} }: any) => {
    return (
        <NodeWrapper title={data?.label || "Gemini Reason"} icon={Cpu} colorClass="border-primary/40 shadow-lg shadow-primary/5" isProcessing={data?.isProcessing} data={data}>
            <div className="text-[10px] text-primary font-black uppercase tracking-widest mb-3 px-2 py-1 bg-primary/10 rounded-lg w-fit">
                {data?.model || 'gemini-2.0-flash'}
            </div>
            <div className="text-[11px] text-foreground font-bold italic bg-background p-2.5 rounded-xl border border-primary/20 shadow-inner">
                {data?.promptTemplate || 'Deep Analysis...'}
            </div>
            <Handle type="target" position={Position.Left} className="!bg-primary w-3.5 h-3.5 border-2 border-background ring-4 ring-primary/10" />
            <Handle type="source" position={Position.Right} className="!bg-primary w-3.5 h-3.5 border-2 border-background ring-4 ring-primary/10" />
        </NodeWrapper>
    );
});
GeminiReasoningNode.displayName = 'GeminiReasoningNode';
