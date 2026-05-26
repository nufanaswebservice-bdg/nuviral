'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  FileVideo, Upload, Plus, Trash2, Edit, Eye, Star, TrendingUp,
  X, Loader2, GripVertical, Play, Pause,
} from 'lucide-react';

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

const CATEGORIES = ['Cinematic', 'Nature', 'Food', 'Motivasi', 'Tech', 'Anime', 'Dark/Horror', 'Product', 'Lifestyle', 'Business'];
const STYLES = ['🎬 Cinematic', '🌿 Nature', '🍜 Food', '💪 Motivasi', '💜 Neon/Cyberpunk', '🎌 Anime', '🌑 Dark', '📦 Product'];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nuviral-production.up.railway.app/api/v1';

// Helper: Generate thumbnail from video file using canvas
function generateThumbnailFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadeddata = () => {
      // Seek to 25% of the video for a more interesting frame
      video.currentTime = Math.min(video.duration * 0.25, 2);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        // Use 9:16 aspect ratio for thumbnail (portrait)
        const targetWidth = 360;
        const targetHeight = 640;
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas not supported')); return; }

        // Calculate crop to fill 9:16
        const videoAspect = video.videoWidth / video.videoHeight;
        const targetAspect = targetWidth / targetHeight;
        let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight;

        if (videoAspect > targetAspect) {
          sw = video.videoHeight * targetAspect;
          sx = (video.videoWidth - sw) / 2;
        } else {
          sh = video.videoWidth / targetAspect;
          sy = (video.videoHeight - sh) / 2;
        }

        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        URL.revokeObjectURL(url);
        resolve(base64);
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Video load failed'));
    };

    setTimeout(() => {
      URL.revokeObjectURL(url);
      reject(new Error('Thumbnail generation timeout'));
    }, 10000);
  });
}

// Helper: Generate thumbnail from video URL (cross-origin, uses crossOrigin attribute)
function generateThumbnailFromUrl(videoUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.src = videoUrl;

    video.onloadeddata = () => {
      video.currentTime = Math.min(video.duration * 0.25, 2);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        const targetWidth = 360;
        const targetHeight = 640;
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }

        const videoAspect = video.videoWidth / video.videoHeight;
        const targetAspect = targetWidth / targetHeight;
        let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight;

        if (videoAspect > targetAspect) {
          sw = video.videoHeight * targetAspect;
          sx = (video.videoWidth - sw) / 2;
        } else {
          sh = video.videoWidth / targetAspect;
          sy = (video.videoHeight - sh) / 2;
        }

        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      } catch {
        resolve(null);
      }
    };

    video.onerror = () => resolve(null);
    setTimeout(() => resolve(null), 15000);
  });
}

