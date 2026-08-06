import React from 'react';
import { BookOpen, GraduationCap, Target, TrendingUp, Compass, Award } from 'lucide-react';

export const BackgroundEffects = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      <div className="absolute inset-0 career-bg-pattern opacity-50 dark:opacity-100"></div>
      <div className="absolute inset-0 gradient-mesh opacity-50 dark:opacity-70"></div>
      
      {/* Floating Icons */}
      <div className="absolute top-[10%] left-[15%] text-slate-800 dark:text-slate-100 floating-icon" style={{ animationDelay: '0s' }}>
        <GraduationCap size={120} />
      </div>
      <div className="absolute top-[60%] left-[5%] text-slate-800 dark:text-slate-100 floating-icon" style={{ animationDelay: '2s', animationDuration: '18s' }}>
        <BookOpen size={90} />
      </div>
      <div className="absolute top-[20%] right-[10%] text-slate-800 dark:text-slate-100 floating-icon" style={{ animationDelay: '4s', animationDuration: '22s' }}>
        <Target size={150} />
      </div>
      <div className="absolute top-[70%] right-[15%] text-slate-800 dark:text-slate-100 floating-icon" style={{ animationDelay: '1s', animationDuration: '20s' }}>
        <TrendingUp size={110} />
      </div>
      <div className="absolute top-[40%] left-[40%] text-slate-800 dark:text-slate-100 floating-icon" style={{ animationDelay: '6s', animationDuration: '25s' }}>
        <Compass size={140} />
      </div>
      <div className="absolute top-[85%] left-[50%] text-slate-800 dark:text-slate-100 floating-icon" style={{ animationDelay: '3s', animationDuration: '19s' }}>
        <Award size={100} />
      </div>
    </div>
  );
};
