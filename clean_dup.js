const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');
content = content.replace(/IMPORTANT: You MUST generate the content entirely in \${language \|\| 'English'}\.\s*IMPORTANT: You MUST generate the content entirely in \${language \|\| 'English'}\./g, "IMPORTANT: You MUST generate the content entirely in ${language || 'English'}.");
content = content.replace(/IMPORTANT: You MUST provide your answer entirely in \${language \|\| 'English'}\.\s*IMPORTANT: You MUST provide your answer entirely in \${language \|\| 'English'}\./g, "IMPORTANT: You MUST provide your answer entirely in ${language || 'English'}.");
fs.writeFileSync('server.js', content);
