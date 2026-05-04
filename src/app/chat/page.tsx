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
  MoreVertical,
  Copy,
  Check,
  Terminal,
  Cpu,
  History,
  Plus,
  Trash2,
  Download,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

// Custom Markdown Component
const MarkdownMessage = ({ content, role }: { content: string, role: string }) => {
  if (role === 'user') return <>{content}</>;
  const lines = content.split('\n');
  return (
    <div className="space-y-4 prose prose-invert max-w-none">
      {lines.map((line, idx) => {
        if (line.startsWith('### ')) return <h3 key={idx} className="text-lg font-bold text-primary mt-4 mb-2">{line.replace('### ', '')}</h3>;
        if (line.startsWith('## ')) return <h2 key={idx} className="text-xl font-bold text-primary mt-6 mb-3">{line.replace('## ', '')}</h2>;
        if (line.startsWith('# ')) return <h1 key={idx} className="text-2xl font-black text-primary mt-8 mb-4">{line.replace('# ', '')}</h1>;
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={idx} className="ml-4 text-sm text-foreground/90">{line.substring(2)}</li>;
        if (/^\d+\. /.test(line)) return <li key={idx} className="ml-4 list-decimal text-sm text-foreground/90">{line.replace(/^\d+\. /, '')}</li>;
        const formattedLine = line.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-primary font-bold">{part}</strong> : part);
        return line.trim() === '' ? <div key={idx} className="h-2" /> : <p key={idx} className="text-sm leading-relaxed text-foreground/90">{formattedLine}</p>;
      })}
    </div>
  );
};

import { useSearchParams } from 'next/navigation';

export default function ChatMentorPage() {
  return (
    <React.Suspense fallback={<DashboardLayout><div className="flex items-center justify-center h-full text-muted-foreground animate-pulse font-bold uppercase tracking-widest">Initialising AI Mentor...</div></DashboardLayout>}>
      <ChatContent />
    </React.Suspense>
  );
}

