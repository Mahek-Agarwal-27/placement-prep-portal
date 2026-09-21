import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import resumeService from '../services/resumeService';
import { 
  FileText, 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  FileCheck, 
  Target, 
  Lightbulb, 
  Layers, 
  Loader2, 
  ArrowRight,
  History,
  X 
} from 'lucide-react';

const ANALYSIS_STEPS = [
  { id: 1, label: 'Uploading PDF resume...',       icon: Upload },
  { id: 2, label: 'Extracting text structure...',  icon: FileText },
  { id: 3, label: 'Gemini AI evaluation...',        icon: Sparkles },
  { id: 4, label: 'Calculating ATS score...',     icon: Target },
  { id: 5, label: 'Saving analysis record...',     icon: FileCheck },
];

const ResumeAnalyzerPage = () => {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Upload State
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  
  // View State (currently viewed analysis)
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [showHistoryMobile, setShowHistoryMobile] = useState(false);
  
  const fileInputRef = useRef(null);
  const stepTimerRef = useRef(null);

  const startStepProgress = () => {
    setCurrentStep(1);
    let step = 1;
    const delays = [600, 1200, null, null, null];
    const advance = () => {
      if (step < 3) {
        step++;
        setCurrentStep(step);
        if (delays[step - 1] !== null) {
          stepTimerRef.current = setTimeout(advance, delays[step - 1]);
        }
      }
    };
    stepTimerRef.current = setTimeout(advance, delays[0]);
  };

  const finishStepProgress = async () => {
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    setCurrentStep(3);
    await new Promise(r => setTimeout(r, 400));
    setCurrentStep(4);
    await new Promise(r => setTimeout(r, 400));
    setCurrentStep(5);
    await new Promise(r => setTimeout(r, 300));
    setCurrentStep(0);
  };

  const resetStepProgress = () => {
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    setCurrentStep(0);
  };

  const fetchHistory = async () => {
    try {
      const res = await resumeService.getResumes();
      if (res.success) {
        setHistory(res.data);
      }
    } catch (err) {
      console.error(err);
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
      setError('Only PDF files are allowed.');
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
    startStepProgress();
    
    const formData = new FormData();
    formData.append('resume', file);
    if (jobDescription.trim()) {
      formData.append('jobDescription', jobDescription);
    }

    try {
      const res = await resumeService.analyzeResume(formData);
      if (res.success) {
        await finishStepProgress();
        setActiveAnalysis(res.data);
        fetchHistory();
        setFile(null);
        setJobDescription('');
      }
    } catch (e) {
      resetStepProgress();
      setError(e.response?.data?.message || e.message || 'Failed to analyze resume.');
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

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL resume scans?')) return;
    try {
      await resumeService.clearAll();
      setActiveAnalysis(null);
      fetchHistory();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFE9FE] flex text-[#1A1A2E] font-sans antialiased h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />

      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Mobile History Backdrop Overlay */}
        {showHistoryMobile && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden animate-fade-in"
            onClick={() => setShowHistoryMobile(false)}
          />
        )}

        {/* Left Sidebar: Scan History */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 transition-transform duration-300 ease-in-out md:static md:translate-x-0 overflow-y-auto ${
          showHistoryMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}>
          <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-2">
            <button 
              onClick={() => { setActiveAnalysis(null); setShowHistoryMobile(false); }} 
              className="btn-primary flex-1 flex items-center justify-center gap-2 text-xs py-2.5"
            >
              <Plus className="w-4 h-4" /> New Resume Scan
            </button>
            <button
              onClick={() => setShowHistoryMobile(false)}
              className="md:hidden p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              title="Close history"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-4 flex-1">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scan History</h3>
              {history.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Clear all past scans"
                >
                  <Trash2 className="w-3 h-3" /> Clear All
                </button>
              )}
            </div>
            {loadingHistory ? (
              <div className="text-center py-6 text-xs text-slate-400">Loading history...</div>
            ) : history.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">No previous scans.</div>
            ) : (
              <div className="space-y-2">
                {history.map(item => (
                  <button 
                    key={item._id}
                    onClick={() => { setActiveAnalysis(item); setShowHistoryMobile(false); }}
                    className={`w-full text-left p-3 rounded-xl transition-all border flex flex-col gap-1.5 relative group ${
                      activeAnalysis?._id === item._id 
                        ? 'bg-blue-50/70 border-blue-200' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center pr-6">
                      <span className="text-xs font-semibold text-slate-900 truncate w-full">{item.fileName}</span>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        item.atsScore >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                        item.atsScore >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {item.atsScore}%
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex justify-between w-full">
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      {item.jobDescription && <span className="text-purple-600 font-medium">Targeted</span>}
                    </div>
                    
                    {/* Delete Button */}
                    <div 
                      onClick={(e) => handleDelete(item._id, e)}
                      className="absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative bg-[#EFE9FE]/30">
          
          {!activeAnalysis ? (
            isAnalyzing ? (
              /* Step Progress Widget */
              <div className="max-w-md mx-auto my-12 bg-white border border-purple-100 p-8 rounded-3xl shadow-sm text-center space-y-6 animate-fade-in">
                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-full bg-purple-50 text-[#6C47FF] border border-purple-100 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1A1A2E]">Resume Intelligence AI</h2>
                  <p className="text-xs text-gray-500 mt-1">Analyzing content & keywords with Gemini AI...</p>
                </div>
                
                <div className="space-y-2.5 text-left border-t border-purple-100 pt-5">
                  {ANALYSIS_STEPS.map((step) => {
                    const StepIcon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    return (
                      <div key={step.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all text-xs ${
                        isActive ? 'bg-purple-50/80 border-purple-200 text-purple-900 font-bold' :
                        isCompleted ? 'bg-slate-50 border-purple-100 text-slate-700' : 'bg-white border-transparent text-slate-400 opacity-60'
                      }`}>
                        <div className="flex items-center gap-2.5">
                          <StepIcon className={`w-4 h-4 ${isActive ? 'text-[#6C47FF]' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span>{step.label}</span>
                        </div>
                        <div>
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : isActive ? (
                            <span className="w-2 h-2 bg-[#6C47FF] rounded-full animate-ping"></span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Upload Form UI */
              <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6 animate-fade-in">
                
                {/* Top Row: AI Resume Intelligence Pill on Left & Past Scans on Right (Mobile), Centered on Desktop */}
                <div className="flex items-center justify-between md:justify-center gap-3 w-full">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-100/70 border border-purple-200 text-[#6C47FF] text-xs font-bold shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-[#6C47FF]" /> AI Resume Intelligence
                  </div>

                  <button
                    onClick={() => setShowHistoryMobile(true)}
                    className="md:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-700 bg-white border border-purple-200 rounded-xl shadow-xs hover:bg-purple-50 shrink-0"
                    title="View Past Scans"
                  >
                    <History className="w-3.5 h-3.5 text-[#6C47FF]" /> Past Scans ({history.length})
                  </button>
                </div>

                {/* Main Heading & Subtitle */}
                <div className="text-center space-y-1.5 pt-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A2E] tracking-tight">Resume Intelligence AI</h1>
                  <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto font-medium">Upload your PDF resume to receive a comprehensive ATS score and AI improvements.</p>
                </div>

                {error && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Upload Box */}
                <div 
                  onDragOver={(e) => !isAnalyzing && handleDragOver(e)}
                  onDrop={(e) => !isAnalyzing && handleDrop(e)}
                  className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center transition-all bg-white shadow-xs ${
                    file 
                      ? 'border-emerald-400 bg-emerald-50/30 cursor-pointer' 
                      : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50/40 cursor-pointer'
                  }`}
                  onClick={() => fileInputRef.current.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="application/pdf" 
                    className="hidden" 
                  />
                  
                  {file ? (
                    <div className="text-center space-y-2">
                      <FileCheck className="w-10 h-10 text-emerald-600 mx-auto" />
                      <p className="font-bold text-xs text-[#1A1A2E]">{file.name}</p>
                      <p className="text-[11px] text-gray-400 font-medium">Click or drop to replace file</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-2.5">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6C47FF] flex items-center justify-center mx-auto border border-purple-100">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#1A1A2E]">Drop your PDF resume here</p>
                        <p className="text-xs text-gray-400 mt-0.5 font-medium">or click to browse files</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Target JD */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Target Job Description (Optional)
                  </label>
                  <textarea 
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full min-h-[110px] p-4 rounded-2xl border border-purple-200 text-xs font-medium outline-none focus:border-[#6C47FF] bg-white resize-y shadow-xs"
                    placeholder="Paste target job description to match required keywords and role skills..."
                  ></textarea>
                </div>

                {/* Submit */}
                <button 
                  onClick={handleAnalyze} 
                  disabled={!file}
                  className="w-full py-3 sm:py-3.5 rounded-2xl bg-[#6C47FF] text-white font-bold text-sm hover:bg-[#5A36EC] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> Analyze Resume with AI
                </button>
              </div>
            )
          ) : (
            /* Results View Dashboard */
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
              
              {/* Top Header Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                    Analysis Completed
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">
                    {activeAnalysis.fileName}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Scanned on {new Date(activeAnalysis.createdAt).toLocaleDateString()}</p>
                </div>

                {/* ATS Circular Score Widget */}
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <div className="relative w-16 h-16 rounded-full border-4 border-purple-200 border-t-purple-600 flex items-center justify-center bg-white font-extrabold text-slate-900 text-lg shadow-sm">
                    {activeAnalysis.atsScore}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">ATS Match Score</p>
                    <p className="text-[11px] text-slate-500">{activeAnalysis.atsScore >= 75 ? 'Strong Match' : 'Optimization Recommended'}</p>
                  </div>
                </div>
              </div>

              {/* Overall Summary Card */}
              {activeAnalysis.feedback?.generalAdvice && (
                <div className="bg-white border border-purple-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-xs font-semibold text-purple-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-purple-600" /> AI Executive Summary
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {activeAnalysis.feedback.generalAdvice}
                  </p>
                </div>
              )}

              {/* Grid 2-Column: Strengths & Missing Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Keyword Matching & Strengths */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                  <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Keyword Alignment & Strengths
                  </h3>
                  <ul className="space-y-2">
                    {activeAnalysis.feedback?.keywordMatching?.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{typeof item === 'string' ? item : item.name || JSON.stringify(item)}</span>
                      </li>
                    ))}
                    {(!activeAnalysis.feedback?.keywordMatching || activeAnalysis.feedback.keywordMatching.length === 0) && (
                      <li className="text-xs text-slate-400">No specific keyword notes provided.</li>
                    )}
                  </ul>
                </div>

                {/* 2. Missing / Recommended Keywords */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                  <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" /> Missing / Recommended Keywords
                  </h3>
                  <ul className="space-y-2">
                    {activeAnalysis.feedback?.missingKeywords?.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-amber-600 font-bold">+</span>
                        <span>{typeof item === 'string' ? item : item.name || JSON.stringify(item)}</span>
                      </li>
                    ))}
                    {(!activeAnalysis.feedback?.missingKeywords || activeAnalysis.feedback.missingKeywords.length === 0) && (
                      <li className="text-xs text-slate-400">No critical keyword gaps identified for this profile.</li>
                    )}
                  </ul>
                </div>

                {/* 3. Bullet Point Improvements */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm md:col-span-2 space-y-3">
                  <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-blue-600" /> Bullet Point Improvements
                  </h3>
                  <div className="space-y-3">
                    {activeAnalysis.feedback?.bulletPoints?.map((item, idx) => {
                      const isStructured = typeof item === 'object' && item !== null && (item.original || item.improved);
                      if (isStructured) {
                        return (
                          <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2 text-xs">
                            {item.original && (
                              <div className="flex items-start gap-2">
                                <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider shrink-0 bg-slate-200/70 px-1.5 py-0.5 rounded mt-0.5">Original</span>
                                <span className="text-slate-600 italic">"{item.original}"</span>
                              </div>
                            )}
                            <div className="flex items-start gap-2 font-medium">
                              <span className="font-semibold text-emerald-700 uppercase text-[10px] tracking-wider shrink-0 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded mt-0.5">Improved</span>
                              <span className="text-slate-900">{item.improved || item.original}</span>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div key={idx} className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                        </div>
                      );
                    })}
                    {(!activeAnalysis.feedback?.bulletPoints || activeAnalysis.feedback.bulletPoints.length === 0) && (
                      <p className="text-xs text-slate-400">No bullet point recommendations provided.</p>
                    )}
                  </div>
                </div>

                {/* 4. Layout & Formatting Audit */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm md:col-span-2 space-y-3">
                  <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-slate-600" /> Layout & Formatting Audit
                  </h3>
                  <ul className="space-y-2">
                    {activeAnalysis.feedback?.formatting?.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-purple-600 font-bold">•</span>
                        <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                      </li>
                    ))}
                    {(!activeAnalysis.feedback?.formatting || activeAnalysis.feedback.formatting.length === 0) && (
                      <li className="text-xs text-slate-400">No formatting issues detected.</li>
                    )}
                  </ul>
                </div>

                {/* 5. Final Action Items */}
                {activeAnalysis.feedback?.actionItems && activeAnalysis.feedback.actionItems.length > 0 && (
                  <div className="bg-white border border-purple-200 rounded-xl p-5 shadow-sm md:col-span-2 space-y-3">
                    <h3 className="text-xs font-semibold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-purple-600" /> Final Action Items
                    </h3>
                    <ul className="space-y-2">
                      {activeAnalysis.feedback.actionItems.map((item, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-start gap-2.5 bg-purple-50/40 p-2.5 rounded-lg border border-purple-100">
                          <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="mt-0.5 text-slate-800">{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>

            </div>
          )}

        </section>
      </main>
      </div>
    </div>
  );
};

export default ResumeAnalyzerPage;
