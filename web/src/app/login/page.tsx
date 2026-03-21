"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      console.log("Login response status:", res.status);
      if (res.ok) {
        const data = await res.json();
        const user = data.user;
        console.log("Login successful, user role:", user.role);
        
        if (user.role === 'ADMIN') {
          console.log("Redirecting to /admin...");
          router.push('/admin');
        } else {
          console.log("Redirecting to /dashboard...");
          router.push('/dashboard');
        }
      } else {
        const data = await res.json();
        console.error("Login failed:", data.error);
        alert(data.error || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white font-sans">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-zinc-950 to-purple-900/20" />
      <form onSubmit={handleLogin} className="relative z-10 bg-zinc-900/80 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-zinc-800 w-[400px] space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">TechQuizHQ</h1>
          <p className="text-zinc-400 text-sm">Enter your credentials to continue</p>
        </div>
        
        <div className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@example.com (use admin@ for admin)"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600"
              required
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] disabled:opacity-50"
        >
          {loading ? "Authenticating..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
