'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import FloatingInbox from "@/components/FloatingInbox";
import { usePathname } from 'next/navigation';
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isPublicPage = pathname === '/' || pathname === '/login';

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-white dark:bg-[#0a0a0a] text-[#37352f] dark:text-gray-200 transition-colors`}
      >
        <Providers>
          <div className="flex h-screen overflow-hidden">
            {!isPublicPage && <Sidebar />}
            <main className={`flex-1 overflow-y-auto relative ${isPublicPage ? 'w-full' : ''}`}>
              {children}
              {!isPublicPage && <FloatingInbox />}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
