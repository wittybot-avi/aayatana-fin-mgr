
import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToAgent } from '../services/geminiService';
import { Send, Bot, User, Loader2, Sparkles, FileSpreadsheet, Receipt } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  toolCalls?: any[];
}

export const FinanceAgent = () => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', role: 'assistant', text: `Hello ${user?.name.split(' ')[0]}! I'm your Finance AI Assistant (Gemini). I can help you analyze burn rate, check grant utilization, or log expenses.` }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Filter history for context
    const history = messages.map(m => ({
      role: m.role,
      text: m.text
    }));

    try {
        const result = await sendMessageToAgent(userMsg.text, history, user || undefined);
        
        const botMsg: Message = { 
            id: (Date.now() + 1).toString(), 
            role: 'assistant', 
            text: result.text || "I processed that, but have no text response.",
            toolCalls: result.toolCalls 
        };
        setMessages(prev => [...prev, botMsg]);
    } catch (e) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: "Sorry, I encountered an error." }]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (type: 'excel' | 'invoice') => {
    const fileName = type === 'excel' ? 'transactions_batch.xlsx' : 'invoice_sep23.pdf';
    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      text: `[Uploaded File: ${fileName}] - Please analyze this.` 
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    
    setTimeout(() => {
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        text: `I've received the ${type === 'excel' ? 'spreadsheet' : 'invoice'} (${fileName}). I'm processing the data now... (Mock functionality)` 
      };
      setMessages(prev => [...prev, botMsg]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
           <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2 rounded-lg text-white">
             <Sparkles size={18} />
           </div>
           <div>
             <h3 className="font-semibold text-slate-800">Finance AI</h3>
             <p className="text-xs text-slate-500">Powered by Gemini</p>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
               <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
               {msg.toolCalls && msg.toolCalls.length > 0 && (
                 <div className="mt-2 pt-2 border-t border-slate-200/20 text-xs opacity-70">
                   {msg.toolCalls.map((tc: any, i: number) => (
                     <div key={i} className="flex items-center space-x-1">
                       <Bot size={10} />
                       <span>Executed: {tc.name}</span>
                     </div>
                   ))}
                 </div>
               )}
             </div>
          </div>
        ))}
        {loading && (
           <div className="flex justify-start">
             <div className="bg-slate-100 rounded-2xl p-4 flex items-center space-x-2">
               <Loader2 className="animate-spin text-indigo-500" size={16} />
               <span className="text-sm text-slate-500">Thinking...</span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex items-end space-x-2 max-w-4xl mx-auto">
          <div className="flex space-x-1 mb-1">
             <button onClick={() => handleFileUpload('excel')} className="p-2 text-slate-400 hover:text-green-600 hover:bg-slate-50 rounded-full transition-colors" title="Upload Excel">
               <FileSpreadsheet size={20} />
             </button>
             <button onClick={() => handleFileUpload('invoice')} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-colors" title="Upload Invoice">
               <Receipt size={20} />
             </button>
          </div>

          <div className="flex-1 relative">
             <input
               ref={inputRef}
               type="text"
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={handleKeyDown}
               placeholder="Ask about burn rate, runway, or log an expense..."
               className="w-full pl-4 pr-12 py-3 bg-slate-800 border-slate-700 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
               disabled={loading}
             />
             <button 
               onClick={handleSend} 
               disabled={!input.trim() || loading}
               className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
             >
               <Send size={16} />
             </button>
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-2">
          AI can make mistakes. Verify important financial data.
        </p>
      </div>
    </div>
  );
};
