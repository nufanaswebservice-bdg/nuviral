'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Video, Plus, Play, Download, Trash2, Clock, CheckCircle, Film } from 'lucide-react';

interface SavedVideo {
  id: string;
  title: string;
  style: string;
  duration: string;
  format: string;
  voice: string;
  blobUrl?: string;
  blobSize?: number;
  createdAt: string;
  status: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatSize(bytes?: number): string {
  if (!bytes) return '-';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function VideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<SavedVideo[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('nuviral-videos') || '[]');
      setVideos(saved);
    } catch {
      setVideos([]);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Hapus video ini?')) return;
    const updated = videos.filter(v => v.id !== id);
    setVideos(updated);
    localStorage.setItem('nuviral-videos', JSON.stringify(updated));
  };

  const handleDownload = (video: SavedVideo) => {
    if (video.blobUrl) {
      const link = document.createElement('a');
      link.href = video.blobUrl;
      link.download = `nuviral-${video.title.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30)}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const filteredVideos = videos;

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
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
          onClick={() => router.push('/dashboard/quick-video')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-medium"
        >
          <Plus className="h-4 w-4" />
          Create Video
        </motion.button>
      </div>

      {/* Stats */}
      {videos.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-border bg-card">
            <p className="text-2xl font-bold">{videos.length}</p>
            <p className="text-sm text-muted-foreground">Total Video</p>
          </div>
          <div className="p-4 rounded-2xl border border-border bg-card">
            <p className="text-2xl font-bold">{videos.filter(v => v.format === 'portrait').length}</p>
            <p className="text-sm text-muted-foreground">Portrait (9:16)</p>
          </div>
          <div className="p-4 rounded-2xl border border-border bg-card">
            <p className="text-2xl font-bold">{videos.filter(v => v.format === 'landscape').length}</p>
            <p className="text-sm text-muted-foreground">Landscape (16:9)</p>
          </div>
        </div>
      )}

      {/* Video List */}
      {filteredVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border">
          <Video className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-1">Belum ada video</h3>
          <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
            Mulai buat video pertamamu dengan AI Video Studio. Video yang sudah di-render akan muncul di sini.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/dashboard/quick-video')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-medium"
          >
            <Plus className="h-4 w-4" />
            Buat Video Pertama
          </motion.button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition group w-full max-w-full overflow-hidden"
            >
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                <Film className="h-5 w-5 text-primary" />
              </div>

              {/* Info */}
              <div className="flex-1 overflow-hidden" style={{ minWidth: 0 }}>
                <h3 className="font-medium text-sm truncate block w-full">{video.title}</h3>
                <div className="flex items-center gap-2 mt-1 overflow-hidden">
                  <span className="flex items-center gap-1 text-xs text-green-500 whitespace-nowrap">
                    <CheckCircle className="h-3 w-3" />
                    Selesai
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{video.format === 'portrait' ? '9:16' : '16:9'}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{video.duration === 'short' ? '5s' : video.duration === 'long' ? '20s' : '10s'}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{formatSize(video.blobSize)}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(video.createdAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                {video.blobUrl && (
                  <button
                    onClick={() => handleDownload(video)}
                    className="p-2 rounded-lg hover:bg-accent transition"
                    title="Download"
                  >
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(video.id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 transition"
                  title="Hapus"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
