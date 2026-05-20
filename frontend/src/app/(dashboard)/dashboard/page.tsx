'use client';

import { motion } from 'framer-motion';
import {
  Video,
  Eye,
  TrendingUp,
  Heart,
  Clock,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Play,
} from 'lucide-react';

const stats = [
  {
    label: 'Total Views',
    value: '2.4M',
    change: '+12.5%',
    trend: 'up',
    icon: Eye,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    label: 'Engagement Rate',
    value: '8.7%',
    change: '+3.2%',
    trend: 'up',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
  },
  {
    label: 'Videos Created',
    value: '156',
    change: '+24',
    trend: 'up',
    icon: Video,
    color: 'from-violet-500 to-purple-500',
  },
  {
    label: 'Viral Score',
    value: '87/100',
    change: '+5',
    trend: 'up',
    icon: Zap,
    color: 'from-amber-500 to-orange-500',
  },
];

const recentVideos = [
  { title: '5 AI Tools You Need in 2024', status: 'published', views: '45.2K', platform: 'TikTok' },
  { title: 'How I Made $10K with AI', status: 'rendering', views: '-', platform: 'YouTube' },
  { title: 'Morning Routine for Success', status: 'scheduled', views: '-', platform: 'Instagram' },
  { title: 'Crypto Market Update', status: 'published', views: '12.8K', platform: 'TikTok' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back! 👋</h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your content today.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition"
        >
          <Sparkles className="h-4 w-4" />
          Generate Content
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Videos */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Videos</h2>
            <a href="/dashboard/videos" className="text-sm text-primary hover:underline">View all</a>
          </div>
          <div className="space-y-3">
            {recentVideos.map((video, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-accent/50 transition"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                  <Play className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{video.title}</p>
                  <p className="text-sm text-muted-foreground">{video.platform}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{video.views}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    video.status === 'published' ? 'bg-green-500/10 text-green-500' :
                    video.status === 'rendering' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {video.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 rounded-2xl border border-border bg-card">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition text-left">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Generate Script</p>
                <p className="text-xs text-muted-foreground">AI-powered viral script</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition text-left">
              <Video className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Create Video</p>
                <p className="text-xs text-muted-foreground">Text to video with AI</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition text-left">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Analyze Trends</p>
                <p className="text-xs text-muted-foreground">Find viral opportunities</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition text-left">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Schedule Upload</p>
                <p className="text-xs text-muted-foreground">Best time posting</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* AI Render Progress */}
      <div className="p-6 rounded-2xl border border-border bg-card">
        <h2 className="text-lg font-semibold mb-4">Rendering Queue</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">AI Tools Video #23</span>
                <span className="text-sm text-muted-foreground">78%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '78%' }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full gradient-primary"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Motivation Series #5</span>
                <span className="text-sm text-muted-foreground">34%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '34%' }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
