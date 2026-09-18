import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Sparkles
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';

export const ChatInput = () => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const { sendMessage } = useMemory();
  const textareaRef = useRef(null);

  // Auto-grow textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicToggle = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate speech-to-text
      setTimeout(() => {
        setText("I switched the project database from MongoDB to PostgreSQL.");
        setIsRecording(false);
      }, 2000);
    }
  };

  const quickPrompts = [
    { label: "Switch to PostgreSQL", query: "I switched the project database from MongoDB to PostgreSQL." },
    { label: "Which DB am I using?", query: "Which database am I currently using?" },
    { label: "What DB did I use before?", query: "What database did I use before?" },
    { label: "What's today's date?", query: "What is today's date?" },
    { label: "My full tech stack?", query: "What is my current complete tech stack?" },
    { label: "Where do I study?", query: "What university do I attend and what is my major?" }
  ];

  return (
    <div className="p-3 sm:p-4 bg-[#fbf8f2]/95 dark:bg-[#121217]/90 backdrop-blur-md border-t border-[#e8dccb] dark:border-white/10 shrink-0">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-orange-500" /> Prompts:
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setText(p.query);
                textareaRef.current?.focus();
              }}
              className="shrink-0 px-2.5 py-1 rounded-full bg-[#f4ede0] dark:bg-[#1c1c26] hover:bg-[#ede3d2] dark:hover:bg-orange-500/20 text-stone-700 dark:text-stone-300 hover:text-orange-700 dark:hover:text-orange-300 border border-[#decbb8] dark:border-white/5 hover:border-orange-400 transition-all font-medium"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="relative rounded-2xl bg-[#f4ede0]/80 dark:bg-[#181820] border border-[#decbb8] dark:border-white/10 focus-within:border-orange-500/60 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all p-2 shadow-inner">
          {isRecording && (
            <div className="px-3 py-1 flex items-center gap-2 text-rose-600 text-xs font-mono animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Listening to speech input... (Simulating voice recognition)</span>
            </div>
          )}

          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Memora... (Ask any question, math, coding, or 'What database did I use before?')"
            className="w-full bg-transparent resize-none outline-none text-xs sm:text-sm text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 px-2 py-1 max-h-36 overflow-y-auto font-medium"
          />

          <div className="flex items-center justify-between pt-1 px-1">
            {/* Left toolbar: Attach, Audio */}
            <div className="flex items-center gap-1 text-stone-500">
              <button
                type="button"
                onClick={() => alert("File attachment: You can upload technical specs or notes to ingest into memory.")}
                className="p-1.5 rounded-lg hover:text-orange-600 dark:hover:text-orange-300 hover:bg-[#ede3d2] dark:hover:bg-white/5 transition-colors"
                title="Attach specifications or documentation"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleMicToggle}
                className={`p-1.5 rounded-lg transition-colors ${
                  isRecording 
                    ? 'text-rose-600 bg-rose-500/10' 
                    : 'hover:text-orange-600 dark:hover:text-orange-300 hover:bg-[#ede3d2] dark:hover:bg-white/5'
                }`}
                title={isRecording ? "Stop voice input" : "Voice message input"}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <span className="hidden sm:inline-block text-[10px] text-orange-700/80 dark:text-orange-400/80 font-semibold ml-1">
                Episodic Memory Active
              </span>
            </div>

            {/* Right: Send Button */}
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className={`flex items-center justify-center p-2.5 rounded-xl transition-all ${
                text.trim()
                  ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 text-white shadow-md shadow-orange-500/25 active:scale-95'
                  : 'bg-[#e2d5c3] dark:bg-white/5 text-stone-400 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-stone-500 dark:text-stone-400 font-medium">
          Memora automatically reconciles conflicting statements, retains history, and indexes memory nodes.
        </p>
      </div>
    </div>
  );
};
