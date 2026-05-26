'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, HardDrive, Video, Image, Cloud, CheckCircle, AlertCircle, RefreshCw, Trash2, ExternalLink } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nuviral-production.up.railway.app/api/v1';

interface StorageInfo {
  provider: string;
  bucket: string;
  publicUrl: string;
  configured: boolean;
  totalLimit: number;
  totalUsed: number;
  totalVideoSize: number;
  totalThumbnailSize: number;
  totalFiles: number;
  totalVideos: number;
  files: { key: string; name: string; type: string; size: number; url: string; uploadedAt: string }[];
  freeTier: { storage: string; classAOps: string; classBOps: string; egress: string };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(d: string): string {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminStoragePage() {
  const [storage, setStorage] = useState<StorageInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStorage();
  }, []);

  const fetchStorage = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken') || '';
      const res = await fetch(`${API_URL}/admin/storage`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        setStorage(await res.json());
      }
    } catch {}
    finally { setLoading(false); }
  };

  const usagePercent = storage ? Math.min((storage.totalUsed / storage.totalLimit) * 100, 100) : 0;

  return (
    <div className="space-y-4 md:space-y-6 max-w-full overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Database className="h-5 w-5 md:h-6 md:w-6 text-violet-400 flex-shrink-0" />
            <span className="truncate">Storage Management</span>
          </h1>
          <p className="text-gray-400 text-xs md:text-sm mt-1">Monitor dan kelola penyimpanan Cloudflare R2</p>
        </div>
        <button onClick={fetchStorage} className="p-2 rounded-lg hover:bg-white/5 transition flex-shrink-0">
          <RefreshCw className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading storage info...</div>
      ) : !storage ? (
        <div className="p-8 rounded-2xl border border-red-500/20 bg-red-500/5 text-center">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400">Gagal memuat info storage</p>
        </div>
      ) : (
        <>
          {/* Connection Status */}
          <div className="p-5 rounded-xl bg-gray-900 border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cloud className="h-6 w-6 text-orange-400" />
                <div>
                  <p className="font-medium">{storage.provider}</p>
                  <p className="text-xs text-gray-500">Bucket: {storage.bucket}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {storage.configured ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                    <CheckCircle className="h-3 w-3" /> Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-lg">
                    <AlertCircle className="h-3 w-3" /> Not Configured
                  </span>
                )}
              </div>
            </div>
            {storage.publicUrl && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-gray-500">Public URL:</span>
                <a href={storage.publicUrl} target="_blank" className="text-xs text-violet-400 hover:underline flex items-center gap-1">
                  {storage.publicUrl} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>

          {/* Usage Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
            <div className="lg:col-span-2 p-5 rounded-xl bg-gray-900 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Storage Usage</h3>
                <span className="text-sm text-gray-400">{formatBytes(storage.totalUsed)} / {formatBytes(storage.totalLimit)}</span>
              </div>
              <div className="h-4 rounded-full bg-gray-800 overflow-hidden mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${usagePercent}%` }}
                  transition={{ duration: 1 }}
                  className={`h-full rounded-full ${usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-amber-500' : 'bg-gradient-to-r from-violet-500 to-purple-500'}`}
                />
              </div>
              <p className="text-xs text-gray-500">{usagePercent.toFixed(1)}% used of free tier</p>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="p-3 rounded-lg bg-white/5">
                  <Video className="h-4 w-4 text-violet-400 mb-1" />
                  <p className="text-lg font-bold">{formatBytes(storage.totalVideoSize)}</p>
                  <p className="text-[10px] text-gray-500">Videos ({storage.totalVideos})</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <Image className="h-4 w-4 text-pink-400 mb-1" />
                  <p className="text-lg font-bold">{formatBytes(storage.totalThumbnailSize)}</p>
                  <p className="text-[10px] text-gray-500">Thumbnails</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <HardDrive className="h-4 w-4 text-emerald-400 mb-1" />
                  <p className="text-lg font-bold">{storage.totalFiles}</p>
                  <p className="text-[10px] text-gray-500">Total Files</p>
                </div>
              </div>
            </div>

            {/* Free Tier Info */}
            <div className="p-5 rounded-xl bg-gray-900 border border-white/5">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Cloud className="h-4 w-4 text-orange-400" />
                R2 Free Tier
              </h3>
              <div className="space-y-3">
                {Object.entries(storage.freeTier).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-xs font-medium text-gray-300">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[10px] text-emerald-400">✅ No egress fees — download gratis tanpa batas</p>
              </div>
            </div>
          </div>

          {/* Files List */}
          <div className="p-5 rounded-xl bg-gray-900 border border-white/5">
            <h3 className="font-medium mb-4">Files ({storage.files.length})</h3>
            {storage.files.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">Belum ada file di storage</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {storage.files.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${file.type === 'video' ? 'bg-violet-500/20' : 'bg-pink-500/20'}`}>
                      {file.type === 'video' ? <Video className="h-4 w-4 text-violet-400" /> : <Image className="h-4 w-4 text-pink-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{file.name}</p>
                      <p className="text-[10px] text-gray-500">{formatBytes(file.size)} • {formatDate(file.uploadedAt)}</p>
                    </div>
                    {file.url && (
                      <a href={file.url} target="_blank" className="p-1.5 rounded-lg hover:bg-white/5 transition">
                        <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
