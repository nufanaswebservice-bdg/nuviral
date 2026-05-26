'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Check, Sparkles, Zap, Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        },
      ) => void;
      embed: (token: string, options: { embedId: string }) => void;
    };
  }
}

const plans = [
  {
    name: 'Starter',
    key: 'STARTER',
    priceIdr: 225000,
    icon: Zap,
    popular: false,
    features: [
      '21 video renders/bulan',
      '210 AI credits/bulan',
      '10GB storage',
      'Semua template',
      'Tanpa watermark',
      '2 akun sosial media',
      'Analitik dasar',
    ],
  },
  {
    name: 'Pro',
    key: 'PRO',
    priceIdr: 449000,
    icon: CreditCard,
    popular: true,
    features: [
      '42 video renders/bulan',
      '420 AI credits/bulan',
      '50GB storage',
      'Template premium',
      'Tanpa watermark',
      '10 akun sosial media',
      'Analitik lanjutan',
      'AI workflow automation',
      'Priority rendering',
      'API access',
    ],
  },
  {
    name: 'Agency',
    key: 'AGENCY',
    priceIdr: 1225000,
    icon: Building2,
    popular: false,
    features: [
      '115 video renders/bulan',
      '1150 AI credits/bulan',
      '200GB storage',
      'Semua template + custom',
      'Unlimited akun sosial media',
      'Full analytics suite',
      'White-label option',
      'Dedicated support',
      'Custom integrations',
      '20 team members',
    ],
  },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nuviral-production.up.railway.app/api/v1';
const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'Mid-client-CvuXZtiBb_TVQtGc';
const MIDTRANS_IS_PRODUCTION = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true' || true;

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  // Load Midtrans Snap.js
  useEffect(() => {
    const snapUrl = MIDTRANS_IS_PRODUCTION
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';

    const existingScript = document.querySelector(`script[src="${snapUrl}"]`);
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = snapUrl;
      script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Fetch current subscription
  useEffect(() => {
    fetchCurrentPlan();
  }, []);

  const fetchCurrentPlan = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/subscription/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentPlan(response.data);
    } catch (error) {
      console.error('Failed to fetch current plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = useCallback(async (planKey: string) => {
    if (planKey === 'FREE') return;

    setProcessingPlan(planKey);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${API_URL}/subscription/create-transaction`,
        { plan: planKey },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const { token: snapToken } = response.data;

      if (!window.snap) {
        toast.error('Payment system is loading, please try again in a moment.');
        setProcessingPlan(null);
        return;
      }

      // Open Midtrans Snap payment popup
      window.snap.pay(snapToken, {
        onSuccess: (result: any) => {
          toast.success('Payment successful! Your plan has been upgraded.');
          fetchCurrentPlan();
          setProcessingPlan(null);
        },
        onPending: (result: any) => {
          toast.info('Payment is pending. We will notify you once confirmed.');
          setProcessingPlan(null);
        },
        onError: (result: any) => {
          toast.error('Payment failed. Please try again.');
          setProcessingPlan(null);
        },
        onClose: () => {
          toast.info('Payment window closed.');
          setProcessingPlan(null);
        },
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create transaction');
      setProcessingPlan(null);
    }
  }, []);

  // Check URL params for payment status (redirect from Midtrans)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');

    if (paymentStatus === 'success') {
      toast.success('Payment successful! Your plan has been upgraded.');
      fetchCurrentPlan();
      window.history.replaceState({}, '', window.location.pathname);
    } else if (paymentStatus === 'pending') {
      toast.info('Payment is pending. We will notify you once confirmed.');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (paymentStatus === 'error') {
      toast.error('Payment failed. Please try again.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const currentPlanName = currentPlan?.plan || null;

  return (
    <div className="space-y-4 md:space-y-6 max-w-full overflow-hidden">
      <div>
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
          <span className="truncate">Subscription & Billing</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your plan and payment methods</p>
      </div>

      {/* Current Plan */}
      {loading ? (
        <div className="p-6 rounded-2xl border border-border bg-card flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading subscription...</span>
        </div>
      ) : currentPlan && currentPlanName ? (
        <div className="p-4 md:p-6 rounded-xl md:rounded-2xl border border-primary/30 bg-primary/5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Current Plan</p>
              <p className="text-xl md:text-2xl font-bold">{currentPlan.plan} Plan</p>
              {currentPlan.currentPeriodEnd && (
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                  Renews on {new Date(currentPlan.currentPeriodEnd).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
            <div className="sm:text-right">
              <p className="text-lg md:text-2xl font-bold">
                {formatRupiah(plans.find(p => p.key === currentPlanName)?.priceIdr || 0)}
                <span className="text-xs md:text-sm font-normal text-muted-foreground">/bln</span>
              </p>
            </div>
          </div>
          <div className="mt-3 md:mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4">
            <div className="p-2.5 md:p-3 rounded-lg md:rounded-xl bg-card border border-border">
              <p className="text-[11px] md:text-xs text-muted-foreground">Videos Used</p>
              <p className="text-base md:text-lg font-bold">
                {currentPlan.videoRenderUsed || 0}/{currentPlan.videoRenderLimit}
              </p>
              <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full gradient-primary"
                  style={{
                    width: `${Math.min(((currentPlan.videoRenderUsed || 0) / currentPlan.videoRenderLimit) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            <div className="p-2.5 md:p-3 rounded-lg md:rounded-xl bg-card border border-border">
              <p className="text-[11px] md:text-xs text-muted-foreground">AI Credits</p>
              <p className="text-base md:text-lg font-bold">
                {currentPlan.aiCreditsUsed || 0}/{currentPlan.aiCreditsLimit}
              </p>
              <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full gradient-primary"
                  style={{
                    width: `${Math.min(((currentPlan.aiCreditsUsed || 0) / currentPlan.aiCreditsLimit) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            <div className="p-2.5 md:p-3 rounded-lg md:rounded-xl bg-card border border-border">
              <p className="text-[11px] md:text-xs text-muted-foreground">Storage</p>
              <p className="text-base md:text-lg font-bold">
                {((currentPlan.storageUsed || 0) / (1024 * 1024 * 1024)).toFixed(1)}/
                {(Number(currentPlan.storageLimit) / (1024 * 1024 * 1024)).toFixed(0)} GB
              </p>
              <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full gradient-primary"
                  style={{
                    width: `${Math.min(((currentPlan.storageUsed || 0) / Number(currentPlan.storageLimit)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="text-2xl font-bold">Belum Berlangganan</p>
          <p className="text-sm text-muted-foreground mt-1">
            Pilih paket di bawah untuk mulai menggunakan semua fitur AI
          </p>
        </div>
      )}

      {/* Plans */}
      <div>
        <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Pilih Paket Berlangganan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 md:p-6 rounded-xl md:rounded-2xl border ${
                plan.popular ? 'border-primary bg-primary/5 relative' : 'border-border bg-card'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full gradient-primary text-white text-xs font-medium">
                  Paling Populer
                </span>
              )}
              <div className="mb-4">
                <plan.icon className="h-8 w-8 text-primary mb-2" />
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="text-2xl font-bold mt-2">
                  {plan.priceIdr === 0 ? 'Gratis' : formatRupiah(plan.priceIdr)}
                  {plan.priceIdr > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">/bln</span>
                  )}
                </p>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(plan.key)}
                disabled={currentPlanName === plan.key || processingPlan !== null}
                className={`w-full py-2.5 rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
                  plan.popular
                    ? 'gradient-primary text-white hover:opacity-90'
                    : 'border border-border hover:bg-accent'
                }`}
              >
                {processingPlan === plan.key ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : currentPlanName === plan.key ? (
                  'Current Plan'
                ) : (
                  'Pilih Paket'
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Payment Info */}
      <div className="p-3 md:p-4 rounded-xl border border-border bg-card">
        <p className="text-xs md:text-sm text-muted-foreground break-words">
          💳 Pembayaran diproses melalui <strong>Midtrans</strong> — mendukung transfer bank,
          e-wallet (GoPay, OVO, Dana, ShopeePay), kartu kredit/debit, dan virtual account.
        </p>
      </div>
    </div>
  );
}
