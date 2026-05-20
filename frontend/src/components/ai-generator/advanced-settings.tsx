'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Film,
  Type,
  Music,
  Camera,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface AdvancedVideoSettings {
  videoStyle: string;
  cameraMotion: string;
  subtitleStyle: string;
  musicMood: string;
  duration: number;
  fps: number;
  resolution: string;
  aspectRatio: string;
  voiceGender: string;
  voiceLanguage: string;
  subtitleLanguage: string;
  autoEmoji: boolean;
  autoSoundEffect: boolean;
  autoBackgroundMusic: boolean;
  autoTransition: boolean;
  autoHook: boolean;
}

const videoStyles = [
  { id: 'cinematic', label: 'Cinematic', emoji: '🎬' },
  { id: 'viral_tiktok', label: 'Viral TikTok', emoji: '🔥' },
  { id: 'documentary', label: 'Documentary', emoji: '📹' },
  { id: 'anime_edit', label: 'Anime Edit', emoji: '⚡' },
  { id: 'mrbeast', label: 'MrBeast Style', emoji: '🎯' },
  { id: 'hormozi', label: 'Alex Hormozi', emoji: '💰' },
  { id: 'motivational', label: 'Motivational', emoji: '💪' },
  { id: 'luxury', label: 'Luxury', emoji: '✨' },
  { id: 'dark_aesthetic', label: 'Dark Aesthetic', emoji: '🖤' },
  { id: 'minimalist', label: 'Minimalist', emoji: '⚪' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'storytelling', label: 'Storytelling', emoji: '📖' },
];

const cameraMotions = [
  { id: 'smooth_zoom', label: 'Smooth Zoom', desc: 'Gradual zoom in/out' },
  { id: 'dynamic_pan', label: 'Dynamic Pan', desc: 'Left/right movement' },
  { id: 'parallax', label: 'Parallax', desc: '3D depth effect' },
  { id: 'handheld', label: 'Handheld', desc: 'Natural shake' },
  { id: 'cinematic_motion', label: 'Cinematic Motion', desc: 'Dolly + zoom combo' },
];

const subtitleStyles = [
  { id: 'tiktok_bold', label: 'TikTok Bold', preview: 'BOLD WHITE' },
  { id: 'hormozi', label: 'Alex Hormozi', preview: 'YELLOW HIGHLIGHT' },
  { id: 'minimal', label: 'Minimal', preview: 'clean white' },
  { id: 'neon', label: 'Neon Glow', preview: 'NEON EFFECT' },
  { id: 'gaming', label: 'Gaming', preview: 'IMPACT FONT' },
];

const musicMoods = [
  { id: 'epic', label: 'Epic', emoji: '⚔️' },
  { id: 'emotional', label: 'Emotional', emoji: '😢' },
  { id: 'motivational', label: 'Motivational', emoji: '🚀' },
  { id: 'dark', label: 'Dark', emoji: '🌑' },
  { id: 'corporate', label: 'Corporate', emoji: '💼' },
  { id: 'viral_tiktok', label: 'Viral TikTok', emoji: '🎵' },
  { id: 'chill', label: 'Chill / Lo-fi', emoji: '☕' },
  { id: 'none', label: 'No Music', emoji: '🔇' },
];

interface AdvancedSettingsProps {
  settings: AdvancedVideoSettings;
  onSettingsChange: (settings: AdvancedVideoSettings) => void;
}

