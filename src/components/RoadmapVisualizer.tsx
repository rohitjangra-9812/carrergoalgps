import React from 'react';
import { Target, Compass, BookOpen, Briefcase, ChevronRight, CheckCircle } from 'lucide-react';

export const RoadmapVisualizer = ({ profile }: { profile: any }) => {
  if (!profile) return null;

  const stages = [
    {
      id: 1,
      title: 'Stage 1: Foundation',
      icon: <Compass size={24} />,
      status: 'completed',
      desc: profile.stream ? `Background in ${profile.stream}` : 'Assessing Background'
    },
    {
      id: 2,
      title: 'Stage 2: Preparation',
      icon: <BookOpen size={24} />,
      status: 'active',
      desc: profile.interests ? `Focusing on ${profile.interests}` : 'Skill Building'
    },
    {
      id: 3,
      title: 'Stage 3: Transition',
      icon: <Briefcase size={24} />,
      status: 'upcoming',
      desc: 'Internships & Projects'
    },
    {
      id: 4,
      title: 'Stage 4: Destination',
      icon: <Target size={24} />,
      status: 'upcoming',
      desc: profile.target || 'Ultimate Career Goal'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm mt-6 mb-6">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
        <Target size={20} className="text-indigo-500" /> Interactive 4-Stage Timeline
      </h3>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative">
        <div className="absolute left-[28px] top-12 bottom-12 md:left-12 md:right-12 md:top-[28px] md:bottom-auto w-1 md:w-auto md:h-1 bg-slate-200 dark:bg-slate-800 z-0 hidden md:block"></div>
        
        {stages.map((stage, idx) => (
          <div key={stage.id} className="relative z-10 flex flex-col items-center gap-3 w-full md:w-1/4 group cursor-pointer p-4 md:p-0">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-110 ${
              stage.status === 'completed' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-2 border-emerald-500' :
              stage.status === 'active' ? 'bg-indigo-600 text-white shadow-indigo-500/30 ring-4 ring-indigo-500/20' :
              'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border-2 border-slate-200 dark:border-slate-700'
            }`}>
              {stage.status === 'completed' ? <CheckCircle size={24} /> : stage.icon}
            </div>
            
            <div className="text-center">
              <div className={`font-bold text-sm ${stage.status === 'active' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>{stage.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[150px] mx-auto">{stage.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
