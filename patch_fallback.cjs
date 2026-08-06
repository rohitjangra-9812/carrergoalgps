const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

const fallbackCode = `      let cleanedText = response.text.replace(/\\r\\n/g, "\\n").replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
      let quizData = JSON.parse(cleanedText);
      
      // Handle case where Gemini wraps in { questions: [...] }
      if (!Array.isArray(quizData) && quizData.questions) {
        quizData = quizData.questions;
      }
      
      if (!Array.isArray(quizData)) {
        throw new Error("Invalid format received from AI");
      }

      cachedQuiz = quizData;
      cachedQuizDate = today;
      res.json({ questions: quizData });
    } catch (err) {
      console.error("Gemini API Error in daily-quiz:", err);
      // Fallback data if API fails
      const fallbackQuiz = [
        { id: 1, category: "Current Affairs", question: "Who recently won the latest international chess championship?", options: ["Magnus Carlsen", "Ding Liren", "Hikaru Nakamura", "Fabiano Caruana"], correctAnswer: "Ding Liren", explanation: "Ding Liren is the current World Chess Champion." },
        { id: 2, category: "General Science", question: "What is the chemical symbol for Gold?", options: ["Au", "Ag", "Fe", "Cu"], correctAnswer: "Au", explanation: "Au comes from the Latin word aurum, meaning gold." },
        { id: 3, category: "Quantitative Aptitude", question: "If a train 150m long is running at a speed of 90 km/hr, how much time will it take to cross a pole?", options: ["5 seconds", "6 seconds", "8 seconds", "10 seconds"], correctAnswer: "6 seconds", explanation: "Speed = 90 * (5/18) = 25 m/s. Time = Distance / Speed = 150 / 25 = 6 seconds." },
        { id: 4, category: "General Knowledge", question: "Which is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], correctAnswer: "Nile", explanation: "The Nile is traditionally considered the longest river in the world." },
        { id: 5, category: "Language & Comprehension", question: "Choose the correct synonym for 'Lucid'.", options: ["Obscure", "Clear", "Complicated", "Dull"], correctAnswer: "Clear", explanation: "Lucid means expressed clearly; easy to understand." }
      ];
      res.json({ questions: fallbackQuiz });
    }
  });`;

content = content.replace(/      let cleanedText = response\.text\.replace\(\/```json\/g, ""\)\.replace\(\/```\/g, ""\)\.trim\(\);\n      let quizData = JSON\.parse\(cleanedText\);\n      \n      \/\/ Handle case where Gemini wraps in \{ questions: \[\.\.\.\] \}\n      if \(\!Array\.isArray\(quizData\) && quizData\.questions\) \{\n        quizData = quizData\.questions;\n      \}\n      \n      if \(\!Array\.isArray\(quizData\)\) \{\n        throw new Error\("Invalid format received from AI"\);\n      \}\n\n      cachedQuiz = quizData;\n      cachedQuizDate = today;\n      res\.json\(\{ questions: quizData \}\);\n    \} catch \(err\) \{\n      console\.error\("Gemini API Error in daily-quiz:", err\);\n      res\.status\(500\)\.json\(\{ error: "Failed to generate daily quiz." \}\);\n    \}\n  \}\);/g, fallbackCode);

fs.writeFileSync('server.js', content);
