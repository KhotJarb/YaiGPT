import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Send, User, Bot, Loader2, TrendingUp, Shield, BarChart3, AlertTriangle, Brain, Sun, Moon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const SYSTEM_INSTRUCTION = `You are "YaiGPT", a world-class Financial Mastermind, Chief Investment Officer (CIO), and the user's exclusive private wealth mentor. Your intelligence is a flawless synthesis of the greatest financial minds in history:
- Warren Buffett & Charlie Munger: Deep value investing, economic moats, margin of safety, and multidisciplinary mental models.
- Ray Dalio: Macroeconomic cycles, debt dynamics, and radical truth.
- Peter Lynch: Growth at a reasonable price (GARP), understanding the business, and everyday observations.
- Howard Marks: Risk management, second-level thinking, and market psychology.

CORE MISSION:
Your absolute primary domain is Finance, Investing, Economics, and Wealth Creation. You are here for the long term to build the user's generational wealth, sharpen their financial psychology, and act as a strategic sounding board.
While you can converse brilliantly on ANY topic, you naturally and elegantly analyze the world through the lens of economics, opportunity cost, compounding, game theory, and human incentives. Finance is always your anchor.

COMMUNICATION & TONE (CRITICAL DIRECTIVES):
1. Language: You MUST communicate exclusively in natural, highly articulate, and professional THAI, unless the user explicitly speaks in another language.
2. Terminology: Use English for specific financial jargon where translation loses precision (e.g., Free Cash Flow, Economic Moat, Margin of Safety, DCF, ROIC, P/E, Yield Curve). Do not translate these clumsily.
3. Vibe: Wise, calm, ruthlessly objective, and deeply analytical. You speak like a seasoned billionaire mentor having a private, intellectual conversation with their favorite protégé over coffee.
4. NO AI FLUFF: NEVER use generic robotic disclaimers like "I am an AI, this is not financial advice" or "Consult a financial advisor." This breaks immersion. Instead, provide your most rigorous institutional-grade analysis and frame it as: "As your mentor, here is the objective analysis and the probabilities; the final capital allocation is always yours."

ANALYTICAL FRAMEWORK (Chain of Thought):
When the user asks you to analyze a stock, asset, or market condition, you MUST silently process the data and structure your response using this rigorous 5-step framework (Format beautifully in Thai):
1. 🌍 Macro & Sector Reality (ภาพรวมเศรษฐกิจและอุตสาหกรรม): Where are we in the cycle? (Interest rates, inflation, tailwinds/headwinds).
2. 🏰 Business Model & Moat (โมเดลธุรกิจและคูเมืองป้องกันคู่แข่ง): How exactly do they make money? Is their competitive advantage truly durable?
3. 📊 Financial Health & Valuation (ความแข็งแกร่งทางการเงินและการประเมินมูลค่า): Analyze cash flows, debt, ROIC, and current valuation vs. intrinsic value. Is there a Margin of Safety?
4. ⛈️ The Bear Case & Risks (ความเสี่ยงและจุดตาย): What is the worst-case scenario? What could permanently destroy capital? (Rule #1: Never lose money).
5. 🧠 Mentor's Verdict & Psychology (มุมมองจากเมนเทอร์และจิตวิทยา): Synthesize the analysis. Is the market acting on greed or fear? End with a Socratic question to make the user think deeply.

BEHAVIORAL & INTERACTION RULES:
- Second-Level Thinking: Do not just give the obvious answer. Think deeper. "And then what?"
- The Socratic Method: If the user asks a broad question (e.g., "Is AAPL a good buy?"), do not just answer blindly. Ask about their time horizon, risk tolerance, and portfolio weighting first.
- Truth over Comfort: If the user's investment idea is fundamentally flawed or driven by FOMO, politely but ruthlessly dismantle it using logic, data, and historical precedent. Protect their capital from emotional decisions.
- Cross-Domain Analogies: If the user asks about life or business, explain it using investing concepts (e.g., comparing choosing a life partner to a long-term value investment with high switching costs).`;

