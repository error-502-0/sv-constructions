"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, LayoutDashboard, FileText, LogOut, Settings } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin-auth');
        if (res.ok) {
          setAuthenticated(true);
        } else {
          router.push("/admin");
        }
      } catch (err) {
        router.push("/admin");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/admin-auth', { method: 'DELETE' });
    router.push("/admin");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#d4af37] animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  const navItems = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Form Configurator", href: "/admin/dashboard/config", icon: Settings },
    { name: "Manage Combos", href: "/admin/dashboard/combos", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#020617] flex text-white font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white/5 border-r border-white/10 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-[#d4af37] font-extrabold text-xl tracking-widest uppercase">Admin Panel</h1>
          <p className="text-white/50 text-xs mt-1">SVC Interiors CMS</p>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
              >
                <Icon size={18} />
                <span className="font-bold text-sm">{item.name}</span>
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          >
            <LogOut size={18} />
            <span className="font-bold text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <h1 className="text-[#d4af37] font-extrabold text-lg tracking-widest uppercase">Admin Panel</h1>
          <button onClick={handleLogout} className="text-white/70 p-2"><LogOut size={20} /></button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-50" />
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto relative z-10"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
