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
                <BubbleMenu editor={editor} className="flex bg-white dark:bg-[#1e1e1e] shadow-lg border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden divide-x divide-gray-200 dark:divide-gray-800">
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${editor.isActive('bold') ? 'text-blue-500' : 'text-gray-600 dark:text-gray-300'}`}
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${editor.isActive('italic') ? 'text-blue-500' : 'text-gray-600 dark:text-gray-300'}`}
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${editor.isActive('strike') ? 'text-blue-500' : 'text-gray-600 dark:text-gray-300'}`}
                    >
                        <Strikethrough className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${editor.isActive('code') ? 'text-blue-500' : 'text-gray-600 dark:text-gray-300'}`}
                    >
                        <Code className="w-4 h-4" />
                    </button>
                </BubbleMenu>
            )}

            {editor && (
                <FloatingMenu editor={editor} className="flex bg-white dark:bg-[#1e1e1e] shadow-lg border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden p-1 gap-1">
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                        title="Heading 1"
                    >
                        <Heading1 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                        title="Heading 2"
                    >
                        <Heading2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${editor.isActive('bulletList') ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                        title="Bullet List"
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${editor.isActive('orderedList') ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                        title="Numbered List"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleTaskList().run()}
                        className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${editor.isActive('taskList') ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                        title="Task List"
                    >
                        <CheckSquare className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${editor.isActive('blockquote') ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                        title="Quote"
                    >
                        <Quote className="w-4 h-4" />
                    </button>
                </FloatingMenu>
            )}

            <EditorContent editor={editor} />
        </div>
    );
};
