'use client';

import React, { useState } from 'react';
import { Mail, Phone, Linkedin, Calendar, UserPlus, MoreVertical, Search, Filter } from 'lucide-react';
import { formatToMMDDYYYY } from '@/lib/date-utils';

interface CRMViewProps {
    data: any[];
    onUpdateRow?: (id: string, updates: any) => void;
    onOpenPage: (row: any) => void;
    onCreateRow?: () => void;
}

export const CRMView: React.FC<CRMViewProps> = ({ data, onUpdateRow, onOpenPage, onCreateRow }) => {
    const [search, setSearch] = useState('');

    const filteredData = data.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.metadata?.person?.company?.toLowerCase().includes(search.toLowerCase()) ||
        p.metadata?.person?.role?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-background">
            {/* CRM Toolbar */}
            <div className="px-6 py-4 border-b border-border bg-card flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-64">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                        <input 
                            type="text"
                            placeholder="Search contacts..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none text-foreground"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                    </button>
                </div>
                <button 
                    onClick={onCreateRow}
                    className="bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Person</span>
                </button>
            </div>

            {/* Contact Grid */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredData.map((person) => (
                        <div 
                            key={person.id}
                            onClick={() => onOpenPage(person)}
                            className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group relative"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold text-xl">
                                    {person.name.charAt(0)}
                                </div>
                                <button className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-muted rounded-lg transition-all">
                                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                </button>
                            </div>

                            <div className="space-y-1 mb-6">
                                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                                    {person.name}
                                </h3>
                                <p className="text-xs text-muted-foreground font-medium">
                                    {person.metadata?.person?.role || 'No Role'} @ {person.metadata?.person?.company || 'Freelance'}
                                </p>
                            </div>

                            <div className="space-y-3">
                                {person.metadata?.person?.email && (
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <Mail className="w-3.5 h-3.5" />
                                        <span className="truncate">{person.metadata.person.email}</span>
                                    </div>
                                )}
                                {person.metadata?.person?.linkedin && (
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <Linkedin className="w-3.5 h-3.5 text-primary" />
                                        <span className="truncate text-primary hover:underline">LinkedIn Profile</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border mt-4">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Last contact: {person.metadata?.person?.lastContacted ? formatToMMDDYYYY(person.metadata.person.lastContacted) : 'Never'}</span>
                                </div>
                            </div>

                            {/* P-Value Indicator */}
                            <div className="absolute top-6 right-12 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-aurora-green/10 text-aurora-green border border-aurora-green/20">
                                P={person.confidence || 1.0}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
