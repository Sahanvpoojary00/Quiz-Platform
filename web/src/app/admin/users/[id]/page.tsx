"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

export default function UserDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-zinc-500 font-mono animate-pulse">Analyzing Participant Profile...</div>;
  if (!user) return <div className="text-red-500">User not found.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <Link href="/admin/users" className="text-xs font-black text-zinc-500 hover:text-white transition-all uppercase tracking-widest mb-4 inline-block">← Back to Directory</Link>
          <h1 className="text-4xl font-black text-white">{user.name}</h1>
          <p className="text-zinc-500 font-medium">{user.email}</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-center min-w-[120px]">
            <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Score</span>
            <span className="text-2xl font-black text-blue-400">{user.score}</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-center min-w-[120px]">
            <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Rank</span>
            <span className="text-2xl font-black text-purple-400">#--</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
            <header className="px-8 py-6 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
              <h2 className="text-sm font-black uppercase tracking-widest text-zinc-300">Detailed Submissions</h2>
              <span className="text-xs font-bold text-zinc-500">{user.submissions.length} Total Attempts</span>
            </header>
            <div className="divide-y divide-zinc-800">
              {user.submissions.map((sub: any) => (
                <div key={sub.id} className="p-8 hover:bg-zinc-800/20 transition-all space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{sub.question.type} Round</span>
                      <h3 className="text-lg font-bold text-zinc-200">{sub.question.content}</h3>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-black ${sub.score > 0 ? 'text-green-400' : 'text-zinc-600'}`}>
                        +{sub.score} / {sub.question.marks}
                      </span>
                      <span className="block text-[10px] font-bold text-zinc-500">{sub.time_taken}s Taken</span>
                    </div>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-sm">
                    <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-2">Submitted Answer</p>
                    <pre className="text-zinc-300 whitespace-pre-wrap">{sub.answer}</pre>
                  </div>
                </div>
              ))}
              {user.submissions.length === 0 && <div className="p-12 text-center text-zinc-600 italic">No submissions yet.</div>}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl border-t-red-900/30 border-t-2">
            <header className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
              <h2 className="text-sm font-black uppercase tracking-widest text-red-500">Security Audit Logs</h2>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
            </header>
            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
              {user.logs.map((log: any) => (
                <div key={log.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl relative overflow-hidden group">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    log.severity === 'HIGH' ? 'bg-red-500' : 
                    log.severity === 'MEDIUM' ? 'bg-yellow-500' : 'bg-zinc-700'
                  }`}></div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-200">{log.event}</span>
                    <span className="text-[9px] font-mono text-zinc-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed">System triggered violation with {log.severity} severity.</p>
                </div>
              ))}
              {user.logs.length === 0 && <div className="text-center py-12 text-zinc-700 text-sm font-medium italic">No security violations recorded.</div>}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
