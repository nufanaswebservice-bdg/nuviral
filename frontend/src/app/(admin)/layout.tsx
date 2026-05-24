'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Video, Users, CreditCard, Settings, Shield,
  Upload, BarChart3, Bell, LogOut, Menu, X, ChevronDown,
  Database, Server, Zap, FileVideo, Globe,
} from 'lucide-react';

const ADMIN_EMAILS = ['nufanaswebservice@gmail.com', 'baranashira01@gmail.com', 'rufanaswebservice@gmail.com'];

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
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 ${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900/95 backdrop-blur-xl border-r border-white/5 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-white/5">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold">NuViral</p>
                <p className="text-[10px] text-gray-400">Super Admin</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto">
              <Zap className="h-4 w-4 text-white" />
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition group"
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/5">
          {sidebarOpen && (
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="h-16 border-b border-white/5 bg-gray-900/50 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-6">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-white/5 transition">
            <Menu className="h-5 w-5 text-gray-400" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Super Admin Panel</span>
            <button onClick={() => router.push('/dashboard')} className="text-xs text-violet-400 hover:text-violet-300 transition">
              ← Back to App
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
