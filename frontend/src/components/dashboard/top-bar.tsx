'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, Menu, Plus, X, Video, Sparkles, LogOut, Settings, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const notifications = [
    { id: 1, title: 'Video berhasil di-render', message: 'Video "Sate Kambing" siap download', time: '2 menit lalu', read: false },
    { id: 2, title: 'Upload selesai', message: 'Video berhasil diupload ke TikTok', time: '1 jam lalu', read: false },
    { id: 3, title: 'Selamat datang!', message: 'Akun NuViral kamu sudah aktif', time: '1 hari lalu', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

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
                  <button className="text-xs text-primary hover:underline">Tandai semua dibaca</button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map((notif) => (
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
              <span className="text-white text-sm font-bold">U</span>
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
                  <p className="text-sm font-semibold">Demo User</p>
                  <p className="text-xs text-muted-foreground">demo@viralai.com</p>
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
                  onClick={() => { router.push('/login'); setShowUserMenu(false); }}
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
