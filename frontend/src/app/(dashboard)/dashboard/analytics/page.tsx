'use client';

import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-4 md:space-y-6 max-w-full overflow-hidden">
      <div>
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
          Analytics Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Track your content performance across all platforms</p>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-12 md:py-20 rounded-xl md:rounded-2xl border border-dashed border-border">
        <BarChart3 className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground/30 mb-3 md:mb-4" />
        <h3 className="text-base md:text-lg font-semibold mb-1">Belum ada data analitik</h3>
        <p className="text-xs md:text-sm text-muted-foreground text-center max-w-sm px-4">
          Hubungkan akun sosial media dan mulai upload konten. Data performa akan ditampilkan di sini secara otomatis.
        </p>
      </div>
    </div>
  );
}
