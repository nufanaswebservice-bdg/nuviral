'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';
import { BillingPopup } from '@/components/billing-popup';
import {
  Video, Download, Loader2, Sparkles, RotateCcw, Mic, Film,
  Smartphone, Monitor, Wand2, Clock, Zap, Volume2, Send,
  ChevronDown, Settings2, X,
} from 'lucide-react';

const voiceOptions = [
  { id: 'nova', label: 'Nova', desc: 'Female, warm' },
  { id: 'alloy', label: 'Alloy', desc: 'Neutral' },
  { id: 'echo', label: 'Echo', desc: 'Male, clear' },
  { id: 'onyx', label: 'Onyx', desc: 'Male, deep' },
  { id: 'shimmer', label: 'Shimmer', desc: 'Female, soft' },
];

const stylePresets = [
  { id: 'cinematic', label: 'Cinematic', icon: '🎬' },
  { id: 'anime', label: 'Anime', icon: '🎌' },
  { id: 'realistic', label: 'Realistic', icon: '📷' },
  { id: 'dark', label: 'Dark', icon: '🌑' },
  { id: 'neon', label: 'Neon', icon: '💜' },
  { id: 'nature', label: 'Nature', icon: '🌿' },
  { id: 'food', label: 'Food', icon: '🍜' },
  { id: 'product', label: 'Product', icon: '📦' },
];

