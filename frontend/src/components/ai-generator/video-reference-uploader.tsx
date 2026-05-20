'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  Upload,
  X,
  Loader2,
  Sparkles,
  Play,
  Pause,
  Film,
} from 'lucide-react';

interface VideoAnalysis {
  style: string;
  pacing: string;
  transitions: string[];
  subtitleStyle: string;
  colorGrading: string;
  hookStyle: string;
  energy: string;
  duration: string;
  scenes: number;
}

interface ReferenceVideo {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: string;
  duration?: string;
  progress: number;
  status: 'uploading' | 'analyzing' | 'complete' | 'error';
  analysis?: VideoAnalysis;
  frames?: string[];
}

interface VideoReferenceUploaderProps {
  video: ReferenceVideo | null;
  onVideoChange: (video: ReferenceVideo | null) => void;
}

export function VideoReferenceUploader({ video, onVideoChange }: VideoReferenceUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const processFile = (file: File) => {
    const validTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    const maxSize = 500 * 1024 * 1024; // 500MB

    if (!validTypes.includes(file.type)) {
      alert('Please upload MP4, MOV, or WEBM files only.');
      return;
    }
    if (file.size > maxSize) {
      alert('File size must be under 500MB.');
      return;
    }

    const newVideo: ReferenceVideo = {
      id: `vid_${Date.now()}`,
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      progress: 0,
      status: 'uploading',
    };

    onVideoChange(newVideo);

    // Simulate upload
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        clearInterval(interval);
        onVideoChange({ ...newVideo, progress: 100, status: 'analyzing' });
        // Simulate AI analysis
        setTimeout(() => {
          const analysis: VideoAnalysis = {
            style: 'Cinematic / Fast-paced',
            pacing: 'Quick cuts (1-3s per scene)',
            transitions: ['Jump Cut', 'Zoom Transition', 'Swipe'],
            subtitleStyle: 'Bold centered with highlight',
            colorGrading: 'High contrast, warm tones',
            hookStyle: 'Curiosity gap + visual hook',
            energy: 'High',
            duration: '0:32',
            scenes: 8,
          };
          onVideoChange({
            ...newVideo,
            progress: 100,
            status: 'complete',
            analysis,
            frames: [newVideo.preview, newVideo.preview, newVideo.preview, newVideo.preview],
          });
        }, 2500);
      } else {
        onVideoChange({ ...newVideo, progress: Math.min(progress, 99), status: 'uploading' });
      }
    }, 150);
  };

  const removeVideo = () => {
    if (video) URL.revokeObjectURL(video.preview);
    onVideoChange(null);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="space-y-4">
      {!video ? (
        /* Upload Area */
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
            accept="video/mp4,video/quicktime,video/webm"
            className="hidden"
            onChange={handleFileSelect}
          />
          <div className="flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition ${isDragging ? 'bg-primary/20' : 'bg-muted'}`}>
              <Video className={`h-6 w-6 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <p className="text-sm font-medium">
                {isDragging ? 'Drop video here' : 'Upload Reference Video'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                MP4, MOV, WEBM • Max 500MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Video Preview & Analysis */
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {/* Video Player */}
          <div className="relative aspect-video bg-black">
            <video
              ref={videoRef}
              src={video.preview}
              className="w-full h-full object-contain"
              onEnded={() => setIsPlaying(false)}
            />
            {/* Play/Pause Overlay */}
            {video.status === 'complete' && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition"
              >
                {!isPlaying && (
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="h-5 w-5 text-white ml-0.5" />
                  </div>
                )}
              </button>
            )}
            {/* Upload Progress */}
            {video.status === 'uploading' && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
                <p className="text-white text-sm">Uploading... {Math.round(video.progress)}%</p>
                <div className="w-48 h-1.5 rounded-full bg-white/20 mt-2 overflow-hidden">
                  <div className="h-full rounded-full bg-white transition-all" style={{ width: `${video.progress}%` }} />
                </div>
              </div>
            )}
            {/* Analyzing */}
            {video.status === 'analyzing' && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary animate-pulse mb-2" />
                <p className="text-white text-sm">AI Analyzing Style...</p>
              </div>
            )}
            {/* Remove Button */}
            <button
              onClick={removeVideo}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 hover:bg-red-500/80 transition"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* File Info */}
          <div className="p-3 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Film className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-xs truncate">{video.name}</span>
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">{video.size}</span>
          </div>

          {/* AI Analysis Results */}
          {video.analysis && (
            <div className="p-4 border-t border-border bg-primary/5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">AI Style Analysis</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Style</p>
                  <p className="font-medium">{video.analysis.style}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pacing</p>
                  <p className="font-medium">{video.analysis.pacing}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Subtitle</p>
                  <p className="font-medium">{video.analysis.subtitleStyle}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Color</p>
                  <p className="font-medium">{video.analysis.colorGrading}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Hook Style</p>
                  <p className="font-medium">{video.analysis.hookStyle}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Energy</p>
                  <p className="font-medium">{video.analysis.energy}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Transitions</p>
                  <p className="font-medium">{video.analysis.transitions.join(', ')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Scenes</p>
                  <p className="font-medium">{video.analysis.scenes} scenes ({video.analysis.duration})</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
