import React, { useState, useEffect } from 'react';
import { Newspaper, Target, Clock, AlertCircle, ChevronDown, ChevronUp, RefreshCw, BookOpen, CheckCircle2, TrendingUp } from 'lucide-react';

const newsCategories = ['All', 'National', 'International', 'Economy', 'Science & Tech', 'Environment', 'Defense'];

type NewsItem = {
  id: number;
  title: string;
  category: string;
  date: string;
  tags: string[];
  background: string;
  details: string;
  examPov: {
    targetExams: string[];
    keyTakeaways: string[];
    crucialFacts: string[];
  };
};

const initialMockNews: NewsItem[] = [
  { 
    id: 1, 
    title: 'Union Budget 2026: Key Highlights for Education and Infrastructure', 
    category: 'Economy', 
    date: '10 Mins Ago', 
    tags: ['Economy', 'Polity'],
    background: 'The Union Budget 2026 was presented with a primary focus on boosting digital education infrastructure and large-scale public transportation projects across India.',
    details: 'The Finance Minister allocated ₹1.2 lakh crore for the education sector, a 15% increase from last year. A new "National AI in Education" mission was announced. Infrastructure saw an allocation of ₹11.5 lakh crore, focusing on the National Infrastructure Pipeline (NIP). Furthermore, new tax slabs were introduced under the new regime.',
    examPov: {
      targetExams: ['UPSC CSE', 'RBI Grade B', 'SSC CGL', 'IBPS PO'],
      keyTakeaways: [
        'Education budget increased by 15% to ₹1.2 lakh crore.',
        'Launch of "National AI in Education" mission.',
        'Capital expenditure outlay increased by 11.1%.'
      ],
      crucialFacts: [
        'Fiscal Deficit target set at 4.5% of GDP for FY26-27.',
        'Presented under Article 112 (Annual Financial Statement).'
      ]
    }
  },
  { 
    id: 2, 
    title: 'ISRO Successfully Launches Next-Gen Navigation Satellite NVS-02', 
    category: 'Science & Tech', 
    date: '2 Hours Ago', 
    tags: ['Space Tech', 'Current Affairs'],
    background: 'The NavIC (Navigation with Indian Constellation) system required satellite replacement and augmentation to enhance positioning accuracy and expand coverage.',
    details: 'ISRO launched the NVS-02 satellite using the GSLV-F15 launch vehicle from Sriharikota. The satellite features an indigenous rubidium atomic clock and operates in L1, L5, and S bands. It will provide regional navigation services to India and a region extending up to 1,500 km beyond its borders.',
    examPov: {
      targetExams: ['UPSC Prelims', 'Engineering Services', 'State PSC'],
      keyTakeaways: [
        'NVS-02 augments the existing NavIC constellation.',
        'First in the series to carry indigenous Rubidium atomic clocks.'
      ],
      crucialFacts: [
        'Launch Vehicle used: GSLV (Geosynchronous Satellite Launch Vehicle).',
        'NavIC provides standard positioning service (SPS) and restricted service (RS).'
      ]
    }
  },
  { 
    id: 3, 
    title: 'Global Climate Summit Reaches New Agreement on Carbon Markets', 
    category: 'Environment', 
    date: 'Yesterday', 
    tags: ['Environment', 'IR'],
    background: 'Article 6 of the Paris Agreement, which deals with carbon markets, has long been a sticking point in international climate negotiations due to concerns over double counting.',
    details: 'The latest COP summit concluded with a breakthrough agreement on operationalizing global carbon markets. Countries agreed on strict accounting rules to prevent double counting of emission reductions. A centralized mechanism will be established to govern the trade of carbon credits between nations and private entities.',
    examPov: {
      targetExams: ['UPSC Mains (GS III)', 'State PSC', 'RBI Grade B'],
      keyTakeaways: [
        'Agreement reached on Article 6 of the Paris Agreement.',
        'Strict rules established to prevent double counting of carbon credits.'
      ],
      crucialFacts: [
        'Carbon markets aim to reduce the cost of implementing NDCs by more than half.',
        'Kyoto Protocol previously established the Clean Development Mechanism (CDM).'
      ]
    }
  }
];

const simulatedNewItems: NewsItem[] = [
  {
    id: 101,
    title: 'Supreme Court Issues Landmark Ruling on Environmental Clearances',
    category: 'National',
    date: 'Just Now',
    tags: ['Polity', 'Environment'],
    background: 'The apex court was hearing a batch of petitions regarding environmental clearances for mega infrastructure projects in ecologically sensitive zones like the Western Ghats.',
    details: 'The Supreme Court ruled that a cumulative environmental impact assessment is mandatory before approving infrastructure projects in the Western Ghats and Himalayan regions. The ruling emphasized the "Precautionary Principle" in environmental jurisprudence and directed the MoEFCC to update its EIA notification.',
    examPov: {
      targetExams: ['UPSC CSE (GS II & III)', 'CLAT', 'State PSC'],
      keyTakeaways: [
        'Cumulative EIA made mandatory in ecologically sensitive zones.',
        'Reiteration of the "Precautionary Principle".'
      ],
      crucialFacts: [
        'Article 21 (Right to Life) interpreted to include Right to a Healthy Environment.',
        'Environment Protection Act, 1986 provisions were central to the verdict.'
      ]
    }
  },
  {
    id: 102,
    title: 'RBI Announces New Framework for Digital Lending Apps',
    category: 'Economy',
    date: 'Just Now',
    tags: ['Economy', 'Banking'],
    background: 'The proliferation of unregulated digital lending apps led to customer harassment, data privacy breaches, and predatory lending practices.',
    details: 'The Reserve Bank of India has issued a strict new regulatory framework for Digital Lending Apps (DLAs). All loan disbursements and repayments must now be executed only between the bank accounts of the borrower and the regulated entity (RE). DLAs are prohibited from storing borrower data other than basic minimal data required for operations.',
    examPov: {
      targetExams: ['RBI Grade B', 'IBPS PO', 'SBI PO', 'UPSC Prelims'],
      keyTakeaways: [
        'Direct fund routing between borrower and RE made mandatory.',
        'Strict data privacy norms enforced on Digital Lending Apps.'
      ],
      crucialFacts: [
        'Framework applies to all Commercial Banks, NBFCs, and Co-operative Banks.',
        'Regulated Entities are primarily responsible for the actions of their DLAs.'
      ]
    }
  }
];

