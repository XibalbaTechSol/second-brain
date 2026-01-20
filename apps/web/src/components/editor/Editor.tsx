'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import GlobalDragHandle from 'tiptap-extension-global-drag-handle';
import TaskItem from '@tiptap/extension-task-item';
import Typography from '@tiptap/extension-typography';
import Highlight from '@tiptap/extension-highlight';
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, CheckSquare, Code, Quote, GripVertical } from 'lucide-react';
import React, { useEffect } from 'react';

interface EditorProps {
    initialContent?: string;
    onUpdate?: (content: string) => void;
    editable?: boolean;
}

export const Editor: React.FC<EditorProps> = ({ initialContent, onUpdate, editable = true }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Type \'/\' for commands...',
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Typography,
            Highlight,
            GlobalDragHandle.configure({
                dragHandleWidth: 20,
                scrollTreshold: 100,
            }),
        ],
        content: initialContent || '',
        editable,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onUpdate?.(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[300px]',
            }
        }
    });

    // Update content if initialContent changes externally
    useEffect(() => {
        if (editor && initialContent && editor.getHTML() !== initialContent) {
            // Only set content if it's significantly different to avoid cursor jumps
            // For now, simpler approach:
            // editor.commands.setContent(initialContent); 
        }
    }, [initialContent, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="relative">
            {editor && (
                <BubbleMenu editor={editor} className="flex bg-card shadow-lg border border-border rounded-lg overflow-hidden divide-x divide-border">
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-2 hover:bg-muted ${editor.isActive('bold') ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-2 hover:bg-muted ${editor.isActive('italic') ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={`p-2 hover:bg-muted ${editor.isActive('strike') ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                        <Strikethrough className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        className={`p-2 hover:bg-muted ${editor.isActive('code') ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                        <Code className="w-4 h-4" />
                    </button>
                </BubbleMenu>
            )}

            {editor && (
                <FloatingMenu editor={editor} className="flex bg-card shadow-lg border border-border rounded-lg overflow-hidden p-1 gap-1">
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={`p-1.5 rounded hover:bg-muted ${editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}`}
                        title="Heading 1"
                    >
                        <Heading1 className="w-4 h-4 text-foreground" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`p-1.5 rounded hover:bg-muted ${editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}`}
                        title="Heading 2"
                    >
                        <Heading2 className="w-4 h-4 text-foreground" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`p-1.5 rounded hover:bg-muted ${editor.isActive('bulletList') ? 'bg-muted' : ''}`}
                        title="Bullet List"
                    >
                        <List className="w-4 h-4 text-foreground" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`p-1.5 rounded hover:bg-muted ${editor.isActive('orderedList') ? 'bg-muted' : ''}`}
                        title="Numbered List"
                    >
                        <ListOrdered className="w-4 h-4 text-foreground" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleTaskList().run()}
                        className={`p-1.5 rounded hover:bg-muted ${editor.isActive('taskList') ? 'bg-muted' : ''}`}
                        title="Task List"
                    >
                        <CheckSquare className="w-4 h-4 text-foreground" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`p-1.5 rounded hover:bg-muted ${editor.isActive('blockquote') ? 'bg-muted' : ''}`}
                        title="Quote"
                    >
                        <Quote className="w-4 h-4 text-foreground" />
                    </button>
                </FloatingMenu>
            )}

            <EditorContent editor={editor} />
        </div>
    );
};
