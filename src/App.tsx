import { GoogleGenAI } from '@google/genai';
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from './contexts/LanguageContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Send, Map, Loader2, Sparkles, Navigation, GraduationCap, Briefcase, Paperclip, Printer, Moon, Sun, FileText, X, UserCircle, Edit3, Calendar, Download, Trash2, BellRing, LogOut, Mic, MicOff, Volume2, Award } from 'lucide-react';
import { SalaryPredictor } from './components/SalaryPredictor';
import { ResumeRebrander } from './components/ResumeRebrander';
import { RoadmapVisualizer } from './components/RoadmapVisualizer';
import { CurrentAffairs } from './components/CurrentAffairs';
import { ExamDirectory } from './components/ExamDirectory';
import { StudyMaterialsHub } from './components/StudyMaterialsHub';
import { DoubtSolver } from './components/DoubtSolver';
import { DailyQuiz } from './components/DailyQuiz';
import { AdminPanel } from './components/AdminPanel';
import { BackgroundEffects } from './components/BackgroundEffects';
import { EligibilityChecker } from './components/EligibilityChecker';

type FileData = {
  data: string;
  mimeType: string;
  name: string;
};

type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
  files?: FileData[];
};

type UserProfile = {
  name: string;
  currentStatus: string; 
  stream: string; 
  interests: string; 
  target: string;
  lifeStage?: string;
  preferences?: string;
  timeAvailability?: string;
};

// Mock service for exams
const useMockExams = () => {
  return [
    { name: "JEE Main 2026", type: "Engineering", applicationStart: "Nov 1, 2025", lastDate: "Dec 15, 2025", examWindow: "Jan 20-30, 2026" },
    { name: "NEET UG 2026", type: "Medical", applicationStart: "Feb 10, 2026", lastDate: "Mar 15, 2026", examWindow: "May 3, 2026" },
    { name: "UPSC CSE 2026", type: "Civil Services", applicationStart: "Feb 15, 2026", lastDate: "Mar 5, 2026", examWindow: "May 24, 2026 (Prelims)" },
    { name: "GATE 2026", type: "Engineering PG", applicationStart: "Aug 30, 2025", lastDate: "Oct 12, 2025", examWindow: "Feb 7-15, 2026" },
    { name: "CAT 2026", type: "Management", applicationStart: "Aug 1, 2026", lastDate: "Sep 15, 2026", examWindow: "Nov 29, 2026" }
  ];
};

