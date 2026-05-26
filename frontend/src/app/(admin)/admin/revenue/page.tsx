'use client';
import { CreditCard } from 'lucide-react';

export default function AdminRevenuePage() {
  return (
    <div className="space-y-4 md:space-y-6 max-w-full overflow-hidden">
      <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2"><CreditCard className="h-5 w-5 md:h-6 md:w-6 text-violet-400" /> Revenue & Payment</h1>
      <p className="text-gray-400 text-xs md:text-sm">Monitor pendapatan dan transaksi Midtrans</p>
      <div className="p-8 md:p-12 rounded-xl md:rounded-2xl border border-dashed border-white/10 text-center">
        <CreditCard className="h-10 w-10 md:h-12 md:w-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Revenue dashboard akan tersedia setelah ada transaksi</p>
      </div>
    </div>
  );
}
