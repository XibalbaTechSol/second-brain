import { Editor } from '@/components/editor/Editor';

export default function EditorPage() {
    return (
        <div className="min-h-screen bg-background p-8 flex flex-col items-center">
            <div className="w-full max-w-4xl">
                <h1 className="text-2xl font-bold mb-6 text-foreground">Block Editor Test</h1>
                <div className="bg-card rounded-xl shadow-xl border border-border p-8 min-h-[500px]">
                    <Editor initialContent="<h3>Welcome to the Block Editor</h3><p>Type '/' to see commands...</p>" />
                </div>
            </div>
        </div>
    );
}
