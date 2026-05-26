'use client';
import { BarChart3 } from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-4 md:space-y-6 max-w-full overflow-hidden">
      <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-violet-400" /> Analytics</h1>
      <p className="text-gray-400 text-xs md:text-sm">User analytics, traffic, dan AI usage</p>
      <div className="p-8 md:p-12 rounded-xl md:rounded-2xl border border-dashed border-white/10 text-center">
        <BarChart3 className="h-10 w-10 md:h-12 md:w-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Analytics akan tersedia setelah ada data user</p>
      </div>
    </div>
  );
}
