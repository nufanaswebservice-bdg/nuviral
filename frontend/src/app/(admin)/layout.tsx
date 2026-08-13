'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Video, Users, CreditCard, Settings, Shield,
  Upload, BarChart3, Bell, LogOut, Menu, X, ChevronDown,
  Database, Server, Zap, FileVideo, Globe, MessageSquare,
} from 'lucide-react';

const ADMIN_EMAILS = ['nufanaswebservice@gmail.com', 'baranashira01@gmail.com', 'rufanaswebservice@gmail.com', 'owner@nuviral.cloud'];

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: FileVideo, label: 'Video Samples', href: '/admin/video-samples' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: CreditCard, label: 'Revenue', href: '/admin/revenue' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: Zap, label: 'AI System', href: '/admin/ai-system' },
  { icon: Database, label: 'Storage', href: '/admin/storage' },
  { icon: Shield, label: 'Security', href: '/admin/security' },
  { icon: Globe, label: 'Content', href: '/admin/content' },
  { icon: MessageSquare, label: 'Support Chat', href: '/admin/support' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(u);
      if (ADMIN_EMAILS.includes(u.email)) {
        setAuthorized(true);
      } else {
        router.push('/dashboard');
      }
    } catch {
      router.push('/login');
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-white text-lg">Access Denied</p>
          <p className="text-gray-400 text-sm mt-1">Super Admin only</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[280px] max-w-[80vw] md:w-64 md:z-30
          bg-gray-900/95 backdrop-blur-xl border-r border-white/5
          transition-transform duration-300 ease-in-out flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="h-14 md:h-16 flex items-center justify-between px-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold">Lumora</p>
              <p className="text-[10px] text-gray-400">Super Admin</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-white/5 transition md:hidden"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto overscroll-contain">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => { if (window.innerWidth < 768) setSidebarOpen(false); }}
                className={`flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg transition ${
                  isActive
                    ? 'bg-violet-500/10 text-violet-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="md:ml-64 flex flex-col min-h-screen transition-all duration-300">
        {/* Top Bar */}
        <header className="h-14 md:h-16 border-b border-white/5 bg-gray-900/50 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-3 md:px-6">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-white/5 transition md:hidden">
              <Menu className="h-5 w-5 text-gray-400" />
            </button>
            <span className="text-xs text-gray-500 hidden md:inline">Super Admin Panel</span>
          </div>
          <button onClick={() => router.push('/dashboard')} className="text-xs text-violet-400 hover:text-violet-300 transition">
            ← Back to App
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 p-3 md:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
