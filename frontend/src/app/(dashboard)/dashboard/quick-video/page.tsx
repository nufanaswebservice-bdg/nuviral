'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';
import { BillingPopup } from '@/components/billing-popup';
import {
  Video,
  Download,
  Loader2,
  Sparkles,
  RotateCcw,
  Type,
  Mic,
  Film,
  Smartphone,
  Monitor,
  Wand2,
  Clock,
  Zap,
  Globe,
  Volume2,
  Music,
  Subtitles,
  Share2,
} from 'lucide-react';

const voiceOptions = [
  { id: 'nova', label: 'Nova', desc: 'Female, warm', lang: '🇮🇩 🇺🇸' },
  { id: 'alloy', label: 'Alloy', desc: 'Neutral', lang: '🇮🇩 🇺🇸' },
  { id: 'echo', label: 'Echo', desc: 'Male, clear', lang: '🇮🇩 🇺🇸' },
  { id: 'onyx', label: 'Onyx', desc: 'Male, deep', lang: '🇮🇩 🇺🇸' },
  { id: 'shimmer', label: 'Shimmer', desc: 'Female, soft', lang: '🇮🇩 🇺🇸' },
];

const durationOptions = [
  { id: 'short', label: '5 detik', desc: 'Quick clip', frames: 41 },
  { id: 'medium', label: '10 detik', desc: 'Standard', frames: 81 },
  { id: 'long', label: '20 detik', desc: 'Extended', frames: 161 },
];

const stylePresets = [
  { id: 'cinematic', label: '🎬 Cinematic', prompt: 'cinematic, film grain, dramatic lighting, shallow depth of field' },
  { id: 'anime', label: '🎌 Anime', prompt: 'anime style, vibrant colors, Japanese animation, detailed' },
  { id: 'realistic', label: '📷 Realistic', prompt: 'photorealistic, natural lighting, high detail, 8K' },
  { id: 'dark', label: '🌑 Dark/Horror', prompt: 'dark atmosphere, horror, moody lighting, suspense' },
  { id: 'neon', label: '💜 Neon/Cyberpunk', prompt: 'neon lights, cyberpunk, futuristic, glowing' },
  { id: 'nature', label: '🌿 Nature', prompt: 'natural landscape, beautiful scenery, golden hour, peaceful' },
  { id: 'food', label: '🍜 Food', prompt: 'food photography, appetizing, close-up, steam rising, delicious' },
  { id: 'product', label: '📦 Product', prompt: 'product showcase, clean background, professional lighting, commercial' },
];

