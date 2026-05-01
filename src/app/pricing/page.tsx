'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, ShieldCheck, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PricingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handlePayment = async (plan: string, amount: number) => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsProcessing(plan);
    try {
      // 1. Create Order
      const res = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, plan }),
      });
      const order = await res.json();

      if (order.error) throw new Error(order.error);

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: order.amount,
        currency: order.currency,
        name: "DevMentor AI",
        description: `Upgrade to ${plan} Plan`,
        order_id: order.id,
        handler: async function (response: any) {
          // 3. Verify Payment
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              plan,
              userId: user.id
            }),
          });
          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            alert('🎉 Payment successful! Your account has been upgraded.');
            router.push('/dashboard');
            router.refresh();
          } else {
            alert('❌ Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: "#7c3aed",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('Payment Error:', error);
      alert('Failed to initiate payment: ' + error.message);
    } finally {
      setIsProcessing(null);
    }
  };

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
            Unlock unlimited AI power and accelerated career growth.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
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

          <PricingCard
            title="Pro"
            price="$19"
            period="/month"
            description="For serious developers looking to grow."
            features={[
              "Unlimited Repository Analyses",
              "Unlimited Resume Scans",
              "Advanced AI Mentor",
              "Personalized 30-Day Roadmaps",
              "Detailed PDF Reports",
              "Priority Support"
            ]}
            highlight={true}
            buttonText={isProcessing === 'Pro' ? "Processing..." : "Upgrade to Pro"}
            loading={isProcessing === 'Pro'}
            onClick={() => handlePayment('Pro', 19)}
          />

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
            buttonText={isProcessing === 'Lifetime' ? "Processing..." : "Get Lifetime Access"}
            loading={isProcessing === 'Lifetime'}
            onClick={() => handlePayment('Lifetime', 99)}
          />
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Secure payments handled by Razorpay. SSL Encrypted.
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
  loading?: boolean;
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
  loading,
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
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
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
        disabled={disabled || loading}
        className={`w-full py-4 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${
          disabled
            ? 'bg-white/5 text-muted-foreground cursor-not-allowed border border-white/10'
            : highlight
              ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/30'
              : 'bg-white text-black hover:bg-white/90'
        }`}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {buttonText}
      </button>
    </motion.div>
  );
}
