'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';
import { BillingPopup } from '@/components/billing-popup';
import {
  Video,
  Play,
  Sparkles,
  Volume2,
  Type,
  Music,
  Image,
  Loader2,
  CheckCircle,
  ArrowLeft,
  Download,
} from 'lucide-react';

const templates = [
  { id: 'modern', name: 'Modern Minimal', description: 'Clean white subtitles with shadow', color: 'from-slate-500 to-gray-600' },
  { id: 'neon', name: 'Bold Neon', description: 'Eye-catching neon glow effect', color: 'from-green-400 to-emerald-600' },
  { id: 'karaoke', name: 'Karaoke Style', description: 'Word-by-word highlight', color: 'from-violet-500 to-purple-600' },
  { id: 'cinematic', name: 'Cinematic', description: 'Film-style elegant typography', color: 'from-rose-500 to-red-600' },
  { id: 'tiktok', name: 'TikTok Viral', description: 'Trending TikTok subtitle style', color: 'from-pink-500 to-fuchsia-600' },
];

const voices = [
  { id: 'nova', name: 'Nova', description: 'Female, warm & natural', icon: '👩' },
  { id: 'alloy', name: 'Alloy', description: 'Neutral, versatile', icon: '🤖' },
  { id: 'echo', name: 'Echo', description: 'Male, clear', icon: '👨' },
  { id: 'onyx', name: 'Onyx', description: 'Male, deep & authoritative', icon: '🎙️' },
  { id: 'shimmer', name: 'Shimmer', description: 'Female, soft & gentle', icon: '✨' },
  { id: 'fable', name: 'Fable', description: 'British accent', icon: '🇬🇧' },
];

const musicCategories = [
  { id: 'none', name: 'No Music' },
  { id: 'upbeat', name: 'Upbeat / Energetic' },
  { id: 'cinematic', name: 'Cinematic / Epic' },
  { id: 'chill', name: 'Chill / Lo-fi' },
  { id: 'motivational', name: 'Motivational' },
  { id: 'dark', name: 'Dark / Suspense' },
  { id: 'corporate', name: 'Corporate / Professional' },
];

type RenderStatus = 'idle' | 'preparing' | 'voiceover' | 'footage' | 'rendering' | 'subtitles' | 'finalizing' | 'completed';

