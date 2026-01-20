import React, { useMemo } from 'react';
import { MoreHorizontal, Plus } from 'lucide-react';

interface BoardViewProps {
    data: any[];
    groupBy?: string; // e.g., 'status'
}

export const BoardView: React.FC<BoardViewProps> = ({ data, groupBy = 'status' }) => {
    const groups = useMemo(() => {
        const grouped: Record<string, any[]> = {};
        const uniqueKeys = new Set<string>();

        data.forEach(item => {
            const key = item[groupBy] || 'No Status';
            if (!grouped[key]) {
                grouped[key] = [];
                uniqueKeys.add(key);
            }
            grouped[key].push(item);
        });

        // Ensure common statuses exist even if empty (Mock ordering)
        const ORDER = ['To Do', 'In Progress', 'Done', 'Active', 'No Status'];
        const sortedKeys = Array.from(uniqueKeys).sort((a, b) => {
            const idxA = ORDER.indexOf(a);
            const idxB = ORDER.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
        });

        return sortedKeys.map(key => ({
            name: key,
            items: grouped[key]
        }));
    }, [data, groupBy]);

    return (
        <div className="flex h-full overflow-x-auto p-4 gap-4 bg-gray-50/50 dark:bg-[#0a0a0a]">
            {groups.map((group, groupIdx) => (
                <div key={group.name || groupIdx} className="min-w-[260px] max-w-[260px] flex flex-col h-full">
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-xs font-semibold uppercase bg-gray-200 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400">
                                {group.items.length}
                            </span>
                            <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300">{group.name}</h3>
                        </div>
                        <div className="flex gap-1">
                            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-400"><Plus className="w-4 h-4" /></button>
                            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-400"><MoreHorizontal className="w-4 h-4" /></button>
                        </div>
                    </div>

                    {/* Cards Container */}
                    <div className="flex-1 overflow-y-auto space-y-3 pb-4">
                        {group.items.map((item) => (
                            <div
                                key={item.id}
                                className="group bg-white dark:bg-[#1e1e1e] p-3 rounded-md shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow cursor-pointer select-none"
                            >
                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 leading-snug">
                                    {item.name}
                                </h4>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {item.tags?.map((tag: string, tagIdx: number) => (
                                        <span key={`${tag}-${tagIdx}`} className="px-1.5 py-0.5 text-[10px] rounded bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Footer Metadata */}
                                <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                    <span>{item.created}</span>
                                    {/* Placeholder for assignees or other icons */}
                                    <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded-full" />
                                </div>
                            </div>
                        ))}

                        {/* New Item Button */}
                        <button className="w-full flex items-center gap-2 p-2 rounded text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-sm">
                            <Plus className="w-4 h-4" /> New
                        </button>
                    </div>
                </div>
            ))}
            <div className="min-w-[50px] pt-2">
                <button className="flex items-center gap-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm">
                    <Plus className="w-4 h-4" /> Add Group
                </button>
            </div>
        </div>
    );
};
