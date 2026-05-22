'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
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
} from 'lucide-react';

const voiceOptions = [
  { id: 'nova', label: 'Nova', desc: 'Female, warm' },
  { id: 'alloy', label: 'Alloy', desc: 'Neutral' },
  { id: 'echo', label: 'Echo', desc: 'Male, clear' },
  { id: 'onyx', label: 'Onyx', desc: 'Male, deep' },
  { id: 'shimmer', label: 'Shimmer', desc: 'Female, soft' },
];

const templates = [
  { label: '🔥 AI Tools', title: '5 AI Tools Yang Akan Mengubah Hidupmu', script: 'Stop scrolling.\nIni 5 AI tools yang akan mengubah hidupmu.\nNomor 1: ChatGPT bisa buat website dalam hitungan detik.\nNomor 2: Midjourney buat gambar fotorealistis.\nNomor 3: ElevenLabs bisa kloning suara siapapun.\nNomor 4: Runway ML buat video kualitas Hollywood.\nNomor 5: Yang paling menakutkan, bisa menggantikan pekerjaanmu.\nFollow untuk update AI terbaru.' },
  { label: '💪 Motivasi', title: 'Kamu Bukan Malas, Kamu Takut', script: 'Kamu bukan malas.\nDengarkan ini baik-baik.\nHal yang selama ini kamu tunda?\nBukan karena kamu malas.\nTapi karena kamu takut.\nTakut gagal. Takut berhasil. Takut berubah.\nTapi tahukah kamu?\nRasa takut dan semangat itu rasanya sama.\nJadi mungkin kamu bukan takut.\nMungkin kamu sedang bersemangat.\nLakukan sekarang.' },
  { label: '💰 Bisnis', title: 'Cara Dapat 10 Juta Dalam 30 Hari', script: 'Saya dapat 10 juta bulan lalu.\nBukan dropship. Bukan crypto.\nIni jasa AI automation.\nLangkah 1: Pelajari ChatGPT dan Zapier.\nLangkah 2: Hubungi 50 bisnis lokal.\nLangkah 3: Tawarkan otomasi email dan customer service mereka.\nSaya charge 2 juta per klien.\nDapat 5 klien di bulan pertama.\nPeluangnya masih sangat besar.' },
  { label: '🎬 Cinematic', title: 'Cyberpunk City at Night', script: 'A futuristic cyberpunk city at night.\nNeon lights reflecting on wet streets.\nFlying cars passing between massive skyscrapers.\nRain falling through holographic advertisements.\nA lone figure walking through the crowd.\nThe future is here.' },
];

