# In App.tsx
sed -i 's/const cachePayload = { messages: chatContext, target: profile?.target, subjects: profile?.subjects };/const cachePayload = { messages: chatContext, target: profile?.target, subjects: profile?.subjects, language };/g' src/App.tsx

# In StudyMaterialsHub.tsx
sed -i "s/import React, { useState } from 'react';/import React, { useState } from 'react';\nimport { useLanguage } from '..\/contexts\/LanguageContext';/" src/components/StudyMaterialsHub.tsx
sed -i 's/export const StudyMaterialsHub = () => {/export const StudyMaterialsHub = () => {\n  const { language } = useLanguage();/' src/components/StudyMaterialsHub.tsx
sed -i "s/body: JSON.stringify({ type, topic, target })/body: JSON.stringify({ type, topic, target, language })/g" src/components/StudyMaterialsHub.tsx

# In DoubtSolver.tsx
sed -i "s/import React, { useState, useRef } from 'react';/import React, { useState, useRef } from 'react';\nimport { useLanguage } from '..\/contexts\/LanguageContext';/" src/components/DoubtSolver.tsx
sed -i 's/export const DoubtSolver = () => {/export const DoubtSolver = () => {\n  const { language } = useLanguage();/' src/components/DoubtSolver.tsx
sed -i "s/body: JSON.stringify({ question: input, files: uploadedFiles })/body: JSON.stringify({ question: input, files: uploadedFiles, language })/g" src/components/DoubtSolver.tsx
