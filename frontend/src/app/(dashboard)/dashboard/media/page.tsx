'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image, Video, Play, X } from 'lucide-react';

interface VideoSample {
  id: string;
  title: string;
  description: string;
  category: string;
  style: string;
  videoUrl: string;
  thumbnailUrl: string;
  prompt: string;
  featured: boolean;
  trending: boolean;
  views: number;
  createdAt: string;
}

export default function MediaPage() {
  const [samples, setSamples] = useState<VideoSample[]>([]);
  const [playingVideo, setPlayingVideo] = useState<VideoSample | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Load video samples from server API
    const fetchSamples = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nuviral-production.up.railway.app/api/v1';
        const res = await fetch(`${API_URL}/video-samples`);
        if (res.ok) {
          const data = await res.json();
          setSamples(data);
        }
      } catch {
        setSamples([]);
      }
    };
    fetchSamples();
  }, []);

  const filteredSamples = filter === 'all'
    ? samples
    : filter === 'featured'
    ? samples.filter(s => s.featured)
    : filter === 'trending'
    ? samples.filter(s => s.trending)
    : samples.filter(s => s.category.toLowerCase() === filter.toLowerCase());

  const categories = [...new Set(samples.map(s => s.category))];

  return (
    <div className="space-y-4 md:space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <Image className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
          Media Library
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Video AI showcase — dibuat dengan NuViral</p>
      </div>

      {/* Filters */}
      {samples.length > 0 && (
        <div className="flex gap-2 flex-wrap overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap flex-shrink-0 ${filter === 'all' ? 'gradient-primary text-white' : 'border border-border hover:bg-accent text-muted-foreground'}`}
          >
            Semua ({samples.length})
          </button>
          <button
            onClick={() => setFilter('featured')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap flex-shrink-0 ${filter === 'featured' ? 'gradient-primary text-white' : 'border border-border hover:bg-accent text-muted-foreground'}`}
          >
            ⭐ Featured ({samples.filter(s => s.featured).length})
          </button>
          <button
            onClick={() => setFilter('trending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap flex-shrink-0 ${filter === 'trending' ? 'gradient-primary text-white' : 'border border-border hover:bg-accent text-muted-foreground'}`}
          >
            🔥 Trending ({samples.filter(s => s.trending).length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap flex-shrink-0 ${filter === cat ? 'gradient-primary text-white' : 'border border-border hover:bg-accent text-muted-foreground'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Video Grid */}
      {filteredSamples.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border">
          <Video className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-1">Belum ada video sample</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Video sample akan ditampilkan di sini setelah admin mengupload melalui Super Admin Dashboard.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {filteredSamples.map((sample, index) => (
            <motion.div
              key={sample.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setPlayingVideo(sample)}
              className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-lg transition cursor-pointer"
            >
              {/* Video Thumbnail */}
              <div className="aspect-[9/16] relative overflow-hidden bg-gradient-to-br from-violet-600/20 via-purple-700/30 to-indigo-800/40">
                {sample.thumbnailUrl ? (
                  <img src={sample.thumbnailUrl} alt={sample.title} className="w-full h-full object-cover" loading="lazy" />
                ) : sample.videoUrl ? (
                  <video
                    src={sample.videoUrl}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                    onLoadedData={(e) => {
                      // Seek to 1s for a better frame
                      const vid = e.currentTarget;
                      if (vid.duration > 1) vid.currentTime = 1;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <Play className="h-8 w-8 text-white/50 mb-1" />
                    <span className="text-[10px] text-white/40">No video</span>
                  </div>
                )}

                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <Play className="h-5 w-5 text-primary ml-0.5" />
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="text-[9px] bg-primary/90 text-white px-1.5 py-0.5 rounded font-medium">AI Generated</span>
                </div>
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {sample.featured && <span className="text-[9px] bg-amber-500/90 text-white px-1.5 py-0.5 rounded">⭐</span>}
                  {sample.trending && <span className="text-[9px] bg-emerald-500/90 text-white px-1.5 py-0.5 rounded">🔥</span>}
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <h4 className="text-sm font-medium truncate">{sample.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{sample.style}</p>
                {sample.prompt && (
                  <p className="text-[10px] text-muted-foreground/70 mt-1 line-clamp-2">Prompt: {sample.prompt}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      {playingVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setPlayingVideo(null)}
        >
          <div className="w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="rounded-2xl overflow-hidden bg-black shadow-2xl">
              <video
                src={playingVideo.videoUrl}
                controls
                autoPlay
                className="w-full aspect-[9/16] max-h-[80vh] object-contain"
              />
            </div>
            <div className="mt-3 text-center">
              <p className="text-white font-medium">{playingVideo.title}</p>
              <p className="text-white/60 text-sm mt-1">{playingVideo.description}</p>
              {playingVideo.prompt && (
                <p className="text-white/40 text-xs mt-2 italic">Prompt: "{playingVideo.prompt}"</p>
              )}
              <button
                onClick={() => setPlayingVideo(null)}
                className="mt-4 px-5 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
