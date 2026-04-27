'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Github, 
  Search, 
  Loader2, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Code2,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function RepoAnalysisPage() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!url) return;
    setIsAnalyzing(true);
    setResult(null);

    // Mock API call for now
    try {
      const response = await fetch('/api/analyze-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: url }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        alert(data.error);
        return;
      }
      
      setResult(data);
    } catch (err) {
      console.error(err);
      alert('Failed to analyze repository');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">GitHub Repository Analysis</h1>
          <p className="text-muted-foreground">Enter a public repository URL to get an AI-powered code review.</p>
        </div>

        {/* Search Bar */}
        <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Github className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              placeholder="https://github.com/username/repo"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-4 pl-12 pr-32 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
            />
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !url}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold disabled:opacity-50 flex items-center gap-2"
            >
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Analyze
            </button>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> We only read public data and code structure.
          </p>
        </div>

        <AnimatePresence>
          {isAnalyzing && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-4"
            >
              <div className="relative">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              </div>
              <p className="font-medium animate-pulse">Our AI is reading your code...</p>
              <div className="flex gap-2">
                {['Security', 'Performance', 'Quality', 'Best Practices'].map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded-full text-muted-foreground">
                    Analyzing {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-3 gap-6">
                <ResultCard 
                  label="Overall Score" 
                  value={`${result?.score ?? 0}/10`} 
                  icon={Sparkles}
                  color="text-primary"
                />
                <ResultCard 
                  label="Best Practices" 
                  value={`${result?.bestPractices ?? 0}%`} 
                  icon={CheckCircle2}
                  color="text-green-500"
                />
                <ResultCard 
                  label="Security Level" 
                  value={result?.security ?? 'Unknown'} 
                  icon={ShieldCheck}
                  color="text-blue-500"
                />
              </div>

              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-border bg-white/[0.02]">
                  <h3 className="font-bold flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-primary" /> Key AI Feedback
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {(Array.isArray(result?.feedback) ? result.feedback : []).map((item: string, i: number) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-colors">
                      <div className="mt-1">
                        <Zap className="w-4 h-4 text-yellow-500" />
                      </div>
                      <p className="text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <button className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                  Generate Full Learning Roadmap <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

interface ResultCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}

function ResultCard({ label, value, icon: Icon, color }: ResultCardProps) {
  return (
    <div className="bg-card border border-border p-6 rounded-2xl flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
