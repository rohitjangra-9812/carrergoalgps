import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { BookOpen, FileText, Download, PlayCircle, Layers, Link as LinkIcon, Search, Brain, Target, CheckCircle, X, PackageOpen, DownloadCloud } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Loader2, Save, FolderHeart } from 'lucide-react';

const materialTypes = ['All', 'Saved', 'PYQs', 'Short Notes', 'Flashcards', 'Mind Maps', 'Mock Tests'];

type BundleItem = {
  type: string;
  label: string;
  size: string;
};

type Bundle = {
  examName: string;
  title: string;
  items: BundleItem[];
};

const mockMaterials = [

  { id: 1, title: 'UPSC CSE Prelims Year-wise PYQs (2014-2025)', type: 'PYQs', target: 'UPSC', size: '12 MB', format: 'PDF', icon: FileText },
  { id: 2, title: 'SSC CGL Tier 1 & 2 Shift-wise PYQs (2018-2024)', type: 'PYQs', target: 'SSC', size: '18 MB', format: 'PDF', icon: FileText },
  { id: 3, title: 'SBI PO & IBPS PO Mains Memory Based PYQs', type: 'PYQs', target: 'Banking', size: '10 MB', format: 'PDF', icon: FileText },
  { id: 4, title: 'JEE Main & Advanced Chapter-wise PYQs (2010-2024)', type: 'PYQs', target: 'JEE', size: '25 MB', format: 'PDF', icon: FileText },
  { id: 5, title: 'NEET UG Biology, Physics, Chemistry PYQs (2005-2024)', type: 'PYQs', target: 'NEET', size: '20 MB', format: 'PDF', icon: FileText },
  { id: 6, title: 'CAT Slot-wise Solved PYQs (2017-2023)', type: 'PYQs', target: 'CAT', size: '8 MB', format: 'PDF', icon: FileText },
  { id: 7, title: 'GATE CS & IT Topic-wise PYQs (2000-2024)', type: 'PYQs', target: 'GATE', size: '15 MB', format: 'PDF', icon: FileText },
  { id: 8, title: 'NDA & NA Math and GAT Solved PYQs (2015-2024)', type: 'PYQs', target: 'NDA', size: '12 MB', format: 'PDF', icon: FileText },
  { id: 9, title: 'CDS OTA & IMA Solved PYQs (2016-2024)', type: 'PYQs', target: 'CDS', size: '14 MB', format: 'PDF', icon: FileText },
  { id: 10, title: 'CUET UG Subject-wise Question Banks & PYQs', type: 'PYQs', target: 'CUET', size: '11 MB', format: 'PDF', icon: FileText },
  { id: 11, title: 'CLAT UG Legal Reasoning & Comprehension PYQs', type: 'PYQs', target: 'CLAT', size: '9 MB', format: 'PDF', icon: FileText },
  { id: 12, title: 'RRB NTPC CBT 1 & 2 Shift-wise PYQs', type: 'PYQs', target: 'Railways', size: '16 MB', format: 'PDF', icon: FileText },
  { id: 13, title: 'UGC NET Paper 1 & 2 (Commerce) PYQs', type: 'PYQs', target: 'UGC NET', size: '10 MB', format: 'PDF', icon: FileText },
  { id: 14, title: 'CTET Paper 1 & 2 Year-wise Solved PYQs', type: 'PYQs', target: 'CTET', size: '7 MB', format: 'PDF', icon: FileText },
  { id: 15, title: 'UPPSC & BPSC Prelims Solved PYQs (Last 10 Years)', type: 'PYQs', target: 'State PSC', size: '12 MB', format: 'PDF', icon: FileText },
  
  // Non-PYQ Items
  { id: 16, title: 'Indian Polity - Quick Revision Flashcards', type: 'Flashcards', target: 'UPSC/State PSC', size: 'Online', format: 'Web', icon: Brain },
  { id: 17, title: 'Modern History - Graphic Mind Map optimized for Last-Minute Revision', type: 'Mind Maps', target: 'UPSC/SSC', size: '8 MB', format: 'PDF', icon: Layers },
  { id: 18, title: 'All-India SBI PO Real-Time Simulation Exam (with Percentile & Analytics)', type: 'Mock Tests', target: 'Banking', size: 'Online', format: 'Web', icon: Target },
  { id: 19, title: 'Biology Revision Short Notes Compendium', type: 'Short Notes', target: 'NEET', size: '15 MB', format: 'PDF', icon: BookOpen },
];

