'use client';

import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Code2, 
  FileText, 
  Rocket, 
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, Developer</h1>
          <p className="text-muted-foreground">Here is your growth overview for this week.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard 
            title="Code Quality" 
            value="8.4" 
            sub="Avg Score" 
            trend="+1.2%" 
            icon={Code2} 
          />
          <StatCard 
            title="Skill Progress" 
            value="64%" 
            sub="Total Completion" 
            trend="+5%" 
            icon={TrendingUp} 
          />
          <StatCard 
            title="Roadmap Tasks" 
            value="12/18" 
            sub="Completed" 
            trend="+2 this week" 
            icon={CheckCircle2} 
          />
          <StatCard 
            title="ATS Score" 
            value="82" 
            sub="Resume Quality" 
            trend="Ready" 
            icon={FileText} 
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card border border-border rounded-2xl p-6 h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <BarChart3 className="text-primary w-5 h-5" /> Skill Development
                </h3>
              </div>
              <div className="flex-1 flex items-end gap-4 px-4">
                {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      className="w-full bg-primary/20 hover:bg-primary/40 rounded-t-lg border-x border-t border-primary/30 transition-colors cursor-pointer"
                    />
                    <span className="text-[10px] text-muted-foreground font-medium uppercase">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold mb-4">Top Recommendations</h3>
                <div className="space-y-4">
                  <RecommendationItem 
                    icon={Rocket} 
                    title="Master Next.js Middleware" 
                    desc="Your last project lacked edge functions."
                  />
                  <RecommendationItem 
                    icon={AlertCircle} 
                    title="Optimize SQL Queries" 
                    desc="Performance score was low in 'e-commerce-api'."
                  />
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold mb-4">Upcoming Goals</h3>
                <div className="space-y-4">
                  <GoalItem label="Complete Docker Basics" progress={75} />
                  <GoalItem label="Refactor Resume Bullet Points" progress={30} />
                </div>
              </div>
            </div>
          </div>

          {/* Activity Sidebar */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold mb-6">Recent Activity</h3>
              <div className="space-y-6">
                <ActivityItem 
                  time="2 hours ago" 
                  title="Repo Analyzed" 
                  desc="Portfolio-V2 reached 8.7/10" 
                />
                <ActivityItem 
                  time="Yesterday" 
                  title="Resume Uploaded" 
                  desc="ATS score improved to 82" 
                />
                <ActivityItem 
                  time="2 days ago" 
                  title="New Roadmap" 
                  desc="Fullstack Engineer path started" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, sub, trend, icon: Icon }: any) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
          {trend}
        </span>
      </div>
      <h4 className="text-muted-foreground text-sm font-medium mb-1">{title}</h4>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        <span className="text-xs text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}

function RecommendationItem({ icon: Icon, title, desc }: any) {
  return (
    <div className="flex gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer group">
      <div className="w-10 h-10 rounded-lg bg-white/5 flex-shrink-0 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div>
        <h5 className="text-sm font-bold">{title}</h5>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function GoalItem({ label, progress }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-medium">
        <span>{label}</span>
        <span>{progress}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-primary"
        />
      </div>
    </div>
  );
}

function ActivityItem({ time, title, desc }: any) {
  return (
    <div className="relative pl-6 border-l border-border pb-6 last:pb-0">
      <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-primary" />
      <span className="text-[10px] text-muted-foreground font-bold uppercase">{time}</span>
      <h5 className="text-sm font-bold mt-1">{title}</h5>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}
