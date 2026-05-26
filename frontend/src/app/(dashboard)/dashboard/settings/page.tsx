'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import {
  Settings,
  User,
  Bell,
  Palette,
  Shield,
  Globe,
  Key,
  Save,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'language', label: 'Language', icon: Globe },
];

export default function SettingsPage() {
  const { theme: currentTheme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    name: 'Demo User',
    email: 'demo@viralai.com',
    bio: 'Content creator using AI to go viral 🚀',
    website: 'https://viralai.com',
  });
  const [notifications, setNotifications] = useState({
    renderComplete: true,
    uploadComplete: true,
    uploadFailed: true,
    weeklyReport: true,
    trendAlerts: false,
    productUpdates: true,
    emailNotifications: true,
    pushNotifications: false,
  });
  const [appearance, setAppearance] = useState({
    theme: currentTheme || 'light',
    sidebarCompact: false,
    animationsEnabled: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [language, setLanguage] = useState('en');
  const [apiKey, setApiKey] = useState('vrai_sk_demo_1234567890abcdef');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-full overflow-hidden">
      <div>
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <Settings className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account preferences</p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 md:gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 -mx-1 px-1 lg:mx-0 lg:px-0">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-xs lg:text-sm font-medium transition text-left whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <TabIcon className="h-4 w-4 flex-shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Profile */}
            {activeTab === 'profile' && (
              <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
                <h2 className="text-lg font-semibold">Profile Settings</h2>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      {profile.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <button className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition text-sm font-medium">
                      Change Avatar
                    </button>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Max 2MB.</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Website</label>
                  <input
                    type="url"
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                  />
                </div>

                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
                <h2 className="text-lg font-semibold">Notification Preferences</h2>

                <div className="space-y-4">
                  {[
                    { key: 'renderComplete', label: 'Render Complete', desc: 'When a video finishes rendering' },
                    { key: 'uploadComplete', label: 'Upload Complete', desc: 'When a video is published successfully' },
                    { key: 'uploadFailed', label: 'Upload Failed', desc: 'When an upload fails or needs retry' },
                    { key: 'weeklyReport', label: 'Weekly Report', desc: 'Weekly analytics summary email' },
                    { key: 'trendAlerts', label: 'Trend Alerts', desc: 'When new trends match your niches' },
                    { key: 'productUpdates', label: 'Product Updates', desc: 'New features and improvements' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/30 transition">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                        className={`w-11 h-6 rounded-full transition ${notifications[item.key as keyof typeof notifications] ? 'bg-primary' : 'bg-muted'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border space-y-4">
                  <h3 className="text-sm font-semibold">Delivery Method</h3>
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/30 transition">
                    <div>
                      <p className="text-sm font-medium">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, emailNotifications: !notifications.emailNotifications })}
                      className={`w-11 h-6 rounded-full transition ${notifications.emailNotifications ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications.emailNotifications ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/30 transition">
                    <div>
                      <p className="text-sm font-medium">Push Notifications</p>
                      <p className="text-xs text-muted-foreground">Browser push notifications</p>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, pushNotifications: !notifications.pushNotifications })}
                      className={`w-11 h-6 rounded-full transition ${notifications.pushNotifications ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications.pushNotifications ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition"
                >
                  <Save className="h-4 w-4" />
                  Save Preferences
                </button>
              </div>
            )}

            {/* Appearance */}
            {activeTab === 'appearance' && (
              <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
                <h2 className="text-lg font-semibold">Appearance</h2>

                <div>
                  <label className="text-sm font-medium mb-3 block">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'system', label: 'System', icon: Monitor },
                    ].map((theme) => {
                      const ThemeIcon = theme.icon;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => { setAppearance({ ...appearance, theme: theme.id }); setTheme(theme.id); }}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition ${
                            appearance.theme === theme.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/30'
                          }`}
                        >
                          <ThemeIcon className="h-6 w-6" />
                          <span className="text-sm font-medium">{theme.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/30 transition">
                    <div>
                      <p className="text-sm font-medium">Compact Sidebar</p>
                      <p className="text-xs text-muted-foreground">Show icons only in sidebar</p>
                    </div>
                    <button
                      onClick={() => setAppearance({ ...appearance, sidebarCompact: !appearance.sidebarCompact })}
                      className={`w-11 h-6 rounded-full transition ${appearance.sidebarCompact ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${appearance.sidebarCompact ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/30 transition">
                    <div>
                      <p className="text-sm font-medium">Animations</p>
                      <p className="text-xs text-muted-foreground">Enable smooth animations and transitions</p>
                    </div>
                    <button
                      onClick={() => setAppearance({ ...appearance, animationsEnabled: !appearance.animationsEnabled })}
                      className={`w-11 h-6 rounded-full transition ${appearance.animationsEnabled ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${appearance.animationsEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setTheme(appearance.theme);
                    toast.success('Theme updated!');
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition"
                >
                  <Save className="h-4 w-4" />
                  Save Appearance
                </button>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
                <h2 className="text-lg font-semibold">Security Settings</h2>

                <div>
                  <h3 className="text-sm font-semibold mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwords.current}
                          onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                          placeholder="Enter current password"
                          className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">New Password</label>
                      <input
                        type="password"
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                        placeholder="Enter new password"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        placeholder="Confirm new password"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (passwords.new !== passwords.confirm) {
                      toast.error('Passwords do not match');
                      return;
                    }
                    toast.success('Password updated successfully!');
                    setPasswords({ current: '', new: '', confirm: '' });
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition"
                >
                  <Shield className="h-4 w-4" />
                  Update Password
                </button>

                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold mb-3">Sessions</h3>
                  <div className="p-3 rounded-xl bg-muted/50 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Current Session</p>
                      <p className="text-xs text-muted-foreground">Windows • Chrome • Active now</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500">Active</span>
                  </div>
                </div>
              </div>
            )}

            {/* Language */}
            {activeTab === 'language' && (
              <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
                <h2 className="text-lg font-semibold">Language & Region</h2>

                <div>
                  <label className="text-sm font-medium mb-2 block">Interface Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none transition"
                  >
                    <option value="en">English</option>
                    <option value="id">Bahasa Indonesia</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">日本語</option>
                    <option value="ko">한국어</option>
                    <option value="zh">中文</option>
                    <option value="pt">Português</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">AI Content Language</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none transition">
                    <option>English</option>
                    <option>Bahasa Indonesia</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Japanese</option>
                    <option>Korean</option>
                    <option>Chinese</option>
                    <option>Portuguese</option>
                    <option>Arabic</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">Language used for AI-generated scripts and captions</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Timezone</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none transition">
                    <option>Asia/Jakarta (GMT+7)</option>
                    <option>America/New_York (GMT-5)</option>
                    <option>America/Los_Angeles (GMT-8)</option>
                    <option>Europe/London (GMT+0)</option>
                    <option>Asia/Tokyo (GMT+9)</option>
                    <option>Asia/Singapore (GMT+8)</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">Used for scheduling and analytics timestamps</p>
                </div>

                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition"
                >
                  <Save className="h-4 w-4" />
                  Save Language Settings
                </button>
              </div>
            )}

            {/* API Keys */}
            {activeTab === 'api' && (
              <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
                <h2 className="text-lg font-semibold">API Access</h2>
                <p className="text-sm text-muted-foreground">
                  Use your API key to integrate ViralAI with external tools and services.
                  Available on Pro and Agency plans.
                </p>

                <div>
                  <label className="text-sm font-medium mb-2 block">Your API Key</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey}
                        readOnly
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-muted/50 outline-none font-mono text-sm"
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(apiKey);
                        toast.success('API key copied!');
                      }}
                      className="px-4 py-3 rounded-xl border border-border hover:bg-accent transition text-sm font-medium"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Keep your API key secret. Do not share it publicly.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm text-amber-500 font-medium">⚠️ Regenerating your key will invalidate the current one</p>
                </div>

                <button
                  onClick={() => {
                    if (confirm('Are you sure? This will invalidate your current API key.')) {
                      setApiKey(`vrai_sk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`);
                      toast.success('New API key generated!');
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border hover:bg-accent transition font-medium text-sm"
                >
                  <Key className="h-4 w-4" />
                  Regenerate API Key
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
