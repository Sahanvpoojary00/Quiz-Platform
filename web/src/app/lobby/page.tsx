"use client";

import { useGlobalSync } from "@/components/GlobalSyncProvider";

export default function Lobby() {
  const { state } = useGlobalSync();

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white font-sans relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-[120px]"></div>

      <div className="relative z-10 text-center space-y-8 max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-6xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent italic tracking-tighter">
            TechQuiz LOBBY
          </h1>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-xs">Waiting for Admin to initiate the session</p>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-12 rounded-[2.5rem] shadow-2xl relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-[2.5rem]"></div>
          
          <div className="relative space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                <span className="text-2xl">⚡</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-zinc-100">Prepare yourself!</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                The quiz will start automatically. Keep this tab open. <br/>
                Ensure you are in a quiet environment.
              </p>
            </div>

            <div className="pt-6">
               <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                  Connection Stable
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-left">
           <div className="bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/50">
              <span className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Round 1</span>
              <p className="text-sm font-bold text-zinc-400">MCQ Theory</p>
           </div>
           <div className="bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/50">
              <span className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Round 2</span>
              <p className="text-sm font-bold text-zinc-400">Visual & Code</p>
           </div>
           <div className="bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/50">
              <span className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Round 3</span>
              <p className="text-sm font-bold text-zinc-400">Rapid Fire</p>
           </div>
        </div>
      </div>
    </div>
  );
}
