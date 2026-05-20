'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image,
  Upload,
  X,
  GripVertical,
  Loader2,
  Sparkles,
  Eye,
} from 'lucide-react';

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  analysis?: ImageAnalysis;
}

interface ImageAnalysis {
  objects: string[];
  style: string;
  mood: string;
  dominantColors: string[];
  suggestedMotion: string;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[] | ((prev: UploadedImage[]) => UploadedImage[])) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export function ImageUploader({ images, onImagesChange, maxImages = 20, maxSizeMB = 10 }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const processFiles = useCallback((files: FileList | File[]) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = maxSizeMB * 1024 * 1024;
    const remaining = maxImages - images.length;

    const newImages: UploadedImage[] = Array.from(files)
      .filter((file) => validTypes.includes(file.type) && file.size <= maxSize)
      .slice(0, remaining)
      .map((file) => ({
        id: `img_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        progress: 0,
        status: 'uploading' as const,
      }));

    if (newImages.length === 0) return;

    const updated = [...images, ...newImages];
    onImagesChange(updated);

    // Simulate upload progress and auto-complete
    newImages.forEach((img, idx) => {
      setTimeout(() => {
        onImagesChange((prev: any) => {
          if (Array.isArray(prev)) {
            return prev.map((i: UploadedImage) =>
              i.id === img.id ? { ...i, progress: 100, status: 'complete' as const } : i
            );
          }
          return prev;
        });
      }, 800 + idx * 400);

      // Auto-analyze
      setTimeout(() => {
        analyzeImage(img.id);
      }, 1500 + idx * 500);
    });
  }, [images, maxImages, maxSizeMB, onImagesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = '';
  };

  const removeImage = (id: string) => {
    const img = images.find((i) => i.id === id);
    if (img) URL.revokeObjectURL(img.preview);
    onImagesChange(images.filter((i) => i.id !== id));
  };

  const analyzeImage = (id: string) => {
    setAnalyzing(id);
    setTimeout(() => {
      const analyses: ImageAnalysis[] = [
        { objects: ['Person', 'City', 'Sunset'], style: 'Cinematic', mood: 'Inspirational', dominantColors: ['#FF6B35', '#1A1A2E', '#E94560'], suggestedMotion: 'Smooth Zoom Out' },
        { objects: ['Nature', 'Mountains', 'Sky'], style: 'Documentary', mood: 'Peaceful', dominantColors: ['#2D6A4F', '#95D5B2', '#D8F3DC'], suggestedMotion: 'Parallax Pan' },
        { objects: ['Technology', 'Screen', 'Code'], style: 'Modern', mood: 'Professional', dominantColors: ['#7C3AED', '#1E1B4B', '#A78BFA'], suggestedMotion: 'Dynamic Zoom' },
        { objects: ['Food', 'Table', 'Restaurant'], style: 'Lifestyle', mood: 'Warm', dominantColors: ['#F59E0B', '#92400E', '#FDE68A'], suggestedMotion: 'Slow Pan Right' },
      ];
      const analysis = analyses[Math.floor(Math.random() * analyses.length)];

      onImagesChange((prev: any) => {
        if (Array.isArray(prev)) {
          return prev.map((i: UploadedImage) => (i.id === id ? { ...i, analysis } : i));
        }
        return prev;
      });
      setAnalyzing(null);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
          isDragging
            ? 'border-primary bg-primary/10 scale-[1.02]'
            : 'border-border hover:border-primary/50 hover:bg-accent/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileSelect}
        />
        <div className="flex flex-col items-center gap-2">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition ${isDragging ? 'bg-primary/20' : 'bg-muted'}`}>
            <Image className={`h-6 w-6 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <p className="text-sm font-medium">
              {isDragging ? 'Drop images here' : 'Upload Reference Images'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              JPG, PNG, WEBP • Max {maxSizeMB}MB • Up to {maxImages} images
            </p>
          </div>
        </div>
        {/* Glassmorphism overlay on drag */}
        {isDragging && (
          <div className="absolute inset-0 rounded-2xl bg-primary/5 backdrop-blur-[1px]" />
        )}
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">{images.length}/{maxImages} images</p>
            {images.length > 1 && (
              <p className="text-xs text-muted-foreground">Drag to reorder</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {images.map((img) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-border bg-muted relative">
                    <img
                      src={img.preview}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Upload Progress */}
                    {img.status === 'uploading' && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-10 h-10 relative">
                          <svg className="w-full h-full -rotate-90">
                            <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                            <circle
                              cx="20" cy="20" r="16" fill="none" stroke="white" strokeWidth="3"
                              strokeDasharray={`${img.progress} 100`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-[9px] text-white font-bold">
                            {Math.round(img.progress)}%
                          </span>
                        </div>
                      </div>
                    )}
                    {/* AI Analysis Indicator */}
                    {img.analysis && (
                      <div className="absolute bottom-0.5 left-0.5">
                        <Sparkles className="h-3 w-3 text-primary" />
                      </div>
                    )}
                    {analyzing === img.id && (
                      <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      </div>
                    )}
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setPreviewImage(img.preview); }}
                        className="p-1 rounded bg-white/20 hover:bg-white/40 transition"
                      >
                        <Eye className="h-3 w-3 text-white" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                        className="p-1 rounded bg-red-500/60 hover:bg-red-500/80 transition"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* AI Analysis Results */}
      {images.some((i) => i.analysis) && (
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">AI Visual Analysis</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {images.filter((i) => i.analysis).slice(0, 4).map((img) => (
              <div key={img.id} className="text-[10px] space-y-0.5">
                <p className="text-muted-foreground">Style: <span className="text-foreground font-medium">{img.analysis!.style}</span></p>
                <p className="text-muted-foreground">Motion: <span className="text-foreground font-medium">{img.analysis!.suggestedMotion}</span></p>
                <div className="flex gap-0.5">
                  {img.analysis!.dominantColors.map((c) => (
                    <div key={c} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-[80vh] rounded-2xl object-contain"
          />
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
