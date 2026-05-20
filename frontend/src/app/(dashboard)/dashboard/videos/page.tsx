'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Plus, Play, Download, Trash2, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const videos = [
  { id: '1', title: '5 AI Tools That Will Replace Your Job', status: 'completed', duration: '0:32', views: '45.2K', date: '2 hours ago', progress: 100 },
  { id: '2', title: 'Morning Routine for Productivity', status: 'rendering', duration: '0:28', views: '-', date: '30 min ago', progress: 67 },
  { id: '3', title: 'Crypto Market Analysis March 2024', status: 'completed', duration: '0:45', views: '12.8K', date: '1 day ago', progress: 100 },
  { id: '4', title: 'How I Made $10K with Affiliate Marketing', status: 'queued', duration: '0:38', views: '-', date: '5 min ago', progress: 0 },
  { id: '5', title: 'Study Tips That Actually Work', status: 'completed', duration: '0:25', views: '89.1K', date: '3 days ago', progress: 100 },
  { id: '6', title: 'Horror Story: The Abandoned House', status: 'failed', duration: '0:55', views: '-', date: '1 hour ago', progress: 45 },
];

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  completed: { icon: CheckCircle, color: 'text-green-500', label: 'Completed' },
  rendering: { icon: Loader2, color: 'text-amber-500', label: 'Rendering' },
  queued: { icon: Clock, color: 'text-blue-500', label: 'Queued' },
  failed: { icon: AlertCircle, color: 'text-red-500', label: 'Failed' },
};

export default function VideosPage() {
  const [filter, setFilter] = useState('all');

  const filteredVideos = filter === 'all' ? videos : videos.filter((v) => v.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" />
            My Videos
          </h1>
          <p className="text-muted-foreground mt-1">Manage your generated videos</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-medium"
        >
          <Plus className="h-4 w-4" />
          Create Video
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'completed', 'rendering', 'queued', 'failed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f
                ? 'gradient-primary text-white'
                : 'border border-border hover:bg-accent text-muted-foreground'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="grid gap-4">
        {filteredVideos.map((video, index) => {
          const status = statusConfig[video.status];
          const StatusIcon = status.icon;

          return (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/30 transition group"
            >
              {/* Thumbnail */}
              <div className="w-20 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                <Play className="h-6 w-6 text-primary" />
                <span className="absolute bottom-1 right-1 text-[10px] bg-black/70 text-white px-1 rounded">
                  {video.duration}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{video.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`flex items-center gap-1 text-xs ${status.color}`}>
                    <StatusIcon className={`h-3 w-3 ${video.status === 'rendering' ? 'animate-spin' : ''}`} />
                    {status.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{video.date}</span>
                  {video.views !== '-' && (
                    <span className="text-xs text-muted-foreground">{video.views} views</span>
                  )}
                </div>

                {/* Progress bar for rendering */}
                {video.status === 'rendering' && (
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden w-48">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${video.progress}%` }}
                      className="h-full rounded-full gradient-primary"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                {video.status === 'completed' && (
                  <>
                    <button className="p-2 rounded-lg hover:bg-accent transition" title="Download">
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-accent transition" title="Play">
                      <Play className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </>
                )}
                <button className="p-2 rounded-lg hover:bg-destructive/10 transition" title="Delete">
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
