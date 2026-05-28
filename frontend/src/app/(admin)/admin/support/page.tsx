'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  MessageSquare, Send, Users, Search, RefreshCw,
  Clock, CheckCircle, AlertCircle, Zap, Copy,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nuviral-production.up.railway.app/api/v1';

interface SupportTicket {
  id: string;
  userEmail: string;
  userName: string;
  messages: { role: string; content: string; timestamp: string }[];
  status: 'open' | 'replied' | 'closed';
  lastMessage: string;
  createdAt: string;
}

const TEMPLATE_REPLIES = [
  {
    category: '👋 Greeting',
    templates: [
      { label: 'Salam pembuka', text: 'Halo! Terima kasih sudah menghubungi NuViral Support. Ada yang bisa kami bantu?' },
      { label: 'Terima kasih', text: 'Terima kasih atas pertanyaannya! Berikut penjelasan dari kami:' },
    ],
  },
  {
    category: '💳 Billing',
    templates: [
      { label: 'Paket aktif', text: 'Paket kamu sudah aktif! Silakan refresh halaman Billing atau logout dan login ulang untuk melihat perubahan. Jika masih bermasalah, kirim screenshot bukti pembayaran ya.' },
      { label: 'Cara upgrade', text: 'Untuk upgrade paket:\n1. Buka menu Billing di sidebar\n2. Pilih paket yang diinginkan\n3. Klik "Pilih Paket"\n4. Selesaikan pembayaran via Midtrans\n\nPaket langsung aktif setelah pembayaran berhasil!' },
      { label: 'Refund', text: 'Untuk proses refund, kami butuh informasi berikut:\n1. Email akun NuViral\n2. Nomor order/transaksi\n3. Alasan refund\n\nRefund akan diproses dalam 3-7 hari kerja setelah disetujui.' },
      { label: 'Kuota habis', text: 'Kuota video/AI credits kamu akan di-reset otomatis di awal bulan berikutnya (sesuai tanggal berlangganan). Jika butuh lebih banyak kuota sekarang, kamu bisa upgrade ke paket yang lebih tinggi di menu Billing.' },
    ],
  },
  {
    category: '🎬 Video & AI',
    templates: [
      { label: 'Video gagal', text: 'Maaf atas ketidaknyamanannya. Coba langkah berikut:\n1. Persingkat prompt (maks 200 kata)\n2. Hindari konten NSFW\n3. Coba style preset yang berbeda\n4. Tunggu 1-2 menit lalu coba lagi\n\nJika masih gagal, kirim screenshot error-nya ya.' },
      { label: 'Tips prompt', text: 'Tips untuk hasil video terbaik:\n• Deskripsikan subjek utama dengan jelas\n• Tambahkan gaya: cinematic, anime, realistic\n• Sebutkan pencahayaan: golden hour, neon, dramatic\n• Tambahkan gerakan kamera: drone shot, close-up\n• Gunakan 50-100 kata\n\nContoh: "Cinematic drone shot, kucing bermain di taman bunga sakura, golden hour, shallow depth of field"' },
      { label: 'Durasi generate', text: 'Proses generate video biasanya memakan waktu 2-5 menit. Jika lebih dari 10 menit, kemungkinan ada masalah di server. Coba refresh halaman dan generate ulang. Kuota tidak akan terpotong jika video gagal.' },
    ],
  },
  {
    category: '🔧 Technical',
    templates: [
      { label: 'Clear cache', text: 'Coba langkah berikut:\n1. Clear cache browser: Ctrl+Shift+Delete\n2. Pilih "Cached images and files"\n3. Klik Clear/Hapus\n4. Refresh halaman\n\nAtau coba buka di mode Incognito (Ctrl+Shift+N).' },
      { label: 'Login error', text: 'Untuk masalah login:\n1. Pastikan menggunakan akun Google yang benar\n2. Coba clear cookies browser\n3. Matikan VPN jika aktif\n4. Coba browser lain (Chrome recommended)\n\nJika masih bermasalah, kirim screenshot error-nya.' },
      { label: 'Mobile issue', text: 'Untuk masalah di HP:\n1. Pastikan browser ter-update (Chrome/Safari terbaru)\n2. Coba tutup dan buka ulang browser\n3. Clear cache browser\n4. Pastikan koneksi internet stabil\n\nNuViral dioptimalkan untuk Chrome mobile.' },
    ],
  },
  {
    category: '✅ Closing',
    templates: [
      { label: 'Resolved', text: 'Senang bisa membantu! Jika ada pertanyaan lain, jangan ragu untuk chat lagi ya. Selamat berkreasi! 🎬✨' },
      { label: 'Follow up', text: 'Apakah masalahnya sudah teratasi? Jika masih ada kendala, silakan balas chat ini ya. Kami siap membantu!' },
      { label: 'Fitur coming soon', text: 'Terima kasih atas masukannya! Fitur ini sedang dalam pengembangan dan akan tersedia dalam update mendatang. Stay tuned! 🚀' },
    ],
  },
];

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchTickets(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [selectedTicket?.messages?.length]);

  // Auto-poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      await fetchTickets();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Keep selected ticket in sync with fetched data
  useEffect(() => {
    if (selectedTicket) {
      const updated = tickets.find(t => t.id === selectedTicket.id);
      if (updated && updated.messages.length !== selectedTicket.messages.length) {
        setSelectedTicket(updated);
      }
    }
  }, [tickets]);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('accessToken') || '';
      const res = await fetch(`${API_URL}/admin/support/tickets`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) setTickets(await res.json());
    } catch {}
  };

  const handleSendReply = async () => {
    if (!reply.trim() || !selectedTicket || sending) return;
    setSending(true);
    try {
      const token = localStorage.getItem('accessToken') || '';
      const res = await fetch(`${API_URL}/admin/support/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ticketId: selectedTicket.id, message: reply.trim() }),
      });
      if (res.ok) {
        toast.success('Reply sent!');
        setReply('');
        fetchTickets();
        // Update local state
        setSelectedTicket(prev => prev ? {
          ...prev,
          status: 'replied',
          messages: [...prev.messages, { role: 'admin', content: reply.trim(), timestamp: new Date().toISOString() }],
        } : null);
      }
    } catch { toast.error('Failed to send'); }
    finally { setSending(false); }
  };

  const useTemplate = (text: string) => {
    setReply(text);
    setShowTemplates(false);
  };

  const filteredTickets = tickets.filter(t =>
    t.userEmail.toLowerCase().includes(search.toLowerCase()) ||
    t.userName.toLowerCase().includes(search.toLowerCase()) ||
    t.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } catch { return ''; }
  };

  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-violet-400" />
            Support Chat
          </h1>
          <p className="text-gray-400 text-xs md:text-sm mt-1">Kelola pesan support dari user</p>
        </div>
        <button onClick={fetchTickets} className="p-2 rounded-lg hover:bg-white/5 transition">
          <RefreshCw className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-14rem)]">
        {/* Ticket List */}
        <div className="lg:col-span-1 flex flex-col rounded-xl bg-gray-900 border border-white/5 overflow-hidden">
          <div className="p-3 border-b border-white/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari user..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-xs focus:border-violet-500 outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <div className="p-6 text-center">
                <MessageSquare className="h-8 w-8 text-gray-700 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Belum ada pesan support</p>
              </div>
            ) : filteredTickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`w-full p-3 border-b border-white/5 text-left hover:bg-white/5 transition ${selectedTicket?.id === ticket.id ? 'bg-violet-500/10 border-l-2 border-l-violet-500' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white truncate">{ticket.userName}</span>
                  <span className="text-[10px] text-gray-500">{formatTime(ticket.createdAt)}</span>
                </div>
                <p className="text-xs text-gray-400 truncate">{ticket.lastMessage}</p>
                <div className="flex items-center gap-1 mt-1">
                  {ticket.status === 'open' && <AlertCircle className="h-3 w-3 text-amber-400" />}
                  {ticket.status === 'replied' && <CheckCircle className="h-3 w-3 text-emerald-400" />}
                  <span className="text-[10px] text-gray-500">{ticket.status}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col rounded-xl bg-gray-900 border border-white/5 overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{selectedTicket.userName}</p>
                  <p className="text-[10px] text-gray-500">{selectedTicket.userEmail}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedTicket.status === 'open' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {selectedTicket.status}
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedTicket.messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] p-3 rounded-xl ${
                      msg.role === 'user'
                        ? 'bg-white/5 border border-white/10 rounded-bl-sm'
                        : 'bg-violet-600/20 border border-violet-500/20 rounded-br-sm'
                    }`}>
                      {(msg as any).imageUrl && (
                        <div className="mb-2">
                          <img
                            src={(msg as any).imageUrl}
                            alt="Screenshot dari user"
                            className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-80 transition border border-white/10"
                            onClick={() => window.open((msg as any).imageUrl, '_blank')}
                          />
                        </div>
                      )}
                      {msg.content && msg.content !== '📷 Screenshot' && (
                        <p className="text-sm text-gray-200 whitespace-pre-wrap">{msg.content}</p>
                      )}
                      {msg.content === '📷 Screenshot' && !(msg as any).imageUrl && (
                        <p className="text-sm text-gray-200 whitespace-pre-wrap">{msg.content}</p>
                      )}
                      <p className="text-[10px] text-gray-500 mt-1">{formatTime(msg.timestamp)}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Template Selector */}
              {showTemplates && (
                <div className="border-t border-white/5 p-3 max-h-60 overflow-y-auto bg-gray-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-300">Template Balasan</span>
                    <button onClick={() => setShowTemplates(false)} className="text-[10px] text-gray-500 hover:text-white">Tutup</button>
                  </div>
                  {TEMPLATE_REPLIES.map((cat) => (
                    <div key={cat.category} className="mb-3">
                      <p className="text-[10px] text-gray-500 mb-1">{cat.category}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.templates.map((t) => (
                          <button
                            key={t.label}
                            onClick={() => useTemplate(t.text)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-gray-300 hover:bg-violet-500/20 hover:border-violet-500/30 transition"
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Input */}
              <div className="p-3 border-t border-white/5">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
                      placeholder="Ketik balasan..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm resize-none focus:border-violet-500 outline-none"
                    />
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-1"
                      >
                        <Zap className="h-3 w-3" /> Template
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleSendReply}
                    disabled={!reply.trim() || sending}
                    className="p-2.5 rounded-lg bg-violet-600 text-white disabled:opacity-30 hover:bg-violet-700 transition flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <MessageSquare className="h-12 w-12 text-gray-700 mb-3" />
              <p className="text-gray-500 text-sm">Pilih percakapan untuk membalas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
