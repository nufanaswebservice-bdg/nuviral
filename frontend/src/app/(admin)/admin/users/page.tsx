'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Users, Search, Shield, Ban, Trash2, RefreshCw, Crown, User } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nuviral-production.up.railway.app/api/v1';

interface UserData {
  id: string;
  email: string;
  name: string;
  avatar: string;
  provider: string;
  role: string;
  status: string;
  plan: string | null;
  createdAt: string;
  lastLogin: string;
  loginCount: number;
  videosGenerated: number;
  videosUsed: number;
  aiCreditsUsed: number;
  videoLimit: number;
  periodStart: string | null;
  periodEnd: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken') || '';
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleSuspend = async (user: UserData) => {
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    const token = localStorage.getItem('accessToken') || '';
    await fetch(`${API_URL}/admin/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    });
    toast.success(newStatus === 'suspended' ? 'User suspended' : 'User activated');
    fetchUsers();
  };

  const handleDelete = async (user: UserData) => {
    if (!confirm(`Hapus user ${user.email}?`)) return;
    const token = localStorage.getItem('accessToken') || '';
    await fetch(`${API_URL}/admin/users/${user.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    toast.success('User deleted');
    fetchUsers();
  };

  const handleRoleChange = async (user: UserData, role: string) => {
    const token = localStorage.getItem('accessToken') || '';
    await fetch(`${API_URL}/admin/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ role }),
    });
    toast.success(`Role updated to ${role}`);
    fetchUsers();
  };

  const handlePlanChange = async (user: UserData, plan: string) => {
    const token = localStorage.getItem('accessToken') || '';
    await fetch(`${API_URL}/admin/users/${user.id}/plan`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ plan: plan === 'NONE' ? null : plan }),
    });
    toast.success(plan === 'NONE' ? 'Plan removed' : `Plan set to ${plan}`);
    fetchUsers();
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-full overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 md:h-6 md:w-6 text-violet-400 flex-shrink-0" />
            User Management
          </h1>
          <p className="text-gray-400 text-xs md:text-sm mt-1">Kelola semua user terdaftar</p>
        </div>
        <button onClick={fetchUsers} className="p-2 rounded-lg hover:bg-white/5 transition flex-shrink-0">
          <RefreshCw className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <div className="p-3 md:p-4 rounded-xl bg-gray-900 border border-white/5">
          <p className="text-xl md:text-2xl font-bold">{users.length}</p>
          <p className="text-[11px] md:text-xs text-gray-400">Total Users</p>
        </div>
        <div className="p-3 md:p-4 rounded-xl bg-gray-900 border border-white/5">
          <p className="text-xl md:text-2xl font-bold text-emerald-400">{users.filter(u => u.status === 'active').length}</p>
          <p className="text-[11px] md:text-xs text-gray-400">Active</p>
        </div>
        <div className="p-3 md:p-4 rounded-xl bg-gray-900 border border-white/5">
          <p className="text-xl md:text-2xl font-bold text-red-400">{users.filter(u => u.status === 'suspended').length}</p>
          <p className="text-[11px] md:text-xs text-gray-400">Suspended</p>
        </div>
        <div className="p-3 md:p-4 rounded-xl bg-gray-900 border border-white/5">
          <p className="text-xl md:text-2xl font-bold text-violet-400">{users.filter(u => u.plan).length}</p>
          <p className="text-[11px] md:text-xs text-gray-400">Subscribed</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full md:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari user..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900 border border-white/10 text-white focus:border-violet-500 outline-none transition text-sm"
        />
      </div>

      {/* User List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-white/10">
          <Users className="h-12 w-12 text-gray-600 mb-3" />
          <p className="text-gray-400">{search ? 'User tidak ditemukan' : 'Belum ada user terdaftar'}</p>
          <p className="text-gray-500 text-xs mt-1">User akan muncul setelah mereka login ke nuviral.cloud</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="p-3 md:p-4 rounded-xl bg-gray-900 border border-white/5 hover:border-white/10 transition"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white text-xs md:text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-medium text-sm truncate">{user.name}</p>
                    {user.role === 'ADMIN' && <Crown className="h-3 w-3 text-amber-400 flex-shrink-0" />}
                    {user.status === 'suspended' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">Suspended</span>
                    )}
                    {user.plan && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400">{user.plan}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  <div className="flex items-center gap-2 md:gap-3 mt-1 flex-wrap">
                    <span className="text-[10px] text-gray-600">Login: {user.loginCount}x</span>
                    <span className="text-[10px] text-gray-600 hidden sm:inline">Last: {formatDate(user.lastLogin)}</span>
                    <span className="text-[10px] text-gray-600">Via: {user.provider}</span>
                    {user.plan && (
                      <span className="text-[10px] text-violet-400">Video: {user.videosUsed}/{user.videoLimit}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions - always visible on mobile */}
              <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-white/5 md:mt-0 md:pt-0 md:border-0">
                <select
                  value={user.plan || 'NONE'}
                  onChange={(e) => handlePlanChange(user, e.target.value)}
                  className="text-[11px] md:text-xs bg-gray-800 border border-white/10 rounded-lg px-2 py-1.5 text-gray-300 flex-1 md:flex-none"
                >
                  <option value="NONE">No Plan</option>
                  <option value="STARTER">Starter</option>
                  <option value="PRO">Pro</option>
                  <option value="AGENCY">Agency</option>
                </select>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user, e.target.value)}
                  className="text-[11px] md:text-xs bg-gray-800 border border-white/10 rounded-lg px-2 py-1.5 text-gray-300 flex-1 md:flex-none"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MODERATOR">Moderator</option>
                </select>
                <button
                  onClick={() => handleSuspend(user)}
                  className={`p-2 rounded-lg transition flex-shrink-0 ${user.status === 'suspended' ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-amber-500/10 text-gray-500 hover:text-amber-400'}`}
                  title={user.status === 'suspended' ? 'Activate' : 'Suspend'}
                >
                  <Ban className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(user)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition flex-shrink-0"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
