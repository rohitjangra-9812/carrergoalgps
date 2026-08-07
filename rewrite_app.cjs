const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes("@google/genai")) {
  content = "import { GoogleGenAI } from '@google/genai';\n" + content;
}

const fetchBlock = `      const requestBody = { contents };
      const response = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:streamGenerateContent?key=\${apiKey}&alt=sse\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
         const err = await response.json().catch(() => ({}));
         console.error('Gemini API Error:', response.status, response.statusText, err);
         throw new Error(err.error?.message || \`Failed to fetch from Gemini API (\${response.status}). Network issue or invalid key.\`);
      }
      if (!response.body) throw new Error('No body in response');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let botResponse = '';
      const botMessageId = (Date.now() + 1).toString();
      
      const initialMsg = { id: botMessageId, role: 'model' as const, text: '' };
      setMessages(prev => [...prev, initialMsg]);
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              const textChunk = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (textChunk) {
                botResponse += textChunk;
                setMessages(prev => prev.map(m => m.id === botMessageId ? { ...m, text: botResponse } : m));
              }
            } catch (e) {
              console.warn('Error parsing stream chunk:', e);
            }
          }
        }
      }`;

const newBlock = `
      const ai = new GoogleGenAI({ apiKey });
      let responseStream;
      try {
        responseStream = await ai.models.generateContentStream({
          model: 'gemini-3.5-flash',
          contents
        });
      } catch (apiError) {
        console.error('Gemini API Error during SDK initialization/request:', apiError);
        throw apiError;
      }
      
      let botResponse = '';
      const botMessageId = (Date.now() + 1).toString();
      
      const initialMsg = { id: botMessageId, role: 'model' as const, text: '' };
      setMessages(prev => [...prev, initialMsg]);
      
      try {
        for await (const chunk of responseStream) {
          if (chunk.text) {
            botResponse += chunk.text;
            setMessages(prev => prev.map(m => m.id === botMessageId ? { ...m, text: botResponse } : m));
          }
        }
      } catch (streamError) {
        console.error('Gemini API Error during stream consumption:', streamError);
        throw streamError;
      }
`;

content = content.replace(fetchBlock, newBlock);
fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App updated.');
