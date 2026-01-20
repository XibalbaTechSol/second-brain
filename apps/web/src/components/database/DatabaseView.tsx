'use client';

import React, { useState } from 'react';
import { TableView } from './TableView';
import { CRMView } from './CRMView';
import { SidePeek } from './SidePeek';
import { LayoutGrid, List } from 'lucide-react';
import { formatToMMDDYYYY } from '@/lib/date-utils';

const MOCK_DATA = [
    { id: '1', name: 'Project Alpha', tags: ['Work', 'Urgent'], status: 'In Progress', created: '10/24/2023', content: '<h3>Project Alpha</h3><p>Detailed notes for Alpha...</p>' },
    { id: '2', name: 'Personal Goals', tags: ['Life'], status: 'Not Started', created: '10/25/2023', content: '<h3>Personal Goals</h3><ul><li>Goal 1</li><li>Goal 2</li></ul>' },
    { id: '3', name: 'Q4 Review', tags: ['Work'], status: 'Done', created: '10/26/2023', content: '<h3>Q4 Review</h3><p>Everything went well.</p>' },
];

interface DatabaseViewProps {
    initialData?: any[];
    viewTitle?: string;
    viewType?: string;
}

interface Property {
    id: string;
    name: string;
    type: 'text' | 'number' | 'select' | 'multi-select' | 'date';
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({ initialData, viewTitle = 'Database', viewType = 'Generic' }) => {
    const [data, setData] = React.useState<any[]>(initialData || MOCK_DATA);
    const [viewMode, setViewMode] = useState<'table' | 'crm'>(viewType === 'PERSON' ? 'crm' : 'table');
    const [activePage, setActivePage] = useState<any | null>(null);

    // Update local state when initialData changes (if fetched)
    React.useEffect(() => {
        if (initialData && initialData.length > 0) {
            setData(initialData);
        }
    }, [initialData]);

    const handleUpdateRow = async (id: string, updates: any) => {
        console.log('Updating row', id, updates);
        setData(prev => prev.map(row => row.id === id ? { ...row, ...updates } : row));

        try {
            await fetch(`/api/entities/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
        } catch (error) {
            console.error('Failed to update row:', error);
        }
    };

    const handleReorder = (newData: any[]) => {
        setData(newData);
        // Persist order if backend supports it
    };

    const handleCreateRow = async () => {
        const newId = `temp-${Date.now()}`;
        const newRow = {
            id: newId,
            name: 'Untitled',
            tags: [viewType],
            status: 'Active',
            created: formatToMMDDYYYY(new Date()),
            content: ''
        };

        setData(prev => [...prev, newRow]);

        try {
            const res = await fetch('/api/entities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Untitled',
                    type: viewType === 'Generic' ? 'NOTE' : viewType,
                    content: ''
                })
            });
            const saved = await res.json();
            // Replace temp id with real id
            setData(prev => prev.map(r => r.id === newId ? { ...r, id: saved.id } : r));
        } catch (error) {
            console.error('Failed to create row:', error);
        }
    };

    // Dynamic Columns based on View Type
    const columns: Property[] = [
        { id: 'name', name: 'Name', type: 'text' },
        { id: 'tags', name: 'Tags', type: 'multi-select' },
        { id: 'status', name: 'Status', type: 'select' },
    ];

    // Customize columns
    if (viewType === 'PERSON') {
        columns.push({ id: 'role', name: 'Role', type: 'text' });
        columns.push({ id: 'company', name: 'Company', type: 'text' });
        columns.push({ id: 'email', name: 'Email', type: 'text' });
    } else if (viewType === 'PROJECT') {
        columns.push({ id: 'outcome', name: 'Outcome', type: 'text' });
        columns.push({ id: 'nextAction', name: 'Next Action', type: 'text' });
        columns.push({ id: 'budget', name: 'Budget', type: 'number' });
        columns.push({ id: 'riskLevel', name: 'Risk', type: 'select' });
    } else if (viewType === 'ADMIN') {
        columns.push({ id: 'category', name: 'Category', type: 'text' });
        columns.push({ id: 'importance', name: 'Importance', type: 'select' });
        columns.push({ id: 'expiryDate', name: 'Expires', type: 'date' });
    } else if (viewType === 'IDEA') {
        columns.push({ id: 'potential', name: 'Potential', type: 'select' });
        columns.push({ id: 'impactScore', name: 'Impact', type: 'number' });
        columns.push({ id: 'effortScore', name: 'Effort', type: 'number' });
    } else if (viewType === 'Generic') {
        columns.push({ id: 'role', name: 'Role/Company', type: 'text' });
        columns.push({ id: 'outcome', name: 'Outcome', type: 'text' });
    }

    columns.push({ id: 'created', name: 'Created', type: 'date' });

    return (
        <div className="flex flex-col h-full bg-background text-foreground relative">
            {/* Header / Toolbar Area */}
            <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-background z-20">
                <h1 className="text-xl font-semibold">{viewTitle}</h1>
                <div className="flex items-center gap-4">
                    {viewType === 'PERSON' && (
                        <div className="flex bg-muted p-1 rounded-lg">
                            <button 
                                onClick={() => setViewMode('crm')}
                                className={`p-1.5 rounded-md ${viewMode === 'crm' ? 'bg-card shadow-sm' : ''}`}
                            >
                                <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button 
                                onClick={() => setViewMode('table')}
                                className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-card shadow-sm' : ''}`}
                            >
                                <List className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>
                    )}
                    <div className="flex gap-2 text-sm text-muted-foreground">
                        <button className="hover:text-foreground transition-colors px-2 py-1 hover:bg-muted rounded-md">Sort</button>
                        <button className="hover:text-foreground transition-colors px-2 py-1 hover:bg-muted rounded-md">Filter</button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                {viewMode === 'crm' ? (
                    <CRMView 
                        data={data} 
                        onUpdateRow={handleUpdateRow} 
                        onOpenPage={setActivePage} 
                        onCreateRow={handleCreateRow}
                    />
                ) : (
                    <TableView 
                        properties={columns} 
                        data={data} 
                        onUpdateRow={handleUpdateRow} 
                        onReorder={handleReorder}
                        onCreateRow={handleCreateRow}
                        onOpenPage={setActivePage}
                    />
                )}
            </div>

            <SidePeek 
                activePage={activePage} 
                onClose={() => setActivePage(null)} 
                onUpdateRow={handleUpdateRow}
                properties={columns}
            />
        </div>
    );
};