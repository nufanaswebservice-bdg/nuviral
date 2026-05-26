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
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Halo, {user?.name || 'Creator'} 👋</h1>
          <p className="text-muted-foreground mt-1">Mulai buat konten viral hari ini.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/dashboard/quick-video')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-medium"
        >
          <Zap className="h-4 w-4" />
          Buka AI Studio
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
            className="p-5 rounded-2xl border border-border bg-card"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            className="p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition text-left"
          >
            <span className="text-2xl mb-2 block">{action.icon}</span>
            <p className="font-semibold text-sm">{action.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
          </motion.button>
        ))}
      </div>

      {/* CTA */}
      <div className="p-8 rounded-2xl border border-dashed border-border text-center">
        <Plus className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <h3 className="font-semibold mb-1">Mulai Buat Konten</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Ketik prompt dalam Bahasa Indonesia. AI akan generate video, gambar, atau brainstorm ide konten.
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/dashboard/quick-video')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-medium"
        >
          <Zap className="h-4 w-4" />
          Buka AI Studio
        </motion.button>
      </div>
    </div>
  );
}
