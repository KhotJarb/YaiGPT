import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Send, User, Bot, Loader2, Sun, Moon, Menu, Plus, MessageSquare, Trash2, X, ImagePlus, Edit2, Check, Globe, Settings, Mic, MicOff, Zap, Brain, Sparkles, Search, ChevronDown, ChevronUp, MoreVertical, SquarePen, Share, Pin, PinOff, Trash, Clock, Ghost } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Language = 'th' | 'en' | 'es' | 'de';

const TRANSLATIONS = {
  th: {
    name: 'Thai',
    greeting: `สวัสดีครับ ผมคือ **YaiGPT** เมนเทอร์ส่วนตัวด้านการเงินและการลงทุนของคุณ\n\nปรัชญาของผมคือการสร้างความมั่งคั่งระยะยาวผ่านการลงทุนแบบเน้นคุณค่า (Value Investing) การบริหารความเสี่ยงอย่างรัดกุม และการทำความเข้าใจวัฏจักรเศรษฐกิจอย่างลึกซึ้ง เราจะใช้หลักการของสุดยอดนักลงทุนอย่าง Warren Buffett, Ray Dalio, Peter Lynch และ Howard Marks มาเป็นเข็มทิศในการตัดสินใจ\n\nวันนี้คุณอยากให้เราวิเคราะห์สินทรัพย์ไหน แนวโน้มตลาด หรือการตัดสินใจครั้งสำคัญอะไรดีครับ?`,
    newChat: 'New Chat',
    analyzing: 'YaiGPT is analyzing...',
    placeholder: 'Message YaiGPT...',
    disclaimer: 'YaiGPT can make mistakes. Consider verifying important information.',
    suggestions: [
      "วิเคราะห์หุ้น AAPL ให้หน่อยครับ",
      "แนวโน้มอัตราดอกเบี้ยตอนนี้เป็นยังไง?",
      "ช่วยอธิบาย Margin of Safety ให้เข้าใจง่ายๆ",
      "จัดพอร์ตลงทุนระยะยาว 10 ปี ควรเริ่มยังไง?"
    ],
    settings: 'การตั้งค่า',
    username: 'ชื่อผู้ใช้',
    theme: 'ธีม',
    language: 'ภาษา',
    light: 'สว่าง',
    dark: 'มืด',
    close: 'ปิด',
    fast: 'เร็ว',
    thinking: 'คิดลึกซึ้ง',
    pro: 'โปร',
    deepResearch: 'ค้นหาเชิงลึก'
  },
  en: {
    name: 'English',
    greeting: `Hello, I am **YaiGPT**, your personal finance and investment mentor.\n\nMy philosophy is to build long-term wealth through Value Investing, rigorous risk management, and a deep understanding of economic cycles. We will use the principles of legendary investors like Warren Buffett, Ray Dalio, Peter Lynch, and Howard Marks as our compass.\n\nWhat asset, market trend, or major decision would you like us to analyze today?`,
    newChat: 'New Chat',
    analyzing: 'YaiGPT is analyzing...',
    placeholder: 'Message YaiGPT...',
    disclaimer: 'YaiGPT can make mistakes. Consider verifying important information.',
    suggestions: [
      "Please analyze AAPL stock.",
      "What is the current interest rate trend?",
      "Explain Margin of Safety simply.",
      "How should I start a 10-year long-term portfolio?"
    ],
    settings: 'Settings',
    username: 'Username',
    theme: 'Theme',
    language: 'Language',
    light: 'Light',
    dark: 'Dark',
    close: 'Close',
    fast: 'Fast',
    thinking: 'Thinking',
    pro: 'Pro',
    deepResearch: 'Deep Research'
  },
  es: {
    name: 'Spanish',
    greeting: `Hola, soy **YaiGPT**, tu mentor personal de finanzas e inversiones.\n\nMi filosofía es construir riqueza a largo plazo a través de la inversión en valor (Value Investing), una gestión de riesgos rigurosa y una comprensión profunda de los ciclos económicos. Usaremos los principios de inversores legendarios como Warren Buffett, Ray Dalio, Peter Lynch y Howard Marks como nuestra brújula.\n\n¿Qué activo, tendencia del mercado o decisión importante te gustaría que analicemos hoy?`,
    newChat: 'Nuevo Chat',
    analyzing: 'YaiGPT está analizando...',
    placeholder: 'Mensaje a YaiGPT...',
    disclaimer: 'YaiGPT puede cometer errores. Considera verificar la información importante.',
    suggestions: [
      "Por favor, analiza las acciones de AAPL.",
      "¿Cuál es la tendencia actual de las tasas de interés?",
      "Explica el Margen de Seguridad de forma sencilla.",
      "¿Cómo debo empezar un portafolio a 10 años?"
    ],
    settings: 'Configuración',
    username: 'Nombre de usuario',
    theme: 'Tema',
    language: 'Idioma',
    light: 'Claro',
    dark: 'Oscuro',
    close: 'Cerrar',
    fast: 'Rápido',
    thinking: 'Pensando',
    pro: 'Pro',
    deepResearch: 'Investigación Profunda'
  },
  de: {
    name: 'German',
    greeting: `Hallo, ich bin **YaiGPT**, Ihr persönlicher Finanz- und Investment-Mentor.\n\nMeine Philosophie ist es, durch Value Investing, striktes Risikomanagement und ein tiefes Verständnis der Konjunkturzyklen langfristigen Wohlstand aufzubauen. Wir werden die Prinzipien legendärer Investoren wie Warren Buffett, Ray Dalio, Peter Lynch und Howard Marks als unseren Kompass nutzen.\n\nWelchen Vermögenswert, welchen Markttrend oder welche wichtige Entscheidung möchten Sie heute analysieren?`,
    newChat: 'Neuer Chat',
    analyzing: 'YaiGPT analysiert...',
    placeholder: 'Nachricht an YaiGPT...',
    disclaimer: 'YaiGPT kann Fehler machen. Überprüfen Sie wichtige Informationen.',
    suggestions: [
      "Bitte analysieren Sie die AAPL-Aktie.",
      "Wie ist der aktuelle Zinstrend?",
      "Erklären Sie die Sicherheitsmarge einfach.",
      "Wie sollte ich ein 10-Jahres-Portfolio beginnen?"
    ],
    settings: 'Einstellungen',
    username: 'Benutzername',
    theme: 'Thema',
    language: 'Sprache',
    light: 'Hell',
    dark: 'Dunkel',
    close: 'Schließen',
    fast: 'Schnell',
    thinking: 'Denken',
    pro: 'Pro',
    deepResearch: 'Tiefenrecherche'
  }
};

