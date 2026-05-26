'use client';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export default function TrendsPage() {
  return (
    <div className="space-y-4 md:space-y-6 max-w-full overflow-hidden">
      <div>
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
          Trend Analyzer
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Discover viral trends, hashtags, and competitor strategies</p>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-12 md:py-20 rounded-xl md:rounded-2xl border border-dashed border-border">
        <TrendingUp className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground/30 mb-3 md:mb-4" />
        <h3 className="text-base md:text-lg font-semibold mb-1">Fitur Trend Analyzer</h3>
        <p className="text-xs md:text-sm text-muted-foreground text-center max-w-sm px-4">
          Fitur ini akan menampilkan trending topics, hashtags, dan analisis kompetitor secara real-time setelah akun sosial media terhubung.
        </p>
      </div>
    </div>
  );
}
