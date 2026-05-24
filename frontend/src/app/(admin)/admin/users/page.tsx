'use client';
import { Users, Search } from 'lucide-react';

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-violet-400" /> User Management</h1>
      <p className="text-gray-400 text-sm">Kelola semua user, subscription, dan limit</p>
      <div className="p-12 rounded-2xl border border-dashed border-white/10 text-center">
        <Users className="h-12 w-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">User management akan tersedia setelah database terhubung</p>
      </div>
    </div>
  );
}
