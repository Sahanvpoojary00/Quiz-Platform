"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function UserList() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-zinc-500 font-mono animate-pulse">Loading User Directory...</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-white">User Directory</h1>
        <p className="text-zinc-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage participants and analyze performance</p>
      </header>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-900 border-b border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <th className="px-6 py-4">Participant</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Current Round</th>
              <th className="px-6 py-4">Total Score</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{user.name}</span>
                    <span className="text-xs text-zinc-500">{user.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${
                    user.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                    user.status === 'ACTIVE' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 animate-pulse' :
                    'bg-zinc-800 text-zinc-500 border border-zinc-700'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-mono text-zinc-400">Round {user.current_round}</td>
                <td className="px-6 py-4 text-sm font-black text-white">{user.score} <span className="text-zinc-600 font-normal">PTS</span></td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/admin/users/${user.id}`}
                    className="text-[10px] font-black bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-all shadow-sm uppercase tracking-widest"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
