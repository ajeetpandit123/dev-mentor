'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { 
  User, 
  Shield, 
  Zap, 
  Bell, 
  ChevronRight,
  Code2,
  Sliders,
  LogOut
} from 'lucide-react';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setProfile(profileData);
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading settings:', err);
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const triggerLogout = () => {
    window.dispatchEvent(new CustomEvent('trigger-logout-modal'));
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-8 pb-32 pt-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Settings</h1>
          <p className="text-muted-foreground text-sm">Configure your developer environment and account security.</p>
        </div>

        {/* Profile Card */}
        <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 text-center space-y-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-2">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold absolute top-8 left-20">Profile</h3>
          
          <div className="relative inline-block mt-4">
            <div className="w-32 h-32 rounded-full border-4 border-primary/20 p-1 bg-[#0a0a0a]">
              <img 
                src={profile?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Ajeet"} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover" 
              />
            </div>
            <button className="absolute bottom-1 right-1 w-8 h-8 bg-card border border-white/10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary transition-all shadow-lg">
              <Code2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold">{profile?.full_name || 'Dev Name'}</h2>
            <p className="text-muted-foreground text-sm">{user?.email || 'dev@example.com'}</p>
          </div>

          <button className="px-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all active:scale-95 shadow-lg">
            Edit
          </button>
        </div>

        {/* Account & Security Card */}
        <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 space-y-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Account & Security</h3>
          </div>

          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
              <div className="text-left">
                <p className="text-sm font-bold">Change Password</p>
                <p className="text-xs text-muted-foreground mt-1">Update your login credentials regularly</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold">Connected GitHub</p>
                  <p className="text-xs text-muted-foreground">Synced for Repo Analysis</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                CONNECTED
              </span>
            </div>

            <div className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-left">
                <p className="text-sm font-bold">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground mt-1">Enable 2FA for enhanced protection</p>
              </div>
              <button className="w-12 h-6 bg-primary rounded-full relative p-1 transition-all">
                <div className="absolute right-1 w-4 h-4 bg-white rounded-full shadow-lg" />
              </button>
            </div>
          </div>
        </div>

        {/* Subscription Card */}
        <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 space-y-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Subscription</h3>
          </div>

          <div className="space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <h4 className="text-2xl font-black">Pro</h4>
                <p className="text-xs text-muted-foreground mt-1">Monthly Plan</p>
              </div>
              <p className="text-xs font-bold"><span className="text-foreground">850</span>/1000 Tokens</p>
            </div>

            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '85%' }}
                className="h-full bg-gradient-to-r from-primary to-blue-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
              />
            </div>

            <button className="w-full py-4 bg-gradient-to-r from-primary to-blue-500 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all">
              Upgrade Plan
            </button>
          </div>
        </div>

        {/* Preferences Card */}
        <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 space-y-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Preferences</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Career Goal</label>
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 text-sm font-bold">
                Full Stack
                <ChevronRight className="w-5 h-5 text-muted-foreground rotate-90" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Skill Level</label>
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 text-sm font-bold">
                Intermediate
                <ChevronRight className="w-5 h-5 text-muted-foreground rotate-90" />
              </button>
            </div>

            <div className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-left">
                <p className="text-sm font-bold">System Notifications</p>
                <p className="text-xs text-muted-foreground mt-1">Real-time alerts for analysis completion</p>
              </div>
              <button className="w-12 h-6 bg-primary rounded-full relative p-1 transition-all">
                <div className="absolute right-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="flex flex-col items-center gap-4 pt-8 pb-12">
          <button 
            onClick={triggerLogout}
            className="w-full max-w-[300px] flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#0a0a0a] border border-red-500/20 text-red-500 font-bold hover:bg-red-500/5 transition-all shadow-xl group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Logout Session
          </button>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
            DEVINTEL V2.4.0 + BUILD 882
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

function NavButton({ icon: Icon, label, active }: any) {
  return (
    <button className={`flex flex-col items-center gap-1.5 transition-all ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
      <div className={`p-2 rounded-xl transition-all ${active ? 'bg-primary/20' : ''}`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );
}