export function AdvancedSettings({ settings, onSettingsChange }: AdvancedSettingsProps) {
  const [expanded, setExpanded] = useState(true);

  const update = (key: keyof AdvancedVideoSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-accent/30 transition"
      >
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Advanced Video Settings</span>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-4 pb-4 space-y-5"
        >
          {/* Video Style */}
          <div>
            <label className="text-xs font-medium mb-2 block flex items-center gap-1.5">
              <Film className="h-3.5 w-3.5 text-primary" />
              Video Style
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {videoStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => update('videoStyle', style.id)}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition text-center ${
                    settings.videoStyle === style.id
                      ? 'bg-primary text-white'
                      : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="block text-sm mb-0.5">{style.emoji}</span>
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Camera Motion */}
          <div>
            <label className="text-xs font-medium mb-2 block flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-primary" />
              Camera Motion
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {cameraMotions.map((motion) => (
                <button
                  key={motion.id}
                  onClick={() => update('cameraMotion', motion.id)}
                  className={`px-2 py-2 rounded-lg text-left transition ${
                    settings.cameraMotion === motion.id
                      ? 'bg-primary/10 border border-primary text-primary'
                      : 'bg-muted/50 border border-transparent hover:bg-muted'
                  }`}
                >
                  <p className="text-[11px] font-medium">{motion.label}</p>
                  <p className="text-[9px] text-muted-foreground">{motion.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Subtitle Style */}
          <div>
            <label className="text-xs font-medium mb-2 block flex items-center gap-1.5">
              <Type className="h-3.5 w-3.5 text-primary" />
              Subtitle Style
            </label>
            <div className="flex flex-wrap gap-1.5">
              {subtitleStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => update('subtitleStyle', style.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition ${
                    settings.subtitleStyle === style.id
                      ? 'bg-primary text-white'
                      : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Music Mood */}
          <div>
            <label className="text-xs font-medium mb-2 block flex items-center gap-1.5">
              <Music className="h-3.5 w-3.5 text-primary" />
              Music Mood
            </label>
            <div className="flex flex-wrap gap-1.5">
              {musicMoods.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => update('musicMood', mood.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition ${
                    settings.musicMood === mood.id
                      ? 'bg-primary text-white'
                      : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {mood.emoji} {mood.label}
                </button>
              ))}
            </div>
          </div>

          {/* Technical Settings */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-medium mb-1 block text-muted-foreground">Duration (sec)</label>
              <select
                value={settings.duration}
                onChange={(e) => update('duration', parseInt(e.target.value))}
                className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-xs"
              >
                <option value={15}>15s</option>
                <option value={30}>30s</option>
                <option value={45}>45s</option>
                <option value={60}>60s</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-medium mb-1 block text-muted-foreground">Resolution</label>
              <select
                value={settings.resolution}
                onChange={(e) => update('resolution', e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-xs"
              >
                <option value="720p">720p HD</option>
                <option value="1080p">1080p Full HD</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-medium mb-1 block text-muted-foreground">Voice</label>
              <select
                value={settings.voiceGender}
                onChange={(e) => update('voiceGender', e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-xs"
              >
                <option value="female">Female (Nova)</option>
                <option value="male">Male (Onyx)</option>
                <option value="neutral">Neutral (Alloy)</option>
              </select>
            </div>
          </div>

          {/* Auto Features */}
          <div>
            <label className="text-xs font-medium mb-2 block">Auto Features</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'autoEmoji', label: 'Auto Emoji Subtitle' },
                { key: 'autoSoundEffect', label: 'Auto Sound Effects' },
                { key: 'autoBackgroundMusic', label: 'Auto Background Music' },
                { key: 'autoTransition', label: 'Auto Transitions' },
                { key: 'autoHook', label: 'Auto Hook Generator' },
              ].map((feature) => (
                <button
                  key={feature.key}
                  onClick={() => update(feature.key as keyof AdvancedVideoSettings, !settings[feature.key as keyof AdvancedVideoSettings])}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium transition ${
                    settings[feature.key as keyof AdvancedVideoSettings]
                      ? 'bg-primary/10 border border-primary/30 text-primary'
                      : 'bg-muted/50 border border-transparent text-muted-foreground'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-sm border ${
                    settings[feature.key as keyof AdvancedVideoSettings]
                      ? 'bg-primary border-primary'
                      : 'border-muted-foreground'
                  }`}>
                    {settings[feature.key as keyof AdvancedVideoSettings] && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12"><path d="M10 3L4.5 8.5 2 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </div>
                  {feature.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
