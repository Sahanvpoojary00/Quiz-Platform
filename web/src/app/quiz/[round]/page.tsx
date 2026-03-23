"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { AntiCheatProvider } from "@/components/AntiCheatProvider";

export default function QuizRound({ params }: { params: Promise<{ round: string }> }) {
  const resolvedParams = use(params);
  const round = parseInt(resolvedParams.round);
  const router = useRouter();
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [code, setCode] = useState("");
  const [mcqAnswer, setMcqAnswer] = useState("");
  const [startTime, setStartTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchQuestions = async () => {
    try {
      const userRes = await fetch('/api/user');
      const userData = await userRes.json();

      if (!userData.user) {
        router.push('/login');
        return;
      }

      // Check Quiz Access, Clearance & Elimination
      if (!userData.user.canWriteQuiz || userData.user.clearedRound < round - 1 || userData.user.isEliminated) {
        router.push('/dashboard?error=access_denied');
        return;
      }

      const res = await fetch(`/api/questions?round=${round}`);
      if (!res.ok) throw new Error("Failed to fetch questions");
      const data = await res.json();
      
      const submittedIds = new Set(userData.user.submissions.map((s: any) => s.question_id));
      let filtered = (data.questions || []).filter((q: any) => !submittedIds.has(q.id));
      
      if (filtered.length === 0 && !loading) {
         router.push('/dashboard');
         return;
      }

      const shuffled = [...filtered].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      setCurrentIdx(0); 
      setStartTime(Date.now());
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  useEffect(() => {
    fetchQuestions().then(() => setLoading(false));
  }, [round]);

  const handleSubmit = async () => {
    if (!questions[currentIdx]) return;
    setSubmitting(true);
    
    const currentQ = questions[currentIdx];
    const answer = currentQ.type === 'CODING' ? code : mcqAnswer;
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: currentQ.id, answer, time_taken: timeTaken })
      });

      // Fetch the LATEST pool for the next question (handles live additions & shuffling)
      await fetchQuestions();
      setCode("");
      setMcqAnswer("");

      // If no questions left in the pool, we are done
      // (fetchQuestions will have set an empty array if all are answered)
    } finally {
      setSubmitting(false);
    }
  };

  // Check if we finished
  useEffect(() => {
    if (!loading && questions.length === 0) {
       // Only redirect if they actually had some questions to begin with or if they just finished
       // We can check if status was ACTIVE
    }
  }, [questions, loading]);

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;

  if (questions.length === 0) return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center flex-col gap-4">
      <h1 className="text-2xl font-bold">No questions configured for this round.</h1>
      <button onClick={() => router.push('/dashboard')} className="text-blue-400 hover:underline">Back to Dashboard</button>
    </div>
  );

  const question = questions[currentIdx];
  const isCoding = question.type === 'CODING';
  let options = [];
  try {
    options = question.options ? JSON.parse(question.options) : [];
  } catch(e) {}

  return (
    <AntiCheatProvider>
      <div className="min-h-screen bg-zinc-950 text-white p-6 font-sans flex flex-col items-center">
        <header className="w-full max-w-4xl flex justify-between items-center mb-8 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl border-t border-t-zinc-700/50">
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Round {round}</h1>
            <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest mt-1">Question {currentIdx + 1} of {questions.length}</p>
          </div>
          <div className="text-right">
            <span className="bg-zinc-950 px-4 py-2 rounded-lg text-sm font-mono text-zinc-300 border border-zinc-800 shadow-inner tracking-widest uppercase">
              {question.type}
            </span>
          </div>
        </header>

        <main className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-800 via-indigo-500 to-zinc-800"></div>
          
          <h2 className="text-xl md:text-2xl mb-8 font-medium leading-relaxed text-zinc-100">{question.content}</h2>
          
          {question.type === 'VISUAL' && (
             <div className="mb-8 bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-2xl h-64 flex flex-col items-center justify-center text-zinc-600 transition-colors hover:border-zinc-700">
               <span className="text-5xl mb-3 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">🖼️</span>
               <p className="font-bold uppercase tracking-widest text-sm">Visual Asset Data Placeholder</p>
             </div>
          )}

          {isCoding ? (
            <div className="bg-[#0d0d0d] rounded-2xl border border-zinc-800 shadow-inner mb-8 overflow-hidden group">
               <div className="bg-zinc-900 border-b border-zinc-800 flex justify-between items-center py-2 px-4">
                 <span className="text-xs text-zinc-500 font-mono tracking-wider">python3.bash</span>
                 <div className="flex gap-2">
                   <span className="w-3 h-3 rounded-full bg-zinc-700 group-hover:bg-red-500 transition-colors"></span>
                   <span className="w-3 h-3 rounded-full bg-zinc-700 group-hover:bg-yellow-500 transition-colors"></span>
                   <span className="w-3 h-3 rounded-full bg-zinc-700 group-hover:bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0)] group-hover:shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all"></span>
                 </div>
               </div>
               <textarea 
                  className="w-full bg-transparent text-green-400 font-mono text-sm p-6 h-80 focus:outline-none resize-y selection:bg-green-900/50"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="# Enter your Python solution...
def solve():
    pass"
                  spellCheck={false}
               />
            </div>
          ) : (
            <div className="space-y-4 mb-8">
              {options.map((opt: string, i: number) => (
                <label key={i} className={`flex items-center p-5 rounded-xl cursor-pointer transition-all transform hover:-translate-y-0.5 border ${mcqAnswer === opt ? 'bg-indigo-900/30 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)] text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-600'}`}>
                  <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${mcqAnswer === opt ? 'border-indigo-400' : 'border-zinc-700'}`}>
                    {mcqAnswer === opt && <div className="w-3 h-3 bg-indigo-400 rounded-full animate-pulse blur-[1px]"></div>}
                  </div>
                  <input type="radio" value={opt} className="hidden" 
                    checked={mcqAnswer === opt} 
                    onChange={e => setMcqAnswer(e.target.value)} 
                  />
                  <span className="font-medium text-lg">{opt}</span>
                </label>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-6 border-t border-zinc-800/50">
             <button 
                onClick={handleSubmit} 
                className="bg-zinc-100 hover:bg-white text-zinc-950 px-12 py-4 rounded-xl font-black shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all transform hover:-translate-y-1 uppercase tracking-widest disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                disabled={submitting || (!isCoding && !mcqAnswer) || (isCoding && !code)}
             >
                {submitting ? 'Authenticating Result...' : (currentIdx + 1 === questions.length ? 'Submit Final' : 'Save & Continue')}
             </button>
          </div>
        </main>
      </div>
    </AntiCheatProvider>
  );
}
