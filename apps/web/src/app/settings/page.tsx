'use client';

import { useSession } from 'next-auth/react';
import { User, Mail, CreditCard, Shield, Bell, Zap, BrainCircuit, Check } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('profile');

  const user = session?.user;

  return (
    <div className="max-w-4xl mx-auto p-8 pt-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your brain's configuration and subscription.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-64 flex flex-col gap-1">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'subscription', label: 'Subscription', icon: CreditCard },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'ai', label: 'AI Configuration', icon: Zap },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:text-gray-900 dark:hover:text-white'
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
              <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                  <User className="w-5 h-5 text-indigo-500" /> Public Profile
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center text-3xl font-bold text-indigo-600 dark:text-indigo-400 border-2 border-indigo-50 dark:border-indigo-900/20 shadow-inner">
                      {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <button className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-black transition-colors text-gray-900 dark:text-white">
                        Change Avatar
                      </button>
                      <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1">Full Name</label>
                      <input 
                        type="text" 
                        defaultValue={user?.name || ''} 
                        className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="email" 
                          disabled 
                          defaultValue={user?.email || ''} 
                          className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl px-10 py-2.5 text-sm text-gray-500 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                  <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                  <CreditCard className="w-5 h-5 text-indigo-500" /> Current Plan
                </h3>

                <div className="bg-indigo-600 rounded-[2rem] p-8 text-white relative overflow-hidden mb-8 shadow-xl shadow-indigo-600/20">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <BrainCircuit className="w-32 h-32" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Free Trial</span>
                      <span className="text-sm font-medium">Expires in 7 days</span>
                    </div>
                    <h4 className="text-3xl font-black mb-2 italic tracking-tight">Cognito Pro</h4>
                    <p className="text-indigo-100 text-sm mb-6">Full access to behavior-changing AI reasoning engine.</p>
                    
                    <button className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-black text-sm hover:bg-indigo-50 transition-all shadow-lg">
                      Upgrade to Annual ($490/yr)
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white ml-1">Plan Features:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Gemini 2.0 Flash Reasoning',
                      'Proactive Behavioral Nudges',
                      'Unlimited Nodes & Workflows',
                      'Semantic Graph Discovery',
                      'Multi-Device Sync',
                      'Priority Support'
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-[#1a1a1a] p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <Check className="w-4 h-4 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm text-center py-20 text-gray-400">
                <Zap className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>AI Engine Configuration will be available soon.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
