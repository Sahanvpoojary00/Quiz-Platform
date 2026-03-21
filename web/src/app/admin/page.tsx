"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [systemState, setSystemState] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'analytics'>('users');
  const router = useRouter();

  const fetchAdminData = async () => {
    try {
      const [uRes, lRes, sRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/logs'),
        fetch('/api/system-state')
      ]);
      if (!uRes.ok || !lRes.ok || !sRes.ok) throw new Error();
      
      const uData = await uRes.json();
      const lData = await lRes.json();
      const sData = await sRes.json();
      setUsers(uData.users || []);
      setLogs(lData.logs || []);
      setSystemState(sData.state);
    } catch (err) {
      // Silent error
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 3000); 
    return () => clearInterval(interval);
  }, []);

  const updateState = async (status: string, round?: number) => {
    await fetch('/api/system-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, currentRound: round })
    });
    fetchAdminData();
  };

  const handleKick = async (userId: string, blocked: boolean) => {
    if (!confirm(`Are you sure you want to ${blocked ? 'KICK' : 'UNBLOCK'} this user?`)) return;
    await fetch('/api/users/kick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, blocked })
    });
    fetchAdminData();
  };

  const handleToggleAccess = async (userId: string, currentAccess: boolean) => {
    const res = await fetch('/api/users/access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, canWriteQuiz: !currentAccess })
    });
    if (res.ok) fetchAdminData();
  };

  const handleClearRound = async (userId: string, currentCleared: number) => {
    const res = await fetch('/api/users/clearance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, roundCleared: currentCleared + 1 })
    });
    if (res.ok) fetchAdminData();
  };

  const handleSetCutoff = async (cutoff: number) => {
    const res = await fetch('/api/admin/set-cutoff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cutoff })
    });
    if (res.ok) fetchAdminData();
  };

  const handleEvaluate = async () => {
    if (!confirm("Are you sure you want to evaluate all participants against the cutoff? This will mark some as eliminated.")) return;
    const res = await fetch('/api/admin/evaluate-round', {
      method: 'POST'
    });
    if (res.ok) fetchAdminData();
  };

  const totalParticipants = users.filter(u => u.role === 'USER').length;
  const avgScore = totalParticipants > 0 
    ? (users.reduce((acc, u) => acc + u.score, 0) / totalParticipants).toFixed(1) 
    : 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* GLOBAL CONTROL BAR */}
      <section className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-1">
             <h2 className="text-sm font-black text-zinc-500 uppercase tracking-[0.3em]">Global Quiz Orchestrator</h2>
             <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-white">{systemState?.status}</span>
                <span className="text-xs font-mono bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800 text-zinc-400">R{systemState?.currentRound}</span>
             </div>
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center">
            {systemState?.status !== 'LOBBY' && (
              <button 
                onClick={() => updateState('LOBBY')}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-2xl font-bold transition-all text-xs uppercase tracking-widest"
              >
                Lobby Mode
              </button>
            )}
            <button 
              onClick={() => updateState('ACTIVE', 1)}
              className={`px-6 py-3 rounded-2xl font-bold transition-all text-xs uppercase tracking-widest ${systemState?.status === 'ACTIVE' && systemState?.currentRound === 1 ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
            >
              Start Round 1
            </button>
            <button 
              onClick={() => updateState('ACTIVE', 2)}
              className={`px-6 py-3 rounded-2xl font-bold transition-all text-xs uppercase tracking-widest ${systemState?.status === 'ACTIVE' && systemState?.currentRound === 2 ? 'bg-orange-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
            >
              Start Round 2
            </button>
            <button 
              onClick={() => updateState('ACTIVE', 3)}
              className={`px-6 py-3 rounded-2xl font-bold transition-all text-xs uppercase tracking-widest ${systemState?.status === 'ACTIVE' && systemState?.currentRound === 3 ? 'bg-yellow-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
            >
              Start Round 3
            </button>
            <button 
              onClick={() => updateState('FINISHED')}
              className="bg-zinc-100 hover:bg-white text-zinc-950 px-8 py-3 rounded-2xl font-bold transition-all text-xs uppercase tracking-widest shadow-lg"
            >
              End Session
            </button>
          </div>
        </div>
      </section>

      {/* Cutoff Control Panel */}
      <section className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Cutoff Control Panel</h2>
          <div className="flex items-center gap-4 bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active Cutoff:</span>
            <span className="text-lg font-black text-blue-400">{systemState?.cutoffScore || 0}</span>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Set Cutoff Score</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                defaultValue={systemState?.cutoffScore || 0}
                onBlur={(e) => handleSetCutoff(parseInt(e.target.value) || 0)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white font-bold w-32 focus:outline-none focus:border-blue-500 transition-all"
                placeholder="Min Score"
              />
              <button 
                onClick={() => handleEvaluate()}
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-600/20 active:scale-95"
              >
                🚀 Evaluate Round
              </button>
            </div>
          </div>

          <div className="flex gap-4">
             <div className="bg-zinc-950/50 border border-zinc-800 p-4 px-6 rounded-2xl flex flex-col justify-center">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Qualified</span>
                <span className="text-2xl font-black text-green-500">{users.filter(u => u.role === 'USER' && u.qualified && !u.isEliminated).length}</span>
             </div>
             <div className="bg-zinc-950/50 border border-zinc-800 p-4 px-6 rounded-2xl flex flex-col justify-center">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Eliminated</span>
                <span className="text-2xl font-black text-red-500">{users.filter(u => u.role === 'USER' && u.isEliminated).length}</span>
             </div>
          </div>
        </div>
      </section>

      <div className="flex gap-4 border-b border-zinc-800 pb-4">
        <button onClick={() => setActiveTab('users')} className={`px-6 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white text-zinc-950 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>Participants</button>
        <button onClick={() => setActiveTab('logs')} className={`px-6 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'logs' ? 'bg-white text-zinc-950 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>Security Logs</button>
        <button onClick={() => setActiveTab('analytics')} className={`px-6 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'analytics' ? 'bg-white text-zinc-950 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>Intelligence</button>
      </div>

      {activeTab === 'users' && (
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto p-8">
            <table className="w-full text-left">
              <thead>
                <tr className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-zinc-800">
                  <th className="pb-4 px-4 text-center">Kick</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest text-indigo-400">Clearance / Status</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest text-blue-400">Quiz Access</th>
                  <th className="pb-4 px-4">Name</th>
                  <th className="pb-4 px-4">Status / Round</th>
                  <th className="pb-4 px-4">Score</th>
                  <th className="pb-4 px-4 text-right">Violations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {users.filter(u => u.role === 'USER').map(u => (
                  <tr key={u.id} className={`hover:bg-zinc-800/30 transition-colors group ${u.isBlocked ? 'opacity-40 grayscale' : ''}`}>
                    <td className="py-4 px-4 text-center">
                       <button 
                         onClick={() => handleKick(u.id, !u.isBlocked)}
                         className={`w-8 h-8 rounded-full border transition-all flex items-center justify-center ${u.isBlocked ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500 hover:text-white shadow-[0_0_10px_rgba(239,68,68,0)] hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`}
                         title={u.isBlocked ? "Unblock User" : "Kick User"}
                       >
                         {u.isBlocked ? "✅" : "🚫"}
                       </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-zinc-300">R{u.clearedRound || 0}</span>
                          <button 
                            onClick={() => handleClearRound(u.id, u.clearedRound || 0)}
                            className="p-1 px-2 rounded-lg bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all"
                          >
                            + Clear
                          </button>
                        </div>
                        <div className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full inline-block w-fit ${u.isEliminated ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                          {u.isEliminated ? 'Eliminated' : 'Active'}
                        </div>
                      </div>
                    </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleToggleAccess(u.id, u.canWriteQuiz)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${
                        u.canWriteQuiz 
                          ? 'bg-green-500/10 text-green-500 border border-green-500/30' 
                          : 'bg-red-500/10 text-red-500 border border-red-500/30'
                      }`}
                    >
                      {u.canWriteQuiz ? 'Allowed' : 'Revoked'}
                    </button>
                  </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-zinc-200 group-hover:text-white transition-colors">{u.name}</div>
                      <div className="text-[10px] font-mono text-zinc-500">{u.email}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 text-[10px] rounded-full font-black uppercase tracking-widest ${u.status === 'COMPLETED' ? 'bg-zinc-950 border border-zinc-800 text-zinc-400' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                        {u.status} (R{u.current_round})
                      </span>
                    </td>
                    <td className="py-4 px-4 font-black text-lg text-white">{u.score}</td>
                    <td className="py-4 px-4 text-right">
                      {(u.logs?.length || 0) > 0 ? (
                        <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black rounded-full border border-red-500/20">
                          {u.logs.length} Violations
                        </span>
                      ) : (
                        <span className="text-zinc-700 text-[10px] font-bold uppercase tracking-wider italic">Trustworthy</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'logs' && (
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
          <div className="p-8 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
            <h2 className="text-sm font-black text-red-500 uppercase tracking-widest flex items-center gap-2">⚠️ Real-time Security Intelligence</h2>
            <span className="text-[10px] font-mono text-zinc-500 animate-pulse">Scanning Live Stream...</span>
          </div>
          <div className="overflow-x-auto p-8">
            <table className="w-full text-left">
              <thead>
                <tr className="text-zinc-500 text-[10px] font-black uppercase tracking-widest border-b border-zinc-800">
                  <th className="pb-4 px-4">Timestamp</th>
                  <th className="pb-4 px-4">Participant</th>
                  <th className="pb-4 px-4">Event Payload</th>
                  <th className="pb-4 px-4">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-4 px-4 text-[10px] font-mono text-zinc-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-zinc-200">{log.user?.name}</div>
                      <div className="text-[10px] font-mono text-zinc-500">{log.user?.email}</div>
                    </td>
                    <td className="py-4 px-4 font-mono text-[10px] text-yellow-300">{log.event}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                        log.severity === 'HIGH' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        log.severity === 'MEDIUM' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan={4} className="py-12 text-center text-zinc-600 font-bold italic uppercase tracking-widest">System report clean.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'analytics' && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
             <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">Total Participants</p>
             <p className="text-6xl font-black text-blue-400">{totalParticipants}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
             <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">Average Score</p>
             <p className="text-6xl font-black text-green-400">{avgScore}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
             <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">Total Violations</p>
             <p className="text-6xl font-black text-red-500">{logs.length}</p>
          </div>
        </section>
      )}
    </div>
  );
}
