import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Trophy, CheckCircle2, XCircle, ArrowRight, RotateCcw, Loader2 } from 'lucide-react';

interface Question {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const DailyQuiz: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { language, t } = useLanguage();
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQ = quizQuestions[currentIndex];

  const handleSelectOption = (option: string) => {
    if (!isSubmitted) {
      setSelectedOption(option);
    }
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);
    setUserAnswers(prev => ({ ...prev, [currentIndex]: selectedOption }));
  };

  const handleNext = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setIsCompleted(true);
      if (onComplete) onComplete();
    }
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        throw new Error('Static deployment');
      } catch (err) {
        // Fallback for static deployment without backend


        const fallbackQuiz = [
          { id: 1, category: "Current Affairs", question: "Who recently won the latest international chess championship?", options: ["Magnus Carlsen", "Ding Liren", "Hikaru Nakamura", "Fabiano Caruana"], correctAnswer: "Ding Liren", explanation: "Ding Liren is the current World Chess Champion." },
          { id: 2, category: "General Science", question: "What is the chemical symbol for Gold?", options: ["Au", "Ag", "Fe", "Cu"], correctAnswer: "Au", explanation: "Au comes from the Latin word aurum, meaning gold." },
          { id: 3, category: "Quantitative Aptitude", question: "If a train 150m long is running at a speed of 90 km/hr, how much time will it take to cross a pole?", options: ["5 seconds", "6 seconds", "8 seconds", "10 seconds"], correctAnswer: "6 seconds", explanation: "Speed = 90 * (5/18) = 25 m/s. Time = Distance / Speed = 150 / 25 = 6 seconds." },
          { id: 4, category: "General Knowledge", question: "Which is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], correctAnswer: "Nile", explanation: "The Nile is traditionally considered the longest river in the world." },
          { id: 5, category: "Language & Comprehension", question: "Choose the correct synonym for 'Lucid'.", options: ["Obscure", "Clear", "Complicated", "Dull"], correctAnswer: "Clear", explanation: "Lucid means expressed clearly; easy to understand." },
          { id: 6, category: "Quantitative Aptitude", question: "What is 15% of 60?", options: ["9", "12", "15", "18"], correctAnswer: "9", explanation: "15% of 60 = (15/100) * 60 = 9." },
          { id: 7, category: "Current Affairs", question: "Which country hosted the 2024 Summer Olympics?", options: ["USA", "Japan", "France", "UK"], correctAnswer: "France", explanation: "The 2024 Summer Olympics were held in Paris, France." },
          { id: 8, category: "General Science", question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correctAnswer: "Mars", explanation: "Mars is called the Red Planet because of iron oxide on its surface." },
          { id: 9, category: "General Knowledge", question: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], correctAnswer: "William Shakespeare", explanation: "Romeo and Juliet is a tragedy written by William Shakespeare." },
          { id: 10, category: "Language & Comprehension", question: "What is the antonym of 'Benevolent'?", options: ["Kind", "Cruel", "Generous", "Friendly"], correctAnswer: "Cruel", explanation: "Benevolent means well meaning and kindly; its opposite is cruel." }
        ];

        setQuizQuestions(fallbackQuiz);
        setError(null);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const getOptionStyles = (opt: string) => {
    if (!isSubmitted) {
      return selectedOption === opt
        ? 'bg-indigo-600 border-indigo-500 text-white'
        : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200';
    }

    if (opt === currentQ.correctAnswer) {
      return 'bg-emerald-600/20 border-emerald-500 text-emerald-400';
    }

    if (opt === selectedOption && opt !== currentQ.correctAnswer) {
      return 'bg-rose-600/20 border-rose-500 text-rose-400';
    }

    return 'bg-slate-800/50 border-slate-700/50 text-slate-500 opacity-50';
  };

  if (loading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-indigo-400">
          <Loader2 size={32} className="animate-spin" />
          <span className="text-xl font-bold">Generating today's challenge...</span>
        </div>
      </div>
    );
  }

  if (error || quizQuestions.length === 0) {
    return (
      <div className="flex-1 w-full flex items-center justify-center p-4">
        <div className="text-rose-400 p-6 bg-slate-900 border border-slate-800 rounded-xl max-w-md text-center">
          <XCircle size={48} className="mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Failed to load quiz</h3>
          <p className="text-slate-400">{error || 'No questions available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex items-center justify-center p-4 overflow-y-auto">
      <div className="p-6 md:p-8 bg-slate-900 text-white rounded-xl shadow-xl w-full max-w-3xl mx-auto border border-slate-800 my-8">
        {!isCompleted ? (
          <>
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <span className="text-sm font-semibold text-indigo-400 flex items-center gap-2">
                <Trophy size={16} /> Daily Challenge Arena
              </span>
              <span className="text-sm text-slate-400">Question {currentIndex + 1} of {quizQuestions.length}</span>
            </div>

            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-slate-800 text-slate-300 text-xs font-semibold rounded-full mb-3">
                {currentQ.category}
              </span>
              <h3 className="text-xl font-bold leading-relaxed">{currentQ.question}</h3>
            </div>

            <div className="space-y-3 mb-8">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  disabled={isSubmitted}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ${getOptionStyles(opt)}`}
                >
                  <span className="font-medium text-base">{opt}</span>
                  {isSubmitted && opt === currentQ.correctAnswer && <CheckCircle2 size={20} className="text-emerald-400" />}
                  {isSubmitted && opt === selectedOption && opt !== currentQ.correctAnswer && <XCircle size={20} className="text-rose-400" />}
                </button>
              ))}
            </div>

            {isSubmitted && (
              <div className="mb-6 p-4 rounded-lg bg-indigo-900/20 border border-indigo-500/30">
                <h4 className="text-indigo-300 font-bold mb-2">Explanation:</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{currentQ.explanation}</p>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-800">
              {!isSubmitted ? (
                <button
                  disabled={!selectedOption}
                  onClick={handleSubmit}
                  className={`px-8 py-3 rounded-lg font-bold transition flex items-center gap-2 ${
                    selectedOption
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition flex items-center gap-2"
                >
                  {currentIndex === quizQuestions.length - 1 ? 'View Results' : 'Next Question'} <ArrowRight size={18} />
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="text-center py-6 border-b border-slate-800 mb-6">
              <Trophy size={48} className="mx-auto text-yellow-500 mb-4" />
              <h3 className="text-3xl font-bold mb-2">Challenge Completed!</h3>
              <p className="text-slate-400">You've successfully finished today's evaluation.</p>
              
              <div className="mt-8 flex justify-center gap-6">
                <div className="bg-slate-800 p-6 rounded-2xl min-w-[120px]">
                  <div className="text-4xl font-black text-indigo-400 mb-1">{calculateScore()}</div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Correct</div>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl min-w-[120px]">
                  <div className="text-4xl font-black text-slate-200 mb-1">{quizQuestions.length}</div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total</div>
                </div>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              <h4 className="text-xl font-bold mb-4">Detailed Review</h4>
              {quizQuestions.map((q, idx) => {
                const isCorrect = userAnswers[idx] === q.correctAnswer;
                return (
                  <div key={idx} className={`p-5 rounded-xl border ${isCorrect ? 'bg-emerald-900/10 border-emerald-800/30' : 'bg-rose-900/10 border-rose-800/30'}`}>
                    <div className="flex gap-3 mb-3">
                      <div className="mt-1">
                        {isCorrect ? <CheckCircle2 size={20} className="text-emerald-500" /> : <XCircle size={20} className="text-rose-500" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-500 mb-1 block">Q{idx + 1} • {q.category}</span>
                        <h5 className="font-semibold text-slate-200 text-sm leading-relaxed mb-3">{q.question}</h5>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500 block mb-1">Your Answer:</span>
                            <span className={`font-medium ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>{userAnswers[idx]}</span>
                          </div>
                          {!isCorrect && (
                            <div>
                              <span className="text-slate-500 block mb-1">Correct Answer:</span>
                              <span className="font-medium text-emerald-400">{q.correctAnswer}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-slate-700/50">
                          <span className="text-xs font-bold text-slate-500 block mb-1">Explanation:</span>
                          <p className="text-sm text-slate-400">{q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setSelectedOption(null);
                  setIsSubmitted(false);
                  setUserAnswers({});
                  setIsCompleted(false);
                }}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-bold flex items-center gap-2 transition"
              >
                <RotateCcw size={18} /> Retake Challenge
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

