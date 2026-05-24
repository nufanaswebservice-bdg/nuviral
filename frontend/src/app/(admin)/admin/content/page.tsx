'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Globe, Save, Plus, Trash2, Edit, X, MessageSquare, Star } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nuviral-production.up.railway.app/api/v1';

interface FAQ { id: string; question: string; answer: string; }
interface Testimonial { id: string; name: string; role: string; text: string; rating: number; }

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<'homepage' | 'faq' | 'testimonials'>('homepage');
  const [homepage, setHomepage] = useState({
    heroTitle: 'Buat Video AI Viral dalam Hitungan Menit',
    heroSubtitle: 'Platform AI video generator terdepan di Indonesia. Buat konten TikTok, Reels, dan Shorts secara otomatis.',
    heroCta: 'Mulai Gratis',
    bannerText: '🚀 Diskon 50% untuk 100 user pertama!',
    bannerEnabled: true,
  });
  const [faqs, setFaqs] = useState<FAQ[]>([
    { id: '1', question: 'Apa itu NuViral?', answer: 'NuViral adalah platform AI video generator yang membantu Anda membuat konten video viral secara otomatis.' },
    { id: '2', question: 'Berapa harga berlangganan?', answer: 'Mulai dari Rp 225.000/bulan untuk paket Starter. Lihat halaman Billing untuk detail.' },
    { id: '3', question: 'Apakah video bisa digunakan untuk komersial?', answer: 'Ya, semua video yang dihasilkan bisa digunakan untuk keperluan komersial tanpa batasan.' },
  ]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    { id: '1', name: 'Andi Pratama', role: 'Content Creator', text: 'NuViral mengubah cara saya membuat konten. Sekarang bisa upload 5 video sehari!', rating: 5 },
    { id: '2', name: 'Sari Dewi', role: 'Digital Marketer', text: 'ROI naik 300% sejak pakai NuViral untuk klien-klien saya.', rating: 5 },
  ]);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const token = localStorage.getItem('accessToken') || '';
      const res = await fetch(`${API_URL}/admin/content`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.homepage) setHomepage(data.homepage);
        if (data.faqs) setFaqs(data.faqs);
        if (data.testimonials) setTestimonials(data.testimonials);
      }
    } catch {}
  };

  const saveContent = async () => {
    try {
      const token = localStorage.getItem('accessToken') || '';
      await fetch(`${API_URL}/admin/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ homepage, faqs, testimonials }),
      });
      toast.success('Content saved!');
    } catch {
      toast.error('Failed to save');
    }
  };

  const addFaq = () => {
    setFaqs([...faqs, { id: `faq-${Date.now()}`, question: '', answer: '' }]);
    setEditingFaq({ id: `faq-${Date.now()}`, question: '', answer: '' });
  };

  const addTestimonial = () => {
    setTestimonials([...testimonials, { id: `test-${Date.now()}`, name: '', role: '', text: '', rating: 5 }]);
    setEditingTestimonial({ id: `test-${Date.now()}`, name: '', role: '', text: '', rating: 5 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-violet-400" />
            Content Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">Kelola homepage, FAQ, dan testimonials</p>
        </div>
        <button onClick={saveContent} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium text-sm">
          <Save className="h-4 w-4" /> Save All
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-gray-900 w-fit">
        {(['homepage', 'faq', 'testimonials'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            {tab === 'homepage' ? '🏠 Homepage' : tab === 'faq' ? '❓ FAQ' : '⭐ Testimonials'}
          </button>
        ))}
      </div>

      {/* Homepage */}
      {activeTab === 'homepage' && (
        <div className="p-5 rounded-xl bg-gray-900 border border-white/5 space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Hero Title</label>
            <input value={homepage.heroTitle} onChange={e => setHomepage(h => ({ ...h, heroTitle: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-white/10 text-white text-sm" />
          </div>
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Hero Subtitle</label>
            <textarea value={homepage.heroSubtitle} onChange={e => setHomepage(h => ({ ...h, heroSubtitle: e.target.value }))} rows={2} className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-white/10 text-white text-sm resize-none" />
          </div>
          <div>
            <label className="text-sm text-gray-300 mb-1 block">CTA Button Text</label>
            <input value={homepage.heroCta} onChange={e => setHomepage(h => ({ ...h, heroCta: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-white/10 text-white text-sm" />
          </div>
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Banner Text</label>
            <input value={homepage.bannerText} onChange={e => setHomepage(h => ({ ...h, bannerText: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-white/10 text-white text-sm" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Show Banner</span>
            <button onClick={() => setHomepage(h => ({ ...h, bannerEnabled: !h.bannerEnabled }))} className={`w-10 h-5 rounded-full transition ${homepage.bannerEnabled ? 'bg-emerald-500' : 'bg-gray-700'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${homepage.bannerEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      )}

      {/* FAQ */}
      {activeTab === 'faq' && (
        <div className="space-y-3">
          <button onClick={addFaq} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition">
            <Plus className="h-4 w-4" /> Tambah FAQ
          </button>
          {faqs.map((faq, i) => (
            <div key={faq.id} className="p-4 rounded-xl bg-gray-900 border border-white/5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <input value={faq.question} onChange={e => setFaqs(f => f.map(x => x.id === faq.id ? { ...x, question: e.target.value } : x))} placeholder="Pertanyaan..." className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm" />
                  <textarea value={faq.answer} onChange={e => setFaqs(f => f.map(x => x.id === faq.id ? { ...x, answer: e.target.value } : x))} placeholder="Jawaban..." rows={2} className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm resize-none" />
                </div>
                <button onClick={() => setFaqs(f => f.filter(x => x.id !== faq.id))} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Testimonials */}
      {activeTab === 'testimonials' && (
        <div className="space-y-3">
          <button onClick={addTestimonial} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition">
            <Plus className="h-4 w-4" /> Tambah Testimonial
          </button>
          {testimonials.map((t) => (
            <div key={t.id} className="p-4 rounded-xl bg-gray-900 border border-white/5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input value={t.name} onChange={e => setTestimonials(ts => ts.map(x => x.id === t.id ? { ...x, name: e.target.value } : x))} placeholder="Nama..." className="px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm" />
                    <input value={t.role} onChange={e => setTestimonials(ts => ts.map(x => x.id === t.id ? { ...x, role: e.target.value } : x))} placeholder="Role..." className="px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm" />
                  </div>
                  <textarea value={t.text} onChange={e => setTestimonials(ts => ts.map(x => x.id === t.id ? { ...x, text: e.target.value } : x))} placeholder="Testimonial text..." rows={2} className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm resize-none" />
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(star => (
                      <button key={star} onClick={() => setTestimonials(ts => ts.map(x => x.id === t.id ? { ...x, rating: star } : x))} className={`${star <= t.rating ? 'text-amber-400' : 'text-gray-600'}`}>
                        <Star className="h-4 w-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => setTestimonials(ts => ts.filter(x => x.id !== t.id))} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
