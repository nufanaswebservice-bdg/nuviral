'use client';

import { Calendar } from 'lucide-react';

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          Schedule
        </h1>
        <p className="text-muted-foreground mt-1">Jadwalkan upload konten ke platform sosial media</p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border">
        <Calendar className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold mb-1">Belum ada jadwal</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Setelah kamu membuat video dan menghubungkan akun sosial media, kamu bisa menjadwalkan upload otomatis di sini.
        </p>
      </div>
    </div>
  );
}
