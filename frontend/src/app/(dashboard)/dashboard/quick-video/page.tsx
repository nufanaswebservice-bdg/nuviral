'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';
import { BillingPopup } from '@/components/billing-popup';
import {
  Video, Download, Loader2, Sparkles, RotateCcw, Mic,
  Smartphone, Monitor, Wand2, Clock, Zap, Volume2, Send,
  ChevronDown, Settings2, X, Image as ImageIcon, MessageSquare,
  Copy, Check, ListTodo, ArrowRight, Trash2, ChevronRight,
} from 'lucide-react';

const voiceOptions = ['nova', 'alloy', 'echo', 'onyx', 'shimmer'];
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
  cinematic: 'cinematic, film grain, dramatic lighting',
  anime: 'anime style, vibrant colors, Japanese animation',
  realistic: 'photorealistic, natural lighting, 8K',
  dark: 'dark atmosphere, moody lighting, suspense',
  neon: 'neon lights, cyberpunk, futuristic',
  nature: 'natural landscape, golden hour, peaceful',
  food: 'food photography, appetizing, close-up',
  product: 'product showcase, clean background, professional',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nuviral-production.up.railway.app/api/v1';

interface Task {
  id: string;
  title: string;
  type: 'chat' | 'image' | 'video';
  messages: { role: string; content: string }[];
  createdAt: string;
}

// Generate suggested follow-up questions from AI response
function generateSuggestions(reply: string, originalQuestion: string): string[] {
  // Extract key topics from reply for contextual suggestions
  const lowerReply = reply.toLowerCase();
  const lowerQ = originalQuestion.toLowerCase();

  const suggestions: string[] = [];

  if (lowerQ.includes('ide') || lowerQ.includes('konten') || lowerReply.includes('ide')) {
    suggestions.push('Buatkan script lengkap untuk ide nomor 1');
    suggestions.push('Buatkan caption dan 30 hashtag viral untuk konten ini');
    suggestions.push('Bagaimana strategi posting terbaik untuk konten ini?');
  }
  if (lowerQ.includes('script') || lowerReply.includes('script')) {
    suggestions.push('Buatkan versi yang lebih pendek (30 detik)');
    suggestions.push('Tambahkan hook yang lebih kuat di awal');
    suggestions.push('Buat variasi script untuk Instagram Reels');
  }
  if (lowerQ.includes('hashtag') || lowerReply.includes('hashtag') || lowerReply.includes('#')) {
    suggestions.push('Analisis performa hashtag ini di TikTok vs Instagram');
    suggestions.push('Buatkan caption yang cocok untuk hashtag ini');
    suggestions.push('Rekomendasikan niche hashtag yang kurang kompetitif');
  }
  if (lowerQ.includes('strategi') || lowerReply.includes('strategi') || lowerReply.includes('algoritma')) {
    suggestions.push('Berikan contoh jadwal posting selama 1 bulan');
    suggestions.push('Bagaimana cara meningkatkan engagement rate?');
    suggestions.push('Analisis waktu posting terbaik untuk setiap platform');
  }
  if (lowerReply.includes('tren') || lowerReply.includes('viral') || lowerQ.includes('tren')) {
    suggestions.push('Tren apa yang paling potensial bulan ini?');
    suggestions.push('Bagaimana cara memanfaatkan tren ini dengan cepat?');
    suggestions.push('Buatkan konten yang mengikuti tren ini');
  }

  // Generic suggestions if nothing specific
  if (suggestions.length < 3) {
    suggestions.push('Jelaskan lebih detail dengan contoh nyata');
    suggestions.push('Buatkan template yang bisa langsung digunakan');
    suggestions.push('Apa langkah pertama yang harus saya lakukan sekarang?');
    suggestions.push('Berikan tips tambahan yang sering diabaikan creator');
  }

  // Always return 3 unique suggestions
  return suggestions.slice(0, 3);
}

