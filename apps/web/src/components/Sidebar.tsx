'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Inbox, Zap, Database, Users, FolderKanban, Lightbulb, Building, BrainCircuit, Settings, LogOut, Clock, Calendar } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'SB-INBOX', icon: Inbox, href: '/databases/inbox' },
  { name: 'Calendar', icon: Calendar, href: '/calendar' },
  { name: 'Projects', icon: FolderKanban, href: '/databases/projects' },
  { name: 'People', icon: Users, href: '/databases/people' },
  { name: 'Ideas', icon: Lightbulb, href: '/databases/ideas' },
  { name: 'Admin', icon: Building, href: '/databases/admin' },
  { name: 'Automation', icon: Zap, href: '/automation' },
  { name: 'All Data', icon: Database, href: '/databases' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const userInitial = user?.email?.[0]?.toUpperCase() || '?';
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0];

  return (
    <div className="w-60 bg-card dark:bg-background h-screen flex flex-col border-r border-border transition-all group/sidebar">
      {/* Header / User Profile */}
      <div className="p-3 mb-1">
        <Link href="/settings" className="flex items-center gap-2 px-3 py-1 rounded hover:bg-muted cursor-pointer transition-colors duration-200">
          <div className="w-5 h-5 bg-muted flex items-center justify-center rounded text-xs font-semibold text-foreground">
            {userInitial}
          </div>
          <span className="font-medium text-sm text-foreground truncate flex-1">
            {userName}
          </span>
        </Link>
        
        {/* Trial Status Badge */}
        <div className="mx-3 mt-2 px-2 py-1 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-1.5 shadow-sm">
          <Clock className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-bold text-primary uppercase">7 Days Left in Trial</span>
        </div>
      </div>

      <nav className="flex-1 px-2 space-y-[2px]">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-1 rounded min-h-[30px] transition-colors duration-100 ${isActive
                ? 'bg-muted text-foreground font-bold'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
            >
              <item.icon className={`w-[18px] h-[18px] opacity-70 ${isActive ? 'text-primary opacity-100' : ''}`} strokeWidth={1.5} />
              <span className="text-sm truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border space-y-[2px]">
        <ThemeToggle />
        <Link 
          href="/settings"
          className="flex items-center gap-2.5 px-3 py-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-colors min-h-[30px]"
        >
          <Settings className="w-[18px] h-[18px] opacity-70" strokeWidth={1.5} />
          <span className="text-sm font-medium">Settings</span>
        </Link>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-3 py-1 rounded text-muted-foreground hover:bg-aurora-red/10 hover:text-aurora-red w-full transition-colors min-h-[30px]"
        >
          <LogOut className="w-[18px] h-[18px] opacity-70" strokeWidth={1.5} />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
}
