'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Inbox, Zap, Database, Users, FolderKanban, Lightbulb, Building, BrainCircuit, Settings, LogOut, Clock } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'SB-INBOX', icon: Inbox, href: '/databases/inbox' },
  { name: 'Projects', icon: FolderKanban, href: '/databases/projects' },
  { name: 'People', icon: Users, href: '/databases/people' },
  { name: 'Ideas', icon: Lightbulb, href: '/databases/ideas' },
  { name: 'Admin', icon: Building, href: '/databases/admin' },
  { name: 'Automation', icon: Zap, href: '/automation' },
  { name: 'All Data', icon: Database, href: '/databases' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userInitial = session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || '?';

  return (
    <div className="w-60 bg-[#F7F7F5] dark:bg-[#121212] h-screen flex flex-col border-r border-[#E9E9E7] dark:border-[#1e1e1e] transition-all group/sidebar">
      {/* Header / User Profile */}
      <div className="p-3 mb-1">
        <Link href="/settings" className="flex items-center gap-2 px-3 py-1 rounded hover:bg-[#EFEFED] dark:hover:bg-[#1e1e1e] cursor-pointer transition-colors duration-200">
          <div className="w-5 h-5 bg-[#E3E2E0] dark:bg-[#2a2a2a] flex items-center justify-center rounded text-xs font-semibold text-[#37352f] dark:text-gray-200">
            {userInitial}
          </div>
          <span className="font-medium text-sm text-[#37352f] dark:text-gray-200 truncate flex-1">
            {session?.user?.name || session?.user?.email?.split('@')[0]}
          </span>
        </Link>
        
        {/* Trial Status Badge */}
        <div className="mx-3 mt-2 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 rounded-lg flex items-center gap-1.5 shadow-sm">
          <Clock className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
          <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase">7 Days Left in Trial</span>
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
                ? 'bg-[#EFEFED] dark:bg-[#1e1e1e] text-[#37352f] dark:text-white font-medium'
                : 'text-[#5F5E5B] dark:text-gray-400 hover:bg-[#EFEFED] dark:hover:bg-[#1e1e1e] hover:text-[#37352f] dark:hover:text-gray-200'
                }`}
            >
              <item.icon className={`w-[18px] h-[18px] opacity-70 ${isActive ? 'text-[#37352f] dark:text-white opacity-100' : ''}`} strokeWidth={1.5} />
              <span className="text-sm truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-[#E9E9E7] dark:border-[#1e1e1e] space-y-[2px]">
        <ThemeToggle />
        <Link 
          href="/settings"
          className="flex items-center gap-2.5 px-3 py-1 rounded text-[#5F5E5B] dark:text-gray-400 hover:bg-[#EFEFED] dark:hover:bg-[#1e1e1e] hover:text-[#37352f] dark:hover:text-gray-200 w-full transition-colors min-h-[30px]"
        >
          <Settings className="w-[18px] h-[18px] opacity-70" strokeWidth={1.5} />
          <span className="text-sm font-medium">Settings</span>
        </Link>
        <button 
          onClick={() => signOut()}
          className="flex items-center gap-2.5 px-3 py-1 rounded text-[#5F5E5B] dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 w-full transition-colors min-h-[30px]"
        >
          <LogOut className="w-[18px] h-[18px] opacity-70" strokeWidth={1.5} />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
}
