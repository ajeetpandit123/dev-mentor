'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Code2, 
  Sparkles, 
  Paperclip,
  Smile,
  MoreVertical
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatMentorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Technical Mentor. I've analyzed your recent projects and resume. How can I help you grow today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState('smilies');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);


  const EMOJI_DATA: any = {
    smilies: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😋', '😛', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖'],
    people: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶', '👣', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄'],
    tech: ['💻', '🖥️', '🖨️', '⌨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📱', '📲', '☎️', '📞', '📟', '📠', '🔋', '🔌', '💾', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️'],
    symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳']
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setInput(prev => `${prev}\n\n[File Attached: ${file.name}]\n${content.slice(0, 1000)}...`);
      };
      reader.readAsText(file);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setInput(prev => prev + emoji);
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;


    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      
      const fetchResponse = async () => {
        setIsLoading(true);
        setShowEmojis(false);
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              messages: newMessages.map(m => ({ role: m.role, content: m.content }))
            }),
          });

          const data = await response.json();
          if (data.error) throw new Error(data.error);

          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.content,
            timestamp: new Date()
          };
          setMessages(m => [...m, aiMessage]);
        } catch (err) {
          console.error('Chat Error:', err);
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again in a moment.",
            timestamp: new Date()
          };
          setMessages(m => [...m, errorMessage]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchResponse();
      return newMessages;
    });

    setInput('');
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
        {/* Chat Header */}
        <div className="bg-card border border-border rounded-t-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20">
                <Bot className="w-6 h-6" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
            </div>
            <div>
              <h3 className="font-bold text-sm flex items-center gap-2">
                AI Mentor 
              </h3>
              <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Online & Context-Aware</p>
            </div>
          </div>
          <button className="text-muted-foreground hover:text-foreground">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto bg-white/[0.01] border-x border-border p-6 space-y-6 custom-scrollbar"
        >
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-muted-foreground'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground font-medium rounded-tr-none' 
                    : 'bg-card border border-border rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border p-4 rounded-2xl rounded-tl-none flex gap-1">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="bg-card border border-border rounded-b-2xl p-4">
          <div className="flex items-center gap-4 bg-background border border-border rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-primary/50 transition-all relative">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload}
              className="hidden" 
              accept=".txt,.js,.ts,.tsx,.json,.md"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <textarea 
              placeholder="Ask about your projects, skills, or career path..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 bg-transparent border-none outline-none text-sm py-2 resize-none h-10 max-h-32 overflow-y-auto custom-scrollbar"
            />
            <div className="flex items-center gap-2">
              <div className="relative">

                <button 
                  onClick={() => setShowEmojis(!showEmojis)}
                  className={`transition-colors ${showEmojis ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'}`}
                >
                  <Smile className="w-5 h-5" />
                </button>
                
                <AnimatePresence>
                  {showEmojis && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: -10, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="absolute bottom-full right-0 mb-4 p-0 bg-card border border-border rounded-[24px] shadow-2xl z-50 w-[320px] overflow-hidden flex flex-col"
                    >
                      {/* Emoji Categories */}
                      <div className="flex items-center gap-1 p-2 border-b border-border bg-white/5">
                        {Object.keys(EMOJI_DATA).map(cat => (
                          <button
                            key={cat}
                            onClick={() => setEmojiCategory(cat)}
                            className={`flex-1 py-1 text-[10px] font-bold uppercase rounded-lg transition-all ${
                              emojiCategory === cat ? 'bg-primary text-white' : 'hover:bg-white/10 text-muted-foreground'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Emoji Grid */}
                      <div className="p-3 grid grid-cols-6 gap-1 max-h-[250px] overflow-y-auto custom-scrollbar">
                        {EMOJI_DATA[emojiCategory].map((emoji: string, idx: number) => (
                          <button
                            key={`${emojiCategory}-${emoji}-${idx}`}
                            onClick={() => handleEmojiClick(emoji)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all text-xl active:scale-90"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg shadow-primary/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </DashboardLayout>
  );
}