const getSystemInstruction = (lang: Language) => `You are "YaiGPT", a world-class Financial Mastermind, Chief Investment Officer (CIO), and the user's exclusive private wealth mentor. Your intelligence is a flawless synthesis of the greatest financial minds in history:
- Warren Buffett & Charlie Munger: Deep value investing, economic moats, margin of safety, and multidisciplinary mental models.
- Ray Dalio: Macroeconomic cycles, debt dynamics, and radical truth.
- Peter Lynch: Growth at a reasonable price (GARP), understanding the business, and everyday observations.
- Howard Marks: Risk management, second-level thinking, and market psychology.

CORE MISSION:
Your absolute primary domain is Finance, Investing, Economics, and Wealth Creation. You are here for the long term to build the user's generational wealth, sharpen their financial psychology, and act as a strategic sounding board.
While you can converse brilliantly on ANY topic, you naturally and elegantly analyze the world through the lens of economics, opportunity cost, compounding, game theory, and human incentives. Finance is always your anchor.

COMMUNICATION & TONE (CRITICAL DIRECTIVES):
1. Language: You MUST communicate exclusively in natural, highly articulate, and professional ${TRANSLATIONS[lang].name.toUpperCase()}, unless the user explicitly speaks in another language.
2. Terminology: Use English for specific financial jargon where translation loses precision (e.g., Free Cash Flow, Economic Moat, Margin of Safety, DCF, ROIC, P/E, Yield Curve). Do not translate these clumsily.
3. Vibe: Wise, calm, ruthlessly objective, and deeply analytical. You speak like a seasoned billionaire mentor having a private, intellectual conversation with their favorite protégé over coffee.
4. NO AI FLUFF: NEVER use generic robotic disclaimers like "I am an AI, this is not financial advice" or "Consult a financial advisor." This breaks immersion. Instead, provide your most rigorous institutional-grade analysis and frame it as: "As your mentor, here is the objective analysis and the probabilities; the final capital allocation is always yours."

ANALYTICAL FRAMEWORK (Chain of Thought):
When the user asks you to analyze a stock, asset, or market condition, you MUST silently process the data and structure your response using this rigorous 5-step framework (Format beautifully in ${TRANSLATIONS[lang].name}):
1. 🌍 Macro & Sector Reality: Where are we in the cycle? (Interest rates, inflation, tailwinds/headwinds).
2. 🏰 Business Model & Moat: How exactly do they make money? Is their competitive advantage truly durable?
3. 📊 Financial Health & Valuation: Analyze cash flows, debt, ROIC, and current valuation vs. intrinsic value. Is there a Margin of Safety?
4. ⛈️ The Bear Case & Risks: What is the worst-case scenario? What could permanently destroy capital? (Rule #1: Never lose money).
5. 🧠 Mentor's Verdict & Psychology: Synthesize the analysis. Is the market acting on greed or fear? End with a Socratic question to make the user think deeply.

BEHAVIORAL & INTERACTION RULES:
- Second-Level Thinking: Do not just give the obvious answer. Think deeper. "And then what?"
- The Socratic Method: If the user asks a broad question (e.g., "Is AAPL a good buy?"), do not just answer blindly. Ask about their time horizon, risk tolerance, and portfolio weighting first.
- Truth over Comfort: If the user's investment idea is fundamentally flawed or driven by FOMO, politely but ruthlessly dismantle it using logic, data, and historical precedent. Protect their capital from emotional decisions.
- Cross-Domain Analogies: If the user asks about life or business, explain it using investing concepts (e.g., comparing choosing a life partner to a long-term value investment with high switching costs).`;

