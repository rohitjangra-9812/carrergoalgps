import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Mic, MicOff, Paperclip, Bot, User, FileText, X } from 'lucide-react';
import Markdown from 'react-markdown';
import { useLanguage } from '../contexts/LanguageContext';

type FileData = {
  data: string;
  mimeType: string;
  name: string;
};

export const DoubtSolver = () => {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState([{ id: 1, text: "Hi! I'm your AI Doubt Solver. Paste your questions from PYQs or textbooks, or use the mic to ask!", isAi: true }]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setInput(prev => prev + transcript + ' ');
          } else {
            currentTranscript += transcript;
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleListen = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (e) {
        console.error("Failed to start speech recognition", e);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
      });
      setSelectedFile({
        data: base64,
        mimeType: file.type,
        name: file.name
      });
    } catch (err) {
      console.error("Error reading file", err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const userQuery = input;
    if (!userQuery.trim() && !selectedFile) return;
    
    const fileToSent = selectedFile;
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setMessages(prev => [...prev, { id: Date.now(), text: userQuery || (fileToSent ? `[Attached File: ${fileToSent.name}]` : ''), isAi: false }]);
    setInput('');
    setIsLoading(true);
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('API Key is missing. Please configure VITE_GEMINI_API_KEY in your Vercel/Vite environment variables.');
      }
      
      const systemInstruction = `You are an elite, highly accurate Doubt Solver and Academic Tutor. IMPORTANT: You MUST provide your answer entirely in ${language || 'English'}. Your goal is to provide direct, factual, and precise answers to the user's specific questions. Whether the question is about geographical facts, math problems, historical events, scientific definitions, or conceptual doubts, you must evaluate the text query and generate a contextually accurate, direct, and factually correct answer.
Do not use generic template steps if a direct factual answer is required (e.g., comparing country sizes, definitions, formulas). Be precise and clear.
IMPORTANT: Use standard LaTeX formatting for ALL mathematical expressions, equations, and variables. Use single dollar signs ($math$) for inline equations and double dollar signs ($math$) for block equations. Use proper LaTeX syntax for fractions (\\frac{}{}), integrals (\\int), roots (\\sqrt{}), etc.`;

      const currentParts = [];
      if (fileToSent) {
         currentParts.push({
            inlineData: {
              data: fileToSent.data,
              mimeType: fileToSent.mimeType
            }
         });
      }
      currentParts.push({ text: userQuery || "Please analyze this file/image." });

      const requestBody = {
        contents: [{ role: "user", parts: currentParts }],
        systemInstruction: { parts: [{ text: systemInstruction }] }
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:streamGenerateContent?key=${apiKey}&alt=sse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
         const err = await response.json().catch(() => ({}));
         throw new Error(err.error?.message || 'Failed to fetch from Gemini API. Network issue or invalid key.');
      }
      if (!response.body) throw new Error('No body in response');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const botMessageId = Date.now() + 1;
      
      setMessages(prev => [...prev, { id: botMessageId, text: '', isAi: true }]);
      let botResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.substring(6));
              const textChunk = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (textChunk) {
                botResponse += textChunk;
                setMessages(prev => prev.map(msg => 
                  msg.id === botMessageId ? { ...msg, text: botResponse } : msg
                ));
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Sorry, I encountered an error connecting to the server.", isAi: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 w-full flex justify-center p-4 md:p-8">
      <div className="flex-1 w-full max-w-5xl flex flex-col h-full min-h-0">
        <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
          <MessageSquare size={28} />
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">AI Doubt Solver</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Instant step-by-step explanations for your difficult questions.</p>
          </div>
        </div>
        
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.isAi ? 'self-start' : 'self-end flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.isAi ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
                {msg.isAi ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className={`p-3 rounded-xl text-sm ${msg.isAi ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700/50' : 'bg-indigo-600 text-white rounded-tr-none'}`}>
                {msg.isAi ? (
                  <div className="markdown-body text-sm [&>p]:mb-2 [&>p:last-child]:mb-0 [&_strong]:font-bold [&_ol]:list-decimal [&_ol]:ml-4 [&_ul]:list-disc [&_ul]:ml-4 [&_li]:mb-1">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 max-w-[85%] self-start">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Bot size={16} />
              </div>
              <div className="p-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700/50 flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 shrink-0">
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-400 hover:text-emerald-600 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
              title="Attach File"
            >
              <Paperclip size={20} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg"
            />
            <div className="flex-1 relative flex items-center">
              {selectedFile && (
                <div className="absolute left-2 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full text-xs font-semibold border border-emerald-100 dark:border-emerald-800 max-w-[120px] sm:max-w-[180px] z-10">
                  <FileText size={12} className="shrink-0" />
                  <span className="truncate">{selectedFile.name}</span>
                  <button 
                    type="button" 
                    onClick={() => setSelectedFile(null)}
                    className="hover:text-emerald-900 dark:hover:text-emerald-100 ml-1 shrink-0"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={selectedFile ? "Ask about this file..." : "Type or paste your question here..."}
                className={`w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-full ${selectedFile ? 'pl-[130px] sm:pl-[190px]' : 'pl-4'} pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                disabled={isLoading}
              />
            </div>
            <button 
              type="button" 
              onClick={toggleListen}
              className={`p-3 rounded-full transition-colors shrink-0 ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              title="Voice Input"
            >
              {isRecording ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button 
              type="submit" 
              disabled={isLoading || (!input.trim() && !selectedFile)} 
              className="p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 transition-colors shrink-0"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
};
