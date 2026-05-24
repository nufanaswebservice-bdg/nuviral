'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, Menu, Plus, X, Video, Sparkles, LogOut, Settings, User, CreditCard, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nuviral-production.up.railway.app/api/v1';

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [credits, setCredits] = useState<{ aiCreditsUsed: number; aiCreditsLimit: number; plan: string | null }>({ aiCreditsUsed: 0, aiCreditsLimit: 0, plan: null });

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const res = await axios.get(`${API_URL}/subscription/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data) {
        setCredits({
          aiCreditsUsed: res.data.aiCreditsUsed ?? 0,
          aiCreditsLimit: res.data.aiCreditsLimit ?? 0,
          plan: res.data.plan || null,
        });
      }
    } catch {
      setCredits({ aiCreditsUsed: 0, aiCreditsLimit: 0, plan: null });
    }
  };

  const [notifications, setNotifications] = useState<{ id: number; title: string; message: string; time: string; read: boolean }[]>([]);

  useEffect(() => {
    // Load notifications based on logged-in user
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userName = user.name || user.email?.split('@')[0] || 'User';
      setNotifications([
        { id: 1, title: 'Selamat datang!', message: `Halo ${userName}, akun NuViral kamu sudah aktif`, time: 'Baru saja', read: false },
      ]);
    } catch {
      setNotifications([]);
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="h-16 border-b border-border bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button onClick={onMenuToggle} className="p-2 rounded-lg hover:bg-accent transition md:hidden">
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-64 pl-10 pr-4 py-2 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Billing Credits Badge - Always visible */}
        <button
          onClick={() => router.push('/dashboard/billing')}
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-border hover:border-primary/30 transition"
          title="Lihat billing"
        >
          <Zap className="h-4 w-4 text-primary" />
          <div className="text-left">
            {credits.plan ? (
              <>
                <p className="text-[10px] text-muted-foreground leading-none">{credits.plan} Plan</p>
                <p className="text-xs font-semibold leading-tight">
                  {credits.aiCreditsLimit - credits.aiCreditsUsed} credits tersisa
                </p>
              </>
            ) : (
              <>
                <p className="text-[10px] text-muted-foreground leading-none">Belum Berlangganan</p>
                <p className="text-xs font-semibold leading-tight text-primary">Upgrade →</p>
              </>
            )}
          </div>
        </button>

        {/* Quick Create Button */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setShowCreateMenu(!showCreateMenu); setShowNotifications(false); setShowUserMenu(false); }}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create</span>
          </motion.button>

          {/* Create Dropdown */}
          <AnimatePresence>
            {showCreateMenu && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                className="absolute right-0 top-12 w-56 rounded-xl border border-border bg-white dark:bg-gray-900 shadow-lg p-2 z-50"
              >
                <button
                  onClick={() => { router.push('/dashboard/quick-video'); setShowCreateMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition text-left"
                >
                  <Video className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Generate AI Video</p>
                    <p className="text-[10px] text-muted-foreground">Buat video dari prompt</p>
                  </div>
                </button>
                <button
                  onClick={() => { router.push('/dashboard/quick-video'); setShowCreateMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition text-left"
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">AI Script Generator</p>
                    <p className="text-[10px] text-muted-foreground">Generate script viral</p>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowCreateMenu(false); setShowUserMenu(false); }}
            className="relative p-2 rounded-xl hover:bg-accent transition"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                className="absolute right-0 top-12 w-80 rounded-xl border border-border bg-white dark:bg-gray-900 shadow-lg z-50"
              >
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Notifikasi</h3>
                  <button onClick={markAllRead} className="text-xs text-primary hover:underline">Tandai semua dibaca</button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-sm text-muted-foreground">Belum ada notifikasi</p>
                    </div>
                  ) : notifications.map((notif) => (
                    <div key={notif.id} className={`p-3 border-b border-border last:border-0 hover:bg-accent/50 transition ${!notif.read ? 'bg-primary/5' : ''}`}>
                      <div className="flex items-start gap-2">
                        {!notif.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                        <div className={!notif.read ? '' : 'ml-4'}>
                          <p className="text-sm font-medium">{notif.title}</p>
                          <p className="text-xs text-muted-foreground">{notif.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-border">
                  <button
                    onClick={() => { router.push('/dashboard/settings'); setShowNotifications(false); }}
                    className="w-full text-center text-xs text-primary hover:underline py-1"
                  >
                    Lihat semua notifikasi
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Avatar / Account */}
        <div className="relative">
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowCreateMenu(false); setShowNotifications(false); }}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-accent transition"
          >
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white text-sm font-bold">{(() => { try { const u = JSON.parse(localStorage.getItem('user') || '{}'); return (u.name || u.email || 'U').charAt(0).toUpperCase(); } catch { return 'U'; } })()}</span>
            </div>
          </button>

          {/* User Dropdown */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                className="absolute right-0 top-12 w-56 rounded-xl border border-border bg-white dark:bg-gray-900 shadow-lg p-2 z-50"
              >
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-sm font-semibold">{(() => { try { const u = JSON.parse(localStorage.getItem('user') || '{}'); return u.name || 'User'; } catch { return 'User'; } })()}</p>
                  <p className="text-xs text-muted-foreground">{(() => { try { const u = JSON.parse(localStorage.getItem('user') || '{}'); return u.email || ''; } catch { return ''; } })()}</p>
                </div>
                <button
                  onClick={() => { router.push('/dashboard/settings'); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition text-left"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Profile</span>
                </button>
                <button
                  onClick={() => { router.push('/dashboard/settings'); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition text-left"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Settings</span>
                </button>
                <button
                  onClick={() => { localStorage.removeItem('accessToken'); localStorage.removeItem('user'); router.push('/login'); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition text-left text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Click outside to close */}
      {(showCreateMenu || showNotifications || showUserMenu) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowCreateMenu(false); setShowNotifications(false); setShowUserMenu(false); }} />
      )}
    </header>
  );
}
