'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60"
          >
            Upgrade Your Tech Journey
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground"
          >
            You've reached your free limit. Choose a plan that fits your ambition.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <PricingCard
            title="Free"
            price="$0"
            description="Perfect for exploring the platform."
            features={[
              "3 Repository Analyses",
              "1 Resume ATS Scan",
              "Standard AI Mentor Chat",
              "Basic Skill Dashboard"
            ]}
            buttonText="Current Plan"
            disabled={true}
          />

          {/* Pro Plan */}
          <PricingCard
            title="Pro"
            price="$19"
            period="/month"
            description="For serious developers looking to grow."
            features={[
              "Unlimited Repository Analyses",
              "Unlimited Resume Scans",
              "Advanced AI Mentor (Opus & Sonnet 3.5)",
              "Personalized 30-Day Roadmaps",
              "Detailed PDF Reports",
              "Priority Support"
            ]}
            highlight={true}
            buttonText="Upgrade to Pro"
            onClick={() => alert('Payment gateway integration coming soon!')}
          />

          {/* Enterprise Plan */}
          <PricingCard
            title="Lifetime"
            price="$99"
            period="once"
            description="Best value for lifelong learners."
            features={[
              "Everything in Pro",
              "Lifetime Access",
              "Beta Access to New Features",
              "Custom Skill Tracking",
              "No Monthly Subscription"
            ]}
            buttonText="Get Lifetime Access"
            onClick={() => alert('Payment gateway integration coming soon!')}
          />
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Secure payments handled by Stripe. Cancel anytime.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  highlight?: boolean;
  buttonText: string;
  disabled?: boolean;
  onClick?: () => void;
}

function PricingCard({ 
  title, 
  price, 
  period, 
  description, 
  features, 
  highlight, 
  buttonText, 
  disabled,
  onClick 
}: PricingCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`relative p-8 rounded-3xl border transition-all ${
        highlight 
          ? 'bg-primary/5 border-primary shadow-2xl shadow-primary/20 scale-105 z-10' 
          : 'bg-card border-border hover:border-primary/50'
      }`}
    >
      {highlight && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Crown className="w-3 h-3" /> Most Popular
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-extrabold">{price}</span>
          <span className="text-muted-foreground text-sm font-medium">{period}</span>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{description}</p>
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${highlight ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-primary'}`}>
              <Check className="w-3 h-3" />
            </div>
            <span className="text-foreground/80">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full py-4 rounded-xl font-bold transition-all active:scale-95 ${
          disabled
            ? 'bg-white/5 text-muted-foreground cursor-not-allowed border border-white/10'
            : highlight
              ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/30'
              : 'bg-white text-black hover:bg-white/90'
        }`}
      >
        {buttonText}
      </button>
    </motion.div>
  );
}
