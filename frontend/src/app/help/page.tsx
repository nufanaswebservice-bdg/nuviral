'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  HelpCircle, Search, ChevronDown, BookOpen, CreditCard, Video,
  Sparkles, Settings, Shield, MessageSquare, Mail, ArrowRight,
} from 'lucide-react';

interface FAQItem { question: string; answer: string; }
interface HelpCategory { id: string; icon: any; title: string; description: string; faqs: FAQItem[]; }

const helpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    icon: BookOpen,
    title: 'Memulai NuViral',
    description: 'Panduan dasar untuk pemula',
    faqs: [
      { question: 'Apa itu NuViral AI Video Generator?', answer: 'NuViral adalah platform AI SaaS buatan Indonesia untuk content creator. Dengan NuViral, kamu bisa generate video pendek, gambar, script, dan brainstorm ide konten viral menggunakan kecerdasan buatan. Platform ini mendukung pembuatan konten untuk TikTok, YouTube Shorts, Instagram Reels, dan Facebook Reels secara otomatis.' },
      { question: 'Bagaimana cara membuat video AI pertama di NuViral?', answer: 'Langkah-langkahnya sangat mudah: 1) Daftar/login dengan akun Google di nuviral.cloud, 2) Pilih paket berlangganan (mulai Rp 45.000/bulan), 3) Buka menu AI Studio, 4) Pilih tab Video, 5) Ketik deskripsi video yang kamu inginkan dalam Bahasa Indonesia, 6) Pilih style (Cinematic, Anime, dll) dan durasi, 7) Tekan Enter dan tunggu 2-5 menit. Video siap download!' },
      { question: 'Apakah NuViral bisa generate video dalam Bahasa Indonesia?', answer: 'Ya! NuViral sepenuhnya mendukung Bahasa Indonesia. Kamu bisa mengetik prompt dalam Bahasa Indonesia dan AI akan otomatis menerjemahkan serta mengoptimalkan untuk menghasilkan video berkualitas tinggi. Narasi/voiceover juga tersedia dalam Bahasa Indonesia.' },
      { question: 'Format dan durasi video apa yang didukung NuViral?', answer: 'NuViral mendukung: Portrait 9:16 (untuk TikTok, Reels, Shorts) dan Landscape 16:9 (untuk YouTube). Durasi yang tersedia: Short (5 detik), Medium (10 detik), dan Long (20 detik). Resolusi output hingga 1080p.' },
      { question: 'Berapa lama proses generate video AI?', answer: 'Rata-rata 2-5 menit untuk video 5-10 detik. Proses meliputi: optimasi prompt oleh AI, generate visual dengan model Kling 2.5, penambahan voiceover (opsional), dan rendering final. Kamu bisa melihat progress bar real-time selama proses.' },
    ],
  },
  {
    id: 'pricing',
    icon: CreditCard,
    title: 'Harga & Pembayaran',
    description: 'Paket berlangganan dan metode bayar',
    faqs: [
      { question: 'Berapa harga berlangganan NuViral?', answer: 'NuViral menyediakan 4 paket:\n• Pemula: Rp 45.000/bulan — 5 video, 50 AI credits, 2GB storage\n• Starter: Rp 225.000/bulan — 21 video, 210 AI credits, 10GB storage\n• Pro: Rp 449.000/bulan — 42 video, 420 AI credits, 50GB storage\n• Agency: Rp 1.225.000/bulan — 115 video, 1150 AI credits, 200GB storage\n\nSemua paket termasuk tanpa watermark dan akses Chat AI unlimited.' },
      { question: 'Metode pembayaran apa yang diterima NuViral?', answer: 'NuViral menggunakan Midtrans sebagai payment gateway resmi. Metode yang didukung: Transfer Bank (BCA, BNI, BRI, Mandiri, Permata, dll), E-Wallet (GoPay, OVO, Dana, ShopeePay, LinkAja), Kartu Kredit/Debit (Visa, Mastercard, JCB), Virtual Account, dan Alfamart/Indomaret.' },
      { question: 'Apakah ada trial gratis NuViral?', answer: 'Saat ini NuViral tidak menyediakan free trial, namun paket Pemula seharga Rp 45.000/bulan adalah opsi termurah untuk mencoba platform. Kami juga menyediakan garansi 14 hari uang kembali — jika tidak puas, hubungi support untuk refund penuh.' },
      { question: 'Bagaimana cara upgrade atau cancel paket?', answer: 'Upgrade: Buka menu Billing > pilih paket baru > bayar. Paket langsung aktif. Cancel: Hubungi support via email atau WhatsApp. Paket tetap aktif sampai akhir periode billing. Tidak ada biaya cancel.' },
      { question: 'Apa yang terjadi jika kuota video habis?', answer: 'Jika kuota habis, kamu tidak bisa generate video/gambar baru sampai: 1) Kuota di-reset otomatis di awal bulan berikutnya (sesuai tanggal berlangganan), atau 2) Kamu upgrade ke paket yang lebih tinggi. Chat AI tetap bisa digunakan.' },
    ],
  },
  {
    id: 'ai-features',
    icon: Sparkles,
    title: 'Fitur AI Studio',
    description: 'Video, gambar, chat, dan tools AI',
    faqs: [
      { question: 'Apa saja fitur AI di NuViral?', answer: 'NuViral memiliki 3 fitur utama di AI Studio:\n• Chat AI — Brainstorm ide konten, tulis script viral, tanya strategi marketing\n• Generate Gambar — Buat thumbnail, poster, cover dari teks (menggunakan Flux AI)\n• Generate Video — Buat video pendek 5-20 detik dari deskripsi teks (menggunakan Kling 2.5)\n\nSemua fitur mendukung input Bahasa Indonesia.' },
      { question: 'Tips menulis prompt video AI yang bagus?', answer: 'Tips untuk hasil terbaik:\n1. Deskripsikan subjek utama dengan detail (siapa/apa yang ada di video)\n2. Sebutkan gaya visual: cinematic, anime, realistic, neon, dark\n3. Tambahkan pencahayaan: golden hour, dramatic lighting, neon lights\n4. Sebutkan gerakan kamera: drone shot, close-up, tracking shot, orbit\n5. Gunakan 50-100 kata untuk detail optimal\n6. Contoh: "Cinematic drone shot, kucing lucu bermain di taman bunga sakura, golden hour lighting, shallow depth of field, 4K quality"' },
      { question: 'Apa perbedaan style preset di NuViral?', answer: 'NuViral menyediakan 8 style preset:\n• 🎬 Cinematic — Film grain, dramatic lighting, movie-like\n• 🎌 Anime — Vibrant colors, Japanese animation style\n• 📷 Realistic — Photorealistic, natural lighting, 8K\n• 🌑 Dark — Moody, suspense, dark atmosphere\n• 💜 Neon — Cyberpunk, futuristic, neon lights\n• 🌿 Nature — Landscape, golden hour, peaceful\n• 🍜 Food — Food photography, appetizing, close-up\n• 📦 Product — Product showcase, clean background' },
      { question: 'Bagaimana cara menambahkan narasi/voiceover ke video?', answer: 'Di AI Studio tab Video: 1) Klik icon mikrofon (🎤) di toolbar bawah, 2) Tulis teks narasi dalam Bahasa Indonesia, 3) Pilih voice: nova (wanita), alloy (netral), echo (pria), onyx (pria dalam), shimmer (wanita lembut), 4) Generate video. AI akan membuat voiceover yang disinkronkan dengan visual.' },
      { question: 'Apakah video NuViral ada watermark?', answer: 'Tidak! Semua paket berbayar (Pemula, Starter, Pro, Agency) menghasilkan video tanpa watermark. Video bisa langsung diupload ke sosial media tanpa editing tambahan.' },
    ],
  },
  {
    id: 'troubleshooting',
    icon: Shield,
    title: 'Troubleshooting',
    description: 'Solusi masalah umum',
    faqs: [
      { question: 'Video gagal di-generate, apa solusinya?', answer: 'Coba langkah berikut:\n1. Pastikan kuota belum habis (cek di Billing)\n2. Persingkat prompt (maks 200 kata)\n3. Hindari konten NSFW/kekerasan (akan ditolak AI)\n4. Coba style preset yang berbeda\n5. Tunggu 1-2 menit lalu coba lagi (server mungkin sibuk)\n6. Jika masih gagal, hubungi support dengan screenshot error' },
      { question: 'Halaman NuViral loading terus atau blank putih', answer: 'Solusi:\n1. Clear cache browser: Ctrl+Shift+Delete > pilih "Cached images and files" > Clear\n2. Coba browser lain (Chrome direkomendasikan)\n3. Matikan VPN/proxy jika aktif\n4. Coba mode Incognito (Ctrl+Shift+N)\n5. Logout lalu login ulang\n6. Jika pakai HP, coba tutup dan buka ulang browser' },
      { question: 'Pembayaran berhasil tapi paket belum aktif', answer: 'Biasanya paket aktif dalam 1-5 menit. Jika lebih dari 10 menit:\n1. Refresh halaman Billing (tarik ke bawah di HP)\n2. Logout dan login ulang\n3. Cek email untuk konfirmasi pembayaran dari Midtrans\n4. Jika masih belum aktif, hubungi support via WhatsApp dengan bukti pembayaran (screenshot/nomor order)' },
      { question: 'Error "Belum berlangganan" padahal sudah bayar', answer: 'Kemungkinan penyebab:\n1. Pembayaran masih pending — cek status di email/SMS dari Midtrans\n2. Session expired — logout dan login ulang\n3. Akun berbeda — pastikan login dengan email yang sama saat bayar\n4. Hubungi support jika masalah berlanjut' },
      { question: 'Video tidak bisa didownload', answer: 'Coba:\n1. Tunggu sampai progress 100% dan muncul tombol Download\n2. Jika tombol tidak muncul, refresh halaman dan cek di menu "Videos"\n3. Pastikan storage HP/laptop tidak penuh\n4. Coba browser lain (Chrome/Firefox)\n5. Jika di HP, coba "Open in new tab" lalu save video' },
    ],
  },
];