export const StudyMaterialsHub = () => {
  const { language, t } = useLanguage();

  const [activeType, setActiveType] = useState('All');
  const [savedMaterials, setSavedMaterials] = useState<any[]>(() => {
    const saved = localStorage.getItem('career-gps-saved-materials');
    return saved ? JSON.parse(saved) : [];
  });
  
  useEffect(() => {
    localStorage.setItem('career-gps-saved-materials', JSON.stringify(savedMaterials));
  }, [savedMaterials]);

  const handleSaveContent = (content: string, item: BundleItem) => {
    const newMaterial = {
      id: Date.now(),
      title: `Saved: ${item.label} (${activeBundle?.examName})`,
      type: 'Saved',
      target: activeBundle?.examName || 'Various',
      content: content,
      timestamp: new Date().toISOString()
    };
    setSavedMaterials(prev => [newMaterial, ...prev]);
    alert(t("Material saved for offline access!"));
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [activeBundle, setActiveBundle] = useState<Bundle | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);


  const filteredMaterials = activeType === 'Saved' ? savedMaterials : mockMaterials.filter(mat => {

    const matchesType = activeType === 'All' || mat.type === activeType;
    const matchesSearch = mat.title.toLowerCase().includes(searchQuery.toLowerCase()) || mat.target.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  
  const handleGenerateItem = async (item: BundleItem) => {
    setGeneratedContent('');
    setIsGenerating(true);
    setActiveItem(item);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('API Key is missing. Please configure VITE_GEMINI_API_KEY in your Vercel/Vite environment variables.');
      }
      
      const systemInstruction = `You are an expert academic tutor and exam preparation specialist. IMPORTANT: You MUST generate the content entirely in ${language || 'English'}. Your task is to generate complete, well-structured, and comprehensive content for ${item.type} related to ${item.label} for the ${activeBundle?.examName} exam.
IMPORTANT RULES:
- Generate complete, detailed content.
- Explicitly forbidden: truncation, placeholders, ellipses, or repeating lines.
- Do NOT cut off mid-sentence.
- Ensure the output is fully structured using Markdown headings, bullet points, and clean formatting.
- For PYQs, provide structured question and answer pairs with full explanations.
- For Notes, provide comprehensive subject matter breakdown.
- IMPORTANT: Use standard LaTeX formatting for ALL mathematical expressions, equations, and variables. Use single dollar signs ($math$) for inline equations and double dollar signs ($math$) for block equations. Use proper LaTeX syntax for fractions (\\frac{}{}), integrals (\\int), roots (\\sqrt{}), etc.`;

      const requestBody = {
        contents: [{ role: "user", parts: [{ text: `Generate comprehensive ${item.type} on ${item.label} for ${activeBundle?.examName}.` }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] }
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${apiKey}&alt=sse`, {
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
      let content = '';
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
                content += textChunk;
                setGeneratedContent(content);
              }
            } catch (e) {}
          }
        }
      }
    } catch (error: any) {
      console.error(error);
      setGeneratedContent(`**Error:** ${error.message || 'Failed to generate content.'}\n\n*Note: This app is running client-side. Please ensure you have added your Gemini API key to the VITE_GEMINI_API_KEY environment variable in your Vercel settings.*`);
    } finally {
      setIsGenerating(false);
    }
  };

  
  const [activeItem, setActiveItem] = useState<BundleItem | null>(null);

  const handleGetResource = (resource: typeof mockMaterials[0]) => {
    if (resource.type === 'Saved') {
      const savedItem = savedMaterials.find(s => s.id === resource.id);
      if (savedItem) {
        setActiveBundle({
          examName: savedItem.target,
          title: savedItem.title,
          items: []
        });
        setGeneratedContent(savedItem.content);
        setActiveItem({ type: savedItem.type, label: savedItem.title, size: 'Saved' });
        setIsBundleModalOpen(true);
        return;
      }
    }

    if (resource.format === 'Web') {
      alert(`Opening ${resource.title} in a new tab...`);
      return;
    }
    setActiveBundle({
      examName: resource.target,
      title: resource.title,
      items: [
        { type: 'PYQs', label: `Complete Year-wise PYQs (${resource.target})`, size: 'Comprehensive Bundle' },
        { type: 'Short Notes', label: `Subject-wise Quick Revision Notes`, size: 'Complete Set' },
        { type: 'Mind Maps', label: `High-Yield Visual Mind Maps`, size: 'All Units' },
        { type: 'Mock Tests', label: `All-India Test Series & Solutions`, size: 'Full Access' }
      ]
    });
    setIsBundleModalOpen(true);
  };


  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm gap-4">
        <div className="flex items-center gap-3 text-fuchsia-600 dark:text-fuchsia-400">
          <Layers size={28} />
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Exam Toolkit & Resources</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Targeted PYQs, Smart Revision Notes, Mind Maps & All-India Mock Tests.</p>
          </div>
        </div>
        <div className="relative w-full md:w-64 shrink-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search resources..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 dark:text-slate-200"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {materialTypes.map(type => (
          <button 
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              activeType === type 
                ? 'bg-fuchsia-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resource Name</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Target Exam</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Format</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredMaterials.map(mat => (
                <tr key={mat.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-600 dark:text-fuchsia-400 flex items-center justify-center shrink-0">
                        {mat.icon ? <mat.icon size={16} /> : <FolderHeart size={16} />}
                      </div>
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{mat.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
                      {mat.target}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                    {mat.type}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400">
                    {mat.size} ({mat.format})
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={() => handleGetResource(mat)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-fuchsia-50 dark:bg-fuchsia-900/20 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/40 text-fuchsia-600 dark:text-fuchsia-400 text-xs font-bold rounded transition-colors"
                    >
                      {mat.type === 'Saved' ? (
                        <><FolderHeart size={14} /> {t("Open Saved")}</>
                      ) : mat.format === 'Web' ? (
                        <><LinkIcon size={14} /> Open</>
                      ) : (
                        <><Download size={14} /> Get</>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredMaterials.length === 0 && (
            <div className="text-center py-12 text-slate-500 border-t border-slate-100 dark:border-slate-800">
              No materials found matching your search.
            </div>
          )}
        </div>
      </div>

      {isBundleModalOpen && activeBundle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 flex items-center justify-center shrink-0 border border-fuchsia-200 dark:border-fuchsia-800/50">
                  <PackageOpen size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{activeBundle.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                      {activeBundle.examName} Bundle
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Comprehensive Repository</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => { setIsBundleModalOpen(false); setGeneratedContent(null); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {isGenerating || generatedContent ? (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Generated Study Material</h3>
                    
                    <div className="flex items-center gap-2">
                      {activeItem?.type !== 'Saved' && generatedContent && (
                        <button onClick={() => handleSaveContent(generatedContent, activeItem!)} className="flex items-center gap-1 text-xs text-fuchsia-600 hover:text-fuchsia-700 bg-fuchsia-50 hover:bg-fuchsia-100 px-3 py-1.5 rounded-lg transition-colors font-semibold">
                          <Save size={14} /> {t("Save for Offline")}
                        </button>
                      )}
                      <button onClick={() => { setGeneratedContent(null); setIsGenerating(false); setActiveItem(null); }} className="text-xs text-slate-500 hover:text-slate-700">← Back to Bundle</button>
                    </div>

                  </div>
                  <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                    {generatedContent ? (
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm, remarkMath]} 
                        rehypePlugins={[rehypeKatex]}
                      >
                        {generatedContent}
                      </ReactMarkdown>
                    ) : null}
                    {isGenerating && (
                      <div className="flex items-center gap-2 mt-4 text-fuchsia-600">
                        <Loader2 className="animate-spin" size={16} />
                        <span className="text-sm font-medium">Generating content with AI...</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                    This comprehensive bundle contains all the essential resources to supercharge your preparation. Select an item to generate custom notes and PYQs.
                  </p>
                  <div className="space-y-3">
                    {activeBundle.items.map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-fuchsia-200 dark:hover:border-fuchsia-900/50 transition-colors gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                            <FileText size={16} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{item.label}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{item.type} • {item.size}</p>
                          </div>
                        </div>
                        <button 
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors"
                          onClick={() => handleGenerateItem(item)}
                        >
                          <DownloadCloud size={14} />
                          Generate
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
                Materials are uniquely generated for your specific requirements.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
