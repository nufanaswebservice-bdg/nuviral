'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Video,
  Eye,
  TrendingUp,
  Heart,
  Zap,
  Sparkles,
  Plus,
  Upload,
  Calendar,
  BarChart3,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(u);
    } catch {}
  }, []);

  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Creator';

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Halo, {firstName}! 👋</h1>
          <p className="text-muted-foreground">Mulai buat konten viral hari ini.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/dashboard/quick-video')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-medium"
        >
          <Sparkles className="h-4 w-4" />
          Buat Video AI
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Views', value: '0', icon: Eye, color: 'from-blue-500 to-cyan-500' },
          { label: 'Engagement', value: '0%', icon: Heart, color: 'from-pink-500 to-rose-500' },
          { label: 'Video Dibuat', value: '0', icon: Video, color: 'from-violet-500 to-purple-500' },
          { label: 'Viral Score', value: '-', icon: Zap, color: 'from-amber-500 to-orange-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl border border-border bg-card"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => router.push('/dashboard/quick-video')}
          className="p-5 rounded-2xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition text-left group"
        >
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <Video className="h-5 w-5 text-white" />
          </div>
          <p className="font-semibold">Buat Video AI</p>
          <p className="text-xs text-muted-foreground mt-1">Generate video dari prompt</p>
        </button>

        <button
          onClick={() => router.push('/dashboard/trends')}
          className="p-5 rounded-2xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <p className="font-semibold">Analisis Tren</p>
          <p className="text-xs text-muted-foreground mt-1">Temukan topik viral</p>
        </button>

        <button
          onClick={() => router.push('/dashboard/schedule')}
          className="p-5 rounded-2xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <p className="font-semibold">Jadwal Upload</p>
          <p className="text-xs text-muted-foreground mt-1">Atur waktu posting</p>
        </button>

        <button
          onClick={() => router.push('/dashboard/accounts')}
          className="p-5 rounded-2xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <Upload className="h-5 w-5 text-white" />
          </div>
          <p className="font-semibold">Hubungkan Akun</p>
          <p className="text-xs text-muted-foreground mt-1">TikTok, YouTube, Instagram</p>
        </button>
      </div>

      {/* Empty State - Get Started */}
      <div className="p-8 rounded-2xl border border-dashed border-border bg-card text-center">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
          <Plus className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-lg font-bold mb-2">Mulai Buat Video Pertamamu</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
          Ketik prompt dalam Bahasa Indonesia, AI akan generate video realistis + voiceover otomatis. Siap upload ke TikTok, YouTube, Instagram & Facebook.
        </p>
        <button
          onClick={() => router.push('/dashboard/quick-video')}
          className="px-6 py-3 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition"
        >
          🎬 Buat Video Sekarang
        </button>
      </div>

      {/* How it works */}
      <div className="p-6 rounded-2xl border border-border bg-card">
        <h3 className="font-semibold mb-4">Cara Kerja NuViral AI</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-violet-600">1</span>
            </div>
            <div>
              <p className="text-sm font-medium">Ketik Prompt</p>
              <p className="text-xs text-muted-foreground">Deskripsikan video yang ingin dibuat</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-blue-600">2</span>
            </div>
            <div>
              <p className="text-sm font-medium">AI Generate</p>
              <p className="text-xs text-muted-foreground">Video + voiceover dibuat otomatis</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-emerald-600">3</span>
            </div>
            <div>
              <p className="text-sm font-medium">Upload & Viral</p>
              <p className="text-xs text-muted-foreground">Publish ke semua platform</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
