'use client';

import { motion } from 'framer-motion';
import { CreditCard, Check, Sparkles, Zap, Building2 } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: 0,
    icon: Sparkles,
    popular: false,
    features: [
      '5 video renders/month',
      '50 AI credits/month',
      '1GB storage',
      'Basic templates',
      'Watermark on videos',
    ],
  },
  {
    name: 'Starter',
    price: 29,
    icon: Zap,
    popular: false,
    features: [
      '50 video renders/month',
      '500 AI credits/month',
      '10GB storage',
      'All templates',
      'No watermark',
      '2 social accounts',
      'Basic analytics',
    ],
  },
  {
    name: 'Pro',
    price: 79,
    icon: CreditCard,
    popular: true,
    features: [
      '200 video renders/month',
      '2000 AI credits/month',
      '50GB storage',
      'Premium templates',
      'No watermark',
      '10 social accounts',
      'Advanced analytics',
      'AI workflow automation',
      'Priority rendering',
      'API access',
    ],
  },
  {
    name: 'Agency',
    price: 199,
    icon: Building2,
    popular: false,
    features: [
      '1000 video renders/month',
      '10000 AI credits/month',
      '200GB storage',
      'All templates + custom',
      'Unlimited social accounts',
      'Full analytics suite',
      'White-label option',
      'Dedicated support',
      'Custom integrations',
      '20 team members',
    ],
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          Subscription & Billing
        </h1>
        <p className="text-muted-foreground mt-1">Manage your plan and payment methods</p>
      </div>

      {/* Current Plan */}
      <div className="p-6 rounded-2xl border border-primary/30 bg-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Plan</p>
            <p className="text-2xl font-bold">Pro Plan</p>
            <p className="text-sm text-muted-foreground mt-1">Renews on April 15, 2024</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">$79<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="p-3 rounded-xl bg-card border border-border">
            <p className="text-xs text-muted-foreground">Videos Used</p>
            <p className="text-lg font-bold">45/200</p>
            <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-[22%] rounded-full gradient-primary" />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border">
            <p className="text-xs text-muted-foreground">AI Credits</p>
            <p className="text-lg font-bold">823/2000</p>
            <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-[41%] rounded-full gradient-primary" />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border">
            <p className="text-xs text-muted-foreground">Storage</p>
            <p className="text-lg font-bold">12.4/50 GB</p>
            <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-[25%] rounded-full gradient-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-2xl border ${
                plan.popular ? 'border-primary bg-primary/5 relative' : 'border-border bg-card'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full gradient-primary text-white text-xs font-medium">
                  Most Popular
                </span>
              )}
              <div className="mb-4">
                <plan.icon className="h-8 w-8 text-primary mb-2" />
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="text-3xl font-bold mt-2">
                  ${plan.price}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
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
                className={`w-full py-2.5 rounded-xl font-medium transition ${
                  plan.popular
                    ? 'gradient-primary text-white hover:opacity-90'
                    : 'border border-border hover:bg-accent'
                }`}
              >
                {plan.name === 'Pro' ? 'Current Plan' : 'Upgrade'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
