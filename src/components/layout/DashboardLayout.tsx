'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Code2, 
  Map, 
  Settings as SettingsIcon,
  Bell,
  LogOut
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
    { icon: Code2, label: 'Repo Analysis', href: '/analyze/repo' },
    { icon: Map, label: 'Roadmap', href: '/roadmap' },
    { icon: SettingsIcon, label: 'Settings', href: '/settings' },
  ];

  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const handleTrigger = () => setShowLogoutModal(true);
    window.addEventListener('trigger-logout-modal', handleTrigger);
    return () => window.removeEventListener('trigger-logout-modal', handleTrigger);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Desktop Sidebar */}
      <Sidebar />

      <main className="flex-1 overflow-y-auto relative pb-20 lg:pb-0">
        {/* Mobile Header */}
        <div className="flex items-center justify-between lg:hidden p-4 sticky top-0 z-[60] bg-background/80 backdrop-blur-xl border-b border-white/5">
          <Link href="/dashboard">
            <img src="/logo.png" alt="DevIntel" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl hover:bg-white/5 transition-all">
              <Bell className="w-6 h-6 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
            </button>
            <Link href="/settings" className="w-8 h-8 rounded-full overflow-hidden border border-primary/20">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ajeet" alt="Avatar" className="w-full h-full object-cover" />
            </Link>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 lg:p-8 relative z-10"
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-card/80 backdrop-blur-xl border-t border-white/5 px-6 py-4 flex items-center justify-between z-[80] pb-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1.5 transition-all ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-primary/20' : ''}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Logout Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-10 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
              
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-8 border border-red-500/20">
                <LogOut className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-bold mb-2">Log out of DevIntel?</h2>
              <p className="text-muted-foreground text-sm mb-10 px-4">You&apos;ll need to sign in again to continue your journey.</p>

              <div className="space-y-3">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full py-4 rounded-2xl bg-red-500 text-white font-bold shadow-lg shadow-red-500/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isLoggingOut ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LogOut className="w-5 h-5" />
                  )}
                  Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
