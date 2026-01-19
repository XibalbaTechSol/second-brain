'use client';

import Link from 'next/link';
import { BrainCircuit, Zap, Shield, Smartphone, ArrowRight, Network, Sparkles } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-2xl tracking-tighter italic">Cognito</span>
        </div>
        <div className="flex gap-8 items-center">
          <Link href="#features" className="text-slate-400 hover:text-white transition-colors font-medium">Features</Link>
          <Link href="/login" className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold hover:bg-slate-200 transition-all">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full text-indigo-400 text-sm font-bold mb-8">
          <Sparkles className="w-4 h-4" />
          Powered by Gemini 2.0
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[0.9]">
          The first <span className="text-indigo-500 italic">active</span> <br /> second brain.
        </h1>
        
        <p className="text-slate-400 text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed">
          Most second brains are just archives. CognitoFlow is a SaaS that uses AI to 
          <span className="text-white"> change your behavior</span>, achieving your goals through automated 
          intelligence and proactive nudges.
        </p>

        <div className="flex flex-col md:row gap-4 justify-center">
          <Link href="/dashboard" className="bg-indigo-600 px-10 py-5 rounded-2xl text-xl font-bold hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2">
            Enter the Brain <ArrowRight className="w-6 h-6" />
          </Link>
          <p className="text-slate-500 text-sm mt-4">Free for individuals during beta.</p>
        </div>
      </section>

      {/* Pillars Section */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] hover:bg-white/[0.07] transition-colors">
          <div className="bg-yellow-500/20 p-4 rounded-3xl w-fit mb-8">
            <Zap className="w-8 h-8 text-yellow-500" />
          </div>
          <h3 className="text-2xl font-bold mb-4">The Sorter</h3>
          <p className="text-slate-400 leading-relaxed">
            Stop organizing. Our AI automatically classifies every thought, task, and project 
            you capture, routing them to the right workflow instantly.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] hover:bg-white/[0.07] transition-colors">
          <div className="bg-indigo-500/20 p-4 rounded-3xl w-fit mb-8">
            <Shield className="w-8 h-8 text-indigo-500" />
          </div>
          <h3 className="text-2xl font-bold mb-4">The Bouncer</h3>
          <p className="text-slate-400 leading-relaxed">
            AI isn't perfect. "The Bouncer" detects low-confidence captures and nudges you 
            to clarify them, ensuring your knowledge graph stays high-quality.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] hover:bg-white/[0.07] transition-colors">
          <div className="bg-blue-500/20 p-4 rounded-3xl w-fit mb-8">
            <Network className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold mb-4">Semantic Linking</h3>
          <p className="text-slate-400 leading-relaxed">
            Discover hidden connections. CognitoFlow uses vector embeddings to suggest 
            links between thoughts you didn't even know were related.
          </p>
        </div>

      </section>

      {/* Mobile App Section */}
      <section className="bg-indigo-600 py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
          <div className="flex-1">
            <h2 className="text-5xl font-black mb-8 leading-tight italic">Your brain, <br />in your pocket.</h2>
            <p className="text-indigo-100 text-xl mb-12 leading-relaxed">
              Capture anything via our mobile app. Get proactive "Taps on the Shoulder" 
              when you're veering off track or when projects go stale. 
            </p>
            <div className="flex gap-4">
              <div className="bg-black text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3">
                <Smartphone className="w-6 h-6" />
                Get for iOS
              </div>
              <div className="bg-white/10 text-white px-8 py-4 rounded-2xl font-bold border border-white/20">
                Get for Android
              </div>
            </div>
          </div>
          <div className="flex-1 relative">
             <div className="w-80 h-[600px] bg-slate-900 border-[8px] border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden relative rotate-6">
                <div className="p-8 bg-indigo-600">
                   <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-8" />
                   <div className="text-2xl font-bold">Cognito</div>
                </div>
                <div className="p-6 space-y-4">
                   <div className="h-20 bg-slate-800 rounded-2xl" />
                   <div className="h-20 bg-slate-800 rounded-2xl" />
                   <div className="h-20 bg-indigo-500 rounded-2xl animate-pulse" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 text-center text-slate-500">
        <div className="flex justify-center items-center gap-2 mb-6">
          <BrainCircuit className="w-5 h-5" />
          <span className="font-bold text-white tracking-tight">CognitoFlow</span>
        </div>
        <p>© 2026 CognitoFlow SaaS. Built for the 2026 AI Era.</p>
      </footer>

    </div>
  );
}
