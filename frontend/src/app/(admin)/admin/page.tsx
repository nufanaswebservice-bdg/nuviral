'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Video, CreditCard, TrendingUp, Activity, Server, Zap, Globe } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVideos: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
  });

  useEffect(() => {
    // Load stats from localStorage (simulated)
    const videos = JSON.parse(localStorage.getItem('nuviral-videos') || '[]');
    setStats({
      totalUsers: 1,
      totalVideos: videos.length,
      totalRevenue: 0,
      activeSubscriptions: 0,
    });
  }, []);

  const cards = [
    { icon: Users, label: 'Total Users', value: stats.totalUsers, change: '+0%', color: 'from-blue-500 to-cyan-500' },
    { icon: Video, label: 'Videos Generated', value: stats.totalVideos, change: '+0%', color: 'from-violet-500 to-purple-500' },
    { icon: CreditCard, label: 'Revenue (IDR)', value: `Rp ${stats.totalRevenue.toLocaleString()}`, change: '+0%', color: 'from-emerald-500 to-green-500' },
    { icon: Zap, label: 'Active Subscriptions', value: stats.activeSubscriptions, change: '+0%', color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back, Super Admin</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl bg-gray-900 border border-white/5 hover:border-white/10 transition"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs text-emerald-400">{card.change}</span>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-sm text-gray-400">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-gray-900 border border-white/5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-violet-400" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <p className="text-sm text-gray-300">System online</p>
              <span className="text-xs text-gray-500 ml-auto">Now</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-2 h-2 rounded-full bg-violet-400" />
              <p className="text-sm text-gray-300">Admin dashboard deployed</p>
              <span className="text-xs text-gray-500 ml-auto">Just now</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gray-900 border border-white/5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Server className="h-5 w-5 text-violet-400" />
            System Status
          </h3>
          <div className="space-y-3">
            {[
              { name: 'API Server', status: 'Online', color: 'bg-emerald-400' },
              { name: 'Video Render', status: 'Online', color: 'bg-emerald-400' },
              { name: 'Database', status: 'Online', color: 'bg-emerald-400' },
              { name: 'CDN/Storage', status: 'Ready', color: 'bg-amber-400' },
            ].map((s) => (
              <div key={s.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-sm text-gray-300">{s.name}</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${s.color}`} />
                  <span className="text-xs text-gray-400">{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
