'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BrainCircuit, Target, Lightbulb, Zap, ArrowRight, ShieldCheck, Heart, Users } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export default function AboutPage() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-primary p-2.5 rounded-2xl shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
              <BrainCircuit className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="font-black text-3xl tracking-tighter italic text-foreground">CognitoFlow</span>
          </Link>
          
          <div className="hidden md:flex gap-12 items-center">
            <Link href="/" className="text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Home</Link>
            <Link href="/#features" className="text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Features</Link>
            <Link href="/#pricing" className="text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Pricing</Link>
            <Link href="/#api" className="text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">API</Link>
            <div className="h-6 w-[1px] bg-border" />
            <ThemeToggle />
            {user ? (
              <Link href="/dashboard" className="bg-primary text-primary-foreground px-10 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-xl shadow-primary/20">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="bg-primary text-primary-foreground px-10 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-xl shadow-primary/20">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1] italic">
          We believe notes <br/> 
          <span className="text-primary not-italic tracking-normal">should have a pulse.</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium">
          CognitoFlow was born out of a simple frustration: our digital tools were getting smarter, but our behaviors weren't changing.
        </p>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 px-6 bg-card/30 border-y border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-aurora-purple/10 border border-aurora-purple/20 px-4 py-1.5 rounded-full text-aurora-purple text-xs font-black uppercase tracking-widest">
              The Philosophy
            </div>
            <h2 className="text-4xl font-black italic tracking-tight">From Passive Archives to Active Synapses</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              The "Second Brain" movement revolutionized how we save information, but it created a new problem: **The Digital Graveyard.** We save thousands of links, snippets, and ideas that we never look at again.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              CognitoFlow isn't just a place to store data. It's a reasoning engine designed to **nudge you toward your goals.** We use Gemini 2.0 to analyze your momentum, challenge your assumptions, and ensure your saved knowledge actually influences your daily actions.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background border border-border p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center group hover:border-primary/50 transition-all">
              <Target className="w-8 h-8 text-aurora-red mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-black text-xs uppercase tracking-widest mb-2">Intent</h4>
              <p className="text-[10px] text-muted-foreground font-bold">Extracting the 'Why' behind every note.</p>
            </div>
            <div className="bg-background border border-border p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center group hover:border-primary/50 transition-all mt-8">
              <Zap className="w-8 h-8 text-aurora-yellow mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-black text-xs uppercase tracking-widest mb-2">Action</h4>
              <p className="text-[10px] text-muted-foreground font-bold">Turning passive data into physical steps.</p>
            </div>
            <div className="bg-background border border-border p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center group hover:border-primary/50 transition-all">
              <BrainCircuit className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-black text-xs uppercase tracking-widest mb-2">Reasoning</h4>
              <p className="text-[10px] text-muted-foreground font-bold">AI that thinks with you, not for you.</p>
            </div>
            <div className="bg-background border border-border p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center group hover:border-primary/50 transition-all mt-8">
              <Lightbulb className="w-8 h-8 text-aurora-green mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-black text-xs uppercase tracking-widest mb-2">Growth</h4>
              <p className="text-[10px] text-muted-foreground font-bold">Measurable momentum across all projects.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black italic tracking-tight mb-4">Our Core Values</h2>
          <p className="text-muted-foreground max-w-xl mx-auto font-medium">Built for the thinkers, the builders, and the behavior-changers.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-2xl w-fit">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter">Privacy First</h3>
            <p className="text-muted-foreground leading-relaxed text-sm font-medium">
              Your thoughts are yours. We encrypt your data end-to-end and only use AI reasoning to serve your specific goals. We never sell or train public models on your data.
            </p>
          </div>
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-2xl w-fit">
              <Users className="w-6 h-6 text-aurora-orange" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter">Human-Centric</h3>
            <p className="text-muted-foreground leading-relaxed text-sm font-medium">
              AI shouldn't replace your thinking—it should enhance it. We build tools that keep you in the driver's seat, providing the 'synaptic spark' you need to keep moving.
            </p>
          </div>
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-2xl w-fit">
              <Heart className="w-6 h-6 text-aurora-red" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter">Radical Simplicity</h3>
            <p className="text-muted-foreground leading-relaxed text-sm font-medium">
              The best interface is the one that disappears. We minimize friction in capture and organization so you can focus on what actually matters: execution.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-primary rounded-[3rem] p-12 md:p-20 text-center text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--accent)_0%,_transparent_70%)] opacity-10" />
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tight mb-8 relative z-10">Ready to build an <br/> active brain?</h2>
          <Link href="/login" className="inline-flex items-center gap-3 bg-primary-foreground text-primary px-12 py-5 rounded-2xl text-xl font-black hover:scale-105 transition-all shadow-2xl relative z-10 uppercase tracking-widest">
            Join the beta <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-border text-center bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-center items-center gap-3 mb-8 text-foreground">
            <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20">
              <BrainCircuit className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-black text-xl italic tracking-tighter">CognitoFlow</span>
          </div>
          <p className="text-muted-foreground text-[10px] font-black tracking-[0.3em] uppercase opacity-50 transition-colors">© 2026 COGNITOFLOW SAAS. BUILT FOR THE POST-AI AGE.</p>
        </div>
      </footer>

    </div>
  );
}
