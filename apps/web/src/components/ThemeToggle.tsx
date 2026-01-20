'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex items-center gap-2.5 px-3 py-1 rounded text-[#5F5E5B] dark:text-gray-400 hover:bg-[#EFEFED] dark:hover:bg-[#1e1e1e] hover:text-[#37352f] dark:hover:text-gray-100 w-full transition-colors min-h-[30px]"
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-[18px] h-[18px] opacity-70" strokeWidth={1.5} />
          <span className="text-sm font-medium">Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="w-[18px] h-[18px] opacity-70" strokeWidth={1.5} />
          <span className="text-sm font-medium">Dark Mode</span>
        </>
      )}
    </button>
  );
}
