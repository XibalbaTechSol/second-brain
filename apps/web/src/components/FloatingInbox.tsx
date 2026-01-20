'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, X, Loader2, Sparkles } from 'lucide-react';

export default function FloatingInbox() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSend = async () => {
        if (!message.trim()) return;
        setIsSending(true);
        setStatus('idle');

        try {
            const res = await fetch('/api/inbox', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: message, source: 'QUICK_CAPTURE' })
            });

            if (res.ok) {
                setStatus('success');
                setMessage('');
                setTimeout(() => {
                    setIsOpen(false);
                    setStatus('idle');
                }, 2000);
            } else {
                setStatus('error');
            }
        } catch (e) {
            setStatus('error');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {/* Popover */}
            {isOpen && (
                <div className="w-80 md:w-96 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300">
                    <div className="p-4 bg-indigo-600 flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            <h3 className="text-sm font-bold">Quick Capture</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-4 space-y-4">
                        <textarea
                            autoFocus
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="What's on your mind? Tasks, ideas, links..."
                            className="w-full h-32 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-gray-800 dark:text-gray-200"
                        />
                        
                        <div className="flex items-center justify-between">
                            <div className="text-[10px] text-gray-400">
                                {status === 'success' && <span className="text-green-500 font-bold">✓ Captured to Inbox</span>}
                                {status === 'error' && <span className="text-red-500 font-bold">Failed to send</span>}
                            </div>
                            <button
                                onClick={handleSend}
                                disabled={isSending || !message.trim()}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                            >
                                {isSending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                Send to Brain
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
                    isOpen ? 'bg-gray-800 dark:bg-white text-white dark:text-gray-900 rotate-90' : 'bg-indigo-600 text-white hover:scale-110'
                }`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </button>
        </div>
    );
}
