'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Code2, 
  FileText, 
  Rocket, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: any = {};
        
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const res = await fetch('/api/dashboard', { headers });
        const data = await res.json();
        setData(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const dashboardData = data || {
    userName: 'Developer',
    stats: { codeQuality: "8.4", skillProgress: 64, roadmapTasks: "12/18", atsScore: 82 },
    skillDevelopment: [40, 70, 45, 90, 65, 80, 55],
    recommendations: [
      { title: "Master Next.js Middleware", desc: "Your last project lacked edge functions.", icon: 'rocket' },
      { title: "Optimize SQL Queries", desc: "Performance score was low.", icon: 'alert' }
    ],
    goals: [
      { label: "Complete Docker Basics", progress: 75 },
      { label: "Refactor Resume", progress: 30 }
    ],
    recentActivity: []
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">Welcome back, {dashboardData.userName}</h1>
          <p className="text-muted-foreground">Here is your growth overview for this week.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard 
            title="Code Quality" 
            value={dashboardData.stats.codeQuality} 
            sub="Avg Score" 
            trend="+1.2%" 
            icon={Code2} 
          />
          <StatCard 
            title="Skill Progress" 
            value={`${dashboardData.stats.skillProgress}%`} 
            sub="Total Completion" 
            trend="+5%" 
            icon={TrendingUp} 
          />
          <StatCard 
            title="Roadmap Tasks" 
            value={dashboardData.stats.roadmapTasks} 
            sub="Completed" 
            trend="+2 this week" 
            icon={CheckCircle2} 
          />
          <StatCard 
            title="ATS Score" 
            value={dashboardData.stats.atsScore} 
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
                {dashboardData.skillDevelopment.map((h: number, i: number) => (
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
                  {dashboardData.recommendations.map((rec: any, i: number) => (
                    <RecommendationItem 
                      key={i}
                      icon={rec.icon === 'rocket' ? Rocket : AlertCircle} 
                      title={rec.title} 
                      desc={rec.desc}
                    />
                  ))}
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold mb-4">Upcoming Goals</h3>
                <div className="space-y-4">
                  {dashboardData.goals.map((goal: any, i: number) => (
                    <GoalItem key={i} label={goal.label} progress={goal.progress} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Sidebar */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold mb-6">Recent Activity</h3>
              <div className="space-y-6">
                {dashboardData.recentActivity.map((activity: any, i: number) => (
                  <ActivityItem 
                    key={i}
                    time={activity.time} 
                    title={activity.title} 
                    desc={activity.desc} 
                  />
                ))}
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
