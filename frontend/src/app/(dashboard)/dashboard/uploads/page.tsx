'use client';

import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';

export default function UploadsPage() {
  return (
    <div className="space-y-4 md:space-y-6 max-w-full overflow-hidden">
      <div>
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <Upload className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
          Upload Queue
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor and manage your content uploads across platforms</p>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-12 md:py-20 rounded-xl md:rounded-2xl border border-dashed border-border">
        <Upload className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground/30 mb-3 md:mb-4" />
        <h3 className="text-base md:text-lg font-semibold mb-1">Belum ada upload</h3>
        <p className="text-xs md:text-sm text-muted-foreground text-center max-w-sm px-4">
          Setelah kamu membuat video dan menjadwalkan upload ke platform sosial media, antrian upload akan muncul di sini.
        </p>
      </div>
    </div>
  );
}
