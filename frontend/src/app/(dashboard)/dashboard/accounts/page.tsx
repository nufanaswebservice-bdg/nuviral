'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  CheckCircle,
  AlertCircle,
  Trash2,
  RefreshCw,
  ExternalLink,
  Shield,
  X,
  Loader2,
} from 'lucide-react';

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  displayName: string;
  avatar: string;
  followers: string;
  isActive: boolean;
  connectedAt: string;
  tokenExpires?: string;
}

const platformConfig: Record<string, { color: string; bg: string; icon: string }> = {
  TikTok: { color: 'text-white', bg: 'bg-black', icon: '🎵' },
  YouTube: { color: 'text-white', bg: 'bg-red-600', icon: '▶️' },
  Instagram: { color: 'text-white', bg: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400', icon: '📸' },
  Facebook: { color: 'text-white', bg: 'bg-blue-600', icon: '👤' },
};

const initialAccounts: SocialAccount[] = [
  {
    id: '1',
    platform: 'TikTok',
    username: '@viralai_tech',
    displayName: 'ViralAI Tech',
    avatar: 'VT',
    followers: '45.2K',
    isActive: true,
    connectedAt: '2 months ago',
  },
  {
    id: '2',
    platform: 'YouTube',
    username: '@ViralAI',
    displayName: 'ViralAI',
    avatar: 'VA',
    followers: '23.1K',
    isActive: true,
    connectedAt: '1 month ago',
  },
  {
    id: '3',
    platform: 'Instagram',
    username: '@viralai.daily',
    displayName: 'ViralAI Daily',
    avatar: 'VD',
    followers: '18.7K',
    isActive: true,
    connectedAt: '3 weeks ago',
  },
  {
    id: '4',
    platform: 'Facebook',
    username: 'ViralAI Page',
    displayName: 'ViralAI Official',
    avatar: 'VO',
    followers: '12.3K',
    isActive: false,
    connectedAt: '1 month ago',
    tokenExpires: 'Token expired — reconnect required',
  },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>(initialAccounts);
  const [showConnect, setShowConnect] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleDisconnect = (id: string) => {
    if (confirm('Are you sure you want to disconnect this account?')) {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleReconnect = (id: string) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, isActive: true, tokenExpires: undefined } : a
      )
    );
  };

  const handleConnect = (platform: string) => {
    setConnecting(platform);

    // Simulate OAuth flow
    setTimeout(() => {
      const newAccount: SocialAccount = {
        id: Date.now().toString(),
        platform,
        username: `@viralai_${platform.toLowerCase()}`,
        displayName: `ViralAI ${platform}`,
        avatar: platform.charAt(0),
        followers: '0',
        isActive: true,
        connectedAt: 'Just now',
      };
      setAccounts((prev) => [...prev, newAccount]);
      setConnecting(null);
      setShowConnect(false);
    }, 2000);
  };

  const activeCount = accounts.filter((a) => a.isActive).length;
  const inactiveCount = accounts.filter((a) => !a.isActive).length;

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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-border bg-card">
          <p className="text-2xl font-bold">{accounts.length}</p>
          <p className="text-sm text-muted-foreground">Total Accounts</p>
        </div>
        <div className="p-4 rounded-2xl border border-border bg-card">
          <p className="text-2xl font-bold text-green-500">{activeCount}</p>
          <p className="text-sm text-muted-foreground">Active</p>
        </div>
        <div className="p-4 rounded-2xl border border-border bg-card">
          <p className="text-2xl font-bold text-red-500">{inactiveCount}</p>
          <p className="text-sm text-muted-foreground">Needs Attention</p>
        </div>
      </div>

      {/* Accounts List */}
      <div className="space-y-4">
        {accounts.map((account, index) => {
          const config = platformConfig[account.platform];
          return (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-5 rounded-2xl border bg-card transition ${
                account.isActive ? 'border-border' : 'border-red-500/30 bg-red-500/5'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Platform Avatar */}
                <div className={`w-14 h-14 rounded-xl ${config.bg} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {config.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{account.displayName}</h3>
                    {account.isActive ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-muted-foreground">{account.username}</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{account.platform}</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{account.followers} followers</span>
                  </div>
                  {account.tokenExpires && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {account.tokenExpires}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Connected {account.connectedAt}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!account.isActive && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleReconnect(account.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Reconnect
                    </motion.button>
                  )}
                  {account.isActive && (
                    <button className="p-2 rounded-lg hover:bg-accent transition" title="View profile">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDisconnect(account.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 transition"
                    title="Disconnect"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Security Note */}
      <div className="p-4 rounded-2xl border border-border bg-muted/30 flex items-start gap-3">
        <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">Your accounts are secure</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            We use official OAuth2 APIs to connect your accounts. We never store your passwords.
            Access tokens are encrypted and can be revoked at any time.
          </p>
        </div>
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
              Select a platform to connect. You&apos;ll be redirected to authorize access.
            </p>

            <div className="space-y-3">
              {Object.entries(platformConfig).map(([platform, config]) => {
                const isConnecting = connecting === platform;
                const alreadyConnected = accounts.some((a) => a.platform === platform && a.isActive);

                return (
                  <button
                    key={platform}
                    onClick={() => !alreadyConnected && handleConnect(platform)}
                    disabled={isConnecting || alreadyConnected}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition ${
                      alreadyConnected
                        ? 'border-green-500/30 bg-green-500/5 opacity-60'
                        : 'border-border hover:border-primary/30 hover:bg-accent/50'
                    } disabled:cursor-not-allowed`}
                  >
                    <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center text-lg`}>
                      {config.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{platform}</p>
                      <p className="text-xs text-muted-foreground">
                        {alreadyConnected ? 'Already connected' : `Connect your ${platform} account`}
                      </p>
                    </div>
                    {isConnecting && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                    {alreadyConnected && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              By connecting, you authorize ViralAI to publish content on your behalf.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