export const CurrentAffairs = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [newsList, setNewsList] = useState<NewsItem[]>(initialMockNews);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const [pendingSimulatedItems, setPendingSimulatedItems] = useState([...simulatedNewItems]);

  // Simulate rolling updates every 30 minutes (scaled down to 30 seconds for demo)
  useEffect(() => {
    const timer = setInterval(() => {
      triggerRefresh();
    }, 30000); // 30 seconds for demonstration purposes
    return () => clearInterval(timer);
  }, [pendingSimulatedItems]);

  const triggerRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      if (pendingSimulatedItems.length > 0) {
        const newItem = pendingSimulatedItems[0];
        setNewsList(prev => [newItem, ...prev]);
        setPendingSimulatedItems(prev => prev.slice(1));
      }
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1500);
  };

  const filteredNews = activeCategory === 'All' 
    ? newsList 
    : newsList.filter(news => news.category === activeCategory);

  const toggleExpand = (id: number) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm gap-4">
        <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
          <Newspaper size={28} />
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Daily Knowledge & Current Affairs</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Clock size={14} /> Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <button 
          onClick={triggerRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-indigo-500' : ''} />
          {isRefreshing ? 'Fetching Updates...' : 'Refresh Feed'}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {newsCategories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
              activeCategory === cat 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-900/20' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {filteredNews.map(news => {
          const isExpanded = expandedId === news.id;
          return (
            <div 
              key={news.id} 
              className={`bg-white dark:bg-slate-900 rounded-xl border transition-all duration-300 overflow-hidden ${
                isExpanded ? 'border-indigo-400 dark:border-indigo-600 shadow-md' : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-800'
              }`}
            >
              <div 
                className="p-5 cursor-pointer flex flex-col gap-3"
                onClick={() => toggleExpand(news.id)}
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-2.5 py-1 rounded-md uppercase tracking-wide border border-indigo-100 dark:border-indigo-800/50">
                    {news.category}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      <Clock size={12} /> {news.date}
                    </span>
                    {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                  </div>
                </div>
                
                <h3 className="font-bold text-lg md:text-xl text-slate-800 dark:text-slate-100 leading-snug">
                  {news.title}
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  {news.tags.map(tag => (
                    <span key={tag} className="text-xs bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md font-semibold">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {isExpanded && (
                <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">
                    
                    <div className="lg:col-span-2 space-y-5">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-2">
                          <BookOpen size={16} className="text-indigo-500" /> Context & Background
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                          {news.background}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-2">
                          <AlertCircle size={16} className="text-indigo-500" /> Complete Details
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                          {news.details}
                        </p>
                      </div>
                    </div>

                    <div className="lg:col-span-1">
                      <div className="bg-indigo-50 dark:bg-indigo-950/40 p-5 rounded-xl border border-indigo-100 dark:border-indigo-900/50 h-full">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-indigo-200 dark:border-indigo-800/50">
                          <Target size={20} className="text-indigo-600 dark:text-indigo-400" />
                          <h4 className="font-bold text-indigo-900 dark:text-indigo-300">Exam POV Summary</h4>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-indigo-500 dark:text-indigo-400 tracking-wider mb-1.5 block">Target Exams</span>
                            <div className="flex flex-wrap gap-1.5">
                              {news.examPov.targetExams.map(exam => (
                                <span key={exam} className="text-[10px] font-bold bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded shadow-sm border border-indigo-100 dark:border-indigo-800">
                                  {exam}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-indigo-500 dark:text-indigo-400 tracking-wider mb-2 block">Key Takeaways</span>
                            <ul className="space-y-2">
                              {news.examPov.keyTakeaways.map((point, i) => (
                                <li key={i} className="text-xs text-indigo-900/80 dark:text-indigo-200/80 flex items-start gap-2 leading-tight font-medium">
                                  <TrendingUp size={12} className="text-indigo-500 mt-0.5 shrink-0" />
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-indigo-500 dark:text-indigo-400 tracking-wider mb-2 block">Crucial Facts</span>
                            <ul className="space-y-2">
                              {news.examPov.crucialFacts.map((fact, i) => (
                                <li key={i} className="text-xs text-indigo-900/80 dark:text-indigo-200/80 flex items-start gap-2 leading-tight font-medium">
                                  <CheckCircle2 size={12} className="text-indigo-500 mt-0.5 shrink-0" />
                                  {fact}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {filteredNews.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <Newspaper size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No updates found for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

