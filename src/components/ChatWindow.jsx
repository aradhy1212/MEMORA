import React, { useRef, useEffect } from 'react';
import { 
  Brain
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

export const ChatWindow = () => {
  const { activeConversation, activeMemoriesCount, runDemoStep } = useMemory();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fbf8f2] dark:bg-[#0e0e12] overflow-hidden">
      {/* Chat Area Header */}
      <div className="h-14 px-4 sm:px-6 border-b border-[#e8dccb] dark:border-white/10 flex items-center justify-between bg-[#fbf8f2]/90 dark:bg-[#121217]/70 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-white">
                {activeConversation?.title || 'Travel Helper Project'}
              </h2>
              <span className="flex items-center gap-1 text-[11px] font-bold text-orange-700 dark:text-orange-300 bg-orange-500/10 border border-orange-500/25 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                Memory Active
              </span>
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 font-medium">
              {activeMemoriesCount} memories available in reasoning context
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-2">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Banner if few messages */}
          {(!activeConversation?.messages || activeConversation.messages.length <= 1) && (
            <div className="my-6 p-5 rounded-2xl bg-[#f4ede0] dark:from-[#181822] dark:to-[#1a1620] border border-[#e8dccb] dark:border-orange-500/20 text-stone-800 dark:text-stone-200 shadow-sm">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300 font-bold text-sm mb-1">
                <Brain className="w-5 h-5 text-orange-500" />
                <span>MEMORA Episodic Memory Engine Active</span>
              </div>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed mb-3">
                Memora retains your project architecture, tech stack preferences, and user profile across sessions.
                You can ask any questions, update your project state, or query historical decisions.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div 
                  onClick={() => runDemoStep(2)}
                  className="p-3 rounded-xl bg-[#fffdfa] dark:bg-black/30 border border-[#e8dccb] dark:border-white/5 hover:border-orange-400 cursor-pointer transition-colors"
                >
                  <span className="font-bold text-orange-700 dark:text-orange-300 block">⚡ Test Memory Superseding</span>
                  <span className="text-[11px] text-stone-600 dark:text-stone-400">Say: "I switched the project database from MongoDB to PostgreSQL"</span>
                </div>
                <div 
                  onClick={() => runDemoStep(4)}
                  className="p-3 rounded-xl bg-[#fffdfa] dark:bg-black/30 border border-[#e8dccb] dark:border-white/5 hover:border-rose-400 cursor-pointer transition-colors"
                >
                  <span className="font-bold text-rose-600 dark:text-rose-300 block">📜 Test Historical Recall</span>
                  <span className="text-[11px] text-stone-600 dark:text-stone-400">Say: "What database did I use before?"</span>
                </div>
              </div>
            </div>
          )}

          {/* Render Messages */}
          {activeConversation?.messages?.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <ChatInput />
    </div>
  );
};
