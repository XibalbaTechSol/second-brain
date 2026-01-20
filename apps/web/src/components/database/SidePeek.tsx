'use client';

import React from 'react';
import { X, ExternalLink, Maximize2 } from 'lucide-react';
import { Editor } from '../editor/Editor';

interface SidePeekProps {
    activePage: any;
    onClose: () => void;
    onUpdateRow?: (id: string, updates: any) => void;
    properties: any[];
}

export const SidePeek: React.FC<SidePeekProps> = ({ activePage, onClose, onUpdateRow, properties }) => {
    if (!activePage) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
            <div className="fixed right-0 top-0 bottom-0 w-[600px] bg-white dark:bg-[#191919] shadow-2xl z-50 animate-in slide-in-from-right duration-300 flex flex-col border-l border-gray-200 dark:border-gray-800">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                            <X className="w-4 h-4" />
                        </button>
                        <a 
                            href={`/databases/${activePage.type?.toLowerCase() || 'all'}/${activePage.id}`}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex items-center gap-2 text-xs text-gray-500 hover:text-gray-800 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>Open as full page</span>
                        </a>
                    </div>
                    <div className="flex gap-2 items-center">
                        {activePage.confidence !== undefined && (
                            <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-green-50 dark:bg-green-900/20 text-green-600 border border-green-100 dark:border-green-900/30">
                                P={activePage.confidence?.toFixed(2)}
                            </span>
                        )}
                        <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Page</span>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-12">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">{activePage.name}</h1>
                            <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
                                {properties.map(prop => (
                                    <React.Fragment key={prop.id}>
                                        <div className="text-gray-400 flex items-center">{prop.name}</div>
                                        <div className="p-1 hover:bg-gray-50 dark:hover:bg-white/5 rounded cursor-pointer min-h-[28px] flex items-center">
                                            {renderCellStatic(prop, activePage[prop.id])}
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
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

const renderCellStatic = (property: any, value: any) => {
    if (!value && value !== 0) return <span className="text-gray-300 dark:text-gray-600 italic text-xs">Empty</span>;

    switch (property.type) {
        case 'multi-select':
            return (
                <div className="flex flex-wrap gap-1">
                    {Array.isArray(value) && value.map((tag: string, tagIdx: number) => (
                        <span key={tagIdx} className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {tag}
                        </span>
                    ))}
                </div>
            );
        case 'select':
            return (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    {value}
                </span>
            );
        default:
            return <span className="text-xs">{value}</span>;
    }
};
