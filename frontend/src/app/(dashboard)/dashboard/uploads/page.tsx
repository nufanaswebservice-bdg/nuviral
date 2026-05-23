'use client';

import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';

export default function UploadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Upload className="h-6 w-6 text-primary" />
          Upload Queue
        </h1>
        <p className="text-muted-foreground mt-1">Monitor and manage your content uploads across platforms</p>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border">
        <Upload className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold mb-1">Belum ada upload</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Setelah kamu membuat video dan menjadwalkan upload ke platform sosial media, antrian upload akan muncul di sini.
        </p>
      </div>
    </div>
  );
}
