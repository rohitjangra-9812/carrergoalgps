sed -i 's/export default function App() {/export default function App() {\n  const { language, setLanguage, t } = useLanguage();/' src/App.tsx
sed -i "s/const \[language, setLanguage\] = useState('EN');//g" src/App.tsx
sed -i "s/import { useLanguage } from '.\/contexts\/LanguageContext';//g" src/App.tsx
sed -i "s/import React, { useState, useRef, useEffect } from 'react';/import React, { useState, useRef, useEffect } from 'react';\nimport { useLanguage } from '.\/contexts\/LanguageContext';/" src/App.tsx

sed -i "s/{ activeTab === 'study' ? 'Study Materials Hub' :/{ activeTab === 'study' ? t('Study Materials Hub') :/" src/App.tsx
sed -i "s/activeTab === 'salary' ? 'Salary Predictor' :/activeTab === 'salary' ? t('Salary Predictor') :/" src/App.tsx
sed -i "s/activeTab === 'resume' ? 'Resume Rebrander' :/activeTab === 'resume' ? t('Resume Rebrander') :/" src/App.tsx
sed -i "s/activeTab === 'roadmap' ? 'Roadmap Visualizer' :/activeTab === 'roadmap' ? t('Roadmap Visualizer') :/" src/App.tsx
sed -i "s/activeTab === 'affairs' ? 'Current Affairs' :/activeTab === 'affairs' ? t('Current Affairs') :/" src/App.tsx
sed -i "s/activeTab === 'directory' ? 'Exam Directory' :/activeTab === 'directory' ? t('Exam Directory') :/" src/App.tsx
sed -i "s/activeTab === 'doubts' ? 'Doubt Solver' :/activeTab === 'doubts' ? t('Doubt Solver') :/" src/App.tsx
sed -i "s/activeTab === 'quiz' ? 'Daily Quiz' :/activeTab === 'quiz' ? t('Daily Quiz') :/" src/App.tsx
sed -i "s/activeTab === 'eligibility' ? 'Eligibility Checker' : 'Career GPS Engine'/activeTab === 'eligibility' ? t('Eligibility Checker') : t('Career GPS Engine')/" src/App.tsx

sed -i "s/>Study Materials Hub</>{t('Study Materials Hub')}</" src/App.tsx
sed -i "s/>Salary Predictor</>{t('Salary Predictor')}</" src/App.tsx
sed -i "s/>Exam Directory</>{t('Exam Directory')}</" src/App.tsx
sed -i "s/>Daily Quiz</>{t('Daily Quiz')}</" src/App.tsx
sed -i "s/>Doubt Solver</>{t('Doubt Solver')}</" src/App.tsx
sed -i "s/>Current Affairs</>{t('Current Affairs')}</" src/App.tsx
sed -i "s/>Resume Rebrander</>{t('Resume Rebrander')}</" src/App.tsx
sed -i "s/>Roadmap Visualizer</>{t('Roadmap Visualizer')}</" src/App.tsx
sed -i "s/>Eligibility Checker</>{t('Eligibility Checker')}</" src/App.tsx
sed -i "s/>Career GPS Engine</>{t('Career GPS Engine')}</" src/App.tsx

sed -i "s/title=\"Toggle Dark Mode\"/title={t('Toggle Dark Mode')}/" src/App.tsx
sed -i "s/>Export PDF</>{t('Export PDF')}</" src/App.tsx
sed -i "s/>Personal Vault</>{t('Personal Vault')}</" src/App.tsx
sed -i "s/>Target Goal</>{t('Target Goal')}</" src/App.tsx
sed -i "s/title=\"Select Language\"/title={t('Select Language')}/" src/App.tsx

