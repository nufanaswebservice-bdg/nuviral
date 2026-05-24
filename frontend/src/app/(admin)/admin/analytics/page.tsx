'use client';
import { BarChart3 } from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6 text-violet-400" /> Analytics</h1>
      <p className="text-gray-400 text-sm">User analytics, traffic, dan AI usage</p>
      <div className="p-12 rounded-2xl border border-dashed border-white/10 text-center">
        <BarChart3 className="h-12 w-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">Analytics akan tersedia setelah ada data user</p>
      </div>
    </div>
  );
}
