export interface RenderConfig {
  outputPath: string;
  width: number;
  height: number;
  fps: number;
  duration: number;
  format: 'mp4' | 'mov' | 'webm';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  clips: VideoClip[];
  subtitles?: SubtitleConfig;
  audio?: AudioConfig;
  watermark?: WatermarkConfig;
  transitions?: TransitionConfig[];
}

export interface VideoClip {
  path: string;
  startTime: number;
  endTime: number;
  duration: number;
  effects?: ClipEffect[];
}

export interface ClipEffect {
  type: 'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right' | 'fade_in' | 'fade_out' | 'blur';
  intensity?: number;
  duration?: number;
}

export interface SubtitleConfig {
  enabled: boolean;
  style: SubtitleStyle;
  segments: SubtitleSegment[];
}

export interface SubtitleStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | 'extrabold';
  color: string;
  backgroundColor?: string;
  outlineColor?: string;
  outlineWidth?: number;
  shadowColor?: string;
  shadowOffset?: number;
  position: 'top' | 'center' | 'bottom';
  animation: 'none' | 'fade' | 'typewriter' | 'bounce' | 'highlight' | 'karaoke';
  marginBottom?: number;
}

export interface SubtitleSegment {
  text: string;
  startTime: number;
  endTime: number;
  words?: WordTiming[];
}

export interface WordTiming {
  word: string;
  startTime: number;
  endTime: number;
}

export interface AudioConfig {
  voiceover?: {
    path: string;
    volume: number;
  };
  backgroundMusic?: {
    path: string;
    volume: number;
    fadeIn?: number;
    fadeOut?: number;
  };
  soundEffects?: SoundEffect[];
}

export interface SoundEffect {
  path: string;
  startTime: number;
  volume: number;
}

export interface WatermarkConfig {
  enabled: boolean;
  imagePath?: string;
  text?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  size: number;
}

export interface TransitionConfig {
  type: 'fade' | 'slide_left' | 'slide_right' | 'zoom' | 'dissolve' | 'wipe';
  duration: number;
  atTime: number;
}

export interface RenderProgress {
  percent: number;
  currentFrame: number;
  totalFrames: number;
  fps: number;
  eta: number; // seconds remaining
}
