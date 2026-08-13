'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Loader2, Bot, User, ImageIcon, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.getlumora.cloud/api/v1';

interface ChatMessage {
  id: string;
  role: 'user' | 'admin' | 'system';
  content: string;
  imageUrl?: string;
  timestamp: string;
}

export default function SupportPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [userName, setUserName] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      setUserName(u.name || u.email?.split('@')[0] || 'User');
    } catch {}
    loadMessages();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => { loadMessages(); }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem('accessToken') || '';
      const res = await fetch(`${API_URL}/support/messages`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      } else {
        setMessages([{
          id: 'welcome', role: 'system',
          content: 'Selamat datang di Lumora Support! 👋\nKetik pertanyaan atau kirim screenshot error kamu.',
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch {
      setMessages([{
        id: 'welcome', role: 'system',
        content: 'Selamat datang di Lumora Support! 👋\nKetik pertanyaan atau kirim screenshot error kamu.',
        timestamp: new Date().toISOString(),
      }]);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Pilih file gambar (JPG, PNG, dll)'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Ukuran maksimal 5MB'); return; }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result.split(',')[1]);
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageBase64(null);
  };

  const handleSend = async () => {
    if ((!input.trim() && !imageBase64) || sending) return;
    const msg = input.trim();
    setInput('');
    setSending(true);

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: msg || '📷 Screenshot',
      imageUrl: imagePreview || undefined,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsg]);

    const sendImageBase64 = imageBase64;
    setImagePreview(null);
    setImageBase64(null);

    try {
      const token = localStorage.getItem('accessToken') || '';
      await fetch(`${API_URL}/support/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: msg || '📷 Screenshot', imageBase64: sendImageBase64 }),
      });
    } catch {}
    finally { setSending(false); }
  };

  const formatTime = (ts: string) => {
    try { return new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] md:h-[calc(100vh-7rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border flex-shrink-0">
        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Lumora Support</h1>
          <p className="text-xs text-muted-foreground">Biasanya membalas dalam 1-24 jam</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${
              msg.role === 'user'
                ? 'bg-primary text-white rounded-2xl rounded-br-sm'
                : msg.role === 'system'
                ? 'bg-muted/50 border border-border rounded-2xl'
                : 'bg-card border border-border rounded-2xl rounded-bl-sm'
            } p-3 md:p-4`}>
              {msg.role === 'admin' && (
                <div className="flex items-center gap-1.5 mb-1">
                  <Bot className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-medium text-primary">Lumora Team</span>
                </div>
              )}
              {msg.imageUrl && (
                <div className="mb-2 rounded-lg overflow-hidden">
                  <img
                    src={msg.imageUrl}
                    alt="Screenshot"
                    className="max-w-full max-h-60 rounded-lg cursor-pointer hover:opacity-90 transition"
                    onClick={() => window.open(msg.imageUrl, '_blank')}
                  />
                </div>
              )}
              {msg.content && msg.content !== '📷 Screenshot' && (
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              )}
              {msg.content === '📷 Screenshot' && !msg.imageUrl && (
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              )}
              <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-white/60' : 'text-muted-foreground'}`}>
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </motion.div>
        ))}
        {sending && (
          <div className="flex justify-end">
            <div className="bg-primary/80 rounded-2xl rounded-br-sm p-3">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="flex-shrink-0 px-2 pt-2">
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="h-20 rounded-lg border border-border" />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          {/* Image upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl border border-border hover:bg-accent transition flex-shrink-0"
            title="Upload screenshot"
          >
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={imageBase64 ? "Tambah keterangan (opsional)..." : "Ketik pesan..."}
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-card focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm"
          />
          <button
            onClick={handleSend}
            disabled={(!input.trim() && !imageBase64) || sending}
            className="p-3 rounded-xl gradient-primary text-white disabled:opacity-30 hover:opacity-90 transition flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
          📷 Klik icon gambar untuk upload screenshot error
        </p>
      </div>
    </div>
  );
}
