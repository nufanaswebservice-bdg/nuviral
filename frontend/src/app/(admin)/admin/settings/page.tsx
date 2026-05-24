'use client';
import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="h-6 w-6 text-violet-400" /> Settings</h1>
      <p className="text-gray-400 text-sm">Website settings, SEO, SMTP, payment, dan branding</p>
      <div className="p-12 rounded-2xl border border-dashed border-white/10 text-center">
        <Settings className="h-12 w-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">Settings page — coming soon</p>
      </div>
    </div>
  );
}