type TrackedExam = {
  id: string;
  name: string;
  date: string;
};

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const fetchedExams = useMockExams();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "Hello! I am your Core Career GPS Engine. I'm here to build your exact 4-stage roadmap to your dream job. To get started, please set up your profile, or just chat with me!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  
  // App Mode State
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsAdminPanelOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  
  const [broadcast, setBroadcast] = useState<{ type: string, content: string } | null>(null);

  useEffect(() => {
    const eventSource = new EventSource('/api/admin/events');
    eventSource.onerror = (err) => { console.error('SSE Error:', err); };
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'broadcast') {
          setBroadcast({ type: data.broadcast.type, content: data.broadcast.content });
          setTimeout(() => setBroadcast(null), 10000); // hide after 10s
        }
      } catch (e) {
      }
    };
    return () => eventSource.close();
  }, []);

  const [appMode, setAppMode] = useState<'GPS' | 'Growth' | 'CurrentAffairs' | 'ExamDirectory' | 'StudyMaterials' | 'DoubtSolver' | 'DailyQuiz' | 'EligibilityChecker' | 'ResumeRebrander'>('GPS');
  
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('career-gps-profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [showProfileModal, setShowProfileModal] = useState(() => {
    return !localStorage.getItem('career-gps-profile');
  });
  
  const [gamification, setGamification] = useState(() => {
    const saved = localStorage.getItem('career-gps-gamification');
    return saved ? { studyHours: 0, quizParticipation: 0, ...JSON.parse(saved) } : { xp: 120, level: 2, badges: ['Profile Pioneer'], studyHours: 0, quizParticipation: 0 };
  });

  useEffect(() => {
    localStorage.setItem('career-gps-gamification', JSON.stringify(gamification));
  }, [gamification]);
  
  const dailyPrompts = [
    "What did you learn today that brings you closer to your goal?",
    "What was the biggest challenge you faced today?",
    "Did you meet your study/upskilling target today?",
    "What is one small win you had today?"
  ];
  const [dailyPrompt] = useState(dailyPrompts[Math.floor(Math.random() * dailyPrompts.length)]);

  const [profileForm, setProfileForm] = useState<UserProfile>(profile || {
    name: '', currentStatus: '', stream: '', interests: '', target: ''
  });

  // Vault States (Per Profile isolation using profile.name as key suffix)
  const profileKey = profile?.name ? `-${profile.name}` : '';
  const [notes, setNotes] = useState(() => {
    return localStorage.getItem(`career-gps-notes${profileKey}`) || '';
  });
  const [trackedExams, setTrackedExams] = useState<TrackedExam[]>(() => {
    const saved = localStorage.getItem(`career-gps-exams${profileKey}`);
    return saved ? JSON.parse(saved) : [];
  });
  
  // Form for new exam
  const [newExamName, setNewExamName] = useState('');
  const [newExamDate, setNewExamDate] = useState('');

  // Persist Vault data when profile or data changes
  useEffect(() => {
    if (profile) {
      localStorage.setItem(`career-gps-notes-${profile.name}`, notes);
      localStorage.setItem(`career-gps-exams-${profile.name}`, JSON.stringify(trackedExams));
    }
  }, [notes, trackedExams, profile]);

  // Load Vault data when profile changes
  useEffect(() => {
    if (profile) {
      setNotes(localStorage.getItem(`career-gps-notes-${profile.name}`) || '');
      const savedExams = localStorage.getItem(`career-gps-exams-${profile.name}`);
      setTrackedExams(savedExams ? JSON.parse(savedExams) : []);
    }
  }, [profile]);

  // Vault Functions
  const addExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamName || !newExamDate) return;
    const newExam: TrackedExam = {
      id: Date.now().toString(),
      name: newExamName,
      date: newExamDate
    };
    setTrackedExams([...trackedExams, newExam]);
    setNewExamName('');
    setNewExamDate('');
  };

  const deleteExam = (id: string) => {
    setTrackedExams(trackedExams.filter(e => e.id !== id));
  };

  const exportICS = (exam: TrackedExam) => {
    const startDate = new Date(exam.date);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour event
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Core Career GPS Engine//EN
BEGIN:VEVENT
UID:${exam.id}@career-gps
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${exam.name}
DESCRIPTION:Tracked milestone via Core Career GPS Engine.
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exam.name.replace(/\\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const logoutProfile = () => {
    localStorage.removeItem('career-gps-profile');
    setProfile(null);
    setShowProfileModal(true);
    setMessages([{
      id: Date.now().toString(),
      role: 'model',
      text: "Profile cleared. Set up a new profile to continue."
    }]);
  };

  const getUpcomingExams = () => {
    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return trackedExams.filter(exam => {
      const examDate = new Date(exam.date);
      return examDate > now && examDate <= next7Days;
    });
  };

  const calculateDaysLeft = (dateString: string) => {
    const target = new Date(dateString);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Passed';
    if (diffDays === 0) return 'Today';
    return `${diffDays} Days Left`;
  };

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isListening, setIsListening] = useState(false);

  const toggleListen = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setToastMessage("Speech recognition is not supported in this browser.");
      return;
    }
    
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Map internal language codes to BCP 47
    const langMap: Record<string, string> = {
      'EN': 'en-US',
      'HI': 'hi-IN',
      'TA': 'ta-IN',
      'TE': 'te-IN',
      'BN': 'bn-IN',
      'MR': 'mr-IN'
    };
    
    recognition.lang = langMap[language] || 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const playTTS = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    
    const langMap: Record<string, string> = {
      'EN': 'en-US',
      'HI': 'hi-IN',
      'TA': 'ta-IN',
      'TE': 'te-IN',
      'BN': 'bn-IN',
      'MR': 'mr-IN'
    };
    utterance.lang = langMap[language] || 'en-US';
    
    window.speechSynthesis.speak(utterance);
  };


  // Check for upcoming exams on load or profile change
  useEffect(() => {
    if (trackedExams.length > 0) {
      const now = new Date();
      const next3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      
      const upcoming = trackedExams.filter(exam => {
        const examDate = new Date(exam.date);
        return examDate > now && examDate <= next3Days;
      });

      if (upcoming.length > 0) {
        setToastMessage(`You have ${upcoming.length} exam(s) coming up within the next 3 days!`);
        // Auto-hide toast after 5 seconds
        const timer = setTimeout(() => setToastMessage(null), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [trackedExams, profile]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const printContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(profileForm);
    localStorage.setItem('career-gps-profile', JSON.stringify(profileForm));
    setShowProfileModal(false);
    
    // Announce to the bot if it's the first time
    if (!profile) {
      sendMessage(`I\'ve set my profile:
- Name: ${profileForm.name}
- Life Stage: ${profileForm.lifeStage}
- Status: ${profileForm.currentStatus}
- Background: ${profileForm.stream}
- Interests & Hobbies: ${profileForm.interests}
- Preferences & Values: ${profileForm.preferences}
- Time Availability: ${profileForm.timeAvailability}
- Target: ${profileForm.target}

Please build a highly personalized roadmap and possibilities for me!`);
    }
  };

  const handlePrint = async () => {
    if (!printContainerRef.current) {
      window.print();
      return;
    }
    
    try {
      const domtoimage = (await import('dom-to-image-more')).default;
      const { jsPDF } = await import('jspdf');
      
      // Temporarily modify styles for printing
      const originalHeight = printContainerRef.current.style.height;
      const originalOverflow = printContainerRef.current.style.overflow;
      printContainerRef.current.style.height = 'auto';
      printContainerRef.current.style.overflow = 'visible';

      const dataUrl = await domtoimage.toPng(printContainerRef.current, {
        bgcolor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
        scale: 2
      });
      
      // Restore styles
      printContainerRef.current.style.height = originalHeight;
      printContainerRef.current.style.overflow = originalOverflow;
      
      const img = new Image();
      img.src = dataUrl;
      await new Promise(resolve => img.onload = resolve);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (img.height * pdfWidth) / img.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      
      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      
      pdf.save('career-roadmap.pdf');
    } catch (err) {
      console.error('Failed to generate PDF', err);
      // Fallback
      if (window.self !== window.top) {
        alert("PDF export requires opening the app in a new tab due to iframe restrictions.");
      } else {
        window.print();
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, appMode]);

  const sendMessage = async (userMessage: string) => {
    if ((!userMessage.trim() && !selectedFile) || isLoading) return;

    const fileToSent = selectedFile;
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    const activeMessages = messages;

    const cachePayload = {
      message: userMessage,
      history: activeMessages.map(({ role, text }) => ({ role, text })),
      files: fileToSent ? [{ data: fileToSent.data, mimeType: fileToSent.mimeType }] : undefined,
      isInterviewMode: false, language
    };
    const cacheKey = "career-gps-cache:" + JSON.stringify(cachePayload);

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userMessage,
      files: fileToSent ? [fileToSent] : undefined
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    const cachedResponse = localStorage.getItem(cacheKey);
    if (cachedResponse) {
      const msg = {
        id: (Date.now() + 1).toString(),
        role: 'model' as const,
        text: cachedResponse
      };
      setMessages(prev => [...prev, msg]);
      setIsLoading(false);
      return;
    }

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('API Key is missing. Please configure VITE_GEMINI_API_KEY in your Vercel/Vite environment variables.');
      }

      const contents = [];
      if (cachePayload.history) {
        for (const msg of cachePayload.history) {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          });
        }
      }

      const currentParts = [];
      if (cachePayload.files && cachePayload.files.length > 0) {
        for (const f of cachePayload.files) {
          currentParts.push({
            inlineData: {
              data: f.data,
              mimeType: f.mimeType
            }
          });
        }
      }
      currentParts.push({ text: cachePayload.message });
      contents.push({ role: 'user', parts: currentParts });

            const ai = new GoogleGenAI({ apiKey });
      let responseStream;
      try {
        responseStream = await ai.models.generateContentStream({
          model: 'gemini-3.5-flash',
          contents,
        });
      } catch (err) {
        console.error('Gemini API Error (Initialization/Request):', err);
        throw err;
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
      } catch (err) {
        console.error('Gemini API Error (Stream):', err);
        throw err;
      }
      
      localStorage.setItem(cacheKey, botResponse);
    } catch (error: any) {
      console.error(error);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'model' as const,
        text: `⚠️ **Error**: ${error.message || "I encountered an error while processing your request."}`
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleQuickAction = (action: string) => {
    if (action === 'Log 1 Hour Study') {
       setGamification(prev => ({...prev, studyHours: (prev.studyHours || 0) + 1}));
       alert(t("1 Study hour logged successfully!"));
       return;
    }
    if (action === 'Exam Deadlines') {
       const userMsg = action;
       const context = fetchedExams.length > 0 ? `\n\n[MOCK SERVICE DATA (Latest Live Updates):\n${JSON.stringify(fetchedExams, null, 2)}]` : '';
       sendMessage(userMsg + context);
    } else {
       sendMessage(action);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors">
      <BackgroundEffects />
      {isAdminPanelOpen && <AdminPanel onClose={() => setIsAdminPanelOpen(false)} />}

      {broadcast && (
        <div className="bg-blue-600 text-white px-4 py-3 shadow-lg flex items-center justify-between z-50 absolute top-0 left-0 w-full animate-in slide-in-from-top">
          <div className="flex items-center gap-3">
            <BellRing size={20} className="animate-bounce" />
            <div>
              <div className="font-bold text-sm">{broadcast.type}</div>
              <div className="text-sm">{broadcast.content}</div>
            </div>
          </div>
          <button onClick={() => setBroadcast(null)} className="text-blue-200 hover:text-white p-1 rounded-full hover:bg-blue-700 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Sidebar: 4-Stage Navigation */}
      <aside className="hidden md:flex w-72 bg-slate-900 flex-col text-white shrink-0 print-hide">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            <h1 className="text-xs font-bold uppercase tracking-widest text-slate-400">{t('Career GPS Engine')}</h1>
          </div>
          <p className="text-lg font-semibold">{t('Academic Protocol')}</p>
          <div className="mt-4 flex flex-col gap-1">
            <button 
              onClick={() => setAppMode('GPS')}
              className={`text-left px-3 py-2 text-xs font-bold rounded-md transition-colors ${appMode === 'GPS' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
            >
              {t('Roadmap Visualizer')}
            </button>
            <button 
              onClick={() => setAppMode('Growth')}
              className={`text-left px-3 py-2 text-xs font-bold rounded-md transition-colors ${appMode === 'Growth' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
            >
              {t('Salary Predictor')}
            </button>
            <button 
              onClick={() => setAppMode('CurrentAffairs')}
              className={`text-left px-3 py-2 text-xs font-bold rounded-md transition-colors ${appMode === 'CurrentAffairs' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
            >
              {t('Current Affairs')}
            </button>
            <button 
              onClick={() => setAppMode('ExamDirectory')}
              className={`text-left px-3 py-2 text-xs font-bold rounded-md transition-colors ${appMode === 'ExamDirectory' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
            >
              {t('Exam Directory')}
            </button>
            <button 
              onClick={() => setAppMode('StudyMaterials')}
              className={`text-left px-3 py-2 text-xs font-bold rounded-md transition-colors ${appMode === 'StudyMaterials' ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
            >
              {t('Study Materials Hub')}
            </button>
            <button 
              onClick={() => setAppMode('DoubtSolver')}
              className={`text-left px-3 py-2 text-xs font-bold rounded-md transition-colors ${appMode === 'DoubtSolver' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
            >
              {t('Doubt Solver')}
            </button>
            <button 
              onClick={() => setAppMode('DailyQuiz')}
              className={`text-left px-3 py-2 text-xs font-bold rounded-md transition-colors ${appMode === 'DailyQuiz' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
            >
              {t('Daily Quiz')}
            </button>
            <button 
              onClick={() => setAppMode('EligibilityChecker')}
              className={`text-left px-3 py-2 text-xs font-bold rounded-md transition-colors ${appMode === 'EligibilityChecker' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
            >
              {t('Eligibility Checker')}
            </button>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        </nav>
        <div className="p-6 bg-slate-950 mt-auto shrink-0 relative group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-xl font-bold">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : <UserCircle size={24} />}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-medium text-slate-400 truncate">{profile?.currentStatus || t("No Profile Set")}</div>
              <div className="text-sm font-bold truncate">{profile ? `${profile.stream} • ${profile.target}` : t("Click to edit profile")}</div>
            </div>
            <button 
              onClick={() => setShowProfileModal(true)}
              className="p-2 bg-slate-800 rounded hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <Edit3 size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Command Center */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* Profile Modal */}
        {showProfileModal && (
          <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('Candidate Profile')}</h2>
                {profile && (
                  <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X size={20} />
                  </button>
                )}
              </div>
              <form onSubmit={saveProfile} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('Full Name')}</label>
                  <input required value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder={t("e.g. Rahul Sharma")} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('Life Stage')}</label>
                  <select required value={profileForm.lifeStage || 'School Student'} onChange={e => setProfileForm({...profileForm, lifeStage: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="School Student">School Student</option>
                    <option value="College/University Student">College/University Student</option>
                    <option value="Mid-Career Professional">Mid-Career Professional</option>
                    <option value="Mature/Older Adult">Mature/Older Adult</option>
                    <option value="Retiree / Encore Career">Retiree / Encore Career</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Current Status</label>
                  <input required value={profileForm.currentStatus} onChange={e => setProfileForm({...profileForm, currentStatus: e.target.value})} type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 12th Grade, 1st Year College" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Academic / Professional Background</label>
                  <input required value={profileForm.stream} onChange={e => setProfileForm({...profileForm, stream: e.target.value})} type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. PCM, Arts, ITI, Marketing" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Key Interests & Hobbies</label>
                  <input required value={profileForm.interests} onChange={e => setProfileForm({...profileForm, interests: e.target.value})} type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Coding, Management, Mentoring, Gardening" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Preferences & Values</label>
                  <input value={profileForm.preferences || ''} onChange={e => setProfileForm({...profileForm, preferences: e.target.value})} type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Work-life balance, remote work, physical comfort" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Time Availability</label>
                  <select required value={profileForm.timeAvailability || 'Full-time'} onChange={e => setProfileForm({...profileForm, timeAvailability: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Volunteering">Volunteering</option>
                    <option value="Mentoring">Mentoring</option>
                    <option value="Flexible">Flexible / On-Demand</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Future Target / Goal</label>
                  <input required value={profileForm.target} onChange={e => setProfileForm({...profileForm, target: e.target.value})} type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Software Engineer, Start a Business, Skill Pivot" />
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                    Save Profile & Continue
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Notification Toast */}
        {toastMessage && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <BellRing size={18} />
            <span className="font-semibold text-sm">{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="ml-2 hover:text-indigo-200">
              <X size={16} />
            </button>
          </div>
        )}

        <header className="h-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 print-hide transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Map size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t('Career GPS Engine')}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('Data-driven 4-Stage Life Roadmap')}</p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <div className="hidden lg:flex gap-8 items-center mr-4">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t('Candidate')}</div>
                <div className="text-sm font-bold dark:text-white truncate max-w-[120px]">{profile?.name || t('Guest')}</div>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 my-auto"></div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t('Target Goal')}</div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[150px]">{profile?.target || 'Not Set'}</div>
              </div>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg px-2 py-2 border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              title={t('Select Language')}
            >
              <option value="EN">English</option>
              <option value="HI">हिन्दी (Hindi)</option>
              <option value="TA">தமிழ் (Tamil)</option>
              <option value="TE">తెలుగు (Telugu)</option>
              <option value="BN">বাংলা (Bengali)</option>
              <option value="MR">मराठी (Marathi)</option>
            </select>
            <button
              onClick={() => setIsVaultOpen(!isVaultOpen)}
              className={`flex items-center gap-2 px-4 py-2 ${isVaultOpen ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'} text-sm font-semibold rounded-lg transition-colors`}
              title="Personal Vault"
            >
              <Briefcase size={16} />
              <span className="hidden sm:inline">My Vault</span>
              {getUpcomingExams().length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  {getUpcomingExams().length}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              title={t('Toggle Dark Mode')}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {getUpcomingExams().length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30 px-8 py-2 flex items-center justify-between text-sm shrink-0 print-hide transition-colors">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-medium">
              <BellRing size={16} />
              <span>You have {getUpcomingExams().length} upcoming deadline(s) within the next 7 days.</span>
            </div>
            <button onClick={() => setIsVaultOpen(true)} className="text-red-700 dark:text-red-400 font-bold hover:underline text-xs">
              View Vault
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto flex flex-col relative w-full">
          {appMode === 'Growth' ? (
            <SalaryPredictor />
          ) : appMode === 'CurrentAffairs' ? (
            <CurrentAffairs />
          ) : appMode === 'ExamDirectory' ? (
            <ExamDirectory />
          ) : appMode === 'StudyMaterials' ? (
            <StudyMaterialsHub />
          ) : appMode === 'DoubtSolver' ? (
            <DoubtSolver />
          ) : appMode === 'DailyQuiz' ? (
            <DailyQuiz onComplete={() => setGamification(prev => ({...prev, quizParticipation: (prev.quizParticipation || 0) + 1}))} />
          ) : appMode === 'EligibilityChecker' ? (
            <EligibilityChecker />
          ) : appMode === 'ResumeRebrander' ? (
            <ResumeRebrander />
          ) : (
            <main ref={printContainerRef} className="flex-1 p-4 md:p-8 w-full max-w-5xl mx-auto flex flex-col gap-6">

              {new Date().getDay() === 1 && new Date().getHours() < 12 && (
                <div className="bg-gradient-to-r from-indigo-900/40 to-fuchsia-900/40 border border-indigo-500/30 rounded-xl p-5 shadow-sm text-white flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold mb-2">
                    <Award size={20} /> 
                    <span>{t('Weekly Career Pulse')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                      <div className="text-sm text-slate-400 font-medium mb-1">{t('Study Hours Logged')}</div>
                      <div className="text-2xl font-black text-white">{gamification.studyHours || 0}h</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                      <div className="text-sm text-slate-400 font-medium mb-1">{t('Quizzes Taken')}</div>
                      <div className="text-2xl font-black text-white">{gamification.quizParticipation || 0}</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mt-2 font-medium">
                    {(gamification.studyHours || 0) >= 5 && (gamification.quizParticipation || 0) >= 3 
                      ? t("Great job! You're on track for success this week.") 
                      : t("Keep it up! Try to hit 5 study hours and 3 quizzes this week.")}
                  </p>
                </div>
              )}

              {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                    msg.role === 'user' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-md'
                  }`}>
                    {msg.role === 'user' ? <Navigation size={20} /> : <Sparkles size={20} />}
                  </div>
                  <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {msg.files && msg.files.map((file, i) => (
                      <div key={i} className="mb-2 flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-2 rounded-lg text-sm border border-indigo-100 dark:border-indigo-800">
                        <FileText size={16} />
                        <span className="truncate max-w-[200px] font-medium">{file.name}</span>
                      </div>
                    ))}
                    <div className={`px-5 py-4 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-sm' 
                        : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm rounded-tl-sm text-slate-700 dark:text-slate-300 prose prose-slate dark:prose-invert max-w-none'
                    }`}>
                      {msg.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          components={{
                            code({ node, inline, className, children, ...props }: any) {
                              return (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            }
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 mt-1.5 font-medium px-1">
                      {msg.role === 'user' ? 'You' : 'GPS Engine'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex w-full justify-start">
                <div className="flex gap-3 max-w-[85%]">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-md flex items-center justify-center">
                    <Sparkles size={20} />
                  </div>
                  <div className="px-5 py-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm rounded-tl-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Loader2 className="animate-spin text-indigo-500" size={18} />
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('Calculating optimal roadmap...')}</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </main>
        )}
        </div>

      {(appMode === 'GPS') && (
        <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-4 shrink-0 px-8 print-hide transition-colors">
          <div className="max-w-5xl mx-auto">
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
              {['Find Internships', 'Exam Deadlines', 'Skill Checklist', 'Top Institutions Nearby', 'Get Study Materials', 'Log 1 Hour Study'].map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => handleQuickAction(action)}
                    disabled={isLoading}
                    className="whitespace-nowrap px-4 py-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-full border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50"
                  >
                    {t(action)}
                  </button>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute left-2 h-10 w-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                title="Attach Resume or Profile"
              >
                <Paperclip size={20} />
              </button>
              
              <button
                type="button"
                onClick={toggleListen}
                className={`absolute left-12 h-10 w-10 flex items-center justify-center transition-colors ${isListening ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                title="Voice Input"
              >
                {isListening ? <Mic size={20} /> : <MicOff size={20} />}
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.txt,.doc,.docx"
              />
              
              {selectedFile && (
                <div className="absolute left-24 flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full text-xs font-semibold border border-indigo-100 dark:border-indigo-800 max-w-[150px]">
                  <FileText size={14} className="shrink-0" />
                  <span className="truncate">{selectedFile.name}</span>
                  <button 
                    type="button" 
                    onClick={() => setSelectedFile(null)}
                    className="hover:text-indigo-900 dark:hover:text-indigo-100 ml-1 shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  selectedFile 
                    ? t("Add a message about your file...") 
                    : t("e.g. 11th grade PCM, interested in software engineering...")
                }
                className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-full ${selectedFile ? 'pl-64' : 'pl-24'} pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm`}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && !selectedFile)}
                className="absolute right-2 h-10 w-10 flex items-center justify-center bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} className="ml-0.5" />
              </button>
            </form>
            <div className="text-center mt-3">
              <p className="text-xs text-slate-400 font-medium">Powered by Gemini • Designed for specific, actionable career blueprints.</p>
            </div>
          </div>
        </footer>
      )}
      </div>

      {/* Vault Sidebar */}
      {isVaultOpen && (
        <aside className="w-80 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 print-hide z-40 transition-colors shadow-2xl">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
              <Briefcase size={20} />
              <h2 className="font-bold text-lg">My Vault</h2>
            </div>
            <button onClick={() => setIsVaultOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
            {/* Exam Tracker */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800 pb-2">
                <Calendar size={18} className="text-indigo-500" />
                <h3>Tracked Exams</h3>
              </div>
              
              <div className="flex flex-col gap-2">
                {trackedExams.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No exams tracked yet.</p>
                ) : (
                  trackedExams.map(exam => (
                    <div key={exam.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 relative group">
                      <div className="pr-12">
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{exam.name}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-medium text-slate-500">{exam.date}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            calculateDaysLeft(exam.date) === 'Passed' ? 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                            calculateDaysLeft(exam.date).includes('Days Left') && parseInt(calculateDaysLeft(exam.date)) <= 7 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          }`}>
                            {calculateDaysLeft(exam.date)}
                          </span>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => exportICS(exam)} className="p-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded transition-colors" title="Export to Calendar">
                          <Download size={12} />
                        </button>
                        <button onClick={() => deleteExam(exam.id)} className="p-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded transition-colors" title="Delete">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <form onSubmit={addExam} className="mt-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-col gap-2">
                <input required value={newExamName} onChange={e => setNewExamName(e.target.value)} type="text" placeholder="Exam/Milestone Name" className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-500" />
                <input required value={newExamDate} onChange={e => setNewExamDate(e.target.value)} type="date" className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-500" />
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 rounded text-xs transition-colors">
                  Add Deadline
                </button>
              </form>
            </div>
            
            {/* Notes & Vault */}
            <div className="flex flex-col gap-3 flex-1 min-h-[250px]">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800 pb-2">
                <FileText size={18} className="text-amber-500" />
                <h3>Private Notes</h3>
              </div>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Jot down target scores, interview checklists, or personal reminders here. This is saved securely on your device."
                className="w-full flex-1 bg-amber-50/50 dark:bg-amber-900/5 border border-amber-200/50 dark:border-amber-700/30 text-slate-800 dark:text-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none shadow-inner"
              />
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <button onClick={logoutProfile} className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 text-xs font-bold transition-colors">
              <LogOut size={14} />
              <span>Clear Profile Data</span>
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
