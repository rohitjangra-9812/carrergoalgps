sed -i 's/const { messages, target, subjects } = req.body;/const { messages, target, subjects, language } = req.body;/g' server.js
sed -i 's/const { type, topic, target } = req.body;/const { type, topic, target, language } = req.body;/g' server.js
sed -i 's/const { question, files } = req.body;/const { question, files, language } = req.body;/g' server.js

sed -i "s/You are an expert career counselor and academic advisor for Indian competitive exams./You are an expert career counselor and academic advisor for Indian competitive exams. IMPORTANT: You MUST respond entirely in \${language || 'English'}./g" server.js
sed -i "s/Your task is to generate complete/IMPORTANT: You MUST generate the content entirely in \${language || 'English'}.\nYour task is to generate complete/g" server.js
sed -i "s/Your goal is to provide direct/IMPORTANT: You MUST provide your answer entirely in \${language || 'English'}.\nYour goal is to provide direct/g" server.js
