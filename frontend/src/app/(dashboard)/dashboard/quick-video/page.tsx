'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';
import { BillingPopup } from '@/components/billing-popup';
import {
  Video, Download, Loader2, Sparkles, RotateCcw, Mic,
  Smartphone, Monitor, Clock, Zap, Volume2, Send,
  ChevronDown, Settings2, X, Image as ImageIcon, MessageSquare,
  Copy, Check, ListTodo, ArrowRight, Box, Play,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nuviral-production.up.railway.app/api/v1';

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

interface Task {
  id: string;
  title: string;
  messages: { role: string; content: string }[];
  createdAt: string;
}

function generateSuggestions(reply: string, question: string): string[] {
  const r = reply.toLowerCase();
  const q = question.toLowerCase();
  const s: string[] = [];
  if (q.includes('ide') || r.includes('ide')) { s.push('Buatkan script lengkap untuk ide nomor 1'); s.push('Buatkan caption dan 30 hashtag viral'); }
  if (q.includes('script') || r.includes('script')) { s.push('Buat versi lebih pendek (30 detik)'); s.push('Tambahkan hook yang lebih kuat'); }
  if (r.includes('tren') || r.includes('viral')) { s.push('Tren apa yang paling potensial?'); s.push('Buatkan konten mengikuti tren ini'); }
  if (s.length < 3) { s.push('Jelaskan lebih detail'); s.push('Buatkan template siap pakai'); s.push('Apa langkah pertama sekarang?'); }
  return s.slice(0, 3);
}

export default function AIStudioPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'image' | 'video' | 'img2vid' | 'tts' | 'music' | 'sfx' | 'clone' | '3d'>('chat');
  const [prompt, setPrompt] = useState('');
  const [voice, setVoice] = useState('nova');
  const [format, setFormat] = useState<'portrait' | 'landscape'>('portrait');
  const [duration, setDuration] = useState('medium');
  const [style, setStyle] = useState('cinematic');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultType, setResultType] = useState<'video' | 'image' | 'audio' | '3d' | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showBillingPopup, setShowBillingPopup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [credits, setCredits] = useState<{ aiCreditsUsed: number; aiCreditsLimit: number }>({ aiCreditsUsed: 0, aiCreditsLimit: 0 });
  const [userName, setUserName] = useState('');
  const [copied, setCopied] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTasks, setShowTasks] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try { const u = JSON.parse(localStorage.getItem('user') || '{}'); setUserName(u.name || u.email?.split('@')[0] || ''); } catch {}
    try { setTasks(JSON.parse(localStorage.getItem('nuviral-tasks') || '[]')); } catch {}
    axios.get(`${API_URL}/subscription/current`, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}` } })
      .then(r => { if (r.data) setCredits({ aiCreditsUsed: r.data.aiCreditsUsed ?? 0, aiCreditsLimit: r.data.aiCreditsLimit ?? 0 }); })
      .catch(() => {});
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const checkCredits = () => {
    if (credits.aiCreditsLimit === 0 || credits.aiCreditsUsed >= credits.aiCreditsLimit) { setShowBillingPopup(true); return false; }
    return true;
  };

  const getAuthHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}` });

  // === CHAT ===
  const handleChat = async () => {
    if (!prompt.trim()) return;
    const q = prompt.trim();
    const userMsg = { role: 'user', content: q };
    setChatMessages(prev => [...prev, userMsg]); setPrompt(''); setIsChatLoading(true); setSuggestions([]);
    try {
      const res = await fetch(`${API_URL}/ai/chat`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ message: q, history: chatMessages }) });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      const newMsgs = [...chatMessages, userMsg, { role: 'assistant', content: data.reply }];
      setChatMessages(newMsgs);
      setSuggestions(generateSuggestions(data.reply, q));
      saveTask(q, newMsgs);
    } catch { setChatMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, terjadi error. Coba lagi.' }]); }
    finally { setIsChatLoading(false); }
  };

  // === TEXT-TO-IMAGE ===
  const handleImage = async () => {
    if (!prompt.trim()) { toast.error('Masukkan prompt'); return; }
    if (!checkCredits()) return;
    setIsLoading(true); setResultUrl(null); setResultType(null);
    try {
      const res = await fetch(`${API_URL}/ai/generate-image`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ prompt: prompt.trim(), aspect_ratio: format === 'portrait' ? '9:16' : '16:9', style: stylePresets.find(s => s.id === style)?.label || '' }) });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed'); }
      const data = await res.json();
      setResultUrl(data.imageUrl); setResultType('image');
      toast.success('Gambar berhasil! 🖼️');
    } catch (e: any) { toast.error(`Gagal: ${e.message}`); }
    finally { setIsLoading(false); }
  };

  // === TEXT-TO-VIDEO ===
  const handleVideo = async () => {
    if (!prompt.trim()) { toast.error('Masukkan prompt'); return; }
    if (!checkCredits()) return;
    setIsLoading(true); setProgress(5); setResultUrl(null); setResultType(null);
    const interval = setInterval(() => setProgress(p => p < 80 ? p + 0.5 : p), 2000);
    try {
      const res = await fetch('https://nuviral-production.up.railway.app/render', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ title: prompt.trim(), script: '', prompt: prompt.trim(), voice, format, duration, style }) });
      clearInterval(interval);
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || e.detail || 'Failed'); }
      setProgress(95);
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob)); setResultType('video'); setProgress(100);
      toast.success('Video berhasil! 🎬');
    } catch (e: any) { clearInterval(interval); toast.error(`Gagal: ${e.message}`); setProgress(0); }
    finally { setIsLoading(false); }
  };

  // === IMAGE-TO-VIDEO ===
  const handleImg2Vid = async () => {
    if (!imageFile && !imagePreview) { toast.error('Upload gambar dulu'); return; }
    if (!checkCredits()) return;
    setIsLoading(true); setProgress(5); setResultUrl(null); setResultType(null);
    const interval = setInterval(() => setProgress(p => p < 80 ? p + 0.5 : p), 2000);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => { reader.onload = () => resolve((reader.result as string).split(',')[1]); reader.readAsDataURL(imageFile!); });
      const res = await fetch(`${API_URL}/ai/image-to-video`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ imageBase64: base64, prompt: prompt.trim() || 'smooth cinematic motion', duration: '5' }) });
      clearInterval(interval);
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed'); }
      const data = await res.json();
      setResultUrl(data.videoUrl); setResultType('video'); setProgress(100);
      toast.success('Video dari gambar berhasil! 🎬');
    } catch (e: any) { clearInterval(interval); toast.error(`Gagal: ${e.message}`); setProgress(0); }
    finally { setIsLoading(false); }
  };

  // === TEXT-TO-SPEECH ===
  const handleTTS = async () => {
    if (!prompt.trim()) { toast.error('Masukkan teks'); return; }
    if (!checkCredits()) return;
    setIsLoading(true); setResultUrl(null); setResultType(null);
    try {
      const res = await fetch(`${API_URL}/ai/text-to-speech`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ text: prompt.trim(), voice }) });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed'); }
      const data = await res.json();
      setResultUrl(data.audioUrl); setResultType('audio');
      toast.success('Audio berhasil! 🎤');
    } catch (e: any) { toast.error(`Gagal: ${e.message}`); }
    finally { setIsLoading(false); }
  };

  // === 3D GENERATION ===
  const handle3D = async () => {
    if (!prompt.trim() && !imageFile) { toast.error('Masukkan prompt atau upload gambar'); return; }
    if (!checkCredits()) return;
    setIsLoading(true); setProgress(5); setResultUrl(null); setResultType(null);
    const interval = setInterval(() => setProgress(p => p < 80 ? p + 0.5 : p), 3000);
    try {
      let body: any = { prompt: prompt.trim() };
      if (imageFile) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => { reader.onload = () => resolve((reader.result as string).split(',')[1]); reader.readAsDataURL(imageFile!); });
        body.imageBase64 = base64;
      }
      const res = await fetch(`${API_URL}/ai/generate-3d`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(body) });
      clearInterval(interval);
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed'); }
      const data = await res.json();
      setResultUrl(data.modelUrl || data.videoUrl); setResultType('3d'); setProgress(100);
      toast.success('3D Model berhasil! 🧊');
    } catch (e: any) { clearInterval(interval); toast.error(`Gagal: ${e.message}`); setProgress(0); }
    finally { setIsLoading(false); }
  };

  const handleSubmit = () => {
    if (activeTab === 'chat') handleChat();
    else if (activeTab === 'image') handleImage();
    else if (activeTab === 'video') handleVideo();
    else if (activeTab === 'img2vid') handleImg2Vid();
    else if (activeTab === 'tts') handleTTS();
    else if (activeTab === 'music') handleMusic();
    else if (activeTab === 'sfx') handleSFX();
    else if (activeTab === 'clone') handleVoiceClone();
    else if (activeTab === '3d') handle3D();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } };
  const handleCopy = (text: string, idx: number) => { navigator.clipboard.writeText(text); setCopied(idx); setTimeout(() => setCopied(null), 2000); };
  const resetResult = () => { setResultUrl(null); setResultType(null); setProgress(0); setImageFile(null); setImagePreview(null); };
  const startNewChat = () => { setChatMessages([]); setCurrentTaskId(null); setSuggestions([]); setPrompt(''); };
  const saveTask = (q: string, msgs: any[]) => {
    const title = q.length > 40 ? q.substring(0, 40) + '...' : q;
    const t: Task = { id: currentTaskId || `task-${Date.now()}`, title, messages: msgs, createdAt: new Date().toISOString() };
    setCurrentTaskId(t.id);
    setTasks(prev => { const u = prev.find(x => x.id === t.id) ? prev.map(x => x.id === t.id ? t : x) : [t, ...prev]; const s = u.slice(0, 30); try { localStorage.setItem('nuviral-tasks', JSON.stringify(s)); } catch {} return s; });
  };
  const loadTask = (t: Task) => { setChatMessages(t.messages); setCurrentTaskId(t.id); setSuggestions([]); setShowTasks(false); setActiveTab('chat'); };
  const deleteTask = (id: string) => { setTasks(prev => { const u = prev.filter(x => x.id !== id); try { localStorage.setItem('nuviral-tasks', JSON.stringify(u)); } catch {} return u; }); if (currentTaskId === id) startNewChat(); };

  // === TEXT-TO-MUSIC ===
  const handleMusic = async () => {
    if (!prompt.trim()) { toast.error('Deskripsikan musik yang diinginkan'); return; }
    if (!checkCredits()) return;
    setIsLoading(true); setResultUrl(null); setResultType(null);
    try {
      const res = await fetch(`${API_URL}/ai/generate-music`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ prompt: prompt.trim(), duration: duration === 'short' ? 15 : duration === 'long' ? 60 : 30 }) });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed'); }
      const data = await res.json();
      setResultUrl(data.audioUrl); setResultType('audio');
      toast.success('Musik berhasil di-generate! 🎵');
    } catch (e: any) { toast.error(`Gagal: ${e.message}`); }
    finally { setIsLoading(false); }
  };

  // === SOUND EFFECTS ===
  const handleSFX = async () => {
    if (!prompt.trim()) { toast.error('Deskripsikan efek suara'); return; }
    if (!checkCredits()) return;
    setIsLoading(true); setResultUrl(null); setResultType(null);
    try {
      const res = await fetch(`${API_URL}/ai/generate-sfx`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ prompt: prompt.trim(), duration: duration === 'short' ? 5 : duration === 'long' ? 30 : 10 }) });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed'); }
      const data = await res.json();
      setResultUrl(data.audioUrl); setResultType('audio');
      toast.success('Sound effect berhasil! 🔊');
    } catch (e: any) { toast.error(`Gagal: ${e.message}`); }
    finally { setIsLoading(false); }
  };

  // === VOICE CLONE ===
  const handleVoiceClone = async () => {
    if (!prompt.trim()) { toast.error('Masukkan teks yang ingin diucapkan'); return; }
    if (!imageFile) { toast.error('Upload sample suara (audio) untuk di-clone'); return; }
    if (!checkCredits()) return;
    setIsLoading(true); setResultUrl(null); setResultType(null);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => { reader.onload = () => resolve((reader.result as string).split(',')[1]); reader.readAsDataURL(imageFile!); });
      const res = await fetch(`${API_URL}/ai/voice-clone`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ text: prompt.trim(), audioBase64: base64 }) });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed'); }
      const data = await res.json();
      setResultUrl(data.audioUrl); setResultType('audio');
      toast.success('Voice clone berhasil! 🎤');
    } catch (e: any) { toast.error(`Gagal: ${e.message}`); }
    finally { setIsLoading(false); }
  };

  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'image', label: 'Gambar', icon: ImageIcon },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'img2vid', label: 'Img→Vid', icon: Play },
    { id: 'tts', label: 'Voice', icon: Volume2 },
    { id: 'music', label: 'Music', icon: Zap },
    { id: 'sfx', label: 'SFX', icon: Sparkles },
    { id: 'clone', label: 'Clone', icon: Mic },
    { id: '3d', label: '3D', icon: Box },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] md:h-[calc(100vh-7rem)]">
      <BillingPopup isOpen={showBillingPopup} onClose={() => setShowBillingPopup(false)} creditsUsed={credits.aiCreditsUsed} creditsLimit={credits.aiCreditsLimit} />

      {/* Tabs + Tasks */}
      <div className="flex items-center justify-between py-2 px-2 flex-shrink-0 gap-2 overflow-x-auto border-b border-border">
        <div className="flex gap-1 p-1 rounded-xl bg-muted/30 border border-border flex-shrink-0">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); resetResult(); }} className={`flex items-center gap-1.5 px-3 md:px-3.5 py-2 md:py-2 rounded-lg text-[11px] md:text-xs font-medium transition whitespace-nowrap border ${activeTab === tab.id ? 'bg-card shadow-sm text-foreground border-border' : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-accent hover:border-border'}`}>
              <tab.icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
              {tab.label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowTasks(!showTasks)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium border flex-shrink-0 transition ${showTasks ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground hover:border-primary/20'}`}>
          <ListTodo className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Tasks</span>
          {tasks.length > 0 && <span className="bg-primary text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">{tasks.length}</span>}
        </button>
      </div>

      {/* Tasks Panel */}
      <AnimatePresence>
        {showTasks && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-b border-border flex-shrink-0">
            <div className="p-3 bg-muted/20 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold">Riwayat ({tasks.length})</span>
                <button onClick={startNewChat} className="text-[11px] text-primary hover:underline">+ Chat Baru</button>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {tasks.map(t => (
                  <button key={t.id} onClick={() => loadTask(t)} className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] max-w-[150px] transition ${currentTaskId === t.id ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-card border-border hover:border-primary/20 hover:bg-accent'}`}>
                    <MessageSquare className="h-2.5 w-2.5 flex-shrink-0" />
                    <span className="truncate">{t.title}</span>
                    <X className="h-2.5 w-2.5 flex-shrink-0 opacity-40 hover:opacity-100 hover:text-destructive" onClick={(e) => { e.stopPropagation(); deleteTask(t.id); }} />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-2 md:px-4 pb-4">
        <div className="max-w-3xl mx-auto">

          {/* RESULT DISPLAY (for non-chat tabs) */}
          {resultUrl && resultType && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center space-y-4 py-6">
              <div className="rounded-2xl overflow-hidden border border-border shadow-xl w-full max-w-md">
                {resultType === 'video' && <video src={resultUrl} controls autoPlay className="w-full aspect-[9/16] max-h-[50vh] object-contain bg-black" />}
                {resultType === 'image' && <img src={resultUrl} alt="Generated" className="w-full max-h-[55vh] object-contain" />}
                {resultType === 'audio' && <div className="p-6 bg-card"><audio src={resultUrl} controls autoPlay className="w-full" /><p className="text-xs text-muted-foreground text-center mt-2">Voice: {voice}</p></div>}
                {resultType === '3d' && <div className="p-6 bg-card text-center"><Box className="h-16 w-16 text-primary mx-auto mb-3" /><a href={resultUrl} target="_blank" className="text-sm text-primary hover:underline">Download 3D Model</a></div>}
              </div>
              <div className="flex gap-2">
                {resultType !== 'audio' && <a href={resultUrl} download={`nuviral-${resultType}`} target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white font-medium text-sm"><Download className="h-4 w-4" /> Download</a>}
                <button onClick={resetResult} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-accent text-sm"><RotateCcw className="h-4 w-4" /> Baru</button>
              </div>
            </motion.div>
          )}

          {/* LOADING STATE */}
          {isLoading && activeTab !== 'chat' && (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="font-medium text-sm">Generating {activeTab === 'image' ? 'gambar' : activeTab === 'video' ? 'video' : activeTab === 'tts' ? 'audio' : activeTab === '3d' ? '3D model' : 'video'}...</p>
              {progress > 0 && <div className="h-1.5 rounded-full bg-muted overflow-hidden w-48"><motion.div animate={{ width: `${progress}%` }} className="h-full gradient-primary rounded-full" /></div>}
              <p className="text-[11px] text-muted-foreground">{activeTab === 'video' ? '~2-5 menit' : activeTab === '3d' ? '~1-3 menit' : '~10-30 detik'}</p>
            </div>
          )}

          {/* EMPTY STATES */}
          {!resultUrl && !isLoading && activeTab !== 'chat' && (
            <div className="flex flex-col items-center justify-center py-12 md:py-16">
              {activeTab === 'image' && <><h1 className="text-xl md:text-2xl font-semibold mb-2 text-center">Generate Gambar AI</h1><p className="text-sm text-muted-foreground text-center">Flux Pro Ultra — photorealistic & akurat</p></>}
              {activeTab === 'video' && <><h1 className="text-xl md:text-2xl font-semibold mb-2 text-center">Generate Video AI</h1><p className="text-sm text-muted-foreground text-center">Kling 3.0 Pro — cinematic & realistis</p></>}
              {activeTab === 'img2vid' && <><h1 className="text-xl md:text-2xl font-semibold mb-2 text-center">Image to Video</h1><p className="text-sm text-muted-foreground text-center">Animasikan gambar menjadi video</p></>}
              {activeTab === 'tts' && <><h1 className="text-xl md:text-2xl font-semibold mb-2 text-center">Text to Speech</h1><p className="text-sm text-muted-foreground text-center">Ubah teks menjadi voiceover natural</p></>}
              {activeTab === 'music' && <><h1 className="text-xl md:text-2xl font-semibold mb-2 text-center">🎵 Text to Music</h1><p className="text-sm text-muted-foreground text-center">Generate musik/lagu dari deskripsi teks</p></>}
              {activeTab === 'sfx' && <><h1 className="text-xl md:text-2xl font-semibold mb-2 text-center">🔊 Sound Effects</h1><p className="text-sm text-muted-foreground text-center">Generate efek suara dari deskripsi</p></>}
              {activeTab === 'clone' && <><h1 className="text-xl md:text-2xl font-semibold mb-2 text-center">🎤 Voice Clone</h1><p className="text-sm text-muted-foreground text-center">Clone suara dari sample audio</p></>}
              {activeTab === '3d' && <><h1 className="text-xl md:text-2xl font-semibold mb-2 text-center">3D Generation</h1><p className="text-sm text-muted-foreground text-center">Buat model 3D dari teks atau gambar</p></>}
            </div>
          )}

          {/* CHAT */}
          {activeTab === 'chat' && (
            chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 md:py-16">
                <h1 className="text-xl md:text-2xl font-semibold mb-2 text-center">Halo {userName || 'Creator'} 👋</h1>
                <p className="text-sm text-muted-foreground text-center">Tanya apa saja — ide konten, script, strategi viral</p>
              </div>
            ) : (
              <div className="space-y-3 py-4">
                {chatMessages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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
                {isChatLoading && <div className="flex justify-start"><div className="p-3 rounded-2xl bg-card border border-border rounded-bl-sm flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin text-primary" /><span className="text-xs text-muted-foreground">AI menjawab...</span></div></div>}
                {suggestions.length > 0 && !isChatLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                    <p className="text-[10px] text-muted-foreground mb-1.5 flex items-center gap-1"><Sparkles className="h-3 w-3 text-primary" /> Suggested follow-ups</p>
                    <div className="flex flex-col gap-1.5">
                      {suggestions.map((s, i) => (
                        <button key={i} onClick={() => { setPrompt(s); setSuggestions([]); }} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card hover:border-primary/30 text-left text-xs">
                          <ArrowRight className="h-3 w-3 text-primary flex-shrink-0" /><span className="text-muted-foreground">{s}</span>
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

      {/* INPUT BAR */}
      {!resultUrl && !isLoading && (
        <div className="flex-shrink-0 px-2 md:px-4 pb-3 pt-3 border-t border-border bg-background">
          <div className="max-w-3xl mx-auto">
            {/* Image Upload Preview (for img2vid & 3d & clone) */}
            {(activeTab === 'img2vid' || activeTab === '3d' || activeTab === 'clone') && imagePreview && (
              <div className="mb-2 flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/20">
                {activeTab === 'clone' ? (
                  <div className="flex items-center gap-2"><Mic className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Audio sample uploaded</span></div>
                ) : (
                  <img src={imagePreview} alt="Upload" className="h-12 rounded-lg border border-border" />
                )}
                <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="text-xs text-destructive hover:underline">Hapus</button>
              </div>
            )}

            {/* Input */}
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden hover:border-primary/20 transition">
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  activeTab === 'chat' ? 'Tanya apa saja...' :
                  activeTab === 'image' ? 'Deskripsikan gambar...' :
                  activeTab === 'video' ? 'Deskripsikan video...' :
                  activeTab === 'img2vid' ? 'Deskripsikan gerakan (opsional)...' :
                  activeTab === 'tts' ? 'Tulis teks yang ingin diucapkan...' :
                  activeTab === 'music' ? 'Deskripsikan musik (genre, mood, instrumen)...' :
                  activeTab === 'sfx' ? 'Deskripsikan efek suara (hujan, ledakan, dll)...' :
                  activeTab === 'clone' ? 'Tulis teks yang ingin diucapkan dengan suara clone...' :
                  'Deskripsikan objek 3D...'
                }
                rows={1}
                className="w-full px-4 py-3 text-sm bg-transparent resize-none focus:outline-none min-h-[48px] max-h-[100px]"
                onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 100) + 'px'; }}
              />
              <div className="flex items-center justify-between px-3 pb-2.5">
                <div className="flex items-center gap-1 flex-wrap">
                  {/* Upload button for img2vid / 3d / clone */}
                  {(activeTab === 'img2vid' || activeTab === '3d') && (
                    <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] hover:bg-accent text-muted-foreground border border-border hover:border-primary/20 transition">
                      <ImageIcon className="h-3 w-3" /> Upload Gambar
                    </button>
                  )}
                  {activeTab === 'clone' && (
                    <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] hover:bg-accent text-muted-foreground border border-border hover:border-primary/20 transition">
                      <Mic className="h-3 w-3" /> Upload Sample Suara
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept={activeTab === 'clone' ? 'audio/*' : 'image/*'} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } e.target.value = ''; }} />

                  {/* Style selector (image & video) */}
                  {(activeTab === 'image' || activeTab === 'video') && (
                    <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] hover:bg-accent text-muted-foreground border border-border hover:border-primary/20 transition">
                      <Settings2 className="h-3 w-3" /> {stylePresets.find(s => s.id === style)?.icon} <ChevronDown className="h-2.5 w-2.5" />
                    </button>
                  )}
                  {/* Format (image & video) */}
                  {(activeTab === 'image' || activeTab === 'video') && (
                    <button onClick={() => setFormat(f => f === 'portrait' ? 'landscape' : 'portrait')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] hover:bg-accent text-muted-foreground border border-border hover:border-primary/20 transition">
                      {format === 'portrait' ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />} {format === 'portrait' ? '9:16' : '16:9'}
                    </button>
                  )}
                  {/* Duration (video, music, sfx) */}
                  {(activeTab === 'video' || activeTab === 'music' || activeTab === 'sfx') && (
                    <button onClick={() => setDuration(d => d === 'short' ? 'medium' : d === 'medium' ? 'long' : 'short')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] hover:bg-accent text-muted-foreground border border-border hover:border-primary/20 transition">
                      <Clock className="h-3 w-3" /> {activeTab === 'video' ? (duration === 'short' ? '5s' : duration === 'medium' ? '10s' : '20s') : (duration === 'short' ? '15s' : duration === 'medium' ? '30s' : '60s')}
                    </button>
                  )}
                  {/* Voice (tts) */}
                  {activeTab === 'tts' && (
                    <button onClick={() => { const i = voiceOptions.indexOf(voice); setVoice(voiceOptions[(i + 1) % voiceOptions.length]); }} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] hover:bg-accent text-muted-foreground border border-border hover:border-primary/20 transition">
                      <Mic className="h-3 w-3" /> {voice}
                    </button>
                  )}
                </div>
                <button onClick={handleSubmit} disabled={!prompt.trim() && activeTab !== 'img2vid'} className="p-2 rounded-xl gradient-primary text-white disabled:opacity-30 hover:opacity-90 transition">
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

            <p className="text-[10px] text-muted-foreground text-center mt-1.5">Enter untuk {activeTab === 'chat' ? 'kirim' : 'generate'} • Shift+Enter baris baru</p>
          </div>
        </div>
      )}
    </div>
  );
}
