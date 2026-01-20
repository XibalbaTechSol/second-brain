import { prisma } from '@second-brain/database';
import { notFound } from 'next/navigation';
import { Editor } from '@/components/editor/Editor';
import Sidebar from '@/components/Sidebar';

export const dynamic = 'force-dynamic';

export default async function EntityPage({ params }: { params: Promise<{ type: string, id: string }> }) {
    const { id } = await params;

    const entity = await prisma.entity.findUnique({
        where: { id },
        include: {
            project: true,
            person: true,
            idea: true,
            admin: true,
            tags: true
        }
    });

    if (!entity) return notFound();

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
            <div className="max-w-4xl mx-auto p-12 py-24 space-y-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                            {entity.type}
                        </span>
                    </div>
                    <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
                        {entity.title}
                    </h1>
                    
                    <div className="grid grid-cols-[140px_1fr] gap-y-4 text-sm border-t border-b border-gray-100 dark:border-gray-800 py-8">
                        <div className="text-gray-400">Created</div>
                        <div className="text-gray-700 dark:text-gray-300">{entity.createdAt.toLocaleString()}</div>
                        
                        {entity.type === 'PERSON' && (
                            <>
                                <div className="text-gray-400">Role/Company</div>
                                <div className="text-gray-700 dark:text-gray-300">{entity.person?.role || '---'}</div>
                            </>
                        )}
                        
                        {entity.type === 'PROJECT' && (
                            <>
                                <div className="text-gray-400">Status</div>
                                <div className="text-gray-700 dark:text-gray-300">{entity.project?.status || 'Active'}</div>
                            </>
                        )}

                        <div className="text-gray-400">Tags</div>
                        <div className="flex gap-2">
                            {entity.tags.map(t => (
                                <span key={t.id} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded text-xs">
                                    {t.name}
                                </span>
                            ))}
                            {entity.tags.length === 0 && <span className="text-gray-300 italic">No tags</span>}
                        </div>
                    </div>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                    <Editor initialContent={entity.content || `<h3>Summary</h3><p>${entity.summary || 'Start writing...'}</p>`} />
                </div>
            </div>
        </div>
    );
}
