'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Image,
  Video,
  Music,
  Upload,
  FolderPlus,
  Grid3X3,
  List,
  Search,
  Trash2,
  Download,
  MoreVertical,
  File,
  Folder,
  ChevronRight,
  X,
  Plus,
} from 'lucide-react';

interface MediaAsset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'other';
  size: string;
  thumbnail?: string;
  duration?: string;
  uploadedAt: string;
  folder?: string;
}

interface MediaFolder {
  id: string;
  name: string;
  itemCount: number;
}

const folders: MediaFolder[] = [
  { id: '1', name: 'B-Roll Footage', itemCount: 24 },
  { id: '2', name: 'Background Music', itemCount: 18 },
  { id: '3', name: 'Thumbnails', itemCount: 32 },
  { id: '4', name: 'Sound Effects', itemCount: 45 },
  { id: '5', name: 'Brand Assets', itemCount: 8 },
];

// AI Video Showcase samples (public stock videos representing AI-generated quality)
const videoShowcase = [
  {
    id: 'showcase-1',
    title: 'Cinematic City Night',
    description: 'AI Generated — Cyberpunk city at night with neon lights',
    style: '🎬 Cinematic',
    videoUrl: 'https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4',
    thumbnail: 'https://images.pexels.com/videos/3129671/free-video-3129671.jpg?auto=compress&w=400',
    duration: '0:10',
  },
  {
    id: 'showcase-2',
    title: 'Sunset di Pantai',
    description: 'AI Generated — Beautiful ocean sunset with golden hour',
    style: '🌿 Nature',
    videoUrl: 'https://videos.pexels.com/video-files/1093662/1093662-hd_1920_1080_30fps.mp4',
    thumbnail: 'https://images.pexels.com/videos/1093662/free-video-1093662.jpg?auto=compress&w=400',
    duration: '0:12',
  },
  {
    id: 'showcase-3',
    title: 'Food Close-up Sizzling',
    description: 'AI Generated — Delicious food with steam and close-up',
    style: '🍜 Food',
    videoUrl: 'https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4',
    thumbnail: 'https://images.pexels.com/videos/3195394/free-video-3195394.jpg?auto=compress&w=400',
    duration: '0:08',
  },
  {
    id: 'showcase-4',
    title: 'Motivational Speaker',
    description: 'AI Generated — Professional motivational content',
    style: '💪 Motivasi',
    videoUrl: 'https://videos.pexels.com/video-files/7579953/7579953-hd_1080_1920_25fps.mp4',
    thumbnail: 'https://images.pexels.com/videos/7579953/pexels-photo-7579953.jpeg?auto=compress&w=400',
    duration: '0:09',
  },
  {
    id: 'showcase-5',
    title: 'Tech & AI Futuristic',
    description: 'AI Generated — Futuristic technology visualization',
    style: '💜 Neon/Cyberpunk',
    videoUrl: 'https://videos.pexels.com/video-files/6963744/6963744-hd_1080_1920_25fps.mp4',
    thumbnail: 'https://images.pexels.com/videos/6963744/pexels-photo-6963744.jpeg?auto=compress&w=400',
    duration: '0:07',
  },
  {
    id: 'showcase-6',
    title: 'Nature Aerial Drone',
    description: 'AI Generated — Stunning aerial landscape view',
    style: '🌿 Nature',
    videoUrl: 'https://videos.pexels.com/video-files/2491284/2491284-hd_1920_1080_24fps.mp4',
    thumbnail: 'https://images.pexels.com/videos/2491284/free-video-2491284.jpg?auto=compress&w=400',
    duration: '0:15',
  },
];

