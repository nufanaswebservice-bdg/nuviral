'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Video, Plus, Download, Trash2, Play, X } from 'lucide-react';

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
  if (diffMin < 60) return `${diffMin}m lalu`;
  if (diffHour < 24) return `${diffHour}j lalu`;
  if (diffDay < 7) return `${diffDay}h lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function formatSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function VideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<SavedVideo[]>([]);
  const [playingVideo, setPlayingVideo] = useState<SavedVideo | null>(null);

  useEffect(() => {
    try { setVideos(JSON.parse(localStorage.getItem('nuviral-videos') || '[]')); } catch { setVideos([]); }
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm('Hapus video ini?')) return;
    const updated = videos.filter(v => v.id !== id);
    setVideos(updated);
    localStorage.setItem('nuviral-videos', JSON.stringify(updated));
  };

  const handleDownload = (video: SavedVideo) => {
    if (!video.blobUrl) return;
    const link = document.createElement('a');
    link.href = video.blobUrl;
    link.download = `nuviral-video.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Video className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
              My Videos
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Video yang sudah kamu buat</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/dashboard/quick-video')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm w-full sm:w-auto flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
            Buat Video
          </motion.button>
        </div>

        {/* Video Grid */}
        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 md:py-20 rounded-xl md:rounded-2xl border border-dashed border-border">
            <Video className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground/30 mb-3 md:mb-4" />
            <h3 className="text-base md:text-lg font-semibold mb-1">Belum ada video</h3>
            <p className="text-xs md:text-sm text-muted-foreground mb-6 text-center max-w-sm px-4">
              Mulai buat video pertamamu dengan AI Studio.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/dashboard/quick-video')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-medium"
            >
              <Plus className="h-4 w-4" /> Buat Video
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-md transition group"
              >
                {/* Video Thumbnail / Player */}
                <div
                  className={`relative bg-black cursor-pointer ${video.format === 'portrait' ? 'aspect-[9/16]' : 'aspect-video'}`}
                  onClick={() => setPlayingVideo(video)}
                >
                  {video.blobUrl ? (
                    <video
                      src={video.blobUrl}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <Video className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}

                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <Play className="h-5 w-5 text-primary ml-0.5" />
                    </div>
                  </div>

                  {/* Duration badge */}
                  <span className="absolute bottom-2 right-2 text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                    {video.duration === 'short' ? '5s' : video.duration === 'long' ? '20s' : '10s'}
                  </span>

                  {/* Format badge */}
                  <span className="absolute top-2 left-2 text-[10px] bg-primary/80 text-white px-1.5 py-0.5 rounded">
                    {video.format === 'portrait' ? '9:16' : '16:9'}
                  </span>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-sm font-medium line-clamp-2 leading-tight mb-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {video.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">{formatDate(video.createdAt)}</span>
                    <div className="flex items-center gap-1">
                      {video.blobUrl && (
                        <button onClick={(e) => { e.stopPropagation(); handleDownload(video); }} className="p-1.5 rounded-lg hover:bg-accent transition" title="Download">
                          <Download className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(video.id); }} className="p-1.5 rounded-lg hover:bg-destructive/10 transition" title="Hapus">
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setPlayingVideo(null)}>
          <div className="w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="rounded-2xl overflow-hidden bg-black shadow-2xl">
              <video
                src={playingVideo.blobUrl}
                controls
                autoPlay
                className={`w-full ${playingVideo.format === 'portrait' ? 'aspect-[9/16] max-h-[75vh]' : 'aspect-video'} object-contain`}
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-white text-sm font-medium truncate flex-1 mr-3">{playingVideo.title}</p>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleDownload(playingVideo)} className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20 transition">
                  Download
                </button>
                <button onClick={() => setPlayingVideo(null)} className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20 transition">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}