import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Briefcase, Award, Shield, BookOpen, Building } from 'lucide-react';

const salaryData = {
  'Civil Services (IAS)': {
    type: 'Government (7th CPC)',
    icon: Award,
    description: 'Premier administrative civil service of the Government of India.',
    allowances: 'DA, HRA, Transport, Government Accommodation, Medical, Vehicle, Subsidized utilities.',
    topDesignations: 'Cabinet Secretary, Chief Secretary, Secretary to Govt of India.',
    progression: [
      { stage: 'Entry (SDM/Under Sec)', min: 10, max: 14, avg: 12, label: 'Level 10 (₹56,100 basic)' },
      { stage: 'Mid (District Mag./Dir)', min: 18, max: 24, avg: 21, label: 'Level 13 (₹1,18,500 basic)' },
      { stage: 'Senior (Sec. to Govt)', min: 30, max: 36, avg: 33, label: 'Level 15/17 (₹2,25,000 basic)' },
    ]
  },
  'Civil Services (IPS)': {
    type: 'Government (7th CPC)',
    icon: Shield,
    description: 'Premier police service of the Government of India.',
    allowances: 'DA, HRA, Transport, Government Accommodation, Medical, Vehicle, Uniform allowance.',
    topDesignations: 'Director General of Police (DGP), Director IB/CBI.',
    progression: [
      { stage: 'Entry (ASP/DSP)', min: 10, max: 13, avg: 11.5, label: 'Level 10 (₹56,100 basic)' },
      { stage: 'Mid (SSP/DIG)', min: 16, max: 22, avg: 19, label: 'Level 13 (₹1,31,100 basic)' },
      { stage: 'Senior (ADGP/DGP)', min: 28, max: 35, avg: 31, label: 'Level 16 (₹2,05,400 basic)' },
    ]
  },
  'Civil Services (IFS)': {
    type: 'Government (7th CPC)',
    icon: Award,
    description: 'Indian Foreign Service, managing India\'s external affairs and diplomacy.',
    allowances: 'Foreign Allowance (very high, varies by country), DA, HRA, Free fully-furnished accommodation abroad, Children\'s education.',
    topDesignations: 'Foreign Secretary, Ambassador/High Commissioner.',
    progression: [
      { stage: 'Entry (Third Sec)', min: 15, max: 30, avg: 20, label: 'Level 10 + Foreign Allow.' },
      { stage: 'Mid (Counsellor)', min: 25, max: 45, avg: 35, label: 'Level 13 + Foreign Allow.' },
      { stage: 'Senior (Ambassador)', min: 40, max: 70, avg: 55, label: 'Level 15/17 + Foreign Allow.' },
    ]
  },
  'Banking (SBI/IBPS PO)': {
    type: 'Banking Sector',
    icon: Building,
    description: 'Probationary Officer in Public Sector Banks, leading to management roles.',
    allowances: 'DA, HRA/Lease Accommodation, CCA, Medical, Travel, Furniture, Loan benefits.',
    topDesignations: 'General Manager, Chief General Manager, Chairman/MD.',
    progression: [
      { stage: 'Entry (PO/Asst Mgr)', min: 8, max: 13, avg: 10.5, label: 'JMGS-I' },
      { stage: 'Mid (Branch/Chief Mgr)', min: 16, max: 25, avg: 20, label: 'SMGS-IV' },
      { stage: 'Senior (GM/CGM)', min: 32, max: 50, avg: 40, label: 'TEGS-VI/VII' },
    ]
  },
  'Banking (RBI Grade B)': {
    type: 'Central Bank',
    icon: Building,
    description: 'Management role in the Reserve Bank of India.',
    allowances: 'DA, HRA, Local allowance, Family allowance, Grade allowance, RBI Housing.',
    topDesignations: 'Executive Director, Deputy Governor.',
    progression: [
      { stage: 'Entry (Manager)', min: 18, max: 24, avg: 21, label: 'Grade B' },
      { stage: 'Mid (General Mgr)', min: 30, max: 45, avg: 37, label: 'Grade D' },
      { stage: 'Senior (CGM/ED)', min: 50, max: 70, avg: 60, label: 'Grade F' },
    ]
  },
  'Defense (NDA/CDS/AFCAT)': {
    type: 'Defense Forces',
    icon: Shield,
    description: 'Commissioned Officer in the Indian Armed Forces (Army/Navy/Air Force).',
    allowances: 'Military Service Pay (MSP), DA, Kit maintenance, Field Area, High Altitude, Flying Pay (AFCAT).',
    topDesignations: 'Lieutenant General, General/Chief of Staff.',
    progression: [
      { stage: 'Entry (Lieutenant)', min: 12, max: 16, avg: 14, label: 'Level 10 (₹56,100 + MSP)' },
      { stage: 'Mid (Lt. Colonel)', min: 20, max: 28, avg: 24, label: 'Level 12A (₹1,21,200 + MSP)' },
      { stage: 'Senior (Major Gen+)', min: 30, max: 42, avg: 36, label: 'Level 14/15 (₹1,44,200+)' },
    ]
  },
  'Engineering (PSU via GATE)': {
    type: 'Public Sector Undertaking',
    icon: Building,
    description: 'Executive Trainee in Maharatna/Navratna PSUs (NTPC, ONGC, BHEL, IOCL).',
    allowances: 'DA, HRA, Cafeteria approach perquisites, PRP (Performance Related Pay), Medical.',
    topDesignations: 'Executive Director, Director, Chairman & Managing Director (CMD).',
    progression: [
      { stage: 'Entry (Exec Trainee)', min: 14, max: 18, avg: 16, label: 'E1 Grade (₹50,000 basic)' },
      { stage: 'Mid (Manager/DGM)', min: 22, max: 32, avg: 27, label: 'E4/E5 Grade (₹90,000+ basic)' },
      { stage: 'Senior (CGM/ED)', min: 40, max: 60, avg: 50, label: 'E8/E9 Grade (₹1,20,000+ basic)' },
    ]
  },
  'Engineering (ISRO/DRDO)': {
    type: 'Govt Research/Scientific',
    icon: Award,
    description: 'Scientist/Engineer in premier space and defense research organizations.',
    allowances: 'DA, HRA, Transport, PRIS (Performance Related Incentive Scheme - ISRO).',
    topDesignations: 'Outstanding Scientist, Distinguished Scientist, Chairman/Secretary.',
    progression: [
      { stage: 'Entry (Scientist C)', min: 11, max: 14, avg: 12.5, label: 'Level 10 (₹56,100 basic)' },
      { stage: 'Mid (Scientist E/F)', min: 18, max: 25, avg: 21.5, label: 'Level 13/13A (₹1,31,100 basic)' },
      { stage: 'Senior (Scientist G/H)', min: 28, max: 36, avg: 32, label: 'Level 14/15 (₹1,44,200 basic)' },
    ]
  },
  'State-Level (State PSC/SDM)': {
    type: 'State Government',
    icon: Building,
    description: 'State Civil Services (UPPSC, BPSC, MPSC, etc.).',
    allowances: 'DA, HRA, Transport, State-specific allowances.',
    topDesignations: 'Promoted to IAS, Special Secretary to State Govt.',
    progression: [
      { stage: 'Entry (SDM/DySP)', min: 8, max: 11, avg: 9.5, label: 'Level 10 (₹56,100 basic)' },
      { stage: 'Mid (ADM/CDO)', min: 14, max: 18, avg: 16, label: 'Level 12 (₹78,800 basic)' },
      { stage: 'Senior (Special Sec)', min: 20, max: 26, avg: 23, label: 'Level 13/13A' },
    ]
  },
  'Teaching (UGC NET - Asst Prof)': {
    type: 'Higher Education (7th CPC)',
    icon: BookOpen,
    description: 'Assistant Professor in Central/State Universities.',
    allowances: 'DA, HRA, Transport, Academic Grade Pay.',
    topDesignations: 'Professor, Dean, Vice-Chancellor.',
    progression: [
      { stage: 'Entry (Asst. Prof)', min: 10, max: 13, avg: 11.5, label: 'Level 10 (₹57,700 basic)' },
      { stage: 'Mid (Assoc. Prof)', min: 18, max: 23, avg: 20.5, label: 'Level 13A (₹1,31,400 basic)' },
      { stage: 'Senior (Professor)', min: 25, max: 32, avg: 28.5, label: 'Level 14 (₹1,44,200 basic)' },
    ]
  },
  'Software Engineer (Private Sector)': {
    type: 'Private Tech Sector',
    icon: Briefcase,
    description: 'Software development in IT/Product companies.',
    allowances: 'Base, Bonus, RSUs/ESOPs, PF, Gratuity, Health Insurance.',
    topDesignations: 'Principal Engineer, VP Engineering, CTO.',
    progression: [
      { stage: 'Entry (SDE I)', min: 8, max: 25, avg: 15, label: 'Fresher/Junior' },
      { stage: 'Mid (SDE II/SDE III)', min: 20, max: 50, avg: 35, label: 'Mid-Senior' },
      { stage: 'Senior (Staff/Principal)', min: 50, max: 120, avg: 75, label: 'Staff/Leadership' },
    ]
  }
};