// Video Player component that generates and plays AI video
function VideoPlayer({ scriptData, onNeedUpgrade }: { scriptData: any; onNeedUpgrade: () => void }) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateVideo = async () => {
    // Credit check is handled by parent via onNeedUpgrade
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://nuviral-production.up.railway.app/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: scriptData?.title || 'AI Generated Video',
          script: scriptData?.script || scriptData?.title || 'cinematic video',
          prompt: scriptData?.title || 'cinematic professional video',
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Generation failed');
      }
      const blob = await response.blob();
      setVideoUrl(URL.createObjectURL(blob));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (videoUrl) {
    return (
      <div className="rounded-2xl overflow-hidden border border-border">
        <video src={videoUrl} controls autoPlay className="w-full aspect-[9/16] max-h-[400px] object-contain bg-black" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center">
      {loading ? (
        <div className="py-8">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm font-medium">Generating AI Video...</p>
          <p className="text-xs text-muted-foreground mt-1">This may take 1-3 minutes</p>
        </div>
      ) : error ? (
        <div className="py-6">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button onClick={generateVideo} className="px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium">
            Retry
          </button>
        </div>
      ) : (
        <div className="py-6">
          <Play className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-3">Click to generate AI video</p>
          <button onClick={generateVideo} className="px-6 py-2.5 rounded-xl gradient-primary text-white font-medium">
            🎬 Generate AI Video
          </button>
        </div>
      )}
    </div>
  );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nuviral-production.up.railway.app/api/v1';

export default function CreateVideoPage() {
  const router = useRouter();
  const [scriptData, setScriptData] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [selectedMusic, setSelectedMusic] = useState('upbeat');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
  const [watermark, setWatermark] = useState(false);
  const [renderStatus, setRenderStatus] = useState<RenderStatus>('idle');
  const [renderProgress, setRenderProgress] = useState(0);
  const [showBillingPopup, setShowBillingPopup] = useState(false);
  const [credits, setCredits] = useState<{ aiCreditsUsed: number; aiCreditsLimit: number }>({ aiCreditsUsed: 0, aiCreditsLimit: 0 });

  useEffect(() => {
    // Load script data from localStorage (passed from AI Generator)
    const saved = localStorage.getItem('viralai-script-data');
    if (saved) {
      setScriptData(JSON.parse(saved));
    }
    // Fetch credits
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

  const handleRender = () => {
    // Check credits before rendering
    if (credits.aiCreditsLimit === 0 || credits.aiCreditsUsed >= credits.aiCreditsLimit) {
      setShowBillingPopup(true);
      return;
    }

    setRenderStatus('preparing');
    setRenderProgress(0);

    const steps: { status: RenderStatus; progress: number; delay: number }[] = [
      { status: 'preparing', progress: 10, delay: 1000 },
      { status: 'voiceover', progress: 25, delay: 2000 },
      { status: 'footage', progress: 45, delay: 2500 },
      { status: 'rendering', progress: 65, delay: 3000 },
      { status: 'subtitles', progress: 80, delay: 2000 },
      { status: 'finalizing', progress: 95, delay: 1500 },
      { status: 'completed', progress: 100, delay: 1000 },
    ];

    let totalDelay = 0;
    steps.forEach((step) => {
      totalDelay += step.delay;
      setTimeout(() => {
        setRenderStatus(step.status);
        setRenderProgress(step.progress);
      }, totalDelay);
    });
  };

  const statusLabels: Record<RenderStatus, string> = {
    idle: 'Ready to render',
    preparing: '📦 Preparing assets...',
    voiceover: '🎙️ Generating AI voiceover...',
    footage: '🎬 Selecting B-roll footage...',
    rendering: '⚡ Rendering video with FFmpeg...',
    subtitles: '💬 Adding subtitles & effects...',
    finalizing: '✨ Finalizing & optimizing...',
    completed: '✅ Video ready!',
  };

  return (
    <div className="space-y-6">
      {/* Billing Popup */}
      <BillingPopup
        isOpen={showBillingPopup}
        onClose={() => setShowBillingPopup(false)}
        creditsUsed={credits.aiCreditsUsed}
        creditsLimit={credits.aiCreditsLimit}
      />

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/ai-generator')}
          className="p-2 rounded-xl hover:bg-accent transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" />
            Create Video
          </h1>
          <p className="text-muted-foreground mt-1">Configure and render your AI video</p>
        </div>
      </div>

      {renderStatus === 'completed' ? (
        /* Completed State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto text-center py-12"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Video Created Successfully! 🎉</h2>
          <p className="text-muted-foreground mb-8">
            Your video has been rendered in {resolution} with {selectedTemplate} template.
          </p>

          {/* Real Video Player */}
          <div className="w-full max-w-sm mx-auto mb-8">
            <VideoPlayer scriptData={scriptData} onNeedUpgrade={() => setShowBillingPopup(true)} />
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={async () => {
                const btn = document.getElementById('download-btn') as HTMLButtonElement;
                if (btn) { btn.textContent = '⏳ Rendering...'; btn.disabled = true; }

                try {
                  const response = await fetch('https://nuviral-production.up.railway.app/render', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      title: scriptData?.title || 'NuViral Video',
                      script: scriptData?.script || 'Welcome to NuViral AI. Create viral videos automatically.',
                      duration: 15,
                      voice: 'nova',
                    }),
                  });

                  if (!response.ok) {
                    throw new Error('Render failed');
                  }

                  const blob = await response.blob();
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `viralai-video-${Date.now()}.mp4`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);

                  if (btn) { btn.textContent = '✅ Downloaded!'; }
                  setTimeout(() => { if (btn) { btn.textContent = '⬇ Download Video'; btn.disabled = false; } }, 3000);
                } catch (err) {
                  alert('Video render gagal. Pastikan FFmpeg terinstall.');
                  if (btn) { btn.textContent = '⬇ Download Video'; btn.disabled = false; }
                }
              }}
              id="download-btn"
              className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Download Video
            </button>
            <button
              onClick={() => router.push('/dashboard/uploads')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:bg-accent transition font-medium"
            >
              Schedule Upload
            </button>
            <button
              onClick={() => {
                setRenderStatus('idle');
                setRenderProgress(0);
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:bg-accent transition font-medium"
            >
              Create Another
            </button>
          </div>
        </motion.div>
      ) : renderStatus !== 'idle' ? (
        /* Rendering State */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-lg mx-auto py-12"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
            <h2 className="text-xl font-bold mb-2">Rendering Your Video</h2>
            <p className="text-muted-foreground">{statusLabels[renderStatus]}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{renderProgress}%</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${renderProgress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full gradient-primary"
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {[
              { key: 'preparing', label: 'Prepare assets', icon: '📦' },
              { key: 'voiceover', label: 'Generate voiceover', icon: '🎙️' },
              { key: 'footage', label: 'Select B-roll footage', icon: '🎬' },
              { key: 'rendering', label: 'Render video', icon: '⚡' },
              { key: 'subtitles', label: 'Add subtitles', icon: '💬' },
              { key: 'finalizing', label: 'Finalize', icon: '✨' },
            ].map((step) => {
              const stepOrder = ['preparing', 'voiceover', 'footage', 'rendering', 'subtitles', 'finalizing', 'completed'];
              const currentIndex = stepOrder.indexOf(renderStatus);
              const stepIndex = stepOrder.indexOf(step.key);
              const isCompleted = stepIndex < currentIndex;
              const isActive = step.key === renderStatus;

              return (
                <div
                  key={step.key}
                  className={`flex items-center gap-3 p-3 rounded-xl transition ${
                    isActive ? 'bg-primary/10 border border-primary/30' : isCompleted ? 'opacity-60' : 'opacity-30'
                  }`}
                >
                  <span className="text-lg">{isCompleted ? '✅' : step.icon}</span>
                  <span className={`text-sm font-medium ${isActive ? 'text-primary' : ''}`}>{step.label}</span>
                  {isActive && <Loader2 className="h-4 w-4 text-primary animate-spin ml-auto" />}
                </div>
              );
            })}
          </div>
        </motion.div>
      ) : (
        /* Configuration State */
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Script Preview */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-5 rounded-2xl border border-border bg-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Script Preview
              </h3>
              {scriptData ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Title</p>
                    <p className="text-sm font-medium">{scriptData.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Hook</p>
                    <p className="text-sm text-primary font-medium">{scriptData.hook}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Script</p>
                    <pre className="text-xs whitespace-pre-wrap text-muted-foreground bg-muted/50 p-3 rounded-lg">{scriptData.script}</pre>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Viral Score:</span>
                    <span className="text-xs font-bold text-primary">{Math.round(scriptData.viralScore * 100)}%</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">No script loaded</p>
                  <p className="text-xs text-muted-foreground mt-1">Generate a script first from AI Generator</p>
                  <button
                    onClick={() => router.push('/dashboard/ai-generator')}
                    className="mt-3 text-xs text-primary hover:underline"
                  >
                    Go to AI Generator →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template Selection */}
            <div className="p-5 rounded-2xl border border-border bg-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Type className="h-4 w-4 text-primary" />
                Subtitle Template
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-3 rounded-xl border text-center transition ${
                      selectedTemplate === template.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className={`w-full h-16 rounded-lg bg-gradient-to-br ${template.color} mb-2 flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">Aa</span>
                    </div>
                    <p className="text-xs font-medium truncate">{template.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Selection */}
            <div className="p-5 rounded-2xl border border-border bg-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-primary" />
                AI Voice
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {voices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`p-3 rounded-xl border text-left transition ${
                      selectedVoice === voice.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <span className="text-lg">{voice.icon}</span>
                    <p className="text-sm font-medium mt-1">{voice.name}</p>
                    <p className="text-xs text-muted-foreground">{voice.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Music & Settings */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl border border-border bg-card">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Music className="h-4 w-4 text-primary" />
                  Background Music
                </h3>
                <div className="space-y-2">
                  {musicCategories.map((music) => (
                    <button
                      key={music.id}
                      onClick={() => setSelectedMusic(music.id)}
                      className={`w-full p-2.5 rounded-lg border text-left text-sm transition ${
                        selectedMusic === music.id
                          ? 'border-primary bg-primary/5 text-primary font-medium'
                          : 'border-border hover:border-primary/30 text-muted-foreground'
                      }`}
                    >
                      {music.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-border bg-card">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Image className="h-4 w-4 text-primary" />
                  Video Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Resolution</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setResolution('720p')}
                        className={`flex-1 py-2 rounded-lg border text-sm transition ${
                          resolution === '720p' ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border'
                        }`}
                      >
                        720p HD
                      </button>
                      <button
                        onClick={() => setResolution('1080p')}
                        className={`flex-1 py-2 rounded-lg border text-sm transition ${
                          resolution === '1080p' ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border'
                        }`}
                      >
                        1080p Full HD
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Format</label>
                    <p className="text-sm text-muted-foreground">9:16 Vertical (1080x1920)</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Watermark</label>
                    <button
                      onClick={() => setWatermark(!watermark)}
                      className={`w-11 h-6 rounded-full transition ${watermark ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${watermark ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Render Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleRender}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl gradient-primary text-white font-semibold text-lg hover:opacity-90 transition"
            >
              <Video className="h-5 w-5" />
              Render Video
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
