sed -i 's/const { language } = useLanguage();/const { language, t } = useLanguage();/' src/components/StudyMaterialsHub.tsx
sed -i "s/>Generate</>{t('Generate')}</" src/components/StudyMaterialsHub.tsx
sed -i "s/>Generating...</>{t('Generating...')}</" src/components/StudyMaterialsHub.tsx
sed -i "s/>Download</>{t('Download')}</" src/components/StudyMaterialsHub.tsx
sed -i "s/>Search materials...</>{t('Search materials...')}</" src/components/StudyMaterialsHub.tsx
