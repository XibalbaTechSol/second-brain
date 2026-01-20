'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, X, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

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
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
            {/* Popover */}
            {isOpen && (
                <div className="w-[350px] md:w-[400px] bg-card text-card-foreground rounded-[2rem] shadow-2xl border border-border overflow-hidden flex flex-col animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300">
                    <div className="p-6 bg-primary flex items-center justify-between text-primary-foreground">
                        <div className="flex items-center gap-2.5">
                            <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest italic">Quick Capture</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors active:scale-90">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-6 space-y-5 bg-card transition-colors duration-300">
                        <textarea
                            autoFocus
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Tell your brain something new..."
                            className="w-full h-40 bg-background/50 border border-border rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none resize-none text-foreground placeholder:text-muted-foreground/40 shadow-inner transition-all"
                        />
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {status === 'success' && (
                                    <div className="flex items-center gap-1.5 text-aurora-green animate-in fade-in slide-in-from-left-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Captured</span>
                                    </div>
                                )}
                                {status === 'error' && (
                                    <div className="flex items-center gap-1.5 text-aurora-red animate-in shake">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Failed</span>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleSend}
                                disabled={isSending || !message.trim()}
                                className="bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2.5 transition-all shadow-lg shadow-primary/20 active:scale-95"
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
                className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all duration-500 border-2 border-transparent ${
                    isOpen 
                    ? 'bg-foreground text-background rotate-90 rounded-full' 
                    : 'bg-primary text-primary-foreground hover:scale-110 hover:shadow-primary/30'
                }`}
            >
                {isOpen ? <X className="w-7 h-7" /> : <MessageSquare className="w-7 h-7" />}
            </button>
        </div>
    );
}