const templates = [
  { label: '🔥 AI Tools', title: '5 AI Tools Yang Akan Mengubah Hidupmu', script: 'Stop scrolling.\nIni 5 AI tools yang akan mengubah hidupmu.\nNomor 1: ChatGPT bisa buat website dalam hitungan detik.\nNomor 2: Midjourney buat gambar fotorealistis.\nNomor 3: ElevenLabs bisa kloning suara siapapun.\nNomor 4: Runway ML buat video kualitas Hollywood.\nNomor 5: Yang paling menakutkan, bisa menggantikan pekerjaanmu.\nFollow untuk update AI terbaru.' },
  { label: '💪 Motivasi', title: 'Kamu Bukan Malas, Kamu Takut', script: 'Kamu bukan malas.\nDengarkan ini baik-baik.\nHal yang selama ini kamu tunda?\nBukan karena kamu malas.\nTapi karena kamu takut.\nTakut gagal. Takut berhasil. Takut berubah.\nTapi tahukah kamu?\nRasa takut dan semangat itu rasanya sama.\nJadi mungkin kamu bukan takut.\nMungkin kamu sedang bersemangat.\nLakukan sekarang.' },
  { label: '💰 Bisnis', title: 'Cara Dapat 10 Juta Dalam 30 Hari', script: 'Saya dapat 10 juta bulan lalu.\nBukan dropship. Bukan crypto.\nIni jasa AI automation.\nLangkah 1: Pelajari ChatGPT dan Zapier.\nLangkah 2: Hubungi 50 bisnis lokal.\nLangkah 3: Tawarkan otomasi email dan customer service mereka.\nSaya charge 2 juta per klien.\nDapat 5 klien di bulan pertama.\nPeluangnya masih sangat besar.' },
  { label: '🎬 Cinematic', title: 'Cyberpunk City at Night', script: 'A futuristic cyberpunk city at night.\nNeon lights reflecting on wet streets.\nFlying cars passing between massive skyscrapers.\nRain falling through holographic advertisements.\nA lone figure walking through the crowd.\nThe future is here.' },
  { label: '🍜 Food', title: 'Sate Kambing Terbakar', script: 'Sate kambing dipanggang di atas bara api.\nAsap mengepul dari daging yang terbakar sempurna.\nBumbu kacang disiram melimpah.\nAroma rempah memenuhi udara malam.\nSatu tusuk, dua tusuk, tidak pernah cukup.' },
  { label: '🌊 Nature', title: 'Sunset di Pantai Bali', script: 'Matahari terbenam di pantai Bali.\nOmbak memecah di karang.\nLangit berubah warna dari oranye ke ungu.\nSiluet pohon kelapa tertiup angin.\nKeindahan alam Indonesia yang tiada tara.' },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nuviral-production.up.railway.app/api/v1';

export default function QuickVideoPage() {
  const [title, setTitle] = useState('');
  const [script, setScript] = useState('');
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
  const [credits, setCredits] = useState<{ aiCreditsUsed: number; aiCreditsLimit: number }>({ aiCreditsUsed: 0, aiCreditsLimit: 0 });

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get(`${API_URL}/subscription/current`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.data) {
          setCredits({
            aiCreditsUsed: res.data.aiCreditsUsed ?? 0,
            aiCreditsLimit: res.data.aiCreditsLimit ?? 50,
          });
        }
      } catch {
        setCredits({ aiCreditsUsed: 0, aiCreditsLimit: 0 });
      }
    };
    fetchCredits();
  }, []);

  const selectedStyle = stylePresets.find(s => s.id === style) || stylePresets[0];

  const handleRender = async () => {
    if (!title.trim()) { toast.error('Masukkan prompt video'); return; }

    // Check credits
    if (credits.aiCreditsLimit === 0 || credits.aiCreditsUsed >= credits.aiCreditsLimit) {
      setShowBillingPopup(true);
      return;
    }

    setIsRendering(true);
    setRenderProgress(5);
    setRenderStage('🌐 Memproses prompt...');
    setVideoUrl(null);

    const progressInterval = setInterval(() => {
      setRenderProgress(prev => {
        if (prev < 15) { setRenderStage('🌐 Translating & enhancing prompt...'); return prev + 2; }
        if (prev < 45) { setRenderStage('🎬 AI generating video frames...'); return prev + 0.6; }
        if (prev < 65) { setRenderStage('🎙️ Generating voiceover (Bahasa Indonesia)...'); return prev + 0.8; }
        if (prev < 75) { setRenderStage('🔗 Merging video + audio...'); return prev + 0.4; }
        if (prev < 80) { setRenderStage('⏳ Finalizing...'); return prev + 0.2; }
        return prev;
      });
    }, 2000);

    try {
      const authToken = localStorage.getItem('accessToken') || '';
      const response = await fetch('https://nuviral-production.up.railway.app/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({
          title: title.trim(),
          script: enableVoiceover ? (script.trim() || title.trim()) : '',
          prompt: `${title.trim()}, ${selectedStyle.prompt}`,
          voice,
          format,
          duration,
          style: selectedStyle.id,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Server error' }));
        throw new Error(err.detail || 'Render failed');
      }

      setRenderProgress(95);
      setRenderStage('📥 Downloading video...');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setRenderProgress(100);
      setRenderStage('✅ Selesai!');
      toast.success('Video AI berhasil dibuat! 🎬');

      // Save video to My Videos (localStorage)
      try {
        const videoData = {
          id: `vid-${Date.now()}`,
          title: title.trim(),
          style: selectedStyle.label,
          duration: duration,
          format: format,
          voice: voice,
          blobUrl: url,
          blobSize: blob.size,
          createdAt: new Date().toISOString(),
          status: 'completed',
        };
        const savedVideos = JSON.parse(localStorage.getItem('nuviral-videos') || '[]');
        savedVideos.unshift(videoData);
        // Keep max 50 videos in history
        if (savedVideos.length > 50) savedVideos.pop();
        localStorage.setItem('nuviral-videos', JSON.stringify(savedVideos));
      } catch (e) { /* ignore storage errors */ }
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
    link.download = `nuviral-${title.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-').substring(0, 30)}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Video downloaded!');
  };

  const handleTemplate = (t: typeof templates[0]) => {
    setTitle(t.title);
    setScript(t.script);
    toast.success('Template loaded');
  };

  const handleReset = () => {
    setTitle(''); setScript(''); setVideoUrl(null); setRenderProgress(0); setRenderStage('');
  };

  return (
    <div className="space-y-5">
      {/* Billing Popup */}
      <BillingPopup
        isOpen={showBillingPopup}
        onClose={() => setShowBillingPopup(false)}
        creditsUsed={credits.aiCreditsUsed}
        creditsLimit={credits.aiCreditsLimit}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" />
            AI Video Studio
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Generate video AI realistis + voiceover Bahasa Indonesia otomatis</p>
        </div>
        {videoUrl && (
          <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-accent text-sm transition">
            <RotateCcw className="h-3.5 w-3.5" /> Buat Baru
          </button>
        )}
      </div>

      {/* Templates */}
      <div className="flex flex-wrap gap-2">
        {templates.map((t) => (
          <button key={t.label} onClick={() => handleTemplate(t)} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:border-primary/50 hover:bg-primary/5 transition">
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Left: Input (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Prompt */}
          <div className="p-4 rounded-2xl border border-border bg-card">
            <label className="text-sm font-semibold mb-1.5 block flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Video Prompt
            </label>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Deskripsikan video yang ingin dibuat...\n\nContoh:\n- Sate kambing terbakar di atas bara api dengan asap mengepul\n- Mobil sport merah melaju di jalan cyberpunk malam hari\n- Kucing lucu bermain di taman bunga"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm resize-none"
            />
            <p className="text-[11px] text-muted-foreground mt-1">Bisa pakai Bahasa Indonesia — AI otomatis translate ke English untuk hasil terbaik</p>
          </div>

          {/* Voiceover Script */}
          <div className="p-4 rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Mic className="h-4 w-4 text-primary" />
                Narasi / Voiceover
              </label>
              <button
                onClick={() => setEnableVoiceover(!enableVoiceover)}
                className={`w-9 h-5 rounded-full transition ${enableVoiceover ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${enableVoiceover ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {enableVoiceover && (
              <>
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Tulis narasi yang akan dibacakan AI (Bahasa Indonesia)...\nKosongkan untuk menggunakan prompt sebagai narasi."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition resize-none text-sm"
                />
                <p className="text-[11px] text-muted-foreground mt-1">Suara AI natural — support Bahasa Indonesia, English, dan 50+ bahasa lainnya</p>
              </>
            )}
            {!enableVoiceover && (
              <p className="text-xs text-muted-foreground py-2">Voiceover dimatikan — video tanpa suara narasi</p>
            )}
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Style */}
            <div className="p-3 rounded-2xl border border-border bg-card">
              <label className="text-xs font-semibold mb-2 block flex items-center gap-1.5">
                <Film className="h-3.5 w-3.5 text-primary" />
                Style
              </label>
              <div className="grid grid-cols-2 gap-1">
                {stylePresets.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-medium transition ${style === s.id ? 'bg-primary text-white' : 'bg-muted/50 hover:bg-muted text-muted-foreground'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Format + Duration */}
            <div className="p-3 rounded-2xl border border-border bg-card">
              <label className="text-xs font-semibold mb-2 block flex items-center gap-1.5">
                <Monitor className="h-3.5 w-3.5 text-primary" />
                Format & Durasi
              </label>
              {/* Format */}
              <div className="flex gap-1.5 mb-2">
                <button onClick={() => setFormat('portrait')} className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-medium transition ${format === 'portrait' ? 'bg-primary text-white' : 'bg-muted/50 hover:bg-muted'}`}>
                  <Smartphone className="h-3 w-3" /> 9:16
                </button>
                <button onClick={() => setFormat('landscape')} className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-medium transition ${format === 'landscape' ? 'bg-primary text-white' : 'bg-muted/50 hover:bg-muted'}`}>
                  <Monitor className="h-3 w-3" /> 16:9
                </button>
              </div>
              {/* Duration */}
              <div className="flex gap-1.5">
                {durationOptions.map((d) => (
                  <button key={d.id} onClick={() => setDuration(d.id)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition ${duration === d.id ? 'bg-primary text-white' : 'bg-muted/50 hover:bg-muted'}`}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice */}
            <div className="p-3 rounded-2xl border border-border bg-card">
              <label className="text-xs font-semibold mb-2 block flex items-center gap-1.5">
                <Volume2 className="h-3.5 w-3.5 text-primary" />
                Suara AI
              </label>
              <div className="space-y-0.5">
                {voiceOptions.map((v) => (
                  <button key={v.id} onClick={() => setVoice(v.id)} className={`w-full flex items-center justify-between px-2 py-1 rounded-lg text-[10px] transition ${voice === v.id ? 'bg-primary/10 border border-primary/30 text-primary font-medium' : 'hover:bg-muted/50'}`}>
                    <span>{v.label} — {v.desc}</span>
                    <span>{v.lang}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleRender}
            disabled={isRendering || !title.trim()}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl gradient-primary text-white font-semibold text-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {isRendering ? (
              <span className="flex items-center gap-2 text-sm">
                <Loader2 className="h-5 w-5 animate-spin" />
                {renderStage}
              </span>
            ) : (
              <>
                <Zap className="h-5 w-5" />
                Generate AI Video
              </>
            )}
          </motion.button>

          {/* Progress */}
          {isRendering && (
            <div className="space-y-1.5">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div animate={{ width: `${renderProgress}%` }} className="h-full rounded-full gradient-primary" />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{renderProgress}%</span>
                <span>Estimasi: 2-5 menit</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Video Preview (2 cols) */}
        <div className="lg:col-span-2">
          <div className="sticky top-20 space-y-3">
            {videoUrl ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    className={`w-full ${format === 'portrait' ? 'aspect-[9/16] max-h-[480px]' : 'aspect-video'} object-contain bg-black`}
                  />
                </div>

                <div className="flex gap-2">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleDownload} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl gradient-primary text-white font-medium text-sm">
                    <Download className="h-4 w-4" /> Download MP4
                  </motion.button>
                  <button onClick={handleReset} className="p-3 rounded-xl border border-border hover:bg-accent transition">
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-3 rounded-xl border border-border bg-card text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Format</span>
                    <span className="font-medium">{format === 'portrait' ? '1080×1920 (9:16)' : '1920×1080 (16:9)'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Style</span>
                    <span className="font-medium">{selectedStyle.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Voiceover</span>
                    <span className="font-medium">{enableVoiceover ? `${voice} (TTS-HD)` : 'Disabled'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Platform</span>
                    <span className="font-medium">{format === 'portrait' ? 'TikTok, Reels, Shorts' : 'YouTube, Facebook'}</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className={`flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10 ${format === 'portrait' ? 'aspect-[9/16] max-h-[480px]' : 'aspect-video'}`}>
                  <div className="text-center p-6">
                    <Video className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">Video AI akan muncul di sini</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Ketik prompt → klik Generate</p>
                  </div>
                </div>
                <div className="p-3 border-t border-border">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Film className="h-3 w-3" /> {format === 'portrait' ? '9:16' : '16:9'}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {durationOptions.find(d => d.id === duration)?.label}</span>
                    <span className="flex items-center gap-1"><Mic className="h-3 w-3" /> {enableVoiceover ? voice : 'Off'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            {!videoUrl && !isRendering && (
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-[11px] space-y-1">
                <p className="font-semibold text-primary">💡 Tips untuk hasil terbaik:</p>
                <p className="text-muted-foreground">• Deskripsikan visual secara detail (warna, cahaya, gerakan)</p>
                <p className="text-muted-foreground">• Pilih style yang sesuai dengan konten</p>
                <p className="text-muted-foreground">• Narasi bahasa Indonesia akan dibacakan dengan suara natural</p>
                <p className="text-muted-foreground">• Video 5 detik paling hemat credit</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
