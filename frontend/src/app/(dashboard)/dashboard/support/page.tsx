'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Loader2, Bot, User } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nuviral-production.up.railway.app/api/v1';

interface ChatMessage {
  id: string;
  role: 'user' | 'admin' | 'system';
  content: string;
  timestamp: string;
}

export default function SupportPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [userName, setUserName] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  // Auto-poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadMessages();
    }, 5000);
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
        // First time - show welcome
        setMessages([{
          id: 'welcome',
          role: 'system',
          content: 'Selamat datang di NuViral Support! 👋\nKetik pertanyaan kamu dan tim kami akan membalas secepatnya.',
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch {
      setMessages([{
        id: 'welcome',
        role: 'system',
        content: 'Selamat datang di NuViral Support! 👋\nKetik pertanyaan kamu dan tim kami akan membalas secepatnya.',
        timestamp: new Date().toISOString(),
      }]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const msg = input.trim();
    setInput('');
    setSending(true);

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: msg,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsg]);

    try {
      const token = localStorage.getItem('accessToken') || '';
      await fetch(`${API_URL}/support/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: msg }),
      });
    } catch {}
    finally { setSending(false); }
  };

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] md:h-[calc(100vh-7rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border flex-shrink-0">
        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold">NuViral Support</h1>
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
                  <span className="text-[10px] font-medium text-primary">NuViral Team</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-white/60' : 'text-muted-foreground'}`}>
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </motion.div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm p-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ketik pesan..."
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-card focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="p-3 rounded-xl gradient-primary text-white disabled:opacity-30 hover:opacity-90 transition flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
