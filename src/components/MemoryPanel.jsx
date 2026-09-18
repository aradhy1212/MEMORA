import React, { useState } from 'react';
import { 
  Brain, 
  Search, 
  X, 
  Plus
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';
import { MemoryCard } from './MemoryCard';
import { MEMORY_CATEGORIES } from '../data/mockMemories';

export const MemoryPanel = () => {
  const { 
    memories, 
    isMemoryPanelOpen, 
    setIsMemoryPanelOpen, 
    activeMemoriesCount,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    setSelectedMemory
  } = useMemory();

  const [searchQuery, setSearchQuery] = useState('');

  if (!isMemoryPanelOpen) return null;

  // Filter memories
  const filteredMemories = memories.filter(m => {
    // Search matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match = 
        m.subject.toLowerCase().includes(q) ||
        m.attribute.toLowerCase().includes(q) ||
        m.value.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Category filter
    if (selectedCategoryFilter !== 'ALL' && m.category !== selectedCategoryFilter) {
      return false;
    }

    // Status filter
    if (selectedStatusFilter === 'CURRENT' && m.status !== 'CURRENT') return false;
    if (selectedStatusFilter === 'UPDATED' && m.status !== 'SUPERSEDED') return false;
    if (selectedStatusFilter === 'HISTORICAL' && m.status !== 'HISTORICAL') return false;
    if (selectedStatusFilter === 'TEMPORARY' && m.status !== 'TEMPORARY') return false;

    return true;
  });

  const statusTabs = [
    { id: 'ALL', label: 'All', count: memories.length },
    { id: 'CURRENT', label: 'Current', count: memories.filter(m => m.status === 'CURRENT').length },
    { id: 'UPDATED', label: 'Updated', count: memories.filter(m => m.status === 'SUPERSEDED').length },
    { id: 'HISTORICAL', label: 'Historical', count: memories.filter(m => m.status === 'HISTORICAL').length },
    { id: 'TEMPORARY', label: 'Temporary', count: memories.filter(m => m.status === 'TEMPORARY').length },
  ];

  const handleCreateMockMemory = () => {
    const newMem = {
      id: `M${String(memories.length + 1).padStart(3, '0')}`,
      userId: 'user_rahul_01',
      category: 'PROJECT',
      subject: 'New Feature Proposal',
      attribute: 'Real-time Vector Search',
      value: 'pgvector + OpenAI text-embedding-3-small',
      status: 'CURRENT',
      confidence: 0.95,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceConversation: 'Custom User Addition',
      supersedes: null,
      supersededBy: null,
      notes: 'Manually logged memory entity for fast retrieval.'
    };
    setSelectedMemory(newMem);
  };

  return (
    <aside className="fixed lg:static top-14 bottom-0 right-0 w-80 xl:w-96 bg-[#faf6ef] dark:bg-[#0f0f14] border-l border-[#e8dccb] dark:border-white/10 flex flex-col z-30 shadow-2xl lg:shadow-none transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-[#e8dccb] dark:border-white/10 flex items-center justify-between bg-[#f4ede0]/90 dark:bg-[#121218]/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center">
            <Brain className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-stone-900 dark:text-white">Active Memory</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/30">
                {activeMemoriesCount} Active
              </span>
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400">
              Episodic Knowledge Store
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsMemoryPanelOpen(false)}
          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-[#ede3d2] dark:hover:bg-white/5 transition-colors"
          title="Close memory panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-[#e8dccb] dark:border-white/5 shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 text-orange-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories (e.g. database, python)..."
            className="w-full bg-[#f4ede0] dark:bg-[#16161d] border border-[#decbb8] dark:border-white/10 rounded-xl pl-9 pr-8 py-1.5 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 outline-none focus:border-orange-500/60 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-3 pt-2 pb-1 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 border-b border-[#e8dccb] dark:border-white/5">
        {statusTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatusFilter(tab.id)}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              selectedStatusFilter === tab.id
                ? 'bg-[#ede3d2] text-orange-800 dark:bg-orange-500/20 dark:text-orange-300 border border-orange-400/40'
                : 'text-stone-600 dark:text-stone-400 hover:bg-[#ede3d2]/60 dark:hover:bg-white/5'
            }`}
          >
            <span>{tab.label}</span>
            <span className="ml-1 text-[10px] opacity-80 font-mono">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Category selector row */}
      <div className="px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 bg-[#f4ede0]/60 dark:bg-[#0c0c10] text-[10px]">
        {MEMORY_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoryFilter(cat.id)}
            className={`shrink-0 px-2 py-0.5 rounded-md font-semibold transition-colors ${
              selectedCategoryFilter === cat.id
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-orange-700 dark:hover:text-orange-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Memories Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredMemories.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Brain className="w-8 h-8 text-orange-400 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-bold text-stone-700 dark:text-stone-300">No matching memories found</p>
            <p className="text-[11px] text-stone-500 mt-1">Try resetting filters or searching with a different keyword.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatusFilter('ALL');
                setSelectedCategoryFilter('ALL');
              }}
              className="mt-3 px-3 py-1 text-xs font-semibold text-orange-700 dark:text-orange-300 bg-orange-500/10 rounded-lg border border-orange-500/25"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredMemories.map(memory => (
            <MemoryCard key={memory.id} memory={memory} />
          ))
        )}
      </div>

      {/* Footer Info & Quick Add */}
      <div className="p-3 border-t border-[#e8dccb] dark:border-white/10 bg-[#f4ede0] dark:bg-[#0a0a0e] shrink-0 flex items-center justify-between">
        <span className="text-[11px] text-stone-600 dark:text-stone-400 font-medium">
          Showing {filteredMemories.length} of {memories.length}
        </span>
        <button
          onClick={handleCreateMockMemory}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 text-orange-700 dark:text-orange-300 border border-orange-500/35 text-xs font-bold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Memory Fact</span>
        </button>
      </div>
    </aside>
  );
};
