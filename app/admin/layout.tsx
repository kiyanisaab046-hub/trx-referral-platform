'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/signin');
        return;
      }

      // Fetch user profile to check role
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      // For demonstration, we'll allow access if the email matches the admin email
      // EVEN if the role isn't 'admin' yet, since they just created it.
      // In production, this should ONLY check profile?.role === 'admin'.
      if (profile?.role === 'admin' || session.user.email === 'zkiyani770@gmail.com') {
        setLoading(false);
      } else {
        router.push('/dashboard');
      }
    };

    checkAdmin();
  }, [router]);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'User Management', path: '/admin/users', icon: '👥' },
    { name: 'Design Settings', path: '/admin/settings', icon: '🎨' },
    { name: 'Notifications', path: '/admin/notifications', icon: '🔔' },
    { name: 'Support System', path: '/admin/support', icon: '💬' },
    { name: 'Maintenance', path: '/admin/maintenance', icon: '⚙️' },
    { name: 'Extra Features', path: '/admin/extra', icon: '✨' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0710] text-gray-200 font-satoshi flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#120D1D]/80 backdrop-blur-xl border-r border-primary/10 flex flex-col fixed h-full z-20 shadow-[5px_0_30px_rgba(232,67,147,0.05)]">
        <div className="p-6 border-b border-primary/10">
          <h2 className="text-2xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary uppercase tracking-widest">UIP Admin</h2>
          <p className="text-xs text-soft-gray mt-1 font-bold tracking-widest">Premium Control</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary/20 text-white border border-primary/30 shadow-[0_0_15px_rgba(232,67,147,0.2)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-primary/10">
          <Link href="/dashboard" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold transition-all border border-white/10 text-gray-300 hover:text-white">
            &larr; Exit to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen relative">
        {/* Soft Background Glows */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-secondary/5 rounded-full blur-[150px]"></div>
        </div>

        {/* Topbar */}
        <header className="h-20 bg-[#120D1D]/50 backdrop-blur-md border-b border-primary/10 flex items-center justify-between px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <div className="h-8 w-1 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
            <h1 className="text-xl font-bold text-white capitalize">{pathname.split('/').pop() || 'Dashboard'}</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
              🔔
              <span className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-[#120D1D]"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-white">Super Admin</p>
                <p className="text-xs text-primary">zkiyani770@gmail.com</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-black font-black shadow-[0_0_15px_rgba(232,67,147,0.3)]">
                ZK
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
