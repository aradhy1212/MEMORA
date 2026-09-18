import React from 'react';
import { 
  X, 
  Brain, 
  Sparkles, 
  Calendar, 
  Clock, 
  History, 
  ShieldCheck, 
  ArrowRight, 
  FileText, 
  User, 
  ExternalLink,
  Trash2
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';
import { apiService } from '../services/apiService';
import { MEMORY_STATUSES, MEMORY_CATEGORIES } from '../data/mockMemories';

export const MemoryDetail = () => {
  const { 
    selectedMemory, 
    setSelectedMemory, 
    memories, 
    setMemories,
    setActiveConversationId,
    setActiveView 
  } = useMemory();

  if (!selectedMemory) return null;

  const statusMeta = MEMORY_STATUSES[selectedMemory.status] || MEMORY_STATUSES.CURRENT;
  const categoryMeta = MEMORY_CATEGORIES.find(c => c.id === selectedMemory.category) || {
    label: selectedMemory.category,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/25"
  };

  const supersededMem = selectedMemory.supersedes 
    ? memories.find(m => m.id === selectedMemory.supersedes)
    : null;

  const newerMem = selectedMemory.supersededBy
    ? memories.find(m => m.id === selectedMemory.supersededBy)
    : null;

  const handleDelete = async () => {
    setMemories(prev => prev.filter(m => m.id !== selectedMemory.id));
    await apiService.deleteMemory(selectedMemory.id).catch(() => {});
    setSelectedMemory(null);
  };

  const handleJumpToSource = () => {
    if (selectedMemory.sourceConversationId) {
      setActiveConversationId(selectedMemory.sourceConversationId);
    }
    setActiveView('chat');
    setSelectedMemory(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white dark:bg-[#121218] rounded-3xl border border-orange-200/80 dark:border-white/10 shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-orange-200/50 dark:border-white/10 flex items-center justify-between bg-orange-50/30 dark:bg-[#161620]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
              <Brain className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-stone-900 dark:text-white">
                  Memory Inspection
                </h3>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-orange-100 dark:bg-white/10 text-orange-700 dark:text-orange-300">
                  #{selectedMemory.id}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Episodic Fact Telemetry & Lineage Trace
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedMemory(null)}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-orange-100/50 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Main Subject & Value Banner in Warm Peach Gradient */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-rose-500/15 dark:from-[#1c1c28] dark:to-[#221c24] border border-orange-400/35 dark:border-orange-500/25 space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg ${categoryMeta.bg} ${categoryMeta.color} border ${categoryMeta.border}`}>
                {categoryMeta.label}
              </span>
              
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${statusMeta.dotColor} animate-pulse`}></span>
                <span className={`font-extrabold text-xs uppercase ${statusMeta.textColor}`}>
                  {statusMeta.label}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs text-stone-500 dark:text-stone-400 block font-semibold">
                {selectedMemory.subject} · {selectedMemory.attribute}
              </span>
              <h2 className="text-xl font-extrabold text-stone-900 dark:text-white tracking-tight mt-0.5">
                {selectedMemory.value}
              </h2>
            </div>
          </div>

          {/* Confidence Meter */}
          <div className="p-4 rounded-2xl bg-orange-50/30 dark:bg-[#161620] border border-orange-200/60 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-orange-500" />
                Episodic Confidence Score
              </span>
              <span className="font-mono text-orange-600 dark:text-orange-400">
                {Math.round(selectedMemory.confidence * 100)}% Verified
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-stone-200 dark:bg-black/40 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-rose-400 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${Math.round(selectedMemory.confidence * 100)}%` }}
              />
            </div>
          </div>

          {/* Lineage & Superseding Trace */}
          {(selectedMemory.supersedes || selectedMemory.supersededBy) && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300 font-extrabold text-xs uppercase tracking-wider">
                <History className="w-4 h-4" />
                <span>Memory Lineage Evolution</span>
              </div>

              {selectedMemory.supersedes && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/70 dark:bg-black/30 border border-amber-500/20 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase block font-mono font-bold">
                      Supersedes (Previous Record)
                    </span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">
                      #{selectedMemory.supersedes} · {supersededMem ? supersededMem.value : 'MongoDB'}
                    </span>
                  </div>
                  {supersededMem && (
                    <button
                      onClick={() => setSelectedMemory(supersededMem)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-300 hover:bg-amber-500/30 text-xs font-bold"
                    >
                      Inspect #{supersededMem.id}
                    </button>
                  )}
                </div>
              )}

              {selectedMemory.supersededBy && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs">
                  <div>
                    <span className="text-[10px] text-rose-400 uppercase block font-mono font-bold">
                      Superseded By (Newer Active Record)
                    </span>
                    <span className="font-bold text-rose-300">
                      #{selectedMemory.supersededBy} · {newerMem ? newerMem.value : 'PostgreSQL'}
                    </span>
                  </div>
                  {newerMem && (
                    <button
                      onClick={() => setSelectedMemory(newerMem)}
                      className="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 text-xs font-bold"
                    >
                      Inspect #{newerMem.id}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Telemetry Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-orange-50/30 dark:bg-[#161620] border border-orange-200/60 dark:border-white/5">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block mb-1 font-semibold">
                Source Conversation
              </span>
              <button
                onClick={handleJumpToSource}
                className="font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1 hover:underline truncate"
              >
                <FileText className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                <span className="truncate">{selectedMemory.sourceConversation || 'Database Migration'}</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-orange-50/30 dark:bg-[#161620] border border-orange-200/60 dark:border-white/5">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block mb-1 font-semibold">
                User Identification
              </span>
              <span className="font-mono font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-stone-400" />
                {selectedMemory.userId || 'user_rahul_01'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-orange-50/30 dark:bg-[#161620] border border-orange-200/60 dark:border-white/5">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block mb-1 font-semibold">
                Created Timestamp
              </span>
              <span className="font-mono text-stone-700 dark:text-stone-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                {new Date(selectedMemory.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-orange-50/30 dark:bg-[#161620] border border-orange-200/60 dark:border-white/5">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block mb-1 font-semibold">
                Last Updated
              </span>
              <span className="font-mono text-stone-700 dark:text-stone-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                {new Date(selectedMemory.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Notes & Description */}
          {selectedMemory.notes && (
            <div className="p-3.5 rounded-xl bg-orange-50/30 dark:bg-[#161620] border border-orange-200/60 dark:border-white/5">
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block uppercase tracking-wider mb-1">
                Semantic Reasoning & Notes
              </span>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                {selectedMemory.notes}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-orange-200/50 dark:border-white/10 bg-orange-50/40 dark:bg-[#0e0e14] flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 text-xs font-bold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Deprecate Fact</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedMemory(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-orange-100/50 dark:hover:bg-white/5 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleJumpToSource}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold text-xs shadow-md shadow-orange-500/25 flex items-center gap-1.5 transition-all"
            >
              <span>View in Conversation</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
