'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, Search, ChevronDown, ChevronRight, BookOpen,
  CreditCard, Video, Sparkles, Settings, Shield, MessageSquare,
  ExternalLink, Mail, Zap, Upload, BarChart3, Users,
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface HelpCategory {
  id: string;
  icon: any;
  title: string;
  description: string;
  faqs: FAQItem[];
}

const helpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    icon: BookOpen,
    title: 'Memulai',
    description: 'Panduan dasar menggunakan NuViral',
    faqs: [
      {
        question: 'Apa itu NuViral?',
        answer: 'NuViral adalah platform AI SaaS untuk content creator. Kamu bisa generate video, gambar, script, dan brainstorm ide konten viral menggunakan AI — semua dalam Bahasa Indonesia. Platform ini mendukung TikTok, YouTube Shorts, Instagram Reels, dan Facebook Reels.',
      },
      {
        question: 'Bagaimana cara membuat video pertama?',
        answer: 'Buka menu "AI Studio" di sidebar, pilih tab "Video", ketik prompt yang mendeskripsikan video yang kamu inginkan (bisa dalam Bahasa Indonesia), pilih style dan durasi, lalu tekan Enter atau klik tombol Send. Video akan di-generate dalam 2-5 menit.',
      },
      {
        question: 'Apakah bisa generate dalam Bahasa Indonesia?',
        answer: 'Ya! Kamu bisa mengetik prompt dalam Bahasa Indonesia. AI kami akan otomatis menerjemahkan dan mengoptimalkan prompt untuk menghasilkan video berkualitas tinggi. Narasi/voiceover juga mendukung Bahasa Indonesia.',
      },
      {
        question: 'Format video apa yang didukung?',
        answer: 'NuViral mendukung format Portrait (9:16) untuk TikTok/Reels/Shorts dan Landscape (16:9) untuk YouTube. Kamu bisa memilih format saat membuat video di AI Studio.',
      },
      {
        question: 'Berapa lama proses generate video?',
        answer: 'Rata-rata 2-5 menit untuk video 5-10 detik. Durasi bisa lebih lama tergantung kompleksitas prompt dan antrian server. Kamu akan melihat progress bar selama proses berlangsung.',
      },
    ],
  },
  {
    id: 'billing',
    icon: CreditCard,
    title: 'Billing & Pembayaran',
    description: 'Paket berlangganan dan metode pembayaran',
    faqs: [
      {
        question: 'Paket apa saja yang tersedia?',
        answer: 'NuViral menyediakan 4 paket:\n• Pemula (Rp 45.000/bln) — 5 video, 50 AI credits\n• Starter (Rp 225.000/bln) — 21 video, 210 AI credits\n• Pro (Rp 449.000/bln) — 42 video, 420 AI credits\n• Agency (Rp 1.225.000/bln) — 115 video, 1150 AI credits',
      },
      {
        question: 'Metode pembayaran apa yang diterima?',
        answer: 'Pembayaran diproses melalui Midtrans. Kami mendukung: Transfer Bank (BCA, BNI, BRI, Mandiri, dll), E-Wallet (GoPay, OVO, Dana, ShopeePay, LinkAja), Kartu Kredit/Debit (Visa, Mastercard), dan Virtual Account.',
      },
      {
        question: 'Bagaimana cara upgrade paket?',
        answer: 'Buka menu "Billing" di sidebar, pilih paket yang diinginkan, klik "Pilih Paket", lalu selesaikan pembayaran melalui Midtrans. Paket akan langsung aktif setelah pembayaran berhasil.',
      },
      {
        question: 'Apakah bisa downgrade atau cancel?',
        answer: 'Ya, kamu bisa cancel kapan saja. Paket akan tetap aktif sampai akhir periode billing. Untuk downgrade, tunggu paket saat ini berakhir lalu pilih paket yang lebih rendah.',
      },
      {
        question: 'Apa yang terjadi jika kuota habis?',
        answer: 'Jika kuota video atau AI credits habis, kamu tidak bisa generate konten baru sampai kuota di-reset di awal bulan berikutnya, atau kamu bisa upgrade ke paket yang lebih tinggi untuk mendapatkan kuota tambahan.',
      },
      {
        question: 'Apakah ada garansi uang kembali?',
        answer: 'Ya, kami menyediakan garansi 14 hari uang kembali untuk semua paket berbayar. Jika tidak puas, hubungi support kami untuk proses refund.',
      },
    ],
  },
  {
    id: 'ai-studio',
    icon: Sparkles,
    title: 'AI Studio',
    description: 'Generate video, gambar, dan chat AI',
    faqs: [
      {
        question: 'Apa perbedaan tab Chat, Gambar, dan Video?',
        answer: '• Chat AI: Brainstorm ide konten, tulis script, tanya strategi viral\n• Gambar: Generate thumbnail, poster, atau gambar dari prompt\n• Video: Generate video pendek (5-20 detik) dari deskripsi teks',
      },
      {
        question: 'Tips menulis prompt yang bagus?',
        answer: 'Untuk hasil terbaik:\n1. Deskripsikan subjek utama dengan jelas\n2. Sebutkan gaya visual (cinematic, anime, realistic)\n3. Tambahkan detail pencahayaan (golden hour, neon, dramatic)\n4. Sebutkan gerakan kamera (drone shot, close-up, tracking)\n5. Gunakan 50-100 kata untuk detail optimal',
      },
      {
        question: 'Apa itu style preset?',
        answer: 'Style preset adalah template gaya visual yang bisa kamu pilih: Cinematic, Anime, Realistic, Dark, Neon, Nature, Food, dan Product. Setiap preset menambahkan parameter visual otomatis ke prompt kamu.',
      },
      {
        question: 'Bisa tambah narasi/voiceover?',
        answer: 'Ya! Di tab Video, klik icon mikrofon untuk menambahkan narasi. Tulis teks narasi dalam Bahasa Indonesia, pilih voice (nova, alloy, echo, onyx, shimmer), dan AI akan generate voiceover yang disinkronkan dengan video.',
      },
      {
        question: 'Kenapa video saya gagal di-generate?',
        answer: 'Beberapa penyebab umum:\n• Kuota habis — cek billing\n• Prompt terlalu panjang — coba persingkat\n• Konten melanggar kebijakan — hindari konten NSFW\n• Server sibuk — coba lagi dalam beberapa menit\nJika masih gagal, hubungi support.',
      },
    ],
  },
  {
    id: 'media',
    icon: Video,
    title: 'Media & Video',
    description: 'Kelola video dan media library',
    faqs: [
      {
        question: 'Di mana video saya tersimpan?',
        answer: 'Video yang sudah di-generate tersimpan di halaman "Videos" di sidebar. Kamu bisa download, putar ulang, atau hapus video dari sana. Video juga tersimpan di browser (localStorage) untuk akses cepat.',
      },
      {
        question: 'Bagaimana cara download video?',
        answer: 'Setelah video selesai di-generate, klik tombol "Download" yang muncul. Video akan terdownload dalam format MP4. Kamu juga bisa download dari halaman "Videos".',
      },
      {
        question: 'Apa itu Media Library?',
        answer: 'Media Library adalah showcase video AI yang dibuat oleh tim NuViral sebagai contoh dan inspirasi. Kamu bisa melihat berbagai style dan prompt yang menghasilkan video berkualitas tinggi.',
      },
      {
        question: 'Apakah video bisa langsung diupload ke sosial media?',
        answer: 'Fitur auto-upload ke TikTok, YouTube, Instagram, dan Facebook sedang dalam pengembangan. Saat ini kamu bisa download video lalu upload manual ke platform pilihanmu.',
      },
    ],
  },
  {
    id: 'account',
    icon: Settings,
    title: 'Akun & Pengaturan',
    description: 'Kelola profil dan preferensi',
    faqs: [
      {
        question: 'Bagaimana cara login?',
        answer: 'NuViral menggunakan Google Login. Klik "Get Started" atau "Log in", lalu pilih akun Google kamu. Tidak perlu membuat password terpisah.',
      },
      {
        question: 'Bagaimana cara ganti tema (dark/light)?',
        answer: 'Buka Settings > Appearance, lalu pilih Light, Dark, atau System. Perubahan akan langsung diterapkan.',
      },
      {
        question: 'Apakah data saya aman?',
        answer: 'Ya. Kami menggunakan enkripsi SSL/HTTPS, OAuth2 untuk login (password tidak disimpan), dan server yang aman di Railway. Data video kamu tersimpan di Cloudflare R2 dengan enkripsi.',
      },
      {
        question: 'Bagaimana cara menghubungkan akun sosial media?',
        answer: 'Buka menu "Accounts" di sidebar, klik "Connect Account", pilih platform (TikTok, YouTube, Instagram, Facebook), lalu ikuti proses otorisasi OAuth. Kami tidak pernah menyimpan password sosial media kamu.',
      },
    ],
  },
  {
    id: 'troubleshooting',
    icon: Shield,
    title: 'Troubleshooting',
    description: 'Solusi masalah umum',
    faqs: [
      {
        question: 'Video tidak muncul setelah generate',
        answer: 'Coba langkah berikut:\n1. Tunggu hingga progress bar mencapai 100%\n2. Jika stuck, refresh halaman dan cek di menu "Videos"\n3. Pastikan koneksi internet stabil\n4. Coba generate ulang dengan prompt yang lebih pendek',
      },
      {
        question: 'Halaman loading terus / blank',
        answer: 'Coba:\n1. Clear cache browser (Ctrl+Shift+Delete)\n2. Coba browser lain (Chrome recommended)\n3. Matikan VPN jika aktif\n4. Coba login ulang',
      },
      {
        question: 'Error "Belum berlangganan"',
        answer: 'Ini berarti kamu belum memilih paket berlangganan. Buka menu "Billing" dan pilih paket yang sesuai. Setelah pembayaran berhasil, kamu bisa langsung menggunakan semua fitur AI.',
      },
      {
        question: 'Error "Kuota habis"',
        answer: 'Kuota video dan AI credits di-reset setiap awal bulan (sesuai tanggal berlangganan). Jika butuh lebih banyak kuota sekarang, upgrade ke paket yang lebih tinggi.',
      },
      {
        question: 'Pembayaran berhasil tapi paket belum aktif',
        answer: 'Biasanya paket aktif dalam 1-5 menit setelah pembayaran. Jika lebih dari 10 menit:\n1. Refresh halaman Billing\n2. Logout dan login ulang\n3. Jika masih belum aktif, hubungi support dengan bukti pembayaran',
      },
    ],
  },
];

