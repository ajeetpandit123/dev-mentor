'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
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
  Zap,
  Loader2,
  Sparkles,
  X,
  Code2,
  Rocket
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

/**
 * Roadmap Step Interface
 * 
 * week: The week number (1-4)
 * title: The title of the learning module
 * status: Derived status based on topic completion
 * topics: List of topics to master
 * completedTopics: List of topics the user has checked off
 * miniProject: Details of the weekly build challenge
 * resources: Curated links for study
 * icon: The Lucide icon component
 */
interface RoadmapStep {
  week: number;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
  topics: string[];
  completedTopics: string[];
  miniProject: {
    title: string;
    description: string;
    features?: string[];
    techStack?: string[];
  };
  resources?: string[];
  icon: any;
}

const ICONS = [Layout, Database, Cloud, Lock, Zap, BookOpen];

export default function RoadmapPage() {
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [summary, setSummary] = useState('');
  const [selectedProject, setSelectedProject] = useState<RoadmapStep | null>(null);
  const [showResources, setShowResources] = useState(false);

  /**
   * Status Calculation Logic
   * 
   * 1. If 0 items checked: "Not Started" (represented as 'upcoming' in UI)
   * 2. If some items checked: "In Progress" (represented as 'current' in UI)
   * 3. If all items checked: "Completed"
   */
  const calculateStatus = (completedCount: number, totalCount: number): 'completed' | 'current' | 'upcoming' => {
    if (completedCount === 0) return 'upcoming';
    if (completedCount === totalCount) return 'completed';
    return 'current';
  };

  const fetchRoadmap = async (forceRegenerate = false) => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!forceRegenerate && userId) {
      // 1. Try to fetch from DB first (Access the Real)
      try {
        const dbRes = await fetch(`/api/roadmap?userId=${userId}`);
        const dbData = await dbRes.json();
        
        if (dbData && dbData.roadmap_json) {
          const parsed = dbData.roadmap_json;
          const restoredSteps = parsed.steps.map((step: any, idx: number) => ({
            ...step,
            icon: ICONS[idx % ICONS.length],
            completedTopics: step.completedTopics || []
          }));
          setRoadmap(restoredSteps);
          setSummary(parsed.summary);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Failed to fetch roadmap from DB', e);
      }

      // 2. Fallback to localStorage
      const cached = localStorage.getItem('dev_monitor_roadmap');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const restoredSteps = parsed.steps.map((step: any, idx: number) => ({
            ...step,
            icon: ICONS[idx % ICONS.length],
            completedTopics: step.completedTopics || []
          }));
          setRoadmap(restoredSteps);
          setSummary(parsed.summary);
          setLoading(false);
          saveToCache(restoredSteps, parsed.summary);
          return;
        } catch (e) {}
      }
    }

    if (forceRegenerate) setIsRegenerating(true);
    else setLoading(true);

    try {
      const settingsRes = await fetch('/api/settings');
      const settingsData = await settingsRes.json();
      
      const skills = settingsData.settings?.tech_stack ? [settingsData.settings.tech_stack] : ['React', 'Next.js', 'Node.js'];
      const goals = settingsData.settings?.target_role ? [settingsData.settings.target_role] : ['Senior Fullstack Engineer'];
      const currentLevel = settingsData.settings?.experience_level || 'Intermediate';

      const res = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills, goals, currentLevel })
      });
      
      const data = await res.json();
      
      if (data.weeks) {
        const formattedSteps: RoadmapStep[] = data.weeks.map((week: any, idx: number) => ({
          week: week.week,
          title: week.title,
          status: 'upcoming',
          topics: week.topics,
          completedTopics: [],
          miniProject: week.miniProject || { 
            title: 'Mini Project', 
            description: 'Build something cool using these skills.',
            features: ['Core functionality', 'Responsive UI', 'Error handling'],
            techStack: skills
          },
          resources: week.resources || ['Official Documentation', 'Best Practices Guide', 'Tutorial Video'],
          icon: ICONS[idx % ICONS.length]
        }));
        
        setRoadmap(formattedSteps);
        setSummary(data.summary || '');
        saveToCache(formattedSteps, data.summary || '');
      }
    } catch (error) {
      console.error('Failed to generate roadmap:', error);
    } finally {
      setLoading(false);
      setIsRegenerating(false);
    }
  };

  /**
   * Persistence & Dashboard Sync
   * 
   * Saves progress to both LocalStorage (for instant UI) and Database (for Real Persistence).
   */
  const saveToCache = async (steps: RoadmapStep[], sum: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // Calculate progress for history
    const totalTopicsCount = steps.reduce((acc, step) => acc + step.topics.length, 0);
    const completedCount = steps.reduce((acc, step) => acc + step.completedTopics.length, 0);
    const currentProgress = totalTopicsCount > 0 ? Math.round((completedCount / totalTopicsCount) * 100) : 0;

    const cached = localStorage.getItem('dev_monitor_roadmap');
    let history = [0, 0, 0, 0, 0, 0, 0]; 
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        history = parsed.history || [0, 0, 0, 0, 0, 0, 0];
      } catch (e) {}
    }

    const dayIndex = (new Date().getDay() + 6) % 7; 
    history[dayIndex] = currentProgress;

    const roadmapData = {
      steps,
      summary: sum,
      history,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem('dev_monitor_roadmap', JSON.stringify(roadmapData));

    // Save to Real Database
    if (userId) {
      try {
        await fetch('/api/roadmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, roadmapJson: roadmapData })
        });
      } catch (e) {
        console.error('Failed to sync with DB', e);
      }
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  /**
   * Checklist Handling Logic
   * 
   * Toggles a topic in the completedTopics array and automatically
   * recalculates the module status.
   */
  const handleTopicToggle = (weekIndex: number, topic: string) => {
    const newRoadmap = [...roadmap];
    const step = newRoadmap[weekIndex];
    
    if (step.completedTopics.includes(topic)) {
      step.completedTopics = step.completedTopics.filter(t => t !== topic);
    } else {
      step.completedTopics = [...step.completedTopics, topic];
    }

    // Update status based on completion
    step.status = calculateStatus(step.completedTopics.length, step.topics.length);
    
    setRoadmap(newRoadmap);
    saveToCache(newRoadmap, summary);
  };

  const handleStartImplementation = (step: RoadmapStep) => {
    const prompt = `I'm starting the Week ${step.week} project: ${step.miniProject.title}. The goal is to ${step.miniProject.description}. Can you guide me through the first steps and help me set up the architecture?`;
    router.push(`/chat?prompt=${encodeURIComponent(prompt)}`);
  };

  // Progress Bar Calculations (Global)
  const totalTopics = roadmap.reduce((acc, step) => acc + step.topics.length, 0);
  const completedTopicsCount = roadmap.reduce((acc, step) => acc + step.completedTopics.length, 0);
  const globalProgress = totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <Sparkles className="w-6 h-6 text-primary absolute -top-2 -right-2 animate-pulse" />
          </div>
          <p className="text-muted-foreground font-bold animate-pulse">Generating your personalized AI roadmap...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        {/* Global Progress Header */}
        <div className="bg-card border border-border p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Your Learning Roadmap
              </h1>
              <p className="text-muted-foreground font-medium max-w-xl">
                {summary || "Your personalized path to mastering new technologies."}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-primary">{globalProgress}%</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">Overall Progress</span>
              </div>
              <button 
                onClick={() => fetchRoadmap(true)}
                disabled={isRegenerating}
                className="bg-white/5 text-foreground px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-white/10 transition-all border border-white/10 disabled:opacity-50"
              >
                {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-primary" />}
                {isRegenerating ? 'Working...' : 'Regenerate Path'}
              </button>
            </div>
          </div>
          
          {/* Skill Development Bar (Global) */}
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${globalProgress}%` }}
              className="h-full bg-gradient-to-r from-primary to-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            />
          </div>
        </div>

        <div className="space-y-8 relative pt-4">
          {/* Vertical Line */}
          <div className="absolute left-8 top-4 bottom-4 w-px bg-gradient-to-b from-primary/50 via-border to-transparent" />

          <AnimatePresence mode="popLayout">
            {roadmap.map((step, idx) => {
              const stepProgress = Math.round((step.completedTopics.length / step.topics.length) * 100);
              
              return (
                <motion.div
                  key={step.week}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`relative pl-20 pb-12 last:pb-0 ${step.status === 'upcoming' ? 'opacity-80' : ''}`}
                >
                  {/* Indicator */}
                  <div className={`absolute left-4 top-2 w-8 h-8 rounded-full border-4 border-background flex items-center justify-center z-10 transition-all ${
                    step.status === 'completed' ? 'bg-green-500 text-white' : 
                    step.status === 'current' ? 'bg-primary text-white shadow-[0_0_20px_rgba(168,85,247,0.6)] scale-110' : 
                    'bg-muted text-muted-foreground'
                  }`}>
                    {step.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  </div>

                  <div className={`bg-card border rounded-[32px] p-8 transition-all hover:shadow-2xl hover:shadow-primary/5 ${
                    step.status === 'current' ? 'border-primary ring-1 ring-primary/20 shadow-xl shadow-primary/5' : 'border-border'
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform hover:rotate-6 ${
                          step.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'
                        }`}>
                          <step.icon className="w-7 h-7" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Week {step.week}</span>
                          <h3 className="text-2xl font-bold tracking-tight">{step.title}</h3>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border ${
                          step.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                          step.status === 'current' ? 'bg-primary/10 text-primary border-primary/20 animate-pulse' :
                          'bg-white/5 text-muted-foreground border-white/10'
                        }`}>
                          {step.status === 'completed' ? 'Completed' :
                           step.status === 'current' ? 'In Progress' :
                           'Not Started Yet'}
                        </span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                      {/* Checklist Section */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
                            <BookOpen className="w-4 h-4" /> Topics to Master
                          </h4>
                          <span className="text-[10px] font-bold text-primary">{step.completedTopics.length}/{step.topics.length} Done</span>
                        </div>
                        
                        <div className="space-y-2">
                          {step.topics.map((topic, i) => {
                            const isCompleted = step.completedTopics.includes(topic);
                            return (
                              <button 
                                key={i} 
                                onClick={() => handleTopicToggle(idx, topic)}
                                className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left group ${
                                  isCompleted ? 'bg-green-500/5 border-green-500/20 text-green-500/80' : 'bg-white/5 border-white/5 hover:border-primary/30 text-foreground/70'
                                }`}
                              >
                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                                  isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-white/20 group-hover:border-primary/50'
                                }`}>
                                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                                </div>
                                <span className={`text-sm font-bold ${isCompleted ? 'line-through opacity-60' : ''}`}>{topic}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Local Progress Bar */}
                        <div className="pt-2">
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${stepProgress}%` }}
                              className={`h-full transition-colors ${step.status === 'completed' ? 'bg-green-500' : 'bg-primary'}`}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Project Preview */}
                      <div className="bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 rounded-[40px] p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Zap className="w-24 h-24 text-primary" />
                        </div>
                        <h4 className="text-sm font-black mb-4 text-primary uppercase tracking-widest">Week Challenge</h4>
                        <h5 className="text-xl font-bold mb-3 tracking-tight">{step.miniProject.title}</h5>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-8 line-clamp-3">
                          {step.miniProject.description}
                        </p>
                        <div className="flex flex-col gap-3">
                          <button 
                            onClick={() => { setSelectedProject(step); setShowResources(false); }}
                            className="w-full bg-white/5 hover:bg-white/10 text-foreground py-4 rounded-2xl text-sm font-bold border border-white/10 transition-all flex items-center justify-center gap-2 group/btn"
                          >
                            Project Details
                            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                          <button 
                            onClick={() => handleStartImplementation(step)}
                            className="w-full bg-primary text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                          >
                            Start Building
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Project Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="fixed inset-0 bg-background/90 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-card border border-border shadow-2xl z-[101] rounded-[48px] overflow-hidden"
            >
              <div className="p-12 space-y-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[32px] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                      <selectedProject.icon className="w-10 h-10" />
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-2 block">Week {selectedProject.week} Build</span>
                      <h2 className="text-4xl font-black tracking-tight">{selectedProject.miniProject.title}</h2>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedProject(null)}
                    className="p-4 hover:bg-white/5 rounded-full transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-8 max-h-[50vh] overflow-y-auto pr-6 custom-scrollbar">
                  {!showResources ? (
                    <>
                      <div className="space-y-4">
                        <h4 className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <Rocket className="w-4 h-4" /> The Mission
                        </h4>
                        <p className="text-xl text-foreground/80 leading-relaxed font-medium">
                          {selectedProject.miniProject.description}
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-5">
                          <h4 className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-yellow-500" /> Must-Have Features
                          </h4>
                          <div className="space-y-3">
                            {selectedProject.miniProject.features?.map((feature, i) => (
                              <div key={i} className="flex items-start gap-3 text-sm font-bold bg-white/5 p-4 rounded-2xl border border-white/5">
                                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-1" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-5">
                          <h4 className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <Code2 className="w-4 h-4 text-primary" /> Recommended Stack
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedProject.miniProject.techStack?.map((tech, i) => (
                              <span key={i} className="px-5 py-2.5 rounded-2xl bg-primary/10 text-primary text-xs font-black border border-primary/20">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <h4 className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Deep Dive Resources
                      </h4>
                      <div className="grid gap-3">
                        {selectedProject.resources?.map((resource, i) => (
                          <a 
                            key={i} 
                            href={`https://google.com/search?q=${encodeURIComponent(resource)}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-5 bg-white/5 hover:bg-primary/10 rounded-2xl border border-white/5 hover:border-primary/30 transition-all group"
                          >
                            <span className="text-sm font-bold">{resource}</span>
                            <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-10 border-t border-border flex gap-6">
                  <button 
                    onClick={() => handleStartImplementation(selectedProject)}
                    className="flex-1 bg-primary text-white py-5 rounded-[24px] font-black shadow-[0_15px_35px_rgba(168,85,247,0.3)] hover:opacity-90 active:scale-95 transition-all"
                  >
                    Start Building Now
                  </button>
                  <button 
                    onClick={() => setShowResources(!showResources)}
                    className={`px-10 py-5 rounded-[24px] font-black transition-all ${
                      showResources ? 'bg-primary/20 text-primary border border-primary/20 shadow-inner' : 'bg-white/5 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {showResources ? 'Project Overview' : 'View Resources'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
