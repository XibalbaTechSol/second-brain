import { Editor } from '@/components/editor/Editor';

export default function EditorPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] p-8 flex flex-col items-center">
            <div className="w-full max-w-4xl">
                <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Block Editor Test</h1>
                <div className="bg-white dark:bg-[#121212] rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 min-h-[500px]">
                    <Editor initialContent="<h3>Welcome to the Block Editor</h3><p>Type '/' to see commands...</p>" />
                </div>
            </div>
        </div>
    );
}
