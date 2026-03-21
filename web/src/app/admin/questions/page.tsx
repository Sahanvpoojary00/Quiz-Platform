"use client";

import { useEffect, useState } from "react";

export default function QuestionManagement() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [formData, setFormData] = useState({
    type: 'MCQ',
    content: '',
    options: ['', '', '', ''],
    answer: '',
    difficulty: 'EASY',
    marks: 10,
    time_limit: 30,
    round: ''
  });

  const fetchQuestions = async () => {
    const res = await fetch('/api/questions');
    const data = await res.json();
    setQuestions(data.questions || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingQuestion ? 'PUT' : 'POST';
    
    // Prepare the body with stringified options and numeric round
    const body = {
      ...(editingQuestion ? { ...formData, id: editingQuestion.id } : formData),
      options: JSON.stringify(formData.options),
      round: formData.round === '' ? null : parseInt(formData.round as string)
    };

    const res = await fetch('/api/questions', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      setFormData({ type: 'MCQ', content: '', options: ['', '', '', ''], answer: '', difficulty: 'EASY', marks: 10, time_limit: 30, round: '' });
      setEditingQuestion(null);
      fetchQuestions();
    } else {
      const errData = await res.json();
      alert(`Error: ${errData.error || 'Failed to deploy question'}`);
    }
  };

  const handleEdit = (q: any) => {
    setEditingQuestion(q);
    setFormData({
      type: q.type,
      content: q.content,
      options: q.options ? JSON.parse(q.options) : ['', '', '', ''],
      answer: q.answer,
      difficulty: q.difficulty,
      marks: q.marks,
      time_limit: q.time_limit,
      round: q.round || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    const res = await fetch('/api/questions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res.ok) fetchQuestions();
  };

  if (loading) return <div className="text-zinc-500 font-mono animate-pulse p-8">Loading Question Repository...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase underline decoration-red-600 decoration-8 underline-offset-8">Question Bank</h1>
          <p className="text-zinc-500 font-bold mt-4 uppercase tracking-[0.2em] text-xs">Curate and manage your quiz content in real-time</p>
        </div>
      </header>

      <section className="bg-zinc-900 border border-zinc-800 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[60px]"></div>
        <h2 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-8 flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-red-600"></span>
           {editingQuestion ? 'Modify Question' : 'Create New Question'}
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Question Type</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-red-600 transition-all outline-none text-zinc-200"
                >
                  <option value="MCQ">MCQ (Multiple Choice)</option>
                  <option value="VISUAL">VISUAL (Image Based)</option>
                  <option value="CODING">CODING (Programming)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Difficulty</label>
                <select 
                  value={formData.difficulty}
                  onChange={e => setFormData({...formData, difficulty: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-red-600 transition-all outline-none text-zinc-200"
                >
                  <option value="EASY">EASY</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HARD">HARD</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Question Content</label>
              <textarea 
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
                placeholder="Enter question text here..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm h-32 focus:border-red-600 transition-all outline-none text-zinc-200"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Award Marks</label>
                <input 
                  type="number"
                  value={formData.marks || 0}
                  onChange={e => setFormData({...formData, marks: parseInt(e.target.value) || 0})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-red-600 outline-none text-zinc-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Time Limit (Sec)</label>
                <input 
                  type="number"
                  value={formData.time_limit || 0}
                  onChange={e => setFormData({...formData, time_limit: parseInt(e.target.value) || 0})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-red-600 outline-none text-zinc-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-blue-400">Assigned Round / Question Bank</label>
              <input 
                type="number"
                placeholder="Round Number (e.g. 1, 2, 3)"
                value={formData.round}
                onChange={e => setFormData({...formData, round: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-blue-600 outline-none text-zinc-200 shadow-[0_0_15px_rgba(59,130,246,0.05)]"
              />
            </div>
          </div>

          <div className="space-y-6">
            {formData.type === 'MCQ' ? (
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Option Configuration</label>
                {formData.options.map((opt, i) => (
                  <input 
                    key={i}
                    placeholder={`Option ${i+1}`}
                    value={opt}
                    onChange={e => {
                      const newOpts = [...formData.options];
                      newOpts[i] = e.target.value;
                      setFormData({...formData, options: newOpts});
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm focus:border-red-600 outline-none text-zinc-200"
                    required
                  />
                ))}
                <div className="pt-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Correct Answer Index (0-3)</label>
                  <input 
                    type="number"
                    min="0" max="3"
                    value={formData.answer}
                    onChange={e => setFormData({...formData, answer: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm focus:border-blue-600 outline-none text-zinc-200"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Correct Answer / Reference</label>
                <textarea 
                  value={formData.answer}
                  onChange={e => setFormData({...formData, answer: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm h-full min-h-[200px] focus:border-red-600 outline-none text-zinc-200 font-mono"
                  placeholder="Paste reference answer or code snippet..."
                  required
                />
              </div>
            )}
            
            <button 
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl shadow-xl shadow-red-600/20 transition-all uppercase tracking-widest text-sm translate-y-2"
            >
              {editingQuestion ? 'Update Question' : 'Deploy Question'}
            </button>
            {editingQuestion && (
              <button 
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="w-full bg-zinc-800 text-zinc-400 font-bold py-2 rounded-xl mt-2 text-[10px] uppercase tracking-widest"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="space-y-6">
        <h2 className="text-sm font-black text-zinc-500 uppercase tracking-[0.3em]">Direct Repository Control</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {questions.map(q => (
            <div key={q.id} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-all group relative overflow-hidden flex flex-col justify-between h-full">
               <div className="absolute top-0 right-0 p-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(q)}
                    className="w-8 h-8 rounded-lg bg-zinc-800 text-blue-400 flex items-center justify-center border border-zinc-700 hover:bg-blue-600 hover:text-white transition-all shadow-lg"
                  >
                    ✎
                  </button>
                  <button 
                    onClick={() => handleDelete(q.id)}
                    className="w-8 h-8 rounded-lg bg-zinc-800 text-red-500 flex items-center justify-center border border-zinc-700 hover:bg-red-600 hover:text-white transition-all shadow-lg"
                  >
                    ×
                  </button>
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{q.type}</span>
                    <span className="text-[10px] font-black bg-zinc-800 px-2 py-1 rounded text-zinc-400">{q.difficulty}</span>
                  </div>
                  <p className="font-bold text-zinc-200 line-clamp-3 leading-relaxed">{q.content}</p>
               </div>

                <div className="pt-6 flex justify-between items-center mt-auto">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{q.marks} PTS / {q.time_limit}S</span>
                  <span className="text-[10px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase">Round {q.round || 'N/A'}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
                </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
