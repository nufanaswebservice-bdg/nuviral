'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Video,
  Download,
  Loader2,
  Sparkles,
  Play,
  RotateCcw,
  Clock,
  Type,
  Palette,
} from 'lucide-react';

const bgPresets = [
  { id: 'dark_purple', label: 'Dark Purple', color: '0x0f0a2e', accent: '0x7c3aed' },
  { id: 'dark_blue', label: 'Dark Blue', color: '0x0a1628', accent: '0x3b82f6' },
  { id: 'dark_green', label: 'Dark Green', color: '0x0a1f0a', accent: '0x22c55e' },
  { id: 'dark_red', label: 'Dark Red', color: '0x1f0a0a', accent: '0xef4444' },
  { id: 'pure_black', label: 'Pure Black', color: '0x000000', accent: '0xffffff' },
  { id: 'midnight', label: 'Midnight', color: '0x0f172a', accent: '0xf59e0b' },
];

const durationOptions = [10, 15, 20, 30];

const scriptTemplates = [
  {
    label: '🔥 AI Tools',
    title: '5 AI Tools That Will Replace You',
    script: 'Stop scrolling.\nThese 5 AI tools will change everything.\n1. ChatGPT builds websites in seconds.\n2. Midjourney creates photorealistic images.\n3. ElevenLabs clones any voice.\n4. Runway ML makes Hollywood videos.\n5. The scariest one can replace your job.\nFollow for more AI updates.',
  },
  {
    label: '💪 Motivation',
    title: "You're Not Lazy, You're Scared",
    script: "You're not lazy.\nI need you to hear this.\nThat thing you've been putting off?\nYou're not avoiding it because you're lazy.\nYou're scared of what happens if you try.\nBut fear and excitement feel the same.\nSo maybe you're not scared.\nMaybe you're excited.\nGo do the thing. Now.",
  },
  {
    label: '💰 Business',
    title: 'I Made $10K in 30 Days',
    script: "I made $10,000 last month.\nNo dropshipping. No crypto.\nIt's AI automation services.\nStep 1: Learn ChatGPT and Zapier.\nStep 2: Reach out to 50 businesses.\nStep 3: Offer to automate their work.\nI charge $2,000 per client.\nGot 5 clients in month one.\nThe opportunity is massive.",
  },
  {
    label: '📚 Study Tips',
    title: 'Remember Everything You Read',
    script: "You're studying wrong.\nHere's how to remember 90% of what you read.\nIt's called the Feynman Technique.\nStep 1: Read the topic once.\nStep 2: Explain it like teaching a 5 year old.\nStep 3: Find where you got stuck.\nStep 4: Go back and fill the gaps.\nThis changed my grades forever.",
  },
];

