'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, 
  Shield, 
  Zap, 
  Bell, 
  ChevronRight,
  Code2,
  Sliders,
  LogOut,
  Github,
  CheckCircle2,
  AlertCircle,
  Camera,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Modals state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  
  // Form states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  
  const [message, setMessage] = useState({ type: '', text: '' });

  const careerGoals = ['Frontend', 'Backend', 'Full Stack', 'DevOps', 'Mobile', 'Data Science'];
  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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
          setEditName(profileData?.full_name || '');
          setEditAvatar(profileData?.avatar_url || '');
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading settings:', err);
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const updateProfile = async (updates: any) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      setProfile({ ...profile, ...updates });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setShowEditProfileModal(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsUpdating(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    try {
      setIsUpdating(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsUpdating(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

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
      <div className="max-w-6xl mx-auto space-y-8 pb-32 pt-4 relative">
        {/* Toast Message */}
        <AnimatePresence>
          {message.text && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl font-bold shadow-2xl z-50 flex items-center gap-2 ${
                message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <h1 className="text-3xl font-bold mb-1 text-center md:text-left">Settings</h1>
          <p className="text-muted-foreground text-sm text-center md:text-left">Configure your developer environment and account security.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

          {/* Profile Card */}
          <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 text-center space-y-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-2">
              <UserIcon className="w-6 h-6" />
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
              <button 
                onClick={() => setShowEditProfileModal(true)}
                className="absolute bottom-1 right-1 w-8 h-8 bg-card border border-white/10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary transition-all shadow-lg"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{profile?.full_name || 'Dev Name'}</h2>
              <p className="text-muted-foreground text-sm">{user?.email || 'dev@example.com'}</p>
            </div>

            <button 
              onClick={() => setShowEditProfileModal(true)}
              className="px-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all active:scale-95 shadow-lg"
            >
              Edit Profile
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
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="text-left">
                  <p className="text-sm font-bold">Change Password</p>
                  <p className="text-xs text-muted-foreground mt-1">Update your login credentials regularly</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Github className="w-5 h-5 text-muted-foreground" />
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
                <button 
                  onClick={() => updateProfile({ mfa_enabled: !profile?.mfa_enabled })}
                  className={cn(
                    "w-12 h-6 rounded-full relative p-1 transition-all",
                    profile?.mfa_enabled ? "bg-primary" : "bg-white/10"
                  )}
                >
                  <motion.div 
                    animate={{ x: profile?.mfa_enabled ? 24 : 0 }}
                    className="w-4 h-4 bg-white rounded-full shadow-lg" 
                  />
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
                  <h4 className="text-2xl font-black">{profile?.plan || 'Free'}</h4>
                  <p className="text-xs text-muted-foreground mt-1">Monthly Plan</p>
                </div>
                <p className="text-xs font-bold"><span className="text-foreground">{profile?.analysis_tokens || 0}</span>/3 Tokens</p>
              </div>

              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(profile?.analysis_tokens / 3) * 100}%` }}
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
              <div className="space-y-3 relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Career Goal</label>
                <button 
                  onClick={() => setOpenDropdown(openDropdown === 'goal' ? null : 'goal')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 text-sm font-bold"
                >
                  {profile?.career_goal || 'Full Stack'}
                  <ChevronRight className={cn("w-5 h-5 text-muted-foreground transition-transform", openDropdown === 'goal' ? "-rotate-90" : "rotate-90")} />
                </button>
                
                <AnimatePresence>
                  {openDropdown === 'goal' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 w-full mt-2 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden z-20 shadow-2xl"
                    >
                      {careerGoals.map(goal => (
                        <button 
                          key={goal}
                          onClick={() => {
                            updateProfile({ career_goal: goal });
                            setOpenDropdown(null);
                          }}
                          className="w-full px-6 py-3 text-left text-sm hover:bg-white/5 transition-colors"
                        >
                          {goal}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-3 relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Skill Level</label>
                <button 
                  onClick={() => setOpenDropdown(openDropdown === 'level' ? null : 'level')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 text-sm font-bold"
                >
                  {profile?.skill_level || 'Intermediate'}
                  <ChevronRight className={cn("w-5 h-5 text-muted-foreground transition-transform", openDropdown === 'level' ? "-rotate-90" : "rotate-90")} />
                </button>

                <AnimatePresence>
                  {openDropdown === 'level' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 w-full mt-2 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden z-20 shadow-2xl"
                    >
                      {skillLevels.map(level => (
                        <button 
                          key={level}
                          onClick={() => {
                            updateProfile({ skill_level: level });
                            setOpenDropdown(null);
                          }}
                          className="w-full px-6 py-3 text-left text-sm hover:bg-white/5 transition-colors"
                        >
                          {level}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-left">
                  <p className="text-sm font-bold">System Notifications</p>
                  <p className="text-xs text-muted-foreground mt-1">Real-time alerts for analysis completion</p>
                </div>
                <button 
                  onClick={() => updateProfile({ notifications_enabled: !profile?.notifications_enabled })}
                  className={cn(
                    "w-12 h-6 rounded-full relative p-1 transition-all",
                    profile?.notifications_enabled ? "bg-primary" : "bg-white/10"
                  )}
                >
                  <motion.div 
                    animate={{ x: profile?.notifications_enabled ? 24 : 0 }}
                    className="w-4 h-4 bg-white rounded-full shadow-lg" 
                  />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Edit Profile Modal */}
        <AnimatePresence>
          {showEditProfileModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowEditProfileModal(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold">Edit Profile</h2>
                  <button onClick={() => setShowEditProfileModal(false)} className="p-2 hover:bg-white/5 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Full Name</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none"
                      placeholder="Your Name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Avatar URL</label>
                    <input 
                      type="text" 
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none"
                      placeholder="https://example.com/avatar.png"
                    />
                    <p className="text-[10px] text-muted-foreground">Tip: Use Dicebear or Gravatar URLs for custom avatars.</p>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button 
                      onClick={() => setShowEditProfileModal(false)}
                      className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 font-bold"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => updateProfile({ full_name: editName, avatar_url: editAvatar })}
                      disabled={isUpdating}
                      className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 disabled:opacity-50"
                    >
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Password Modal */}
        <AnimatePresence>
          {showPasswordModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPasswordModal(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold">Change Password</h2>
                  <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-white/5 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">New Password</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Confirm Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setShowPasswordModal(false)}
                      className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 font-bold"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isUpdating}
                      className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 disabled:opacity-50"
                    >
                      {isUpdating ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
