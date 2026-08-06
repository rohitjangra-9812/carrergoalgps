import React, { useState } from 'react';
import { FileText, Sparkles, UploadCloud, ChevronRight, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

export const ResumeRebrander = () => {
  const [inputText, setInputText] = useState('Served as an Infantry Platoon Commander for 6 years. Responsible for logistics, training 40 soldiers, and managing tactical operations in forward areas.');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const processResume = () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    
    // Simulate AI parsing and mapping
    setTimeout(() => {
      setResult({
        civilianSummary: "Operations & Logistics Manager with 6+ years of leadership experience. Proven track record in cross-functional team leadership, strategic planning, and supply chain optimization in high-stakes environments.",
        translatedBullets: [
          { old: "Served as an Infantry Platoon Commander for 6 years.", new: "Led cross-functional teams of 40+ personnel to execute strategic objectives over a 6-year tenure." },
          { old: "Responsible for logistics", new: "Managed end-to-end supply chain and resource allocation in austere environments with 100% operational readiness." },
          { old: "training 40 soldiers", new: "Developed and implemented comprehensive training programs, improving team performance metrics and compliance." },
          { old: "managing tactical operations in forward areas.", new: "Spearheaded risk management and crisis response strategies in high-pressure, dynamic operational zones." }
        ],
        gapAnalysis: [
          { skill: 'Data Analytics / Tableau', type: 'Missing', recommendation: 'Google Data Analytics Professional Certificate' },
          { skill: 'Agile / Scrum', type: 'Missing', recommendation: 'Certified ScrumMaster (CSM)' },
          { skill: 'PMP Certification', type: 'Recommended', recommendation: 'Leverage military experience to directly apply for PMP.' }
        ]
      });
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="flex-1 p-4 md:p-8 w-full max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
          <FileText size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Resume Rebrander</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Translate military or non-traditional experience into modern corporate standards.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Input Experience (Paste Resume or describe roles)</h3>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <UploadCloud size={18} />
            </button>
          </div>
          <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-64 p-5 bg-transparent border-none outline-none resize-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
            placeholder="Paste your past roles, military jargon, or outdated resume bullets here..."
          ></textarea>
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <button 
              onClick={processResume}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Parsing...</>
              ) : (
                <><Sparkles size={18} /> Rebrand My Experience</>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {!result && !isProcessing && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 flex flex-col items-center justify-center text-center h-full text-slate-500">
              <FileText size={48} className="opacity-20 mb-4" />
              <p className="font-medium text-lg text-slate-400">Waiting for input...</p>
              <p className="text-sm mt-2 max-w-sm">The AI will analyze your text, remove jargon, generate corporate-friendly bullets, and identify skill gaps.</p>
            </div>
          )}

          {isProcessing && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 flex flex-col items-center justify-center text-center h-full">
               <Sparkles size={48} className="text-blue-500 animate-pulse mb-4" />
               <p className="font-bold text-slate-700 dark:text-slate-300">Translating terminology and mapping skills...</p>
            </div>
          )}

          {result && !isProcessing && (
            <div className="flex flex-col gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500"/> Rebranded Summary</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {result.civilianSummary}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col gap-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Sparkles size={14} className="text-blue-500"/> Optimized Bullet Points</h3>
                {result.translatedBullets.map((bullet: any, idx: number) => (
                  <div key={idx} className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-500 line-through">{bullet.old}</div>
                    <div className="flex gap-2 text-sm text-slate-800 dark:text-slate-200 font-medium">
                      <ArrowRight size={16} className="text-blue-500 shrink-0 mt-0.5" />
                      {bullet.new}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2"><AlertTriangle size={14} className="text-amber-500"/> Gap Analysis & Micro-Certs</h3>
                <div className="flex flex-col gap-3">
                  {result.gapAnalysis.map((gap: any, idx: number) => (
                    <div key={idx} className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 last:pb-0">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{gap.skill}</div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <ChevronRight size={12}/> Recommendation: {gap.recommendation}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${gap.type === 'Missing' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                        {gap.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
