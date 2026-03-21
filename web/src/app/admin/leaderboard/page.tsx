"use client";

import { useEffect, useState } from "react";

export default function AdminLeaderboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(d => {
        setData(d.leaderboard || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-zinc-500 font-mono animate-pulse">Calculating Rankings...</div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header className="text-center">
        <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase underline decoration-blue-500 decoration-8 underline-offset-8 mb-4">The Hall of Fame</h1>
        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Global Standings across all rounds</p>
      </header>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <div className="divide-y divide-zinc-800">
          {data.map((user, i) => (
            <div key={user.id} className="flex items-center justify-between p-8 hover:bg-zinc-800/20 transition-all border-l-4 border-transparent hover:border-blue-500">
              <div className="flex items-center gap-8">
                <span className={`text-4xl font-black italic tracking-tighter ${
                  i === 0 ? 'text-yellow-400' : i === 1 ? 'text-zinc-400' : i === 2 ? 'text-amber-700' : 'text-zinc-700'
                }`}>0{i + 1}</span>
                <div>
                  <h3 className="text-xl font-bold text-zinc-100">{user.name}</h3>
                  <p className="text-xs text-zinc-500 uppercase font-black tracking-widest">{user.email}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-white">{user.score}</span>
                <span className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">Total Points</span>
              </div>
            </div>
          ))}
          {data.length === 0 && <div className="p-12 text-center text-zinc-600 font-bold italic uppercase tracking-widest">No rankings recorded yet.</div>}
        </div>
      </div>
    </div>
  );
}
