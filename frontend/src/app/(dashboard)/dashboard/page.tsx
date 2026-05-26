'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Video, Eye, TrendingUp, Heart, Zap, Plus } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ videos: 0, views: 0, engagement: 0 });

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(u);
      const videos = JSON.parse(localStorage.getItem('nuviral-videos') || '[]');
      setStats({ videos: videos.length, views: 0, engagement: 0 });
    } catch {}
  }, []);

  return (
    <div className="space-y-4 md:space-y-6 max-w-full overflow-hidden">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold truncate">Halo, {user?.name || 'Creator'} 👋</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Mulai buat konten viral hari ini.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/dashboard/quick-video')}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm w-full sm:w-auto flex-shrink-0"
        >
          <Zap className="h-4 w-4" />
          Buka AI Studio
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {[
          { icon: Eye, label: 'Total Views', value: stats.views, color: 'bg-blue-500' },
          { icon: Heart, label: 'Engagement', value: `${stats.engagement}%`, color: 'bg-pink-500' },
          { icon: Video, label: 'Video Dibuat', value: stats.videos, color: 'bg-violet-500' },
          { icon: TrendingUp, label: 'Viral Score', value: '-', color: 'bg-amber-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-3.5 md:p-5 rounded-xl md:rounded-2xl border border-border bg-card"
          >
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl ${stat.color} flex items-center justify-center mb-2 md:mb-3`}>
              <stat.icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </div>
            <p className="text-lg md:text-2xl font-bold">{stat.value}</p>
            <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {[
          { label: 'Chat AI', desc: 'Brainstorm ide konten', href: '/dashboard/quick-video', icon: '💬' },
          { label: 'Generate Gambar', desc: 'Buat thumbnail & poster', href: '/dashboard/quick-video', icon: '🖼️' },
          { label: 'Buat Video AI', desc: 'Generate video dari prompt', href: '/dashboard/quick-video', icon: '🎬' },
          { label: 'Media Library', desc: 'Lihat video sample', href: '/dashboard/media', icon: '📁' },
        ].map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            onClick={() => router.push(action.href)}
            className="p-3.5 md:p-5 rounded-xl md:rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition text-left"
          >
            <span className="text-xl md:text-2xl mb-1.5 md:mb-2 block">{action.icon}</span>
            <p className="font-semibold text-xs md:text-sm truncate">{action.label}</p>
            <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 line-clamp-2">{action.desc}</p>
          </motion.button>
        ))}
      </div>

      {/* CTA */}
      <div className="p-6 md:p-8 rounded-xl md:rounded-2xl border border-dashed border-border text-center">
        <Plus className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground/30 mx-auto mb-2 md:mb-3" />
        <h3 className="font-semibold text-sm md:text-base mb-1">Mulai Buat Konten</h3>
        <p className="text-xs md:text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
          Ketik prompt dalam Bahasa Indonesia. AI akan generate video, gambar, atau brainstorm ide konten.
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/dashboard/quick-video')}
          className="inline-flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 rounded-xl gradient-primary text-white font-medium text-sm"
        >
          <Zap className="h-4 w-4" />
          Buka AI Studio
        </motion.button>
      </div>
    </div>
  );
}
