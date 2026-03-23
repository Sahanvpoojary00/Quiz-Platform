"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function DashboardContent() {
  const [user, setUser] = useState<any>(null);
  const [systemState, setSystemState] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const kicked = searchParams.get('kicked') === 'true';
  const accessDenied = searchParams.get('error') === 'access_denied';

  useEffect(() => {
    fetch('/api/user')
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        if (!data.user) router.push('/login');
        setUser(data.user);
      })
      .catch(() => router.push('/login'));

    fetch('/api/system-state')
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => setSystemState(data.state))
      .catch(error => console.error("Failed to fetch system state:", error));
  }, [router]);

  if (!user || !systemState) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  const violations = user.logs?.length || 0;
  // const progressPercent = user.current_round === 1 ? 0 : user.current_round === 2 ? 33 : user.current_round === 3 ? 66 : 100;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Alerts for Kicked / Access Denied */}
        {(kicked || accessDenied) && (
          <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl flex items-center gap-6 shadow-[0_0_30px_rgba(239,68,68,0.1)] animate-in slide-in-from-top duration-500">
            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-2xl shadow-lg shadow-red-500/20">
              🚫
            </div>
            <div>
              <h3 className="text-xl font-black text-red-500 uppercase tracking-tighter">
                {kicked ? 'Access Terminated' : 'Permission Revoked'}
              </h3>
              <p className="text-zinc-400 text-sm font-medium">
                {kicked 
                  ? "Your session was terminated by an administrator for violating the platform rules. Please contact support if you believe this was an error." 
                  : "Your permission to participate in the quiz has been revoked by an administrator."}
              </p>
            </div>
          </div>
        )}
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl">
          <div className="mb-6 md:mb-0">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-1">
              Welcome, {user.name}
            </h1>
            <p className="text-zinc-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              {user.email}
              <button 
                onClick={async () => {
                  await fetch('/api/logout', { method: 'POST' });
                  router.push('/login');
                }}
                className="ml-4 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-red-400 transition-colors bg-zinc-800/50 px-3 py-1 rounded-lg border border-zinc-700/50"
              >
                Logout
              </button>
            </p>
          </div>
          <div className="flex flex-wrap gap-8 text-center bg-zinc-950/50 p-6 rounded-xl border border-zinc-800/50">
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Total Score</p>
              <p className="text-3xl font-black text-green-400">{user.score}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Quiz Status</p>
              <p className={`text-xl font-bold mt-1 ${user.status === 'COMPLETED' ? 'text-indigo-400' : 'text-blue-400'}`}>{user.status}</p>
            </div>
            {violations > 0 && (
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Violations</p>
                <p className="text-3xl font-black text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">{violations}</p>
              </div>
            )}
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl hover:border-blue-500/30 transition-all group">
             <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2 block">Current Score</span>
             <div className="flex items-baseline gap-2">
               <span className="text-5xl font-black text-white group-hover:text-blue-400 transition-colors">{user?.score || 0}</span>
               <span className="text-zinc-600 font-bold uppercase text-[10px]">Points</span>
             </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl hover:border-indigo-500/30 transition-all group">
             <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2 block">Clearance Status</span>
             <div className="flex items-center gap-3">
               <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tight ${
                 (user?.clearedRound >= (systemState?.currentRound || 1) - 1) 
                 ? 'bg-green-500/10 text-green-500 border border-green-500/30' 
                 : 'bg-red-500/10 text-red-500 border border-red-500/30 font-black italic animate-pulse'
               }`}>
                 {user?.clearedRound >= (systemState?.currentRound || 1) - 1 ? 'ELIGIBLE' : 'NOT CLEARED'}
               </div>
               <span className="text-zinc-300 font-medium text-sm">
                 Round {user?.clearedRound || 0} Cleared
               </span>
             </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl">
             <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2 block">Active Round</span>
             <span className="text-3xl font-black text-white italic">ROUND {systemState?.currentRound || 1}</span>
             <p className="text-zinc-600 text-[10px] mt-1 font-bold uppercase">Status: {systemState?.status || 'LOBBY'}</p>
          </div>
        </div>

        {/* Qualification Status Banner */}
        {user?.isEliminated ? (
          <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl flex items-center justify-between group overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 text-2xl animate-pulse">
                ✕
              </div>
              <div>
                <h3 className="text-lg font-black text-red-500 uppercase italic">Session Terminated</h3>
                <p className="text-zinc-400 text-sm font-medium">You have been eliminated from the competition based on the latest round evaluation.</p>
              </div>
            </div>
          </div>
        ) : (user?.score >= (systemState?.cutoffScore || 0) && systemState?.status === 'FINISHED') ? (
          <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-2xl flex items-center justify-between group overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 text-2xl animate-bounce">
                🎉
              </div>
              <div>
                <h3 className="text-lg font-black text-green-500 uppercase italic">Qualified!</h3>
                <p className="text-zinc-400 text-sm font-medium">Congratulations! You have cleared the cutoff and advanced to the next screening phase.</p>
              </div>
            </div>
          </div>
        ) : null}

        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-10 text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl font-black text-white uppercase tracking-tighter">
                {user?.isEliminated ? "Tournament Over" : "Ready to Begin?"}
              </h2>
              <p className="text-zinc-400 max-w-xl mx-auto font-medium">
                {user?.isEliminated 
                  ? "Thank you for participating. Your journey in this technical screening has concluded. Best of luck with your future endeavors."
                  : user?.clearedRound < (systemState?.currentRound || 1) - 1 
                    ? "You must be cleared for the current round by an administrator to proceed. Check with your supervisor."
                    : systemState?.status === 'ACTIVE' 
                      ? "The gateway is open. Enter the arena and demonstrate your technical proficiency."
                      : "The round has not started yet. Please wait in the lobby."}
              </p>
            </div>

            {!user?.isEliminated && user?.clearedRound >= (systemState?.currentRound || 1) - 1 && systemState?.status === 'ACTIVE' && (
              <button 
                onClick={() => router.push(`/quiz/${systemState.currentRound}`)}
                className="bg-white text-black px-12 py-5 rounded-full text-lg font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl shadow-white/10 active:scale-95 flex items-center gap-4 mx-auto"
              >
                Launch Round {systemState.currentRound} <span className="text-2xl">→</span>
              </button>
            )}

            {systemState?.status !== 'ACTIVE' && (
              <div className="inline-flex items-center gap-3 bg-zinc-950 px-8 py-4 rounded-full border border-zinc-800">
                <span className="w-3 h-3 bg-zinc-700 rounded-full animate-pulse"></span>
                <span className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Awaiting Round Start</span>
              </div>
            )}
          </div>
        </section>
        
        <section className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold mb-6">Attempt History</h2>
          {user.submissions?.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl">
              <p className="text-zinc-500 italic">No attempts yet. The timeline will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-sm">
                    <th className="pb-4 px-4 font-medium uppercase tracking-wider">Question ID</th>
                    <th className="pb-4 px-4 font-medium uppercase tracking-wider">Points Earned</th>
                    <th className="pb-4 px-4 font-medium uppercase tracking-wider">Time Taken</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {user.submissions.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="py-5 px-4 font-mono text-sm text-zinc-400 group-hover:text-blue-400 transition-colors">{sub.question_id}</td>
                      <td className="py-5 px-4 text-green-400 font-bold text-lg">+{sub.score}</td>
                      <td className="py-5 px-4 text-zinc-400">
                        <span className="bg-zinc-950 px-3 py-1 rounded text-xs border border-zinc-800">{sub.time_taken}s</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        
      </div>
    </div>
  );
}

export default function UserDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
      <DashboardContent />
    </Suspense>
  );
}
