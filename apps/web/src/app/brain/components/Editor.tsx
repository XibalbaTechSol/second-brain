'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import Image from '@tiptap/extension-image';
import Mention from '@tiptap/extension-mention';
import { Bold, Italic, Strikethrough, Code, Link as LinkIcon, Heading1, Heading2, List, CheckSquare, Type, ChevronDown } from 'lucide-react';
import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import suggestion from './extensions/suggestion';
import mentionSuggestion from './extensions/mentionSuggestion';

const lowlight = createLowlight(common);

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

export default function Editor({ content, onChange }: { content: string, onChange: (val: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We use Lowlight
      }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ 
        placeholder: "Type '/' for commands or '@' to link a memory...",
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Image,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: mentionSuggestion,
      }),
      Commands.configure({
        suggestion: suggestion,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg focus:outline-none max-w-none min-h-[500px] px-8 py-6',
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-border rounded-xl bg-card shadow-sm overflow-hidden relative">
      {editor && (
        <BubbleMenu editor={editor} className="flex bg-card shadow-xl border border-border rounded-lg overflow-hidden divide-x divide-border">
          <div className="flex items-center px-1">
            <button
              onClick={() => {/* Turn into logic */ }}
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

      <EditorContent editor={editor} className="font-sans editor-container text-foreground" />
      
      {/* GLOBAL STYLES FOR NOTION LOOK */}
      <style jsx global>{`
        .editor-container .ProseMirror {
          padding-left: 2rem; /* Space for handles */
        }

        /* Block Handles (Visual) */
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

        .ProseMirror p:hover::before { top: 0; }

        /* Placeholder */
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--muted-foreground);
          opacity: 0.4;
          pointer-events: none;
          height: 0;
        }

        /* Mentions / Links */
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

        /* Task List */
        ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }
        ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }
        ul[data-type="taskList"] li > label {
          margin-top: 0.25rem;
          user-select: none;
        }
        ul[data-type="taskList"] li > div {
          flex: 1;
        }

        /* Code Block */
        pre {
          background: #2e3440;
          border-radius: 0.5rem;
          color: #d8dee9;
          font-family: 'JetBrains Mono', monospace;
          padding: 0.75rem 1rem;
        }

        /* Blockquote */
        blockquote {
          border-left: 3px solid var(--primary);
          padding-left: 1rem;
          color: var(--muted-foreground);
          font-style: italic;
        }
        
        /* Headers */
        h1 { font-size: 2.25rem; font-weight: 800; margin-top: 2rem; margin-bottom: 1rem; }
        h2 { font-size: 1.75rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; }
        h3 { font-size: 1.5rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; }
      `}</style>
    </div>
  );
}