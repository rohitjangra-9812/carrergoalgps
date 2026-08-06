import React, { useState } from 'react';
import { Landmark, Briefcase, GraduationCap, Building, ExternalLink, Calendar, Search, MapPin, CheckSquare, Square, ChevronDown, ChevronUp, FileText, CheckCircle2 } from 'lucide-react';

const examCategories = ['All', 'Government (UPSC/State)', 'Banking & Finance', 'Engineering & Tech', 'Medical', 'Management', 'Corporate Screening'];

const mockExams = [
  { 
    id: 1, 
    title: 'UPSC Civil Services Examination (CSE)', 
    type: 'Government (UPSC/State)', 
    level: 'National', 
    status: 'Upcoming', 
    date: 'May 24, 2026 (Expected)', 
    icon: Landmark,
    applicationStatus: 'Notification expected in Feb 2026',
    timeline: 'Prelims: May 2026 | Mains: Sep 2026 | Interview: Jan-Mar 2027',
    selectionProcess: [
      'Stage 1: Preliminary Exam (Objective - GS & CSAT)',
      'Stage 2: Mains Exam (Descriptive - 9 Papers)',
      'Stage 3: Personality Test (Interview)'
    ],
    tags: ['IAS', 'IPS', 'IFS', 'Civil Services']
  },
  { 
    id: 2, 
    title: 'SSC Combined Graduate Level (CGL)', 
    type: 'Government (UPSC/State)', 
    level: 'National', 
    status: 'Ongoing', 
    date: 'August-September 2026', 
    icon: Landmark,
    applicationStatus: 'Registration closes July 2026',
    timeline: 'Tier 1: Aug/Sep 2026 | Tier 2: Dec 2026',
    selectionProcess: [
      'Tier 1: CBT Objective (Qualifying)',
      'Tier 2: CBT Objective (Merit determining)',
      'Document Verification'
    ],
    tags: ['Group B', 'Group C', 'Inspector', 'Assistant']
  },
  { 
    id: 3, 
    title: 'SBI Probationary Officer (PO)', 
    type: 'Banking & Finance', 
    level: 'National', 
    status: 'Announced', 
    date: 'November 2026', 
    icon: Briefcase,
    applicationStatus: 'Registration starts Sep 2026',
    timeline: 'Prelims: Nov 2026 | Mains: Dec 2026 | Interview: Feb 2027',
    selectionProcess: [
      'Phase 1: Preliminary Exam (Objective)',
      'Phase 2: Mains Exam (Objective + Descriptive)',
      'Phase 3: Psychometric Test, Group Exercise & Interview'
    ],
    tags: ['Banking', 'PO', 'PSU Bank']
  },
  { 
    id: 4, 
    title: 'RBI Grade B Officer', 
    type: 'Banking & Finance', 
    level: 'National', 
    status: 'Expected', 
    date: 'September 2026', 
    icon: Briefcase,
    applicationStatus: 'Notification expected July 2026',
    timeline: 'Phase 1: Sep 2026 | Phase 2: Oct 2026 | Interview: Dec 2026',
    selectionProcess: [
      'Phase 1: Online Objective Exam',
      'Phase 2: Online Objective & Descriptive Exam (Economics, Finance, Management)',
      'Phase 3: Interview'
    ],
    tags: ['Central Bank', 'Regulatory', 'Grade B']
  },
  { 
    id: 5, 
    title: 'Joint Entrance Examination (JEE Main)', 
    type: 'Engineering & Tech', 
    level: 'National', 
    status: 'Ongoing', 
    date: 'Jan/April 2026', 
    icon: GraduationCap,
    applicationStatus: 'Session 2 Registration Open till March 2026',
    timeline: 'Session 1: Jan 2026 | Session 2: Apr 2026 | JEE Advanced: May 2026',
    selectionProcess: [
      'Paper 1: B.E./B.Tech (Physics, Chemistry, Math)',
      'Paper 2A: B.Arch',
      'Paper 2B: B.Planning',
      'JoSAA Counseling for NIT/IIIT/GFTI'
    ],
    tags: ['Engineering', 'IIT', 'NIT', 'B.Tech']
  },
  { 
    id: 6, 
    title: 'National Eligibility cum Entrance Test (NEET UG)', 
    type: 'Medical', 
    level: 'National', 
    status: 'Upcoming', 
    date: 'May 3, 2026', 
    icon: GraduationCap,
    applicationStatus: 'Registration expected in Feb 2026',
    timeline: 'Exam: May 3, 2026 | Results: June 2026',
    selectionProcess: [
      'Offline Pen & Paper Test (Physics, Chemistry, Botany, Zoology)',
      'MCC Counseling for 15% AIQ Seats',
      'State Counseling for 85% State Quota Seats'
    ],
    tags: ['Medical', 'MBBS', 'BDS', 'Doctor']
  },
  { 
    id: 7, 
    title: 'Common Admission Test (CAT)', 
    type: 'Management', 
    level: 'National', 
    status: 'Expected', 
    date: 'November 29, 2026', 
    icon: GraduationCap,
    applicationStatus: 'Registration starts August 2026',
    timeline: 'Registration: Aug-Sep | Exam: Nov 2026 | Results: Jan 2027',
    selectionProcess: [
      'CAT Computer Based Test (VARC, DILR, QA)',
      'Written Ability Test (WAT)',
      'Group Discussion (GD) & Personal Interview (PI)'
    ],
    tags: ['MBA', 'IIM', 'Management']
  },
  { 
    id: 8, 
    title: 'TCS NQT (National Qualifier Test)', 
    type: 'Corporate Screening', 
    level: 'Private', 
    status: 'Rolling', 
    date: 'Every Quarter', 
    icon: Building,
    applicationStatus: 'Applications Open for Q1 2026',
    timeline: 'Ongoing continuous assessment throughout the year',
    selectionProcess: [
      'Foundation Section (Numerical, Verbal, Reasoning)',
      'Advanced Section (Advanced Quant, Coding logic)',
      'Technical & HR Interview for shortlisted candidates'
    ],
    tags: ['IT Jobs', 'TCS', 'Fresher Hiring']
  }
];

