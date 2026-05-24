'use client';
import { Zap } from 'lucide-react';

export default function AdminAISystemPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Zap className="h-6 w-6 text-violet-400" /> AI System</h1>
      <p className="text-gray-400 text-sm">AI model settings, API keys, dan generation logs</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-gray-900 border border-white/5">
          <p className="text-sm font-medium text-gray-300">Primary Model</p>
          <p className="text-lg font-bold text-violet-400 mt-1">Wan 2.1 (1.3B)</p>
          <p className="text-xs text-gray-500 mt-1">~$0.10-0.20 per video</p>
        </div>
        <div className="p-5 rounded-xl bg-gray-900 border border-white/5">
          <p className="text-sm font-medium text-gray-300">Fallback Model</p>
          <p className="text-lg font-bold text-amber-400 mt-1">Minimax Video-01</p>
          <p className="text-xs text-gray-500 mt-1">~$0.50 per video</p>
        </div>
        <div className="p-5 rounded-xl bg-gray-900 border border-white/5">
          <p className="text-sm font-medium text-gray-300">TTS Model</p>
          <p className="text-lg font-bold text-emerald-400 mt-1">OpenAI TTS-1</p>
          <p className="text-xs text-gray-500 mt-1">Bahasa Indonesia support</p>
        </div>
        <div className="p-5 rounded-xl bg-gray-900 border border-white/5">
          <p className="text-sm font-medium text-gray-300">Translation</p>
          <p className="text-lg font-bold text-blue-400 mt-1">GPT-4o-mini</p>
          <p className="text-xs text-gray-500 mt-1">Prompt translation ID → EN</p>
        </div>
      </div>
    </div>
  );
}