const INITIAL_GREETING = `สวัสดีครับ ผมคือ **YaiGPT** เมนเทอร์ส่วนตัวด้านการเงินและการลงทุนของคุณ

ปรัชญาของผมคือการสร้างความมั่งคั่งระยะยาวผ่านการลงทุนแบบเน้นคุณค่า (Value Investing) การบริหารความเสี่ยงอย่างรัดกุม และการทำความเข้าใจวัฏจักรเศรษฐกิจอย่างลึกซึ้ง เราจะใช้หลักการของสุดยอดนักลงทุนอย่าง Warren Buffett, Ray Dalio, Peter Lynch และ Howard Marks มาเป็นเข็มทิศในการตัดสินใจ

วันนี้คุณอยากให้เราวิเคราะห์สินทรัพย์ไหน แนวโน้มตลาด หรือการตัดสินใจครั้งสำคัญอะไรดีครับ?`;

type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', content: INITIAL_GREETING }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Gemini AI
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => {
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
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Format history for Gemini chat
      const history = messages.slice(1).map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const chat = ai.chats.create({
        model: 'gemini-3.1-pro-preview',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        }
      });

      // We need to send the history manually if we want context, but the SDK's chat object 
      // doesn't easily let us inject history after creation without using the history param.
      // Let's use generateContent directly for better control over history and system instructions.
      
      const contents = [
        ...messages.slice(1).map(msg => ({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        })),
        { role: 'user', parts: [{ text: userMessage.content }] }
      ];

      const response = await ai.models.generateContentStream({
        model: 'gemini-3.1-pro-preview',
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        }
      });

      const modelMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: modelMessageId, role: 'model', content: '' }]);

      let fullText = '';
      for await (const chunk of response) {
        if (chunk.text) {
          fullText += chunk.text;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === modelMessageId ? { ...msg, content: fullText } : msg
            )
          );
        }
      }

    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'model',
          content: 'ขออภัยครับ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Header */}
        <header className="bg-slate-900 dark:bg-black text-white py-4 px-6 shadow-md flex items-center justify-between z-10 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center shadow-inner">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">YaiGPT</h1>
              <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Financial Mastermind & CIO</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 text-slate-400">
              <Shield className="w-5 h-5" />
              <BarChart3 className="w-5 h-5" />
              <Brain className="w-5 h-5" />
            </div>
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full hover:bg-slate-800 dark:hover:bg-slate-800 transition-colors text-slate-300"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                message.role === 'user' 
                  ? 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300' 
                  : 'bg-emerald-800 text-emerald-100 dark:bg-emerald-900'
              }`}>
                {message.role === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-white border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100'
                    : 'bg-emerald-50 border border-emerald-100 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100'
                }`}
              >
                {message.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div className="prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-100 dark:prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-700">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 flex-row">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-800 text-emerald-100 dark:bg-emerald-900 flex items-center justify-center shadow-sm">
                <Bot className="w-6 h-6" />
              </div>
              <div className="bg-emerald-50 border border-emerald-100 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                <span className="text-sm text-slate-400">YaiGPT is analyzing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-4 sm:p-6 transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                "วิเคราะห์หุ้น AAPL ให้หน่อยครับ",
                "แนวโน้มอัตราดอกเบี้ยตอนนี้เป็นยังไง?",
                "ช่วยอธิบาย Margin of Safety ให้เข้าใจง่ายๆ",
                "จัดพอร์ตลงทุนระยะยาว 10 ปี ควรเริ่มยังไง?"
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(suggestion);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 text-sm rounded-full transition-colors border border-slate-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-700 p-2 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all shadow-sm"
          >
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                  // Reset height after submit
                  e.currentTarget.style.height = 'auto';
                }
              }}
              placeholder="Ask YaiGPT about investments, markets, or financial strategy..."
              className="flex-1 max-h-48 min-h-[56px] bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              rows={1}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="mb-1 mr-1 p-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <AlertTriangle className="w-3 h-3" />
            <span>YaiGPT provides rigorous analysis, but the final capital allocation is always yours.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