const mockInstitutions = [
  { id: 1, name: 'Vajiram & Ravi', target: 'Government (UPSC/State)', location: 'New Delhi (Offline/Online)', rating: 4.8 },
  { id: 2, name: 'FIITJEE South Delhi', target: 'Engineering & Tech', location: 'New Delhi', rating: 4.6 },
  { id: 3, name: 'Allen Career Institute', target: 'Medical', location: 'Kota / All India', rating: 4.9 },
  { id: 4, name: 'TIME (Triumphant Institute)', target: 'Management', location: 'Multiple Centers', rating: 4.5 },
  { id: 5, name: 'Career Power', target: 'Banking & Finance', location: 'Online/Offline Hubs', rating: 4.3 },
];

export const ExamDirectory = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInstitutions, setShowInstitutions] = useState(false);
  const [expandedExamId, setExpandedExamId] = useState<number | null>(null);

  const filteredExams = mockExams.filter(exam => {
    const matchesCat = activeCategory === 'All' || exam.type === activeCategory;
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredInstitutions = mockInstitutions.filter(inst => {
    return activeCategory === 'All' || inst.target === activeCategory;
  });

  const toggleExpand = (id: number) => {
    setExpandedExamId(prev => prev === id ? null : id);
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm gap-4">
        <div className="flex items-center gap-3 text-cyan-600 dark:text-cyan-400">
          <Landmark size={28} />
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Exam Directory</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Comprehensive tracker for Gov, Entrance, and Corporate exams.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={() => setShowInstitutions(!showInstitutions)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors shrink-0"
          >
            {showInstitutions ? <CheckSquare size={18} className="text-cyan-500" /> : <Square size={18} />}
            Top Institutions Nearby
          </button>
          <div className="relative w-full md:w-64 shrink-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search exams..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-slate-200"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {examCategories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              activeCategory === cat 
                ? 'bg-cyan-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {showInstitutions && (
        <div className="bg-cyan-50/50 dark:bg-cyan-900/10 border border-cyan-100 dark:border-cyan-900/30 p-5 rounded-xl flex flex-col gap-4">
          <div className="flex items-center gap-2 text-cyan-800 dark:text-cyan-300 font-bold border-b border-cyan-200 dark:border-cyan-800 pb-2">
            <MapPin size={18} />
            <h3>Recommended Coaching & Academies</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredInstitutions.length > 0 ? filteredInstitutions.map(inst => (
              <div key={inst.id} className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-cyan-100 dark:border-cyan-800/50 flex flex-col gap-1 shadow-sm">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{inst.name}</h4>
                <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400">{inst.target}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1"><MapPin size={10} /> {inst.location}</span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded">★ {inst.rating}</span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-500 italic py-4">No top institutions found matching this category in your area.</p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {filteredExams.map(exam => {
          const isExpanded = expandedExamId === exam.id;
          return (
            <div 
              key={exam.id} 
              className={`bg-white dark:bg-slate-900 rounded-xl border transition-all duration-300 overflow-hidden ${
                isExpanded ? 'border-cyan-400 dark:border-cyan-600 shadow-md' : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-cyan-300 dark:hover:border-cyan-800'
              }`}
            >
              <div 
                className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                onClick={() => toggleExpand(exam.id)}
              >
                <div className="flex items-start md:items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                    <exam.icon size={24} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{exam.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        exam.status === 'Ongoing' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        exam.status === 'Upcoming' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {exam.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{exam.type} • {exam.level}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 ml-16 md:ml-0">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    <Calendar size={16} className="text-slate-400" />
                    {exam.date}
                  </div>
                  {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                    
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 tracking-wider mb-2 block">Registration Status</span>
                        <div className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-cyan-500" />
                          {exam.applicationStatus || 'Information not available'}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 tracking-wider mb-2 block">Detailed Timeline</span>
                        <div className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                          {exam.timeline || 'Schedule to be announced'}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 tracking-wider mb-2 block">Category Tags</span>
                        <div className="flex flex-wrap gap-2">
                          {exam.tags?.map(tag => (
                            <span key={tag} className="text-xs bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md font-semibold">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="bg-cyan-50 dark:bg-cyan-950/40 p-4 rounded-xl border border-cyan-100 dark:border-cyan-900/50 h-full">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-cyan-200 dark:border-cyan-800/50">
                          <FileText size={18} className="text-cyan-600 dark:text-cyan-400" />
                          <h4 className="font-bold text-cyan-900 dark:text-cyan-300">Selection Process</h4>
                        </div>
                        <ul className="space-y-3">
                          {exam.selectionProcess?.map((step, i) => (
                            <li key={i} className="text-sm text-cyan-900/80 dark:text-cyan-200/80 flex items-start gap-2 font-medium">
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-200 dark:bg-cyan-800 text-cyan-800 dark:text-cyan-200 text-xs font-bold shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {filteredExams.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No exams found matching your criteria.
        </div>
      )}
    </div>
  );
};
