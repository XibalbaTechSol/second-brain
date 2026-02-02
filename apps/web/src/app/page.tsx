'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BrainCircuit, Zap, Shield, Smartphone, ArrowRight, Network, Sparkles, Check, Globe, BarChart3, Lock } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export default function WelcomePage() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 transition-colors duration-300">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-primary p-2.5 rounded-2xl shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
              <BrainCircuit className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="font-black text-3xl tracking-tighter italic text-foreground transition-colors">CognitoFlow</span>
          </div>
          
          <div className="hidden md:flex gap-10 items-center">
            <Link href="/about" className="text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">About</Link>
            <Link href="#features" className="text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Pricing</Link>
            <Link href="#api" className="text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">API</Link>
            <div className="h-6 w-[1px] bg-border" />
            <ThemeToggle />
            {user ? (
              <Link href="/dashboard" className="bg-primary text-primary-foreground px-10 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="bg-primary text-primary-foreground px-10 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full text-primary text-xs font-black uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Sparkles className="w-3.5 h-3.5" />
              The Intelligence Layer for your life
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[0.9] text-foreground transition-colors">
              Your second brain, <br />
              <span className="text-primary italic">actually working.</span>
            </h1>
            
            <p className="text-muted-foreground text-xl md:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed transition-colors">
              Most tools just archive information. CognitoFlow uses Gemini 2.0 to 
              <span className="text-foreground font-bold italic"> analyze, connect, and nudge</span> you 
              toward your goals automatically.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href={user ? "/dashboard" : "/login"} className="w-full sm:w-auto bg-primary text-primary-foreground px-10 py-5 rounded-2xl text-xl font-black hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group">
                {user ? "Enter Brain" : "Start 7-Day Free Trial"} <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium px-6 py-2 border border-border rounded-2xl bg-card/50">
                <Lock className="w-4 h-4" />
                No credit card required
              </div>
            </div>
          </div>
        </div>

        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      </section>

      {/* Trust & Proof Section */}
      <section className="py-12 border-y border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-8">Trusted by knowledge workers at</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale contrast-200">
            <span className="text-2xl font-black italic tracking-tighter">TECHNOVA</span>
            <span className="text-2xl font-black italic tracking-tighter">SOLARIS</span>
            <span className="text-2xl font-black italic tracking-tighter">DATASTREAM</span>
            <span className="text-2xl font-black italic tracking-tighter">BRAINWAVE</span>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              title: "AI Sorter", 
              desc: "Stop tagging and filing. Our reasoning engine understands the intent behind every capture and routes it to the perfect workflow.",
              icon: Zap,
              color: "bg-aurora-yellow/20 text-aurora-yellow"
            },
            { 
              title: "The Bouncer", 
              desc: "Quality control for your mind. CognitoFlow detects vague inputs and nudges you for clarification before they pollute your graph.",
              icon: Shield,
              color: "bg-aurora-purple/20 text-aurora-purple"
            },
            { 
              title: "Behavioral Nudges", 
              desc: "Information is useless without action. Get proactive strategic advice based on your current projects and long-term goals.",
              icon: Network,
              color: "bg-aurora-blue/20 text-aurora-blue"
            }
          ].map((feature, i) => (
            <div key={i} className="bg-card border border-border p-10 rounded-[3rem] hover:border-primary/50 transition-all duration-500 group shadow-sm hover:shadow-xl hover:shadow-primary/5">
              <div className={`p-4 rounded-2xl w-fit mb-8 group-hover:scale-110 transition-transform duration-500 ${feature.color.replace('aurora-', '')}`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed transition-colors">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Tiers Section */}
      <section id="pricing" className="py-32 px-6 bg-card/50 border-y border-border transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 italic tracking-tight text-foreground transition-colors">Pricing for the AI Era</h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">Choose the intelligence level that matches your ambition.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Basic */}
            <div className="bg-background border border-border p-10 rounded-[3.5rem] flex flex-col transition-colors shadow-sm">
              <h3 className="text-sm font-black text-muted-foreground mb-2 uppercase tracking-[0.2em]">Basic</h3>
              <div className="text-5xl font-black mb-8 text-foreground">$19<span className="text-lg text-muted-foreground font-medium">/mo</span></div>
              <ul className="space-y-5 mb-12 flex-1">
                {['AI Classification', 'Basic Automations', '1GB Storage', 'Web Access'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-muted-foreground text-sm font-medium">
                    <Check className="w-5 h-5 text-accent" /> {item}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="w-full bg-muted text-foreground font-bold py-4 rounded-2xl hover:bg-border transition-all text-center">Get Started</Link>
            </div>

            {/* Pro */}
            <div className="bg-primary p-10 rounded-[3.5rem] flex flex-col transform md:-translate-y-6 shadow-2xl shadow-primary/30 relative overflow-hidden text-primary-foreground border-4 border-accent/20">
              <div className="absolute top-6 right-10 bg-accent text-accent-foreground text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-lg">Recommended</div>
              <h3 className="text-sm font-black opacity-80 mb-2 uppercase tracking-[0.2em]">Pro</h3>
              <div className="text-5xl font-black mb-8">$49<span className="text-lg opacity-60 font-medium">/mo</span></div>
              <ul className="space-y-5 mb-12 flex-1">
                {[
                  'Gemini 2.0 Reasoning Engine',
                  'Proactive Behavioral Nudges',
                  'The Bouncer AI Guardian',
                  'Unlimited Workflows',
                  'Semantic Linking'
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm font-bold">
                    <Check className="w-5 h-5 text-primary-foreground" /> {item}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="w-full bg-primary-foreground text-primary font-black py-5 rounded-2xl hover:scale-[1.02] transition-all text-center shadow-2xl">Start 7-Day Trial</Link>
            </div>

            {/* Enterprise */}
            <div className="bg-background border border-border p-10 rounded-[3.5rem] flex flex-col transition-colors shadow-sm">
              <h3 className="text-sm font-black text-muted-foreground mb-2 uppercase tracking-[0.2em]">Enterprise</h3>
              <div className="text-5xl font-black mb-8 text-foreground">$199<span className="text-lg text-muted-foreground font-medium">/mo</span></div>
              <ul className="space-y-5 mb-12 flex-1">
                {['Custom Model Training', 'Team Collaboration', 'Dedicated AI Coach', 'API Access', 'SSO Security'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-muted-foreground text-sm font-medium">
                    <Check className="w-5 h-5 text-accent" /> {item}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="w-full bg-muted text-foreground font-bold py-4 rounded-2xl hover:bg-border transition-all text-center">Contact Sales</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Developer API Section */}
      <section id="api" className="py-32 px-6 max-w-7xl mx-auto transition-colors">
        <div className="bg-card border border-border rounded-[3.5rem] p-12 md:p-20 relative overflow-hidden shadow-2xl shadow-primary/5">
          <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
            <Globe className="w-64 h-64 text-primary" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-8 italic tracking-tight text-foreground transition-colors">Built for <br/>Infrastructure</h2>
              <p className="text-muted-foreground text-lg mb-10 leading-relaxed transition-colors font-medium">
                CognitoFlow isn't just a web app. It's an intelligence layer. Connect your entire ecosystem via our programmatic API.
              </p>
              
              <div className="space-y-6">
                {[
                  { title: "Programmatic Capture", desc: "Inject thoughts and data from CLI tools or scripts." },
                  { title: "Secure Keys", desc: "User-specific infrastructure keys with easy rotation." },
                  { title: "Webhook Ready", desc: "Integrate with any service that supports HTTP POST." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="bg-aurora-green/10 p-1.5 rounded-lg mt-1 shrink-0">
                      <Check className="w-4 h-4 text-aurora-green" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground transition-colors">{item.title}</h4>
                      <p className="text-sm text-muted-foreground transition-colors font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-background rounded-3xl p-8 border border-border shadow-inner group transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-aurora-red/40" />
                  <div className="w-3 h-3 rounded-full bg-aurora-yellow/40" />
                  <div className="w-3 h-3 rounded-full bg-aurora-green/40" />
                </div>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">External Agent Capture</span>
              </div>
              <pre className="bg-transparent text-foreground font-mono text-xs overflow-x-auto leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
{`curl -X POST cognitoflow.ai/api/v1/capture \\
  -H "x-infra-api-key: sb_live_..." \\
  -d '{
    "content": "Analyze the impact of...",
    "source": "Github-Action"
  }'`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-border text-center bg-background transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-center items-center gap-3 mb-8">
            <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20">
              <BrainCircuit className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-black text-xl italic tracking-tighter text-foreground">CognitoFlow</span>
          </div>
          <div className="flex justify-center gap-12 mb-12">
            <Link href="/about" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">About</Link>
            <Link href="#" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">Privacy</Link>
            <Link href="#" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">Terms</Link>
            <Link href="#" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">Twitter</Link>
          </div>
          <p className="text-muted-foreground text-xs font-medium tracking-[0.1em] opacity-50 transition-colors italic">© 2026 COGNITOFLOW SAAS. BUILT FOR THE POST-AI AGE.</p>
        </div>
      </footer>

    </div>
  );
}
