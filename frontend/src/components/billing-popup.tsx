'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { X, CreditCard, Zap, Sparkles } from 'lucide-react';

interface BillingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  creditsUsed: number;
  creditsLimit: number;
}

export function BillingPopup({ isOpen, onClose, creditsUsed, creditsLimit }: BillingPopupProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md p-6 rounded-2xl border border-border bg-card shadow-xl mx-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            {creditsLimit === 0 ? 'Berlangganan Dulu' : 'Kredit Habis'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">
            {creditsLimit === 0
              ? 'Kamu belum berlangganan'
              : `Kredit AI kamu sudah habis (${creditsUsed}/${creditsLimit})`
            }
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Pilih paket berlangganan untuk menggunakan fitur AI Video Generator dan mendapatkan kredit AI.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 transition cursor-pointer"
            onClick={() => { onClose(); router.push('/dashboard/billing'); }}
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Starter — Rp 225.000/bln</p>
              <p className="text-xs text-muted-foreground">500 AI credits/bulan</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5 cursor-pointer"
            onClick={() => { onClose(); router.push('/dashboard/billing'); }}
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Pro — Rp 449.000/bln <span className="text-xs text-primary">(Populer)</span></p>
              <p className="text-xs text-muted-foreground">2000 AI credits/bulan</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border hover:bg-accent transition text-sm font-medium"
          >
            Nanti
          </button>
          <button
            onClick={() => { onClose(); router.push('/dashboard/billing'); }}
            className="flex-1 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 transition"
          >
            Upgrade Sekarang
          </button>
        </div>
      </motion.div>
    </div>
  );
}
