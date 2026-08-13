'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles,
  LayoutDashboard,
  Video,
  Wand2,
  BarChart3,
  Image,
  Settings,
  CreditCard,
  Workflow,
  HelpCircle,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const menuItems = [
  { icon: Wand2, label: 'AI Studio', href: '/dashboard/quick-video' },
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Video, label: 'Videos', href: '/dashboard/videos' },
  { icon: Image, label: 'Media Library', href: '/dashboard/media' },
  { icon: Workflow, label: 'Workflows', href: '/dashboard/workflows' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: CreditCard, label: 'Billing', href: '/dashboard/billing' },
  { icon: HelpCircle, label: 'Help Center', href: '/dashboard/help' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export function Sidebar({ isOpen, onToggle, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen bg-card border-r border-border z-50 flex flex-col
        w-[280px] max-w-[80vw] md:w-64 md:z-30
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}
    >
      {/* Logo */}
      <div className="h-14 md:h-16 flex items-center justify-between px-4 border-b border-border flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
          <Sparkles className="h-6 w-6 text-primary flex-shrink-0" />
          <span className="text-lg font-bold gradient-text">Lumora</span>
        </Link>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-accent transition md:hidden"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto overscroll-contain">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-xl transition-all group relative ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
              <span className="text-sm font-medium truncate">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border flex-shrink-0">
        <div className="px-3 py-2">
          <p className="text-[10px] text-muted-foreground text-center">Lumora © 2024</p>
        </div>
      </div>
    </aside>
  );
}

