'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import GlobalDragHandle from 'tiptap-extension-global-drag-handle';
import TaskItem from '@tiptap/extension-task-item';
import Typography from '@tiptap/extension-typography';
import Highlight from '@tiptap/extension-highlight';
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, CheckSquare, Code, Quote, GripVertical, Link as LinkIcon, Type, ChevronDown } from 'lucide-react';
import React, { useEffect } from 'react';
import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import suggestion from '../../app/brain/components/extensions/suggestion';

const Commands = Extension.create({
  name: 'slash-commands',
  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

interface EditorProps {
    initialContent?: string;
    onUpdate?: (content: string) => void;
    editable?: boolean;
}

export const Editor: React.FC<EditorProps> = ({ initialContent, onUpdate, editable = true }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({ openOnClick: false }),
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
            Commands.configure({
                suggestion: suggestion,
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
                class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] editor-container',
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
                <BubbleMenu editor={editor} className="flex bg-card shadow-xl border border-border rounded-lg overflow-hidden divide-x divide-border">
                    <div className="flex items-center px-1">
                        <button
                            onClick={() => {/* Turn into logic */}}
                            className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-muted text-xs font-bold text-muted-foreground transition-colors"
                        >
                            <Type className="w-3.5 h-3.5" />
                            <span>Text</span>
                            <ChevronDown className="w-3 h-3 opacity-50" />
                        </button>
                    </div>
                    <div className="flex items-center p-1 gap-0.5">
                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={`p-1.5 rounded hover:bg-muted transition-colors ${editor.isActive('bold') ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
                            title="Bold"
                        >
                            <Bold className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={`p-1.5 rounded hover:bg-muted transition-colors ${editor.isActive('italic') ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
                            title="Italic"
                        >
                            <Italic className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                            className={`p-1.5 rounded hover:bg-muted transition-colors ${editor.isActive('strike') ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
                            title="Strikethrough"
                        >
                            <Strikethrough className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleCode().run()}
                            className={`p-1.5 rounded hover:bg-muted transition-colors ${editor.isActive('code') ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
                            title="Inline Code"
                        >
                            <Code className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => {
                                const url = window.prompt('URL');
                                if (url) editor.chain().focus().setLink({ href: url }).run();
                            }}
                            className={`p-1.5 rounded hover:bg-muted transition-colors ${editor.isActive('link') ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
                            title="Link"
                        >
                            <LinkIcon className="w-4 h-4" />
                        </button>
                    </div>
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

            <EditorContent editor={editor} className="text-foreground" />

            <style jsx global>{`
                .editor-container .ProseMirror {
                    padding-left: 2rem;
                }
                .ProseMirror p, .ProseMirror h1, .ProseMirror h2, .ProseMirror h3, .ProseMirror li {
                    position: relative;
                }
                .ProseMirror p:hover::before, 
                .ProseMirror h1:hover::before, 
                .ProseMirror h2:hover::before, 
                .ProseMirror h3:hover::before,
                .ProseMirror li:hover::before {
                    content: '⠿';
                    position: absolute;
                    left: -1.5rem;
                    top: 0.2rem;
                    color: var(--muted-foreground);
                    opacity: 0.4;
                    font-size: 1.2rem;
                    cursor: grab;
                    transition: color 0.2s;
                }
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: var(--muted-foreground);
                    opacity: 0.4;
                    pointer-events: none;
                    height: 0;
                }
                .mention {
                    background-color: var(--primary);
                    color: var(--primary-foreground);
                    opacity: 0.9;
                    border-radius: 0.4rem;
                    box-decoration-break: clone;
                    padding: 0.1rem 0.3rem;
                    font-weight: 600;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};
