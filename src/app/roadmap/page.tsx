'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  Map, 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  BookOpen, 
  Layout, 
  Database, 
  Cloud,
  Lock,
  Zap
} from 'lucide-react';

const roadmapData = [
  {
    week: 1,
    title: "Advanced Next.js Mastery",
    status: "completed",
    topics: ["Server Actions", "PPR (Partial Prerendering)", "Interception Routes"],
    icon: Layout
  },
  {
    week: 2,
    title: "Distributed Systems & Caching",
    status: "current",
    topics: ["Redis Fundamentals", "Consistency Models", "CDN Optimization"],
    icon: Database
  },
  {
    week: 3,
    title: "Cloud Infrastructure",
    status: "upcoming",
    topics: ["Terraform Basics", "Docker Multi-stage Builds", "K8s Intro"],
    icon: Cloud
  },
  {
    week: 4,
    title: "Security & Performance",
    status: "upcoming",
    topics: ["JWT Best Practices", "RBAC Implementation", "Lighthouse Lab Data"],
    icon: Lock
  }
];

export default function RoadmapPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Learning Roadmap</h1>
            <p className="text-muted-foreground">Personalized path to becoming a Senior Full-Stack Architect.</p>
          </div>
          <button className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:opacity-90">
            <Zap className="w-4 h-4" /> Regenerate AI Roadmap
          </button>
        </div>

        <div className="space-y-6 relative">
          {/* Vertical Line */}
          <div className="absolute left-8 top-4 bottom-4 w-px bg-border" />

          {roadmapData.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative pl-20 pb-8 last:pb-0 ${step.status === 'upcoming' ? 'opacity-60' : ''}`}
            >
              {/* Indicator */}
              <div className={`absolute left-4 top-2 w-8 h-8 rounded-full border-4 border-background flex items-center justify-center z-10 ${
                step.status === 'completed' ? 'bg-green-500 text-white' : 
                step.status === 'current' ? 'bg-primary text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 
                'bg-muted text-muted-foreground'
              }`}>
                {step.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              </div>

              <div className={`bg-card border rounded-2xl p-6 transition-all ${
                step.status === 'current' ? 'border-primary ring-1 ring-primary/20' : 'border-border'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      step.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'
                    }`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Week {step.week}</span>
                      <h3 className="text-lg font-bold">{step.title}</h3>
                    </div>
                  </div>
                  {step.status === 'current' && (
                    <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                      In Progress
                    </span>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" /> Topics to Master
                    </h4>
                    <div className="space-y-2">
                      {step.topics.map((topic, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1 h-1 rounded-full bg-border" />
                          {topic}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <h4 className="text-sm font-bold mb-2">Mini Project</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                      Build a real-time analytics dashboard using {step.topics[0]}.
                    </p>
                    <button className="text-xs font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                      View Project Details <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