const assets: MediaAsset[] = [
  { id: '1', name: 'city-timelapse-4k.mp4', type: 'video', size: '124 MB', duration: '0:32', uploadedAt: '2 hours ago' },
  { id: '2', name: 'motivational-bgm.mp3', type: 'audio', size: '4.2 MB', duration: '3:45', uploadedAt: '5 hours ago' },
  { id: '3', name: 'thumbnail-ai-tools.png', type: 'image', size: '2.1 MB', uploadedAt: '1 day ago' },
  { id: '4', name: 'ocean-waves-drone.mp4', type: 'video', size: '89 MB', duration: '0:18', uploadedAt: '1 day ago' },
  { id: '5', name: 'whoosh-transition.mp3', type: 'audio', size: '156 KB', duration: '0:02', uploadedAt: '2 days ago' },
  { id: '6', name: 'neon-background.png', type: 'image', size: '3.4 MB', uploadedAt: '2 days ago' },
  { id: '7', name: 'typing-keyboard.mp4', type: 'video', size: '45 MB', duration: '0:12', uploadedAt: '3 days ago' },
  { id: '8', name: 'epic-cinematic.mp3', type: 'audio', size: '6.8 MB', duration: '4:20', uploadedAt: '3 days ago' },
  { id: '9', name: 'logo-viralai.png', type: 'image', size: '890 KB', uploadedAt: '5 days ago' },
  { id: '10', name: 'rain-ambience.mp3', type: 'audio', size: '8.2 MB', duration: '5:00', uploadedAt: '5 days ago' },
  { id: '11', name: 'sunset-timelapse.mp4', type: 'video', size: '156 MB', duration: '0:25', uploadedAt: '1 week ago' },
  { id: '12', name: 'pop-notification.mp3', type: 'audio', size: '45 KB', duration: '0:01', uploadedAt: '1 week ago' },
];

const typeIcons: Record<string, any> = {
  image: Image,
  video: Video,
  audio: Music,
  other: File,
};

const typeColors: Record<string, string> = {
  image: 'from-pink-500 to-rose-500',
  video: 'from-violet-500 to-purple-500',
  audio: 'from-amber-500 to-orange-500',
  other: 'from-gray-500 to-slate-500',
};

