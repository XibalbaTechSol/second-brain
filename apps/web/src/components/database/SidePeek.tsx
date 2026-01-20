'use client';

import React from 'react';
import { X, ExternalLink, Maximize2 } from 'lucide-react';
import { Editor } from '../editor/Editor';
import { formatToMMDDYYYY } from '@/lib/date-utils';

interface SidePeekProps {
    activePage: any;
    onClose: () => void;
    onUpdateRow?: (id: string, updates: any) => void;
    properties: any[];
}

export const SidePeek: React.FC<SidePeekProps> = ({ activePage, onClose, onUpdateRow, properties }) => {
    if (!activePage) return null;

    const handleRemoveTag = (propId: string, tagToRemove: string) => {
        const currentTags = activePage[propId] || [];
        const newTags = currentTags.filter((t: string) => t !== tagToRemove);
        onUpdateRow?.(activePage.id, { [propId]: newTags });
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
            <div className="fixed right-0 top-0 bottom-0 w-[600px] bg-card shadow-2xl z-50 animate-in slide-in-from-right duration-300 flex flex-col border-l border-border">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="p-1.5 hover:bg-muted rounded transition-colors">
                            <X className="w-4 h-4 text-foreground" />
                        </button>
                        <a 
                            href={`/databases/${activePage.type?.toLowerCase() || 'all'}/${activePage.id}`}
                            className="p-1.5 hover:bg-muted rounded flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-all"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>Open as full page</span>
                        </a>
                    </div>
                    <div className="flex gap-2 items-center">
                        {activePage.confidence !== undefined && (
                            <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-aurora-green/10 text-aurora-green border border-aurora-green/20">
                                P={activePage.confidence?.toFixed(2)}
                            </span>
                        )}
                        <span className="text-[10px] font-bold text-muted-foreground uppercase bg-muted px-2 py-1 rounded">Page</span>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-12 bg-background">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold text-foreground">{activePage.name}</h1>
                            <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
                                {properties.map(prop => (
                                    <React.Fragment key={prop.id}>
                                        <div className="text-muted-foreground flex items-center">{prop.name}</div>
                                        <div className="p-1 hover:bg-muted rounded cursor-pointer min-h-[28px] flex items-center text-foreground">
                                            {renderCellStatic(prop, activePage[prop.id], (tag) => handleRemoveTag(prop.id, tag))}
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-border pt-8">
                            <Editor 
                                initialContent={activePage.content || `<h3>${activePage.name}</h3><p>Start writing...</p>`} 
                                onUpdate={(html) => onUpdateRow?.(activePage.id, { content: html })}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const renderCellStatic = (property: any, value: any, onRemoveTag?: (tag: string) => void) => {
    if (!value && value !== 0) return <span className="text-muted-foreground/40 italic text-xs">Empty</span>;

    switch (property.type) {
        case 'multi-select':
            return (
                <div className="flex flex-wrap gap-1">
                    {Array.isArray(value) && value.map((tag: string, tagIdx: number) => (
                        <span key={tagIdx} className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20 flex items-center gap-1 group/tag">
                            <span>{tag}</span>
                            {onRemoveTag && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveTag(tag);
                                    }}
                                    className="opacity-0 group-hover/tag:opacity-100 hover:bg-primary/20 rounded-sm p-0.25 transition-all"
                                >
                                    <X className="w-2.5 h-2.5" />
                                </button>
                            )}
                        </span>
                    ))}
                </div>
            );
        case 'select':
            return (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-aurora-green/10 text-aurora-green border border-aurora-green/20">
                    {value}
                </span>
            );
        case 'date':
            return (
                <span className="text-xs">
                    {formatToMMDDYYYY(value)}
                </span>
            );
        default:
            return <span className="text-xs">{value}</span>;
    }
};