export default function QuickVideoPage() {
  const [title, setTitle] = useState('');
  const [script, setScript] = useState('');
  const [voice, setVoice] = useState('nova');
  const [format, setFormat] = useState<'portrait' | 'landscape'>('portrait');
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStage, setRenderStage] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleRender = async () => {
    if (!title.trim()) { toast.error('Masukkan judul video'); return; }

    setIsRendering(true);
    setRenderProgress(5);
    setRenderStage('Translating prompt...');
    setVideoUrl(null);

    const progressInterval = setInterval(() => {
      setRenderProgress(prev => {
        if (prev < 20) { setRenderStage('🌐 Translating & enhancing prompt...'); return prev + 2; }
        if (prev < 50) { setRenderStage('🎬 AI generating video frames...'); return prev + 0.8; }
        if (prev < 70) { setRenderStage('🎙️ Generating voiceover...'); return prev + 1; }
        if (prev < 80) { setRenderStage('🔗 Merging video + audio...'); return prev + 0.5; }
        return prev;
      });
    }, 2000);

    try {
      const response = await fetch('https://nuviral-production.up.railway.app/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          script: script.trim() || title.trim(),
          prompt: title.trim(),
          voice,
          format,
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
      setRenderStage('✅ Done!');
      toast.success('Video AI berhasil dibuat! 🎬');
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
    link.download = `nuviral-${title.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-')}.mp4`;
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
    setTitle('');
    setScript('');
    setVideoUrl(null);
    setRenderProgress(0);
    setRenderStage('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-primary" />
          AI Video Studio
        </h1>
        <p className="text-muted-foreground mt-1">Generate video AI realistis dari teks. Ketik prompt → AI buat video + voiceover otomatis.</p>
      </div>

      {/* Templates */}
      <div className="flex flex-wrap gap-2">
        {templates.map((t) => (
          <button key={t.label} onClick={() => handleTemplate(t)} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:border-primary/50 hover:bg-primary/5 transition">
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Input (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Prompt / Title */}
          <div className="p-5 rounded-2xl border border-border bg-card">
            <label className="text-sm font-semibold mb-2 block flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Video Prompt
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Deskripsikan video yang ingin dibuat... (contoh: sate kambing terbakar di atas bara api)"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1.5">AI akan menerjemahkan ke English dan generate video realistis</p>
          </div>

          {/* Script / Voiceover Text */}
          <div className="p-5 rounded-2xl border border-border bg-card">
            <label className="text-sm font-semibold mb-2 block flex items-center gap-2">
              <Mic className="h-4 w-4 text-primary" />
              Script Narasi (Voiceover)
            </label>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Tulis narasi yang akan dibacakan AI...\nKosongkan jika tidak perlu voiceover.\n\nContoh:\nIni adalah sate kambing terbakar.\nDipanggang di atas bara api selama 30 menit.\nBumbu kacang melimpah."
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition resize-none text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1.5">Narasi akan dibacakan dalam bahasa Indonesia dengan suara AI natural</p>
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Format */}
            <div className="p-4 rounded-2xl border border-border bg-card">
              <label className="text-xs font-semibold mb-2 block flex items-center gap-2">
                <Film className="h-3.5 w-3.5 text-primary" />
                Format Video
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFormat('portrait')}
                  className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border transition ${format === 'portrait' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                >
                  <Smartphone className="h-5 w-5" />
                  <span className="text-[10px] font-medium">Portrait 9:16</span>
                  <span className="text-[9px] text-muted-foreground">TikTok, Reels</span>
                </button>
                <button
                  onClick={() => setFormat('landscape')}
                  className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border transition ${format === 'landscape' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                >
                  <Monitor className="h-5 w-5" />
                  <span className="text-[10px] font-medium">Landscape 16:9</span>
                  <span className="text-[9px] text-muted-foreground">YouTube</span>
                </button>
              </div>
            </div>

            {/* Voice */}
            <div className="p-4 rounded-2xl border border-border bg-card">
              <label className="text-xs font-semibold mb-2 block flex items-center gap-2">
                <Mic className="h-3.5 w-3.5 text-primary" />
                Suara AI
              </label>
              <div className="space-y-1">
                {voiceOptions.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVoice(v.id)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition ${voice === v.id ? 'bg-primary/10 border border-primary/30 text-primary font-medium' : 'hover:bg-muted/50'}`}
                  >
                    <span>{v.label}</span>
                    <span className="text-[10px] text-muted-foreground">{v.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Render Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleRender}
            disabled={isRendering || !title.trim()}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl gradient-primary text-white font-semibold text-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {isRendering ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">{renderStage} ({renderProgress}%)</span>
              </>
            ) : (
              <>
                <Video className="h-5 w-5" />
                Generate AI Video
              </>
            )}
          </motion.button>

          {/* Progress */}
          {isRendering && (
            <div className="space-y-2">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div animate={{ width: `${renderProgress}%` }} className="h-full rounded-full gradient-primary transition-all" />
              </div>
              <p className="text-xs text-muted-foreground text-center">AI video generation membutuhkan 2-5 menit</p>
            </div>
          )}
        </div>

        {/* Right: Video Preview (2 cols) */}
        <div className="lg:col-span-2">
          <div className="sticky top-20">
            {videoUrl ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                {/* Video Player */}
                <div className="rounded-2xl overflow-hidden border border-border bg-black">
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    className={`w-full ${format === 'portrait' ? 'aspect-[9/16] max-h-[500px]' : 'aspect-video'} object-contain bg-black`}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl gradient-primary text-white font-medium text-sm"
                  >
                    <Download className="h-4 w-4" />
                    Download MP4
                  </motion.button>
                  <button onClick={handleReset} className="p-3 rounded-xl border border-border hover:bg-accent transition">
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-3 rounded-xl bg-muted/30 text-[11px] space-y-0.5 text-muted-foreground">
                  <p>Format: MP4 • {format === 'portrait' ? '1080x1920 (9:16)' : '1920x1080 (16:9)'}</p>
                  <p>AI Model: Minimax Video-01</p>
                  <p>Voice: OpenAI TTS-HD ({voice})</p>
                  <p>Ready for: {format === 'portrait' ? 'TikTok, Instagram Reels, YouTube Shorts' : 'YouTube, Facebook'}</p>
                </div>
              </motion.div>
            ) : (
              /* Empty State */
              <div className="rounded-2xl border border-border bg-card p-8 text-center">
                <div className={`mx-auto mb-4 rounded-xl bg-muted/50 flex items-center justify-center ${format === 'portrait' ? 'w-32 h-56' : 'w-56 h-32'}`}>
                  <Video className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Video AI akan muncul di sini</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Ketik prompt lalu klik Generate</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
