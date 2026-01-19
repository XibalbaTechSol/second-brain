'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Inbox, Zap, Network, Settings, BrainCircuit, Receipt, Database } from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Knowledge', icon: Network, href: '/brain' },
  { name: 'Automation', icon: Zap, href: '/automation' },
  { name: 'Databases', icon: Database, href: '/databases' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-20 lg:w-64 bg-slate-900 h-screen flex flex-col border-r border-slate-800 transition-all">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-xl">
          <BrainCircuit className="w-6 h-6 text-white" />
        </div>
        <span className="font-bold text-white text-xl hidden lg:block tracking-tight">Cognito</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              <span className="font-medium hidden lg:block">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <button className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white w-full transition-all">
          <Settings className="w-5 h-5" />
          <span className="font-medium hidden lg:block">Settings</span>
        </button>
      </div>
    </div>
  );
}
