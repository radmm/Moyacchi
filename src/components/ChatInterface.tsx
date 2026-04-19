import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, MessageCircle, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';
import { chatWithMoyacchi } from '../lib/geminiService';
import Mascot from './Mascot';

interface ChatInterfaceProps {
  onClose: () => void;
  isEmbedded?: boolean;
}

export default function ChatInterface({ onClose, isEmbedded = false }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: "Hi! I'm Moyacchi. I'm here to help you brainstorm easy ways to live greener. What's on your mind? 🌿" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithMoyacchi([...messages, userMsg]);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const containerClasses = isEmbedded 
    ? "flex flex-col h-full w-full overflow-hidden" 
    : "glass-card flex flex-col h-[500px] w-full max-w-lg mx-auto overflow-hidden border-primary/20";

  return (
    <motion.div 
      initial={isEmbedded ? {} : { opacity: 0, y: 20 }}
      animate={isEmbedded ? {} : { opacity: 1, y: 0 }}
      exit={isEmbedded ? {} : { opacity: 0, y: 20 }}
      className={containerClasses}
    >
      {/* Header - Only show if not embedded */}
      {!isEmbedded && (
        <div className="p-4 border-b border-glass-border flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-sm tracking-widest uppercase">Wholesome Chat</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div 
        ref={scrollRef}
        className={`flex-1 overflow-y-auto ${isEmbedded ? 'px-0 py-6' : 'p-6'} space-y-6 flex flex-col scrollbar-hide`}
      >
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-primary text-black font-medium' 
                  : 'bg-white/5 border border-glass-border text-text-main'
              }`}>
                <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-headings:mb-2 prose-headings:mt-4 first:prose-headings:mt-0">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-white/5 p-4 rounded-2xl flex gap-2 items-center">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-75" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-glass-border bg-white/5">
        <div className="flex gap-3">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Moyacchi anything..."
            className="flex-1 glass-input py-3 px-5 text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-primary text-black rounded-xl hover:bg-primary/80 transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
