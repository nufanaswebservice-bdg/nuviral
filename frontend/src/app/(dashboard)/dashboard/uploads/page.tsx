'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  RefreshCw,
  XCircle,
  Video,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

interface UploadItem {
  id: string;
  title: string;
  platform: string;
  status: 'pending' | 'uploading' | 'published' | 'failed' | 'scheduled' | 'cancelled';
  progress?: number;
  scheduledAt?: string;
  publishedAt?: string;
  error?: string;
  retryCount: number;
  account: string;
}

const uploadQueue: UploadItem[] = [
  { id: '1', title: '5 AI Tools That Will Replace Your Job', platform: 'TikTok', status: 'published', publishedAt: '2 hours ago', retryCount: 0, account: '@viralai_tech' },
  { id: '2', title: '5 AI Tools That Will Replace Your Job', platform: 'YouTube', status: 'published', publishedAt: '2 hours ago', retryCount: 0, account: '@ViralAI' },
  { id: '3', title: 'Morning Routine for Productivity', platform: 'Instagram', status: 'uploading', progress: 67, retryCount: 0, account: '@viralai.daily' },
  { id: '4', title: 'Morning Routine for Productivity', platform: 'TikTok', status: 'pending', retryCount: 0, account: '@viralai_tech' },
  { id: '5', title: 'Crypto Market Update March', platform: 'YouTube', status: 'scheduled', scheduledAt: 'Tomorrow 6:00 PM', retryCount: 0, account: '@ViralAI' },
  { id: '6', title: 'Crypto Market Update March', platform: 'TikTok', status: 'scheduled', scheduledAt: 'Tomorrow 7:00 PM', retryCount: 0, account: '@viralai_tech' },
  { id: '7', title: 'Horror Story: The Red Door', platform: 'TikTok', status: 'failed', error: 'Video exceeds maximum duration', retryCount: 2, account: '@viralai_tech' },
  { id: '8', title: 'Study Tips That Work', platform: 'Instagram', status: 'failed', error: 'Token expired. Please reconnect account.', retryCount: 3, account: '@viralai.daily' },
  { id: '9', title: 'Side Hustle Ideas 2024', platform: 'Facebook', status: 'pending', retryCount: 0, account: '@ViralAI Page' },
  { id: '10', title: 'Motivation Monday #12', platform: 'TikTok', status: 'cancelled', retryCount: 0, account: '@viralai_tech' },
];

const statusConfig: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
  published: { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500/10', label: 'Published' },
  uploading: { icon: Loader2, color: 'text-blue-500', bgColor: 'bg-blue-500/10', label: 'Uploading' },
  pending: { icon: Clock, color: 'text-amber-500', bgColor: 'bg-amber-500/10', label: 'Pending' },
  scheduled: { icon: Clock, color: 'text-violet-500', bgColor: 'bg-violet-500/10', label: 'Scheduled' },
  failed: { icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-500/10', label: 'Failed' },
  cancelled: { icon: XCircle, color: 'text-gray-500', bgColor: 'bg-gray-500/10', label: 'Cancelled' },
};

const platformColors: Record<string, string> = {
  TikTok: 'bg-black text-white',
  YouTube: 'bg-red-500 text-white',
  Instagram: 'bg-pink-500 text-white',
  Facebook: 'bg-blue-500 text-white',
};

export default function UploadsPage() {
  const [filter, setFilter] = useState('all');
  const [queue, setQueue] = useState(uploadQueue);

  const filteredQueue = filter === 'all' ? queue : queue.filter((item) => item.status === filter);

  const stats = {
    total: queue.length,
    published: queue.filter((i) => i.status === 'published').length,
    pending: queue.filter((i) => i.status === 'pending' || i.status === 'uploading').length,
    failed: queue.filter((i) => i.status === 'failed').length,
    scheduled: queue.filter((i) => i.status === 'scheduled').length,
  };

  const handleRetry = (id: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'pending' as const, error: undefined, retryCount: item.retryCount + 1 } : item
      )
    );

    // Simulate upload after retry
    setTimeout(() => {
      setQueue((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: 'uploading' as const, progress: 0 } : item
        )
      );
    }, 500);

    setTimeout(() => {
      setQueue((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: 'uploading' as const, progress: 45 } : item
        )
      );
    }, 1500);

    setTimeout(() => {
      setQueue((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: 'uploading' as const, progress: 80 } : item
        )
      );
    }, 2500);

    setTimeout(() => {
      setQueue((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: 'published' as const, progress: 100, publishedAt: 'Just now' } : item
        )
      );
    }, 3500);
  };

  const handleCancel = (id: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'cancelled' as const } : item
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Upload className="h-6 w-6 text-primary" />
          Upload Queue
        </h1>
        <p className="text-muted-foreground mt-1">Monitor and manage your content uploads across platforms</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Published', value: stats.published, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'In Progress', value: stats.pending, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Scheduled', value: stats.scheduled, color: 'text-violet-500', bg: 'bg-violet-500/10' },
          { label: 'Failed', value: stats.failed, color: 'text-red-500', bg: 'bg-red-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-2xl border border-border bg-card">
            <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
              <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
            </div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {['all', 'published', 'uploading', 'pending', 'scheduled', 'failed', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === f
                ? 'gradient-primary text-white'
                : 'border border-border hover:bg-accent text-muted-foreground'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && (
              <span className="ml-1 opacity-70">
                ({queue.filter((i) => i.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Queue List */}
      <div className="space-y-3">
        {filteredQueue.length === 0 ? (
          <div className="p-12 rounded-2xl border border-dashed border-border text-center">
            <Upload className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No uploads matching this filter</p>
          </div>
        ) : (
          filteredQueue.map((item, index) => {
            const status = statusConfig[item.status];
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-4 rounded-2xl border border-border bg-card hover:border-primary/20 transition"
              >
                <div className="flex items-center gap-4">
                  {/* Video Icon */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                    <Video className="h-5 w-5 text-primary" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{item.title}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${platformColors[item.platform]}`}>
                        {item.platform}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1 text-xs ${status.color}`}>
                        <StatusIcon className={`h-3 w-3 ${item.status === 'uploading' ? 'animate-spin' : ''}`} />
                        {status.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{item.account}</span>
                      {item.publishedAt && (
                        <span className="text-xs text-muted-foreground">• {item.publishedAt}</span>
                      )}
                      {item.scheduledAt && (
                        <span className="text-xs text-violet-500">• {item.scheduledAt}</span>
                      )}
                    </div>

                    {/* Progress bar */}
                    {item.status === 'uploading' && item.progress !== undefined && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden max-w-xs">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            className="h-full rounded-full gradient-primary"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{item.progress}%</span>
                      </div>
                    )}

                    {/* Error message */}
                    {item.status === 'failed' && item.error && (
                      <p className="text-xs text-red-400 mt-1">⚠️ {item.error} (Retry {item.retryCount}/3)</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {item.status === 'failed' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRetry(item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Retry
                      </motion.button>
                    )}
                    {(item.status === 'pending' || item.status === 'scheduled') && (
                      <button
                        onClick={() => handleCancel(item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium hover:bg-red-500/20 transition"
                      >
                        <XCircle className="h-3 w-3" />
                        Cancel
                      </button>
                    )}
                    {item.status === 'published' && (
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 text-xs font-medium hover:bg-green-500/20 transition">
                        <ArrowUpRight className="h-3 w-3" />
                        View
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
