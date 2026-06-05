'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Video, TrendingUp, Calendar, Zap, Shield, Check, ChevronDown, ChevronUp, ArrowRight, Play, Image as ImageIcon, MessageSquare, Volume2, Mic, Box } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">NuViral</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition font-medium">Features</a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition font-medium">Pricing</a>
              <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900 transition font-medium">FAQ</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition font-medium">
                Log in
              </Link>
              <Link
                href="/register"
                className="gradient-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition shadow-premium"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-20 px-4 relative min-h-[600px] md:min-h-[700px]" style={{ background: 'linear-gradient(180deg, #1e56a0 0%, #4a8fd4 20%, #7ab8e8 40%, #b8daf0 60%, #e8f2fa 80%, #ffffff 100%)' }}>
        {/* Cloud elements - BEHIND content */}
        <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }} aria-hidden="true">
          {/* White clouds */}
          <div className="cloud-layer-1 absolute top-[5%] left-[-5%] w-[60%] h-[180px] rounded-full" style={{ filter: 'blur(40px)', background: 'rgba(255,255,255,0.7)' }} />
          <div className="cloud-layer-2 absolute top-[10%] right-[-3%] w-[50%] h-[160px] rounded-full" style={{ filter: 'blur(35px)', background: 'rgba(255,255,255,0.6)' }} />
          <div className="cloud-layer-3 absolute top-[20%] left-[25%] w-[40%] h-[140px] rounded-full" style={{ filter: 'blur(30px)', background: 'rgba(255,255,255,0.5)' }} />
          {/* Blue-tinted clouds */}
          <div className="cloud-layer-2 absolute top-[3%] left-[30%] w-[50%] h-[150px] rounded-full" style={{ filter: 'blur(45px)', background: 'rgba(120,180,230,0.5)' }} />
          <div className="cloud-layer-1 absolute top-[15%] right-[15%] w-[35%] h-[120px] rounded-full" style={{ filter: 'blur(35px)', background: 'rgba(100,160,220,0.4)' }} />
          <div className="cloud-layer-3 absolute top-[0%] left-[0%] w-[40%] h-[130px] rounded-full" style={{ filter: 'blur(40px)', background: 'rgba(140,200,240,0.5)' }} />
          {/* Bottom fade to white */}
          <div className="absolute bottom-0 left-0 right-0 h-[250px]" style={{ background: 'linear-gradient(to top, #ffffff, transparent)' }} />
        </div>

        {/* Content - ABOVE clouds */}
        <div className="relative" style={{ zIndex: 1 }}>

        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-100 mb-8">
              <Sparkles className="h-4 w-4 text-violet-600" />
              <span className="text-sm text-violet-700 font-medium">AI-Powered Creative Platform — 9 Tools in 1</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]">
              AI Creative Studio
              <br />
              <span className="gradient-text">9 Tools dalam 1 Platform</span>
            </h1>
            <p className="text-base md:text-xl text-gray-500 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed px-2">
              Generate video, gambar, musik, efek suara, 3D model, voice clone, dan brainstorm ide konten —
              semuanya dengan AI terdepan, dalam satu dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/register"
                className="gradient-primary text-white px-6 py-3.5 md:px-8 md:py-4 rounded-xl font-semibold text-base md:text-lg hover:opacity-90 transition shadow-premium flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Start Creating for Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#demo"
                className="px-6 py-3.5 md:px-8 md:py-4 rounded-xl font-semibold text-base md:text-lg text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <Play className="h-4 w-4" />
                Watch Demo
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-400">
              <span>✓ 9 AI Tools</span>
              <span>✓ Mulai Rp 45.000/bln</span>
              <span>✓ Bahasa Indonesia</span>
            </div>
          </motion.div>

          {/* AI Feature Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 relative"
          >
            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-2xl shadow-gray-200/50 bg-white">
              {/* Header */}
              <div className="bg-gray-50 p-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-[10px] text-gray-400 font-medium">NuViral AI Studio — 9 Tools in 1</span>
                <div />
              </div>

              {/* Feature Grid */}
              <div className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4">
                {/* Text to Image */}
                <div className="rounded-xl border border-gray-100 p-3 hover:border-violet-200 transition group col-span-2 md:col-span-2">
                  <div className="aspect-[16/10] rounded-lg bg-gradient-to-br from-pink-100 to-rose-50 mb-2 overflow-hidden relative">
                    <img src="/img/textoimage.jpg" alt="Text to Image - Rainforest Infographic" className="w-full h-full object-cover rounded-lg" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-[8px] text-white/90 italic leading-tight">&quot;Infographic: The Layers of the Rainforest — vertical cross-section with labeled canopy, understory, forest floor, lush green palette...&quot;</p>
                    </div>
                  </div>
                  <p className="text-[10px] font-semibold text-gray-700">Text to Image</p>
                  <p className="text-[9px] text-gray-400">Flux Pro Ultra — photorealistic & ultra detailed</p>
                </div>

                {/* Text to Music */}
                <div className="rounded-xl border border-gray-100 p-3 hover:border-violet-200 transition group col-span-2 md:col-span-2">
                  <div className="rounded-lg overflow-hidden mb-2 relative">
                    <img src="/img/cover1.jpg" alt="Text to Music Cover" className="w-full h-32 md:h-40 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
                      <p className="text-[9px] text-white/80 italic leading-tight mb-2">&quot;A hopeful cinematic piano piece that slowly opens into strings and subtle electronic percussion. Smooth, warm, coastal road feeling.&quot;</p>
                      <audio src="/img/texttoaudio.mp3" controls className="w-full h-7 rounded" preload="metadata" />
                    </div>
                  </div>
                  <p className="text-[10px] font-semibold text-gray-700">Text to Music</p>
                  <p className="text-[9px] text-gray-400">MiniMax Music 2.0 — cinematic & original</p>
                </div>

                {/* Image to Video */}
                <div className="rounded-xl border border-gray-100 p-3 hover:border-violet-200 transition group">
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-emerald-100 to-green-50 mb-2 flex items-center justify-center">
                    <div className="text-center p-2">
                      <span className="text-2xl">🎬</span>
                      <p className="text-[8px] text-gray-400 mt-1 italic">foto → video cinematic</p>
                    </div>
                  </div>
                  <p className="text-[10px] font-semibold text-gray-700">Image to Video</p>
                  <p className="text-[9px] text-gray-400">Kling 3.0 Pro</p>
                </div>

                {/* Text to Effects */}
                <div className="rounded-xl border border-gray-100 p-3 hover:border-violet-200 transition group">
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-red-100 to-orange-50 mb-2 flex items-center justify-center">
                    <div className="text-center p-2">
                      <span className="text-2xl">🔊</span>
                      <p className="text-[8px] text-gray-400 mt-1 italic">&quot;hujan deras + petir&quot;</p>
                    </div>
                  </div>
                  <p className="text-[10px] font-semibold text-gray-700">Sound Effects</p>
                  <p className="text-[9px] text-gray-400">ElevenLabs SFX</p>
                </div>

                {/* Text to 3D */}
                <div className="rounded-xl border border-gray-100 p-3 hover:border-violet-200 transition group">
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-teal-100 to-cyan-50 mb-2 flex items-center justify-center">
                    <div className="text-center p-2">
                      <span className="text-2xl">🧊</span>
                      <p className="text-[8px] text-gray-400 mt-1 italic">&quot;sneaker futuristik 3D&quot;</p>
                    </div>
                  </div>
                  <p className="text-[10px] font-semibold text-gray-700">Text to 3D</p>
                  <p className="text-[9px] text-gray-400">Hunyuan3D v2</p>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="border-t border-gray-100 px-4 py-2 bg-gray-50 flex items-center justify-between">
                <span className="text-[9px] text-gray-400">Powered by fal.ai • Kling • Flux • MiniMax • ElevenLabs • Hunyuan3D</span>
                <span className="text-[9px] text-violet-500 font-medium">Coba sekarang →</span>
              </div>
            </div>
            {/* Glow behind */}
            <div className="absolute -inset-8 bg-gradient-to-r from-violet-200/30 to-indigo-200/30 rounded-3xl blur-3xl -z-10" />
          </motion.div>
        </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">See NuViral in Action</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Watch how creators generate viral videos in minutes — from prompt to publish.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-2xl shadow-gray-200/50"
          >
            {/* Video Demo Player */}
            <DemoVideo />
          </motion.div>

          {/* Demo features below */}
          <div className="mt-10 grid sm:grid-cols-3 gap-6">
            {[
              { title: 'Prompt to Video', desc: 'Type any topic, get a complete video in under 2 minutes', icon: '⚡' },
              { title: 'Multi-Platform', desc: 'One click publish to TikTok, YouTube, Instagram & Facebook', icon: '🌐' },
              { title: 'AI Analytics', desc: 'Track performance and get AI recommendations to grow faster', icon: '📊' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <span className="text-2xl mb-2 block">{item.icon}</span>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-[#f8f9fc]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">9 AI Tools dalam 1 Platform</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Semua kebutuhan kreasi konten AI kamu — dari teks, gambar, video, audio, hingga 3D — tersedia dalam satu dashboard.
              </p>
            </motion.div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.07 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white border border-gray-100 shadow-card hover:shadow-card-hover hover:border-violet-200 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform ${feature.color}`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-3">{feature.description}</p>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-[11px] font-medium text-gray-400 mb-1">Contoh prompt:</p>
                  <p className="text-xs text-gray-600 italic">{feature.example}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Harga Simpel & Transparan</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Mulai gratis, upgrade kapan saja. Tanpa biaya tersembunyi, bisa batal kapan saja.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative p-6 rounded-2xl transition-all duration-300 ${
                  plan.popular
                    ? 'bg-white border-2 border-violet-200 shadow-premium scale-[1.02]'
                    : 'bg-white border border-gray-200 shadow-card hover:shadow-card-hover'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-primary text-white text-xs font-semibold shadow-premium">
                    Paling Populer
                  </span>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900">{plan.priceLabel}</span>
                    {plan.price > 0 && <span className="text-gray-400">/bulan</span>}
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className="h-4 w-4 text-violet-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block w-full text-center py-3 rounded-xl font-semibold transition ${
                    plan.popular
                      ? 'gradient-primary text-white hover:opacity-90 shadow-premium'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  Pilih Paket
                </Link>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-10">
            Semua paket termasuk garansi 14 hari uang kembali. Tidak perlu kartu kredit untuk paket Free.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 bg-[#f8f9fc]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-500 text-lg">Everything you need to know about NuViral</p>
            </motion.div>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <FaqItem key={index} question={item.question} answer={item.answer} />
            ))}
          </div>

          <div className="mt-12 text-center p-8 rounded-2xl bg-white border border-gray-200 shadow-card">
            <p className="text-gray-500 mb-3">Still have questions?</p>
            <a href="mailto:support@NuViral.com" className="text-violet-600 font-semibold hover:text-violet-700 transition">
              Contact our support team →
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 lg:p-16 rounded-2xl md:rounded-3xl gradient-primary relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Create Viral Content?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of creators using AI to generate viral short-form videos automatically.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-white text-violet-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition shadow-lg"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <p className="text-white/60 text-sm mt-4">No credit card required</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-bold text-gray-900">NuViral</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                AI-powered content creation platform for short-form video creators.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#features" className="hover:text-gray-900 transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-gray-900 transition">Pricing</a></li>
                <li><Link href="/login" className="hover:text-gray-900 transition">Dashboard</Link></li>
                <li><a href="#" className="hover:text-gray-900 transition">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Support</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/help" className="hover:text-gray-900 transition">Help Center</Link></li>
                <li><a href="#faq" className="hover:text-gray-900 transition">FAQ</a></li>
                <li><a href="#" className="hover:text-gray-900 transition">Documentation</a></li>
                <li><a href="#" className="hover:text-gray-900 transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-gray-900 transition">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-gray-900 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gray-900 transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-gray-900 transition">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">&copy; 2024 NuViral. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <a href="#" className="hover:text-gray-600 transition">Twitter</a>
              <a href="#" className="hover:text-gray-600 transition">Instagram</a>
              <a href="#" className="hover:text-gray-600 transition">YouTube</a>
              <a href="#" className="hover:text-gray-600 transition">TikTok</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Demo Video Component
function DemoVideo() {
  const [isPlaying, setIsPlaying] = useState(false);

  if (isPlaying) {
    return (
      <div className="aspect-video bg-black relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="w-full max-w-2xl px-6">
            <div className="flex items-center justify-center gap-3 mb-8">
              {['Prompt', 'Generate', 'Render', 'Publish'].map((step, i) => (
                <motion.div key={step} initial={{ opacity: 0.3 }} animate={{ opacity: 1 }} transition={{ delay: i * 2 }} className="flex items-center gap-2">
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1, backgroundColor: 'rgba(124,58,237,0.8)' }} transition={{ delay: i * 2 }} className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-white text-xs font-bold">{i + 1}</motion.div>
                  <span className="text-white/70 text-sm hidden sm:block">{step}</span>
                  {i < 3 && <div className="w-6 h-0.5 bg-white/10 hidden sm:block" />}
                </motion.div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-violet-400 text-xs font-medium mb-2">PROMPT</motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="text-white text-sm mb-4">&quot;Create a viral video about 5 AI tools that will change your life in 2024&quot;</motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }} className="space-y-2">
                <p className="text-emerald-400 text-xs font-medium">✓ GENERATING...</p>
                <div className="grid grid-cols-4 gap-2">
                  {['Script ✓', 'Voice ✓', 'Subtitle ✓', 'Video ✓'].map((item, i) => (
                    <motion.div key={item} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.5 + i * 0.8 }} className="px-2 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <span className="text-emerald-400 text-[10px] font-medium">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 7 }} className="mt-4 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <p className="text-violet-300 text-xs font-medium">🎉 Video Ready! Uploading to TikTok, YouTube, Instagram...</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
        <button onClick={() => setIsPlaying(false)} className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition z-20">✕ Close</button>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <motion.div initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 10, ease: 'linear' }} className="h-full bg-violet-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 relative cursor-pointer group" onClick={() => setIsPlaying(true)}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-3xl px-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center mb-3"><Sparkles className="h-4 w-4 text-violet-400" /></div>
              <p className="text-white text-sm font-medium mb-1">1. Enter Prompt</p>
              <p className="text-white/50 text-xs">Type your topic or idea</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3"><Video className="h-4 w-4 text-blue-400" /></div>
              <p className="text-white text-sm font-medium mb-1">2. AI Generates</p>
              <p className="text-white/50 text-xs">Script, voice, subtitles</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3"><TrendingUp className="h-4 w-4 text-emerald-400" /></div>
              <p className="text-white text-sm font-medium mb-1">3. Publish & Grow</p>
              <p className="text-white/50 text-xs">Auto upload to all platforms</p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-center gap-8">
            {[{ label: 'Videos Created', value: '2M+' }, { label: 'Active Creators', value: '50K+' }, { label: 'Views Generated', value: '1B+' }].map(stat => (
              <div key={stat.label} className="text-center"><p className="text-white text-xl font-bold">{stat.value}</p><p className="text-white/40 text-xs">{stat.label}</p></div>
            ))}
          </div>
        </div>
      </div>
      {/* Play button - always visible */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="w-20 h-20 rounded-full bg-white shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Play className="h-8 w-8 text-violet-600 ml-1" />
        </div>
      </div>
      <div className="absolute bottom-4 right-4 px-3 py-1 rounded-lg bg-black/60 text-white text-xs font-medium">2:34</div>
    </div>
  );
}

// FAQ Component
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="rounded-xl bg-white border border-gray-200 shadow-card overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition"
      >
        <span className="font-medium text-gray-900 pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-5 pb-5"
        >
          <p className="text-gray-500 text-sm leading-relaxed">{answer}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

// Pricing Data
const pricingPlans = [
  {
    name: 'Pemula',
    description: 'Cocok untuk mencoba',
    price: 45000,
    priceLabel: 'Rp 45.000',
    popular: false,
    features: [
      '50 AI credits/bulan',
      'Chat AI unlimited',
      '5 gambar AI (Flux Pro)',
      '3 video AI (Kling)',
      '2 musik AI (MiniMax)',
      '5 sound effects',
      '3 voice clone',
      '2 model 3D',
      '2GB storage',
    ],
  },
  {
    name: 'Starter',
    description: 'Untuk kreator individu',
    price: 225000,
    priceLabel: 'Rp 225.000',
    popular: false,
    features: [
      '210 AI credits/bulan',
      'Chat AI unlimited',
      '30 gambar AI (Flux Pro Ultra)',
      '21 video AI (Kling 3.0)',
      '15 image-to-video',
      '15 musik AI (MiniMax)',
      '30 sound effects',
      '20 voice clone',
      '10 model 3D',
      'Text-to-Speech unlimited',
      '10GB storage',
      '8 style preset',
    ],
  },
  {
    name: 'Pro',
    description: 'Untuk kreator serius',
    price: 449000,
    priceLabel: 'Rp 449.000',
    popular: true,
    features: [
      '420 AI credits/bulan',
      'Chat AI unlimited (Llama 4)',
      '60 gambar AI (Flux Pro Ultra)',
      '42 video AI (Kling 3.0 Pro)',
      '30 image-to-video',
      '30 musik AI (MiniMax + Lyria)',
      '60 sound effects',
      '40 voice clone',
      '20 model 3D (Hunyuan3D)',
      'Text-to-Speech HD unlimited',
      '50GB storage',
      'Priority rendering',
      'Semua style preset',
    ],
  },
  {
    name: 'Agency',
    description: 'Untuk tim & agensi',
    price: 1225000,
    priceLabel: 'Rp 1.225.000',
    popular: false,
    features: [
      '1.150 AI credits/bulan',
      'Chat AI unlimited (Llama 4)',
      '150 gambar AI (Flux Pro Ultra)',
      '115 video AI (Kling 3.0 Pro)',
      '80 image-to-video',
      '80 musik AI (semua model)',
      'Unlimited sound effects',
      '100 voice clone',
      '50 model 3D',
      'Text-to-Speech HD unlimited',
      '200GB storage',
      'Priority rendering',
      'API access',
      '20 team members',
      'Dedicated support',
    ],
  },
];

// FAQ Data
const faqItems = [
  { question: 'Apa itu NuViral?', answer: 'NuViral adalah platform SaaS berbasis AI yang membantu content creator membuat video viral untuk TikTok, YouTube Shorts, Instagram Reels, dan Facebook Reels secara otomatis.' },
  { question: 'Apakah saya perlu keahlian editing video?', answer: 'Tidak! Cukup ketik topik atau prompt, AI akan generate script, membuat video dengan subtitle, voiceover, dan efek secara otomatis.' },
  { question: 'Platform apa saja yang didukung?', answer: 'TikTok, YouTube Shorts, Instagram Reels, dan Facebook Reels. Anda bisa menghubungkan multiple akun dan menjadwalkan upload ke semua platform sekaligus.' },
  { question: 'Bagaimana cara kerja AI Video Generator?', answer: 'Masukkan topik atau script. AI akan membuat voiceover, subtitle animasi, background music, dan merender video dalam format 9:16 siap upload.' },
  { question: 'Apakah video yang dihasilkan original?', answer: 'Ya, 100% original. AI generate konten baru berdasarkan prompt Anda. Tidak ada copy-paste, aman dari masalah copyright.' },
  { question: 'Berapa lama proses render video?', answer: 'Biasanya 30 detik hingga 2 menit. Plan Pro dan Agency mendapat priority rendering yang lebih cepat.' },
  { question: 'Apakah bisa upload otomatis ke sosial media?', answer: 'Ya! Hubungkan akun via OAuth resmi, lalu jadwalkan upload otomatis pada waktu terbaik yang direkomendasikan AI.' },
  { question: 'Apakah ada free trial?', answer: 'Plan Free sudah termasuk 5 video renders dan 50 AI credits per bulan — gratis selamanya, tanpa kartu kredit.' },
  { question: 'Bagaimana cara pembayaran?', answer: 'Via kartu kredit/debit melalui Stripe. Pembayaran aman dan terenkripsi. Cancel kapan saja.' },
  { question: 'Apakah ada refund policy?', answer: '14-day money-back guarantee. Jika tidak puas, hubungi support untuk refund penuh.' },
  { question: 'Apakah melanggar kebijakan platform?', answer: 'Tidak. Kami menggunakan API resmi dan fokus pada AI productivity tools. Tidak ada fake engagement atau spam.' },
];

// Features Data
const features = [
  {
    icon: MessageSquare,
    title: 'AI Chat Assistant',
    color: 'bg-gradient-to-br from-violet-500 to-purple-600',
    description: 'Brainstorm ide konten viral, tulis script, caption, hashtag, dan strategi marketing. Jawaban detail dan actionable — seperti punya mentor kreatif pribadi.',
    example: '"Buatkan 10 ide konten TikTok tentang skincare untuk pemula, lengkap dengan hook dan CTA"',
  },
  {
    icon: ImageIcon,
    title: 'Text to Image',
    color: 'bg-gradient-to-br from-pink-500 to-rose-600',
    description: 'Generate gambar ultra-realistis dari deskripsi teks menggunakan Flux Pro 1.1 Ultra. Akurat terhadap prompt, detail tinggi, cocok untuk thumbnail & poster.',
    example: '"Kucing persia putih memakai topi koboi, duduk di padang rumput saat golden hour, fotorealistis, 4K"',
  },
  {
    icon: Video,
    title: 'Text to Video',
    color: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    description: 'Buat video cinematic 5-20 detik dari teks. Model Kling 3.0 Pro menghasilkan motion natural, lighting realistis, dan visual setara film profesional.',
    example: '"Drone shot cinematic, kota Jakarta saat matahari terbenam, lampu gedung menyala satu per satu, time-lapse"',
  },
  {
    icon: Play,
    title: 'Image to Video',
    color: 'bg-gradient-to-br from-emerald-500 to-green-600',
    description: 'Animasikan gambar statis menjadi video bergerak. Upload foto produk, artwork, atau potret — AI akan menambahkan gerakan cinematic yang natural.',
    example: 'Upload foto produk → "Kamera orbit 360° perlahan, background blur bokeh, studio lighting profesional"',
  },
  {
    icon: Volume2,
    title: 'Text to Speech',
    color: 'bg-gradient-to-br from-amber-500 to-orange-600',
    description: 'Ubah teks menjadi voiceover berkualitas tinggi. 5 pilihan suara natural, support Bahasa Indonesia, cocok untuk narasi video, podcast, dan audiobook.',
    example: '"Halo semuanya! Hari ini kita akan bahas 5 tips untuk meningkatkan engagement di TikTok..." (Voice: Nova)',
  },
  {
    icon: Zap,
    title: 'Text to Music',
    color: 'bg-gradient-to-br from-indigo-500 to-blue-600',
    description: 'Generate musik original dari deskripsi. Buat background music, jingle, atau lagu lengkap dengan vocal. Cocok untuk konten yang butuh musik tanpa copyright.',
    example: '"Upbeat lo-fi hip hop, santai, piano jazz dengan beat chill, cocok untuk video study, 30 detik"',
  },
  {
    icon: Sparkles,
    title: 'Sound Effects',
    color: 'bg-gradient-to-br from-red-500 to-pink-600',
    description: 'Generate efek suara berkualitas studio dari teks. Ledakan, alam, ambient, transisi — semua tersedia tanpa perlu cari sound library.',
    example: '"Suara petir dengan hujan deras dan angin kencang di hutan, cinematic, dramatic mood"',
  },
  {
    icon: Mic,
    title: 'Voice Clone',
    color: 'bg-gradient-to-br from-purple-500 to-violet-600',
    description: 'Clone suara siapa saja dari sample audio 5-30 detik. Generate speech dengan suara yang di-clone — cocok untuk dubbing, personalisasi, dan branding.',
    example: 'Upload audio 10 detik → "Selamat datang di channel saya, hari ini kita akan membahas..."',
  },
  {
    icon: Box,
    title: '3D Generation',
    color: 'bg-gradient-to-br from-teal-500 to-cyan-600',
    description: 'Buat model 3D dari teks atau gambar menggunakan Hunyuan3D v2. Output dalam format GLB siap digunakan untuk game, AR, e-commerce, dan presentasi.',
    example: '"Sepatu sneaker futuristik berwarna putih dengan aksen neon biru, desain minimalis, high-poly 3D"',
  },
];

