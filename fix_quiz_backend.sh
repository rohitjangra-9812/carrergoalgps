sed -i 's/let cachedQuiz = null;/let cachedQuiz: Record<string, any> = {};/g' server.js
sed -i "s/if (cachedQuiz && cachedQuizDate === today) {/const lang = req.query.lang || 'EN';\n      if (cachedQuiz[lang] && cachedQuizDate === today) {\n        return res.json({ questions: cachedQuiz[lang] });\n      }/" server.js
sed -i "s/return res.json({ questions: cachedQuiz });//g" server.js