export default function QuickVideoPage() {
  const [title, setTitle] = useState('');
  const [script, setScript] = useState('');
  const [duration, setDuration] = useState(15);
  const [bgPreset, setBgPreset] = useState('dark_purple');
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const selectedBg = bgPresets.find(b => b.id === bgPreset) || bgPresets[0];

  const handleRender = async () => {
    if (!title.trim() || !script.trim()) {
      toast.error('Isi judul dan script terlebih dahulu');
      return;
    }

    setIsRendering(true);
    setRenderProgress(10);
    setVideoUrl(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setRenderProgress(prev => Math.min(prev + 5, 85));
    }, 1000);

    try {
      const response = await fetch('https://nuviral-production.up.railway.app/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          script: script.trim(),
          duration,
          voice: 'nova',
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Render failed');
      }

      setRenderProgress(95);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setRenderProgress(100);
      toast.success('Video berhasil dibuat!');
    } catch (err: any) {
      clearInterval(progressInterval);
      toast.error(`Gagal: ${err.message}`);
      setRenderProgress(0);
    } finally {
      setIsRendering(false);
    }
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `${title.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-')}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Video downloaded!');
  };

  const handleTemplate = (template: typeof scriptTemplates[0]) => {
    setTitle(template.title);
    setScript(template.script);
    toast.success(`Template "${template.label}" loaded`);
  };

  const handleReset = () => {
    setTitle('');
    setScript('');
    setVideoUrl(null);
    setRenderProgress(0);
  };

  // Count sentences for preview
  const sentences = script.split(/[.\n!?]+/).filter(s => s.trim().length > 2);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Video className="h-6 w-6 text-primary" />
          Quick Video Creator
        </h1>
        <p className="text-muted-foreground mt-1">Ketik judul dan script, langsung jadi video siap upload</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="space-y-4">
          {/* Templates */}
          <div className="p-4 rounded-2xl border border-border bg-card">
            <p className="text-sm font-medium mb-2">Quick Templates:</p>
            <div className="flex flex-wrap gap-2">
              {scriptTemplates.map((t) => (
                <button
                  key={t.label}
                  onClick={() => handleTemplate(t)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:border-primary/50 hover:bg-primary/5 transition"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div className="p-5 rounded-2xl border border-border bg-card">
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Type className="h-4 w-4 text-primary" />
              Judul Video
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: 5 AI Tools That Will Replace You"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
              maxLength={80}
            />
            <p className="text-xs text-muted-foreground mt-1">{title.length}/80 karakter</p>
          </div>

          {/* Script Input */}
          <div className="p-5 rounded-2xl border border-border bg-card">
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Script / Teks Video
            </label>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder={"Tulis script video kamu di sini.\nSetiap kalimat/baris akan muncul sebagai subtitle.\n\nContoh:\nStop scrolling.\nIni 5 AI tools yang akan mengubah hidupmu.\n1. ChatGPT bisa buat website.\n2. Midjourney buat gambar realistis.\nFollow untuk tips AI lainnya."}
              rows={8}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {sentences.length} subtitle segments • Pisahkan dengan titik atau enter
            </p>
          </div>

          {/* Settings */}
          <div className="p-5 rounded-2xl border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              {/* Duration */}
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Durasi
                </label>
                <div className="flex gap-1.5">
                  {durationOptions.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                        duration === d
                          ? 'bg-primary text-white'
                          : 'border border-border hover:border-primary/50'
                      }`}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Background */}
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  Background
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {bgPresets.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setBgPreset(bg.id)}
                      title={bg.label}
                      className={`w-7 h-7 rounded-lg border-2 transition ${
                        bgPreset === bg.id ? 'border-primary scale-110' : 'border-border'
                      }`}
                      style={{ backgroundColor: `#${bg.color.replace('0x', '')}` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Render Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleRender}
            disabled={isRendering || !title.trim() || !script.trim()}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl gradient-primary text-white font-semibold text-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {isRendering ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Rendering Video... {renderProgress}%
              </>
            ) : (
              <>
                <Video className="h-5 w-5" />
                Render Video
              </>
            )}
          </motion.button>

          {/* Progress Bar */}
          {isRendering && (
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${renderProgress}%` }}
                className="h-full rounded-full gradient-primary"
              />
            </div>
          )}
        </div>

        {/* Right: Preview & Result */}
        <div className="space-y-4">
          {videoUrl ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Video Player */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  className="w-full aspect-[9/16] max-h-[500px] object-contain bg-black"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition"
                >
                  <Download className="h-4 w-4" />
                  Download MP4
                </motion.button>
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border hover:bg-accent transition"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              {/* Video Info */}
              <div className="p-4 rounded-xl bg-muted/50 text-xs space-y-1">
                <p><span className="text-muted-foreground">Format:</span> MP4 (H.264) • 1080x1920 • 9:16</p>
                <p><span className="text-muted-foreground">Durasi:</span> {duration} detik</p>
                <p><span className="text-muted-foreground">Subtitle:</span> {sentences.length} segments</p>
                <p><span className="text-muted-foreground">Ready for:</span> TikTok, YouTube Shorts, Instagram Reels</p>
              </div>
            </motion.div>
          ) : (
            /* Preview Mockup */
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div
                className="aspect-[9/16] max-h-[500px] relative flex flex-col items-center justify-center p-6"
                style={{ backgroundColor: `#${selectedBg.color.replace('0x', '')}` }}
              >
                {/* Vignette overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />

                {/* Title preview */}
                <div className="relative z-10 text-center">
                  <p className="text-white font-bold text-lg mb-2">
                    {title || 'Judul Video Kamu'}
                  </p>
                  <p className="text-xs mb-8" style={{ color: `#${selectedBg.accent.replace('0x', '')}` }}>
                    ViralAI
                  </p>
                </div>

                {/* Subtitle preview */}
                <div className="relative z-10 absolute bottom-20 left-4 right-4 text-center">
                  <p className="text-white font-bold text-sm bg-black/40 inline-block px-3 py-1 rounded-lg">
                    {sentences[0] || 'Subtitle akan muncul di sini...'}
                  </p>
                </div>

                {/* Progress bar preview */}
                <div className="absolute bottom-4 left-0 right-0 h-1 bg-white/10">
                  <div className="h-full w-1/3" style={{ backgroundColor: `#${selectedBg.accent.replace('0x', '')}` }} />
                </div>

                {/* Counter */}
                <div className="absolute top-4 left-4 text-white/50 text-xs">
                  1/{sentences.length || 1}
                </div>
              </div>

              <div className="p-3 border-t border-border text-center">
                <p className="text-xs text-muted-foreground">Preview • Klik "Render Video" untuk membuat</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