function ChatContent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt');

  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string, content: string } | null>(null);

  const [emojiCategory, setEmojiCategory] = useState('smilies');

  const hasInitiatedRef = useRef(false);

  // Load Sessions and Initial Chat
  useEffect(() => {
    loadSessions();

    if (initialPrompt && !hasInitiatedRef.current) {
      hasInitiatedRef.current = true;
      handleInitialPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const handleInitialPrompt = async (prompt: string) => {
    // We need to wait for auth session or handle it in handleSend
    // For simplicity, we just set the input and call handleSend after a short delay or just call a modified version
    setInput(prompt);
    // Since handleSend depends on input state, we might need a small timeout or a direct call
    setTimeout(() => {
      const sendBtn = document.getElementById('send-message-btn');
      sendBtn?.click();
    }, 500);
  };

  const EMOJI_DATA: any = {
    smilies: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '👻', '💀', '☠️', '👽', '👾', '🤖', '💩', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'],
    nature: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🕸', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿', '🦔', '🐾', '🐉', '🐲', '🌵', '🎄', '🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🎍', '🎋', '🍃', '🍂', '🍁', '🍄', '🐚', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '🌎', '🌍', '🌏', '🪐', '💫', '⭐️', '🌟', '✨', '⚡️', '☄️', '💥', '🔥', '🌪', '🌈', '☀️', '🌤', '⛅️', '🌥', '☁️', '🌦', '🌧', '⛈', '🌩', '❄️', '☃️', '⛄️', '🌬', '💨', '💧', '💦', '☔️', '☂️', '🌊', '🌫'],
    food: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', ' avocado', '🥑', '🥦', '🥬', '🥒', '🌶', '🌽', '🥕', '🥔', '🍠', '🥐', '🍞', '🥖', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🥙', '🍳', '🥘', '🍲', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡', '🦀', '🦞', '🦐', '🦑', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕️', '🍵', '🧉', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🍾', '🧊', '🥤', '🥢', '🍽', '🍴', '🥄'],
    tech: ['💻', '🖥', '🖨', '⌨️', '🖱', '🖲', '🕹', '🗜', '💽', '💾', '💿', '📀', '📱', '📲', '☎️', '📞', '📟', '📠', '🔋', '🔌', '🎬', '🎞', '📽', '📺', '📷', '📸', '📹', '📼', '🔍', '🔎', '💡', '🔦', '🏮', '🪓', '🧱', '⛓', '🧰', '🧲', '🧪', '🔬', '🔭', '📡', '💉', '💊', '🩹', '🩸', '🧬', '🦠', '🧫', '🧹', '🧺', '🧻', '🧼', '🧽', '🪒', '🧴'],
    travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🚲', '🛵', '🏍', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩', '💺', '🛰', '🚀', '🛸', '🚁', '🛶', '⛵️', '🚤', '🛥', '🛳', '⛴', '🚢', '⚓️', '🚧', '⛽️', '🚏', '🗺', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟', '🎡', '🎢', '🎠', '⛱', '🏖', '🏝', '🏜', '🌋', '⛰', '🏔', '🗻', '🏕', '⛺️', '🏠', '🏡', '🏘', '🏚', '🏗', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛', '⛪️', '🕌', '🕍', '🛕', '🕋', '⛩', '🛤', '🛣', '🗾', '🎑', '🏞', '🌅', '🌄', '🌇', '🌆', '🏙', '🌃', '🌌', '🌉', '🌁'],
    symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈️', '♉️', '♊️', '♋️', '♌️', '♍️', '♎️', '♏️', '♐️', '♑️', '♒️', '♓️', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆕', '🆖', '🅾️', '🆗', '🅿️', '🆘', '🆙', '🆒', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸', '⏯', '⏹', '⏺', '⏭', '⏮', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️', '♾', '💲', '💱', '™️', '©️', '®️', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫️', '⚪️', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾️', '◽️', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛️', '⬜️', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '💬', '💭', '🗯', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄️', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛']
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load Sessions and Initial Chat
  useEffect(() => {
    loadSessions();
  }, []);

  const handleEmojiClick = (emoji: string) => {
    setInput(prev => prev + emoji);
  };

  const loadSessions = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (data) setSessions(data);
  };

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([{
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Technical Mentor. How can I help you grow today?",
      timestamp: new Date()
    }]);
  };

  const loadChatMessages = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.created_at)
      })));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedFile({
          name: file.name,
          content: event.target?.result as string
        });
      };
      reader.readAsText(file);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachedFile) || isLoading) return;

    let finalContent = input;
    if (attachedFile) {
      finalContent += `\n\n[File Attached: ${attachedFile.name}]\n${attachedFile.content}`;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: finalContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachedFile(null);
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Handle Session Creation if needed
      let sessionId = currentSessionId;
      if (!sessionId && session) {
        const { data: newSession } = await supabase
          .from('chat_sessions')
          .insert({ user_id: session.user.id, title: input.slice(0, 30) || 'New Chat' })
          .select()
          .single();
        if (newSession) {
          sessionId = newSession.id;
          setCurrentSessionId(sessionId);
          loadSessions();
        }
      }

      // Save User Message
      if (sessionId) {
        await supabase.from('chat_messages').insert({
          session_id: sessionId,
          role: 'user',
          content: finalContent
        });
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
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

      setMessages(prev => [...prev, aiMessage]);

      // Save AI Message
      if (sessionId) {
        await supabase.from('chat_messages').insert({
          session_id: sessionId,
          role: 'assistant',
          content: data.content
        });
      }

    } catch (err) {
      console.error('Chat Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto h-[calc(100vh-8rem)] flex gap-6 p-4">

        {/* Sidebar - Recent Chats */}
        <div className="w-80 flex flex-col gap-4">
          <button
            onClick={startNewChat}
            className="w-full p-4 bg-primary text-white rounded-2xl flex items-center justify-center gap-2 font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" /> New Session
          </button>

          <div className="flex-1 bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-4 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 px-2 mb-4 text-muted-foreground">
              <History className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Recent Activity</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
              {sessions.map(s => (
                <button
                  key={s.id}
                  onClick={() => loadChatMessages(s.id)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-medium transition-all group relative overflow-hidden ${currentSessionId === s.id ? 'bg-primary/20 text-primary border border-primary/20' : 'hover:bg-white/5 text-muted-foreground'
                    }`}
                >
                  <div className="truncate pr-6">{s.title}</div>
                  <div className="text-[8px] opacity-40 mt-1">{new Date(s.created_at).toLocaleDateString()}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div id="printable-chat" className="flex-1 flex flex-col relative">
          {/* Chat Header */}
          <div className="relative group bg-card/40 backdrop-blur-xl border border-white/10 rounded-t-3xl p-6 flex items-center justify-between shadow-2xl z-30">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-20 md:h-24 lg:h-32 flex items-center">
                  <img src="/logo.png" alt="DevIntel" className="h-full w-auto object-contain" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-4 border-[#0a0a0a] rounded-full" />
              </div>
              <div>
                <h3 className="font-black text-lg tracking-tight">DevIntel</h3>
                <p className="text-[9px] text-primary font-black uppercase tracking-widest">Active Mentorship Session</p>
              </div>
            </div>

            <div className="relative z-50">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
              >
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 bg-[#121212] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] overflow-hidden backdrop-blur-2xl"
                  >
                    <button
                      onClick={() => { setMessages([]); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 p-4 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" /> Clear Chat
                    </button>
                    <button
                      onClick={handleExportPDF}
                      className="w-full flex items-center gap-3 p-4 text-xs font-bold hover:bg-white/5 transition-all"
                    >
                      <Download className="w-4 h-4 text-primary" /> Export PDF
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Messages Area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto bg-[#0a0a0a]/60 backdrop-blur-md border-x border-white/5 p-8 space-y-8 custom-scrollbar relative"
          >
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <Bot className="w-16 h-16 mb-4 text-primary" />
                <h4 className="text-xl font-black">No Active Messages</h4>
                <p className="text-sm">Start a new session or select a recent chat.</p>
              </div>
            )}
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white/5 border border-white/10 text-primary'
                    }`}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={`p-6 rounded-[2rem] shadow-2xl ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-card/80 border border-white/10 rounded-tl-none'
                    }`}>
                    <MarkdownMessage content={msg.content} role={msg.role} />
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card/50 border border-white/10 p-4 px-6 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Panel */}
          <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-b-3xl p-6 relative">

            {/* File Attachment Badge */}
            <AnimatePresence>
              {attachedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute -top-12 left-6 bg-primary/20 border border-primary/30 px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-bold text-primary"
                >
                  <Paperclip className="w-3 h-3" />
                  {attachedFile.name}
                  <button onClick={() => setAttachedFile(null)}><X className="w-3 h-3" /></button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-end gap-4 bg-black/40 border border-white/10 rounded-2xl px-5 py-3 focus-within:border-primary/50 transition-all">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mb-2 text-muted-foreground hover:text-primary transition-all"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <textarea
                placeholder="Message DevIntel..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                className="flex-1 bg-transparent border-none outline-none text-sm py-2 resize-none h-10 max-h-48 overflow-y-auto custom-scrollbar"
              />

              <div className="flex items-center gap-3 mb-1.5">
                <button onClick={() => setShowEmojis(!showEmojis)} className={`transition-all hover:scale-110 active:scale-95 ${showEmojis ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'}`}>
                  <Smile className="w-6 h-6" />
                </button>

                <AnimatePresence>
                  {showEmojis && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: -10, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full right-0 mb-4 p-0 bg-[#121212] border border-white/10 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 w-[320px] overflow-hidden flex flex-col backdrop-blur-2xl"
                    >
                      {/* Emoji Categories */}
                      <div className="flex items-center gap-1 p-2 border-b border-white/5 bg-white/5 overflow-x-auto custom-scrollbar no-scrollbar">
                        {Object.keys(EMOJI_DATA).map(cat => (
                          <button
                            key={cat}
                            onClick={() => setEmojiCategory(cat)}
                            className={`flex-1 min-w-[60px] py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${emojiCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-white/10 text-muted-foreground'
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
                            onClick={() => {
                              handleEmojiClick(emoji);
                              // Keep picker open for multiple selections
                            }}
                            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all text-xl active:scale-90"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  id="send-message-btn"
                  onClick={handleSend}
                  disabled={(!input.trim() && !attachedFile) || isLoading}
                  className="w-11 h-11 bg-primary text-white rounded-xl flex items-center justify-center hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] disabled:opacity-30 transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        
        @media print {
          /* 1. NUCLEAR HIDE: Hide everything by default */
          * {
            visibility: hidden !important;
          }

          /* 2. REVEAL ONLY CHAT: Only show the main chat container and its children */
          #printable-chat, 
          #printable-chat * {
            visibility: visible !important;
          }

          /* 3. LAYOUT RESET: Position the chat at the very top left of the paper */
          #printable-chat {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
            background: white !important;
          }

          /* 4. SIDEBAR PURGE: Explicitly remove the dashboard sidebar and layout gaps */
          .w-64, 
          aside, 
          nav, 
          .w-80, 
          button, 
          .no-print, 
          .bg-card/40, 
          [role="navigation"] {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }

          /* 5. PAPER STYLING */
          body, html {
            background: white !important;
            color: black !important;
          }

          .rounded-[2rem], .rounded-3xl, .rounded-xl {
            border: 1px solid #eee !important;
            background: #fafafa !important;
            color: black !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }

          .bg-primary {
            background: #f0f0f0 !important;
            border: 1px solid #ccc !important;
            color: black !important;
          }

          .text-white, .text-primary, .text-foreground {
            color: black !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
