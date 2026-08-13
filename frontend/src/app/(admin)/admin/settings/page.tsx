'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Settings, Globe, Mail, CreditCard, Zap, Palette, Save, Eye, EyeOff } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.getlumora.cloud/api/v1';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'website' | 'smtp' | 'payment' | 'ai' | 'branding'>('website');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [settings, setSettings] = useState({
    website: {
      siteName: 'Lumora',
      siteUrl: 'https://Lumora.cloud',
      siteDescription: 'AI Video Generator Platform - Buat video viral otomatis',
      siteKeywords: 'AI video, video generator, TikTok, Reels, Shorts, content creator',
      googleAnalyticsId: '',
      language: 'id',
      timezone: 'Asia/Jakarta',
    },
    smtp: {
      host: 'smtp.gmail.com',
      port: '587',
      user: '',
      password: '',
      fromName: 'Lumora',
      fromEmail: 'noreply@Lumora.cloud',
    },
    payment: {
      midtransServerKey: process.env.MIDTRANS_SERVER_KEY ? '••••••••' : '',
      midtransClientKey: process.env.MIDTRANS_CLIENT_KEY ? '••••••••' : '',
      midtransIsProduction: true,
      currency: 'IDR',
    },
    ai: {
      openaiApiKey: process.env.OPENAI_API_KEY ? '••••••••' : '',
      replicateToken: process.env.REPLICATE_API_TOKEN ? '••••••••' : '',
      primaryModel: 'wan-video/wan-2.1-1.3b',
      fallbackModel: 'minimax/video-01',
      ttsModel: 'tts-1',
      maxVideoPerDay: 50,
      maxDuration: 20,
    },
    branding: {
      primaryColor: '#8B5CF6',
      logoUrl: '',
      faviconUrl: '',
      footerText: '© 2026 Lumora. All rights reserved.',
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('accessToken') || '';
      const res = await fetch(`${API_URL}/admin/settings`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          setSettings(s => ({ ...s, ...data }));
        }
      }
    } catch {}
  };

  const saveSettings = async () => {
    try {
      const token = localStorage.getItem('accessToken') || '';
      await fetch(`${API_URL}/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      toast.success('Settings saved!');
    } catch {
      toast.error('Failed to save settings');
    }
  };

  const toggleShowKey = (key: string) => setShowKeys(s => ({ ...s, [key]: !s[key] }));

  const tabs = [
    { id: 'website', label: '🌐 Website', icon: Globe },
    { id: 'smtp', label: '📧 SMTP', icon: Mail },
    { id: 'payment', label: '💳 Payment', icon: CreditCard },
    { id: 'ai', label: '🤖 AI API', icon: Zap },
    { id: 'branding', label: '🎨 Branding', icon: Palette },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-violet-400" />
            Settings
          </h1>
          <p className="text-gray-400 text-sm mt-1">Konfigurasi website, API, dan integrasi</p>
        </div>
        <button onClick={saveSettings} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium text-sm">
          <Save className="h-4 w-4" /> Save Settings
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-gray-900 w-fit flex-wrap">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Website Settings */}
      {activeTab === 'website' && (
        <div className="p-5 rounded-xl bg-gray-900 border border-white/5 space-y-4">
          <h3 className="font-medium">Website & SEO</h3>
          {Object.entries(settings.website).map(([key, value]) => (
            <div key={key}>
              <label className="text-xs text-gray-400 mb-1 block capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
              <input value={value} onChange={e => setSettings(s => ({ ...s, website: { ...s.website, [key]: e.target.value } }))} className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm" />
            </div>
          ))}
        </div>
      )}

      {/* SMTP Settings */}
      {activeTab === 'smtp' && (
        <div className="p-5 rounded-xl bg-gray-900 border border-white/5 space-y-4">
          <h3 className="font-medium">Email / SMTP Configuration</h3>
          {Object.entries(settings.smtp).map(([key, value]) => (
            <div key={key}>
              <label className="text-xs text-gray-400 mb-1 block capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
              <div className="relative">
                <input
                  type={key === 'password' && !showKeys[key] ? 'password' : 'text'}
                  value={value}
                  onChange={e => setSettings(s => ({ ...s, smtp: { ...s.smtp, [key]: e.target.value } }))}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm"
                />
                {key === 'password' && (
                  <button onClick={() => toggleShowKey(key)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1">
                    {showKeys[key] ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Settings */}
      {activeTab === 'payment' && (
        <div className="p-5 rounded-xl bg-gray-900 border border-white/5 space-y-4">
          <h3 className="font-medium">Payment Gateway (Midtrans)</h3>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Server Key</label>
            <input value={settings.payment.midtransServerKey} onChange={e => setSettings(s => ({ ...s, payment: { ...s.payment, midtransServerKey: e.target.value } }))} className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm font-mono" placeholder="Mid-server-xxx" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Client Key</label>
            <input value={settings.payment.midtransClientKey} onChange={e => setSettings(s => ({ ...s, payment: { ...s.payment, midtransClientKey: e.target.value } }))} className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm font-mono" placeholder="Mid-client-xxx" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Production Mode</span>
            <button onClick={() => setSettings(s => ({ ...s, payment: { ...s.payment, midtransIsProduction: !s.payment.midtransIsProduction } }))} className={`w-10 h-5 rounded-full transition ${settings.payment.midtransIsProduction ? 'bg-emerald-500' : 'bg-gray-700'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.payment.midtransIsProduction ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <p className="text-[10px] text-gray-500">⚠️ Perubahan key payment harus diupdate juga di Railway environment variables</p>
        </div>
      )}

      {/* AI Settings */}
      {activeTab === 'ai' && (
        <div className="p-5 rounded-xl bg-gray-900 border border-white/5 space-y-4">
          <h3 className="font-medium">AI API Configuration</h3>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">OpenAI API Key</label>
            <input value={settings.ai.openaiApiKey} onChange={e => setSettings(s => ({ ...s, ai: { ...s.ai, openaiApiKey: e.target.value } }))} className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm font-mono" placeholder="sk-..." />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Replicate API Token</label>
            <input value={settings.ai.replicateToken} onChange={e => setSettings(s => ({ ...s, ai: { ...s.ai, replicateToken: e.target.value } }))} className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm font-mono" placeholder="r8_..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Primary Video Model</label>
              <input value={settings.ai.primaryModel} onChange={e => setSettings(s => ({ ...s, ai: { ...s.ai, primaryModel: e.target.value } }))} className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Fallback Model</label>
              <input value={settings.ai.fallbackModel} onChange={e => setSettings(s => ({ ...s, ai: { ...s.ai, fallbackModel: e.target.value } }))} className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Max Video/Day per User</label>
              <input type="number" value={settings.ai.maxVideoPerDay} onChange={e => setSettings(s => ({ ...s, ai: { ...s.ai, maxVideoPerDay: +e.target.value } }))} className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Max Duration (seconds)</label>
              <input type="number" value={settings.ai.maxDuration} onChange={e => setSettings(s => ({ ...s, ai: { ...s.ai, maxDuration: +e.target.value } }))} className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm" />
            </div>
          </div>
          <p className="text-[10px] text-gray-500">⚠️ API keys disimpan di Railway env. Perubahan di sini hanya untuk referensi admin.</p>
        </div>
      )}

      {/* Branding */}
      {activeTab === 'branding' && (
        <div className="p-5 rounded-xl bg-gray-900 border border-white/5 space-y-4">
          <h3 className="font-medium">Branding</h3>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Primary Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={settings.branding.primaryColor} onChange={e => setSettings(s => ({ ...s, branding: { ...s.branding, primaryColor: e.target.value } }))} className="w-10 h-10 rounded-lg cursor-pointer" />
              <input value={settings.branding.primaryColor} onChange={e => setSettings(s => ({ ...s, branding: { ...s.branding, primaryColor: e.target.value } }))} className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm font-mono" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Logo URL</label>
            <input value={settings.branding.logoUrl} onChange={e => setSettings(s => ({ ...s, branding: { ...s.branding, logoUrl: e.target.value } }))} placeholder="https://..." className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Favicon URL</label>
            <input value={settings.branding.faviconUrl} onChange={e => setSettings(s => ({ ...s, branding: { ...s.branding, faviconUrl: e.target.value } }))} placeholder="https://..." className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Footer Text</label>
            <input value={settings.branding.footerText} onChange={e => setSettings(s => ({ ...s, branding: { ...s.branding, footerText: e.target.value } }))} className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm" />
          </div>
        </div>
      )}
    </div>
  );
}