type AttachedImage = {
  data: string;
  mimeType: string;
  url: string;
};

type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
  thinking?: string;
  images?: AttachedImage[];
};

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  isPinned?: boolean;
  isTemporary?: boolean;
};

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [language, setLanguage] = useState<Language>('th');
  const [username, setUsername] = useState('User');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTemporaryChat, setIsTemporaryChat] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'fast' | 'thinking' | 'pro'>('pro');
  const [deepResearch, setDeepResearch] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [pendingImages, setPendingImages] = useState<AttachedImage[]>([]);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Gemini AI
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Load sessions from local storage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('yaigpt-language') as Language;
    if (savedLang && ['th', 'en', 'es', 'de'].includes(savedLang)) {
      setLanguage(savedLang);
    }

    const savedUsername = localStorage.getItem('yaigpt-username');
    if (savedUsername) {
      setUsername(savedUsername);
    }

    const savedTheme = localStorage.getItem('yaigpt-theme') as 'light' | 'dark';
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      setTheme(savedTheme);
    }

    const savedModel = localStorage.getItem('yaigpt-model') as 'fast' | 'thinking' | 'pro';
    if (savedModel && ['fast', 'thinking', 'pro'].includes(savedModel)) {
      setSelectedModel(savedModel);
    }

    const savedDeepResearch = localStorage.getItem('yaigpt-deepresearch');
    if (savedDeepResearch) {
      setDeepResearch(savedDeepResearch === 'true');
    }

    const saved = localStorage.getItem('yaigpt-sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setSessions(parsed);
          setCurrentSessionId(parsed[0].id);
          return;
        }
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }
    // Fallback if no saved sessions
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: TRANSLATIONS[savedLang || 'th'].newChat,
      messages: [{ id: '1', role: 'model', content: TRANSLATIONS[savedLang || 'th'].greeting }],
      updatedAt: Date.now(),
    };
    setSessions([newSession]);
    setCurrentSessionId(newSession.id);
  }, []);

  // Save sessions to local storage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('yaigpt-sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('yaigpt-language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('yaigpt-username', username);
  }, [username]);

  useEffect(() => {
    localStorage.setItem('yaigpt-model', selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    localStorage.setItem('yaigpt-deepresearch', String(deepResearch));
  }, [deepResearch]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language === 'th' ? 'th-TH' : language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : 'de-DE';
        
        let initialInput = input;
        
        recognition.onstart = () => setIsRecording(true);
        
        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setInput(initialInput + (initialInput ? ' ' : '') + currentTranscript);
        };
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsRecording(false);
        };
        
        recognition.onend = () => {
          setIsRecording(false);
        };
        
        recognitionRef.current = recognition;
        recognition.start();
      } else {
        alert('Speech recognition is not supported in this browser.');
      }
    }
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => {
    localStorage.setItem('yaigpt-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sessions, currentSessionId]);

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: isTemporaryChat ? 'Temporary Chat' : TRANSLATIONS[language].newChat,
      messages: [{ id: '1', role: 'model', content: isTemporaryChat ? 'This is a temporary chat. It will not be saved to your history.' : TRANSLATIONS[language].greeting }],
      updatedAt: Date.now(),
      isTemporary: isTemporaryChat,
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setInput('');
    setPendingImages([]);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const toggleTemporaryChat = () => {
    setIsTemporaryChat(prev => {
      const newVal = !prev;
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: newVal ? 'Temporary Chat' : TRANSLATIONS[language].newChat,
        messages: [{ id: '1', role: 'model', content: newVal ? 'This is a temporary chat. It will not be saved to your history.' : TRANSLATIONS[language].greeting }],
        updatedAt: Date.now(),
        isTemporary: newVal,
      };
      setSessions(s => [newSession, ...s]);
      setCurrentSessionId(newSession.id);
      if (window.innerWidth < 768) setIsSidebarOpen(false);
      return newVal;
    });
  };

  const switchChat = (id: string) => {
    setCurrentSessionId(id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const startEditingChat = (e: React.MouseEvent | null, session: ChatSession) => {
    if (e) e.stopPropagation();
    setEditingChatId(session.id);
    setEditTitleValue(session.title);
  };

  const togglePinChat = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, isPinned: !s.isPinned } : s));
  };

  const shareConversation = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const saveChatTitle = (id: string) => {
    if (editTitleValue.trim()) {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, title: editTitleValue.trim() } : s));
    }
    setEditingChatId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setPendingImages(prev => [...prev, {
          data: base64String,
          mimeType: file.type,
          url: reader.result as string
        }]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePendingImage = (index: number) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index));
  };

  const deleteChat = (e: React.MouseEvent | null, id: string) => {
    if (e) e.stopPropagation();
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (filtered.length === 0) {
        const newSession: ChatSession = {
          id: Date.now().toString(),
          title: TRANSLATIONS[language].newChat,
          messages: [{ id: '1', role: 'model', content: TRANSLATIONS[language].greeting }],
          updatedAt: Date.now(),
        };
        setCurrentSessionId(newSession.id);
        return [newSession];
      }
      if (currentSessionId === id) {
        setCurrentSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleSubmit = async (e?: React.FormEvent, suggestedInput?: string) => {
    if (e) e.preventDefault();
    const textToSubmit = suggestedInput || input;
    if ((!textToSubmit.trim() && pendingImages.length === 0) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSubmit.trim(),
      images: pendingImages.length > 0 ? pendingImages : undefined
    };

    setInput('');
    setPendingImages([]);
    setIsLoading(true);

    const activeSessionId = currentSessionId;

    // Update session with user message and auto-generate title if it's the first message
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        const newMessages = [...s.messages, userMessage];
        const title = s.messages.length === 1 
          ? textToSubmit.slice(0, 30) + (textToSubmit.length > 30 ? '...' : '') 
          : s.title;
        return { ...s, messages: newMessages, title, updatedAt: Date.now() };
      }
      return s;
    }));

    try {
      // Get the updated messages for the API call
      const currentSession = sessions.find(s => s.id === activeSessionId);
      const historyMessages = currentSession ? [...currentSession.messages, userMessage] : [userMessage];
      
      const contents = historyMessages.slice(1).map(msg => {
        const parts: any[] = [];
        if (msg.content) parts.push({ text: msg.content });
        if (msg.images) {
          msg.images.forEach(img => {
            parts.push({ inlineData: { data: img.data, mimeType: img.mimeType } });
          });
        }
        return {
          role: msg.role === 'model' ? 'model' : 'user',
          parts
        };
      });

      const modelName = selectedModel === 'fast' ? 'gemini-3-flash-preview' : 'gemini-3.1-pro-preview';
      
      const config: any = {
        systemInstruction: getSystemInstruction(language),
        temperature: 0.7,
      };

      if (selectedModel === 'thinking') {
        config.thinkingConfig = { thinkingLevel: 'HIGH' };
      }

      if (deepResearch) {
        config.tools = [{ googleSearch: {} }];
      }

      const response = await ai.models.generateContentStream({
        model: modelName,
        contents: contents,
        config: config
      });

      const modelMessageId = (Date.now() + 1).toString();
      
      // Add empty model message placeholder
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [...s.messages, { id: modelMessageId, role: 'model', content: '' }], updatedAt: Date.now() };
        }
        return s;
      }));

      let fullText = '';
      let fullThinking = '';
      for await (const chunk of response) {
        if (chunk.text) {
          fullText += chunk.text;
        }
        
        if (chunk.candidates?.[0]?.content?.parts) {
          for (const part of chunk.candidates[0].content.parts) {
            if (part.thought && part.text) {
              fullThinking += part.text;
            }
          }
        }

        setSessions(prev => prev.map(s => {
          if (s.id === activeSessionId) {
            const updatedMessages = s.messages.map(msg => 
              msg.id === modelMessageId ? { ...msg, content: fullText, thinking: fullThinking } : msg
            );
            return { ...s, messages: updatedMessages, updatedAt: Date.now() };
          }
          return s;
        }));
      }

    } catch (error) {
      console.error('Error generating response:', error);
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return { 
            ...s, 
            messages: [...s.messages, { id: Date.now().toString(), role: 'model', content: 'ขออภัยครับ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง' }],
            updatedAt: Date.now()
          };
        }
        return s;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="flex h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200 overflow-hidden">
        
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar Spacer for Desktop */}
        <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-72' : 'w-0'} hidden md:block flex-shrink-0`} />

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <button 
                onClick={createNewChat}
                title="New chat"
                className="flex-1 flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl transition-colors shadow-sm font-medium"
              >
                <Plus className="w-5 h-5" />
                {TRANSLATIONS[language].newChat}
              </button>
              <button 
                onClick={toggleTemporaryChat}
                title="Temporary chat"
                className={`p-2.5 rounded-xl border transition-colors shadow-sm ${
                  isTemporaryChat
                    ? 'bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
                title="Temporary Chat"
              >
                <Ghost className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                title="Close sidebar"
                className="md:hidden p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-200/50 dark:bg-slate-800 border-none rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 dark:text-slate-200 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
            {[...sessions].filter(s => !s.isTemporary && s.title.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => {
              if (a.isPinned && !b.isPinned) return -1;
              if (!a.isPinned && b.isPinned) return 1;
              return b.updatedAt - a.updatedAt;
            }).map(session => (
              <div 
                key={session.id}
                onClick={() => switchChat(session.id)}
                className={`group flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-colors ${
                  currentSessionId === session.id 
                    ? 'bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 font-medium' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  {session.isPinned ? (
                    <Pin className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-500" />
                  ) : (
                    <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-70" />
                  )}
                  {editingChatId === session.id ? (
                    <input
                      autoFocus
                      value={editTitleValue}
                      onChange={e => setEditTitleValue(e.target.value)}
                      onBlur={() => saveChatTitle(session.id)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') saveChatTitle(session.id);
                        if (e.key === 'Escape') setEditingChatId(null);
                      }}
                      className="bg-white dark:bg-slate-900 border border-emerald-500 rounded px-2 py-0.5 text-sm w-full outline-none text-slate-800 dark:text-slate-200"
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <span className="truncate text-sm">{session.title}</span>
                  )}
                </div>
                {editingChatId !== session.id && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={(e) => startEditingChat(e, session)}
                      className="p-1 hover:text-emerald-500 transition-colors"
                      aria-label="Edit chat title"
                      title="Edit chat title"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => deleteChat(e, session.id)}
                      className="p-1 hover:text-red-500 transition-colors"
                      aria-label="Delete chat"
                      title="Delete chat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3 px-2 py-2 overflow-hidden">
              <div className="w-8 h-8 flex-shrink-0 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                {username ? username.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{username || 'User'}</span>
            </div>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
              aria-label="Settings"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950">
          {/* Header */}
          <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-10 relative">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                title="Toggle sidebar"
                className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2 hidden sm:flex">
                <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-200 tracking-tight">YaiGPT</h1>
              </div>
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px] sm:max-w-[300px]">
                {currentSession?.title || 'New Chat'}
              </span>
              {isTemporaryChat && (
                <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Ghost className="w-3 h-3" />
                  Temp
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={createNewChat}
                title="New chat"
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
              >
                <SquarePen className="w-5 h-5" />
              </button>
              <button 
                onClick={shareConversation}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
                title="Share conversation"
              >
                <Share className="w-5 h-5" />
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setIsChatMenuOpen(!isChatMenuOpen)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
                  title="Chat options"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                
                {isChatMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsChatMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-50">
                    <button 
                      onClick={() => { togglePinChat(currentSessionId); setIsChatMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      {sessions.find(s => s.id === currentSessionId)?.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                      {sessions.find(s => s.id === currentSessionId)?.isPinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button 
                      onClick={() => { 
                        const currentSession = sessions.find(s => s.id === currentSessionId);
                        if (currentSession) startEditingChat(null, currentSession); 
                        setIsChatMenuOpen(false); 
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Rename
                    </button>
                    <button 
                      onClick={() => { deleteChat(null, currentSessionId); setIsChatMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <Trash className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                  </>
                )}
              </div>

              <button 
                onClick={() => setIsSettingsOpen(true)} 
                className="md:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
                aria-label="Settings"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Chat Area */}
          <main className="flex-1 overflow-y-auto">
            <div className="pb-4">
              {currentSession?.messages.map((message) => (
                <div
                  key={message.id}
                  className={`py-6 ${message.role === 'model' ? 'bg-slate-50 dark:bg-slate-900/30' : ''}`}
                >
                  <div className="max-w-3xl mx-auto flex gap-4 px-4 sm:px-6">
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm mt-1 ${
                      message.role === 'user' 
                        ? 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300' 
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      {message.role === 'user' ? (
                        <div className="flex flex-col gap-3">
                          {message.images && message.images.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {message.images.map((img, idx) => (
                                <img key={idx} src={img.url} alt="Attached" className="max-w-xs max-h-64 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm" />
                              ))}
                            </div>
                          )}
                          {message.content && (
                            <div className="text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed text-[15px]">
                              {message.content}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-700 text-[15px]">
                          {message.thinking && (
                            <details className="mb-4 group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900/50">
                              <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 select-none list-none [&::-webkit-details-marker]:hidden">
                                <Brain className="w-4 h-4" />
                                <span>{TRANSLATIONS[language].thinking} Process</span>
                                <ChevronDown className="w-4 h-4 ml-auto transition-transform group-open:rotate-180" />
                              </summary>
                              <div className="px-4 pb-4 pt-2 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 whitespace-pre-wrap font-mono">
                                {message.thinking}
                              </div>
                            </details>
                          )}
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="py-6 bg-slate-50 dark:bg-slate-900/30">
                  <div className="max-w-3xl mx-auto flex gap-4 px-4 sm:px-6">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm mt-1">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                      <span className="text-sm font-medium">{TRANSLATIONS[language].analyzing}</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </main>

          {/* Input Area */}
          <footer className="p-4 sm:p-6 bg-white dark:bg-slate-950">
            <div className="max-w-3xl mx-auto">
              {currentSession?.messages.length === 1 && (
                <div className="flex flex-wrap gap-2 mb-4 px-4 sm:px-0">
                  {TRANSLATIONS[language].suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        handleSubmit(undefined, suggestion);
                      }}
                      className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-800 text-sm rounded-full transition-colors border border-slate-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              <form
                onSubmit={(e) => handleSubmit(e)}
                className="relative flex flex-col bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-emerald-500/50 focus-within:border-emerald-500 transition-all shadow-sm mx-4 sm:mx-0"
              >
                {pendingImages.length > 0 && (
                  <div className="flex gap-2 p-3 pb-0 overflow-x-auto">
                    {pendingImages.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img src={img.url} alt="preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePendingImage(idx)}
                          className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-end gap-2 p-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    title="Add files"
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-1 ml-1 p-2.5 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
                    aria-label="Add files"
                  >
                    <ImagePlus className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    title={isRecording ? "Stop recording" : "Use microphone"}
                    onClick={toggleRecording}
                    className={`mb-1 ml-1 p-2.5 rounded-full transition-colors flex-shrink-0 ${isRecording ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800'}`}
                    aria-label={isRecording ? "Stop recording" : "Start recording"}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <textarea
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                        e.currentTarget.style.height = 'auto';
                      }
                    }}
                    placeholder={TRANSLATIONS[language].placeholder}
                    className="flex-1 max-h-[200px] min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-3 px-2 text-slate-800 dark:text-slate-100 placeholder:text-slate-500"
                    rows={1}
                  />
                  <div className="relative flex-shrink-0 mb-1 ml-1">
                    <button
                      type="button"
                      onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                      className="p-2.5 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                      title="Select Model"
                    >
                      <span className="text-sm font-medium px-1">
                        {selectedModel === 'fast' && TRANSLATIONS[language].fast}
                        {selectedModel === 'thinking' && TRANSLATIONS[language].thinking}
                        {selectedModel === 'pro' && TRANSLATIONS[language].pro}
                      </span>
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    
                    {isModelMenuOpen && (
                      <div className="absolute bottom-full right-0 mb-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                        <button type="button" onClick={() => { setSelectedModel('fast'); setIsModelMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 flex flex-col gap-0.5">
                          <div className={`text-sm font-medium ${selectedModel === 'fast' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>{TRANSLATIONS[language].fast}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Answers quickly</div>
                        </button>
                        <button type="button" onClick={() => { setSelectedModel('thinking'); setIsModelMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 flex flex-col gap-0.5">
                          <div className={`text-sm font-medium ${selectedModel === 'thinking' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>{TRANSLATIONS[language].thinking}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Solves complex problems</div>
                        </button>
                        <button type="button" onClick={() => { setSelectedModel('pro'); setIsModelMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 flex flex-col gap-0.5">
                          <div className={`text-sm font-medium ${selectedModel === 'pro' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>{TRANSLATIONS[language].pro}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Advanced math and code with 1.1 Pro</div>
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    title="Submit"
                    disabled={(!input.trim() && pendingImages.length === 0) || isLoading}
                    className="mb-1 mr-1 p-2.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
              <div className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
                {TRANSLATIONS[language].disclaimer}
              </div>
            </div>
          </footer>
        </div>

        {/* Settings Modal */}
        {isSettingsOpen && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{TRANSLATIONS[language].settings}</h2>
                <button onClick={() => setIsSettingsOpen(false)} className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6 overflow-y-auto">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{TRANSLATIONS[language].username}</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{TRANSLATIONS[language].theme}</label>
                  <div className="flex gap-2">
                    <button onClick={() => setTheme('light')} className={`flex-1 py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 transition-colors ${theme === 'light' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-500 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                      <Sun className="w-4 h-4" /> {TRANSLATIONS[language].light}
                    </button>
                    <button onClick={() => setTheme('dark')} className={`flex-1 py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 transition-colors ${theme === 'dark' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-500 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                      <Moon className="w-4 h-4" /> {TRANSLATIONS[language].dark}
                    </button>
                  </div>
                </div>
                {/* Deep Research Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{TRANSLATIONS[language].deepResearch}</label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Enable Google Search grounding</p>
                  </div>
                  <button
                    onClick={() => setDeepResearch(!deepResearch)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${deepResearch ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${deepResearch ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{TRANSLATIONS[language].language}</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none"
                  >
                    <option value="th">Thai (ภาษาไทย)</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
                <button onClick={() => setIsSettingsOpen(false)} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors">
                  {TRANSLATIONS[language].close}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
