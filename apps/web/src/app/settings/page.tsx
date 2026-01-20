'use client';

import { useSession } from 'next-auth/react';
import { User, Mail, CreditCard, Shield, Bell, Zap, BrainCircuit, Check, Calendar, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';

function CalendarSettings() {
  const { data: session } = useSession();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleConnect = () => {
    // In a real app, this would trigger NextAuth Google login with specific scopes
    alert('This would trigger Google OAuth flow with Calendar permissions.');
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
          <Calendar className="w-5 h-5 text-aurora-orange" /> Calendar Integration
        </h3>
        <div className="bg-aurora-green/10 text-aurora-green text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">Connected</div>
      </div>

      <div className="space-y-8">
        {/* Google Calendar Card */}
        <div className="bg-muted/30 rounded-[2rem] p-8 border border-border flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
            <Globe className="w-32 h-32" />
          </div>
          
          <div className="bg-white dark:bg-background p-6 rounded-[2rem] shadow-xl border border-border">
            <svg viewBox="0 0 24 24" className="w-12 h-12">
              <path fill="#4285F4" d="M22.5 12c0-.8-.1-1.5-.2-2.2H12v4.3h5.9c-.3 1.4-1 2.5-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8.1z"/>
              <path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.7 1.1-2.8 0-5.2-1.9-6.1-4.5H2.3v2.8C4.1 20.2 7.8 23 12 23z"/>
              <path fill="#FBBC05" d="M5.9 14.2c-.2-.7-.3-1.4-.3-2.2s.1-1.5.3-2.2V7H2.3C1.5 8.5 1 10.2 1 12s.5 3.5 1.3 5l3.6-2.8z"/>
              <path fill="#EA4335" d="M12 5.3c1.6 0 3 .5 4.1 1.6l3.1-3.1C17.4 2.1 14.9 1 12 1 7.8 1 4.1 3.8 2.3 7l3.6 2.8c.9-2.6 3.3-4.5 6.1-4.5z"/>
            </svg>
          </div>

          <div className="flex-1 text-center md:text-left relative z-10">
            <h4 className="text-2xl font-black italic tracking-tight mb-2 text-foreground">Google Calendar</h4>
            <p className="text-muted-foreground text-sm font-medium mb-6">Synchronize your behavioral nudges and goals with your primary calendar.</p>
            
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <button 
                onClick={handleConnect}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
              >
                Configure Sync
              </button>
              <button className="bg-muted text-foreground px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-border transition-all border border-border">
                Disconnect
              </button>
            </div>
          </div>
        </div>

        {/* Sync Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-card border border-border rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Auto-Push Nudges</span>
              <div className="w-10 h-5 bg-aurora-green/20 rounded-full relative border border-aurora-green/30">
                <div className="absolute right-1 top-1 w-3 h-3 bg-aurora-green rounded-full shadow-sm" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium italic">New strategic nudges will automatically appear as events.</p>
          </div>

          <div className="p-6 bg-card border border-border rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Behavioral Audits</span>
              <div className="w-10 h-5 bg-muted rounded-full relative border border-border">
                <div className="absolute left-1 top-1 w-3 h-3 bg-muted-foreground rounded-full shadow-sm" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium italic">Schedule weekly audits to review knowledge graph momentum.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfraSettings() {
  const [settings, setSettings] = useState<any>({ infraApiKey: '' });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  const generateKey = async () => {
    setGenerating(true);
    const newKey = `sb_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, infraApiKey: newKey })
      });
      const data = await res.json();
      setSettings(data);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-muted-foreground italic font-medium">Loading infrastructure data...</div>;

  return (
    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-foreground">
        <Globe className="w-5 h-5 text-primary" /> API & Infrastructure
      </h3>

      <div className="space-y-6">
        <div className="p-6 bg-muted/30 rounded-2xl border border-border">
          <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Infrastructure API Key</h4>
          <div className="flex gap-3">
            <div className="flex-1 relative font-mono text-xs">
              <input 
                type="text" 
                readOnly
                value={settings.infraApiKey || 'No key generated'}
                className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none shadow-inner"
              />
            </div>
            <button 
              onClick={generateKey}
              disabled={generating}
              className="bg-primary text-primary-foreground px-6 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-primary/10"
            >
              {generating ? 'Generating...' : (settings.infraApiKey ? 'Regenerate' : 'Generate Key')}
            </button>
          </div>
          <p className="text-[9px] text-muted-foreground mt-4 leading-relaxed tracking-wide uppercase font-bold opacity-60">
            Use this key to programmatically capture data from external scripts, webhooks, or server-side integrations.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold text-foreground ml-1 uppercase tracking-widest opacity-60">Sample Request</h4>
          <pre className="bg-[#2e3440] text-[#d8dee9] p-6 rounded-2xl text-[11px] overflow-x-auto shadow-inner border border-black/20">
{`curl -X POST http://localhost:3000/api/infra/v1/capture \\
  -H "Content-Type: application/json" \\
  -H "x-infra-api-key: \${YOUR_KEY}" \\
  -d '{
    "content": "Programmatic thought from external agent.",
    "source": "CLI-Tool"
  }'`}
          </pre>
        </div>
      </div>
    </div>
  );
}

function SubscriptionTab() {
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/subscription')
      .then(res => res.json())
      .then(data => {
        setSub(data);
        setLoading(false);
      });
  }, []);

  const handleUpgrade = async (tier: string, priceId: string) => {
    setUpgrading(tier);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, priceId })
      });
      const { url, error } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        alert(error || 'Failed to start checkout');
      }
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) return <div className="text-center py-20 text-muted-foreground font-medium italic">Fetching subscription status...</div>;

  return (
    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-foreground">
        <CreditCard className="w-5 h-5 text-primary" /> Current Plan
      </h3>

      <div className="bg-primary rounded-[2rem] p-8 text-primary-foreground relative overflow-hidden mb-8 shadow-xl shadow-primary/20">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <BrainCircuit className="w-32 h-32" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white">{sub.tier}</span>
            {sub.tier === 'FREE' && <span className="text-sm font-medium italic text-white/90">Active Free Trial</span>}
          </div>
          <h4 className="text-3xl font-black mb-2 italic tracking-tight">Cognito {sub.tier === 'FREE' ? 'Pro' : sub.tier}</h4>
          <p className="opacity-80 text-sm mb-6">Full access to behavior-changing AI reasoning engine.</p>
          
          {sub.tier === 'FREE' && (
            <button 
              onClick={() => handleUpgrade('PRO', 'price_mock_pro')}
              disabled={!!upgrading}
              className="bg-white text-primary px-6 py-2.5 rounded-xl font-black text-sm hover:bg-opacity-90 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {upgrading === 'PRO' ? 'Initializing...' : 'Upgrade to Pro ($49/mo)'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4 text-sm text-muted-foreground">
          <h4 className="font-bold text-foreground uppercase text-xs tracking-widest">Why Cognito Pro?</h4>
          <ul className="space-y-3">
            {[
              'Gemini 2.0 Flash Reasoning',
              'Proactive Behavioral Nudges',
              'Unlimited Nodes & Workflows',
              'Semantic Graph Discovery'
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-aurora-green" /> {f}
              </li>
            ))}
          </ul>
        </div>
        
        {sub.tier !== 'FREE' && (
          <div className="bg-muted/30 rounded-2xl p-6 border border-border flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-foreground mb-1 uppercase text-xs tracking-widest opacity-60">Status</h4>
              <p className="text-lg font-black text-foreground uppercase tracking-tighter">{sub.status}</p>
            </div>
            <button className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-aurora-red transition-colors text-left mt-4 underline decoration-2 underline-offset-4">
              Cancel Subscription
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AISettings() {
  const [settings, setSettings] = useState<any>({ geminiApiKey: '', aiProvider: 'GEMINI' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      alert('AI Settings Saved Successfully');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-muted-foreground italic font-medium">Loading synaptic configuration...</div>;

  return (
    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-foreground">
        <Zap className="w-5 h-5 text-primary" /> AI Engine Configuration
      </h3>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">AI Provider</label>
          <select 
            value={settings.aiProvider}
            onChange={(e) => setSettings({ ...settings, aiProvider: e.target.value })}
            className="w-full bg-background border border-border rounded-2xl py-3 px-4 text-foreground font-medium focus:ring-2 focus:ring-primary outline-none transition-all shadow-inner appearance-none"
          >
            <option value="GEMINI">Google Gemini 2.0 (Recommended)</option>
            <option value="OLLAMA">Local Ollama</option>
            <option value="MOCK">Mock AI (No API Key Required)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Gemini API Key</label>
          <div className="relative">
            <Shield className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50" />
            <input 
              type="password" 
              value={settings.geminiApiKey || ''}
              onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
              placeholder="AIzaSy..."
              className="w-full bg-background border border-border rounded-2xl py-3 pl-12 pr-4 text-foreground font-medium focus:ring-2 focus:ring-primary outline-none transition-all shadow-inner"
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 ml-1 italic font-medium">Your key is stored securely and never shared. Get one at <a href="https://aistudio.google.com/" target="_blank" className="text-primary hover:underline">Google AI Studio</a>.</p>
        </div>

        <div className="pt-6 border-t border-border flex justify-end gap-4 items-center">
          {settings.aiProvider === 'OLLAMA' && (
            <span className="text-[10px] font-bold text-aurora-orange uppercase tracking-tighter bg-aurora-orange/10 px-2 py-1 rounded">Ensure Ollama is running locally</span>
          )}
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground px-8 py-2.5 rounded-xl font-black text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
          >
            {saving ? 'Syncing...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('profile');

  const user = session?.user;

  return (
    <div className="max-w-4xl mx-auto p-8 pt-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your brain's configuration and subscription.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-64 flex flex-col gap-1">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'subscription', label: 'Subscription', icon: CreditCard },
            { id: 'calendar', label: 'Calendar', icon: Calendar },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'ai', label: 'AI Configuration', icon: Zap },
            { id: 'api', label: 'API & Infrastructure', icon: Globe },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-foreground">
                  <User className="w-5 h-5 text-primary" /> Public Profile
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-3xl font-bold text-primary border-2 border-primary/20 shadow-inner">
                      {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <button className="bg-background border border-border px-4 py-2 rounded-xl text-sm font-bold hover:bg-muted transition-colors text-foreground">
                        Change Avatar
                      </button>
                      <p className="text-xs text-muted-foreground mt-2">JPG, GIF or PNG. Max size of 800K</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Full Name</label>
                      <input 
                        type="text" 
                        defaultValue={user?.name || ''} 
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none text-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input 
                          type="email" 
                          disabled 
                          defaultValue={user?.email || ''} 
                          className="w-full bg-muted border border-border rounded-xl px-10 py-2.5 text-sm text-muted-foreground cursor-not-allowed opacity-60"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border flex justify-end">
                  <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <SubscriptionTab />
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CalendarSettings />
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <AISettings />
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <InfraSettings />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