// JSON-LD Structured Data for SEO
function FAQStructuredData() {
  const allFaqs = helpCategories.flatMap(cat => cat.faqs);
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer.replace(/\n/g, ' '),
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

function BreadcrumbStructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://nuviral.cloud' },
      { '@type': 'ListItem', position: 2, name: 'Help Center', item: 'https://nuviral.cloud/help' },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function PublicHelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredCategories = searchQuery.trim()
    ? helpCategories.map(cat => ({
        ...cat,
        faqs: cat.faqs.filter(
          faq =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(cat => cat.faqs.length > 0)
    : helpCategories;

  const totalResults = filteredCategories.reduce((sum, cat) => sum + cat.faqs.length, 0);

  return (
    <>
      <FAQStructuredData />
      <BreadcrumbStructuredData />

      <div className="min-h-screen bg-white dark:bg-gray-950">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-600" />
              <span className="font-bold text-gray-900 dark:text-white">NuViral</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                Login
              </Link>
              <Link href="/register" className="text-sm px-4 py-2 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 transition">
                Daftar Gratis
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <header className="py-12 md:py-16 px-4 text-center bg-gradient-to-b from-violet-50 to-white dark:from-gray-900 dark:to-gray-950">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Help Center
            </h1>
            <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 mb-8">
              Panduan lengkap menggunakan NuViral AI Video Generator
            </p>

            {/* Search */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setActiveCategory(null); }}
                placeholder="Cari pertanyaan... (contoh: cara buat video)"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition text-sm shadow-sm"
              />
              {searchQuery && (
                <p className="text-xs text-gray-500 mt-2">{totalResults} hasil ditemukan</p>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
          {/* Categories Grid */}
          {!searchQuery && !activeCategory && (
            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Kategori Bantuan</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {helpCategories.map((cat, i) => (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setActiveCategory(cat.id)}
                    className="p-4 md:p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-md transition text-left"
                  >
                    <cat.icon className="h-6 w-6 text-violet-600 mb-2" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{cat.title}</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">{cat.faqs.length} artikel</p>
                  </motion.button>
                ))}
              </div>
            </section>
          )}

          {/* Back button */}
          {activeCategory && !searchQuery && (
            <button
              onClick={() => setActiveCategory(null)}
              className="text-sm text-violet-600 hover:underline mb-6 flex items-center gap-1"
            >
              ← Kembali ke semua kategori
            </button>
          )}

          {/* FAQ List */}
          {(activeCategory || searchQuery) && (
            <section>
              {filteredCategories
                .filter(cat => !activeCategory || cat.id === activeCategory)
                .map((cat) => (
                  <div key={cat.id} className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <cat.icon className="h-5 w-5 text-violet-600" />
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">{cat.title}</h2>
                    </div>
                    <div className="space-y-2">
                      {cat.faqs.map((faq, i) => {
                        const faqId = `${cat.id}-${i}`;
                        const isExpanded = expandedFaq === faqId;
                        return (
                          <div key={faqId} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                            <button
                              onClick={() => setExpandedFaq(isExpanded ? null : faqId)}
                              className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                            >
                              <h3 className="text-sm md:text-base font-medium text-gray-900 dark:text-white pr-4">{faq.question}</h3>
                              <ChevronDown className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <div className="px-4 md:px-5 pb-4 md:pb-5 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4">
                                    {faq.answer}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </section>
          )}

          {/* All FAQs (for SEO - visible when no filter) */}
          {!searchQuery && !activeCategory && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Pertanyaan Populer</h2>
              {helpCategories.map((cat) => (
                <div key={cat.id} className="mb-8">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <cat.icon className="h-4 w-4 text-violet-600" />
                    {cat.title}
                  </h3>
                  <div className="space-y-2">
                    {cat.faqs.slice(0, 2).map((faq, i) => {
                      const faqId = `all-${cat.id}-${i}`;
                      const isExpanded = expandedFaq === faqId;
                      return (
                        <div key={faqId} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                          <button
                            onClick={() => setExpandedFaq(isExpanded ? null : faqId)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                          >
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white pr-4">{faq.question}</h4>
                            <ChevronDown className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                              >
                                <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3">
                                  {faq.answer}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setActiveCategory(cat.id)}
                    className="text-xs text-violet-600 hover:underline mt-2 flex items-center gap-1"
                  >
                    Lihat semua {cat.faqs.length} pertanyaan <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </section>
          )}

          {/* CTA */}
          <section className="mt-12 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 border border-violet-100 dark:border-violet-900/30 text-center">
            <MessageSquare className="h-8 w-8 text-violet-600 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Masih butuh bantuan?</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">Tim support kami siap membantu kamu 24/7</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="mailto:nufanaswebservice@gmail.com"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 transition w-full sm:w-auto justify-center"
              >
                <Mail className="h-4 w-4" /> Email Support
              </a>
              <a
                href="https://wa.me/6285156230541"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium text-sm transition w-full sm:w-auto justify-center text-gray-700 dark:text-gray-300"
              >
                <MessageSquare className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </section>

          {/* SEO Content */}
          <section className="mt-12 prose prose-sm dark:prose-invert max-w-none">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tentang NuViral AI Video Generator</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              NuViral adalah platform AI video generator pertama di Indonesia yang memungkinkan content creator membuat video viral secara otomatis. 
              Dengan teknologi AI terdepan (Kling 2.5, Flux, GPT-4), NuViral mengubah teks menjadi video berkualitas tinggi dalam hitungan menit. 
              Platform ini dirancang khusus untuk kreator konten TikTok, YouTube Shorts, Instagram Reels, dan Facebook Reels yang ingin 
              meningkatkan produktivitas tanpa perlu skill editing video.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Fitur unggulan NuViral meliputi: AI Video Generation dengan 8 style preset, AI Image Generation untuk thumbnail dan poster, 
              Chat AI untuk brainstorm ide konten, voiceover Bahasa Indonesia, scheduling otomatis, dan analytics performa konten. 
              Mulai dari Rp 45.000/bulan dengan paket Pemula.
            </p>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-100 dark:border-gray-800 py-8 px-4 mt-12">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">NuViral</span>
              <span className="text-xs text-gray-400">© 2024</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <Link href="/" className="hover:text-gray-900 dark:hover:text-white transition">Home</Link>
              <Link href="/help" className="hover:text-gray-900 dark:hover:text-white transition">Help</Link>
              <Link href="/login" className="hover:text-gray-900 dark:hover:text-white transition">Login</Link>
              <Link href="/register" className="hover:text-gray-900 dark:hover:text-white transition">Daftar</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
