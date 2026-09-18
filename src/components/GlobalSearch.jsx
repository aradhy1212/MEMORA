import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Brain, 
  MessageSquare, 
  ArrowRight
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';
import { apiService } from '../services/apiService';
import { MockMemoryService } from '../services/mockMemoryService';
import { MEMORY_STATUSES } from '../data/mockMemories';

export const GlobalSearch = () => {
  const { 
    isSearchOpen, 
    setIsSearchOpen, 
    memories, 
    conversations, 
    setSelectedMemory, 
    setActiveConversationId, 
    setActiveView 
  } = useMemory();

  const [query, setQuery] = useState('');
  const [backendResults, setBackendResults] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setBackendResults(null);
    }
  }, [isSearchOpen]);

  // Live Backend Search on query change
  useEffect(() => {
    if (!query.trim()) {
      setBackendResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await apiService.globalSearch(query);
        setBackendResults(res);
      } catch {
        setBackendResults(null);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchOpen) return null;

  // Fallback to local memory service if backend results null
  const localFallback = MockMemoryService.search(query, memories, conversations);
  const matchedMemories = backendResults ? backendResults.memories : localFallback.memories;
  const matchedConvs = backendResults ? backendResults.conversations : localFallback.conversations;

  const handleSelectMemory = (mem) => {
    setSelectedMemory(mem);
    setIsSearchOpen(false);
  };

  const handleSelectConversation = (conv) => {
    setActiveConversationId(conv.id);
    setActiveView('chat');
    setIsSearchOpen(false);
  };

  return (
    <div 
      onClick={() => setIsSearchOpen(false)}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-[#121218] rounded-3xl border border-orange-200/80 dark:border-white/10 shadow-2xl overflow-hidden animate-slide-down flex flex-col max-h-[80vh]"
      >
        {/* Search Bar Input */}
        <div className="p-4 border-b border-orange-200/50 dark:border-white/10 flex items-center gap-3 bg-orange-50/30 dark:bg-[#161620]/50">
          <Search className="w-5 h-5 text-orange-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all memories, facts, tech stacks, or conversations (e.g. 'database')..."
            className="w-full bg-transparent text-sm text-stone-900 dark:text-white placeholder:text-stone-400 outline-none font-medium"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 bg-orange-100 dark:bg-black/40 rounded text-[10px] text-stone-600 dark:text-stone-400 font-mono font-bold">
            ESC
          </kbd>
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results Area */}
        <div className="p-4 overflow-y-auto space-y-5 text-xs">
          {!query.trim() ? (
            <div className="py-8 text-center text-stone-400 space-y-2">
              <Brain className="w-8 h-8 mx-auto text-orange-500 opacity-60" />
              <p className="font-bold text-stone-700 dark:text-stone-300">Global Episodic Search</p>
              <p className="text-[11px]">Type keywords like "database", "python", "travel helper", or "vit chennai".</p>
            </div>
          ) : matchedMemories.length === 0 && matchedConvs.length === 0 ? (
            <div className="py-8 text-center text-stone-400">
              <p>No results found for "{query}".</p>
            </div>
          ) : (
            <>
              {/* Memory Results */}
              {matchedMemories.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-500 px-1 block">
                    Matching Memory Nodes ({matchedMemories.length})
                  </span>

                  <div className="space-y-1.5">
                    {matchedMemories.map(mem => {
                      const statusMeta = MEMORY_STATUSES[mem.status] || MEMORY_STATUSES.CURRENT;
                      return (
                        <div
                          key={mem.id}
                          onClick={() => handleSelectMemory(mem)}
                          className="group p-3 rounded-2xl bg-orange-50/40 dark:bg-[#181822] hover:bg-orange-100/50 dark:hover:bg-[#20202c] border border-orange-200/60 dark:border-white/5 hover:border-orange-500/40 cursor-pointer transition-all flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
                              <Brain className="w-3.5 h-3.5 text-orange-500" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-stone-900 dark:text-white text-xs group-hover:text-orange-500">
                                  {mem.subject} / {mem.attribute}: <span className="text-orange-600 dark:text-orange-300 font-bold">{mem.value}</span>
                                </span>
                                <span className="text-[10px] font-mono text-stone-400">#{mem.id}</span>
                              </div>
                              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                Source: {mem.sourceConversation || "Database Migration"} · {Math.round((mem.confidence || 0.95) * 100)}% confidence
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusMeta.bgBadge}`}>
                              {statusMeta.label}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Conversation Results */}
              {matchedConvs.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-orange-100 dark:border-white/5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500 px-1 block">
                    Matching Conversations ({matchedConvs.length})
                  </span>

                  <div className="space-y-1.5">
                    {matchedConvs.map(conv => (
                      <div
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv)}
                        className="group p-3 rounded-2xl bg-orange-50/40 dark:bg-[#181822] hover:bg-orange-100/50 dark:hover:bg-[#20202c] border border-orange-200/60 dark:border-white/5 hover:border-amber-500/40 cursor-pointer transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                          </div>
                          <div>
                            <span className="font-bold text-stone-900 dark:text-white text-xs group-hover:text-amber-500">
                              {conv.title}
                            </span>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate max-w-md">
                              {conv.preview}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-stone-400 font-mono">{conv.timeAgo || "Recently"}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
