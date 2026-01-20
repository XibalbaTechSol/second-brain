'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrainCircuit, Mail, Lock, ArrowRight, Github, Sparkles, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import ThemeToggle from '@/components/ThemeToggle';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false
    });

    if (result?.ok) {
      router.push('/dashboard');
    } else {
      alert('Authentication failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 selection:bg-primary/30 relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <div className="absolute top-8 right-8">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-10 relative">
        {/* Logo */}
        <Link href="/" className="flex flex-col items-center gap-4 group">
          <div className="bg-primary p-4 rounded-[2rem] shadow-2xl shadow-primary/20 group-hover:scale-110 transition-all duration-500 border border-primary/20">
            <BrainCircuit className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="text-center">
            <span className="font-black text-4xl text-foreground tracking-tighter italic">CognitoFlow</span>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mt-1 opacity-60">Intelligence Engine</p>
          </div>
        </Link>

        <div className="bg-card border border-border p-10 rounded-[3rem] shadow-2xl shadow-primary/5 backdrop-blur-sm transition-colors">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-foreground tracking-tight italic">Welcome back</h2>
            <p className="text-muted-foreground mt-2 font-medium text-sm">Access your active second brain instance.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Email Identity</label>
              <div className="relative group">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-background border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Access Token</label>
              <div className="relative group">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium shadow-inner"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-black py-5 rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Enter Brain
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-card px-4 text-muted-foreground font-black tracking-[0.3em]">Synaptic Link</span>
            </div>
          </div>

          <button className="w-full bg-muted/50 border border-border text-foreground font-bold py-4 rounded-2xl hover:bg-muted transition-all flex items-center justify-center gap-3 group">
            <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Continue with GitHub
          </button>
        </div>

        <div className="flex flex-col items-center gap-6">
          <p className="text-center text-muted-foreground text-sm font-medium">
            New to CognitoFlow? <Link href="/" className="text-primary hover:underline font-black italic">Start trial</Link>
          </p>
          
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
            <ShieldCheck className="w-3 h-3" />
            End-to-End Encrypted Synapse
          </div>
        </div>
      </div>
    </div>
  );
}