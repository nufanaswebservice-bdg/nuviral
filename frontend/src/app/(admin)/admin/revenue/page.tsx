'use client';
import { CreditCard } from 'lucide-react';

export default function AdminRevenuePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><CreditCard className="h-6 w-6 text-violet-400" /> Revenue & Payment</h1>
      <p className="text-gray-400 text-sm">Monitor pendapatan dan transaksi Midtrans</p>
      <div className="p-12 rounded-2xl border border-dashed border-white/10 text-center">
        <CreditCard className="h-12 w-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">Revenue dashboard akan tersedia setelah ada transaksi</p>
      </div>
    </div>
  );
}
