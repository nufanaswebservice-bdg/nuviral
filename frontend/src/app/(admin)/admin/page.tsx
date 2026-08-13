'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Video, CreditCard, Zap, Activity, Server, RefreshCw } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.getlumora.cloud/api/v1';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken') || '';
      const headers = { 'Authorization': `Bearer ${token}` };

      const [usersRes, configRes, storageRes] = await Promise.all([
        fetch(`${API_URL}/admin/users`, { headers }).then(r => r.ok ? r.json() : []),
        fetch(`${API_URL}/admin/ai-config`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${API_URL}/admin/storage`, { headers }).then(r => r.ok ? r.json() : null),
      ]);

      setStats({
        totalUsers: usersRes.length || 0,
        activeUsers: usersRes.filter((u: any) => u.status === 'active').length || 0,
        subscribedUsers: usersRes.filter((u: any) => u.plan).length || 0,
        totalVideos: usersRes.reduce((a: number, u: any) => a + (u.videosUsed || 0), 0),
        totalSamples: storageRes?.totalVideos || 0,
        config: configRes,
        storage: storageRes,
      });
    } catch {}
    finally { setLoading(false); }
  };

  const cards = [
    { icon: Users, label: 'Total Users', value: stats?.totalUsers || 0, color: 'from-blue-500 to-cyan-500' },
    { icon: Video, label: 'Videos Generated', value: stats?.totalVideos || 0, color: 'from-violet-500 to-purple-500' },
    { icon: CreditCard, label: 'Subscribed', value: stats?.subscribedUsers || 0, color: 'from-emerald-500 to-green-500' },
    { icon: Zap, label: 'Video Samples', value: stats?.totalSamples || 0, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="space-y-4 md:space-y-6 max-w-full overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-gray-400 text-xs md:text-sm mt-1">Welcome back, Super Admin</p>
        </div>
        <button onClick={fetchStats} className="p-2 rounded-lg hover:bg-white/5 transition flex-shrink-0">
          <RefreshCw className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading dashboard...</div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {cards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3.5 md:p-5 rounded-xl md:rounded-2xl bg-gray-900 border border-white/5 hover:border-white/10 transition"
              >
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                    <card.icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                </div>
                <p className="text-lg md:text-2xl font-bold">{card.value}</p>
                <p className="text-xs md:text-sm text-gray-400">{card.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* AI System Status */}
            <div className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-gray-900 border border-white/5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-violet-400" />
                AI System
              </h3>
              {stats?.config ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <span className="text-sm text-gray-300">Primary Model</span>
                    <span className="text-xs font-medium text-violet-400">{stats.config.primaryModel}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <span className="text-sm text-gray-300">Cost per Video</span>
                    <span className="text-xs font-medium text-amber-400">{stats.config.primaryCost}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <span className="text-sm text-gray-300">TTS</span>
                    <span className="text-xs font-medium text-emerald-400">{stats.config.ttsModel}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <span className="text-sm text-gray-300">Prompt Optimizer</span>
                    <span className="text-xs font-medium text-blue-400">{stats.config.promptModel}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Unable to load config</p>
              )}
            </div>

            {/* System Status */}
            <div className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-gray-900 border border-white/5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Server className="h-5 w-5 text-violet-400" />
                System Status
              </h3>
              <div className="space-y-3">
                {stats?.config?.status && Object.entries(stats.config.status).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <span className="text-sm text-gray-300 capitalize">{key.replace(/_/g, ' ')}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${value ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      <span className="text-xs text-gray-400">{value ? 'Online' : 'Offline'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
