import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import resumeService from '../services/resumeService';

const ResumeAnalyzerPage = () => {
  const { user, logout } = useAuth();
  
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Upload State
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  
  // View State (currently viewed analysis)
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  
  const fileInputRef = useRef(null);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await resumeService.getResumes();
      if (res.success) {
        setHistory(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setError('');
    } else {
      setFile(null);
      setError('Please select a valid PDF file.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Only PDF files are allowed.');
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload a resume first.');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    
    const formData = new FormData();
    formData.append('resume', file);
    if (jobDescription.trim()) {
      formData.append('jobDescription', jobDescription);
    }

    try {
      const res = await resumeService.analyzeResume(formData);
      if (res.success) {
        setActiveAnalysis(res.data);
        fetchHistory(); // Refresh history
        // Reset form
        setFile(null);
        setJobDescription('');
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to analyze resume. Please check your network and Gemini API key.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this resume record?')) return;
    
    try {
      await resumeService.deleteResume(id);
      if (activeAnalysis?._id === id) {
        setActiveAnalysis(null);
      }
      fetchHistory();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden">
      {/* Navbar */}
      <header className="glass-panel px-6 py-4 flex justify-between items-center shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Link to="/dashboard">
            <Logo />
          </Link>
          <span className="text-xs bg-indigo-950 text-indigo-300 font-semibold px-2 py-0.5 rounded border border-indigo-800">Beta</span>
        </div>
        <nav className="hidden sm:flex items-center gap-5 text-sm font-semibold">
          <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">Dashboard</Link>
          <Link to="/dsa-tracker" className="text-slate-400 hover:text-white transition-colors">DSA Tracker</Link>
          <Link to="/study-planner" className="text-slate-400 hover:text-white transition-colors">Study Planner</Link>
          <Link to="/notes" className="text-slate-400 hover:text-white transition-colors">AI Notes</Link>
          <Link to="/resume-analyzer" className="text-violet-400 border-b-2 border-violet-500 pb-1">Resume Analyzer</Link>
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-slate-300 text-sm hidden md:inline">Hi, <strong className="text-white">{user?.name}</strong></span>
          <button onClick={logout} className="btn-secondary px-4 py-2 text-xs">Sign Out</button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* History Sidebar */}
        <aside className="w-72 border-r border-slate-800 bg-slate-900/40 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-slate-800">
            <button 
              onClick={() => setActiveAnalysis(null)} 
              className="btn-primary w-full justify-center flex items-center gap-2 bg-violet-600 hover:bg-violet-500 border-violet-500 shadow-[0_0_15px_rgba(124,58,237,0.3)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Scan
            </button>
          </div>
          
          <div className="p-4 flex-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-1">Scan History</h3>
            {loadingHistory ? (
              <div className="text-center py-4 text-sm text-slate-500">Loading history...</div>
            ) : history.length === 0 ? (
              <div className="text-center py-4 text-sm text-slate-500">No previous scans.</div>
            ) : (
              <ul className="space-y-2">
                {history.map(item => (
                  <li key={item._id}>
                    <button 
                      onClick={() => setActiveAnalysis(item)}
                      className={`w-full text-left p-3 rounded-xl transition-all border flex flex-col gap-2 relative group ${
                        activeAnalysis?._id === item._id 
                          ? 'bg-violet-500/10 border-violet-500/50' 
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-start pr-6">
                        <span className="text-sm font-semibold text-white truncate w-full">{item.fileName}</span>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                          item.score >= 80 ? 'bg-emerald-950 text-emerald-400' : 
                          item.score >= 50 ? 'bg-amber-950 text-amber-400' : 'bg-rose-950 text-rose-400'
                        }`}>
                          {item.score}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex justify-between w-full">
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        {item.jobDescription && <span className="text-violet-400">Targeted</span>}
                      </div>
                      
                      {/* Delete Button */}
                      <div 
                        onClick={(e) => handleDelete(item._id, e)}
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition-opacity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 overflow-y-auto p-6 md:p-10 relative">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500 rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

          {!activeAnalysis ? (
            // Upload UI
            <div className="max-w-2xl mx-auto space-y-8 animate-fade-in relative z-10">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-3">
                  <span className="text-4xl">🤖</span> AI Resume Analyzer
                </h1>
                <p className="text-slate-400">Upload your PDF resume to receive a comprehensive ATS score, formatting review, and bullet point improvements powered by Gemini AI.</p>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-sm text-center">
                  {error}
                </div>
              )}

              {/* Upload Box */}
              <div 
                onDragOver={(e) => !isAnalyzing && handleDragOver(e)}
                onDrop={(e) => !isAnalyzing && handleDrop(e)}
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all ${
                  isAnalyzing 
                    ? 'border-slate-800 bg-slate-900/10 opacity-50 cursor-not-allowed' 
                    : file 
                      ? 'border-emerald-500 bg-emerald-500/5 cursor-pointer' 
                      : 'border-slate-700 hover:border-violet-500 hover:bg-violet-500/5 cursor-pointer'
                }`}
                onClick={() => !isAnalyzing && fileInputRef.current.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="application/pdf" 
                  className="hidden" 
                  disabled={isAnalyzing}
                />
                
                {file ? (
                  <div className="text-center space-y-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-bold text-emerald-300">{file.name}</p>
                    <p className="text-xs text-slate-500">{isAnalyzing ? 'Uploading file...' : 'Click to change file'}</p>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div>
                      <p className="font-semibold text-white">Drop your PDF resume here</p>
                      <p className="text-sm text-slate-400 mt-1">or click to browse</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Target JD */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Job Description (Optional but Recommended)</label>
                <textarea 
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="input-field min-h-[120px] resize-y"
                  placeholder="Paste the job description here. The AI will analyze how well your resume matches the required skills and keywords."
                  disabled={isAnalyzing}
                ></textarea>
              </div>

              {/* Submit */}
              <button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || !file}
                className="btn-primary w-full justify-center py-4 text-base shadow-[0_0_20px_rgba(124,58,237,0.3)] border-violet-500 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:shadow-none"
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Parsing & Scanning...
                  </div>
                ) : 'Analyze Resume'}
              </button>
            </div>
          ) : (
            // Results Dashboard
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in relative z-10 pb-10">
              
              <div className="flex items-start justify-between border-b border-slate-800 pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    Analysis Results
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">File: <span className="font-semibold text-white">{activeAnalysis.fileName}</span></p>
                  {activeAnalysis.jobDescription && (
                    <span className="inline-block mt-2 text-[10px] bg-violet-950 text-violet-400 font-bold px-2 py-0.5 rounded border border-violet-800">
                      Targeted Analysis
                    </span>
                  )}
                </div>
                
                {/* Score Circle */}
                <div className="flex flex-col items-center">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-lg ${
                    activeAnalysis.score >= 80 ? 'border-emerald-900 border-t-emerald-400 bg-emerald-950/30 text-emerald-400' : 
                    activeAnalysis.score >= 50 ? 'border-amber-900 border-t-amber-400 bg-amber-950/30 text-amber-400' : 
                    'border-rose-900 border-t-rose-400 bg-rose-950/30 text-rose-400'
                  }`}>
                    <span className="text-3xl font-extrabold">{activeAnalysis.score}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-2 font-bold">ATS Match Score</span>
                </div>
              </div>

              {/* General Advice */}
              {activeAnalysis.feedback?.generalAdvice && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="text-violet-400">💡</span> Overall Summary
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {activeAnalysis.feedback.generalAdvice}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Keyword Matching */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="text-emerald-400">🎯</span> Keyword Matching
                  </h3>
                  <ul className="space-y-3">
                    {activeAnalysis.feedback?.keywordMatching?.map((item, idx) => (
                      <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5">•</span> 
                        <span>{item}</span>
                      </li>
                    ))}
                    {(!activeAnalysis.feedback?.keywordMatching || activeAnalysis.feedback.keywordMatching.length === 0) && (
                      <li className="text-sm text-slate-500">No keyword feedback provided.</li>
                    )}
                  </ul>
                </div>

                {/* Bullet Points */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="text-amber-400">⚡</span> Bullet Point Impact
                  </h3>
                  <ul className="space-y-3">
                    {activeAnalysis.feedback?.bulletPoints?.map((item, idx) => (
                      <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span> 
                        <span>{item}</span>
                      </li>
                    ))}
                    {(!activeAnalysis.feedback?.bulletPoints || activeAnalysis.feedback.bulletPoints.length === 0) && (
                      <li className="text-sm text-slate-500">No bullet point feedback provided.</li>
                    )}
                  </ul>
                </div>

                {/* Formatting */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:col-span-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="text-sky-400">📐</span> Layout & Formatting
                  </h3>
                  <ul className="space-y-3">
                    {activeAnalysis.feedback?.formatting?.map((item, idx) => (
                      <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
                        <span className="text-sky-500 mt-0.5">•</span> 
                        <span>{item}</span>
                      </li>
                    ))}
                    {(!activeAnalysis.feedback?.formatting || activeAnalysis.feedback.formatting.length === 0) && (
                      <li className="text-sm text-slate-500">No formatting feedback provided.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ResumeAnalyzerPage;