const stylePrompts: Record<string, string> = {
  cinematic: 'cinematic, film grain, dramatic lighting, shallow depth of field',
  anime: 'anime style, vibrant colors, Japanese animation, detailed',
  realistic: 'photorealistic, natural lighting, high detail, 8K',
  dark: 'dark atmosphere, horror, moody lighting, suspense',
  neon: 'neon lights, cyberpunk, futuristic, glowing',
  nature: 'natural landscape, beautiful scenery, golden hour, peaceful',
  food: 'food photography, appetizing, close-up, steam rising, delicious',
  product: 'product showcase, clean background, professional lighting, commercial',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nuviral-production.up.railway.app/api/v1';

export default function QuickVideoPage() {
  const [prompt, setPrompt] = useState('');
  const [narasi, setNarasi] = useState('');
  const [showNarasi, setShowNarasi] = useState(false);
  const [voice, setVoice] = useState('nova');
  const [format, setFormat] = useState<'portrait' | 'landscape'>('portrait');
  const [duration, setDuration] = useState('medium');
  const [style, setStyle] = useState('cinematic');
  const [enableVoiceover, setEnableVoiceover] = useState(true);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStage, setRenderStage] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showBillingPopup, setShowBillingPopup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [credits, setCredits] = useState<{ aiCreditsUsed: number; aiCreditsLimit: number }>({ aiCreditsUsed: 0, aiCreditsLimit: 0 });
  const [userName, setUserName] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      setUserName(u.name || u.email?.split('@')[0] || '');
    } catch {}

    const fetchCredits = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get(`${API_URL}/subscription/current`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.data) {
          setCredits({ aiCreditsUsed: res.data.aiCreditsUsed ?? 0, aiCreditsLimit: res.data.aiCreditsLimit ?? 0 });
        }
      } catch {
        setCredits({ aiCreditsUsed: 0, aiCreditsLimit: 0 });
      }
    };
    fetchCredits();
  }, []);

  const handleRender = async () => {
    if (!prompt.trim()) { toast.error('Masukkan prompt video'); return; }
    if (credits.aiCreditsLimit === 0 || credits.aiCreditsUsed >= credits.aiCreditsLimit) {
      setShowBillingPopup(true);
      return;
    }

    setIsRendering(true);
    setRenderProgress(5);
    setRenderStage('Memproses prompt...');
    setVideoUrl(null);

    const progressInterval = setInterval(() => {
      setRenderProgress(prev => {
        if (prev < 15) { setRenderStage('Translating prompt...'); return prev + 2; }
        if (prev < 45) { setRenderStage('Generating video...'); return prev + 0.6; }
        if (prev < 65) { setRenderStage('Generating voiceover...'); return prev + 0.8; }
        if (prev < 75) { setRenderStage('Merging audio + video...'); return prev + 0.4; }
        if (prev < 80) { setRenderStage('Finalizing...'); return prev + 0.2; }
        return prev;
      });
    }, 2000);

    try {
      const authToken = localStorage.getItem('accessToken') || '';
      const selectedStyle = stylePrompts[style] || '';
      const response = await fetch('https://nuviral-production.up.railway.app/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({
          title: prompt.trim(),
          script: enableVoiceover ? (narasi.trim() || prompt.trim()) : '',
          prompt: `${prompt.trim()}, ${selectedStyle}`,
          voice, format, duration, style,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Server error' }));
        throw new Error(err.detail || 'Render failed');
      }

      setRenderProgress(95);
      setRenderStage('Downloading...');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setRenderProgress(100);
      setRenderStage('Selesai!');
      toast.success('Video berhasil dibuat! 🎬');

      // Save to My Videos
      try {
        const videoData = {
          id: `vid-${Date.now()}`,
          title: prompt.trim(),
          style: stylePresets.find(s => s.id === style)?.label || style,
          duration, format, voice,
          blobUrl: url, blobSize: blob.size,
          createdAt: new Date().toISOString(),
          status: 'completed',
        };
        const saved = JSON.parse(localStorage.getItem('nuviral-videos') || '[]');
        saved.unshift(videoData);
        if (saved.length > 50) saved.pop();
        localStorage.setItem('nuviral-videos', JSON.stringify(saved));
      } catch {}
    } catch (err: any) {
      clearInterval(progressInterval);
      toast.error(`Gagal: ${err.message}`);
      setRenderProgress(0);
      setRenderStage('');
    } finally {
      setIsRendering(false);
    }
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `nuviral-${prompt.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-').substring(0, 30)}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleRender();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] relative">
      <BillingPopup isOpen={showBillingPopup} onClose={() => setShowBillingPopup(false)} creditsUsed={credits.aiCreditsUsed} creditsLimit={credits.aiCreditsLimit} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {videoUrl ? (
          /* Video Result */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center space-y-4">
            <div className="rounded-2xl overflow-hidden border border-border shadow-xl">
              <video src={videoUrl} controls autoPlay className={`w-full ${format === 'portrait' ? 'aspect-[9/16] max-h-[60vh]' : 'aspect-video'} object-contain bg-black`} />
            </div>
            <div className="flex gap-2 justify-center">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleDownload} className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-medium">
                <Download className="h-4 w-4" /> Download MP4
              </motion.button>
              <button onClick={() => { setVideoUrl(null); setPrompt(''); setNarasi(''); setRenderProgress(0); }} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border hover:bg-accent transition">
                <RotateCcw className="h-4 w-4" /> Baru
              </button>
            </div>
          </motion.div>
        ) : isRendering ? (
          /* Rendering State */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md text-center space-y-6">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
            <div>
              <p className="text-lg font-semibold">{renderStage}</p>
              <p className="text-sm text-muted-foreground mt-1">{renderProgress}% — estimasi 2-5 menit</p>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden max-w-xs mx-auto">
              <motion.div animate={{ width: `${renderProgress}%` }} className="h-full rounded-full gradient-primary" />
            </div>
          </motion.div>
        ) : (
          /* Welcome State (Gemini-style) */
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-2">
              Halo {userName || 'Creator'}, mau buat video apa?
            </h1>
            <p className="text-muted-foreground">Ketik prompt lalu tekan Enter untuk generate video AI</p>
          </motion.div>
        )}
      </div>

      {/* Bottom Input Bar (Gemini-style) */}
      {!videoUrl && !isRendering && (
        <div className="sticky bottom-0 pb-4 px-4">
          <div className="max-w-3xl mx-auto">
            {/* Narasi expandable */}
            <AnimatePresence>
              {showNarasi && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-2">
                  <div className="p-3 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Mic className="h-3 w-3" /> Narasi / Voiceover</span>
                      <button onClick={() => setShowNarasi(false)} className="p-1 rounded hover:bg-accent"><X className="h-3 w-3" /></button>
                    </div>
                    <textarea
                      value={narasi}
                      onChange={(e) => setNarasi(e.target.value)}
                      placeholder="Tulis narasi bahasa Indonesia yang akan dibacakan AI..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm resize-none focus:outline-none focus:border-primary"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Input */}
            <div className="relative rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Deskripsikan video yang ingin dibuat..."
                rows={1}
                className="w-full px-5 py-4 pr-32 text-sm bg-transparent resize-none focus:outline-none min-h-[56px] max-h-[120px]"
                style={{ height: 'auto', overflow: 'hidden' }}
                onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 120) + 'px'; }}
              />

              {/* Bottom toolbar inside input */}
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="flex items-center gap-1">
                  {/* Style selector */}
                  <div className="relative">
                    <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-accent transition text-muted-foreground">
                      <Settings2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{stylePresets.find(s => s.id === style)?.icon} {stylePresets.find(s => s.id === style)?.label}</span>
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Format */}
                  <button onClick={() => setFormat(f => f === 'portrait' ? 'landscape' : 'portrait')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-accent transition text-muted-foreground">
                    {format === 'portrait' ? <Smartphone className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5" />}
                    <span className="hidden sm:inline">{format === 'portrait' ? '9:16' : '16:9'}</span>
                  </button>

                  {/* Duration */}
                  <button onClick={() => setDuration(d => d === 'short' ? 'medium' : d === 'medium' ? 'long' : 'short')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-accent transition text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{duration === 'short' ? '5s' : duration === 'medium' ? '10s' : '20s'}</span>
                  </button>

                  {/* Voice */}
                  <button onClick={() => { const voices = voiceOptions.map(v => v.id); const i = voices.indexOf(voice); setVoice(voices[(i + 1) % voices.length]); }} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-accent transition text-muted-foreground">
                    <Volume2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{voice}</span>
                  </button>

                  {/* Narasi toggle */}
                  <button onClick={() => setShowNarasi(!showNarasi)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${showNarasi ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-muted-foreground'}`}>
                    <Mic className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Narasi</span>
                  </button>
                </div>

                {/* Send button */}
                <button
                  onClick={handleRender}
                  disabled={!prompt.trim() || isRendering}
                  className="p-2.5 rounded-xl gradient-primary text-white disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full left-0 right-0 mb-2 max-w-3xl mx-auto">
                  <div className="p-4 rounded-2xl border border-border bg-card shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Style</span>
                      <button onClick={() => setShowSettings(false)} className="p-1 rounded hover:bg-accent"><X className="h-4 w-4" /></button>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {stylePresets.map(s => (
                        <button key={s.id} onClick={() => { setStyle(s.id); setShowSettings(false); }} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${style === s.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-accent border border-transparent'}`}>
                          <span className="text-lg">{s.icon}</span>
                          <span className="text-[10px] font-medium">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Tekan Enter untuk generate • Shift+Enter untuk baris baru
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