export default function VideoSamplesPage() {
  const [samples, setSamples] = useState<VideoSample[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingSample, setEditingSample] = useState<VideoSample | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Cinematic',
    style: '🎬 Cinematic',
    prompt: '',
    featured: false,
    trending: false,
    videoFile: null as File | null,
    thumbnailFile: null as File | null,
    videoPreview: '',
    thumbnailPreview: '',
  });

  useEffect(() => {
    loadSamples();
  }, []);

  const loadSamples = async () => {
    try {
      const token = localStorage.getItem('accessToken') || '';
      const res = await fetch(`${API_URL}/video-samples`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSamples(data);
      }
    } catch {
      setSamples([]);
    }
  };

  const saveSamples = (data: VideoSample[]) => {
    setSamples(data);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setForm(prev => ({ ...prev, videoFile: file, videoPreview: url }));
    } else {
      toast.error('Pilih file video (.mp4)');
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setForm(prev => ({ ...prev, thumbnailFile: file, thumbnailPreview: url }));
    } else {
      toast.error('Pilih file gambar (.jpg, .png)');
    }
  };

  const handleUpload = async () => {
    if (!form.title.trim()) { toast.error('Judul wajib diisi'); return; }
    if (!form.videoFile && !editingSample) { toast.error('Video wajib diupload'); return; }

    setUploading(true);
    setUploadProgress(0);

    try {
      if (form.videoFile) {
        // Convert file to base64 and upload to server (R2)
        setUploadProgress(5);

        // Auto-generate thumbnail from video
        let thumbnailBase64 = '';
        try {
          thumbnailBase64 = await generateThumbnailFromFile(form.videoFile);
          setUploadProgress(15);
        } catch (e) {
          console.log('Thumbnail generation failed, continuing without:', e);
        }

        setUploadProgress(20);
        const reader = new FileReader();
        const fileBase64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(form.videoFile!);
        });

        setUploadProgress(40);

        const res = await fetch(`${API_URL}/admin/upload-video`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}` },
          body: JSON.stringify({
            fileBase64,
            fileName: form.videoFile.name,
            contentType: form.videoFile.type,
            title: form.title,
            description: form.description,
            category: form.category,
            style: form.style,
            prompt: form.prompt,
            featured: form.featured,
            trending: form.trending,
            thumbnailBase64,
          }),
        });

        setUploadProgress(80);

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Upload failed');
        }

        const data = await res.json();
        setUploadProgress(100);
        toast.success('Video sample uploaded!');
        loadSamples();
        resetForm();
      } else if (editingSample) {
        // Update existing sample
        const res = await fetch(`${API_URL}/admin/video-samples/${editingSample.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}` },
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            category: form.category,
            style: form.style,
            prompt: form.prompt,
            featured: form.featured,
            trending: form.trending,
          }),
        });

        if (!res.ok) throw new Error('Update failed');
        toast.success('Video sample updated!');
        loadSamples();
        resetForm();
      }
    } catch (err: any) {
      toast.error(`Gagal: ${err.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus video sample ini?')) return;
    try {
      const token = localStorage.getItem('accessToken') || '';
      await fetch(`${API_URL}/admin/video-samples/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      loadSamples();
      toast.success('Video sample deleted');
    } catch {
      toast.error('Gagal menghapus');
    }
  };

  // Generate thumbnails for all samples that don't have one
  const handleGenerateAllThumbnails = async () => {
    const samplesWithoutThumb = samples.filter(s => !s.thumbnailUrl && s.videoUrl);
    if (samplesWithoutThumb.length === 0) {
      toast.info('Semua video sudah punya thumbnail');
      return;
    }

    toast.info(`Generating thumbnails for ${samplesWithoutThumb.length} videos...`);
    let success = 0;

    for (const sample of samplesWithoutThumb) {
      try {
        // Generate thumbnail from video URL using video element
        const thumbBase64 = await generateThumbnailFromUrl(sample.videoUrl);
        if (!thumbBase64) continue;

        // Upload thumbnail
        const token = localStorage.getItem('accessToken') || '';
        const res = await fetch(`${API_URL}/admin/upload-thumbnail`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            fileBase64: thumbBase64,
            fileName: `thumb-${sample.id}.jpg`,
            contentType: 'image/jpeg',
            sampleId: sample.id,
          }),
        });

        if (res.ok) {
          success++;
        }
      } catch (e) {
        console.log(`Failed to generate thumbnail for ${sample.title}:`, e);
      }
    }

    toast.success(`Generated ${success}/${samplesWithoutThumb.length} thumbnails`);
    loadSamples();
  };

  const handleEdit = (sample: VideoSample) => {
    setEditingSample(sample);
    setForm({
      title: sample.title,
      description: sample.description,
      category: sample.category,
      style: sample.style,
      prompt: sample.prompt,
      featured: sample.featured,
      trending: sample.trending,
      videoFile: null,
      thumbnailFile: null,
      videoPreview: sample.videoUrl,
      thumbnailPreview: sample.thumbnailUrl,
    });
    setShowUpload(true);
  };

  const toggleFeatured = async (id: string) => {
    const sample = samples.find(s => s.id === id);
    if (!sample) return;
    const token = localStorage.getItem('accessToken') || '';
    await fetch(`${API_URL}/admin/video-samples/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ featured: !sample.featured }),
    });
    loadSamples();
  };

  const toggleTrending = async (id: string) => {
    const sample = samples.find(s => s.id === id);
    if (!sample) return;
    const token = localStorage.getItem('accessToken') || '';
    await fetch(`${API_URL}/admin/video-samples/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ trending: !sample.trending }),
    });
    loadSamples();
  };

  const resetForm = () => {
    setForm({ title: '', description: '', category: 'Cinematic', style: '🎬 Cinematic', prompt: '', featured: false, trending: false, videoFile: null, thumbnailFile: null, videoPreview: '', thumbnailPreview: '' });
    setEditingSample(null);
    setShowUpload(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <FileVideo className="h-5 w-5 md:h-6 md:w-6 text-violet-400" />
            Video Samples
          </h1>
          <p className="text-gray-400 text-xs md:text-sm mt-1">Upload dan kelola video sample untuk showcase</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateAllThumbnails}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-gray-300 text-xs font-medium hover:bg-white/5 transition"
            title="Generate thumbnails untuk semua video yang belum punya"
          >
            🖼️ Generate Thumbnails
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { resetForm(); setShowUpload(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium text-sm"
          >
            <Plus className="h-4 w-4" />
            Upload
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-gray-900 border border-white/5">
          <p className="text-2xl font-bold">{samples.length}</p>
          <p className="text-xs text-gray-400">Total Samples</p>
        </div>
        <div className="p-4 rounded-xl bg-gray-900 border border-white/5">
          <p className="text-2xl font-bold text-amber-400">{samples.filter(s => s.featured).length}</p>
          <p className="text-xs text-gray-400">Featured</p>
        </div>
        <div className="p-4 rounded-xl bg-gray-900 border border-white/5">
          <p className="text-2xl font-bold text-emerald-400">{samples.filter(s => s.trending).length}</p>
          <p className="text-xs text-gray-400">Trending</p>
        </div>
        <div className="p-4 rounded-xl bg-gray-900 border border-white/5">
          <p className="text-2xl font-bold text-violet-400">{samples.reduce((a, s) => a + s.views, 0)}</p>
          <p className="text-xs text-gray-400">Total Views</p>
        </div>
      </div>

      {/* Video List */}
      {samples.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-white/10">
          <FileVideo className="h-16 w-16 text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-300">Belum ada video sample</h3>
          <p className="text-sm text-gray-500 mt-1">Upload video pertama untuk ditampilkan di Media Library user</p>
          <button
            onClick={() => setShowUpload(true)}
            className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium text-sm"
          >
            Upload Video Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {samples.map((sample, index) => (
            <motion.div
              key={sample.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-gray-900 border border-white/5 hover:border-white/10 transition group"
            >
              {/* Thumbnail */}
              <div className="w-20 h-14 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0 relative">
                {sample.thumbnailPreview || sample.thumbnailUrl ? (
                  <img src={sample.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="h-5 w-5 text-gray-500" />
                  </div>
                )}
                {sample.featured && (
                  <Star className="absolute top-1 left-1 h-3 w-3 text-amber-400 fill-amber-400" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm truncate">{sample.title}</h4>
                  {sample.trending && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Trending</span>
                  )}
                  {sample.featured && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">Featured</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{sample.category} • {sample.style}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => toggleFeatured(sample.id)} className={`p-2 rounded-lg transition ${sample.featured ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-white/5 text-gray-500'}`} title="Featured">
                  <Star className="h-4 w-4" />
                </button>
                <button onClick={() => toggleTrending(sample.id)} className={`p-2 rounded-lg transition ${sample.trending ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-white/5 text-gray-500'}`} title="Trending">
                  <TrendingUp className="h-4 w-4" />
                </button>
                <button onClick={() => handleEdit(sample)} className="p-2 rounded-lg hover:bg-white/5 text-gray-500 transition" title="Edit">
                  <Edit className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(sample.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl mx-4 p-6 rounded-2xl bg-gray-900 border border-white/10 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">{editingSample ? 'Edit Video Sample' : 'Upload Video Sample'}</h2>
              <button onClick={resetForm} className="p-1 rounded-lg hover:bg-white/5">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Video Upload */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Video File (.mp4) *</label>
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-violet-500/50 transition"
                >
                  {form.videoPreview ? (
                    <video src={form.videoPreview} className="w-full max-h-40 rounded-lg object-contain mx-auto" controls />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Klik atau drag video .mp4 ke sini</p>
                      <p className="text-xs text-gray-600 mt-1">Max 100MB</p>
                    </>
                  )}
                </div>
                <input ref={videoInputRef} type="file" accept="video/mp4,video/*" className="hidden" onChange={handleVideoSelect} />
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Thumbnail (opsional)</label>
                <div
                  onClick={() => thumbInputRef.current?.click()}
                  className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center cursor-pointer hover:border-violet-500/50 transition"
                >
                  {form.thumbnailPreview ? (
                    <img src={form.thumbnailPreview} className="w-32 h-20 rounded-lg object-cover mx-auto" />
                  ) : (
                    <p className="text-sm text-gray-400">Klik untuk upload thumbnail</p>
                  )}
                </div>
                <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailSelect} />
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Judul *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Contoh: Cinematic City Night"
                  className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-white/10 text-white focus:border-violet-500 outline-none transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Deskripsi</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Deskripsi singkat video..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-white/10 text-white focus:border-violet-500 outline-none transition resize-none"
                />
              </div>

              {/* Category & Style */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Kategori</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-white/10 text-white focus:border-violet-500 outline-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Style</label>
                  <select
                    value={form.style}
                    onChange={(e) => setForm(prev => ({ ...prev, style: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-white/10 text-white focus:border-violet-500 outline-none"
                  >
                    {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Prompt */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Prompt yang digunakan</label>
                <textarea
                  value={form.prompt}
                  onChange={(e) => setForm(prev => ({ ...prev, prompt: e.target.value }))}
                  placeholder="Prompt AI yang digunakan untuk generate video ini..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-white/10 text-white focus:border-violet-500 outline-none transition resize-none"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm(prev => ({ ...prev, featured: e.target.checked }))} className="rounded" />
                  <span className="text-sm text-gray-300">⭐ Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.trending} onChange={(e) => setForm(prev => ({ ...prev, trending: e.target.checked }))} className="rounded" />
                  <span className="text-sm text-gray-300">🔥 Trending</span>
                </label>
              </div>

              {/* Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                    <motion.div animate={{ width: `${uploadProgress}%` }} className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600" />
                  </div>
                  <p className="text-xs text-gray-400 text-center">{uploadProgress}% uploading...</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button onClick={resetForm} className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition font-medium text-sm">
                  Batal
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium text-sm hover:opacity-90 transition disabled:opacity-50"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</span>
                  ) : editingSample ? 'Update Sample' : 'Upload Sample'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