export default function MediaPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredAssets = assets.filter((asset) => {
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setUploadedFiles(files.map((f) => f.name));
      setShowUploadModal(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setUploadedFiles(files.map((f) => f.name));
      setShowUploadModal(true);
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      alert(`✅ Folder "${newFolderName}" created!`);
      setNewFolderName('');
      setShowNewFolder(false);
    }
  };

  return (
    <div
      className="space-y-6"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Image className="h-6 w-6 text-primary" />
            Media Library
          </h1>
          <p className="text-muted-foreground mt-1">Manage your assets, footage, music, and more</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowNewFolder(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-accent transition font-medium text-sm"
          >
            <FolderPlus className="h-4 w-4" />
            New Folder
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm"
          >
            <Upload className="h-4 w-4" />
            Upload
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {/* Breadcrumb */}
      {currentFolder && (
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => setCurrentFolder(null)} className="text-muted-foreground hover:text-foreground transition">
            Media Library
          </button>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{folders.find((f) => f.id === currentFolder)?.name}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm"
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-1">
            {['all', 'image', 'video', 'audio'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filterType === type
                    ? 'gradient-primary text-white'
                    : 'border border-border hover:bg-accent text-muted-foreground'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted/50">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-card shadow-sm' : ''}`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-card shadow-sm' : ''}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* AI Video Showcase */}
      {!currentFolder && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">🎬 AI Video Showcase — Contoh Video yang Dibuat NuViral</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {videoShowcase.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition cursor-pointer"
                onClick={() => {
                  const modal = document.getElementById(`video-modal-${video.id}`);
                  if (modal) modal.classList.remove('hidden');
                }}
              >
                <div className="aspect-[9/16] bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
                  {video.thumbnail && (
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                      <Video className="h-5 w-5 text-primary ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-1.5 right-1.5 text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                    {video.duration}
                  </span>
                  <span className="absolute top-1.5 left-1.5 text-[9px] bg-primary/90 text-white px-1.5 py-0.5 rounded font-medium">
                    AI Generated
                  </span>
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium truncate">{video.title}</p>
                  <p className="text-[10px] text-muted-foreground">{video.style}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Video Modals */}
          {videoShowcase.map((video) => (
            <div
              key={`modal-${video.id}`}
              id={`video-modal-${video.id}`}
              className="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  (e.currentTarget as HTMLElement).classList.add('hidden');
                }
              }}
            >
              <div className="w-full max-w-sm mx-4">
                <div className="rounded-2xl overflow-hidden bg-black">
                  <video
                    src={video.videoUrl}
                    controls
                    autoPlay
                    className="w-full aspect-[9/16] max-h-[80vh] object-contain"
                  />
                </div>
                <div className="mt-3 text-center">
                  <p className="text-white font-medium">{video.title}</p>
                  <p className="text-white/60 text-sm">{video.description}</p>
                  <button
                    onClick={() => document.getElementById(`video-modal-${video.id}`)?.classList.add('hidden')}
                    className="mt-3 px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Folders */}
      {!currentFolder && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Folders</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {folders.map((folder) => (
              <motion.button
                key={folder.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentFolder(folder.id)}
                className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition text-left"
              >
                <Folder className="h-8 w-8 text-primary/70 mb-2" />
                <p className="text-sm font-medium truncate">{folder.name}</p>
                <p className="text-xs text-muted-foreground">{folder.itemCount} items</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Assets */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Files ({filteredAssets.length})
        </h3>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {filteredAssets.map((asset, index) => {
              const TypeIcon = typeIcons[asset.type];
              return (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition"
                >
                  {/* Preview */}
                  <div className={`aspect-square bg-gradient-to-br ${typeColors[asset.type]} flex items-center justify-center relative`}>
                    <TypeIcon className="h-8 w-8 text-white/80" />
                    {asset.duration && (
                      <span className="absolute bottom-2 right-2 text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                        {asset.duration}
                      </span>
                    )}
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition">
                        <Download className="h-4 w-4 text-white" />
                      </button>
                      <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition">
                        <Trash2 className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{asset.name}</p>
                    <p className="text-[10px] text-muted-foreground">{asset.size}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAssets.map((asset, index) => {
              const TypeIcon = typeIcons[asset.type];
              return (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition group"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${typeColors[asset.type]} flex items-center justify-center flex-shrink-0`}>
                    <TypeIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">{asset.size} {asset.duration ? `• ${asset.duration}` : ''}</p>
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:block">{asset.uploadedAt}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button className="p-1.5 rounded-lg hover:bg-accent transition">
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-destructive/10 transition">
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="p-12 rounded-3xl border-2 border-dashed border-primary bg-primary/5 text-center">
            <Upload className="h-16 w-16 text-primary mx-auto mb-4" />
            <p className="text-xl font-semibold">Drop files here to upload</p>
            <p className="text-muted-foreground mt-1">Images, videos, and audio files supported</p>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-6 rounded-2xl border border-border bg-card shadow-xl mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Upload Files</h2>
              <button onClick={() => setShowUploadModal(false)} className="p-1 rounded-lg hover:bg-accent">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {uploadedFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <File className="h-5 w-5 text-primary" />
                  <span className="text-sm flex-1 truncate">{file}</span>
                  <span className="text-xs text-green-500">Ready</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 py-3 rounded-xl border border-border hover:bg-accent transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  alert(`✅ ${uploadedFiles.length} file(s) uploaded successfully!`);
                  setUploadedFiles([]);
                }}
                className="flex-1 py-3 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition"
              >
                Upload {uploadedFiles.length} file(s)
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm p-6 rounded-2xl border border-border bg-card shadow-xl mx-4"
          >
            <h2 className="text-lg font-semibold mb-4">Create New Folder</h2>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewFolder(false)}
                className="flex-1 py-3 rounded-xl border border-border hover:bg-accent transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="flex-1 py-3 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
