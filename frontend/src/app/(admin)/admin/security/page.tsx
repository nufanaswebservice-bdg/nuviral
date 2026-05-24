'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Shield, Ban, Globe, Activity, AlertTriangle, CheckCircle, Plus, Trash2, RefreshCw } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nuviral-production.up.railway.app/api/v1';

export default function AdminSecurityPage() {
  const [blockedIPs, setBlockedIPs] = useState<string[]>([]);
  const [newIP, setNewIP] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    rateLimitPerMinute: 60,
    maxLoginAttempts: 5,
    sessionTimeout: 7,
    maintenanceMode: false,
    antiSpamEnabled: true,
    forceHttps: true,
  });

  useEffect(() => {
    fetchSecurity();
  }, []);

  const fetchSecurity = async () => {
    try {
      const token = localStorage.getItem('accessToken') || '';
      const res = await fetch(`${API_URL}/admin/security`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBlockedIPs(data.blockedIPs || []);
        setLogs(data.logs || []);
        if (data.settings) setSettings(data.settings);
      }
    } catch {}
  };

  const handleBlockIP = async () => {
    if (!newIP.trim()) return;
    const updated = [...blockedIPs, newIP.trim()];
    const token = localStorage.getItem('accessToken') || '';
    await fetch(`${API_URL}/admin/security`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ blockedIPs: updated, settings }),
    });
    setBlockedIPs(updated);
    setNewIP('');
    toast.success(`IP ${newIP} blocked`);
  };

  const handleUnblockIP = async (ip: string) => {
    const updated = blockedIPs.filter(i => i !== ip);
    const token = localStorage.getItem('accessToken') || '';
    await fetch(`${API_URL}/admin/security`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ blockedIPs: updated, settings }),
    });
    setBlockedIPs(updated);
    toast.success(`IP ${ip} unblocked`);
  };

  const handleSaveSettings = async () => {
    const token = localStorage.getItem('accessToken') || '';
    await fetch(`${API_URL}/admin/security`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ blockedIPs, settings }),
    });
    toast.success('Security settings saved');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-violet-400" />
            Security
          </h1>
          <p className="text-gray-400 text-sm mt-1">Rate limiting, IP blocking, dan firewall</p>
        </div>
        <button onClick={fetchSecurity} className="p-2 rounded-lg hover:bg-white/5 transition">
          <RefreshCw className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Settings */}
        <div className="p-5 rounded-xl bg-gray-900 border border-white/5 space-y-4">
          <h3 className="font-medium flex items-center gap-2"><Activity className="h-4 w-4 text-violet-400" /> Security Settings</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Rate Limit (req/min)</p>
                <p className="text-[10px] text-gray-500">Max requests per minute per IP</p>
              </div>
              <input type="number" value={settings.rateLimitPerMinute} onChange={e => setSettings(s => ({ ...s, rateLimitPerMinute: +e.target.value }))} className="w-20 px-3 py-1.5 rounded-lg bg-gray-800 border border-white/10 text-white text-sm text-center" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Max Login Attempts</p>
                <p className="text-[10px] text-gray-500">Before temporary lockout</p>
              </div>
              <input type="number" value={settings.maxLoginAttempts} onChange={e => setSettings(s => ({ ...s, maxLoginAttempts: +e.target.value }))} className="w-20 px-3 py-1.5 rounded-lg bg-gray-800 border border-white/10 text-white text-sm text-center" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Session Timeout (days)</p>
                <p className="text-[10px] text-gray-500">Auto logout after inactivity</p>
              </div>
              <input type="number" value={settings.sessionTimeout} onChange={e => setSettings(s => ({ ...s, sessionTimeout: +e.target.value }))} className="w-20 px-3 py-1.5 rounded-lg bg-gray-800 border border-white/10 text-white text-sm text-center" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Anti-Spam</p>
                <p className="text-[10px] text-gray-500">Block spam requests</p>
              </div>
              <button onClick={() => setSettings(s => ({ ...s, antiSpamEnabled: !s.antiSpamEnabled }))} className={`w-10 h-5 rounded-full transition ${settings.antiSpamEnabled ? 'bg-emerald-500' : 'bg-gray-700'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.antiSpamEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Force HTTPS</p>
                <p className="text-[10px] text-gray-500">Redirect HTTP to HTTPS</p>
              </div>
              <button onClick={() => setSettings(s => ({ ...s, forceHttps: !s.forceHttps }))} className={`w-10 h-5 rounded-full transition ${settings.forceHttps ? 'bg-emerald-500' : 'bg-gray-700'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.forceHttps ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-400">🚧 Maintenance Mode</p>
                <p className="text-[10px] text-gray-500">Disable site for users</p>
              </div>
              <button onClick={() => setSettings(s => ({ ...s, maintenanceMode: !s.maintenanceMode }))} className={`w-10 h-5 rounded-full transition ${settings.maintenanceMode ? 'bg-amber-500' : 'bg-gray-700'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.maintenanceMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          <button onClick={handleSaveSettings} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium text-sm mt-4">
            Save Settings
          </button>
        </div>

        {/* IP Blocking */}
        <div className="p-5 rounded-xl bg-gray-900 border border-white/5 space-y-4">
          <h3 className="font-medium flex items-center gap-2"><Ban className="h-4 w-4 text-red-400" /> IP Blocking</h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={newIP}
              onChange={e => setNewIP(e.target.value)}
              placeholder="Enter IP address (e.g. 192.168.1.1)"
              className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm"
              onKeyDown={e => e.key === 'Enter' && handleBlockIP()}
            />
            <button onClick={handleBlockIP} className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {blockedIPs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Tidak ada IP yang diblokir</p>
            ) : blockedIPs.map((ip, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-sm font-mono">{ip}</span>
                </div>
                <button onClick={() => handleUnblockIP(ip)} className="p-1 rounded hover:bg-white/5 transition">
                  <Trash2 className="h-3.5 w-3.5 text-gray-500 hover:text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Status */}
      <div className="p-5 rounded-xl bg-gray-900 border border-white/5">
        <h3 className="font-medium mb-4">Security Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'HTTPS', status: true, desc: 'SSL Active' },
            { label: 'Rate Limiting', status: true, desc: `${settings.rateLimitPerMinute} req/min` },
            { label: 'Anti-Spam', status: settings.antiSpamEnabled, desc: settings.antiSpamEnabled ? 'Active' : 'Disabled' },
            { label: 'Maintenance', status: !settings.maintenanceMode, desc: settings.maintenanceMode ? 'ON' : 'OFF' },
          ].map(item => (
            <div key={item.label} className="p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-2 mb-1">
                {item.status ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />}
                <span className="text-xs font-medium">{item.label}</span>
              </div>
              <p className="text-[10px] text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
