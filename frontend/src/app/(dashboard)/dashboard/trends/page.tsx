'use client';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export default function TrendsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Trend Analyzer
        </h1>
        <p className="text-muted-foreground mt-1">Discover viral trends, hashtags, and competitor strategies</p>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border">
        <TrendingUp className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold mb-1">Fitur Trend Analyzer</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Fitur ini akan menampilkan trending topics, hashtags, dan analisis kompetitor secara real-time setelah akun sosial media terhubung.
        </p>
      </div>
    </div>
  );
}
