sed -i 's/const { language } = useLanguage();/const { language, t } = useLanguage();/' src/components/DoubtSolver.tsx
sed -i "s/>Ask a doubt</>{t('Ask a doubt')}</" src/components/DoubtSolver.tsx
sed -i "s/>Solve</>{t('Solve')}</" src/components/DoubtSolver.tsx
