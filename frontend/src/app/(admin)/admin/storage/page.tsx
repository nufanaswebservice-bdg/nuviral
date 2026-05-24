'use client';
import { Database } from 'lucide-react';

export default function AdminStoragePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Database className="h-6 w-6 text-violet-400" /> Storage</h1>
      <p className="text-gray-400 text-sm">Storage usage dan CDN management</p>
      <div className="p-12 rounded-2xl border border-dashed border-white/10 text-center">
        <Database className="h-12 w-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">Storage management — coming soon</p>
      </div>
    </div>
  );
}