export default function QuickVideoPage() {
  const [activeTab, setActiveTab] = useState<'video' | 'image' | 'chat'>('chat');
  const [prompt, setPrompt] = useState('');
  const [narasi, setNarasi] = useState('');
  const [showNarasi, setShowNarasi] = useState(false);
  const [voice, setVoice] = useState('nova');
  const [format, setFormat] = useState<'portrait' | 'landscape'>('portrait');
  const [duration, setDuration] = useState('medium');
  const [style, setStyle] = useState('cinematic');
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStage, setRenderStage] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showBillingPopup, setShowBillingPopup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [credits, setCredits] = useState<{ aiCreditsUsed: number; aiCreditsLimit: number }>({ aiCreditsUsed: 0, aiCreditsLimit: 0 });
  const [userName, setUserName] = useState('');
  const [copied, setCopied] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTasks, setShowTasks] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { const u = JSON.parse(localStorage.getItem('user') || '{}'); setUserName(u.name || u.email?.split('@')[0] || ''); } catch {}
    // Load saved tasks
    try { const saved = JSON.parse(localStorage.getItem('nuviral-tasks') || '[]'); setTasks(saved); } catch {}
    const fetchCredits = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get(`${API_URL}/subscription/current`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (res.data) setCredits({ aiCreditsUsed: res.data.aiCreditsUsed ?? 0, aiCreditsLimit: res.data.aiCreditsLimit ?? 0 });
      } catch { setCredits({ aiCreditsUsed: 0, aiCreditsLimit: 0 }); }
    };
    fetchCredits();
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const checkCredits = () => {
    if (credits.aiCreditsLimit === 0 || credits.aiCreditsUsed >= credits.aiCreditsLimit) { setShowBillingPopup(true); return false; }
    return true;
  };

  // VIDEO GENERATION
  const handleRenderVideo = async () => {
    if (!prompt.trim()) { toast.error('Masukkan prompt'); return; }
    if (!checkCredits()) return;
    setIsRendering(true); setRenderProgress(5); setRenderStage('Memproses...'); setVideoUrl(null);
    const progressInterval = setInterval(() => { setRenderProgress(prev => { if (prev < 80) return prev + 0.5; return prev; }); }, 2000);
    try {
      const authToken = localStorage.getItem('accessToken') || '';
      const response = await fetch('https://nuviral-production.up.railway.app/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ title: prompt.trim(), script: showNarasi ? (narasi.trim() || prompt.trim()) : '', prompt: `${prompt.trim()}, ${stylePrompts[style] || ''}`, voice, format, duration, style }),
      });
      clearInterval(progressInterval);
      if (!response.ok) { const err = await response.json().catch(() => ({})); throw new Error(err.detail || 'Failed'); }
      setRenderProgress(95); setRenderStage('Downloading...');
      const blob = await response.blob();
      setVideoUrl(URL.createObjectURL(blob)); setRenderProgress(100); setRenderStage('Selesai!');
      toast.success('Video berhasil! 🎬');
      try { const saved = JSON.parse(localStorage.getItem('nuviral-videos') || '[]'); saved.unshift({ id: `vid-${Date.now()}`, title: prompt.trim(), style, duration, format, voice, blobUrl: URL.createObjectURL(blob), blobSize: blob.size, createdAt: new Date().toISOString(), status: 'completed' }); localStorage.setItem('nuviral-videos', JSON.stringify(saved.slice(0, 50))); } catch {}
    } catch (err: any) { clearInterval(progressInterval); toast.error(`Gagal: ${err.message}`); setRenderProgress(0); setRenderStage(''); }
    finally { setIsRendering(false); }
  };

  // IMAGE GENERATION
  const handleGenerateImage = async () => {
    if (!prompt.trim()) { toast.error('Masukkan prompt'); return; }
    if (!checkCredits()) return;
    setIsGeneratingImage(true); setImageUrl(null);
    try {
      const token = localStorage.getItem('accessToken') || '';
      const res = await fetch(`${API_URL}/ai/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ prompt: `${prompt.trim()}, ${stylePrompts[style] || ''}`, aspect_ratio: format === 'portrait' ? '9:16' : '16:9', style: stylePrompts[style] }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Failed'); }
      const data = await res.json();
      setImageUrl(data.imageUrl);
      toast.success('Gambar berhasil! 🖼️');
    } catch (err: any) { toast.error(`Gagal: ${err.message}`); }
    finally { setIsGeneratingImage(false); }
  };

  // CHAT
  const handleChat = async () => {
    if (!prompt.trim()) return;
    const userMsg = { role: 'user', content: prompt.trim() };
    const questionText = prompt.trim();
    setChatMessages(prev => [...prev, userMsg]);
    setPrompt(''); setIsChatLoading(true); setSuggestions([]);
    try {
      const token = localStorage.getItem('accessToken') || '';
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: userMsg.content, history: chatMessages }),
      });
      if (!res.ok) throw new Error('Chat failed');
      const data = await res.json();
      const newMessages = [...chatMessages, userMsg, { role: 'assistant', content: data.reply }];
      setChatMessages(newMessages);
      // Generate suggestions based on reply
      setSuggestions(generateSuggestions(data.reply, questionText));
      // Save task
      const taskTitle = questionText.length > 50 ? questionText.substring(0, 50) + '...' : questionText;
      const newTask: Task = {
        id: currentTaskId || `task-${Date.now()}`,
        title: taskTitle,
        type: 'chat',
        messages: newMessages,
        createdAt: new Date().toISOString(),
      };
      setCurrentTaskId(newTask.id);
      setTasks(prev => {
        const existing = prev.find(t => t.id === newTask.id);
        const updated = existing ? prev.map(t => t.id === newTask.id ? newTask : t) : [newTask, ...prev];
        try { localStorage.setItem('nuviral-tasks', JSON.stringify(updated.slice(0, 50))); } catch {}
        return updated.slice(0, 50);
      });
    } catch { setChatMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, terjadi error. Coba lagi.' }]); }
    finally { setIsChatLoading(false); }
  };

  const loadTask = (task: Task) => {
    setChatMessages(task.messages);
    setCurrentTaskId(task.id);
    setSuggestions([]);
    setShowTasks(false);
    setActiveTab('chat');
  };

  const deleteTask = (id: string) => {
    setTasks(prev => {
      const updated = prev.filter(t => t.id !== id);
      try { localStorage.setItem('nuviral-tasks', JSON.stringify(updated)); } catch {}
      return updated;
    });
    if (currentTaskId === id) { setChatMessages([]); setCurrentTaskId(null); }
  };

  const handleSubmit = () => {
    if (activeTab === 'video') handleRenderVideo();
    else if (activeTab === 'image') handleGenerateImage();
    else handleChat();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } };

  const handleCopy = (text: string, idx: number) => { navigator.clipboard.writeText(text); setCopied(idx); setTimeout(() => setCopied(false as any), 2000); };

  const startNewChat = () => { setChatMessages([]); setCurrentTaskId(null); setSuggestions([]); setPrompt(''); };
  const resetAll = () => { setVideoUrl(null); setImageUrl(null); setPrompt(''); setNarasi(''); setRenderProgress(0); setRenderStage(''); };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] md:h-[calc(100vh-7rem)]">
      <BillingPopup isOpen={showBillingPopup} onClose={() => setShowBillingPopup(false)} creditsUsed={credits.aiCreditsUsed} creditsLimit={credits.aiCreditsLimit} />

      {/* Tab Selector - Fixed top */}
      <div className="flex items-center justify-between py-2 md:py-3 flex-shrink-0 px-1">
        <div className="flex gap-1 p-1 rounded-xl bg-muted/50">
          {[
            { id: 'chat', label: 'Chat AI', icon: MessageSquare },
            { id: 'image', label: 'Gambar', icon: ImageIcon },
            { id: 'video', label: 'Video', icon: Video },
          ].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); }} className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition ${activeTab === tab.id ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <tab.icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
              {tab.label}
            </button>
          ))}
        </div>
        {/* All Tasks Button */}
        <button
          onClick={() => setShowTasks(!showTasks)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition border ${showTasks ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border hover:bg-accent text-muted-foreground'}`}
        >
          <ListTodo className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">All Tasks</span>
          {tasks.length > 0 && <span className="bg-primary text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">{tasks.length > 9 ? '9+' : tasks.length}</span>}
        </button>
      </div>

      {/* All Tasks Panel */}
      <AnimatePresence>
        {showTasks && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex-shrink-0 border-b border-border overflow-hidden"
          >
            <div className="p-3 bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold">Riwayat Chat ({tasks.length})</span>
                <button onClick={startNewChat} className="text-xs text-primary hover:underline flex items-center gap-1">
                  + Chat Baru
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {tasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">Belum ada riwayat chat</p>
                ) : tasks.map(task => (
                  <div key={task.id} className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition max-w-[160px] ${currentTaskId === task.id ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-card border-border hover:border-primary/30'}`}
                    onClick={() => loadTask(task)}>
                    <MessageSquare className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{task.title}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="flex-shrink-0 hover:text-destructive ml-1">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-2 md:px-4 pb-4">
        <div className="max-w-3xl mx-auto">
          {/* VIDEO TAB */}
          {activeTab === 'video' && (
            videoUrl ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center space-y-4 py-8">
                <div className="rounded-2xl overflow-hidden border border-border shadow-xl w-full max-w-md">
                  <video src={videoUrl} controls autoPlay className={`w-full ${format === 'portrait' ? 'aspect-[9/16] max-h-[50vh]' : 'aspect-video'} object-contain bg-black`} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { const a = document.createElement('a'); a.href = videoUrl; a.download = 'nuviral-video.mp4'; a.click(); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm"><Download className="h-4 w-4" /> Download</button>
                  <button onClick={resetAll} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-accent transition text-sm"><RotateCcw className="h-4 w-4" /> Baru</button>
                </div>
              </motion.div>
            ) : isRendering ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="font-medium">{renderStage}</p>
                <div className="h-2 rounded-full bg-muted overflow-hidden w-64"><motion.div animate={{ width: `${renderProgress}%` }} className="h-full gradient-primary rounded-full" /></div>
                <p className="text-xs text-muted-foreground">{renderProgress}% — estimasi 2-5 menit</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 md:py-20">
                <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-center">Buat Video AI</h1>
                <p className="text-sm text-muted-foreground text-center">Ketik prompt, pilih style, tekan Enter</p>
              </div>
            )
          )}

          {/* IMAGE TAB */}
          {activeTab === 'image' && (
            imageUrl ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center space-y-4 py-8">
                <div className="rounded-2xl overflow-hidden border border-border shadow-xl w-full max-w-md">
                  <img src={imageUrl} alt="Generated" className="w-full object-contain max-h-[55vh]" />
                </div>
                <div className="flex gap-2">
                  <a href={imageUrl} download="nuviral-image.png" target="_blank" className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm"><Download className="h-4 w-4" /> Download</a>
                  <button onClick={resetAll} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-accent transition text-sm"><RotateCcw className="h-4 w-4" /> Baru</button>
                </div>
              </motion.div>
            ) : isGeneratingImage ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="font-medium">Generating gambar...</p>
                <p className="text-xs text-muted-foreground">~10-30 detik</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 md:py-20">
                <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-center">Generate Gambar AI</h1>
                <p className="text-sm text-muted-foreground text-center">Deskripsikan gambar yang ingin dibuat</p>
              </div>
            )
          )}

          {/* CHAT TAB */}
          {activeTab === 'chat' && (
            chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 md:py-20">
                <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-center">Halo {userName || 'Creator'} 👋</h1>
                <p className="text-sm text-muted-foreground text-center">Tanya apa saja — ide konten, script, strategi viral</p>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {chatMessages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] md:max-w-[85%] p-3 md:p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white rounded-br-sm' : 'bg-card border border-border rounded-bl-sm'}`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed break-words">{msg.content}</p>
                      {msg.role === 'assistant' && (
                        <button onClick={() => handleCopy(msg.content, i)} className="mt-2 text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                          {copied === i ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} Copy
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="p-4 rounded-2xl bg-card border border-border rounded-bl-sm flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">AI sedang menjawab...</span>
                    </div>
                  </div>
                )}
                {/* Suggested Follow-ups */}
                {suggestions.length > 0 && !isChatLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2"
                  >
                    <p className="text-[10px] text-muted-foreground mb-1.5 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-primary" />
                      Suggested follow-ups
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setPrompt(sug); setSuggestions([]); }}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/30 transition text-left text-xs group"
                        >
                          <ArrowRight className="h-3 w-3 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground group-hover:text-foreground">{sug}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>
            )
          )}
        </div>
      </div>

      {/* Bottom Input Bar - Fixed bottom */}
      {!(activeTab === 'video' && (videoUrl || isRendering)) && !(activeTab === 'image' && (imageUrl || isGeneratingImage)) && (
        <div className="flex-shrink-0 px-2 md:px-4 pb-3 md:pb-4 pt-2 border-t border-border/50 bg-background">
          <div className="max-w-3xl mx-auto">
            {/* Narasi (video only) */}
            <AnimatePresence>
              {showNarasi && activeTab === 'video' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-2">
                  <div className="p-3 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Mic className="h-3 w-3" /> Narasi</span>
                      <button onClick={() => setShowNarasi(false)} className="p-1 rounded hover:bg-accent"><X className="h-3 w-3" /></button>
                    </div>
                    <textarea value={narasi} onChange={e => setNarasi(e.target.value)} placeholder="Tulis narasi bahasa Indonesia..." rows={3} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm resize-none focus:outline-none focus:border-primary" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={activeTab === 'video' ? 'Deskripsikan video...' : activeTab === 'image' ? 'Deskripsikan gambar...' : 'Tanya apa saja...'}
                rows={1}
                className="w-full px-5 py-4 pr-14 text-sm bg-transparent resize-none focus:outline-none min-h-[52px] max-h-[100px]"
                onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 100) + 'px'; }}
              />
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="flex items-center gap-1 flex-wrap">
                  {activeTab !== 'chat' && (
                    <>
                      <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs hover:bg-accent transition text-muted-foreground">
                        <Settings2 className="h-3.5 w-3.5" /><span className="hidden sm:inline">{stylePresets.find(s => s.id === style)?.icon}</span><ChevronDown className="h-3 w-3" />
                      </button>
                      <button onClick={() => setFormat(f => f === 'portrait' ? 'landscape' : 'portrait')} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs hover:bg-accent transition text-muted-foreground">
                        {format === 'portrait' ? <Smartphone className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5" />}<span className="hidden sm:inline">{format === 'portrait' ? '9:16' : '16:9'}</span>
                      </button>
                    </>
                  )}
                  {activeTab === 'video' && (
                    <>
                      <button onClick={() => setDuration(d => d === 'short' ? 'medium' : d === 'medium' ? 'long' : 'short')} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs hover:bg-accent transition text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /><span className="hidden sm:inline">{duration === 'short' ? '5s' : duration === 'medium' ? '10s' : '20s'}</span>
                      </button>
                      <button onClick={() => { const i = voiceOptions.indexOf(voice); setVoice(voiceOptions[(i + 1) % voiceOptions.length]); }} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs hover:bg-accent transition text-muted-foreground">
                        <Volume2 className="h-3.5 w-3.5" /><span className="hidden sm:inline">{voice}</span>
                      </button>
                      <button onClick={() => setShowNarasi(!showNarasi)} className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition ${showNarasi ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-muted-foreground'}`}>
                        <Mic className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
                <button onClick={handleSubmit} disabled={!prompt.trim() || isRendering || isGeneratingImage || isChatLoading} className="p-2.5 rounded-xl gradient-primary text-white disabled:opacity-30 hover:opacity-90 transition">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Style Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-2 p-3 rounded-xl border border-border bg-card shadow-lg">
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {stylePresets.map(s => (
                      <button key={s.id} onClick={() => { setStyle(s.id); setShowSettings(false); }} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${style === s.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-accent'}`}>
                        <span className="text-lg">{s.icon}</span>
                        <span className="text-[9px]">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-[10px] text-muted-foreground text-center mt-2">Enter untuk {activeTab === 'chat' ? 'kirim' : 'generate'} • Shift+Enter baris baru</p>
          </div>
        </div>
      )}
    </div>
  );
}
