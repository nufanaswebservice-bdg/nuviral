'use client';
import { Shield } from 'lucide-react';

export default function AdminSecurityPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-violet-400" /> Security</h1>
      <p className="text-gray-400 text-sm">Rate limiting, IP blocking, dan admin logs</p>
      <div className="p-12 rounded-2xl border border-dashed border-white/10 text-center">
        <Shield className="h-12 w-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">Security settings — coming soon</p>
      </div>
    </div>
  );
}
