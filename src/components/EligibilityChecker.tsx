import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';

interface ExamCriteria {
  name: string;
  minAge: number;
  maxAge: number;
  qualifications: string[];
  description: string;
}

const examsCriteria: ExamCriteria[] = [
  {
    name: 'UPSC Civil Services (IAS/IPS)',
    minAge: 21,
    maxAge: 32,
    qualifications: ["Bachelor's Degree (Any Stream)"],
    description: "The Civil Services Examination (CSE) is a national competitive examination in India conducted by the Union Public Service Commission."
  },
  {
    name: 'SSC CGL',
    minAge: 18,
    maxAge: 30,
    qualifications: ["Bachelor's Degree (Any Stream)"],
    description: "Staff Selection Commission - Combined Graduate Level Examination, often referred to as SSC CGL."
  },
  {
    name: 'SSC CHSL',
    minAge: 18,
    maxAge: 27,
    qualifications: ["12th Pass"],
    description: "Staff Selection Commission - Combined Higher Secondary Level Examination."
  },
  {
    name: 'SBI PO',
    minAge: 21,
    maxAge: 30,
    qualifications: ["Bachelor's Degree (Any Stream)"],
    description: "State Bank of India Probationary Officer Exam."
  },
  {
    name: 'IBPS PO',
    minAge: 20,
    maxAge: 30,
    qualifications: ["Bachelor's Degree (Any Stream)"],
    description: "Institute of Banking Personnel Selection Probationary Officer Exam."
  },
  {
    name: 'RRB NTPC',
    minAge: 18,
    maxAge: 30,
    qualifications: ["12th Pass", "Bachelor's Degree (Any Stream)"],
    description: "Railway Recruitment Board Non-Technical Popular Categories."
  },
  {
    name: 'NDA',
    minAge: 16.5,
    maxAge: 19.5,
    qualifications: ["12th Pass (PCM for Air Force/Navy)", "12th Pass (Any for Army)"],
    description: "National Defence Academy Examination."
  },
  {
    name: 'CDS',
    minAge: 19,
    maxAge: 25,
    qualifications: ["Bachelor's Degree (Any Stream)", "Engineering Degree (Navy)"],
    description: "Combined Defence Services Examination."
  },
  {
    name: 'CTET',
    minAge: 18,
    maxAge: 0, // No upper limit usually
    qualifications: ["B.Ed", "D.El.Ed"],
    description: "Central Teacher Eligibility Test."
  }
];

const availableQualifications = [
  "10th Pass",
  "12th Pass",
  "12th Pass (PCM for Air Force/Navy)",
  "12th Pass (Any for Army)",
  "Bachelor's Degree (Any Stream)",
  "Engineering Degree (Navy)",
  "B.Ed",
  "D.El.Ed",
  "Post Graduation"
];

export const EligibilityChecker: React.FC = () => {
  const [age, setAge] = useState<number | ''>('');
  const [qualification, setQualification] = useState<string>('');
  const [targetExam, setTargetExam] = useState<string>('');
  const [results, setResults] = useState<{exam: ExamCriteria, isEligible: boolean, reason?: string}[] | null>(null);

  const checkEligibility = () => {
    if (!age || !qualification) return;

    let filteredExams = examsCriteria;
    if (targetExam) {
      filteredExams = examsCriteria.filter(exam => exam.name.toLowerCase().includes(targetExam.toLowerCase()));
    }

    const ageNum = Number(age);
    
    const calculatedResults = filteredExams.map(exam => {
      let isEligible = true;
      let reason = '';

      if (ageNum < exam.minAge) {
        isEligible = false;
        reason = `You must be at least ${exam.minAge} years old.`;
      } else if (exam.maxAge !== 0 && ageNum > exam.maxAge) {
        isEligible = false;
        reason = `You exceed the maximum age limit of ${exam.maxAge} years.`;
      } else if (!exam.qualifications.includes(qualification) && !exam.qualifications.some(q => q.includes("Any Stream") && qualification.includes("Bachelor's"))) {
          // Simplistic matching for demo.
          isEligible = false;
          reason = `Required qualification: ${exam.qualifications.join(' OR ')}.`;
      }

      return { exam, isEligible, reason };
    });

    setResults(calculatedResults);
  };

  return (
    <div className="flex-1 w-full flex flex-col p-4 overflow-y-auto items-center">
      <div className="w-full max-w-4xl flex flex-col gap-6 my-8">
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl text-white">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <CheckCircle className="text-emerald-400" size={28} />
            <h2 className="text-2xl font-bold">Exam Eligibility Checker</h2>
          </div>
          
          <p className="text-slate-400 mb-8">
            Select your highest qualification and current age to discover which government and competitive exams you are eligible for, or check your eligibility for a specific exam.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-300">Age</label>
              <input 
                type="number" 
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 21"
                className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-300">Highest Qualification</label>
              <select 
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="" disabled>Select Qualification</option>
                {availableQualifications.map(q => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-300">Target Exam (Optional)</label>
              <input 
                type="text" 
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                placeholder="e.g. UPSC, SSC"
                className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>
          
          <button 
            onClick={checkEligibility}
            disabled={!age || !qualification}
            className={`w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition ${
              !age || !qualification ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            <Search size={20} />
            Check Eligibility
          </button>
        </div>

        {results && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              {results.length} {results.length === 1 ? 'Exam' : 'Exams'} Found
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              {results.map((result, idx) => (
                <div key={idx} className={`p-6 rounded-xl border ${result.isEligible ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800/30'}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">{result.exam.name}</h4>
                        {result.isEligible ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-1 rounded">
                            <CheckCircle size={14} /> Eligible
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 dark:bg-rose-500/20 dark:text-rose-400 px-2 py-1 rounded">
                            <XCircle size={14} /> Not Eligible
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{result.exam.description}</p>
                      
                      {!result.isEligible && (
                        <div className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400 font-medium">
                          <AlertCircle size={16} />
                          {result.reason}
                        </div>
                      )}
                      
                      {result.isEligible && (
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                          <span className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">
                            <Calendar size={14} /> Age: {result.exam.minAge} - {result.exam.maxAge || 'No limit'}
                          </span>
                          <span className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">
                            Req: {result.exam.qualifications[0]} {result.exam.qualifications.length > 1 ? `+${result.exam.qualifications.length - 1} more` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {results.length === 0 && (
                <div className="text-center p-8 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500">
                  No exams found matching the criteria.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
