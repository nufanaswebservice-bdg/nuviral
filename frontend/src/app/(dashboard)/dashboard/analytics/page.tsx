'use client';

import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Track your content performance across all platforms</p>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border">
        <BarChart3 className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold mb-1">Belum ada data analitik</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Hubungkan akun sosial media dan mulai upload konten. Data performa akan ditampilkan di sini secara otomatis.
        </p>
      </div>
    </div>
  );
}
