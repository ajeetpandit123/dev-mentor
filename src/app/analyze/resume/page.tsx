'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Target,
  FileSearch,
  Briefcase
} from 'lucide-react';

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        body: formData,
      });
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Failed to parse server response');
      }
      
      if (!response.ok || data.error) {
        throw new Error(data.error || `Server responded with ${response.status}`);
      }
      
      setResult(data);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to analyze resume');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Resume AI Analyzer</h1>
          <p className="text-muted-foreground">Upload your resume to get ATS optimization tips and skill gap analysis.</p>
        </div>

        {/* Upload Box */}
        <div 
          className={`bg-card border-2 border-dashed rounded-2xl p-12 transition-colors flex flex-col items-center justify-center space-y-4 ${
            file ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/30'
          }`}
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
            <Upload className="w-8 h-8" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{file ? file.name : 'Drop your resume here'}</p>
            <p className="text-sm text-muted-foreground">Supports PDF format (Max 5MB)</p>
          </div>
          <input 
            type="file" 
            accept=".pdf" 
            onChange={handleUpload}
            className="hidden" 
            id="resume-upload" 
          />
          <div className="flex gap-4">
            <label 
              htmlFor="resume-upload"
              className="bg-white/5 border border-white/10 px-6 py-2 rounded-lg font-bold cursor-pointer hover:bg-white/10 transition-colors"
            >
              Choose File
            </label>
            {file && !isAnalyzing && (
              <button 
                onClick={handleAnalyze}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold hover:opacity-90"
              >
                Start Analysis
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isAnalyzing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-12 space-y-4"
            >
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-muted-foreground animate-pulse font-medium">Extracting text and scanning keywords...</p>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Stats & Keywords */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-card border border-border p-8 rounded-2xl text-center">
                  <p className="text-sm text-muted-foreground font-bold uppercase mb-2">ATS Compatibility</p>
                  <div className="relative inline-block">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle 
                        cx="64" cy="64" r="60" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="transparent" 
                        className="text-white/5" 
                      />
                      <circle 
                        cx="64" cy="64" r="60" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={377}
                        strokeDashoffset={377 * (1 - (result?.atsScore ?? 0) / 100)}
                        className="text-primary" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-3xl">
                      {result?.atsScore ?? 0}
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground font-medium">
                    Excellent! Your resume is highly readable by automated systems.
                  </p>
                </div>

                <div className="bg-card border border-border p-6 rounded-2xl">
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-500" /> Keywords Found
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(result?.keywordsFound) ? result.keywordsFound : []).map((kw: string) => (
                      <span key={kw} className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-md border border-green-500/20">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-border p-6 rounded-2xl">
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" /> Missing Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(result?.missingKeywords) ? result.missingKeywords : []).map((kw: string) => (
                      <span key={kw} className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-bold rounded-md border border-yellow-500/20">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Feedback & Suggestions */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card border border-border rounded-2xl p-8 h-full">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <FileSearch className="text-primary w-6 h-6" /> Strategic Improvements
                  </h3>
                  <div className="space-y-6">
                    {(Array.isArray(result?.suggestions) ? result.suggestions : []).map((suggestion: string, i: number) => (
                      <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-sm leading-relaxed">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm font-medium">Industry Target: {result?.industryTarget ?? 'Senior Software Engineer'}</span>
                    </div>
                    <button className="text-primary text-sm font-bold hover:underline underline-offset-4">
                      Download PDF Report
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
