'use client';

import { useState, useEffect } from 'react';
import { Zap, RefreshCw } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.getlumora.cloud/api/v1';

export default function AdminAISystemPage() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('accessToken') || '';
      const res = await fetch(`${API_URL}/admin/ai-config`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) setConfig(await res.json());
    } catch {}
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-full overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2"><Zap className="h-5 w-5 md:h-6 md:w-6 text-violet-400 flex-shrink-0" /> AI System</h1>
          <p className="text-gray-400 text-xs md:text-sm mt-1">AI model settings, API keys, dan generation logs</p>
        </div>
        <button onClick={fetchConfig} className="p-2 rounded-lg hover:bg-white/5 transition flex-shrink-0">
          <RefreshCw className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {config ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div className="p-4 md:p-5 rounded-xl bg-gray-900 border border-white/5">
              <p className="text-xs md:text-sm font-medium text-gray-300">Primary Model</p>
              <p className="text-base md:text-lg font-bold text-violet-400 mt-1 break-all">{config.primaryModel}</p>
              <p className="text-xs text-gray-500 mt-1">~{config.primaryCost} per video</p>
            </div>
            <div className="p-4 md:p-5 rounded-xl bg-gray-900 border border-white/5">
              <p className="text-xs md:text-sm font-medium text-gray-300">Fallback Models</p>
              <p className="text-base md:text-lg font-bold text-amber-400 mt-1 break-all">{config.fallbackModels?.join(', ')}</p>
              <p className="text-xs text-gray-500 mt-1">Used when primary fails</p>
            </div>
            <div className="p-4 md:p-5 rounded-xl bg-gray-900 border border-white/5">
              <p className="text-xs md:text-sm font-medium text-gray-300">TTS Model</p>
              <p className="text-base md:text-lg font-bold text-emerald-400 mt-1 break-all">{config.ttsModel}</p>
              <p className="text-xs text-gray-500 mt-1">Bahasa Indonesia support</p>
            </div>
            <div className="p-4 md:p-5 rounded-xl bg-gray-900 border border-white/5">
              <p className="text-xs md:text-sm font-medium text-gray-300">Prompt Optimizer</p>
              <p className="text-base md:text-lg font-bold text-blue-400 mt-1 break-all">{config.promptModel}</p>
              <p className="text-xs text-gray-500 mt-1">Translate & enhance prompts</p>
            </div>
          </div>

          {/* Plan Limits */}
          <div className="p-4 md:p-5 rounded-xl bg-gray-900 border border-white/5">
            <h3 className="font-medium mb-3 md:mb-4">Plan Limits (50% Profit Margin)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              {config.plans?.map((plan: any) => (
                <div key={plan.name} className="p-3 md:p-4 rounded-lg bg-white/5">
                  <p className="text-sm font-bold text-white">{plan.name}</p>
                  <p className="text-xs text-gray-400 mt-1">Rp {plan.price.toLocaleString()}/bln</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-violet-400">{plan.videoLimit} video/bulan</p>
                    <p className="text-xs text-emerald-400">{plan.aiCreditsLimit} AI credits</p>
                    <p className="text-xs text-gray-500">Cost/video: ~Rp {plan.costPerVideo?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Info */}
          <div className="p-4 md:p-5 rounded-xl bg-gray-900 border border-white/5">
            <h3 className="font-medium mb-3 md:mb-4">System Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
              {Object.entries(config.status || {}).map(([key, value]: [string, any]) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-xs md:text-sm text-gray-300 capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className={`text-xs font-medium ${value ? 'text-emerald-400' : 'text-red-400'}`}>
                    {value ? '✅ Active' : '❌ Not Set'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">Loading AI config...</div>
      )}
    </div>
  );
}