export const SalaryPredictor = () => {
  const [selectedRole, setSelectedRole] = useState('Civil Services (IAS)');

  const activeProfile = salaryData[selectedRole as keyof typeof salaryData] || salaryData['Civil Services (IAS)'];
  const data = activeProfile.progression;
  const ActiveIcon = activeProfile.icon;

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm gap-4">
        <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
          <TrendingUp size={28} />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Salary & Career Growth Predictor</h2>
        </div>
        <div className="w-full md:w-auto min-w-[300px]">
          <select 
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
          >
            {Object.keys(salaryData).map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl text-emerald-600 dark:text-emerald-400">
            <ActiveIcon size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">{selectedRole}</h3>
            <span className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-md mb-3 border border-slate-200 dark:border-slate-700">
              {activeProfile.type}
            </span>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 leading-relaxed">
              {activeProfile.description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Allowances / Perks</div>
                <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                  {activeProfile.allowances}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Top Designations</div>
                <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                  {activeProfile.topDesignations}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4 min-h-[400px]">
          <div>
            <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-1">Average Salary Progression (LPA)</h3>
            <p className="text-xs text-slate-500">Projected average CTC/Gross across career stages</p>
          </div>
          <div className="flex-1 w-full h-full min-h-[300px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="stage" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }}
                  itemStyle={{ color: '#34d399' }}
                  formatter={(value: number) => [`₹${value} LPA`, 'Average Salary']}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Line type="monotone" dataKey="avg" name="Average Salary (LPA)" stroke="#10b981" strokeWidth={3} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4 min-h-[400px]">
          <div>
            <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-1">Salary Range & Grades (LPA)</h3>
            <p className="text-xs text-slate-500">Minimum and maximum ranges with corresponding pay bands</p>
          </div>
          <div className="flex-1 w-full h-full min-h-[300px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="stage" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }}
                  formatter={(value: number, name: string) => [`₹${value} LPA`, name]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                      return `${label} - ${payload[0].payload.label}`;
                    }
                    return label;
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="min" name="Min Salary" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={60} />
                <Bar dataKey="max" name="Max Salary" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
        <div className="flex items-start gap-3">
          <Briefcase className="text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0" size={20} />
          <div>
            <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-2">Growth Insights & Context</h4>
            <p className="text-sm text-emerald-700 dark:text-emerald-400/80 leading-relaxed mb-2">
              All figures are approximate estimates representing <strong>Gross Salary (Cost to Company) in Lakhs Per Annum (LPA)</strong>. 
            </p>
            <ul className="text-sm text-emerald-700 dark:text-emerald-400/80 leading-relaxed list-disc list-inside space-y-1">
              <li><strong>Government Roles:</strong> Calculated combining Basic Pay (7th CPC), current DA (~50%), HRA, and standard allowances. These do not quantify the substantial non-monetary perks (housing, vehicle, job security).</li>
              <li><strong>Banking/PSUs:</strong> Includes Basic, DA, HRA, and Performance Related Pay (PRP) which forms a major chunk at senior levels.</li>
              <li><strong>Private Sector:</strong> Represents Total CTC including Base, Variable bonus, and initial stock grants (RSUs/ESOPs). Highly variable based on company tier (FAANG vs Startups) and location.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

