sed -i "s/import React, { useState, useEffect } from 'react';/import React, { useState, useEffect } from 'react';\nimport { useLanguage } from '..\/contexts\/LanguageContext';/" src/components/DailyQuiz.tsx
sed -i 's/export const DailyQuiz: React.FC = () => {/export const DailyQuiz: React.FC = () => {\n  const { language, t } = useLanguage();/' src/components/DailyQuiz.tsx
sed -i "s/const response = await fetch('\/api\/daily-quiz');/const response = await fetch(\`\/api\/daily-quiz?lang=\${language}\`);/" src/components/DailyQuiz.tsx
