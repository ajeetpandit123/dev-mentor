'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Code2, 
  Rocket, 
  Target, 
  Users, 
  ArrowRight,
  CheckCircle2,
  Github,
  FileText
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 glass">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="block">
            <img src="/logo.png" alt="DevIntel" className="h-20 md:h-28 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Sign In</Link>
            <Link 
              href="/register" 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6 inline-block">
              AI-Powered Career Growth
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
              Scale Your Coding Career <br />
              <span className="gradient-text">With DevIntel</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Analyze your code, optimize your resume, and follow personalized roadmaps designed to get you hired at top tech companies.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Link 
                href="/register" 
                className="w-full md:w-auto bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 hover:translate-y-[-2px] transition-transform"
              >
                Start Free Analysis <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="https://github.com" 
                target="_blank"
                className="w-full md:w-auto bg-white/5 border border-white/10 px-8 py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
              >
                <Github className="w-5 h-5" /> Connect GitHub
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-muted-foreground">Built for developers by AI architects.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-primary/50 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">How it Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="text-4xl font-bold text-primary opacity-20">01</div>
              <h4 className="text-xl font-bold">Connect</h4>
              <p className="text-sm text-muted-foreground">Link your GitHub or upload your resume.</p>
            </div>
            <div className="space-y-4">
              <div className="text-4xl font-bold text-primary opacity-20">02</div>
              <h4 className="text-xl font-bold">Analyze</h4>
              <p className="text-sm text-muted-foreground">Our AI performs deep scans of your skills and code.</p>
            </div>
            <div className="space-y-4">
              <div className="text-4xl font-bold text-primary opacity-20">03</div>
              <h4 className="text-xl font-bold">Grow</h4>
              <p className="text-sm text-muted-foreground">Follow the roadmap and scale your career.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section Placeholder */}
      <section id="pricing" className="py-24 px-4 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Start Growing Today</h2>
          <p className="text-muted-foreground mb-12">Free to start, upgrade for unlimited AI insights.</p>
          <div className="max-w-md mx-auto p-8 rounded-2xl border border-primary/50 bg-primary/5">
            <h3 className="text-2xl font-bold mb-2">Pro Plan</h3>
            <div className="text-4xl font-bold mb-6">$19<span className="text-lg text-muted-foreground">/mo</span></div>
            <ul className="text-left space-y-4 mb-8">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Unlimited Repo Analysis</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Advanced Resume ATS Scanning</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Priority AI Mentor Access</li>
            </ul>
            <Link href="/register" className="block w-full bg-primary py-3 rounded-xl font-bold">Get Started</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 text-center text-muted-foreground text-sm">
        <p>&copy; 2026 DevIntel. Built with ❤️ for the dev community.</p>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Code2,
    title: "Repo Analysis",
    description: "Connect your GitHub repositories and get professional code reviews in seconds. Focus on performance and clean code."
  },
  {
    icon: Target,
    title: "Skill Gap Detection",
    description: "Identify exactly what's missing from your tech stack based on industry standards and your current output."
  },
  {
    icon: Rocket,
    title: "Smart Roadmaps",
    description: "AI-generated learning paths tailored to your goals. Step-by-step instructions to master any technology."
  },
  {
    icon: FileText,
    title: "Resume Optimizer",
    description: "Get your resume ATS-ready. AI analysis of keywords, impact, and formatting to land more interviews."
  },
  {
    icon: Users,
    title: "AI Chat Mentor",
    description: "A 24/7 technical mentor that understands your projects and provides specific, actionable advice."
  },
  {
    icon: CheckCircle2,
    title: "Progress Tracking",
    description: "Visualize your growth with dynamic charts and scoreboards. Watch your skills evolve in real-time."
  }
];
