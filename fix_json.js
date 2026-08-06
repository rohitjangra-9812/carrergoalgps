const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');
content = content.replace(
  'let cleanedText = response.text.replace(/```json\\n?|```/g, "").trim();\\n      let quizData = JSON.parse(cleanedText);',
  'let cleanedText = response.text.replace(/```json\\n?/g, "").replace(/```/g, "").trim();\n      let quizData = JSON.parse(cleanedText);'
);
fs.writeFileSync('server.js', content);
