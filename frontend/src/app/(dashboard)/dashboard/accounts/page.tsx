'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, X, Loader2 } from 'lucide-react';

const platformConfig: Record<string, { color: string; bg: string; icon: string }> = {
  TikTok: { color: 'text-white', bg: 'bg-black', icon: '🎵' },
  YouTube: { color: 'text-white', bg: 'bg-red-600', icon: '▶️' },
  Instagram: { color: 'text-white', bg: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400', icon: '📸' },
  Facebook: { color: 'text-white', bg: 'bg-blue-600', icon: '👤' },
};

export default function AccountsPage() {
  const [showConnect, setShowConnect] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = (platform: string) => {
    setConnecting(platform);
    // Redirect to OAuth flow
    if (platform === 'YouTube') {
      window.location.href = 'https://nuviral-production.up.railway.app/auth/youtube';
    } else {
      // Placeholder for other platforms
      setTimeout(() => {
        setConnecting(null);
        setShowConnect(false);
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Social Accounts
          </h1>
          <p className="text-muted-foreground mt-1">Manage your connected social media accounts</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowConnect(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-medium"
        >
          <Plus className="h-4 w-4" />
          Connect Account
        </motion.button>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border">
        <Users className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold mb-1">Belum ada akun terhubung</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
          Hubungkan akun sosial media kamu untuk mulai upload dan jadwalkan konten secara otomatis.
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowConnect(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-medium"
        >
          <Plus className="h-4 w-4" />
          Hubungkan Akun
        </motion.button>
      </div>

      {/* Connect Modal */}
      {showConnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-6 rounded-2xl border border-border bg-card shadow-xl mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Connect Social Account</h2>
              <button onClick={() => setShowConnect(false)} className="p-1 rounded-lg hover:bg-accent">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Pilih platform untuk dihubungkan. Kamu akan diarahkan ke halaman otorisasi.
            </p>

            <div className="space-y-3">
              {Object.entries(platformConfig).map(([platform, config]) => {
                const isConnecting = connecting === platform;
                return (
                  <button
                    key={platform}
                    onClick={() => handleConnect(platform)}
                    disabled={isConnecting}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/50 transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center text-lg`}>
                      {config.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{platform}</p>
                      <p className="text-xs text-muted-foreground">Connect your {platform} account</p>
                    </div>
                    {isConnecting && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Kami menggunakan OAuth2 resmi. Password kamu tidak pernah disimpan.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
