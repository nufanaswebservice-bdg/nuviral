'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Video, Plus, Play, Download, Trash2, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function VideosPage() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" />
            My Videos
          </h1>
          <p className="text-muted-foreground mt-1">Manage your generated videos</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/dashboard/ai-generator')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-medium"
        >
          <Plus className="h-4 w-4" />
          Create Video
        </motion.button>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border">
        <Video className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold mb-1">Belum ada video</h3>
        <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
          Mulai buat video pertamamu dengan AI Generator. Video yang sudah di-render akan muncul di sini.
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/dashboard/ai-generator')}
          className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-medium"
        >
          <Plus className="h-4 w-4" />
          Buat Video Pertama
        </motion.button>
      </div>
    </div>
  );
}
