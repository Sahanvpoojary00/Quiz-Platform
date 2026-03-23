"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNavbar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: "Live Dashboard", href: "/admin", icon: "📊" },
    { name: "Question Bank", href: "/admin/questions", icon: "📝" },
    { name: "User Analysis", href: "/admin/users", icon: "👤" },
    { name: "Leaderboard", href: "/admin/leaderboard", icon: "🏆" }
  ];

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">TechQuiz Admin</h1>
        <div className="flex gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent"
                }`}
              >
                <span>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-widest font-bold">Exit to User App</Link>
        <div className="h-4 w-[1px] bg-zinc-800"></div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
          <span className="text-xs font-mono text-zinc-400">System Live</span>
        </div>
        <button 
          onClick={async () => {
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = '/login';
          }}
          className="ml-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-red-500 transition-colors border border-zinc-800 px-2 py-1 rounded hover:bg-zinc-800"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