const guides = [
  {
    title: 'Cara Membuat Video Pertama',
    steps: ['Buka AI Studio', 'Pilih tab "Video"', 'Ketik prompt (bisa Bahasa Indonesia)', 'Pilih style & durasi', 'Tekan Enter dan tunggu 2-5 menit', 'Download video'],
    icon: Video,
  },
  {
    title: 'Cara Berlangganan',
    steps: ['Buka menu Billing', 'Pilih paket yang sesuai', 'Klik "Pilih Paket"', 'Selesaikan pembayaran via Midtrans', 'Paket langsung aktif'],
    icon: CreditCard,
  },
  {
    title: 'Tips Prompt Viral',
    steps: ['Gunakan kata kunci spesifik', 'Tambahkan gaya visual (cinematic, neon)', 'Sebutkan gerakan kamera', 'Deskripsikan pencahayaan', 'Buat 50-100 kata'],
    icon: Sparkles,
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

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
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2">
          <HelpCircle className="h-6 w-6 md:h-7 md:w-7 text-primary" />
          Help Center
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Cari jawaban atau hubungi tim support kami
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-lg mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setActiveCategory(null); }}
          placeholder="Cari pertanyaan... (contoh: cara generate video)"
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-sm"
        />
        {searchQuery && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {totalResults} hasil ditemukan
          </p>
        )}
      </div>

      {/* Quick Guides */}
      {!searchQuery && !activeCategory && (
        <div>
          <h2 className="text-base md:text-lg font-semibold mb-3">Panduan Cepat</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {guides.map((guide, i) => (
              <motion.div
                key={guide.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition"
              >
                <guide.icon className="h-5 w-5 text-primary mb-2" />
                <h3 className="text-sm font-semibold mb-2">{guide.title}</h3>
                <ol className="space-y-1">
                  {guide.steps.map((step, j) => (
                    <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-primary font-bold flex-shrink-0">{j + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {!searchQuery && !activeCategory && (
        <div>
          <h2 className="text-base md:text-lg font-semibold mb-3">Kategori Bantuan</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {helpCategories.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveCategory(cat.id)}
                className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition text-left"
              >
                <cat.icon className="h-5 w-5 text-primary mb-2" />
                <h3 className="text-sm font-semibold">{cat.title}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">{cat.description}</p>
                <p className="text-[10px] text-primary mt-1.5">{cat.faqs.length} artikel →</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Active Category / Search Results */}
      {(activeCategory || searchQuery) && (
        <div>
          {activeCategory && !searchQuery && (
            <button
              onClick={() => setActiveCategory(null)}
              className="text-sm text-primary hover:underline mb-4 flex items-center gap-1"
            >
              ← Kembali ke semua kategori
            </button>
          )}

          {filteredCategories
            .filter(cat => !activeCategory || cat.id === activeCategory)
            .map((cat) => (
              <div key={cat.id} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <cat.icon className="h-5 w-5 text-primary" />
                  <h2 className="text-base md:text-lg font-semibold">{cat.title}</h2>
                </div>
                <div className="space-y-2">
                  {cat.faqs.map((faq, i) => {
                    const faqId = `${cat.id}-${i}`;
                    const isExpanded = expandedFaq === faqId;
                    return (
                      <motion.div
                        key={faqId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="rounded-xl border border-border bg-card overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedFaq(isExpanded ? null : faqId)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/30 transition"
                        >
                          <span className="text-sm font-medium pr-4">{faq.question}</span>
                          <ChevronDown className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="px-4 pb-4 text-sm text-muted-foreground whitespace-pre-line leading-relaxed border-t border-border pt-3">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Contact Support */}
      <div className="p-5 md:p-6 rounded-2xl border border-border bg-card text-center">
        <MessageSquare className="h-8 w-8 text-primary mx-auto mb-3" />
        <h3 className="font-semibold mb-1">Masih butuh bantuan?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Tim support kami siap membantu kamu
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="mailto:nufanaswebservice@gmail.com"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm hover:opacity-90 transition w-full sm:w-auto justify-center"
          >
            <Mail className="h-4 w-4" />
            Email Support
          </a>
          <a
            href="https://wa.me/6285156230541"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border hover:bg-accent font-medium text-sm transition w-full sm:w-auto justify-center"
          >
            <MessageSquare className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
