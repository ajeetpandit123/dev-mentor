'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Target, 
  Cpu, 
  Bell, 
  Shield, 
  Palette, 
  Code2, 
  Search,
  Loader2,
  Save,
  Trash2,
  AlertTriangle,
  ChevronRight,
  Zap
} from 'lucide-react';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'analysis', label: 'Analysis', icon: Code2 },
  { id: 'career', label: 'Career', icon: Target },
  { id: 'resume', label: 'Resume', icon: Search },
  { id: 'ai', label: 'AI Mentor', icon: Cpu },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'ui', label: 'UI/UX', icon: Palette }
];

export default function AdvancedSettingsPage() {
  const [activeTab, setActiveTab] = React.useState('profile');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [toast, setToast] = React.useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  /**
   * Main Settings State
   * 
   * This object manages all user preferences across three main areas:
   * 1. Profile: Public-facing info (name, email).
   * 2. Career Settings: Technical background (role, stack, experience).
   * 3. AI Preferences: How the mentor should respond (tone, depth).
   */
  const [data, setData] = React.useState<any>({
    profile: { full_name: '', email: '' },
    settings: {
      role: 'fullstack',
      experience_level: 'beginner',
      review_depth: 'standard',
      focus_areas: ['clean code', 'performance'],
      tech_stack: 'MERN',
      target_role: 'SDE',
      company_type: 'startup',
      learning_pace: 'balanced',
      ats_strict: true,
      keywords: [],
      ai_response_style: 'mentor-style',
      explanation_level: 'beginner-friendly',
      notifications: { analysis: true, weekly: true, roadmap: true },
      save_github: true,
      save_resume: true,
      theme: 'dark',
      animations_enabled: true
    }
  });

  // Apply Theme Instantly
  React.useEffect(() => {
    if (data?.settings?.theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [data?.settings?.theme]);

  React.useEffect(() => {
    /**
     * Settings Loader
     * 
     * 1. Fetches the current session to ensure authorization.
     * 2. Calls the /api/settings endpoint.
     * 3. Merges existing default state with user-specific data from the DB.
     */
    async function loadSettings() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: any = session ? { 'Authorization': `Bearer ${session.access_token}` } : {};
        
        const res = await fetch('/api/settings', { headers });
        const result = await res.json();
        
        if (result.settings) {
          setData({
            profile: result.profile || data.profile,
            settings: { ...data.settings, ...result.settings }
          });
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load settings:', err);
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  /**
   * Save Handler
   * 
   * Updates the user's data in a multi-table transaction:
   * 1. Updates 'profiles' (Name/Email).
   * 2. Updates 'user_settings' (All AI and Career preferences).
   * 3. Provides visual feedback via a toast notification.
   */
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: any = { 
        'Content-Type': 'application/json',
        'Authorization': session ? `Bearer ${session.access_token}` : ''
      };

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save');
      
      setToast({ message: 'Settings saved successfully!', type: 'success' });
    } catch (err: any) {
      setToast({ message: 'Error saving: ' + err.message, type: 'error' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const updateSettings = (updates: any) => {
    setData((prev: any) => ({
      ...prev,
      settings: { ...prev.settings, ...updates }
    }));
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 20, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              className={`fixed top-4 left-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-3 ${
                toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
              }`}
            >
              <Zap className={`w-4 h-4 ${toast.type === 'success' ? 'text-green-500' : 'text-red-500'}`} />
              <span className="text-sm font-bold">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Settings</h1>
          <p className="text-muted-foreground">Configure your AI mentor and platform preferences.</p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
          {/* Vertical Navigation */}
          <div className="bg-card border border-border rounded-3xl p-3 space-y-1 sticky top-24">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                    : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : ''}`} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Settings Content */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-card border border-border rounded-[32px] overflow-visible"
              >
                {/* Profile Section */}
                {activeTab === 'profile' && (
                  <div className="p-8 space-y-8">
                    <SectionTitle title="Profile Information" subtitle="Manage your public identity." />
                    <div className="grid gap-6">
                      <InputGroup label="Full Name">
                        <input 
                          type="text" 
                          value={data.profile.full_name} 
                          onChange={(e) => setData({...data, profile: {...data.profile, full_name: e.target.value}})}
                          className="settings-input" 
                        />
                      </InputGroup>
                      <InputGroup label="Email Address">
                        <input type="email" value={data.profile.email} readOnly className="settings-input opacity-50 cursor-not-allowed" />
                      </InputGroup>
                      <div className="grid grid-cols-2 gap-4">
                        <CustomSelect 
                          label="Your Role" 
                          value={data.settings.role} 
                          options={[
                            { value: 'student', label: 'Student' },
                            { value: 'frontend', label: 'Frontend Developer' },
                            { value: 'backend', label: 'Backend Developer' },
                            { value: 'fullstack', label: 'Fullstack Developer' }
                          ]}
                          onChange={(v: string) => updateSettings({role: v})} 
                        />
                        <CustomSelect 
                          label="Experience" 
                          value={data.settings.experience_level} 
                          options={[
                            { value: 'beginner', label: 'Beginner' },
                            { value: 'intermediate', label: 'Intermediate' },
                            { value: 'advanced', label: 'Advanced' }
                          ]}
                          onChange={(v: string) => updateSettings({experience_level: v})} 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Analysis Preferences */}
                {activeTab === 'analysis' && (
                  <div className="p-8 space-y-8">
                    <SectionTitle title="Analysis Preferences" subtitle="Control how the AI reviews your code." />
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-sm font-bold">Code Review Depth</label>
                        <div className="grid grid-cols-3 gap-3">
                          {['basic', 'standard', 'deep'].map(depth => (
                            <button
                              key={depth}
                              onClick={() => updateSettings({review_depth: depth})}
                              className={`py-3 rounded-2xl text-xs font-bold border transition-all ${
                                data.settings.review_depth === depth ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'
                              }`}
                            >
                              {depth.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                      <InputGroup label="Focus Areas">
                        <div className="flex flex-wrap gap-2">
                          {['performance', 'security', 'clean code', 'system design'].map(area => (
                            <button
                              key={area}
                              onClick={() => {
                                const areas = data.settings.focus_areas.includes(area)
                                  ? data.settings.focus_areas.filter((a: string) => a !== area)
                                  : [...data.settings.focus_areas, area];
                                updateSettings({focus_areas: areas});
                              }}
                              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                                data.settings.focus_areas.includes(area) ? 'bg-primary text-white' : 'bg-accent/50 text-muted-foreground'
                              }`}
                            >
                              {area}
                            </button>
                          ))}
                        </div>
                      </InputGroup>
                      <InputGroup label="Preferred Tech Stack">
                        <input 
                          type="text" 
                          value={data.settings.tech_stack} 
                          onChange={(e) => updateSettings({tech_stack: e.target.value})}
                          placeholder="e.g. MERN, Java, Python"
                          className="settings-input" 
                        />
                      </InputGroup>
                    </div>
                  </div>
                )}

                {/* Career Goals */}
                {activeTab === 'career' && (
                  <div className="p-8 space-y-8">
                    <SectionTitle title="Career Roadmap" subtitle="Help the AI guide you to your dream job." />
                    <div className="grid gap-6">
                      <CustomSelect 
                        label="Target Role" 
                        value={data.settings.target_role} 
                        options={[
                          { value: 'SDE', label: 'Software Engineer' },
                          { value: 'frontend', label: 'Frontend Engineer' },
                          { value: 'backend', label: 'Backend Engineer' },
                          { value: 'devops', label: 'DevOps Engineer' }
                        ]}
                        onChange={(v: string) => updateSettings({target_role: v})} 
                      />
                      <CustomSelect 
                        label="Target Company" 
                        value={data.settings.company_type} 
                        options={[
                          { value: 'startup', label: 'Startup' },
                          { value: 'product-based', label: 'Product Based (MNC)' },
                          { value: 'service-based', label: 'Service Based' }
                        ]}
                        onChange={(v: string) => updateSettings({company_type: v})} 
                      />
                      <CustomSelect 
                        label="Learning Pace" 
                        value={data.settings.learning_pace} 
                        options={[
                          { value: 'slow', label: 'Slow & Steady' },
                          { value: 'balanced', label: 'Balanced' },
                          { value: 'fast', label: 'Fast Track' }
                        ]}
                        onChange={(v: string) => updateSettings({learning_pace: v})} 
                      />
                    </div>
                  </div>
                )}

                {/* AI Behavior */}
                {activeTab === 'ai' && (
                  <div className="p-8 space-y-8">
                    <SectionTitle title="AI Mentor Personality" subtitle="Customize the voice of your AI mentor." />
                    <div className="space-y-6">
                      <CustomSelect 
                        label="Response Style" 
                        value={data.settings.ai_response_style} 
                        options={[
                          { value: 'short', label: 'Short & Concise' },
                          { value: 'detailed', label: 'Detailed Analysis' },
                          { value: 'mentor-style', label: 'Encouraging Mentor' }
                        ]}
                        onChange={(v: string) => updateSettings({ai_response_style: v})} 
                      />
                      <CustomSelect 
                        label="Explanation Level" 
                        value={data.settings.explanation_level} 
                        options={[
                          { value: 'beginner-friendly', label: 'Beginner Friendly' },
                          { value: 'deep technical', label: 'Deep Technical' }
                        ]}
                        onChange={(v: string) => updateSettings({explanation_level: v})} 
                      />
                    </div>
                  </div>
                )}

                {/* Resume Settings */}
                {activeTab === 'resume' && (
                  <div className="p-8 space-y-8">
                    <SectionTitle title="Resume Analysis" subtitle="Fine-tune how your resume is graded." />
                    <div className="space-y-6">
                      <ToggleItem 
                        label="ATS Strict Mode" 
                        desc="Harsher grading for enterprise-grade ATS compatibility." 
                        enabled={data.settings.ats_strict}
                        onToggle={(v: boolean) => updateSettings({ats_strict: v})}
                      />
                      <InputGroup label="Target Keywords">
                        <textarea 
                          className="settings-input h-32" 
                          placeholder="Add keywords separated by commas (e.g. React, Docker, Kubernetes)"
                          value={data.settings.keywords.join(', ')}
                          onChange={(e) => updateSettings({keywords: e.target.value.split(',').map(s => s.trim())})}
                        />
                      </InputGroup>
                    </div>
                  </div>
                )}

                {/* Privacy & Danger Zone */}
                {activeTab === 'privacy' && (
                  <div className="p-8 space-y-8">
                    <SectionTitle title="Privacy & Data" subtitle="You own your data. Control what we save." />
                    <div className="space-y-6">
                      <ToggleItem 
                        label="Save GitHub Data" 
                        desc="Keep analysis history of your repositories." 
                        enabled={data.settings.save_github}
                        onToggle={(v: boolean) => updateSettings({save_github: v})}
                      />
                      <ToggleItem 
                        label="Save Resume Data" 
                        desc="Store your resume analysis for the dashboard." 
                        enabled={data.settings.save_resume}
                        onToggle={(v: boolean) => updateSettings({save_resume: v})}
                      />
                      
                      <div className="pt-8 border-t border-border">
                        <h4 className="text-red-500 font-bold mb-4 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" /> Danger Zone
                        </h4>
                        <div className="flex flex-col gap-3">
                          <button 
                            onClick={async () => {
                              if (confirm('Delete all analysis data? This cannot be undone.')) {
                                await fetch('/api/settings/data', { method: 'DELETE' });
                                alert('Data cleared.');
                              }
                            }}
                            className="w-full text-left p-4 rounded-2xl border border-red-500/20 hover:bg-red-500/5 text-red-500 text-sm font-bold transition-all"
                          >
                            Delete All Analysis Data
                          </button>
                          <button className="w-full text-left p-4 rounded-2xl border border-red-500/20 hover:bg-red-500/5 text-red-500 text-sm font-bold transition-all">
                            Delete Account Permanently
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* UI Preferences */}
                {activeTab === 'ui' && (
                  <div className="p-8 space-y-8">
                    <SectionTitle title="User Interface" subtitle="Customize your experience." />
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <ThemeBox 
                          label="Premium Dark" 
                          active={data.settings.theme === 'dark'} 
                          onClick={() => updateSettings({theme: 'dark'})}
                          dark 
                        />
                        <ThemeBox 
                          label="Clean Light" 
                          active={data.settings.theme === 'light'} 
                          onClick={() => updateSettings({theme: 'light'})}
                        />
                      </div>
                      <ToggleItem 
                        label="UI Animations" 
                        desc="Enable smooth motion effects across the platform." 
                        enabled={data.settings.animations_enabled}
                        onToggle={(v: boolean) => updateSettings({animations_enabled: v})}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between bg-card border border-border rounded-[32px] p-6 sticky bottom-8 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                  <Zap className="w-5 h-5" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">Changes are not saved until you click the button.</p>
              </div>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-primary text-primary-foreground px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-primary/30 disabled:opacity-50 active:scale-95"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .settings-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
          color: inherit;
        }
        .settings-input:focus {
          border-color: var(--color-primary);
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </DashboardLayout>
  );
}

function SectionTitle({ title, subtitle }: any) {
  return (
    <div className="mb-8">
      <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}

function InputGroup({ label, children }: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function CustomSelect({ label, value, options, onChange }: any) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((o: any) => o.value === value);

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="text-sm font-bold text-muted-foreground">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold hover:bg-white/10 transition-all text-left"
      >
        <span>{selectedOption?.label || 'Select...'}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronRight className="w-4 h-4 text-muted-foreground rotate-90" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-50 top-full left-0 w-full bg-card border border-border rounded-2xl shadow-2xl overflow-hidden py-2"
          >
            {options.map((opt: any) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-primary/20 ${
                  value === opt.value ? 'text-primary bg-primary/10' : 'text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToggleItem({ label, desc, enabled, onToggle }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-accent/5 rounded-2xl border border-border">
      <div className="flex-1">
        <p className="text-sm font-bold">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <button 
        onClick={() => onToggle(!enabled)}
        className={`w-12 h-6 rounded-full relative transition-all ${enabled ? 'bg-primary' : 'bg-white/10'}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${enabled ? 'right-1' : 'left-1'}`} />
      </button>
    </div>
  );
}

function ThemeBox({ label, active, onClick, dark }: any) {
  return (
    <div 
      onClick={onClick}
      className={`p-4 border-2 rounded-3xl cursor-pointer transition-all ${active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
    >
      <div className={`w-full h-16 rounded-xl mb-3 border ${dark ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-black/10'}`} />
      <p className="text-xs font-bold text-center">{label}</p>
    </div>
  );
}
